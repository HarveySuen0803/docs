# HDFS

HDFS (Hadoop Distributed File System) 是 Hadoop 的核心组件之一, 设计用于存储大规模数据集, 提供高吞吐量的数据访问, 并且适用于在廉价硬件上运行

- 分布式存储: 可以在多个节点上存储数据
- 容错能力: 可以在不同节点上存储数据的多个副本
- 存储量大: 可以扩展到成百上千个节点, 管理 PB 级别的数据

HDFS 的核心成员

- NameNode: HDFS 的中心服务器, 管理文件系统的命名空间和客户端对文件的访问, 存储整个文件系统的元数据 (eg: 文件目录树, 每个文件的属性和文件数据块的映射信息)
- Secondary NameNode: 帮助维护和管理 NameNode 的元数据, 定期与 NameNode 通信, 下载元数据的编辑日志文件 (edits), 将其与文件系统的映像文件 (fsimage) 合并, 然后再将更新后的映像文件发送回 NameNode, 这个过程有助于减少 NameNode 重启时所需的恢复时间, 并减轻 NameNode 的内存压力
- DataNode: 存储实际数据的节点, 一个 HDFS 集群通常有多个 DataNode, 它们负责处理文件系统客户端的数据读写请求, 并根据 NameNode 的指令存储, 检索和处理数据块
- Block: HDFS 将文件切分成一系列块, 然后分散存储在多个 DataNode 上, 每个块默认大小为 128MB

# Install Hadoop with Manual

下载 Hadoop

```shell
curl -LJO https://archive.apache.org/dist/hadoop/common/hadoop-3.3.1/hadoop-3.3.1-aarch64.tar.gz

tar -zxvf hadoop-3.3.1-aarch64.tar.gz

mv hadoop-3.3.1-aarch64.tar.gz /usr/local/lib/hadoop-3
```

配置 Hadoop Path

```shell
# Java
export JAVA_HOME=/usr/local/lib/oracle-8
export PATH=$PATH:$JAVA_HOME/bin

# Hadoop
export HADOOP_HOME=/usr/local/lib/hadoop-3
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
```

测试 Hadoop

```shell
hadoop version
```

```txt
Hadoop 3.3.1
Source code repository https://github.com/apache/hadoop.git -r 1be78238728da9266a4f88195058f08fd012bf9c
Compiled by ubuntu on 2023-06-18T23:15Z
Compiled on platform linux-aarch_64
Compiled with protoc 3.7.1
From source with checksum 5652179ad55f76cb287d9c633bb53bbd
This command was run using /usr/local/lib/hadoop-3/share/hadoop/common/hadoop-common-3.3.1.jar
```

# Cluster on Single Node

Hadoop 无法使用 root 来操作, 需要创建普通用户来操作

```shell
adduser hadoop
```

Hadoop 要求集群之间的节点可以互相访问, 所以还需要配置 ssh

```shell
ssh-keygen -t rsa
```

```shell
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```

配置核心组件的全局配置参数 (file: etc/hadoop/core-site.xml)

```xml
<configuration>
    <!-- 配置 NameNode 的路径和端口, v1 默认为 9000, v2 默认为 8020, v3 默认为 9820-->
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:9820</value>
    </property>
    <!-- HDFS 运行时的临时文件的存储目录 -->
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/usr/local/lib/hadoop-3/tmp</value>
    </property>
</configuration>
```

配置 HDFS 参数 (file: etc/hadoop/hdfs-site.xml)

```xml
<configuration>
    <!-- 设置数据块的副本数量 -->
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
    <!-- NameNode 守护进程的路径和端口-->
    <property>
        <name>dfs.namenode.http-address</name>
        <value>localhost:9870</value>
    </property>
    <!-- Secondary NameNode 守护进程的路径和端口-->
    <property>
        <name>dfs.namenode.secondary.http-address</name>
        <value>localhost:9868</value>
    </property>
</configuration>
```

配置集群中的工作节点 DataNodes (file: etc/hadoop/workers)

```shell
localhost
```

配置 Hadoop 运行时的环境变量 (file: etc/hadoop/hadoop-env.sh)

```shell
export JAVA_HOME=/usr/local/lib/oracle-8
export HADOOP_HOME=/usr/local/lib/hadoop-3
export HDFS_NAMENODE_USER=hadoop
export HDFS_DATANODE_USER=hadoop
export HDFS_SECONDARYNAMENODE_USER=hadoop
```

格式化文件结构, 执行下面这个格式化命令后, 就会生成 hadoop.tmp.dir 和 logs 目录

- 需要保证 core-site.xml 中配置的 hadoop.tmp.dir 这个目录不存在, 如果存在一定要删掉 !!!

```shell
hdfs namenode -format
```

启动 HDFS 的核心组件 NameNode, Secondary NameNode, DataNodes

```shell
start-dfs.sh
```

通过 jps 查看运行的 Java 程序

```txt
31956 Jps
31829 SecondaryNameNode
31657 DataNode
31514 NameNode
```

访问 `http://127.0.0.1:9870`

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403262311917.png)

# Cluster on Multi Node

在三台机器上启动 Hadoop

```shell
docker network create --subnet=192.168.10.0/24 hadoop-server-network

docker container run \
    --privileged \
    --name hadoop-server-01 \
    --network=hadoop-server-network \
    --ip=192.168.10.11 \
    -e TZ=Asia/Shanghai \
    -it harvey/hadoop-server:1.0 su - hadoop

docker container run \
    --privileged \
    --name hadoop-server-02 \
    --network=hadoop-server-network \
    --ip=192.168.10.12 \
    -e TZ=Asia/Shanghai \
    -it harvey/hadoop-server:1.0 su - hadoop

docker container run \
    --privileged \
    --name hadoop-server-03 \
    --network=hadoop-server-network \
    --ip=192.168.10.13 \
    -e TZ=Asia/Shanghai \
    -it harvey/hadoop-server:1.0 su - hadoop
```

配置 Host (file: /etc/hosts)

```txt
192.168.10.11   hadoop-server-01
192.168.10.12   hadoop-server-02
192.168.10.13   hadoop-server-03
```

Hadoop 要求集群之间的节点可以互相访问, 所以还需要配置 ssh, 公用同一个 Public Key

```shell
ssh-keygen -t rsa
```

```shell
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```

配置核心组件的全局配置参数 (file: etc/hadoop/core-site.xml)

```xml
<configuration>
    <!-- 设置 hadoop-server-01 为 Namenode -->
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://hadoop-server-01:9820</value>
    </property>
    <!-- HDFS 运行时的临时文件的存储目录 -->
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/usr/local/lib/hadoop-3/tmp</value>
    </property>
</configuration>
```

配置 HDFS 参数 (file: etc/hadoop/hdfs-site.xml)

```xml
<configuration>
    <!-- 设置数据块的副本数量 -->
    <property>
        <name>dfs.replication</name>
        <value>3</value>
    </property>
    <!-- 设置 hadoop-server-01 为 Namenode, 并设置守护进程的路径和端口 -->
    <property>
        <name>dfs.namenode.http-address</name>
        <value>hadoop-server-01:9870</value>
    </property>
    <!-- 设置 hadoop-server-02 为 Secondary NameNode, 并设置守护进程的路径和端口 -->
    <property>
        <name>dfs.namenode.secondary.http-address</name>
        <value>hadoop-server-02:9868</value>
    </property>
</configuration>
```

配置集群中的工作节点 DataNodes (file: etc/hadoop/workers)

```txt
hadoop-server-01
hadoop-server-02
hadoop-server-03
```

同步 hadoop-server-01 的配置文件到其他节点上

```txt
[root@hadoop-server-01 /user/local/lib]# scp -r oracle-8 hadoop-server-02:$PWD
[root@hadoop-server-01 /user/local/lib]# scp -r oracle-8 hadoop-server-03:$PWD

[root@hadoop-server-01 /user/local/lib]# scp -r hadoop-3 hadoop-server-02:$PWD
[root@hadoop-server-01 /user/local/lib]# scp -r hadoop-3 hadoop-server-03:$PWD
```

格式化文件结构, 执行下面这个格式化命令后, 就会生成 hadoop.tmp.dir 和 logs 目录

- 需要保证 core-site.xml 中配置的 hadoop.tmp.dir 这个目录不存在, 如果存在一定要删掉 !!!

```shell
hdfs namenode -format
```

启动 HDFS 的核心组件 NameNode, Secondary NameNode, DataNodes

```shell
start-dfs.sh
```

通过 jps 查看运行的 Java 程序

```txt
[hadoop@hadoop-server-01]# jps
3377 NameNode
3522 DataNode
3879 Jps

[hadoop@hadoop-server-02]# jps
1397 Jps
1192 DataNode
1307 SecondaryNameNode

[hadoop@hadoop-server-03]# jps
1523 Jps
1384 DataNode
```

访问 `http://hadoop-server-01:9870`

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403271426391.png)

操作进程的指令

```shell
# 单独启动一个进程
hdfs --daemon start namenode				    # 只开启NameNode
hdfs --daemon start secondarynamenode		# 只开启SecondaryNameNode
hdfs --daemon start datanode				    # 只开启DataNode

# 单独停止一个进程
hdfs --daemon stop namenode					    # 只停止NameNode
hdfs --daemon stop secondarynamenode		# 只停止SecondaryNameNode
hdfs --daemon stop datanode					    # 只停止DataNode

# 启动所有的指定进程
hdfs --workers --daemon start datanode  # 开启所有节点上的DataNode

# 启动所有的指定进程
hdfs --workers --daemon stop datanode		# 停止所有节点上的DataNode
```

# Word Count

上传本地文件夹到 HDFS 中

```shell
mkdir ~/input
echo "hello world i am jack i am harvey" >> ~/input/file1
echo "hello i am harvey i am bruce i am" >> ~/input/file2
echo "hello world am harvey i am jack i" >> ~/input/file3
hdfs dfs -put input/ /
```

调用默认的 WordCount MapReduce 进行字词统计

- 这里的 /input 是 HDFS 上的目录而不是本地的目录, 生成的 /output 不可以事先存在

```shell
hadoop jar $HADOOP_HOME/share/hadoop/mapreduce/hadoop-mapreduce-examples-3.3.1.jar wordcount /input /output
```

查看生成的 output 目录的内容

```shell
hdfs dfs -cat /output/*
```

```txt
am	7
bruce	1
harvey	3
hello	3
i	7
jack	2
world	2
```

# Command

Command

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=19

# Garbage Collection

Garbage Collection

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=29

# Block

Block Info

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=30
- https://www.bilibili.com/video/BV1VQ4y157wK/?p=31
- https://www.bilibili.com/video/BV1VQ4y157wK/?p=32
- https://www.bilibili.com/video/BV1VQ4y157wK/?p=33
- https://www.bilibili.com/video/BV1VQ4y157wK/?p=34

# Architecture

HDFS Architecture

- https://www.bilibili.com/video/BV1VQ4y157wK?p=35

# fsimage

fsimage

- https://www.bilibili.com/video/BV1VQ4y157wK?p=36
- https://www.bilibili.com/video/BV1VQ4y157wK?p=37
- https://www.bilibili.com/video/BV1VQ4y157wK?p=38
- https://www.bilibili.com/video/BV1VQ4y157wK?p=39
- https://www.bilibili.com/video/BV1VQ4y157wK?p=40
- https://www.bilibili.com/video/BV1VQ4y157wK?p=41


# IO

IO

- https://www.bilibili.com/video/BV1VQ4y157wK?p=42

# Java Client SDK

Java Client SDK 

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=44 p44 ~ p50

# fsck

fsck

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=51

# Node

动态添加一个节点

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=52

节点之间数据的负载均衡

- https://www.bilibili.com/video/BV1VQ4y157wK?p=53

动态删除一个节点

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=54

# Disk Balancer

Disk Balancer

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=55

# Distributed Copy

Distributed Copy

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=56

# Archive

Archive

- https://www.bilibili.com/video/BV1VQ4y157wK/?p=57

