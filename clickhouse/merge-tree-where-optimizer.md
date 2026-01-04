# MergeTreeWhereOptimizer

MergeTreeWhereOptimizer 是 ClickHouse 中负责 WHERE 条件优化的核心组件，主要功能是将部分 WHERE 条件下推到 PREWHERE，从而在数据读取阶段就进行过滤，大幅减少需要处理的数据量。

MergeTreeWhereOptimizer 的基础使用：

```cpp
// 在 InterpreterSelectQuery 中的使用
if (try_move_to_prewhere && storage && storage->canMoveConditionsToPrewhere() && 
    query.where() && !query.prewhere())
{
    if (const auto & column_sizes = storage->getColumnSizes(); !column_sizes.empty())
    {
        // 提取列压缩大小信息
        std::unordered_map<std::string, UInt64> column_compressed_sizes;
        for (const auto & [name, sizes] : column_sizes)
            column_compressed_sizes[name] = sizes.data_compressed;

        // 创建并运行优化器
        MergeTreeWhereOptimizer optimizer{
            current_info,
            context, 
            std::move(column_compressed_sizes),
            metadata_snapshot,
            syntax_analyzer_result->requiredSourceColumns(),
            log
        };
        // 优化器在构造函数中自动执行优化
    }
}
```

```sql
-- 优化前，所有条件都在 WHERE 中
SELECT user_id, product_id, amount, order_date
FROM orders 
WHERE order_date >= '2023-01-01' 
  AND order_date <= '2023-12-31'
  AND status = 'completed'
  AND amount > 100
  AND user_id IN (SELECT user_id FROM premium_users);

-- 优化后，高选择性的简单条件移动到 PREWHERE，复杂条件保留在 WHERE
PREWHERE status = 'completed' AND amount > 100
WHERE order_date >= '2023-01-01' 
  AND order_date <= '2023-12-31'
  AND user_id IN (SELECT user_id FROM premium_users)
```