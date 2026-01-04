# General Log

查看 General Log 状态.

```sql
show variables like 'general_log%';
```

永久配置 General Log. (file: my.cnf)

```
[mysqld]
general_log=on
general_log_file=/var/lib/mysql/mysql.general.log
```

临时配置 General Log.

```sql
set global general_log = on;
set global general_log_file = '/var/lib/mysql/mysql.general.log';
```

存档 General Log.

```shell
mv mysql.general.log mysql.general.log.old
mysqladmin -uroot -p111 flush-logs
```

# Error Log

查看 Error Log 状态.

```sql
show variables like 'log_err%';
```

永久配置 Error Log. (file: my.cnf)

```
[mysqld]
log-error=/var/log/mysqld.log
```

存档 Error Log.

```shell
mv mysqld.log mysqld.log.old
install -omysql -gmysql -m0644 /dev/null /var/log/mysqld.log
mysqladmin -uroot -p111 flush-logs
```

# Redo Log

Redo Log 和 Undo Log 都是一种恢复操作, 他们回滚数据是逻辑层面的回滚, 而不是物理层面的回滚. 插入一条记录后, 就会记录一条对应的删除操作. 开辟了一个数据页后回滚, 是无法回滚到开辟数据页之前的, 只是通过操作相反的命令达到数据上的统一. 

```txt
start transaction;

select col; -- ''

-- Record col = '' to Undo Log
update col = 'a';
-- Record col = 'a' to Redo Log

-- Record col = 'a' to Undo Log
update col = 'b';
-- Record col = 'b' to Redo Log

-- Flush Disk
commit;
```

InnoDB 采用 WAL (Write-Ahead Logging), 先写日志, 再写硬盘, 只有日志写成功了, 才算事务提交成功. 发生宕机且数据未刷到磁盘时, 就可以根据 Redo Log 恢复数据, 保证了 ACID 的 D.

如果不采用 Redo Log, 为了保证数据安全性, 每次执行 SQL, 就需要进行 Random IO, 将硬盘的数据读取到内存中, 修改完再进行刷盘, 不仅效率低, 丢失数据的风险更高, 而且为了修改一点数据, 就将 Page 来回折腾, 非常不划算.

Redo Log 可以保障一定的安全性, 所以就没有必要实时进行内存到硬盘的刷盘操作, 可以稍微间隔长一点 (eg: 1s 刷盘一次).

Redo Log 占用非常小, 而且是通过 Sequential IO 存储到硬盘上的, 可以说成本非常低.

Redo Log 是在 Storage Engine 层面产生的, Bin Log 是 DB 层面产生的, 两者有着很大的区别 (eg: 插入 100 的过程中, Redo Log 是不断更新的, 等全部加载完, 再一次性写入到 Bin Log 中).

MySQL Server 启动后, 会立即申请一块 Redo Log Buffer, 用来存储 Redo Log, 这块空间被分成若干个连续的 Redo Log Block, 1 个 Block 占 512B.

执行一个修改操作后, 会生成一条 Redo Log 写入到 Redo Log Buffer 中, 记录的是修改后的数值, 当提交后, 就会将 Redo Log Buffer 中的数据追加写入到 OS 的 Page Cache 中, 再进行刷盘, 追加写入到硬盘的 Log File 中.

通过 `innodb_log_buffer_size` 设置 Redo Log Buffer 的大小 (def: 16M).

通过 `innodb_flush_log_at_trx_commit` 设置不同的刷新策略 (def: 1).

- `0`: 提交后, 不会进行任何操作, 等待 Server 自动进行一秒一次自动同步. 将数据存储在 Buffer 中, 依靠自动同步, 风险最高, 但是性能最强.
- `1`: 提交后, 将数据写入到 Page Cache, 再从 Page Cache 写入到硬盘. 直接写会到了硬盘中, 非常安全, 但是性能最差, 默认就是如此.
- `2`: 提交后, 将数据写入到 Page Cache. 将数据写入到 OS 到 Page Cache 中, 一般 OS 宕机的几率是非常低的, 还是蛮安全的, 性能也比较好.

# Undo Log

Undo Log 可用于回滚数据, 可用于 MVCC. 

InnoDB 默认有 2 个提供给 Undo Log 的 Table Space, 共包含 128 个 Rollback Segment, 每个 Rollback Segment 中包含 1024 个 Undo Log Segment.

1 个 Rollback Segment 可能同时服务于 n 个 TRX, 开启 1 个 TRX 后, 就会去制定 1 个 Rollback Segment, 如果 TRX 中的数据被修改了, 原始的数据就会记录到 Rollback Segment 中.

通过 `innodb_undo_directory` 设置 Rollback Segment 的存储位置 (def: ./).

通过 `innodb_undo_tablespaces` 设置 Rollback Segment 的文件数量 (def: 2).

通过 `innodb_rollback_segments` 设置 Rollback Segment 的数量 (def: 128).

InnoDB 的 Record Header 还会有一些隐藏列.

- `DB_TRX_ID`: 每个 TRX 都会自动分配一个 TRX ID.
- `DB_ROLL_PTR`: 指向 Undo Log 的 Pointer.

执行 `insert` 后, 会产生一个 Undo Log, 提交后, 立即删除.

执行 `delete` 和 `update` 后, 会产生一个 Undo Log, 提交后, 放入 Linked List 中, 提供 MVCC 使用, 等待 Purge Thread 删除. Purge Thread 在删除数据时, 只是进行逻辑删除, 将 deletemark 标记为 1, 后续采用覆盖的方式插入数据实现删除.

Undo Log 的存储是离散的, 要回收非常麻烦, 所以 TRX 提交后, 不会立即删除 Undo Log, 而会放入到一个 Linked List 中, 然后判断 Undo Log 所属 Page 的使用空间是否小于 3/4, 如果小于 3/4, 那么它就不会被回收, 其他 TRX 的 Undo Log 会继续使用当前 Page.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241733175.png)

更新 Priamry Key 时, 会将 Old Record 的 deletemark 标识为 1, 再新建一个 New Record, 递增 Undo Log 的 no, 保证回滚时向前可以找到 Undo log.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241733176.png)

# Bin Log

在 TRX 提交之前, 会记录 DDL 和 DML 到 Bin Log 中, 以达到重放 SQL 语句的目的, 主要用于数据库回滚、复制、数据恢复.

Bin Log 可以用于数据恢复, 如果 MySQL Server 挂掉了, 可以通过 Bin Log 查询到用户执行了哪些修改操作, 可以根据 Bin Log 来恢复数据.

Bin Log 可以用于主从复制, Log 具有延续性和时效性, 可以根据 Bin Log 同步 Master 和 Slave 之间的数据.

查看 Bin Log 状态.

```sql
show variables like '%log_bin%';

show binary logs;
```

配置 Bin Log. (file: my.cnf)

```
[mysqld]
log-bin=mysql-bin
binlog_expire_logs_seconds=600
max_binlog_size=100M
```

Bin Log 是一对二进制文件, 所以无法直接查看, 这里通过 `mysqlbinlog` 查看 Bin Log

```shell
mysqlbinlog '/var/lib/mysql/mysql-bin.000004'
```

查看 Bin Log Events.

```sql
show binlog events \G

show binlog events in 'msyql-bin.000004';

-- 从 236 行开始向后查 5 条
show binlog events in 'msyql-bin.000004' from 236 limit 5;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241732538.png)

# Data Recovery

先生成一个新的 Bin Log, 在这个新的 Bin Log 中执行恢复操作.

```sql
flush logs
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241732539.png)

查看之前的 Bin Log Events.

```sql
show binlog events in 'mysql-bin.000007';
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241732540.png)

找到想要恢复的行, 进行恢复.

```shell
/usr/bin/mysqlbinlog --start-position=318 --stop-position=826 --database=db /var/lib/mysql/mysql-bin.000007 | /usr/bin/mysql -uroot -p111 -v db
```

# Delete Bin Log

删除 `mysql-bin.000003` 之前的全部日志.

```sql
purge master logs to 'mysql-bin.000003';
```

删除 2023.12.23 之前的全部日志.

```sql
purge master logs before '20231223';
```

删除所有的日志 !!!

```sql
reset master;
```

# Bin Log Format

Statement Format, 将修改的操作 SQL 记录到 Bin Log 中 (eg: `insert ... select 1, 2, 3` 是记录的 `insert ... select 1, 2, 3`). 记录的内容很短, 占用小, 性能差, 执行时, 还需要进行查询等操作, 会添加更多的 Lock. 执行一些 `UUID()` 等函数时, 会导致同步结果不一致.

Row Format, 将修改的结果 SQL 记录到 Bin Log 中 (eg: `insert ... select 1, 2, 3` 是记录的 `insert 1`, `insert 2`, `insert 3`). 记录的内容多, 占用大, 性能强, 执行时, 直接插入即可, 不需要进行额外的操作.

Mixed Format, 根据操作自动选择 Statement 或 Row, 一般的修改会选择 Statement, 如果遇到一些函数, Statement 无法保证一致性, 就会选择 Row.

查看 Bin Log Format.

```sql
show variables like 'binlog_format';
```