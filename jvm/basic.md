# JVM

JVM 支持跨语言运行, 只要不同语言的 compiler 遵循 JSR 规范, 就可以编译出 Class file, 就可以运行在 JVM 上

Java 可以调用 C 的 API, 就是因为 Java file 和 C file 都编译成了 Class file, 运行在 JVM 上

# JVM Structure

Runtime Data Area 包含 Method Area, Heap, VM Stack, Native Method Stack, Program Counter Register

Java thread 共享 Method Area, Heap 中的数据, 每一个 thread 独有一份 Java Stack, Native Method Stack, Program Counter Register

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401311641233.png)

# Instruction Set

JVM 的 Instruction Set 支持 Stack-based 和 Register-based

Stack-based, 实现更简单, 适用于资源受限的 OS, 避开了 register 的分配问题, 使用 zero-address 分配 instruction, 使用的 instruction 多, 占用小, 移植性强, 跨平台

- stack 在 memory 中, 不需要考虑 hardware, 大部分 instruction set 都是基于 stack, 

Register-based, 直接操作 CPU 的 insturctioin, 使用 one-address, two-address, three-address 为主, 使用的 instruction 更少, 性能强, 移植性差

# JVM Lifecycle

startup: JVM 通过 Bootstrap Class Loader 创建一个 Initial Class 调用 main()

execution: 启动 thread, 执行 programming

shutdown: programming 执行完毕, 出现 exception, 出现 error 都会导致 JVM shutdown, 也可以通过 Runtime 的 halt() 或 System 的 exit() 主动关闭 JVM

