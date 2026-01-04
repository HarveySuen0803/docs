# Distributed Replication Bus

MySQL 数据复制总线是一个实时数据复制框架，用于在不同的 MySOL 数据库实例间进行异构数据复制。其核心部分由三部分组成：生产者、复制管道、消费者。

区别于 MySQL 自带的主从复制同步方案，这套复制总线的方案更加灵活，不单单可以进行主从复制，还可以进行更多定制化的同步，例如，同步 node1 节点的 t1 表的 f1 字段 到 node2 节点的 t2 表的 f2 字段。

在这个复制总线中，Replicator 负责从 Metadata Server 中读取元数据（例如，BinLog），然后发送 Bin Log 给下游节点进行同步。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412301705671.png)

这里的 Replicator 就是复制总线中最重要的一环，下面这里介绍了如何使用 Zookeeper 构建一套集群保证 Replicator 的高可用。集群中的节点分为 RUNNING 和 STANDBY 两种状态，一环扣一环，非常精巧。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412301717244.png)

- [Replicatioon Bus Structure p86 ~ p87](https://www.bilibili.com/video/BV1b34y1H7YJ?vd_source=2b0f5d4521fd544614edfc30d4ab38e1&spm_id_from=333.788.player.switch&p=86)



