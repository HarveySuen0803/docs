# Lock

尽量使用 object lock, 而不是 class lock

添加了 synchronized 的 method 会添加一个 ACC_SYNCHRONIZED flag

Pessimistic Locking 先锁定资源, 再操作资源, 适合写操作多的场景

Optimistic Locking 先判断资源是否被更新过, 再操作资源, 如果没有被更新, 就直接操作资源, 如果被更新过, 就采取相应策略 (eg: 放弃修改, 重试强锁), 适合读操作的场景, 一般通过 OCC 或 CAS 判断资源是否被操作过

OCC (Optimistic Concurrency Control) 是一种乐观锁的并发控制策略, 它假设事务冲突的概率较低, 因此允许多个事务同时进行, 并在提交时检查版本是否有冲突 (eg: AtomicInteger)

OCC 和 CAS 都是基于乐观锁, 都是比较版本号解决并发冲突, OCC 更侧重软件实现, CAS 更侧重硬件实现

# Monitor

Monitor 是 JVM 的 Lock, 是实现 synchronized 线程同步的基础, 每个 Object 都会关联一个 Monitor Obj, 所有的 Thread 都是去争抢 Monitor Obj.

Monitor 的 Field

- `_owner` 记录持有当有当前 Mointor Obj 的 Thread Id
- `_count` 标识了 Monitor object 是否被锁, 每次添加 Lock, 就 +1, 每次释放 Lock 就 -1
- `_recursions` 记录 Reentrant 的次数, 每次进入一层, 就 +1, 每次出来一层, 就 -1
- `_EntryList` 存储了 Blocked Thread, 当一个线程尝试去获取一个已经被占有的 Monitor Obj 时, 就会进入 `_EntryList`
- `_WaitSet` 存储了 Waited Thread, 当线程调用了 wait(), 当前线程就会释放锁, 并进入 `_WaitSet`

每个 Mointor 都有 Entry Lock 和 WaitSet Lock

- 当一个线程想要获取 Mointor 时, 就会去尝试获取 Entry Lock
- 当一个线程进入 WaitSet 时, 就会尝试去获取 WaitSet Lock

# synchronized

```java
class A {
    // modify normal method, lock is this
    public synchronized void m1() {}

    // modify code block
    public void m2() {
        synchronized (A.class) {}

        synchronized (this) {}
    }

    // modify static method, lock is A.class
    public static synchronized void m3() {}

    // modify static code block
    static {
        synchronized (A.class) {}
        
        synchronized (this) {} // error
    }
}
```

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws InterruptedException {
        A a1 = new A();
        A a2 = new A();
        a1.start();
        a2.start();
    }
}

class A {
    private Object o1 = new Object();
    private static Object o2 = new Object();
    
    public void m3() {
        synchronized (A.class) {}

        synchronized (this) {} // error; the object lock is not unique

        synchronized (o1) {} // error; the object lock is not unqiue

        synchronized (o2) {}
    }
}
```

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws InterruptedException {
        A a = new A();
        Thread thread1 = new Thread(a);
        Thread thread2 = new Thread(a);
        thread1.start();
        thread2.start();
    }
}

class A implements Runnable {
    public Object o1 = new Object();
    public static Object o2 = new Object();

    public void m() {
        synchronized (A.class) {}

        synchronized (this) {} // the object lock is unique

        synchronized (o1) {} // the object lock is unique

        synchronized (o2) {}
    }

    @Override
    public void run() {}
}
```

# Lock MarkWord

在 HotSpot JVM 中, MarkWord 是用于存储对象元数据的关键部分 (eg: HashCode, GC Age, Lock State, GC Info)

Non Lock's MarkWord

```
| unused:25b | identity_hashcode:31b | unused:1b | age:4b | biase_lock:1b | lock:2b |
```

通过 jol-core 查看 Non Lock 的 Object 的 MarkWord 是如何存储 HashCode 的

```xml
<dependency>
    <groupId>org.openjdk.jol</groupId>
    <artifactId>jol-core</artifactId>
    <version>0.8</version>
</dependency>
```

```java
Object o = new Object();
System.out.println(o.hashCode()); // HashCode will not be stored in MarkWord until the HashCode is accessed
System.out.println(Integer.toHexString(o.hashCode()));
System.out.println(Integer.toBinaryString(o.hashCode()));
System.out.println(ClassLayout.parseInstance(o).toPrintable());
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241746692.png)

Biased Lock's MarkWord

```
| thread:54b | epoch:2b | unused:1b | age:4b | biased_lock:1b | lock:2b |
```

Light Lock's MarkWord

```
| ptr_to_lock_record:62b | lock:2b |
```

Weight Lock's MarkWord

```
| ptr_to_heavyweight_monitor:62b | lock:2b |
```

# Lock State

Object 的 Header 的 MarkWord 的最后几位标识了 Lock State

```
Non Lock      001
Biased Lock   101
Light Lock     00
Heavy Lock     10
```

# Lock Escalation

Lock Escalation 是指 synchronized 实现的 Lock, 随着竞争的情况根据 Non Lock -> Biased Lock -> Light Lock -> Heavy Lock 的顺序逐渐升级, 并且是不可逆的过程

Non Lock -> Biased Lock, 当一个线程第一次访问同步块时, 会在对象头和栈帧中记录偏向的锁的 Thread ID, 之后该线程再次进入和退出同步块时, 不需要进行 CAS 操作来加锁和解锁

Biased Lock -> Light Lock, 当第二个线程尝试访问同步块时, 偏向锁就需要撤销, 撤销过程需要等待全局安全点 (在这个点上没有正在执行的字节码), 撤销后, 偏向锁就升级为轻量级锁

Light Lock -> Heavy Lock, 如果轻量级锁的竞争激烈, 即有多个线程同时申请轻量级锁, 那么轻量级锁就会膨胀为重量级锁

# Biased Lock

Current Thread 持有 Biased Lock 后, 如果后续没有 Other Thread 访问, 则 Current Thread 不会触发 Sync, 不需要再获取 Lock 了, 即一个 Thread 吃到撑, 适合经常单个 Thread 操作的场景, 不需要添加 Lock, 性能非常强

Thread 获取 Lock 后通过 CAS 修改 Lock 的 MarkWord 的 Lock Identify 为 101, 即标识为 Biased Lock, 同时在 Monitor 的 Owner Field 中存储 Cur Thread 的 Id. 下一次有 Thread 访问时, 会先判断 Thread 的 Id 和记录的 Id 相同

如果 Biased Lock 记录了 T1 的 Id, 此时 T1 访问, 就可以不触发 Sync, 也不需要进行 CAS. 如果 T2 访问, 就会发生 Conflict. T2 会通过 CAS 尝试抢 Biased Lock. 如果 T2 抢到 Biased Lock, 则会替换 Owner 为 T2 的 Id. 如果 T2 没有抢到 Biased Lock, 则会撤销 T1 的 Biased Lock, 等待 T1 到 Safe Region 后, 发动 Stop The World !!! 升级为 Light Lock !!! 此时 Thread A, 原先持有的 Biased Lock 会替换为 Light Lock, 继续执行完后, 释放 Light Lock, 两个 Thread 公平竞争 Light Lock

Biased Lock 的 Pointer 和 Epoch 会覆盖 Non Lock 的 HashCode, 所以 Biased Lock 无法与 HashCode 共存

- 如果获取 HashCode 后再开启 Sync, 就会直接忽略 Biased Lock, 直接升级为 Light Lock
- 如果使用 Biased Lock 的过程中, 试图获取 HashCode, 就会撤销 Biased Lock, 直接膨胀为 Heavy Lock

由于 Biased Lock 维护成本太高, JDK15 后逐渐废弃了, 默认禁用了 Biased Lock, 可以通过 `-XX:+UseBiasedLocking` 手动开启

Biased Lock 默认在程序启动后 4s 开启, 可以通过 `-XX:+BiasedLockingStartupDelay=0` 手动调整

Test Biased Lock

```java
Object o = new Object();
new Thread(() -> {
    synchronized (o) {
        System.out.println("hello world");
    }
}).start();
System.out.println(ClassLayout.parseInstance(o).toPrintable());
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241746693.png)

# Light Lock

Light Lock 本质就是 CAS. 多个 Thread 交替抢 Lock, 执行 Sync. 不需要从 User Mode 切换到 Kernel Mode, 也不需要发生 Blocking. Conflict 的处理速度非常快, 适合经常多个 Thread 操作的场景, 不会造成 Thread Blocking, 执行速度也很高

JVM 为每一个 Thread 的 Stack Frame, 都开辟了 LockRecord 的空间, 称为 Displaced MarkWord, 存储 LockRecord Object

T1 通过 CAS 修改 Lock 的 MarkWord 的 Lock Identify 为 101, 修改 Lock 的 Markword 的 ptr_to_lock_record 指向 T1 的 LocalRecord Object, 复制 Lock 的 MarkWord 到 LockRecord Object 中, 并且 T1 的 LockRecord Object 也会存储了一个 Pointer 指向 Lock

T2 通过 CAS 尝试修改 ptr_to_lock_record 指向 T2 的 LockRecord Object. 如果修改成功, 则表示 T2 抢到了 Lock. 如果 T2 尝试了多次 Spining 后, 还是没修改成功, 则会升级 Light Lock 为 Heavy Lock

T1 释放 Lock 时, 会将 Displaced MarkWord 复制到 MarkWord 中. 如果复制成功, 则本次 Sync 结束. 如果复制失败, 则说明 Light Lock 升级为 Heavy Lock 了, 此时 T1 会释放 Lock, 唤醒其他 Blocing Thread, 一起竞争 Heavy Lock

如果是 Reentrant Lock 在进行重入时, 每次重入一个锁, 就需要通过 CAS 创建一个 LockRecord Object, 后续创建的 LockRecord Object 不需要再去修改 ptr_to_lock_record 了

JDK6 前, 默认 Spining 10 次, 就会进行 Lock Escalation, 可以通过 `-XX:PreBlockSpin=10` 手动设置

JDK6 后, 采用 Adaptive Spin Lock, 如果 Spinning 成功, 则会提高 PreBlockSpin, 如果 Sprinning 失败, 则会降低 PreBlockSpin

Biased Lock 是一个 Thread 抢 Lock. Light Lock 是多个 Thread 抢 Lock. Biased Lock 是每次执行完, 不会释放 Lock. Light Lock 是每次执行完, 都会释放 Lock

# Heavy Lock

Heavy Lock 通过 Monitor 实现 Sync, 但是 Monitor 依赖 OS 的 Mutex Lock, 需要从 User Mode 切换为 Kernel Mode, 频繁切换, CPU 消耗非常多, 适合 Conflict 激烈的场景, 可以保证绝对的 Thread Safty, 但性能太差, 尽量避免用于同步时间较长的地方, 当 CAS 带来的消耗太多时, 也可以考虑切换为 Heavy Lock

Heavy Lock 的 MarkWord 存储的 Pointer 指向 Heap 的 Monitor object. Monitor 存储了 Non Lock 的 HashCode, GC Age 等信息, 释放 Heavy Lock 时, 也会将这些信息写回到 MarkWord 中

JVM Instruction

- `monitorenter` 表示进入 Monitor object, 开启 Sync
- `monitorleave` 表示离开 Monitor object, 关闭 Sync

Test Heavy Lock

```java
Object o = new Object();
new Thread(() -> {
    synchronized (o) {
        System.out.println("hello world");
    }
}).start();
new Thread(() -> {
    synchronized (o) {
        System.out.println("hello world");
    }
}).start();
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241746694.png)

# Lock Elimination

JIT 进行 Compoile 时, 会对 lock 进行 Escape Analysis, 这里的 obj 未发生 Escape, 所以这个 lock 毫无意义 JIT 会自动帮我们去除 lock, 提升性能, 但是这种编译优化手段依旧会影响一定性能, 应当避免这样的失误

```java
public void test() {
    Object obj = new Object();
    synchronized(obj) {
        System.out.println("hello world");
    }
}
```

# Lock Coarsening

一个 Method 内, 多处将同一个 Object 作为 Lock 没有意义, JIT 会帮我们合并内容, 扩大范围

```java
// Before JIT optimization
Object o = new Object();
new Thread(() -> {
    synchronized (o) {
        System.out.println("hello world");
    }
    synchronized (o) {
        System.out.println("hello world");
    }
    synchronized (o) {
        System.out.println("hello world");
    }
}).start();

// After JIT optimization
Object o = new Object();
new Thread(() -> {
    synchronized (o) {
        System.out.println("hello world");
        System.out.println("hello world");
        System.out.println("hello world");
    }
}).start();
```

# ReentrantLock

Reentrant Lock 允许 Outer Lock 和 Inner Lock 相同时, 获取 Outer Lock 后, 就可以直接进入 Inner Lock, 不需要释放后在重新获取

synchronized 和 ReentrantLock 都是 Reentrant Lock 的实现

```java
Object o = new Object();

new Thread(() -> {
    synchronized (o) {
        synchronized (o) {
            synchronized (o) {
                System.out.println(Thread.currentThread().getName());
            }
        }
    }
}).start();
```

```java
public synchronized void increment() {
    count++;
}

public synchronized void decrement() {
    count--;
}

public synchronized void add(int value) {
    for (int i = 0; i < value; i++) {
        increment();
    }
}
```

ReentrantLock 维护了 FairLock 和 UnfairLock, 都采用是 Exclusive Mode.

Fair Lock 是多个 Thread 按照顺序获取 Lock, 分配均匀, 不存在锁饥饿, 但是性能稍差.

Unfair Fock 是多个 Thread 随意争抢 Lock, 容易造成同一个 Thread 抢走所有 Lock 的情况, 造成锁饥饿, 分配不均匀, 但是性能更强.

```java
// true is Fair Lock, false is Unfair Lock (def: false)
private ReentrantLock lock = new ReentrantLock(true);

private void sellTicket() {
    lock.lock();
    try {
        if (poll > 0) {
            System.out.println(Thread.currentThread().getName() + " " + poll--);
            Thread.sleep(100);
        }
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        lock.unlock();
    }
}
```

ReentrantLock 提供了 Fair Lock 和 Unfair Lock 两种模式, 这两种模式主要的区别在于获取锁的策略不同

Fair Lock 的获取采取先来先得的原则, 也就是说, 先请求锁的线程将先获取到锁, 具体实现上, 系统维护了一个有序队列, 每当有新的线程请求锁时, 都会加入队列的末尾, 只有队列头部的线程能够获得锁, 当线程释放锁时, 它在队列中的节点将被移除, 队列的第二个节点将成为头部节点并获得锁

Unfair Lock 的获取不再遵循先来先得的原则, 当一个线程请求锁时, 如果当前无线程持有锁, 那么这个线程可以直接获取到锁, 无论是否有其他线程正在等待, 这样可能导致一些线程等待时间过长

Unfair Lock 的处理效率比 Fair Lock 要高, 线程的上下文切换和唤醒是需要耗费一定系统资源的, 不如直接让一个处于就绪的线程获取锁来的实在

```java
﻿ReentrantLock unfairLock = new ReentrantLock();
﻿ReentrantLock fairLock = new ReentrantLock(true);
```

# ReentrantReadWriteLock

ReenrantReadWriteLock 相比 ReentrantLock 不仅仅维护了 FairLock 和 UnfariLock, 还维护了一个 ReadLock 和 WriteLock, 这两个 Lock 都采用了 Shared Mode

ReentrantLock 采用 Exclusive Mode, 不适合多线程中, 读多写少的场景, 通过 ReenrantReadWriteLock 可以让多线程之间, 读读不互斥, 读写互斥, 写读互斥, 写写互斥, 可以保证读时的高性能, 和写时的安全

```java
public static ReentrantReadWriteLock rwlock = new ReentrantReadWriteLock();

public static void main(String[] args) {
    // Reading and reading are not mutually exclusive
    for (int i = 0; i < 10; i++) {
        new Thread(() -> {
            read();
        }).start();
    }
    
    // Reading and writing are mutually exclusive
    // Writing and writing are mutually exclusive
    for (int i = 0; i < 10; i++) {
        new Thread(() -> {
            write();
        }).start();
    }
    
    // Writing and reading are mutually exclusive
    for (int i = 0; i < 10; i++) {
        new Thread(() -> {
            read();
        }).start();
    }
}

public static void read() {
    rwlock.readLock().lock();
    
    System.out.println(Thread.currentThread().getName() + " read start");
    
    try { TimeUnit.MILLISECONDS.sleep(200); } catch (InterruptedException e) { e.printStackTrace(); }
    
    System.out.println(Thread.currentThread().getName() + " read end");
    
    rwlock.readLock().unlock();
}

public static void write() {
    rwlock.writeLock().lock();
    
    System.out.println(Thread.currentThread().getName() + " write start");
    
    try { TimeUnit.MILLISECONDS.sleep(500); } catch (InterruptedException e) { e.printStackTrace(); }
    
    System.out.println(Thread.currentThread().getName() + " write end");
    
    rwlock.writeLock().unlock();
}
```

ReentrantReadWriteLock 允许 Lock Degradation. 同一个 Thread 获取 WriteLock 后, 支持 Reentrant, 可以再获取 ReadLock. 而获取 ReadLock 后, 不支持 Reentrant, 不可以再获取 WriteLock.

```java
public static ReentrantReadWriteLock readWriteLock = new ReentrantReadWriteLock();
public static ReentrantReadWriteLock.ReadLock readLock = readWriteLock.readLock();
public static ReentrantReadWriteLock.WriteLock writeLock = readWriteLock.writeLock();

public static void main(String[] args) {
    // Get write lock before getting read lock is ok
    new Thread(() -> {
        writeLock.lock();
        System.out.println("write");
        
        readLock.lock();
        System.out.println("read");
        
        readLock.unlock();
        writeLock.unlock();
    }).start();

    // Get read lock before getting write lock is not allowed
    new Thread(() -> {
        readLock.lock();
        System.out.println("read");

        // Get stuck here
        writeLock.lock();
        System.out.println("write");
        
        readLock.unlock();
        writeLock.unlock();
    }).start();
}
```

通过 Lock Degradation 可以保证同一个 Thread 再释放 WriteLock 后, 还能持有 ReadLock.

如果 T1 先获取 ReadLock, 再释放 WriteLock, 可以保证数据安全, 防止其他 Thread 篡改. 如果 T1 先释放 WriteLock, 再获取 ReadLock, 就有可能在释放 WriteLock 后的一瞬间, 就被 T2 抢走了 WriteLock, 并且修改了数据, 此时 T1 再读取到的就是脏数据.

```java
writeLock.lock();
System.out.println("write data");

// Get read lock before releasing write lock
readLock.lock();
System.out.println("...");

writeLock.unlock();

System.out.println("read data");

readLock.unlock();
```

# StampedLock

ReentrantReadWriteLock 处理读多写少的场景时, 大部分线程都在抢 ReadLock, 写线程根本抢不到 WriteLock, 容易导致锁饥饿. 可以通过 FairLock 解决锁饥饿的问题, 但性能太差

StampedLock 支持 Reading Mode, Writing Mode 和 Optimistic Reading Mode

Reading Mode 和 Writing Mode 就类似于 ReentrantLock 的 ReadLock 和 WriteLock, 是一种 Pessimistic Lock, 不支持读的时候写, 不支持写的时候读, 但是 StampedLock 的 ReadLock 和 WriteLock 是分离的, 以并发执行, 提高了读写并发性

Optimistic Reading Mode 允许 Read Thread 获取 ReadLock 后, Write Thread 同样可以获取 WriteLock 来修改数据, 通过 Stamp 控制 Version, 如果 Read Thread 本次读取到的数据过时, 就可以丢弃, 再重新读取一次, 保证最终一致性

StampedLock 提供 validate(long stamp) 验证锁的有效性, 如果验证通过, 就表示在获取乐观读锁后没有写锁被获取, 可以进行后续的读操作

StampedLock 不支持 Reentrant. Reading Mode 和 Writing Mode 不支持 Condition. 不可以使用 interrupt() 打断 StampedLock

```java
public static StampedLock stampedLock = new StampedLock();

public static void main(String[] args) {
    new Thread(() -> {
        read();
    }).start();
    
    try { TimeUnit.MILLISECONDS.sleep(300); } catch (InterruptedException e) { e.printStackTrace(); }
    
    new Thread(() -> {
        write();
    }).start();
}

public static void read() {
    long stamp = stampedLock.tryOptimisticRead();
    
    for (int i = 0; i < 10; i++) {
        System.out.println("reading ... validation: " + stampedLock.validate(stamp));
        try { TimeUnit.MILLISECONDS.sleep(100); } catch (InterruptedException e) { e.printStackTrace(); }
    }
    
    if (stampedLock.validate(stamp)) {
        System.out.println("The data has not been modified");
    } else {
        System.out.println("The data has been modified");
    }
}

public static void write() {
    long stamp = stampedLock.writeLock();
    
    System.out.println(Thread.currentThread().getName() + " write");
    
    stampedLock.unlockWrite(stamp);
}
```

# wait(), notify()

wait() 和 notify() 是在 Object 中定义的, 通常搭配 synchronized 使用, 用于基本的线程同步

notify() 只能唤醒等待在同一个对象锁上的一个线程, 具体唤醒哪个线程是不确定的

notifyAll() 可以唤醒在对象上等待的所有线程

```java
Object o = new Object();

new Thread(() -> {
    synchronized (o) {
        try {
            // Release the lock and wait here for notify.
            o.wait();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}).start();

try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

new Thread(() -> {
    synchronized (o) {
        o.notify();
    }
}).start();
```

# await(), signal()

await() 和 signal() 是在 Condition 中定义的, 通常搭配 ReentrantLock 使用, 提供了更灵活的条件等待机制, 用于复杂的线程同步

signal() 可以选择性地唤醒等待在特定条件上的一个线程

```java
Lock lock = new ReentrantLock();
Condition condition = lock.newCondition();

new Thread(() -> {
    lock.lock();
    try {
        condition.await();
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    } finally {
        lock.unlock();
    }
}).start();

try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

new Thread(() -> {
    lock.lock();
    try {
        condition.signal();
    } catch (Exception e) {
        throw new RuntimeException(e);
    } finally {
        lock.unlock();
    }
}).start();
```

# park(), unpark()

LockSupport 提供了线程阻塞和唤醒的机制, 相比于 Object 的 wait(), notify() 和 ReenrantLock 的 await(), signal() 更加灵活

thread 调用 park() 会查看是否有 permit, 如果有, 直接消耗掉 permit 退出等待, 如果没有, 就会等待 permit, 调用 unpart() 向指定 thread 发送 permit, 解除等待

```java
new Thread(() -> {
    LockSupport.park();
    // ...
    LockSupport.unpark(Thread.currentThread());
})
```

通过 wait(), notify() 处理等待, 需要 wait() 在 notify() 之前调用, 需要 wait() 和 notify() 都在 synchronized 之内, await() 和 signal() 也有这个问题, 通过 park(), unpark() 可以有效解决

```java
Thread t1 = new Thread(() -> {
    LockSupport.park();
});
t1.start();

try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

Thread t2 = new Thread(() -> {
    LockSupport.unpark(t1);
});
t2.start();
```

LockSupport 的 permit 和 Semaphore 不同, 每个 thread 最多持有一个 permit

```java
Thread t1 = new Thread(() -> {
    LockSupport.park();
    // thread blocking
    LockSupport.park();
});
t1.start();

try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

Thread t2 = new Thread(() -> {
    // repeat sending permit is useless
    LockSupport.unpark(t1);
    LockSupport.unpark(t1);
    LockSupport.unpark(t1);
});
t2.start();
```

LockSupport 的 park() 可以响应中断

```java
Thread thread = new Thread(() -> {
    System.out.println("Thread is starting...");
    
    LockSupport.park();
    
    System.out.println("Thread is interrupted ...");
});

thread.start();

try {Thread.sleep(2000);} catch (InterruptedException e) {e.printStackTrace();}

thread.interrupt();
```

# CountDownLatch

`CountDownLatch` 是 Java 中用于多线程协作的同步工具之一，类似于一个倒计时锁。它允许一个或多个线程在其他线程完成执行后再继续执行。主要思想是在某个条件满足之前，一个或多个线程会一直阻塞等待，常用于并行任务的协调。

在下面的示例中，主线程创建了 10 个子线程，并将 `CountDownLatch` 的初始计数设为 10。每个线程执行结束后调用 `countDown()` 方法，使计数减一。主线程调用 `await()` 方法进入阻塞状态，直到计数器减到零为止。

```java
int threadSize = 10;
CountDownLatch countDownLatch = new CountDownLatch(threadSize);
for (int i = 0; i < threadSize; i++) {
    new Thread(() -> {
        // 执行线程任务
        atomiceInterger.addAndGet(1);
        // 减少 1 个信号量
        countDownLatch.countDown();
    }).start();
}
// 等待所有线程完成
countDownLatch.await();
System.out.println(atomicInteger.get());
```

这段代码展示了如何使用 `CountDownLatch` 来同步多个线程的执行。每个子线程在完成其任务后调用 `countDown()`，而主线程在 `await()` 处等待，直到所有子线程都完成任务。这样可以确保主线程在所有子线程完成后再继续执行。

# CyclicBarrier

CyclicBarrier 是 Java 中的一个同步辅助类，它允许一组线程互相等待，直到到达某个公共的屏障点。与 CountDownLatch 不同的是，CyclicBarrier 可以被重用，即它可以在所有等待线程被释放后重新使用。

CyclicBarrier 的常见用法是让一组线程在执行某个阶段的任务后等待，直到所有线程都到达同一个屏障点，然后再继续执行下一阶段的任务。

CyclicBarrier 相比于 CountDownLatch，最大的区别在于 CyclicBarrier 可以进行分组，下面这段代码提交了 20 个线程执行任务，每 5 个为一组，分成了 4 组，当有线程完成任务后，就会卡在 barrier，卡住 5 个后，就会执行 CyclicBarrier 定义的任务。

```java
int batchSize = 5;
CyclicBarrier barrier = new CyclicBarrier(batchSize, new Runnable() {
    @Override
    public void run() {
        // 当执行到 barrier 的线程数量达到 batchSize 时，开始执行下面的聚合任务
        System.out.println(atomicInteger.get());
    }
});

int threadSize = 20;
for (int i = 0; i < threadSize; i++) {
    new Thread(() -> {
        // 执行线程任务
        atomiceInterger.addAndGet(1);
        // 卡在 barrier，减少一个信号量
        barrier.await();
        // 等 barrier 执行完成后，开始执行这一行
        System.out.println("current thread has work down");
    })
}
```

# False Awaken

这里不采用 while(isEmpty()) 而采用 if(isEmpty()) 就存在 False Awaken

- A 执行 consume() 获取 Lock 后, 发现 list 为空, 释放 Lock, 进入等待
- B 执行 produce() 获取 Lock 后, 添加资源, 并调用 headWaits.signal() 唤醒了等待的线程
- C 执行 consume() 获取 Lock 后, 消费资源, 释放 Lock
- 如果采用 if(isEmpty()), A 获取 Lock 后, 就不会再去判断当前 list 是否为空, 此时 A 的唤醒就属于 False Awaken
- 如果采用 while(isEmpty()), A 获取 Lock 后, 会再去判断当前 list 是否为空, 从而再次进入等待, 不存在 False Awaken

```java
private ReentrantLock lock = new ReentrantLock();
private Condition headWaits = lock.newCondition();
private Condition tailWaits = lock.newCondition();

public void consume() throws InterruptedException {
    lock.lock();
    
    try {
        while (isEmpty()) {
            headWaits.await();
        }

        list.pop();
    } finally {
        lock.unlock();
    }
}

public void produce() throws InterruptedException {
    lock.lock();
    
    try {
        list.push();
        
        headWaits.signal();
    } finally {
        lock.unlock();
    }
}
```

# Cascade Awaken

produce() 中每次都需要争抢 headLock 去唤醒 consume() 中等待的线程, 而 consume() 也是如此, 非常浪费资源

```java
public void produce() throws InterruptedException {
    tailLock.lock();
    int c;
    try {
        while (isFull()) {
            tailWaits.await();;
        }
        
        push()
        c = size.incrementAndGet();
    } finally {
        tailLock.unlock();
    }

    // 所有的线程执行 produce() 时, 都需要去争抢 headLock 去唤醒 consume() 中等待的线程
    headLock.lock();
    try {
        headWaits.signal();
    } finally {
        headLock.unlock();
    }
}
```

可以通过 Cascade Awaken, 让 produce() 只有在队列元素从空变为 1 时, 才去唤醒 consume() 中等待的线程, 其余时候都让 consume() 自己在执行结束后, 去唤醒 consume() 中等待的线程, 可以在不争抢锁的情况下, 就唤醒了等待的线程

```java
public void produce() throws InterruptedException {
    tailLock.lock();
    int c;
    try {
        while (isFull()) {
            tailWaits.await();;
        }
        
        push()
        size.incrementAndGet();
        
        // 如果队列不满, 就由当前线程去唤醒 produce() 中等待的线程, 当前线程已经有 tailLock 了, 就不需要争抢 tailLock 了, 非常高效
        if (size.get() < cap) {
            tailWaits.signal();
        }
    } finally {
        tailLock.unlock();
    }

    // 当前线程生产了一个资源, 队列从空变为不空, 此时 consume() 中的线程都处于等待状态, 无法自己唤醒自己, 就需要 produce() 去唤醒 consume() 中等待的线程了
    if (size.get() == 1) {
        headLock.lock();
        try {
            headWaits.signal();
        } finally {
            headLock.unlock();
        }
    }
}

public void consume() throws InterruptedException {
    headLock.lock();
    int c;
    try {
        while (isEmpty()) {
            headWaits.await();
        }
        
        pop()
        size.decrementAndGet();
        
        // 如果队列不空, 就由当前线程去唤醒 consume() 中等待的线程, 当前线程已经有 headLock 了, 就不需要争抢 headLock 了, 非常高效
        if (size.get() > 0) {
            headWaits.signal();
        }
    } finally {
        headLock.unlock();
    }

    // 当前线程消费了一个资源, 队列从满变为不满, 此时 produce() 中的线程都处于等待状态, 无法自己唤醒自己, 就需要 consume() 去唤醒 produce() 中等待的线程了
    if (size.get() == cap - 1) {
        tailLock.lock();
        try {
            tailWaits.signal();
        } finally {
            tailLock.unlock();
        }
    }
}
```

# Dead Lock

一个线程需要持有多把锁时, 并且锁之间存在嵌套关系, 就非常容易导致 Dead Lock, 尽量在设计程序时, 避免一个线程去争抢多把 Lock, 实在没办法, 也要让多把锁的逻辑放在一个层级, 不要去嵌套

```java
// Not Recommend
public static void test() {
    synchronized (o1) {
        // ...
        synchronized (o2) {
            // ...
        }
    }
}

// Recommand
public static void test() {
    synchronized (o1) {
        // ...
    }
    
    synchronized (o2) {
        // ...
    }
}
```

死锁的四个必要条件

- 互斥 (Mutual Exclusion): 共享资源 X 只能同时被一个线程所持有
- 占有等待 (Hold and Wait): A 持有 X, A 在等待 Y 的过程中不释放 X
- 不可抢占 (No Preemption): A 持有 X, B 持有 Y, A 无法强行抢占 B 的 Y
- 循环等待 (Circular Wait): A 等待 B 释放 Y, B 等待 A 释放 X

只要打破四个必要条件的任意一个即可解决死锁问题

- 互斥: 互斥是实现同步的根本原理, 无法被打破
- 占有等待: A 一次性获取所需的 X 和 Y, 避免等待, 或者引入锁超时机制避免永远等待
- 不可抢占: 使用可中断的锁, A 想要的 Y 被 B 抢走了, A 就主动在程序中释放 B 的 Y, 然后自己再获取 Y
- 循环等待: 指定共享资源的获取顺序, 想要获取 Y 一定要先获取 X

检测程序中是否存在死锁是一个相对复杂的任务, 因为死锁通常发生在运行时, 并且需要在系统中的某个时刻进行检测

- jstack 是 JVM 提供的一个 Command Tool, 可以打印出给定 Java 进程中所有线程的堆栈跟踪, 在一个运行中的 Java 程序中, 可以使用 jstack 来获取线程堆栈信息, 以分析是否存在死锁
- VisualVM 是 JVM 提供的一个管理和分析 Java 应用程序的图形化工具, 可以通过 VisualGC, Thread Dump Analyzer 来分析线程和内存信息, 进而检测死锁
- Deadlock Detector 是一些第三方的死锁检测工具

# Dead Lock (Case 1)

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws InterruptedException {
        A a1 = new A(true);
        A a2 = new A(false);

        // a1 get o1, a2 get o2, a1 can not get o2, a2 can not get o1
        a1.setName("Thread-a1");
        a2.setName("Thread-a2");

        a1.start();
        a2.start();
    }
}


class A extends Thread {
    static Object o1 = new Object();
    static Object o2 = new Object();
    boolean flag = true;

    public A(boolean flag) {
        this.flag = flag;
    }

    @Override
    public void run() {
        if (flag) {
            synchronized (o1) {
                System.out.println(currentThread().getName() + " get o1");

                synchronized (o2) {
                    System.out.println(currentThread().getName() + " get o2");
                }
            }
        } else {
            synchronized (o2) {
                System.out.println(currentThread().getName() + " get o2");

                synchronized (o1) {
                    System.out.println(currentThread().getName() + " get o1");
                }
            }
        }
    }
}
```

# Dead Lock (Case 2)

这里 produce() 和 consume() 互不干扰, 可以分为两把 Lock 提升性能, 但想唤醒双方线程, 就需要先获取对方 Lock, 这非常容易导致 Dead Lock

- A 获取 headLock 消费一个资源后, 就尝试获取 tailLock 去唤醒 produce() 中等待的线程
- B 获取 tailLock 胜场一个资源后, 就尝试获取 headLock 去唤醒 consume() 中等待的线程

```java
private ReentrantLock headLock;
private ReentrantLock tailLock;
private Condition headWaits;
private Condition tailWaits;

public void produce() throws InterruptedException {
    tailLock.lock();
    try {
        while (isFull()) {
            tailWaits.await();
        }
        push()

        // Try to get the headLock before releasing the tailLock.
        headLock.lock();
        try {
            headWaits.signal();
        } finally {
            headLock.unlock();
        }
    } finally {
        tailLock.unlock();
    }
}

public void consume() throws InterruptedException {
    headLock.lock();
    try {
        while (isEmpty()) {
            headWaits.await();
        }
        pop()
        
        // Try to get the tailLock before releasing the headLock.
        tailLock.lock();
        try {
            tailWaits.signal();
        } finally {
            tailLock.unlock();
        }
    } finally {
        headLock.unlock();
    }
}
```

想要获取 New Lock 前, 得先释放 Old Lock, 两把 Lock 不应该存在包含的关系, 而是同一层级的, 避免 Dead Lock

- A 想要获取 tailLock, 就得先释放 headLock
- B 想要获取 headLock, 就得先释放 tailLock

```java
public void produce() throws InterruptedException {
    tailLock.lock();
    try {
        while (isFull()) {
            tailWaits.await();
        }
        push()
    } finally {
        tailLock.unlock();
    }

    // Release the tailLock before getting the headLock
    headLock.lock();
    try {
        headWaits.signal();
    } finally {
        headLock.unlock();
    }
}

public void consume() throws InterruptedException {
    headLock.lock();
    try {
        while (isEmpty()) {
            headWaits.await();
        }
        pop()
    } finally {
        headLock.unlock();
    }

    // Release the headLock before getting the tailLock
    tailLock.lock();
    try {
        tailWaits.signal();
    } finally {
        tailLock.unlock();
    }
}
```

# Lock and Transaction

事务（Transaction）和 锁（Lock）同时使用时，应该保证 锁 包含 事务，避免 事务 包含 锁。

下面这段代码，主要是通过锁保证一次只有一个线程进来更改数据，将数据从 "old data" 更新成 "new data"，同时通过事务保证数据库操作的原子性，但是这里存在一个漏洞。

假设，T1 获取锁，修改数据，释放锁之后，如果 T1 发生了等待（例如，CPU 时间片轮转），事务还没有提交，即还是 "old data"；此时 T2 获取锁进来，发现还是 "old data"，就又会去执行修改；等 T1 恢复执行后，就会提交事务，将刚刚 T2 的修改覆盖掉。

```java
@Resource
private UserDao userDao;

@Transactional
public void test() {
    boolean isAcquire = lock.acquire();
    if (!isAcquire) {
        return;
    }

    // 2. T2 running here
    if (StrUtil.equals(userDao.getData(), "new data")) {
        return;
    }
    
    try {
        userDao.updData("new data")
    } finally {
        lock.release();
        // 1. T1 waiting here
    }
}
```

区别于上一段代码，这一段使用了完全的双检索（Double Check Lock），在获取锁的前后进行一次检查操作，此时就会因为 Mysql 的 RR 事务隔离级别导致脏读问题。

假设，T1 获取到锁，正在执行修改；T2 也进来了，执行了第一次 Check，生成了一个 Page View，Page View 里存储的是 "old data"；T1 执行完修改，将 "new data" 修改为了 "old data"，释放锁，提交事务；T2 获取到锁，执行第二次 Check 时就会存在问题，由于采用的是 RR 事务隔离级别，当生成一个 Page View 后，就不会再去生成新的 Page View，所以 T2 在第二次 Check 时，查询到的是 "old data"，而非刚刚 T1 修改的 "new data"。

```java
@Resource
private UserDao userDao;

@Transactional
public void test() {
    if (StrUtil.equals(userDao.getData(), "new data")) {
        return;
    }

    // 2. T2 running here
    boolean isAcquire = lock.acquire();
    if (!isAcquire) {
        return;
    }

    // 4. T2 running here, dirty reading
    if (StrUtil.equals(userDao.getData(), "new data")) {
        return;
    }
    try {
        // 1. T1 running here
        userDao.updData("new data")
    } finally {
        lock.release();
    }
}
// 3. T2 running here
```

由此，我们可以发现在事务内部使用锁，会导致非常多的问题，当我们在锁内部使用事务时，这一切就都不是问题了。

```java
@Resource
private UserDao userDao;
@Lazy
@Resource
private UserService self;

public void test() {
    boolean isAcquire = lock.acquire();
    if (!isAcquire) {
        return;
    }
    
    if (StrUtil.equals(userDao.getData(), "new data")) {
        return;
    }
    
    try {
        self.updData();
    } finally {
        lock.release();
    }
}

@Transactional
public void updData() {
    userDao.updData("new data")
}
```

除了上面这种通过 `@Transactional` 注解实现声名式的事务，也可以采用编程式事务解决问题。

```java
@Resource
private UserDao userDao;
@Resource
private UserService userService;

public void test() {
    boolean isAcquire = lock.acquire();
    if (!isAcquire) {
        return;
    }
    if (StrUtil.equals(userDao.getData(), "new data")) {
        return;
    }
    try {
        transactionTemplate.execute((status) -> {
            userDao.updData("new data")
            return null;
        });
    } finally {
        lock.release();
    }
}
```