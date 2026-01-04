# Multistage Cache

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312281652234.png)

# Initialize Cache

服务刚启动时, Redis 没有数据, 所有服务的第一次请求都会打到 DB, 压力非常大, 所以一般在服务上线前, 都需要预热缓存, 提前存储一部分热点数据到 Redis 中

这里实现 InitializingBean, 在项目刚启动时, 从数据库中查询一些热点数据, 存储到 Redis 中

```java
@Component
public class RedisHandler implements InitializingBean {
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Autowired
    private IItemService itemService;
    @Autowired
    private IItemStockService stockService;
    
    private static final ObjectMapper MAPPER = new ObjectMapper();
    
    // Initialize the cache
    @Override
    public void afterPropertiesSet() throws Exception {
        // Save item cache to Redis
        List<Item> itemList = itemService.list();
        for (Item item : itemList) {
            // Method that can be used to serialize any Java value as a String.
            String itemJson = MAPPER.writeValueAsString(item);
            stringRedisTemplate.opsForValue().set(CACHE_ITEM_KEY + item.getId(), itemJson);
        }
        
        // Save stock cache to Redis
        List<ItemStock> stockList = stockService.list();
        for (ItemStock item : stockList) {
            String itemJson = MAPPER.writeValueAsString(item);
            stringRedisTemplate.opsForValue().set(CACHE_STOCK_KEY + item.getId(), itemJson);
        }
    }
}
```

# Cache Synchronization

通过 Canal 实现 Cache Synchronization

```java
@Slf4j
@CanalTable("tb_item")
@Component
public class ItemCanalHandler implements EntryHandler<Item> {
    @Autowired
    RedisHandler redisHandler;
    @Autowired
    private Cache<Long, Item> itemCache;
    
    @Override
    public void insert(Item item) {
        itemCache.put(item.getId(), item);
        redisHandler.addItem(item);
    }
    
    @Override
    public void update(Item before, Item after) {
        itemCache.put(after.getId(), after);
        redisHandler.addItem(after);
    }
    
    @Override
    public void delete(Item item) {
        itemCache.invalidate(item.getId());
        redisHandler.delItem(item);
    }
}
```
