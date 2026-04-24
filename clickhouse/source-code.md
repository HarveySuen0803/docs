# MarkRange

MarkRange 结构：

```cpp
struct MarkRange
{
    size_t begin;
    size_t end;
}

struct MarkRanges : public std::deque<MarkRange>
{
    using std::deque<MarkRange>::deque;
}
```

数据存储结构：

```
[Part 202401]
  |
  |-- [Granule 0] (8192 rows)  -- Mark 0
  |-- [Granule 1] (8192 rows)  -- Mark 1
  |-- [Granule 2] (8192 rows)  -- Mark 2
  |-- [Granule 3] (8192 rows)  -- Mark 3
  |-- [Granule 4] (8192 rows)  -- Mark 4
```

通过 MarkRange 来表示 Mark 的范围：

```
{
    "MarkRange": {
        "begin": 1,  // 从第1个标记点开始（对应 Granule 1）
        "end": 3     // 到第3个标记点结束（不包含，对应到 Granule 2 结束）
    }
}
```

实际数据范围计算：

```
{
    "数据范围": {
        "起始行": "begin * index_granularity = 1 * 8192 = 8192",
        "结束行": "end * index_granularity = 3 * 8192 = 24576",
        "总行数": "24576 - 8192 = 16384 行"
    }
}
```

实际应用：

```cpp
// 1. 数据过滤
MarkRanges ranges = markRangesFromPKRange(
    part,
    metadata_snapshot,
    key_condition,
    part_offset_condition,
    &exact_ranges,
    settings,
    log
);

// 2. 数据读取
for (const auto & range : ranges)
{
    // 读取从 range.begin 到 range.end 之间的数据
    // 实际读取的行范围是 [range.begin * index_granularity, range.end * index_granularity)
    readRows(range.begin, range.end);
}
```

# RangesInDataPart

RangesInDataPart 结构：

```cpp
struct RangesInDataParts: public std::vector<RangesInDataPart>
{
    using std::vector<RangesInDataPart>::vector; /// NOLINT(modernize-type-traits)
};

struct RangesInDataPart
{
    DataPartPtr data_part;
    AlterConversionsPtr alter_conversions;
    size_t part_index_in_query;
    MarkRanges ranges;
    MarkRanges exact_ranges;
}
```

# ReadFromMergeTree::selectRangesToRead

```cpp
function selectRangesToRead(parts) {
    // 第一步：按分区键过滤
    filtered_parts = filterPartsByPartition(parts, partition_condition);
    
    // 第二步：按主键过滤  
    filtered_parts = filterPartsByPrimaryKey(filtered_parts, key_condition);
    
    // 第三步：按跳数索引过滤
    if (use_skip_indexes) {
        filtered_parts = filterPartsBySkipIndexes(filtered_parts, skip_index_conditions);
    }
    
    // 第四步：确定标记范围
    ranges_in_parts = calculateMarkRanges(filtered_parts);
    
    return AnalysisResult{
        .parts_with_ranges = ranges_in_parts,
        .selected_parts = filtered_parts.size(),
        .selected_marks = total_marks,
        .selected_ranges = total_ranges
    };
}
```

下面这三个 spread() 就是根据 selectRangesToRead() 得到的 ranges_in_parts 去读取数据到 pipe 中：

- ReadFromMergeTree::spreadMarkRangesAmongStreams
- ReadFromMergeTree::spreadMarkRangesAmongStreamsWithOrder
- ReadFromMergeTree::spreadMarkRangesAmongStreamsFinal

# ReadFromMergeTree::spreadMarkRangesAmongStreams

```cpp
Pipe ReadFromMergeTree::spreadMarkRangesAmongStreams(RangesInDataParts && parts_with_ranges, const Names & column_names) {
    // 计算并发流数量
    size_t num_streams = calculateOptimalStreamCount(parts_with_ranges);
    
    if (num_streams > 1) {
        // 使用线程池模式
        return readFromPool(parts_with_ranges, column_names, num_streams, min_marks_for_concurrent_read, use_uncompressed_cache);
    } else {
        // 单线程顺序读取
        return readInOrder(parts_with_ranges, column_names, ReadType::Default, use_uncompressed_cache, 0);
    }
}
```

在 readFromPool 中创建的 MergeTreeThreadSelectProcessor 和 pipes 是 ClickHouse 实现高性能并行数据读取的核心组件：

- MergeTreeThreadSelectProcessor：每个线程的数据读取处理器
- pipes：多个处理器的集合，形成并行读取管道

```cpp
Pipe ReadFromMergeTree::readFromPool(
    RangesInDataParts parts_with_range,
    Names required_columns,
    size_t max_streams,
    size_t min_marks_for_concurrent_read,
    bool use_uncompressed_cache)
{
    // 1. 统计总标记数和行数
    size_t sum_marks = 0, total_rows = 0;
    for (const auto & part : parts_with_range) {
        sum_marks += part.getMarksCount();
        total_rows += part.getRowsCount();
    }
    
    // 2. 创建读取池
    auto pool = std::make_shared<MergeTreeReadPool>(
        max_streams, sum_marks, min_marks_for_concurrent_read,
        std::move(parts_with_range), data, storage_snapshot, prewhere_info,
        required_columns, backoff_settings, settings.preferred_block_size_bytes, false);
    
    // 3. 为每个流创建处理器
    Pipes pipes;
    for (size_t i = 0; i < max_streams; ++i) {
        auto source = std::make_shared<MergeTreeThreadSelectProcessor>(
            i, pool, min_marks_for_concurrent_read, max_block_size,
            settings.preferred_block_size_bytes, settings.preferred_max_column_in_block_size_bytes,
            data, storage_snapshot, use_uncompressed_cache,
            prewhere_info, actions_settings, reader_settings, virt_column_names, std::move(extension));
        
        pipes.emplace_back(std::move(source));
    }
    
    return Pipe::unitePipes(std::move(pipes));
}
```

# NamesAndTypesList

```cpp
NamesAndTypesList input_columns = {
    {"user_id", std::make_shared<DataTypeUInt64>()},
    {"age", std::make_shared<DataTypeUInt32>()},
    {"name", std::make_shared<DataTypeString>()}
};
```

# ColumnWithTypeAndName

```cpp
ColumnWithTypeAndName const_column;
const_column.name = "const_18";
const_column.type = std::make_shared<DataTypeUInt32>();
const_column.column = DataTypeUInt32().createColumnConst(1, Field(18u));
```

# ActionsDAG

```cpp
// 构建 WHERE 条件的 ActionsDAG: age > 18 AND name != 'admin'
static ActionsDAG buildWhereDAG() {
    std::cout << "=== 构建 WHERE 条件的 ActionsDAG ===" << std::endl;
    
    // 输入列定义
    NamesAndTypesList inputs = {
        {"user_id", std::make_shared<DataTypeUInt64>()},
        {"age", std::make_shared<DataTypeUInt32>()},
        {"name", std::make_shared<DataTypeString>()}
    };
    
    ActionsDAG dag(inputs);
    auto function_factory = FunctionFactory::instance();
    
    // 1. 获取输入节点
    const auto & age_node = dag.findInOutputs("age");       // N1
    const auto & name_node = dag.findInOutputs("name");     // N3
    
    // 2. 添加常量节点
    // 常量 18
    ColumnWithTypeAndName const_18;
    const_18.name = "18";
    const_18.type = std::make_shared<DataTypeUInt32>();
    const_18.column = DataTypeUInt32().createColumnConst(1, Field(18u));
    const auto & const_18_node = dag.addColumn(const_18);   // N2
    
    // 常量 'admin'
    ColumnWithTypeAndName const_admin;
    const_admin.name = "'admin'";
    const_admin.type = std::make_shared<DataTypeString>();
    const_admin.column = DataTypeString().createColumnConst(1, Field("admin"));
    const auto & const_admin_node = dag.addColumn(const_admin); // N4
    
    // 3. 添加比较函数节点
    // age > 18
    auto greater_func = function_factory.get("greater", ContextPtr{});
    ActionsDAG::NodeRawConstPtrs greater_args = {&age_node, &const_18_node};
    const auto & greater_node = dag.addFunction(
        greater_func, greater_args, "age_gt_18");           // N5
    
    // name != 'admin'
    auto not_equals_func = function_factory.get("notEquals", ContextPtr{});
    ActionsDAG::NodeRawConstPtrs not_equals_args = {&name_node, &const_admin_node};
    const auto & not_equals_node = dag.addFunction(
        not_equals_func, not_equals_args, "name_ne_admin"); // N6
    
    // 4. 添加逻辑AND函数节点
    auto and_func = function_factory.get("and", ContextPtr{});
    ActionsDAG::NodeRawConstPtrs and_args = {&greater_node, &not_equals_node};
    const auto & and_node = dag.addFunction(
        and_func, and_args, "filter_result");              // N7
    
    // 5. 设置输出
    dag.getOutputs().clear();
    dag.getOutputs().push_back(&and_node);
    
    // 打印DAG信息
    printDAGInfo(dag, "WHERE条件");
    
    return dag;
}
```

```
                    [OUTPUT: filter_result]
                            |
                    [FUNCTION: and]
                       /         \
                      /           \
            [FUNCTION: greater]   [FUNCTION: notEquals]
               /         \           /           \
              /           \         /             \
       [INPUT: age]  [COLUMN: 18] [INPUT: name] [COLUMN: 'admin']
```

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20251004104432.png)

---

```cpp
// 构建 SELECT 表达式的 ActionsDAG: user_id, age * 2 + 1
static ActionsDAG buildSelectDAG() {
    std::cout << "\n=== 构建 SELECT 表达式的 ActionsDAG ===" << std::endl;
    
    // 输入列定义
    NamesAndTypesList inputs = {
        {"user_id", std::make_shared<DataTypeUInt64>()},
        {"age", std::make_shared<DataTypeUInt32>()},
        {"name", std::make_shared<DataTypeString>()}
    };
    
    ActionsDAG dag(inputs);
    auto function_factory = FunctionFactory::instance();
    
    // 1. 获取输入节点
    const auto & user_id_node = dag.findInOutputs("user_id"); // S1
    const auto & age_node = dag.findInOutputs("age");         // S2
    
    // 2. 添加常量节点
    // 常量 2
    ColumnWithTypeAndName const_2;
    const_2.name = "2";
    const_2.type = std::make_shared<DataTypeUInt32>();
    const_2.column = DataTypeUInt32().createColumnConst(1, Field(2u));
    const auto & const_2_node = dag.addColumn(const_2);       // S3
    
    // 常量 1
    ColumnWithTypeAndName const_1;
    const_1.name = "1";
    const_1.type = std::make_shared<DataTypeUInt32>();
    const_1.column = DataTypeUInt32().createColumnConst(1, Field(1u));
    const auto & const_1_node = dag.addColumn(const_1);       // S4
    
    // 3. 添加算术函数节点
    // age * 2
    auto multiply_func = function_factory.get("multiply", ContextPtr{});
    ActionsDAG::NodeRawConstPtrs multiply_args = {&age_node, &const_2_node};
    const auto & multiply_node = dag.addFunction(
        multiply_func, multiply_args, "age_mul_2");           // S5
    
    // (age * 2) + 1
    auto plus_func = function_factory.get("plus", ContextPtr{});
    ActionsDAG::NodeRawConstPtrs plus_args = {&multiply_node, &const_1_node};
    const auto & plus_node = dag.addFunction(
        plus_func, plus_args, "age_mul_2_plus_1");           // S6
    
    // 4. 添加别名节点
    const auto & alias_node = dag.addAlias(plus_node, "calculated_age"); // S7
    
    // 5. 设置输出
    dag.getOutputs().clear();
    dag.getOutputs().push_back(&user_id_node);  // 输出 user_id
    dag.getOutputs().push_back(&alias_node);    // 输出 calculated_age
    
    // 打印DAG信息
    printDAGInfo(dag, "SELECT表达式");
    
    return dag;
}
```

```
    [OUTPUT: user_id]              [OUTPUT: calculated_age]
           |                              |
    [INPUT: user_id]               [ALIAS: calculated_age]
                                          |
                                  [FUNCTION: plus]
                                    /         \
                                   /           \
                           [FUNCTION: multiply] [COLUMN: 1]
                             /         \
                            /           \
                    [INPUT: age]    [COLUMN: 2]
```

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20251004104521.png)

# AST

```cpp
// 构造查询：SELECT id, sum(price * quantity) as total FROM orders WHERE status = 'active' LIMIT 10
ASTPtr constructComplexSelectQuery() {
    
    // === 1. 创建主查询节点 ===
    auto select_query = std::make_shared<ASTSelectQuery>();
    
    // === 2. 构造 SELECT 子句 ===
    auto select_list = std::make_shared<ASTExpressionList>();
    
    // 2.1 添加 "id" 列
    auto id_column = std::make_shared<ASTIdentifier>("id");
    select_list->children.push_back(id_column);
    
    // 2.2 构造 "price * quantity" 表达式
    auto multiply_func = std::make_shared<ASTFunction>();
    multiply_func->name = "multiply";
    multiply_func->arguments = std::make_shared<ASTExpressionList>();
    multiply_func->arguments->children.push_back(std::make_shared<ASTIdentifier>("price"));
    multiply_func->arguments->children.push_back(std::make_shared<ASTIdentifier>("quantity"));
    multiply_func->children.push_back(multiply_func->arguments);
    
    // 2.3 构造 "sum(price * quantity)" 函数
    auto sum_func = std::make_shared<ASTFunction>();
    sum_func->name = "sum";
    sum_func->arguments = std::make_shared<ASTExpressionList>();
    sum_func->arguments->children.push_back(multiply_func);
    sum_func->children.push_back(sum_func->arguments);
    
    // 2.4 设置别名 "total"
    sum_func->setAlias("total");
    
    // 2.5 将 sum 函数添加到 SELECT 列表
    select_list->children.push_back(sum_func);
    
    // 2.6 将 SELECT 列表设置到查询中
    select_query->setExpression(ASTSelectQuery::Expression::SELECT, std::move(select_list));
    
    // === 3. 构造 FROM 子句 ===
    auto tables_in_select = std::make_shared<ASTTablesInSelectQuery>();
    auto table_element = std::make_shared<ASTTablesInSelectQueryElement>();
    auto table_expression = std::make_shared<ASTTableExpression>();
    
    // 3.1 创建表标识符 "orders"
    auto table_identifier = std::make_shared<ASTTableIdentifier>("orders");
    table_expression->database_and_table_name = table_identifier;
    table_expression->children.push_back(table_identifier);
    
    // 3.2 组装表达式层次
    table_element->table_expression = table_expression;
    table_element->children.push_back(table_expression);
    
    tables_in_select->children.push_back(table_element);
    
    // 3.3 设置 FROM 子句
    select_query->setExpression(ASTSelectQuery::Expression::TABLES, std::move(tables_in_select));
    
    // === 4. 构造 WHERE 子句: status = 'active' ===
    auto where_condition = std::make_shared<ASTFunction>();
    where_condition->name = "equals";
    where_condition->arguments = std::make_shared<ASTExpressionList>();
    where_condition->arguments->children.push_back(std::make_shared<ASTIdentifier>("status"));
    where_condition->arguments->children.push_back(std::make_shared<ASTLiteral>(Field("active")));
    where_condition->children.push_back(where_condition->arguments);
    
    // 4.1 设置 WHERE 子句
    select_query->setExpression(ASTSelectQuery::Expression::WHERE, std::move(where_condition));
    
    // === 5. 构造 LIMIT 子句: 10 ===
    auto limit_literal = std::make_shared<ASTLiteral>(Field(static_cast<UInt64>(10)));
    select_query->setExpression(ASTSelectQuery::Expression::LIMIT_LENGTH, std::move(limit_literal));
    
    return select_query;
}
```

```
ASTSelectQuery
├── children[0]: ASTExpressionList (SELECT)
│   ├── children[0]: ASTIdentifier("id")
│   └── children[1]: ASTFunction("sum") [alias="total"]
│       └── children[0]: ASTExpressionList (arguments)
│           └── children[0]: ASTFunction("multiply")
│               └── children[0]: ASTExpressionList (arguments)
│                   ├── children[0]: ASTIdentifier("price")
│                   └── children[1]: ASTIdentifier("quantity")
├── children[1]: ASTTablesInSelectQuery (FROM)
│   └── children[0]: ASTTablesInSelectQueryElement
│       └── children[0]: ASTTableExpression
│           └── children[0]: ASTTableIdentifier("orders")
├── children[2]: ASTFunction("equals") (WHERE)
│   └── children[0]: ASTExpressionList (arguments)
│       ├── children[0]: ASTIdentifier("status")
│       └── children[1]: ASTLiteral("active")
└── children[3]: ASTLiteral(10) (LIMIT)
```

# KeyConditions RPN

KeyConditions 的核心作用就是检查一个数据块 Granule 是否满足某个条件，通过 checkInRange() 或 mayBeTrueInRange() 得到一个 may_be_true 和 may_be_false 用于判断当前数据块中是否可能有满足查询条件需要的数据，从而实现快速过滤。

```cpp
// 示例：构造和使用 KeyCondition 进行索引条件判断
void keyConditionExample(ContextPtr context)
{
    // ========================================
    // 第一步：构造表的主键结构信息
    // ========================================
    
    /** 
     * 假设我们有一个表的主键定义为：PRIMARY KEY (date, user_id, status)
     * 这里构造对应的列名和数据类型信息
     */
    Names key_column_names = {"date", "user_id", "status"};
    DataTypes key_data_types = {
        std::make_shared<DataTypeDate>(),      // date 列
        std::make_shared<DataTypeUInt64>(),    // user_id 列
        std::make_shared<DataTypeString>()     // status 列
    };
    
    // ========================================
    // 第二步：构造 ExpressionActions 用于主键表达式计算
    // ========================================
    
    /** 
     * ExpressionActions 用于描述如何从原始列计算出主键值
     * 这里创建一个简单的表达式，直接使用原始列作为主键
     */
    Block sample_block;
    sample_block.insert({std::make_shared<DataTypeDate>()->createColumn(), 
                        std::make_shared<DataTypeDate>(), "date"});
    sample_block.insert({std::make_shared<DataTypeUInt64>()->createColumn(), 
                        std::make_shared<DataTypeUInt64>(), "user_id"});
    sample_block.insert({std::make_shared<DataTypeString>()->createColumn(), 
                        std::make_shared<DataTypeString>(), "status"});
    
    // 创建 ActionsDAG，用于表示主键表达式的计算图
    ActionsDAG key_actions_dag(sample_block.getColumnsWithTypeAndName());
    
    // 创建 ExpressionActions，包装计算图
    auto key_expr = std::make_shared<ExpressionActions>(
        std::move(key_actions_dag), 
        ExpressionActionsSettings{}
    );
    
    // ========================================
    // 第三步：构造过滤条件的 ActionsDAG
    // ========================================
    
    /** 
     * 构造一个查询过滤条件，相当于 SQL：
     * WHERE date >= '2023-01-01' AND user_id = 12345 AND status IN ('active', 'pending')
     */
    
    // 创建过滤条件的 ActionsDAG
    ActionsDAG filter_dag(sample_block.getColumnsWithTypeAndName());
    
    // 条件1：date >= '2023-01-01'
    auto date_column_node = filter_dag.getInputs()[0];  // date 列
    auto date_literal_node = filter_dag.addColumn({
        std::make_shared<DataTypeDate>()->createColumnConst(1, Field(static_cast<UInt16>(19358))), // 2023-01-01 的天数
        std::make_shared<DataTypeDate>(),
        "date_literal"
    });
    
    // 创建 >= 函数节点
    auto greater_equal_func = filter_dag.addFunction(
        FunctionFactory::instance().get("greaterOrEquals", context),
        {date_column_node, date_literal_node},
        "date_ge_condition"
    );
    
    // 条件2：user_id = 12345
    auto user_id_column_node = filter_dag.getInputs()[1];  // user_id 列
    auto user_id_literal_node = filter_dag.addColumn({
        std::make_shared<DataTypeUInt64>()->createColumnConst(1, Field(static_cast<UInt64>(12345))),
        std::make_shared<DataTypeUInt64>(),
        "user_id_literal"
    });
    
    // 创建 = 函数节点
    auto equals_func = filter_dag.addFunction(
        FunctionFactory::instance().get("equals", context),
        {user_id_column_node, user_id_literal_node},
        "user_id_eq_condition"
    );
    
    // 条件3：status IN ('active', 'pending')
    auto status_column_node = filter_dag.getInputs()[2];  // status 列  
    
    // 这里简化处理，只创建 status = 'active' 的条件
    auto status_literal_node = filter_dag.addColumn({
        std::make_shared<DataTypeString>()->createColumnConst(1, Field("active")),
        std::make_shared<DataTypeString>(),
        "status_literal"
    });
    
    auto status_equals_func = filter_dag.addFunction(
        FunctionFactory::instance().get("equals", context),
        {status_column_node, status_literal_node},
        "status_eq_condition"
    );
    
    // 将所有条件用 AND 连接
    auto and_func1 = filter_dag.addFunction(
        FunctionFactory::instance().get("and", context),
        {greater_equal_func, equals_func},
        "and_condition_1"
    );
    
    auto final_and_func = filter_dag.addFunction(
        FunctionFactory::instance().get("and", context),
        {and_func1, status_equals_func},
        "final_condition"
    );
    
    // 设置输出节点
    filter_dag.getOutputs().clear();
    filter_dag.getOutputs().push_back(final_and_func);
    
    // ========================================
    // 第四步：创建 KeyCondition 对象
    // ========================================
    
    /** 
     * KeyCondition 构造函数参数说明：
     * 1. filter_dag: 过滤条件的计算图，描述了 WHERE 子句的逻辑
     * 2. context: ClickHouse 上下文，包含配置和函数注册表等信息
     * 3. key_column_names: 主键列名列表，按主键定义顺序
     * 4. key_expr: 主键表达式的计算对象，用于计算主键值
     * 5. single_point: 是否仅用于单点查询优化（默认false）
     */
    KeyCondition key_condition(
        &filter_dag,           // 过滤条件的 ActionsDAG
        context,               // ClickHouse 上下文
        key_column_names,      // 主键列名：["date", "user_id", "status"]
        key_expr,              // 主键表达式计算对象
        false                  // 不是单点查询
    );
    
    // ========================================
    // 第五步：使用 KeyCondition 进行索引判断
    // ========================================
    
    /** 
     * 模拟一个索引区间的检查
     * 假设我们有一个索引区间：
     * 左边界：('2023-01-01', 10000, 'active')
     * 右边界：('2023-01-02', 20000, 'inactive')
     */
    
    // 构造左边界的主键值
    std::vector<Field> left_key_fields = {
        Field(static_cast<UInt16>(19358)),  // 2023-01-01
        Field(static_cast<UInt64>(10000)),  // user_id = 10000
        Field("active")                     // status = 'active'
    };
    
    // 构造右边界的主键值
    std::vector<Field> right_key_fields = {
        Field(static_cast<UInt16>(19359)),  // 2023-01-02
        Field(static_cast<UInt64>(20000)),  // user_id = 20000  
        Field("inactive")                   // status = 'inactive'
    };
    
    // 转换为 FieldRef 数组（KeyCondition 需要的格式）
    std::vector<FieldRef> left_key_refs, right_key_refs;
    for (const auto & field : left_key_fields)
        left_key_refs.emplace_back(field);
    for (const auto & field : right_key_fields)
        right_key_refs.emplace_back(field);
    
    // ========================================  
    // 第六步：执行索引区间的可行性检查
    // ========================================
    
    /** 
     * checkInRange 方法用于检查在给定的主键区间内，
     * 我们的查询条件是否可能为真（may_be_true）或必然为真（must_be_true）
     * 
     * 参数说明：
     * 1. used_key_size: 使用的主键列数量
     * 2. left_keys: 区间左边界的主键值数组
     * 3. right_keys: 区间右边界的主键值数组  
     * 4. data_types: 主键列的数据类型数组
     * 5. initial_mask: 初始布尔掩码（用于早期退出优化）
     */
    BoolMask result = key_condition.checkInRange(
        key_column_names.size(),      // 使用所有主键列
        left_key_refs.data(),         // 左边界主键值
        right_key_refs.data(),        // 右边界主键值
        key_data_types,               // 主键数据类型
        BoolMask(false, false)        // 初始掩码
    );
    
    // ========================================
    // 第七步：解释检查结果
    // ========================================
    
    /** 
     * BoolMask 包含两个布尔值：
     * - can_be_true: 在该区间内条件可能为真
     * - can_be_false: 在该区间内条件可能为假
     * 
     * 根据结果组合判断：
     * - (true, true): 区间部分满足条件，需要进一步检查数据
     * - (true, false): 区间完全满足条件，可以直接读取所有数据
     * - (false, true): 区间完全不满足条件，可以跳过整个区间
     * - (false, false): 逻辑错误，不应该出现
     */
    
    if (result.can_be_true && result.can_be_false)
    {
        // 区间部分满足条件，需要读取数据进行进一步过滤
        std::cout << "索引区间部分匹配查询条件，需要读取数据进行详细过滤" << std::endl;
    }
    else if (result.can_be_true && !result.can_be_false)
    {
        // 区间完全满足条件，可以跳过条件检查直接返回数据
        std::cout << "索引区间完全匹配查询条件，可以直接返回该区间的所有数据" << std::endl;
    }
    else if (!result.can_be_true && result.can_be_false)
    {
        // 区间完全不满足条件，可以跳过整个区间
        std::cout << "索引区间不匹配查询条件，可以跳过该区间" << std::endl;
    }
    
    // ========================================
    // 第八步：获取条件描述信息（用于 EXPLAIN 查询）
    // ========================================
    
    /** 
     * getDescription() 返回人类可读的条件描述，
     * 通常用于 EXPLAIN 查询的输出，帮助用户理解索引使用情况
     */
    auto description = key_condition.getDescription();
    
    std::cout << "使用的主键列: ";
    for (const auto & key : description.used_keys)
        std::cout << key << " ";
    std::cout << std::endl;
    
    std::cout << "索引条件: " << description.condition << std::endl;
    
    // ========================================
    // 第九步：其他常用的 KeyCondition 方法
    // ========================================
    
    // 检查条件是否总是未知或为真（意味着索引无用）
    if (key_condition.alwaysUnknownOrTrue())
    {
        std::cout << "警告：索引条件无法利用，查询将进行全表扫描" << std::endl;
    }
    
    // 检查条件是否总是为假（意味着查询结果为空）
    if (key_condition.alwaysFalse())
    {
        std::cout << "优化：条件总是为假，查询结果为空" << std::endl;
    }
    
    // 检查是否有单调函数链（用于函数索引优化）
    if (key_condition.hasMonotonicFunctionsChain())
    {
        std::cout << "检测到单调函数链，可以进行高级索引优化" << std::endl;
    }
    
    // 获取实际使用的主键列索引
    const auto & used_key_indices = key_condition.getKeyIndices();
    std::cout << "实际使用的主键列索引: ";
    for (size_t idx : used_key_indices)
        std::cout << idx << " ";
    std::cout << std::endl;
    
    // ========================================
    // 第十步：使用 mayBeTrueInRange 进行高效检查
    // ========================================
    
    /** 
     * mayBeTrueInRange 是 checkInRange 的简化版本，
     * 只返回 may_be_true 的结果，性能更高
     * 适用于只需要判断是否需要读取该区间数据的场景
     */
    bool may_be_true = key_condition.mayBeTrueInRange(
        key_column_names.size(),
        left_key_refs.data(),
        right_key_refs.data(),
        key_data_types
    );
    
    if (may_be_true)
    {
        std::cout << "该索引区间可能包含符合条件的数据" << std::endl;
    }
    else
    {
        std::cout << "该索引区间肯定不包含符合条件的数据，可以跳过" << std::endl;
    }
}
```

# Custom RPN

```cpp
// 自定义RPNElement用于演示
struct CustomRPNElement {
    enum Function {
        FUNCTION_EQUALS,
        FUNCTION_GREATER,
        FUNCTION_LESS,
        FUNCTION_AND,
        FUNCTION_OR,
        FUNCTION_NOT,
        FUNCTION_UNKNOWN,
        ALWAYS_TRUE,
        ALWAYS_FALSE
    };
    
    Function function = FUNCTION_UNKNOWN;
    std::string column_name;
    Field value;
    
    CustomRPNElement(Function func = FUNCTION_UNKNOWN) : function(func) {}
};

void demonstrateCustomRPN()
{
    std::cout << "\n=== 自定义RPN构建和使用示例 ===" << std::endl;
    
    auto context = Context::createGlobal();
    context->makeQueryContext();
    
    // 构造简单的过滤条件: WHERE id > 100
    ActionsDAG filter_dag;
    const auto & id_input = filter_dag.addInput("id", std::make_shared<DataTypeUInt32>());
    auto value_const = std::make_shared<DataTypeUInt32>()->createColumnConst(1, Field(100U));
    const auto & value_const_node = filter_dag.addColumn(
        ColumnWithTypeAndName(value_const, std::make_shared<DataTypeUInt32>(), "100")
    );
    
    auto greater_func = FunctionFactory::instance().get("greater", context);
    const auto & greater_node = filter_dag.addFunction(greater_func, {&id_input, &value_const_node}, "greater");
    filter_dag.getOutputs().push_back(&greater_node);
    
    // 定义原子提取函数
    auto extract_atom = [](const RPNBuilderTreeNode & node, CustomRPNElement & out) -> bool {
        if (node.isFunction()) {
            auto func_node = node.toFunctionNode();
            std::string func_name = func_node.getFunctionName();
            
            if (func_name == "greater" && func_node.getArgumentsSize() == 2) {
                auto left_arg = func_node.getArgumentAt(0);
                auto right_arg = func_node.getArgumentAt(1);
                
                if (!left_arg.isFunction() && right_arg.isConstant()) {
                    out.function = CustomRPNElement::FUNCTION_GREATER;
                    out.column_name = left_arg.getColumnName();
                    
                    Field value;
                    DataTypePtr type;
                    if (right_arg.tryGetConstant(value, type)) {
                        out.value = value;
                        return true;
                    }
                }
            }
        }
        
        return false;
    };
    
    // 构建RPN
    RPNBuilder<CustomRPNElement> builder(
        filter_dag.getOutputs().at(0), 
        context, 
        extract_atom
    );
    
    auto rpn_elements = std::move(builder).extractRPN();
    
    // 使用RPN进行条件评估
    std::cout << "构建的自定义RPN:" << std::endl;
    for (size_t i = 0; i < rpn_elements.size(); ++i) {
        const auto& element = rpn_elements[i];
        std::cout << "RPN[" << i << "]: ";
        
        switch (element.function) {
            case CustomRPNElement::FUNCTION_GREATER:
                std::cout << "GREATER " << element.column_name << " > " << element.value.dump();
                break;
            case CustomRPNElement::FUNCTION_AND:
                std::cout << "AND";
                break;
            case CustomRPNElement::FUNCTION_OR:
                std::cout << "OR";
                break;
            default:
                std::cout << "OTHER";
                break;
        }
        std::cout << std::endl;
    }
    
    // 模拟RPN栈式评估过程
    std::vector<bool> evaluation_stack;
    
    for (const auto& element : rpn_elements) {
        switch (element.function) {
            case CustomRPNElement::FUNCTION_GREATER:
                // 模拟检查: 假设实际值是150
                evaluation_stack.push_back(150 > element.value.get<UInt32>());
                std::cout << "评估 " << element.column_name << "(150) > " << element.value.get<UInt32>() 
                         << " = " << evaluation_stack.back() << std::endl;
                break;
                
            case CustomRPNElement::FUNCTION_AND:
                if (evaluation_stack.size() >= 2) {
                    bool right = evaluation_stack.back(); evaluation_stack.pop_back();
                    bool left = evaluation_stack.back(); evaluation_stack.pop_back();
                    evaluation_stack.push_back(left && right);
                    std::cout << "AND运算: " << left << " AND " << right << " = " << evaluation_stack.back() << std::endl;
                }
                break;
                
            case CustomRPNElement::FUNCTION_OR:
                if (evaluation_stack.size() >= 2) {
                    bool right = evaluation_stack.back(); evaluation_stack.pop_back();
                    bool left = evaluation_stack.back(); evaluation_stack.pop_back();
                    evaluation_stack.push_back(left || right);
                    std::cout << "OR运算: " << left << " OR " << right << " = " << evaluation_stack.back() << std::endl;
                }
                break;
        }
    }
    
    if (!evaluation_stack.empty()) {
        std::cout << "最终评估结果: " << evaluation_stack.back() << std::endl;
    }
}

int main() {
    demonstrateKeyConditionRPN();
    demonstrateBloomFilterRPN();  
    demonstrateCustomRPN();
    
    return 0;
}
```

# MergeTreeIndexBloomFilterText

MergeTreeIndexBloomFilterText 是 ClickHouse 中专门用于文本搜索优化的 Bloom Filter 索引类型。它的主要作用是快速文本搜索过滤，对文本列进行预过滤，避免扫描不包含目标字符串的 granule，支持 LIKE、hasToken、multiSearchAny 等文本搜索函数的优化，特别适合全文搜索场景。

MergeTreeIndexBloomFilterText 本质上就是在写入数据时，按 ngrame 或 token 的方式拆分字符串，写入 bloom filter，每个 granule 对应一个 MergeTreeIndexGranuleBloomFilterText 对象，查询时实现快速过滤。

- 如果有多个列都建立了索引，那么就会有多个 bloom filter，即 每个 granule 内部有一个 std::vector\<BloomFilter\> 数组

```sql
-- 创建用户评论表，包含两种不同的 Bloom Filter 文本索引
CREATE TABLE user_comments (
    id UInt64,
    user_id UInt32,
    product_id UInt32,
    comment_text String,
    comment_title String,
    create_time DateTime,
    
    -- 使用 ngrambf_v1 索引，适合模糊搜索和 LIKE 查询
    -- 参数说明：n=4 (4-gram), filter_size=512字节, filter_hashes=2个哈希函数, seed=0
    INDEX idx_comment_ngram comment_text TYPE ngrambf_v1(4, 512, 2, 0) GRANULARITY 1,
    
    -- 使用 tokenbf_v1 索引，适合精确词汇搜索
    -- 参数说明：filter_size=256字节, filter_hashes=3个哈希函数, seed=12345
    INDEX idx_title_token comment_title TYPE tokenbf_v1(256, 3, 12345) GRANULARITY 1
    
) ENGINE = MergeTree()
ORDER BY (user_id, create_time)
SETTINGS index_granularity = 8192;
```

ngram 索引按固定长度的字符序列滑动分解文本，每次取 N 个连续的字符（支持 UTF-8）作为一个 token，连续且重叠的字符片段，无遗漏。ngram 索引更适合模糊搜索场景，例如 like

```
// NgramTokenExtractor::nextInString 的工作过程
// 每次提取 4 个字符的连续序列

分解结果：
1. "Hell"        (位置 0-3)
2. "ello"        (位置 1-4)
3. "llo "        (位置 2-5)
4. "lo W"        (位置 3-6)
5. "o Wo"        (位置 4-7)
6. " Wor"        (位置 5-8)
7. "Worl"        (位置 6-9)
8. "orld"        (位置 7-10)
9. "rld!"        (位置 8-11)
10. "ld! "       (位置 9-12)
11. "d! 这"      (位置 10-13)
12. "! 这是"     (位置 11-14)
13. " 这是一"    (位置 12-15)
14. "这是一个"   (位置 13-16)
15. "是一个测"   (位置 14-17)
16. "一个测试"   (位置 15-18)
17. "个测试1"    (位置 16-19)
18. "测试12"     (位置 17-20)
19. "试123"      (位置 18-21)

总计：19 个 4-gram tokens
```

token 索引按语义边界分割，识别完整的词汇单位，以非字母数字字符为分隔符，提取字母数字序列。token 索引更适合精确匹配场景，例如 hasToken

```
// SplitTokenExtractor::nextInString 的工作过程
// 以非字母数字字符为边界分割

分解结果：
1. "Hello"       (遇到空格停止)
2. "World"       (遇到感叹号停止)  
3. "这是一个测试"  (连续的非ASCII字符被视为一个token)
4. "123"         (遇到字符串结束)

总计：4 个完整的 tokens
```

# Select Process

1. 客户端发送 `SELECT` 请求到 ClickHouse Server  
   请求里通常包含：
   - SQL 文本
   - 用户信息
   - settings
   - output format
   - query id
   - 可能的 session / quota / role 上下文

2. 服务端为本次查询创建 `Context` 和运行时环境  
   这一步会准备：
   - 当前用户和权限上下文
   - 当前数据库
   - settings 快照
   - quota / profile / query log 统计对象
   - 内存跟踪器、线程组、query id 等

3. 对 SQL 做词法分析和语法分析  
   SQL 会先被 parser 解析成 AST，也就是抽象语法树。  
   这时还没有真正执行，只是把文本变成结构化语法表示。

4. 对 AST 做基础预处理  
   包括但不限于：
   - 规范化表名和数据库名
   - 展开 `*`
   - 处理别名
   - 处理 `WITH`
   - 识别函数、聚合函数、窗口函数
   - 整理 `JOIN` / `UNION`
   - 处理 `SETTINGS`、`FORMAT`、`LIMIT`

5. 定位目标对象  
   根据 AST 找到目标来源：
   - 普通表
   - 视图
   - 分布式表
   - 表函数
   - 子查询
   - 字典等

6. 做访问控制检查  
   检查当前用户是否有权限访问：
   - database
   - table
   - column
   - view
   - dictionary
   - table function
   - 远端 cluster

7. 获取表的 metadata snapshot  
   对目标表，会读取一个一致性的元数据快照，用于本次查询全过程。  
   里面通常包含：
   - 列定义
   - 默认值表达式
   - 主键 / 排序键
   - 分区键
   - projection
   - skip index
   - TTL
   - 视图定义等

8. 进入语义分析阶段  
   这一步会弄清楚查询真正“是什么意思”，例如：
   - 每个标识符引用的是哪一列
   - 每个表达式的类型是什么
   - 哪些列是常量
   - 哪些表达式依赖哪些输入列
   - 哪些地方是聚合上下文
   - 哪些地方是窗口上下文

9. 做类型推导和类型转换规划  
   比如：
   - `UInt32 + Int64` 最终是什么类型
   - `toDate(...)` 的结果类型
   - `if(...)` 两个分支如何对齐类型
   - 比较运算两边是否需要隐式 cast

10. 做逻辑重写和优化  
    典型包括：
    - 常量折叠
    - 谓词简化
    - 无用列表达式裁剪
    - 某些条件下推
    - `PREWHERE` 候选提取
    - `LIMIT` 提前
    - 某些子查询重写
    - projection 选择候选

11. 构建逻辑执行计划 `QueryPlan`  
    分析器会把语义化后的查询转成一棵计划树或 step 链。  
    常见 step 包括：
    - ReadFromStorage
    - Expression
    - Filter
    - Aggregating
    - Sorting
    - Distinct
    - Join
    - Window
    - Limit
    - Union

12. 确定读取路径  
    不同引擎会进入不同读路径：
    - `MergeTree` / `ReplicatedMergeTree`：从 data parts 读取
    - `Distributed`：发给远端 shard / replica
    - `View`：先展开成底层查询
    - `Memory` / `File` / `Log`：走各自 reader
    - 表函数：按表函数实现读取

13. 如果是视图，先展开视图定义  
    普通 view 本质上会被替换为底层 `SELECT`。  
    之后再对展开后的查询继续分析和执行。

14. 如果是 `Distributed` 表，先决定是否下发到远端  
    发起节点会规划：
    - 发往哪些 shard
    - 每个 shard 用哪个 replica
    - 是否并行
    - 聚合和排序是在远端做、发起端做，还是两边分层做

15. 如果是 `MergeTree`，先收集候选 part  
    存储层会拿到当前所有可见 part，然后准备做裁剪。  
    这时还没有真正读数据文件。

16. 对 `MergeTree` 做 partition / part 级裁剪  
    首先利用 part 级元数据尽可能排除完全不可能命中的 part。  
    常见依据包括：
    - partition key 的 minmax
    - part metadata
    - `_part` / `_partition_id` 条件
    - 某些简单常量条件

17. 构造 partition key / minmax 条件  
    系统会把 `WHERE` 中适用于 partition key 的部分抽出来。  
    用这些条件去检查每个 part 的 `minmax_<partition_key_column>.idx` 或等价内存结构。

18. 跳过不可能命中的 part  
    如果某个 part 的 partition key 范围和查询条件完全不相交，这个 part 会被直接排除，不再进入后续读取。

19. 对剩余 part 做主键裁剪  
    如果查询条件能作用到主键或排序键，系统会利用 `primary.idx` 判断哪些 mark / granule 区间可能有数据。

20. 生成 mark ranges / granule ranges  
    经过主键裁剪后，系统不再“全量读整个 part”，而是只保留需要读的 mark 范围。

21. 如果定义了 skip index，再对 granule 范围进一步裁剪  
    比如：
    - `TYPE minmax`
    - `TYPE set`
    - `TYPE bloom_filter`
    - `ngrambf_v1`
    - `tokenbf_v1`  
    它们能继续跳过一部分 granule 或 granule group。

22. 决定本次查询真正需要读取哪些列  
    ClickHouse 会尽量只读必要列，而不是表里全部列。  
    需要的列来自：
    - `SELECT` 列表
    - `WHERE`
    - `PREWHERE`
    - `JOIN`
    - `GROUP BY`
    - `ORDER BY`
    - `HAVING`
    - `LIMIT BY`
    - 相关表达式依赖

23. 评估是否使用 `PREWHERE`  
    如果合适，会把一部分过滤条件提前到 `PREWHERE`：
    - 先读少量过滤列
    - 先过滤行
    - 再读其余输出列  
    这样通常能减少 I/O 和解压成本。

24. 开始构建物理执行 pipeline  
    `QueryPlan` 会被转成 `QueryPipeline` / processors pipeline。  
    到这一步，查询开始从“逻辑计划”进入“实际数据流执行”。

25. 为读取创建 source processors  
    存储层会为每个 part / range 建立 reader source。  
    多个 source 可以并发读取不同 part 或不同 mark range。

26. 打开数据文件和 marks 文件  
    对 `MergeTree` 来说，会根据需要打开：
    - 列数据文件
    - `.mrk2` / marks 文件
    - 主键索引
    - skip index 文件
    - 可能的 projection 数据文件

27. 根据 mark ranges seek 到目标位置  
    Reader 并不是线性从头扫文件，而是根据 marks 定位到目标 granule 的压缩块位置。

28. 读取并反序列化列数据  
    需要的列会被解压和反序列化成列向量。  
    这时生成的是执行层的数据批。

29. 形成 pipeline 中流动的数据块  
    在 processor 体系里，执行时流动的是批量数据结构，供后续表达式、过滤、聚合等 processor 继续处理。

30. 执行最早一层表达式计算  
    包括：
    - 别名展开后的表达式
    - 常量列准备
    - 某些类型转换
    - 某些条件表达式预计算

31. 如果启用 `PREWHERE`，先执行 `PREWHERE` 过滤  
    只基于提前读取的列过滤掉大量不需要的行。  
    这一步通过后，才会去读剩余需要的列。

32. 读取 `PREWHERE` 之后还需要的其他列  
    对于通过过滤的 granules / rows，再补读最终输出或后续算子需要的列。

33. 执行 `WHERE` 过滤  
    在完整输入列可用后，执行主过滤条件。  
    这一步是真正语义上的 `WHERE`。

34. 执行普通表达式计算  
    会计算：
    - `SELECT` 中的表达式列
    - `ORDER BY` 表达式
    - `GROUP BY` key 表达式
    - `JOIN ON` 表达式
    - 其它中间列

35. 如果有 `ARRAY JOIN`，执行数组展开  
    `ARRAY JOIN` 会把数组中的元素展开成多行，并同步调整其他列。

36. 如果有 `JOIN`，执行连接逻辑  
    根据 join 类型和数据特征，选择合适算法：
    - hash join
    - merge join
    - direct join
    - grace hash join 等  
    通常会先准备右表，再处理左表流。

37. 如果有子查询，子查询结果在前面或并行阶段被物化使用  
    常见用途：
    - `IN (subquery)` 转成 set
    - 标量子查询转成常量
    - `JOIN (subquery)` 转成右侧输入流

38. 如果有聚合，开始构建聚合状态  
    对 `GROUP BY` 查询，会为每个 key 建立聚合状态，累积：
    - `sum`
    - `count`
    - `avg`
    - `uniq`
    - `quantile`
    等 aggregate function 状态

39. 根据数据规模选择单级或两级聚合  
    数据量大时可能转成 two-level aggregation，提高并发和合并效率。

40. 如果内存不足，可能使用外部聚合  
    即把部分聚合中间结果落盘，再在后续阶段 merge。

41. 合并各线程的局部聚合结果  
    多个 source / 多个线程生成的聚合状态最后会归并，得到全局聚合结果。

42. 如果有 `HAVING`，执行聚合后过滤  
    `HAVING` 发生在聚合之后，用聚合结果继续过滤。

43. 如果有窗口函数，执行窗口阶段  
    这通常需要：
    - 按 partition 分组
    - 排序
    - 维护 frame
    - 计算 `row_number`、`rank`、`lag`、`lead`、窗口聚合等

44. 如果有 `DISTINCT`，执行去重  
    去重可以发生在：
    - 全行
    - 指定列
    - 结合排序或 limit 的特殊优化路径

45. 如果有 `ORDER BY`，执行排序  
    排序可能包括：
    - 局部排序
    - 多路归并
    - 外部排序  
    如果只是取 Top-N，可能做局部优化避免全量排序。

46. 如果有 `LIMIT BY`，执行分组限流  
    每个 key 只保留前 N 行。

47. 执行 `LIMIT` 和 `OFFSET`  
    对最终结果流截断。  
    某些情况下 `LIMIT` 也会在更早阶段参与优化。

48. 做最终投影和列整理  
    只保留用户真正要求输出的列，按最终顺序排列，并处理最终别名。

49. 把结果转成输出格式  
    根据客户端指定 format，把结果序列化成：
    - Native
    - RowBinary
    - JSONEachRow
    - JSON
    - CSV
    - TSV
    - Pretty
    等等

50. 流式发送结果给客户端  
    ClickHouse 通常不是“全部算完再一次性返回”，而是边算边输出结果块。

51. 更新 query 运行统计和日志  
    结束后会记录：
    - read rows / bytes
    - result rows / bytes
    - memory peak
    - elapsed time
    - ProfileEvents
    - query_log / query_thread_log 等

52. 释放执行资源  
    包括：
    - reader
    - pipeline processors
    - 聚合 hash table
    - 排序缓存
    - join 结构
    - 临时文件
    - 线程上下文
    - query context 附属资源

53. 如果是分布式查询，发起节点还会做远端结果归并  
    对 `Distributed SELECT`，远端节点各自执行一遍本地查询流程，发起节点再：
    - merge 多路流
    - 做最终聚合
    - 做最终排序
    - 做最终 limit
    - 再输出给客户端

54. 如果启用了并行副本读取，还会多出协调层  
    在 parallel replicas 模式下，会有 coordinator 把读取任务切分给多个副本并汇总结果。

55. 如果命中了 projection，读取流程会替换成 projection 路径  
    从逻辑上仍是 `SELECT`，但物理读取源变成 projection part，而不是原始 part。

56. 如果是 `MergeTree`，可以把核心路径压缩成一句话  
    解析 SQL -> 分析和优化 -> 选择 parts -> 选择 granules -> 读取列 -> 过滤 -> 计算 -> 聚合/排序 -> 返回结果

57. 如果从性能角度看，最关键的步骤通常不是“读数据”本身，而是前置裁剪  
    也就是：
    - part pruning
    - primary key pruning
    - skip index pruning
    - PREWHERE
    - 列裁剪
    - projection 命中
    - 远端/本地聚合策略

58. 最短总结  
    ClickHouse 的 `SELECT` 完整流程，本质上就是：把 SQL 变成语义正确的执行计划，再尽可能在读取前做裁剪，最后对剩余数据做过滤、表达式计算、连接、聚合、排序，并以流式方式返回结果。

如果你愿意，我下一条可以继续给你两个更具体的版本中的任意一个：

1. 专门讲 `MergeTree SELECT`，重点放在 `part -> mark -> granule -> column file`  
2. 专门讲 `SELECT` 的 pipeline / processors 链路，重点放在 `QueryPlan -> QueryPipeline -> Chunk/Block`

# Insert Process

1. 进入 `INSERT` 执行入口  
   `InterpreterInsertQuery` 解析 SQL，拿到目标表，构建写入 pipeline。对 `ReplicatedMergeTree` 来说，最终 sink 是 `StorageReplicatedMergeTree::write()` 返回的 `ReplicatedMergeTreeSink`。对应代码入口在 [InterpreterInsertQuery.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Interpreters/InterpreterInsertQuery.cpp:381) 和 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:6039)。

2. 构建写入前的数据处理链  
   pipeline 会按顺序做列类型对齐、补默认值、约束检查、嵌套列校验、计数、必要时 squashing，并给每个 `Chunk` 附加 `DeduplicationToken::TokenInfo`。如果用户设置了 `insert_deduplication_token`，还会插入 `SetUserTokenTransform` 和 `SetSourceBlockNumberTransform`。对应代码在 [InterpreterInsertQuery.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Interpreters/InterpreterInsertQuery.cpp:336) 和 [DeduplicationTokenTransforms.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Processors/Transforms/DeduplicationTokenTransforms.cpp:57)。

3. pipeline 开始向 sink 推送 `Chunk`  
   `ReplicatedMergeTreeSink::consume()` 收到一批 `Chunk` 后，先用 header 把它恢复成 `Block`。这一步只是把“执行层流动的数据批”转回“带 schema 的列块”。对应代码在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:307)。

4. 写前做 Keeper quorum / 副本状态检查  
   `checkQuorumPrecondition()` 会先访问 Keeper，确认这次写入有没有资格开始。对应代码在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:130)。

5. `getChildren(<zk_path>/replicas)`  
   作用：读取当前表的所有副本列表，后续统计活跃副本数。

6. `exists(<zk_path>/replicas/<other_replica>/is_active)`  
   作用：确认其他副本是否在线。如果活跃副本数不足 `insert_quorum`，当前 insert 直接失败。

7. `get(<replica_path>/is_active)`  
   作用：确认当前副本自己仍然是活跃副本，并记录 znode version，后面 quorum 等待结束时还会再次校验。

8. `get(<replica_path>/host)`  
   作用：记录当前副本 `host` znode version。因为 `is_active` 可能删掉又重建，单独看它不够，`host` version 一起校验才能确认副本没有“换过会话/重启过”。

9. `tryGet(<zk_path>/quorum/status)`  
   作用：当 `insert_quorum_parallel = 0` 时，检查前一个 quorum insert 是否还没完成。如果还存在，当前 insert 拒绝执行。

10. 计算 dedup 语义和 block 切分  
    sink 会读取 `ChunkInfo` 里的 dedup token 信息，然后把 `Block` 按 partition 切成一个或多个 `BlockWithPartition`。如果没手工指定 user token，就会走自动 hash 路径；如果指定了，就会把 token 加进后续 `block_id` 的计算。切分逻辑在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:312)。

11. 生成本地临时 part  
    每个分区块会调用 `writeNewTempPart()`，进入 `MergeTreeDataWriter`，在本地磁盘临时目录下写出 part 文件。对应代码在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:434) 和 [MergeTreeDataWriter.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/MergeTreeDataWriter.cpp:576)。

12. 本地写 part 时完成排序与 granule 划分  
    写 part 过程中会按 `ORDER BY` 排序，计算 index granularity，并按 granule 落盘。普通列写 `.bin/.mrk2` 或 compact data/marks 文件。

13. 写 part 时构建主键索引  
    会把每个 granule 起点的主键值写进 `primary.idx`。对应实现见 [MergeTreeDataPartWriterOnDisk.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/MergeTreeDataPartWriterOnDisk.cpp:255)。

14. 写 part 时构建 partition minmax  
    会对 `PARTITION BY` 依赖列构建 `minmax_<column>.idx`，用于 part 级裁剪。对应代码在 [MergeTreeDataWriter.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/MergeTreeDataWriter.cpp:576)。

15. 如果表定义了 skip index，则写 granule / granule-group 级 skip index  
    例如 `TYPE minmax`、`set`、`bloom_filter`。这些 index 不是 Keeper 元数据，而是 part 内的物理文件，按 granule 体系写入。对应代码在 [MergeTreeDataPartWriterOnDisk.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/MergeTreeDataPartWriterOnDisk.cpp:291)。

16. 写完 part 元数据文件  
    会生成 `checksums.txt`、`columns.txt`、`count.txt`、可能的 `partition.dat`、`serialization.json` 等。`checksums.txt` 后续会参与 dedup hash 和副本校验。元数据接口在 [IMergeTreeDataPart.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/IMergeTreeDataPart.cpp:1214)。

17. 计算 part 级内容 hash  
    `getPartBlockIDHash()` 会基于 `checksums.computeTotalChecksumDataOnly()` 做 SipHash，得到 128 位 hash。对应代码在 [IMergeTreeDataPart.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/IMergeTreeDataPart.cpp:2746)。

18. 生成 `block_id`  
    `getNewPartBlockID(token)` 会生成最终的 dedup key。如果 token 为空，则 `block_id = partition_id + "_" + part-data-hash`；如果 token 非空，则 `block_id = partition_id + "_" + SipHash(token)`。对应代码在 [IMergeTreeDataPart.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/IMergeTreeDataPart.cpp:2753)。

19. 进入 commit 阶段，开始和 Keeper 交互  
    这一段是整个 replicated insert 的核心。代码在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:561)。

20. 分配 `block_number`  
    `allocateBlockNumber(partition_id, zookeeper, block_id_path)` 会为当前 partition 申请一个新的递增编号。这个编号后面会进 part 名的 `min_block=max_block`。实现见 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:7204)。

21. `check(<replica_path>/host)`  
    作用：在需要创建 partition block_numbers 节点时，先确认副本没有在被删除或失效过程中。

22. `create(<zk_path>/block_numbers/<partition_id>, Persistent)`  
    作用：如果这个 partition 还没有 block number 目录，就先创建它。这里只是目录初始化，不是分配真正编号。

23. `set(<zk_path>/block_numbers, "", -1)`  
    作用：显式 bump `/block_numbers` 的 data version，让系统能检测“分区集合是否在变化”。

24. `checkNotExists(<zk_path>/blocks/<block_id>)`  
    作用：dedup 预检查。如果这个 dedup znode 已经存在，说明这是重复 insert，直接结束为 duplicate，不必再消耗 block number。这个预检查在 `EphemeralLockInZooKeeper` 的 multi 里完成，见 [EphemeralLockInZooKeeper.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/EphemeralLockInZooKeeper.cpp:33)。

25. `create(<zk_path>/block_numbers/<partition_id>/block-, EphemeralSequential)`  
    作用：真正分配一个新的 `block_number`，同时把它当成“正在提交中的临时锁”。Keeper 返回的顺序号就是 block number。这个号是按 partition 递增的，不保证连续无空洞。

26. 把 `block_number` 写入 part info  
    本地内存中会设置 `part->info.min_block = block_number`、`max_block = block_number`，然后 part 改名。例如变成 `202604_42_42_0`。这一步不是 Keeper 操作，但紧跟在 Keeper 分配编号之后。对应代码在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:766)。

27. 本地先把 temp part rename 成正式 part，并加入 working set  
    在真正 Keeper multi 之前，ClickHouse 会先把本地 part 目录 rename 到正式名称，并准备一个事务对象，便于失败时回滚。对应逻辑在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:790)。

28. 组装 Keeper multi，开始“原子提交这次 insert”  
    从这里开始，真正的一批 `ops` 会一次性送到 Keeper。只要 multi 成功，这次 insert 就变成复制系统中的全局事实。

29. `create(<zk_path>/log/log-, PersistentSequential, log_entry)`  
    作用：写全局复制日志。告诉所有副本“出现了一个新 part，以后你们需要拿到它”。普通 insert 的 log entry 类型通常是 `GET_PART`。对应代码在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:721)。

30. `remove(<zk_path>/block_numbers/<partition_id>/block-000000xxxx)`  
    作用：释放刚才申请的 block number 临时锁。这个 remove 必须和其他 commit 操作在同一个 multi 里，否则会产生锁泄漏或竞态。对应代码来源是 `block_number_lock->getUnlockOp(ops)`。

31. 如果开启 quorum，则 `create(<zk_path>/quorum/status, quorum_entry)` 或 `create(<zk_path>/quorum/parallel/<part_name>, quorum_entry)`  
    作用：开始跟踪这个 part 的 quorum 收敛状态。初始内容里已经记入当前副本自己。对应代码在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:655)。

32. 如果开启 quorum，则 `check(<replica_path>/is_active, saved_version)`  
    作用：确认从写前检查到真正提交这段时间内，本副本没有失活或重建。

33. 如果开启 quorum，则 `check(<replica_path>/host, saved_version)`  
    作用：进一步确认当前副本没有在过程中被替换或重启过。

34. `create(<zk_path>/blocks/<block_id>, Persistent, part_name)`  
    作用：写入 dedup znode。这一步同时完成两件事：占住 dedup key，并把 znode data 设置为对应的 `part_name`。以后 duplicate insert 命中时，可以反查最初对应的是哪个 part。对应代码在 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:9238)。

35. `create(<replica_path>/parts/<part_name>, Persistent, minimal_header)` 或 `create(<replica_path>/parts/<part_name>, "")`  
    作用：在 Keeper 中登记“当前副本已经拥有这个 part”。

36. 如果不是 minimalistic header 模式，则 `create(<replica_path>/parts/<part_name>/columns, part->getColumns().toString())`  
    作用：把 part 的列信息写到 Keeper，供其他副本 fetch 或校验时读取。

37. 如果不是 minimalistic header 模式，则 `create(<replica_path>/parts/<part_name>/checksums, getChecksumsForZooKeeper(...))`  
    作用：把 part 的 checksums 写到 Keeper，供其他副本 fetch 前后比对。

38. 执行 `tryMultiNoThrow(ops)`  
    作用：原子提交上面整个集合。要么都成功，要么都失败。对应代码在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:817)。

39. 如果 Keeper multi 成功  
    作用：本地事务 `commit()`，part 正式变成当前副本的 active part；block number lock 被视为已解锁；这次 insert 进入“已提交，待传播/待 quorum 收敛”的状态。

40. 如果 Keeper multi 因硬件/网络错误返回未知状态  
    作用：ClickHouse 会重新连接 Keeper，检查 `/replicas/<replica>/parts/<part_name>` 是否已经存在，必要时检查 quorum failed 节点，从而判断这次 insert 是真的提交成功了，还是需要重试。对应恢复逻辑在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:833)。

41. 如果 Keeper multi 因 `/blocks/<block_id>` 已存在而失败  
    作用：说明这是 duplicate insert。系统会回滚本地 part rename，并读取 `/blocks/<block_id>` 的 data，得知原先对应的 `part_name`。对应代码在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:922) 和 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:645)。

42. 如果开启 quorum，进入等待阶段  
    `waitForQuorum()` 会开始 watch quorum znode。对应代码在 [ReplicatedMergeTreeSink.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeSink.cpp:1194)。

43. `tryGet(<zk_path>/quorum/status or /parallel/<part>, ..., watch)`  
    作用：watch quorum 节点是否消失。消失表示达到所需副本数，当前 insert 可以对客户端返回成功。

44. quorum 等待完成后，再次 `tryGet(<replica_path>/is_active)` 和 `tryGet(<replica_path>/host)`  
    作用：确认等待期间当前副本没有失活。否则本地虽然写成功，但 quorum 状态不能可靠确认，返回 `UNKNOWN_STATUS_OF_INSERT`。

45. 其他副本后台线程开始消费 `/log`  
    每个副本的 `queueUpdatingTask()` 会把全局 `/log` 拉到自己的 `/queue`。对应代码在 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:3816) 和 [ReplicatedMergeTreeQueue.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeQueue.cpp:624)。

46. `get(<replica_path>/log_pointer)`  
    作用：读取这个副本已经消费到全局 log 的哪个位置。

47. `get(<zk_path>/log, &stat)`  
    作用：拿到 `/log` 当前版本，用于队列同步和 merge predicate 等后续逻辑。

48. `getChildrenWatch(<zk_path>/log)`  
    作用：读取全局 log 子节点列表，并挂 watch。以后有新的 insert / merge / mutate log entry，就能及时感知。

49. `get(<zk_path>/log/log-xxxx)` 批量读取未消费的 log entry  
    作用：把“这次 insert 产生了哪个 part”的事实读出来。

50. `create(<replica_path>/queue/queue-, PersistentSequential, log_entry_data)`  
    作用：把全局 log entry 复制到“当前副本自己的待执行队列”。每个副本都会做这一步，但每个副本写的是自己的 `/queue`。

51. `set(<replica_path>/log_pointer, next_index)`  
    作用：推进当前副本已消费到的 log 位置，防止重复拉取同一批 log entry。

52. 可选 `set(<replica_path>/min_unprocessed_insert_time, ...)`  
    作用：记录最早未处理 insert 的时间，供监控和调度使用。

53. 其他副本从自己的 queue 中取出 `GET_PART` 任务  
    这一步本身不一定是新的 Keeper 操作，但后续 fetch part 时会去读源副本 Keeper 元数据，确定 part 是否存在、checksums 是多少、host 在哪里。

54. `exists(<zk_path>/replicas/<source_replica>/parts/<part_name>)`  
    作用：确认源副本 Keeper 元数据里确实登记了该 part。

55. `get(<zk_path>/replicas/<source_replica>/host)`  
    作用：获取源副本的 interserver 地址，后续通过 HTTP fetch 真正的数据文件。注意数据文件不是从 Keeper 取，而是从副本机器上取。

56. `get(<zk_path>/replicas/<source_replica>/parts/<part_name>)` 或 `get(.../columns)`、`get(.../checksums)`  
    作用：读取源 part 的 columns/checksums，用于本地校验或 clone/fetch 决策。

57. 其他副本 fetch 成功后，在自己名下登记 part  
    这一步和发起副本类似，也会在 Keeper 的 `/replicas/<this_replica>/parts/<part_name>` 下创建 part 记录。

58. 如果该 insert 开启了 quorum，fetch 成功的副本会更新 quorum  
    对应逻辑在 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:4909)。

59. `tryGet(<zk_path>/quorum/status or /parallel/<part_name>)`  
    作用：读取当前 quorum entry，看看已有多少副本确认了该 part。

60. `trySet(quorum_path, updated_quorum_entry, version)`  
    作用：把“我这个副本也拿到 part 了”写回 quorum 节点。

61. 当达到 quorum 时，执行 multi：`remove(quorum_path, version)`  
    作用：删除 quorum 跟踪节点，表示该 part 的 quorum 已满足。

62. 对非 parallel quorum，再执行 `get/set(<zk_path>/quorum/last_part)`  
    作用：更新“每个 partition 最后一个达到 quorum 的 part”，供顺序一致性语义使用。

63. 发起 insert 的副本 watch 到 quorum znode 消失  
    作用：这时 `waitForQuorum()` 返回，整个 `INSERT` 对客户端正式成功。

64. 如果在 fetch 过程中发现没有任何活跃副本持有该 part，而该 part 又在等待 quorum  
    作用：系统会尝试把该 quorum 标记为失败，并可能删除 `/blocks/<block_id>`，这样客户端重试时不会被旧 dedup 记录挡住。相关逻辑在 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:2411)。

65. `remove(<zk_path>/quorum/status or /parallel/<part>)`  
    作用：撤销这个失败的 quorum 跟踪。

66. `create(<zk_path>/quorum/failed_parts/<part_name>, Persistent)`  
    作用：标记这个 part 的 quorum 已失败。

67. 如果需要，则 `remove(<zk_path>/blocks/<block_id>)`  
    作用：清理 dedup znode，让客户端重试同一批数据时还能重新提交。

68. 到这里，一次 `ReplicatedMergeTree INSERT` 的完整流程闭环  
    本地 part 已写入，Keeper 中有 dedup 记录、有复制日志、有 part 元数据；其他副本已从 `/log` 复制到自己的 `/queue`，再 fetch part；如果开启 quorum，则在足够副本确认后对客户端返回成功。

69. 最短总结  
    这整套流程可以压缩成一句话：先在本地把 part 写出来，再通过 Keeper 原子地提交“编号、幂等、复制日志、副本元数据、quorum 状态”，最后由其他副本根据 `/log -> /queue` 的链路把这个 part 拉过去并完成收敛。

# Replication Process

1. 副本启动或从只读恢复，进入 `RestartingThread`  
   `ReplicatedMergeTreeRestartingThread::tryStartup()` 会负责把副本重新带到可同步状态。对应代码在 [ReplicatedMergeTreeRestartingThread.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeRestartingThread.cpp:183)。

2. 清理上次失败的 quorum 残留  
   启动初期会先处理 `/quorum/failed_parts`，把这些 part 从 Keeper 元数据和本地状态里清走，避免副本带着“已失败但未清理”的 part 继续工作。对应逻辑在 [ReplicatedMergeTreeRestartingThread.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeRestartingThread.cpp:264)。

3. 激活当前副本  
   启动线程会调用 `activateReplica()`，在 Keeper 中把当前副本标记为 active。  
   从复制语义上讲，这意味着：
   - 当前副本开始参与复制
   - 其他副本后续可以把它算进 active replicas
   - 它的 `log_pointer`、`queue`、`parts` 等状态会被视作有效状态

4. 如果需要，执行 `cloneReplicaIfNeeded()`  
   如果这是新副本、丢失副本恢复、或者需要从其他副本复制初始状态，系统会尝试“克隆”一个已有副本的 queue / parts 视图，把自己拉到一个可继续追赶的位置。对应调用在 [ReplicatedMergeTreeRestartingThread.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeRestartingThread.cpp:192)。

5. 初始化本地内存中的 replication queue 状态  
   `queue.initialize(zookeeper)` 会先读取 Keeper 中当前副本的 `/replicas/<replica>/parts`，把这些 part 加到内存中的 `current_parts` / `virtual_parts` 集合里。对应实现见 [ReplicatedMergeTreeQueue.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeQueue.cpp:72)。

6. 加载 Keeper 中已经存在的本副本 `/queue`  
   `queue.load(zookeeper)` 会把 Keeper 的 `/replicas/<replica>/queue/queue-*` 中已有的任务加载到内存队列，恢复未完成的复制任务、merge、mutation、drop 等。对应实现见 [ReplicatedMergeTreeQueue.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeQueue.cpp:126)。

7. 为已知损坏 part 创建重新拉取任务  
   `queue.createLogEntriesToFetchBrokenParts()` 会把本地检测到的 broken part 转成新的 `GET_PART` 任务，让后续从其他副本重新 fetch。对应调用在 [ReplicatedMergeTreeRestartingThread.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeRestartingThread.cpp:200)。

8. 首次从全局 `/log` 拉取增量日志到本副本 `/queue`  
   启动阶段会执行一次 `queue.pullLogsToQueue(..., LOAD)`，把全局复制日志 `/log/log-*` 中尚未消费的项复制到本副本的 `/queue/queue-*`。对应调用在 [ReplicatedMergeTreeRestartingThread.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeRestartingThread.cpp:204)，具体实现见 [ReplicatedMergeTreeQueue.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeQueue.cpp:624)。

9. 读取本副本 `log_pointer`  
   `pullLogsToQueue()` 先读 `/replicas/<replica>/log_pointer`，确定这个副本已经消费到 `/log` 的哪个位置。  
   如果没有 pointer，就把它初始化到当前最小 log entry 位置。

10. 读取全局 `/log` 子节点并挂 watch  
    `getChildrenWatch(<zk_path>/log)` 会拿到所有 `log-*`，并在 `/log` 上挂 watch。  
    后续如果有新的 INSERT / MERGE / MUTATE / DROP 进入全局 log，这个副本就会被唤醒继续拉。

11. 批量读取未消费的 `/log/log-*`  
    对从 `log_pointer` 之后开始的每个 log entry，副本会读取内容并解析成 `LogEntry`。

12. 用 Keeper multi 把这些全局 log 复制到本副本 queue  
    对每个新 log，会在本副本路径下创建一个新的：
    - `/replicas/<replica>/queue/queue-*`
    然后同时更新：
    - `/replicas/<replica>/log_pointer`
    - 可能还有 `/replicas/<replica>/min_unprocessed_insert_time`
    这样副本就把“全局事实”变成了“本副本待执行任务”。

13. queueUpdatingTask 周期性重复第 8 到 12 步  
    副本启动后，后台线程 `queueUpdatingTask()` 会持续运行。  
    它会不断从全局 `/log` 拉新任务到本副本 `/queue`，保证副本能持续追赶主写入、merge、mutation、drop。对应实现见 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:3816)。

14. 副本从内存 queue 里选择一个可执行任务  
    `selectQueueEntry()` 会从队列中挑一个当前最合适执行的 entry。  
    可能的类型包括：
    - `GET_PART`
    - `ATTACH_PART`
    - `MERGE_PARTS`
    - `MUTATE_PART`
    - `DROP_RANGE`
    - `DROP_PART`
    - `ALTER_METADATA`
    等等。对应实现入口在 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:3896)。

15. 根据任务类型分配到不同后台线程池  
    `scheduleDataProcessingJob()` 会按类型把任务发到 fetch pool、merge/mutate pool 或 common task pool。  
    例如：
    - `GET_PART`、`ATTACH_PART` 走 fetch 线程池
    - `MERGE_PARTS`、`MUTATE_PART` 走 merge/mutate 池  
    对应实现见 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:3960)。

16. processQueueEntry 开始真正执行同步任务  
    这个入口会调用 `executeLogEntry()`，根据具体 entry 类型执行复制动作。对应实现见 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:3907)。

17. 如果目标 part 已经存在，则直接跳过  
    对 `GET_PART` / `ATTACH_PART` / `MERGE_PARTS` / `MUTATE_PART` 这类会生成新 part 的 entry，系统先检查本地是否已经有该 part 或覆盖它的更大 part。  
    如果已经有，就认为这项同步实际上已经完成，可以直接跳过。对应逻辑在 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:2303)。

18. 如果任务是 `GET_PART` 或 `ATTACH_PART`，进入 fetch 流程  
    `executeFetch()` 负责副本真正从其他副本把 part 同步过来。对应实现见 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:2400)。

19. 找到拥有该 part 的源副本  
    同步副本会先在 Keeper 的 `/replicas/*/parts` 里查找，看看哪个副本声明自己拥有该 part，或者拥有覆盖它的更大 part。  
    如果没有任何 active replica 有这个 part，就不能 fetch，可能会重试或报 `NO_REPLICA_HAS_PART`。

20. 读取源副本的 `host` 信息  
    副本会从 Keeper 的 `/replicas/<source>/host` 读取 interserver 地址，确定应从哪台机器拉 part 数据。

21. 读取源副本 Keeper 中登记的 checksums / columns  
    在真正 fetch 前，副本会读取源副本 `/replicas/<source>/parts/<part>` 下的 header、`columns`、`checksums` 等元数据，用于后续校验。

22. 如果本地已有等价 part，则优先 clone 而不是走网络 fetch  
    `fetchPart()` 里会先检查本地是否有同 checksum、同 columns hash 的源 part。  
    如果有，就直接 clone/hardlink/copy，避免 HTTP 拉取。对应实现见 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:5153)。

23. 如果本地没有可 clone 的 part，则通过 interserver HTTP 拉取  
    `fetcher.fetchSelectedPart(...)` 会从源副本机器实际下载 part 文件。注意真正的数据文件不是 Keeper 传输，而是副本间 HTTP 传输。对应实现见 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:5211)。

24. 把拉下来的 part 放到本地临时目录  
    无论 clone 还是 HTTP fetch，目标副本都会先把 part 落到本地临时目录，而不是立刻宣布成功。

25. 本地校验 part 完整性  
    会校验：
    - checksums
    - columns
    - part header
    - 覆盖关系
    - 替换掉哪些旧 part  
    只有校验通过，才允许进入正式 commit。

26. 本地把 fetched part rename 成正式 part 并加入 working set  
    `renameTempPartAndReplace()` / `checkPartChecksumsAndCommit()` 会把这个 part 正式安装到本地 active parts 集合里。对应逻辑在 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:5271)。

27. 更新本副本 Keeper 中的 `/replicas/<replica>/parts/<part>`  
    这一步表示“我这个副本现在也拥有该 part 了”。  
    从复制语义上看，副本同步到这里才算真正完成“数据状态追平”。

28. 如果这是 quorum insert 的 part，更新 quorum 状态  
    `fetchPart()` 安装完成后，会检查 Keeper 是否仍在跟踪这个 part 的 quorum。  
    如果是，就调用 `updateQuorum()`，把当前副本加进已确认副本集合。对应逻辑在 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:5319) 和 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:4911)。

29. 如果 quorum 达到要求，删除 quorum znode  
    当确认副本数达到要求时，系统会删除 `/quorum/status` 或 `/quorum/parallel/<part>`。  
    这会让最初发起 insert 的副本从等待中返回成功。

30. 如果同步任务是 `MERGE_PARTS`，副本可能本地执行 merge，也可能直接 fetch merge 结果  
    `MERGE_PARTS` 不一定总是“从别处拉”。有时本副本会按 log 指示在本地把多个 source part merge 成新 part；有时如果别的副本已经 merge 完成，也可以直接 fetch merge 结果。  
    从副本同步视角，它们都属于“让本副本状态追平到 log 所要求的新 part”。

31. 如果同步任务是 `MUTATE_PART`，副本本地执行 mutation 或 fetch mutation 结果  
    这和 merge 类似。  
    目标是让本副本也得到 log 中要求的新 mutated part，从而和其他副本对齐。

32. 如果同步任务是 `DROP_RANGE` / `DROP_PART`，副本会把本地 part 删掉并更新 Keeper 元数据  
    复制不仅是“把 part 拉过来”，也包括“按照全局日志把应该删除的 part 删掉”。  
    所以同步过程也包括 drop 类型任务。

33. 如果副本在执行某个 queue entry 失败，这个 entry 会保留在 queue 里等待后续重试  
    错误信息会记录在 replication queue 状态里，也能通过 `system.replication_queue` 查到。  
    这也是为什么副本同步是“最终收敛”，而不是“一次失败就永久终止”。

34. queue 中的 entry 执行成功后，会被标记完成并从内存可执行状态中移除  
    这样副本继续处理下一个 entry，直到 queue 追平。

35. 如果副本因为 Keeper session 过期进入 readonly，`RestartingThread` 会重新启动这一整套流程  
    即：
    - 重新激活副本
    - 重新装载 queue
    - 重新 pull `/log`
    - 重新确认 quorum 状态  
    这保证副本在网络抖动后仍能恢复同步。

36. `updateQuorumIfWeHavePart()` 会在副本重启后补写 quorum 确认  
    如果某个 part 本地其实已经有了，但因为上次崩溃或 session 断掉没来得及写 quorum，这一步会在启动时补偿更新。对应逻辑在 [ReplicatedMergeTreeRestartingThread.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/MergeTree/ReplicatedMergeTreeRestartingThread.cpp:291)。

37. `removeFailedQuorumParts()` 会在重启时清除失败 quorum 留下的垃圾状态  
    否则副本可能一直带着“不应该保留的 noquorum part”。

38. `SYNC REPLICA` 或等待同步类操作，本质上是在等 queue 追平  
    从源码设计上看，手动等待同步通常不是另起一套复制机制，而是：
    - 先主动 pull `/log` 到 `/queue`
    - 再等待相关 log entry 被本副本处理完成  
    相关等待逻辑可见 [StorageReplicatedMergeTree.cpp](/Users/harvey/Projects/clickhouse-bili-25.5/src/Storages/StorageReplicatedMergeTree.cpp:7298)。

39. 判断“某个副本是否已经同步到某条 log”的核心指标是 `log_pointer`  
    也就是：
    - `log_pointer > 某条 log 的 index`
    表示这个副本至少已经把这条 log 拉进过自己的 queue。  
    但真正“完全同步完成”还要看 queue 中对应任务是否执行完。

40. 一个副本同步闭环可以压缩成一句话  
    “把全局 `/log` 中的事实复制到本副本 `/queue`，再逐条执行 queue entry，通过 fetch / merge / mutate / drop，把本地 parts 和 Keeper 中本副本的 `/parts` 状态追平到全局状态。”

41. 如果从“别人新写了一个 part，我什么时候能同步到”这个角度看，完整链路是  
    - 源副本 insert 成功，在 Keeper `/log/log-*` 写一条新 log  
    - 当前副本 `queueUpdatingTask()` 发现新 log  
    - 当前副本把它复制到自己的 `/queue/queue-*`  
    - 当前副本从 queue 里选到这条 `GET_PART`  
    - 当前副本找到源副本  
    - 当前副本 clone 或 HTTP fetch 该 part  
    - 当前副本本地校验并安装该 part  
    - 当前副本在 Keeper `/replicas/<this_replica>/parts/<part>` 下登记成功  
    - 如果涉及 quorum，再顺手更新 quorum  
    到这里，这个副本就算真正同步完成了。

42. 如果从“副本恢复/重启后如何继续同步”这个角度看，完整链路是  
    - `RestartingThread` 激活副本  
    - 初始化 queue 内存状态  
    - 加载 Keeper 中原有 queue  
    - 为 broken parts 生成 fetch 任务  
    - 从 `/log` 拉漏掉的任务  
    - 持续执行 queue  
    - 必要时补写 quorum  
    - 最终追平全局状态

43. 最短总结  
    ClickHouse `ReplicatedMergeTree` 的副本同步，不是“主从推送文件”，而是“所有副本共享全局 `/log`，各副本把 `/log` 拉到自己的 `/queue`，再按 queue entry 自主 fetch / merge / mutate / drop，最终把自己的本地 part 集合和 Keeper 中本副本元数据追平到同一个全局状态”。如果你愿意，我下一条可以继续给你一个更贴近运维视角的版本：
    1. 直接列出副本同步涉及的 Keeper 路径树
    2. 直接画出 `源副本 / Keeper / 目标副本` 的三方时序图