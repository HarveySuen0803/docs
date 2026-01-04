# Runtime

```java
Runtime runtime = Runtime.getRuntime();

int size = runtime.availableProcessors(); // 10
```

# Thread

Java thread 通过 start() 调用 start0() 启动线程, start0() 是一个 native method, 本质是调用的 Cpp 的 JVM_StartThread() 操作 OS 创建 Thread

```java
public class Main {
    public static void main(String[] args) {
        A a1 = new A();
        A a2 = new A();
        a1.start();
        a2.start();
    }
}

class A extends Thread {
    int count = 0;
    
    @Override
    public void run() {
        while (true) {
            System.out.println(Thread.currentThread().getName());
            
            count++;
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            
            if (count == 50) break;
        }
    }
}
```

# Runnable

```java
public class Main {
    public static void main(String[] args) throws InterruptedException {
        A a = new A();
        Thread thread1 = new Thread(a);
        Thread thread2 = new Thread(a);
        thread1.start();
        thread2.start();
    }
}

class A implements Runnable {
    int count = 0;
    
    @Override
    public void run() {
        while (true) {
            System.out.println(count + " " + Thread.currentThread().getName());
            
            count++;
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            if (count == 50) break;
        }
    }
}
```

# Simulate Runnable

```java
public class Main {
    public static void main(String[] args) throws InterruptedException {
        ThreadProxy threadProxy = new ThreadProxy(new A());
        threadProxy.start();
    }
}

class ThreadProxy implements Runnable {
    private Runnable a;
    
    public ThreadProxy(A a) {
        this.a = a;
    }
    
    @Override
    public void run() {
        if (a == null) {
            return;
        }
        a.run();
    }
    
    public void start() {
        run();
    }
}

class A implements Runnable{
    @Override
    public void run() {
        System.out.println("hello world");
    }
}
```

# Simplify With Lambda

```java
new Thread(() -> {
    System.out.println("hello world");
}, "t").start();
```

# Thread API

```java
Thread t = new Thread(() -> {
    while (true) {
        System.out.println(Thread.currentThread().getName() + " is running");
        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            System.out.println(Thread.currentThread().getName() + " was interrupted");
        }
    }
});

// set thread name
t.setName("Thread-Sun");

System.out.println(t.isAlive()); // true

// get thread name
System.out.println(t.getName()); // Thread-Sun
System.out.println(Thread.currentThread().getName()); // main

// set priority
//   MAX_PRIORITY 10
//   NORM_PRIORITY 5
//   MIN_PRIORITY 1
t.setPriority(Thread.MIN_PRIORITY);

// get priority
System.out.println(t.getPriority()); // 1

t.start();

// interrupt thread
t.interrupt();
```

# yield

```java
new Thread(() -> {
    System.out.println("...");
    
    // if the yield is successful, the operation will be stopped and other threads will execute first
    Thread.yield();
    
    System.out.println("...");
});

new Thread(() -> {
    System.out.println("...");
});
```

# join

```java
new Thread(() -> {
    System.out.println("...");
    
    try {
        // join thread, execute this thread first
        Thread.currentThread().join();
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
    
    System.out.println("...");
});

new Thread(() -> {
    System.out.println("...");
});
```

# Daemon Thread

daemon thread 为其他 thread 服务, 负责系统性的任务 (eg: GC), 所有的 user thread 结束后, JVM 会关闭, daemon thread 会自动结束

```java
Thread t = new Thread(() -> {
    while (true) {
        System.out.println("daemon thread is running");
    }
});
// waiting for other threads to end
t.setDaemon(true);
t.start();

boolean daemon = t1.isDaemon();
```

# Thread Lifecycle

Thread LifeCycle 由 Thread.State 表示

- NEW: 当线程对象被创建但还没有调用 start() 时, 此时线程并没有被分配到系统资源, 无法执行
- RUNNABLE: 调用 start() 后, 线程进入可运行状态, 此时线程具备了获取 CPU 时间片的资格, 但不代表一定能够执行, 因为有可能其他线程正在执行
- TERMINATED: 线程处于终止状态表示它已经执行完成或者因异常而终止, 线程执行完 run(), 或者出现未捕获异常时, 会进入终止状态
- BLOCKED: 线程进入阻塞状态是因为它在等待锁的释放, 无法继续执行
- WAITING: 线程进入等待状态是因为它正在等待其他线程执行某些操作通知, 以唤醒它, 或者等待某个条件满足后继续执行
- TIMED_WAITING: 线程进入限时等待状态是因为它正在等待一段指定的时间后, 

Thread State 的切换

- NEW -> RUNNABLE：调用 start()
- RUNNABLE -> BLOCKED: 线程在同步块或同步方法中等待锁
- RUNNABLE -> WAITING: 调用 Object.wait(), Thread.join()
- RUNNABLE -> TIMED_WAITING: 调用 Thread.sleep()
- BLOCKED / WAITING / TIMED_WAITING -> RUNNABLE: 线程获得了锁或者等待的条件得到满足
- RUNNABLE -> TERMINATED: 执行完 run()

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202402051653133.png)

```java
T t = new T(() -> {
    System.out.println("thread is running");

    try {
        Thread.sleep(3000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
});

System.out.println(t.getState()); // NEW

t.start();

System.out.println(t.getState()); // RUNNABLE

while (t.getState() != Thread.State.TERMINATED) {
    System.out.println(t.getState()); // TIMED_WAITING
    Thread.sleep(1000);
}

System.out.println(t.getState()); // TERMINATED
```

# Polling vs Blocking

轮询状态下, CPU 可以继续执行其他任务或代码, 灵活地切换执行不同的任务, 可以更充分地利用计算资源, 轮询通常能够更快地检测到事件的发生, 因为它以较小的时间间隔不断地查询状态, 适用于实时性要求较高, 需要快速响应的场景

轮询可能导致 CPU 占用率过高, 浪费了一些计算资源, 为了解决这个问题, 通常采用了一些优化手段, 如使用睡眠机制或者回退策略, 以减少轮询的频率, 降低 CPU 的占用率

阻塞状态下, 线程会进入一个休眠状态, 不占用 CPU 资源, 可以避免浪费计算资源, 当条件满足条件时, 线程将被唤醒, 重新进入就绪状态, 等待分配到 CPU 时间片来执行, 适用于对实时性要求较低的场景, 可以避免 CPU 过度

# Control Thread Order

通过 join() 可以控制多个线程的执行顺序

```java
Thread t1 = new Thread(() -> {
    System.out.println("t1");
});

Thread t2 = new Thread(() -> {
    try {t1.join();} catch (InterruptedException e) {throw new RuntimeException(e);}
    System.out.println("t2");
});

Thread t3 = new Thread(() -> {
    try {t2.join();} catch (InterruptedException e) {throw new RuntimeException(e);}
    System.out.println("t3");
});

t1.start();
t2.start();
t3.start();
```

# Exercise Print 1 ~ 100

```java
public static volatile int count = 0;
public static final Object obj = new Object();
public static ExecutorService executorService = Executors.newFixedThreadPool(2);

public static void main(String[] args) {
    executorService.submit(new Task());
    executorService.submit(new Task());
    executorService.shutdown();
}

public static class Task implements Runnable {
    @Override
    public void run() {
        while (true) {
            synchronized (obj) {
                obj.notify();
                System.out.println(Thread.currentThread().getName() + ": " + ++count);
                if (count >= 99) {
                    return;
                }
                try {
                    obj.wait();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }
}
```

# Exercise Print 1 ~ 100

```java
public static volatile int count = 0;
public static volatile boolean isOdd = true;

public static void main(String[] args) {
    new Thread(() -> {
        while (true) {
            if (isOdd) {
                System.out.println(Thread.currentThread().getName() + ": " + ++count);
                isOdd = !isOdd;
                if (count >= 99) {
                    return;
                }
            }
        }
    }).start();
    
    new Thread(() -> {
        while (true) {
            if (!isOdd) {
                System.out.println(Thread.currentThread().getName() + ": "+ ++count);
                isOdd = !isOdd;
                if (count >= 99) {
                    return;
                }
            }
        }
    }).start();
}
```

# Exercise Print 1 ~ 100

```java
public static volatile int count = 0;
public static final Object obj = new Object();

public static void main(String[] args) {
    // 0 -> 1, 2 -> 3, 98 -> 99
    new Thread(() -> {
        while (true) {
            synchronized (obj) {
                obj.notify();
                
                System.out.println(Thread.currentThread().getName() + ": " + count++);
                if (count == 99) {
                    return;
                }
                
                try {
                    obj.wait();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }).start();
    
    // 1 -> 2, 3 -> 4, 99 -> 100
    new Thread(() -> {
        while (true) {
            synchronized (obj) {
                obj.notify();
                
                System.out.println(Thread.currentThread().getName() + ": " + count++);
                if (count == 100) {
                    return;
                }
                
                try {
                    obj.wait();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }).start();
}
```