# JMM

JMM (Java Memory Model) 是一个 standard, 规定所有的 variable 都存储在 memory 中, 并且规定了 variable 的访问方式, 保证了 multithreaded program 在不同 CPU, 不同 OS 下, 访问 memory 时达到一致的访问效果, 实现 Atomicity, Visibility, Orderliness

thread 从 global memory 中拷贝 shared variable 到 local memory 中操作, 修改完再推送到 global memory 中, 实现修改, 不同 thread 之间, 无法访问对方的 local memory, 必须依靠 global memory 实现交互

Visibility, 一个 thread 修改了一个 variable, 通知其他 thread 有了变化, 如果其他 thread 正在操作这个 vairable, 就会去 global memory 中获取新的 variable, 解决 Dirty Read

Atomicity, 一个 thread 的操作不会被其他 thread 打断

Orderliness, 不同 CPU 和 OS 下, instruction 可以调整执行顺序来提高性能, 但是有些情况下, 不允许,调整顺序, 需要遵守 Happends-Before

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241746185.png)

JMM 为了提高性能, 减少对主内存的频繁访问, 允许修改 Local Memory 中的变量后可以等一会, 不需要立即写回到 Global Memory, 这就可能导致无法保证 Visibility

- T1 在 Local Memory 中修改完变量, 不立即写会到 Global Memory, 此时 T2 读取到的是 Local Memory 中的旧值

Local Memory 中的变量满足下面的条件, 才会写回 Global Memory

- 线程正常结束
- 线程获得锁或释放锁

# Happens-Before

Happens-Before 规范了两个操作的先后关系, 第一个操作的结果对第二个操作可见, 保证 Visibility, 交换两个操作的顺序, 如果不影响结果, 则允许, 如果影响结果, 则不运行, 保证 Orderliness

# Memory Fence

Memory Fence 实现了 Happens-Before, 是 CPU 和 Compiler 对 memory 随机访问中的一个同步点, 该同步点前的所有操作执行完毕后, 才可以执行后续操作, 保证 Visibility, 不允许将 Memory Fence 之后的操作重新排序到 Memory Fence 之前, 保证 Orderliness

LoadLoad Fence 确保在 Load 操作之前的所有 Load 操作都已经完, 确保一个线程读取共享变量的值之前, 它之前的所有读操作都已经完成

StoreStore Fence 确保在 Store 操作之前的所有 Store 操作都已经完成, 确保一个线程修改共享变量的值之前, 它之前的所有写操作都已经完成

LoadStore Fence 确保在 Load 操作之前的所有 Store 操作都已经完成, 确保一个线程读取共享变量的值之前, 其他线程对该变量的写操作已经完成

StoreLoad Fence 确保在 Store 操作之前的所有 Load 操作都已经完成, 确保一个线程修改共享变量的值之前，其他线程对该变量的读操作已经完成

Java 对 Memory Fence 的实现有 volatile, synchronized, final, concurrent ...

# volatile

volatile 是对 JMM 的一种实现, volatile 修饰的变量可以保证 Visibility 和 Orderliness, 但是无法保证 Atomicity

通过 volatile 修饰 variable, 每次修改都会立即写回到 Global Memory 中, 再通过 JMM 清空其他线程中变量的值, 让他们重新来获取最新的值, 保证了 Visibility

通过 volatile 修饰 variable, 执行 write variable 前会先执行 lock, lock 会清空其他 thread 的 local memory 中的 variable, 其他 thread, 就需要重新执行 read variable, 实现 multithreaded interaction, 所以 volatile 适合表示 flag, 适合读的场景

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241746186.png)

```java
public static volatile boolean isLoop = true;

public static void main(String[] args) throws InterruptedException, ExecutionException, TimeoutException {
    new Thread(() -> {
        while (isLoop) {}
    }).start();
    
    try { TimeUnit.MICROSECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    
    isLoop = false;
}
```

这里不通过 volatile 修饰变量, 修改 Local Memory 中的数据后不会立即进行同步, 这里的 isLoop 就会一直是 Local Memory 中的 false

这里不仅仅是因为无法读取到更改后的数据, 更重要的是 JIT 会自动将 while(isLoop) 优化成 while(true) 避免了一次数据读取, 这也导致了 Infinte Loop, 通过 volatile 修饰变量后, 就会禁用这个 JIT Optimization

```java
public static boolean isLoop = true;

public static void main(String[] args) throws InterruptedException, ExecutionException, TimeoutException {
    new Thread(() -> {
        while (isLoop) {}
    }).start();
    
    try { TimeUnit.MICROSECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    
    isLoop = false;
}
```

volatile 通过 Memory Fence 保证了 variable 的 Visibility, Orderliness

```java
private volatile int sharedValue;

public void writeSharedValue(int value) {
    // StoreStore Fence
    sharedValue = value;
    // StoreLoad Fence
}

public int readSharedValue() {
    return sharedValue;
    // LoadLoad Fence
    // LoadStore Fence
}
```

volatile read 后面会插入一个 LoadLoad Fence, 防止和后面的 normal read 进行 reorder, 还会再插入一个 LoadStore Fence, 防止和后面的 normal write 进行 reorder, 最终保证了 volatile read 后的 instruction 不会重排到 volatile read 前面

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202402031244938.png)

volatile write 前面插入一个 StoreStore Fence, 防止和前面的 normal read 进行 reorder, 后面插入一个 StoreLoad Fence, 防止和后面的 volatile read, volatile write 进行 reorder, 最终保证了 volatile write 前的 instruction 不会重排到 volatile write 后面

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202402031244590.png)

下面这段代码中, 如果通过 volatile 修饰 x, 无法避免 x 和 y 重排序, 如果通过 volatile 修饰 y, 可以避免 x 和 y 的重排序

为了避免重排序, 要么全部加上 volatile, 要么就把 volatile read 放在最后, 把 volatile write 放在最前面, 巧妙利用 Memory Fence 避免重排序

```txt
volatile init x # Add volatile to x (not recommanded)
init y
--- Fence for x write --- # This can not prohibit reordering x below and y below
write x = 10
write y = 10
read y
read x
--- Fence for x read --- # This can not prohibit reordering x above and y above

init x
volatile init y # Add volatile to y (recommanded)
write x = 10
--- Fence for y write --- # This can prohibit reordering x above and y below
write y = 10
read y
--- Fence for y read --- # This can prohibit reordering x below and y above
read x
```

volatile 无法保证 Atomicity, 不适合参与需要依赖当前 variable 的运算

这里 count++ 包含 Data Loading, Data Calculation, Data Assignment 三个步骤, 无法保证 Atomicity

一个 thread 修改完 count 后, 将 latest data 写入 global memory 后, 清空其他 thread 的 count, 有些 thread 可能已经执行完 count++, 还没来得及写入 global memory, 就被清空了, 重新读取了 latest data, 导致刚刚的 count++ 丢失

```java
public static volatile int count = 0;

public static void main(String[] args) throws Exception {
    for (int i = 0; i < 10000; i++) {
        new Thread(() -> {
            count++;
        }).start();
    }
    
    try { TimeUnit.SECONDS.sleep(2); } catch (InterruptedException e) { e.printStackTrace(); }
    
    System.out.println(count);
}
```

通过 volatile 保证 Visibility, 最终 Read Consistency

通过 synchronized 保证 Atomicity, 最终 Write Consistency

```java
private volatile int value;

// volatile ensure Visibility
public int getValue() {
    return value;
}

// synchronized ensure Atomicity
public synchronized void setValue(int value) {
    this.value = value;
}
```

# DCL NullPointException

DCL 是一种在单例模式中使用的延迟加载策略, 它尝试通过检查对象是否已经实例化来避免每次获取单例时都需要加锁的开销, 如果不通过 volatile 修饰 instance 会导致 NullPointException

Object Creation 包含 Memory Allocation, Object Initialization, Reference Points to Memory 三个步骤, 在多线程环境下, 由于指令重排序的存在导致了 NullPointException

- 在 Java 中，对象的实例化过程并非原子操作，它可以被分解为以下三个步骤：
  - 为对象分配内存。
  - 调用对象的构造函数，初始化对象。
  - 将对象的引用赋值给变量。
- 由于编译器和 CPU 可能会对指令进行重排序，步骤2和步骤3的执行顺序可能被颠倒。也就是说，可能先执行步骤3，再执行步骤2。这在单线程环境下没有问题，但在多线程环境下可能会导致另一个线程获取到一个未完全初始化的对象。

通过 volatile 修饰 singleton, 禁止重排序, 避免 NullPointException

```java
class DoubleCheckSingleton {
    private static volatile DoubleCheckSingleton instance;
    
    private DoubleCheckSingleton() {}
    
    public static DoubleCheckSingleton getInstance() {
        if (instance == null) {
            synchronized (DoubleCheckSingleton.class) {
                if (instance == null) {
                    instance = new DoubleCheckSingleton();
                }
            }
        }
        return instance;
    }
}
```

