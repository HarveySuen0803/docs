# AQS

AQS (AbstractQueuedSynchronizer) 是构建 Lock 和 Synchronizer 的底层框架, 它提供了一种可重入的, 分离式的, 并发控制的机制, 基于 FIFO 队列的的资源获取方式

AQS 是一个 Abstract Class, 本身没有实现, 通过 Template Pattern 规定好模版后, 让 Sub Class 实现 (eg: CountDownLatch, CyclicBarrier, Semaphore, ReentrantLock, BlockingQueue 都是基于 AQS 实现的)

AQS 的 Exclusive Mode 是每个 Thread 独占一个 Lock (eg: ReentrantLock)

AQS 的 Shared Mode 允许多个 Thread 共享一个 Lock (eg: ReentrantReadWriteLock)

AQS 通过 CAS 实现对其内部状态的原子性修改, 以实现锁的获取和释放等操作

# CLH Queue

AQS 通过 State 表示同步状态, State 通过 Volatile 保证 Visibility. 不同的 Sub Class 有不同的实现, 如 ReentrantLock 的 State, 0 表示未占用, 1 表示被占用, 并且被同一个 Thread 重入了 1 次, 3 就表示被重入了 3 次

Thread A 试图获取 Lock 时, 会先检查 State

- 如果 State == 0 表示未占用, Thread A 就会尝试通过 CAS 将 State 改为 1, 表示 Thread A 获取了 Lock
- 如果 State != 0 表示被占用, 那么 AQS 就会将 Thread A 封装成一个 Node 存储进 CLH Queue, 通过 LockSupport 让 Thread A 进入等待状态, 当 Lock 释放后, 先进入 Queue 的 Node 就会被唤醒, 试图去争抢 Lock

CLH Queue 使用 Double LinkedList 的原因

- Double LinkedList 相比 Single LinkedList 可以访问前驱节点, 加入到 CLH Queue 的节点都需要去判断前面的节点是否存在异常, 如果存在异常会无法唤醒后续等待的节点, 如果使用 Single LinkedList 就需要从头开始遍历, 非常低效
- CLH Queue 中堵塞的节点, 下次唤醒时, 应该只有头节点去参与锁竞争, 避免同时唤醒所有的节点去竞争导致的惊群线程, 从而消耗大量资源, CLH Queue 中的节点只需要判断自己的前一个节点是否为头节点即可解决这个问题
- 有些 AQS 的实现类实现了 lockInterruptibly() 表示是可以中断的 Lock (eg: ReentrantLock), 被中断的线程在后续就不应该参与到锁的竞争中了, 通过 Double LinkedList 可以很方便的删除这个节点, 如果使用 Single LinkedList 会导致删除操作和遍历操作的竞争

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241746778.png)

AQS 关于 Node 和 State 的 Source Code

```java
public abstract class AbstractQueuedSynchronizer {
    static final class Node {
        // Shared Mode
        static final Node SHARED = new Node();
        // Exclusive Mode
        static final Node EXCLUSIVE = null;
        
        volatile Node prev;
        volatile Node next;

        // waitStatus value to indicate thread has cancelled
        static final int CANCELLED =  1;
        // waitStatus value to indicate successor's thread needs unparking
        static final int SIGNAL    = -1;
        // waitStatus value to indicate thread is waiting on condition
        static final int CONDITION = -2;
        // waitStatus value to indicate the next acquireShared should
        // unconditionally propagate
        static final int PROPAGATE = -3;

        // The field is initialized to 0 for normal sync nodes, and
        // CONDITION for condition nodes.  It is modified using CAS
        // (or when possible, unconditional volatile writes).
        volatile int waitStatus;

        volatile Thread thread;
    }
    private transient volatile Node head;
    private transient volatile Node tail;

    private volatile int state;
}
```

# Source Code

ReentrantLock 的 Sync 作为 Inner Class 继承了 AbstractQueuedSynchronizer. NonfairSync 和 FairSync 作为 ReentrantLock 的不同实现类

```java
public class ReentrantLock implements Lock, java.io.Serializable {
    abstract static class Sync extends AbstractQueuedSynchronizer {}
    
    static final class NonfairSync extends Sync {}
    
    static final class FairSync extends Sync {}
    
    public ReentrantLock(boolean fair) {
        sync = fair ? new FairSync() : new NonfairSync();
    }
}
```

FairSync 和 NonfairSync 的 lock() 都调用了 AbstractQueuedSynchronizer 的 acquire(). NonfairSync 相比 FairSync, 会在调用 acquire() 前, 先尝试直接获取 Lock

```java
public class ReentrantLock implements Lock, java.io.Serializable {
    abstract static class Sync extends AbstractQueuedSynchronizer {}
    
    static final class NonfairSync extends Sync {
        @ReservedStackAccess
        final void lock() {
            // 先尝试修改 State 为 1, 尝试获取 Lock, 再调用 acquire()
            if (compareAndSetState(0, 1))
                setExclusiveOwnerThread(Thread.currentThread());
            else
                acquire(1);
        }
    }
    
    static final class FairSync extends Sync {
        final void lock() {
            // 直接调用 acquire()
            acquire(1);
        }
    }
}
```

AQS 的 acquire() 依次调用 tryAcquire(), addWaiter() 和 acquireQueued(). AQS 没有实现 tryAcquire(), 调用的还是 ReentrantLock 的 tryAcquire(), 这里就用到了 Template Pattern.

```java
public abstract class AbstractQueuedSynchronizer {
    public final void acquire(int arg) {
        if (!tryAcquire(arg) &&
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            selfInterrupt();
    }

    protected boolean tryAcquire(int arg) {
        throw new UnsupportedOperationException();
    }
}
```

```java
public class ReentrantLock implements Lock, java.io.Serializable {
    abstract static class Sync extends AbstractQueuedSynchronizer {}

    static final class NonfairSync extends Sync {
        protected final boolean tryAcquire(int acquires) { ... }
    }

    static final class FairSync extends Sync {
        protected final boolean tryAcquire(int acquires) { ... }
    }
}
```

FairSync 的 tryAcquire() 会通过 hasQueuedPredecessors 判断 Current Node 是否有 Prev Node, 如果有节点, 则老老实实等待. NonfairSync 则不会判断, 这就代表排在后面的 Node 也会尝试抢 Lock.

```java
@ReservedStackAccess
protected final boolean tryAcquire(int acquires) {
    // ...

    // hasQueuedPredecessors() 判断 Current Node 是否还有 Prev Node
    // compareAndSetState(0, acquires) 修改 Lock 的 State 为 1
    if (!hasQueuedPredecessors() && compareAndSetState(0, acquires)) { 
        setExclusiveOwnerThread(current);
        return true;
    }
    
    // ...
}
```

如果 tryAcquire() 获取失败后, 就会调用 addWaiter() 将当前 Thread 封装成一个 Node 加入 CLH Queue, 并且返回当前 Queue 的 Tail.

```java
private Node addWaiter(Node mode) {
    // 将 Current Thread 封装成一个 Node
    Node node = new Node(Thread.currentThread(), mode);

    // 如果 node 存在, 就让 node 成为 tail, 即入队
    Node pred = tail;
    if (pred != null) {
        node.prev = pred;
        if (compareAndSetTail(pred, node)) {
            pred.next = node;
            return node;
        }
    }

    // 如果 Tail 不存在 或 compareAndSetTail() 调用失败, 就通过 enq() 将 node 入队
    enq(node);

    // 返回 tail
    return node;
}
```

```java
private Node enq(final Node node) {
    for (;;) {
        Node t = tail;
        
        // 如果 Tail 不存在, 就创建一个 Virtual Node 作为 Head, 初始化 Queue
        if (t == null) {
            if (compareAndSetHead(new Node()))
                tail = head;
        }
        
        // 让 Node 跟在 Virutal Node 后面
        else {
            node.prev = t;
            if (compareAndSetTail(t, node)) {
                t.next = node;
                // 这里的 return 就是中止循环, 返回值没有啥意义
                return t;
            }
        }
    }
}
```

acquireQueued() 接收到了 addWaiter() 返回的 Node 后, 让 Node 通过 CAS 获取 Lock.

```java
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    
    // 通过 CAS 获取 Lock
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            
            // 如果 Node 的前一个节点为 Head, 就调用 tryAcquire(), 让 Node 尝试获取 Lock, 如果过获取成功, 就会让 Node 成为 Head, 并设置 Node 的 Thread 为 null, 即做成 Virtual Node
            // 因为 Head 是 Virtual Node, 只作占位, 所以由 head.next() 来争抢 Lock
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }

            // 通过 shouldParkAfterFailedAcquire() 清空 waitStatus 为 CANCELLED (1) 的 Node, 并判断 Current Node 是否需要调用 parkAndCheckInterrupt() 进入等待
            // parkAndCheckInterrupt() 就是调用 LocalSupport.park() 让 Node 进入等待
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    }
    // 如果 CAS 发生异常, 就会取消获取 Lock
    finally { 
        if (failed)
            cancelAcquire(node);
    }
}
```

```java
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
    int ws = pred.waitStatus;

    // 如果 Pred Node 的 waitStatus 为 SIGNAL (-1) 就会让 Current Node 进入等待
    if (ws == Node.SIGNAL)
        return true;

    // 如果为 A -> B -> C -> D, 其中 B, C 的 waitStatus 都是 CANCELLED (1), 即需要离队, 就让 D 往前拱, 一直拱成 A -> D
    if (ws > 0) {
        do {
            node.prev = pred = pred.prev;
        } while (pred.waitStatus > 0);
        pred.next = node;
    }

    // 后一个进来的 Node 会将前一个进来的 Node 设置成 Signal (eg: 第一个进来的 Node 会将 Virtual Node 设置成 Signal, 第二个进来的 Node 会将第一个进来的 Node 设置成 Signal), 这样下一次循环进入 shouldParkAfterFailedAcquire() 就会返回 true, 让 Current node 进入等待
    else {
        compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
    }

    return false;
}
```

如果 CAS 发生异常, 就会调用 cancelAcquire() 取消排队

```java
private void cancelAcquire(Node node) {
    if (node == null)
        return;

    node.thread = null;
    
    Node pred = node.prev;
    
    // Current Node 往前拱, 移除该移除的 (eg: A -> B -> C -> D -> E 中, D 为 Current Node 出现了 Exception 才来到这, B, C 为要离队的, 就拱成 A -> D -> E)
    while (pred.waitStatus > 0)
        node.prev = pred = pred.prev;

    Node predNext = pred.next;

    // Current Node 设置为 CANCELLED, 标识要离队了
    node.waitStatus = Node.CANCELLED;

    // 如果 Current Node 为 Tail, 就让前一个 Node 成为 Tail
    if (node == tail && compareAndSetTail(node, pred)) {
        compareAndSetNext(pred, predNext, null);
    } 

    // 如果 Current Node 不是 Tail
    else {
        int ws;

        // 如果满足条件, 就让 Current Node 离队, 让 node.prev.next = node.next (eg: A -> B -> C -> D, 其中 C 为 Current Node, 让 C 离队, 构成 A -> B -> D)
        if (pred != head &&
            ((ws = pred.waitStatus) == Node.SIGNAL ||
             (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) &&
            pred.thread != null) {
            Node next = node.next;
            if (next != null && next.waitStatus <= 0)
                compareAndSetNext(pred, predNext, next);
        }
        else {
            unparkSuccessor(node);
        }

        node.next = node; // help GC
    }
}
```

ReentrantLock 的 unlock() 会调用 Sync 的 tryRelease() 和 AQS 的 unparkSuccessor() 尝试唤醒 Thread 去争抢 Lock.

```
ReentrantLock unlock()
    Sync release()
        AbstractQueuedSynchronizer release()
            AbstractQueuedSynchronizer tryRelease()
                Sync tryRelease()
                AbstractQueuedSynchronizer unparkSuccessor()
```

```java
public final boolean release(int arg) {
    // 调用 tryRelease
    if (tryRelease(arg)) {
        // 调用 unparkSuccessor() 换新 Head
        Node h = head;
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```

调用 tryRelease() 设置 Lock 的 Owner 为 null, 设置 State 为 0, 标识 Lock 释放了, 让其他 Node 开抢 !!!

```java
protected final boolean tryRelease(int releases) {
    // 接收到 releases 为 1, 这里 State 也为 1, 得到 c = 0
    int c = getState() - releases;
    
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();

    boolean free = false;
    
    if (c == 0) {
        free = true;
        // 设置 Owner 为 null
        setExclusiveOwnerThread(null);
    }

    // 设置 State 为 0
    setState(c);
    
    return free;
}
```

tryRelease() 返回 true 后, 进入 if, 调用 unparkSuccessor() 唤醒 Node.

```java
private void unparkSuccessor(Node node) {
    // node 就是 head, 是 virtual node
    int ws = node.waitStatus;

    // 设置 head 的 waitStatus 为 0
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0);

    // 从 tail 开始往前拱, 移除一些 node (eg: A -> B -> C -> D -> E, A 为 node, 即 head, B 为 node.next, E 为 tail, 其中 C 为 null, D 的 waitStatus < 0, 那么 E 开始往前拱到 B, 一直拱成 A -> B -> E)
    Node s = node.next;
    if (s == null || s.waitStatus > 0) {
        s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    // head 是 virtual node, 只是占位用的, 所以需要唤醒 node.next, 让其去争抢 Lock
    if (s != null)
        LockSupport.unpark(s.thread);
}
```

唤醒后的 Node 会从 acquireQueued() 中醒来, 尝试去获取 Lock

```java
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();

            // 尝试获取 Lock
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }

            // node 从这里醒来, 下一次循环, 就会去尝试获取 Lock, 如果获取不成功, 会再次进入等待
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    }
    finally { 
        if (failed)
            cancelAcquire(node);
    }
}
```