# Binary Search

```java
public static int binarySearch(int[] arr, int val) {
    int left = 0;
    int right = arr.length - 1;

    while (left <= right) {
        int mid = (left + right) >>> 1;

        if (val > arr[mid]) {
            left = mid + 1;
        } else if (val < arr[mid]){
            right = mid - 1;
        } else {
            return mid;
        }
    }

    return -1;
}
```

# Binary Search (Recursion)

```java
public static int binarySearch(int[] arr, int left, int right, int val) {
    if (left > right) {
        return -1;
    }

    int mid = (left + right) >>> 1;

    if (val < arr[mid]) {
        return binarySearch(arr, left, mid - 1, val);
    } else if (arr[mid] < val) {
        return binarySearch(arr, mid + 1, right, val);
    } else {
        return mid;
    }
}
```

# Binary Search (Right Open Interval)

```java
public static int binarySearch(int[] arr, int val) {
    int left = 0;
    int right = arr.length; // 右开

    while (left < right) {
        int mid = (left + right) >>> 1;

        if (arr[mid] < val) {
            left = mid + 1;
        } else if (val < arr[mid]) {
            right = mid;
        } else {
            return mid;
        }
    }
    return -1;
}
```

# Binary Search (Balance)

Binary Search 的最好时间复杂度是 O(1), 最差时间复杂是 O(log(n)), 但是需要进行 if, else if, else 的判断, 一共需要判断 2 次.

Binary Search (Balance) 只有 if, else 的判断, 一共需要判断 1 次, 性能上稍微有点优势.

Binary Search (Balance) 必须要等到 loop 结束, 即最好时间复杂度和最差时间复杂度都是 O(log(n)).

```java
public static int binarySearch(int[] arr, int val) {
    int left = 0;
    int right = arr.length;

    while (left + 1 < right) {
        int mid = (left + right) >>> 1;

        if (val < arr[mid]) {
            right = mid;
        } else {
            left = mid;
        }
    }

    return arr[left] == val ? left : -1;
}
```

# Binary Search (Duplicate)

一个 Array 中有多个相同的值, 查找到所有相同数据的索引.

```java
public static LinkedList binarySearch(int[] arr, int l, int r, int val) {
    if (l > r) {
        return new LinkedList();
    }

    int m = (l + r) >>> 1;
    if (arr[m] < val) {
        return binarySearch(arr, m + 1, r, val);
    } else if (arr[m] > val) {
        return binarySearch(arr, l, m - 1, val);
    } else {
        LinkedList<Integer> deque = new LinkedList<>();
        deque.offer(m);

        // Find duplicate to the left
        l = m - 1;
        while (l > 0 && arr[l] == val) {
            deque.offerFirst(l);
            l--;
        }

        // Find duplicate to the right
        r = m + 1;
        while (r < arr.length - 1 && arr[r] == val) {
            deque.offerLast(r);
            r++;
        }

        return deque;
    }
}
```

# Binary Search (JDK)

Binary Search 如果没有找到最终的元素, low 指向的就是该元素的插入点.

JDK 的 Binary Search 如果没找着, 就会返回 -(low + 1)

```java
public static void binarySearch(int[] arr, int val) { // arr = {1, 3, 5, 6, 7}, val = 4
    // 这里没找着 4, 而 4 应该插入到 index = 2 处, 此时 low 就指向 2, 所以返回 -(2 + 1) = -3
    int i = Arrays.binarySearch(arr, 4); // -3

    if (i < 0) {
        int idx = Math.abs(i + 1); // 2
        int[] newArr = new int[arr.length + 1];
        System.arraycopy(arr, 0, newArr, 0, idx); // newArr = {1, 3, 0, 0, 0, 0}
        newArr[idx] = val; // newArr = {1, 3, 4, 0, 0, 0}
        System.arraycopy(arr, 0, newArr, idx + 1, arr.length - idx); // {1, 3, 4, 5, 6, 7}
        arr = newArr;
    }
}
```

# Binary Search (Left Right Most)

Left Most 返回 >= val 的最左边的索引, 对于 arr = {0, 1, 3, 3, 3, 5, 6}, 使用 leftmost, 搜索 3, 返回 2, 搜索 2, 返回 2, 搜索 4, 返回 5

```java
public static int binarySearch(int[] arr, int val) {
    int l = 0;
    int r = arr.length - 1;
    int m;

    while (l <= r) {
        m = (l + r) >>> 1;

        if (arr[m] >= val) {
            r = m - 1;
        } else {
            l = m + 1;
        }
    }

    return l;
}
```

Left Most 返回 <= val 的最右边的索引, 对于 arr = {0, 1, 3, 3, 3, 5, 6}, 使用 rightmost, 搜索 3, 返回 2, 搜索 2, 返回 2, 搜索 4, 返回 5

```java
public static int binarySearch(int[] arr, int val) {
    int l = 0;
    int r = arr.length - 1;
    int m;

    while (l <= r) {
        m = (l + r) >>> 1;

        if (arr[m] <= val) {
            l = m + 1;
        } else {
            r = m - 1;
        }
    }

    return l - 1;
}
```

LeftMost 和 RightMost 常用于范围查询, 对于 arr = {0, 1, 3, 3, 3, 5, 5, 6}

- 搜索 4 的 Order, 使用 leftmost(4), 返回 idx = 5
- 搜索 4 的 Pred, 使用 leftmost(4) - 1, 返回 idx = 4
- 搜索 4 的 Succ, 使用 rightmost(4) + 1, 返回 返回 idx = 5
- 搜索 3 < val < 7, 使用 leftmost(3) + 1 <= idx <= rightmost(7) - 1
- 搜索 3 <= val <= 7, 使用 leftmsot(3) <= idx <= rightmost(7) - 1

# Insert Value Search

Insert Value Search 是对 Binary Search 的一种优化, 采用以下的公式, 对 mid 的取值进行优化, 以减少查询的次数.

- `mid = left + (right - left) * (val - arr[left]) / (arr[right] - arr[left])`

针对于 1, 2, 3, ....., 100 这样比较有规律的数据, 通过 Binary Search 查找 1 或 100 需要反复读词, 而 Insert Value Search 可以直接一次找到.

- 查找 1, `mid = 0 + (99 - 0) * (1 - 1) / (100 - 1) = 0`
- 查找 100, `mid = 0 + (99 - 0) * (100 - 1) / (100 - 1) = 99`

```java
public static int insertValueSearch(int[] arr, int left, int right, int val) {
    if (left > right || arr[0] > val || arr[arr.length - 1] < val) {
        return -1;
    }

    int mid = left + (right - left) * (val - arr[left]) / (arr[right] - arr[left]);

    if (arr[mid] < val) {
        return insertValueSearch(arr, mid + 1, right, val);
    } else if (val < arr[mid]) {
        return insertValueSearch(arr, left, mid - 1, val);
    } else {
        return mid;
    }
}
```

# Fibonacci Search

采用以下公式对 mid 进行取值

- `mid = left + f[k - 1] - 1`

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241802030.png)

```java
public static int[] fib(int arrLength) {
    int[] f = new int[arrLength];
    f[0] = 1;
    f[1] = 1;
    for (int i = 2; i < arrLength; i++) {
        f[i] = f[i - 1] + f[i - 2];
    }
    return f;
}

public static int fibSearch(int[] arr, int val) { // arr = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11}, val = 6
    int left = 0;
    int right = arr.length - 1; // right = 11

    int[] f = fib(arr.length); // f = {1, 1, 2, 3, 5, 8, 13}
    int k = 0;

    // 获取分割下标
    while (right > f[k] - 1) {
        k++;
    } // k = 6

    // f[k] 可能大于 arr.length, 所以需要构造一个新的数组, 内容是 arr, 长度为 f[k], 多余的空间默认为 0
    int[] temp = Arrays.copyOf(arr, f[k]); // temp = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0}

    // 将多余空间默认的 0 改成 arr 最后一个元素的值 (eg: {1, 2, 3, 0, 0, 0} -> {1, 2, 3, 3, 3, 3})
    for(int i = right + 1; i < temp.length; i++) {
        temp[i] = arr[right];
    } // temp = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11}


    /*
        left = 0, right = 11, k = 6, f[k] = 13, f[k - 1] = 8, val = 6
            mid = left + f[k - 1] - 1 = 0 + 8 - 1 = 7, temp[mid] = 7
            val < temp[mid]
            right = mid - 1 = 6
            k = 6 - 1 = 5
        left = 0, right = 6, k = 5, f[k] = 8, f[k - 1] = 5, val = 6
            mid = left + f[k - 1] - 1 = 0 + 5 - 1 = 4, temp[mid] = 4
            val > temp[mid]
            left = mid + 1 = 5
            k = 5 - 2 = 3
        left = 5, right= 6, k = 3, f[k] = 3, f[k - 1] = 2, val = 6
            mid = left + f[k - 1] - 1 = 5 + 2 - 1 = 6, temp[mid] = 6
            val = temp[mid]
     */
    while (left <= right) {
        // 对 f[k] - 1 进行分割, 得到 (f[k - 1] - 1) + 1 + (f[k - 2] - 1)
        int mid = left + f[k - 1] - 1;

        if (val < temp[mid]) { // 对 f[k - 1] - 1 再进行分割
            right = mid - 1;
            k -= 1;
        } else if (temp[mid] < val) { // 对 f[k - 2] - 1 再进行分割
            left = mid + 1;
            k -= 2;
        } else {
            if (mid <= right) {
                return mid;
            } else { // f[k] 比 arr.length 长, 所以 temp 会多出了一小节, right 之后的都和 temp[right] 一样
                return right;
            }
        }
    }
    return -1;
}
```

# Find First and Last Position of Element in Sorted Array

[Problem Description](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/description/)

```java
public static int[] searchRange(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;

    while (left <= right) {
        int mid = (left + right) >>> 1;
        if (target < nums[mid]) {
            right = mid - 1;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            int mostLeft = mid;
            int mostRight = mid;
            int temp = mid;

            while (true) {
                temp--;
                if (temp < 0 || nums[temp] != target) {
                    break;
                }
                mostLeft = temp;
            }

            temp = mid;

            while (true) {
                temp++;
                if (temp > nums.length - 1|| nums[temp] != target) {
                    break;
                }
                mostRight = temp;
            }

            return new int[]{mostLeft, mostRight};
        }
    }
    return new int[]{-1, -1};
}
```

# Find First and Last Position of Element in Sorted Array

```java
public static int[] searchRange(int[] nums, int target) {
    int leftMost = boundary(nums, target, true);
    int rightMost = boundary(nums, target, false);
    if (leftMost != -1) {
        return new int[]{leftMost, rightMost};
    }
    return new int[]{-1, -1};
}

public static int boundary(int[] nums, int target, boolean isLeftMost) {
    int left = 0;
    int right = nums.length - 1;
    int candidate = -1;

    while (left <= right) {
        int mid = (left + right) >>> 1;

        if (nums[mid] < target) {
            left = mid + 1;
        } else if (target < nums[mid]) {
            right = mid - 1;
        } else {
            candidate = mid;

            if (isLeftMost) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
    }

    return candidate;
}
```

# Quick Search

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=154)

根据 val 进行快速选择：

```java
public static int quickSearch(int[] arr, int l, int r, int val) {
    int p = partition(arr, l, r);

    if (arr[p] == val) {
        return p;
    }

    if (arr[p] < val) {
        return quickSearch(arr, p + 1, r, val);
    } else {
        return quickSearch(arr, l, p - 1, val);
    }
}
```

根据 idx 进行快速选择：

```java
public static int quickSearch(int[] arr, int l, int r, int idx) {
    int p = partition(arr, l, r);

    if (p == idx) {
        return arr[p];
    }

    if (p < idx) {
        return quickSearch(arr, p + 1, r, idx);
    } else {
        return quickSearch(arr, l, p - 1, idx);
    }
}
```

# Kth Largest Element in an Array

[Problem Description](https://leetcode.cn/problems/kth-largest-element-in-an-array/description)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=156&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public int findKthLargest(int[] nums, int k) {
    return quickSearch(nums, 0, nums.length - 1, nums.length - k);
}
```

# Find Median

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=156&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static double findMedian(int[] nums) {
    if (nums.length % 2 == 1) {
        return quickSearch(nums, 0, nums.length - 1, nums.length / 2);
    } else {
        int num1 = quickSearch(nums, 0, nums.length - 1, nums.length / 2 - 1);
        int num2 = quickSearch(nums, 0, nums.length - 1, nums.length / 2);
        return (num1 + num2) / 2.0;
    }
}
```

# Quick Sqrt

[Explain p159, p160](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=159)

```java
public static int quickSqrt(int x) {
    int l = 1;
    int r = x;
    int res = -1;

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

# Local Minimum

[Explain 01:42:07](https://www.bilibili.com/video/BV13g41157hK?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=3)

```java
public int rec(int[] arr) {
    // 判断第一个元素是否为局部最小
    if (arr[0] < arr[1]) {
        return arr[0];
    }
    // 判断最后一个元素是否为局部最小
    if (arr[arr.length - 1] < arr[arr.length - 2]) {
        return arr[arr.length - 1];
    }
    // 二分递归寻找局部最小
    return rec(arr, 0, arr.length - 1);
}

public int rec(int[] arr, int l, int r) {
    // 判断中间的元素是否为局部最小
    int m = (l + r) >>> 1;
    if (arr[m - 1] <= arr[m] <= arr[m + 1]) {
        return arr[m];
    }

    // 如果左边的比中间的小，说明左边肯定有局部最小
    if (arr[m - 1] <= arr[m]) {
        return rec(arr, l, m - 1);
    }
    // 如果右边的比中间的小，说明右边肯定有局部最小
    if (arr[m + 1] <= arr[m]) {
        return rec(arr, l, m + 1);
    }
}
```

# Search in Rotated Sorted Array

[Problem Description](https://leetcode.cn/problems/search-in-rotated-sorted-array/description/)

```java
public int search(int[] nums, int tar) {
    int l = 0;
    int r = nums.length - 1;
    while (l <= r) {
        int m = (l + r) >>> 1;
        if (nums[m] == tar) {
            return m;
        }
        // 左边是低位
        if (nums[l] <= nums[m]) {
            // 目标在 [l, m] 之间
            if (nums[l] <= tar && tar < nums[m]) {
                r = m - 1;
            }
            // 目标在 [m, r] 之间
            else {
                l = m + 1;
            }
        } 
        // 左边是高位
        else {
            if (nums[m] < tar && tar <= nums[r]) {
                l = m + 1;
            } else {
                r = m - 1;
            }
        }
    }
    return -1;
}
```