# Jedis

import dependency

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
</dependency>
```

Test

```java
Jedis jedis = new Jedis("192.168.10.11", 6379);
jedis.auth("111");

String ping = jedis.ping(); // PONG

Set<String> keys = jedis.keys("*"); // [k1, k2, k3]

jedis.set("k1", "hello world");

String k1 = jedis.get("k1"); // hello world
```