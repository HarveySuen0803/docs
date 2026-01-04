# Interrupt Thread

一个 thread 一般不应该由其他 thread 打断, 特殊情况可以调用 interrupt() 修改 thread 的 interrupt flag, 这是一种协商, 不会立即停止 thread 

# volatile

```java
public static volatile boolean loop = true;

public static void main(String[] args) throws InterruptedException, ExecutionException, TimeoutException {
    new Thread(() -> {
        while (loop) {
            System.out.println("hello world");
        }
    }).start();
    
    try { TimeUnit.MILLISECONDS.sleep(10); } catch (InterruptedException e) { e.printStackTrace(); }
    
    loop = false;
}
```

# AtomicBoolean

```java
// A boolean value that may be updated atomically. An AtomicBoolean is used in applications such as atomically updated flags.
public static AtomicBoolean atomicBoolean = new AtomicBoolean(true);

public static void main(String[] args) throws InterruptedException, ExecutionException, TimeoutException {
    new Thread(() -> {
        while (atomicBoolean.get()) {
            System.out.println("hello world");
        }
    }).start();
    
    try { TimeUnit.MILLISECONDS.sleep(10); } catch (InterruptedException e) { e.printStackTrace(); }
    
    atomicBoolean.set(false);
}
```

# interrupt()

interrupt() 只是修改了 thread 的 interrupt flag, 这是一种协商, 不会停止 thread

```java
Thread t1 = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        System.out.println("hello world");
    }
});
t1.start();

try { TimeUnit.MILLISECONDS.sleep(10); } catch (InterruptedException e) { e.printStackTrace(); }

t1.interrupt();
System.out.println(t1.isInterrupted()); // true
System.out.println(t1.isInterrupted()); // true
```

如果该 thread 处于 wait(), join(), sleep() 的状态, 执行 interrupt(), 将会抛出 InterruptedException, 并且清除 interrupt flag, 需要在 catch 中再调用一次 interrupt()

```java
Thread t1 = new Thread(() -> {
    while (true) {
        if (Thread.currentThread().isInterrupted()) {
            break;
        }
        
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            e.printStackTrace();
        }
        System.out.println("hello world");
    }
});
t1.start();

try { TimeUnit.MILLISECONDS.sleep(10); } catch (InterruptedException e) { e.printStackTrace(); } 
t1.interrupt();
```

interrupted() 和 isInterrupted() 一样, 可以返回 interrupt flag, 不过 interrupted() 返回一次 true 之后, 会重制为 false

```java
System.out.println(Thread.currentThread().isInterrupted()); // false
Thread.currentThread().interrupt();
System.out.println(Thread.currentThread().isInterrupted());  // true
```

```java
System.out.println(Thread.interrupted()); // false
Thread.currentThread().interrupt();
System.out.println(Thread.interrupted()); // true
System.out.println(Thread.interrupted()); // false
```


