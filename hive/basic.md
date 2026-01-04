## Hive 介绍

Hive 是一个基于 Hadoop 的数据仓库基础设施，它提供了一个类 SQL 的接口来查询和管理存储在 Hadoop 分布式文件系统 (HDFS) 中的大量数据。Hive 主要用于数据仓库和分析任务，特别适用于处理结构化和半结构化数据。

Hive 通过映射的方式将表映射到存储在 HDFS 中的文件上。具体来说，Hive 表可以是内部表（Managed Table）或外部表（External Table），两者在数据存储和管理方面有所不同，但都涉及到将表结构映射到 HDFS 文件上。

## Hive 三层结构

接口层：Hive 提供了类 SQL 的查询语言 HiveQL，使用户可以通过 SQL 语法来查询和操作存储在 HDFS 中的数据，而无需编写复杂的 MapReduce 程序。

处理层：将用户提交的 HiveQL 查询转换为底层的 MapReduce 任务（或者 Tez、Spark 任务），并在 Hadoop 集群上执行这些任务。

存储层：Hive 将数据存储在 HDFS 中，并且可以管理这些数据的元数据（如表结构、分区信息等）。

## Hive 架构原理

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202409010853332.png)

1. 用户通过 Hive Client 提交 HQL
2. Hive Driver 解析 HQL，将 HQL 转成 MapReduce 程序，提交到 Yarn 上执行，再将执行结果返回给客户端。
3. Metastore 负责提供元数据管理，存储了表到 HDFS 的映射关系。

## Hive Metastore 介绍

元数据是用于描述数据的数据，它描述了数据的结构、存储位置、格式等信息，往往包括以下几类信息：

- 表定义：表名，列名及其数据类型，表的分区信息，表的存储格式（如文本文件、ORC、Parquet 等），表的行格式（如字段分隔符）
- 存储信息：数据存储位置（HDFS 路径），文件格式和压缩方式
- 其他信息：表的所有者，创建和修改时间，表的访问权限

元数据管理的重要性：

- 查询优化：Hive 使用元数据来优化查询计划。例如，通过列裁剪和谓词下推来减少数据扫描的范围，从而提高查询效率。
- 数据管理：元数据使得 Hive 能够高效地管理和查询大规模数据集。通过元数据，Hive 可以快速定位存储在 HDFS 中的数据文件。
- 数据一致性：Hive Metastore 确保表结构和数据存储位置的一致性，使得用户可以方便地进行数据管理和查询操作。

Hive 通过 Hive Metastore 组件来管理表的元数据。Hive Metastore 是一个关键组件，它使得 Hive 能够将表结构映射到存储在 HDFS 中的实际数据文件，并支持高效的查询和管理操作。通过元数据管理，Hive 提供了一个强大的工具来处理和分析大规模数据集。

## Hive Metastore 工作原理

Hive Metastore 通常使用关系型数据库（如 MySQL、PostgreSQL）来存储元数据。Hive 通过 Metastore API 与元数据存储进行交互，管理表的创建、删除、修改等操作。

---

假设我们有一个存储在 HDFS 中的销售数据文件，包含产品 ID、销售日期和销售金额。我们希望在 Hive 中创建一个表来管理和查询这些数据。

首先，我们将销售数据文件上传到 HDFS 中。例如，文件 sales_data.txt 存储在 /user/hive/warehouse/sales_data/ 目录下。

```shell
hdfs dfs -put sales_data.txt /user/hive/warehouse/sales_data/
```

我们在 Hive 中创建一个外部表来映射到存储在 HDFS 中的销售数据文件。

```sql
CREATE EXTERNAL TABLE IF NOT EXISTS sales_data (
    product_id STRING,
    sale_date STRING,
    sale_amount DOUBLE
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
LOCATION '/user/hive/warehouse/sales_data/';
```

创建表后，Hive Metastore 中会存储以下元数据信息：

```
表定义:
  表名: sales_data
  列定义: 
    product_id (STRING)
    sale_date (STRING)
    sale_amount (DOUBLE)
  行格式: 使用逗号分隔字段
存储信息:
  数据存储位置: /user/hive/warehouse/sales_data/
  文件格式: 文本文件
其他信息:
  表的所有者: 当前用户
  创建时间: 表创建的时间戳
```

我们可以使用 HiveQL 查询这张表，例如统计每个产品的销售总额。

```
SELECT product_id, SUM(sale_amount) AS total_sales
FROM sales_data
GROUP BY product_id;
```

- 当用户提交查询请求时，Hive 使用 Metastore 中存储的元数据来解析查询计划，并将查询转换为底层的 MapReduce、Tez 或 Spark 任务。

## Hive Driver 介绍

Hive Driver 是 Hive 架构中的一个关键组件，它负责将用户提交的 HiveQL 查询转换为可以在 Hadoop 集群上执行的任务，并管理整个查询的执行流程。Hive Driver 是连接用户接口（如 Hive CLI、JDBC/ODBC 客户端）和底层执行引擎（如 MapReduce、Tez、Spark）的桥梁。

Hive Driver 的核心组件：

- SQLParser（解析器）: 将 HiveQL 查询解析成抽象语法树 (AST)。
- Semantic Analyzer（语义分析器）: 对解析后的 AST 进行语义分析，将 AST 划分为 QueryBlock，生成逻辑执行计划。
- Logical Plan Gen（逻辑计划生成器）: 生成逻辑执行计划。
- Logical Optimizer（逻辑优化器）: 对逻辑执行计划进行优化，包括谓词下推、列裁剪等优化操作。
- Physical Plan Gen（物理计划生成器）: 将优化后的逻辑执行计划转换为物理执行计划。
- Physical Optimizer（物理优化器）: 进一步优化物理执行计划。
- Execution（执行器）: 将物理执行计划转换为底层的执行任务（如 MapReduce 任务），并在 Hadoop 集群上执行这些任务。

## Hive Driver 工作流程

以下是 Hive Driver 处理一个 HiveQL 查询的典型工作流程：

1. 接收查询：用户通过 Hive CLI 或其他客户端提交一个 HiveQL 查询。
2. 解析查询：Hive Driver 使用解析器将 HiveQL 查询解析成抽象语法树 (AST)。
3. 优化查询：优化器对 AST 进行优化，生成优化后的逻辑执行计划。这一步可能包括谓词下推、列裁剪等优化操作。
4. 生成执行计划：将优化后的逻辑执行计划转换为物理执行计划。物理执行计划描述了具体的执行步骤和所需的资源。
5. 执行任务：将物理执行计划转换为底层的执行任务（如 MapReduce 任务），并提交到 Hadoop 集群执行。Hive Driver 负责管理这些任务的执行，包括任务调度、监控、重试等。
6. 返回结果：在任务执行完成后，Hive Driver 将查询结果返回给用户。

---

假设用户提交了一个简单的 HiveQL 查询来统计销售数据中的每个产品的销售总额：

```sql
SELECT product_id, SUM(sale_amount) AS total_sales
FROM sales_data
GROUP BY product_id;
```

Hive Driver 的处理流程

1. 接收查询：用户通过 Hive CLI 提交上述查询。
2. 解析查询：Hive Driver 使用解析器将查询解析成抽象语法树 (AST)。
3. 优化查询：优化器对 AST 进行优化，例如将 SUM(sale_amount) 的计算提前到 Map 阶段，以减少数据传输量。
4. 生成执行计划：将优化后的逻辑执行计划转换为物理执行计划。这可能包括一个 Map 阶段来计算每个产品的部分销售总额，以及一个 Reduce 阶段来汇总结果。
5. 执行任务：将物理执行计划转换为 MapReduce 任务，并提交到 Hadoop 集群执行。Hive Driver 监控任务的执行进度，处理可能出现的错误和重试。
6. 返回结果：在任务执行完成后，Hive Driver 将查询结果返回给用户。

## AST 介绍

抽象语法树（Abstract Syntax Tree，简称 AST）是编程语言编译器或解释器在解析源代码时生成的一种树状数据结构。它表示源代码的语法结构，并抽象出其中的各种语法元素及其层次关系。

AST 的特点

- 抽象性：AST 只保留了源代码中重要的语法信息，去除了不必要的细节（如空白字符、注释等）。因此，它比源代码更简洁，但仍然保留了程序的逻辑结构。
- 层次性：AST 具有层次结构，树的每个节点代表一个语法元素（如表达式、语句、操作符等），节点之间的层次关系反映了语法元素的嵌套和组合关系。
- 结构化：AST 以树的形式组织语法元素，使得编译器或解释器能够方便地对程序进行分析、优化和转换。

AST 的组成

- 根节点（Root Node）：代表整个程序或代码段的起始点。
- 内部节点（Internal Nodes）：代表复杂的语法结构，如表达式、语句块、函数定义等。
- 叶节点（Leaf Nodes）：代表基本语法元素，如变量、常量、操作符等。

AST 的生成过程

- 词法分析（Lexical Analysis）：将源代码转换为一系列标记（Tokens），每个标记代表一个基本的语法单元（如关键字、标识符、操作符等）。
- 语法分析（Syntax Analysis）：根据词法分析生成的标记序列，构建抽象语法树。语法分析器（Parser）根据语言的语法规则，识别出各种语法结构，并将其组织成树状结构。

AST 的作用

- 语法检查：通过 AST，可以检查源代码是否符合语言的语法规则，发现语法错误。
- 语义分析：对 AST 进行语义检查，确保程序的逻辑正确性。例如，检查变量是否已声明、类型是否匹配等。
- 代码优化：编译器可以通过分析和转换 AST，对程序进行各种优化，如常量折叠、循环展开、死代码消除等。
- 代码生成：根据 AST 生成目标代码或中间代码。例如，编译器可以将 AST 转换为机器代码或字节码，解释器可以直接解释执行 AST。

---

假设我们有以下简单的 HiveQL 查询：

```sql
SELECT product_id, SUM(sale_amount) AS total_sales
FROM sales_data
WHERE sale_date > '2023-01-01'
GROUP BY product_id;
```

这个查询的 AST 可能如下：

```
SELECT
|
+-- SELECT_LIST
|   |
|   +-- COLUMN: product_id
|   +-- ALIAS: total_sales
|       |
|       +-- FUNCTION: SUM
|           |
|           +-- COLUMN: sale_amount
|
+-- FROM
|   |
|   +-- TABLE: sales_data
|
+-- WHERE
|   |
|   +-- CONDITION: sale_date > '2023-01-01'
|
+-- GROUP_BY
    |
    +-- COLUMN: product_id
```

- 根节点 是 SELECT，表示这是一个 SELECT 查询。
- 内部节点 包括 SELECT_LIST、FROM、WHERE 和 GROUP_BY，分别表示查询的各个部分。
- 叶节点 包括列名、表名、条件和函数等基本语法元素。

## QueryBlock 介绍

QueryBlock 是 Hive 查询处理过程中一个重要的概念，特别是在 Hive Driver 的语义分析阶段。

QueryBlock 是一个逻辑结构，用于表示 SQL 查询的一个独立部分。每个 QueryBlock 包含了一组查询操作（如选择、过滤、分组、排序等），以及这些操作所作用的数据表或子查询。在一个复杂的 SQL 查询中，可能包含多个查询块。例如，带有子查询的查询可以分解为多个 QueryBlock，每个 QueryBlock 处理查询的一部分。

抽象语法树 (AST) 是 SQL 解析器生成的树状结构，表示 SQL 查询的语法结构。AST 包含了查询的所有元素（如表、列、表达式、子查询等），以及它们之间的层次关系。在解析过程中，SQL 查询被解析成 AST，AST 中的每个节点表示查询的一个组成部分。QueryBlock 是从 AST 中提取的逻辑单元，它将 AST 中的一部分节点组合在一起，形成一个独立的查询块。

语义分析器（Semantic Analyzer）在处理 AST 时，会识别和处理各个 QueryBlock，确保每个查询块的逻辑正确性。语义分析器对每个 QueryBlock 进行以下操作：

- 语法检查：检查 QueryBlock 中的语法结构，确保其符合 SQL 语法规则。
- 类型检查和转换：检查 QueryBlock 中的表达式和操作符的类型，确保类型正确，并插入必要的类型转换操作。
- 表和列验证：验证 QueryBlock 中引用的表和列是否存在，并检查用户的访问权限。
- 查询重写和优化：对 QueryBlock 进行优化，如谓词下推、列裁剪、连接重排序等。
- 生成逻辑执行计划：为每个 QueryBlock 生成逻辑执行计划，描述查询的执行步骤和操作顺序。

## Logic Plain 介绍

逻辑计划（Logical Plan）是数据库系统和大数据处理引擎（如 Hive、Spark）在查询优化和执行过程中使用的一种中间表示。它描述了查询的逻辑执行步骤，而不涉及具体的物理执行细节。逻辑计划强调的是查询操作的顺序和数据流，而不是具体的执行方式和执行环境。

逻辑计划的作用：

- 抽象查询操作：逻辑计划提供了一种抽象的方式来表示查询操作，如选择、投影、连接、分组、排序等。这些操作独立于底层的物理执行细节。
- 优化查询：逻辑计划是查询优化器进行优化的基础。优化器可以对逻辑计划进行各种优化操作，如谓词下推、列裁剪、连接重排序等，以生成更高效的执行计划。
- 生成物理计划：逻辑计划是生成物理计划的基础。物理计划描述了具体的执行步骤和使用的算法（如哈希连接、排序连接等），以及执行环境（如 MapReduce、Tez、Spark 等）。

逻辑计划通常由一系列逻辑操作符组成，每个操作符表示一个查询操作。常见的逻辑操作符包括：

- Scan（扫描）：表示从数据源（如表或文件）读取数据。
- Project（投影）：表示选择查询中的特定列。
- Filter（过滤）：表示应用过滤条件（如 WHERE 子句）。
- Join（连接）：表示对两个或多个数据集进行连接操作（如 INNER JOIN、LEFT JOIN 等）。
- GroupBy（分组）：表示对数据集进行分组操作（如 GROUP BY 子句）。
- Aggregate（聚合）：表示对数据集进行聚合计算（如 SUM、COUNT 等）。
- Sort（排序）：表示对数据集进行排序操作（如 ORDER BY 子句）。

---

假设我们有以下简单的 HiveQL 查询：

```sql
SELECT product_id, SUM(sale_amount) AS total_sales
FROM sales_data
WHERE sale_date > '2023-01-01'
GROUP BY product_id;
```

这个查询的逻辑计划可能如下：

```
LogicalPlan
|
+-- Filter (sale_date > '2023-01-01')
|   |
|   +-- Scan (sales_data)
|
+-- GroupBy (product_id)
|   |
|   +-- Aggregate (SUM(sale_amount))
|
+-- Project (product_id, total_sales)
```

-  **Scan** 操作表示从 `sales_data` 表读取数据。
-  **Filter** 操作表示应用过滤条件 `sale_date > '2023-01-01'`。
-  **GroupBy** 操作表示按 `product_id` 分组。
-  **Aggregate** 操作表示计算每个 `product_id` 的销售总额 `SUM(sale_amount)`。
-  **Project** 操作表示选择 `product_id` 和计算的 `total_sales` 列。

## 执行优化

### 谓词下推

谓词下推（Predicate Pushdown）通过将过滤条件（谓词）尽可能提前到数据源读取阶段，以减少数据处理量，提高查询执行效率。这种优化可以显著减少需要处理的数据量，从而加快查询速度。

