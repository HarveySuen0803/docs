### CAP 介绍

CAP: Consistency, Availability, Partition 同时只能满足两个, 结点之间形成分区后, 要么拒绝请求, 保证 Consistency, 放弃 Availability, 要么依旧提供服务, 保证 Availability, 放弃 Consistency

下面的 node_1, node_2, node_3 发生分区，无法同步数据给 node_3，并且 node_3 的数据版本落后了，如果要保证 AP 就需要 node_3 依旧对外提供落后版本的数据。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202407281408190.png)

下面的 node_1, node_2, node_3 发生分区，无法同步数据给 node_3，并且 node_3 的数据版本落后了，如果要保证 CP 就需要 node_3 对外抛出相应 Error。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202407281411686.png)

### BASE 介绍

BASE: 对 CAP 的一种解决方案, 结点之间形成分区后, 允许 Partial Availability, 要求 Core Availability, 允许 Temporary Incosistency, 要求 Eventual Consistency

- AP Mode: Sub Transaction 分别执行 Operation 和 Commit, 允许 Temporary Incosistency, 后续采用 Remedy, 保证 Eventual Consistency (eg: Redis)
- CP mode: Sub Transaction 分别执行 Operation, 相互等待, 放弃 Partial Availability, 保证 Core Availability, 共同执行 Commit (eg: ElasticSearch)
