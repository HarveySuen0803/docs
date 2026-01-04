# ShardingSphere

ShardingSphere 是一个开源的分布式数据库中间件生态系统，其主要功能包括分库分表、读写分离、分布式事务和数据治理等。ShardingSphere JDBC 是 ShardingSphere 的一个子项目，提供了一个轻量级的 JDBC 层解决方案，旨在通过 JDBC 驱动的方式实现分库分表和读写分离等功能。

# ShardingSphere JDBC

ShardingSphere JDBC 通过在应用程序和数据库之间插入一个 JDBC 层，拦截并处理 SQL 请求，从而实现透明的分库分表和读写分离。它支持多种数据库（如 MySQL、PostgreSQL、Oracle 等），并且可以与 Spring Boot 等框架无缝集成。

ShardingSphere JDBC 的主要功能:

- 分库分表：将数据水平拆分到多个数据库和表中，以提高系统的扩展性和性能。
- 读写分离：将读请求和写请求分配到不同的数据库实例，以提高读写性能。
- 分布式事务：支持分布式事务管理，确保数据的一致性和完整性。
- 数据治理：提供数据加密、脱敏等数据治理功能，以增强数据的安全性。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202407290752330.png)

# ShardingSphere Proxy

ShardingSphere Proxy 是 Apache ShardingSphere 提供的一个透明化数据库代理层。它通过代理数据库请求来实现分库分表、读写分离、分布式事务等功能。与 ShardingSphere JDBC 不同，ShardingSphere Proxy 是一个独立的进程，位于应用程序和数据库之间，应用程序无需修改代码即可使用其提供的功能。

ShardingSphere Proxy 的主要功能：

- 分库分表：自动将数据分布到多个数据库和表中。
- 读写分离：将读请求和写请求分配到不同的数据库实例，提高读写性能。
- 分布式事务：支持分布式事务管理，确保数据一致性。
- 数据治理：提供数据加密、脱敏等数据治理功能。
- 透明代理：应用程序通过标准的 JDBC 或 MySQL 协议连接到 ShardingSphere Proxy，无需修改代码。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202407290752661.png)

