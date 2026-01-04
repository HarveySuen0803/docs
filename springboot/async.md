# Async

添加 @EnableAsync 开启异步支持

```java
@EnableAsync
```

配置 ThreadPool

```java
@Bean
public Executor asyncExecutor() {
    return new ThreadPoolExecutor(
        3,
        5,
        60, 
        TimeUnit.SECONDS,
        new LinkedBlockingQueue<>(),
        (r) -> new Thread(r, "harvey-pool"),
        new ThreadPoolExecutor.AbortPolicy()
    );
}
```

配置 Async Method, 并指定 ThreadPool

```java
@Async("asyncExecutor")
public void asyncMethod() {
    System.out.println("Async method is running on thread");
}
```

