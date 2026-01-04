# CAS

CAS 由 JDK 提供, 通过 hardware 保证了 NoBlocking, Atomicity, 本质是 cmpxchg instruction, 执行 cmpxchg 时, 由 thread 先给 bus 加 lock, 再去执行 CAS 操作, 相比 synchronized 更高效

# Spin Lock

CAS 通过 Spin Lock 实现 Atomicity 不需要 wait, thread 获取 memoryValue, 记录为 exptecedValue, 当 thread 修改完, 需要同步 newValue 到内存时, 先比较 expectedValue 和 memoryValue 是否相同, 如果不同, 则说明在此期间有其他线程修改过了, 本次运算作废, 重新获取 value 进行重试

这种方式避免了线程的阻塞, 减少竞争, 减少了发生死锁的可能性, 减少了上下文切换的开销, 提高了系统的吞吐量

Spin Lock 是通过 infinite loop 实现, 资源耗费较多

```java
public final int getAndAddInt(Object o, long offset, int delta) {
    int v;
    do {
        v = getIntVolatile(o, offset);
    } while (!weakCompareAndSetInt(o, offset, v, v + delta));
    return v;
}
```

# Simulate Spin Lock

```java
public static AtomicReference<Thread> atomicReference = new AtomicReference<>();

public static void lock() {
    System.out.println(Thread.currentThread().getName() + " try to get the lock");
    while (!atomicReference.compareAndSet(null, Thread.currentThread())) {
        System.out.println(Thread.currentThread().getName() + " is spinning");
        try { TimeUnit.MILLISECONDS.sleep(10); } catch (InterruptedException e) { e.printStackTrace(); }
    }
    System.out.println(Thread.currentThread().getName() + " get the lock");
}

public static void unlock() {
    System.out.println(Thread.currentThread().getName() + " try to release the lock");
    atomicReference.compareAndSet(Thread.currentThread(), null);
    System.out.println(Thread.currentThread().getName() + " release the lock");
}

public static void main(String[] args) {
    new Thread(() -> {
        lock();
        try { TimeUnit.MILLISECONDS.sleep(300); } catch (InterruptedException e) { e.printStackTrace(); }
        unlock();
    }).start();
    
    try { TimeUnit.MILLISECONDS.sleep(100); } catch (InterruptedException e) { e.printStackTrace(); }
    
    new Thread(() -> {
        lock();
        System.out.println(Thread.currentThread().getName() + " do something");
        unlock();
    }).start();
}
```

# AtomicReference

通过 AtomicReference 实现 CAS

```java
// An object reference that may be updated atomically.
// AtomicInteger(int initialValue)
AtomicReference<Integer> atomicReference = new AtomicReference<>(100);

new Thread(() -> {
    // boolean compareAndSet(V expectedValue, V newValue)
    atomicReference.compareAndSet(100, 101); // true
    System.out.println(atomicReference.get()); // 101
}).start();

try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

new Thread(() -> {
    atomicReference.compareAndSet(100, 102); // false
    System.out.println(atomicReference.get()); // 101
}).start();
```

AtomicReference 存在 ABA problem, memory 中存储了 A, 一个 thread 先修改为 B, 再修改为 A, 其他 thread 比较 expectedValue 和 memoryValue 没有问题, 但是过程是被污染了

```java
AtomicInteger atomicInteger = new AtomicInteger(100);

new Thread(() -> {
    atomicInteger.compareAndSet(100, 101); // true
    atomicInteger.compareAndSet(101, 100); // true
}).start();

try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

new Thread(() -> {
    atomicInteger.compareAndSet(100, 102); // true
}).start();
```

# AtomicStampReference

AtomicStampReference 会给 value 添加一个 stamp, 不在比较 value, 而是比较 stamp 解决 ABA problem

```java
// An AtomicStampedReference maintains an object reference along with an integer "stamp", that can be updated atomically.
// AtomicStampedReference(V initialRef, int initialStamp)
AtomicStampedReference<Integer> atomicStampedReference = new AtomicStampedReference<>(100, 1);

new Thread(() -> {
    // boolean compareAndSet(V expectedReference, V newReference, int expectedStamp, int newStamp)
    atomicStampedReference.compareAndSet(100, 101, 1, 2); // true
    atomicStampedReference.compareAndSet(101, 100, 2, 3); // true
    System.out.println(atomicStampedReference.getReference() + " " + atomicStampedReference.getStamp()); // 100 3
}).start();

try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

new Thread(() -> {
    atomicStampedReference.compareAndSet(100, 102, 1, 2); // false
}).start();
```

# AtomicMarkableReference

AtomicMarkableReference 会给 value 添加一个 mark, 用于标识该 value 是否被操作过

AtomicMarkableReference 也存在 ABA 问题

```java
// AtomicMarkableReference(V initialRef, boolean initialMark)
AtomicMarkableReference atomicMarkableReference = new AtomicMarkableReference(100, false);

new Thread(() -> {
    // compareAndSet(V expectedReference, V newReference, boolean expectedMark, boolean newMark)
    atomicMarkableReference.compareAndSet(100, 101, atomicMarkableReference.isMarked(), !atomicMarkableReference.isMarked()); // true
}).start();

try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

new Thread(() -> {
    // compareAndSet(V expectedReference, V newReference, boolean expectedMark, boolean newMark)
    atomicMarkableReference.compareAndSet(100, 101, atomicMarkableReference.isMarked(), !atomicMarkableReference.isMarked()); // false
}).start();
```

# AtomicInteger

```java
AtomicInteger atomicInteger = new AtomicInteger();

atomicInteger.set(100);

atomicInteger.get(); // 100

atomicInteger.compareAndSet(100, 101);

atomicInteger.set(100);
System.out.println(atomicInteger.getAndIncrement()); // 100

atomicInteger.set(100);
System.out.println(atomicInteger.incrementAndGet()); // 101

atomicInteger.set(100);
System.out.println(atomicInteger.getAndAdd(5)); // 100

atomicInteger.set(100);
System.out.println(atomicInteger.addAndGet(5)); // 105
```

# AtomicIntegerArray

```java
AtomicIntegerArray atomicIntegerArray = new AtomicIntegerArray(new int[5]);

atomicIntegerArray.set(0, 100);

System.out.println(atomicIntegerArray.get(0));

System.out.println(atomicIntegerArray.compareAndSet(0, 100, 101));
```

# AtomicReferenceFieldUpdater

AtomicReference 是对整个 class 进行 CAS, AtomicReferenceFieldUpdater 是对 class 中的某个 field 进行 CAS

```java
// must be wrapper type
public volatile Integer num = 100;

public static void main(String[] args) throws Exception {
    // AtomicReferenceFieldUpdater<U,W> newUpdater(Class<U> tclass, Class<W> vclass, String fieldName)
    AtomicReferenceFieldUpdater<Main, Integer> atomicReferenceFieldUpdater = AtomicReferenceFieldUpdater.newUpdater(Main.class, Integer.class, "num");
    
    new Thread(() -> {
        // boolean compareAndSet(T obj, V expect, V update)
        atomicReferenceFieldUpdater.compareAndSet(new Main(), 100, 101);
    }).start();
}
```

# AtomicIntegerFieldUpdater

AtomicReferenceFeildUpdater 处理 reference, AtomicInteger 处理 Interger

```java
// must be basic type
public volatile int num = 100;

public static void main(String[] args) throws Exception {
    // AtomicIntegerFieldUpdater<U> newUpdater(Class<U> tclass, String fieldName)
    AtomicIntegerFieldUpdater<Main> atomicIntegerFieldUpdater = AtomicIntegerFieldUpdater.newUpdater(Main.class, "num");
    
    // boolean compareAndSet(T obj, int expect, int update)
    atomicIntegerFieldUpdater.compareAndSet(new Main(), 100, 101);
}
```

# LongAdder

LongAdder 专用于高并发场景下, 原子累加一个长整型变量, 与 AtomicLong 相比, AtomicLong 操作 CAS, 每次只有一个 thread 修改成功, 其他的 thread 一直在 Spining, 导致 CPU 消耗过多

在 Low Concurrency 下, LongAdder 只操作 base, 效果和 AtomicLong 没有区别

在 High Concurrency 下, LongAdder 通过 add() 判断是否需要调用 longAcumulate(), 将单个的变量分解成多个独立的单元 Cell, 每个单元都独自维护一个独立的计数值, 首次会新建 2 个 Cell, 效果和 base 相同, 帮助 base 分散压力, 通过 Hash Algo 保证分布均匀, 当 Cell 不够用时, 会每扩容 2 个 Cell, 全部计算完后调用 sum() 叠加 base 和 Cell 得到结果

LongAdder 不保证 Strong Consistency, 有可能在得到 sum 后, 又有 thread 修改了 Cell 导致 Inconsistency

LongAdder, LongAccumulator, DoubleAdder, DoubleAccumulator 低层原理一致, 使用了一种类似于分段锁的机制

```java
// One or more variables that together maintain an initially zero long sum. When updates (method add) are contended across threads, the set of variables may grow dynamically to reduce contention. Method sum (or, equivalently, longValue) returns the current total combined across the variables maintaining the sum.
// This class is usually preferable to AtomicLong when multiple threads update a common sum that is used for purposes such as collecting statistics, not for fine-grained synchronization control. Under low update contention, the two classes have similar characteristics. But under high contention, expected throughput of this class is significantly higher, at the expense of higher space consumption.
LongAdder longAdder = new LongAdder();
longAdder.increment();
longAdder.increment();
longAdder.increment();
System.out.println(longAdder.sum()); // 3
```

# LongAccumulator

```java
// LongAccumulator(LongBinaryOperator accumulatorFunction, long identity)
LongAccumulator longAccumulator = new LongAccumulator((x, y) -> x + y, 0);
longAccumulator.accumulate(10); // 0 + 10
longAccumulator.accumulate(20); // 0 + 10 + 20
System.out.println(longAccumulator.get()); // 30
```




