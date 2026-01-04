# ForkJoin

Fork/Join 框架是 Java 7 中引入的一个用于并行执行任务的工具, 它主要用来提高多核处理器的利用率

Fork/Join 框架的核心思想是将一个大任务拆分 (Fork) 成若干个小任务, 如果小任务足够小, 就直接执行它, 否则, 继续拆分, 各个小任务独立运行在不同的线程上, 线程之间几乎不需要进行通信, 最后, 将所有小任务的结果合并 (Join) 成大任务的结果

- 要计算 1 ~ 1000 的和, 这个任务可以分成更小的任务 (eg: 拆分成两个任务, 一个计算 1 ~ 500 的和, 另一个计算 501 ~ 1000 的和)
- 设置 THRESHOLD 为 100, 即最小任务计算范围是 100, 如果任务的范围超过了阈值 100, 它就会被分成两个更小的任务, 递归进行, 直到任务足够小, 可以直接计算, 所有的子任务都是并行执行的, 最后将所有结果合并

RecursiveTask 和 RecursiveAction 都继承自 ForkJoinTask, 主要区别在于是否有返回值

1. RecursiveAction 没有返回值, 任务执行完毕后, 不需要知道任何结果, 只需要知道任务已经完成 (eg: 对一个大数组进行排序或者遍历一个大的文件系统进行某种处理)

```java
public class AddAction extends RecursiveAction {
    private static final int THRESHOLD = 100;
    private int[] arr;
    private int sta;
    private int end;
    
    public AddAction(int[] arr, int sta, int end) {
        this.arr = arr;
        this.sta = sta;
        this.end = end;
    }
    
    @Override
    protected void compute() {
        if (end - sta <= THRESHOLD) {
            for (int i = sta; i <= end; i++) {
                arr[i] += 1;
            }
        } else {
            int mid = (sta + end) / 2;
            invokeAll(new AddAction(arr, sta, mid), new AddAction(arr, mid + 1, end));
        }
    }
}
```

2. RecursiveTask 有返回值 (eg: 计算一个大数组的总和或者查找一个大集合中满足特定条件的元素)

```java
public class SumTask extends RecursiveTask<Integer> {
    private static final int THRESHOLD = 100;
    private int sta;
    private int end;
    
    public SumTask(int sta, int end) {
        this.sta = sta;
        this.end = end;
    }
    
    @Override
    protected Integer compute() {
        if (end - sta <= THRESHOLD) {
            int sum = 0;
            for (int i = sta; i <= end; i++) {
                sum += i;
            }
            return sum;
        } else {
            int mid = (sta + end) / 2;
            SumTask left = new SumTask(sta, mid);
            SumTask right = new SumTask(mid + 1, end);
            left.fork();
            right.fork();
            return left.join() + right.join();
        }
    }
    
    public static void main(String[] args) {
        SumTask sumTask = new SumTask(1, 1000);
        System.out.println(sumTask.compute()); // 500500
    }
}
```

Fork/Join 底层使用到了 Work Stealing, 这是一种用于动态重新平衡负载的方法, 使得所有处理器尽可能地保持忙碌状态, 以提高系统的整体效率和吞吐量

- 双端队列: 每个工作线程维护一个自己的双端队列来存放分配给它的任务, 当一个大任务被分解成更小的任务时, 这些小任务被添加到执行它们的线程的双端队列中
- 任务执行: 工作线程从自己的队列中采用 LIFO (后进先出) 顺序取任务执行, 这样可以更快地完成当前正在处理的任务分支, 尽早地释放占用的资源
- 窃取任务: 当一个线程的队列为空, 即它没有任务可以执行时, 它会随机选择另一个线程的队列, 并采用 FIFO 的顺序从那个队列的尾部窃取一个任务来执行, 这样做是因为从另一个队列的尾部窃取任务不太可能与该队列所有者发生冲突, 减少了锁的竞争
- 持续窃取: 这个过程持续进行, 所有空闲的线程都会尝试从其他线程的队列中窃取任务, 当所有的任务都完成时, 算法结束

# ForkJoinPool

ForkJoinPool 是专为任务密集型并行计算设计的, 并且它采用 Work Stealing 算法来优化任务的执行效率, 减少线程间的竞争, 从而提高并行执行的性能

创建 ForkJoinPool, 线程数量默认为处理器的可用核心数

1. 手动创建一个 ForkJoinPool

```java
ForkJoinPool forkJoinPool = new ForkJoinPool();
```

2. 获取一个共享的公共池

```java
ForkJoinPool commonPool = ForkJoinPool.commonPool();
```

通过 ForkJoinPool 执行 RecursiveAction 任务

```java
public class AddAction extends RecursiveAction {
    private static final int THRESHOLD = 1000;
    private long[] arr;
    private int sta, end;

    public AddAction(long[] arr, int sta, int end) {
        this.arr = arr;
        this.sta = sta;
        this.end = end;
    }

    @Override
    protected void compute() {
        if (end - sta < THRESHOLD) {
            for (int i = sta; i < end; i++) {
                arr[i]++;
            }
        } else {
            int mid = (sta + end) / 2;
            AddAction left = new AddAction(arr, sta, mid);
            AddAction right = new AddAction(arr, mid, end);
            invokeAll(left, right);
        }
    }

    public static void main(String[] args) {
        ForkJoinPool pool = ForkJoinPool.commonPool();
        long[] arr = new long[2000];
        pool.invoke(new AddAction(arr, 0, arr.length));
    }
}
```

通过 ForkJoinPool 执行 RecursiveTask 任务

```java
import java.util.concurrent.RecursiveTask;
import java.util.concurrent.ForkJoinPool;

public class SumTask extends RecursiveTask<Long> {
    private static final int THRESHOLD = 1000;
    private long[] arr;
    private int sta, end;

    public SumTask(long[] arr, int sta, int end) {
        this.arr = arr;
        this.sta = sta;
        this.end = end;
    }

    @Override
    protected Long compute() {
        if (end - sta < THRESHOLD) {
            long sum = 0;
            for (int i = sta; i < end; i++) {
                sum += arr[i];
            }
            return sum;
        } else {
            int mid = (sta + end) / 2;
            SumTask left = new SumTask(arr, sta, mid);
            SumTask right = new SumTask(arr, mid, end);
            left.fork();
            long rightResult = right.compute();
            long leftResult = left.join();
            return leftResult + rightResult;
        }
    }

    public static void main(String[] args) {
        ForkJoinPool pool = ForkJoinPool.commonPool();
        long[] arr = new long[2000];
        Long result = pool.invoke(new SumTask(arr, 0, arr.length));
        System.out.println("Sum: " + result);
    }
}
```

# ManagedBlocker

假设 ForkJoinPool 限定了只有 A, B, C 三个线程, 此时 A, B, C 都很繁忙, A 又要执行这个耗时任务, ForkJoinPool 就可能内部决定开启一个 D 线程来接替上 A 的位置, 来补偿并行效率, 即会超出原先设定的 3 个线程

```java
// 模拟耗时的任务
public static class ComplexTask implements Callable<String> {
    @Override
    public String call() throws Exception {
        Thread.sleep(1000);
        return "calculation result";
    }
}

// 处理耗时任务的 Blocker
public static class ComplexTaskBlocker implements ForkJoinPool.ManagedBlocker {
    private Future<String> future;
    private String result;
    
    public ComplexTaskBlocker(Future<String> future) {
        this.future = future;
    }

    // 让一个线程在这堵塞执行任务
    @Override
    public boolean block() throws InterruptedException {
        try {
            result = future.get();
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
        return true;
    }

    // 判断当前任务是否已经执行完成, 如果返回的是 false, 就会去调用 block() 执行耗时任务
    @Override
    public boolean isReleasable() {
        return future.isDone();
    }
    
    public String getResult() {
        return result;
    }
}

public static void main(String[] args) throws IOException, InterruptedException, ExecutionException {
    ExecutorService threadPool = Executors.newFixedThreadPool(1);
    
    Future<String> future = threadPool.submit(new ComplexTask());

    // 将耗时的 Future 任务封装成一个 Blocker 交给 ForkJoinPool 管理
    ComplexTaskBlocker complexTaskBlocker = new ComplexTaskBlocker(future);

    // 由 ForkJoinPool 来管理该 Blocker, ForkJoinPool 会在内部决定, 判断当前压力是否需要启动或唤醒一个额外的线程
    ForkJoinPool.managedBlock(complexTaskBlocker);
    
    // 获取任务执行结果
    System.out.println(complexTaskBlocker.getResult());
    
    threadPool.shutdown();
}
```