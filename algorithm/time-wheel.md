### Timer 的实现原理

`Timer` 通过一个优先级队列存储需要执行的任务，塞入定时任务到优先级队列时，会按照任务到执行时间进行排序。接着 `Timer` 会依赖一个单线程从队列取任务，如果当前的时间大于定时任务的执行时间，则执行任务，反之则睡眠等待到执行时间。

```java
while (true) {
    // 当前的执行时间
    long currTime = System.currentTimeMillis();
    // 最近的一个任务执行时间
    long execTime = queue.peek().scheduledExecutionTime();
    if (currTime >= execTime) {
        TimerTask task = queue.poll();
        task.run();
    } else {
        // 如果没有任务的执行时间，就一直睡眠等待
        Thread.sleep(execTime - currTime);
    }
}
```

`Timer` 的实现方式有着诸多缺点：

- 单线程导致任务阻塞：如果一个任务执行时间过长，其他任务将无法及时执行。这会影响到所有被调度的任务的执行时间。
- 单线程导致任务延迟：所有任务都在同一个线程中顺序执行，如果某个任务出现延迟或阻塞，会导致后续任务的延迟。
- 线程安全问题：`Timer` 和 `TimerTask` 并不是线程安全的。在多线程环境中使用时，如果不小心处理，可能会导致并发问题。例如，取消任务和调度新任务可能会产生竞争条件。

### ScheduledThreadPoolExecutor 实现原理

`ScheduledThreadPoolExecutor` 使用 `DelayedWorkQueue` 作为其任务队列。`DelayedWorkQueue` 是一个优先级队列，任务根据其执行时间排序。

`ScheduledFutureTask` 是一个实现了 `RunnableScheduledFuture` 接口的类，表示一个可以被调度的任务。它包含了任务的执行时间和周期性调度的信息。

`ScheduledThreadPoolExecutor` 使用 `ReentrantLock` 代替了 `synchronized`、`wait()` 和 `notify()` 来实现线程同步和任务调度。

`ScheduledThreadPoolExecutor` 引入了 Leader-Follwer 机制来优化任务调度，同一时间，只会有一个 Leader 在等待头部任务，该线程会等待直到可以执行任务或被中断，当获取到任务后，该线程会将 Leader 的身份转让给其他线程，由新的 Leader 去等待执行任务。

在 `take()` 中可以看到 Leader-Follower 机制的实现：

```java
public Runnable take() throws InterruptedException {
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        for (;;) {
            RunnableScheduledFuture<?> first = queue[0];
            if (first == null)
                available.await();
            else {
                long delay = first.getDelay(NANOSECONDS);
                if (delay <= 0)
                    return poll();
                first = null; // don't retain ref while waiting
                if (leader != null)
                    available.await();
                else {
                    Thread thisThread = Thread.currentThread();
                    leader = thisThread;
                    try {
                        available.awaitNanos(delay);
                    } finally {
                        if (leader == thisThread)
                            leader = null;
                    }
                }
            }
        }
    } finally {
        if (leader == null && queue[0] != null)
            available.signal();
        lock.unlock();
    }
}
```

### Time Wheel 实现原理

`Timer` 和 `ScheduledThreadPoolExecutor` 都依靠优先级队列对定时任务进行重排序，每当塞入新任务时，重排序的工作量太大

时间轮（Time Wheel）是一种高效的定时器实现机制，特别适用于需要处理大量定时任务的场景。它通过将时间分片并使用环形数组来管理定时任务，极大地提高了定时器的性能和可扩展性。时间轮的设计可以有效地解决 `Timer` 和 `ScheduledThreadPoolExecutor` 的一些问题。

时间轮的核心思想是将时间分成固定大小的时间片，并将这些时间片组织成一个环形结构。每个时间片对应一个桶（bucket），桶中存储需要在该时间片执行的任务。当时间推进时，时间轮的指针（类似于时钟的秒针）依次移动到下一个时间片，检查并执行该时间片中的任务。

```java
public class TimeWheel {
    private final long tickDuration; // 每个时间片的持续时间
    private final int wheelSize; // 时间轮的大小（时间片的数量）
    private final List<Set<Runnable>> wheel; // 时间轮的桶
    private final ScheduledExecutorService executor; // 用于推进时间轮的调度器
    private int currentTick = 0; // 当前时间片

    public TimeWheel(long tickDuration, int wheelSize) {
        this.tickDuration = tickDuration;
        this.wheelSize = wheelSize;
        this.wheel = new ArrayList<>(wheelSize);
        for (int i = 0; i < wheelSize; i++) {
            wheel.add(new HashSet<>());
        }
        this.executor = Executors.newSingleThreadScheduledExecutor();
        this.executor.scheduleAtFixedRate(this::advance, tickDuration, tickDuration, TimeUnit.MILLISECONDS);
    }

    // 添加任务到时间轮中
    public void addTask(Runnable task, long delay) {
        long ticks = delay / tickDuration;
        int bucketIndex = (int) ((currentTick + ticks) % wheelSize);
        wheel.get(bucketIndex).add(task);
    }

    // 推进时间轮
    private void advance() {
        Set<Runnable> tasks = wheel.get(currentTick);
        for (Runnable task : tasks) {
            task.run();
        }
        tasks.clear();
        currentTick = (currentTick + 1) % wheelSize;
    }

    public void shutdown() {
        executor.shutdown();
    }

    public static void main(String[] args) {
        TimeWheel timeWheel = new TimeWheel(1000, 60); // 每个时间片1秒，时间轮大小为60
        timeWheel.addTask(() -> System.out.println("Task executed!"), 5000); // 5秒后执行任务
    }
}
```

### Hierarchical TimeWheel

上面这种单层时间轮的实现方式存在一个很明显的缺陷，就是能处理的时间间隔，就是一个时间片，例如，时间片为 1s，而我想要延迟 1.5s 后执行，就无法实现。

多层时间轮（Hierarchical TimeWheel）是一个常见的改进方案。它通过使用多个层次的时间轮来处理不同粒度的定时任务。每一层时间轮处理不同的时间范围，最底层的时间轮处理最细粒度的时间任务。

- 顶层时间轮: 处理较大的时间范围。
- 底层时间轮: 处理较小的时间范围。

当一个任务的延迟时间超过当前时间轮的最大时间片时，可以将任务推进到更高层的时间轮中。

```java
public class HierarchicalTimeWheel {
    private final long tickDuration;
    private final int wheelSize;
    private final List<Set<Runnable>>[] wheels;
    private final ScheduledExecutorService executor;
    private int currentTick = 0;

    public HierarchicalTimeWheel(long tickDuration, int wheelSize, int levels) {
        this.tickDuration = tickDuration;
        this.wheelSize = wheelSize;
        this.wheels = new List[levels];
        for (int i = 0; i < levels; i++) {
            wheels[i] = new ArrayList<>(wheelSize);
            for (int j = 0; j < wheelSize; j++) {
                wheels[i].add(new HashSet<>());
            }
        }
        this.executor = Executors.newSingleThreadScheduledExecutor();
        this.executor.scheduleAtFixedRate(this::advance, tickDuration, tickDuration, TimeUnit.MILLISECONDS);
    }

    public void addTask(Runnable task, long delay) {
        long ticks = delay / tickDuration;
        int level = 0;
        while (ticks >= wheelSize && level < wheels.length - 1) {
            ticks /= wheelSize;
            level++;
        }
        int bucketIndex = (int) ((currentTick + ticks) % wheelSize);
        wheels[level].get(bucketIndex).add(task);
    }

    private void advance() {
        for (int level = 0; level < wheels.length; level++) {
            Set<Runnable> tasks = wheels[level].get(currentTick);
            for (Runnable task : tasks) {
                task.run();
            }
            tasks.clear();
            if (level < wheels.length - 1 && currentTick == 0) {
                wheels[level + 1].get(currentTick).addAll(wheels[level].get(currentTick));
                wheels[level].get(currentTick).clear();
            }
        }
        currentTick = (currentTick + 1) % wheelSize;
    }

    public void shutdown() {
        executor.shutdown();
    }

    public static void main(String[] args) {
        HierarchicalTimeWheel timeWheel = new HierarchicalTimeWheel(1000, 60, 3); // 每个时间片1秒，时间轮大小为60，3层时间轮
        timeWheel.addTask(() -> System.out.println("Task executed!"), 5000); // 5秒后执行任务
    }
}
```

