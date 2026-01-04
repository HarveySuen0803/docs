# Wrapper

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202305261119726.png)

# binning

装箱: 基本类型 -> 包装类型

```java
int i = 10;
Integer integer = i;
```

# devanning

拆箱: 包装类型 -> 基本类型

```java
Integer integer = new Integer(10);
int i = integer;
```

# Wrapper to String

```java
int i = 10;

String s = i + ""; // "10"
```

# String to Wrapper

```java
String s = "10";

Integer i = Integer.parseInt(s); // 10

Byte b = Byte.parseByte(s);

Short s = Short.parseShort(s);

Long l = Long.parseLong(s);

Float f = Float.parseFloat(s); // 10.0

Double d = Double.parseDouble(s); // 10.0

Boolean bool = Boolean.parseBoolean("true"); // true
```

# Integer

通过 `Integer i = 100;` 创建 Integer Obj, 本质上就是执行 `Integer i = Integer.valueOf(100);` 对 100 这个基本类型进行装箱

Integer 采用 FlyWeight Pattern, 通过 Interger cache[] 缓存了 -128 ~ 127 的数据, 通过 Intger.valueOf() 访问的就是这个 Cache 中的对象, 复用对象, 减少对象的创建

- Integer 处理 -128 ~ 127 的数据时, 会返回 Integer cache[] 中的值
- Integer 处理 -128 ~ 127 外的数据时, 会 new 一个新对象

```java
Integer i1 = 127;
Integer i2 = 127;
System.out.println(i1 == i2); // true

Integer i1 = 128;
Integer i2 = 128;
System.out.println(i1 == i2); // false
```
