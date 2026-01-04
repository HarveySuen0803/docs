# MPP 介绍

MPP（Massively Parallel Processing，大规模并行处理）是一种分布式计算架构，通常用于 OLAP（联机分析处理）系统。
它的核心思想是，把数据分片存储到多个节点上，每个节点都有自己的计算资源（CPU、内存、存储），在查询时由多个节点并行计算，最后汇总结果。

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20251009153928.png)

一个典型的 MPP 系统由以下组件组成：

1. Coordinator / Query Planner（协调节点）：接收 SQL 查询，生成执行计划并分发到各个计算节点。
2. Worker / Compute Nodes（计算节点）：存储分片数据，执行分配给自己的计算任务（如过滤、聚合、排序），返回中间或最终结果。
3. Data Exchange 层（数据交换层）：节点之间的通信层，用于分布式 JOIN、聚合结果汇总。
4. 存储层（Storage Layer）：数据分片存储，通常为 列式存储引擎，支持高压缩率和快速扫描。
