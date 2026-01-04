# Redisson

Redisson 底层通过 Redis 的 SETNX 进行加锁的, A 想要获取锁, 就会尝试通过 SETNX 去修改一个 Key, 如果修改成功, 就认为是成功获取了锁. B 这个时候想要获取锁, 也去尝试修改, 修改不成功就认为是没有获取到锁, B 就会进入自旋, 自旋到一定时间, 就会放弃

Redisson 底层为了防止 A 执行的业务耗时太久, 导致锁的 TTL 到期失效的问题, 就让 Watch Dog 去监听这个锁, 每隔 releaseTime / 3 的时间就去重置 Lock 的过期时间为 releaseTime

Redisson 底层通过 Redis 的 Hash 实现 Reentrant Lock, 存储 Key 为锁名, Field 为线程名, Value 为重入的次数. 重入获取锁时, 就去判断当前线程和锁的拥有者是否为相同, 如果相同, 就让 Value + 1, 释放锁后, 就让 Value - 1, 当 Value 为 0 时, 就认为该线程释放了锁

Redisson 底层所有的操作中, 需要保证原子性的地方, 就会采用 Lua 脚本 (eg: 判断当前线程是否为锁的持有者和释放锁, 这两个操作需要保证原子性, 就会采用 Lua 脚本)

Redisson 底层通过 RedLock 解决 Master-Slave 和 Cluster 环境下, Lock 的一致性问题, 创建分布式锁时, 直接在 n / 2 + 1 个 Redis 实例上创建锁, 即使当前 Redis 实例挂掉了, 也能保证数量的领先, 只会认定数量多的那把锁. 一般不建议采用这种方案, 性能太差, 而且 Redis 遵循的是 AP, 更注重性能, 后续可以通过 MQ 来保证最终一致性, 不在乎这点一致性. 如果非要保证 High Consistency, 就需要结合 Zookeeper 实现 Distributed Lock

Import dependency.

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson</artifactId>
    <version>3.15.6</version>
</dependency>
```

Set Redisson client.

```java
@Bean
public RedissonClient redissonClient() {
    Config config = new Config();
    config.useSingleServer()
        .setAddress("redis://192.168.10.103:6379")
        .setPassword("111");
    return Redisson.create(config);
}
```

Using Redisson to get a distributed lock.

```java
RLock lock = redissonClient.getLock("lock:order:1");
boolean isLock = lock.tryLock();
if (!isLock) {
    System.out.println("Do not get the lock")
    return;
}
try {
    System.out.println("Get the lock")
} finally {
    lock.unlock();
}
```

Reentrant Lock with Redisson.

```java
RLock lock = redissonClient.getLock("lock:order:1");
if (!lock.tryLock()) {
    return;
}
try {
    if (!lock.tryLock()) {
        return;
    }
    try {
        System.out.println("hello world");
    } finally {
        lock.unlock();
    }
} finally {
    lock.unlock();
}
```

## Watchdog

Redisson 中的 Watchdog（看门狗） 是分布式锁的重要组件，负责监控分布式锁的生命周期，并在锁持有者仍然活跃的情况下自动续期，确保锁不会意外释放。

Watchdog（看门狗） 负责判断是否需要续期锁，并执行续期操作。Watchdog 判断是否续期锁的核心逻辑在于监控持有锁的线程的状态，如果线程仍在正常工作，则认为锁需要续期；如果线程失效，则停止续期，让锁自然过期。

当 Redisson 客户端获取锁时，会通过 tryLock() 方法尝试加锁。如果成功获取到锁，Redisson 会启动一个 Watchdog 定时任务 来监控和续期锁。

```java
public void tryLock(long leaseTime, TimeUnit unit) {
    long threadId = Thread.currentThread().getId();
    // 尝试获取锁
    Boolean acquired = tryAcquireLock(leaseTime, threadId);
    if (acquired) {
        // 如果成功获取到锁，启动 Watchdog 定时任务
        scheduleExpirationRenewal(threadId);
    }
}
```

- tryAcquireLock() 方法通过 Redis 的 SET 命令和过期时间来尝试加锁。
- scheduleExpirationRenewal() 方法用于启动 Watchdog 任务，定期续期锁的过期时间。

scheduleExpirationRenewal 方法在成功获取锁后被调用，启动一个定时任务用于锁的续期。定时任务每隔 10 秒执行一次，将锁的过期时间续期为 30 秒。

```java
private void scheduleExpirationRenewal(final long threadId) {
    ExpirationEntry entry = new ExpirationEntry();
    expirationRenewalMap.putIfAbsent(getEntryName(), entry);
    
    // 创建定时任务，用于续期锁的过期时间
    Timeout task = commandExecutor.getConnectionManager().newTimeout(timeout -> {
        // 检查锁持有者是否仍然活跃
        if (expirationRenewalMap.containsKey(getEntryName())) {
            // 使用 Lua 脚本续期锁
            renewExpiration(threadId);
            scheduleExpirationRenewal(threadId);  // 继续下一次续期
        }
    }, 10, TimeUnit.SECONDS);
    
    entry.setTimeout(task);
}
```

renewExpiration 方法通过 Redis 的 Lua 脚本续期锁的过期时间，确保续期操作的原子性。Lua 脚本的核心逻辑是：判断当前线程是否持有锁，如果是，则更新锁的过期时间。

```java
private void renewExpiration(long threadId) {
    String script = "if redis.call('GET', KEYS[1]) == ARGV[1] then " +
                    "return redis.call('PEXPIRE', KEYS[1], ARGV[2]) " +
                    "else return 0 end";
                    
    commandExecutor.evalWriteAsync(getName(), RedisCommands.EVAL_LONG,
                                   script,
                                   Collections.singletonList(getEntryName()),
                                   getLockName(threadId),
                                   internalLockLeaseTime);
}
```
