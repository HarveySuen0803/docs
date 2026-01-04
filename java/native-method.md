### Native Method 介绍

在 Java 中，一些常用的方法被实现为 native 方法，这意味着它们是用其他语言（通常是 C 或 C++）实现并通过 JNI（Java Native Interface）调用的。这样做的原因通常是为了提高性能或访问底层系统功能。以下是一些常见的 native 方法：

```java
public class Object {
    public final native Class<?> getClass();

    public native int hashCode();
    
    protected native Object clone() throws CloneNotSupportedException;
}

public class FileInputStream extends InputStream {
    private native int read0() throws IOException;
}

public class Thread implements Runnable {
    private native void start0();
}
```

Native Method 可以通过两种主要方式实现：

- 外部实现：通过 JNI 调用外部编译好的 C/C++ 库中的函数。例如，`FileInputStream#read0`
- 内部实现：可以直接在 JVM 内部实现这些 Native Method，尤其是对于那些对性能有严格要求或者需要直接访问硬件特性（如原子操作、特定CPU指令）的操作。这部分实现通常采用汇编语言编写，针对不同的操作系统和处理器架构定制优化。例如，`AtomicInteger#compareAndSet`。

### JNI 介绍

JNI（Java Native Interface）是 Java 提供的一种编程框架，允许 Java 代码与用其他编程语言（如 C、C++）编写的代码进行交互。通过 JNI，Java 程序可以调用本地方法，实现与底层系统的交互或利用现有的本地库功能。

JNI 的用途：

- 性能优化：某些计算密集型任务可以用 C/C++ 实现以提高性能。
- 访问平台特定功能：通过 JNI，Java 应用可以调用特定于平台的 API。
- 使用已有的本地库：如果有现成的 C/C++ 库可以实现某些功能，Java 程序可以通过 JNI 直接使用这些库。

### JNI 基础使用

以下是一个简单的示例，演示如何使用 Native Method 调用 C 代码：

首先，创建一个 Java 类，声明一个 native 方法：

```java
public class HelloWorld {
    // 声明本地方法
    public native void printHello();

    // 加载本地库
    static {
        System.loadLibrary("hello"); // 加载名为 hello 的库
    }

    public static void main(String[] args) {
        new HelloWorld().printHello(); // 调用本地方法
    }
}
```

在命令行中运行下面这段指令，这将生成一个 `HelloWorld.h` 文件，包含本地方法的声明。

```shell
javac HelloWorld.java
javah -jni HelloWorld
```

创建一个 `HelloWorld.c` 文件，实现本地方法：

```c
#include <jni.h>
#include <stdio.h>
#include "HelloWorld.h"

// 实现本地方法
JNIEXPORT void JNICALL Java_HelloWorld_printHello(JNIEnv *env, jobject obj) {
    printf("Hello from C!\n");
}
```

在命令行中编译 C 代码为共享库：

- Windows 环境运行下面这段指令

```shell
gcc -shared -o hello.dll -I"%JAVA_HOME%\include" -I"%JAVA_HOME%\include\win32" HelloWorld.c
```

- Linux 环境运行下面这段指令

```shell
gcc -shared -fpic -o libhello.so -I${JAVA_HOME}/include -I${JAVA_HOME}/include/linux HelloWorld.c
```

确保共享库在库路径中，然后运行 Java 程序：

```shell
java HelloWorld
```

输出将是：

```
Hello from C!
```

注意事项：

- 确保在编译 C/C++ 代码时使用正确的 Java 包含路径。
- 加载库时，库名不需要扩展名（如 .dll、.so）。
- 为了便于调试，确保本地代码中没有内存泄漏或非法访问。

