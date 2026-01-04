
```
MergeTree 磁盘文件:
├── my_array.size0.bin  (存储数组大小/偏移量)
└── my_array.bin        (存储所有元素的连续数据)

                  ↓ (通过 getter 回调)

DeserializeBinaryBulkSettings.getter
    ├── path = [ArraySizes]    → 返回 my_array.size0.bin 的 ReadBuffer
    └── path = [ArrayElements] → 返回 my_array.bin 的 ReadBuffer

                  ↓

SerializationArray::deserializeBinaryBulkWithMultipleStreams
    1. 读取 offsets (从 ArraySizes 流)
       └── deserializeOffsetsBinaryBulkAndGetNestedOffsetAndLimit()
    
    2. 根据 offsets 计算需要读取多少元素
    
    3. 递归调用 nested->deserializeBinaryBulkWithMultipleStreams
       (从 ArrayElements 流读取实际元素数据)

                  ↓

最终组装成 ColumnArray:
    ├── offsets: [0, 3, 7, 10, ...]  (每个数组的结束位置)
    └── data:    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...]  (所有元素)
```
