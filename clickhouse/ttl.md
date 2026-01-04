# TTL 介绍

TTL 机制是 ClickHouse 中非常重要的数据管理特性，通过合理使用 TTL，可以有效地管理数据生命周期，优化存储空间，提高查询性能。

# TTL 使用

准备测试数据：

```sql
CREATE TABLE user_actions
(
    user_id UInt32,
    action_time DateTime,
    action_type String,
    details String,
    status UInt8
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(action_time)
ORDER BY (user_id, action_time)
TTL 
    -- 1. 行级 TTL：1年后删除整行
    action_time + INTERVAL 1 YEAR TO DELETE,
    
    -- 2. 列级 TTL：6个月后清空 details 列
    details + INTERVAL 6 MONTH TO DEFAULT '',
    
    -- 3. 移动 TTL：1个月后移动到 warm 卷，6个月后移动到 cold 卷
    action_time + INTERVAL 1 MONTH TO VOLUME 'warm',
    action_time + INTERVAL 6 MONTH TO VOLUME 'cold',
    
    -- 4. 条件 TTL：失败状态(status=0)的数据3个月后删除
    status = 0 AND action_time + INTERVAL 3 MONTH TO DELETE
SETTINGS storage_policy = 'tiered_storage';
```

```sql
INSERT INTO user_actions VALUES
    -- 2023年1月的数据
    (1, '2023-01-01 10:00:00', 'login', 'success', 1),
    (2, '2023-01-01 11:00:00', 'purchase', 'failed', 0),
    
    -- 2023年4月的数据
    (3, '2023-04-01 10:00:00', 'login', 'success', 1),
    (4, '2023-04-01 11:00:00', 'purchase', 'failed', 0),
    
    -- 2023年7月的数据
    (5, '2023-07-01 10:00:00', 'login', 'success', 1),
    (6, '2023-07-01 11:00:00', 'purchase', 'failed', 0);
```

随之时间变化后的数据：

```
2023-07-01（当前时间）

user_id | action_time       | action_type | details  | status
--------|-------------------|-------------|----------|--------
1       | 2023-01-01 10:00  | login       | success  | 1
2       | 2023-01-01 11:00  | purchase    | failed   | 0
3       | 2023-04-01 10:00  | login       | success  | 1
4       | 2023-04-01 11:00  | purchase    | failed   | 0
5       | 2023-07-01 10:00  | login       | success  | 1
6       | 2023-07-01 11:00  | purchase    | failed   | 0

hot_volume (SSD)
    └── 所有数据
```

```
2023-08-01（一个月后）

- 移动 TTL 生效：2023年1月和4月的数据移动到 warm 卷，数据的物理存储位置发生变化，但查询内容不变。

user_id | action_time       | action_type | details  | status
--------|-------------------|-------------|----------|--------
1       | 2023-01-01 10:00  | login       | success  | 1
2       | 2023-01-01 11:00  | purchase    | failed   | 0
3       | 2023-04-01 10:00  | login       | success  | 1
4       | 2023-04-01 11:00  | purchase    | failed   | 0
5       | 2023-07-01 10:00  | login       | success  | 1
6       | 2023-07-01 11:00  | purchase    | failed   | 0

hot_volume (SSD)
    └── 2023年7月数据

warm_volume (HDD)
    └── 2023年1月和4月数据
```

```
2023-10-01（三个月后）

- 条件 TTL 生效：删除 status=0 的3个月前的数据。
- 列级 TTL 生效：清空6个月前的 details 列。

user_id | action_time       | action_type | details  | status
--------|-------------------|-------------|----------|--------
1       | 2023-01-01 10:00  | login       |          | 1
3       | 2023-04-01 10:00  | login       | success  | 1
5       | 2023-07-01 10:00  | login       | success  | 1
6       | 2023-07-01 11:00  | purchase    | failed   | 0
```

```
2024-01-01（六个月后）

- 移动 TTL 生效：2023年1月和4月的数据移动到 cold 卷。
- 列级 TTL 生效：清空所有6个月前的 details 列。

user_id | action_time       | action_type | details  | status
--------|-------------------|-------------|----------|--------
1       | 2023-01-01 10:00  | login       |          | 1
3       | 2023-04-01 10:00  | login       |          | 1
5       | 2023-07-01 10:00  | login       | success  | 1
6       | 2023-07-01 11:00  | purchase    | failed   | 0

hot_volume (SSD)
    └── 2023年7月数据

warm_volume (HDD)
    └── 2023年4月数据

cold_volume (对象存储)
    └── 2023年1月数据
```

```
2024-07-01（七个月后）

- 行级 TTL 生效：删除所有1年前的数据。

user_id | action_time       | action_type | details  | status
--------|-------------------|-------------|----------|--------
5       | 2023-07-01 10:00  | login       | success  | 1
6       | 2023-07-01 11:00  | purchase    | failed   | 0

hot_volume (SSD)
    └── 2023年7月数据
```

TL 优先级：

- 条件 TTL 最先执行（3个月）
- 列级 TTL 其次（6个月）
- 移动 TTL 再次（1个月和6个月）
- 行级 TTL 最后（1年）

