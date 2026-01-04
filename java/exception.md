# Exception

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202305261120518.png)

异常: 程序执行中发生的不正常情况

- 错误 (Error): 程序会崩溃
- 异常 (Exception): 程序不会崩溃, 可以使用针对性代码进行处理
    - 编译时异常: 编译时, 发生的异常, 可以通过 try-catch, throws 捕获异常, 通过编译
    - 运行时异常: 运行时, 发生的异常

# Compile Exception

SQLException SQL 操作异常

IOException IO 文件异常

ClassNotFoundException 类找不到异常

FileNotFoundException 文件找不到异常

EOFException 文件操作异常

IllegalArgumentException 参数异常

# Runtime Exception

NullPointException 空指针异常

```java
System.out.println(null.name);
```

ArithmeticException 数学运算异常

```java
System.out.println(10 / 0);
```

ArrayIndexOutOfBoundsException

```java
int[] arr = new int[5];
System.out.println(arr[5]);
```

ClassCastException 类型转换异常

```java
A a = new B();
B b = (C) a;
```

NumberFormatException 数字格式异常

```java
int num = Integer.parseInt("sun")
```

# try catch finally

try 包裹可能出现异常的代码

catch 捕获异常, 处理异常

finally 最终处理, 不管有没有捕获异常, 都会执行

如果 try 中某处发生异常, 则后续代码就不会执行了, 直接进入 catch 处理异常

如果没有发生异常, 就不会进入 catch

```java
try {
    int num = 10 / 0;
    int length = null.length
} catch (NullPointerException e) {
    // JVM 将异常封装成一个对象, e 为异常对象
    system.out.println(e); // java.lang.arithmeticexception: / by zero
    system.out.println(e.getMessage()); // / by zero
} catch (ArithmeticException e) {
    System.out.println(e.getMessage());
} catch (Exception e) { 
    // 父类异常写在后面, 防止捕获了子类异常
    e.printStackTrace();
} finally {
    System.out.println("final handle");
}

System.out.println("Program continue running");
```

catch 执行到 return 前, 进入 finally

finally 如果没有 return, 会返回到 catch 中, 返回临时变量

```java
// catch 中 ++i, 保存临时变量 i = 1
// finally 中 ++i, 返回 2
public static int m1() {
    int i = 0;
    try {
        i = 1 / 0;
        return ++i;
    } catch (Exception e) {
        return ++i;
    } finally {
        return ++i;
    }
}

// catch 中 ++i, 保存临时变量 i = 1
// finally 中 ++i, 得到 i = 2, 没有 return, 返回到 catch 中, 返回临时变量 1
public static int m2() {
    int i = 0;
    try {
        i = 1 / 0;
        return ++i;
    } catch (Exception e) {
        return ++i;
    } finally {
        ++i;
    }
}
```

# throws

如果不确定如何处理异常, 可以通过 throws 抛出异常, 交给方法的调用者来处理

方法的调用者也可以抛出异常, JVM 是最顶级的的方法处理者, 直接输出异常信息

如果程序即没有 try catch finally, 也没有 throws, 则方法默认有一个 throws

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202305261120519.png)

```java
public class Main {
    public static void main(String[] args) {
        try {
            test01();
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    public static void test01() throws Exception {
        test02();
    }

    public static void test02() throws ArithmeticException, NullPointerException {
        int num = 10 / 0;
        String name = null;
        int length = name.length();
    }
}
```

子类重写父类方法时, 也需要抛出异常

```java
class A {
    public void test01() throws ArithmeticException {}

    public void test02() throws Exception {}
}

class AA extends A {
    // 子类方法抛出的异常, 可以是父类方法抛出的异常
    @Override
    public void test01() throws ArithmeticException {};

    // 子类方法抛出的异常, 可以是父类方法抛出的异常的子类
    @Override
    public void test02() throws NullPointerException {};
}
```

catch 执行到 throw 前, 进入 finally

finally 如果没有 return, 在回到 catch 中执行 throw

```java
public static void main(String[] args) throws Exception {
    try {
        A();
    } catch (Exception e) {
        System.out.println(e.getMessage());
    }
    // A try
    // A finally
    // Runtime Exception
}

public static void A() {
    try {
        System.out.println("A try");
        throw new RuntimeException("Runtime Exception");
    } finally {
        System.out.println("A finally");
    }
}
```

# Custom Exception

```java
public class Main {
    public static void main(String[] args) throws NameException {
        test01();
        test02();
    }
    
    public static void test01() {
        int age = -1;
        if (age < 0 || age > 150) {
            // throw 创建异常对象
            throw new AgeException("age error");
        }
    }
    
    public static void test02() throws NameException {
        String name = "";
        if (name.equals("")) {
            throw new NameException("name error");
        }
    }
}

// 继承 Exception 就是编译异常
class NameException extends Exception {
    public NameException(String message) {
        super(message);
    }
}

// 继承 RuntimeException 就是运行时异常 (推荐)
class AgeException extends RuntimeException {
    public AgeException(String message) {
        super(message);
    }
}
```