# C 的概述

C 最初是为了开发 unix 操作系统

C 发展: BCPL 语言 -> B 语言 -> C 语言

C 的单位
    最小单位: 语句
    基本单位: 函数

C 是一个结构化, 模块化的程序语言

C 的基本结构: 顺序, 选择, 循环

C 可以直接访问程序的模块地址, 便于程序模块化

C 可以直接访问物理地址, 进行位操作

C 可以直接对硬件操作

C 的文件: 一个 .h 头文件, 多个 .c 源文件

C 的 关键字 (保留字) 都是小写
    ![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220943317.png)

C 的标识符: 变量名, 函数名, 数据类型

C 的语句: 条件语句, 循环语句, 顺序语句

C 的预处理命令: `#`, `#include`, `#define`, `#undef`, `#if`, `#ifedf`, `#elif`, `#endif`
    既可以在函数内部使用, 也可以在外部使用
    不是关键字
    编译预处理不是 C 语言的一部分, 不占用运行时间

C 的命名规则: 字母, 数字, 下划线, 数字不能在最前面

C 组成
    数据成分 
    运算成分 (比如: 算数运算, 逻辑运算, 条件运算)
    控制成分 (比如: if, else if, else, while)
    传输成分 (比如: printf, scanf)

printf, scanf 不是关键字, 是预定义标识符, 可以定义 printf 的变量, 但是定义完, 就不可以再调用了

集成开发环境 (IDE)

C 的 可执行程序 是由一系列 机器指令 构成的

C 的 源程序 不能直接运行, 需要 编译 + 链接

C 的 源程序 以 ASCII 的形式存放在文本文件中

C 的 源程序 由 多个 源文件 构成

C 的 源程序 必须包含 一个 main(), 源文件 未必包含 main()

C 本身没有输入输出功能, 需要通过函数来完成

# 模块化

通过 函数 实现模块化, 函数就是模块

结构化程序的目的: 提高可读性

结构化程序的特点: 自顶向下, 由粗到细, 逐步求精, 限制 goto

模块的独立性高: 高内聚, 低耦合

# 数据类型

unsigned int 无符号整型, 只有 正整数, 看见 负号, 小数 就打错

float 4B 单精度浮点型

double 8B 双精度浮点型

C 没有处理 true, false 的数据类型, 即没有 bool 类型

long 类型的数据, 末尾 L

unsigned int 类型的数据, 末尾 u

```c
long n = 123L

unsigned int n = 123u
```

运算中只要出现 double 型数据, 整个运算提升为 double 型, 包括字符也会变为 double 型

```c
printf("%lu", sizeof(1.2 + 3)); // 8; 1.2 默认为 double, 3 默认为 int, double + int = double
```

将一个 double 型数据赋给一个整形, 结果取整

```c
int n = 1.2 + 3; // 4
```

# 定点数, 浮点数

定点数: 小数点是固定的

浮点数: 小数点是浮动的

定点数 不一定是 整数, 浮点数 不一定是 小数

定点数, 浮点数 的存储, 没有小数点这个概念

浮点数的计算量 > 定点数的计算量

浮点数的运算速度 < 定点数的运算速度

浮点数的表示范围 > 定点数的表示范围

浮点数的精度 > 定点数的精度

浮点数 = 阶码 + 尾数
    阶码 是 整数
    尾数 是 小数点后的数, 尾数越长, 精度越高

# 实数形式

实数 就是 小数

小数: 必须有小数点, 小数点前后必须有数

```c
int n = 12.3;

int n = 12.;

int n = .3;

int n = .; // error
```

科学计数: e 或 E, 都可以, e 前, e 后 必须有数, e 后 必为整数

```c
float f = 3.2e5; // 3.2 * 10^5

float f = 3.2e; // error

float f = e5; // error

float f = e5.1; // error

float f = 3.2e 2; // error; 有一些题目会空出一个空格

printf("%e", 123.456); // 1.234560e+002; 科学计数法 1.23456 * 10^2
```

# 转义字符

转移字符 必须使用 '', 字符串 必须使用 ""
    `'\007'` 是 转义字符
    `"\007"` 是 字符串

常见转义字符
    `\n` 换行
    `\f` 换页
    `\b` 退格
    `\t` 水平制表
    `\v` 垂直制表
    `\0` 空字符 NULL
    `\ddd` 八进制
    `\xhh` 十六进制

`\123\x32\x7G\x2d\1234\08\007\07\0`
    `\123` 八进制 123
    `\x32` 十六进制 x32
    `\x7` 十六进制 x7
    `G` 字母 G
    `\x2d` 十六进制 x2d
    `\123` 八进制 123
    `4` 数字 4
    `\0` 空字符, 字符串结束符号
    `8` 数字 8
    `\007` 八进制 7
    `\07` 八进制 7

```c
char c = '\101'; // 转义字符 八进制数
printf("%c", c); // 'A'
```

# sizeof(), strlen()

```c
sizeof("123"); // 4; 包括 "\0"

strlen("123"); // 3; 实际字符串长度
```

# 强制类型转换

```c
int n = (int) 1.3; // 1

int n = (int) -1.3; // -1
```

# 运算

运算的优先级: 逻辑非 > 算数运算 > 关系运算 > 逻辑与 > 逻辑或 > 条件运算 > 赋值运算

运算符的优先级: 加减乘除运算符 > 位运算符 > 比较运算符 > 判断等运算符 > 赋值表达式 > 逗号表达式

单目运算符: 1 个操作数

双目运算符: 2 个操作数

三目运算符: 3 个操作数

单目运算符的运算对象可以是 int, char, float

表达式 没有 ";", 判断表达式是否正确时, 第一步先将有 ";" 的全部排除

```c
n = 3 // 表达式

a = 3 != 4 // 表达式
```

语句 有 ";", 判断语句是否正确时, 第一步先将没有 ";" 的全部排除
    所有的 表达式 加 ";" 都可以变成 语句

```c
n = 3; // 语句

a = 3 != 4;
```

% 左右两边必须是整形

```c
1.2%3 // error; % 前后 必须为整数
```

= 左边必须是变量

```c
a = (b + 4) = 3; // error; (b + 4) = 3 中, = 的左边 不是变量

a = (b = 4) + 3;

a = (b = c = d);
```

浮点运算

```c
double d = 20 / 3; // 6.0

double d = 20.0 / 3; // 6.666667

double d = 20 / 3.0; // 6.666667

sin(1 / 2) // error

sin(1.0 / 2)

sin(0.5)
```

# 位运算

二进制的三种基本逻辑运算: 逻辑加, 逻辑乘, 逻辑取反
    逻辑运算都不会溢出

<< n, 二进制位向左移动 n 位, 结果 * 2^n

```c
int n = 3 << 1; // 6; 3 * 2^1

int n = 3 << 2; // 12; 3 * 2^2
```

按位取反 (逻辑取反): 优先级第一, 1 -> 0, 0 -> 1

```txt
~10011001 -> 01100110

10011001
--------
01100110
```

按位与 (逻辑乘): 优先级第二, 有 0 为 0

```txt
10011001 ∧ 10110101 -> 10010001
10011001 & 10110101 -> 10010001

10011001
10110101
--------
10010001
```

按位或 (逻辑加): 优先级第四, 有 1 为 1

```txt
10011001 ∨ 10110101 -> 10111101
10011001 | 10110101 -> 10111101

10011001
10110101
--------
10111101
```

按位异或 (逻辑异或): 优先级第三, 相同为 0, 不同为 1

```txt
10011001 ^ 10110101 -> 00101100

10011001
10110101
--------
00101100
```

# 关系运算

0 为 false, 非 0 为 true

# 逻辑运算

逻辑与 && 左边为 0, 右边就不算了

逻辑或 || 左边为 1, 右边就不算了

# 进制

十六进制的 0x123 的 x 只能小写

```c
prinft("%d", 123);

prinft("%o", 0123);

prinft("%x", 0x123);

prinft("%d", 17); // 17

prinft("%o", 17); // 21; 不是 021

prinft("%x", 17); // 11; 不是 0x11
```

# 逗号表达式

表达式 1, 表达式 2, 表达式 3; 从左到右依次执行表达式, 结果 = 表达式 3

1 * 1, 2 * 2, 3 * 3 结果 = 9

i = i * 2, j++, 2 * 3 结果 = 6

```c
int i = 1;
int j = 2;
int k = 3;

int n = (i++, j--, k++); // 4
```

# 注释

注释 不是 C 的组成部分, 不占用运行时间, 不可以嵌套

# continue, break

continue 对 for, while

break 对 for, while, switch

# printf()

```c
int n = 123;
printf("%4d", n); // <space>123; 保留 4 位有效数, 右对齐, 左边补空格
printf("%-4d", n); // 123<space>; 保留 4 位有效数, 左对齐, 右边补空格
printf("%2d", n); // 123; 超出了 2 位, 就全部显示

long n = 123;
long long n = 123;
prinf("%ld", n);

float num = 1.0 / 3;
printf("%f", num); // 0.333333; %f 单精度浮点型, 默认保留 7 位有效数, 6 位小数

double num = 1.0 / 3;
printf("%lf", num); // 0.333333; %lf 双精度浮点型, 默认保留 16 位有效数, 6 位小数

float num = 123.4;
printf("%8.2f", num); // <space><space>123.40; 保留 7 位有效数, 2 位小数, 左边不全补空格, 右边不全补 0

float num = 123.456;
printf("%8.2f", num); // <space><space>123.46; 保留 7 位有效数, 2 位小数, 左边不全补空格, 右边超出五舍四入

// printf('%8.1f', num); // <space><space><space>123.4
// printf('%3.1f', num); // 123.4; 超出了 3 位, 就全部显示

// float num = 123.45;
// printf("%5.1", num); // 123.4; 很奇怪, 记住

// float num = 123.456;
// printf("%5.1", num); // 123.5; 很奇怪, 记住

float num = 123.4;
printf("%-8.2f", num); // 123.4<space>; 左对齐

float num = 10.0 / 3;
printf("%.f", num); // 3; 只保留整数部分
```

# scanf()

```c
scanf("%d %d %d", &num1, &num2, &num3); // 按照中间 " " 分割的方式赋值

scanf("%d,%d,%d", &num1, &num2, &num3); // 按照中间 "," 分割的方式赋值

scanf("%c%c%c", &ch1, &ch2, &ch3); // 输入时不要在中间加任何空格或其他字符, 因为他会将其也认作是要赋值的字符

char c;
scanf("%c", c); // 1; 输入的是 字符 1, 不是 数字 1
printf("%c", c); // '1'

char c[5] = {};
scanf("%d", &c[0]); // 输入某个元素需要 &

char c[5] = {};
scanf("%s", c); // 输入字符串不需要 &

scanf("%s", c); // hello world
prinf("%s", c); // hello; 以空格为字符串输入结束的标志

int n = 0;
char c = 0;
scanf("%d%c", &n, &c); // 123<space>h
printf("n = %d, c = %c\n", n, c); // n = 132, c = 空格

int n = 0;
char c = 0;
scanf("%d %c", &n, &c); // 123<space>h
printf("n = %d, c = %c\n", n, c); // n = 132, c = h; 

char c1 = 0;
char c2 = 0;
scanf("%c%c", &c1, &c2); // 12<return>
printf("c1 = %c, c2 = %c", c1, c2); // c1 = 1, c2 = 2

int n1 = 0;
int n2 = 0;
scanf("%2d%d", &n1, &n2); // 123456
printf("n1 = %d, n2 = %d", n1, n2); // n1 = 12, n2 = 3456

scanf("%2d%d", &n1, &n2); // 1 23456
printf("n1 = %d, n2 = %d", n1, n2); // n1 = 1, n2 = 23456

float a, b, c;
scanf("%f%f%f", &a, &b, &c); // 10<return>20<tab>30<return>
scanf("%f%f%f", &a, &b, &c); // 10 20<return>30
scanf("%f%f%f", &a, &b, &c); // 10<return>20 30
scanf("%f%f%f", &a, &b, &c); // 10,20,30; error
```

# putchar()

```c
char c = 'A';
putchar(c); // 'A'

putchar('\101'); // 'A'

putchar(65); // 'A'
```

# getchar()

```c
char c1 = 0;
char c2 = 0;
c1 = getchar(); // ab
c2 = getchar();
printf("c1 = %c, c2 = %c", c1, c2); // c1 = a, c2 = b

char c1 = 0;
char c2 = 0;
c1 = getchar(); // a空格b
c2 = getchar();
printf("c1 = %c, c2 = %c", c1, c2); // c1 = a, c2 = 空格

char c1 = 0;
char c2 = 0;
c1 = getchar(); // 12回车
c2 = getchar();
printf("c1 = %c, c2 = %c", c1, c2); // c1 = 1, c2 = 2

char c1 = 0;
char c2 = 0;
char c3 = 0;
char c4 = 0;
scanf("%c%c", &c1, &c2); // abcd
c3 = getchar();
c4 = getchar();
printf("c1 = %c, c2 = %c, c3 = %c, c4 = %c", c1, c2, c3, c4); // c1 = a, c2 = b, c3 = c, c4 = d

char c1 = 0;
char c2 = 0;
char c3 = 0;
char c4 = 0;
scanf("%c%c", &c1, &c2); // ab回车cd
c3 = getchar();
c4 = getchar();
printf("c1 = %c, c2 = %c, c3 = %c, c4 = %c", c1, c2, c3, c4); // c1 = a, c2 = b, c3 = 回车, c4 = c
    /*
        c1 = a, c2 = b, c3 =
        , c4 = c%
    */
```

# puts()

字符串输出

```c
puts("hello world"); // 功能和 prinf("%s", "hello world"); 一致
```

# gets()

字符串输入

```c
char s[5];

gets(s); // 功能和 scanf("%s", s) 一致
```

# if()

单分支 if

双分支 if, else

多分支 if, else if, if

else 和 最近的 if 配对

if 的 {} 内 可以包含任意条 C 语句

if 的 () 内 可以包含任意数值类型, 任意表达式

if 不加 {} 只跟一条语句, 看见分号才结束

```c
int a = 0;
int b = 0;
int c = 0;

if (1)
    a = 10, b = a, c = b;
    printf("%d, %d, %d", a, b, c);

if (1)
    printf("a"), printf("b"), printf("c"); // abc; 没有见到分号, 一直是一条语句

if (0)
    printf("d"); printf("e"); printf("g"); // eg; 看见分号, 规为下一条语句
```

# switch()

switch 的 () 内, 必须是 整型, 字符型, 不可以是小数

case 后, 必须是 整型, 字符型, 不可以是小数, 变量

case 后, 没有 {}

switch 的 () 后 没有 ";", 看见 ";" 就打错

case 后 必须是 ":", 不是 ":" 就打错

没有 break, 一直向下执行

continue 对 switch 无效, 只对外层的 for, while 有效

default 可有可无, 位置随意

# while()

do {} while(); 的 ";", 不能丢

do {} while(); 至少执行一次

```c
while (getchar() != '\n') // 不输入 回车 就一直循环

while(i--); // while 内为空语句
```

# for()

```c
for(;;) // 无限循环

for (;1;) // 无限循环

for (;i = 1;) // 无限循环

for (;i = 0;) // 不循环
```

# Array

int n[5] 就是开辟了 5 个 整型的空间, 5 * 4 B

数组可以是任意数据类型

数组名是用户定义的数组标识符

数组的 [] 里的整数, 就是数组的长度

二维数组本质上还是数组

一维数组的初始化

```c
int arr[] = {};

int arr[] = {0, 0, 0, 0, 0};

int arr[5];

int arr[2 + 3];

int arr[]; // error; 没有指定初始大小

int n = 5;
int arr[n]; // error; 不可以是变量

#define n 5
int arr[n]; // 通过 define 定义的是常量, 不是变量
```

二维数组的初始化

```c
int arr[3][5];

int arr[][5] = {{1, 2, 3}, {0, 0, 0, 0}, {0}};

int arr[][] = {{1, 2, 3}, {0, 0, 0, 0}, {0}}; // error; 列必须初始化

int arr[2][3] = {1, 2, 3, 4, 5, 6}; // 连续赋值, 自动分配

int arr[2][3] = {{1, 2}, {3, 4}, {4, 5}}; // error; 行数量错误
```

数组的存储空间

```c
int arr[5] = {1, 3, 5}; // 存储空间为 4 * 5 B

char arr[5] = "abcde"; // 存储空间为 5 B

char arr[5] = "abcdefghi"; // 存储空间为 5 B

char arr[5] = "abc"; // 存储空间为 5 B
```

# String

字符串的定义

```c
char s[] = "abc";

char s[5] = "abc";

char s[5] = {"abc"};

char s[5] = "abcde"; // error; 包括 abcde\0 共 6 个字节, 超出了 5
```

字符串结束标志 `\0`

```c
"abc" == "abc\0def"; // true

strcat("abc\0def\0ghi", "123"); // "abc123"
```

字符串的存储

```c
char s[] = "hello";
printf("%lu, %lu", strlen(s), sizeof(s)); // 5, 6; 5 个字节的长度, 6 个字节存储 (包括 `\n`)
```

字符串一定是个一维数组, 一维数组不一定是个字符串

字符数组 不仅仅可以存放字符串, 也可以存放字符

数组名是一个地址, 无法直接给数组名赋值

```c
char arr1[] = "abc";
char arr2[] = "def";

arr1 = arr2; // error
arr = "ghi"; // error
```

字符串中的 `0`, `\0`, `'0'`

```c
char s[] = "0\0abc"; // 0 是 字符 '0', \0 是结束标志
s[0] == '0'; // true
s[0] == 0; // false
s[1] == 0; // true
s[1] == '\0'; // true
s[2] == 'a'; // true
int n = strlen(s); // 1; 虽然可以访问 \0 后的元素, 但是该字符串的长度是到 \0 结束的

char s[] = "abc";
s[0] = 0;
int n = strlen(s); // 0; \0 就是 0, 0 就是 \0

char s[] = "abc";
s[0] = '\0';
int n = strlen(s); // 0;
```

二维字符串数组

```c
char s[3][10] = {"hello", "world", "!!!"}; // 3 行, 每行 10 个字节
```

# strcpy()

strcpy() 字符串赋值, 需要引入 string.h

```c
char s[3];
strcpy(s, "abc");

char s1[3] = "abc";
char s2[3] = "def";
strcpy(s1, s2); // 将 s2 的值赋给 s1
printf("%s", s1); // def

char s1[3] = "abc";
char s2[5] = "defgh";
strcpy(s1, s2); // error; s1 空间不够
```

# strcat()

strcat() 字符串连接, 需要引入 string.h

```c
char s1[10] = "abc";
char s2[3] = "def";
strcat(s1, s2);
printf("%s", s1); // "abcdef"

char s1[3] = "abc";
char s2[3] = "def";
strcat(s1, s2); // error; s1 空间不够
```

# strlen()

strlen() 获取字符串长度, 需要引入 string.h

```c
char s[10] = "abc";
int n = strlen(s); // 3

char s[10] = "abc\0abc";
int n = strlen(s); // 3
```

# strcmp()

strcmp() 字符串的 ASCII 比较, 需要 string.h

```c
int n = strcmp("abc", "abC"); // 32; "abc" > "abC"

int n = strcmp("abC", "abc"); // -32; "abC" < "abc"

int n = strcmp("abc", "abc"); // 0; "abC" = "abc"
```

# BubbleSort

```c
int arr[] = {3, 1, 4, 1, 5, 9, 2, 6};

int count = sizeof(arr) / sizeof(arr[0]);

for (int i = 0; i < count - 1; i++)
{
    for (int j = 0; j < count - 1; j++)
    {
        if (arr[j] > arr[j + 1])
        {
            int temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
        }
    }
}
```

# SelectSort

```c
int arr[] = {3, 1, 4, 1, 5, 9, 2, 6};

int count = sizeof(arr) / sizeof(arr[0]);

for (int i = 0; i < count - 1; i++)
{
    int min = arr[i];
    int minIndex = i;

    for (int j = i + 1; j < count; j++)
    {
        if (arr[j] < min)
        {
            min = arr[j];
            minIndex = j;
        }
    }
    
    if (minIndex != i)
    {
        arr[minIndex] = arr[i];
        arr[i] = min;
    }
}
```

# 函数

C 的基本单位: 函数

函数的构成: 函数头, 函数体

函数体: 声明部分, 执行部分

函数的位置是任意的, 不是固定的

函数名必须唯一, 形参在同一函数内唯一即可

函数返回类型默认为 int

C 有且仅有一个 main()

函数可以单独以文件的形式保存, 可以单独编译

C 由多个源程序构成, 其中一个源程序文件包含 main(), 其他源程序文件包含其他的函数

C 文件中不一定有 main(), C 程序中一定有 main()

函数不可以单独执行, 需要主函数

main 是关键字, 不可以当作用户标识符使用

C 函数可以嵌套调用, 不可以嵌套定义

void 不可以有 return

函数中可以有多个 return, 每次只有一个 return 被执行

值传递时, 单向, 实参和形参占用不同的存储空间, 形参的变化, 不会导致实参变化

每一类 C 标准库函数 (系统函数), 都有相应的头文件, 调用某个函数, 需要通过 `#include` 引入

用户不可以重新定义库函数

实参 是 定义时 分配的存储空间, 形参 是 调用时 分配的存储空间

函数的定义

```c
int f1() // 函数头
{
    // 函数体
}
```

函数声明

```c
int main() 
{
    int f1(int, int);
    int f1(int a, int b);
}

int f1(int a, int b) {}
```

```c
int f1(int, int); // 预处理时进行函数声明

int main()
{
    f1(10, 20);
}

int f1(int a, int b) {}
```

函数递归: 函数间接或直接的调用自己
    间接调用自己: A() 调用 B(), B() 调用 A()
    直接调用自己: A() 调用 A()

递归必须有一个明确的结束递归条件

# 局部变量

在局部范围内, 可以重复定义变量

```c
int n = 10;
{
    int n = 20;
    printf("%d", n); // 20
}
printf("%d", n); // 10
```

```c
int n1 = 10;
{
    n1 = 20;
}
printf("%d", n1); // 20
```

# 全局变量

```c
int a = 10;

void test() {
    a = 20;
}

int main()
{
    printf("%d", a); // 10
    test();
    printf("%d", a); // 20
    return 0;
}
```

# 常见表达式

判断 c 为数字符号

```c
c >= '0' && c <= '9'
```

判断 year 为闰年

```c
year % 4 == 0 && year % 100 != 0 || year % 400 == 0
```

# 常见函数

```c
int n = rand(); // 随机生成数字

int n = rand() % 5; // 随机生成 0 ~ 4 的数字

exit(0); // 退出程序

int n = sqrt(100); // 10; 平方根

int n = fabs(-10); // 10; 绝对值

double n = pow(3, 10); // 3^10

double n = exp(10); // e^10
```

# 常见错误

```c
1.3e2.0 // error; e 前, e 后 必须有数, e 后 必须为整数

1.3E2.0 // error; E 前, E 后 必须有数, e 后 必须为整数

1.2 % 3 // error; % 前后 必须为整数

(i + j) = b; // error; = 左边必须是变量, 不可以是表达式

-1 为 false // error; 0 为 true, 非 0 为 false

int a = b = 1; // error; b 没定义

int n = 3;
int arr[n]; // error; 数组内不可以是变量

int arr[][] = {"hello", "world"}; // error
```

# 包含的数据类型


```c
switch (...) // 可以包含变量

case ...: // 整形, 字符型 的常量表达式

arr[...] // 不可以是变量
```

​    


​    

