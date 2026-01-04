# SkipIndex 介绍

跳过索引的主要作用是快速跳过不包含目标数据的数据块，从而减少需要扫描的数据量。

# SkipIndex 示例

准备测试数据：

```sql
CREATE TABLE user_actions (
    -- 基础字段
    user_id UInt64,
    action_date Date,
    action_type String,
    device_id UInt32,
    page_url String,
    session_id String,
    
    -- 跳过索引定义
    INDEX idx_user_id user_id TYPE minmax GRANULARITY 8192,
    INDEX idx_action_type action_type TYPE bloom_filter GRANULARITY 8192,
    INDEX idx_device device_id TYPE set(1000) GRANULARITY 8192,
    INDEX idx_date action_date TYPE minmax GRANULARITY 8192
) ENGINE = MergeTree()
ORDER BY (user_id, action_date);

INSERT INTO user_actions VALUES
-- 用户1的行为
(1, '2023-01-01', 'view', 100, '/home', 's1'),
(1, '2023-01-01', 'click', 100, '/products', 's1'),
(1, '2023-01-01', 'purchase', 100, '/checkout', 's1'),
-- 用户2的行为
(2, '2023-01-02', 'view', 200, '/home', 's2'),
(2, '2023-01-02', 'click', 200, '/products', 's2'),
-- 用户3的行为
(3, '2023-01-03', 'view', 300, '/home', 's3'),
(3, '2023-01-03', 'click', 300, '/products', 's3'),
(3, '2023-01-03', 'purchase', 300, '/checkout', 's3');
```

假设 GRANULARITY = 3（实际生产环境通常更大），数据会被分成以下块：

```
Block 1: [行1-3] 用户1的所有行为
Block 2: [行4-5] 用户2的行为
Block 3: [行6-8] 用户3的行为
```

每个数据块会生成对应的索引文件：

```
/var/lib/clickhouse/data/default/user_actions/
├── all_1_1_0/                    # 第一个数据分区
│   ├── checksums.txt            # 校验和文件
│   ├── columns.txt              # 列定义文件
│   ├── count.txt                # 行数统计
│   ├── default_compression_codec.txt  # 压缩编码
│   ├── primary.idx              # 主键索引
│   ├── user_id.mrk2             # 用户ID的标记文件
│   ├── action_date.mrk2         # 日期的标记文件
│   ├── action_type.mrk2         # 行为类型的标记文件
│   ├── device_id.mrk2           # 设备ID的标记文件
│   ├── page_url.mrk2            # 页面URL的标记文件
│   ├── session_id.mrk2          # 会话ID的标记文件
│   │
│   ├── user_id.bin              # 用户ID数据文件
│   ├── action_date.bin          # 日期数据文件
│   ├── action_type.bin          # 行为类型数据文件
│   ├── device_id.bin            # 设备ID数据文件
│   ├── page_url.bin             # 页面URL数据文件
│   ├── session_id.bin           # 会话ID数据文件
│   │
│   ├── user_id.minmax           # 用户ID的minmax跳过索引
│   ├── action_type.bloom        # 行为类型的bloom跳过索引
│   ├── device_id.set            # 设备ID的set跳过索引
│   └── action_date.minmax       # 日期的minmax跳过索引
│
├── detached/                    # 分离的分区目录
├── formatversion.txt            # 格式版本
```

```
1. user_id.minmax:
   Block 1: min=1, max=1
   Block 2: min=2, max=2
   Block 3: min=3, max=3

2. action_type.bloom:
   Block 1: ['view', 'click', 'purchase']
   Block 2: ['view', 'click']
   Block 3: ['view', 'click', 'purchase']

3. device_id.set:
   Block 1: {100}
   Block 2: {200}
   Block 3: {300}

4. action_date.minmax:
   Block 1: min='2023-01-01', max='2023-01-01'
   Block 2: min='2023-01-02', max='2023-01-02'
   Block 3: min='2023-01-03', max='2023-01-03'
```

多个索引的组合查询过程：

- 主键索引过滤：检查查询条件是否包含主键前缀，使用 primary.idx 进行稀疏索引查找，确定可能包含目标数据的数据颗粒（granules），记录这些颗粒的起始位置。
- 跳过索引过滤：检查查询条件中的列是否有对应的跳过索引，对每个可用的跳过索引进行查找，记录被所有跳过索引保留的数据块。
- 列过滤：对没有跳过索引的列进行过滤，使用列的数据文件（.bin）进行过滤，可能需要读取部分数据来进行过滤，确定最终需要读取的数据块。
- 数据定位：使用 primary.idx 确定数据颗粒，使用 .mrk2 文件定位具体数据位置，根据标记文件定位到 .bin 文件中的具体位置。

单条件查询的过程：

```sql
SELECT * FROM user_actions WHERE user_id = 2;
```

- 检查 user_id.minmax 索引：
    - Block 1: 1-1 → 不包含2，跳过
    - Block 2: 2-2 → 包含2，需要读取
    - Block 3: 3-3 → 不包含2，跳过

多条件组合查询的过程：

```sql
SELECT * FROM user_actions 
WHERE action_date = '2023-01-01' 
  AND action_type = 'purchase';
```

- 检查 action_date.minmax 索引：
    - Block 1: '2023-01-01' → 包含目标日期
    - Block 2: '2023-01-02' → 不包含，跳过
    - Block 3: '2023-01-03' → 不包含，跳过
- 检查 action_type.bloom 索引：
    - Block 1 包含 'purchase'，需要读取

