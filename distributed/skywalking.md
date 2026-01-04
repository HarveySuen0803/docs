# SkyWalking

APM (application performance management): 对 service 进行 monitoring 实现 performance management 和 fault management

SkyWalking 提供了全链路追踪, 拓扑分析, 性能指标分析等, 帮助从整体层面理解架构. 提供了接口响应速度的统计, 从而针对性的分析和优化接口. 可以设置告警规则, 线上项目出现问题后, 会第一时间发送邮件或短信通知运维人员

APM implement

- log (eg. ELK Stack)
- metrics (eg. Prometheus)
- trace (eg. SkyWalking)

architecture

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241754874.png)

- tracing, methrics, logging, event detector 发送 data 给 transport layer
- trasport layer 传输 data 给 receiver cluster, 显示在 GUI 中, 再通过 aggregator cluster 处理 data

SkyWalking component

- Agent: 实现 non-invasive enhancement
- OAP: 通过 analysis core 接受 data, 进行 flow analysis, 将 result 写入 storage, 通过 query core 处理 request, 查询 data, 响应 data
- Storage: 通过 ElasticSearch, H2, Mysql 实现 persistence

# install SkyWalking APM

download SkyWalking APM

```shell
curl -LJO https://dlcdn.apache.org/skywalking/9.2.0/apache-skywalking-apm-9.2.0.tar.gz
```

set JDK version

```shell
export PATH=/usr/local/lib/jdk-17/bin:$PATH
```

create database

```sql
CREATE DATABASE `swtest`
```

connect to mysql (file: config/application.yml)

```shell
storage:
  selector: ${SW_STORAGE:mysql}
  mysql:
    properties:
      jdbcUrl: ${SW_JDBC_URL:"jdbc:mysql://localhost:3306/swtest?rewriteBatchedStatements=true&allowMultiQueries=true"}
      dataSource.user: ${SW_DATA_SOURCE_USER:root}
      dataSource.password: ${SW_DATA_SOURCE_PASSWORD:111}
      dataSource.cachePrepStmts: ${SW_DATA_SOURCE_CACHE_PREP_STMTS:true}
      dataSource.prepStmtCacheSize: ${SW_DATA_SOURCE_PREP_STMT_CACHE_SQL_SIZE:250}
      dataSource.prepStmtCacheSqlLimit: ${SW_DATA_SOURCE_PREP_STMT_CACHE_SQL_LIMIT:2048}
      dataSource.useServerPrepStmts: ${SW_DATA_SOURCE_USE_SERVER_PREP_STMTS:true}
    metadataQueryMaxSize: ${SW_STORAGE_MYSQL_QUERY_MAX_SIZE:5000}
    maxSizeOfBatchSql: ${SW_STORAGE_MAX_SIZE_OF_BATCH_SQL:2000}
    asyncBatchPersistentPoolSize: ${SW_STORAGE_ASYNC_BATCH_PERSISTENT_POOL_SIZE:4}
```

add mysql driver

```shell
mv ./packages/mysql-connector-j-8.0.31.jar ./services/skywalking/oap-libs/mysql-connector.jar
```

set port (file. webapp/application.yml)

```yaml
serverPort: ${SW_SERVER_PORT:-8868}
```

startup SkyWalking

```shell
sh bin/oapService.sh

sh bin/webappService.sh
```

access http://127.0.0.1:8868

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241754875.png)

# install SkyWalking Agent

download SkyWalking Agent

```shell
curl -LJO https://dlcdn.apache.org/skywalking/java-agent/9.0.0/apache-skywalking-java-agent-9.0.0.tgz
```

add JVM option to services to connect to SkyWalking-APM

```shell
-javaagent:/opt/skywalking-agent/skywalking-agent.jar
-Dskywalking.agent.service_name=user-service
-Dskywalking.collector.backend_service=127.0.0.1:11800
```

add gateway-plugin

```shell
cp ./optional-plugins/apm-spring-cloud-gateway-3.x-plugin-9.0.0.jar ./plugins
```

check service info

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241754876.png)

# customize trace

import dependency

```xml
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-toolkit-trace</artifactId>
    <version>9.0.0</version>
</dependency>
```

customize trace

```java
// identify method to be tracked
@Trace
// show return value and arguments
@Tags({@Tag(key = "return", value = "returnedObj"), @Tag(key = "id", value = "arg[0]"), @Tag(key = "name", value = "arg[1]")})
@Override
public String test(Integer id, String name) {
    return "hello world";
}
```

check trace

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241754877.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241754878.png)

# self monitor

configure self monitor (file. config/application.yml)

```yaml
telemetry:
  selector: ${SW_TELEMETRY:prometheus}
  none:
  prometheus:
    host: ${SW_TELEMETRY_PROMETHEUS_HOST:0.0.0.0}
    port: ${SW_TELEMETRY_PROMETHEUS_PORT:1234}
    sslEnabled: ${SW_TELEMETRY_PROMETHEUS_SSL_ENABLED:false}
    sslKeyPath: ${SW_TELEMETRY_PROMETHEUS_SSL_KEY_PATH:""}
    sslCertChainPath: ${SW_TELEMETRY_PROMETHEUS_SSL_CERT_CHAIN_PATH:""}
```

# trace profile

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241754879.png)

# collect log

import dependency

```xml
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-toolkit-logback-1.x</artifactId>
    <version>8.16.0</version>
</dependency>
```

set logback config (logback.xml)

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration scan="true" scanPeriod=" 5 seconds">
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
            <layout class="org.apache.skywalking.apm.toolkit.log.logback.v1.x.mdc.TraceIdMDCPatternLogbackLayout">
                <Pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%X{tid}] [%thread] %-5level %logger{36} -%msg%n</Pattern>
            </layout>
        </encoder>
    </appender>
    
    <appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
        <discardingThreshold>0</discardingThreshold>
        <queueSize>1024</queueSize>
        <neverBlock>true</neverBlock>
        <appender-ref ref="STDOUT"/>
    </appender>
    
    <appender name="grpc-log" class="org.apache.skywalking.apm.toolkit.log.logback.v1.x.log.GRPCLogClientAppender">
        <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
            <layout class="org.apache.skywalking.apm.toolkit.log.logback.v1.x.mdc.TraceIdMDCPatternLogbackLayout">
                <Pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%X{tid}] [%thread] %-5level %logger{36} -%msg%n</Pattern>
            </layout>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="ASYNC"/>
        <appender-ref ref="grpc-log"/>
    </root>
</configuration>
```

check console

```console
2023-09-18 14:34:29.284 [TID:N/A] [main] WARN  c.a.n.client.logging.NacosLogging -Load Logback Configuration of Nacos fail, message: Could not initialize Logback Nacos logging from classpath:nacos-logback.xml
2023-09-18 14:34:29.285 [TID:N/A] [background-preinit] INFO  o.h.validator.internal.util.Version -HV000001: Hibernate Validator 8.0.0.Final
2023-09-18 14:34:29.425 [TID:N/A] [main] WARN  c.a.n.client.logging.NacosLogging -Load Logback Configuration of Nacos fail, message: Could not initialize Logback Nacos logging from classpath:nacos-logback.xml
2023-09-18 14:34:29.430 [TID:N/A] [main] INFO  com.harvey.GatewayApplication -Starting GatewayApplication using Java 17.0.8.1 with PID 40260 (/Users/HarveySuen/Projects/spring-cloud-demo/gateway/target/classes started by harvey in /Users/HarveySuen/Projects/spring-cloud-demo)
2023-09-18 14:34:29.431 [TID:N/A] [main] INFO  com.harvey.GatewayApplication -No active profile set, falling back to 1 default profile: "default"
...
```

check log on dashboard

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241754880.png)





