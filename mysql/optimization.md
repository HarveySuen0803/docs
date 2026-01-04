# Database

强制, Database 一律小写, 采用 `_` 分割.

强制, 创建 Database 时, 必须显式指定 Character 为 utf8 或 utf8mb4.

建议, Temp Database 通过 `tmp_` 开头.

建议, Backup Database 通过 `bak_` 开头.

# Table

强制, Table 小写, 采用 `_` 分割, 同一模块的 Table 采用统一前缀.

建议, Temp Table 以 `tmp_` 开头.

建议, Backup Table 以 `bak_` 开头.

强制, 创建 Table 时, 显式指定 Character 为 utf8 或 utf8mb4. 显式指定 Storage Engine, 一般为 InnoDB. 必须给 Field 添加 Comment.

强制, 禁止存储大文件的二进制数据.

建议, 核心表添加 `create_time` 和 `update_time`.

建议, InnoDB 需要插入大量数据时, 先禁用索引, 禁用外键检查, 禁用事务的自动提交.

建议, MyISAM 需要插入大量数据时, 先禁用索引, 禁用唯一性检查. 将大量数据分成多批, 一次插入一批. 如果一次性全部插入, 会导致服务拥堵, 性能急剧下降. 如果一条一条的插入, 那么就需要一条一条的解析, 效率低. MyISAM 还可以通过 `load data infile` 来批量导入数据, 这个更好.

建议, 增加中间表, 经常需要多表连接查询的数据, 放在一张中间表中, 类似于多表连接的中间表, 不仅包含多表的主键字段作为外键, 也包含需要查询的数据. 增加中间表后, 数据修改的成本就会变高, 所以适合读多写少的场景

- eg: 从 `stu` 和 `cls` 中抽取出一个中间表 `stu_cls(stu_id, cls_id, monitor, sname, cname)`, 将需要多表查询的数据放在 `stu_cls` 中, 后续只需要根据 `stu_id` 和 `cls_id` 进行查询即可

建议, 分离冷热数据, 可以有效减少 IO, 提高热数据在内存中的命中率, 高效利用缓存

# Field

强制, Field 小写, 采用 `_` 分割.

强制, Field 尽量使用缩写 (eg: 使用 `corp_id`, 不要使用 `corporation_id`), 可以节省存储资源, 提升查询性能.

建议, Field 尽量添加 Not Null 约束

- 可以省去 Null List 的占用
- 不需要再去查询 Null List, 可以提高查询性能
- 不用再去判断是否非空, 避免索引失效
- 减少开发时对空值处理的考虑

建议, Field 尽量分配 Default Value, 减少判断空的操作, 避免 Index Invalidation.

强制, Bool Type 的 Field 必须以 `is_` 开头 (eg: `is_enabled`).

建议, 增加冗余字段, 减少连接.

建议, 优先选择符合存储的需求最小数据类型 (eg: age 使用 `tinyint`), 减少不必要的浪费. 如果 Field 太大, 也会导致一个 Page 可以存储的 Record 减少, 提高了 IO, 降低了 Index 性能.

建议, 如果数据不为负数 (eg: age), 可以使用 Unsigned, 这样就从 -127 ~ 128 提升到了 0 ~ 255, 太牛逼了.

建议, 能使用 `int`, 就绝对不使用 `varchar`, 避免使用 `text` 和 `blob`, 太大了. 使用 `tinyint` 代替 `enum`. 使用 `timestamp` 代替 `datetime`, `timestamp` 只占用 4 Byte, 而且可以自动赋值, 自动更新, 非常智能. 使用 `decimal` 代替 `float` 和 `double`, 精准的浮点数, 尤其是财务相关的数据, 追求准确度.

# SQL

强制, 使用 `select` 时, 指定具体的 Field, 不要使用 `select *`.

建议, 使用 `select` 时, 使用 `union all`, 不要使用 `union`, `union` 会多一次去重操作, 效率低.

建议, 使用 `insert` 时, 指定具体的 Field, 不要使用 `insert into tbl values (...)`.

建议, 使用 `insert` 时, 一次性不要插入太多数据, 分批插入, 避免造成主从同步的延迟.

建议, 使用 `alter` 时, 将多次操作合并为一次操作, 一次性操作多条数据, 效率要高很多. 如果一次性操作超过 100W 条数据时, 就需要经过 DBA 审核, 并且在业务低峰期时进行.

建议, 使用 `join` 时, 控制在 5 张 Table 以内.

建议, 使用 `inner join` 代替 `outer join`.

建议, 使用 `order by`, `group by`, `distinct` 时, 和业务沟通, 尽量减少场景, 这玩意太费资源了, 实在没办法, 需要使用时, 就尽量控制在 1000 条以内.

建议, 使用 DML 时, 使用 `where` 缩小范围, 使用 Index 提高查询性能.

建议, 使用 TRX 时, 1 个 TRX 内不超过 5 个 SQL. TRX 过长, 会导致 Lock 的占用变长, Cache 无法清理, Connection 过多的问题.

建议, 使用 TRX 时, 使用 Unique Key 减小 Gap Lock 的范围.

# Index

Unified Index 包含了查询结果, 就是覆盖索引. 

`idx(col1, col2, col3)` 包含 col1, col2, col3, id, 在 InnoDB 中, Non Clustered Index 一定包含 id 来做唯一区分. 所以这个 Unified Index 可以用于 `idx(col1, col2)`, `idx(col1, col2, col3, id)`, 但不能用于 `idx(col1, col2, col3, col4)`.

Covering Index, 可以减少树的检索次数, 避免回表, 效率高.

Covering Index, 是按照顺序存储的, 对于范围查询特别友好, 可以将 Random IO 变成了 Sequential IO.

Unified Index 太多, 就会 Redundant Index, 需要进行权衡.

强制, InnoDB 表必须设置 Primary Key 为 id, 并且类型为 `int` 或 `bigint`, 设置为 Auto Increment, 最好设置为 Unsigned. 不要将主体字段设置为主键 (eg: User 表的 `user_id`), 避免随机插入造成页分裂.

强制, InnoDB 和 MyISAM 的索引类型必须为 BTREE.

建议, Primary Key 以 `pk_` 开头, Unique Key 以 `uni_` 或 `uk_` 开头, Normal Key 以 `idx_` 开头.

建议, 1 张 Table 的 Index 数量不超过 6 个.

建议, 常用于 `where`, `order by`, `group by` 的 Field 需要创建 Index.

建议, 尽量创建 Unified Index, 把区分度最高的 Feild 放在最前面.

建议, 给字符串创建 Index 时, 可以截取一部分字符串作为 Index.

建议, 多使用 `NOT NULL` 约束 Field, 可以辅助 Optimizer 选择 Index.

建议, 多表连接时, 保证 Drived Table 连接的 Field 上有 Index.

# Index Invalidation

CostBaseOptimizer 会根据各种条件决定是否采用 Index.

这里会使用 `idx_key1_key2`, 不会使用 `idx_key1`. `idx_key1_key2` 中会使用 `key2` 再过滤一部分后, 再回表, 可以大大提高效率.

```sql
explain select key1 from s where key1 = 1 and key2 = 1;
```

这里没有左边的 `key1`, 所以右边的 `key2` 和 `key3` 都失效.

```sql
explain select key1 from s where key2 = 1 and key3 = 1;
```

这里 `key1` 生效, 没有左边的 `key2`, 所以 `key3` 失效.

```sql
explain select key1 from s where key1 = 1 and key3 = 1;
```

这里 `key2` 使用了范围查询, 直接导致后边的 `key3` 失效.

```sql
explain select key1 from s where key1 = 1 and key2 > 1 and key3 = 1;
```

最好将需要范围查询的 Field 放在最后, 这样 `key1`, `key2` 和 `key3` 就都可以生效了.

```sql
explain select key1 from s where key1 = 1 and key2 = 1 and key3 > 10;
```

这里 `key2` 使用了 Function, 直接导致 `key2` 和后边的 `key3` 失效.

```sql
explain select key1 from s where key1 = 1 and left(key2, 1) = 1 and key3 = 1;
```

这里 `key2` 进行了计算, 直接导致 `key2` 和后边的 `key3` 失效.

```sql
explain select key1 from s where key1 = 1 and key2 + 1 = 2 and key3 = 1;
```

这里 `key2` 发生了类型转化, 直接导致 `key2` 和后边的 `key3` 失效.

```sql
explain select key1 from s where key1 = 1 and key2 = '1' and key3 = 1;
```

这里 `key2` 使用了 `!=`, `<>` 或 `is not null`, 都会直接导致后边的 `key3` 失效.

```sql
explain select key1 from s where key1 = 1 and key2 != 1 and key3 = 1;
```

这里 `key1` 使用了 `%` 开头进行模糊查询, 会导致 `key2` 和 `key3` 失效.

```sql
explain select * from s where key1 like 'a%' and key2 like '%a%' and key3 like 'a%';
```

这里 `col2` 不是 Index, 在 `or` 前后, 导致 `key1` 和 `key3` 失效.

```sql
explain select key1 from s where key1 = 1 or col2 like 'a%' or key3 = 1;
```

这里 `order by` 中, 如果不通过 `limit` 限制数量, 就会导致 Index Invalidation.

```sql
explain select * from s order by key1; -- NO
explain select * from s order by key1 limit 100; -- YES
```

# Sub Query

Sub Query 改成 Multi Table Query, 提升效率.

```sql
select * from s1 where s1.id in (select id from s2);

select * from s1 left join s2 on s1.id = s2.id;
```

# Sort Algorithm

Two-Way Sorting 是先从 Disk 中读取 `order by` 使用的 Field 到 Memory 中, 排好序后, 再按顺序去 Disk 中读取完整的数据, 这次是 Random IO. 不仅仅需要两次 IO, 而且还包含一次 Random IO, 性能极差.

Single-Way Sorting 是一次性从 Disk 中读取全部的数据, 这次是 Sequential IO, 读取到全部数据后再进行排序, 性能非常彪悍呐, 就是多占用了一点 Buffer, 无所谓, 内存这玩意随便造.

Single-Way Sorting 总体上是优于 Two-Way Sorting 的, 但还是得防止一次性读取太多数据后, 导致 Out of Sort Buffer. 如果一次性读取不完, 还需要再进行多次 IO, 反而得不偿失.

默认使用的就是 Single-Way Sorting, 如果查询的数据量超出了 `max_length_for_sort_data`, 就会使用 Two-Way Sorting.

Check Sort Buffer size

```sql
show variables like 'sort_buffer_size';
```

Check `max_length_for_sort_data`

```sql
show variables like 'max_length_for_sort_data';
```

# order by

给 `order by` 添加 Index 是为了避免 filesort. 如果 `where` 使用了 Index, 那么 `order by` 也会收到影响.

这里 `key1`, `key2`, `key3` 都包含在 Unified Index 中, 根据索引查询后, 不需要再回表排序了, 已经是排好序的了, 性能极强.

```sql
explain select key1 from s order by key1, key2, key3; -- Using index
```

`order by` 一般都需要搭配 `limit` 适用, 如果不限制数量, 就可能导致 Index Invalidation.

```sql
explain select * from s order by key1; -- NO
explain select * from s order by key1 limit 100; -- YES
```

这里 `key1`, `key2` 和 `key3` 都采用了相反的排序方式, 就会触发 `Backward index scan`.

```sql
explain select key1 from s order by key1 desc, key2 desc, key3 desc;
```

在 `where` 和 `order by` 需要使用的字段出现二选一时, 需要比较二者操作的数据量. 如果 `where` 需要操作的数据大, 就优先给 `where` 使用 Index. 反之, 亦然.

# group by 

`group by` 使用 Index 还是遵循一样的规则. 如果 `where` 使用了 Index, 那么 `order by` 也会收到影响.

建议, `where` 的效率远高于 `having`, 尽量避免使用 `having`.

建议, `order by`, `group by` 和 `distinct` 非常占用 CPU, 尽量还是在业务层面避免这样的问题. 实在没办法, 就尽量控制在 1000 条以内.

# limit

这里定位到 1000000 就需要将这 1000010 条数据全部加载到 buffer 中, 结果只查 10 条数据, 这条 SQL 写的太二逼了.

```sql
select * from s limit 1000000, 10
```

Primary Key 是 Auto Increment 的, 并且还是 Index. 可以根据 Primary Key 进行定位数据行, 而不是一行一行的扫, 再通过 `where` 来过滤. 测试下来发现 Sub Query 和 Join 没啥区别.

从业务上讲, 这种需要翻很多页来查询的数据, 本身就离谱, 属于冷数据, 最好进行冷热隔离

```sql
select * from s where id >= (
  select id from s order by id limit 1 offset 1000000
) limit 10;
```

```sql
select * from s as s1
join (select id from s order by id limit 1 offset 1000000) as s2
on s1.id >= s2.id
limit 10;
```

如果不可避免的需要进行全表扫描, 并且我们很明确只需要一条数据时, 可以使用 `limit 1` 进行加速, 这样全表扫描时, 查询到一条数据后, 就不会再进行查找了.

```sql
select * from s where col1 like "abc" limit 1;
```

通过 limit 限制 DML, 降低错误影响, 降低崩溃风险, 减少锁持有时间.

```sql
update tbl set col1 = 'xxx' where id > 100 and id < 200 limit 100;
```

# exists, in

这里是 B 查询一条数据提供给 A 使用, 适合 A 大, B 小 的场景, 遵循小表驱动大表的原则

```sql
select * from A where A.id in (select id from B);
```

这里是 A 查询一条数据提供给 B 使用, 适合 A 小, B 大 的场景, 遵循小表驱动大表的原则

```sql
select * from A where exists (select 1 from B where A.id = B.id);
```

# count()

在 InnoDB 下, `count(*)`, `count(1)`, `count(field` 都需要进行全表扫描, 所以 TC 都是 `O(n)`. `count(*)` 和 `count(1)` 效率几乎相同, 都是选择一个 `key_len` 最小的 Non Clustered Index 进行全表扫描, 如果没有 Non Clustered Index, 就会选择 Clustered Index 进行全表扫描. `count(field)` 是根据指定的 Field 进行全表扫描, 推荐使用 Non Clustered Index, 因为 Non Clustered Index 相比 Clustered Index 占用更小.

在 MyISAM 下, MyISAM 会单独维护一个 `row_count` 存储记录条数, 所以 `count(*)` 和 `count(1)` 的 TC 都是 `O(1)`.

# select

解析 `select *` 时, 需要去查询 System Table, 将 `*` 解析成具体的 Field, 还要查询所有的 Field, 这个过程非常低效, 还无法使用 Covering Index 进行优化.

`select *` 占用的空间还很大, 容易导致 Out of Buffer, 导致无法使用 Single-Way Sorting.

# Incremental Query

数据量过多时, 通过增量查询代替全量查询, 进行数据同步.

```sql
select * from user where id > #{lastId} limit 100;
```
