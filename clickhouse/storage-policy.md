# 存储概念

```cpp
Storage Policy（存储策略）
    └── Volume（卷，逻辑概念）
        └── Disk（磁盘，物理概念）
            └── Storage Medium（存储介质，物理设备）
```

- Volume（卷）：一个逻辑概念，可以包含一个或多个 Disk，用于组织存储策略。
- Disk（磁盘）：一个物理概念，对应实际的存储介质，是数据实际存储的地方。

# 存储配置

```xml
<storage_configuration>
    <!-- 1. 定义磁盘 -->
    <!-- 1.1 SSD 磁盘 -->
    <disk>
        <name>ssd_disk1</name>
        <type>local</type>
        <path>/ssd1/clickhouse</path>
    </disk>
    
    <disk>
        <name>ssd_disk2</name>
        <type>local</type>
        <path>/ssd2/clickhouse</path>
    </disk>
    
    <!-- 1.2 HDD 磁盘 -->
    <disk>
        <name>hdd_disk1</name>
        <type>local</type>
        <path>/hdd1/clickhouse</path>
    </disk>
    
    <disk>
        <name>hdd_disk2</name>
        <type>local</type>
        <path>/hdd2/clickhouse</path>
    </disk>
    
    <!-- 1.3 对象存储 -->
    <disk>
        <name>s3_disk</name>
        <type>s3</type>
        <endpoint>https://s3.amazonaws.com/</endpoint>
        <bucket>my-bucket</bucket>
        <access_key_id>your_access_key</access_key_id>
        <secret_access_key>your_secret_key</secret_access_key>
    </disk>
    
    <!-- 2. 定义存储策略 -->
    <policies>
        <policy>
            <name>tiered_storage</name>
            <volumes>
                <!-- 2.1 热数据卷（SSD） -->
                <volume>
                    <name>hot</name>
                    <disk>ssd_disk1</disk>
                    <disk>ssd_disk2</disk>
                </volume>
                
                <!-- 2.2 温数据卷（HDD） -->
                <volume>
                    <name>warm</name>
                    <disk>hdd_disk1</disk>
                    <disk>hdd_disk2</disk>
                </volume>
                
                <!-- 2.3 冷数据卷（对象存储） -->
                <volume>
                    <name>cold</name>
                    <disk>s3_disk</disk>
                </volume>
            </volumes>
        </policy>
    </policies>
</storage_configuration>
```

# 存储示例

准备测试数据：

```sql
CREATE TABLE user_actions
(
    user_id UInt32,
    action_time DateTime,
    action_type String,
    details String,
    status UInt8
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(action_time)
ORDER BY (user_id, action_time)
TTL 
    -- 1个月后移动到温数据卷
    action_time + INTERVAL 1 MONTH TO VOLUME 'warm',
    -- 6个月后移动到冷数据卷
    action_time + INTERVAL 6 MONTH TO VOLUME 'cold',
    -- 1年后删除
    action_time + INTERVAL 1 YEAR TO DELETE
SETTINGS storage_policy = 'tiered_storage';
```

```sql
INSERT INTO user_actions VALUES
    (1, '2023-01-01 10:00:00', 'login', 'success', 1),
    (2, '2023-01-01 11:00:00', 'purchase', 'completed', 1),
    (3, '2023-01-01 12:00:00', 'logout', 'success', 1);
```

数据移动过程：

```
数据写入：2023-07-01 的数据 -> 写入 hot 卷（ssd_disk1 或 ssd_disk2）

数据老化：2023-06-01 的数据 -> 从 hot 卷移动到 warm 卷（hdd_disk1 或 hdd_disk2）

数据归档：2022-12-31 的数据 -> 从 warm 卷移动到 cold 卷（s3_disk）

数据删除：2022-06-30 的数据 -> 从 cold 卷删除
```

物理存储结构：

```
/ssd1/clickhouse/
    └── user_actions/
        ├── 202307_1_1_0/           # 分区目录
        │   ├── checksums.txt       # 校验和文件
        │   ├── columns.txt         # 列信息
        │   ├── count.txt           # 行数
        │   ├── primary.idx         # 主键索引
        │   ├── user_id.bin         # 列数据
        │   ├── user_id.mrk2        # 列标记
        │   └── ...                 # 其他列文件
        └── 202307_2_2_0/           # 另一个分区目录
            └── ...

/hdd1/clickhouse/
    └── user_actions/
        ├── 202306_1_1_0/           # 较旧的分区
        └── ...

s3://my-bucket/clickhouse/
    └── user_actions/
        ├── 202212_1_1_0/           # 归档的分区
        └── ...
```

逻辑存储结构：

```
Storage Policy: tiered_storage
    └── Volume: hot
        └── Disk: ssd_disk1
            └── 最新数据
        └── Disk: ssd_disk2
            └── 最新数据
    └── Volume: warm
        └── Disk: hdd_disk1
            └── 较旧数据
        └── Disk: hdd_disk2
            └── 较旧数据
    └── Volume: cold
        └── Disk: s3_disk
            └── 归档数据
```