# Annotation

注解: 嵌入在代码中的补充信息, 不影响程序逻辑, 但可以被编译运行, 可以修饰包, 类, 方法

编译器会进行语法的校验, 判断是否符合注解限定

注解本质上是一个类, 编译类型是 @interface, 不是 interface

# @Override

@Override: 表示方法是重写的父类方法

```java
class Animal {
    public void show() {}
}

class Cat extends Animal {
    @Override
    public void show() {}
}
```

@Override 源码

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface Override {
    ...
}
```

- @Target(ElementType.METHOD) 表示 @Override 可以修饰方法

# @Deprecated

@Deprecated: 表示元素已经过时, 用于新旧版本的兼容过渡, 可以修饰构造器, 字段, 局部变量, 方法, 包, 模块, 参数, 数据类型

```java
@Deprecated
class A {
    @Deprecated
    public String name;

    @Deprecated
    public void show() {}
}
``

@Deprecated 源码

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(value={CONSTRUCTOR, FIELD, LOCAL_VARIABLE, METHOD, PACKAGE, MODULE, PARAMETER, TYPE})
public @interface Deprecated {
    ...
}
```

# @SuppressWarnings

@SuppressWarnings: 用于抑制警告信息, 可以修饰数据类型, 字段, 方法, 构造器, 局部变量, 模块

```java
@SuppressWarnings({"uncheckd"}) // 抑制 unchecked 警告
public class Main {
    public static void main(String[] args) {
        @SuppressWarnings({"rawtypes"}) // 抑制 rawtypes 警告
        List list = new ArrayList();
        list.add("jack");
        list.add("tom");

        @SuppressWarnings({"unused"}) // 抑制 unused 警告
        int num = 10;
    }

    @SuppressWarnings({"rawtypes", "unchecked", "unused"}) // 抑制 rawtypes, unchecked, unused 警告
    public static void show1() {{}}
    
    @SuppressWarnings({"all"}) // 抑制所有的警告
    public static void show2() {}
}
```

@SuppressWarnings 源码

```java
@Target({TYPE, FIELD, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE, MODULE})
@Retention(RetentionPolicy.SOURCE)
public @interface SuppressWarnings {
    ...
}
```

常见的 @SuppressWarnings

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170911365.png)

# Meta Annotation

元注解: 注解的注解, Meta Annotation 修饰 Annotation, 让 Annotation 具有某种含义

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(value={CONSTRUCTOR, FIELD, LOCAL_VARIABLE, METHOD, PACKAGE, PARAMETER, TYPE})
public @interface Deprecated {
    ...
}
```

@Doucument 表示 Annotation 在生成 javadoc 文档 时, 会保留 Annotation, 使得被标注的注解出现在 javadoc 中

@Rentention 表示 Annotation 的作用范围

- RetentionPolicy.SOURCE 作用于 source file, 在编译时被编译器舍弃
- RetentionPolicy.CLASS (def) 作用于 class file, 这个级别表示被标注的注解会保留到类文件中, 但在运行时不会被 JVM 认识
- RetentionPolicy.RUNTIME 作用于 runtime, 会保留到运行时, 可以通过反射机制读取, 一般用于需要在运行时解析和使用的注解

@Target 表示 Annotation 可以修饰的内容

@Inherited 表示 Annotation 修饰的类被继承时, 子类自动继承 Annotation