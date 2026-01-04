# Escape Analysis

Escape Analysis 是一种用于分析对象在程序中是否逃逸到方法之外的优化技术, 逃逸分析的目标是识别出哪些对象可以被限制在方法的范围内分配, 而不必将它们分配到堆上, 通过这种方式，逃逸分析可以帮助编译器进行更有效的优化，如栈上分配、标量替换等。

Escape Analysis 不成熟, Escape Analysis 也有一定的消耗, 无法保证每次 Escape Analysis 都有提升

object 经过 Escape Analysis 后, 如果没有发生 Escape, 则可能分配存储到 Stack 中, method 执行完, 立即销毁 object, 不需要 GC, 提升 performance

TaoBaoVM 的 GCIH (GC Invisible Heap) 实现 Off Heap, 可以将 lifecycle 较长的 object 从 Heap 中移到 GCIH 中, GC 无法管理 GCIH 中的 object, 降低 GC 频率, 提高 performance

object 只在 method 内部使用, 则认为没有发生 Escape, 如果被 outer method 调用, 则认为发生 Escape

```java
// Non Escape
public void test1() {
    Object object = new Object;
}

// Escape
public Object test2() {
    return new Object;
}

// Escape
Object object;
public void test3() {
    object = new Object;
}

// Escape
public void test4() {
    Object object = test2();
}
```

开启 Escape Analysis (def)

```
-XX:+DoEscapeAnalysis
```

查看 Escape Analysis details

```
-XX:+PrintEscapeAnalysis
```

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

# Stack Allocation

Stack Allocation 可以将未发生 Escape 的对象分配在线程栈上而不是堆上, 这样的优化可以提高程序的性能, 减少对象在堆上的分配和垃圾回收的开销

Stack Allocation 不适合处理较大的对象, 也不适合处理调用链较深的对象, 可能会导致栈空间不足

这里的 obj 经过 Escape Analysis 确定未发生 Escape, 因此可以将其分配在栈上而不是堆上

```java
public void test() {
    Object obj = new Object();
}
```

# Scalar Replacement

Scalar Replacement 可以将未发生 Escape 的对象拆分为其各个标量成员, 将它们作为独立的标量变量分配在栈上或寄存器中, 从而提高程序的执行性能, 这种优化可以减少对堆内存的访问, 提高内存局部性

开启 Scalar Replacement

```
-XX:+EliminateAllcations
```

JIT 通过 Escape Analysis 会将 Aggregate 替换为 Scalar, 这些 object 就可以不存储在 Heap 中, 而是存储在 Stack 中, 提升 performance

```java
class Point {
    public int x;
    public int y;
    public Point(int x, int y) {this.x = x;this.y = y;}
}

// before JIT optimization
public static void test() {
    // Point is Aggregate, x and y is Scalar
    Point point = new Point(10, 20);
    System.out.println(point.x + " " + point.y);
}

// after JIT optimization
public static void test() {
    // replace Aggregate to Scalar
    int x = 10;
    int y = 20;
    System.out.println(x + " " + y);
}
```
