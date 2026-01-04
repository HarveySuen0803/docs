# MergeTree

ClickHouse 的 MergeTree 是其核心存储引擎，专为 高吞吐数据写入和超快查询优化 设计，适用于 OLAP（在线分析处理） 场景。它采用 LSM-Tree（Log-Structured Merge Tree）思想，通过 追加写入、稀疏索引、后台合并（Merge Process） 来优化查询和存储效率。

## 分区数据存储结构

每个 MergeTree 表的数据存储在：

```
/var/lib/clickhouse/data/{database}/{table}/
```

创建表：

```sql
CREATE TABLE users
(
    event_date Date,
    user_id UInt64,
    name String,
    age UInt8
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)  -- 以 `event_date` 年月作为分区
ORDER BY user_id;
```

插入数据：

```sql
INSERT INTO users VALUES ('2024-01-05', 1, 'Alice', 23),
                         ('2024-01-10', 2, 'Bob', 25),
                         ('2024-02-15', 3, 'Charlie', 22),
                         ('2024-02-20', 4, 'David', 30);
```

磁盘存储如下：

```
/var/lib/clickhouse/data/default/users/
├── 202401/  # 分区目录（2024 年 1 月）
│   ├── all_1_1_0/           # `part` 1
│   │   ├── user_id.bin      # [1, 2]，存储 user_id 列数据
│   │   ├── name.bin         # ['Alice', 'Bob']，存储 name 列数据
│   │   ├── age.bin          # [23, 25]，存储 age 列数据
│   │   ├── primary.idx      # [1]，稀疏索引（一级索引），帮助定位到数据块
│   │   ├── user_id.mrk2     # [(0, 0), (4, 32)]，user_id 的 Mark 索引（二级索引），帮助偏移到数据块
│   │   ├── count.txt        # 2 行，记录行数
│   │   ├── checksums.txt    # 校验信息
│   │   ├── columns.txt      # 表结构
│   │   ├── minmax_date.txt  # 2024-01-05 ~ 2024-01-10
│   │   ├── partition.dat    # 分区信息
│   │   ├── metadata_version.txt   # 元数据版本
│   │   ├── txn_version      # 事务版本
│   ├── format_version.txt   # 存储格式版本
│   ├── partition.dat        # 分区信息
│
├── 202402/  # 分区目录（2024 年 2 月）
│   ├── all_2_2_0/           # `part` 2
│   │   ├── user_id.bin      # [3, 4]
│   │   ├── name.bin         # ['Charlie', 'David']
│   │   ├── age.bin          # [22, 30]
│   │   ├── primary.idx      # [3]
│   │   ├── user_id.mrk2     # [(0, 0), (4, 32)]
│   │   ├── count.txt        # 2 行
│   │   ├── checksums.txt
│   │   ├── columns.txt
│   │   ├── minmax_date.txt  # 2024-02-15 ~ 2024-02-20
│   │   ├── partition.dat
│   │   ├── metadata_version.txt
│   │   ├── txn_version
│   ├── format_version.txt
│   ├── partition.dat
│
├── format_version.txt
```

- 每次 插入，修改，删除 都会生成这样一个 Part，包含了完整的数据和索引。
- 文件夹名都会按照 `all_{MinBlockNum}_{MaxBlockNum}_{Level}` 的结构组成。
  - 这里的 all 表示所有的分区，当指定分区后，这里的 all 会替换为分区键的值。
  - MinBlockNum 和 MaxBlockNum 可以帮助区分合并后的范围，帮助查询时的快速定位。
  - Level 用于实现版本控制，合并后会生成新的版本，读取数据时，会优先读取最新的版本。

## Part 合并过程

MergeTree 中新增的 Part 过多，会导致查询性能降低，所以当满足一定条件后，会后台合并（Merge Process） 进行优化，以减少 part 碎片、提升查询效率。

MergeTree 的合并过程 和 LSM-Tree 的 Compaction 原理基本一致。

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250126193328.png)

## 索引设计

MergeTree 索引为稀疏索引，它并不索引单条数据，而是索引一定范围的数据。也就是从已排序的全量数据中，间隔性的选取一些数据记录主键字段的值来生成 primary.idx 索引文件，从而加快表查询效率。间隔设置参数为 index_granularity。

- 稀疏索引 需要保证 源数据 和 索引 采用相同的排序策略，并且很难高效的解决新增数据的问题（需要大范围变更索引结构），所以 MergeTree 内部是在生成和合并 Part 的时候，才会为该 Part 生成一个稀疏索引，并且后续也不会修改该 Part，所以非常有效的避免了稀疏索引的更新问题。

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250126194537.png)

假设 index_granularity = 4，数据如下：

```
id | name  | age | event_time
--------------------------------
1  | Alex  | 23  | 2024-01-10 12:00:00
2  | Bob   | 30  | 2024-01-10 12:05:00
3  | Carol | 25  | 2024-01-10 12:10:00
4  | Dave  | 28  | 2024-01-10 12:15:00
5  | Emma  | 22  | 2024-01-10 12:20:00
6  | Frank | 29  | 2024-01-10 12:25:00
7  | Grace | 27  | 2024-01-10 12:30:00
8  | Henry | 24  | 2024-01-10 12:35:00
9  | Henry | 24  | 2024-01-10 12:35:00
```

primary.idx 文件内容：

```
mark | (id, event_time)
------------------------------------
0    | (1, 2024-01-10 12:00:00)
1    | (5, 2024-01-10 12:20:00)
2    | (9, 2024-01-10 12:35:00)
```

- 如果查询 id = 3，通过 primary.idx 知道 id = 3 可能在 (1, 2024-01-10 12:00:00) 和 (5, 2024-01-10 12:20:00) 之间，即标记 0 到 1 之间。

name.mrk2 和 age.mrk2 文件内容：

```
mark | compressed_offset | decompressed_offset | rows
------------------------------------------------------
0    | 0                 | 0                   | 4
1    | 1024              | 0                   | 4
2    | 2048              | 0                   | 1
```

```
mark  | compressed_offset | decompressed_offset | rows
-------------------------------------------------------
0     | 0                | 0                   | 4
1     | 36               | 0                   | 4
2     | 72               | 0                   | 1
```

- 如果查询 id = 3，刚刚通过 primary.idx 确定到标记 0 到 1 之间，此时再次确定到了 name.bin 和 age.bin 中具体的偏移量了。

## Mutations

Mutations 是 ClickHouse 处理 UPDATE 和 DELETE 操作的机制，它不会直接修改数据，而是 创建一个 Mutation 任务，在 Merge Process（合并进程）执行时应用变更。这样可以避免高频 UPDATE/DELETE 影响查询性能，并保持 MergeTree 的高效存储。

- ClickHouse 不能像 MySQL 那样直接 UPDATE 或 DELETE 行数据，因为 MergeTree 采用 不可变 part（Immutable Parts） 机制。
- Mutation 任务不会立即执行，而是等待 Merge Process 触发，或者手动 OPTIMIZE TABLE FINAL; 触发。

Mutations 的任务会记录到 system.mutations 中，等下一次 Merge Process 时，会开始执行这些 Mutations 任务，生成新的 part，并移除旧 part。

---

插入数据：

```sql
INSERT INTO users VALUES (1, 'Alice', 23), (2, 'Bob', 25), (3, 'Charlie', 22);
INSERT INTO users VALUES (4, 'David', 30), (5, 'Emma', 27), (6, 'Frank', 29);
```

删除数据：

```sql
ALTER TABLE users DELETE WHERE age < 25;
```

查询生成的 Mutations 任务：

```sql
SELECT * FROM system.mutations WHERE table = 'users';
```

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250126195207.png)

等待 Merge Process 触发后，再次执行查询

- ClickHouse 不会立刻删除 age < 25 的数据，而是等 Merge Process 触发时创建新的 part，不包含 age < 25。

```sql
SELECT * FROM system.mutations WHERE table = 'users';
```

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250126195309.png)

最终存储结构：

```
/var/lib/clickhouse/data/default/users/
├── all_1_3_0/  # 旧 part（含 user_id=1,2,3），根据内存调度策略，决定何时自动删除该 part
├── all_4_6_1/  # 新的 part（不包含 age < 25）
```

# ReplacingMergeTree

ReplacingMergeTree 是 ClickHouse MergeTree 存储引擎的变体，它的 核心作用 是：

- 在合并 (Merge Process) 过程中删除重复数据。
- 基于 ORDER BY 指定的列进行去重，保留最新版本的数据（通常基于 version 列）。
- 适用于数据流式插入但需要定期去重的场景，如 CDC（Change Data Capture）和日志数据清理。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501291245748.png)

注意区分 MergeTree, ReplacingMergeTree 和 Innodb 对于主键的约束：

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250129130252.png)

- 如果允许插入重复数据，但最终需要去重，使用 ReplacingMergeTree
- 如果不关心数据去重，使用 MergeTree

---

插入重复数据：

```sql
INSERT INTO users VALUES (1, 'Alice', 23, 1);
INSERT INTO users VALUES (1, 'Alice Updated', 24, 2);
INSERT INTO users VALUES (2, 'Bob', 25, 1);
INSERT INTO users VALUES (2, 'Bob Updated', 26, 2);
INSERT INTO users VALUES (3, 'Charlie', 22, 1);
```

此时 ClickHouse 还未进行去重：

```
user_id | name          | age | version
--------|---------------|-----|--------
1       | Alice         | 23  | 1
1       | Alice Updated | 24  | 2
2       | Bob           | 25  | 1
2       | Bob Updated   | 26  | 2
3       | Charlie       | 22  | 1
```

- ReplacingMergeTree 不会在插入时去重，而是等 Merge Process 触发后进行去重。
- user_id=1 和 user_id=2 存在两个版本的记录，但 user_id=3 只有一个版本。

在后台 Merge Process 运行后，ClickHouse 会执行去重，保留 version 最大的记录：

```sql
OPTIMIZE TABLE users FINAL;
```

最终结果：

```
user_id | name           | age | version
--------|----------------|-----|--------
1       | Alice Updated  | 24  | 2
2       | Bob Updated    | 26  | 2
3       | Charlie        | 22  | 1
```

# SummingMergeTree

SummingMergeTree 自动对 SUM() 计算的数据进行累加合并，适用于求和计算，例如订单总额、访问量统计等。

---

创建表：

```sql
CREATE TABLE sales_summing
(
    date Date,
    product String,
    revenue Float64
) ENGINE = SummingMergeTree()
ORDER BY (date, product);
```

插入数据：

```sql
INSERT INTO sales_summing VALUES ('2024-01-01', 'Apple', 100);
INSERT INTO sales_summing VALUES ('2024-01-01', 'Apple', 150);
INSERT INTO sales_summing VALUES ('2024-01-01', 'Banana', 200);
```

SummingMergeTree 在后台自动执行数据合并（Merge），会合并相同 ORDER BY 主键的行：

```
product  | revenue
-------------------
Apple    | 250
Banana   | 200
```

# AggregatingMergeTree

AggregatingMergeTree 适用于更复杂的预聚合操作（如 AVG()、COUNT(DISTINCT) 等），它的工作方式是存储部分聚合状态（如 sum(x), count(x)），在 GROUP BY 查询时最终合并。

AggregatingMergeTree Vs SummingMergeTree

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250131154021.png)

---

创建表：

```sql
CREATE TABLE sales_aggregating
(
    date Date,
    product String,
    revenue_state AggregateFunction(sum, Float64),
    count_state AggregateFunction(count, UInt32)
) ENGINE = AggregatingMergeTree()
ORDER BY (date, product);
```

插入数据：

```sql
INSERT INTO sales_aggregating SELECT
    date,
    product,
    sumState(revenue),
    countState(1)
FROM sales
GROUP BY date, product;
```

- `sumState(revenue)` 计算 `SUM(revenue)` 的状态。
- `countState(1)` 计算 `COUNT(*)` 的状态。

查询数据：

```sql
SELECT
    product,
    finalizeAggregation(sumMerge(revenue_state)) AS total_revenue,
    finalizeAggregation(countMerge(count_state)) AS total_count
FROM sales_aggregating
GROUP BY product;
```

```
product  | total_revenue | total_count
-------------------------------------
Apple    | 250           | 2
Banana   | 200           | 1
```

- AggregatingMergeTree 在 Merge 过程中不会直接合并数据，而是保留聚合状态。
- 查询时调用 `finalizeAggregation()` 进行最终计算。

# CollapsingMergeTree

CollapsingMergeTree 是一种特殊的 MergeTree 引擎，用于对成对数据进行“折叠”或“撤销”。它通常和一个“符号列” (sign column) 一起使用，通过正负值来表示“增加”或“撤销”，在数据合并 (Merge) 时，对相同主键的数据进行折叠（合并/抵消）操作。这在“增-删”或“开始-结束”等场景下非常有用。下面通过一个完整示例来说明它的工作原理。

---

**示例：订单的创建和取消**

假设我们要跟踪某些订单(order_id) 的创建和取消事件，并想在后台自动“折叠”被取消的订单，保留或计算最终有效订单数量。

```sql
CREATE TABLE orders_collapsing
(
    order_id UInt64,   -- 订单ID
    event_time DateTime,
    sign Int8          -- 标识列：+1 (创建)，-1 (取消)
) 
ENGINE = CollapsingMergeTree(sign)
ORDER BY (order_id, event_time);
```

- sign 列指定为 Int8 类型，用来表示增加(+1)或撤销(-1)。
- ORDER BY (order_id, event_time) 表示主键组合 (order_id, event_time)，在合并时，相同主键组合的数据将被折叠。

让我们插入一些模拟数据，表示订单从创建到取消的过程：

```sql
INSERT INTO orders_collapsing (order_id, event_time, sign) VALUES
-- 订单 1: 创建 + 取消
(1, '2025-01-01 10:00:00',  1),   -- 订单1 创建
(1, '2025-01-01 12:00:00', -1),   -- 订单1 取消

-- 订单 2: 仅创建
(2, '2025-01-01 11:00:00',  1),   -- 订单2 创建

-- 订单 3: 创建 + 取消
(3, '2025-01-01 09:00:00',  1),   -- 订单3 创建
(3, '2025-01-01 09:00:00', -1),   -- 订单3 取消

-- 订单 4: 仅创建
(4, '2025-01-01 15:00:00',  1);   -- 订单4 创建
```

- 订单 1 的两条记录主键不同，不会发生折叠。
- 订单 2 的两条记录主键相同，并且正好对冲为 0，会发生折叠。

需要等待 ClickHouse 完成 Merge Process，才能看到折叠后的数据，此时直接查询数据，有可能查询出未折叠的数据。

在查询时加上 FINAL 关键字，就会在读取数据前执行一次临时合并，并把相同主键+sign 列进行折叠。

```sql
SELECT * FROM orders_collapsing FINAL;
```

合并前的数据：

```
order_id | event_time           | sign
---------------------------------------
1        | 2025-01-01 10:00:00  |  1
1        | 2025-01-01 12:00:00  | -1
2        | 2025-01-01 11:00:00  |  1
3        | 2025-01-01 09:00:00  |  1
3        | 2025-01-01 09:00:00  | -1
4        | 2025-01-01 15:00:00  |  1
```

合并后的数据：

```
order_id | event_time           | sign
---------------------------------------
1        | 2025-01-01 10:00:00  |  1
1        | 2025-01-01 12:00:00  | -1
2        | 2025-01-01 11:00:00  |  1
4        | 2025-01-01 15:00:00  |  1
```

# VersionedCollapsingMergeTree

VersionedCollapsingMergeTree 是 CollapsingMergeTree 的一个变体，用于在 折叠（对冲 +1/-1） 的基础上，额外考虑版本（version）的顺序，从而更细粒度地控制折叠逻辑。它在许多需要多次“撤销”或“多版本撤回”场景中非常有用。

在普通的 CollapsingMergeTree 中，只有一个 sign 列（+1 / -1），在合并时只要主键相同便进行正负对冲；而 VersionedCollapsingMergeTree 会多一个 version 列，用来在对冲时考虑记录的版本先后顺序。

VersionedCollapsingMergeTree 需要在 ENGINE 里指定 sign 和 version 两列，如 ENGINE = VersionedCollapsingMergeTree(sign, version)。在后台合并时，会按照主键分组后，先按 version 排序，然后依次对冲正负记录。version 越大，代表“更新”或“更晚”的版本，可部分抵消之前的版本产生的 +1 或 -1。

这种“有序折叠”常用于多次更新 / 撤销的场景，比如：

- 订单多次修改，有多条修改记录（version 递增），最后又取消；
- 或一条数据先被错误插入 (+1)，再撤销 (-1) ，又再次插入 (+1) 等，需要按时间或版本顺序处理。

