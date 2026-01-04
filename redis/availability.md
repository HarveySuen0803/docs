# Multi Thread

Redis 3.0 不支持多线程, Redis 4.0 仅仅支持多线程删除, Redis 5.0 对代码进行了大量重构, Redis 6.0 全面拥抱多线程 IO.

Redis 当年使用单线程, 开发简单, 维护简单, 通过并发处理 Multiplexing IO + Non Blocking IO, 已经非常快速了, 而且当年性能的主要瓶颈不在于 CPU 是否采用多线程, 而在于 Memory 和 Network Bandwidth.

Redis 的单线程, 想要删除一个 Big Key 非常头疼, 因为单线程是 Atomicity 的, 这边在删除, 另一边就需要进入等待, 所以后来引入了 unlink 和 flushdb async 让 BIO 的 Sub Thread 去进行异步删除.

Redis 的单线程, 是需要 Main Thread 进行 IO, 非常耗时.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241812949.png)

Redis 的多线程, 将耗时的 IO 交给 Sub Thread 去处理, 同时只通过 Main Thread 进行 Calculate, 执行操作命令, 既使用上了多线程, 也保证了 Atomicity.

Client 发送请求给 Server 后, 会在 Server 的 Socket File 中的写入当前 Client 对应的 File Descriptor, 即注册到 epoll 中. epoll 会去监听多个 Client 是否有 Request 发送过来, 即一个 Sub Thread 可以同时处理多个 Request, 这就保证了 Redis 即使在单线程环境下, 依旧有着相当高的吞吐量.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241812950.png)

Enable multi-thraed of write. (file: redis.conf)

```
# If you have a 8 cores, try to use 6 threads
io-threads 4
```

Enable multi-thread of read. (file: redis.conf)

```
io-threads-do-reads yes
```

# Dual Write Consistency

先更新 DB, 再更新 Cache, 在多线程场景下容易造成数据覆盖的问题. 如果在停机的情况下, 通过单线程来更新, 完全可以这么玩, 但是多线程环境下就是不行.

先更新 Cache, 再更新 DB, 在多线程场景下也会造成数据覆盖的问题, 而且一般是以 DB 作为底单数据, 所以也不推荐这种设计方式.

先删除 Cache, 再更新 DB, 在多线程场景下也会造成脏读的问题. 这里 A 先删除 Cache, 再去更新 DB, 此时 B 来读取 Cache 时, 发现没有 Cache 了, 就会去 DB 读取数据, 但是此时 A 还没更新完, B 就读取了脏数据, 还把脏数据写回了 Cache, 更是八达鸟啊.

Delayed Dual Deletion 就是用来解决 B 的脏写问题的. A 更新完 DB 后, 会再去删除 B 回写的脏数据, 后续线程来读取数据时, 就会再去 DB 中读取, 然后回写正确的数据到 Cache 中. 这就需要 A 等待 B 回写完脏数据后删除, 需要估算两者的执行效率, 让 A 在 B 的基础上等待一个 100ms 即可, 还可以借助 Watch Dog 监控程序中的脏写, 新起一个异步的线程来执行这个删除脏数据的操作, 至于 B 那的脏读, 就不管他啦.

先更新 DB, 再删除 Cache, 也会造成 B 的脏读, 但是这种破坏性是最小的, 也不需要通过 Delayed Dual Deletion 来防止脏写, 这是我们能容忍的.

为了保证 High Availiability, 可以先更新 DB, 再删除 Cache. 可以更新完 DB 后, 直接通过 MQ 异步的修改 Cache. 可以更新完 DB 后直接不管了, 通过 Canal 监听 MySQL 的 BinLog 的变化, 再去更新 Cache, 这种解决方案没有任何侵入.

为了保证 High Consistency, 可以通过 Lock 解决, 读数据时添加 S Lock, 写数据时添加时 X Lock.

一般业务中是允许出现脏读的, 后续通过 MQ 进行兜底, 保证数据的最终一致性.

# Cache Penetration

Cache Penetration 是指请求的数据, 即不存在 Cache, 也不存在 DB, 请求会重复打到 DB, DB 小身板, 遭不住. 一般可以缓存一个空对象或者采用 Bloom Filter 来处理. 最好在设计数据库时, 就将查询字段的取值格式设计的复杂一点, 在业务过滤时, 就将这些非法的取值过滤处理.

可以缓存一个空对象来解决 Cache Penetration, 这个实现起来非常简单, 但是会造成额外的内存消耗, 也会造成短期的数据不一致 (eg: 请求一个不存在的数据后, 缓存一个空对象, 但是此时又插入了该数据, 如果不更新缓存的话, 就会一直造成脏读), 一般都是结合过期时间, 来降低破坏性.

```java
public Result queryById(Long id) {
    String key = CACHE_SHOP_KEY + id;
    
    // Query data from cache
    String shopJson = stringRedisTemplate.opsForValue().get(key);
    if (StrUtil.isNotBlank(shopJson)) {
        return Result.ok(JSONUtil.toBean(shopJson, Shop.class));
    }
    
    // Handle blank string, block requests to DB
    if (StrUtil.isBlank(shopJson)) {
        return Result.fail("Shop does not exists");
    }
    
    // Query data from DB
    Shop shop = getById(id);
    if (shop == null) {
        // Save a blank string to Redis to avoid cache penetration
        stringRedisTemplate.opsForValue().set(key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
        return Result.fail("Shop does not exists");
    }
    
    // Save data to cache, set expiration time to avoid dirty writing
    stringRedisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(shop), CACHE_SHOP_TTL, TimeUnit.MINUTES);
    
    return Result.ok(shop);
}
```

可以通过 Bloom Filter 来解决 Cache Penetration, Bloom Filter 不真实存储数据, 而是存储 0 和 1 来表示该数据是否存在. 请求打过来时, 就先查询 Bloom Filter, 判断该数据是否存在, 如果不存在就让他滚蛋, 如果存在就放行. Redis 的 Bitmap 实现了 Bloom Filter, 爽死了 !!!

Bloom Filter 会使用多个 Hash Algo 对 key 进行运算, 分别取模得到多个 Index, 设置这些 Index 为 1. 后续查询时, 就判断这几个 Index 是否都为 1, 只要有一个 0, 就说明这个 key 肯定不存在.

想要修改某个 key 的状态, 可以重新分配一套 Hash, 而不是去修改之前 Hash 对应的 Index. 因为多个 Key 可能分配到相同的 Hash, 会导致其他 Key 受影响.

在缓存预热阶段, 预热 Bloom Filter, 准备白名单, 一般采用 Guava 或 Redission 实现 Bloom Filter, 控制误判率在 5% 以内即可

```java
@Component
public class BloomFilterUtils {
    @Autowired
    RedisTemplate redisTemplate;

    // Init whitelist
    @PostConstruct
    public void initUserWhiteList() {
        String key1 = "1";
        String key2 = "2";
        String key3 = "3";
        
        int hash1 = Math.abs(key1.hashCode());
        int hash2 = Math.abs(key2.hashCode());
        int hash3 = Math.abs(key3.hashCode());
        
        long index1 = (long) (hash1 % Math.pow(2, 32));
        long index2 = (long) (hash2 % Math.pow(2, 32));
        long index3 = (long) (hash3 % Math.pow(2, 32));
        
        redisTemplate.opsForValue().setBit("whitelist:user", index1, true);
        redisTemplate.opsForValue().setBit("whitelist:user", index2, true);
        redisTemplate.opsForValue().setBit("whitelist:user", index3, true);
    }
    
    // Check if the key is on the whitelist
    public boolean check(String checkItem, String key) {
        int hash = Math.abs(key.hashCode());
        long index = (long) (hash % Math.pow(2, 32));
        return Boolean.TRUE.equals(redisTemplate.opsForValue().getBit(checkItem, index));
    }
}
```

在查询数据前, 通过 Bloom Filter 校验 User Id 是否存在白名单中

```java
@Autowired
private BloomFilterUtils bloomFilterUtils;

public User queryById(Integer id) {
    // Check with bloom filter before query
    if (!bloomFilterUtils.check("whitelist:user", id)) {
        return null;
    }
    
    User User = (User) redisTemplate.opsForValue().get(CACHE_USER_KEY + id);
    if (User == null) {
        user = getById(id);
        if (user != null) {
            redisTemplate.opsForValue().set(CACHE_USER_KEY + id, user);
        }
    }
    return user;
}
```

通过 Interceptor 拦截请求, 检查 User Id 是否存在白名单中

```java
@Component
public class UserInterceptor implements HandlerInterceptor {
    @Autowired
    private BloomFilterUtils bloomFilterUtils;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!bloomFilterUtils.check("whitelist:user", UserHolder.getUser().getId())) {
            response.setStatus(401);
            return false;
        }
        return true;
    }
}
```

```java
@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    @Autowired
    private UserInterceptor userInterceptor
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(userInterceptor)
                .excludePathPatterns(
                    "/user/login",
                    "/user/register"
                )
                .order(1);
    }
}
```

# Cache Invalidation

Cache Invalidation 是指一些热点数据的突然失效, 缓存重建速度又太慢, 导致大量的请求又打到 DB, 啊啊啊受不了啦 !!! 一般都会采用 Mutex 和 Logical Expiration 解决.

在多线程的环境下, 重建热点数据非常容易造成问题, 必须使用 Mutex 串行处理. A 获取到 Mutex 后去查询数据库, 重建缓存. B 查询缓存未命中, 就去尝试获取 Mutex, 获取失败, 就会进入等待, 直到 A 重建缓存完成, 通过 DCL 的方式, 让 B 直接查询到缓存数据.

使用 Mutex 可以保证 High Consistency, 无法保证 High Availability, 还存在 Dead Lock 的风险.

```java
private Shop queryWithMutex(Long id) {
    String key = CACHE_SHOP_KEY + id;
    
    // Query data from cache
    String shopJson = stringRedisTemplate.opsForValue().get(key);
    if (StrUtil.isNotBlank(shopJson)) {
        return JSONUtil.toBean(shopJson, Shop.class);
    }
    
    // Handle blank string
    if (shopJson != null) {
        return null;
    }
    
    Shop shop;
    String lockKey = LOCK_SHOP_KEY + id;
    try {
        // If obtaining the lock is unsuccessful, then retrieve it again
        if (!tryLock(lockKey)) {
            Thread.sleep(50);
            return queryWithMutex(id);
        }
        
        // DCL
        shopJson = stringRedisTemplate.opsForValue().get(key);
        if (StrUtil.isNotBlank(shopJson)) {
            return JSONUtil.toBean(shopJson, Shop.class);
        }
        
        // Query data from DB
        shop = getById(id);
        if (shop == null) {
            stringRedisTemplate.opsForValue().set(key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
            return null;
        }
        
        // Save data to cache
        stringRedisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(shop), CACHE_SHOP_TTL, TimeUnit.MINUTES);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    } finally {
        unLock(lockKey);
    }
    
    return shop;
}

private boolean tryLock(String key) {
    Boolean flag = stringRedisTemplate.opsForValue().setIfAbsent(key, "1", 10, TimeUnit.SECONDS);
    return BooleanUtil.isTrue(flag);
}

private void unLock(String key) {
    stringRedisTemplate.delete(key);
}
```

Logical Expiration 非常佛系, 在项目预热阶段, 就将这些热点数据永久存储在 Cache 中, 只设置一个逻辑上的过期时间. 当 A 发现 Cache 过期后, 就会去开启一个异步线程去重建 New Cache, 自己先用 Old Cache. B 来访问时, 发现还没有重建完, 就会直接使用 Old Cache, 直到重建成功后, 才能用上 New Cache.

使用 Logical Expiration 可以保证 High Availability, 无法保证 Consistency, 还会造成一定额外内存的开销, 但是性能的显著提升, 让我们已经不在乎这些了 :)

```java
private static final ExecutorService CACHE_REBUILD_EXECUTOR = Executors.newFixedThreadPool(10);

private Shop queryWithLogicalExpiration(Long id) {
    String key = CACHE_SHOP_KEY + id;
    
    // Query data from cache
    String shopJson = stringRedisTemplate.opsForValue().get(key);
    
    // The hot data here must be stored in Redis in advance to avoid cache invalidation
    // If the shopJson does not exist, return null
    if (StrUtil.isBlank(shopJson)) {
        return null;
    }
    
    RedisData redisData = JSONUtil.toBean(shopJson, RedisData.class);
    Shop shop = JSONUtil.toBean((JSONObject) redisData.getData(), Shop.class);
    LocalDateTime expireTime = redisData.getExpireTime();
    
    // If it is not expired, return the result
    if (expireTime.isAfter(LocalDateTime.now())) {
        return shop;
    }
    
    // If it is expired, rebuild cache
    String lockKey = LOCK_SHOP_KEY + id;
    if (tryLock(lockKey)) {
        // DCL
        shopJson = stringRedisTemplate.opsForValue().get(key);
        if (expireTime.isAfter(LocalDateTime.now())) {
            return JSONUtil.toBean(shopJson, Shop.class);
        }
        
        // Open a separate thread to rebuild the cache
        CACHE_REBUILD_EXECUTOR.submit(() -> {
            try {
                saveShopToRedis(id, 10L);
            } catch (Exception e) {
                throw new RuntimeException(e);
            } finally {
                unLock(lockKey);
            }
        });
    }
    
    return shop;
}

private void saveShopToRedis(Long id, Long expireTime) {
    Shop shop = getById(id);
    
    // Set data and logical expiration time
    RedisData redisData = new RedisData();
    redisData.setData(shop);
    redisData.setExpireTime(LocalDateTime.now().plusSeconds(expireTime));
    
    stringRedisTemplate.opsForValue().set(CACHE_SHOP_KEY + id, JSONUtil.toJsonStr(redisData));
}
```

# Cache Avalanche

Cache Avalanche 是指在一段时间内, 大量的 Cache 过期, 或者 Redis 直接挂掉了, 请求又直接打到了 DB, 遭老罪咯 !!!

处理大量 Cache 同时过期的问题, 可以在分配 TTL 时, 尽量随机一些, 让他们的过期时间分散开, 减少同一时段的压力.

处理 Redis 宕机的问题, 可以搭建 Master-Slave 或 Cluster 来解决, 还可以通过 Sentinel 给业务添加限流, 熔断, 降级策略, 还可以通过 Nginx 或 Gateway 进行分流, 通过 Nginx 设置多级缓存, 来保证 High Availability.

