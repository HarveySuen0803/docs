# Lock

查询当前服务中所有线程占有的 Lock

```sql
select * from performance_schema.data_locks \G
```

上锁后, 会在查询匹配的过程中将扫描过的数据全部加上锁, 因为 MySQL 无法确认哪条数据是要操作的, 所以只能全部上锁, 通过索引匹配减少扫描的数据, 减少上锁的数量, 可以有效提高性能

# Table Lock

InnoDB 有更牛逼的 Row Lock 了, 所以一般 Table Lock 都是用于 MyISAM

查看所有表使用 Table Lock 的情况

```sql
show open tables;
show open tables where in_use > 0;
```

添加 Table Lock

```sql
lock tables tbl write;
lock tables tbl read;
```

MySQL 要释放锁时, 只能一次性释放当前会话持有的全部锁, 不能指定释放某一把锁

```java
unlock tables;
```

# Intention Lock

InnoDB 下, 给 Row 添加 Exclusive Lock (X) 后, 就需要给当前 Page 所属的 Table 添加 Intention Exclusive Lock (IX). 给 Row 添加 Shared Lock (S) 后, 就会给当前 Page 所属的 Table 添加 Intention Shared Lock (IS)

TRX 尝试获取 Row Lock 时, 可以先检查该 Table 的 Intention Lock, 看看是否和自己的 IS 或 IX 冲突, 不需要一行一行的的遍历判断是否添加了 Row Lock, 大大提高效率

- S 兼容 IS, S 排斥 IX, X 排斥 IS, X 排斥 IX

默认不会给读操作添加 Shared Lock, 这里手动添加 Shared Lock, 给 Row 添加了 S 后, 也会自动给 Table 添加 IS

```sql
select * from tbl lock in share mode;

select * from tbl for share;
```

默认会给写操作添加 Exclusive Lock, 这里手动添加了 Exclusive Lock, 给 Row 添加了 X 后, 也会自动给 Table 添加 IX

```sql
select * from tbl for update;
```

# Auto-Inc Lock

同时插入多条数据时, Primary Key 就需要 Auto-Inc Lock 实现 Auto Increment

Simple Inserts 可以预先知道插入的行数. 如 `insert ... values ('a'), ('b'), ('c')`, 就明确知道要插入 3 条数据

Bulk Inserts 预先不知道插入的行数. 如 `insert ... select`, 需要插入的数据是后续查出来的, 不知道到底要插入几条

Mixed Inserts 是某些行会需要新建 Priamry Key. 如 `insert ... values (1, 'a'), (null, 'b'), (3, 'c'), (null, 'd')`, 有一些需要创建 Primary Key, 有一些不需要创建

InnoDB 的 Auto-Inc Lock 有 3 种 Mode, 可以设置 `innodb_autoinc_lock_mode` 为 `0`, `1` 或 `2` 指定不同的 Mode

- `0`: 需要多个事务去争抢 Auto-Inc Lock, 性能极差
- `1`: 需要多个事务去争抢 Auto-Inc Lock. 对于 Simple Inserts, 可以预先知道插入的行数, 一次性分配一系列 Primary Key, 性能稍微好一点. 对于 Bulk Inserts, 没有办法知道插入的行数, 每执行一条插入操作, 就得分配一个 Primary Key
- `2`: 不需要事务去争抢 Auto-Inc Lock 了, 只保证 Primary Key 的唯一和单调, 不保证连续, 性能极强, 但是在 Bin Log 重播 SQL 时, 就会不安全

# Metadata Lock

执行 DML 时, 就会自动添加上 Metadata Read Lock, 只要是 DML, 就不会操作. 执行 DDL 时, 就会自动添加上 Metadata Write Lock, 后续再执行 DML, 就会进入堵塞

这里 A 和 B 同时执行 DML, 不会堵塞

```txt
A: select * from tbl; -- ok
B: select * from tbl; -- ok
```

这里 A 先执行 DML 获取了 MDL, 而 B 想要执行 DDL, 就需要 A 先释放了 MDL

```txt
A: select * from tbl; -- ok
B: alter table tbl add col1 int; -- waiting
```

这里 A 先执行 DDL 获取了 MDL, 执行完 DDL 后, 立马自动提交了事务, 释放了 MDL, 完全不影响 B 获取 MDL, 而 C 想要执行 DDL, 就需要等待 B 释放 MDL

```txt
A: alter table tbl add col1 int; -- ok
B: select * from tbl; -- ok
C: alter table tbl add col1 int; -- waiting
```

这里 A 先获取了 MDL, B 想要执行 DDL, 就需要获取 MDL, 卡在这, 而 C 只想执行 DML, 却因为 B 卡在这的原因, 也得卡在这

```txt
A: select * from tbl; -- ok
B: alter table tbl add col1 int; -- waiting
C: select * from tbl; -- waiting
```

# Record Lock

这里 A 抢到了当前行的 X, B 可以随意访问其他行, 但是想要获取当前行的 S 去访问时, 就会进入等待

```txt
A: update tbl set col = 'a' where id = 1; -- ok
B: select * from tbl where id = 2 for share; -- ok
B: select * from tbl where id = 1 for share; -- waiting
```

这里 A 抢到了当前行的 X, B 不去获取 S, 而是直接访问, 可以读到 A 未操作前的数据

```txt
A: update tbl set col = 'a' where id = 1; -- ok
B: select * from tbl where id = 1; -- ok
```

这里 A 抢到了当前行的 X, B 想要获取 X, 就会进行等待

```txt
A: update tbl set col = 'a' where id = 1; -- ok
B: update tbl set col = 'A' where id = 1; -- waiting
```

这里 A 抢到了当前行的 S, B 想要获取 X, 就会进行等待, C 想要获取 S, 就会进入等待

```txt
A: select * from tbl where id = 1 for share;
B: update tbl set col = 'A' where id = 1; -- waiting
C: select * from tbl where id = 1 for share; -- waiting
```

# Gap Lock

A 想要查询 (1, 5) 的数据, 此时 B 插入了一条数据到 3 的位置, 就会导致 A 读到了错误的数据, 这就是 Phantom Read

Gap Lock 可以解决 Phantom Read, A 在读取时, 获取了 Gap Lock, 表示对这 (1, 5) 的数据上了锁, B 想要操作这缝隙里的数据, 就需要先获取 Gap Lock

这里 A 会锁定 (20, 25), (15, 20), (25, 30) 这三段间隙, B 无法往这三段间隙插入数据

```txt
+----+------+
| id | col  |
+----+------+
| 10 | a    |
| 15 | b    |
| 20 | c    |
| 25 | d    |
| 30 | e    |
+----+------+

A: select * from tbl where id > 20 and id < 25 for share;
B: insert into tbl values (16, 'x'); -- waiting
B: insert into tbl values (21, 'x'); -- waiting
B: insert into tbl values (26, 'x'); -- waiting
B: insert into tbl values (11, 'x'); -- ok
```

Gap Lock 是专门用来处理 Phantom Read 的, 所以只对 Insert 有效, 对 Update 和 Delete 没效果

```txt
A: select * from tbl where id > 20 and id < 25 for share;
B: select * from tbl where id = 21 for update; -- ok
```

这里 A 获取了 (1, 5) 的 Gap Lock, B 获取了 (5, 10) 的 Gap Lock, 而 A 又想去获取 (5, 10) 的 Gap Lock, B 又想去获取 (1, 5) 的 Gap Lock, 造成了致命的 Dead Lock

```txt
A: select * from tbl where id = 2 for update; -- ok
B: select * from tbl where id = 6 for update; -- ok
A: insert into tbl values (7, 'x'); -- waiting
B: insert into tbl values (3, 'x'); -- waiting
```

# Next-Key Lock

Next-Key Lock 包含了 Record Lock 和 Gap Lock, 也是 MySQL 8 的 Default Lock, 可以在 Gap Lock 的基础上包含临界点

这里 A 会锁定 (20, 25), [15, 20), (25, 30) 这三段间隙, B 无法往这三段间隙插入数据

```txt
+----+------+
| id | col  |
+----+------+
| 10 | a    |
| 15 | b    |
| 20 | c    |
| 25 | d    |
| 30 | e    |
+----+------+

A: select * from tbl where id >= 20 and id < 25 for update; -- ok
B: select * from tbl where id = 21 for update; -- waiting
B: select * from tbl where id = 20 for update; -- waiting
B: select * from tbl where id = 15 for update; -- ok
```

# Insert Intention Lock

这里 A 获取了 (1, 5) 的 Gap Lock, B 想要插入 id = 2 就会进入等待. InnoDB 也会为 B 在内存中生成一个 Insert Intention Lock, 这也属于一种 Gap Lock. 表示一种想要插入的意向, 嘿嘿

```txt
A: select * from tbl where id > 1 and id < 5 for update; -- ok
B: insert into tbl values (2, 'x'); -- waiting
```

# Lock Escalation

每个层级可以存储的 Lock 是有限的, 当超过一定的阈值后, 就会触发 Lock Escalation, 使用一个大粒度的 Lock 来代替多个小粒度的 Lock. 比如, 使用一个 Table Lock 代替多个 Row Lock. 这会导致并发能力的急剧下降, 但是 MySQL 一般不会触发 Lock Escalation, 所以也不必太担心

# Pessmistic Locking

Pessmistic Locking 适合写多读少的场景, 可以通过 MySQL 的 X 实现, 可以有效防止读写冲突, 写写冲突, 但是性能会受到影响, 也存在死锁的风险

# Optimistic Locking

Optimistic Locking 适合写少读多的场景, 可以通过程序实现, 不存在死锁的问题, 性能极强, 不保证强一致性, 只通过版本号或者时间戳保证最终一致性

# Implicit Lock

Implicit Lock 一般用于 Insert 时, 防止其他 TRX 访问

Clustered Index 有一个 `DB_TRX_ID` 记录 Cur TRX 的 Id, 当 Other TRX 通过 Clustered Index 访问当前记录时, 会去查看 `DB_TRX_ID` 是否和当前活跃的 Cur TRX 的 ID 相同, 如果相同, 就会去帮 Cur TRX 创建一个 X Lock (设置 Cur TRX 的 `is_waiting` 为 false, 设置 Other TRX 的 `is_waiting` 为 true)

Non Clustered Index 没有 `DB_TRX_ID`, 但是在 Page Header 中有一个 `PAGE_MAX_TRX_ID` 记录对 Cur Page 改动最大的 TRX 的 ID, 如果 Cur TRX 正在执行插入操作, 那么自然就记录的 Cur TRX 的 ID. 所以 Other TRX 通过 Non Clustered Index 访问到该 Record 时, 会去比较自己的 ID 是否比 `PAGE_MAX_TRX_ID` 是否和当前活跃的 Cur TRX 的 ID 相同, 如果相同, 就会根据 Non Clustered Index 记录的 Primary Key 再去找到 Clustered Index 中的数据, 进行上面的操作

# Global Lock

Global Lock 就是给整个 DB 添加 Lock, 只允许读操作, 一般用于 Global Logical Backup

```sql
flush tables with read lock
```

# Dead Lock

这里 A 获取 id = 1 的 X Lock, B 获取了 id = 2 的 X Lock, 而 A 又想去获取 id = 2 的 X Lock, B 又想获取 id = 1 的 X Lock, 发生了致命的 Dead Lock

```txt
A: update tbl set col = 'a' where id = 1; -- ok
B: update tbl set col = 'b' where id = 2; -- ok
A: update tbl set col = 'a' where id = 2; -- waiting
B: update tbl set col = 'b' where id = 1; -- waiting
```

通过 `innodb_lock_wait_timeout` 设置超时回滚, 可以解决一部分的 Dead Lock, 但是会误伤, 不太好

通过 `innodb_deadlock_detect` 设置主动检查 Dead Lock, 通过 InnoDB 的 Wait-for-Graph Algo 来检测 Directed Graph 是否有 Circle, 即可判断是否有 Dead Lock. 这个 Algo 的 TC 为 O(n), 如果有 100 个 TRX 并发访问一个记录, 就需要进行 100 * 100 次检测, 非常耗时

开启 DeadLock Detection 会有很大的性能损失, 不开启单独依靠 Timeout 也不合适, 所以尽量还是减少 Lock Conflict

- 可以在进入 InnoDB 之前, 先排个队, 避免大量的 Deadlock Detection
- 可以从业务层面避免大量的请求同时访问一条记录
- 可以设计 Index, 减少一次 SQL 锁定的记录数
- 可以调整 SQL 的执行顺序, 避免 `update` 和 `delete` 长时间持有 Lock
- 可以将一个大 TRX 拆成多个小 TRX
- 可以降低 Isolation Level (eg: RR -> RC)

# Lock Structure

InnoDB 的 Lock Structure 包含 TRX Info, Index Info, Lock Info, type_mode, N Bits, Other Info

Lock Info 分为 Table Lock Info 和 Row Lock Info

- Table Lock Info 包含 Table Info, Other Info
- Record Lock Info 包含 Space ID, Page Number, n_bits
    - Space ID: Record 所在的 TableSapce
    - Page Number: Record 所在的 Page
    - n_bits: N Bits 的数量

N Bits 通过一堆 Bit 来表示哪一条记录加了 Lock, 0 表示没有 Lock, 1 表示了有 Lock

Index Info 记录了 Row 是被哪个 Index 访问到的

TRX Info 记录了 Row 是被哪个 TRX 生成的, 记录了该 TRX 的信息

type_mode 是一个 32b 的数, 包含 `lock_mode`, `lock_type`, `rec_lock_type` 三个部分

- `lock_mode` 存储在 1 ~ 4 b, 表示 Lock Mode
    - `0`: IS Lock
    - `1`: IX Lock
    - `2`: S Lock
    - `3`: X Lock
    - `4`: Auto-INC Lock
- `lock_type` 存储在 5 ~ 8 b, 表示 Lock Type
    - 5 b 为 1 时, 表示使用的 Table Lock
    - 6 b 为 1 时, 表示使用的 Record Lock
- `is_waiting` 存储在 9 b, 1 表示 Cur TRX 正在等待, 0 表示 Cur TRX 获取到了 Lock
- `rec_lock_type` 存储在 10 ~ 32 b, 当 `lock_type` 为 `lock_rec` 时才会用着

Other Info 记录了 Lock Structure 使用到一些 Hash Table 和 Linked List

# Lock Monitoring

通过 `performance_schema.innodb_trx` 查看正在堵塞的 TRX

通过 `performance_schema.data_lock_waits` 查看正在堵塞的 TRX 想要获取的 Lock

通过 `performance_schema.data_locks` 查看正在堵塞的 TRX 想要获取的 Lock 和正常被 TRX 持有的 Lock

通过 `innodb_row_lock_time` 查看 Lock 锁定的总时长

通过 `innodb_row_lock_time_max` 查看 Lock 锁定的最长时长

通过 `innodb_row_lock_time_avg` 查看 Lock 锁定的平均时长

通过 `innodb_row_lock_waits` 查看总共等待的次数

通过 `innodb_row_lock_current_waits` 查看正在等待的 Lock 的数量
