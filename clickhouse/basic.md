# 单机部署

```shell
docker container run \
    --name clickhouse \
    --network global \
    --privileged=true \
    --ulimit nofile=262144:262144 \
    -p 8123:8123 \
    -p 9000:9000 \
    -p 9009:9009 \
    -d clickhouse/clickhouse-server:24.8
```

# 物化视图

ClickHouse 提供 物化视图（Materialized Views），用于 存储查询结果，从而加速查询速度。物化视图的查询结果是持久化的，并在数据插入时自动更新，与普通视图（VIEW）不同，它不会每次查询都重新计算数据。

- 数据持久化：查询结果存储在 物化视图表 中，而不是每次计算。
- 自动更新：当 主表（源表）有新数据写入时，物化视图会自动更新。
- 提升查询性能：适用于 聚合查询、数据预计算、索引优化 等场景。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501231023870.png)

## 数据存储在当前表中

准备测试数据，创建物化视图：

```sql
-- 创建主表
CREATE TABLE orders (
    order_id UInt32,
    customer_id UInt32,
    amount Float32,
    order_date DateTime
) ENGINE = MergeTree()
ORDER BY order_date;

-- 创建物化视图
CREATE MATERIALIZED VIEW daily_sales_mv 
ENGINE = AggregatingMergeTree()
ORDER BY order_date 
POPULATE
AS 
SELECT 
    toDate(order_date) AS order_date,
    count() AS total_orders,
    sum(amount) AS total_sales
FROM orders
GROUP BY order_date;

-- 插入数据到主表中，自动更新到物化表中
INSERT INTO orders VALUES 
(1, 1001, 99.9, '2024-01-10 12:00:00'),
(2, 1002, 49.5, '2024-01-10 14:30:00'),
(3, 1003, 79.2, '2024-01-11 09:15:00');
```

查询主表：

```sql
select * from orders;
```

```
┌─order_id─┬─customer_id─┬─amount─┬──────────order_date─┐
│        1 │        1001 │   99.9 │ 2024-01-10 12:00:00 │
│        2 │        1002 │   49.5 │ 2024-01-10 14:30:00 │
│        3 │        1003 │   79.2 │ 2024-01-11 09:15:00 │
└──────────┴─────────────┴────────┴─────────────────────┘
```

查询物化视图：

```sql
select * from daily_sales_mv;
```

```
┌─order_date─┬─total_orders─┬───────total_sales─┐
│ 2024-01-10 │            2 │ 149.4000015258789 │
│ 2024-01-11 │            1 │ 79.19999694824219 │
└────────────┴──────────────┴───────────────────┘
```

## 数据存储在目标表中

默认情况下，物化视图的数据存储在自身的表里，可以通过 `to` 将数据存储在指定的目标表。

```sql
CREATE TABLE daily_sales (
    order_date Date,
    total_orders UInt32,
    total_sales Float32
) ENGINE = MergeTree()
ORDER BY order_date;

CREATE MATERIALIZED VIEW daily_sales_mv 
TO daily_sales 
AS 
SELECT 
    toDate(order_date) AS order_date,
    count() AS total_orders,
    sum(amount) AS total_sales
FROM orders
GROUP BY order_date;
```

# 数据分区

ClickHouse 提供 分区（Partitioning） 机制，以提高查询性能、优化数据存储，并减少磁盘 IO。分区允许将大表拆分成多个子集，从而加速查询和删除数据。

按照逻辑划分数据，每一个分区单独存储在一个文件中。写入时，按分区规则存储到不同的文件夹。查询时，只扫描相关分区，减少全表扫描。适用于时间序列、日志分析、大规模数据集。

```sql
CREATE TABLE orders (
    order_id UInt32,
    customer_id UInt32,
    amount Float32,
    order_date DateTime
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(order_date)
ORDER BY order_date;

INSERT INTO orders VALUES 
(1, 1001, 99.9, '2024-01-10 12:00:00'),
(2, 1002, 49.5, '2024-01-15 14:30:00'),
(3, 1003, 79.2, '2024-02-05 09:15:00'),
(4, 1004, 120.0, '2024-02-20 16:00:00');
```

- PARTITION BY toYYYYMM(order_date) → 按月份划分分区
- ORDER BY order_date → 数据按照 order_date 排序存储

查看分区：

```sql
SELECT DISTINCT partition, name FROM system.parts WHERE table = 'orders' AND active;
```

```
┌─partition─┬─name────────────┐
│ 202401    │ all_1_1_0       │
│ 202402    │ all_2_2_0       │
└───────────┴─────────────────┘
```

分区裁剪，查询优化：

```sql
SELECT * FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31';
```

- ClickHouse 只会扫描 202401 分区，而不会扫描 202402，大大提高查询效率。

删除分区：

```sql
ALTER TABLE orders DROP PARTITION 202401;
```

合并分区：

```sql
OPTIMIZE TABLE orders FINAL;
```

## 装载分区，卸载分区

ClickHouse 提供了装载（ATTACH PARTITION）和卸载（DETACH PARTITION） 的功能，用于管理分区数据，适用于 数据迁移、冷热数据管理、性能优化 等场景。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501231253045.png)

当前分区的数据：

```sql
SELECT DISTINCT partition, name FROM system.parts WHERE table = 'orders' AND active;
```

```
┌─partition─┬─name────────────┐
│ 202401    │ all_1_1_0       │
│ 202402    │ all_2_2_0       │
└───────────┴─────────────────┘
```

- 分区 202401 和 202402 存在

卸载 202401 分区：

```sql
ALTER TABLE orders DETACH PARTITION 202401;
```

- 此时，202401 分区的数据仍然存储在磁盘上，但不可查询。

装载 202401 分区：

```sql
ALTER TABLE orders ATTACH PARTITION 202401;
```

- 数据已经恢复，可以查询。

## 备份分区，恢复分区

可以借助 装载分区，卸载分区 的功能，实现数据分区的备份和恢复。

备份分区：

```sh
mv /var/lib/clickhouse/data/default/orders/202401/ /backup/orders_202401/
```

恢复分区：

```sh
mv /backup/orders_202401/ /var/lib/clickhouse/data/default/orders/
```

```sql
ALTER TABLE orders ATTACH PARTITION 202401;
```

# 数据字典

ClickHouse 提供 数据字典（Dictionaries），用于加速查询、维表数据存储、动态数据关联等场景。数据字典通常用于存储外部数据（如 MySQL、PostgreSQL、CSV、HTTP API），并支持内存缓存，减少查询时的 JOIN 计算成本。

- 加速 JOIN 操作（避免表 JOIN 带来的性能开销）
- 将外部数据加载到内存中（支持 MySQL、PostgreSQL、CSV、HTTP 等）
- 适用于维表查询（维度表）（如 地区信息、用户数据）
- 支持缓存（内存缓存 + 过期策略）

## 数据字典的布局类型

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501231718559.png)

## 数据字典的查询函数

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501231628296.png)

## 数据字典的基本用法

配置数据字典配置文件 /etc/clickhouse-server/dictionaries/regions_dict.xml：

```xml
<yandex>
    <dictionary>
        <name>regions_dict</name>
        <source>
            <file>
                <path>/var/lib/clickhouse/dictionaries/regions.csv</path>
                <format>CSV</format>
            </file>
        </source>
        <layout><flat/></layout>
        <structure>
            <attribute name="region_name" type="String"/>
        </structure>
        <lifetime>3600</lifetime>
    </dictionary>
</yandex>
```

- 数据来源：CSV 文件 /var/lib/clickhouse/dictionaries/regions.csv。
- 存储方式：Flat（全量存储在内存中）。
- 查询缓存：数据字典在内存中缓存 3600s，过期后自动后从硬盘拉取最新的数据字典。

配置数据字典源数据文件 /var/lib/clickhouse/dictionaries/regions.csv：

```
id,region_name
1,North America
2,Europe
3,Asia
```

查看数据字典：

```sql
SHOW DICTIONARIES;
```

- 如果 regions_dict 存在，则说明配置成功。

查询数据字典：

```sql
SELECT dictGetString('regions_dict', 'region_name', 2);
```

```
┌─dictGetString('regions_dict', 'region_name', 2)─┐
│ Europe                                          │
└─────────────────────────────────────────────────┘
```

- 查询 regions_dict 字段，取 id = 2 的 region_name 属性值。

## 数据字典作维表使用

假设我们有一个 订单表 orders，其中包含 user_id，但没有用户姓名、地区信息。这些用户信息存储在 MySQL 维表 users 里。

常规方式是使用 JOIN 查询用户信息，但是这样 JOIN 需要遍历整个表，性能较低。

```sql
SELECT orders.order_id, users.name, orders.amount
FROM orders
JOIN users ON orders.user_id = users.id;
```

如果 users 作为维表变更不频繁的话，可以采用数据字典缓存。

---

基于 MySQL 的 users 在 ClickHouse 中创建 users_dict 数据字典：

```sql
CREATE TABLE users (
    id UInt32 PRIMARY KEY,
    name String,
    region String
) ENGINE = MySQL('mysql_host', 'database', 'users', 'clickhouse_user', 'password');
```

```xml
<yandex>
    <dictionary>
        <name>users_dict</name>
        <source>
            <mysql>
                <host>mysql_host</host>
                <port>3306</port>
                <user>clickhouse_user</user>
                <password>password</password>
                <db>database</db>
                <table>users</table>
            </mysql>
        </source>
        <layout><hashed/></layout>
        <structure>
            <id>id</id>
            <attribute name="name" type="String"/>
            <attribute name="region" type="String"/>
        </structure>
        <lifetime>1800</lifetime>  <!-- 每 30 分钟自动更新 -->
    </dictionary>
</yandex>
```

- 从 MySQL 的 users 维表加载数据，用 user_id 作为索引，每 30 分钟自动同步 MySQL 里的用户数据。

直接使用 users_dict 数据字典代替 JOIN 查询数据：

```sql
SELECT 
    order_id, 
    dictGetString('users_dict', 'name', user_id) AS user_name,
    dictGetString('users_dict', 'region', user_id) AS user_region,
    amount 
FROM orders;
```

# 参考文档

- [MergeTree 表存储引擎图文实例详解](https://cloud.tencent.com/developer/article/1919684)
- [ClickHouse MergeTree Table Engine](https://blog.det.life/i-spent-8-hours-learning-the-clickhouse-mergetree-table-engine-511093777daa)





