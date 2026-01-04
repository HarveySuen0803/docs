# Global ID Generator

```java
@Autowired
StringRedisTemplate stringRedisTemplate;

private static final long BEGIN_TIMESTAMP = 1691020800;
private static final int COUNT_BITS = 32;

public long nextId(String keyPrefix) {
    LocalDateTime now = LocalDateTime.now();
    
    // Generate timestamp
    long timestamp = now.toEpochSecond(ZoneOffset.UTC) - BEGIN_TIMESTAMP;
    
    // Generate serial number
    long count = stringRedisTemplate.opsForValue().increment("icr:" + keyPrefix + ":" + now.format(DateTimeFormatter.ofPattern("yyyy:MM:dd")));
    
    return timestamp << COUNT_BITS | count;
}
```

