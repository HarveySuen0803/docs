# Class Lifecycle

Class Lifecycle 是指类从被加载到虚拟机中开始, 直到卸载出虚拟机为止的整个过程

- Class Loading: 使用 new 关键字实例化对象, 访问静态字段, 调用静态方法等操作都会触发 Class Loading, 在这个阶段, JVM 会将 class 文件读入内存, 并为之创建一个 java.lang.Class 对象, 不仅是应用程序直接引用到的类需要加载, 被这些类引用的类也会被递归加载
- Class Using: 类的正常使用阶段, 可以创建实例, 调用方法, 在此阶段, 类完全加载完成, 可以自由地被应用程序使用
- Class Unloading: 类卸载的情况比较少见, 只有当该类的 ClassLoader 实例被垃圾回收时, 这个类才会被卸载, 这通常意味着没有任何活跃的引用指向该 ClassLoader 实例和它加载的类

# Class Loading

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241741801.png)

Loading

- 由专门的 Class Loader 通过 Full Class Name 找到 Class File, 获取 Byte Stream, 加载数据到 Memory 中
- 在 Heap 中生成 Class Obj (通过 Reflect 获取的 Class Obj)
- 在 Method Area 中生成 Klass 对象, 本质上是二进制数据, 表示 Class Info

Linking, 分为 Verify, Prepare 和 Resolve 三个步骤

- Verify, 对 File Format, Metadata, Byte Code, Symbolic Ref 进行 Verification
- Prepare, 为 Static Member 和 Constant 分配 Memory, 进行 Default Initialization
    - Basic Type 的 Final Static Field 在 Prepare 进行 Specified Initialization
    - Ref Type 的 Final Static Field 在 Initialization 进行 Specified Initialization
- Resolve, 将 Class Constant Pool 中 Class, Interface, Field, Method 的 Symbolic Ref 转换成 Direct Ref

Initialization

- 执行 clinit(), 对 Static Member 进行 Specified Initialization, 优先初始化 Par Class
  - Compiler 收集 Static Field 的 Assignment Statement 和 Static Code Block 到 clinit()
  - Compiler 会同步 clinit(), 保证 Memory 中只有一个 Class Object
  - JVM 会对 clinit() 加锁, 保证只被一个 Thread 执行一次
  - Active Loading 会 Initialization, Passive Loading 不会出发 Initialization
- 执行 Static Code Block, 优先执行 Par Class 的 Static Code Block

```java
/*
    Loading, load class A, generate class file, generate class object
    Linking, default initialization
        num = 0
    Initialization, specified initialization
        collect static memeber
            <clinit>() {
                num = 100;
                num = 200;
                System.out.println("hello world");
            }
        merge
            <clinit>() {
                num = 200;
                System.out.println("hello world");
            }
        bytecode
              static <clinit>()V
               L0
                LINENUMBER 10 L0
                BIPUSH 100
                PUTSTATIC com/harvey/A.num : I
               L1
                LINENUMBER 12 L1
                SIPUSH 200
                PUTSTATIC com/harvey/A.num : I
               L2
                LINENUMBER 13 L2
                GETSTATIC java/lang/System.out : Ljava/io/PrintStream;
                LDC "hello world"
                INVOKEVIRTUAL java/io/PrintStream.println (Ljava/lang/String;)V
               L3
                LINENUMBER 14 L3
                RETURN
                MAXSTACK = 2
                MAXLOCALS = 0
*/

public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        new A();
    }
}

class A {
    static int num = 100;
    static {
        num = 200;
        System.out.println("hello world");
    }
    public A() {
        System.out.println("A()");
    }
}

class B {
    // normal field, will not allocate memory during the class loading stage
    public int n1 = 10;
    // static field, initialized to 0 during defualt initialization stage, initializaed to 10 during specified initializatin stage
    public static int n2 = 10;
    // constant field, execute before class loading
    public static final int n3 = 10;
}
```

# ClassLoader

ClassLoader 是 JRE 的一部分, 可以动态加载需要的 class 到 JVM

ClassLoader 的加载顺序, Bootstrap ClassLoader -> Platform ClassLoader -> System ClassLoader -> Custom ClassLoader

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241741802.png)

如果两个 class 的 pkg name, class name, ClassLoader 都相同, 则 JVM 会认为是相同的 class

# Bootstrap ClassLoader

Bootstrap ClassLoader 加载 JavaSE 和 JDK 的 core lib (eg: rt.jar, resources.jar), 加载的 class 都被隐式的赋予了 all permission

Bootstrap ClassLoader 由 C/C++ 实现, 是 JVM 的一部分, 不是 Java class, 无法在代码中获取到

Bootstrap ClassLoader 加载的 lib

```txt
java.base                   java.security.sasl
java.datatransfer           java.xml
java.desktop                jdk.httpserver
java.instrument             jdk.internal.vm.ci
java.logging                jdk.management
java.management             jdk.management.agent
java.management.rmi         jdk.naming.rmi
java.naming                 jdk.net
java.prefs                  jdk.sctp
java.rmi                    jdk.unsupported
```

# Platform ClassLoader

Extension ClassLoader 在 JDK9 后改为 Platform Classloader, 加载 lib/ext 下的文件

get Platform ClassLoader

```java
ClassLoader platformClassLoader = ClassLoader.getPlatformClassLoader();
```

Platform Classloader 加载的 lib

```txt
java.activation*            jdk.accessibility
java.compiler*              jdk.charsets
java.corba*                 jdk.crypto.cryptoki
java.scripting              jdk.crypto.ec
java.se                     jdk.dynalink
java.se.ee                  jdk.incubator.httpclient
java.security.jgss          jdk.internal.vm.compiler*
java.smartcardio            jdk.jsobject
java.sql                    jdk.localedata
java.sql.rowset             jdk.naming.dns
java.transaction*           jdk.scripting.nashorn
java.xml.bind*              jdk.security.auth
java.xml.crypto             jdk.security.jgss
java.xml.ws*                jdk.xml.dom
java.xml.ws.annotation*     jdk.zipfs
```

# System ClassLoader

System ClassLoader 加载 third-part lib 和当前项目中的 .java 代码xiangxiang

get system ClassLoader

```java
ClassLoader systemClassLoader = ClassLoader.getSystemClassLoader();
```

System ClassLoader 加载的 lib

```txt
jdk.aot                     jdk.jdeps
jdk.attach                  jdk.jdi
jdk.compiler                jdk.jdwp.agent
jdk.editpad                 jdk.jlink
jdk.hotspot.agent           jdk.jshell
jdk.internal.ed             jdk.jstatd
jdk.internal.jvmstat        jdk.pack
jdk.internal.le             jdk.policytool
jdk.internal.opt            jdk.rmic
jdk.jartool                 jdk.scripting.nashorn.shell
jdk.javadoc                 jdk.xml.bind*
jdk.jcmd                    jdk.xml.ws*
jdk.jconsole
```

# Custom ClassLoader

Custom ClassLoader 可以隔离其他 ClassLoader, 自定义 Class Loading Method, 扩展 Class Loading Source, 对 source code 进行 encode

```java
ClassLoader classLoader1 = MyClassLoader.class.getClassLoader();
```

```java
public class MyClassLoader extends ClassLoader {
    @Override
    protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
        if (name.startsWith("com.harvey")) {
            // ...
        }

        return super.loadClass(name, resolve);
    }

}
```

SystemClassLoader 不会重复加载同名的 Class，例如，已经加载了一个 com.harvey.plugin.Plugin 后，即使你手动指定 SystemClassLoader.loadClass("com.harvey.plugin.Plugin") 也不会重新加载 com.harvey.plugin.Plugin。

在插件系统中，升级插件，经常需要重新加载相同名字的插件，例如，我们自定的 PluginClassLoader 的扫描范围内，同时有 plugin-v1.jar 和 plugin-v2.jar，其中 plugin-v2.jar 就是新加入插件，他们的类名都是 com.harvey.plugin.Plugin，想要升级插件，就需要丢弃旧的 PluginClassLoader，创建新的 PluginClassLoader 指向 plugin-v2.jar。
 
```java
public class PluginDemo {
    public static void load(String jarPath, String className) throws Exception {
        loader = new URLClassLoader(new URL[]{ new URL("file:" + jarPath) }, Plugin.class.getClassLoader());
        Class<?> clazz = loader.loadClass(className);
        plugin = (Plugin) clazz.getDeclaredConstructor().newInstance();
        plugin.start();
    }

    // 升级插件（核心）
    public static void upgrade(String newJar, String className) throws Exception {
        // 1. 停止旧插件
        plugin.stop();
        // 2. 关闭旧 ClassLoader（释放 jar 句柄）
        loader.close();
        // 3. 断开引用（关键！）
        plugin = null;
        loader = null;
        // 4. 提示 GC（可选）
        System.gc();
        Thread.sleep(200);
        // 5. 加载新版本
        load(newJar, className);
    }
    
    public static void main(String[] args) throws Exception {
        String className = "demo.plugin.GreetingPlugin";
        // 1. 加载 v1
        load("plugin-v1.jar", className);
        run("Alice");
        // 2. 升级到 v2
        upgrade("plugin-v2.jar", className);
        run("Bob");
    }
}
```

# Parent Delegation

Parent Delegation, 一个 ClassLoader 进行 Class Loading, 会一直向 Parent ClassLoader 递交委托, 如果 Parent ClassLoader 处理不了, 才会由 Sub ClassLoader 处理

- 由 System ClassLoader 开始, 向上到 Platform ClassLoader, 最后到 Bootstrap ClassLoader, 如果 Bootstrap ClassLoader 处理不了, 再由 Platform ClassLoader 处理 ...
- 这里的处理不了主要是在该 ClassLoader 对应处理范围内无法根据 Full Class Name 找不到 Class File
- eg: MyClass Class 会经过 System ClassLoader -> Platform ClassLoader -> Bootstrap ClassLoader -> Platform ClassLoader -> System ClassLoader, 最终由 System ClassLoader 处理
- eg: String Class 会经过 System ClassLoader -> Platform ClassLoader -> Bootstrap ClassLoader, 最终由 Bootstrap ClassLoder 处理

Parent Delegation 可以保证安全, 所有的 class 都需要交到 Bootstrap ClassLoader, 这样 core lib 就无法被破坏, 这就是 Sandbox Security Mechanism

Parent Delegation 可以避免重复加载 lib, 每个 ClassLoader 负责一部分, Parent ClassLoader 加载完, 就不会由 Sub ClassLoader 重复加载了