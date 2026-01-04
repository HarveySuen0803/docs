# Sort

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411241608201.png)

# Bubble Sort

```java
public static void bubbleSort(int[] arr) {
    boolean isOK = true;

    for (int i = 0; i < arr.length - 1; i++) {
        for (int j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                isOK = false;
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
     
        if (isOK) {
            return;
        }
    } 
}
```

# Bubble Sort (Recursion)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=48&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * This method implements the Bubble Sort algorithm to sort an integer array.
 * It's a recursive version of Bubble Sort, which sorts the array in ascending order.
 *
 * @param i The boundary index for the current recursive call. 
 *          It represents the last unsorted element in the array.
 */
public static void bubbleSort(int[] arr, int i) {    
    // Base case: if the array size is 0, return immediately.
    if (i == 0) {
        return;
    }
    
    // The boundary of the sorted part of the array.
    int bd = 0;
    
    // Iterate over the array from the start to the boundary index 'i'.
    for (int j = 0; j < i; j++) {
        // If the current element is greater than the next one, swap them.
        if (arr[j] > arr[j + 1]) {
            int t = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = t;
            
            // Update the boundary to the current index 'j'.
            bd = j;
        }
    }
    
    // Recursive call to sort the remaining unsorted part of the array.
    bubbleSort(arr, bd);
}
```

# Select Sort

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=49&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static void selectSort(int[] arr) {
    for (int bd = arr.length - 1; bd > 0; bd--) {
        int maxIdx = bd;
        for (int i = 0; i < bd; i++) {
            if (arr[i] > arr[maxIdx]) {
                maxIdx = i;
            }
        }
        
        if (maxIdx != bd) {
            int t = arr[maxIdx];
            arr[maxIdx] = arr[bd];
            arr[bd] = t;
        }
    }
}
```

# Insert Sort

```java
/**
 * This method implements the Insertion Sort algorithm to sort an array of integers in ascending order.
 *
 * Insertion Sort works by:
 * 1. Iterating over the array from the second element to the last (index 1 to arr.length - 1).
 * 2. For each iteration, it selects the current element and its index.
 * 3. It then checks the elements before the current one.
 * 4. If it finds an element greater than the current, it shifts that element to the right.
 * 5. This process continues until it finds an element smaller than the current or reaches the start of the array.
 * 6. It then inserts the current element at the found position.
 *
 * This sorting algorithm is efficient for small data sets, but it's less efficient for larger data sets.
 */
public static void insertSort(int[] arr) {
    for (int low = 1; low < arr.length; low++) { // Keep 0 ~ low is ordered
        // Select the current element and its index
        int idx = low;
        int val = arr[low];

        // Check the elements before the current one
        while (0 < idx && val < arr[idx - 1]) {
            // Shift the element to the right if it's greater than the current
            arr[idx] = arr[idx - 1];
            idx--;
        }

        // Insert the current element at the found position
        if (idx != low) {
            arr[idx] = val;
        }
    }
}
```

# Insert Sort (Recursion)

```java
/**
 * This method implements the Insertion Sort algorithm to sort an array of integers in ascending order.
 * It uses recursion to sort the array.
 */
public static void insertSort(int[] arr, int low) {
    // Check if the starting index is equal to the length of the array
    if (low == arr.length) {
        return;
    }
    
    // Select the current element and its index
    int idx = low;
    int val = arr[low];
    
    // Check the elements before the current one
    while (0 < idx && val < arr[idx - 1]) {
        // Shift the element to the right if it's greater than the current
        arr[idx] = arr[idx - 1];
        idx--;
    }
    
    // Insert the current element at the found position
    if (idx != low) {
        arr[idx] = val;
    }
    
    // Call the method with the starting index incremented by 1
    insertSort(arr, low + 1);
}
```

# Heap Sort

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=140)

```java
public static void heapSort(int[] nums) {
    // len / 2 - 1 为倒数第二层的最右边的节点的索引
    // 从该处开始，从右向左，从下向上，依次进行 heapify，构建堆
    for (int i = nums.length / 2 - 1; i > -1; i--) {
        moveDown(nums, i, nums.length);
    }
    // 构建好堆之后，依次将堆顶元素移动至最后，表示已经排好序的元素
    // size = 5 时，将 idx = 0 和 idx = 4 交换，即最大的元素放在了最后，设置 size--
    // size = 4 时，将 idx = 0 和 idx = 3 交换，即倒数第二大的元素移到了后面
    for (int size = nums.length - 1; size > -1; size--) {
        swap(nums, 0, size);
        moveDown(nums, 0, size);
    }
}

public static void moveDown(int[] nums, int par, int size) {
    int max = par;
    int left = par * 2 + 1;
    int right = par * 2 + 2;

    if (left < size && nums[left] > nums[max]) {
        max = left;
    }
    if (right < size && nums[right] > nums[max]) {
        max = right;
    }

    if (max != par) {
        swap(nums, par, max);
        moveDown(nums, max, size);
    }
}
```

# Shell Sort

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=52&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * This method implements the Shell Sort algorithm to sort an array of integers.
 * Shell Sort is an optimization over Insertion Sort. The idea is to rearrange the array
 * to give it the property that taking every hth element (starting anywhere) yields a sorted sequence.
 * Such an array is said to be h-sorted. By performing insertion sort for h-sorting, Shell Sort
 * allows the exchange of items that are far apart. The value of 'h' is progressively reduced; the final
 * sort is thus an ordinary Insertion Sort, but by this time, the array is guaranteed to be almost sorted,
 * which is insertion sort's "best case".
 *
 * @param arr the array of integers to be sorted
 */
public static void shellSort(int[] arr) {
    // Start with a big gap, then reduce the gap
    for (int gap = arr.length >> 1; gap > 0; gap = gap >> 1) {
        // Do a gapped insertion sort for this gap size.
        for (int low = gap; low < arr.length; low++) {
            // Save a[low] in temp and make a hole at position low
            int idx = low;
            int val = arr[low];

            // Shift earlier gap-sorted elements up until the correct location for a[low] is found
            while (0 <= idx - gap && val < arr[idx - gap]) {
                // Move the greater element up
                arr[idx] = arr[idx - gap];
                idx -= gap;
            }

            // If there was a movement, put temp (the original a[low]) in its correct location
            if (idx != low) {
                arr[idx] = val;
            }
        }
    }
}
```

# Merge Sort

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=53)

```java
/**
 * This method is the entry point for the merge sort algorithm.
 * It creates a temporary array and initiates the recursive split process.
 *
 * @param arr The array to be sorted.
 */
public static void mergeSort(int[] arr) {
    split(arr, 0, arr.length - 1, new int[arr.length]);
}

/**
 * This method recursively splits the array into two halves until it cannot be split further.
 * It then merges the two sorted halves into a single sorted array.
 *
 * @param a1 The original array.
 * @param left The start index of the array to be split.
 * @param right The end index of the array to be split.
 * @param a2 The result array.
 */
private static void split(int[] a1, int left, int right, int[] a2) {
    // Base case: if the array has only one element, it is already sorted
    if (left == right) {
        return;
    }
    
    // Calculate the mid-point of the array
    int mid = (left + right) >>> 1;
    // Recursively split the left half of the array
    split(a1, left, mid, a2);
    // Recursively split the right half of the array
    split(a1, mid + 1, right, a2);
    
    // Merge the two sorted halves into a single sorted array
    merge(a1, left, mid, mid + 1, right, a2);
    // Copy the sorted array back into the original array
    System.arraycopy(a2, left, a1, left, right - left + 1);
}

/**
 * This method merges two sorted subarrays into a single sorted subarray.
 * It compares elements from both subarrays and inserts the smaller element into the result array.
 * If one subarray is exhausted, it copies the remaining elements from the other subarray.
 *
 * @param a1 The original array.
 * @param i The start index of the first subarray.
 * @param iEnd The end index of the first subarray.
 * @param j The start index of the second subarray.
 * @param jEnd The end index of the second subarray.
 * @param a2 The result array.
 */
private static void merge(int[] a1, int i, int iEnd, int j, int jEnd, int[] a2) {
    int k = i;
    // Compare elements from both subarrays and insert the smaller one into the result array
    while (i <= iEnd && j <= jEnd) {
        if (a1[i] <= a1[j]) {
            a2[k++] = a1[i++];
        } else {
            a2[k++] = a1[j++];
        }
    }
    
    // If the first subarray is exhausted, copy the remaining elements from the second subarray
    if (i > iEnd) {
        System.arraycopy(a1, j, a2, k, jEnd - j + 1);
    }
    
    // If the second subarray is exhausted, copy the remaining elements from the first subarray
    if (j > jEnd) {
        System.arraycopy(a1, i, a2, k, iEnd - i + 1);
    }
}
```

# Merge Sort (Bottom Up)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=54)

```java
/**
 * This method implements the Merge Sort algorithm to sort an array of integers in ascending order.
 * Merge Sort is a divide-and-conquer algorithm that splits the array into two halves (subarrays),
 * sorts them separately, and then merges them.
 *
 * @param a1 the array of integers to be sorted.
 */
public static void mergeSort(int[] a1) {
    // Create a helper array with the same length as the input array.
    int[] a2 = new int[a1.length];

    // Outer loop to control the width of the subarray. It starts from 1 and doubles each time.
    for (int width = 1; width < a1.length; width *= 2) {
        // Inner loop to control the left index of the subarray.
        for (int left = 0; left < a1.length; left += width * 2) {
            // Calculate the right index and the mid index of the subarray.
            int right = Math.min(left + width * 2 - 1, a1.length - 1);
            int mid = Math.min(left + width - 1, a1.length - 1);
            // Call the merge method to merge two sorted subarrays into one.
            merge(a1, left, mid, mid + 1, right, a2);
        }
        // Copy the sorted elements from the helper array back to the original array.
        System.arraycopy(a2, 0, a1, 0, a1.length);
    }
}
```

# Merge Sort + Insert Sort

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=55)

```java
public static void mergeSort(int[] arr) {
    split(arr, 0, arr.length - 1, new int[arr.length]);
}

private static void split(int[] a1, int left, int right, int[] a2) {
    // It uses insertion sort if the size of the array is less than or equal to 32.
    // Otherwise, it splits the array into two halves recursively and merges them back together after sorting.
    // This hybrid approach takes advantage of the efficiency of merge sort for large arrays and the efficiency of insertion sort for small arrays, resulting in a more efficient sorting algorithm for certain types of data.
    if (right - left <= 32) {
        insertSort(a1, left, right);
        return;
    }
    
    int mid = (left + right) >>> 1;
    split(a1, left, mid, a2);
    split(a1, mid + 1, right, a2);
    
    merge(a1, left, mid, mid + 1, right, a2);
    System.arraycopy(a2, left, a1, left, right - left + 1);
}

/**
 * This method sorts a small array using the insertion sort algorithm.
 * It starts by iterating over the array from left to right.
 * For each element, it finds its correct position in the sorted part of the array and inserts it there.
 *
 * @param arr the array to be sorted
 * @param left the start index of the array
 * @param right the end index of the array
 */
private static void insertSort(int[] arr, int left, int right) {
    for (int low = left + 1; low <= right; low++) {
        int idx = low;
        int val = arr[low];

        while (idx >= left && val < arr[idx - 1]) {
            arr[idx] = arr[idx - 1];
            idx--;
        }

        if (idx != low) {
            arr[idx] = val;
        }
    }
}

private static void merge(int[] a1, int i, int iEnd, int j, int jEnd, int[] a2) {
    int k = i;
    while (i <= iEnd && j <= jEnd) {
        if (a1[i] <= a1[j]) {
            a2[k++] = a1[i++];
        } else {
            a2[k++] = a1[j++];
        }
    }
    
    if (i > iEnd) {
        System.arraycopy(a1, j, a2, k, jEnd - j + 1);
    }
    
    if (j > jEnd) {
        System.arraycopy(a1, i, a2, k, iEnd - i + 1);
    }
}
```

# Dutch National Flag Problem

[Explain 01:44:40](https://www.bilibili.com/video/BV13g41157hK?spm_id_from=333.788.videopod.episodes&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=4)

```java
public static void sort(int[] nums, int tar) {
    int i = 0;
    // 从 l 开始，左边的元素都小于等于 tar
    int l = -1;
    // 从 r 开始，右边的元素都大于等于 tar
    int r = nums.length;
    // 只需要从 i 遍历到 r 即可，因为从 r 开始，右边的元素都是由 i 换过去的，即都遍历过了
    while (i < r) {
        if (nums[i] < tar) {
            swap(nums, l + 1, i);
            l++;
            i++;
        } else if (nums[i] > tar) {
            // 交换了 r - 1 和 i 的元素，这里只能 r--，不能 i++，
            // 因为 r - 1 的元素是从右边来的，我们还没有访问过，
            // 上面可以执行 i++，是因为 l + 1 的元素，是经过 i 遍历的
            swap(nums, r - 1, i);
            r--;
        } else {
            i++;
        }
    }
}
```

# Quick Sort

[Explain 02:22:00](https://www.bilibili.com/video/BV13g41157hK?spm_id_from=333.788.videopod.episodes&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=4)

```java
public static void quickSort(int[] nums, int l, int r) {
    if (l >= r) return;
    int[] p = partition(nums, l, r);
    quickSort(nums, l, p[0] - 1);
    quickSort(nums, p[0] + 1, r);
}

public static int[] partition(int[] nums, int l, int r) {
    int pv = nums[ThreadLocalRandom.current().nextInt(r - l + 1) + l];
    int pi = l;
    int pl = l - 1;
    int pr = r + 1;
    while (pi < pr) {
        if (nums[pi] < pv) {
            swap(nums, pl + 1, pi);
            pl++;
            pi++;
        } else if (nums[pi] > pv) {
            swap(nums, pr - 1, pi);
            pr--;
        } else {
            pi++;
        }
    }
    return new int[] { pl + 1, pr - 1 };
}
```

快排的空间复杂度分析

1. 递归深度

- 快速排序是基于分治思想的，递归调用栈的深度取决于数组划分的方式。
- 最优情况（每次均匀划分，递归深度为 logn）：每次划分后，子数组的大小减半，因此递归的最大深度为 logn。
- 最差情况（每次划分都在极端位置，如升序数组中以第一个元素为基准）：每次划分时，只有一个元素进入一侧，递归深度为 n 。

2. 辅助空间

- 除了递归调用栈外，该算法没有使用额外的数据结构。
- partition 方法返回一个长度为 2 的数组（常数级空间）。
- 整体辅助空间为  O(1) ，不随着输入规模增长。

# Counting Sort

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=61&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * This method implements the Counting Sort algorithm to sort an array of integers in ascending order.
 * Counting Sort is a stable sorting algorithm that sorts elements based on the frequency of each element in the input array.
 */
public static void countingSort(int[] nums) {
    // Find the maximum and minimum elements in the array
    int min = nums[0];
    int max = nums[0];
    for (int num : nums) {
        min = Math.min(min, num);
        max = Math.max(max, num);
    }
    
    // Create a count array of size 'max - min + 1' to store the frequency of each element
    int[] counts = new int[max - min + 1];
    for (int num : nums) {
        counts[num - min]++;
    }
    
    // Iterate over the count array and overwrite the input array with sorted elements
    int k = 0;
    int idx = 0;
    while (idx < counts.length) {
        while (counts[idx] > 0) {
            // Place the element in the sorted position in the original array
            nums[k++] = idx + min;
            // Decrement the count of the placed element
            counts[idx]--;
        }
        idx++;
    }
}
```

# Bucket Sort

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=62&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * This method implements the Bucket Sort algorithm.
 * Bucket Sort is a sorting algorithm that divides the unsorted array into several groups, called buckets.
 * Each bucket is then sorted individually, either using a different sorting algorithm, or by recursively applying the bucket sorting algorithm.
 * 
 * @param nums  The array of integers to be sorted.
 * @param range The range of values in each bucket. For example, if range is 10, then the first bucket will contain all numbers from 0 to 9, the second bucket will contain all numbers from 10 to 19, and so on. In this way, we can determine which bucket each number should go into based on its value.
 */
public static void bucketSort(int[] nums, int range) {
    // Find the minimum and maximum values in the array
    int min = nums[0];
    int max = nums[0];
    for (int num : nums) {
        min = Math.min(min, num);
        max = Math.max(max, num);
    }
    
    // Create the buckets
    ArrayList<Integer>[] buckets = new ArrayList[(max - min) / range + 1];
    for (int i = 0; i < buckets.length; i++) {
        buckets[i] = new ArrayList<>();
    }
    
    // Distribute the numbers into the buckets
    for (int num : nums) {
        buckets[(num - min) / range].add(num);
    }
    
    // Sort each bucket and merge
    int k = 0;
    for (ArrayList<Integer> bucket : buckets) {
        Collections.sort(bucket); // Sort the bucket, insertion sorting can be used instead
        for (Integer num : bucket) {
            nums[k++] = num; // Merge the numbers back into the original array
        }
    }
}
```

# Radix Sort

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=64&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java

public static void radixSort(int[] nums) {
    // Find the maximum number to determine the number of digits
    int max = nums[0];
    for (int num : nums) {
        max = Math.max(max, num);
    }

    // Initialize buckets for each digit
    ArrayList<Integer>[] buckets = new ArrayList[10];
    for (int i = 0; i < buckets.length; i++) {
        buckets[i] = new ArrayList<>();
    }

    // Determine the number of digits in the max number
    int len = (max + "").length();
    // Initialize the radix for digit extraction
    int radix = 1;
    for (int i = 0; i < len; i++) {
        // Distribute numbers into buckets based on the current digit
        for (int num : nums) {
            buckets[num / radix % 10].add(num);
        }

        // Collect numbers from the buckets and put them back into the original array
        int k = 0;
        for (ArrayList<Integer> bucket : buckets) {
            for (Integer num : bucket) {
                nums[k++] = num;
            }
            // Clear the bucket for the next iteration
            bucket.clear();
        }
        // Move to the next digit
        radix *= 10;
    }
}

```

# Relative Sort Array

[Problem Description](https://leetcode.cn/problems/relative-sort-array/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=67&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * This method sorts the first array (arr1) in the order defined by the second array (arr2).
 * Elements of arr1 that don't exist in arr2 should be placed at the end of arr1 in ascending order.
 * 
 * The core idea of this algorithm is to use a counting sort approach. We first count the occurrence of each number in arr1,
 * then we iterate over arr2 and for each number in arr2, we add it to the result array as many times as it appears in arr1.
 * Finally, we add the rest of the numbers that appear in arr1 but not in arr2 in ascending order.
 * 
 * @param arr1 The first input array to be sorted.
 * @param arr2 The second input array that defines the order of sorting.
 * @return A sorted array.
 */
public int[] relativeSortArray(int[] arr1, int[] arr2) {
    // Count the occurrence of each number in arr1.
    int[] counts = new int[1001];
    for (int num : arr1) {
        counts[num]++;
    }

    int[] res = new int[arr1.length];
    int k = 0;
    // Iterate over arr2, for each number in arr2, add it to the result array as many times as it appears in arr1.
    // Sort the numbers according to the order in arr2
    for (int num : arr2) {
        // Add the number to the result array and decrease its count until its count is 0
        while (counts[num] > 0) {
            res[k++] = num;
            counts[num]--;
        }
    }

    // Add the rest of the numbers that appear in arr1 but not in arr2 in ascending order.
    for (int i = 0; i < counts.length; i++) {
        while (counts[i] > 0) {
            res[k++] = i;
            counts[i]--;
        }
    }
    
    // Return the sorted array
    return res;
}
```

# Sort Array by Increasing Frequency

[Problem Description](https://leetcode.cn/problems/sort-array-by-increasing-frequency/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=68&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public int[] frequencySort(int[] nums) {
    int max = 100;
    int min = -100;
    
    int[] counts = new int[max - min + 1];
    for (int num : nums) {
        counts[num - min]++;
    }
    
    return Arrays.stream(nums).boxed().sorted((a, b) -> {
        int af = counts[a - min];
        int bf = counts[b - min];
        
        if (af < bf) {
            return -1;
        } else if (af > bf) {
            return 1;
        } else {
            return b - a;
        }
    }).mapToInt(Integer::valueOf).toArray();
}
```

# Maximum Gap (Bucket Sort)

[Problem Description](https://leetcode.cn/problems/maximum-gap/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=69&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * Returns the maximum difference between two successive elements in its sorted form for the given array.
 * If the array contains less than two elements, returns 0.
 *
 * @param nums the input array
 * @return the maximum gap in the sorted array
 */
public int maximumGap(int[] nums) {
    // If the array contains less than two elements, return 0
    if (nums.length < 2) {
        return 0;
    }

    // the number of buckets is (max - min) / range + 1 = nums.length
    int range = Math.max((max - min) / (nums.length - 1), 1);

    // Sort the array using bucket sort
    bucketSort(nums, range);

    int maxGap = 0;
    
    // Iterate through the sorted array
    for (int i = 0; i < nums.length - 1; i++) {
        // Update the maximum gap
        maxGap = Math.max(maxGap, nums[i + 1] - nums[i]);
    }

    return maxGap;
}
```

# Maximum Gap (Radix Sort)

[Problem Description](https://leetcode.cn/problems/maximum-gap/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=70&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * This method calculates the maximum gap between two adjacent numbers in a sorted array.
 * The core idea of this algorithm is to use the Radix Sort algorithm to sort the input array,
 * and then iterate through the sorted array to find the maximum gap.
 * 
 * @param nums The input array.
 * @return The maximum gap between two adjacent numbers in the sorted array.
 */
public int maximumGap(int[] nums) {
    // Find the maximum number in the array.
    int max = nums[0];
    for (int num : nums) {
        max = Math.max(max, num);
    }
    
    // Initialize buckets for Radix Sort.
    ArrayList<Integer>[] buckets = new ArrayList[10];
    for (int i = 0; i < buckets.length; i++) {
        buckets[i] = new ArrayList<>();
    }
    
    // Perform Radix Sort.
    int radix = 1;
    while (radix <= max) {
        // Distribute numbers into buckets according to their radix digit.
        for (int num : nums) {
            buckets[num / radix % 10].add(num);
        }
        
        // Collect numbers from buckets to the array and clear the buckets.
        int k = 0;
        for (ArrayList<Integer> bucket : buckets) {
            for (Integer i : bucket) {
                nums[k++] = i;
            }
            bucket.clear();
        }
        
        // Print the array after each round of Radix Sort.
        System.out.println(Arrays.toString(nums));
        
        // Move to the next radix digit.
        radix *= 10;
    }
    
    // Find the maximum gap.
    int maxGap = 0;
    for (int i = 0; i < nums.length - 1; i++) {
        maxGap = Math.max(maxGap, nums[i + 1] - nums[i]);
    }
    
    return maxGap;
}
```

# Maximum Gap (Bucket Sort) (SO)

[Problem Description](https://leetcode.cn/problems/maximum-gap/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=72&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maximumGap(int[] nums) {
    // If the array length is less than 2, return 0 as there is no gap.
    if (nums.length < 2) {
        return 0;
    }
    
    // Find the minimum and maximum values in the array.
    int min = nums[0];
    int max = nums[0];
    for (int num : nums) {
        min = Math.min(min, num);
        max = Math.max(max, num);
    }
    
    // Calculate the range and bucket size.
    int range = Math.max((max - min) / nums.length, 1);
    int bucketSize = (max - min) / range + 1;
    Pair[] buckets = new Pair[bucketSize];
    
    // Put each number into the corresponding bucket.
    for (int num : nums) {
        int idx = (num - min) / range;
        if (buckets[idx] == null) {
            buckets[idx] = new Pair();
        }
        buckets[idx].add(num);
    }
    
    // Calculate the maximum gap.
    int maxGap = 0;
    int lastMax = buckets[0].max;
    for (int i = 1; i < buckets.length; i++) {
        Pair bucket = buckets[i];
        if (bucket != null) {
            maxGap = Math.max(maxGap, bucket.min - lastMax);
            lastMax = bucket.max;
        }
    }
    
    return maxGap;
}

/**
 * This class represents a pair of minimum and maximum values.
 */
public static class Pair {
    public int min = 1000_000_000;
    public int max = 0;
    
    public void add(int val) {
        max = Math.max(max, val);
        min = Math.min(min, val);
    }
    
    @Override
    public String toString() {
        return "Pair{" +
                   "min=" + min +
                   ", max=" + max +
                   '}';
    }
}
```

# SmallSum

[Explain 01:01:43](https://www.bilibili.com/video/BV13g41157hK?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=4)

```java
public int smallSum(int[] arr) {
    return split(arr, 0, arr.length - 1);
}

public int split(int[] arr, int l, int r) {
    if (l == r) return 0;
    int m = (l + r) >>> 1;
    return split(arr, l, m) + split(arr, m + 1, r) + merge(arr, l, m, m + 1, r);
}

public int merge(int[] a1, int i, int iEnd, int j, int jEnd) {
    int[] a2 = new int[a1.length];
    int k = 0;
    int smallSum = 0;
    while (i <= iEnd && j <= jEnd) {
        if (a1[i] <= a1[j]) {
            // 右边有 (jEnd - j + 1) 个元素比 a1[i] 大
            smallSum += a1[i] * (jEnd - j + 1);
            a2[k++] = a1[i++];
        } else {
            a2[k++] = a2[j++];
        }
    }
    while (i <= iEnd) {
        a2[k++] = a1[i++];
    }
    while (j <= jEnd) {
        a2[k++] = a1[j++];
    }
    System.arraycopy(a2, 0, a1, 0, k);
    return smallSum;
}
```

# Count of Smaller Numbers After Self

[Problem Description](https://leetcode.cn/problems/count-of-smaller-numbers-after-self/description/)

[Explain 01:29:02](https://www.bilibili.com/video/BV13g41157hK?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=4)

```java
```

# Nearly Sorted Array

已知一个几乎有序的数组，几乎有序是指，如果把数组排好顺序的话，每个元素移动的距离可以不超过k，并且k相对于数组来说比较小。请选择一个合适的排序算法针对这个数据进行排序。

[Explain 01:20:50](https://www.bilibili.com/video/BV13g41157hK/?spm_id_from=333.788.videopod.episodes&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=5)

```java
public static void sortNearlySortedArray(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();

    // 将 [0, 0 + k + 1] 的元素放入到小顶堆中，其中必然包含排好序后 idx = 0 的元素
    for (int i = 0; i <= k && i < nums.length; i++) {
        minHeap.offer(nums[i]);
    }

    // 遍历数组，将堆顶元素放入结果，同时加入新的元素
    // 将 [1, 1 + k + 1] 的元素放入到小顶堆，其中必然包含排好序后 idx = 1 的元素
    // 将 [2, 2 + k + 1] 的元素放入到小顶堆，其中必然包含排好序后 idx = 2 的元素
    int idx = 0;
    for (int i = k + 1; i < nums.length; i++) {
        nums[idx++] = minHeap.poll();
        minHeap.offer(nums[i]);
    }

    // 处理堆中剩余的元素
    while (!minHeap.isEmpty()) {
        nums[idx++] = minHeap.poll();
    }
}

public static void main(String[] args) {
    int[] arr = {6, 5, 3, 2, 8, 10, 9};
    int k = 3;
    sortNearlySortedArray(arr, k);
    System.out.println(Arrays.toString(arr)); // 输出: [2, 3, 5, 6, 8, 9, 10]
}
```

# Odd Even Partition

要将数组调整为奇数在左边，偶数在右边，并且不要求稳定性，可以使用双指针法来实现。该方法通过两个指针从数组的两端开始遍历，找到不符合要求的元素，然后交换它们的位置。这样可以在 O(n) 的时间复杂度内完成操作，空间复杂度为 O(1)。

```java
public static void rearrange(int[] nums) {
    int l = 0;
    int r = nums.length - 1;
    while (l < r) {
        // 在左边找到第一个偶数
        while (l < r && nums[l] % 2 != 0) l++;
        // 在右边找到第一个奇数
        while (l < r && nums[r] % 2 == 0) r--;
        // 交换 左边的偶数 和 右边的奇数
        if (l < r) swap(nums, l, r);
    }
}

public static void main(String[] args) {
    int[] nums = {12, 17, 70, 15, 22, 65, 21, 90};
    rearrange(nums);
    System.out.println(Arrays.toString(nums));
}
```
