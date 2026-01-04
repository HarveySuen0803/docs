# Detail

实现 Serializable, 则可以串化, 在网络上传输

实现 Comparable, 则具有比较能力

# Object

## equals()

```java
Object obj1 = new Object();
Object obj2 = new Object();
Object obj3 = obj1;

// 判断引用是否相等
System.out.println(obj1.equals(obj3)); // true
System.out.println(obj1.equals(obj2)); // false
```

## hashCode()

返回对象的 hash 值, 提高具有 hash 结构 的容器的效率

hash 值 主要由地址决定, 但不等价于地址

- 对象相同, hash 值 一般相同
- 对象不同, hash 值 一般不同

```java
Object obj1 = new Object();
Object obj2 = new Object();
Object obj3 = obj1;
System.out.println(obj1.hashCode()); // 925858445
System.out.println(obj2.hashCode()); // 798154996
System.out.println(obj3.hashCode()); // 925858445
```

重写 equlas(), hashCode(), 返回指定 hashCode

```java
public class Main {
    public static void main(String[] args) throws Exception {
        Person p1 = new Person("sun", 18);
        Person p2 = new Person("sun", 18);
        System.out.println(p1.hashCode()); // 3542791
        System.out.println(p2.hashCode()); // 3542791
        System.out.println(p1 == p2); // false
    }
}

class Person {
    public String name;
    public int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // 判断对象是否相等
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }

    // 根据 name, age 返回 hashCode
    @Override
    public int hashCode() {
        // name 和 age 相同, 就返回相同的 hashCode
        return Objects.hash(name, age);
    }
}
```

## toString()

```java
Object obj1 = new Object();

// 返回 "全类名 @ hash 值 的十六进制表示"
System.out.println(obj1.toString()); // "java.lang.Object@372f7a8d"
System.out.printf("%x\n", obj1.hashCode()); // "372f7a8d"
```

## finalize()

对象没有引用指向时, jvm 自动调用 finalize(), 回收资源

通过 System.gc() 可以主动触发垃圾回收机制

# PrintStream

## printf()

```java
int i = 123;
System.out.printf("%d\n", 123); // 123
System.out.printf("%o\n", 123); // 173
System.out.printf("%x\n", 123); // 7b

double d = 12.34;
System.out.printf("%f", d); // 12.340000

String s = "sun";
System.out.printf("%s", s); // "sun"
```

# String

String 不可变字符序列, 被 final 修饰, 继承 Object

String 对象的数值存储在 `private final char value[]` 中, 无法修改 value 的指向, 修改字符串的值, 就是让引用指向一个新的 String 对象

```java
// s1 和 s2 指向 String Constant Pool 中的 "sun"
String s1 = "sun";
String s2 = "sun";

// s3 和 s4 指向 String Object, String Object 的 char value[] 指向 String Constant Pool 中的 "sun"
String s3 = new String("sun");
String s4 = new String("sun");

System.out.println(s1 == s2); // true
System.out.println(s1 == s3); // false
System.out.println(s1 == s4); // false
System.out.println(s3 == s4); // false

// s1.intern(), s2.intern(), s3.intern() 和 s4.intern() 都指向 String Constant Pool 中的 "sun"
System.out.println(s1.intern() == s3.intern()); // true
System.out.println(s3.intern() == s4.intern()); // true
```

## charAt()

```java
String str = "abcdef";

char c1 = str.charAt(0); // 'a'
char c2 = str.charAt(1); // 'b'
```

## intern()

```java
String s = new String("sun");

// 访问常量池中的 "sun"
System.out.println(s.intern()); // "sun"
```

## equals()

```java
String s1 = new String("sun");
String s2 = new String("sun");

// 判断字符串内容是否相同
System.out.println(s1.equals(s2)); // true
```

## valueOf()

```java
// 数值 转 String
String s = String.valueOf(100); 
```

## indexOf()

```java
// 返回 "@" 首次出现的索引
int index1 = "@abc@abc".indexOf("@"); // 0

// 返回 "abc" 首次出现的索引
int index2 = "@abc@abc".indexOf("abc"); // 1
```

## lastIndexOf

```java
// 返回 "@" 最后出现的索引
int index1 = "@abc@abc".indexOf("@"); // 4

// 返回 "abc" 最后出现的索引
int index2 = "@abc@abc".indexOf("abc"); // 5
```

## substring()

```java
// 截取 [2, n)
String s1 = "hello".substring(2); // "llo"

// 截取 [2, 3)
String s2 = "hello".substring(2, 4); // "ll"
```

## replace()

```java
// 替换 "aa" 为 "AA"
String newStr = "a b aa bb aa bb".replace("aa","AA"); // "a b AA bb AA bb"
```

## trim()

```java
// 清除字符串前后所有空格, 不包括字符串中间的空格
String str = " abc def ".trim(); // "abc def"
```

## split()

```java
// 根据 " " 切割字符串, 转成数组
String[] strs = "abc def hij".split(" "); // {"abc", "def", "hij"}

// 如果有特殊符号, 需要转义字符
String[] strs = "E:\\aaa\\bbb".split("\\\\"); // {"E:", "aaa", "bbb"}
```

## toCharArray()

```java
// String 转 Char[]
char[] ch = "abc".toCharArray(); // {'a', 'b', 'c'}
```

## compareTo()

```java
// 比较 "abcd" 和 "abdd" 大小
int i = "abcd".compareTo("abdd"); // 1; d - c = 1

// 前几个都相同, 就是 "sunnnnn".length() - "sun".length()
int i = "sun".compareTo("sunnnnn"); // -4 
```

## format()

```java
String name = "sun";
int age = 18;
double score = 34.567;
char sex = '男';
String formatStr = "姓名: %s, 年龄: %d, 成绩: %.2f, 性别: %c";

// 类似于 printf()
String info = String.format(formatStr, name, age, score, sex); 
```

# StringBuffer

StringBuffer 可变字符序列, 被 final 修饰, 继承 AbstractStringBuilder

StringBuffer 对象的数据存储 父类 AbstractStringBuilder 的 char[] value 中, 修改字符串的值, 就是修改 value 的指向, 相比 String, 效率更高

String 转 StringBuffer

```java
String string = new String("sun");

StringBuffer stringBuffer = new StringBuffer(string);
```

```java
String string = new String("sun");

StringBuffer stringBuffer = new StringBuffer();

stringBuffer.append(string);
```

StringBuffer 转 String

```java
StringBuffer stringBuffer = new StringBuffer("sun");

String string = new String(stringBuffer);
```

```java
StringBuffer stringBuffer = new StringBuffer("sun");

String string = new String();

string = stringBuffer.toString();
```

## append()

```java
StringBuffer sb = new StringBuffer("aa");

sb.append("bb"); // aabb

sb.append("cc").append("dd").append("ee"); // aabbccddee
```

追加 null, 则是追加 "null"

```java
String str = null;
StringBuffer sb = new StringBuffer();
sb.append(str);
System.out.println(sb.length()); // 4
System.out.println(sb); // "null"
```

append() 源码

```java
public synchronized StringBuffer append(String str) { 
    toStringCache = null;
    // 调用父类的 append()
    super.append(str); 
    // 返回的是 this, 所以可以采用链式编程
    return this; 
}
```

## delete()

```java
StringBuffer sb = new StringBuffer("hello");

// 删除 [2, 4)
sb.delete(2, 4); // "heo"
```

## replace()

```java
StringBuffer sb = new StringBuffer("hello");

// 将 [2, 4) 替换为 "AAA"
sb.replace(2, 4, "AAA"); // heAAAo
```

## indexOf()

```java
StringBuffer sb = new StringBuffer("abcdef");

// 返回首次出现 "bc" 的索引
System.out.println(sb.indexOf("bc")); // 1
```

## insert()

```java
StringBuffer sb = new StringBuffer("abcdef");

// 在 索引 1 处, 插入 "AAA"
System.out.println(sb.insert(1, "AAA")); // aAAAbcdef
```

# StringBuilder

StringBuilder 可变字符序列, 被 final 修饰, 继承 AbstractStringBuilder

StringBuilder 对象的数据存储父类的 char[] value 中, 修改字符串的值, 就是修改 value 的指向, 相比 String, 效率更高

StringBuilder 线程不安全, 方法没有做互斥, 没有添加 synchronize 关键字

StringBuilder, StringBuffer

- 单线程操作, StringBuilder 更快
- 多线程操作, StringBuilder 不行

Stirng, StringBuffer, StringBuilder 处理速度测试

```java
long startTime;
long endTime;

// String
String s = "";
startTime = System.currentTimeMillis();
for (int i = 0; i < 100000; i++) {
  s += i;
}
endTime = System.currentTimeMillis();
System.out.println("String: "+ (endTime - startTime));

// StringBuffer
StringBuffer s2 = new StringBuffer("");
startTime = System.currentTimeMillis();
for (int i = 0; i < 100000; i++) { 
  s2.append(String.valueOf(i));
}
endTime = System.currentTimeMillis();
System.out.println("StringBuffer: "+ (endTime - startTime));

// StringBuilder
StringBuilder s3 = new StringBuilder("");
startTime = System.currentTimeMillis();
for (int i = 0; i < 100000; i++) {
  s3.append(String.valueOf(i));
}
endTime = System.currentTimeMillis();
System.out.println("StringBuilder:" + (endTime - startTime));
```

# Math

## abs()

```java
System.out.println(Math.abs(- 1.1)); // 1.1
```

## pow()

```java
// 2 的 3 次方
int i = Math.pow(2, 3); // 8
```

## ceil()

向上取整, 转成 double

```java
double ceil = Math.ceil(3.3); // 4.0
```

## floor()

向下取整, 转成 double

```java
double floor = Math.floor(2.9); // 2.0
```

## round()

四舍五入, 转成 int

```java
double round1 = Math.round(2,4); // 2
double round2 = Math.round(2.5); // 3
```

## sqrt()

平方根, 转成 double

```java
double d1 = Math.round(9); // 3.0
```

## random()

返回一个 [0, 1) 的随机数

```java
double random = Math.random();
```

返回 [2, 7] 的随机整数

```java
// 返回 [0, 5) 的随机小数
double d = Math.random() * (7 - 2);

// 返回 [0, 6) 的随机小数
double d = Math.random() * (7 - 2 + 1);

// 返回 [0, 5] 的随机整数
int i = (int) (Math.random() * (7 - 2 + 1))

// 返回 [2, 7] 的随机整数
int i = (int) (Math.random() * (7 - 2 + 1) + 2)
```

# Arrays

## toString()

```java
int[] arr = {3, 1, 4, 1, 5};

// Array 转 String
String str = Arrays.toString(arr); // "[3, 1, 4, 1, 5]"
```

## sort()

自然排序, 处理基本数据类型

```java
int[] arr = {3, 1, 4, 1, 5};
Arrays.sort(arr); // {1, 1, 3, 4, 5}
```

定制排序, 处理引用数据类型

```java
Integer[] arr = {3, 1, 4, 1, 5};

Arrays.sort(arr, new Comparator() {
    @Override
    public int compare(Object o1, Object o2) {
        Integer i1 = (Integer) o1;
        Integer i2 = (Integer) o2;
        return i1 - i2;
    }
}); // {1, 1, 3, 4, 5}
```

自定义定制排序

```java
public class Main {
    public static void main(String[] args) {
        Integer[] arr = {3, 1, 4, 1, 5};

        CustomSort.bubbleSort(arr, new Comparator() {
            @Override
            public int compare(Object o1, Object o2) {
                Integer i1 = (Integer) o1;
                Integer i2 = (Integer) o2;
                return i1 - i2;
            }
        }); // {1, 1, 3, 4, 5}
    }

}

class CustomSort {
    public static void bubbleSort(Integer[] arr, Comparator c) {
        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = 0; j < arr.length - 1 - i; j++) {
                if (c.compare(arr[j], arr[j + 1]) > 0) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}
```

## binarySearch()

二分查找

```java
Integer[] arr = {1, 3, 5, 6, 8, 10, 11};

int index = Arrays.binarySearch(arr, 5); // 2

int index = Arrays.binarySearch(arr, 0); // -1; 找不到返回 -1
```

## copyOf()

数组拷贝, 底层使用的是 System.arraycopy

```java
int[] arr = {1, 2, 3, 4, 5};

int[] newArr = Arrays.copyOf(arr, arr.length + 2); // {1, 2, 3, 4, 5, 0, 0}
```

## equals()

数组内容比较

```java
int[] arr1 = {1, 2, 3, 4, 5};
int[] arr2 = {1, 2, 3, 4, 5};

System.out.println(Arrays.equals(arr1,arr2)); // true
```

## asList()

Array 转 List

```java
List<Integer> list1 = Arrays.asList(2, 3, 4, 5, 6, 1); // [2, 3, 4, 5, 6, 1]

// 数组必须是包装类
Integer[] arr = {-2, 1, 5, 2, 7, 5};

List<Integer> list2 = Arrays.asList(arr); // [-2, 1, 5, 2, 7, 5]
```

# System

## exit()

```java
// 0 表示 正常状态, 以正常状态退出程序
System.exit(0);
```

## arraycopy()

```java
int[] arr = {1,2,3};
int[] newArr = new int[3];

// 数组拷贝
System.arraycopy(arr, 0, newArr, 0, 3);
```

System.arraycopy 的源码

```java
/*
    src 源数组
    srcPos 源数组的开始索引
    dest 目标数组 
    destPos 目标数组的开始索引
    length 拷贝长度 
 */
public static native void arraycopy(Object src, int srcPos, Object dest, int destPos, int length);
```

## currentTimeMillis()

获取当前的时间戳

```java
StringBuffer str = new StringBuffer("");

long startTime = System.currentTimeMillis(); 

for (int i = 0; i < 100000; i++) {
    str.append("a");
}

long endTime = System.currentTimeMillis();

System.out.println(endTime - startTime);
```

# BigData

BigInteger 大数据整形, BigDecimal 大数据浮点型

```java
BigInteger bi = new BigInteger("99999999999999999999999999");

BigDecimal bd = new BigDecimal("111.111111111111111111111");
```

BigInteger, BigDecimal 的对象, 需要通过方法进行加减乘除

```java
BigInteger bigInteger1 = new BigInteger("99999999999999999999999");

BigInteger bigInteger2 = new BigInteger("88888888888888888888888");

bigInteger1.add(bigInteger2)

bigInteger1.subtract(bigInteger2);

bigInteger1.multiply(bigInteger2);

bigInteger1.divide(bigInteger2);
```

# Date

Date 第一代日期类

```java
Date date = new Date();

System.out.println(date); // Tue Jul 06 15:11:46 CST 2021
```

规范时间格式

```java
Date date = new Date();

SimpleDateFormat sdf = new SimpleDateFormat("yyyy.MM.dd HH:mm:ss");

System.out.println(sdf.format(date)); // "2021.07.06 15:14:05"
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170912259.png)

String 转 Date

```java
String str = "2008.08.08 08:08:08";

// 格式需要相同功能
SimpleDateFormat sdf = new SimpleDateFormat("yyyy.MM.dd. HH:mm:ss");

// String 转 Date, 抛出 ParseException 异常
Date date = sdf.parse(str); 

System.out.println(date); // Fri Aug 08 08:08:08 CST 2008

System.out.println(sdf.format(date)); // 2008.08.08 08:08:08
```

# Calender

Calender 第二代日期类

```java
Calendar cal = Calendar.getInstance();

System.out.println("year " + cal.get(Calendar.YEAR));

// month 从 0 开始, 需要 + 1
System.out.println("month " + c.get(Calendar.MONTH) + 1);

System.out.println("day " + c.get(Calendar.DAY_OF_MONTH));

// Calendar.HOUR 12h mechanism
// Calendar.HOUR_OF_DAY 24h mechanism
System.out.println("hour " + c.get(Calendar.HOUR));
System.out.println("minute " + c.get(Calendar.MINUTE));
System.out.println("second " + c.get(Calendar.SECOND));
```

# LocalDateTime

LocalDateTime 第三代日期类

```java
LocalDateTime ldt = LocalDateTime.now();

// LocalDate 表示 日期
LocalDate ld = LocalDate.now(); 

// LocalTime 表示 时间
LocalTime lt = LocalTime.now(); 
```

```java
System.out.println("year " + ldt.getYear());

// 返回月的英文
System.out.println("month " + ldt.getMonth());

// 返回月的数字, 从 1 开始
System.out.println("month " + ldt.getMonthValue());

System.out.println("day " + ldt.getDayOfMonth());

System.out.println("hour " + ldt.getHour());

System.out.println("minute " + ldt.getMinute());

System.out.println("second " + ldt.getSecond());
```

规范时间格式

```java
LocalDateTime ldf = LocalDateTime.now();

DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm:ss");

System.out.println(dtf.format(ldt)); // 2021.07.06 15:48:35
```

## from

```java
LocalDateTime now = LocalDateTime.now();
LocalDateTime dateTime = LocalDateTime.from(now);
```

## of()

```java
LocalDateTime dateTime = LocalDateTime.of(date, LocalTime.MAX)
```

# Instant

Instant 时间戳

```java
Instant instant = Instant.now();

System.out.println(instant); // 2021-07-06T07:58:15.93
```

Instant 转 Date

```java
Date date = Date.from(Instant.now);
```

Date 转 Instant

```java
Instant instant = date.toInstant(new Date());
```

# Exercise

## format num

input: "1234567.89"

output: "1,234,567.89"

```java
Scanner scanner = new Scanner(System.in);
StringBuffer num = new StringBuffer(scanner.next());
int index = num.indexOf(".");
if (index == -1) {
    index = num.length();
}
while (true) {
    if ((index -= 3) <= 0) {
        break;
    }
    num.insert(index, ",");
}
System.out.println(num);
```

## reverse num

input: "abcdef"

output: "aedcbf"

```java
public static void main(String[] args) throws Exception {
    try {
        String str = reverse("abcdef", 1, 4);
        System.out.println(str);
    } catch (Exception e) {
        e.printStackTrace();
    }
}

public static String reverse(String str, int start, int end) {
    if (!(str != null && start >= 0 && end >= 0 && end > start && end < str.length())) {
        throw new RuntimeException("param error");
    }
    char[] ch = str.toCharArray();
    for (int i = start, j = end; i < j; i++, j--) {
        char t = ch[i];
        ch[i] = ch[j];
        ch[j] = t;
    }
    return new String(ch);
}
```
