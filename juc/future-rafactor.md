### Callable 介绍

`Callable` 是 Java 中的一个接口，用于定义可以由线程执行并返回结果的任务。与 `Runnable` 不同，`Callable` 的 `call()` 方法可以返回一个值，并且可以抛出已检查的异常。

```java
public interface Callable<V> {
    V call() throws Exception;
}
```

### Future 介绍

`Future` 本身是一个接口，常见的实现类是 `FutureTask`。`FutureTask` 实现了 `Runnable` 和 `Future`，可以用于包装 `Callable` 或 `Runnable` 对象。

下面是一个详细的例子，说明如何使用 `Future`, `FutureTask`, `Callable`：

```java
class MyCallable implements Callable<String> {
    @Override
    public String call() throws Exception {
        Thread.sleep(1000);
        return "hello world";
    }
}

public class CallableExample {
    public static void main(String[] args) {
        MyCallable task = new MyCallable();
        FutureTask<String> futureTask = new FutureTask<>(task);
        Thread thread = new Thread(futureTask);
        thread.start();
        
        try {
            // 等待任务执行完成
            String result = futureTask.get(); // "hello world"
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
    }
}
```

### FutureTask 底层实现

好了，现在你已经了解了 `Future` 和 `FutureTask` 的基本使用了，现在该来学习如何手写一个 `FutureTask` 了 😰。

