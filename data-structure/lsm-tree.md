### LSM Tree 介绍

LSM-Tree（Log-Structured Merge Tree） 是一种面向写优化的存储结构，用于高效管理大规模的键值数据。

### LSM Tree 结构

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411162050840.png)

MemTable 是 LSM-Tree 的核心内存组件，用于接收所有写入操作，通常使用有序数据结构（如 SkipList, RedBlackTree）存储数据，确保数据在内存中有序。

写入数据时，会先写入 WAL，再写入内存中的 MemTable，以保证崩溃恢复。当 MemTable 达到容量阈值后，会刷盘生成一个 SST 文件，即一个满的 MemTable 对应一个 SST 文件。

我们查询数据时，会先去查询 MemTable，再去查询 SST 文件，由于是 KV 键值对，可以采用覆盖的读取方式，即认定 MemTable 里为最新数据，SST 里为旧数据。写入 SST 采用的是顺序 IO，同时也排好了序，所以访问时不仅仅是顺序 IO，还可以利用二分查找。

每个 SST 文件都是不可变的，同时容量也是有限的，当 MemTable 有写满时，会生成一个新的 SST 文件，放在 Level0 层，读取数据时，也会按照时间戳的顺序读取 SST 文件，保证读取到的是最新文件。

想要实现修改和删除就可以采用覆盖写的方式：

```
插入: ("apple", 1), ("banana", 2), ("cherry", 3)
修改: ("apple", 5), ("banana", 10)
删除: ("cherry", null)
```

### Compaction 介绍

Compaction（压缩操作） 是 LSM-Tree 的核心机制之一，它通过合并、排序和清理数据来优化存储效率和查询性能。类似于 Redis 的 AOF Log Rewriting。

```
Compaction 前：("k1", 10), ("k2", 20), ("k3", 30), ("k1", 100), ("k2", null)

Compaction 后：("k1", 100), ("k2", null), ("k3", 30)
```

由于前台的写只会影响 MemTable，并且 SST 文件是不可变的，所以 Compaction 只需要基于旧的 SST 文件进行压缩生成新的 SST 文件即可，非常巧妙的避免了读写问题，不需要向 Redis 的 RDB 那样采用 Copy-On-Write 的机制去操作。

### Leveled Copaction 介绍

Rocksdb 采用 Leveled Copaction 优化了合并效率。

对 Level0 的多个 SST 文件进行 Compaction 得到一个新的 SST 文件放在 Level1，同时删除掉 Level0 里的 SST 文件。当 Level1 的 SST 文件越来越多时，就会对 Level1 进行 Compaction 得到新的 SST 文件放在 Level2 层，由此构成了一个 Tree。

一般 Memtable 和 Level0 占用 10% 的数据，Level1 ~ LevelN 占用 90% 的数据，最大化的节省存储空间。

RocksDB 会动态调整 Compaction 的资源分配，限制一次 Compaction 的数据量，确保写入放大（Write Amplification）在可控范围内。同时支持多种压缩算法（如 Snappy、LZ4、Zlib），并根据层级动态选择：

- 上层（如 Level 0 和 Level 1）使用轻量压缩算法，减少压缩和解压缩时间。
- 下层（如 Level 2+）使用高压缩率算法，节省存储空间。

RocksDB 支持多线程并行执行 Compaction，不同层级的 Compaction 可以并行进行，同一层级中，非重叠的 SST 文件也可以并行合并。

### SizeTiered Compaction 介绍

Cassandra 采用 SizeTiered Compaction 优化了合并效率。

根据 SST 文件的大小分组，选择大小相近的 SST 文件进行合并，不强制按 key 范围分层，允许 SST 文件之间有重叠。当某一层的 SST 文件数量或大小超过阈值时，挑选大小接近的文件进行合并。

这种方案写入放大（Write Amplification）较低，因为合并的是部分文件，适合写多读少的场景。查询效率较低，特别是范围查询时需要检查多个重叠的 SST 文件。数据存储放大较高，因为多个文件之间可能有冗余数据。

### LevelMax Compaction 介绍

在 LSM-Tree 中，最底层的 SST 文件（通常称为 Lmax 层）不会被进一步降层，因此 RocksDB 的压缩（Compaction）逻辑需要针对最底层采取特殊的处理，以优化存储空间、清理删除标记、以及保证数据一致性。

最底层 SST 文件之间通常 互不重叠，但仍然需要压缩以解决以下问题：

- 删除标记 (Tombstones) 数据清理。
- 合并覆盖（Overwrites）数据，去除冗余。
- 数据整理以优化查询性能。

periodic_compaction_seconds 是一个配置选项，用于控制 RocksDB 的定期压缩（Periodic Compaction）功能。它的作用是确保在配置的时间间隔之后，对 SST 文件进行压缩，即使这些文件未满足其他触发压缩的条件。

### Snapshot 介绍

快照机制（Snapshot），用于在特定时间点生成数据库的静态视图，以便进行一致性读取或备份操作。它允许用户在不影响前台查询和写入的情况下访问某一时刻的数据状态。快照本质上是一个逻辑视图，指向特定时间点的数据库状态。

RocksDB 通过内部的 序列号（Sequence Number）非常巧妙的实现了快照，由于 SST 文件的内容是不会发生变化的，所以我们只需要将 SST 文件作为底表数据，只记录一个序列号，即可完成快照。

### LSM Tree 优化查询

可以为每个 SST 文件生成 最小 key 和 最大 key 的范围，可以在查询时，快速过滤掉不可能包含目标 key 的 SST 文件，从而提升查询效率。这个范围信息存储在 SST 文件的元数据（Metadata）中。

可以为每个 SST 文件生成一个 Bloom Filter，用于优化查询。Bloom Filter 是一种高效的概率性数据结构，可以快速判断某个 key 是否 不在 某个 SST 文件中，从而减少不必要的磁盘 I/O。
