# RDB

RDB 可以用于 Full Persistence, 定时存储 Snapshotting 到硬盘, 在 Redis 启动时, 加载 RDB 文件, 恢复数据. 还可以用于 Master-Slave Replication, Master 将 RDB 文件发送给 Slave, 用于初次全量复制和快速同步

RDB 会在 Redis Server 服务结束前自动执行, 会在达到了保存条件时自动执行, 执行 `FLUSHALL`, `FLUSHDB`, `SHUTDOWN` 时也会触发 RDB, 还可以通过 `SAVE` 和 `BGSAVE` 手动触发

- `SAVE` 是由主线程执行, `BGSAVE` 是由子线程进行, `SAVE` 一定会造成线程堵塞, 生产环境中不要用

Redis 进行 RDB Persistence 时, 会调用 fork() 创建一个子进程, 这个子进程不需要执行 exec(), 而是会直接复制一份父进程的 Page Directory 和 Page Table, 主线程执行完 fork() 就可以继续去处理请求了, 两者相不干扰

如果主线程想要修改数据, 就会采用 Copy-On-Write 的方式, 给内存中的原始 Page 数据加上 ReadOnly Lock, 然后复制一份出来进行修改, 修改完再去修改 Page Table 的指向，指向最新的副本，这也保证了后续可以读取到最新的数据。

在写时复制（Copy-On-Write, COW）机制中，每次复制的并不是整个数据或整个内存，而是具体的 “页面”（通常是 4KB 的内存块），即只有在被访问或修改的页面发生变化时，才会触发对这个页面的复制操作。

- Page Table 中记录了虚拟地址和物理地址的映射, 子进程就可以通过这个 Page Table 去读取数据进行持久化操作了
- Page Directory 是顶层，包含多个 Page Table 的指针


![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401021948769.png)

RDB 文件占用小, 加载速度快, 主线程不需要进行 IO, 性能极强

RDB 执行间隔耗时较长, 两次 RDB 直接的数据有风险, 并且复制, 压缩, IO 都是比较耗时的

RDB 适合做备份, 适合做灾难恢复, 适合数据完整性和一致性要求不高的场景

开启 RDB 的 Auto Snapshotting

```
# After 3600 seconds (an hour) if at least 1 change was performed
# save 3600 1

# After 300 seconds (5 minutes) if at least 100 changes were performed
# save 300 100

# After 60 seconds if at least 10000 changes were performed
# save 60 10000

# Snapshotting can be completely disabled with a single empty string argumen
save "" 
```

配置 RDB

```
# filename
dbfilename dump.rdb

# save path
dir /data/redis/

stop-writes-on-bgsave-error yes

# Compress string objects using LZF when dump .rdb databases
# rdbcompression yes

rdbchecksum yes 
```

手动触发 RDB

```
# save with blocking
SAVE

# save without blocking (recommand)
BGSAVE

# get the timestamp of the last snappshotting
LASTSAVE
```

通过 RDB 文件修复数据

```shell
redis-check-rdb /home/harvey/data/redis/dump.rdb
```

建议, 使用 RDB 做数据备份, RDB 占用非常小, 可以定期在一台压力比较小的 Slave 上手动执行 RDB 进行备份

# AOF

AOF (Append Only File) 会去追加写入所有的修改命令到 AOF 文件中, 类似于 MySQL 的 Redo Log, 在 Redis 重启时, 可以使用这些命令来重构数据

AOF 丢失数据的风险会小很多, 并且通过追加的方式写入, 不存在 Path-Seeking 问题

- 寻路问题通常是指数据文件在读取时，需要寻找某个特定数据的位置，从而涉及到复杂的索引结构或多次磁盘跳转。传统数据库可能需要索引树或复杂的数据结构来记录数据的存储位置，以便在查询时快速定位数据。
- AOF 则采用简单的日志记录方式，将每个操作按顺序记录下来，读取时也按顺序回放，完全不需要在文件中跳转到特定位置，消除了磁盘寻道的开销。

AOF 记录的命令多, 占用更大, 恢复也需要一条一条的执行, 恢复很慢, 占用的 CPU 资源也相当多

开启 AOF

```shell
appendonly yes
```

配置 AOF

```shell
appendfilename "appendonly.aof"
appenddirname "appendonlydir"
```

Redis 将写入操作追加到 AOF Buffer 中, 再自动将数据写入到 OS 的 Page Cache 中, 接着执行 fsync() 将 Page Cache 中的数据立刻刷入 (flush) 到 Disk。主线程执行完命令，会去判断上一次 fsync() 的耗时，如果超过 2s, 主线程就会进入堵塞, 等待 fsync 结束, 因为刷盘出了问题, 必须要保证数据的安全

配置 AOF 的写入策略

- `everysec` 的策略, 每隔 1s 将 Page Cache 中的数据刷盘到 Disk 中, 最多丢失 1s 内的数据, 性能也适中, 而且 OS 也不太容易崩溃, 所以一般建议使用这个
- `always` 是每次写入操作都会立即刷盘到 Disk 中, 性能差, 安全性强
- `no` 是每次写入操作, 只会将数据写入到 Page Cache 中, 后续 Redis 就不管了, 由 OS 决定何时进行刷盘, 性能强, 安全性差.

```shell
# appendfsync always
# appendfsync no
appendfsync everysec
```

修复 AOF 文件

```shell
redis-check-aof --fix /home/harvey/data/redis/appendonlydir/appendonly.aof.1.incr.aof
```

建议, 关闭 RDB Persitence, 开启 AOF Persistence, 因为 RDB 的刷盘频率太低, 不适合做 Persitence

# Mixed

如果 AOF 存在, 加载 AOF file, 如果 AOF 不存在, 加载 RDB file

```shell
aof-use-rdb-preamble yes
```

# Log Rewriting

追加写入修改命令, 会有很多无用的操作 (eg: `set k1 v1`, `set k1 v2`, `set k1 v3 ` 这几条命令就等价于 `set k1 v3`), 所以很有必要定期对 AOF 文件进行重写, 这就是 Log Rewriting

开启 Auto Rewriting 后, 子线程会去读取 Old AOF File, 然后分析命令, 压缩命令, 写入到 New AOF File 中. 主线程一直累积命令在 AOF Buffer 中. 当子线程完成 Log Rewriting 后, 会发送一个信号给主线程, 主线程再将缓存中的累积的命令追加写入到 New AOF File 中, 再通过 New AOF File 代替 Old AOF File

- 如果替换过程中如果发生了故障, Redis 依然可以通过 Old AOF File 来恢复数据, 这就是为什么在重写过程中 Old AOF File 一直要保持可用状态

开启 Auto Log Rewriting

```shell
# Redis is able to automatically rewrite the log file implicitly calling
# BGREWRITEAOF when the AOF log size grows by the specified percentage
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

手动执行 Log Rewriting

```shell
BGREWRITEAOF
```

在 Log Rewriting 期间, 进行 AOF, 就有可能因为 AOF 导致主线程堵塞, 可以禁止在 Log Rewriting 期间进行 AOF

```shell
no-appendfsync-on-rewrite yes
```

建议, 设置一个合理的 Log Rewriting 阈值, 避免频繁的 Log Rewriting, 太占用资源了

建议, 预留足够的空间处理 Fork 和 Log Rewring