# Key

推荐, Key 采用 `service name : data name : identify` 的格式, 可读性强, 也可以避免冲突, 还可以用于 Hash Tag 指定 Slot

推荐, Key 尽量短一点, 缩短几个字符, 在一亿数据量里, 可以节省的内存非常可观

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312301744901.png)

# BigKey

`MEMORY USAGE` 消耗的资源非常多, 所以一般不建议用来查看一个 Key 的空间占用, 可以通过 `STRLEN` 这些命令来查看一个大概的长度

推荐, 单个 Key 小于 10KB, 集合类型的 Key 小于 1000 元素

BigKey 会占用非常多的网络带宽, 会导致数据倾斜, 操作时间也很长长, 导致主线程堵塞

通过 `redis-cli --bigkeys` 分析所有类型的 Key, 查看不同类型中 BigKey 的占用

通过 `scan` 遍历所有的 Key, 通过程序的方式计算 BigKey 的占用

通过 Redis-Rdb-Tools 分析 RDB 文件, 全面分析内存使用情况

通过网络监控工具, 监控 Redis 的网络数据, 超出预警值时主动告警

删除一个 Big String, 可以通过 `UNLINK` 开启一个子线程异步删除

```
UNLINK k1 k2 k3
```

删除集合类型的 Big Key, 可以分成多次, 每一次删除一小部分, 避免一次删太多导致主线程堵塞

```
HSCAN myhash 0 MATCH k* COUNT 1000

# Delete part of data first
HDEL myhash k1 k2 k3
HDEL myhash k4 k5

DEL myhash
```

# MoreKey

Generate test data

```shell
for ((i = 1; i <= 100 * 10000; i++)); do echo "set k$i v$i" >> ./redis-test; done;

redis-cli -h 127.0.0.1 -p 6379 -a 111 config set stop-writes-on-bgsave-error no

cat ./redis-test | redis-cli -h 127.0.0.1 -p 6379 -a 111 --pipe
```

The `scan` command in Redis is used to incrementally iterate over a collection of elements. It operates on the set of keys in the currently selected Redis database

Use `scan` instead of `keys` to find quantitative data and reduce catton

```
# SCAN cursor [MATCH pattern] [COUNT count]
scan 0 match key* count 3

1) "3"
2)  1) key1
    2) key2
    3) key3

scan 3 match key* count 3

1) "6"
2)  1) key4
    2) key5
    3) key6

scan 6 match key* count 3

1) "9"
2)  1) key7
    2) key8
    3) key9
```

# LazyFree

`UNLINK`, `FLUSHALL ASYNC` 和 `FLUSHDB ASYNC` 通过 LazyFree 采用非堵塞的方式删除数据, 只进行逻辑删除, 真正的删除会交给一个子线程进行, 避免对象过大, 造成堵塞

开启 LazyFree, 通过非堵塞的方式删除一个 Key

```shell
lazyfree-lazy-eviction no
lazyfree-lazy-expire no
lazyfree-lazy-server-del yes
replica-lazy-flush yes
lazyfree-lazy-user-del yex
```

# Type

String 没有太多的内存优化, 而且元信息占用的部分也非常多, 所以使用 String 存储非常多又非常小的数据集, 非常浪费空间

Hash 底层会通过 ZipList 存储数据, 可以压缩 Entry, 非常节省内存, 还可以灵活的访问 Entry, 非常 NB

默认一个 Hash 存储的 Entry 超过 500 个, 就不会再使用 Ziplist 存储了, 而是会使用 Hash Table 存储, 就失去了 Ziplist 节省内存的优势

可以修改 Ziplist 的 Entry 上限, 提高一定 Hash 的性能, 但还是要控制在 1000 以内, 避免 BigKey

```shell
hash-max-ziplist-entries 500
```

处理一个 Big Hash 时, 可以将 `id / 100` 作为 Key, `id % 100` 作为 Field, 将 1 个 Hash 存储 10000 个 Entry 拆成了 100 个 Hash 存储 100 个 Entry, 非常好的利用到了 ZipList 的压缩优势

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312301744902.png)

# Batch Operation

如果不采用批处理来处理 100 条命令, 就是需要进行 100 次网络传输, 进行 100 次 IO, 执行 100 条命令. 如果采用批处理, 就只需要进行 1 次网络传输, 进行 1 次 IO, 执行 100 条命令, 大大提高了效率

批处理可以提高效率, 但是得控制一次批处理执行的命令条数, 避免一次占用太多网络带宽, 避免一次执行太多命令, 造成主线程堵塞

Cluster Env 下执行批处理, 一般分为 Serial Slot Operation, Parallel Slot Operation 和 Hash Tag Operation

Serial Slot Operation, 计算每个 Key 的 Hash, 分配到不同的 Slot 中, 每次就通过 Pipeline 的方式操作一个 Slot, 串行执行每一个批处理操作, 需要进行多次网络传输

Parallel Slot Operation, 与 Serial Slot Operatioin 相同, 并行执行每一个批处理操作, 只需要进行 1 次网络传输, 效率非常高

Hash Tag Operation, 所有的 Key 都设置相同的 Hash Tag 全部分配到同一个 Slot 中, 直接操作这一个 Slot 即可, 只需要进行 1 次网络传输, 效率高, 但是容易导致数据倾斜, 不推荐

Jedis 需要手动分配 Slot, 这里计算所有 Entry 的 Hash, 分配到不同的 Slot 中, 每次操作一个 Slot

```java
Map<String, String> map = new HashMap<>();
map.put("name", "harvey");
map.put("age", "18");
map.put("sex", "male");

Map<Integer, List<Map.Entry<String, String>>> slotMap = map
        .entrySet()
        .stream()
        .collect(
            Collectors.groupingBy(
                entry -> ClusterSlotHashUtil.calculateSlot(entry.getKey())
            )
        );

System.out.println(slotMap);

for (List<Map.Entry<String, String>> list : slotMap.values()) {
    String[] arr = new String[list.size() * 2];
    int j = 0;
    for (int i = 0; i < list.size(); i++) {
        j = i << 1;
        arr[j] = list.get(i).getKey();
        arr[j + 1] = list.get(i).getValue();
    }
    jedisCluster.mset(arr);
}
```

RedisTemplate 在集群环境下, 会自动采用 Parallel Slot Operation, 计算所有 Key 的 Hash 分配到不同的 Slot 中, 并且通过异步的方式进行操作, 效率非常高, 非常方便

```java
Map<String, String> map = new HashMap<>();
map.put("name", "harvey");
map.put("age", "18");
map.put("sex", "male");

stringRedisTemplate.opsForValue().multiSet(map);
```

# Deployment

建议, 缓存数据不要做持久化, 最好单独放在一个实例中, 和其他需要进行持久化的实例分开

建议, 一个实例分配 4G ~ 8G 的内存即可, 不要分配太多内存, 可以一台机子部署多个实例, 单个实例的内存小了, 主从同步的速度就能加快, 数据迁移也会方便很多

建议, 将 Redis Service 和 CPU Intensive Service 分开部署 (eg: ElasticSearch), CPU 遭不住

建议, 将 Redis Service 和 Disk Intensive Service 分开部署 (eg: MySQL, MQ), Disk 遭不住

# Slow Query

设置 Slow Query 的阈值 (unit: ms, def: 10000, rec: 1000)

```shell
slowlog-log-slower-than 1000
```

设置 Slow Query Log 的大小, 本质是一个 Queue 的长度 (def: 128, rec: 1000)

```shell
slowlog-max-len 1000
```

查看 Slow Query Log 的长度

```
SLOWLOG LEN
```

查看指定的 Slow Query Log

```
SLOWLOG GET 1
```

重置 Slow Query Log

```
SLOWLOG RESET
```

# Security

强制, Redis 设置密码

强制, 通过 `rename-command` 禁用或者改写危险命令, 只有运维人员知道这条改写后的命令

```shell
rename-command KEYS ""
rename-command FLSUHDB ""
rename-command FLUSHALL ""
rename-command CONFIG 02nf9fsn31nfn0h1nv0093f2hfsvoi20nvskv02
```

强制, 通过 `bind` 限制网络访问, 只允许内网访问

强制, 使用多用户访问, 不允许 ROOT 访问

建议, 不要使用默认的 Port

# Memory Usage

Data Memory, 存储键值信息, 主要问题是由 BigKey 和 Fragment 引起的. BigKey 往往是业务中选择数据类型的不恰到导致的, 需要单独处理. Fragment 是给每个 Key 分配时那些没用得上的部分, 定期重启服务即可解决

Process Memory, Redis 服务本身需要占用的内存, 比较固定, 往往就几兆, 对整个服务影响不大, 可以忽略

Buffer Memory, 主要包括 Client Buffer, AOF Buffer, Replication Buffer, 这部分内存波动非常大, 可能导致内存溢出

- Client Buffer 包括 Input Buffer 和 Output Buffer. Input Buffer 最大 1G, 只要不是大量的 Slow Query, 一般不会有太大影响. Output Buffer 是处理完命令后, 存放返回结果的位置, 可以设置大小
- AOF Buffer 用于 fsync 和 Log Rewriting, 无法设置上限, 因为 AOF 速度非常快, 而且频率很固定, 所以一般不会有大波动
- Replication Buffer 用于 Master-Slave Replication, 如果设置的太小, 会影响性能

```shell
# client-output-buffer-limit <class> <hard limit> <soft limit> <soft seconds>
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
```

查看当前 Client 的信息

```
INFO CLIENTS
```

查看当前 Redis 连接的所有的 Client

```
CLIENT LIST
```

查看内存使用情况

```
INFO MEMORY
MEMORY STATS
```

查看某个 Key 的内存使用情况

```
MEMORY USAGE k1
```

# Cluster Integrity

Redis 默认发现任意一个 Slot 不可用时, 为了保证 Cluster Integrity, 就会停止对外服务

为了保证 High Availablity, 可以关闭这个检查

```shell
cluster-require-full-coverage no
```

# Cluster Bandwidth

Cluster Node 之间需要不断互相 Ping 来确定状态, 每次 Ping 都需要携带各种信息 (eg: Slot 信息, Cluster Node 信息), 当 Cluster 中的 Node 数量庞大时, 这部分的 Bandwidth 开销非常大

Node 的 Subjective Down 时间阈值可以设置在 Ping 的两倍左右, 可以适当提高这个阈值, 降低 Ping 的 Bandwidth 开销

建议, 一个 Cluster 的 Node 控制在 1000 以内, 如果业务非常庞大, 就使用多个 Cluster

# Cluster or Master-Slave

Cluster 需要考虑 Integrity 问题. 需要考虑 Bandwidth 问题. 需要考虑数据倾斜问题. 需要在 Client 中进行 Hash 计算, 分配到指定 Slot 中, 增加了业务的开发的难度, 降低了业务的性能. 需要考虑 Slot 的分配, 所以很难再通过 Lua 来进行原子性操作了

建议, 可以使用 Master-Slave, 就不要使用 Cluster, 大业务可以拆分成多个小业务, 可以通过 Master-Slave 代替 Cluster
