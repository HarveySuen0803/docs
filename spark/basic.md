# Spark 基本介绍

Apache Spark 是一个开源的、分布式的通用计算框架，用于处理大规模数据处理任务，具备高性能、可扩展、支持多种编程语言和多种数据处理方式的能力。

•	基于内存的分布式计算（比 MapReduce 更快）
•	支持多种语言：Scala、Java、Python、R、SQL
•	通用性强：支持批处理、交互式查询、流处理、机器学习、图计算等
•	与 Hadoop 兼容，可运行在 Hadoop YARN 上、读取 HDFS 文件

# Spark 系统架构

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250603081813.png)

Driver 负责初始化 SparkContext，解析用户逻辑；构建 RDD 依赖图（DAG）；提交 Job，将 Job 拆成多个 Stage，再拆成 TaskSet；跟踪任务状态、收集结果。

SparkContext 是入口对象，连接 Spark 各组件，负责维护应用程序的所有元信息；创建 RDD、广播变量、累加器等；和 Cluster Manager 通信，申请资源；启动 DAG Scheduler。

DAG Scheduler 负责构建逻辑执行图（DAG）→ 拆分为 Stage（物理执行单元）；根据宽依赖和窄依赖拆分多个 Stage，每个 Stage 中的每个 Partition 会生成一个 Task，Stage 之间存在父子依赖关系。

Task Scheduler 负责接收来自 DAG Scheduler 的 TaskSet，为每个 Task 分配合适的 Executor（考虑本地性等）；启动 Task 执行，监听执行结果、失败重试。

Master（Cluster Manager）负责管理 Spark 的资源分配，为 Spark 应用分配 CPU、内存资源，启动 Executor 进程。

Executor 由 SparkContext 请求资源时启动，每个应用独占自己的 Executor，负责执行 Task；缓存中间数据（如 persist 的 RDD）；向 Driver 汇报任务状态；存储并提供 Shuffle 数据给后续 Stage。

---

Stage 是 Spark 中任务调度的逻辑单元，是由 Driver 根据 RDD 的依赖关系（宽依赖 vs 窄依赖）对 Job 拆分形成的。

```python
rdd = sc.textFile("hdfs://file")      # 3个分区
rdd = rdd.map(lambda x: x.split())    # 窄依赖
rdd = rdd.filter(lambda x: len(x) > 3) # 窄依赖
rdd = rdd.reduceByKey(lambda a, b: a + b) # 宽依赖（Shuffle）
rdd = rdd.map(lambda x: (x[0], x[1]*2)) # 窄依赖
rdd.saveAsTextFile("hdfs://out")      # Action
```

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250603085642.png)

Task 是 Spark 中 最小的物理执行单元，由 TaskScheduler 分发到集群中的 Executor 上运行。所有 Task 属于某个 Stage，每个 Task 对应一个数据 Partition 的处理逻辑；不同 Task 执行的代码逻辑是一样的（比如都是对一个 Partition 做 map 或 reduce），但处理的数据不同（分区不同）。

- ResultTask：属于 Result Stage，返回计算结果给 Driver
- ShuffleMapTask：属于 ShuffleMap Stage，输出数据用于下一 Stage 的 Shuffle 拉取

Job, Stage, Task 之间的层级关系：

```
Job
 ├── Stage 0
 │     ├── Task 0：处理 Partition 0
 │     ├── Task 1：处理 Partition 1
 │     └── ...
 ├── Stage 1（由宽依赖生成）
 │     ├── Task 0：处理 Shuffle 分区 0
 │     ├── Task 1：处理 Shuffle 分区 1
 │     └── ...
```

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250603090856.png)

---

Shuffle 分区（Shuffle Partition）是 Spark 在宽依赖操作中对数据进行重新分区的单位，当你执行如 reduceByKey()、groupByKey()、join() 等操作时，Spark 需要将不同 Executor 上的同一 key 的数据拉到一起处理，这就是 Shuffle。

这个过程中，Spark 会：

1. 对 key 进行分区（默认使用 HashPartitioner）；
2. 将不同分区的数据 打散并发送到对应的目标分区（Shuffle 分区）；
3. 每个 Shuffle 分区生成一个 Task（如 Reduce Task）负责处理这部分数据。

下面这段示例中，初始数据有 3 个 Partition（原始 RDD 分区数 = 3），reduceByKey 设置 numPartitions=2 → 所以有 2 个 Shuffle 分区，Spark 会将 (key, 1) 对按照 key 的哈希值分到分区 0 或 1。

```python
rdd = sc.parallelize(["a", "b", "a", "c", "b", "a"], 3)
pairs = rdd.map(lambda x: (x, 1))
result = pairs.reduceByKey(lambda a, b: a + b, numPartitions=2)
```

| key | Hash % 2 | Shuffle Partition |
| --- | -------- | ----------------- |
| "a" | 0        | Partition 0       |
| "b" | 1        | Partition 1       |
| "c" | 0        | Partition 0       |

---

1. Client 提交 Job

- 用户在程序中使用 Spark API（如 rdd.map(...).reduceByKey(...).saveAsTextFile(...)）
- 程序启动一个 SparkContext 实例
- SparkContext 启动 Driver，连接到集群（Standalone / YARN / K8s 等）

2. 构建 RDD DAG（逻辑执行图）

- 所有的 RDD 转换操作（如 map, filter, reduceByKey）都不会立即执行，而是构建成一个有向无环图（DAG）
- 每个 RDD 保存了它的依赖关系（窄依赖或宽依赖）

```python
rdd = sc.textFile("hdfs://...")
rdd1 = rdd.map(...)
rdd2 = rdd1.filter(...)
rdd3 = rdd2.reduceByKey(...)
rdd3.saveAsTextFile("hdfs://output")
```

3. DAGScheduler 拆分 Stage（逻辑 → 物理计划）

- 一旦遇到 Action（如 collect()、saveAsTextFile()），Spark 会开始执行 Job
- DAGScheduler 会根据 RDD 的依赖关系 拆分成多个 Stage：
    - 窄依赖连续的操作 → 合并成一个 Stage
    - 宽依赖处（如 reduceByKey, join） → 生成新的 Stage，划分 Shuffle 边界
- 结果：
    - Job 被拆成一个或多个 Stage
    - 每个 Stage 会生成多个 Task（按分区划分）

4. TaskScheduler 提交 Task 到 Executor

- 每个 Stage 内的每个 Partition 对应一个 Task（物理执行单元）
- TaskScheduler 负责将 Task 调度到 Executor 上执行
- 若 Task 属于 Result Stage → 生成 ResultTask；若 Task 属于 ShuffleMap Stage → 生成 ShuffleMapTask

5. Executor 执行 Task

- 每个 Executor 在 Worker 节点中运行，从 HDFS / 本地 / Cache 读取分区数据
- 执行 map/filter 等计算逻辑
- 如果是宽依赖，将数据按 key 分区（Shuffle 分区），写入本地磁盘（供下游拉取）
- 如果是 ResultTask，将结果返回 Driver 或写入 HDFS

6. 数据 Shuffle 过程

- 上游 Stage 中每个 Task 将数据按 key 的哈希值写入多个分区（一个 Task 负责多个 Shuffle 文件）
- 下游 Stage 的每个 Task（Reducer）拉取与自己对应分区的数据块（Block）

7. Stage 依赖管理与失败重试

- 每个 Stage 只有它依赖的上游 Stage 成功后，才会执行
- 如果某个 Task 执行失败，TaskScheduler 会重新调度该 Task。
- 如果某个 Stage 多次失败 → 整个 Job 失败。

# Spark 运行示例

```scala
// 分析网站访问日志，找出高频访问的IP地址
val logRDD = sc.textFile("access.log", 4)                   // RDD1: 4个分区
val parsedRDD = logRDD.map(parseLogLine)                    // RDD2: 解析日志
val validRDD = parsedRDD.filter(_.isValid)                  // RDD3: 过滤有效记录
val ipRDD = validRDD.map(log => (log.ip, 1))                // RDD4: 提取IP
val countRDD = ipRDD.reduceByKey(_ + _)                     // RDD5: 聚合计数(宽依赖)
val filteredRDD = countRDD.filter(_._2 > 100)               // RDD6: 过滤高频IP
val sortedRDD = filteredRDD.sortBy(_._2, ascending = false) // RDD7: 排序(宽依赖)
val result = sortedRDD.collect()                            // Action: 收集结果
```

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250801143818.png)

4 个 Task 同时处理 4 个 Partition，其中 RDD1, RDD2, RDD3, RDD4 都是窄依赖，归属同一个 Stage，数据在本地，最终任务处理完后输出到磁盘中。

当发生 Shuffle 时，需要

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250801144248.png)

- reduceByKey 是在 Shuffle 之前，每个 Task 在本地对相同 Key 对数据进行预聚合，再进行 Shuffle，根据 Key 进行 Hash 去摸确定 Partition，此时需要传输的数据量会小很多，再去新的 Partition 中进行最终聚合。
- groupByKey 是先进行 Shuffle，在新的 Partition 上进行最终聚合，传输的数据量会大很多。
- reduceByKey 和 groupByKey 都可以去手动指定 shuffle 后的 Partition 数量。

# Spark on Yarn Cluster 系统架构

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250603093025.png)

Spark on YARN 是 Spark 集成 Hadoop 生态的主流方式，借助 YARN 实现资源统一管理和任务容错调度。在该模式下，Driver 被嵌入在 ApplicationMaster 容器中，Executor 则运行在集群各 NodeManager 上执行 Task。

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250603093150.png)

# Spark on Yarn Client 系统架构

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250603093336.png)


在 Spark on YARN Client 模式下，Driver 程序运行在提交端（Client 机器）上，Executor 和 ApplicationMaster 仍由 YARN 的 ResourceManager 调度并分配至 NodeManager 上运行。

# Spark 参考内容

Spark 介绍

- https://www.bilibili.com/video/BV11A411L7CK/?p=1
- https://www.bilibili.com/video/BV11A411L7CK/?p=2
- https://www.bilibili.com/video/BV11A411L7CK/?p=3