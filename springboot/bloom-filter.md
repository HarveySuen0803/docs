# Guava

通过 Guava 实现单机环境下的 Bloom Filter

Import dependency

```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>32.0.1-jre</version>
</dependency>
```

Basic useage

```java
BloomFilter<Integer> bloomFilter = BloomFilter.create(Funnels.integerFunnel(), 1000000, 0.01);
bloomFilter.put(1);
System.out.println(bloomFilter.mightContain(1)); // true
System.out.println(bloomFilter.mightContain(2)); // false
```

# Hutool

通过 Hutool 实现单机环境下的 Bloom Filter

```java
BloomFilter<String> bloomFilter = new BitMapBloomFilter<>(1000000, 0.01);

bloomFilter.add("item1");
bloomFilter.add("item2");

boolean containsItem1 = bloomFilter.contains("item1");
boolean containsItem3 = bloomFilter.contains("item3");

System.out.println("Contains item1: " + containsItem1);  // true
System.out.println("Contains item3: " + containsItem3);  // false
```

# Redis

通过 Redis 的 Bitmap 实现分布式环境下的 Bloom Filter

```java
@Component
public class BloomFilterUtils {
    @Autowired
    RedisTemplate redisTemplate;

    // Init whitelist
    @PostConstruct
    public void init() {
        String key1 = "user:1";
        String key2 = "user:2";
        String key3 = "user:3";
        
        int hash1 = Math.abs(key1.hashCode());
        int hash2 = Math.abs(key2.hashCode());
        int hash3 = Math.abs(key3.hashCode());
        
        long index1 = (long) (hash1 % Math.pow(2, 32));
        long index2 = (long) (hash2 % Math.pow(2, 32));
        long index3 = (long) (hash3 % Math.pow(2, 32));
        
        redisTemplate.opsForValue().setBit("whitelist", index1, true);
        redisTemplate.opsForValue().setBit("whitelist", index2, true);
        redisTemplate.opsForValue().setBit("whitelist", index3, true);
    }

    // Check if the key is on the whitelist
    public boolean check(String checkItem, String key) {
        int hash = Math.abs(key.hashCode());
        long index = (long) (hash % Math.pow(2, 32));
        return Boolean.TRUE.equals(redisTemplate.opsForValue().getBit(checkItem, index));
    }
}
```

```java
@Autowired
BloomFilterUtils bloomFilterUtils;

public Customer queryById(Integer id) {
    String key = CACHE_CUSTOMER_KEY + id;
    
    // Check with bloom filter before query
    if (!bloomFilterUtils.check("whitelist", key)) {
        return null;
    }
    
    Customer customer = (Customer) redisTemplate.opsForValue().get(key);
    if (customer == null) {
        customer = getById(id);
        if (customer != null) {
            redisTemplate.opsForValue().set(key, customer);
        }
    }
    return customer;
}
```

# Redisson

通过 Redisson 实现分布式环境下的 Bloom Filter

```java
@Bean
public RBloomFilter bloomFilter(RedissonClient redissonClient) {
    RBloomFilter<String> bloomFilter = redissonClient.getBloomFilter("redissonBloomFilter");
    bloomFilter.tryInit(1000000, 0.01);
    return bloomFilter;
}
```

```java
@Component
public class RedissonBloomFilterUtils {
    @Autowired
    private RBloomFilter bloomFilter;
    
    // @PostConstruct
    public void init() {
        bloomFilter.add("user:1");
        bloomFilter.add("user:2");
        bloomFilter.add("user:3");
    }
    
    public boolean check(String key) {
        return bloomFilter.contains(key);
    }
}
```