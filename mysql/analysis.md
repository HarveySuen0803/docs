# Test Data

```sql
create table s (
    id   int auto_increment,
    col1 varchar(10),
    col2 varchar(10),
    col3 varchar(10),
    key1 int,
    key2 int,
    key3 int,
    primary key (id)
) engine = INNODB charset = utf8mb4;

create function rand_string(n int)
    returns varchar(255)
begin
    declare chars_str varchar(100) default 'abcdefghijklmnopqrstuvwxyzABCDEFJHIJKLMNOPQRSTUVWXYZ';
    declare return_str varchar(255) default '';
    declare i int default 0;
    while i < n do
        set return_str = concat(return_str, substring(chars_str, floor(1 + rand() * 52), 1));
        set i = i + 1;
    end while;
    return return_str;
end;

create procedure insert_s(in max_num int(10))
begin
    declare i int default 0;
    set autocommit = 0;
    repeat
        set i = i + 1;
        insert into s
            (col1, col2, col3, key1, key2, key3)
        values (
                   rand_string(10),
                   rand_string(10),
                   rand_string(10),
                   (rand() * 100),
                   (rand() * 100),
                   (rand() * 100));
    until i = max_num
        end repeat;
    commit;
end;

call insert_s(2000000);

select count(*) from s;
```

# Performance Parameter

查询 MySQL Server 的上线时间.

```sql
show status like 'uptime';
```

查询连接 MySQL Server 的次数.

```sql
show status like 'connections';
```

查询 Row 的操作记录.

```sql
show status like 'innodb_rows_%';
show status like 'innodb_rows_read';
show status like 'innodb_rows_inserted';
show status like 'innodb_rows_updated';
show status like 'innodb_rows_deleted';
```

查询上一条查询的成本.

```sql
show status like 'last_query_cost';
```

# Slow Query

一条 Query 执行耗时太久, 就是一条 Slow Query, 一般可以通过 SkyWalking, Promotheus, Arthas 这样的监测工具去监测耗时较久的 API. MySQL 也提供了 Slow Query Log 记录 Slow Query.

一般优化一些高并发场景的 Slow Query, 从 Disk IO, CPU, Network Bandwidth 三个角度来分析问题.

- Disk IO: 是否正确使用了 Index
- CPU: Order By, Distinct, Group By 是否占用太多, 针对性的添加 Index 进行优化
- Network Bandwidth: 提升 Network Bandwidth

Slow Query Log 开启后, 会影响一定性能, 一般需要调优时, 就可以打开辅助调优.

```sql
set session slow_query_log = on;
```

指定 Slow Query 的 Threshold.

```sql
set session long_query_time = 1;
```

Slow Query Log 也支持写入 Log 到指定文件中. 默认存储到 /var/lib/mysql/hostname-slow.log 中.

```sql
show variables like 'slow_query_log_file';
```

查询 Slow Query.

```sql
show status like 'slow_queries';
```

解析 Slow Query Log.

```shell
# Parses MySQL slow query log files and summarizes their contents
#   -a    Do not abstract all numbers to N and strings to 'S'
#   -s t  Sort by query time or average query time
#   -t 5  Display only the first 5 queries in the output
mysqldumpslow -a -s 5 -t 5 /var/lib/mysql/harvey-slow.log
```

删除 Log 后, 可以重置 Log. 

```shell
mysqladmin -uroot -p flush-logs slow
```

# Profiling

Profiling 可以用于分析当前 Session 中, 最近几条 SQL 的具体信息.

如果提示 `converting HEAP to MyISAM`, `Creating tmp table`, `Copying to tmp table on disk`, `locked` 就需要进行优化了.

开启 Profiling.

```sql
set session profiling = on;
```

通过 Profiling 查看 SQL 的具体信息.

```sql
show profiles;

show profile cpu, block io for query 5;
```

# Explain

## id

这里连接了两张表, 但是只有一个 `select`, 所以 id 都是 1.

```sql
explain select * from s1 left join s2 on s1.id = s2.id;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725800.png)

这里连接了两张表, 而且有两个 `select`, 所以 id 有两个.

```sql
explain select * from s1 where id in (select id from s2) or col1 like 'a%';
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725802.png)

这里虽然有两个 `select`, 但是 Optimizer 会将这里的 Sub Query 优化成 Join, 所有最终也只有一个 `select`, 即只有一个 id.

```sql
explain select * from s1 where id in (select id from s2);
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725803.png)

这里 `union` 会创建一个临时表, 进行 Duplicate Removal, 所以这里会多查处一条结果.

```sql
explain select * from s1 union select * from s2;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725804.png)

这里 `union all` 不会进行 Duplicate Removal, 所以就用不着临时表了.

```sql
explain select * from s1 union all select * from s2;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725805.png)

## select_type

这里 s1 和 s2 的 `select_type` 都是 `SIMPLE`.

```sql
explain select * from s1 left join s2 on s1.id = s2.id;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725800.png)

Sub Query 不能转换为 Semi Join 时,  `select_type` 就是 `SUBQUERYE`.

```sql
explain select * from s1 where id in (select id from s2) or col1 like 'a%';
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725802.png)

如果 Sub Query 是 Related Sub Query 时,  `select_type` 就是 `DEPENDENT SUBQUERY`.

```sql
explain select * from s1 where id in (select id from s2 where s1.key1 = s2.key1) or col1 = 'a%';
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725806.png)

`union` 左边的为 `PRIMARY`, 右边的都为 `UNION`, 临时表为 `UNION RESULT`.

```sql
explain select * from s1 union select * from s2;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725804.png)

Sub Query 中使用 `union` 后, `select_type` 就是 `DEPENDENT UNION`.

```sql
explain select * from s1 where id in (
    select id from s2
    union
    select id from s3
) or col1 = 'a%';
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725808.png)

这里创建了一个 Derived Table, 所以 `select_type` 就是 `DERIVED TABLE`.

```sql
explain select * from (
    select count(*) as count from s1
) as temp where count > 100;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725809.png)

这里 Sub Query 每次查询结果都是一样的, Optimizer 就会对其进行 Materization 将数据存储到一张临时表中, 下次再查询时, 就直接访问临时表就可以了, 所以 `select_type` 就是 `MATERIALIZED`.

```sql
explain select * from s1 where key1 in (select key1 from s2);
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725810.png)

## type

`type` 的性能优劣排序: `system` > `const` > `eq_ref` -> `ref` -> `fulltext` -> `ref_or_null` -> `index_merge` -> `unique_subquery` -> `index_subquery` -> `range` -> `index` -> `ALL`. Alibaba 要求 SQL 至少达到 `range`, 最好是 `const`.


只有一条数据, 且 `count(*)` 精准时, `type` 就是 `system`, 所以只有 MyISAM 和 Memory 可以使用 `system`.

```sql
create table test (id int) engine = myisam;
insert into test values (1);

explain select * from test;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725811.png)

Primary Key 或 Unique Index 进行等值匹配时, `type` 就是 `const`.

```sql
explain select * from s where id = 1;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725812.png)

这里 s1 为 Driving Table, s2 为 Drived Table. s1 为全表遍历, 所以 `type` 为 `ALL`, s2 是通过 Primary Key 或 Unique Index 进行等值匹配, 所以 `type` 为 `eq_ref`.

```sql
explain select * from s1 left join s2 on s1.id = s2.id;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725813.png)

Normal Index 不唯一嘛, 所以无法使用等值匹配, `type` 就不是 `eq_ref`, 而是 `ref`.

```sql
explain select * from s where key1 = 934;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725814.png)

Normal Index 可以为 Null 时, `type` 就是 `ref_or_null`.

```sql
explain select * from s where key1 = 934 or key1 is null;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725815.png)

如果 `in` 和 Sub Query 的 Primary Key 进行等值匹配, `type` 就是 `unique_subquery`.

```sql
explain select * from s1 where id in (
    select id from s2 where s1.key1 = s2.key1
) or key2 like 'a%';
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725816.png)

Normal Index 进行范围查询时, `type` 就是 `range`.

```sql
alter table s add index idx_col1 (col1);
explain select * from s where col1 like 'a%'; -- type = range
explain select * from s where col2 like 'a%'; -- type = null
```

发生 Covering Index 时, `type` 就是 `index`.

```sql
alter table s add index idx_key1_key2_key3 (key1, key2, key3);
explain select key1, key2, key3 from s where key1 = 934; -- type = index
```

## key

`possible_keys` 表示可能使用到的 Index, 由 Optimizer 进行选择, 最终选定一个效率最高的, 也有可能都不选择.

`key_len` 表示实际使用到的索引的长度, 主要针对 Unified Index, 越大越好.

```sql
explain select key1, key2, key3 from s where key1 = 934 and key2 > 10;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725818.png)

## rows

`rows` 表示查询的记录行数, 越小越好, 越有可能在同一个 Page, 进行 Sequential IO 的可能性就越大.

`filter` 表示查询的记录中, 满足条件的记录.

这里 `col1` 不是 Index, 直接根据 `col1` 查询到 1991713 条记录, 根据 `col1` 过滤后还剩 11.11%.

```sql
explain select * from s where col1 like 'a%';
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725819.png)

这里 `key1` 和 `key2` 都是 Index, `col1` 不是 Index, 根据 `key1` 和 `key2` 查询到了 1926 条记录, 再根据 `key1`, `key2` 和 `col1` 过滤后, 还剩 7.94%.

```sql
explain select * from s where key1 = 934 and key2 > 10 and col1 like 'a%';
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725820.png)

## extra

`where` 永远为 false 时, 提示 `Impossible WHERE`.

```sql
explain select * from s where 1 = 2; -- Impossible WHERE
```

`min()`, `max()` 没有满足 `where` 条件时, 提示 `No matching min/maxx row`.

```sql
explain select min(id) from s where id = 0; -- No matching min/max row
```

没有使用 Index 时, 提示 `Using where`.

```sql
explain select * from s where col1 like 'a%'; -- Using where
```

实现 Covering Index 时, 提示 `Using index`.

```sql
explain select id, key1, key2, key3 from s where key1 = 934; -- Using index
```

这里 `col1` 不在 Non Clustered Index 中, 需要进行回表, 提示 `null`.

```sql
explain select id, col1 from s where key1 = 934; -- null
```

这里 `key2 > 600` 后面的 Index 已经失效了, 按道理会进行回表, 回表查询 `key3 = 700`, 但是 Optimizer 会对这里进行优化, 在回表前查询 `key3 = 700`, 原先可能 900 条数据, 查询后可能就降低到了 700 条数据了, 减少了回表的次数, 这就是 Index Condition Pushdown (ICP).

```sql
explain select * from s where key1 = 500 and key2 > 600 and key3 = 700; -- Using Index Condition
```

这里 `s2` 为 Drivered Table, 而 `s2.col1` 又不是 Index, Optimizer 实在没办法了, 单独为其分配了一块 Join Buffer 以提高查询效率, 提示 `Using join buffer(hash join)`.

```sql
explain select * from s1 inner join s2 where s1.col1 = s2.col1;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725821.png)

对 Non Index Field 直接进行排序非常低效, 提示 `Using filesort`.

```sql
explain select * from s order by col1; -- Using filesort
```

需要创建临时表的操作时, 这里 `col1` 不是 Index, 提示 `Using temporary`, 这里 `key1` 是 Index, 会使用 Index 代替临时表, 提示 `Using index from group-by`.

一般提示 `Using temporary` 都不太好, 去维护一个临时表代价非常大, 还是建议使用 Index.

```sql
explain select distinct col1 from s; -- Using temporary
explain select distinct key1 from s; -- Using index for group-by
```

# Explain JSON Format

```sql
explain format=json select * from s where id = 1 \G
```

```json
EXPLAIN: {
  "query_block": {
    "select_id": 1,
    "cost_info": {
      "query_cost": "1.00"
    },
    "table": {
      "table_name": "s",
      "access_type": "const",
      "possible_keys": [
        "PRIMARY"
      ],
      "key": "PRIMARY",
      "used_key_parts": [
        "id"
      ],
      "key_length": "4",
      "ref": [
        "const"
      ],
      "rows_examined_per_scan": 1,
      "rows_produced_per_join": 1,
      "filtered": "100.00",
      "cost_info": {
        "read_cost": "0.00",
        "eval_cost": "0.10",
        "prefix_cost": "0.00",
        "data_read_per_join": "144"
      },
      "used_columns": [
        "id",
        "col1",
        "col2",
        "col3",
        "key1",
        "key2",
        "key3"
      ]
    }
  }
}
```

# Explain Tree Format

```sql
explain format=tree select * from s where key1 = 500 and key2 > 600 and key3 = 700;
```

```console
EXPLAIN: -> Index range scan on s using idx_key1_key2_key3 over (key1 = 500 AND 600 < key2), with index condition: ((s.key3 = 700) and (s.key1 = 500) and (s.key2 > 600))  (cost=734 rows=843)
```

# Show Warnings

`show warnings` 可以查看 Optimizer 重写后的 SQL.

这里是将 `left join` 转成了 `join`.

```sql
explain select s1.key1, s1.key2, s1.key3 from s1 left join s2 on s1.id = s2.id;
show warnings ;
```

```console
Message: /* select#1 */ select `explain_test`.`s1`.`key1` AS `key1`,`explain_test`.`s1`.`key2` AS `key2`,`explain_test`.`s1`.`key3` AS `key3` from `explain_test`.`s1` left join `explain_test`.`s2` on((`explain_test`.`s2`.`id` = `explain_test`.`s1`.`id`)) where true
```

这里是将 Sub Query 转成了 Semi Join.

```sql
explain select * from s1 where id in (select id from s2) \G
```

```console
Message: /* select#1 */ select `explain_test`.`s1`.`id` AS `id`,`explain_test`.`s1`.`col1` AS `col1`,`explain_test`.`s1`.`col2` AS `col2`,`explain_test`.`s1`.`col3` AS `col3`,`explain_test`.`s1`.`key1` AS `key1`,`explain_test`.`s1`.`key2` AS `key2`,`explain_test`.`s1`.`key3` AS `key3` from `explain_test`.`s2` join `explain_test`.`s1` where (`explain_test`.`s2`.`id` = `explain_test`.`s1`.`id`)
```

# Optmizer Trace

Optmizer Trace 会去跟踪 Optimizer 做出的各种优化, 并将结果记录到 `information_schema.optimizer_trace` 中.

Enable Optimizer Trace.

```sql
set session optimizer_trace = 'enabled=on';
set session end_markers_in_json = 'on';
set session optimizer_trace_max_mem_size = 1000000;
```

Test SQL.

```sql
select * from s where id < 10;
```

查询 `information_scheam.optimizer_trace`, 查看 MySQL 是如何执行 SQL 的.

```sql
select * from information_schema.optimizer_trace \G
```

# Sys Schema

查询 Sys Shcema 时, 会消耗大量资源, 可能会导致业务请求的堵塞, 在生产模式下, 尽量不要查询 Sys Scheam.

查看 Redundant Index.

```sql
select * from sys.schema_redundant_indexes;
```

查看 Unused Index.

```sql
select * from sys.schema_unused_indexes;
```

查看 Index Statistic.

```sql
select * from sys.schema_index_statistics;
```

查看 Buffer Pool 占用情况.

```sql
select * from sys.innodb_buffer_stats_by_table;
```

查看全表扫描情况.

```sql
select * from sys.statements_with_full_table_scans;
```

查看 SQL 执行情况.

```sql
select db, exec_count, query, first_seen, last_seen from sys.statement_analysis;

-- SQL with sorting
select db, exec_count, query, first_seen, last_seen from sys.statements_with_sorting;

-- Check SQL with Temp Table and Disk Temp Table
select query,
       tmp_tables,
       tmp_disk_tables
from sys.statement_analysis
where tmp_tables > 0
   or tmp_disk_tables > 0
order by (tmp_tables + statement_analysis.tmp_disk_tables) desc;
```

查看 Line Lock 的堵塞情况.

```sql
select * from sys.innodb_lock_waits;
```

# Join

多表连接时, 需要遵循小表驱动大表的原则, 首先遍历小表, 将小表的数据加载到内存中, 根据小表的内容去匹配大表的内容, 可以减少连接次数, 减少磁盘 IO, 减少 Drivered Table 的全表扫描次数.

对于 Inner Join, Optimizer 一般会让拥有 Index 的 Field 作为 Drived Table, 会让数据量小的 Table 作为 Drivering Table, 即小表驱动大表.

Table A 有 100 条记录, 每行记录 1 B, Table B 有 1000 条数据, 每行记录 2 B. 这里 A Left Join B 后, 通过 where 对 B 进行过滤, 得到 10 条数据. Table A 的数据量就是 100 * 1 B, Table B 的数据量就是 10 * 2 B, 那么 Table B 为小表, 即 Table B 驱动 Table A.

Table A 有 100 条记录, Table B 有 10000 条记录, 用 Table A 驱动 Table B 就是进行 100 次连接, 每次操作 10000 条数据, 性能要优于进行 10000 次连接, 每次操作 100 条数据.

Optimizer 会将 Outer Join 转换成 Inner Join, 所以最终还是 Optimizer 决定 Driving Table 和 Drived Table.

建议, 使用 `inner join` 代替 `outer join`.

# SNLJ

SNLJ 全表扫描, 暴力连接, 从 Drivering Table 中取一条数据, 就去遍历匹配 Drivered Table.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725822.png)

# INLJ

INLJ 通过 Drivered Table 的 Index 进行查询, 可以大大减少需要对 Drived Table 的遍历次数, 效率极高.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725823.png)

# BNLJ

BNLJ, 读取 Drivering Table 时, 是一次读取一大块记录, 加载到 Join Buffer 中, 再对 Drived Table 进行全表扫描, 一次性就匹配这一大块, 减少了 Drivering Table 的 IO 次数 和 Drivered Table 的全表扫描次数. SNLJ 是一次加载一条记录到 Join Buffer 中, 效率极低.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241725824.png)

Check BNLJ status

```sql
show variables like 'optimizer_switch';
```

Check Join Buffer size

```sql
show variables like 'join_buffer_size';
```

# Hash Join

MySQL 8.0.20 后废弃了 BNLJ, 采用 Hash Join. Hash Join 更适合处理大数据的连接.

# Analyze Table

`analyze table` 可用于分析表结构, 分析过程中会给表添加一个 Readonly Lock, 只允许读取, 不允许任何修改. 分析的结果会反映到 `cardinality` 上, 会影响 Optimizer 对于 Index 的选择.

```txt
+----+------+
| id | col  |
+----+------+
|  1 | a    |
|  5 | b    |
| 10 | c    |
| 15 | d    |
+----+------+

create index idx_col on tbl(col);
show index from tbl; -- cardinality: 4

-- After updating, there is no change in the query cardinality
update tbl set col = 'a' where id = 15;
show index from tbl; -- cardinality: 4

-- Analyze the table structure through `analyze`, which is equivalent to refreshing it
analyze table tbl;
show index from tbl; -- cardinality: 3
```

# Check Table

`check table` 可用于检查表是否有错误, 也可以检查视图是否有错误.

```sql
check table tbl1, tbl2, view1, view2
```

# Optimize Table

`optimize table` 可以重新组织表和索引的物理存储, 以减少存储空间并提高访问表时的 I/O 效率.

```sql
optimize table tbl1, tbl2
```

InnoDB 整理碎片时, 是新建一个 New Table, 将 Old Table 中的数据拷贝到 New Table 后, 直接删除 Old Table, 将 New Table 重命名, 实现整理.

如果 InnoDB Table 进行了大量的修改, 对 FullText Index 进行大量的修改就需要进行整理, 对 `varchar`, `varbinary`, `text`, `blob` 进行了大量的修改, 这些都需要进行整理.

