# Dynamic Array

Dynamic Array 就是可以动态添加元素, 删除元素的数组. ArrayList 就是一个 Dynamic Array

```java
public class DynamicArray implements Iterable<Integer> {
    private int size;
    private int cap;
    private int[] arr;
    
    public DynamicArray(int cap) {
        this.cap = cap;
        this.size = 0;
        this.arr = new int[cap];
    }
    
    public void add(int val) {
        add(size, val);
    }
    
    public void add(int idx, int val) {
        if (idx < 0 || idx >= cap) {
            throw new IllegalArgumentException("Illegal argument");
        }
        
        if (isFull()) {
            expandCap();
        }
        
        System.arraycopy(arr, idx, arr, idx + 1, size - idx); // {0, 1, 3, 0} -> {0, 1, 1, 3}
        arr[idx] = val; // {0, 1, 1, 3} -> {0, 1, 2, 3}
        size++;
    }
    
    public int remove(int idx) {
        if (idx < 0 || idx >= size) {
            throw new IllegalArgumentException("Illegal argument");
        }
        
        if (isEmpty()) {
            throw new IllegalArgumentException("Illegal argument");
        }
        
        int removed = arr[idx];
        System.arraycopy(arr, idx + 1, arr, idx, size - idx); // {0, 1, 2, 3} -> {0, 2, 3, 3}
        size--;
        return removed;
    }
    
    public void expandCap() {
        int[] newArr = new int[cap += cap >> 1];
        System.arraycopy(arr, 0, newArr, 0, size);
        arr = newArr;
    }
    
    public boolean isFull() {
        return size == cap;
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
    
    // Traverse array with Consumer
    public void print(Consumer<Integer> consumer) {
        for (int i = 0; i < size; i++) {
            consumer.accept(arr[i]);
        }
    }
    
    // Traverse array with Iterator
    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<Integer>() {
            int idx = 0;
            
            @Override
            public boolean hasNext() {
                return idx < size;
            }
            
            @Override
            public Integer next() {
                return arr[idx++];
            }
        };
    }
    
    // Traverse array with Stream
    public IntStream stream() {
        return IntStream.of(Arrays.copyOfRange(arr, 0, size));
    }
}
```

# 2D Array

CPU 读取数据时, 会先将 Memory 存放到 Cache 中, 再从 Cache 中读取数据, 一次 Memory 到 Cache 的 IO 会连续读取 64 B, 即一个 Cache Line.

按照 `arr[0][0] -> arr[1][0] -> arr[2][0]` 读取到连续数据后, 会立马用到

按照 `arr[0][0] -> arr[0][1] -> arr[0][2]` 读取到连续数据后, 不会立马用到, 有可能塞满了 Cache 都不会用着, 这就会导致后续的数据覆盖前面的数据, 重复加载数据, 非常低效.

```java
int[][] arr = new int[10][10];

/*
    High performance
        arr[0][0] -> arr[0][1] -> arr[0][2]
        arr[1][0] -> arr[1][1] -> arr[1][2]
        arr[2][0] -> arr[2][1] -> arr[3][2]
 */
for (int i = 0; i < 10; i++) {
    for (int j = 0; j < 10; j++) {
        System.out.println(arr[i][j]);
    }
}

/*
    Low performance
        arr[0][0] -> arr[1][0] -> arr[2][0]
        arr[0][1] -> arr[1][1] -> arr[2][1] 
        arr[0][2] -> arr[1][1] -> arr[2][2]
 */
for (int j = 0; j < 10; j++) {
    for (int i = 0; i < 10; i++) {
        System.out.println(arr[i][j]);
    }
}
```

# Merge Sorted Array

```java
/*
    i           j
    1, 5, 6     2, 4, 10, 11
    
       i        j               k
    1, 5, 6     2, 4, 10, 11    1
    
       i           j               k
    1, 5, 6     2, 4, 10, 11    1, 2
    
       i              j               k
    1, 5, 6     2, 4, 10, 11    1, 2, 10
    
          i        j                  k
    1, 5, 6     2, 4, 10, 11    1, 2, 5
    
             i     j                     k
    1, 5, 6     2, 4, 10, 11    1, 2, 5, 6
    
             i                j                 k
    1, 5, 6     2, 4, 10, 11    1, 2, 5, 6, 10, 11
 */
public void merge(int[] a1, int i, int iEnd, int j, int jEnd, int[] a2) {
    int k = 0;
    while (i <= iEnd && j <= jEnd) {
        if (a1[i] <= a1[j]) {
            a2[k++] = a1[i++];
        } else {
            a2[k++] = a1[j++];
        }
    }
    
    if (i > iEnd) {
        System.arraycopy(a1, j, a2, k, jEnd - j + 1);
    } else {
        System.arraycopy(a1, i, a2, k, iEnd - i + 1);
    }
}
```

# Merge Sorted Array

```java
/*
    (a1 = [1, 6 | 2, 4, 10, 11], a2 = []) {
        (a1 = [6 | 2, 4, 10, 11], a2 = [1]) {
            (a1 = [6 | 4, 10, 11], a2 = [1, 2]) {
                (a1 = [6 | 10, 11], a2 = [1, 2, 4]) {
                    (a1 = [10, 11], a2 = [1, 2, 4, 6]) {
                        (a1 = [], a2 = [1, 2, 4, 6, 10, 11]) {
                        }
                    }
                }
            }
        }
    }
 */
public void merge(int[] a1, int i, int iEnd, int j, int jEnd, int[] a2, int k) {
    if (i > iEnd) {
        System.arraycopy(a1, j, a2, k, jEnd - j + 1);
        return;
    }
    
    if (j > jEnd) {
        System.arraycopy(a1, i, a2, k, iEnd - i + 1);
        return;
    }
    
    if (a1[i] < a1[j]) {
        a2[k++] = a1[i++];
        merge(a1, i, iEnd, j, jEnd, a2, k);
    } else {
        a2[k++] = a1[j++];
        merge(a1, i, iEnd, j, jEnd, a2, k);
    }
}
```

# Remove Duplicates from Sorted Array

[Problem Description](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/description/?envType=study-plan-v2&envId=top-interview-150)

```java
public static int removeDuplicates(int[] nums1) {
    int[] nums2 = new int[nums1.length];
    int i1 = 0;
    int i2 = 0;

    // 对于 [1, 1, 2, 2, 2, 3, 3]，会在 i1 移动到最后一个 1, 2, 3 时，才会存储进 nums2 中
    while (i1 < nums1.length - 1) {
        if (nums1[i1] != nums1[i1 + 1]) {
            nums2[i2++] = nums1[i1++];
        } else {
            i1++;
        }
    }
    // 复制 nums1 的最后一个元素到 nums2 中
    nums2[i2] = nums1[i1];
    
    System.arraycopy(nums2, 0, nums1, 0, nums1.length);
    
    return i2;
}
```

# Remove Duplicates from Sorted Array II

[Problem Description](https://leetcode.cn/problems/remove-duplicates-from-sorted-array-ii/description/?envType=study-plan-v2&envId=top-interview-150)

```java
public static int removeDuplicates(int[] nums) {
    if (nums.length < 2) {
        return nums.length;
    }

    // 快慢指针初始化为 2，前两个元素无需检查
    int i1 = 2;
    int i2 = 2;
    while (i2 < nums.length) {
        // 慢指针 指向的元素 和 快指针不同
        if (nums[i1 - 2] != nums[i2]) {
            nums[i1++] = nums[i2];
        }
        i2++;
    }
    
    return i1;
}
```

# Find Pivot Index

[Problem Description](https://leetcode.cn/problems/find-pivot-index/description/)

```java
public static int pivotIndex(int[] nums) {
    int sum = Arrays.stream(nums).sum();
    int sumLeft = 0;
    for (int i = 0; i < nums.length; i++) {
        if (sumLeft * 2 + nums[i] == sum) {
            return i;
        }
        sumLeft += nums[i];
    }
    return -1;
}
```

# Find Pivot Index

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=73&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int pivotIndex(int[] nums) {
    int sumR = Arrays.stream(nums).sum();
    int sumL = 0;
    for (int i = 0; i < nums.length; i++) {
        sumR -= nums[i];
        if (sumL == sumR) {
            return i;
        }
        sumL += nums[i];
    }
    return -1;
}
```

# Maximum Subarray

[Problem Description](https://leetcode.cn/problems/maximum-subarray/description/?envType=study-plan-v2&envId=top-100-liked)

```java
public static int maxSubArray(int[] nums) {
    int maxSum = Integer.MIN_VALUE;
    for (int i = 0; i < nums.length; i++) {
        int curSum = 0;
        for (int j = i; j < nums.length; j++) {
            curSum += nums[j];
            maxSum = Math.max(maxSum, curSum);
        }
    }
    return maxSum;
}
```

# Merge Intervals

[Problem Description](https://leetcode.cn/problems/merge-intervals/description/?envType=study-plan-v2&envId=top-100-liked)

```java
public int[][] merge(int[][] intervals) {
    // 对 intervals 进行排序，按照每个 interval 的第一个元素排序，即左区间
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> result = new ArrayList<>();
    for (int[] curr : intervals) {
        // 如果是第一个元素
        if (result.isEmpty()) {
            result.add(curr);
        } 
        // 如果不是第一个元素
        else {
            // 前一个元素
            int[] prev = result.get(result.size() - 1);
            // 比较 前一个区间 和 当前区间 是否有重合
            if (prev[1] < curr[0]) {
                // 没有重合就直接加入结果集
                result.add(curr);
            } else {
                // 有重合就进行合并，取最大的右区间
                prev[1] = Math.max(prev[1], curr[1]);
            }
        }
    }
    return result.toArray(new int[result.size()][]);
}
```

# Rotate Array

[Problem Description](https://leetcode.cn/problems/rotate-array/?envType=study-plan-v2&envId=top-100-liked)

```java
public static void rotate(int[] nums, int k) {
    LinkedList<Integer> que = new LinkedList<>();
    for (int num : nums) {
        que.offerLast(num);
    }
    for (int i = 0; i < k; i++) {
        que.offerFirst(que.pollLast());
    }
    for (int i = 0; i < nums.length; i++) {
        nums[i] = que.pollFirst();
    }
}
```

# Rotate Array

```java
public void rotate(int[] nums1, int k) {
    int len = nums1.length;
    // 5 个元素，向右移动 8 位 等于 向右移动 8 % 5 = 3 位
    k = k % len;
    int[] nums2 = new int[len];
    for (int i = 0; i < len; i++) {
        nums2[(i + k) % len] = nums1[i];
    }

    System.arraycopy(nums2, 0, nums1, 0, len);
}
```

# Product of Array Except Self

[Problem Description](https://leetcode.cn/problems/product-of-array-except-self/?envType=study-plan-v2&envId=top-100-liked)

```java
public static int[] productExceptSelf(int[] nums) {
    // lCount[i] 表示在 i 左边的所有元素的乘积
    int[] lCount = new int[nums.length];
    lCount[0] = 1;
    for (int i = 1; i < nums.length; i++) {
        lCount[i] = lCount[i - 1] * nums[i - 1];
    }

    // rCount[i] 表示在 i 右边的所有元素的乘积
    int[] rCount = new int[nums.length];
    rCount[nums.length - 1] = 1;
    for (int i = nums.length - 2; i >= 0; i--) {
        rCount[i] = rCount[i + 1] * nums[i + 1];
    }

    // 根据 lCount[i] 和 rCount[i] 计算 i 的左右所有元素的乘积
    for (int i = 0; i < nums.length; i++) {
        nums[i] = lCount[i] * rCount[i];
    }
    
    return nums;
}
```

# Set Matrix Zeroes

[Problem Description](https://leetcode.cn/problems/set-matrix-zeroes/description/?envType=study-plan-v2&envId=top-100-liked)

```java
public void setZeroes(int[][] matrix) {
    boolean[] ca = new boolean[matrix.length];
    boolean[] cb = new boolean[matrix[0].length];
    for (int i = 0; i < matrix.length; i++) {
        for (int j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] == 0) {
                ca[i] = true;
                cb[j] = true;
            }
        }
    }
    for (int i = 0; i < ca.length; i++) {
        if (ca[i]) {
            for (int k = 0; k < matrix[0].length; k++) {
                matrix[i][k] = 0;
            }
        }
    }
    for (int j = 0; j < cb.length; j++) {
        if (cb[j]) {
            for (int k = 0; k < matrix.length; k++) {
                matrix[k][j] = 0;
            }
        }
    }
}
```

# Gas Station

[Problem Description](https://leetcode.cn/problems/gas-station/description/?envType=study-plan-v2&envId=top-interview-150)

```java
public static int canCompleteCircuit(int[] gas, int[] cost) {
    int totalGas = 0;
    int totalCost = 0;
    int start = 0;
    int tank = 0;
    for (int i = 0; i < gas.length; i++) {
        totalGas += gas[i];
        totalCost += cost[i];
        tank += gas[i] - cost[i];
        // 如果当前油量不足以到达下一个加油站，则重置油箱，并从下一个加油站重新开始统计，
        if (tank < 0) {
            start = (i + 1) % gas.length;
            tank = 0;
        }
    }
    // 如果总汽油量大于等于总消耗量，则返回起点索引；否则返回 -1
    return totalGas >= totalCost ? start : -1;
}
```

# Candy

[Problem Description](https://leetcode.cn/problems/candy/description/?envType=study-plan-v2&envId=top-interview-150)

```java
public static int candy(int[] ratings) {
    int[] candies = new int[ratings.length];
    Arrays.fill(candies, 1);
    for (int i = 1; i < candies.length; i++) {
        if (ratings[i] > ratings[i - 1]) {
            candies[i] = candies[i - 1] + 1;
        }
    }
    for (int i = candies.length - 2; i > -1; i--) {
        if (ratings[i] > ratings[i + 1]) {
            if (candies[i] < candies[i + 1] + 1) {
                candies[i] = candies[i + 1] + 1;
            }
        }
    }
    int count = 0;
    for (int candy : candies) {
        count += candy;
    }
    return count;
}
```

# H Index

[Problem Description](https://leetcode.cn/problems/h-index/description/?envType=study-plan-v2&envId=top-interview-150)

```java
public static int hIndex(int[] citations) {
    Arrays.sort(citations);
    int len = citations.length;
    for (int i = 0; i < len; i++) {
        // 当前论文的 H 指数
        int h = len - i;
        if (citations[i] >= h) return h;
    }
    return 0;
}
```
