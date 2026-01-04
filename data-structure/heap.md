# Max Heap

```java
public class Heap {
    private int[] arr;
    private int size;
    private int cap;
    private int type;
    
    public Heap(int cap, int type) {
        this.cap = cap;
        this.arr = new int[cap];
        this.type = type;
    }
    
    public void heapify() {
        for (int i = size / 2 - 1; i >= 0; i--) {
            moveDown(i);
        }
    }
    
    public void offer(int val) {
        if (isFull()) {
            expandCap();
        }
        arr[size++] = val;
        moveUp(size - 1);
    }
    
    public int poll() {
        if (isEmpty()) {
            throw new ArrayIndexOutOfBoundsException();
        }
        int val = arr[0];
        swapNode(0, size - 1);
        size--;
        moveDown(0);
        return val;
    }
    
    private void moveDown(int par) {
        int l = par * 2 + 1;
        int r = par * 2 + 2;
        int cur = par;
        
        if (l < r && type == 0 ? arr[l] < arr[cur] : arr[l] > arr[cur]) {
            cur = l;
        }
        if (r < size && type == 0 ? arr[r] < arr[cur] : arr[r] > arr[cur]) {
            cur = r;
        }
        
        if (cur != par) {
            swapNode(cur, par);
            moveDown(cur);
        }
    }
    
    private void moveUp(int idx) {
        int cur = idx;
        int val = arr[idx];
        while (cur > 0) {
            int par = (cur - 1) / 2;
            
            if (type == 0 ? arr[par] < val : arr[par] > val) {
                break;
            }
            
            arr[cur] = arr[par];
            cur = par;
        }
        
        if (cur != idx) {
            arr[cur] = val;
        }
    }
    
    private void expandCap() {
        cap += cap >> 1;
        int[] newArr = new int[cap];
        System.arraycopy(arr, 0, newArr, 0, arr.length);
        arr = newArr;
    }
}
```

# Kth Largest Element in an Array

[Problem Description](https://leetcode.cn/problems/kth-largest-element-in-an-array/description)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=141)

```java
public static int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    
    for (int i = 0; i < k; i++) {
        heap.offer(nums[i]);
    }
    
    for (int i = k; i < nums.length; i++) {
        if (nums[i] > heap.peek()) {
            heap.poll();
            heap.offer(nums[i]);
        }
    }
    
    return heap.peek();
}
```

```java
public static int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> queue = new PriorityQueue<>(Collections.reverseOrder());
    for (int num : nums) {
        queue.offer(num);
    }
    for (int i = 0; i < k - 1; i++) {
        queue.poll();
    }
    return queue.poll();
}
```

# Kth Largest Element in a Stream

[Problem Description](https://leetcode.cn/problems/kth-largest-element-in-a-stream/description/)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=142)

```java
public class KthLargest {
    private PriorityQueue<Integer> heap;
    private int k;
    
    public KthLargest(int[] nums, int k) {
        this.heap = new PriorityQueue<>();
        this.k = k;
        
        for (int num : nums) {
            add(num);
        }
        
        System.out.println(Arrays.toString(heap.toArray()));
    }
    
    public int add(int val) {
        if (heap.size() < k) {
            heap.offer(val);
        } else if (val > heap.peek()) {
            heap.poll();
            heap.offer(val);
        }
        return heap.peek();
    }
}
```

# Find Median from Data Stream

[Problem Description](https://leetcode.cn/problems/find-median-from-data-stream/description)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=143&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
class MedianFinder {
    private PriorityQueue<Integer> lq;
    private PriorityQueue<Integer> rq;
    
    public MedianFinder() {
        lq = new PriorityQueue<>(Comparator.reverseOrder());
        rq = new PriorityQueue<>();
    }
    
    public void addNum(int num) {
        if (lq.size() == rq.size()) {
            rq.offer(num);
            lq.offer(rq.poll());
        } else {
            lq.offer(num);
            rq.offer(lq.poll());
        }
    }
    
    public double findMedian() {
        if (lq.size() == rq.size()) {
            return (lq.peek() + rq.peek()) / 2.0;
        } else {
            return lq.peek();
        }
    }
}
```

# Merge k Sorted lists

[Problem Description](https://leetcode.cn/problems/merge-k-sorted-lists/description/)

[Explain, p123, p124](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=123)

```java
/**
 * The algorithm uses a PriorityQueue (min-heap) to efficiently select the minimum element
 * from the cur heads of all the linked lists, ensuring a time complexity of O(N log k),
 * where N is the total number of elements across all lists, and k is the number of lists.
 *
 * The merged result is a new linked list with elements in ascending order.
 *
 * @param lists An array of ListNode objects representing k sorted linked lists.
 * @return A ListNode representing the head of the merged sorted linked list.
 */
public static ListNode mergeKLists(ListNode[] lists) {
    // Create a min-heap (PriorityQueue) to maintain the order of the ListNode objects based on their vals.
    PriorityQueue<ListNode> heap = new PriorityQueue<>();

    // Populate the heap with the initial heads of each linked list.
    for (ListNode listNode : lists) {
        if (listNode != null) {
            heap.offer(listNode);
        }
    }

    // Create a sentinel node to simplify the process of building the merged linked list.
    ListNode s = new ListNode(-1, null);
    ListNode cur = s;

    // Iterate until the heap is empty, extracting the minimum element from the heap,
    // connecting it to the merged result, and adding the next element from the same list to the heap.
    while (!heap.isEmpty()) {
        // Extract the minimum element (node with the smallest value) from the heap.
        ListNode polled = heap.poll();
        
        // Connect the extracted node to the merged result.
        cur.next = polled;
        
        // Move the cur pointer to the newly connected node.
        cur = cur.next;

        // If the extracted node has a next element, add it to the heap for further processing.
        if (polled.next != null) {
            heap.offer(polled.next);
        }
    }
    
    // The s.next points to the head of the merged sorted linked list.
    return s.next;
}
```
