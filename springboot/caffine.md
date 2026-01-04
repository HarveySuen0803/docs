# Caffine

Caffeine 是一个高性能本地缓存库, 类似于 Guava Cache, 并且利用了一些 Java 8 的新特性, 提高了某些场景下的性能效率. Caffeine 可以限制缓存大小, 通过异步自动加载实体到缓存中, 可以配置基于大小, 时间, 引用的回收策略

导入 Dependency

```xml
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

配置 Cache Bean

```java
@Bean
public Cache<String, String> cache() {
    return Caffeine.newBuilder()
               .initialCapacity(100)
               .maximumSize(10000)
               .expireAfterWrite(Duration.ofSeconds(10))
               .build();
}
```

使用 Cache

```java
cache.put("key", "val");
```

```java
// Returns the value associated with the key in this cache, or null if there is no cached value for the key
String val = cache.getIfPresent("key");
```

```java
// If the specified key is not already associated with a value, attempts to compute its value using the given mapping function and enters it into this cache unless null
String val = cache.get("key", (key) -> {
    return "defaultVal";
});
```

结合 DB 使用

```java
@Bean
public Cache<Long, Item> itemCache() {
    return Caffeine.newBuilder()
               .initialCapacity(100)
               .maximumSize(10000)
               .expireAfterWrite(Duration.ofSeconds(10))
               .build();
}
```

```java
@Autowired
private Cache<Long, Item> itemCache;

@GetMapping("/{id}")
public Item quereyById(@PathVariable("id") Long id) {
    return itemCache.get(id, (key) -> itemService.query()
                                          .eq("id", key)
                                          .one());
}
```
