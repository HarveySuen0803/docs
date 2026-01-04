# Cluster

Redis Cluster, 多个 Master, 每个 Master 可以挂载多个 Slave, 每个 Master 负责管理部分 Slot 的数据, Master 之间会不断的通过 PING 去检测彼此健康状态, Client 连接任意一个结点, 请求就会被转发到正确的位置

Redis 共有 16384 个 Slot, 通过 Slot 存储数据, 添加结点, 删除结点, 只需要移动 Slot, 而且移动 Slot 是不需要停止服务的. 存储数据时, 会通过 CRC16 Algo 将 Key 转换成一个 Hash, 再对 16384 取模确定具体存储到哪个 Slot 中. 数据跟 Slot 绑定, 而不跟 Node 绑定, 这样即使 Node 宕机了, 也可以转移 Slot 来恢复数据

如果 Key 有 {} 包裹的部分, 就会根据 {} 里的内容计算 Hash. 如果 Key 没有 {}, 就会直接根据 Key 计算 Hash. 所以想要同一批数据存储在同一个 Slot 中, 就可以通过 {} 赋予共同的前缀

Slot 越少, 压缩比率就越高, 请求头就越小, 占用的带宽就越少, 一般不建议 Redis Cluster 超过 1000 个结点, 所以 16384 个 Slot 绝对够用

Client 发送写请求后, 如果 Master 停机, Slave 还来不及进行 Replication, 就会造成数据丢失

# Request Router

在 Redis Cluster 中，数据分布在多个主节点上，客户端通过计算数据的哈希槽来确定数据的存储位置。Redis Cluster 提供了一种智能的请求路由机制，确保客户端能够快速定位到正确的主节点读取数据。

Redis Cluster 的客户端（如 redis-py-cluster、Jedis Cluster、Lettuce 等）会在初次连接时，从集群中获取每个节点负责的哈希槽范围信息，并在客户端缓存这些信息。

- 集群拓扑信息：客户端连接到集群后，会发送 CLUSTER SLOTS 命令，获取每个节点及其对应的哈希槽范围，构建一个哈希槽到节点的映射表。
- 哈希槽查找表：客户端使用这个映射表来直接查找哈希槽对应的节点，从而将请求路由到正确的主节点。

# Moved Redirect

Redis Cluster 的客户端缓存的哈希槽信息可能会过期或不准确（例如，集群发生主从切换或哈希槽重新分配）。为了解决这种问题，Redis Cluster 使用了 MOVED 重定向机制。

- 当客户端发送请求到错误的节点时，该节点会返回一个 MOVED 错误响应，指示客户端正确的节点地址。
- 客户端收到 MOVED 响应后，会更新本地的哈希槽映射表，将请求重定向到正确的主节点。
- 这样，客户端的哈希槽映射表会逐渐趋于最新，以减少路由错误的发生。

# Ack Redirect

在 Redis Cluster 的哈希槽迁移过程中，可能出现临时的数据不一致状态。在这种情况下，Redis Cluster 使用 ASK 重定向机制：

- 当某个哈希槽正在从一个节点迁移到另一个节点时，目标节点会暂时接管该哈希槽的数据请求。
- 如果客户端访问了尚未完成迁移的数据，源节点会返回 ASK 重定向，指示客户端临时访问目标节点。
  - 源节点还认为自己拥有该哈希槽的数据（但正在逐步迁移到目标节点）。
  - 目标节点开始接收这个哈希槽的数据，但还没有完全完成迁移。
- 客户端接收到 ASK 响应后，会向目标节点发送 ASKING 命令，然后再次请求数据。这个过程只在迁移过程中短暂发生，迁移完成后将恢复正常。
- 目标节点接收到 ASKING 命令后，将其标记为临时的、合法的访问请求，并返回数据。客户端成功地访问到数据，避免了因为哈希槽迁移造成的请求失败。
- 如果目标节点发现请求的数据尚未完全迁移到自己，它会充当“代理”的角色，临时向源节点请求该数据，并将数据返回给客户端。
- 由于 ASK 重定向只是临时处理机制，客户端的哈希槽映射表不会因为 ASK 响应而永久更新。完成迁移后，Redis Cluster 会自动触发 MOVED 重定向，让客户端永久更新哈希槽的映射关系。

# Hash Algo

CRC16 Algo 的 source code 在 cluster.c 的 keyHashSlot()

Hashing Algo, hash 按照结点的数量取余, 根据结果存储到对应的结点中, 如果结点数量发生变化, 影响数据的存储

Consistent Hashing Alog, 通过 hash() 控制 Hash 范围, 头尾相连, 构成 Hash Circle, 通过 hash() 计算结点和数据的 Hash, 分布在 Hash Circle 上, 数据沿着顺时针向前寻找到最近的结点, 存储在该结点上. 结点数量发生变化, 只影响一段数据的存储, 但是如果分布不均匀, 数据倾斜, 部分结点的压力会很大

# Deploy Cluster by Manual

set cluster (ip: 192.168.10.11, 192.168.10.12 ...; file: cluster.conf)

```shell
port 6379
bind 0.0.0.0
daemonize yes
protected-mode no
dbfilename dump.rdb

appendonly yes
appendfilename "appendonly.aof"

requirepass 111
masterauth 111

cluster-enabled yes
cluster-config-file cluster.conf
cluster-node-timeout 5000

# if a node fails, the service will still be provided
cluster-require-full-coverage yes

dir /home/harvey/data/redis
logfile "/home/harvey/data/redis/cluster.log"
pidfile /home/harvey/data/redis/cluster.pid
```

startup cluster

```shell
redis-server cluster.conf
```

set master/slave relationship

```shell
redis-cli -a 111 --cluster create --cluster-replicas 1 192.168.10.11:6379 192.168.10.12:6379 192.168.10.13:6379 192.168.10.14:6379 192.168.10.15:6379 192.168.10.16:6379
```

# Deploy Cluster by Docker

set cluster (ip: 192.168.10.11, 192.168.10.12 ...; file: conf/redis.conf)

```shell
port 6379
bind 0.0.0.0
daemonize no
protected-mode no
dbfilename dump.rdb

appendonly yes
appendfilename "appendonly.aof"

requirepass 111
masterauth 111

cluster-enabled yes
cluster-config-file nodes-6379.conf
cluster-node-timeout 5000

# if a node fails, the service will still be provided
cluster-require-full-coverage yes

cluster-announce-ip 127.0.0.1
# cluster-announce-tls-port 6379
cluster-announce-port 6381
cluster-announce-bus-port 6381
```

startup cluster (ip: 192.168.10.11, 192.168.10.12 ...)

```shell
docker container run \
    --name redis-6379 \
    --restart always \
    --privileged \
    --net
    -p 6379:6379 \
    -p 16379:16379 \
    -v redis-config:/etc/redis \
    -v redis-data:/data \
    -v redis-log:/var/log/redis.log \
    -d redis:7.2 \
    --cluster-enabled yes \
    --appendonly yes \
    -d redis:7.2 redis-server /etc/redis/redis.conf
```

set master / slave relationship

```shell
redis-cli -a 111 --cluster create --cluster-replicas 1 192.168.10.11:6379 192.168.10.12:6379 192.168.10.13:6379 192.168.10.14:6379 192.168.10.15:6379 192.168.10.16:6379
```

# SET, GET

login client with route

```shell
redis-cli -h 192.168.10.11 -p 6379 -a 111 -c 
```

set data to specify slot

```
set k1 v1
```

```console
Redirected to slot [12706] located at 192.168.10.14:6379
```

get data from specify slot

```shell
get k1
```

# MSET, MGET

login client with route

```shell
redis-cli -h 192.168.10.11 -p 6379 -a 111 -c 
```

set multi data to the same slot

```
# set k1, k2, k3 to s1 slot
# s1 is an identify, not real slot id
set k1{s1} "v1" k2{s1} "v2" k3{s1} "v3"
```

get multi data from the same slot

```shell
mget k1{s1} k2{s1} k3{s1}
```

# Check Slots Info

```
# get the slot id of k1
cluster keyslot k1

# whether the slot has data
cluster countkeysinslot 449
```

# Check Cluster Info

```shell
redis-cli -a 111 --cluster check 192.168.10.11:6379
```

```console
192.168.10.11:6379 (613cd84b...) -> 0 keys | 4096 slots | 1 slaves.
192.168.10.14:6379 (ed27ec67...) -> 1 keys | 4096 slots | 1 slaves.
192.168.10.17:6379 (2648abe0...) -> 0 keys | 4096 slots | 0 slaves.
192.168.10.12:6379 (b5d2429a...) -> 0 keys | 4096 slots | 1 slaves.
[OK] 1 keys in 4 masters.
0.00 keys per slot on average.
>>> Performing Cluster Check (using node 192.168.10.11:6379)
M: 613cd84b8415e6586619d6dbb2f8945f48c5446a 192.168.10.11:6379
   slots:[1365-5460] (4096 slots) master
   1 additional replica(s)
M: ed27ec6775afe7fed7234b088981829f3a58b861 192.168.10.14:6379
   slots:[12288-16383] (4096 slots) master
   1 additional replica(s)
S: a329b2c6b96285ab533e415e0f5aff2936508eaa 192.168.10.15:6379
   slots: (0 slots) slave
   replicates 613cd84b8415e6586619d6dbb2f8945f48c5446a
S: e1d5165fc37fa7ef1c549e8ba20863bb7914da75 192.168.10.16:6379
   slots: (0 slots) slave
   replicates b5d2429ac39698ce3f2974f1766392f84ab334d4
S: 8a9709c437928ef1c0194afc6affca2b0534542e 192.168.10.13:6379
   slots: (0 slots) slave
   replicates ed27ec6775afe7fed7234b088981829f3a58b861
M: 2648abe0758c058fa0338e587bfa546b17d0e65d 192.168.10.17:6379
   slots:[0-1364],[5461-6826],[10923-12287] (4096 slots) master
M: b5d2429ac39698ce3f2974f1766392f84ab334d4 192.168.10.12:6379
   slots:[6827-10922] (4096 slots) master
   1 additional replica(s)
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```

# Check Cluster Node Info

```
cluster nodes
```

```console
ed27ec6775afe7fed7234b088981829f3a58b861 192.168.10.14:6379@16379 slave 8a9709c437928ef1c0194afc6affca2b0534542e 0 1694059248642 3 connected
a329b2c6b96285ab533e415e0f5aff2936508eaa 192.168.10.15:6379@16379 slave 613cd84b8415e6586619d6dbb2f8945f48c5446a 0 1694059249000 1 connected
e1d5165fc37fa7ef1c549e8ba20863bb7914da75 192.168.10.16:6379@16379 slave b5d2429ac39698ce3f2974f1766392f84ab334d4 0 1694059248544 2 connected
8a9709c437928ef1c0194afc6affca2b0534542e 192.168.10.13:6379@16379 master - 0 1694059248962 3 connected 10923-16383
613cd84b8415e6586619d6dbb2f8945f48c5446a 192.168.10.11:6379@16379 myself,master - 0 1694059247000 1 connected 0-5460
b5d2429ac39698ce3f2974f1766392f84ab334d4 192.168.10.12:6379@16379 master - 0 1694059249000 2 connected 5461-10922
```

# Failover

Redis Cluster 默认支持 Failover, 如果某一个 Master 宕机了, 就会自动将 Slave 转成 Master

如果 Slave 的性能更好, 就可以手动执行 Failover 让其替换 Master. Slave 通知 Master 拒绝所有 Client 的请求, 双方确认 Offset, 同步数据. 同步完毕后, 开始 Failover, Slave 上位, 将自己标识为 Master, 开始处理 Client 的请求

```
CLUSTER FAILOVER

# Omitting consistency check of Offset
CLUSTER FAILOVER FORCE

# Ignore data consistency, replace it directly, very violent
CLUSTER FAILOVER TAKEOVER
```

# Add Master

start a new redis node

```shell
redis-server cluster.conf
```

add node as master

```shell
# add 192.168.10.17:6379 as master, and 192.168.10.11:6379 as introducor
redis-cli -a 111 --cluster add-node 192.168.10.17:6379 192.168.10.11:6379
```

# Distribute Slot

current slots distribution

```console
192.168.10.12:6379 (b5d2429a...) -> 0 keys | 5462 slots | 1 slaves.
192.168.10.11:6379 (613cd84b...) -> 0 keys | 5461 slots | 1 slaves.
192.168.10.14:6379 (ed27ec67...) -> 1 keys | 5461 slots | 1 slaves.
192.168.10.17:6379 (2648abe0...) -> 0 keys | 0 slots | 0 slaves.
```

distribute slots to 192.168.10.17:6379

```shell
redis-cli -a 111 --cluster reshard 192.168.10.11:6379
```

```console
How many slots do you want to move (from 1 to 16384)? 4096
What is the receiving node ID? 2648abe0758c058fa0338e587bfa546b17d0e65d # 192.168.10.17 ID
Please enter all the source node IDs.
  Type 'all' to use all the nodes as source nodes for the hash slots.
  Type 'done' once you entered all the source nodes IDs.
Source node #1: all
Do you want to proceed with the proposed reshard plan (yes/no)? yes
```

current slots distribution

```console
192.168.10.12:6379 (b5d2429a...) -> 0 keys | 4096 slots | 1 slaves.
192.168.10.11:6379 (613cd84b...) -> 0 keys | 4096 slots | 1 slaves.
192.168.10.14:6379 (ed27ec67...) -> 1 keys | 4096 slots | 1 slaves.
192.168.10.17:6379 (2648abe0...) -> 0 keys | 4096 slots | 0 slaves.
```

# Move Slots

current slots distribution

```console
192.168.10.12:6379 (b5d2429a...) -> 0 keys | 4096 slots | 1 slaves.
192.168.10.11:6379 (613cd84b...) -> 0 keys | 4096 slots | 1 slaves.
192.168.10.14:6379 (ed27ec67...) -> 1 keys | 4096 slots | 1 slaves.
192.168.10.17:6379 (2648abe0...) -> 0 keys | 4096 slots | 0 slaves.
```

move all slots from 192.168.10.17:6379 to 192.168.10.11:6379

```shell
redis-cli -a 111 --cluster reshard 192.168.10.11:6379
```

```console
How many slots do you want to move (from 1 to 16384)? 4096
What is the receiving node ID? 613cd84b8415e6586619d6dbb2f8945f48c5446a # 192.168.10.11 ID
Please enter all the source node IDs.
  Type 'all' to use all the nodes as source nodes for the hash slots.
  Type 'done' once you entered all the source nodes IDs.
Source node #1: 2648abe0758c058fa0338e587bfa546b17d0e65d # 192.168.10.17 ID
Source node #1: done
Do you want to proceed with the proposed reshard plan (yes/no)? yes
```

current slots distribution

```console
192.168.10.11:6379 (613cd84b...) -> 0 keys | 8192 slots | 2 slaves.
192.168.10.14:6379 (ed27ec67...) -> 1 keys | 4096 slots | 1 slaves.
192.168.10.12:6379 (b5d2429a...) -> 0 keys | 4096 slots | 1 slaves.
```

# Delete Master

delete slave

```shell
redis-cli -a 111 --cluster del-node 192.168.10.18:6379 ec0476abb48a958a6f188fff9bfeb2349d4d377b
```

move slots to other master

```shell
redis-cli -a 111 --cluster reshard 192.168.10.11:6379
```

delete master

```shell
redis-cli -a 111 --cluster del-node 192.168.10.17:6379 2648abe0758c058fa0338e587bfa546b17d0e65d
```

# Add Slave

start a new redis node

```shell
redis-server cluster.conf
```

add node as slave

```shell
# set 192.168.10.18:6379 slave of 192.168.10.17:6379
redis-cli -a 111 --cluster add-node 192.168.10.18:6379 192.168.10.17:6379 --cluster-slave --cluster-master-id 2648abe0758c058fa0338e587bfa546b17d0e65d
```

# Delete Slave

```shell
redis-cli -a 111 --cluster del-node 192.168.10.18:6379 ec0476abb48a958a6f188fff9bfeb2349d4d377b
```