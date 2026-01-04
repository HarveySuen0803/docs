# Basic

Etcd 是一个遵循 CP 的分布式键值存储系统, 可用于动态共享配置, 服务发现, 负载均衡, 领导者选举, 集中式协调

Etcd 类似于 Redis, 以 Key-Val 的形式存储数据

- Key: Etcd 中的基本单元, 类似于文件系统的文件名, 每个 Key 都可以包含 Sub Key, 构成路径的层次结构
- Val: 可以是任意类型的数据, 一般存储序列化后的数据

Lease 是 Key 的 TTL, 过期后, 会自动被删除

Watch 可以监听 Val 的变化, 当发生变化后, 会触发相应的通知

Etcd 的一致性

- 表层使用事务保证一致性, 底层使用 Raft 保证一致性

Etcd 的可视化操作界面, 可用于学习 Etcd 的增删改查, 节点选举

- http://play.etcd.io/play


# Etcd Server

启动 Etcd Server

```shell
docker image pull gcr.io/etcd-development/etcd:v3.5.13

docker volume create etcd-data

docker netowrk create etcd-network

docker container run \
    --name etcd \
    --privileged \
    --network etcd-network \
    -v etcd-data:/etcd-data \
    -p 2379:2379 \
    -p 2380:2380 \
    -d gcr.io/etcd-development/etcd:v3.5.13 \
        /usr/local/bin/etcd \
        --name s1 \
        --data-dir /etcd-data \
        --advertise-client-urls http://0.0.0.0:2379 \
        --listen-client-urls http://0.0.0.0:2379 \
        --listen-peer-urls http://0.0.0.0:2380 \
        --initial-advertise-peer-urls http://0.0.0.0:2380 \
        --initial-cluster s1=http://0.0.0.0:2380 \
        --initial-cluster-token tkn \
        --initial-cluster-state new \
        --log-level info \
        --logger zap \
        --log-outputs stderr

docker exec etcd /usr/local/bin/etcd --version
docker exec etcd /usr/local/bin/etcdctl version
docker exec etcd /usr/local/bin/etcdutl version
docker exec etcd /usr/local/bin/etcdctl endpoint health
docker exec etcd /usr/local/bin/etcdctl put foo bar
docker exec etcd /usr/local/bin/etcdctl get foo
```

# Gui Client

启动 Etcd Client

```shell
docker image pull tzfun/etcd-workbench:1.1.2

docker container run \
    --name etcd-workbench \
    --network etcd-network \
    --privileged \
    -v etcd-workbench-conf:/usr/tzfun/etcd-workbench \
    -p 2378:8002 \
    -d tzfun/etcd-workbench:1.1.2
```

访问 localhost:2378, 通过 Etcd Client 操作 Etcd Server

- Etcd Server 和 Etcd Client 都是通过 Docker 配置的, 并且使用的同一个 Bridge Network, 所以两个容器访问需要通过 Container Name 作为域名来访问, 无法直接通过 localhost 来访问

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202404251006573.png)

# Java Client

导入 Dependency

```xml
<dependency>
    <groupId>io.etcd</groupId>
    <artifactId>jetcd-core</artifactId>
    <version>0.7.7</version>
</dependency>
```

操作 Etcd Server

```java
Client etcdClient = Client.builder().endpoints("http://127.0.0.1:2379").build();
KV kvClient = etcdClient.getKVClient();
ByteSequence key = ByteSequence.from("k1", StandardCharsets.UTF_8);
ByteSequence val = ByteSequence.from("v1", StandardCharsets.UTF_8);

CompletableFuture<PutResponse> putFuture = kvClient.put(key, val);
PutResponse putResponse = putFuture.get();
System.out.println(putResponse);

CompletableFuture<GetResponse> getFuture = kvClient.get(key);
GetResponse getResponse = getFuture.get();
System.out.println(getResponse);
getResponse.getKvs().forEach(kv -> System.out.println("Value retrieved: " + kv.getValue().toString(StandardCharsets.UTF_8)));

CompletableFuture<DeleteResponse> delFuture = kvClient.delete(key);
DeleteResponse delResponse = delFuture.get();
System.out.println(delResponse);
```



