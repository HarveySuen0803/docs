# Future

Future 接口主要用于表示异步计算的结果, 提供了一种机制来检查计算是否完成, 等待其完成并获取结果, 配合 Callable 一起使用, 允许在一个线程中执行计算, 并在其他线程中获取其结果

通过 Future 获取返回值容易导致线程堵塞

```java
FutureTask futureTask = new FutureTask<String>(() -> {
    Thread.sleep(10000);
    return "hello world";
});

new Thread(futureTask).start();

// thread blocking
System.out.println(futureTask.get());

System.out.println("main thread is waiting");
```

通过轮询检查, 解决线程堵塞

```java
FutureTask futureTask = new FutureTask<String>(() -> {
    Thread.sleep(10000);
    return "hello world";
});
new Thread(futureTask).start();

System.out.println("main thread is waiting");

while (true) {
    if (futureTask.isDone()) {
        System.out.println(futureTask.get());
        break;
    } else {
        try { TimeUnit.SECONDS.sleep(1000); } catch (InterruptedException e) { e.printStackTrace(); }
    }
}
```

# FutureTask

```java
public class Main {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        // Future used for handling asynchronous tasks
        FutureTask<String> futureTask = new FutureTask<>(new A());
        new Thread(futureTask).start();

        // get result
        System.out.println(futureTask.get()); // hello world

        // set timeout, prevent thread block
        System.out.println(futureTask.get(5, TimeUnit.SECONDS)); // hello world
    }
}

// Callable has a returned value
class A implements Callable<String> {
    @Override
    public String call() throws Exception {
        System.out.println("thread is running");
        return "hello world";
    }
}
```

# CompletableFuture

CompletableFuture 实现了 Future 可用于异步处理

CompletableFuture 实现了 CompletionStage 可以阶段性的处理任务, 一个阶段结束, 返回值供下一个阶段的处理, 解决了 Future 获取返回值时容易导致线程堵塞的问题

```java
class CompletableFuture<T> implements Future<T>, CompletionStage<T>
```

通过 CompletableFuture 代替 FutureTask 获取异步计算的结果, 避免堵塞

```java
CompletableFuture.supplyAsync(() -> {
    return "hello world";
}).whenComplete((r, e) -> {
    if (e == null) {
        System.out.println("result: " + r);
    }
}).exceptionally((e) -> {
    System.out.println("exception: " + e.getCause() + ": " + e.getMessage());
    return null;
});

System.out.println("Main thread is running without blocking");
```

## runAsync()

通过 runAsync() 启动一个异步线程, 没有返回值

```java
// CompletableFuture<Void> runAsync(Runnable runnable, Executor executor)
CompletableFuture completableFuture = CompletableFuture.runAsync(() -> {
    System.out.println(Thread.currentThread().getName()); // pool-1-thread-1
});

// get the returned value, need to handle exception
System.out.println(completableFuture.get()); // null

// get the returned value, do not need to handle exception
System.out.println(completableFuture.join()); // null
```

## supplyAsync()

通过 supplyAsync() 启动一个异步线程, 有返回值

```java
// CompletableFuture<U> supplyAsync(Supplier<U> supplier, Executor executor)
CompletableFuture<String> completableFuture = CompletableFuture.supplyAsync(() -> {
    return "hello world";
});
System.out.println(completableFuture.get()); // hello world
```

## get()

通过 get() 以阻塞的方式获取 CompletableFuture 的计算结果, 如果有异常, 则会将异常包装成 ExecutionException 并抛出

```java
System.out.println(completableFuture.get());
```

设置最大等待时长, 如果超时, 则会抛出 TimeoutException

```java
System.out.println(completableFuture.get(2L, TimeUnit.SECONDS));
```

## getNow()

通过 getNow() 获取 CompletableFuture 的计算结果, 如果没有获取到值, 则会以默认值代替, 如果遇到异常, 则会将异常包装成 CompletionException 并抛出

```java
System.out.println(completableFuture.getNow("Default Value"));
```

## join()

通过 join() 以阻塞的方式获取 CompletableFuture 的计算结果, 如果有异常, 则不会做任何包装, 直接抛出异常

```java
System.out.println(completableFuture.join());
```

如果比较关心具体的异常类和异常信息, 或者不太关心由 ﻿CompletableFuture 抛出的异常, 那么 ﻿join() 可能会更方便

如果你希望通过解包 ﻿ExecutionException 来处理特定类型的异常, 或者希望设置超时参数, 那么 ﻿get() 可能会更合适

## complete()

通过 complete() 手动设置﻿ CompletableFuture 的结果, 此时就视为 CompletableFuture 计算已经完成, 不能再次完成或再次设置结果

```java
CompletableFuture<String> completableFuture = CompletableFuture.supplyAsync(() -> {
    try { TimeUnit.SECONDS.sleep(3); } catch (InterruptedException e) { e.printStackTrace(); }
    return "hello world";
});

new Thread(() -> {
    try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    completableFuture.complete("alternative value");
}).start();

System.out.println("Main thread is running");
System.out.println(completableFuture.get()); // alternative value
```

## completeAsync()

通过 completeAsync() 启动一个异步线程再去计算结果并设置结果

```java
CompletableFuture<String> completableFuture = CompletableFuture.supplyAsync(() -> {
    try { TimeUnit.SECONDS.sleep(3); } catch (InterruptedException e) { e.printStackTrace(); }
    return "hello world";
});

new Thread(() -> {
    completableFuture.completeAsync(() -> {
        try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
        return "alternative value";
    });
}).start();

System.out.println("Main thread is running");
System.out.println(completableFuture.get()); // alternative value
```

supplyAsync() 更注重开启一个新的异步任务, 并返回一个新的 ﻿CompletableFuture

completeAsync() 更注重任务完成时状态上的标记, 控制已有的 ﻿CompletableFuture 的完成状态

## whenComplete()

通过 CompletableFuture 代替 FutureTask 获取异步计算的结果, 避免堵塞

```java
CompletableFuture.supplyAsync(() -> {
    return "Hello, World!";
}).whenComplete((result, error) -> {
    if (error != null) {
        System.out.println("Error: " + error.getMessage());
    } else {
        System.out.println("Result: " + result);
    }
});

System.out.println("Main thread is running without blocking");
```

通过 whenComplete() 结合 completeAsync() 使用

```java
CompletableFuture.supplyAsync(() -> {
    try { TimeUnit.SECONDS.sleep(3); } catch (InterruptedException e) { e.printStackTrace(); }
    return "hello world";
}).completeAsync(() -> {
    try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    return "alternative value";
}).whenComplete((r, e) -> {
    if (e != null) {
        System.out.println(e.getLocalizedMessage());
    } else {
        System.out.println(r); // alternative value
    }
});

System.out.println("Main thread is running without blocking");
```

## thenApply()

如果没有遇到异常, 就会进入 thenApply() 对上一个返回结果做进一步处理

```java
CompletableFuture.supplyAsync(() -> {
    return "hello world";
}).thenApply((result) -> {
    return result.toUpperCase();
});
```

## handle()

如果遇到异常, 就会进入 handle() 对上一个返回结果做进一步处理

```java
CompletableFuture.supplyAsync(() -> {
    return "hello world";
}).thenApply((result) -> { // Terminate when encountering exceptions.
    return result.toUpperCase();
}).handle((result, e) -> { // If encountering an exception, you can continue to execute downwards.
    return result.toLowerCase();
});
```

## thenRun()

执行一个 Runnable, 不使用上一步操作的结果, 通常用来记录日志

```java
CompletableFuture.supplyAsync(() -> {
    return "hello world";
}).thenRun(() -> {
    System.out.println("Computation finished");
})
```

## thenAccept()

通过 thenAccept() 消费 supplyAsync() 提供了资源

```java
CompletableFuture.supplyAsync(() -> {
    return "hello world";
}).thenAccept((result) -> {
    System.out.println(result);
});
```

## applyToEither()

通过 applyToEither() 接受两个 CompletableFuture 中最先返回的结果

```java
CompletableFuture playerA = CompletableFuture.supplyAsync(() -> {
    try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    return "player A";
});

CompletableFuture playerB = CompletableFuture.supplyAsync(() -> {
    try { TimeUnit.SECONDS.sleep(2); } catch (InterruptedException e) { e.printStackTrace(); }
    return "player B";
});

CompletableFuture result = playerA.applyToEither(playerB, (f) -> {
    return f + " is winner";
});

System.out.println(result.get()); // player A is winner
```

## thenCombine()

通过 thenCombine() 合并两个 CompletableFuture 返回的结果

```java
CompletableFuture componentA = CompletableFuture.supplyAsync(() -> {
    return "hello";
});

CompletableFuture componentB = CompletableFuture.supplyAsync(() -> {
    return "world";
});

CompletableFuture result = componentA.thenCombine(componentB, (x, y) -> {
    return x + " " + y;
});

System.out.println(result.get()); // hello world
```

## exceptionally()

通过 exceptionally() 处理异常

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    if (true) {
        throw new RuntimeException("Exception occurred!");
    }
    return "Hello, World!";
}).exceptionally((e) -> {
    System.out.println(e.getLocalizedMessage());
    return "Default Value";
});

System.out.println(future.get()); // Default Value
```

## thread pool

设置 CompletableFuture 的 Thread Pool

```java
ExecutorService threadPool = Executors.newFixedThreadPool(3);

// CompletableFuture<U> supplyAsync(Supplier<U> supplier, Executor executor)
CompletableFuture<String> completableFuture = CompletableFuture.supplyAsync(() -> {
    return "hello world";
}, threadPool);
System.out.println(completableFuture.get()); // hello world
```

```java
ExecutorService threadPool = Executors.newFixedThreadPool(3);

CompletableFuture.supplyAsync(() -> {
    try { TimeUnit.MILLISECONDS.sleep(20); } catch (InterruptedException e) { e.printStackTrace(); }
    return "hello world";
}, threadPool).thenRun(() -> {
    System.out.println(Thread.currentThread().getName()); // pool-1-thread-1
}).thenRun(() -> {
    System.out.println(Thread.currentThread().getName()); // pool-1-thread-1
}).thenRun(() -> {
    System.out.println(Thread.currentThread().getName()); // pool-1-thread-1
});

CompletableFuture.supplyAsync(() -> {
    try { TimeUnit.MILLISECONDS.sleep(20); } catch (InterruptedException e) { e.printStackTrace(); }
    return "hello world";
}, threadPool).thenRunAsync(() -> {
    System.out.println(Thread.currentThread().getName()); // ForkJoinPool.commonPool-worker-1
}).thenRun(() -> {
    System.out.println(Thread.currentThread().getName()); // pool-1-thread-1
}).thenRun(() -> {
    System.out.println(Thread.currentThread().getName()); // pool-1-thread-1
});
```

CompletableFuture 默认使用 ForkJoinPool.commonPool() 作为线程池, 这个线程池是一个 Daemon Thread, 等 User Thread 全部执行完, JVM 就会结束, 即 Daemon Thread 也会结束

这里 Main Thread 执行完, JVM 就会结束, CompletableFuture 开启的异步线程还没有执行完, 就直接结束了

```java
CompletableFuture.supplyAsync(() -> {
    try { TimeUnit.SECONDS.sleep(3); } catch (InterruptedException e) { e.printStackTrace(); }
    return "hello world";
}).whenComplete((result, e) -> {
    if (e == null) {
        System.out.println("result: " + result);
    }
}).exceptionally((e) -> {
    System.out.println("exception: " + e.getCause() + ": " + e.getMessage());
    return null;
});

System.out.println("main is running");
```

# Ignore Async Thread

main thread 执行完毕, 不会等待 async thread, 会导致 async thread 的运行错误

通过 sleep() 等待 aysnc thread, 解决问题

```java
CompletableFuture.supplyAsync(() -> {
    return "hello world";
}).whenComplete((result, e) -> {
    if (e == null) {
        System.out.println("result: " + result);
    }
}).exceptionally((e) -> {
    System.out.println("exception: " + e.getCause() + ": " + e.getMessage());
    return null;
});

System.out.println("main is running");

// In main(), all other threads are daemon threads.
// When the main thread finishes running, it will shut down the JVM, so we will pause here for a moment for testing.
try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
```

通过 thread pool 管理 async thread, 解决问题

```java
ExecutorService threadPool = Executors.newFixedThreadPool(3);

try {
    CompletableFuture.supplyAsync(() -> {
        return "hello world";
    }, threadPool).whenComplete((result, e) -> {
        if (e == null) {
            System.out.println("result: " + result);
        }
    }).exceptionally((e) -> {
        System.out.println("exception: " + e.getCause() + ": " + e.getMessage());
        return null;
    });
} catch (Exception e) {
    throw new RuntimeException(e);
} finally {
    threadPool.shutdown();
}

System.out.println("main is running");
```