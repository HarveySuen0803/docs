# Replication

Replication 可以让读写分离, Master 负责写, Slave 负责读, 分摊了压力. Slave 就是一个天然的数据备份, 实现了高可用.

Master 更新数据后, 将信息写入 Bin Log. Log Dump Thread 会去读取 Bin Log, 将内容发送给 Slave, 这个过程需要加锁, 因为 Master 也在进行写操作. Slave 的 IO Thread 会去进行解读内容, 并写入 Relay Log. Slave 的 SQL Thread 会去读取 Relay Log 执行 SQL 进行数据同步.

configure mysql-master (ip: 192.168.10.11, file: conf/my.cnf)

```shell
[mysqld]

server-id=101

# enable binary log
log-bin=mysql-bin

# the biggest memory usage
binlog_cache_size=1M

# log format (opt: mixed, statement, row)
binlog_format=mixed

# log expiration time (def: 0)
expire_logs_days=7

read-only=0

# the database to sync (opt)
binlog-do-db=db

# the database not to sync (opt)
binlog-ignore-db=mysql

# skip some error to avoid replication interruption
slave_skip_errors=1062

max_connections=10000

default-time_zone='+8:00'
```

startup mysql-master (ip: 192.168.10.11)

```shell
docker container run \
    --name mysql-master \
    --restart always \
    --privileged \
    -p 3306:3306 \
    -v /home/harvey/mysql/conf:/etc/mysql/conf.d \
    -v /home/harvey/mysql/data:/var/lib/mysql \
    -v /home/harvey/mysql/log:/var/log/mysql \
    -e MYSQL_ROOT_PASSWORD=111 \
    -d mysql:8.1.0
```

create a user for mysql-slave to sync data (ip: 192.168.10.11)

```sql
CREATE USER 'slave'@'%' IDENTIFIED BY '111';
ALTER USER 'slave'@'%' IDENTIFIED WITH mysql_native_password BY '111';
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'slave'@'%';
FLUSH PRIVILEGES;
```

configure mysql-slave (ip: 192.168.10.12, file: conf/my.cnf)

```shell
[mysqld]
server-id=102
log-bin=mysql-bin
binlog_cache_size=1M
binlog_format=mixed
expire_logs_days=7
slave_skip_errors=1062

# relay log
relay_log=mysql-relay-bin

# write replication to binary log
log_slave_updates=1

# read only
read_only=1
```

startup mysql-slave (ip: 192.168.10.12)

```shell
docker container run \
    --name mysql-slave \
    --restart always \
    --privilegedd \
    -p 3306:3306 \
    -v /home/harvey/mysql/conf:/etc/mysql/conf.d \
    -v /home/harvey/mysql/data:/var/lib/mysql \
    -v /home/harvey/mysql/log:/var/log/mysql \
    -e MYSQL_ROOT_PASSWORD=111 \
    -d mysql:8.1.0
```

check mysql-master status (ip: 192.168.10.11)

```sql
show master status;
```

```console
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000001 |      997 |              | mysql            |                   |
+------------------+----------+--------------+------------------+-------------------+
```

change slave's master (ip: 192.168.10.12)

```sql
change master to master_host='192.168.10.11', master_port=3306, master_user='slave', master_password='111', master_log_file='mysql-bin.000001', master_log_pos=997, master_connect_retry=30;
```

start replication (ip: 192.168.10.12)

```sql
start slave
```

check mysql-slave status (ip: 192.168.10.12)

```sql
show slave status\G
```

```
*************************** 1. row ***************************
               Slave_IO_State: Waiting for source to send event
                  Master_Host: sharding-demo-mysql-01
                  Master_User: slave
                  Master_Port: 3306
                Connect_Retry: 30
              Master_Log_File: binlog.000007
          Read_Master_Log_Pos: 157
               Relay_Log_File: 1b22d435fa56-relay-bin.000002
                Relay_Log_Pos: 323
        Relay_Master_Log_File: binlog.000007
             Slave_IO_Running: Yes -- must be yes
            Slave_SQL_Running: Yes -- must be yes
```

# Consistency

Asynchronous Replication 中, Master 执行完修改后, 立即返回结果给 Client, 不会关心 Slave 是否已经接受并处理. 如果 Master 宕机了, 此时 Master 上已经提交的 TRX 可能无法传到 Slave, 强行让 Slave 上位会导致数据不完整.

Semi-synchronous Replication 中, Master 执行完修改后, 会等待至少一个 Slave 收到数据后并写入 Redo Log 后, 然后才会返回结果给 Client. 提高了安全性, 但是会存在一定的延迟.

Group Replication 中, Replication Group 是一组通过消息传递相互交互的 Server Cluster, 当所有的 Server 都是来自于同一个 Group 时, 它们通过分布式状态机自动协调自己. Replication Group 即可以运行在单主模式下, 也可以运行在多主模式下. 在多主模式下, 即使在所有组成员中发起并行更新操作, 这种分布式协调能力, 也可以使得这些并发请求能够正常执行, 而不至于产生数据冲突.