# Explain

EXPLAIN PLAN，查询的执行计划。

| 参数            | 默认值 | 作用                   |
| ------------- | --- | -------------------- |
| `header`      | `0` | 显示每个步骤输出字段头结构（列名、类型） |
| `description` | `1` | 显示节点的文字说明            |
| `indexes`     | `0` | 显示涉及的索引信息            |
| `actions`     | `0` | 显示算子内部更细粒度动作（如投影、过滤） |
| `json`        | `0` | 以 JSON 输出整个 Plan     |

---

EXPLAIN PIPELINE，查询的执行流水线，描述执行过程中各个 Processor 以及数据流方向，不同于 Plan 更接近执行层。

| 参数        | 默认值 | 作用                    |
| --------- | --- | --------------------- |
| `header`  | `0` | 显示每个端口的数据结构           |
| `graph`   | `0` | 输出 DOT 图（Graphviz 格式） |
| `compact` | `1` | 图是否压缩（compact 模式）     |

---

EXPLAIN AST, 抽象语法树，反映 SQL 如何被解析成内部结构。

---

EXPLAIN QUERY TREE，经过 QUERY TREE 优化器处理后的树形结构，由 AST 转换后解析出具体逻辑并应用优化 passes。

| 参数            | 默认值  | 说明                        |
| ------------- | ---- | ------------------------- |
| `run_passes`  | `1`  | 是否运行所有 Query Tree 优化 Pass |
| `passes`      | `-1` | 指定运行多少个 Pass；`-1`=全部      |
| `dump_passes` | `0`  | 是否打印每个 Pass 名称            |
| `dump_tree`   | `1`  | 是否输出最终 Query Tree         |
| `dump_ast`    | `0`  | 是否输出 Query Tree 转回的 AST   |

---

EXPLAIN ESTIMATE，预计要处理的行数、marks、data parts 等估算数据规模。
