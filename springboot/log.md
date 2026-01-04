# log

SpringBoot 默认 SLF4j + Logback

```shell
# 日期 日志级别 进程号 --- [线程名] 类 : 消息
2023-07-01T21:05:32.925+08:00 INFO 44396 --- [main] o.apache.catalina.core.StandardService : Starting service [Tomcat]
```

获取 Logger Obj

```java
Logger log = LoggerFactory.getLogger(getClass());
log.info("name: {}, age: {}", "sun", 18);
```

# log level

log level: OFF < FATAL < ERROR < INFO < WARN < DEBUG < TRACE < ALL

high lev log 包含 low lev log (eg. 指定 WARN, 就会输出 FATAL, ERRO, INFO, WARN 的 log)

```properties
# global log level (def. INFO)
logging.level.root = debug

# local log level
logging.level.com.harvey.controller.UserController = warn

# group log level, sql group 包含 org.springframework.jdbc.core, org.hibernate.SQL, org.jooq.tools.LoggerListener
logging.level.sql=debug
```

# output to file

```properties
# output to project/test.log
logging.file.name=test.log

# output to /Users/HarveySuen/Downloads/test.log
logging.file.name=/Users/HarveySuen/Downloads/test.log
```

# rolling policy

```properties
# 每天 log 归档到不同的 file 中 (def. ${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz)
logging.logback.rollingpolicy.file-name-pattern=${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz

# 每个文件最大 10MB, 如果超出容量, 就切割到第新文件中 (def. 7MB)
logging.logback.rollingpolicy.max-file-size = 10MB

# 系统启动后, 自动清除之前日志 (def. false)
logging.logback.rollingpolicy.clean-history-on-start = true

# 日志最大占用 1GB 磁盘容量, 超出后清空日志 (def. 0B)
logging.logback.rollingpolicy.total-size-cap = 1GB

# 最大保存 10 天, 超出后自动清除日志 (def. 7)
logging.logback.rollingpolicy.max-history = 10
```

# log pattern

```properties
# console log pattern
logging.pattern.console = %d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%thread] %logger{15} ===> %msg%n

# file log pattern
logging.pattern.file = %d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%thread] %logger{15} ===> %msg%n

# date pattern
logging.pattern.dateformat = yyyy-MM-dd HH:mm:ss.SSS
```

# custom log

pom.xml

```xml
<!-- exclude SpringBoot default log -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```

log4j2-spring.xml, 通过 \*-spring.xml 代替 application.properties 配置 log

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <loggers>
        <!-- log lev: TRACE < DEBUG < INFO < WARN < ERROR < FATAL -->
        <root level="DEBUG">
            <!-- 导入 appenders 中的 ConsoleLog, FileLog, RollingFileLog -->
            <appender-ref ref="ConsoleLog"/>
            <appender-ref ref="FileLog"/>
            <appender-ref ref="RollingFileLog"/>
        </root>
    </loggers>

    <appenders>
        <!-- console log -->
        <console name="ConsoleLog" target="SYSTEM_OUT">
            <!-- log format -->
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss SSS} [%t] %-3level %logger{1024} - %msg%n"/>
        </console>

        <!-- file log -->
        <File name="FileLog" fileName="/Users/HarveySuen/Project/spring-demo/spring-demo1/log/test1.log" append="false">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} %-5level %class{36} %L %M - %msg%xEx%n"/>
        </File>

        <!-- file log config -->
        <RollingFile name="RollingFileLog"
                     fileName="/Users/HarveySuen/Project/spring-demo/spring-demo1/log/test2.log"
                     filePattern="log/$${date:yyyy-MM}/app-%d{MM-dd-yyyy}-%i.log.gz"
        >
            <PatternLayout pattern="%d{yyyy-MM-dd 'at' HH:mm:ss z} %-5level %class{36} %L %M - %msg%xEx%n"/>
            <!-- over 50MB, auto compress -->
            <SizeBasedTriggeringPolicy size="50MB"/>
            <!-- max file num (def. 7) -->
            <DefaultRolloverStrategy max="20"/>
        </RollingFile>
    </appenders>
</configuration>
```

调用 Logger API

```java
private final Logger log = LoggerFactory.getLogger(UserService.class);

public void show() {
    log.info("hello world");
}
```


















