# Runtime Data Area

启动一个 JVM, 就是启动了一个 process, 包含 Method Area 和 Heap 伴随着 process 的 lifecycle

启动一个 Java program, 就是启动了一个 thread, 包含独立的 Program Counter Register, Native Method Stack 和 Virtual Machine Stack 伴随 thread 的 lifecycle, 所有的 thread 都共享 process 的 Method Area 和 Heap

一个 Java Application 对应一个 Runtime instance, 可以通过 Runtime instance 去操作 Java Application

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241742843.png)

# Program Counter Register

Program Counter Register 用于存储下一条 instruction 在 JVM 中的 adress, 本质上就是 Byte Code 的行号, CPU 会在不同 thread 之间切换, Execute Engine 就需要在 Program Counter Register 中找到下一条 instruction, 如果执行的是 native method, 则找不着

每一个 thread 都有一个 Program Counter Register 记录该 thread 需要执行的 instruction, 防止被其他 thread 覆盖影响

Program Counter Register 占用非常小, 可以忽略不计, 是运行速度最快的存储区域

Program Control (eg: loop, branch) 都是由 Program Counter Register 完成的

Program Counter Register 没有 GC, 也是 JVM 中唯一没有 OutOfMemoryError 的部分

# Virtual Machine Stack

Virtual Machine Stack 结构简单, 没有 GC, 可以快速执行, 速度仅次于 Program Counter Register

Virtual Machine Stack 存储了多个 Stack Frame, 1 个 Stack Frame 对应 1 个 method, 执行 method 对应 Stack Frame 进入 stack, 结束 method 对应 Stack Frame 离开 stack

Virtual Machine Stack 最上层的 Stack Frame 就是 Current Stack Frame 对应 Current Method 和 Current Class

一个 thread 中, 只有 Current Stack Frame 在执行, Current Stack Frame 执行结束, 返回 result 给下一个 Stack Frame, 离开 stack, 由下一个 Stack Frame 成为 Current Stack Frame

Stack Frame 正常执行完和遇到 exception 都会被弹出 stack

other thread 无法访问 current thread 的 Stack Frame, 只有 Stack Frame 执行完毕后, 会通知结果给 other thread

一个 Stack Frame 中存储了 Local Variable Table, Operand Stack, Dynamic Linking, Return Address 和 Additional Info

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241742834.png)

Virtual Machine Stack Options

- `-Xss256k` 设置每个线程的 Stack 的大小

# Native Method Stack

JVM 通过 Native Method 调用 C Language 的 function, 通过 C Language 来和 OS 交互

```java
private native void start0();
```

Native Method Stack 管理 Native Method 的调用, 1 个 Stack Frame 对应 1 个 Native Method, 在 Native Method Stack 中注册 Native Method, Execution Engine 执行时会加载 Native Method Library

Native Method Stack 独立于 JVM, 拥有最高权限, 可以访问 JVM 的 Runtime Data Area, 可以任意分配 memory, 甚至可以访问 CPU Register

# StackOverflowError

如果 Virtual Machine Stack 采用固定空间, 每一个 thread 可以在创建时指定 stack 大小, 当超出了指定 memory 后, 就会抛出 StackOverflowError

通过 recursive 测试 StackOverflowError

```java
public static void main(String[] args) throws Exception {
    main(args);
}
```

# Local Variable Table

Local Variable Table 是一个 array, 独立在 Stack Frame 中, 保证 data safety, 存储了 Local Variable, 包含 basic type, reference type 和 return type, 存储的 variable 越多, table 就越大, 可以被调用的次数就越少, 伴随 Stack Frame 的 lifecycle

```java
public static void main(String[] args) {
    Object obj = new Object();
    String str = "";
    int num = 10;
}
```

```
public static void main(java.lang.String[]);
    Code:
        // locals=4 表示 Local Variable Table 的容量为 4
        stack=2, locals=4, args_size=1            
             0: new           #2                  // class java/lang/Object
             3: dup
             4: invokespecial #1                  // Method java/lang/Object."<init>":()V
             7: astore_1
             8: ldc           #7                  // String
            10: astore_2
            11: bipush        10
            13: istore_3
            14: return
        LineNumberTable:
            // java code 第 5 行 对应 byte code 第 0 行
            line 5: 0                             
            line 6: 8
            line 7: 11
            line 8: 14
        LocalVariableTable:
            // Start 表示 byte code 的 line number
            // Length 表示 byte code 的 action scope
            Start  Length  Slot  Name   Signature
                0      15     0  args   [Ljava/lang/String;
                8       7     1   obj   Ljava/lang/Object;
               11       4     2   str   Ljava/lang/String;
               14       1     3   num   I
```

Normal Method 的 idx 0 一般存储 this, Static Method 的 idx 0 一般存储 Method Param (eg: main() 的 LVT 的 idx 0 处存储的是 args)

```
LocalVariableTable:
    Start  Length  Slot  Name   Signature
        0      15     0  args   [Ljava/lang/String;
        8       7     1   obj   Ljava/lang/Object;
       11       4     2   str   Ljava/lang/String;
       14       1     3   num   I
```

```java
LocalVariableTable:
    Start  Length  Slot  Name   Signature
        0      20     0  this   Lcom/harvey/Coffee;
        8      12     1    o1   Ljava/lang/Object;
       10      10     2    l1   J
```

# Slot

Local Variable Table 存储 data 的 basic unit 就是 Slot

reference, int, byte, short, char, boolean 存储到 1 个 Slot 中, long, double 存储到 2 个 Slot 中, byte, short, char, boolean 存储前都会被转成 int

每一个 Slot 都有一个 index, JVM 通过 index 访问 Slot, 访问一个 method 时, method 中的 local variable 都会按顺序被复制到 Slot 中, local variable 不会进行 Default Initialization, 所以不进行 Specify Initialization 就使用, 会报错

double 和 long 占 2 个 Slot, 所以有 2 个 index, 访问 Slot 时, 就通过第一个 index 访问

normal method 会第一个存储 this 到 Local Variable Table

```
public void show();
    Code:
        LocalVariableTable:
            // Slot = 0 表示 data 存储在 index 为 0 的 Slot 中
            // l1 为 long, 占 2 个 Slot, 所以有 2 个 index, 取第一个作为访问时的 index
            Start  Length  Slot  Name   Signature
                0      20     0  this   Lcom/harvey/Coffee;
                8      12     1    o1   Ljava/lang/Object;
               10      10     2    l1   J
               13       7     4    n1   I
               16       4     5    d1   D
               19       1     7    f1   F
```

如果 1 个 local variable 销毁了, Slot 会被复用, 节省资源, 这里 n2 在 Code Block 中, 执行完 Code Block 立马销毁, 所以后面的 n3 复用了 idx 2 的 Slot

```java
public void show() {
    int n1 = 0;
    {
        int n2 = 0;
        n2 = 10;
    }
    int n3 = 0;
}
```

```
public void show();
    Code:
        LocalVariableTable:
            Start  Length  Slot  Name   Signature
                0      10     0  this   Lcom/harvey/Coffee;
                2       8     1    n1   I
                4       3     2    n2   I
                9       1     2    n3   I
```

# Operand Stack

Operand Stack 是 Execution Engine 的 workspace, 用于存储计算的临时变量, 存储计算的中间结果

Operand Stack 有一个 Stack Level, 1 个 32bit type 占 1 个 Stack Level, 1 个 64bit type 占 2 个 Stack Level

```java
public void test() {
    int n1 = 10;
    int n2 = getNum();
    int n3 = n1 + n2;
}
```

```
public void test();
    Code:
        // stack=2 表示 Operand Stack 的 Stack Level 为 2, Stack 中最多存储 2 个操作数
        stack=2, locals=4, args_size=1             
             // 将 10 作为 operand 压入 Operand Stack
             0: bipush        10
             
             // 将 operand 弹出 Operand Stack, 存储进 Local Variable Table 的 index 为 1 的 Slot 中
             2: istore_1
             
             // normal method 的 index 为 0 的 Slot 中存储的就是 this
             3: aload_0
             
             // 通过 this 调用 method, 得到 result, 将 result 压入 Operand Stack
             4: invokevirtual #15                 // Method getNum2:()I

             7: istore_2
             
             // 从 index 为 1 和 2 的 Slot 中取出 operand, 压入 Operand Stack
             8: iload_1
             9: iload_2
             
            // 将 2 个 data 弹出 Operand Stack, 调用 Execution Engine 将 2 个 operand 的 class instruction 转成 machine instruction, 由 cpu 计算得出 result, 将 result 压入 Operand Stack
            10: iadd
            
            11: istore_3
            
            12: return
```

通过 stack 作为 workspace, 不需要通过 address 来标识 instruction, 只需要进行 push 和 pop, 每一个 instruction 都很小, 但是数量非常多, 而 operand 存储在 memory 中, 所以会对 memory 进行频繁的 IO, 效率太差, 可以通过 TOS (Top-of-Stack Cashing) 将 Top Stack 中的 operand 保存在 register 中, 减少对 memory 的 IO

# Dynamic Linking

Dynamic Linking 会发生在两个阶段. 如果能在 Class Loading 期间确定的 Reference, 则会在 Resolve 这一步将 Symbolic Reference 转成 Direct Reference. 由于 Dynamic Binding 的存在, 很多引用需要在 Runtime 时确定, 将 Symbolic Reference 转成 Direct Reference

Symbolic Reference 是一个标识, 用于描述所引用的目标的各种符号信息, 包括类和接口的全限定名, 字段的名称和描述符, 方法的名称和描述符等, 存储在 class file 的 Class Constant Pool

Direct Reference 指向 Heap 中的 instance 的地址, 存储在 class file 的 Runtime Constant Pool

```
public static void main(java.lang.String[]) throws java.io.IOException;
    descriptor: ([Ljava/lang/String;)V
    Code:
        stack=2, locals=3, args_size=1
             // #7 就是 reference, 指向 Constant Pool 的 #7
             0: new           #7                  // class com/harvey/User
             3: dup
             4: invokespecial #9                  // Method com/harvey/User."<init>":()V
             7: astore_1
             8: aload_1
             9: invokevirtual #10                 // Method com/harvey/User.show:()V
            12: return
```

```
Constant pool:
     // 引用 #2 的 #3, #2 是 class, #3 是 method
     #1 = Methodref          #2.#3           // java/lang/Object."<init>":()V
     #2 = Class              #4              // java/lang/Object
     // 引用 #5, #5 是 method, #6 是 return value
     #3 = NameAndType        #5:#6           // "<init>":()V
     #4 = Utf8               java/lang/Object
     #5 = Utf8               <init>
     #6 = Utf8               ()V
     #7 = Class              #8              // com/harvey/User
     #8 = Utf8               com/harvey/User
     #9 = Methodref          #7.#3           // com/harvey/User."<init>":()V
     #10 = Methodref          #7.#11         // com/harvey/User.show:()V
    #11 = NameAndType        #12:#6          // show:()V
    #12 = Utf8               show
    #13 = Class              #14             // com/harvey/Main
    #14 = Utf8               com/harvey/Main
```

# Static Linking

Static Linking (Early Binding) 在 Compile Stage 可以确定 Symbolic Reference 对应的 Direct Reference, 不具备 Polymorphism 的 class 就可以进行 Static Linking, 不能被 override 的 method 也可以进行 Static Linking (eg: Static Method, Private Method, Final Method, Constructor) 

Dynamic Linking (Late Binding) 在 Compile Stage 无法确定 Symbolic Reference 对应的 Direct Reference, 需要在 Runtime Stage 的 Class Loading 的 Linking 的 Resolve 中确定

Static Linking 相比 Dynamic Linking 具有更快的启动时间和执行速度, 生成的可执行文件独立于外部环境, 不再依赖于外部的库文件, 但是可重用性较差, 资源占用也较多

# Method Invocation

执行 invokevirutal 和 invokeinterface 访问 Virtual Method, 通过 Dynamic Linking 将 Symbolic Reference 转成 Direct Reference

执行 invokestatic 和 invokespecial 访问 Non Virutal Method, 在 Compile Stage 就已经通过 Static Linking 将 Symbolic Reference 转成 Direct Reference 了, 这里直接访问即可, 效率非常高

```java
class A extends AA {
    public void showNormal() {};
    public static void showStatic() {}
    private void showPrivate() {}
    
    public A() {
        super();
    }
    
    public void test() {
        // 通过 super 访问 method, 确定调用 Parent Class 的 method, 在 Compile Stage 可以确定 Direct Reference
        super.showNormal(); // invokespecial
        // Static Method 无法 override, 在 Compile Stage 可以确定 Direct Reference
        super.showStatic(); // invokestatic
        // Final Method 无法 override, 在 Compile Stage 可以确定 Direct Reference
        super.showFinal(); // invokespecial
        
        // 通过 this 访问 method, 无法确定 Sub Class 是否 override 了 Parent Class 的 method
        this.showNormal(); // invokevirtual
        // Static Method 无法 override, 在 Compile Stage 可以确定 Direct Reference
        this.showStatic(); // invokestatic
        // Final Method 应该是 Non Virtual Method, 这里通过 this 访问 Final Method 调用 invokevirutal 是一个例外
        this.showFinal(); // invokevirtual
        this.showPrivate(); // invokevirtual
        
        // 访问 interface 的 method, 不确定哪个 class 具体实现 interface 的 method
        IA ia = null;
        ia.showInterface(); // invokeinterface
    }
}

class AA {
    public void showNormal() {};
    public static void showStatic() {}
    private void showPrivate() {}
    public final void showFinal() {}
}

interface IA {
    public void showInterface();
}
```

Java 一直是 Static Language, 直到 Lambda 的引入, 让 Java 拥有了 Dynamic Language 的特性, 在 Compile Stage 无法根据 Compile Type 确定 type, 需要执行时, 根据 Runtime Type 来确定 (eg: Python 中, 所以 variable 都是在运行时通过 value 确定 type)

JVM 通过 invokedynamic 调用 Dynamic Method

```java
Thread thread = new Thread(() -> System.out.println("hello world"));// invokedynamic
```

# Virtual Method Table

Class Loading 的 Linking 的 Resolve 时, 会在 Method Area 中建立一个 Virtual Method Table 记录 Virtual Method 的 index, 访问 Virtual Method 就不需要频繁向上寻找了

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241742836.png)

# Return Address

A 调用 B, B 为 Current Frame Stack, 执行完调用 return instruction, 需要恢复 Local Variable Table, Operand Stack, 并且设置 Return Address

如果正常执行完毕, B 会将返回值压入 A 的 Operand Stack, 修改 A 的 PC Register 为 Return Address, 这就是下一条需要执行的指令的地址, 从而实现方法的返回和控制流的切换

如果遇到异常, B 不会将返回值压入 A 的 Operand Stack, B 的 Stack Frame 会弹出栈, 然后查询 Exception Table 寻找 Exception Handler 来处理异常

# Heap

Stack 存储 reference, 指向 Heap 存储的 instance, instance 不被指向后, 不会立马销毁, 而是等待 GC

Heap 包括 YG (Young Generation Space) 和 OG (Old Generation Space), YG 包括 Eden, S0 (Survivor0), S1 (Survivor1)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241742837.png)

默认 YG 占 1/3, OG 占 2/3 (eg: 共 30m, YG 占 10m, OG 占 20m)

默认 Eden 占 YG 的 8/10, S0 占 YG 的 1/10, S1 占 YG 的 1/10 (eg: Eden 占 8m, S0 占 1m, S1 占 1m)

默认初始容量为 Native Memory / 64, 默认最大容量为 Native Memory / 4

```java
long initMemory = Runtime.getRuntime().totalMemory() / 1024 / 1024; // 520
long maxMemory = Runtime.getRuntime().maxMemory() / 1024 / 1024; // 8192

System.out.println("totalMemory: " + initMemory * 64 / 1024 + "G"); // 32G
System.out.println("totalMemory: " + maxMemory * 4 / 1024 + "G"); // 32G
```

通过 `jps` 查看 JVM Process, 再根据 Process No 查看其他信息

```txt
49425 Jps
49014 Launcher
49015 Main
1052
```

通过 `jstat -gc 49015` 查看 Process No 为 49015 的 JVM 程序的 Heap 状态

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202402011000975.png)

通过 `-XX:+PrintGCDetails` 查看 GC details

```
[0.001s][warning][gc] -XX:+PrintGCDetails is deprecated. Will use -Xlog:gc* instead.
[0.003s][info   ][gc] Using G1
[0.004s][info   ][gc,init] Version: 17.0.8.1+1-LTS (release)
[0.004s][info   ][gc,init] CPUs: 10 total, 10 available
[0.004s][info   ][gc,init] Memory: 32768M
...
[0.042s][info   ][gc,heap,exit] Heap
[0.042s][info   ][gc,heap,exit]  garbage-first heap   total 532480K, used 7601K [0x0000000600000000, 0x0000000800000000)
[0.043s][info   ][gc,heap,exit]   region size 4096K, 1 young (4096K), 0 survivors (0K)
[0.043s][info   ][gc,heap,exit]  Metaspace       used 614K, committed 768K, reserved 1114112K
[0.043s][info   ][gc,heap,exit]   class space    used 38K, committed 128K, reserved 1048576K
```

配置 Heap

- `-Xms10m` 设置 Heap 的初始容量为 10m
- `-Xmx20m` 设置 Heap 的最大容量为 20m, 当超出最大容量 20m 后, 会抛出 OOM
- `-Xmn20m` 忽略 Ratio, 设置 YG 的大小为 20m, 自动分配 OG 的大小
- `-XX:NewRatio=2` 设置 YG 和 OG 的 Ratio 为 1 : 2
- `-XX:SurvivorRatio=8` 设置 Eden, S0 和 S1 的 Ratio 为 8 : 1 : 1
- `-XX:-UseAdaptiveSizePolicy` 关闭自适应调整 Ratio, 默认不一定是 1:2 和 8:1:1
- `-XX:MaxTenuringThreshold=15` 配置数据躲过多少次 GC 进入 OG, 最大配置为 15

# Memory Allocation Procedure

默认创建一个 data 会优先存放在 Eden 中, 等 Eden 满后, 会触发 YGC, 回收 Eden 中大部分的 data, 将无法回收的 data, 移入 S0 或 S1, 并设置 data 的 age = 1, 表示躲过 1 次 GC

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241742839.png)

S0 和 S1 同时只能使用一个, 已经存放了 data 的 S 标记为 from, 未存放 data 的 S 标记为 to, 这里 S0 就是 from, S1 就是 to

再次触发 YGC 时, 将 Eden 中幸存的 data 和 from 中的 data 移入 S1, 并设置 data 的 age + 1

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241742840.png)

循环多次后, 当 data 的 age 达到 MaxTenuringThreshold (16) 时, 认为该 data 不太可能被回收了, 就进入 OG

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241742841.png)

age 不需要超过 MaxTenuringThreshold, 也可以进入 OG 的特殊情况

- 如果 1 个 data 太大, Eden 放不下, 也会直接进入 OG
- 如果 S0/S1 中相同 age 的 data 的数量总和超过 S0/S1 容量的一半时, 大于等于该 age 的所有 data 也会直接进入 OG

# TLAB

Heap 是多线程共享的, 分配内存时, 需要通过锁竞争保证线程安全, 非常影响性能

TLAB（Thread-Local Allocation Buffer）是一种用于提高多线程并发分配对象的机制, TLAB 对 Eden 进行划分, 每个线程私有一小份内存, 默认占 Eden 的 1/100

TLAB 可以避免多线程竞争, 提高对象的分配速度, 提高并发性能, 减少内存碎片, 避免了多线程之间频繁切换导致的内存碎片

存储一个数据时, 优先通过 TLAB 分配, 如果不成功, 再通过 Eden 分配空间

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241742842.png)

配置 TLAB

- `-XX:UseTLAB` 启用 TLAB (def: enable)
- `-XX:TLABSize=1m` 设置 TLAB size 为 1m
- `-XX:TLABWasteTargetPercent=3` 设置 TLAB ratio 为 3/100
- `-XX:TLABRefillWasteFraction=50` 设置 TLAB 中的空间使用效率为 50%, 当 TLAB 的剩余空间超过 50% 时, 进行重填入

# Method Area

Metaspace 是 HotSpot 对 Method Area 的实现, 不存储在 JVM Memory 中, 存储在 Native Memory 中

- JDK7, Method Area 存储在 JVM Memory 的 Heap 中, 非常容易导致 OOM
  - java.lang.OutOfMemoryError: Permspace
- JDK8, Method Area 存储在 Native Memory 中, 不容易导致 OOM
  - java.lang.OutOfMemoryError: Metaspace

Method Area 的初始化大小 MetaspaceSize 为 21MB, 当占用达到 MetaspaceSize 后, 会触发 FGC, 如果清理后还是不够用, 会向上扩容, 直到 MaxMetaspaceSize, 如果清理了很多后, 会降低 MetaspaceSize

逻辑上 Runtime Constant Pool, String Constant Pool, Static Member, Class Info 存储在 Method Area 中

实际上 Hotspot 将 String Constant Pool, Static Member 存储在 Heap 中, Class Info, Runtime Constant Pool 存储在 Method Area 中

- JDK7, Static Obj 存储在 Heap 中, Static Obj Ref 存储在 Method Area 中
- JDK8, Static Obj 和 Static Obj Ref 都存储在 Heap 中
- Local Obj 存储在 Heap 中, Basic Type 和 Local Obj Ref 存储在 Stack 中
- Member Obj 和 Member Obj Ref 都存储在 Heap 中

Method Area 触发 GC 主要清理 Runtime Constant Pool 和 Class Info, 要求非常苛刻, 包括三个条件

- Class 和 Sub Class 都不存在 Instance
- 加载该 Class 的 Class Loader 已经被回收
- 该 Class 的 Class Object 没有被引用

Method Area 通过 Klass 这种数据结构表示 Class Info (Klass 和 Class 发音相同)

配置 Method Area

- `-XX:MetaspaceSize=21m`
- `-XX:MaxMetaspaceSize=100m`

# Class Constant Pool

Class Constant Pool 存储在 Class File 中, 包含 Literal 和 Symbolic Reference, 类似于一个 Table, 每个 Literal 和 Symbolic Reference 都标识了 Index, 可以通过 Index 访问

Literal 包含 Basic Field, String Field 和 Final Field

Symbolic Reference 本质上还是 Literal, 用作标识, Class File 占用小, 就是因为采用了 Symbolic Reference

# Runtime Constant Pool

Class File 经过 Class Loader, 会将 Class Constant Pool 中必要的信息加载到 Runtime Constant Pool 中, 包括 Literal, Dynamic Ref, Symbolic Ref (有部分 Symbolic Ref 在 Class Loading 阶段无法转成 Dynamic Ref)

Runtime Constant Pool 具有 Dynamic, 可以在 Code 中修改 Runtime Constant Pool (eg: String 的 Intern())

# String Constant Pool

SCP (String Constant Pool) 维护了一个 StringTable 通过 HashTable 实现, 存储的 String Object 都是唯一的

- JDK7 时, SCP 存储在 Method Area 中, 只有触发 FGC 才会进行清理, JDK8 后, SCP 移动到 Heap 中, GC 效率稍高了一些
- JDK8 中 StringTable 默认长度为 65536, 可以通过 `-XX:StringTableSize` 设置 HashTable 的长度
- 存储 String Object 过多, 就会导致 Hash Complict, 导致 Linked List 过长, 性能下降

通过 intern() 也可以保证存储唯一的 String Object. 调用 intern() 后会先去 SCP 中寻找该 String Object

- 如果找得到, 就会返回该 String Object 的 Reference
- 如果找不到, 就会创建该 String Object, 然后返回 Reference
- 通过 intern() 创建 String Object, 可以节省 Memory, 并且 GC 也会容易很多

new String("ab") 可以在 Compile Stage 确定, 不仅仅会在 Heap 中创建 "ab", 还会在 SCP 中创建 "ab"

```java
// s1 指向 SCP 的 "ab"
String s1 = "ab";
// s2 指向 Heap 的 "ab"
String s2 = new String("ab");
// SCP 中已经有 "ab" 了, intern() 就直接返回 "ab" 的 Ref, 所以 s3 指向 SCP 的 "ab"
String s3 = s2.intern();
System.out.println(s1 == s2); // false
System.out.println(s1 == s3); // true

// s1 指向 Heap 的 "ab"
String s1 = new String("ab");
// s1.intern() 会去返回 SCP 的 "ab", 发现没有 "ab", 则去创建了一个 "ab"
// s2 指向 SCP 的 "ab"
String s2 = s1.intern();
// s3 指向 SCP 的 "ab"
String s3 = "ab";
System.out.println(s1 == s2); // false
System.out.println(s1 == s3); // false
System.out.println(s2 == s3); // true
```

JVM 为了会进行编译优化, String s = "a" + "b" 经过编译优化, ByteCode 中会是 String s = "ab"

```java
String s1 = "a" + "b";
String s2 = "ab";
System.out.println(s1 == s2); // true
```

String 的拼接, 底层依赖的是 StringBuilder 调用 append() 追加 String Object

```java
String s = new String("a") + new String("b");

// Similar to this
String s = new StringBuilder().append("a").append("b").toString();
```

StringBuilder 拼接的字符串 "ab" 无法在 Compile Stage 确定, 所以就不会在 SCP 中创建

通过 intern() 访问, 则会在 SCP 中存储一个引用指向 Heap 中的 "ab" 中, 所以 SCP 不仅存储 String Object, 还会存储 String Object Ref

```java
// s1 指向 Heap 的 "ab"
String s1 = new StringBuilder().append("a").append("b").toString();
// s1.intern() 处理 StringBuilder 拼接的字符串, 创建一个引用指向 "ab", 非常特别
// s2 指向 Heap 的 "ab"
String s2 = s1.intern();
// s3 指向 Heap 的 "ab"
String s3 = "ab";
System.out.println(s1 == s2); // true
System.out.println(s1 == s3); // true
System.out.println(s2 == s3); // true

// new String("a") + new String("b") 本质上就是通过 StringBuilder 的 append() 拼接的, 所以下面的效果一样
String s1 = new String("a") + new String("b");
// s2 指向 Heap 的 "ab"
String s2 = s1.intern();
// s3 指向 Heap 的 "ab"
String s3 = "ab";
System.out.println(s1 == s2); // true
System.out.println(s1 == s3); // true
System.out.println(s2 == s3); // true
```

# Object Instantiation

Object Instantiation 包括 Class Loading, Memory Allocation 和 Object Initialization

1. Class Loading

- JVM 执行 new 时, 会去 Constant Pool 中寻找对应的 Symbolic Reference 标识的 Class, 如果该 Class 不存在, 则会去通过 Parent Delegation 找到对应的 ClassLoader 进行 Class Loading
- 根据 ClassLoader + Package Name + Class Name 查找到对应的 Class File 进行 Class Loading, 生成 Class, 如果没有找到 Class File, 则抛出 ClassNotFoundException

2. Memory Allocation

- 采用 Bump the Pointer 或 Free List 给 Object 分配内存
- 如果 Memory 规整 (eg: 从左往右, 依次存储使用), JVM 会通过 Bump Pointer 指向了 Memory 中空闲的区域, 插入一个 Object 到 Pointer 指向的地址后, Pointer 再移动到 Object 的后头, 指向下一个空闲的区域
- 如果 Memory 不规整, JVM 会维护一个 Free List, 记录哪些区域为空闲, 后续查询该 List 即可知道 Object 可以分配在哪了

3. Object Initialization

- 调用对象的构造函数进行初始化, 构造函数的执行过程包括初始化字段, 执行构造方法体等, 子类构造函数会调用父类构造函数, 确保所有父类和子类的构造函数都得到执行
- 对象的字段会根据其类型进行默认初始化, 保证不赋值时, 也基本可用
- 构造方法体中的代码将会执行, 完成对象的特定初始化操作
- 构造函数执行完毕后, 将对象的引用返回给调用者, 这样对象就可以在程序中被引用和操作了

Object Instantiation 需要保证线程安全, 防止多个线程并发访问和修改同一个对象的状态

- Class Loading 过程, Class Loader 通常在单线程中执行, 可以保证线程安全
- Memory Allocation 过程, 通常是线程安全的, 每个线程分配的内存地址都是独立的, JVM 通过 CAS 保证了多线程环境下的原子性分配
- Object Initialization 过程, JVM 通过 Initialization Lock 保证多个线程中只有一个线程执行类的初始化过程

# Object Structure

Object Structure 包括 Header, Instance Data 和 Padding

1. Header: 包括 Mark Word, Class Pointer 和 Array Length

- Mark Word: 存储 HashCode, GC Age (4b, 所以 GC Age 最大 15), Lock, Lock State, Thread Id, Thread Stamp
- Class Pointer: 指向 Method Area 中对应 Class 的 Klass Class Info
- Array Length: 如果 Object 是 Array, 则会记录 Array Length

2. Instance Data: 存储了对象的实际数据, 

- 如果是 Normal Obj, 则 Instance Data 包括 Cur Class 和 Par Class 的 Field
  - Par Class 的 Field 会在 Sub Class 的 Field 之前, 如果宽度相同, 则会分配在一块, 如果 CompactFields 为 true, 则 Sub Class 的 Narrow Field 则可能插入 Par 的 Field 的缝隙
- 如果是 Array Obj, 则 Instance Data 包括 Array Length 和 Array Element

3. Padding: JVM 要求 Object 的 Start Address 为 8B 的整数倍, 通过 Padding 向上对齐 (eg: 14B 向上对齐为 16B)

Heap 中是不存储 Class Info 的, 只存储 Instance Data, 通过 ClassPointer 指向当前对象对应的 Klass 查询 Class Info

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202402292302358.png)

# Object Memory Allcation

64 bit OS 中, Mark Word 占 8B, Class Pointer 占 8B, 共占 16B, Pointer Compression 会将 Class Pointer 压缩成 4B, 可以通过 `-XX:-UseCompressedOops` 禁用 Pointer Compression

直接通过 `new Object()` 创建一个空对象, 就是 MarkWord 占 8B, Class Pointer 占 4B, Padding 占 4B, 共 16B

通过 JOL 查看 Memory Allcation

```xml
<dependency>
    <groupId>org.openjdk.jol</groupId>
    <artifactId>jol-core</artifactId>
    <version>0.17</version>
</dependency>
```

```java
public class Main {
    public static void main(String[] args) throws IOException {
        System.out.println(ClassLayout.parseInstance(new MyObject()).toPrintable());
    }
}

class MyObject { // MarkWord 8B, ClassPointer 4B
    int i; // 4B
    long l; // 8B
    boolean b; // 1B
    Object o; // 4B
} // 8 + 4 + 4 + 8 + 1 + 4 + 3 = 32B
```

```
OFF  SZ    TYPE DESCRIPTION
  0   8    (object header: mark)
  8   4    (object header: class)
 12   4    int MyObject.i
 16   8    long MyObject.l
 24   1    boolean MyObject.b
 25   3    (alignment/padding gap)   
 28   4    java.lang.Object MyObject.o
Instance size: 32 bytes
Space losses: 3 bytes internal + 0 bytes external = 3 bytes total
```

# Object Reference

JVM 进行对象定位时, 有句柄引用 和 直接引用 (def) 两种方式

直接引用 是 引用 -> 对象

句柄引用 是 引用 -> 句柄 -> 对象, 在堆中维护一个句柄池, 想要定位对象, 就得先定位到句柄池里的某一个句柄, 再通过该句柄定位到具体的对象. 在 GC SweepCompact 时, 需要频繁改变对象的位置, 就只需要调整句柄的引用即可, 不需要去调整栈帧的引用

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202402292305667.png)

# Direct Memory

Direct Memory 不存储在 JVM Memory 中, 存储在 Native Memory 中, 通过 NIO 直接操作 Native Memory

BIO 时, 需要先访问 User Mode 的 Buffer, 复制数据到 Kernel Mode 的 Buffer 中, 再访问 Kernel Mode 的 Buffer, 才能再操作 Disk, 重复存储了两份数据, 效率低

NIO 时, OS 会直接划分一块 Buffer 供 Java Program 访问, OS 会同步 Buffer 中的数据到 Disk 中, 只存储一份数据, 少了一次复制操作, 适合大文件存储

