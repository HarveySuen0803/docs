# Other

Spring SPI

- https://www.bilibili.com/video/BV1pe411X7Bq/?spm_id_from=333.337.search-card.all.click&vd_source=2b0f5d4521fd544614edfc30d4ab38e1

加载配置文件

- 自定义 ClassLoader 加载 jar
- 将 JAR 放到 JRE 扩展目录中
- 将 JAR 放到 classpath 中

# Basic

Java SPI (Service Provider Interface) 机制是一种服务发现机制, 它用于允许服务接口查找与加载服务的实现, 这个机制广泛用于 Java 的核心 API 和许多 Java 库 (eg: JDBC Driver, Log Service)

> log-base module

log-base module 结构

```txt
+ java
  + com
    + harvey
      + service
        + LogService.java
+ resource
```

配置 LogService

```java
public interface LogService {
    void log(String msg);
}
```

> log-plugin-01 module

log-plugin-01 module 结构

```txt
+ java
  + com
    + harvey
      + service
        + LogServiceImpl01.java
        + LogServiceImpl02.java
+ resource
  + META-INF
    + services
      + com.harvey.service.LogService
```

导入 log-base module

```xml
<dependency>
    <groupId>com.harvey</groupId>
    <artifactId>log-base</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

实现 LogService

```java
public class LogServiceImpl01 implements LogService {
    @Override
    public void log(String msg) {
        System.out.println("LogServiceImpl01: " + msg);
    }
}
```

```java
public class LogServiceImpl02 implements LogService {
    @Override
    public void log(String msg) {
        System.out.println("LogServiceImpl02: " + msg);
    }
}
```

注册 Service (file: resource/META-INF/services/com.harvey.service.LogService)

```txt
com.harvey.service.LogServiceImpl01
com.harvey.service.LogServiceImpl02
```

> log-plugin-02 module

log-plugin-02 module 结构

```txt
+ java
  + com
    + harvey
      + service
        + LogServiceImpl03.java
+ resource
  + META-INF
    + services
      + com.harvey.service.LogService
```

导入 log-base module

```xml
<dependency>
    <groupId>com.harvey</groupId>
    <artifactId>log-base</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

实现 LogService

```java
public class LogServiceImpl03 implements LogService {
    @Override
    public void log(String msg) {
        System.out.println("LogServiceImpl03: " + msg);
    }
}
```

注册 Service (file: resource/META-INF/services/com.harvey.service.LogService)

```txt
com.harvey.service.LogServiceImpl03
```

> log-demo

导入 Dependency

```xml
<dependency>
    <groupId>com.harvey</groupId>
    <artifactId>log-base</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
<dependency>
    <groupId>com.harvey</groupId>
    <artifactId>log-plugin-01</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

查看装配的 Service

```java
public class Main {
    public static void main(String[] args) {
        ServiceLoader<LogService> services = ServiceLoader.load(LogService.class);
        for (LogService service : services) {
            System.out.println(service);
        }
    }
}
```

```txt
com.harvey.service.LogServiceImpl01@4f023edb
com.harvey.service.LogServiceImpl02@7adf9f5f
```












