# Iceberg 基础介绍

Iceberg 是一个开源的、高性能的表格式数据湖存储格式，设计初衷是为了解决 Hive 表格式在大数据环境下的诸多缺陷，如元数据膨胀、不支持 schema 演化、增量查询不便、并发写入困难等问题。

Hive 是最初为 Hadoop 构建的 SQL-on-Hadoop 解析和执行引擎（HiveServer、CLI、Hive Metastore、MapReduce/Tez/Spark 执行后端），Hive 表格式依赖于分区目录 + HDFS 路径结构 + Metastore 中的元数据。

Iceberg 是一种新型的 表格式（Table Format），设计用于支持 ACID、schema 演化、快照、增量等特性。

# Iceberg 文件结构

