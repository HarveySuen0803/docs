# TTL

Redis 通过 redisDb 这个结构体表示 DB, 通过 Dict* dict 存储所有的 key-val, 通过 Dict* expires 存储所有 key-ttl

Redis 只需要查询 expires 就可以得到 key-ttl, 就可以判断该 key 是否过期

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031140695.png)

如果一个 key 到期后要立即删除, 就得给每一个 key 添加一个监视器, 到期后进行删除, 当 key 的数量特别多时, 非常耗费资源

Redis 采用 Lazy Deletion + Cycle Deletion 的方式删除一个 key, 不会在一个 key 过期后, 就立即进行删除. Lazy Deletion 是下一次访问 key 时, 判断该 key 是否已经过期, 如果过期了就进行删除. 如果一个 key 过期后, 一直没有被访问, 就会导致无法删除该 key, 所以还需要结合 Cycle Deletion 周期性的抽样部分过期的 key 进行删除, 这个抽样会逐步遍历所有过期的 key, 不会存在遗漏的情况. Cycle Deletin 有 Slow 和 Fast 两种模式, Slow Mode 是每 100ms 执行一次, 每次执行不超过 25ms, Fast Mode 是执行频率不固定, 但是两次间隔不低于 2ms, 每次执行不超过 1ms

# Eviction Policy

Redis 在执行 processCommand() 时, 就会跟据 Eviction Policy 去挑选部分 key 进行删除. 如果没有明显的冷热数据区分, 优先使用 allkeys-lru. 如果数据的访问频率差别不大, 优先使用 allkeys-random. 如果有需要置顶的数据, 这些置顶数据不会设置 TTL, 这时就优先使用 volatile-lru. 如果业务中有短时间内高频访问的数据, 再考虑 allkyes-lfu 和 volatile-lfu

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031140696.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031140697.png)

配置 Eviction Policy

```shell
maxmemory-policy noeviction
```

