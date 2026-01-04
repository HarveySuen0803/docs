# FIFO Queue (Linked List)

LinkedListQueue 的初始状态 head -> sentinel, tail -> sentienl, sentinel -> sentinel

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241804569.png)

LinkedListQueue 添加数据后的状态 tail.next -> sentinel

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241804570.png)

```java
public class LinkedListQueue<E> implements Queue<E>, Iterable<E> {
    public static class Node<E> {
        E value;
        Node<E> next;
        
        public Node(E value) {
            this.value = value;
        }
        
        public Node(E value, Node<E> next) {
            this.value = value;
            this.next = next;
        }
    }
    
    private Node<E> head = null;
    private Node<E> tail = null;
    private int size = 0;
    private int capacity = 8;
    
    // head -> sentinel, tail -> sentinel, sentinel -> sentinel
    public LinkedListQueue() {
        head = new Node<>(null);
        tail = head;
        head.next = head;
    }
    
    // Add the node to the end of the queue
    // head -> sentinel, tail -> tail node, tail node -> sentinel
    @Override
    public boolean offer(E value) {
        if (isFull()) {
            return false;
        }
        Node<E> node = new Node<>(value);
        node.next = head;
        tail.next = node;
        tail = node;
        size++;
        return true;
    }
    
    // Remove and return the first node.
    @Override
    public E poll() {
        if (isEmpty()) {
            return null;
        }
        Node<E> first = head.next;
        head.next = first.next;
        if (first == tail) {
            tail = head;
        }
        size--;
        return first.value;
    }
    
    // Return the first node;
    @Override
    public E peek() {
        if (isEmpty()) {
            return null;
        }
        return head.next.value;
    }
    
    @Override
    public boolean isEmpty() {
        return head == tail;
    }
    
    @Override
    public boolean isFull() {
        return size == capacity;
    }
    
    @Override
    public Iterator<E> iterator() {
        return new Iterator<E>() {
            Node<E> temp = head.next;
            
            @Override
            public boolean hasNext() {
                return temp != head;
            }
            
            @Override
            public E next() {
                E value = temp.value;
                temp = temp.next;
                return value;
            }
        };
    }
}
```

# FIFO Queue (Array)

ArrayQueue 的初始状态. 此时 head == tail.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241804571.png)

ArrayQueue 添加结点后的状态. 此时 tail == null. 每次添加一个结点, 就需要让 tail 向前移动一格, tail = (tail + 1) % array.length.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241804572.png)

ArrayQueue 填满时的状态. 此时 head = (tail + 1) % array.length.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241804573.png)

ArrayQueue 取出一定结点后的状态. 每次取出一个结点, 就需要让 head 向前移动一格, head = (head + 1) % array.length.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241804574.png)

```java
public class ArrayQueue<E> implements Queue<E>, Iterable<E> {
    private E[] array;
    private int head = 0;
    private int tail = 0;
    private int capacity = 8;
    
    public ArrayQueue() {
        array = (E[]) new Object[capacity  + 1];
    }
    
    public ArrayQueue(int capacity) {
        this.capacity = capacity;
        array = (E[]) new Object[capacity  + 1];
    }
    
    @Override
    public boolean offer(E value) {
        if (isFull()) {
            return false;
        }
        array[tail] = value;
        tail = (tail + 1) % array.length;
        return true;
    }
    
    @Override
    public E poll() {
        if (isEmpty()) {
            return null;
        }
        E value = array[head];
        array[head] = null;
        head = (head + 1) % array.length;
        return value;
    }
    
    @Override
    public E peek() {
        if (isEmpty()) {
            return null;
        }
        return array[head];
    }
    
    @Override
    public boolean isEmpty() {
        return head == tail;
    }
    
    @Override
    public boolean isFull() {
        return head == (tail + 1) % array.length;
    }
    
    @Override
    public Iterator<E> iterator() {
        return new Iterator<E>() {
            int temp = head;
            @Override
            public boolean hasNext() {
                return temp != tail;
            }
            
            @Override
            public E next() {
                E value = array[temp];
                temp = (temp + 1) % array.length;
                return value;
            }
        };
    }
}
```

# FIFO Queue with Size Flag

ArrayQueue 的 Size Flag 存储着 Queue 的大小. 添加了 Size Flag 后, tail 指向的位置可以存储数据, 判断 Queue 是否为空, 以及判断是否满时, 都可以使用 Size Flag 进行判断.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241804575.png)

```java
public class ArrayQueue<E> implements Queue<E>, Iterable<E> {
    private E[] array;
    private int head = 0;
    private int tail = 0;
    private int capacity = 8;
    private int size = 0;
    
    public ArrayQueue() {
        array = (E[]) new Object[capacity];
    }
    
    public ArrayQueue(int capacity) {
        this.capacity = capacity;
        array = (E[]) new Object[capacity];
    }
    
    @Override
    public boolean offer(E value) {
        if (isFull()) {
            return false;
        }
        array[tail] = value;
        tail = (tail + 1) % array.length;
        size++;
        return true;
    }
    
    @Override
    public E poll() {
        if (isEmpty()) {
            return null;
        }
        E value = array[head];
        array[head] = null;
        head = (head + 1) % array.length;
        size--;
        return value;
    }
    
    @Override
    public E peek() {
        if (isEmpty()) {
            return null;
        }
        return array[head];
    }
    
    @Override
    public boolean isEmpty() {
        return size == 0;
    }
    
    @Override
    public boolean isFull() {
        return size == array.length;
    }
    
    @Override
    public Iterator<E> iterator() {
        return new Iterator<E>() {
            int temp = head;
            int count = 0;
            @Override
            public boolean hasNext() {
                return count < size;
            }
            
            @Override
            public E next() {
                E value = array[temp];
                temp = (temp + 1) % array.length;
                count++;
                return value;
            }
        };
    }
}
```

# FIFO Queue with Modulo Index

[Video Explain (p97, p98, p99, p100)](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=97)

```java
public class LinkedListQueue implements Iterable<Integer> {
    private int[] arr;
    private int head = 0;
    private int tail = 0;
    private int cap = 8;
    
    public LinkedListQueue(int cap) {
        // Capacity must be to the nth power of 2
        
        // Just throw the exception
        // if ((capacity & capacity - 1) != 0) {
        //     throw new IllegalArgumentException();
        // }
        
        // Take the nth power of 2 upwards (eg: 3 -> 8, 14 -> 16, 30 -> 32)
        // this.capacity = 1 << (int) (Math.log10(capacity - 1) / Math.log10(2)) + 1;
        
        // Take the nth power of 2 upwards (eg: 3 -> 4, 14 -> 16, 30 -> 32)
        cap -= 1;
        cap |= cap >> 1;
        cap |= cap >> 2;
        cap |= cap >> 4;
        cap |= cap >> 8;
        cap |= cap >> 16;
        cap += 1;
        
        this.cap = cap;
        this.arr = new int[cap];
    }
    
    public void offerLast(int val) {
        if (isFull()) {
            throw new ArrayIndexOutOfBoundsException();
        }
        arr[tail++ & cap - 1] = val;
    }
    
    public int pollFirst() {
        if (isEmpty()) {
            throw new ArrayIndexOutOfBoundsException();
        }
        return arr[head++ & cap - 1];
    }
    
    public boolean isFull() {
        return tail - head == cap;
    }
    
    public boolean isEmpty() {
        return head == tail;
    }
    
    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<Integer>() {
            int cur = head;
            
            @Override
            public boolean hasNext() {
                return cur != tail;
            }
            
            @Override
            public Integer next() {
                return arr[cur++ & cap - 1];
            }
        };
    }
}
```

# Thread Safty

在 Multi Thread 下, 直接调用 offer() 和 poll() 非常不安全, 可以通过 Lock 保证 Thread Safty.

```java
private ReentrantLock lock = new ReentrantLock();

public void offer(E value) {
    lock.lock();
    try {
        array[tail++] = e;
    } finally {
        lock.unlock();
    }
}
```

# Binary Tree Level Order Traversal

[Problem Description](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

```java
/*
         1
        / \
       2   3
      /\  / \
     4  5 6  7
     
     h t
     1 0 0 0 0 0 0 0
        poll root node (1), offer left node (2) and right node (3)
     
       h   t
     1 2 3 0 0 0 0 0
        poll root node (2), offer left node (4) and right node (5)
     
         h     t
     1 2 3 4 5 0 0 0
        poll root node (3), offer left node (6) and right node (7)
     
           h       t
     1 2 3 4 5 6 7 0
        pool root node (4), there are no child nodes to offer
 */
public static void levelOrder(TreeNode root) {
    LinkedList<TreeNode> queue = new LinkedList<>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        TreeNode poll = queue.poll();
        System.out.print(poll + " ");

        if (poll.left != null) {
            queue.offer(poll.left);
        }
        if (poll.right != null) {
            queue.offer(poll.right);
        }
    }
}

public static void levelOrderWithFormat(TreeNode root) {
    LinkedList<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    
    while (!queue.isEmpty()) {
        int curSize = queue.size();
        for (int i = 0; i < curSize; i++) {
            TreeNode poll = queue.poll();
            System.out.print(poll + " ");
            
            if (poll.left != null) {
                queue.offer(poll.left);
            }
            if (poll.right != null) {
                queue.offer(poll.right);
            }
        }
        System.out.println();
    }
}
```

# Binary Tree Zigzag Level Order Traversal

[Problem Description](https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal/description/)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=117)

```java
/**
 * This method performs a zigzag level order traversal of a binary tree.
 * It uses a breadth-first search (BFS) strategy, with a queue to keep track of nodes at each level.
 * The zigzag pattern is achieved by using a flag 'isOdd' that alternates at each level.
 * If 'isOdd' is true, we add the node's value at the end of the list; if it's false, we add at the beginning.
 * This results in a left-to-right order for odd-numbered levels and right-to-left for even-numbered levels.
 *
 * @param root The root node of the binary tree.
 * @return A list of lists of Integers representing the zigzag level order traversal of the tree.
 */
public static List<List<Integer>> zigzagLevelOrder(TreeNode root) {
    // Initialize the list to hold each level's nodes
    List<List<Integer>> level1 = new ArrayList<>();
    // If the tree is empty, return the empty list
    if (root == null) {
        return level1;
    }

    // Initialize the queue and offer the root node to it
    LinkedList<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    // Initialize the flag for checking the level order (odd or even)
    boolean isOdd = true;

    // Continue until the queue is empty
    while (!queue.isEmpty()) {
        // Initialize the list to hold the current level's nodes
        LinkedList<Integer> level2 = new LinkedList<>();
        // Get the number of nodes in the current level
        int curSize = queue.size();

        // Process each node in the current level
        for (int i = 0; i < curSize; i++) {
            // Pop a node from the front of the queue
            TreeNode node = queue.pop();
            
            // Check the level order and add the node's value to the level list accordingly
            if (isOdd) {
                level2.addLast(node.val);
            } else {
                level2.addFirst(node.val);
            }

            // If the node has a left child, offer it to the queue
            if (node.left != null) {
                queue.offer(node.left);
            }
            // If the node has a right child, offer it to the queue
            if (node.right != null) {
                queue.offer(node.right);
            }
        }
        // Add the current level's nodes to the final list
        level1.add(level2);
        // Flip the level order for the next level
        isOdd = !isOdd;
    }

    // Return the final list of levels
    return level1;
}
```

# Double-End Queue (Linked List)

```java
public class LinkedListDeque<E> implements Deque<E>, Iterable<E> {
    private int capacity;
    private int size;
    private Node<E> sentinel;
    
    public LinkedListDeque() {
        this.capacity = 8;
        this.sentinel = new Node<>(null);
        sentinel.prev = sentinel;
        sentinel.next = sentinel;
    }
    
    public LinkedListDeque(int capacity) {
        this.capacity = capacity;
        this.sentinel = new Node<>(null);
        sentinel.prev = sentinel;
        sentinel.next = sentinel;
    }
    
    private static class Node<E> {
        E value;
        Node<E> prev;
        Node<E> next;
        
        public Node(E value) {
            this.value = value;
        }
        
        public Node(E value, Node<E> prev, Node<E> next) {
            this.value = value;
            this.prev = prev;
            this.next = next;
        }
    }
    
    @Override
    public boolean offerFirst(E e) {
        if (isFull()) {
            return false;
        }
        
        Node<E> a = sentinel;
        Node<E> b = new Node<>(e);
        Node<E> c = sentinel.next;
        a.next = b;
        b.prev = a;
        b.next = c;
        c.prev = b;
        size++;
        return true;
    }
    
    @Override
    public boolean offerLast(E e) {
        if (isFull()) {
            return false;
        }
        Node<E> a = sentinel.next;
        Node<E> b = new Node<>(e);
        Node<E> c = sentinel;
        a.next = b;
        b.prev = a;
        b.next = c;
        c.prev = b;
        size++;
        return true;
    }
    
    @Override
    public E pollFirst() {
        if (isEmpty()) {
            return null;
        }
        Node<E> a = sentinel;
        Node<E> b = sentinel.next;
        Node<E> c = sentinel.next.next;
        a.next = c;
        c.prev = a;
        size--;
        return b.value;
    }
    
    @Override
    public E pollLast() {
        if (isEmpty()) {
            return null;
        }
        Node<E> a = sentinel.prev.prev;
        Node<E> b = sentinel.prev;
        Node<E> c = sentinel;
        a.next = c;
        c.prev = a;
        return b.value;
    }
    
    @Override
    public E peekFirst() {
        if (isEmpty()) {
            return null;
        }
        return sentinel.next.value;
    }
    
    @Override
    public E peekLast() {
        return sentinel.prev.value;
    }
    
    @Override
    public boolean isEmpty() {
        return size == 0;
    }
    
    @Override
    public boolean isFull() {
        return size == capacity;
    }
    
    @Override
    public Iterator<E> iterator() {
        return new Iterator<E>() {
            Node<E> temp = sentinel.next;
            
            @Override
            public boolean hasNext() {
                return temp != sentinel;
            }
            
            @Override
            public E next() {
                E value = temp.value;
                temp = temp.next;
                return value;
            }
        };
    }
}
```

# Double-End Queue (Array)

```java
public class ArrayDeque<E> implements Deque<E>, Iterable<E> {
    private E[] array;
    private int head;
    private int tail;
    
    public ArrayDeque() {
        array = (E[]) new Object[8 + 1];
    }
    
    public ArrayDeque(int capacity) {
        array = (E[]) new Object[capacity + 1];
    }
    
    /*
        h           t
        0   1   2   3   4   5   6
        a   b   c
        
                    t           h
        0   1   2   3   4   5   6
        a   b   c               d
     */
    @Override
    public boolean offerFirst(E e) {
        if (isFull()) {
            return false;
        }
        head = dec(head);
        array[head] = e;
        return true;
    }
    
    /*
        h   t
        0   1   2   3   4   5   6
        a
        
        h       t
        0   1   2   3   4   5   6
        a   b
     */
    @Override
    public boolean offerLast(E e) {
        if (isFull()) {
            return false;
        }
        array[tail] = e;
        tail = inc(tail);
        return true;
    }
    
    /*
                    t           h
        0   1   2   3   4   5   6
        a   b   c               d
        
        h           t
        0   1   2   3   4   5   6
        a   b   c
     */
    @Override
    public E pollFirst() {
        if (isEmpty()) {
            return null;
        }
        E value = array[head];
        array[head] = null; // GC
        head = inc(head);
        return value;
    }
    
    /*
                    t       h
        0   1   2   3   4   5   6
        a   b   c           f   d
        
                t           h
        0   1   2   3   4   5   6
        a   b               f   d
     */
    @Override
    public E pollLast() {
        if (isEmpty()) {
            return null;
        }
        tail = dec(tail);
        E value = array[tail];
        array[tail] = null; // GC
        return value;
    }
    
    @Override
    public E peekFirst() {
        if (isEmpty()) {
            return null;
        }
        return array[head];
    }
    
    @Override
    public E peekLast() {
        if (isEmpty()) {
            return null;
        }
        return array[dec(tail)];
    }
    
    /*
        h
        t
        0   1   2   3   4   5   6
     */
    @Override
    public boolean isEmpty() {
        return tail == head;
    }
    
    /*
        head < tail, tail - head == array.length - 1
        h           t
        0   1   2   3
        
        tail < head, head - tail == 1
            t   h
        0   1   2   3
     */
    @Override
    public boolean isFull() {
        if (head < tail && tail - head == array.length - 1) {
            return true;
        }
        
        if (tail < head && head - tail == 1) {
            return true;
        }
        
        return false;
    }
    
    @Override
    public Iterator<E> iterator() {
        return new Iterator<E>() {
            int temp = head;
            
            @Override
            public boolean hasNext() {
                return temp != tail;
            }
            
            @Override
            public E next() {
                E value = array[temp];
                temp = inc(temp);
                return value;
            }
        };
    }
    
    /*
        通过 inc() 向前移动索引, 避免指针越界
        
                    t            t
        0   1   2   3    ===>    0   1   2   3
     */
    private int inc(int i) {
        if (i + 1 >= array.length) {
            return 0;
        }
        return i + 1;
    }
    
    /*
        通过 dec() 向后移动索引, 避免指针越界
        
        h                                    t
        0   1   2   3    ===>    0   1   2   3
     */
    private int dec(int i) {
        if (i - 1 < 0) {
            return array.length - 1;
        }
        return i - 1;
    }
}
```

# Priority Queue (Unsorted Array)

添加 Node 时不进行 Sort, TC 为 `O(1)`. 取出 Node 时, 通过 Select Sort 取出 Priority 最高的 Node, TC 为 `O(n)`

```java
public class Entry {
    public int prio;
    public int val;
    
    public Entry(int prio, int val) {
        this.prio = prio;
        this.val = val;
    }
    
    @Override
    public String toString() {
        return "Node{" +
                   "prio=" + prio +
                   ", val=" + val +
                   '}';
    }
}
```

```java
public class PriorityQueue implements Iterable<Entry> {
    private Entry[] entries;
    private int size;
    private int cap;
    
    public PriorityQueue(int cap) {
        this.cap = cap;
        this.entries = new Entry[cap];
    }
    
    public void offer(Entry entry) {
        if (isFull()) {
            throw new ArrayIndexOutOfBoundsException();
        }
        entries[size++] = entry;
    }
    
    public Entry poll() {
        if (isEmpty()) {
            throw new ArrayIndexOutOfBoundsException();
        }
        
        int maxIdx = getMaxIdx();
        Entry maxEntry = entries[maxIdx];
        System.arraycopy(entries, maxIdx + 1, entries, maxIdx, size - maxIdx - 1);
        entries[size--] = null; // GC
        return maxEntry;
    }
    
    public Entry peek() {
        if (isEmpty()) {
            throw new ArrayIndexOutOfBoundsException();
        }
        
        return entries[getMaxIdx()];
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
    
    public boolean isFull() {
        return size == cap;
    }
    
    public int getMaxIdx() {
        int maxIdx = 0;
        
        for (int i = 0; i < size; i++) {
            if (entries[maxIdx].prio < entries[i].prio) {
                maxIdx = i;
            }
        }
        
        return maxIdx;
    }
    
    @Override
    public Iterator<Entry> iterator() {
        return new Iterator<Entry>() {
            int cur = 0;
            
            @Override
            public boolean hasNext() {
                return cur != size;
            }
            
            @Override
            public Entry next() {
                return entries[cur++];
            }
        };
    }
}
```

```java
public class Main {
    public static void main(String[] args) throws FileNotFoundException {
        Queue queue = new PriorityQueue();
        queue.offer(new Entry(3, 30));
        queue.offer(new Entry(1, 10));
        queue.offer(new Entry(4, 40));
        queue.offer(new Entry(6, 60));
        queue.offer(new Entry(2, 20));
        queue.offer(new Entry(5, 50));
        
        System.out.println(queue.poll());
        System.out.println(queue.poll());
        System.out.println(queue.poll());
    }
}
```

# Priority Queue (Sorted Array)

添加 Node 时, 通过 Insert Sort 按照 Priority 大小进行添加, TC 为 `O(n)`. 取出 Node 时, 直接取出 Tail Node 即可, TC 为 `O(1)`

```java
public void offer(Entry entry) {
    if (isFull()) {
        throw new ArrayIndexOutOfBoundsException();
    }
    int idx = size;
    while (idx > 0 && entries[idx - 1].prio > entry.prio) {
        entries[idx] = entries[idx - 1];
        idx--;
    }
    entries[idx] = entry;
    size++;
}

public Entry poll() {
    if (isEmpty()) {
        throw new ArrayIndexOutOfBoundsException();
    }
    
    Entry maxEntry = entries[size - 1];
    entries[--size] = null; // GC
    return maxEntry;
}
```

# Priority Queue (Heap)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241804576.png)

Parent Node Index (PNI), Sub Node Index(SNI), Left Sub Node Index (LSNI), Right Sub Node Index (RSNI), Last Non Leaf Node (LNLN)

- PNI = (SNI - 1) / 2
- LSNI = 2 * PNI + 1
- RSNI = 2 * PNI + 2
- LNLN = size / 2 - 1

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=121)

添加 Node 时, 通过 Max Heap, 根据 Priority 添加 Node 到对应的位置, TC 为 O(logn). 取出 Node 时, 交换 Head Node 和 Tail Node, 直接取出 Head Node, 再对 Tail Node 进行 Heapify, 让该 Node 去到对应的位置, TC 为 O(logn)

```java
public void offer(Entry entry) {
    if (isFull()) {
        throw new ArrayIndexOutOfBoundsException();
    }
    int cur = size++;
    int par = (cur - 1) / 2;
    while (cur > 0 && entry.prio > entries[par].prio) {
        entries[cur] = entries[par];
        cur = par;
        par = (cur - 1) / 2;
    }
    entries[cur] = entry;
}

public Entry poll() {
    if (isEmpty()) {
        throw new ArrayIndexOutOfBoundsException();
    }
    
    swapNode(0, size - 1);
    Entry maxEntry = entries[size - 1];
    entries[--size] = null; // GC
    maxHeapify(0);
    return maxEntry;
}

private void maxHeapify(int par) {
    int l = 2 * par + 1;
    int r = 2 * par + 2;
    int cur = par;
    
    if (l < size && entries[cur].prio < entries[l].prio) {
        cur = l;
    }
    if (r < size && entries[cur].prio < entries[r].prio) {
        cur = r;
    }
    if (cur != par) {
        swapNode(cur, par);
        maxHeapify(par);
    }
}

private void minHeapify(int par) {
    int l = 2 * par + 1;
    int r = 2 * par + 2;
    int cur = par;
    
    if (l < size && entries[cur].prio > entries[l].prio) {
        cur = l;
    }
    if (r < size && entries[cur].prio > entries[r].prio) {
        cur = r;
    }
    if (cur != par) {
        swapNode(cur, par);
        maxHeapify(par);
    }
}

private void swapNode(int i, int j) {
    Entry tmp = entries[i];
    entries[i] = entries[j];
    entries[j] = tmp;
}
```

# Implement Stack using Queues

[Problem Description](https://leetcode.cn/problems/implement-stack-using-queues/description/)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=111)

```java
/*
    Stack
        I: a, b, c, d
        O: d, c, b, a
        
    Queue
        I: a, b, c, d
        O: a, b, c, d
    
    s -> a
        Offer b
    s -> b -> a
        Poll a
    s -> b
        Offer a
    s -> a -> b
        Offer c
    s -> c -> a -> b
        Poll b
        Offer b
        Poll a
        Offer a
    s -> a -> b -> c
 */
public class MyStack {
    LinkedList<Integer> queue = new LinkedList<>();
    
    public void push(int x) {
        queue.offer(x);
        for (int i = 0; i < queue.size() - 1; i++) {
            queue.offer(queue.poll());
        }
    }
}
```

# Blocking Queue (Single Lock)

[Explain p129, p130](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=129)

```java
wpublic class BlockingQueue {
    private int[] arr;
    private int head;
    private int tail;
    private int size;
    private int cap;
    private ReentrantLock lock;
    private Condition headWaits;
    private Condition tailWaits;
    
    public BlockingQueue(int cap) {
        this.cap = cap;
        this.arr = new int[cap];
        this.lock = new ReentrantLock();
        this.headWaits = lock.newCondition();
        this.tailWaits = lock.newCondition();
    }
    
    public void offer(int val) throws InterruptedException {
        lock.lock();
        
        try {
            // Queue 满时, 想要添加 Node, 得先进入等待, 这里需要使用 while, 如果使用 if 就会存在 False Awaken
            while (isFull()) {
                tailWaits.await();
            }
            
            arr[tail] = val;
            tail = (tail + 1) % cap;
            size++;
            
            // 刚添加了 1 个 Node, 此时 Queue 非空, 可以唤醒 poll() 中的 Thread 去获取 Node 了
            headWaits.signal();
        } finally {
            lock.unlock();
        }
    }

    // Expiration Policy
    public boolean offer(E e, long timeout) throws InterruptedException {
        tailLock.lock();
        try {
            while (isFull()) {
                if (tailWaits.awaitNanos(TimeUnit.MILLISECONDS.toNanos(timeout)) <= 0) {
                    return false;
                }
            }
            arr[tail] = val;
            tail = (tail + 1) % cap;
            size++;
        } finally {
            tailLock.unlock();
        }
        return true;
    }
    
    public int poll() throws InterruptedException {
        lock.lock();
        
        try {
            // Queue 空时, 想要获取 Node, 得先进入等待
            while (isEmpty()) {
                headWaits.await();
            }
            
            int val = arr[head];
            head = (head + 1) % cap;
            size--;
            
            // 刚移除了 1 个 Node, 此时 Queue 非满, 可以唤醒 offer() 中的 Thread 去添加 Node 了
            tailWaits.signal();
            
            return val;
        } finally {
            lock.unlock();
        }
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
    
    public boolean isFull() {
        return size == cap;
    }
}
```

# Blocking Queue (Double Lock)

[Explain p131, p132, p133, p134, p135](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=131)

```java
public class BlockingQueue {
    private int[] arr;
    private int head;
    private int tail;
    private AtomicInteger size;
    private int cap;
    private ReentrantLock headLock;
    private ReentrantLock tailLock;
    private Condition headWaits;
    private Condition tailWaits;
    
    public BlockingQueue(int cap) {
        this.cap = cap;
        this.arr = new int[cap];
        this.size = new AtomicInteger(0);
        this.headLock = new ReentrantLock();
        this.tailLock = new ReentrantLock();
        this.headWaits = headLock.newCondition();
        this.tailWaits = tailLock.newCondition();
    }

    public void offer(int val) throws InterruptedException {
        tailLock.lock();
        try {
            while (isFull()) {
                tailWaits.await();;
            }
            
            arr[tail] = val;
            tail = (tail + 1) % cap;
            // size 是线程不安全的, 持有 headLock 和 tailLock 的线程都可以操作 size, 需要通过 AtomicInteger 保证线程安全
            size.getAndIncrement();
            
            // Cascade Awaken
            if (size.get() < cap) {
                tailWaits.signal();
            }
        } finally {
            tailLock.unlock();
        }

        // 释放了 tailLock 之后, 再去获取 headLock 调用 signal(), 采用 Cascade Awake 唤醒 poll() 中等待的 Thread, 避免 Dead Lock
        if (size.get() == 1) {
            headLock.lock();
            
            try {
                headWaits.signal();
            } finally {
                headLock.unlock();
            }
        }
    }
    
    public int poll() throws InterruptedException {
        headLock.lock();
        int val;
        try {
            while (isEmpty()) {
                headWaits.await();
            }
            
            val = arr[head];
            head = (head + 1) % cap;
            size.getAndDecrement();
            
            // Cascade Awaken
            if (size.get() > 0) {
                headWaits.signal();
            }
        } finally {
            headLock.unlock();
        }

        // 释放了 headLock 之后, 再去获取 tailLock 调用 signal(), 采用 Cascade Awake 唤醒 offer() 中等待的 Thread, 避免 Dead Lock
        if (c == cap - 1) {
            tailLock.lock();
            try {
                tailWaits.signal();
            } finally {
                tailLock.unlock();
            }
        }
        
        return val;
    }
}
```

# Monotonic Queue

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=181&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * This class represents a Monotonic Queue data structure.
 * The core idea of this algorithm is to maintain a queue in which the elements are always in a certain order (monotonic).
 * This is achieved by removing elements from the end of the queue that are smaller than the new element being added.
 * This ensures that the first element in the queue is always the largest one.
 */
public class MonotonicQueue {
    // LinkedList is used as the underlying data structure for the deque
    private LinkedList<Integer> deque;

    public MonotonicQueue() {
        this.deque = new LinkedList<>();
    }

    public Integer peek() {
        return deque.peekFirst();
    }

    public Integer poll() {
        return deque.pollFirst();
    }

    /**
     * This method adds a new element to the deque.
     * Before adding, it removes all elements from the end of the deque that are smaller than the new element.
     * This ensures that the deque is always in decreasing order.
     * @param val the new element to be added to the deque.
     */
    public void offer(Integer val) {
        // Remove elements from the end of the deque that are smaller than the new element
        while (!deque.isEmpty() && deque.peekLast() < val) {
            deque.pollLast();
        }
        // Add the new element to the end of the deque
        deque.offerLast(val);
    }
}
```

# Sliding Window Maximum

[Problem Description](https://leetcode.cn/problems/sliding-window-maximum/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=181&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * The algorithm uses a Monotonic Queue to efficiently find the maximum element in the sliding window.
 * It iterates through the array and maintains a Monotonic Queue to store potential maximum elements.
 * At each step, it adds the current element to the queue and checks if the front element (oldest) of the queue
 * is outside the current sliding window. If so, it removes that element from the queue.
 * The front element of the queue always represents the maximum element within the current sliding window.
 * 
 * @param nums An array of integers.
 * @param k The size of the sliding window.
 * @return An array containing the maximum element in each sliding window.
 */
public static int[] maxSlidingWindow(int[] nums, int k) {
    // List to store the maximum elements in each sliding window
    List<Integer> list = new ArrayList<>();
    
    // MonotonicQueue to maintain the maximum elements
    MonotonicQueue queue = new MonotonicQueue();
    
    // Iterate through the array
    for (int i = 0; i < nums.length; i++) {
        // Check if the front element of the queue is going out of the sliding window
        if (i >= k && queue.peek() == nums[i - k]) {
            queue.poll();
        }
        
        // Add the current element to the MonotonicQueue
        queue.offer(nums[i]);
        
        // Check if the window is fully formed, add the maximum element to the list
        if (i >= k - 1) {
            list.add(queue.peek());
        }
    }
    
    // Convert the ArrayList to an int array and return
    return list.stream()
               .mapToInt(Integer::intValue)
               .toArray();
}
```

