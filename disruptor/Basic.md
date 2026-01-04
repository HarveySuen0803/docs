### 进度序号

在判断生产者是否可以继续生成，或者消费者是否可以继续消费时，可以采用进度序号的方案，消费者和生产者各自维护一个进度序号，只需要比较进度序号即可。

```java
public Integer compare(int consumerSeq, int producerSeq) {
    return producerSeq - consumerSeq;
}
```

通过 进度序号 按位与 索引掩码 即可得到访问到对应的索引。

```java
public class ArrayBlockingQueue<V> {
    private final Event<V>[] events;
    
    public ArrayBlockingQueue(int cap) {
        this.cap = cap;
        this.mask = cap - 1;
        this.events = new Event[cap];
    }

    public V get(int seq) {
        return events[seq & mask];
    }
}
```

在并发环境下，上面的进度序号随时会发生变化，如果使用基础类型的变量就无法感知了，可以采用下面这个封装的进度序号对象。

```java
public class Sequence {
    private volatile int value;
    
    public Sequence(int value) {
        this.value = value;
    }
    
    public int get() {
        return value;
    }

    public void incr() {
        this.value++;
    }
}
```

### 阻塞策略

如果 providerSeq 小于 consumerSeq 说明生成速度赶不上消费速度，需要等待生产。在简单的阻塞策略中，直接 Sleep 阻塞等待不是一个明智的做法，可以通过下面这种方式简单优化一下，先循环比较 consumerSeq 和 producerSeq，通过一个 retryTimes 作为计数器，如果 retryTimes > 100 就继续循环比较，并且不断的减少计数；如果 retryTimes > 0 就尝试让出线程资源，并且继续减少计数；当 retryTimes 为 0 时，再进行睡眠。这种逐层递减的阻塞策略，能比较高效的利用起 CPU。

```java
public class SleepingWaitStrategy {
    private final int retryTimes;
    
    private final long sleepNanos;
    
    public SleepingWaitStrategy(int retryTimes, long sleepNanos) {
        this.retryTimes = retryTimes;
        this.sleepNanos = sleepNanos;
    }
    
    public void wait(Sequence consumerSeq, Sequence producerSeq) {
        int curRetryTimes = this.retryTimes;
        while (consumerSeq.get() < producerSeq.get()) {
            if (curRetryTimes > 100) {
                curRetryTimes--;
            } else if (curRetryTimes > 0) {
                curRetryTimes--;
                Thread.yield();
            } else {
                LockSupport.parkNanos(sleepNanos);
            }
        }
    }
}
```

### 抽象 Event 事件对象，优化对象存储

每次都要像下面这样，操作队列，创建和销毁对象，开销太大：

```java
// 创建对象
public void offer(Object item) {
    items[0] = item;
}

// 销毁对象
public Object poll() {
    Object item = items[0];
    items[0] = null;
    return item;
}
```

堵塞队列就是构建了一套 EventFactory 来管理队列中的元素，队列中的每个元素都抽象成 Event，每个 Event 内部存放真正的数据，我们操作队列的 offer 和 pull 也编程了 publishEvent 和 consumeEvent。

```java
public class Event<V> {
    private V value;

    public void set(V value) {
        this.value = value;
    }

    public V get() {
        return this.value;
    }
}

public interface EventFactory<E> {
    E newInstance();
}

public class SimpleEventFactory<V> implements EventFactory<Event<V>> {
    @Override
    public Event<V> newInstance() {
        return new Event<V>();
    }
}
```

创建 ArrayBlockingQueue 时，就初始化 events 数组，创建好所有的 Event，后续操作数据，就只需要修改 Event 对象内部的 value 即可，减少了后续 Event 的创建和销毁的开销。

```java
public class ArrayBlockingQueue<V> {
    private final Event<V>[] events;

    public ArrayBlockingQueue(int cap, EventFactory<Event<V>> eventFactory) {
        this.events = new Event[cap];
        fillEvents(eventFactory);
    }

    public void fillEvents(EventFactory<Event<V>> eventFactory) {
        for (int i = 0; i < events.length; i++) {
            events[i] = eventFactory.newInstance();
        }
    }
    
    public void publish(V value) {
        events[next].set(value);
    }
}
```

### 通过 EventProvider 获取事件

下面这段代码通过 BatchEventProcessor 注入 EventHandler 循环处理所有的事件，注入 ArrrayBlockingQueue 获取需要的时间对象，通过 Sequence 来标记当前处理事件的进度。

```java
public class BatchEventProcessor implements EventProcessor {
    private ArrayBlockingQueue queue;

    private EventHandler eventHandler;

    private Sequence seq;

    public BatchEventProcessor(ArrayBlockingQueue queue, EventHandler eventHandler) {
        this.queue = queue;
        this.eventHandler = eventHandler;
    }

    @Override
    public void run(){
        while (true) {
            E event = queue.get(seq);
            eventHandler.onEvent(event, eventHandler);
            seq.add();
        }
    }
}
```

直接注入了一整个 ArrayBlockingQueue 从设计上来讲并不好，因为 EventProcessor 明明只需要一个 queue.get() 来获取事件。

可以像下面这样抽取一个 EventProvider 接口，专门用于提供需要的 Event 对象，而 EventProcessor 也只需要注入这个 EventProvider 就好了。

```java
public interface EventProvider<E> {
    E get(Sequence seq);
}

public class ArrayBlockingQueue<V> implements EventProvider {
    @Override
    public V get(Sequence seq) {
        return events[idx(seq)];
    }
}
```

```java
public class BatchEventProcessor implements EventProcessor {
    private EventProvider eventProvider;

    private EventHandler eventHandler;

    private Sequence seq;

    public BatchEventProcessor(EventProvider eventProvider, EventHandler eventHandler) {
        this.eventProvider = eventProvider;
        this.eventHandler = eventHandler;
    }

    @Override
    public void run(){
        while (true) {
            E event = eventProvider.get(seq);
            eventHandler.onEvent(event, eventHandler);
            seq.add();
        }
    }
}
```

### 通过 EventProcessor 处理事件

我们在使用 EventProcessor 循环处理事件时，需要保证消费进度应该小于生成进度，就可以使用之前提到的 SleepingWaitStrategy 来实现判断和阻塞。

```java
public class EventProcessor {
    @Override
    public void run(){
        while (true) {
            sleepingWaitStrategy.wait(consumerSeq, producerSeq);
            E event = eventProvider.get(consumerSeq.get());
            eventHandler.onEvent(event, eventHandler);
            consumerSeq.add();
        }
    }
}
```

每次循环都需要去判断一遍 consumerSeq 和 producerSeq 的大小，例如 producerSeq 为 30, consumerSeq 为 6 就需要循环比较 24 次，在框架逐渐完善后，这个比较往往是需要设计并发同步问题的，开销比较大。

我们可以在进行一次比较后，就将这个 avaliableSeq = 30 记录在栈帧中，表示一直到 seq = 30 都是可以消费的，不需要再去进行比较，能够提高性能。

这里的框架不够完善，例子有点勉强，不要太在意，主要是学习这个优化思路。

```java
public class SleepingWaitStrategy {
    public Sequence wait(Sequence consumerSeq, Sequence producerSeq) {
        int curRetryTimes = this.retryTimes;
        while (producerSeq.get() < consumerSeq.get()) {
            if (curRetryTimes > 100) {
                curRetryTimes--;
            } else if (curRetryTimes > 0) {
                curRetryTimes--;
                Thread.yield();
            } else {
                LockSupport.parkNanos(sleepNanos);
            }
        }
        // 计算出可以消费的序号
        return Sequence.sub(producerSeq, consumerSeq);
    }
}
```

```java
public class EventProcessor {
    @Override
    public void run(){
        while (true) {
            // 得到可以消费的序号后，直接消费这个序号即可，不需要再去比较 consumerSeq 和 producerSeq 了，直接比较 consumerSeq 和 avaliableSeq 即可。
            Sequence avaliableSeq = sleepingWaitStrategy.wait(consumerSeq, producerSeq);
            while (consumerSeq().get() < avaliableSeq.get()) {
                E event = eventProvider.get(consumerSeq.get());
                eventHandler.onEvent(event, eventHandler);
                consumerSeq.add();
            }
        }
    }
}
```

