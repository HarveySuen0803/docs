# 分片副本

ClickHouse 常常需要同时满足高可用（High Availability）和水平扩展（Scalability）。为此，ClickHouse 提供了分片（Sharding）+ 副本（Replication） 的架构模式，并通过 ZooKeeper 来协调元数据和复制操作。

- Sharding（分片）：将数据按某种规则（如 user_id 的哈希）拆分到多个节点上，分担读写压力，每一个分片只存储部分数据。
- Replication（副本）：每个分片可以有多个副本（Replica），存储相同的数据。

Zookeeper 存储和管理复制所需的元数据：如表的 log、分片信息、增量写入偏移量等。在使用 ReplicatedMergeTree 系列表时，需要 ZooKeeper 来做分布式锁和合并调度。通常需要部署多个 ZooKeeper 实例做集群（如 3 个或 5 个节点），保证自身的高可用。

ReplicatedMergeTree 是基于 MergeTree 但带有副本复制机制的存储引擎：

- ReplicatedMergeTree
- ReplicatedSummingMergeTree
- ReplicatedCollapsingMergeTree

当数据写入到某一个 Replica 时，会将写入操作（block）记录到 ZooKeeper 的队列 (log)，其他 Replica 看到该队列后，拉取相同的写入数据并执行相同的合并，保持数据一致。

Distributed 是逻辑表，不存储实际数据，用于在多台服务器上并行分发查询。在本地节点分发 SQL 请求给远端分片 Replica，然后把结果汇总返回。配合 “集群配置” (clusters.xml) 一起使用，在创建 Distributed 引擎表时，通过 cluster_name 引用集群拓扑。

# 写入数据



# 搭建集群

以下示例演示一个典型的四节点 ClickHouse 集群：

- Shard 1
  - Replica 1：ch_node1
  - Replica 2：ch_node2
- Shard 2
  - Replica 1：ch_node3
  - Replica 2：ch_node4
- Zookeeper
  - Zookeeper 1: zk_node1
  - Zookeeper 2: zk_node2
  - Zookeeper 3: zk_node3

在 /etc/clickhouse-server/config.xml 中配置 ClickHouse 集群信息：

```xml
<yandex>
    ...
    <remote_servers>
        <my_cluster>          <!-- 集群名称 -->
            <shard>           <!-- 第一个分片 -->
                <replica>
                    <host>ch_node1</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>ch_node2</host>
                    <port>9000</port>
                </replica>
            </shard>
            <shard>           <!-- 第二个分片 -->
                <replica>
                    <host>ch_node3</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>ch_node4</host>
                    <port>9000</port>
                </replica>
            </shard>
        </my_cluster>
    </remote_servers>
</yandex>
```

在 /etc/clickhouse-server/config.xml 中配置 Zookeeper 集群信息，用于协调分片、副本、元数据等。

```xml
<yandex>
    <zookeeper>
        <node index="1">
            <host>zk_node1</host>
            <port>2181</port>
        </node>
        <node index="2">
            <host>zk_node1</host>
            <port>2181</port>
        </node>
        <node index="3">
            <host>zk_node1</host>
            <port>2181</port>
        </node>
    </zookeeper>
</yandex>
```

- 这样，每个 ClickHouse 节点加载该配置后，都会知道整个集群拓扑和如何访问 ZooKeeper。

在每一个存储了分片和副本的节点上创建数据表：

```sql
CREATE TABLE orders_local
(
    order_id   UInt64,
    user_id    UInt64,
    amount     Float64,
    created_at DateTime
)
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/orders',   -- ZK 路径: {shard}自动替换成 shard1/shard2
    '{replica}'                            -- ZK 下的副本名: {replica}自动替换成 replicaX
)
ORDER BY (order_id);
```

- ClickHouse 会自动根据 config.xml 中配置的集群信息填充这里的 {shard} 和 {replica}。

在客户端连接的服务节点上创建一个 Distributed 表用于路由请求：

```sql
CREATE TABLE orders_all
AS orders_local
ENGINE = Distributed(
    'my_cluster',        -- 集群名称
    '',                  -- 当前数据库
    'orders_local',      -- 本地表名
    user_id % 4          -- 分片键（基于 user_id % 4）
);
```

- ClickHouse 中没有主从节点的概念，不需要分开处理请求，客户端需要指定连接到某个节点，后续想要在该节点上执行分片副本数据查询，就需要创建一个 Distributed 表用于路由请求。
- user_id % 4 是分片键，决定数据如何分布在集群节点中，后续扩容节点后，需要删除该 Distributed 表，重新创建，并且重新指定分片键。
- Distributed 只存储部分元数据，用于将请求分发到相应的数据节点上，并整合查询后的结果返回给客户端。

查询数据：

```sql
SELECT SUM(amount) FROM orders_all WHERE user_id = 1234;
```

- 查询分发：查询请求会被发送到 orders_all 表（Distributed 引擎），然后 Distributed 引擎会将查询请求分发到Shard 1 和 Shard 2。
- 并行查询：每个分片会并行地查询 orders_local 表（每个分片上有副本，如果某个副本不可用，会切换到其他副本）。
- 合并结果：查询结果会汇总到发起查询的节点，并最终返回给客户端。

写入数据：

```sql
INSERT INTO orders_all (order_id, user_id, amount, created_at)
VALUES 
(1, 1234, 99.99, '2025-02-03 10:00:00'),
(2, 5678, 50.00, '2025-02-03 11:00:00'),
(3, 1234, 150.75, '2025-02-03 12:00:00'),
(4, 8765, 200.10, '2025-02-03 13:00:00');
```

- 查询分发：INSERT 操作会被 Distributed 表路由到正确的分片（如 Shard 1 或 Shard 2），并将数据写入 orders_local 表。
- 数据同步：数据首先写入当前副本（Leader）。然后 ZooKeeper 会确保数据同步到其他副本。

# 查询流程

```
┌──────────────────────────────────────────────────────────────────┐
│  Step 1: Client → Initiator                                      │
│  ─────────────────────────────────────────────────────────────   │
│  Protocol: TCP (Native)                                          │
│  Packet Type: Protocol::Client::Query                           │
│  Payload:                                                        │
│    - query_id: "xxx-yyy-zzz"                                    │
│    - query: "SELECT * FROM distributed_users                    │
│              WHERE user_id IN (100, 101)"                       │
│    - stage: Complete                                            │
│    - settings: {...}                                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 2: Initiator - TCPHandler                                  │
│  ─────────────────────────────────────────────────────────────   │
│  TCPHandler::processQuery() {                                    │
│    readStringBinary(query_id);  // "xxx-yyy-zzz"                │
│    readStringBinary(query);     // "SELECT * FROM distributed..." │
│                                                                  │
│    // 调用 Interpreters::executeQuery                           │
│    executeQuery(query, context, ..., stage);                    │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 3: Initiator - Interpreters::executeQuery                 │
│  ─────────────────────────────────────────────────────────────   │
│  auto ast = parseQuery(query);                                   │
│  // ast->as<ASTSelectQuery>()->table_id = "distributed_users"   │
│                                                                  │
│  auto interpreter = InterpreterSelectQuery(ast, context);        │
│  return interpreter.execute();                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 4: Initiator - InterpreterSelectQuery                      │
│  ─────────────────────────────────────────────────────────────   │
│  InterpreterSelectQuery::execute() {                             │
│    // 获取 Storage                                               │
│    auto storage = DatabaseCatalog::getTable("distributed_users");│
│    // storage 是 StorageDistributed 对象                         │
│                                                                  │
│    // 调用 storage->read()                                       │
│    storage->read(...);                                           │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 5: Initiator - StorageDistributed::read()                 │
│  ─────────────────────────────────────────────────────────────   │
│  StorageDistributed::read(...) {                                 │
│    // 调用 ClusterProxy::executeQuery                            │
│    ClusterProxy::executeQuery(                                   │
│      query_plan,                                                 │
│      header,                                                     │
│      processed_stage,                                            │
│      ...                                                         │
│    );                                                            │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 6: Initiator - ClusterProxy::executeQuery                 │
│  ─────────────────────────────────────────────────────────────   │
│  // 遍历每个 shard                                               │
│  for shard in cluster->getShards():                              │
│    // 重写查询                                                   │
│    shard1_query = "...WHERE user_id IN (100)"  // 100 % 2 = 0   │
│    shard2_query = "...WHERE user_id IN (101)"  // 101 % 2 = 1   │
│                                                                  │
│    // 添加到 remote_shards                                       │
│    remote_shards.push_back({                                     │
│      query: "SELECT * FROM users_local WHERE user_id IN (...)", │
│      pool: connection_pool_to_shard                             │
│    });                                                           │
│                                                                  │
│  // 创建 ReadFromRemote                                          │
│  query_plan.addStep(ReadFromRemote(remote_shards));             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 7: Initiator - 执行 QueryPlan                              │
│  ─────────────────────────────────────────────────────────────   │
│  pipeline = query_plan.buildQueryPipeline();                     │
│  pipeline.execute();                                             │
│  // 触发 RemoteQueryExecutor::sendQuery()                        │
└──────────────────────────────────────────────────────────────────┘
         │                                    │
         │ To Shard 1                         │ To Shard 2
         ▼                                    ▼
┌────────────────────────┐        ┌────────────────────────┐
│ TCP Packet to Shard 1  │        │ TCP Packet to Shard 2  │
│ ─────────────────────  │        │ ─────────────────────  │
│ Type: Query            │        │ Type: Query            │
│ Query:                 │        │ Query:                 │
│  "SELECT *             │        │  "SELECT *             │
│   FROM users_local     │        │   FROM users_local     │
│   WHERE user_id        │        │   WHERE user_id        │
│   IN (100)"            │        │   IN (101)"            │
│ Stage: WithMergeable   │        │ Stage: WithMergeable   │
└────────────────────────┘        └────────────────────────┘
         ↓                                    ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 8: Shard 1 - TCPHandler::processQuery()                   │
│  ─────────────────────────────────────────────────────────────   │
│  readStringBinary(query);                                        │
│  // query = "SELECT * FROM users_local WHERE user_id IN (100)"  │
│                                                                  │
│  // 调用 Interpreters::executeQuery (不是 ClusterProxy!)         │
│  executeQuery(query, context, ..., WithMergeableState);         │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 9: Shard 1 - Interpreters::executeQuery                   │
│  ─────────────────────────────────────────────────────────────   │
│  auto ast = parseQuery(query);                                   │
│  // ast->table_id = "users_local"  ← 本地表！                    │
│                                                                  │
│  auto interpreter = InterpreterSelectQuery(ast, context);        │
│  return interpreter.execute();                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 10: Shard 1 - InterpreterSelectQuery                      │
│  ─────────────────────────────────────────────────────────────   │
│  auto storage = DatabaseCatalog::getTable("users_local");        │
│  // storage 是 StorageReplicatedMergeTree 对象！                 │
│                                                                  │
│  storage->read(...);                                             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 11: Shard 1 - StorageReplicatedMergeTree::read()          │
│  ─────────────────────────────────────────────────────────────   │
│  // 创建 QueryPlan                                               │
│  MergeTreeDataSelectExecutor::read(...) {                        │
│    // 添加 ReadFromMergeTree step                                │
│    query_plan.addStep(ReadFromMergeTree(...));                   │
│  }                                                               │
│                                                                  │
│  // 执行查询，读取本地数据文件                                    │
│  // 找到 user_id = 100 的数据                                    │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    返回数据给 Initiator
```

# QueryProcessingStage 状态机

QueryProcessingStage 状态：

- options.to_stage (Initiator 期望的最终 stage)
- from_stage (Storage 返回的 stage)
- processed_stage (传递给远程 shard 的 stage

first_stage 和 second_stage 执行阶段：

- first_stage: from_stage < WithMergeableState && to_stage >= WithMergeableState，在 remote shard 上执行，包括读取、过滤、JOIN、聚合（部分）。
- second_stage: from_stage <= WithMergeableState && to_stage > WithMergeableState，在 Initiator 上执行，包括合并聚合、ORDER BY、LIMIT、投影。

带聚合的分布式查询：

```
SELECT count(*), sum(value) 
FROM distributed_table 
GROUP BY key

Initiator:
  - to_stage: Complete
  - from_stage: WithMergeableState
  
Remote Shard (每个 shard):
  - to_stage: WithMergeableState (由 Initiator 指定)
  - from_stage: FetchColumns (由 ReplicatedMergeTree 返回)
  
  执行内容：
    1. 从 ReplicatedMergeTree 读取数据 (FetchColumns)
    2. 执行 WHERE、JOIN 等
    3. 执行部分聚合，输出 AggregateFunction 状态
    4. 不执行 ORDER BY、LIMIT（除非优化）
  
  返回给 Initiator：
    - 每个 key 的部分聚合状态 (AggregateFunction 类型)
    
Initiator 处理：
  - 从多个 shard 接收 WithMergeableState 数据
  - 执行 MergeAggregated：
    1. 合并相同 key 的 AggregateFunction 状态
    2. 调用 finalize() 得到最终结果
  - 执行 ORDER BY、LIMIT 等
```

无聚合但有 ORDER BY：

```
SELECT * 
FROM distributed_table 
ORDER BY key 
LIMIT 100

Initiator:
  - to_stage: Complete
  - from_stage: WithMergeableState 或 FetchColumns
  
Remote Shard:
  - to_stage: WithMergeableState
  - from_stage: FetchColumns
  
  执行内容：
    1. 从 ReplicatedMergeTree 读取数据
    2. 执行 WHERE、JOIN 等
    3. 执行本地 ORDER BY
    4. 执行本地 LIMIT 100（预过滤）
  
  返回给 Initiator：
    - 每个 shard 最多 100 行，已排序
    
Initiator 处理：
  - 执行 MergeSorted：归并多个已排序流
  - 应用最终 LIMIT 100
```

optimize_distributed_group_by_sharding_key 优化：

```
SELECT key, count(*) 
FROM distributed_table 
GROUP BY key
-- 当 sharding_key = key 时

Initiator:
  - to_stage: Complete
  - from_stage: WithMergeableStateAfterAggregation 或 Complete
  
Remote Shard:
  - to_stage: WithMergeableStateAfterAggregationAndLimit
  - from_stage: FetchColumns
  
  执行内容：
    1. 读取数据
    2. 执行完整聚合（finalize）
    3. 执行 ORDER BY
    4. 执行 LIMIT
  
  返回给 Initiator：
    - 已完成聚合的最终结果
    
Initiator 处理：
  - 只需要简单合并（UNION ALL）
  - 可能需要再次 ORDER BY 和 LIMIT
```

