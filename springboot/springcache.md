# SpringCache

配置 Dependency

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

配置 Profile

```properties
spring.cache.type=redis
spring.data.redis.host=127.0.0.1
spring.data.redis.port=6379
spring.data.redis.password=111
spring.data.redis.database=0
```

配置 Entity 实现 Serializable

```java
@Data
public class User implements Serializable {
    private Integer id;
    private String username;
    private String password;
}
```

配置 @EnableCaching 开启 SpringCache

```java
@EnableCaching
```

配置 CacheManager

```java
@Bean
public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
    RedisCacheWriter redisCacheWriter = RedisCacheWriter.nonLockingRedisCacheWriter(redisConnectionFactory);
    
    RedisCacheConfiguration redisCacheConfiguration = RedisCacheConfiguration
        .defaultCacheConfig()
        .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(RedisSerializer.string()))
        .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(RedisSerializer.json()));
    
    return RedisCacheManager.builder(redisCacheWriter)
        .cacheWriter(redisCacheWriter)
        .cacheDefaults(redisCacheConfiguration)
        .build();
}
```

通过 SpringCache 操作 Cache

```java
// key is user::id, val is user
@Cacheable(value = "user", key = "#id")
public User getUserById(Integer id) {
    return userMapper.getById(id);
}

// key is user::user.id, val is user
@CachePut(cacheNames = "user", key = "#user.id")
public void put(User user) {
    userMapper.put(user);
}
```

# set key by SpEL

```java
// user is argument name
@CachePut(cacheNames = "userCache", key = "#user.id")

// result is Method result
@CachePut(cacheNames = "userCache", key = "#result.id")

// p0 is first argument
@CachePut(cacheNames = "userCache", key = "#p0.id")

// a0 is first argument
@CachePut(cacheNames = "userCache", key = "#a0.id")

// root.args[0] is first argument
@CachePut(cacheNames = "userCache", key = "#root.args[0].id")
```

# @CachePut

@CachePut: auto set the data into the cache

```java
@CachePut(cacheNames = "userCache", key = "#user.id")
public void insert(User user) {
    userMapper.insert(user);
}
```

# @Cacheable

@Cacheable: query cache for the data, if the data does not exist, set the data into cache

```java
@Cacheable(cacheNames = "userCache", key = "#id")
@Override
public User selectById(Integer id) {
    return userMapper.selectById(id);
}
```

# @CacheEvict

@CacheEvict: auto delete specify data in cache

```java
@CacheEvict(cacheNames = "userCache", key = "#id")
public void deleteById(Integer id) {
    userMapper.deleteById(id);
}
```

set allEntries prop to delete all data in the cache

```java
@CacheEvict(cacheNames = "userCache", allEntries = true)
```

