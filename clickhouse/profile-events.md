# ProfileEvents 介绍

ProfileEvents 是 ClickHouse 中的一个性能指标收集系统，用于统计和监控各种操作的性能指标。它类似于计数器，可以记录各种事件的发生次数、耗时等信息。

在 src/Common/ProfileEvents.h 中定义了所有的事件类型：

```cpp
namespace ProfileEvents
{
    // 写入相关事件
    extern const Event MergeTreeDataWriterBlocks;                    // 写入的块数
    extern const Event MergeTreeDataWriterBlocksAlreadySorted;      // 已排序的块数
    extern const Event MergeTreeDataWriterRows;                      // 写入的行数
    extern const Event MergeTreeDataWriterUncompressedBytes;        // 未压缩的字节数
    extern const Event MergeTreeDataWriterCompressedBytes;          // 压缩后的字节数
    extern const Event MergeTreeDataWriterSortingBlocksMicroseconds; // 排序耗时(微秒)
    extern const Event MergeTreeDataWriterMergingBlocksMicroseconds; // 合并耗时(微秒)

    // 查询相关事件
    extern const Event Query;                                        // 查询总数
    extern const Event SelectQuery;                                  // SELECT查询数
    extern const Event InsertQuery;                                  // INSERT查询数
    extern const Event FailedQuery;                                  // 失败的查询数
    extern const Event FailedSelectQuery;                           // 失败的SELECT查询数
    extern const Event FailedInsertQuery;                           // 失败的INSERT查询数

    // 缓存相关事件
    extern const Event CacheHits;                                    // 缓存命中次数
    extern const Event CacheMisses;                                  // 缓存未命中次数
    extern const Event CacheBytesRead;                               // 从缓存读取的字节数
    extern const Event CacheBytesWritten;                            // 写入缓存的字节数

    // 网络相关事件
    extern const Event NetworkSendBytes;                             // 发送的字节数
    extern const Event NetworkReceiveBytes;                          // 接收的字节数
    extern const Event NetworkSendElapsedMicroseconds;               // 发送耗时(微秒)
    extern const Event NetworkReceiveElapsedMicroseconds;            // 接收耗时(微秒)

    // 磁盘相关事件
    extern const Event DiskReadElapsedMicroseconds;                  // 磁盘读取耗时(微秒)
    extern const Event DiskWriteElapsedMicroseconds;                 // 磁盘写入耗时(微秒)
    extern const Event DiskReadBytes;                                // 磁盘读取字节数
    extern const Event DiskWriteBytes;                               // 磁盘写入字节数
}
```

# ProfileEvents 使用

在代码中使用 ProfileEvents：

```cpp
// 1. 简单计数
ProfileEvents::increment(ProfileEvents::Query);  // 增加查询计数

// 2. 带值的计数
ProfileEvents::increment(ProfileEvents::MergeTreeDataWriterRows, block.rows());  // 增加写入的行数

// 3. 使用 RAII 方式记录耗时
{
    ProfileEventTimeIncrement<Microseconds> watch(ProfileEvents::MergeTreeDataWriterSortingBlocksMicroseconds);
    // 执行需要计时的操作
    sortBlock(block);
} // 自动记录耗时
```

以 writeTempPartImpl 为例，展示如何使用 ProfileEvents 收集性能指标：

```cpp
MergeTreeDataWriter::TemporaryPart MergeTreeDataWriter::writeTempPartImpl(
    BlockWithPartition & block_with_partition,
    const StorageMetadataPtr & metadata_snapshot,
    ContextPtr context,
    int64_t block_number,
    bool need_tmp_prefix)
{
    // 1. 记录写入的块数
    ProfileEvents::increment(ProfileEvents::MergeTreeDataWriterBlocks);

    // ...

    // 2. 记录排序耗时
    {
        ProfileEventTimeIncrement<Microseconds> watch(ProfileEvents::MergeTreeDataWriterSortingBlocksMicroseconds);
        if (!isAlreadySorted(block, sort_description)) {
            stableGetPermutation(block, sort_description, perm);
            perm_ptr = &perm;
        } else {
            // 3. 记录已排序的块数
            ProfileEvents::increment(ProfileEvents::MergeTreeDataWriterBlocksAlreadySorted);
        }
    }

    // ...

    // 4. 记录合并耗时
    {
        ProfileEventTimeIncrement<Microseconds> watch(ProfileEvents::MergeTreeDataWriterMergingBlocksMicroseconds);
        block = mergeBlock(std::move(block), sort_description, partition_key_columns, perm_ptr, data.merging_params);
    }

    // ...

    // 5. 记录写入的行数和字节数
    ProfileEvents::increment(ProfileEvents::MergeTreeDataWriterRows, block.rows());
    ProfileEvents::increment(ProfileEvents::MergeTreeDataWriterUncompressedBytes, block.bytes());
    ProfileEvents::increment(ProfileEvents::MergeTreeDataWriterCompressedBytes, new_data_part->getBytesOnDisk());
}
```

# ProfileEvents 查询

通过 SQL 查询：

```sql
-- 查看所有事件计数
SELECT * FROM system.events;

-- 查看特定事件
SELECT event, value 
FROM system.events 
WHERE event LIKE '%MergeTreeDataWriter%';

-- 查看写入相关的统计
SELECT 
    event,
    value,
    description
FROM system.events
WHERE event IN (
    'MergeTreeDataWriterBlocks',
    'MergeTreeDataWriterRows',
    'MergeTreeDataWriterUncompressedBytes',
    'MergeTreeDataWriterCompressedBytes'
);
```

示例：查询 INSERT 操作后的统计数据。

```sql
SELECT event, value 
FROM system.events 
WHERE event LIKE '%MergeTreeDataWriter%';
```

```
event                                           value
MergeTreeDataWriterBlocks                       1
MergeTreeDataWriterBlocksAlreadySorted          0
MergeTreeDataWriterRows                         1000
MergeTreeDataWriterUncompressedBytes            50000
MergeTreeDataWriterCompressedBytes              15000
MergeTreeDataWriterSortingBlocksMicroseconds    500
MergeTreeDataWriterMergingBlocksMicroseconds    300
```

示例：分析写入性能。

```sql
SELECT 
    event,
    value,
    round(value / (SELECT value FROM system.events WHERE event = 'MergeTreeDataWriterRows'), 2) as avg_value_per_row
FROM system.events
WHERE event IN (
    'MergeTreeDataWriterUncompressedBytes',
    'MergeTreeDataWriterCompressedBytes',
    'MergeTreeDataWriterSortingBlocksMicroseconds',
    'MergeTreeDataWriterMergingBlocksMicroseconds'
);
```

示例：分析压缩率。

```sql
SELECT 
    round(
        (SELECT value FROM system.events WHERE event = 'MergeTreeDataWriterCompressedBytes') * 100.0 /
        (SELECT value FROM system.events WHERE event = 'MergeTreeDataWriterUncompressedBytes'),
        2
    ) as compression_ratio;
```

示例：分析性能瓶颈。

```sql
SELECT 
    event,
    value,
    round(value * 100.0 / (
        SELECT value 
        FROM system.events 
        WHERE event = 'MergeTreeDataWriterSortingBlocksMicroseconds'
    ) + (
        SELECT value 
        FROM system.events 
        WHERE event = 'MergeTreeDataWriterMergingBlocksMicroseconds'
    ), 2) as percentage
FROM system.events
WHERE event IN (
    'MergeTreeDataWriterSortingBlocksMicroseconds',
    'MergeTreeDataWriterMergingBlocksMicroseconds'
);
```