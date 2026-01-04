# Lettuce

import dependency

```xml
<dependency>
    <groupId>io.lettuce</groupId>
    <artifactId>lettuce-core</artifactId>
</dependency>
```

Test

```java
RedisURI redisURI = RedisURI
        .builder()
        .withHost("192.168.10.11")
        .withPort(6379)
        .withAuthentication("default", "111")
        .build();

RedisClient redisClient = RedisClient.create(redisURI);

StatefulRedisConnection<String, String> connection = redisClient.connect();

RedisCommands<String, String> commands = connection.sync();

List<String> keys = commands.keys("*"); // [k1, k2, k3]

commands.set("k1", "hello world");

String k1 = commands.get("k1"); // hello world

connection.close();
redisClient.shutdown();
```
