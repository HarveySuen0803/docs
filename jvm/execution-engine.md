# Execution Engine

Class File 包含 Class Instruction, 只有 JVM 能识别 Class Instruction, 需要通过 Eexecution Engine 将 Class Instruction 编译成对应 CPU 的 Machine Instruction.

Execution Engine 既可以从 PC Register 中获取下一条 Instruction 的 Address, 也可以通过 Local Variable Table 的 Reference 找到 Heap 中的 Object.

Execution Engine 包含 Interpreter 和 JIT 两种 Compiler, 负责将 Class Instruction 转成 Machine Instruction.

Interpreter 是逐行编译 Class Instruction. 现在主流的 Template Interpreter 是一条 Class Instruction 关联一个 Template Function, Template Function 可以直接产出对应的 Machine Instruction, 提供性能. 

HotSpotVM 的 Template Interpreter 包含 Interpreter Template 和 Code Template. Interpreter Template 负责主要核心功能. Code Template 负责管理生成的 Machine Instruction.

JIT (Just In Time Compiler) 是 Dynamic Compile, 会将整个 Function 编译成 Machine Instruction, 保存在 Cache 中, 后续再次执行 Function 只要调用对应的一系列 Machine Instruction, 不需要像 Interpreter 一样去重新编译.

JIT 包含 C1 Compiler (Client Compiler) 和 C2 Compiler (Server Compiler, def).

- C1 适合 Client Program, 编译时的优化较浅, 编译耗时较短, 响应快, 资源占用少. 可以设置 `-client` 开启 C1. C1 主要采用方法内联, 栈上替代, 去虚拟化, 冗余消除进行优化.
- C2 适合 Server Program, 编译时的优化较深, 编译耗时较长, 执行效率更高. 可以设置 `-server` 开启 C2. C2 主要采用方法内联, 标量替换, 栈上分配, 同步消除进行优化.

HotSpotVM 为了实现 Java 的跨平台, 避免采用 Static Compilation, 通过 Interpreter 保留 JVM 的动态性. 可以设置 `-Xint` 只采用 Interpreter, 设置 `-Xcomp` 只采用 JIT, 设置 `-Xmixed` 采用 Interpreter + JIT.

HotSpotVM 刚启动时, 会由 Interpreter 先进行解释, 不需要等待全部编译完. 执行过程中, HotSpot Detection 会统计 Method 的调用次数, 达到一定阈值, 就会触发 OSR (On Stack Replacement), 调用 JIT 对一些常用的 Class Instruction 进行优化, 编译成 Machine Instruction 存储到 Cache 中. Cache 存储在 Method Area 中, 即 Native Memory.

C1 触发 OSR 的阈值默认为 1500 次, C2 触发 OSR 的阈值默认为 10000 次. 可以通过 `-XX:CompileThreashold` 设置阈值.

HotSpot Detection 统计的是一段时间内代码的热度, 减少长时间不活跃的代码的计数值, 有助于保持对热点代码的准确性, 如果超过一定的时间限度还不达不到阈值, 就会触发 Counter Decay, 减半统计的次数, 这个时间限度就是 Counter Half Life Time. 可以通过 `-XX:-UseCounterDecay` 关闭 Counter Decay. 可以通过 `-XX:CounterHalfLifeTime` 设置 Counter Half Life Time.

JDK9 引入了 AOT (Ahead Of Time Compiler), 借助 Graal Compiler, 牺牲了动态性, 在程序执行前, 将 Class Instruction 全部转成 Machine Instruction. 