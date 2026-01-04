# Replication

Replication 可以实现读写分离, 可以用于数据备份, 可以水平扩展, 可以实现高可用, Master 负责写, Slave 负责读, Master 更新数据后, 异步同步数据

Master 可读可写, Slave 只可以读. Slave 默认每 10s 发送一次心跳给 Master. Master 关机后, Slave 不会上位, 等待 Master 开机后, 一切照旧.

Slave 进行同步时, 会携带 Replication Id 和 Offset 请求 Master, Master 会去比较该 Replication Id 是否和自身的相同. 如果不同, 则认为是第一次同步, 会通过 RDB 进行全量同步, 如果相同, 则会进行增量同步

Master 进行全量同步时, 一边通过子线程创建 Snapshotting, 一边累积命令到缓存中. RDB Persistence 结束后, 会发送 Snapshotting 和缓存中的命令给 Slave, 覆盖 Slave 的数据, 实现第一次的全量同步

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312261306562.png)

Offset 会去记录上一次同步的位置, 再次请求时, Master 一看 Replication Id 相同, 就会认为这次是增量同步, 就会将 Replication BackLog 中 Offset 后面的数据同步给 Slave 实现增量同步, 在 Master 宕机恢复后, 这又相当于 Breakpoint Resume

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312261306398.png)

Replication BackLog 本质是一个数组, 也是有空间上限的, 超出上限后, 会去直接覆盖先前的内容. 如果 Slave 断开太久, 导致未备份的数据被覆盖了, 就无法基于 BackLog 进行增量同步, 只能被迫进行低效的全量同步

优化全量同步, 减少一个 Master 连接的 Slave 数量, 可以让 Slave 再去连接多个 Slave, 分摊 Master 压力, 减少单节点的内存占用, 减少 RDB 的 IO 次数

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312261457996.png)

优化全量同步, 提高 Replication BackLog 的大小, 避免全量同步

```shell
repl-backlog-size 1mb
```

优化全量同步, 当网络传输速度非常快时, 可以开启无磁盘复制, Master 直接将需要写入 RDB 文件的内容通过网络传输给 Slave, 不使用磁盘, 避免全量同步

```shell
repl-diskless-sync yes
```

# Replication Deployment

check replication info

```
info replication
```

set master (ip. 192.168.10.11)

```
aemonize yes
# bind 127.0.0.1 -::1
port 6379
dir /home/harvey/data/redis
pidfile /var/run/redis_6379.pid
loglevel notice
logfile "/home/harvey/data/redis/6379.log"
requirepass 111
dbfilename dump6379.rdb
# the lower the number, the higher the priority.
replica-priority 100
```

set slave (ip. 192.168.10.12, 192.168.10.13)

```shell
daemonize yes
# bind 127.0.0.1 -::1
port 6379
dir /home/harvey/data/redis
pidfile /var/run/redis_6379.pid
loglevel notice
logfile "/home/harvey/data/redis/6379.log"
requirepass 111
dbfilename dump6379.rdb

# set master info
replicaof 192.168.10.11 6379
masterauth "111"

# set heartbeat interval
repl-ping-replica-period 10
```

run master

```shell
redis-server redis.conf
```

run slave

```shell
redis-server redis.conf
```

check master log (file. data/redis/6379.log)

```
Synchronization with replication 192.168.10.12:6379 succeede

replication 192.168.10.13:6379 asks for synchronization
Full resync requested by replication 192.168.10.13:6379
Delay next BGSAVE for diskless SYNC
Starting BGSAVE for SYNC with target: replicas sockets
Background RDB transfer started by pid 3188
Fork CoW for RDB: current 0 MB, peak 0 MB, average 0 MB
Diskless rdb transfer, done reading from pipe, 1 replica

Background RDB transfer terminated with success
Streamed RDB transfer with replication 192.168.10.13:6379 su
CONF ACK from replication to enable streaming
Synchronization with replication 192.168.10.13:6379 succeeded
```

check slave log (file. data/redis/6379.log)

```
Connecting to MASTER 192.168.10.11:6379
MASTER <-> replication sync started
Non blocking connect for SYNC fired the event.
Master replied to PING, replication can continue...
Partial resynchronization not possible (no cached maste

Full resync from master: d46c1b534e7e48727aa9982dcbaec7

MASTER <-> replication sync: receiving streamed RDB from ma

MASTER <-> replication sync: Flushing old data
MASTER <-> replication sync: Loading DB in memory
Loading RDB produced by version 7.2.0
RDB age 0 seconds
RDB memory usage when created 0.98 Mb
Done loading RDB, keys loaded: 0, keys expired: 0.
MASTER <-> replication sync: Finished with success
```

check master info

```shell
# replication
role:master
connected_slaves:2
slave0:ip=192.168.10.12,port=6379,state=online,offset=1008,lag=1
slave1:ip=192.168.10.13,port=6379,state=online,offset=1008,lag=1
master_failover_state:no-failover
master_replid:d46c1b534e7e48727aa9982dcbaec7049d28cd13
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:1022
second_repl_offset:-1
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:1
repl_backlog_histlen:1022
```

check slave info
 
```shell
# replication
role:slave
master_host:192.168.10.11
master_port:6379
master_link_status:up
master_last_io_seconds_ago:6
master_sync_in_progress:0
slave_read_repl_offset:1274
slave_repl_offset:1274
slave_priority:100
slave_read_only:1
replica_announced:1
connected_slaves:0
master_failover_state:no-failover
master_replid:d46c1b534e7e48727aa9982dcbaec7049d28cd13
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:1274
second_repl_offset:-1
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:15
repl_backlog_histlen:1260
```

set slaveof by command, take effect for one time

```
slaveof 192.168.10.11 6379

slaveof no one
```
