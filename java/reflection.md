# Reflection

Reflect 可以在程序运行时动态的获取类信息和对象信息

Reflect 的应用

- Dynamic Proxy: 因为不确定需要代理的类, 所以需要通过反射动态的获取
- RPC: RPC 框架就是动态的生成类对象, 然后调用方法的

ClassLoader 会将 class 封装成一个 Class object, 收集 class member 封装到 Class object

- 将 field 封装成 Field object 放到 Field[] fields
- 将 method 封装成 Method object 放到 Method[] methods
- 将 constructor 封装成 Constructor object 放到 Constructor[] cons

```java
package com.harvey;

public class Main {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        Animal animal = new Animal();

        System.out.println(animal.getClass()); // class com.harvey.Animal
        System.out.println(Animal.class); // class com.harvey.Animal

        // 返回 Animal 的 Class 对象
        Class cls = Class.forName("com.harvey.Animal");
        System.out.println(cls); // class com.harvey.Animal
        System.out.println(cls.getClass()); // class java.lang.Class
    }
}

class Animal {}
```

# load properties

读取 properties 配置文件, 通过反射调用方法

```properties
className=com.harvey.Animal
methodName=show
```

```java
package com.harvey;

public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        // 读取 properties 配置文件, 获取 className, methodName
        Properties properties = new Properties();
        properties.load(new FileInputStream("/Users/HarveySuen/Downloads/test.properties"));
        String className = properties.get("className").toString();
        String methodName = properties.getProperty("methodName").toString();
        // 调用方法
        Class cls = Class.forName(className);
        Object o = cls.getDeclaredConstructor().newInstance();
        Method method = cls.getMethod(methodName);
        method.invoke(o);
    }
}

class Animal {
    public void show() {}
}
```

# disable check

反射基于解释执行, 效率较低, 禁用检查, 可以提高效率

```java
package com.harvey;

public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        Class cls = Class.forName("com.harvey.Animal");
        Object o = cls.getDeclaredConstructor().newInstance();
        Method method = cls.getMethod("show");

        // 禁用访问检查
        method.setAccessible(true);

        long start = System.currentTimeMillis();
        for (int i = 0; i < 1000000000; i++) {
            method.invoke(o);
        }
        long end = System.currentTimeMillis();
        System.out.println(end - start);
    }
}

class Animal {
    public void show() {}
}
```

# dynamic loading

静态加载: 编译时加载相关的类, 如果没有, 则报错

动态加载: 运行时加载需要的类, 不需要的类不检查, 即使没有也不报错, 降低依赖性

```java
// 静态加载, 如果没有 A, 则报错
if (false) {
    new A();
}

// 动态加载, 如果运行时没有用到 A, 即使没有 A 也不报错
if (false) {
    Class cls = Class.forName("A");
}
```

# Class

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202305261121503.png)

常见的 Class 对象

- 外部类
- 内部类
- 接口
- 数组
- 枚举
- 注解
- 基本数据类型
- void

```java
// 外部类
Class<String> cls1 = String.class; 
// 接口
Class<Serializable> cls2 = Serializable.class; 
// 数组
Class<Integer[]> cls3 = Integer[].class; 
Class<float[][]> cls4 = float[][].class;
// 枚举
Class<Thread.State> cls6 = Thread.State.class; 
// 注解
Class<Deprecated> cls5 = Deprecated.class; 
// 基本数据类型
Class<Long> cls7 = long.class; 
// void
Class<Void> cls8 = void.class;
// Class 类 的 Class 对象
Class<Class> cls9 = Class.class; 
```

## Get Class Object

获取 Class 对象

```java
Class<?> aClass = Class.forName("com.harvey.A");
```

```java
Class<A> aClass = A.class;
```

```java
A a = new A();
Class<? extends A> aClass = a.getClass();
```

```java
A a = new A();
ClassLoader classLoader = a.getClass().getClassLoader();
// 通过类加载器获得 Class 对象
Class<?> aClass = classLoader.loadClass("A");   
```

获取基本类型的 Class 对象

```java
Class<Integer> integerClass = int.class;
Class<Byte> byteClass = byte.class;
Class<Short> shortClass = short.class;
Class<Long> longClass = long.class;
Class<Float> floatClass = float.class;
Class<Double> doubleClass = double.class;
Class<Character> characterClass = char.class;
Class<Boolean> booleanClass = boolean.class;

System.out.println(integerClass); // int
```

获取包装类的 Class 对象

```java
Class<Integer> type1 = Integer.TYPE;
Class<Character> type2 = Character.TYPE;

System.out.println(type1); // int
```

JVM 会对包装类自动进行装箱, 拆箱, 只会存储一个 Class 对象

```java
Class<Integer> integerClass = int.class;

Class<Integer> type = Integer.TYPE;

System.out.println(integerClass.hashCode()); // 157683534
System.out.println(type.hashCode()); // 157683534
```

## API

```java
package com.harvey;

public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        Class<A> aClass = A.class;

        String name = aClass.getName(); // com.harvey.A

        String simpleName = aClass.getSimpleName(); // A

        Package aPackage = aClass.getPackage(); // package com.harvey

        // 返回所有 public 属性
        Field[] fields = aClass.getFields();

        // 返回所有属性
        Field[] declaredFields = aClass.getDeclaredFields();

        // 返回所有 public 方法
        Method[] methods = aClass.getMethods();

        // 返回所有方法
        Method[] declaredMethods = aClass.getDeclaredMethods();

        // 返回所有 public 构造器 (不包括父类)
        Constructor<?>[] constructors = aClass.getConstructors();

        // 返回所有构造器 (不包括父类)
        Constructor<?>[] declaredConstructors = aClass.getDeclaredConstructors();

        // 返回父类的 Class 对象
        Class<? super A> superclass = aClass.getSuperclass(); // class com.harvey.AA

        // 返回接口的 Class 对象
        Class<?>[] interfaces = aClass.getInterfaces();

        // 返回注解
        Annotation[] annotations = aClass.getAnnotations();

        // 判断是否为 interface
        boolean flag1 = aClass.isInterface();

        // 判断是否为 annotation
        boolean flag1 = aClass.isAnnotation();
        
        // 判断是否为 local class
        boolean flag1 = aClass.isLocalClass();

        // 判断是否为 anno class
        boolean flag2 = aClass.isAnonymousClass()

    }
}

interface IA {}

interface IB {}

class AA {}

@Deprecated
class A extends AA implements IA, IB {
    public String name;
    public int age;
    private char sex;

    public A() {
        System.out.println("A()");
    }

    public A(String name, int age) {
        System.out.println("A(String name, int age)");
    }

    public void show() {
        System.out.println("show()");
    }
}
```

# Constructor

## access constructor

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        Class<A> aClass = A.class;
        
        // 通过 getConstructor() 获取 非 private 构造器 的 Constructor 对象
        Constructor<A> constructor1 = aClass.getConstructor();
        // 调用 A() 实例化对象
        A a1 = constructor1.newInstance();
        
        Constructor<A> constructor2 = aClass.getConstructor(String.class, int.class);
        A a2 = constructor2.newInstance("sun", 18);
    }
}

class A {
    public A() {}
    
    public A(String name, int age) {}
}
```

## access private constructor

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        // 通过 getDeclaredConstructor() 获取 private 构造器 的 Constructor 对象
        Constructor<A> constructor = aClass.getDeclaredConstructor(String.class, int.class);
        
        // 爆破处理, 禁用安全检查
        constructor.setAccessible(true);

        A a = constructor.newInstance("sun", 18);
    }
}

class A {
    private A(String name, int age) {}
}
```

## API

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        Class<A> aClass = A.class;
        Constructor<?>[] declaredConstructors = aClass.getDeclaredConstructors();

        for (Constructor<?> c : declaredConstructors) {
            // 返回构造器名
            String name = c.getName();
            // 返回访问修饰符
            // default 0, public 1, private 2, protected 4, static 8, final 16
            // public static 就是 1 + 8 = 9
            int modifiers = c.getModifiers();
            // 返回参数个数
            int parameterCount = c.getParameterCount();
            // 返回参数类型
            Class<?>[] parameterTypes = c.getParameterTypes();

            String parameterString = "";

            // 拼接参数类型
            for (Class<?> parameterType : parameterTypes) {
                parameterString += parameterType.getSimpleName() + " ";
            }

            System.out.println("构造器: " + name +
                    ", 访问修饰符: " + modifiers +
                    ", 参数个数: " + parameterCount +
                    ", 参数类型: " + parameterString);
        }
        // 构造器: com.harvey.A, 访问修饰符: 4, 参数个数: 3, 参数类型: String int char 
        // 构造器: com.harvey.A, 访问修饰符: 2, 参数个数: 2, 参数类型: String int 
        // 构造器: com.harvey.A, 访问修饰符: 1, 参数个数: 1, 参数类型: String 
        // 构造器: com.harvey.A, 访问修饰符: 0, 参数个数: 0, 参数类型: 
    }
}

class A {
    public String name;
    public int age;
    public char sex;

    A() {}

    public A(String name) {}

    private A(String name, int age) {}

    protected A(String name, int age, char sex) {}
}
```

# Field

## access Field

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        Class<A> aClass = A.class;
        A a = aClass.getDeclaredConstructor().newInstance();

        // 通过 getField() 获取 非 private 属性 的 Field 对象
        Field nameField = aClass.getField("name");

        // 设置 name 的 Field 对象
        nameField.set(a, "xue");

        // 返回 name, 返回类型默认为 Object
        String name = (String) nameField.get(a); // "xue"
    }
}

class A {
    public String name = "sun";
}
```

## access private Field

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        Class<A> aClass = A.class;
        A a = aClass.getDeclaredConstructor().newInstance();

        // 通过 getDeclaredField() 获取 private 属性 的 Field 对象
        Field nameField = aClass.getDeclaredField("name");

        // 爆破处理, 禁用安全检查
        nameField.setAccessible(true);

        nameField.set(a, "xue");

        // 返回类型默认为 Object
        String name = (String) nameField.get(a); // "xue"
    }
}

class A {
    private String name = "sun";
}
```

## API

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        Class<A> aClass = A.class;
        Field[] declaredFields = aClass.getDeclaredFields();

        for (Field f : declaredFields) {
            // 返回属性名
            String name = f.getName();
            // 返回属性类型
            Class<?> type = f.getType();
            // 返回访问修饰符
            int modifiers = f.getModifiers();

            System.out.println("属性名: " + name +
                    ", 属性类型: " + type +
                    ", 访问修饰符: " + modifiers);
        }
        // 属性名: name, 属性类型: class java.lang.String, 访问修饰符: 1
        // 属性名: age, 属性类型: int, 访问修饰符: 4
        // 属性名: sex, 属性类型: char, 访问修饰符: 2
        // 属性名: desc, 属性类型: class java.lang.String, 访问修饰符: 9
        // 属性名: PI, 属性类型: double, 访问修饰符: 25
    }
}

class A {
    public String name;
    protected int age;
    private char sex;
    public static String desc = "";
    public static final double PI = 3.1415;
}
```

# Method

## access Method

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        Class<A> aClass = A.class;
        A a = aClass.getDeclaredConstructor().newInstance();

        // 通过 getMethod() 获取 非 private 方法 的 Method 对象
        Method m1 = aClass.getMethod("m1");
        // 调用 m1()
        m1.invoke(a); // "m1()"

        Method m2 = aClass.getMethod("m2");
        m2.invoke(a, "sun"); // "m2()"
        
        Method m3 = aClass.getMethod("m3");
        // 返回类型默认为 Object
        String str = (String) m3.invoke(a, "sun");
    }
}

class A {
    public void m1() {
        System.out.println("m1()");
    }

    public void m2(String name) {
        System.out.println("m2()");
    }

    public String m3() {
        return "";
    }
}
```

## access private Method

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        Class<A> aClass = A.class;
        A a = aClass.getDeclaredConstructor().newInstance();

        // 通过 getDeclareMethod() 获取 private 方法 的 Method 对象
        Method m = aClass.getDeclaredMethod("m");

        // 爆破处理, 禁用安全检查
        m.setAccessible(true);
        
        m.invoke(a); // "m()"
    }
}

class A {
    private void m() {
        System.out.println("m()");
    }
}
```

## API

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        Class<A> aClass = A.class;
        Method[] declaredMethods = aClass.getDeclaredMethods();

        for (Method m : declaredMethods) {
            // 返回方法名
            String name = m.getName();
            // 返回访问修饰符
            int modifiers = m.getModifiers();
            // 返回返回类型
            Class<?> returnType = m.getReturnType();
            // 返回参数个数
            int parameterCount = m.getParameterCount();
            // 返回参数类型
            Class<?>[] parameterTypes = m.getParameterTypes();

            String parameterString = "";

            // 拼接参数类型
            for (Class<?> parameterType : parameterTypes) {
                parameterString += parameterType.getSimpleName() + " ";
            }

            System.out.println("方法名: " + name +
                    ", 返回类型: " + returnType +
                    ", 访问修饰符: " + modifiers +
                    ", 参数个数: " + parameterCount +
                    ", 参数类型: " + parameterString);
        }
        // 方法名: m1, 返回类型: void, 访问修饰符: 1, 参数个数: 0, 参数类型: 
        // 方法名: m2, 返回类型: int, 访问修饰符: 1, 参数个数: 1, 参数类型: String 
        // 方法名: m3, 返回类型: class java.lang.String, 访问修饰符: 1, 参数个数: 2, 参数类型: String int 
        // 方法名: m4, 返回类型: class com.harvey.A, 访问修饰符: 1, 参数个数: 1, 参数类型: A 
    }
}

class A {
    public void m1() {}

    public int m2(String name) {
        return 0;
    }

    public String m3(String name, int age) {
        return "";
    }

    public A m4(A a) {
        return new A();
    }
}
```

## Bridge Method

Java 泛型在编译期间会进行类型擦除（type erasure），将泛型类型替换为其原始类型（通常是 Object）。为了解决类型擦除后在运行时仍然能够调用正确的方法，Java 编译器会生成一些桥接方法。这些桥接方法的作用是桥接泛型方法和其实际实现之间的差异。

假设有如下泛型类和子类：

```java
class Parent<T> {
    public T doSomething(T arg) {
        return arg;
    }
}

class Child extends Parent<String> {
    @Override
    public String doSomething(String arg) {
        return arg;
    }
}
```

在编译期间，Child 类的 doSomething 方法实际上会被编译成两个方法：

- public String doSomething(String arg) - 子类实际实现的方法
- public Object doSomething(Object arg) - 桥接方法，用于调用子类的实际方法

桥接方法的作用是保证在类型擦除后仍然能够调用正确的泛型方法。

可以通过 Method 的 isBridge() 来判断是否为桥接方法。

```java
private void addUniqueMethods(Map<String, Method> uniqueMethods, Method[] methods) {
    for (Method currentMethod : methods) {
        // 过滤掉桥接方法
        if (!currentMethod.isBridge()) {
            // 取得签名
            String signature = getSignature(currentMethod);
            // 检查方法是否已经存在
            if (!uniqueMethods.containsKey(signature)) {
                if (canAccessPrivateMethods()) {
                    try {
                        currentMethod.setAccessible(true);
                    } catch (Exception e) {
                        // 忽略异常
                    }
                }
                // 将方法添加到 uniqueMethods 映射中
                uniqueMethods.put(signature, currentMethod);
            }
        }
    }
}
```

# Exercise

## create file

```java
Class<?> aClass = Class.forName("java.io.File");
Constructor<?> fileCon = aClass.getDeclaredConstructor(String.class);
File file = (File) fileCon.newInstance("/Users/HarveySuen/Downloads/test.txt");
if (!file.exists()) {
    file.createNewFile();
}
```