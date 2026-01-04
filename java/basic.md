# Insturction

```shell
# Disassemble one or more class files and list them.
#   -v  Print additional information
#   -c  Disassemble the code
#   -s  Print internal type signatures
#   -l  Print line number and local variable tables
#   -p  Show all classes and members
javap Main.class
```

# Encoding

## Source Code, Inverse Code, Complement Code

正数的 原码, 反码, 补码 相同

负数的 原码, 反码, 补码 都不相同

负数的 反码 = 原码符号位不变, 其余全部取反, 补码 = 反码 + 1

```
原码 10110110
反码 11001001
补码 11001010
```

负数的 补码 = 原码的第一个 1 和 最后一个 1 不变, 中间的部分全部取反

```
原码 10110110
补码 11001010
```

# Data Type

基本数据类型: byte, short, int, long, float, double, boolean

引用数据类型: Class, Interface

## float, double

浮点数 = 符号位 + 指数位 + 尾数位

float 4 B, double 8 B

```java
float f = 12.34; // error; 12.34 默认为 double, 占 8 B, 无法存入 4 B 的 variate
float f = 12.34f; // 12.34f 为 float, 可以存入
float f = 12.34F; // f 和 F 都可以
double d = 12.34f;; // 12.34f 占 4 B, 可以存入 8 B 的 variate
```

小数点

```java
double d = .123; // 0.123
```

科学计数

```java
double d = 3.14e2; // 3.14 * 10^2^
double d = 3.14e-2; // 3.14 * 10^-2^
```

浮点数的相等判断

```java
double d1 = 2.7
double d2 = 8.1 / 3; // 2.6999999999999997

if (d1 == d2) { // false
    System.out.println("hello world");
}

if (Math.abs(d1 - d2) < 0.000001) { // true
    System.out.println("hello world");
}
```

## char

```java
char c = 'a';
System.out.println(c); // 'a'

char c = 97;
System.out.println(c); // 'a'

char c = 'a';
System.out.println((int)c); // 97
```

## boolean

Java 中, 非 0 和 0 无法表示 true 和 false

```java
boolean b = true;

boolean b = false;

boolean b = 0; // error
```

## Auto Convert

精度小的数据 自动转换为 精度大的数据

- char -> int -> long -> float -> double
- byte -> short -> int -> long -> float -> double

```java
byte b = 10;
int i = b; // byte -> int

int i = 'a'; // char -> int
System.out.println(i); // 97

double d = 10; // int -> double
System.out.println(d); // 10.0
```

精度大的数据 赋值给 精度小的数据 会报错

```java
int i = 10 + 1.1f; // error

int i = 10;
byte b = i; // error
```

多种数据类型混合运算时, 整体的数据类型会自动转成精度大的数据类型

```java
int n = 10;
int i = 10 + 1.1f; // error
float f = n + 1.1f; // int + float -> float
double d = n + 1.1; // int + double -> double
```

byte, short 无法和 char 自动转换

```java
byte b = 10;
short s = 10;

char c = b; // error; byte 无法自动转成 char
char c = s; // error; short 无法自动转成 char
```

byte, short, char 运算时, 整体的数据会自动转成 int

```java
byte b1 = 10;
byte b2 = 20;
byte b3 = b1 + 10; // error; byte + int -> int
byte b4 = b1 + b2; // error; byte + byte -> int

short s1 = 1;
short s2 = b1 + s1; // error; byte + short -> int
int i = b1 + s1; // byte + short -> int
```

boolean 不会自动转换

```java
boolean b = true;
int i = b; // error
```

## Force Convert

精度大的数据 赋值给 精度小的数据 时, 需要强制类型转换

```java
int c = 97;
char i = (char) c; // int -> char
```

强制类型转换, 可能造成 精度损失, 数据溢出

```java
int i = (int) 1.9; // 1; 精度损失

byte b = (byte) 2000; // -48; 数据溢出
```

强制类型转换的操作范围

```java
int i = (int) 1.0 * 2 + 3.0 * 4; // (int) 只对 1.0 * 2 生效, 整个表达式还是 double 型

int i = (int) (1.0 * 2 + 3.0 * 4); // (int) 对整个表达式生效
```

# Arithmetic Operation

n = a % b 中, 若 a 为 小数, 则 n = a - (int) a / b * b

## String Operation

```java
System.out.println(10 + "sun"); // 10sun; 字符串拼接运算
System.out.println(10 + 20 + "sun"); // 30sun; // 10 和 20 先进行算数运算
System.out.println("sun" + 10 + 20); // sun1020; // 字符串拼接运算
```

## Character Operation

```java
System.out.println('a' + 10); // 107
```

## Three-wish operator

表达式 必须为 可以赋值给 变量 的数据类型

```java
int i = 2 > 1 ? 1.2 : 3.4; // error

int i = 2 > 1 ? (int) 1.2 : (int) 3.4;
```

## Logical Operation

短路与 && 左边为 0, 右边就不算了

短路或 || 左边为 1, 右边就不算了

逻辑取反 !: 优先级第一, 1 -> 0, 0 -> 1

```
~10011001 -> 01100110

10011001
--------
01100110
```

逻辑与 &: 优先级第二, 有 0 为 0

```
10011001 ∧ 10110101 -> 10010001
10011001 & 10110101 -> 10010001

10011001
10110101
--------
10010001
```

逻辑或 |: 优先级第四, 有 1 为 1

```
10011001 ∨ 10110101 -> 10111101
10011001 | 10110101 -> 10111101

10011001
10110101
--------
10111101
```

逻辑异或 ^: 优先级第三, 相同为 0, 不同为 1

```
10011001 ^ 10110101 -> 00101100

10011001
10110101
--------
00101100
```

## Bit Operation

算数右移 >> n: 二进制位向右移动, 低位溢出, 高位用符号补充

- 比如: 10000001 右移 为 11000000

算数左移 << n: 二进制位向左移动, 低位补 0, 高位溢出, 结果 * 2^n^

- 比如: 10000001 左移 为 100000010, 8 为 取整后为 00000010

```java
int n = 3 << 1; // 6; 3 * 2^1  

int n = 3 << 2; // 12; 3 * 2^2
```

无符号右移 >>> n: 低位溢出, 高位补 0

- 比如: 10000001 右移 为 01000000

# Input, Output

## Scanner

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        String name = scanner.next(); // "sun"

        int age = scanner.nextInt(); // 18

        double sal = scanner.nextDouble(); // 3000.0

        System.out.println("name = " + name + ", age = " + age + ", sal = " + sal); // name = "sun", age = 18, sal = 3000.0
    }
}
```

# Switch

switch (i) 中的 i 可以是 byte, short, int, char, enum, String, 不可以是 float, double

case 后的必须是常量, 不可以是变量

```java
switch (i) {
    case 1:
        System.out.println("a");
        break;
    case 2:
        System.out.println("b");
        break;
    case 3:
        System.out.println("c");
        break;
    default:
        System.out.println("d");
        break;
}
```

简化书写

```java
switch (i) {
    case 1 -> System.out.println("a");
    case 2 -> System.out.println("b");
    case 3 -> System.out.println("c");
    default -> System.out.println("d");
}
```

# Array

数组的默认值

- int: 0
- short: 0
- byte: 0
- long: 0
- float: 0.0
- double: 0.0
- char: `\u0000`
- boolean: false
- String: null

## One Dimensional Array

数组的定义

```java
int[] arr = {3, 1, 4, 5, 9, 2, 6};

int arr[] = new int[5];

int[] arr = new int[5];

int[] arr; // 声明数组
arr = new int[5]; // 分配空间

String[] arr = {'a', 'b', 'c'}; // error; char 无法转成 String

int[] arr = new int {1, 2, 3, 4}; // error

int[] arr = new int[5] {1, 2, 3, 4}; // error

int[] arr = new int[] {1, 2, 3, 4};
```

数组的遍历输入, 遍历输出

```java
Scanner scanner = new Scanner(System.in);
int[] arr = new int[5];

// Input
for (int i = 0; i < arr.length; i++) {
    arr[i] = scanner.nextInt();
}

// Output
for (int i = 0; i < arr.length; i++) {
    System.out.println(arr[i]);
}
```

## Two Dimensional Array

数组的定义

```java
int[][] arr = {{1, 2, 3, 4}, {2, 3, 4, 5}, {3, 4, 5, 6}};

int[][] arr = new int[3][4];

int[] arr[] = new int[3][4];

int arr[][] = new int[3][4];

int[][] arr; // 声明数组
arr = new int[3][4]; // 分配空间

int[][] arr = {{1, 2}, 3}; // error; {1, 2} 是 int[], 3 是 int, 存储在 int[][] 中的数据应该是 int[] 而不是 int
```

数组的遍历输入, 遍历输出

```java
Scanner scanner = new Scanner(System.in);
int[][] arr = new int[3][4];

// Input
for (int i = 0; i < arr.length; i++) {
    for (int j = 0; j < arr[i].length; j++) {
        arr[i][j] = scanner.nextInt();
    }
}

// Output
for (int i = 0; i < arr.length; i++) {  
    for (int j = 0; j < arr[i].length; j++) {  
        System.out.print(arr[i][j]);  
    }  
}
```

二维数组 和 一维数组 的关系

```java
int[] arr1 = new int[4];
int[][] arr2 = new int[3][4];

arr1 = arr2; // error
arr2 = arr1; // error
arr2[0] = arr1;
arr2[0][0] = arr1[0];
```

## Array Copy

值拷贝

```java
int[] arr1 = {10, 20, 30};

int[] arr2 = new int[arr1.length];

for (int i = 0; i < arr1.length; i++) {
    arr2[i] = arr1[i];
}
```

引用拷贝

```java
int[] arr1 = {10, 20, 30};

int[] arr2 = arr1;

arr1[0] = 20;

System.out.println(arr2[0]); // 20
```

## Array Expansion

```java
int[] arr1 = {10, 20, 30, 40, 50, 60};

int[] arr2 = new int[arr1.length + 10];

for (int i = 0; i < arr1.length; i++) {
    arr2[i] = arr1[i];
}

arr1 = arr2;
```

# Exercise

## Array Copy, Array Expansion

arr 中有 {1, 3, 4, 5, 6}, 按顺序插入 2

```java
int[] arr = {1, 3, 4, 5, 6};
int[] arrNew = new int[arr.length + 1];
int insertNum = 2;
int insertIndex = -1;

// 找到要插入的索引
for (int i = 0; i < arr.length; i++) {
    if (arr[i] > insertNum) {
        insertIndex = i;
        break;
    }
}

// 数组值拷贝, i 是 arrNew 的 Index, j 是 arr 的 Index
for (int i = 0, j = 0; i < arrNew.length; i++, j++) {
    if (i == insertIndex) {
        arrNew[i] = insertNum;
        i++;
    }
    arrNew[i] = arr[j];
}

// 数组引用拷贝
arr = arrNew;

for (int i = 0; i < arr.length; i++) {
    System.out.print(arr[i]);
}
```

