# Print Info

```
# check flag
-XX:PrintCommandLineFlags

# check flag's initial value
-XX:+PrintFlagsInitial

# check falg's final value
-XX:+PrintFlagsFinal
```

# jps

jps 查看 Java 进程状态信息

```shell
jps
```

# jinfo

jinfo 查看进程的参数信息

```shell
jinfo -flag UseTLAB <pid>
```

# jmap

jmap 生成 Heap 的 Dump Fild, 以及查看进程的堆, 内存映射, 类加载信息

```shell
jmap -dump:format=b,file=heapdump.hprof <pid>
```

如果项目刚启动就曝出 OOM, 来不及执行 jmap, 就可以添加 `-XX:+HeapDumpOnOutOfMemoryError` 和 `-XX:+HeapDumpPath=/opt/jvm/dumps/` 在抛出 OOM 后自动生成 Dump

可以通过 jhat, VisualVM 或 IDEA 分析 Dump File

# jhat

jhat 用于分析和查看 Heap 的 Dump Fild

```shell
jhat heapdump.hprof
```

```console
Reading from heapdump.hprof...
Dump file created Thu Feb 10 14:30:44 EST 2022
Snapshot read, resolving...
Resolving 242852 objects...
Chasing references, expect 1 dots...
Eliminating duplicate references...
Snapshot resolved.
```

# jstat

jstat 用于监视进程的各种统计信息 (eg: GC Info, Class Loading Info, JIT Compile Info)

```shell
# <option> 用于指定要监视的统计信息
#   -gc  GC Info
#   -gcutil  GC Info
#   -class  Class Loading Info
#   -compiler  JIT Comile Info
jstat <option> <pid> <interval> [<count>]
```

# jstack

jstack 用于生成进程的线程堆栈跟踪信息, 可以帮助开发人员分析和诊断应用程序中的线程问题 (eg: 死锁、线程竞争)

```shell
jstack [-l] <pid>
```

# jconsole

jconsole 提供了一个图形界面, 用于监视和管理程序的性能, 可以实时查看 JVM 的各种指标 (eg: 堆内存使用, 线程数, 垃圾回收情况)

# VisualVM

VisualVM 供了一个图形用户界面, 用于 JVM 的监视, 管理和诊断 (eg: 性能分析、堆转储、线程转储、垃圾回收分析)
