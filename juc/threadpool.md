# ThreadPool

当一个新任务提交给线程池时, 线程池会判断其中的工作线程数量, 如果当前的工作线程数量小于核心线程数, 线程池会创建一个新的工作线程来执行这个任务, 如果大于或等于核心线程数, 线程池则不会立即创建新的线程

如果线程池中的工作线程数目达到了核心线程数, 新的任务就会被存入到任务队列, 等待被执行, 当任务队列已满, 且当前线程数小于最大线程数时, 线程池会创建新的工作线程来执行任务

当任务队列已满, 并且当前线程数达到了最大线程数, 那么线程池会根据其 RejectedExecutionHandler 策略来处理这个任务

工作线程从任务队列中取出任务执行, 执行完毕后, 继续从队列中取出下一个任务执行, 直到队列为空, 如果设置了 allowCoreThreadTimeOut, 那么核心线程在等待时间超过 keepAliveTime 之后也会被回收

# ThreadPoolExecutor

ThreadPoolExecutor 是 Java 标准库中用于管理线程池的类, 它提供了一个灵活, 可配置的线程池实现

```java
public ThreadPoolExecutor(
    int corePoolSize,     // 核心线程池大小，即线程池中一直保持的线程数量
    int maximumPoolSize,  // 最大线程池大小，线程池中允许的最大线程数
    long keepAliveTime,   // 线程空闲时间，当线程数大于核心线程数时，多余的空闲线程会在指定时间内被终止
    TimeUnit unit,        // keepAliveTime 的时间单位
    BlockingQueue<Runnable> workQueue,   // 任务队列，用于存放待执行任务
    ThreadFactory threadFactory,         // 线程工厂，用于创建线程
    RejectedExecutionHandler handler     // 拒绝策略，当任务添加到线程池中被拒绝时的处理策略
)
```

使用 ThreadPoolExecutor 创建线程池

```java
ThreadPoolExecutor threadPool = new ThreadPoolExecutor(
    3,                    // 核心线程池大小
    5,                    // 最大线程池大小
    60, TimeUnit.SECONDS, // 线程空闲时间
    new LinkedBlockingQueue<>(),         // 任务队列
    Executors.defaultThreadFactory(),    // 线程工厂
    new ThreadPoolExecutor.AbortPolicy() // 拒绝策略
);

// Future<?> submit(Runnable task)
threadPool.submit(() -> {
    System.out.println("hello world");
});

threadPool.submit(() -> {
    System.out.println("hello world");
});

threadPool.submit(() -> {
    System.out.println("hello world");
});

threadPool.shutdown();
```

# ScheduledThreadPoolExecutor

ScheduledThreadPoolExecutor 继承 ThreadPoolExecutor, 专门用于处理定时任务和周期性任务, 具有定时执行任务的能力, 可以按照指定的时间延迟执行任务, 也支持周期性地执行任务

```java
public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, DEFAULT_KEEPALIVE_MILLIS, MILLISECONDS, new DelayedWorkQueue());
}
```

使用 ScheduledThreadPoolExecutor 创建线程池

```java
Thread t = new Thread(() -> {
    System.out.println("hello world");
});

ScheduledThreadPoolExecutor scheduledExecutor = new ScheduledThreadPoolExecutor(3);

// public ScheduledFuture<?> schedule(Runnable command, long delay, TimeUnit unit);
scheduledExecutor.schedule(t, 1, TimeUnit.SECONDS);
scheduledExecutor.schedule(t, 3, TimeUnit.SECONDS);
scheduledExecutor.schedule(t, 5, TimeUnit.SECONDS);
```

# ThreadPool Process

- 提交任务, 判断线程池是否已满
  - 没满, 使用一个核心线程执行任务
  - 已满, 判断阻塞队列是否满了
    - 没满, 添加任务到阻塞队列中
    - 已满, 判断当前线程数是否超过了最大线程数
      - 没超, 创建非核心线程执行任务
      - 已超, 调用拒绝策略

# CorePoolSize

如果当前任务是 IO 密集型任务 (eg: File IO, DB IO, Network IO), 每个任务占用的 CPU 资源不多, 推荐核心线程数大小设置为 2N+1, 减少任务排队等待的时间

如果当前任务是 CPU 密集型任务 (eg: JSON Conversion, BitMap Conversion), 推荐核心线程数大小设置为 N+1, 减少线程上下文的切换

适度地预留一些核心线程, 以处理突发的任务负载, 但也不要设置过多的核心线程, 以免资源浪费

# BlockingQueue

BlockingQueue 插入和移除操作都是阻塞的, 当队列已满时, 插入操作会被阻塞, 当队列为空时, 移除操作会被阻塞

ThreadPoolExecutor 提供了多种类型的阻塞队列, 常用的是 LinkedBlockingQueue 和 ArrayBlockingQueue

LinkedBlockingQueue

- 基于链表的阻塞队列, 底层使用链表来存储元素, 容量默认是无限制的
- 读和写各有一把锁, 性能好

ArrayBlockingQueue

- 基于数组的阻塞队列, 底层使用数组来存储元素, 具有固定容量
- 读和写公用一把锁, 性能差

# RejectedExecutionHandler

Rejection Policy 是在线程池已经饱和, 无法接受新任务时的一种策略, 用于决定如何处理这些无法处理的新任务

AbortPolicy: 这是默认的拒绝策略, 当任务无法被接收时, 会抛出 RejectedExecutionException 异常, 通知调用者

CallerRunsPolicy: 当任务无法被接收时, 会调用当前线程 (提交任务的线程) 来执行该任务, 这样可以有效降低任务提交速度, 直接在调用者的线程中执行任务

DiscardPolicy: 当任务无法被接收时, 直接丢弃这个任务, 不做任何处理

DiscardOldestPolicy: 当任务无法被接收时, 会移除队列中最老的一个任务, 并尝试重新提交当前任务

# Executors

Executors 提供了大量创建连接池的静态方法, 但是阿里的 Java 开发规范中强制禁止使用 Executors 创建线程池, 推荐使用 ThreadPoolExecutor 创建, 因为 Executors 创建的 FixedThreadPool, SingleThreadPool, CachedTreadPool 都允许创建不限量的线程, 容易堆积大量的请求, 导致 OOM

newFixedThreadPool() 创建固定线程数的线程池, 核心线程数与最大线程数一样, 没有救急线程, 适用于任务量已知, 相对耗时的任务

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads, 0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<Runnable>());
}
```

```java
ExecutorService threadPool = Executors.newFixedThreadPool(3);

threadPool.submit(() -> {
    System.out.println("hello world");
});

threadPool.shutdown();
```

newSingleThreadExecutor() 创建单线程化的线程池, 它只会用唯一的工作线程来执行任务, 保证所有任务按照指定顺序 (FIFO) 执行, 适用于按照顺序执行的任务

```java
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService(new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<Runnable>()));
}
```

newCachedThreadPool() 创建可缓存线程池, 阻塞队列为 SynchronousQueue, 不存储元素的阻塞队列, 每个插入操作都必须等待一个移出操作, 适合任务数比较密集，但每个任务执行时间较短的情况

```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS, new SynchronousQueue<Runnable>());
}
```

newScheduledThreadPool() 创建可以延迟可以周期执行的线程池, 适用于有定时和延迟执行的任务

```java
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}
```

