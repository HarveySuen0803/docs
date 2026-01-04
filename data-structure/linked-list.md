# Single Linked List

```java
public class SingleLinkedList {
    private Node head;
    
    public SingleLinkedList() {
        head = new Node(0);
    }
    
    private static class Node {
        public int value;
        public Node next;
        
        public Node (int value) {
            this.value = value;
        }
    }
    
    public void add(int index, int value) {
        Node prev = findNode(index - 1);
        if (prev == null) {
            throw new IllegalArgumentException();
        }
        Node node = new Node(value);
        node.next = prev.next;
        prev.next = node;
    }

    public void addFirst(int value) {
        add(0, value);
    }
    
    public void addLast(int value) {
        add(findLastIndex() + 1, value);
    }
    
    public int get(int index) {
        Node node = findNode(index);
        if (node == null) {
            throw new IllegalArgumentException();
        }
        return node.value;
    }
    
    public void remove(int index) {
        Node prev = findNode(index - 1);
        if (prev == null) {
            throw new IllegalArgumentException();
        }
        Node node = prev.next;
        if (node == null) {
            throw new IllegalArgumentException();
        }
        prev.next = node.next;
    }

    public void removeFist() {
        remove(0);
    }
    
    public void removeLast() {
        remove(findLastIndex());
    }
    
    private int findLastIndex() {
        Node temp = head;
        int i = -1; // -1 is head
        while (temp.next != null) {
            i++;
            temp = temp.next;
        }
        return i;
    }
    
    private Node findNode(int index) {
        Node temp = head;
        int i = -1; // -1 is head
        while (temp != null) {
            if (i == index) {
                return temp;
            }
            i++;
            temp = temp.next;
        }
        return null;
    }
    
    public void print() {
        Node temp = head.next;
        while (temp != null) {
            System.out.print(temp.value + " ");
            temp = temp.next;
        }
    }
}
```

# Double Linked List

```java
public class DoubleLinkedList {
    private Node head;
    private Node tail;
    
    private static class Node {
        public int value;
        public Node prev;
        public Node next;
        
        public Node (int value) {
            this.value = value;
        }
    }
    
    public DoubleLinkedList() {
        this.head = new Node(0);
        this.tail = new Node(0);
        head.next = tail;
        tail.prev = head;
    }
    
    public void add(int index, int value) {
        Node prev = findNode(index - 1);
        if (prev == null) {
            throw new IllegalArgumentException();
        }
        Node next = prev.next;
        
        Node node = new Node(value);
        node.next = next;
        next.prev = node;
        node.prev = prev;
        prev.next = node;
    }
    
    public void addLast(int value) {
        Node prev = tail.prev;
        Node node = new Node(value);
        
        node.next = tail;
        tail.prev = node;
        node.prev = prev;
        prev.next = node;
    }
    
    public void remove(int index) {
        Node prev = findNode(index - 1);
        if (prev == null) {
            throw new IllegalArgumentException();
        }
        Node node = prev.next;
        if (node == tail) {
            throw new IllegalArgumentException();
        }
        Node next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    
    public void removeFirst() {
        remove(0);
    }
    
    public void removeLast() {
        Node node = tail.prev;
        if (node == head) {
            throw new IllegalArgumentException();
        }
        Node prev = node.prev;
        prev.next = tail;
        tail.prev = prev;
    }
    
    private Node findNode(int index) {
        int i = -1;
        Node temp = head;
        while (temp != null) {
            if (i == index) {
                return temp;
            }
            i++;
            temp = temp.next;
        }
        return null;
    }
    
    // Traverse linked list with loop
    public void print1() {
        Node temp = head.next;
        while (temp != tail) {
            System.out.println(temp.value + " ");
            temp = temp.next;
        }
    }
    
    // Traverse linked list with recursion
    public void print2() {
        recursion(head.next);
    }
    
    private void recursion(Node node) {
        if (node == tail) {
            return;
        }
        System.out.println(node.value);
        recursion(node.next);
    }
}
```

# Cycle Linked List

```java
ic class CycleLinkedList {
    private Node head;
    
    private static class Node {
        public int value;
        public Node prev;
        public Node next;
        
        public Node (int value) {
            this.value = value;
        }
    }
    
    public CycleLinkedList() {
        this.head = new Node(0);
        head.next = head;
        head.prev = head;
    }
    
    public void addFirst(int value) {
        Node node = new Node(value);
        Node next = head.next;
        
        head.next = node;
        node.prev = head;
        node.next = next;
        next.prev = node;
    }
    
    public void addLast(int value) {
        Node prev = head.prev;
        Node node = new Node(value);
        
        prev.next = node;
        node.prev = prev;
        node.next = head;
        head.prev = node;
    }
    
    public void removeFirst() {
        Node node = head.next;
        if (node == head) {
            throw new IllegalArgumentException();
        }
        Node next = node.next;
        
        head.next = next;
        next.prev = head;
    }
    
    public void removeLast() {
        Node node = head.prev;
        if (node == head) {
            throw new IllegalArgumentException();
        }
        Node prev = node.prev;
        prev.next = head;
        head.prev = prev;
    }
    
    public void removeByValue(int value) {
        Node node = findNodeByValue(value);
        if (node == null) {
            throw new IllegalArgumentException();
        }
        Node prev = node.prev;
        Node next = node.next;
        
        prev.next = next;
        next.prev = prev;
    }
    
    private Node findNodeByValue(int value) {
        Node temp = head.next;
        while (temp != head) {
            if (temp.value == value) {
                return temp;
            }
            temp = temp.next;
        }
        return null;
    }
    
    // Traverse linked list with loop
    public void print1() {
        Node temp = head.next;
        while (temp != head) {
            System.out.println(temp.value);
            temp = temp.next;
        }
    }
    
    // Traverse linked list with recursion
    public void print2() {
        recursion(head.next);
    }
    
    private void recursion(Node node) {
        if (node == head) {
            return;
        }
        System.out.println(node.value);
        recursion(node.next);
    }
}
```

# Reverse List

```java
/*
    list1               list2
    1 -> 2 -> 3 -> 4    null
    
    list1               list2
    2 -> 3 -> 4         1
    
    list1               list2
    3 -> 4              2 -> 1
    
    list1               list2
    4                   3 -> 2 -> 1
    
    list1               list2
    null                4 -> 3 -> 2 -> 1
 */
public static ListNode reverseList(ListNode head) {
    ListNode nil = new ListNode(-1, null);
    ListNode cur = head;
    while (cur != null) {
        ListNode nxt = cur.next;
        cur.next = nil.next;
        nil.next = cur;
        cur = nxt;
    }
    return nil.next;
}

public static void main(String[] args) {
    ListNode head = new ListNode(1);
    head.next = new ListNode(2);
    head.next.next = new ListNode(3);
    ListNode result = reverseList(head);
    System.out.println(result);
}
```

# Reverse List

```java
public static ListNode reverseList(ListNode head) {
    ListNode nil = new ListNode(-1, null);
    ListNode cur = head;
    while (cur != null) {
        nil.next = new ListNode(cur.val, nil.next);
        cur = cur.next;
    }
    return nil.next;
}
```

# Reverse List

```java
/*
    list1               list2
    1 -> 2 -> 3 -> 4    null
    
    list1               list2
    2 -> 3 -> 4         1
    
    list1               list2
    3 -> 4              2 -> 1
    
    list1               list2
    4                   3 -> 2 -> 1
    
    list1               list2
    null                4 -> 3 -> 2 -> 1
 */
public static ListNode reverseList(ListNode head) {
    List list1 = new List(head);
    List list2 = new List(null);
    while (true) {
        ListNode first = list1.removeFirst();
        if (first == null) {
            break;
        }
        list2.addFirst(first);
    }
    return list2.head;
}

public static class List {
    ListNode head;
    
    public List(ListNode head) {
        this.head = head;
    }
    
    public void addFirst(ListNode first) {
        first.next = head;
        head = first;
    }
    
    public ListNode removeFirst() {
        ListNode first = head;
        if (first != null) {
            head = head.next;
        }
        return first;
    }
}
```

# Reverse List

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=72)

```java
/*
    n4 = () {
        n4 = () {
            n4 = () {
                return n4
            }
            n4 -> n3 // n4 -> n3
            n3 -> null // n1 -> n2 -> n3, 
            return n4
        }
        n3 -> n2 // n4 -> n3 -> n2
        n2 -> null  // n1 -> n2
        return n4
    }
    n2 -> n1 // n4 -> n3 -> n2 -> n1
    n1 -> null

    return n4
 */
public static ListNode reverseList(ListNode node) {
    if (node == null || node.next == null) {
        return node;
    }
    ListNode last = reverseList(node.next);
    node.next.next = node;
    node.next = null;
    return last;
}
```

# Reverse List

```java
/*
    n1
    o1   o2
    1 -> 2 -> 3 -> 4
    
    n1   o1   o2
    2 -> 1 -> 3 -> 4
    
    n1        o1   o2
    3 -> 2 -> 1 -> 4
    
    n1             o1   o2
    4 -> 3 -> 2 -> 1
 */
public static ListNode reverseList(ListNode o1) {
    if (o1 == null || o1.next == null) {
        return o1;
    }
    
    ListNode n1 = o1;
    ListNode o2 = o1.next;
    while (o2 != null) {
        o1.next = o2.next;
        o2.next = n1;
        n1 = o2;
        o2 = o1.next;
    }
    return n1;
}
```

# Reverse Linked List II

[Problem Description](https://leetcode.cn/problems/reverse-linked-list-ii/description/)

```java
public static ListNode reverseBetween(ListNode head, int l, int r) {
    ListNode nil = new ListNode(-1, head);
    ListNode cur = nil;
    for (int i = 0; i < l - 1; i++) {
        cur = cur.next;
    }
    ListNode beforeSrt = cur;
    ListNode srt = cur.next;
    for (int i = 0; i < r - l + 1; i++) {
        cur = cur.next;
    }
    ListNode end = cur;
    ListNode afterEnd = cur.next;
    srt = reverseList(srt, end);
    end = srt;
    while (end.next != null) {
        end = end.next;
    }
    beforeSrt.next = srt;
    end.next = afterEnd;
    return nil.next;
}

public static ListNode reverseList(ListNode srt, ListNode end) {
    ListNode nil = new ListNode(-1, null);
    ListNode cur = srt;
    while (cur != end.next) {
        nil.next = new ListNode(cur.val, nil.next);
        cur = cur.next;
    }
    return nil.next;
}

public static void main(String[] args) {
    ListNode head = new ListNode(1);
    head.next = new ListNode(2);
    head.next.next = new ListNode(3);
    head.next.next.next = new ListNode(4);
    head.next.next.next.next = new ListNode(5);
    System.out.println(reverseBetween(head, 2, 4)); // 1 -> 4 -> 3 -> 2 -> 5
}
```

# Swap Nodes in Pairs

[Problem Description](https://leetcode.cn/problems/swap-nodes-in-pairs/description/?envType=study-plan-v2&envId=top-100-liked)

```java
public static ListNode swapPairs(ListNode head) {
    if (head == null) {
        return null;
    }

    ListNode p1 = head;
    ListNode p2 = head.next;
    while (p2 != null) {
        int t = p1.val;
        p1.val = p2.val;
        p2.val = t;
        
        if (p2.next == null) {
            break;
        }
        p1 = p1.next.next;
        p2 = p2.next.next;
    }
    return head;
}
```

# Reverse Nodes in k-Group

[Problem Description](https://leetcode.cn/problems/reverse-nodes-in-k-group/description/?envType=study-plan-v2&envId=top-100-liked)

```java
/*
    end
    srt                                    cur
    1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8   nil -> N
    -----------------------------------------------------------------------
    srt       end                          cur
    1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8   nil -> N
    -----------------------------------------------------------------------
    srt       end                                           cur
    1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8   nil -> 3 -> 2 -> 1
    -----------------------------------------------------------------------
                   srt
                   end                                      cur
    1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8   nil -> 3 -> 2 -> 1
    -----------------------------------------------------------------------
                   srt
                   end                                      cur
    1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8   nil -> 3 -> 2 -> 1
    -----------------------------------------------------------------------
                   srt       end                            cur
    1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8   nil -> 3 -> 2 -> 1
    -----------------------------------------------------------------------
                   srt       end                                           cur
    1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8   nil -> 3 -> 2 -> 1 -> 6 -> 5 -> 4
    -----------------------------------------------------------------------
                                  srt  end                                 cur
    1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8   nil -> 3 -> 2 -> 1 -> 6 -> 5 -> 4 -> 7 -> 8
 */
public static ListNode reverseKGroup(ListNode head, int k) {
    int i = 0;
    ListNode nil = new ListNode(-1, null);
    ListNode srt = head;
    ListNode end = head;
    ListNode cur = nil;
    while (end != null) {
        if (++i % k == 0) {
            cur.next = reverseGroup(srt, end);
            while (cur.next != null) {
                cur = cur.next;
            }
            srt = end.next;
            end = end.next;
        } else {
            end = end.next;
        }
    }
    if (i % k != 0) {
        cur.next = srt;
    }
    return nil.next;
}

public static ListNode reverseGroup(ListNode srt, ListNode end) {
    ListNode nil = new ListNode(-1, null);
    while (srt != end.next) {
        nil.next = new ListNode(srt.val, nil.next);
        srt = srt.next;
    }
    return nil.next;
}
```

# Reverse Nodes in k-Group

```java
public static ListNode reverseKGroup(ListNode head, int k) {
    ListNode nil = new ListNode(-1, head);
    ListNode beforeSrt = nil;
    ListNode srt = nil.next;
    ListNode cur = nil.next;
    int i = 0;
    while (cur != null) {
        if (++i % k == 0) {
            ListNode end = cur;
            ListNode afterEnd = cur.next;
            srt = reverseList(srt, end);
            end.next = null;
            end = srt;
            while (end.next != null) {
                end = end.next;
            }
            beforeSrt.next = srt;
            end.next = afterEnd;
            beforeSrt = end;
            srt = end.next;
            cur = end;
        }
        cur = cur.next;
    }
    return nil.next;
}

public static ListNode reverseList(ListNode srt, ListNode end) {
    ListNode nil = new ListNode(-1, null);
    ListNode cur = srt;
    while (cur != end) {
        nil.next = new ListNode(cur.val, nil.next);
        cur = cur.next;
    }
    nil.next = new ListNode(cur.val, nil.next);
    return nil.next;
}

public static void main(String[] args) {
    ListNode head = new ListNode(1);
    head.next = new ListNode(2);
    head.next.next = new ListNode(3);
    head.next.next.next = new ListNode(4);
    head.next.next.next.next = new ListNode(5);
    head.next.next.next.next.next = new ListNode(6);
    head.next.next.next.next.next.next = new ListNode(7);
    head.next.next.next.next.next.next.next = new ListNode(8);
    System.out.println(reverseKGroup(head, 3)); // 3 -> 2 -> 1 -> 6 -> 5 -> 4 -> 7 -> 8
}
```

# Remove Element by Value

```java
/*
    remove n2
    
    p1
    s -> n1 -> n2 -> n3 -> n2 -> n4
    
         p1
    s -> n1 -> n2 -> n3 -> n2 -> n4
        n1 -> n3
   
               p1
    s -> n1 -> n3 -> n2 -> n4
        n3 -> n4

                     p1
    s -> n1 -> n3 -> n4
 */
public static ListNode removeElements(ListNode head, int val) {
    ListNode s = new ListNode(-1, head);
    ListNode p1 = s;
    while (p1.next != null) {
        if (p1.next.val == val) {
            p1.next = p1.next.next;
        } else {
            p1 = p1.next;
        }
    }
    return s.next;
}
```

# Remove Element by Value

```java
/*
    remove n2
    
    p1   p2
    s -> n1 -> n2 -> n3 -> n2 -> n4
    
         p1    p2
    s -> n1 -> n2 -> n3 -> n2 -> n4
        n1 -> n3
   
               p1    p2
    s -> n1 -> n3 -> n2 -> n4
        n3 -> n4

    s -> n1 -> n3 -> n4
 */
public static ListNode removeElements(ListNode head, int val) {
    ListNode s = new ListNode(-1, head);
    ListNode p1 = s;
    ListNode p2 = s.next;
    while (p2 != null) {
        if (p2.val == val) {
            p1.next = p2.next;
            p2 = p1.next;
        } else {
            p1 = p2;
            p2 = p2.next;
        }
    }
    return s.next;
}
```

# Remove Element by Value

```java
/*
    remove n2
    
    (n1)
        (n2)
            (n3)
                (n2)
                    (n4)
                        return n4
                    return n4
                return n4 // ignore n2
            return n3 -> n4
        return n3 -> n4 // ignore n2
    return n1 -> n3 -> n4
 */
public static ListNode removeElements(ListNode node, int val) {
    if (node == null) {
        return null;
    }
    
    if (node.val == val) {
        return removeElements(node.next, val);
    } else {
        node.next = removeElements(node.next, val);
        return node;
    }
}
```

# Remove Element by Value

```java
public static ListNode removeElements(ListNode node, int val) {
    if (node.next == null) {
        return node;
    }
    ListNode next = removeElements(node.next, val);
    if (next.val == val) {
        node.next = next.next;
    }
    return node;
}
```

# Remove Nth Element from End

[Problem Description](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/description/)

```java
/*
    Remove the second node (nth = 2) form the end,
    
    p1 p2
    s -> n1 -> n2 -> n3 -> n4 -> null

    p1               p2
    s -> n1 -> n2 -> n3 -> n4 -> null
        loop (nth + 1) { p2 = p2.next }
    
               p1                p2
    s -> n1 -> n2 -> n3 -> n4 -> null
        n2 -> n4
    
               p1          p2
    s -> n1 -> n2 -> n4 -> null
 */
public static ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode s = new ListNode(-1, head);
    ListNode p1 = s;
    ListNode p2 = s;
    
    for (int i = 0; i < n + 1; i++) {
        p2 = p2.next;
    }
    
    while (p2 != null) {
        p1 = p1.next;
        p2 = p2.next;
    }
    
    p1.next = p1.next.next;
    
    return s.next;
}
```

# Remove Nth Element from End

```java
/*
    Remove the second node form the end
    
    nth = (n1) {
        nth = (n2) {
            nth = (n3) {
                nth = (n4) {
                    nth = (null) {
                        return 0
                    }
                    return 1
                }
                return 2
            }
            if (nth == 2) {
                n2 -> n4
            }
            return 3
        }
        return 4
    }
 */
public static ListNode removeNthFromEnd(ListNode head, int n) {
    if (n == 0) {
        return head;
    }
    ListNode nil = new ListNode(-1, head);
    rec(nil, n);
    return nil.next;
}

public static int rec(ListNode cur, int n) {
    if (cur == null) {
        return 0;
    }
    int nth = rec(cur.next, n);
    if (nth == n) {
        cur.next = cur.next.next;
    }
    return nth + 1;
}

public static void main(String[] args) {
    ListNode head = new ListNode(1);
    head.next = new ListNode(2);
    head.next.next = new ListNode(3);
    head.next.next.next = new ListNode(4);
    head.next.next.next.next = new ListNode(5);
    head.next.next.next.next.next = new ListNode(6);
    head.next.next.next.next.next.next = new ListNode(7);
    head.next.next.next.next.next.next.next = new ListNode(8);
    System.out.println(removeElements(head, 3));
    System.out.println(removeElements(head, 8));
    System.out.println(removeElements(head, 0));
}
```

# Remove Duplicates from Sorted List

[Problem Description](https://leetcode.cn/problems/remove-duplicates-from-sorted-list/description/)

```java
/*
    cur
    n1 (1) -> n2 (1) -> n3 (1) ->  n4 (2) -> n5(3) -> n6 (3) -> n7 (4)
        n1 -> n3
        
    cur
    n1 (1) -> n3 (1) ->  n4 (2) -> n5(3) -> n6 (3) -> n7 (4)
        n1 -> n4
        
    cur
    n1 (1) -> n4 (2) -> n5 (3) -> n6 (3) -> n7 (4)
    
              cur
    n1 (1) -> n4 (2) -> n5 (3) -> n6 (3) -> n7 (4)
    
                        cur
    n1 (1) -> n4 (2) -> n5 (3) -> n6 (3) -> n7 (4)
        n5 -> n7
                        cur
    n1 (1) -> n4 (2) -> n5 (3) -> n7 (4)
 */
public static ListNode deleteDuplicates(ListNode head) {
    if (head == null || head.next == null) {
        return head;
    }
    ListNode nil = new ListNode(-1, head);
    ListNode cur = head.next;
    while (cur.next != null) {
        while (cur.val == cur.next.val) {
            cur.next = cur.next.next;
        }
        cur = cur.next;
    }
    return nil.next;
}
```

# Remove Duplicates from Sorted List

```java
/*
    (1) {
        (1) {
            (2) {
                (2) {
                    (3) {
                        return 3
                    }
                    return 2 -> 3
                }
                return 2 -> 3
            }
            return 1 -> 2 -> 3 // Ignore the same node
        }
        return 1 -> 2 -> 3 // Ignore the same node
    }
 */
public static ListNode deleteDuplicates(ListNode node) {
    if (node == null || node.next == null) {
        return node;
    }
    
    if (node.val == node.next.val) {
        return deleteDuplicates(node.next);
    } else {
        node.next = deleteDuplicates(node.next);
        return node;
    }
}
```

# Remove Duplicates from Sorted List II

[Problem Description](https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/description/)

```java
/*
    p
    s -> n1 (1) -> n2 (1) -> n3(1) -> n4(2) -> n5 (3) -> n6 (3) -> n7 (4)
        s -> n2
    
    p
    s -> n2 (1) -> n3(1) -> n4(2) -> n5 (3) -> n6 (3) -> n7 (4)
        s -> n3
        
    p
    s -> n3(1) -> n4(2) -> n5 (3) -> n6 (3) -> n7 (4)
        s -> n4
        
    p
    s -> n4(2) -> n5 (3) -> n6 (3) -> n7 (4)
        p = n4
        
         p
    s -> n4(2) -> n5 (3) -> n6 (3) -> n7 (4)
        n4 -> n6
    
         p
    s -> n4(2) -> n6 (3) -> n7 (4)
        n4 -> n7
    
         p
    s -> n4(2) -> n7 (4)
 */
public static ListNode deleteDuplicates(ListNode head) {
    if (head == null || head.next == null) {
        return head;
    }
    
    ListNode s = new ListNode(-1, head);
    ListNode p = s;
    
    while (p.next != null) {
        if (p.next.next != null && p.next.val == p.next.next.val) {
            while (p.next.next != null && p.next.val == p.next.next.val) {
                p.next = p.next.next;
            }
            p.next = p.next.next;
        } else {
            p = p.next;
        }
    }
    return s.next;
}
```

# Remove Duplicates from Sorted List II

[Problem Description](https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/description/)

```java
/*
    (1) {
        (1) {
            (2) {
                (3) {
                    (3) {
                        (4) {
                            return 4
                        }
                        return 3 -> 4
                    }
                    return 4 // Ignore the same node, 3 -> 3 -> 4 ===> 4
                }
                retur 2 -> 4 
            }
            return 1 -> 2 -> 4
        }
        return 2 -> 4 // Ignore the same node, 1 -> 1 -> 2 -> 4 ===> 2 -> 4
    }
 */
public static ListNode deleteDuplicates(ListNode node) {
    if (node == null || node.next == null) {
        return node;
    }
    
    if (node.val == node.next.val) {
        while (node.next != null && node.val == node.next.val) {
            node = node.next;
        }
        return deleteDuplicates(node.next);
    } else {
        node.next = deleteDuplicates(node.next);
        return node;
    }
}
```

# Merge Two Sorted Lists

```java
/*
    p1              p2              p
    1 -> 2 -> 5     1 -> 3 -> 4     s
    
    p1         p2              p
    2 -> 5     1 -> 3 -> 4     s -> 1
    
    p1         p2         p
    2 -> 5     3 -> 4     s -> 1 -> 1
    
    p1    p2         p
    5     3 -> 4     s -> 1 -> 1 -> 2
    
    p1    p2    p
    5     4     s -> 1 -> 1 -> 2 -> 3
    
    p1    p2       p
    5     null     s -> 1 -> 1 -> 2 -> 3 -> 4
    
    p1       p2       p
    null     null     s -> 1 -> 1 -> 2 -> 3 -> 4 -> 5
 */
public static ListNode mergeTwoLists(ListNode p1, ListNode p2) {
    ListNode s = new ListNode(-1, null);
    ListNode p = s;
    
    while (p1 != null && p2 != null) {
        if (p1.val < p2.val) {
            p.next = p1;
            p1 = p1.next;
        } else {
            p.next = p2;
            p2 = p2.next;
        }
        p = p.next;
    }
    if (p1 != null) {
        p.next = p1;
    } else {
        p.next = p2;
    }
    
    return s.next;
}
```

# Merge Two Sorted Lists

```java
/*
    (1 -> 3 -> 5 -> 6, 1 -> 2 -> 4)
        (3 -> 5 -> 6, 1 -> 2 -> 4)
            (3 -> 5 -> 6, 2 -> 4)
                (3 -> 5 -> 6, 4)
                    (5 -> 6, 4)
                        (5 -> 6, null)
                            return 5 -> 6
                        return 4 -> 5 -> 6
                    return 3 -> 4 -> 5 -> 6
                return 2 -> 3 -> 4 -> 5 -> 6
            return 1 -> 2 -> 3 -> 4 -> 5 -> 6
        return 1 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6
 */
public static ListNode mergeTwoLists(ListNode p1, ListNode p2) {
    if (p1 == null) {
        return p2;
    }
    if (p2 == null) {
        return p1;
    }
    
    if (p1.val < p2.val) {
        p1.next = mergeTwoLists(p1.next, p2);
        return p1;
    } else {
        p2.next = mergeTwoLists(p1, p2.next);
        return p2;
    }
}
```

# Merge k Sorted lists

[Problem Description](https://leetcode.cn/problems/merge-k-sorted-lists/description/)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=84)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241804945.png)

```java
public static ListNode mergeKLists(ListNode[] lists) {
    if (lists.length == 0) {
        return null;
    }
    
    if (lists.length == 1) {
        return lists[0];
    }

    return splitLists(lists, 0, lists.length - 1);
}

public static ListNode splitLists(ListNode[] lists, int left, int right) {
    if (left == right) {
        return lists[left];
    }
    
    int mid = (left + right) >>> 1;
    ListNode leftNode = splitLists(lists, left, mid);
    ListNode rightNode = splitLists(lists, mid + 1, right);
    
    return mergeTwoLists(leftNode, rightNode);
}

public static ListNode mergeTwoLists(ListNode p1, ListNode p2) {
    ListNode s = new ListNode(-1, null);
    ListNode p = s;
    
    while (p1 != null && p2 != null) {
        if (p1.val < p2.val) {
            p.next = p1;
            p1 = p1.next;
        } else {
            p.next = p2;
            p2 = p2.next;
        }
        p = p.next;
    }
    
    if (p1 != null) {
        p.next = p1;
    } else {
        p.next = p2;
    }
    
    return s.next;
}
```

# Middle of the Linked List

[Problem Description](https://leetcode.cn/problems/middle-of-the-linked-list/description/)

```java
/*
    The length of the linked list is odd, when p2.next points to null, p1 points to the middle node
    
    p1 p2
    n1 -> n2 -> n3 -> n4 -> n5
        p1 is quick pointer, move one step at a time
        p2 is slow pointer, move two step at a time
    
          p1    p2
    n1 -> n2 -> n3 -> n4 -> n5
    
                p1          p2
    n1 -> n2 -> n3 -> n4 -> n5
    
    ---
    
    The length of the linked list is even, when p2 points to null, p1 points to the middle node
    
    p1 p2
    n1 -> n2 -> n3 -> n4 -> n5 -> n6


          p1    p2
    n1 -> n2 -> n3 -> n4 -> n5 -> n6
    
                      p1                p2
    n1 -> n2 -> n3 -> n4 -> n5 -> n6
 */
public static ListNode middleNode(ListNode head) {
    ListNode p1 = head;
    ListNode p2 = head;
    while (p2 != null && p2.next != null) {
        p1 = p1.next;
        p2 = p2.next.next;
    }
    return p1;
}
```

# Palindrome Linked List

[Problem Description](https://leetcode.cn/problems/palindrome-linked-list/description/)

```java
/*
    p1
    1 -> 2 -> 3 -> 4 -> 1
        Reverse the whole linked list
    
    p1                      p2
    1 -> 2 -> 3 -> 4 -> 1   1 -> 4 -> 3 -> 2 -> 1
        Compare two linked lists to see if they are the same
 */
public static boolean isPalindrome(ListNode head) {
    ListNode p1 = head;
    ListNode p2 = reverseList(head);
    
    while (p2 != null) {
        if (p1.val != p2.val) {
            return false;
        }
        p1 = p1.next;
        p2 = p2.next;
    }
    return true;
}

public static ListNode reverseList(ListNode p1) {
    ListNode p2 = null;
    
    while (p1 != null) {
        p2 = new ListNode(p1.val, p2);
        p1 = p1.next;
    }
    
    return p2;
}
```

# Palindrome Linked List

[Problem Description](https://leetcode.cn/problems/palindrome-linked-list/description/)

时间复杂度为 O(n)，空间复杂度为 O(1)，实现最复杂。

```java
public static boolean isPalindrome(ListNode head) {
    ListNode headHalf = head;
    // 返回 midd ~ tail 的链表
    ListNode tailHalf = reverse(middle(head));
    // 保存反转后的尾部元素用于恢复链表
    ListNode tail = tailHalf;
    // 判断是否为回文链表
    boolean isPalindrome = isPalindrome(headHalf, tailHalf);
    // 恢复链表
    reverse(tail);
    return isPalindrome;
}

public static boolean isPalindrome(ListNode p1, ListNode p2) {
    while (p2 != null) {
        if (p1.val != p2.val) {
            return false;
        }
        p1 = p1.next;
        p2 = p2.next;
    }
    return true;
}

public static ListNode middle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}

public static ListNode reverse(ListNode node) {
    ListNode prev = null;
    while (node != null) {
        ListNode next = node.next;
        node.next = prev;
        prev = node;
        node = next;
    }
    return prev;
}
```

# Palindrome Linked List

```java
/*
    p1
    p2
    o1
    o2                                n1
    1 -> 2 -> 3 -> 4 -> 3 ->2 -> 1    null
        While searching for middle node, reverse the linked list

         p1   p2
         o1   o2                      n1
    1 -> 2 -> 3 -> 4 -> 3 ->2 -> 1    1 -> null

              p1        p2
              o1   o2                 n1
    1 -> 2 -> 3 -> 4 -> 3 ->2 -> 1    2 -> 1 -> null

                   p1            p2
                   o1   o2            n1
    1 -> 2 -> 3 -> 4 -> 3 ->2 -> 1    3 -> 2 -> 1 -> null
    
    ----------------------------------------------------------------
    
    When the length of the linked list is even, comparison needs to start from the last node of p1
                   p1            p2   n1
    1 -> 2 -> 3 -> 4 -> 3 ->2 -> 1    3 -> 2 -> 1 -> null
    
    When the length of the linked list is odd, comparison needs to start from the node pointed to by p1
                   p1           p2    n1
    1 -> 2 -> 3 -> 3 ->2 -> 1         3 -> 2 -> 1 -> null
 */
public static boolean isPalindrome(ListNode head) {
    ListNode p1 = head; // Quick pointer
    ListNode p2 = head; // Slow pointer
    ListNode s = new ListNode(-1);
    ListNode p3 = s;
    
    while (p2 != null && p2.next != null) {
        p3 = p1;
        p1 = p1.next;
        p2 = p2.next.next;
        p3.next = s.next;
        s.next = p3;
    }
    
    if (p2 != null) {
        p1 = p1.next;
    }
    
    while (p1 != null) {
        if (p1.val != p3.val) {
            return false;
        }
        p1 = p1.next;
        p3 = p3.next;
    }
    
    return true;
}
```

# Linked List Cycle

[Problem Description](https://leetcode.cn/problems/linked-list-cycle/description/)

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=13&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static boolean hasCycle(ListNode head) {
    // 通过 set 存储访问过的节点，每次遍历时，先判断之前是否有访问过该节点，从而确定是否有环
    HashSet<ListNode> set = new HashSet<>();
    ListNode cur = head;
    while (cur != null) {
        if (set.contains(cur)) {
            return true;
        } else {
            set.add(cur);
        }
        cur = cur.next;
    }
    return false;
}
```

# Linked List Cycle

[Explain p88, p89](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=88)

```java
public static boolean hasCycle(ListNode head) {
    ListNode p1 = head;
    ListNode p2 = head;
    
    while (p2 != null && p2.next != null) {
        p1 = p1.next;
        p2 = p2.next.next;
        
        if (p1 == p2) {
            return true;
        }
    }
    
    return false;
}
```

# Linked List Cycle II

[Problem Description](https://leetcode.cn/problems/linked-list-cycle-ii/description/)

[Explain p88, p89](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=88)

```java
public ListNode detectCycle(ListNode head) {
    ListNode p1 = head;
    ListNode p2 = head;
    
    while (p2 != null && p2.next != null) {
        p1 = p1.next;
        p2 = p2.next.next;
        
        if (p1 == p2) {
            p1 = head;
            while (true) {
                if (p1 == p2) {
                    return p1;
                }
                p1 = p1.next;
                p2 = p2.next;
            }
        }
    }
    
    return null;
}
```

# Intersection of Two Linked Lists

[Problem Description](https://leetcode.cn/problems/intersection-of-two-linked-lists/description/)

```java
public static ListNode getIntersectionNode(ListNode headA, ListNode headB) {
    HashSet<ListNode> set = new HashSet<>();
    ListNode pA = headA;
    ListNode pB = headB;

    while (pA != null) {
        set.add(pA);
        pA = pA.next;
    }

    while (pB != null) {
        if (set.contains(pB)) {
            return pB;
        }
        pB = pB.next;
    }

    return null;
}
```

# Intersection of Two Linked Lists

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=15&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static ListNode getIntersectionNode(ListNode headA, ListNode headB) {
    ListNode pA = headA;
    ListNode pB = headB;
    while (pA != pB) {
        pA = pA != null ? pA.next : headB;
        pB = pB != null ? pB.next : headA;
    }
    return pA;
}
```

# Add Two Numbers

[Problem Description](https://leetcode.cn/problems/add-two-numbers/description/?envType=study-plan-v2&envId=top-100-liked)

```java
public static ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode s = new ListNode(-1, null);
    ListNode p3 = s;
    ListNode p1 = l1;
    ListNode p2 = l2;
    int r = 0;
    while (p1 != null && p2 != null) {
        p3.next = new ListNode((p1.val + p2.val + r) % 10);
        r = (p1.val + p2.val + r) / 10;
        p3 = p3.next;
        p1 = p1.next;
        p2 = p2.next;
    }
    while (p1 != null) {
        p3.next = new ListNode((p1.val + r) % 10);
        r = (p1.val + r) / 10;
        p3 = p3.next;
        p1 = p1.next;
    }
    while (p2 != null) {
        p3.next = new ListNode((p2.val + r) % 10);
        r = (p2.val + r) / 10;
        p3 = p3.next;
        p2 = p2.next;
    }
    if (r == 1) {
        p3.next = new ListNode(1);
    }
    return s.next;
}
```

# Add Two Numbers

```java
// 先计算第一位，如果满 10 了，就进一位，通过一个 c 来表示有进位，计算第二位的时候，就需要加上刚才的那个 c
public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode s = new ListNode(-1, null);
    ListNode p = s;
    int c = 0;
    while (l1 != null || l2 != null || c != 0) {
        int n1 = 0;
        if (l1 != null) {
            n1 = l1.val;
            l1 = l1.next;
        }

        int n2 = 0;
        if (l2 != null) {
            n2 = l2.val;
            l2 = l2.next;
        }

        int n3 = (n1 + n2 + c) % 10;
        c = (n1 + n2 + c) / 10;
        
        p.next = new ListNode(n3, null);

        p = p.next;
    }

    return s.next;
}
```

# Merge Sort List

[Problem Description](https://leetcode.cn/problems/sort-list/?envType=study-plan-v2&envId=top-100-liked)

```java
public static ListNode sortList(ListNode head) {
    return sortList(head, null);
}

/**
 * @param tail 链表的最后一个元素的后一个元素，帮助定位
 */
public static ListNode sortList(ListNode head, ListNode tail) {
    if (head == null) {
        return null;
    }
    if (head.next == tail) {
        head.next = null;
        return head;
    }
    ListNode slow = head;
    ListNode fast = head;
    while (fast != tail) {
        slow = slow.next;
        fast = fast.next;
        if (fast != tail) {
            fast = fast.next;
        }
    }
    ListNode midd = slow;
    ListNode head1 = sortList(head, midd); // 合并 [head, midd - 1]
    ListNode head2 = sortList(midd, tail); // 合并 [midd, tail - 1]
    return merge(head1, head2);
}

public static ListNode merge(ListNode p1, ListNode p2) {
    ListNode nil = new ListNode(-1, null);
    ListNode p3 = nil;
    while (p1 != null && p2 != null) {
        if (p1.val < p2.val) {
            p3.next = p1;
            p1 = p1.next;
        } else {
            p3.next = p2;
            p2 = p2.next;
        } 
        p3 = p3.next;
    }
    if (p1 != null) {
        p3.next = p1;
    } else {
        p3.next = p2;
    } 
    return nil.next;
}
```

# Partition List

将单向链表按某值划分成左边小、中间相等、右边大的形式。

[Explain 01:34:20](https://www.bilibili.com/video/BV13g41157hK?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=6)

```java
public static ListNode partition(ListNode head, int val) {
    // 小于 val 的头尾
    ListNode lh = null, lt = null;
    // 等于 val 的头尾
    ListNode mh = null, mt = null;
    // 大于 val 的头尾
    ListNode rh = null, rt = null;

    // 遍历链表，将链表分成三部分，分别有 l, m, r 管理
    ListNode curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = null;
        if (curr.val < val) {
            if (lh == null) {
                lh = curr;
                lt = curr;
            } else {
                lt.next = curr;
                lt = curr;
            }
        } else if (curr.val > val) {
            if (rh == null) {
                rh = curr;
                rt = curr;
            } else {
                rt.next = curr;
                rt = curr;
            }
        } else {
            if (mh == null) {
                mh = curr;
                mt = curr;
            } else {
                mt.next = curr;
                mt = curr;
            }
        }
        curr = next;
    }

    // 连接 l 和 m，如果 m 不存在，则连接 l 和 r
    if (lt != null) {
        lt.next = mh != null ? mh : rh;
    }
    // 连接 m 和 r
    if (mt != null) {
        mt.next = rh;
    }

    return lh != null ? lh : (mh != null ? mh : rh);
}
```

# Copy List with Random Pointer

[Problem Description](https://leetcode.cn/problems/copy-list-with-random-pointer/description/)

[Explain 01:44:54](https://www.bilibili.com/video/BV13g41157hK?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=6)

```java
public static Node copyRandomList(Node head) {
    Map<Node, Node> map = new HashMap<>();

    // 拷贝节点的 val，但不设置 next 和 random
    Node curr = head;
    while (curr != null) {
        map.put(curr, new Node(curr.val));
        curr = curr.next;
    }

    curr = head;
    while (curr != null) {
        Node node = map.get(curr);
        node.next = map.get(curr.next);
        node.random = map.get(curr.random);
        curr = curr.next;
    }

    return map.get(head);
}
```

# Copy List with Random Pointer

[Explain 01:52:50](https://www.bilibili.com/video/BV13g41157hK?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=6)

```java
public static Node copyRandomList(Node head) {
    // 插入复制节点到每个原节点之后
    Node curr = head;
    while (curr != null) {
        Node copy = new Node(curr.val);
        copy.next = curr.next;
        curr.next = copy;
        curr = copy.next;
    }

    // 设置复制节点的随机指针
    curr = head;
    while (curr != null) {
        Node copy = curr.next;
        copy.random = curr.random != null ? curr.random.next : null;
        curr = curr.next.next;
    }

    // 分离原链表和复制链表
    curr = head;
    Node copyHead = head != null ? head.next : null;
    Node copyCurr = copyHead;
    while (curr != null) {
        curr.next = curr.next.next;
        copyCurr.next = copyCurr.next != null ? copyCurr.next.next : null;
        curr = curr.next;
        copyCurr = copyCurr.next;
    }

    return copyHead;
}
```
