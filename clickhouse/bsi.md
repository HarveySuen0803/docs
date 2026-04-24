
## 明细表聚合分析方案

```sql
CREATE TABLE user_gmv_detail
(
    dt Date,
    user_id UInt64,
    gender String,
    city String,
    gmv UInt64
)
ENGINE = MergeTree
ORDER BY (dt, user_id);

INSERT INTO user_gmv_detail VALUES
('2026-04-01', 1, 'woman', 'sh', 100),
('2026-04-01', 2, 'man',   'sh',  50),
('2026-04-01', 3, 'woman', 'bj',  80),
('2026-04-01', 4, 'man',   'bj',  30),
('2026-04-01', 5, 'woman', 'sh',  20);
```

```sql
SELECT
    gender,
    city,
    sum(gmv) AS total_gmv
FROM user_gmv_detail
GROUP BY gender, city
ORDER BY gender, city;

SELECT sum(gmv) AS total_gmv
FROM user_gmv_detail
WHERE gender = 'woman' AND city = 'sh';
```

## 预聚合分析方案

```sql
CREATE TABLE user_gmv_agg
(
    dt Date,
    gender String,
    city String,
    total_gmv UInt64
)
ENGINE = SummingMergeTree
ORDER BY (dt, gender, city);

INSERT INTO user_gmv_agg
SELECT
    dt,
    gender,
    city,
    sum(gmv) AS total_gmv
FROM user_gmv_detail
GROUP BY dt, gender, city;
```

```sql
SELECT sum(total_gmv)
FROM user_gmv_agg
WHERE gender = 'woman' AND city = 'sh';
```

## BSI 聚合分析方案

```sql
CREATE TABLE user_gmv_bsi
(
    tag_name String,
    tag_value String,
    gmv_bsi BSI
)
ENGINE = MergeTree
ORDER BY (tag_name, tag_value);

INSERT INTO user_gmv_bsi
SELECT
    'gender' AS tag_name,
    gender AS tag_value,
    bsi_build(user_id, gmv) AS gmv_bsi
FROM user_gmv_detail
GROUP BY gender;

INSERT INTO user_gmv_bsi
SELECT
    'city' AS tag_name,
    city AS tag_value,
    bsi_build(user_id, gmv) AS gmv_bsi
FROM user_gmv_detail
GROUP BY city;
```

```sql
SELECT (bsi_sum(gmv_bsi)).1 AS total_gmv
FROM user_gmv_bsi
WHERE tag_name = 'gender' AND tag_value = 'woman';

WITH
    (SELECT gmv_bsi
     FROM user_gmv_bsi
     WHERE tag_name = 'gender' AND tag_value = 'woman') AS woman_bsi,
     
    (SELECT bsi_ge(gmv_bsi, 0)
     FROM user_gmv_bsi
     WHERE tag_name = 'city' AND tag_value = 'sh') AS sh_uid_bitmap

SELECT (bsi_sum(woman_bsi, sh_uid_bitmap)).1 AS total_gmv; -- gender = 'woman' AND city = 'sh'
```

预聚合表的行数，取决于维度组合，假设有 3 个维度，gender 有 2 个维值，city 有 100 个维值，platform 有 5 个维值，那么所有的维度组合如下：

- 一维 = 2 + 100 + 5
- 二维 = 2 * 100 + 2 * 5 + 100 * 5
- 三维 = 2 * 100 * 5
- 行数 = 一维 + 二维 + 三维

BSI 表的行数，取决于维值的数量：

- 行数 = 2 + 100 + 5

BSI 相比预聚合更加灵活，BSI 中保留了 uid -> gmv 的映射关系，可以通过 BSI 函数，针对 uid 进行过滤和计算，实现 “哪些 uid 贡献了这些 gmv”，“每个 uid 的 gmv 分别是多少” 等计算。

## 人群圈选场景

构建 tag_bitmap_index 做人群包圈选：

```sql
CREATE TABLE tag_bitmap_index
(
    dt Date,
    tag_name String,
    tag_value String,
    uid_bitmap AggregateFunction(groupBitmap, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (dt, tag_name, tag_value);

INSERT INTO tag_bitmap_index
SELECT
    dt,
    'gender' AS tag_name,
    gender AS tag_value,
    groupBitmapState(user_id) AS uid_bitmap
FROM user_metric_detail
GROUP BY dt, gender;

INSERT INTO tag_bitmap_index
SELECT
    dt,
    'city' AS tag_name,
    city AS tag_value,
    groupBitmapState(user_id) AS uid_bitmap
FROM user_metric_detail
GROUP BY dt, city;

-- 查某天 gender = woman 的 uid 集合
SELECT groupBitmapMergeState(uid_bitmap)
FROM tag_bitmap_index
WHERE dt = '2026-04-01' AND tag_name = 'gender' AND tag_value = 'woman';
```

构建 BSI 指标表：

```sql
CREATE TABLE metric_bsi_daily
(
    dt Date,
    metric_name String,
    metric_bsi BSI
)
ENGINE = MergeTree
ORDER BY (dt, metric_name);

-- 写入 gmv 的 BSI
INSERT INTO metric_bsi_daily
SELECT
    dt,
    'gmv' AS metric_name,
    bsi_build(user_id, user_gmv) AS metric_bsi
FROM
(
    SELECT dt, user_id, sum(gmv) AS user_gmv
    FROM user_metric_detail
    GROUP BY dt, user_id
)
GROUP BY dt;


-- 写入 ad_show_cnt 的 BSI
INSERT INTO metric_bsi_daily
SELECT
    dt,
    'ad_show_cnt' AS metric_name,
    bsi_build(user_id, user_ad_show_cnt) AS metric_bsi
FROM
(
    SELECT dt, user_id, sum(ad_show_cnt) AS user_ad_show_cnt
    FROM user_metric_detail
    GROUP BY dt, user_id
)
GROUP BY dt;

-- 查询某天所有用户 gmv 总和
SELECT (bsi_sum(metric_bsi)).1 AS total_gmv
FROM metric_bsi_daily
WHERE dt = '2026-04-01' AND metric_name = 'gmv';

-- 查询某天 gmv >= 80 的 uid
SELECT bitmapToArray(bsi_ge(metric_bsi, 80))
FROM metric_bsi_daily
WHERE dt = '2026-04-01' AND metric_name = 'gmv';
```

通过 tag_bitmap_index 做人群包圈选，通过 metric_bsi_daily 做计算：

```sql
-- dt = '2026-04-01' AND gender = 'woman' AND city = 'sh' 的人群的 GMV 总和
WITH
    (
        SELECT groupBitmapMergeState(uid_bitmap)
        FROM tag_bitmap_index
        WHERE dt = '2026-04-01' AND tag_name = 'gender' AND tag_value = 'woman'
    ) AS woman_bitmap,
    (
        SELECT groupBitmapMergeState(uid_bitmap)
        FROM tag_bitmap_index
        WHERE dt = '2026-04-01' AND tag_name = 'city' AND tag_value = 'sh'
    ) AS sh_bitmap,
    (
        SELECT bsi_ge(metric_bsi, 10)
        FROM metric_bsi_daily
        WHERE dt = '2026-04-01' AND metric_name = 'ad_show_cnt'
    ) AS high_show_bitmap,
    bitmapAnd(bitmapAnd(woman_bitmap, sh_bitmap), high_show_bitmap) AS target_uids
SELECT (bsi_sum(metric_bsi, target_uids)).1 AS total_gmv
FROM metric_bsi_daily
WHERE dt = '2026-04-01' AND metric_name = 'gmv';

-- 最近 30 天女性上海用户中，累计 gmv >= 100 的 uid 包
WITH
    (
        SELECT bsi_add_agg(metric_bsi)
        FROM metric_bsi_daily
        WHERE dt BETWEEN '2026-04-01' AND '2026-04-30' AND metric_name = 'gmv'
    ) AS gmv_30d_bsi,
    (
        SELECT groupBitmapMergeState(uid_bitmap)
        FROM tag_bitmap_index
        WHERE dt BETWEEN '2026-04-01' AND '2026-04-30' AND tag_name = 'gender' AND tag_value = 'woman'
    ) AS woman_bitmap,
    (
        SELECT groupBitmapMergeState(uid_bitmap)
        FROM tag_bitmap_index
        WHERE dt BETWEEN '2026-04-01' AND '2026-04-30' AND tag_name = 'city' AND tag_value = 'sh'
    ) AS sh_bitmap,
    bsi_ge(gmv_30d_bsi, 100) AS high_gmv_bitmap
SELECT bitmapAnd(bitmapAnd(woman_bitmap, sh_bitmap), high_gmv_bitmap) AS target_uids;
```

## 分桶优化

实际上 BSI 落地时，通过 Spark 构建的单个 BSI 会非常大，导致 Spark 的 Row 对象过大，在 Kryo Serializer 序列化时会出现 Buffer Overflow 的问题，故需要引入多级分桶策略。

```sql
CREATE TABLE tag_bitmap_bsi
(
    `tag_name` String,
    `tag_value` String,
    `log_date` Date,
    `sp_bucket` UInt32,
    `sk_bucket` UInt32,
    `ck_bucket` UInt32,
    `bsi_agg` AggregateFunction(bsi_merge_agg, BSI)
)
ENGINE = ReplicatedAggregatingMergeTree(...) -- 指定 sk_bucket 作为 sharding key
PARTITION BY (toYYYYMMDD(log_date), tag_name)
ORDER BY (sp_bucket, tag_value, ck_bucket)
TTL ...

INSERT INTO tag_bitmap_bsi
SELECT
    tag_name,
    tag_value,
    log_date,
    cityHash64(uid) % 16 AS sp_bucket, -- spark 侧分桶 BSI
    intHash64(uid >> 16) % 4 AS sk_bucket, -- 高 48 位哈希取模作为 sharding key，进一步保证连续性
    cityHash64(uid) % 64 AS ck_bucket, -- 单个 shard 内部进一步分桶 BSI
    bsi_build(uid, metric) AS bsi_agg
FROM detail
GROUP BY tag_name, tag_value, log_date, sp_bucket, sk_bucket, ck_bucket

SELECT groupBitmapOr(bsi_ge(bsi_agg, N)) AS `uid_index` -- 180天内曝光次数>N次的id组成的bitmap
FROM
(
   SELECT bsi_add_agg(bsi_agg) AS `bsi_agg`
   FROM
   (
      SELECT tag_value, bsi_merge_aggMerge(bsi_agg) AS `bsi_agg` -- 一天之内的指标合并（去重）
      FROM tag_bitmap_index_mapped_bsi
      WHERE (tag_name = 'ad_show') AND (log_date > '${yyyyMMdd}' - INTERVAL 180 DAY) AND (tag_value IN ('11111', '22222'))
      GROUP BY tag_value, log_date
   )
   GROUP BY tag_value -- 最终累加出180天内所有的指标
)
```

## BSI 计算错误

如果 bsi 函数实现时，都是基于一份 bsi 数据做计算，而不是拷贝，一份就会导致类似如下的计算错误：

```sql
SELECT
    bsi_ge(metric_bsi, 10) AS bm1, -- 这里 bsi_eq 是对源数据进行了修改
    bsi_sum(metric_bsi)    AS total -- 由于 bsi_eq 已经修改了源数据，导致这里基于错误数据进行了计算
FROM ...
```
