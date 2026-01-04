# Count Prime

```java
public static int getPrimeCount(int n) {
    int count = 0;
    for (int i = 2; i < n; i++) {
        count += isPrime(n) ? 1 : 0;
    }
    return count;
}

public static boolean isPrime(int num) {
    for (int i = 2; i * i < num; i++) {
        if (num % i == 0) {
            return false;
        }
    }
    return true;
}
```

# Count Prime

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=71&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int getPrimeCount(int n) {
    int count = 0;
    boolean[] isPrime = new boolean[n];
    Arrays.fill(isPrime, true);
    for (int i = 2; i < n; i++) {
        if (!isPrime[i]) {
            continue;
        }
        count++;
        for (int j = i * i; j < n; j += i) {
            isPrime[j] = false;
        }
    }
    return count;
}
```

# My Sqrt

[Problem Description](https://leetcode.cn/problems/sqrtx/description/)

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=74&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * Example: 
 * Given x = 8, the binary search first focuses on range [1, 8].
 * 
 * 1. With l = 1, r = 8, m = (1 + 8) >>> 1 = 4. As m <= x/m, res becomes 4 and l becomes m+1 = 5.
 * 
 * 2. Now with l = 5, r = 8, m = (5 + 8) >>> 1 = 6. As m > x/m, r becomes m - 1 = 5.
 * 
 * 3. Then with l = 5, r = 5, m = (5 + 5) >>> 1 = 5. As m > x/m, r becomes m - 1 = 4. Now r is less than l, ending the loop.
 */
public static int mySqrt(int x) {
    int l = 1;
    int r = x;
    int res = 0;
    
    while (l <= r) {
        int m = (l + r) >>> 1;
        if (m <= x / m) {
            res = m;
            l = m + 1;
        } else  {
            r = m - 1;
        }
    }
    
    return res;
}
```

# My Sqrt

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=75&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int mySqrt(int x) {
    if (x == 0) {
        return 0;
    }
    double res = x;
    while (Math.abs(res * res - x) > 0.1) {
        res = (res + x / res) / 2;
    }
    return (int) res;
}
```

# Maximum Product of Three Numbers

[Problem Description](https://leetcode.cn/problems/maximum-product-of-three-numbers/description/)

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=76&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maximumProduct(int[] nums) {
    Arrays.sort(nums);
    int len = nums.length;
    return Math.max(
        nums[0] * nums[1] * nums[len - 1],
        nums[len - 1] * nums[len - 2] * nums[len - 3]
    );
}
```

# Maximum Product of Three Numbers

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=76&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maximumProduct(int[] nums) {
    int min1 = Integer.MAX_VALUE, min2 = Integer.MAX_VALUE;
    int max1 = Integer.MIN_VALUE, max2 = Integer.MIN_VALUE, max3 = Integer.MIN_VALUE;
    
    for (int num : nums) {
        if (num < min1) {
            min2 = min1;
            min1 = num;
        } else if (num < min2) {
            min2 = num;
        }
        
        if (num > max1) {
            max3 = max2;
            max2 = max1;
            max1 = num;
        } else if (num > max2) {
            max3 = max2;
            max2 = num;
        } else if (num > max3) {
            max3 = num;
        }
    }
    
    return Math.max(min1 * min2 * max1, max1 * max2 * max3);
}
```

# Majority Element

[Problem Description](https://leetcode.cn/problems/majority-element/description/?envType=study-plan-v2&envId=top-interview-150)

最经典的解法是使用 摩尔投票法，它能以 O(n) 的时间复杂度和 O(1) 的空间复杂度解决问题。

摩尔投票法的核心思路：

- 使用一个计数器 count 和一个候选元素 candidate。
- 遍历数组：
  - 如果计数器为 0，则将当前元素设为候选元素。
  - 如果当前元素等于候选元素，计数器加 1。
  - 如果当前元素不等于候选元素，计数器减 1。
- 遍历结束后，候选元素就是多数元素。

```java
public static int majorityElement(int[] nums) {
    int candidate = nums[0];
    int count = 0;
    for (int num : nums) {
        if (count == 0) {
            candidate = num;
        }
        if (num == candidate) {
            count++;
        } else {
            count--;
        } 
    }
    return candidate;
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411191633804.png)
