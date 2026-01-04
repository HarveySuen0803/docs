# Explicit Transaction

```sql
start transaction;
insert into stu values(1, 'tom');
insert into stu values(2, 'jerry');
insert into stu values(3, 'king');
commit;

start transaction;
insert into stu values(1, 'tom');
savepoint a;
insert into stu values(2, 'jerry');
savepoint b;
insert into stu values(3, 'king');
rollback to b; -- rollback to b point

start transaction;
insert into stu values(1, 'tom');
savepoint a;
insert into stu values(2, 'jerry');
savepoint b;
insert into stu values(3, 'king');
rollback; -- rollback to start point
```

# Implicit Transaction

执行 `alter`, `create`, `drop`, `grant`, `revoke`, `rename`, `set`, `password`, `lock`, `unlock`, `load data`, `start slave`, `stop salve`, `restart slave`, `change master to` 时, 会隐式提交当前语句和之前的语句.

```sql
start transaction;
insert into stu values(1, 'tom');
insert into stu values(2, 'jerry');
insert into stu values(3, 'king');
alter table stu add age int; -- auto commit
```

# Transaction ACID

Atomicity 是指一个 TRX 是一个不可分割的工作单元, 要么全成功提交, 要么全失败回滚, 成王败寇, 没有妥协之说, 通过 Undo Log 保证.

Consistency 是指数据需要从一个合法性状态变化到另一个合法性状态, 这个合法是业务层面的合法 (eg: A 扣钱, 扣成了负数, 则不符合业务层面的要求, 即不合法). 

Isolation 是指一个 TRX 内部使用到的数据对其他 TRX 隔离, 不会受到其他 TRX 的影响, 通过 MVCC 保证.

Durability 是指一个 TRX 一旦被提交, 它对数据库中数据的改变就是永久性的, 通过 Redo Log 保障的, 先将数据库的变化信息记录到 Redo Log 中, 再对数据进行修改, 这样做, 即使数据库崩掉了, 也可以根据 Redo Log 进行恢复.

# Transaction Status

Active 是指 TRX 正在执行.

Partially Committed 是指 TRX 已经执行了最后一个提交, 操作的都是内存中的数据, 还没有进行刷盘.

Committed 是指 TRX 在 Partially Committed 后, 成功进行了刷盘.

Failed 是指 TRX 在 Active 和 Partially Committed 阶段遇到了某些错误, 而无法继续执行.

Aborted 是指 TRX 在 Failed 阶段后, 进行回滚, 恢复了到 TRX 最初的状态.

# Concurrency Issue

这里 B 修改了 A 未提交的数据, 发生了 Dirty Write.

```txt
A: update tbl set col = 'a' where id = 1;
B: update tbl set col = 'A' where id = 1;
A: commit
```

这里 B 读取到了 A 未提交的数据, 发生了 Dirty Read.

```txt
A: update tbl set col = 'a' where id = 1;
B: select * from tbl where id = 1; -- 'a'
```

这里 A 先读取到了 'a', 后读到了 B 提交后的数据 'A', 发生了 Non-Repeatable Read, 这其实也是一种 Dirty Read.

```txt
A: select * from tbl where id = 1; -- 'a'
B: update tbl set col = 'A' where id = 1;
A: select * from tbl where id = 1; -- 'A'
```

这里 A 一开始没有读到 'a', 后来读取到了 'a', 发生了 Phantom Read.

```txt
A: select * from tbl where id > 1 and id < 5; -- null
B: update tbl set col = 'a' where id = 2;
A: select * from tbl where id > 1 and id < 5; -- 'a'
```

# Isolation Level

从严重程度上来讲, Dirty Write > Dirty Read > Non-Repeatable Read > Phantom Read. Dirty Write 是一定不能接受的, 而 Non-Repeatable Read 和 Phantom Read 在一定场景下, 是可以接受的.

MySQL 提供的 Isolation Level 包含 `read-uncommitted`, `read-committed`, `repeatable-read` 和 `serializable` 用于解决一定的并发问题.

- `read-uncommitted` 可以解决 Dirty Write.
- `read-committed` 可以解决 Dirty Write, Dirty Read.
- `repeatable-read` 可以解决 Dirty Write, Dirty Read, Non-Repeatable Read. MySQL 的 `repeatable-read` 可以解决一定的 Phantom Read, 并通过 Row Lock + Gap Lock + Next-Key Lock 解决 Phantom Read.
- `serializable` 可以解决 Dirty Write, Dirty Read, Non-Repeatable Read, Phantom Read.

查看当前的 Isolation Level.

```sql
select @@transaction_isolation;
```

设置 Session 的 Isolation Level 会在当前 Session 中立即生效. 设置 Global 的 Isolation Level 会在下一次 Session 中生效.

```sql
set session transaction_isolation = 'read-uncommitted';
```

# MVCC

MVCC (Multi Version Concurrency Control) 可以在不加锁的情况下, 采用非堵塞的方式解决读写冲突.

MVCC 主要有 Undo Log 和 Page View 实现的, 通过 Undo Log 构成一个 Version Linked List, 通过 Page View 选择一个 Version 供访问.

MVCC 在 RC 和 RR 中生效, 不在 RU 中生效, 因为 RU 可以读到未提交的事务, 所以直接读取最新版本即可.

当 TRX 来读取数据时, 会生成一个 Page View, 该 Page View 包含了几个属性.

- `creator_trx_id` 记录了 Cur TRX 的 ID, TRX ID 是会自增的, 所以后面的 TRX ID 一定要大于前面的 TRX ID, 这里 `creator_trx_id = 50`.
- `trx_ids` 记录了所有正在活跃的 TRX, 这里 `trx_ids = 20, 30`.
- `min_trx_id` 记录了 `trx_ids` 中最小的 `trx_id`, 这里 `min_trx_id = 20`.
- `max_trx_id` 记录了 `trx_ids` 中最大的 `trx_Id` + 1, 这里 `max_trx_Id = 31`.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241733177.png)

依次遍历 Version Linked List, 根据下面这四步查找规则, 找到一个合适的 Version.

- `trx_id == creator_trx_id`, 表示当前的 Version 就是由 Cur TRX 创建的, 可以访问.
- `trx_id < min_trx_id`, 表示当前 Version 已经提交, 可以访问.
- `trx_id > max_trx_id`, 表示当前 Version 是在当前 Page View 生成之后才开启的, 不能访问, 直接退出, 不需要进行后续的遍历判断了.
- `trx_id not in trx_ids`, 表示当前 Version 已经提交了, 可以访问.

InnoDB 的 RC, 每次执行 `select`, 就会创建一个 Page View, 可以解决 Dirty Read.

- 只有执行了 `select` 才会去创建 Page View，开启 TRX 后不执行 `select` 就会一直不创建 Page View

InnoDB 的 RR, 只有第一次执行 `select`, 才会创建 Page View, 后续执行插入后, 不影响第一次查询的 Page View, 所以不仅可以解决 Dirty Rad, 还可以解决 Non-Repatable 和 Phantom Read.

