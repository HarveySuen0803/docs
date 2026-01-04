# RabbitMQ Cluster

RabbitMQ Cluster 的任意结点中都存储着其他结点的队列的引用, 随便访问哪个结点, 都可以访问到任意的队列, 如果其中一个结点宕机, 其他结点就无法通过引用访问到该结点, 所以需要搭配 Mirrored Queue 或 Quorum Queue 使用

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401292221261.png)

同步 Erlang Cookie

```shell
sudo scp /opt/rabbitmq/data/.erlang.cookie root@192.168.10.14:/opt/rabbitmq/data/.erlang.cookie
sudo scp /opt/rabbitmq/data/.erlang.cookie root@192.168.10.15:/opt/rabbitmq/data/.erlang.cookie
```

启动 RabbitMQ

```shell
version: '3'
services:
  rabbitmq:
    image: rabbitmq:3.12
    container_name: rabbitmq
    hostname: rabbitmq-node-01
    restart: always
    environment:
      - TZ=Asia/Shanghai
      - RABBITMQ_DEFAULT_USER=harvey
      - RABBITMQ_DEFAULT_PASS=111
      - RABBITMQ_ERLANG_COOKIE=rabbitcookie
    ports:
      - "4369:4369"
      - "5671:5671"
      - "5672:5672"
      - "15671:15671"
      - "15672:15672"
      - "25672:25672"
    extra_hosts:
      - rabbitmq-node-01:192.168.10.11
      - rabbitmq-node-02:192.168.10.12
      - rabbitmq-node-03:192.168.10.13
    volumes:
      - /opt/rabbitmq/data:/var/lib/rabbitmq
      - /opt/rabbitmq/config/rabbit.config:/etc/rabbitmq/rabbit.config
```

```shell
sudo docker-compose up -d
```

向 Cluster 添加 Node (ip: 192.168.10.12, 192.168.10.13)

```shell
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl join_cluster rabbit@rabbitmq-node-01
rabbitmqctl start_app
```

从 Cluster 中移除 Node (ip: 192.168.10.11)

```shell
rabbitmqctl forget_cluster_node rabbit@rabbitmq-node-01
rabbitmqctl forget_cluster_node rabbit@rabbitmq-node-02
```

查看 Cluster Status

```shell
rabbitmqctl cluster_status
```

配置 SpringBoot Profile

```properties
spring.rabbitmq.addresses=192.168.10.11:5672, 192.168.10.12:5672, 192.168.10.13:5672
spring.rabbitmq.username=harvey
spring.rabbitmq.password=111
spring.rabbitmq.virtual-host=/harvey
```

# Mirrored Queue

Mirrored Queue 会在 RabbitMQ Cluster 中的其他结点上真实备份数据, 修改数据后, 也会同步更新消息, 主结点宕机后, 镜像结点就会上位, 类似于 Replication, 极大的提高了 Avaiability

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401292221909.png)

通过 Command 配置 Mirrored Queue

- `"^queue"` 表示以 queue 开头的队列都是 Mirrored Queue, 会进行下面策略的备份
- `"ha-mode": "all"` 表示在所有结点上进行备份
- `"ha-mode": "exactly", "ha-params": 2` 表示除了当前结点外, 再随机在一个结点上备份
- `"ha-sync-mode": "automatic"` 表示自动备份

```shell
# rabbitmqctl set_policy [-p <vhsot>] <name> <pattern> <definition>
rabbitmqctl set_policy -p harvey-vhost queue-mirroring-policy "^queue" '{"ha-mode": "exactly", "ha-params": 2, "ha-sync-mode": "automatic"}'
```

通过 Dashboard 配置 Mirrored Queue

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751678.png)

通过 SpringAMQP 配置 Mirrored Queue

```java
@Bean
public Queue quorumQueue() {
    return QueueBuilder
        .durable("mir.queue")
        .withArgument("x-ha-policy", "all")
        .build();
}
```

# Quorum Queue

Quorum Queue 可以在 v3.8 后代替 Mirrored Queue, 类似于 Mirrored Queue 进行数据备份, Mirroed Queue 无法解决 Server 宕机导致的数据丢失问题, Quorum Queue 采用 Raft Algo 保证 Consistency

配置 Quorum Queue

```java
@Bean
public Queue quorumQueue() {
    return QueueBuilder
        .durable("quorum.queue")
        .quorum()
        .build();
}
```