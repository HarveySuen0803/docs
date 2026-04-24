## 缓存预热系统架构

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/warmup-service.jpg)

## ClickHouse RoaringBitmap 结构

以 16 位的 RoaringBitmap 举例，前 8 位分桶，后 8 位存储数据

```
bucket 0 -> 00000000 00000000 ~ 00000000 11111111
bucket 1 -> 00000001 00000000 ~ 00000001 11111111
bucket 2 -> 00000010 00000000 ~ 00000010 11111111
```

RoaringBitmap 的每个 Bucket 底层有三种存储结构

```
bucket 0 -> ArrayContainer
bucket 1 -> BitmapContainer
bucket 3 -> RunContainer
...
```

## ClickHouse 字典服务，多级 ZipList

ZipList 在内存中的结构如下：

```
[header][key1][value1][padding]
[header][key2][value2][padding]
[header][key3][value3][padding]
[header][key4][value4][padding]
[header][key5][value5][padding]
```

10 亿个 KV，就是用 500w 个 zipList，保证每个 ZipList 内部大约 200 个 KV。

## ClickHouse BSI

BSI 基本介绍：

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/clickhouse-bsi-1.png)

使用 BSI 完成人群包圈选聚合计算：

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

CREATE TABLE metric_bsi_daily
(
    dt Date,
    metric_name String,
    metric_bsi BSI
)
ENGINE = MergeTree
ORDER BY (dt, metric_name);

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
```


