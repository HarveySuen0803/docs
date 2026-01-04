# GC

GC 的标准就是判断该对象有没有被引用

- Stack Frame 会存储 Ref 去指向对象, 所以等 Stack Frame 弹出后, 就会断开引用
- JVM 中的 Thread 本身就是一个对象, 而 Thread 正常执行过程中, JVM 会持有该 Thread Obj 的引用, 保证该 Thread 不会被垃圾回收

GC Process

- Marking Stage: 判断对象是否存活, 一般有两个方法, 分别是 Reference Counting 和 GC Roots.
- Clearing Stage: 触发 GC, 就会触发 STW (Stop The World !!!), 停止 other User Thread, 等待 GC 结束, 再继续执行 User Thread

YGC, OGC, FGC

- YGC (Young GC, Minor GC) 回收 YG, 当 Eden 空间不足时触发, S0/S1 空间不足时不触发
- OGC (Old GC, Major GC) 回收 OG, 当 OG 空间时触发, 速度至少比 YGC 慢 10 倍, 一般执行 OGC 前, 都会执行多次 YGC
  - 如果 1 个 data 太大, OG 放不下, 会触发 OGC, 如果 OG 还是放不下, 就会抛出 OOM
- FGC (Full GC) 回收 Heap 和 Method Area, 当 OG 空间不足时触发, 当 Method Area 空间不足时触发, 当 YGC 后, OG 变得更大时触发

Parallel GC, Concurrent GC

- Parallel GC 是 STW 时, 多条 GC Thread 并行工作
- Concurrent GC 是 User Thread 和 GC Thread 交替执行, 进行 GC Thread 时, 还是需要发生 STW 的, 只不过停顿时间很短

GC Options

- `-XX:+PrintGC` 输出 GC Info
- `-XX:+PrintGCDetails ` 输出 GC Detials
- `-XX:+PrintGCTimeStamps` 以 Stamp 格式输出 GC TimeStamps
- `-XX:+PrintGCDateStamps` 以 Date 格式输出 GC Time Stamp
- `-Xlog:gc*` 输出 GC Details, 用于 JDK 17
- `-Xloggc` 输出 GC Logs 到指定文件
- `-XX:+UseAdaptiveSizePolicy` 自适应调节 Heap Size.
- `-XX:MaxGCPauseMillis` 设置最大停顿时间, GC 会去自动调整一些参数, 以达到这个设置.
- `-XX:GCTimeRatio` 设置 Throughput, 默认为 99.
- `-XX:ParallelGCThreads` 设置 Thread 数量, 默认等同于 CPU Core 数量.
- `-XX:ConcGCThreads` 设置 Concurrent Thread 数量
- `-XX:InitiatingHeapOccupancyPercent` 设置触发 GC 的 Memory Useage Threshold

# Reference Counting

Reference Counting 统计每一个对象被引用的次数, 当 Counting 为 0 时, 就认为是不在被引用, 即可销毁

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740375.png)

Reference Counting 无法处理 Circular Reference. 这里 obj2, obj3, obj4, obj5 就构成了 Circular Reference, 他们的 Counting 都是 1, 就无法判断为需要销毁的对象

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740376.png)

Reference Counting 实现简单, 性能强, 回收没有延迟, 但是 Circular Reference 无法解决, JVM 就没有采用这种判别方式. Python 采用的就是 Reference Counting, 需要搭配 Weak Reference 断开引用

# GC Roots

JVM 挑选一批较为活跃的 Object 作为 Root Object, 通过 STW 保证一致性, 从上至下访问, 构成 Reference Chain, 每一个访问到的 Object 都会在 Object Header 中添加标识, 标识为 Reachable. GC 就去清理哪些无法访问的 Object

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740377.png)

Root Object

- Virutal Machine Stack 引用的 Object
- Native Method Stack 引用的 Object
- Static Object
- String Constant Pool 中的 Object
- Lock

GC Roots 性能稍差, 但是可以有效解决 Circular Reference. Java, C# 都是采用的 GC Roots, 这种 GC 方式又称 Tracing Garbage Collection

通过 GC Roots 会对 Object 进行第一次标记, 可以分为 Touchable, Revivable 和 Untouchable, 第二次标记时, 会进行以下判断

- 如果一个 Object 没有重写 finalize() 或者已经调用过 finalize() 了, 就会被视为为 Untouchable, 即该 Object 死定了
- 如果一个 Object 重写了 finalize(), 则会插入到 F-Queue 中, 由一个优先级非常低的 Finalizer Thread 触发 finalize(). 此时该 Object 被视为 Revivable, 即可能复活. 如果该 Object 在 finalize() 中, 又被重新引用了, 就会被移除 F-Queue, 这小子死里逃生. 但是每个 Object 的 finalize() 只会调用一次, 下次再进入 F-Queue 就真的逃不了了

# Profiler

添加 `-XX:+HeapDumpOnOutOfMemoryError`, 当产生 OOM 时, 就生成 Dump File, 可用于分析, 究竟是哪个地方出了问题.

也可以通过 VirtualVM 定时生成 Dump File.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740378.png)

通过 IDEA 分析 Dump

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740379.png)

# MarkSweep Algo

MarkSweep Algo 会先通过 GC Roots 标记 Reachable Object, 再彻底遍历 Heap, 回收 Unreachable Object

MarkSweep Algo 效率一般, 清理出来的空间不连续, 需要维护一个 Free List 记录可用的空间, 下次存储数据时, 先查询 Free List 挑一块够用的空间, 直接覆盖旧的内容

MarkSweep Algo 的空间不连续, 如果存储的数据太大, 很难找出一块够大的空间去存储

# MarkSweepCompact Algo

MarkSweepCompact Algo 会在 MarkSweep Algo 基础上, 移动 Reachable Object 到 Memory 的一端, 按顺序排放, 通过 Bump Pointer 指向了 Memory 中空闲的区域, 插入一个 Object 到 Pointer 指向的地址后, Pointer 再移动到 Object 的后头, 指向下一个空闲的区域

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740380.png)

维护一个 Bump Pointer 相比维护一个 Free List 要方便很多, 但是移动后的 Object, 地址发生变化了嘛, 需要修正 Reference

MarkSweepCompact Algo 解决了 Memory Fragment, 但是内存性能稍差

# Copying Algo

Copying Algo 需要将 Memory 分成两份, 将 Reachable Object 直接复制到新区域, GC 直接去清理全部的旧区域

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740381.png)

Copying Algo 性能极强, 但是内存消耗有点大. 适用于 Reachable Object 较少的场景, 如果需要移动的 Reachable Object 太多, 性能优势就不明显了. 大费周章的复制了一圈后, 发现就只需要清理几条数据, 这就太操蛋了

YG 中 Obj 的死亡率高达 70% ~ 90%, 这种严酷的环境下, 采用 Copying Algo 简直是绝配, 王八看绿豆, 对上眼了. Eden, S0 和 S1 将 Reachable Object 复制来复制去, 正是采用了 Copying Algo

# Color Marking Algo

Color Marking Algo 是一种常用于追踪和识别可达对象的方法, 以确定哪些对象是"垃圾", 在许多现代垃圾回收器实现中被采用 (eg: CMS, G1)

- 白色: 表示该对象尚未被检查, 不确定是否可达
- 灰色: 表示该对象已经被检查 (即被标记为活动对象), 但该对象引用的其他对象还没有全部检查
- 黑色: 表示该对象及其所有引用的对象都已被检查, 黑色对象不可能直接或间接引用任何白色对象

Color Markling Algo 流程

- Initial Mark: 标记所有从根集合直接可达的对象, 这些对象被标记为灰色, 意味着它们自身已被标记, 但它们引用的对象还未被检查
- Tracing: 从灰色对象开始, 检查它们引用的所有对象, 将引用的对象标记为灰色 (如果它们是白色的), 并将当前对象标记为黑色, 重复这个过程, 直到没有灰色对象为止
- Final Mark: 处理在遍历过程中可能出现的引用变化, 确保所有可达对象都被正确标记
- Sweep: 回收所有仍然标记为白色的对象, 因为它们被认为是不可达的

Color Marking Algo 通常与并发执行的垃圾收集器一起使用, 这意味着垃圾收集过程中应用程序的线程仍然在运行, 这引入了一个潜在的问题, 应用线程可能会在垃圾收集过程中改变对象引用, 导致某些本应被标记的对象遗漏. 为了解决这个问题, 引入了所谓的 Write Barrier 和 Incremental Update, 以确保在整个垃圾收集过程中, 所有可达的对象都能被正确标记, 防止了错误地回收活动对象

# Generational Collecting

由于每个 Object 的 Lifecycle 不同, 现在主流的 GC 都采用 Generational Collecting 对 Object 进行分代, 一般分为 YG 和 OG, 分别采用不同的 GC Algo 以提高效率

# Enhanced Collecting

由于 GC Roots 的存在, 所有的 Algo 都无法避免 STW, 这会严重影响用户体验, 可以采用 Enhanced Collecting 每次只回收一小部分, 减少每次 GC 的时长, 提高 GC 的次数

Enhanced Collecting 会要求 CPU Thread 频繁切换任务调度, 这个过程会导致  Throughput 下降

# Region

将整个 Heap 分为一块块 Region, 每次 GC 时, 不需要回收整个 Heap, 而是挑选有价值的 Region 进行回收, 可以有效降低 STW 的时长

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740382.png)

# Remembered Set

OG Region 可能引用 YG Region 的 obj, 当 GC 需要去回收 YG Region 时, 不仅需要扫描 YG Region, 还需要扫描其他的 OG Region, 效率太低

每一个 Region 内部都维护了一个 Remembered Set 用于记录引用关系, 后续 GC 回收时, 只需要将该 Region 的 Remembered Set 作为 Root Obj 扫描即可, 效率大大提升

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740383.png)

# System.gc()

```java
public static void test1() {
    byte[] buf = new byte[1024 * 1024 * 1024];
    System.gc(); // 回收失败, buf 的引用还没断开
}

public static void test2() {
    byte[] buf = new byte[1024 * 1024 * 1024];
    buf = null;
    System.gc(); // 回收成功
}

public static void test3() {
    {
        byte[] buf = new byte[1024 * 1024 * 1024];
    }
    System.gc(); // 回收失败, buf 存储在 LVT 中, buf 超出作用域后, 引用断开了, 但是还占用着 Slot, 所以无法回收
}

public static void test4() {
    {
        byte[] buf = new byte[1024 * 1024 * 1024];
    }
    int i = 1;
    System.gc(); // 回收成功, Slot 被 i 复用了, 引用彻底断开, 可以回收
}

public static void main() {
    test1();
    System.gc(); // 回收成功, 超出了 test() 的作用域, buf 的引用断开, 直接回收
}
```

# OutOfMemoryError

Virtual Machine Stack 采用动态空间, 当没有足够的 Memory 来扩展时, 就会抛 OutOfMemoryError

抛出 OOM 之前, GC 一般会进行 FGC, 尝试去回收 Soft Reference 和 Weak Reference 指向的 Object

如果需要存储的数据直接大于了 Heap, 就直接懒得回收了, 直接抛 OOM

# Memory Leak

Object 不在需要了, 但是忘记了断开引用, 依旧 Reachable, 无法回收, 造成 Memory Leak (eg: IO 连接后, 忘记调用 close(), 造成 Memory Leak)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740384.png)

Singleton Pattern 的 Lifecycle 巨长, 如果 Singleton 在内部引用了一些 Object, 被大哥罩着了, GC 不敢动他, 就会造成 Memory Leak

JVM 的 GC 根本就没有采用 Reference Counting, 所以 Circular Reference 根本不会造成 Memory Leak

# Safe Point

程序中分布了很多 Safe Point, 进行 GC 时, User Thread 不会立刻停止, 而是等走到最近的 Safe Point 停下来, 可以保证数据一致

分配 Safe Point 也有一定开销, 不能过度分配, HotSpot 是在每个 Memthod 返回前, 以及进入 Non Counted Loop 前, 放置一个 Safe Point

# Safe Region

如果 User Thread 处于 Sleep 和 Blocked 状态时, 无法前进啊, 无法走到最近 Safe Point, 所以引入了 Safe Region

在 Safe Region 中, Thread 的引用不会变化, 所以 JVM 会忽略这个 Thread, 不会去中断他. 等该 Thread 恢复正常后, 想要离开 Safe Region 前, JVM 会去检查该 Thread 是否进行了 GC, 如果没有, 则会让其进入等待, 等待 GC

# Performance Indicator

CPU 运行 Java Program, 可以分为 运行 User Thread 的时长 和 运行 GC Thread 的时长

Throughput 是 CPU 运行 User Thread 的时长所占比例

Pause Time 进行 GC 时, 暂停的时长. 暂停的时间越短, 用户体验越好. CPU 并发执行 User Thread 和 GC Thread 切换任务也有一定开销, 所以暂停的时间长一点, 减少这部分切换的开销, 可以回收的垃圾越多, Throughput 就越高

这里追求 Throughput, 增加了每次 GC 的时长, 用户体验差了, 但是 Throughput 提高了, Throughput = 1200 / 1600 = 75%

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740385.png)

这里追去 Pause Time, 减少了每次 GC 的时长, 用户体验好了, 但是 Throughput 下降了, Throughput = 1000 / 1400 = 71%

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740386.png)

Throughput 和 Pause Time 无法做到二者兼得, 所以现在主流 GC 都会着重追求其中一个. 现在更多的是在优先追求 Throughput 的情况下, 尽量降低 Pause Time

# Serial GC

Serial GC 回收 YG, 搭配 Serial Old GC 回收 OG, 都采用了 Single Thread

Serial GC Options

- `-XX:+UseSeiralGC` 开启 Serial GC 和 Serial Old GC

# ParNew GC

ParNew GC 通过 Copying Algo 回收 YG, 相比 Serial GC 没有什么区别, 只是采用了 Multi Thread 提升回收性能. 一般都需要搭配 CMS GC 回收 OG

ParNew GC Options

- `-XX:UseParNewGC` 开启 ParNew GC

# Parallel GC

Parallel GC, 通过 Copying Algo 回收 YG, 搭配 Parallel Old GC 通过 MarkSweepCompact Algo 回收 OG. 都采用了 Multi Thread 提升回收性能, 相比 ParNew GC 性能更强, 所以 ParNew GC 几乎没啥存在感了

Parallel GC 优先追求 Throughput, 适合处理不需要太多用户交互的任务 (eg: 批量处理, 订单处理)

Parallel GC Options

- `-XX:UseParallelGC` 开启 Parallel GC
- `-XX:UseParallelOldGC` 开启 Parallel Old GC
- `-XX:ParallelGCThreads` 设置 Parallel GC 的 Thread 数量, 设置多一点可以减少停顿时间, 但是设置太多, 超出了 CPU Core 数量, CPU 就需要频繁切换任务, 反而速度下降

# CMS GC

CMS GC 是第一款 Concurrent GC, 追求降低 Pause Time. 通过 MarkSweep Algo 并发回收 OG

CMS GC Process

- Initial Mark, 通过 GC Roots 标记 Reachable Object, 仅仅是标记工作, STW 非常短
- Concurrent Mark, 遍历 Object, 并发标记, 耗时很久, 但因为是并发过程, 所以不会明显停顿 User Thread
- Remark, 调整因为并发运行而产生变动的标记, 耗时比 Initial Mark 稍微久一点, 但是速度也很快了
- Concurrent Sweep, 并发回收

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740387.png)

当 Memory Useage 达到 92% 的阈值后, 会开始进行 GC. 由于 GC 会并发运行 User Thread, 会产生垃圾, 如果回收的速度赶不上制造的速度, 有可能会塞满整个 Heap, 出现 Concurrent Mode Failure. 这时会触发 STW, 临时调用 Serial Old GC 进行回收, 遭老罪咯

CMS GC 通过 MarkSweep Algo 回收 OG, 必定会产生 Memory Fragment. 由于 User Thread 在并发运行, 采用 MarkSweepCompact Algo, 还需要调整 User Thread 的 Reference, 非常不合适

CMS GC 无法处理 Float Garbage. 在 Concurrent Mark 过程中, CMS GC 无法发现并发运行的 User Thread 产生的新垃圾, 这戏 Float Garbage, 需要等下次 GC 再去清理这些垃圾

CMS GC Options

- `-XX:UseConcMarkSweepGC` 开启 CMS GC
- `-XX:CMSInitialOccupancyFraction` 设置触发 CMS GC 的 Memory Useage Threshold, 默认为 92%
- `-XX:UseCMSCompactAtFullCollection` 执行 FGC 后, 触发 STW, 执行 Compact
- `-XX:CMSFullGCsBeforeCompaction` 执行多次 FGC 后, 触发 STW, 执行 Compact
- `-XX:ParallelCMSThreads` 设置 GC 的 Thread 数量

# G1 GC

G1 GC 追求 Pause Time 可控的情况下, 尽力提高 Throughput, 是一个全功能的 GC

G1 GC 将整个 Heap 分为一块块 Region, 每次 GC 时, 不需要回收整个 Heap, 而是挑选有价值的 Region 进行回收. 通过 Copying Algo 并发回收 YG 和 OG, 但是从整体上看, 这又是 MarkSweepCompact Algo, 既回收了空间, 也整理了碎片

- 当 Eden 塞满后, 触发 YGC, 发动 STW, 启动 Multi GC Thread 通过 Copying Algo 回收 YG
- 当 Memory Useage 达到 45% 时, 触发 Concurrent Marking, 计算每个 Region 的对象存活比例, 用于比较 Region 的回收价值. 根据 Region 的回收价值进行排序, 分成 8 份, 触发 OGC (Mixed GC 回收 YG + OG), 回收 8 次, 优先回收价值高的 Region
- 如果出现意外, 也会触发 FGC, 发动 STW, 使用 Single Thread 进行回收

有些大数据, 无法放进 YG 就会直接放入 OG, 非常烦人, 所以 G1 GC 还增加了一个 Humongous Region 专门用于存储大数据

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241740388.png)

G1 GC 的最好的情况可能不如 CMS GC, 但是 G1 GC 保证了一个可预测的停顿时间, 即 G1 GC 的最差情况要远好于 CMS GC

G1 GC 需要额外维护一个 Remembered Set, 所以内存占用和负载都会高于 CMS GC

G1 GC 适合处理内存大, 内存占用多, 对象分配频繁, 对象年代提升频繁的环境. 在一些内存小, 并且压力不是很大的环境, 反而不如 CMS GC

G1 GC Options

- `-XX:+UseG1GC` 启用 G1 GC
- `-XX:G1HeapRegionSize` 设置 Region Size
- `-XX:G1MixedGCLiveThresholdPercent` 设置垃圾回收的阈值 (垃圾所占内存比例), GC 会放弃回收低于这个阈值的 Region
- `-XX:G1HeapWastePercent` 允许垃圾占用一部分堆空间, 低于这个比例, 就不会进行 GC

