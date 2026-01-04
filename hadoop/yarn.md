# Yarn 基本介绍

YARN（Yet Another Resource Negotiator）是 Hadoop 的资源管理系统，是 Hadoop 2.x 开始引入的核心组件。YARN 将资源管理和作业调度/监控分离开来，能够支持多种不同的处理框架（如 MapReduce、Spark、Tez 等），实现了更强的资源利用率与任务灵活性。

# Yarn 系统架构

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250601125248.png)

ResourceManager（RM）资源管理器：全局资源管理器，负责整个集群资源的分配和调度。包含 Scheduler 和 ApplicationManager 两个子组件。

- Scheduler（调度器）：负责根据策略（如容量、队列）分配资源，但不跟踪应用的执行状态。
- ApplicationManager（应用管理器）：负责管理每个应用程序的生命周期，包括接收任务提交、启动 ApplicationMaster 等。

NodeManager（NM）节点管理器：每个计算节点上运行一个 NM，负责向 RM 汇报资源使用情况和心跳信息；管理该节点上的容器（Container）的生命周期；监控容器的资源使用情况（CPU、内存等）。

ApplicationMaster（AM）应用程序主控：每个应用（比如一次 MapReduce 任务）都会有一个自己的 AM。AM 负责与 RM 协商资源；向 NM 请求启动容器；跟踪和管理自身任务的执行情况。

Container（容器）：YARN 中资源分配的最小单位，包括内存、CPU 等资源，应用程序的任务实际在容器中执行。

---

- [Yarn 系统架构介绍](https://www.bilibili.com/video/BV1bJ4m1G7Jr?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=2)

# Yarn 运行流程

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250601140618.png)

1. 客户端提交 Job

- 用户通过命令行或程序提交一个 MapReduce 作业（如：`hadoop jar job.jar ...`）
- 客户端执行以下操作：
  - 生成 JobID
  - 加载配置文件与 InputFormat
  - 通过 `InputFormat.getSplits()` 切分出多个 InputSplits（每个对应一个 MapTask）
  - 将 Job 的 Jar 包、配置文件、切分信息等资源上传到 HDFS 的 `.staging` 目录
  - 向 Yarn 的 ResourceManager 提交作业（SubmitApplication）

2. ResourceManager 启动 ApplicationMaster（AM）

- ResourceManager（RM）根据资源状况，从集群中选择一个合适的 NodeManager（NM）
- 在该 NM 上申请一个 Container 来启动 ApplicationMaster（AM）
- AM 是整个 Job 的调度中心，负责：
  - 划分任务
  - 向 RM 请求资源
  - 启动和监控任务状态
  - 汇报作业完成状态

3. AM 初始化任务

- AM 下载 Job 的 Jar 包和配置
- 使用 `InputFormat.getSplits()` 获取所有 InputSplit，每个 InputSplit 表示一段待处理的 HDFS 数据块
- 为每个 InputSplit 创建一个 MapTask
- AM 向 RM 请求 Container 来执行 MapTasks，优先调度到数据本地（Data Locality）

4. NodeManager 启动 Container 执行 MapTask

- Container 启动后运行 YARN Child 进程
- 每个 MapTask 拿到对应的 InputSplit，使用：
  - `RecordReader` 根据 InputSplit（路径 + offset + length）从 HDFS 拉取数据
  - 调用用户定义的 `Mapper.map()` 方法处理每条记录，生成中间 `<key, value>` 对

- Map 输出经过：
  - 本地 spill（写磁盘）
  - 排序（Sort）
  - 分区（Partitioner） → 每个 ReduceTask 一个分区
  - Combiner（可选）

5. Shuffle 阶段（Reduce 拉取中间结果）

- 当所有 MapTask 完成后，AM 启动 ReduceTask（也是由 RM 分配 Container）
- 每个 ReduceTask：
  - 向所有 MapTask 拉取属于自己分区的中间结果（通过 HTTP）
  - 合并所有来自不同 Map 的中间文件
  - 执行排序、分组、归并

6. ReduceTask 执行聚合计算

- ReduceTask 接收经过排序合并的 `<key, List<value>>`
- 调用用户实现的 `Reducer.reduce()` 方法进行逻辑计算，如统计、聚合、汇总
- 输出结果最终写入 HDFS 的指定输出目录

7. 作业完成与资源回收

- 所有 Map 和 Reduce 任务完成后，AM 向 RM 汇报作业完成
- AM 自身以及所有 Container 被释放，相关元数据清理
- 客户端收到 Job 成功完成的通知

---

- [Yarn 运行流程解析](https://www.bilibili.com/video/BV1VQ4y157wK/?p=64)

# Yarn 高可用

1. 使用 ZooKeeper 进行选主

YARN HA 模式下，多个 ResourceManager 进程通过 ZooKeeper 实现主备选举机制：
•	多个 RM 进程启动后，会尝试在 ZooKeeper 上创建一个临时 znode。
•	成功创建的 RM 成为 Active，其它成为 Standby。
•	如果 Active RM 挂了，ZooKeeper 会自动删除其 znode，剩下的 Standby RM 竞争成为新的 Active。

✅ 举例：

假设有两个 ResourceManager 实例：
•	rm1.hadoop.local
•	rm2.hadoop.local

它们都注册到 ZooKeeper 上的 /yarn-leader-election 节点：
•	rm1 创建成功，成为 Active。
•	后来 rm1 异常宕机，ZooKeeper 删除其 session。
•	rm2 监听到 znode 删除，立即尝试抢占，成为新的 Active RM。

---

2. 状态同步：基于 ZooKeeper + RMStateStore

YARN 使用持久化存储（如 ZooKeeper 或 HDFS）来保存关键状态信息，比如：
•	提交的应用（ApplicationAttempt）
•	Container 的分配信息
•	节点的注册状态等

这些信息通过 RMStateStore 持久化并在 Standby RM 中定期同步。

✅ 举例：
•	用户提交了一个 Spark 应用（App ID: application_1234）。
•	Active RM 将应用信息写入 ZKRMStateStore。
•	Standby RM 监听到 ZooKeeper 中数据变化，将其同步到本地内存。
•	当 Active RM 挂了，Standby RM 恢复为 Active 时，可以无缝恢复 application_1234 的状态。

---

3. Fencing（隔离）机制

为了防止**“脑裂”（Split-Brain）问题**，YARN 使用 Fencing 机制，确保只有一个 RM 能作为 Active 向外提供服务。

Fencing 方式可能包括：
•	使用 ZooKeeper 临时节点的唯一性
•	使用共享存储的文件锁机制
•	使用外部脚本 kill 掉旧的 Active RM 实例

✅ 举例：

如果 rm1 在网络故障后未及时退出 Active 状态，而 rm2 被 ZooKeeper 选为新的 Active，为避免两个 RM 同时服务，rm2 启动时会运行 fencing 脚本来杀死 rm1，或抢占共享锁资源。

---

4. ApplicationMaster 重连机制

当 ResourceManager 切换（Failover）时，运行中的 ApplicationMaster（AM）会自动重连新的 Active RM，重新注册并恢复资源调度。

✅ 举例：
•	ApplicationMaster 发现与 rm1 的心跳失败。
•	它重试后连接到了新的 rm2。
•	rm2 中已经存在该 App 的状态（通过 RMStateStore 同步来的），AM 得以继续工作。

---

- [Yarn 高可用架构](https://www.bilibili.com/video/BV1bJ4m1G7Jr?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=3)

# Yarn 调度策略

- [Yarn 调度策略介绍](https://www.bilibili.com/video/BV1VQ4y157wK/?p=66)
- [添加一个 Scheduler Queue](https://www.bilibili.com/video/BV1VQ4y157wK/?p=67)
- [提交任务到指定的 Scheduler Queue](https://www.bilibili.com/video/BV1VQ4y157wK/?p=68)
- [设置一个默认的 Scheduler Queue](https://www.bilibili.com/video/BV1VQ4y157wK/?p=69)

# Yarn 节点标签

Node Label 允许管理员将集群中的某些节点打上标签，并可以在作业提交时指定使用哪些标签对应的节点，以实现资源隔离、任务分级调度等。

1.	资源隔离：比如把节点分为生产环境节点与测试环境节点。
2.	任务控制：只允许某些用户的作业跑在特定节点上。
3.	多租户调度优化：支持租户层面的资源隔离。

YARN 的 Node Label 分为两种模式：

1.	独占模式（Exclusive）：默认模式。节点被分配给标签后，仅允许绑定此标签的作业运行。
2.	非独占模式（Non-Exclusive）：节点有标签，但仍可为无标签任务分配资源（需要开启非独占策略）。

---

生产和测试的资源隔离：

•	给生产节点打标签 production
•	给测试节点打标签 test
•	生产作业提交到 production 队列，绑定 production 标签
•	测试作业提交到 test 队列，绑定 test 标签

GPU 节点隔离：

•	为有 GPU 的节点打标签 gpu
•	训练模型等作业指定 gpu 标签
•	普通任务不会调度到这些 GPU 节点

---

假设我们有两个标签：production 和 test。

```shell
yarn rmadmin -addToClusterNodeLabels "production,test"
```

我们将 node1 加入 production，node2 加入 test。

```shell
yarn rmadmin -replaceLabelsOnNode "node1.hadoop.local=production"
yarn rmadmin -replaceLabelsOnNode "node2.hadoop.local=test"
```

在 capacity-scheduler.xml 中设置：

```xml
<property>
  <name>yarn.scheduler.capacity.root.queues</name>
  <value>default,production,test</value>
</property>

<property>
  <name>yarn.scheduler.capacity.root.production.label-expression</name>
  <value>production</value>
</property>

<property>
  <name>yarn.scheduler.capacity.root.production.capacity</name>
  <value>50</value>
</property>

<property>
  <name>yarn.scheduler.capacity.root.test.label-expression</name>
  <value>test</value>
</property>

<property>
  <name>yarn.scheduler.capacity.root.test.capacity</name>
  <value>50</value>
</property>
```

- 这样 production 队列的作业只能跑在打了 production 标签的节点上。

在客户端提交作业时指定 Node Label：

```shell
yarn jar myjob.jar -D mapreduce.job.node-label-expression=production
```

或者对于 Spark：

```shell
spark-submit \
  --conf spark.yarn.executor.nodeLabelExpression=production \
  ...
```

---

- [Node Label 介绍](https://www.bilibili.com/video/BV1VQ4y157wK/?p=70)

# Yarn 运维监控

[Yarn 运维监控](https://www.bilibili.com/video/BV1bJ4m1G7Jr?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=5)

# Yarn 参考内容

MapReduce v1.0 时代使用 JobTracker 和 TaskTracker 实现分布式计算

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=59

Yarn (Yet Another Resource Negotiator) 用来协调 Hadoop 上的资源

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=60
- https://www.bilibili.com/video/BV1VQ4y157wK/?p=61
- https://www.bilibili.com/video/BV1VQ4y157wK/?p=62

Yarn Command

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=65

History Log

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=63
