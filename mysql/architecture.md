# Architecture

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241726446.png)

MySQL 基于 CS Arch, Client (eg: JDBC, ODBC) 发送一段 SQL 给 Server (eg: mysqld), Server 返回处理结果给 Client

Connection Layer 负责管理 Connection, Validation, Authorization. Client 和 Connection Layer 建立 TCP Connection 后, 会对 User 进行 Validation. 如果不通过, 就会返回 Error (Access denied for users). 如果通过, 就会进行 Authorization, 并创建一个 Thread 监听处理 Client Request.

Connection Layer 通过 Connection Pool 实现 Connection, 避免频繁的 Creation 和 Destroy

Service Layer 包含 MySQL 的大多数核心功能 (eg: Query Caching, SQL Parsing, SQL Analysis, SQL Optimizing, Built-in Function), 所有的 Cross Storage Engine 的 Function 都是在这实现的 (eg: Stored Procedure, Trigger, View).

Storage Engine Layer 负责 Data Storage 和 Data Extraction, 支持多种 Storage Engine (eg: InnoDB,MyISAM, Memory).

MySQL 执行 SQL, 需要 Client 和 Connector 建立连接, 接着依次执行 Query Caching, SQL Parsing, SQL Preprocessing, SQL Optimization, SQL Execution.

# Query Caching

Query Caching 可以将一条 SQL 作为 key, 将处理结果作为 value, 缓存起来. 下次查询, 会先查询 Cache 中是否有匹配 key 的, 如果有直接返回 value, 就不需要做接下来的操作了

MySQL 8 删除了 Query Caching. Cache Hit Ratio 太低, 要求 key 完全相同比较困难. 如果修改数据后, 缓存更行不及时, 会导致脏数据

查询 Query Caching 状态

```sql
show variable like 'query_cache_type';

show status like '%Qcache%';
```

开启 Query Caching

```sql
-- Enable Query Caching
--   0  OFF
--   1  ON
--   2  DEMAND
set global query_cache_type = 1;

set global query_cache_size = 600000;
```

如果 query_cache_type 设置为 2, 则可以通过关键字按需查询

```sql
set global query_cache_type = 2;
```

```sql
select sql_cache * from emp;

select sql_no_cache * from emp;
```

# SQL Parsing

SQL Parsing 是对 SQL 进行 Preprocessing 和 Parsing, 提取 Keyword, 先进行 Lexical Analysis, 再进行 Syntax Analysis, 生成一个 AST, 接着优化 AST, 生成 Physical Planning.

Lexical Analysis 是将 SQL 分成一系列的词元和标记, 识别出每个字符串代表什么.

Syntax Analysis 是将对输入的 SQL 进行语法校验.

# SQL Preprocessing

进行一些基本的检查 (eg: 检查表和字段是否存在, 用户是否有权限访问目标数据), 此阶段可能会对 AST 进行树的改写以进行一些优化

# SQL Optimization

接收到 Physical Planning 进行 LQO 和 PQO, 找到最好的执行计划后.

LQO (Logical Query Optimization) 更改查询方式, 以提高效率, 就是这里更改了 SQL 的执行顺序.

PQO (Physical Query Optimization) 通过 Index 和 Table Join 进行优化.

# SQL Execution

接收到 Physical Planning 后, 进行权限检查, 执行查询, 处理结果集, 如果遇到错误, 需要进行错误处理.

# AST

AST (Abstract Syntax Tree) 是对 SQL 语句的结构化解析表示, AST 将 SQL 语句进行抽象化解析, 将其转换为一个树形结构, 这种结构能够反映出 SQL 语句中各元素 (eg: 关键字、表达式、函数、操作符) 之间的逻辑关系.

MySQL 的源代码中有对 SQL 语句进行解析并生成 AST 的部分, 但对 AST 的直接操作和查看并不像某些语言 (eg: JavaScript) 的 AST 工具那样普遍和容易. 目前可以使用 [sql-ast](https://github.com/aleclarson/sql-ast), 可以将来自 `mysqldump` 的输出解析为 AST.