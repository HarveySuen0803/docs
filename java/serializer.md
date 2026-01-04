# Jackson

Jackson 是一个流行的 Java 库，用于序列化和反序列化 JSON 数据。它提供了灵活和强大的方式来处理 JSON 与 Java 对象之间的转换。下面我将向你详解如何使用 Jackson 进行基本的操作，以及一些高级配置。

添加 Jackson 依赖：

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.15.2</version>
</dependency>
```

Java Object 转 Json：

```java
ObjectMapper mapper = new ObjectMapper();
User user = new User("John Doe", 30);
String json = mapper.writeValueAsString(user);
```

Json 转 Java Object：

```java
String json = "{\"name\":\"John Doe\",\"age\":30}";
ObjectMapper mapper = new ObjectMapper();
User user = mapper.readValue(jsonInput, User.class);
```

# Fastjson

Fastjson2 是阿里巴巴开发的一个 Java 库，用于将 Java 对象转换为 JSON 格式的字符串，以及将 JSON 字符串解析为 Java 对象。它是 ﻿Fastjson 的更新和更安全的版本。

添加 Fastjson 依赖：

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson2</artifactId>
    <version>2.0.7</version>
</dependency>
```

Java Object 转 Json：

```java
User user = new User("John Doe", 30);
String json = JSON.toJSON(user).toString();
```

Json 转 Java Object：

```java
String json = "{\"name\":\"John Doe\",\"age\":30}";
User user = JSON.parseObject(jsonInput, User.class);
```



