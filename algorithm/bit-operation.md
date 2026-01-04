### Midpoint Calculation

经常需要计算两个整数之间的中点，以下是使用右移运算符计算中点的示例：

```java
int l = 10;
int r = 15;
int m = (l + r) >>> 1;
```

使用无符号右移运算符 >>>，它在计算过程中避免了可能的溢出问题。

### Determining Even Numbers

判断一个整数是否为偶数的常用方法是使用按位与运算符。以下是示例：

```java
int x = 10;
int res = x & 1 = 0

int x = 11
int res = x & 1 = 1
```

### Determining Bit Value

可以通过按位与来判断一个数在某一位上是否为 1，以下是示例：

```java
int num = 12; // 00001100
int bit = 4; // 00000100

if ((num & bit) == 0) {
    // num 的第 4 位不是 1
} else {
    // num 的第 4 位是 1
}
```

### Swapping Two Variables

可以使用异或运算符来交换两个整数的值，而无需借助第三个变量。以下是示例：

```java
a ^= b;
b ^= a;
a ^= b;
```

这种方法的原理是利用异或运算的性质：一个数异或两次同一个数，结果还是原来的数。经过这三步操作后，a 和 b 的值将被交换。

### Absolute Value Calculation

在不使用标准库函数的情况下，可以通过位运算快速计算整数的绝对值。以下是一些示例：

```java
int x = 10;
int res = x >> 31; // 结果为 0，因为 10 是正数

int x = -10;
int res = x >> 31; // 结果为 -1，因为 -10 是负数
```

通过 `x >> 31` 可以获得 `x` 的符号位，正数为 0，负数为 -1。

计算 `x` 的绝对值：

```java
int x = -10;
int res = (x ^ (x >> 31)) - (x >> 31); // 结果为 10
```

这里利用了异或运算和减法来实现绝对值计算。`x ^ (x >> 31)` 将负数的符号位翻转，`- (x >> 31)` 用于调整结果。

### Round Up to the Next Power of 2

可以通过位操作快速计算大于或等于给定整数的最小 2 的幂：

```java
// 对于整数 3，结果为 4；对于整数 8，结果为 8；对于整数 14，结果为 16；对于整数 29，结果为 32
int x = 29;
x -= 1;
x |= x >> 1;
x |= x >> 2;
x |= x >> 4;
x |= x >> 8;
x |= x >> 16;
x += 1; // 结果为 32
```

这种方法通过不断将数字的位向右移并进行或运算，最终得到大于或等于原数字的最小 2 的幂。

另一种方法是利用数学函数：

```java
int x = 29;
x = 1 << (int) (Math.log10(x - 1) / Math.log10(2)) + 1; // 结果为 32
```

这段代码通过对数运算计算出所需的幂次。

### Modular Index Calculation

在哈希表中，经常需要通过模运算来确定索引位置。以下是一个示例：

```java
int res = hash[idx & (hash.length - 1)];
```

这里使用按位与运算符 `&` 来实现快速的模运算，前提是 `hash.length` 是 2 的幂。这样可以有效提高计算效率。

### Lowest Set Bit Calculation

在某些情况下，我们需要找出整数中最低位的 1。可以通过使用按位运算来实现这一点。以下是一个示例：

```java
int a = 12; // 二进制表示为 1100
int diffBit = a & (-a); // 结果为 4，二进制表示为 0100
```

```
 12 原码 00001100
 12 补码 00001100
 
-12 原码 10001100
-12 补码 11110100

12 & (-12) = 00001100 & 11110100 = 00000100

  00001100
& 11110100
= 00000100

最终即可找出 12 的最低位的 1 在第 3 位
```

下面这个写法也是同样的道理，对 a 按位取反，再 +1：

```java
int diffBit = a & (~a + 1);
```

### Single Number

[Problem Description](https://leetcode.cn/problems/single-number/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=43&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public int singleNumber(int[] nums) {
    int res = 0;
      
    // XOR all the numbers in the array.
    // This will effectively cancel out the numbers that appear twice
    for (int num : nums) {
        res ^= num;
    }
    
    return res;
}
```

### Single Number III

[Problem Description](https://leetcode.cn/problems/single-number-iii/)

```java
public int[] singleNumber(int[] nums) {
    // Step 1: Perform XOR of all numbers to get xor = a ^ b
    int xor = 0;
    for (int num : nums) {
        xor ^= num;
    }
    
    // Step 2: Find a bit that is different between a and b
    // This gets the rightmost 1-bit (a bit where a and b differ)
    int diffBit = xor & (-xor);
    
    // Step 3: Divide numbers into two groups and find the unique numbers
    int[] result = new int[2];
    for (int num : nums) {
        if ((num & diffBit) == 0) {
            result[0] ^= num; // Group 1
        } else {
            result[1] ^= num; // Group 2
        }
    }
    
    return result;
}
```

### Counting Bits

[Problem Description](https://leetcode.cn/problems/counting-bits/description/)

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=50&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int[] countBits(int n) {
    int[] result = new int[n + 1];
    for (int i = 0; i <= n; i++) {
        result[i] = countOnes(i);
    }
    return result;
}

public static int countOnes(int num) {
    int count = 0;
    while (num != 0) {
        num = num & (num - 1);
        count++;
    }
    return count;
}
```

### Counting Bits

[Explain p338 (06:37)](https://www.bilibili.com/video/BV1eg411w7gn?p=50&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int[] countBits(int n) {
    int[] result = new int[n + 1];
    result[0] = 0;
    for (int i = 1; i <= n; i++) {
        result[i] = (i & 1) == 0 ? result[i >> 1] : result[i - 1] + 1;
    }
    return result;
}
```

### Hamming Distance

[Problem Description](https://leetcode.cn/problems/hamming-distance/description/)

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=51&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public int hammingDistance(int x, int y) {
    return countOnes(x ^ y);
}

public static int countOnes(int num) {
    int count = 0;
    while (num != 0) {
        num = num & (num - 1);
        count++;
    }
    return count;
}
```

