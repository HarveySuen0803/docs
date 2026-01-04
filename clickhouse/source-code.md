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