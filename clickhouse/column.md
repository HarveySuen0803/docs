# IDataType 工厂设计

IDataType 充当工厂类，负责创建对应的 IColumn 实例：

```cpp
class IDataType
{
public:
    // 核心工厂方法：根据类型创建对应的列
    virtual MutableColumnPtr createColumn() const = 0;
    
    // 获取默认序列化器
    virtual SerializationPtr getDefaultSerialization() const = 0;
    
    // 类型属性查询
    virtual bool isComparable() const = 0;
    virtual bool canBeInsideNullable() const = 0;
};

// 具体实现例子
class DataTypeInt32 : public IDataType
{
public:
    MutableColumnPtr createColumn() const override
    {
        return ColumnInt32::create();  // 创建 Int32 列
    }
};

class DataTypeArray : public IDataType  
{
public:
    MutableColumnPtr createColumn() const override
    {
        return ColumnArray::create(
            nested->createColumn(),           // 创建嵌套元素列
            ColumnArray::ColumnOffsets::create()  // 创建偏移量列
        );
    }
};
```

类型安全保证：

```cpp
// 类型检查和验证
bool isCompatible(const DataTypePtr & type, const ColumnPtr & column)
{
    // 检查列是否与类型匹配
    return type->getName() == column->getName();
}

// 类型转换
Field convertValue(const Field & value, const DataTypePtr & target_type)
{
    return convertFieldToType(value, *target_type);
}
```

# Field 设计

Field 是 ClickHouse 中表示单个值的通用容器，相当于一个类型安全的 variant：

```cpp
class Field
{
    enum Which
    {
        Null = 0, UInt64 = 1, Int64 = 2, Float64 = 3,
        String = 16, Array = 17, Tuple = 18, Map = 26,
        // ...
    };
};

Field field1 = Int64(42);
Field field2 = String("hello");
Field field3 = Array{1, 2, 3};
```

# Column 设计

Column 表示一列数据，Field 可以理解为是这一列数据的某一个行数据：

```cpp
// Field → Column (插入单个值到列)
auto column = ColumnInt64::create();
Field field = Int64(42);
column->insert(field);  // 将 Field 插入到 Column

// Column → Field (从列中提取单个值)
Field extracted = (*column)[0];  // 从列的第0行提取值
```

```cpp
// 插入多个 Field 到数组列
auto array_column = ColumnArray::create(ColumnInt32::create());

// 插入第一个数组 [1, 2, 3]
Array array1{Field(1), Field(2), Field(3)};
array_column->insert(Field(array1));

// 插入第二个数组 [4, 5]
Array array2{Field(4), Field(5)};
array_column->insert(Field(array2));

// 结果：
// array_column 包含两行：[1,2,3] 和 [4,5]
```

```cpp
// 从数据类型获取默认值
auto array_type = std::make_shared<DataTypeArray>(std::make_shared<DataTypeInt32>());
Field default_value = array_type->getDefault();  // 返回 Array{}

// 插入默认值到列
auto column = array_type->createColumn();
column->insert(default_value);  // 插入空数组
```

# Column 数据处理

```cpp
// 1. 定义数组类型 Array(Int32)
auto element_type = std::make_shared<DataTypeInt32>();
auto array_type = std::make_shared<DataTypeArray>(element_type);

// 2. 创建对应的列
auto column = array_type->createColumn();
auto & array_column = assert_cast<ColumnArray &>(*column);

// 3. 准备要插入的 Field 数据
std::vector<Field> arrays = {
    Array{Field(1), Field(2), Field(3)},      // [1,2,3]
    Array{Field(4), Field(5)},                // [4,5]  
    Array{Field(6)}                           // [6]
};

// 4. 插入数据
for (const auto & array_field : arrays)
{
    array_column.insert(array_field);
}

// 5. 验证结果
assert(array_column.size() == 3);                    // 3行数组
assert(array_column.getData().size() == 6);          // 总共6个元素
assert(array_column.getOffsets() == Offsets{3, 5, 6}); // 偏移量

// 6. 提取数据
Field first_array = array_column[0];                 // 获取第一行：[1,2,3]
Field second_array = array_column[1];                // 获取第二行：[4,5]

// 7. 序列化（如果需要）
auto serialization = array_type->getDefaultSerialization();
WriteBufferFromString buffer;
FormatSettings format_settings;
serialization->serializeText(array_column, 0, buffer, format_settings);
// 输出: [1,2,3]
```

# Virtual Column

```
MergeTree Part
├── Granule 0 (index: 0)
│   ├── Row 0    (_part_offset: 0,    _part_granule_offset: 0)
│   ├── Row 1    (_part_offset: 1,    _part_granule_offset: 0)
│   ├── ...
│   └── Row 8191 (_part_offset: 8191, _part_granule_offset: 0)
├── Granule 1 (index: 1)  
│   ├── Row 8192 (_part_offset: 8192, _part_granule_offset: 1)
│   ├── Row 8193 (_part_offset: 8193, _part_granule_offset: 1)
│   ├── ...
│   └── Row 16383(_part_offset: 16383,_part_granule_offset: 1)
└── Granule 2 (index: 2)
    ├── Row 16384(_part_offset: 16384,_part_granule_offset: 2)
    ├── ...
    └── Row 22383(_part_offset: 22383,_part_granule_offset: 2)
```

`_part_offset` 表示当前行在整个 part 中的全局偏移位置（从0开始计数），提供行在 part 内的绝对位置信息，用于行级别的精确定位和去重。

```
当前 part 包含 3 个 granule：
- Granule 0: 8192行 (offset: 0-8191)
- Granule 1: 8192行 (offset: 8192-16383)  
- Granule 2: 6000行 (offset: 16384-22383)

name_column: [
    "harvey",
    "jack",
    "rachel",
    "bruce",
    "henry"
]

_part_offset: [
    101,  // "harvey" 所在行 在整个 part 中的 offset 为 101，即第 0 个 granule 中
    1423,
    9042, // "rachel" 所在行 在整个 part 中的 offset 为 9042，即第 1 个 granule 中
    15202,
    21043
]
```

`_part_granule_offset` 表示当前行所属的 granule 在 part 中的索引号（从0开始计数），标识行所属的数据 granule，用于 granule 级别的操作和优化。

```
_part_granule_offset: [
    0, // "harvey" 所在行 在整个 part 中的第 0 个 granule 中
    0,
    1,
    1,
    2  // "henry" 所在行 在整个 part 中的第 2 个 granule 中
]
```

# ColumnDefaultKind

Column Kind 定义：

```cpp
enum Kind : UInt8 {
    None = 0,
    Ordinary = 1,          // Default 列
    Materialized = 2,      // Materialized 列  
    Aliases = 4,           // Alias 列
    Ephemeral = 8,         // Ephemeral 列
    OrdinaryAndAliases = Ordinary | Aliases,
    AllPhysical = Ordinary | Materialized,        // 物理存储的列
    AllPhysicalAndAliases = AllPhysical | Aliases,
    All = AllPhysical | Aliases | Ephemeral,
};
```

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20250916172840.png)

# ColumnArray

```cpp
// 逻辑结构：[[10, 20], [30], [40, 50, 60], [70]]
auto nested_column = ColumnInt32::create();
auto & nested_data = nested_column->getData();
nested_data = {10, 20, 30, 40, 50, 60, 70};  // 7个元素

auto offsets = ColumnArray::ColumnOffsets::create();
auto & offsets_data = offsets->getData();
offsets_data = {2, 3, 6, 7};  // 累积偏移量

auto array_column = ColumnArray::create(std::move(nested_column), std::move(offsets));

auto data_type = std::make_shared<DataTypeArray>(std::make_shared<DataTypeInt32>());
```

# ColumnMap

```cpp
// 逻辑结构：[{'k1':1, 'k2':2}, {'k3':3}, {'k4':4, 'k5':5, 'k6':6}]

// Map 内部是 Array(Tuple(String, Int32))
auto keys_column = ColumnString::create();
keys_column->insert("k1");
keys_column->insert("k2");
keys_column->insert("k3");
keys_column->insert("k4");
keys_column->insert("k5");
keys_column->insert("k6");

auto values_column = ColumnInt32::create();
values_column->insert(1);
values_column->insert(2);
values_column->insert(3);
values_column->insert(4);
values_column->insert(5);
values_column->insert(6);

auto tuple_column = ColumnTuple::create(Columns{std::move(keys_column), std::move(values_column)});

auto offsets = ColumnArray::ColumnOffsets::create();
offsets->getData() = {2, 3, 6};  // 3个map的边界

auto nested_array = ColumnArray::create(std::move(tuple_column), std::move(offsets));
auto map_column = ColumnMap::create(std::move(nested_array));

auto data_type = std::make_shared<DataTypeMap>(
    std::make_shared<DataTypeString>(),
    std::make_shared<DataTypeInt32>()
);
```