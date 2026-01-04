# Stack (Linked List)

```java
public class LinkedListStack<E> implements Stack<E>, Iterable<E> {
    private int cap;
    private int size;
    private Node<E> top;
    
    public LinkedListStack() {
        this.cap = 8;
        top = new Node<>(null);
    }
    
    public LinkedListStack(int cap) {
        this.cap = cap;
        top = new Node<>(null);
    }
    
    private static class Node<E> {
        E val;
        Node<E> next;
        
        public Node(E val) {
            this.val = val;
        }
        
        public Node(E val, Node<E> next) {
            this.val = val;
            this.next = next;
        }
    }
    
    /*
        top -> n1 -> null
            n2 -> n1
            top -> n2
            
        top -> n2 -> n1 -> null
     */
    @Override
    public boolean push(E val) {
        if (isFull()) {
            return false;
        }
        top.next = new Node<>(val, top.next);
        size++;
        return true;
    }
    
    /*
        top -> n2 -> n1 -> null
            top -> n1
            
        top -> n1 -> null
     */
    @Override
    public E pop() {
        if (isEmpty()) {
            return null;
        }
        Node<E> node = top.next;
        top.next = top.next.next;
        size--;
        return node.val;
    }
    
    @Override
    public E peek() {
        if (isEmpty()) {
            return null;
        }
        return top.next.val;
    }
    
    @Override
    public boolean isEmpty() {
        return size == 0;
    }
    
    @Override
    public boolean isFull() {
        return size == cap;
    }
    
    @Override
    public Iterator<E> iterator() {
        return new Iterator<E>() {
            Node<E> temp = top.next;
            @Override
            public boolean hasNext() {
                return temp != null;
            }
            
            @Override
            public E next() {
                E val = temp.val;
                temp = temp.next;
                return val;
            }
        };
    }
}
```

# Stack (Array)

```java
public class arrStack<E> implements Stack<E>, Iterable<E> {
    private E[] arr;
    private int top;
    
    public arrStack() {
        this.arr = (E[]) new Object[8];
    }
    
    public arrStack(int cap) {
        this.arr = (E[]) new Object[cap];
    }
    
    /*
                t
        a   b
        0   1   2   3   4   5
        
                    t
        a   b   c
        0   1   2   3   4   5
     */
    @Override
    public boolean push(E val) {
        if (isFull()) {
            return false;
        }
        arr[top++] = val;
        return true;
    }
    
    /*
                    t
        a   b   c
        0   1   2   3   4   5
        
                t
        a   b
        0   1   2   3   4   5
     */
    @Override
    public E pop() {
        if (isEmpty()) {
            return null;
        }
        E val = arr[--top];
        arr[top] = null; // GC
        return val;
    }
    
    @Override
    public E peek() {
        if (isEmpty()) {
            return null;
        }
        return arr[top - 1];
    }
    
    /*
        t
        0   1   2   3   4   5
     */
    @Override
    public boolean isEmpty() {
        return top == 0;
    }
    
    /*
                                t
        0   1   2   3   4   5
     */
    @Override
    public boolean isFull() {
        return top == arr.length;
    }
    
    @Override
    public Iterator<E> iterator() {
        return new Iterator<E>() {
            int temp = top;
            
            @Override
            public boolean hasNext() {
                return temp > 0;
            }
            
            @Override
            public E next() {
                return arr[--top];
            }
        };
    }
}
```

# InfixExp to SuffixExp

```java
/*
    1 + 3 - 2 * 3 + 1
    
    sb = 1
    sb = 1          s -> "+"
    sb = 13         s -> "+"
    sb = 13+
    sb = 13+        s -> "-"
    sb = 13+2       s -> "*" -> "-"
    sb = 13+23      s -> "*" -> "-"
    sb = 13+23*     s -> "-"
    sb = 13+23*-
    sb = 13+23*-    s -> "+"
    sb = 13+23*-1   s -> "+"
    sb = 13+23*-1+
 */
public static String infixToSuffix(String exp) {
    Stack<Character> stack = new Stack<>();
    StringBuilder sb = new StringBuilder(exp.length());
    char[] chs = exp.toCharArray();
    for (char c : chs) {
        switch (c) {
            /*
                1 + 2 * 3 - 1
                
                sb = 12    s -> "+"
                sb = 12    s -> "*" -> "+"
                    "*" has a higher priority than "+", so push "*" into the stack
                    
                sb = 12     s -> "*" -> "+"
                    "-" has a lower priority than "*" and has the same priority
                    with "+", so pop "*" and "+"
                sb = 12*+
                sb = 12*+   s -> "-"
                    Finally, push "-" into the stack
             */
            case '*', '/', '+', '-' -> {
                if (stack.isEmpty()) {
                    stack.push(c);
                    continue;
                }
                
                if (getPrio(c) > getPrio(stack.peek())) {
                    stack.push(c);
                    continue;
                }
                

                while (!stack.isEmpty() && getPrio(stack.peek()) >= getPrio(c)) {
                    sb.append(stack.pop());
                }
                stack.push(c);
            }
            /*
                1 + (2 + 3 * 4) + 4
                
                sb = 1
                sb = 1          s -> "+"
                sb = 1          s -> "(" -> "+"
                sb = 12         s -> "+" -> "(" -> "+"
                sb = 123        s -> "+" -> "(" -> "+"
                sb = 123        s -> "*" -> "+" -> "(" -> "+"
                sb = 1234       s -> "*" -> "+" -> "(" -> "+"
                sb = 1234*+     s -> "+"
                sb = 1234*++    s -> "+"
                sb = 1234*++4   s -> "+"
                sb = 1234*++4+
             */
            case '(' -> {
                stack.push(c);
            }
            case ')' -> {
                while (!stack.isEmpty() && stack.peek() != '(') {
                    sb.append(stack.pop());
                }
                stack.pop(); // Pop "("
            }
            /*
                1 + 2
                
                sb = 1
                    Directly concatenate numbers when encountering them
                sb = 1      s -> "+"
                sb = 12
                    Directly concatenate numbers when encountering them
             */
            default -> {
                sb.append(c);
            }
        }
    }
    
    /*
        sb = 13+23*-1   s -> "+"
        sb = 13+23*-1+
     */
    while (!stack.isEmpty()) {
        sb.append(stack.pop());
    }
    
    return sb.toString();
}

public static int getPrio(char c) {
    return switch (c) {
        case '*', '/' -> 2;
        case '+', '-' -> 1;
        case '(' -> 0;
        default -> throw new IllegalArgumentException();
    };
}
```

# Valid Parentheses

[Problem Description](https://leetcode.cn/problems/valid-parentheses/description/)

```java
/*
    i: (                       top -> )
        When encountering "(", then push ")" onto the stack
    i: (, [                    top -> ] -> )
        When encountering "[", then push "]" onto the stack
    i: (, [, {                 top -> } -> ] -> )
        When encountering "{", then push "}" onto the stack
    i: (, [, { }               top -> ] -> )
        When encountering "}", then pop "}" from the stack
    i: (, [, { } ]             top -> )
        When encountering "]", then pop "]" from the stack
    i: (, [, {, }, ], )        top
        When encountering ")", then pop ")" from the stack
 */
public static boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    char[] chs = s.toCharArray();
    for (char c : chs) {
        if (c == '(') {
            stack.push(')');
        } else if (c == '[') {
            stack.push(']');
        } else if (c == '{') {
            stack.push('}');
        } else {
            if (stack.isEmpty() || c != stack.peek()) {
                return false;
            }
            stack.pop();
        }
    }
    return stack.isEmpty();
}
```

# Evaluate Reverse Polish Notation

[Problem Description](https://leetcode.cn/problems/evaluate-reverse-polish-notation/description/)

```java
public static int evalRPN(String[] tokens) {
    Stack<Integer> stack = new Stack<>();
    for (String token : tokens) {
        switch (token) {
            case "+" -> {
                Integer b = stack.pop();
                Integer a = stack.pop();
                stack.push(a + b);
            }
            case "-" -> {
                Integer b = stack.pop();
                Integer a = stack.pop();
                stack.push(a - b);
            }
            case "*" -> {
                Integer b = stack.pop();
                Integer a = stack.pop();
                stack.push(a * b);
            }
            case "/" -> {
                Integer b = stack.pop();
                Integer a = stack.pop();
                stack.push(a / b);
            }
            case "%" -> {
                Integer b = stack.pop();
                Integer a = stack.pop();
                stack.push(a % b);
            }
            default -> {
                stack.push(Integer.parseInt(token));
            }
        }
    }
    return stack.pop();
}
```

# Implement Queue using Stacks

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=110)

```java
/*
    I: 1, 2, 3
        s1 -> 3 -> 2 -> 1   s2
    
    O: 1
        s1                  s2 -> 2 -> 3
    
    I: 4, 5
        s1 -> 5 -> 4        s2 -> 2 -> 3
    
    O: 2, 3
        s1 -> 5 -> 4        s2
    
    O: 4
        s1                  s2 -> 5
 */
public class MyQueue {
    Stack<Integer> s1 = new Stack<>();
    Stack<Integer> s2 = new Stack<>();
    
    public void offer(int val) {
        s1.push(val);
    }
    
    public int poll() {
        if (s2.isEmpty()) {
            while (!s1.isEmpty()) {
                s2.push(s1.pop());
            }
        }
        return s2.pop();
    }
    
    public int peek() {
        if (s2.isEmpty()) {
            while (!s1.isEmpty()) {
                s2.push(s1.pop());
            }
        }
        return s2.peek();
    }
    
    public boolean isEmpty() {
        return s1.isEmpty() && s2.isEmpty();
    }
}
```

# Monotonic Stack

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=182&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public class MonotonicStack {
    private LinkedList<Integer> stack;

    public MonotonicStack() {
        this.stack = new LinkedList<>();
    }

    public Integer peek() {
        return stack.peekLast();
    }

    public Integer pop() {
        return stack.pollLast();
    }

    /**
     * Pushes the given element onto the stack while maintaining the monotonic property.
     * It pops elements from the stack that are smaller than the given element.
     *
     * @param x The element to be pushed onto the stack.
     */
    public void push(int val) {
        // Pop smaller elements from the top
        while (!stack.isEmpty() && stack.peekLast() < val) {
            stack.poll();
        }
        // Push the element onto the stack
        stack.push(val);
    }
}
```

# Trapping Rain Water

[Problem Description](https://leetcode.cn/problems/trapping-rain-water/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=182&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * The algorithm utilizes a monotonic decreasing stack to keep track of potential pillars that can trap water.
 * It iterates through the elevation map, pushing each pillar onto the stack. For each new pillar encountered,
 * it checks if it can trap water between itself and the previous pillars on the stack. If so, it calculates
 * the trapped water area and adds it to the total area.
 *
 * @param hts An arr representing the elevation map of pillars.
 * @return The total trapped water area after rainfall.
 */
public static int trap(int[] hts) {
    // Stack to store Pillar objects
    LinkedList<Pillar> stack = new LinkedList<>();
    
    // Variable to store the total trapped water area
    int area = 0;

    // Iterate through the elevation map
    for (int i = 0; i < hts.length; i++) {
        // Create a Pillar object for the current elevation and index
        Pillar right = new Pillar(hts[i], i);

        // While the stack is not empty and the current pillar is higher than the top pillar of the stack
        while (!stack.isEmpty() && stack.peek().ht < right.ht) {
            // Pop the top pillar from the stack
            Pillar pop = stack.pop();
            
            // Get the left pillar from the stack (null if there is no pillar to the left)
            Pillar left = stack.peek();
            
            // If there is no pillar to the left, continue to the next iteration
            if (left == null) {
                continue;
            }

            // Calculate the width between the current and left pillars
            int wid = right.idx - left.idx - 1;

            // Calculate the ht as the minimum ht between the left and right pillars minus the popped pillar's ht
            int ht = Math.min(left.ht, right.ht) - pop.ht;

            // Add the calculated area to the total area
            area += wid * ht;
        }

        // Push the current pillar onto the stack
        stack.push(right);
    }

    // Return the total trapped water area
    return area;
}

/**
 * Pillar Class
 *
 * Represents a pillar with its height and index in the elevation map.
 * Used in the Trapping Rain Water algorithm to efficiently calculate trapped water.
 */
public static class Pillar {
    int ht;
    int idx;

    public Pillar(int ht, int idx) {
        this.ht = ht;
        this.idx = idx;
    }
}
```

# Trapping Rain Water

```java
public static int trap(int[] hts) {
    // lhts[i] 表示在 i 处，左侧的柱子高度
    int[] lhts = new int[hts.length];
    lhts[0] = hts[0];
    for (int i = 1; i < hts.length; i++) {
        lhts[i] = Math.max(lhts[i - 1], hts[i]);
    }

    // rhts[i] 表示在 i 处，右侧柱子的高度
    int[] rhts = new int[hts.length];
    rhts[hts.length - 1] = hts[hts.length - 1];
    for (int i = hts.length - 2; i > -1; i--) {
        rhts[i] = Math.max(rhts[i + 1], hts[i]);
    }

    int area = 0;
    for (int i = 0; i < hts.length; i++) {
        // 左右侧最矮柱子 - 当前 i 处的高度，即可计算出在 i 处的水量
        area += Math.min(lhts[i], rhts[i]) - hts[i];
    }

    return area;
}
```

# Min Stack (Val)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=192&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static class MinStack {
    LinkedList<Integer> stack = new LinkedList<>();
    LinkedList<Integer> minStack = new LinkedList<>();
    
    public void push(int val) {
        stack.push(val);
        minStack.push(minStack.isEmpty() ? val : Math.min(minStack.peek(), val));
    }
    
    public void pop() {
        stack.pop();
        minStack.pop();
    }
    
    public int getTop() {
        return stack.peek();
    }
    
    public int getMin() {
        return minStack.peek();
    }
}
```

# Min Stack (Obj)

[Explain p192 (07:06)](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=192&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static class MinStack {
    record Data(int val, int min) {}
    
    LinkedList<Data> stack = new LinkedList<>();
    
    public void push(int val) {
        stack.push(new Data(val, stack.isEmpty() ? val : Math.min(stack.peek().min, val)));
    }
    
    public void pop() {
        stack.pop();
    }
    
    public int getTop() {
        return stack.peek().val;
    }
    
    public int getMin() {
        return stack.peek().min;
    }
}
```

# Decode String

[Problem Description](https://leetcode.cn/problems/decode-string/description/)

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=22&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static String decodeString(String s) {
    LinkedList<String> stk = new LinkedList<>();
    char[] chs = s.toCharArray();
    int idx = 0;
    while (idx < chs.length) {
        if (Character.isDigit(chs[idx])) {
            StringBuilder sb = new StringBuilder();
            while (idx < chs.length && Character.isDigit(chs[idx])) {
                sb.append(chs[idx++]);
            }
            stk.push(sb.toString());
        } else if (chs[idx] == ']') {
            StringBuilder sb = new StringBuilder();
            while (!stk.isEmpty() && !stk.peek().equals("[")) {
                sb.insert(0, stk.pop());
            }
            stk.pop();
            String str = sb.toString().repeat(Integer.parseInt(stk.pop()));
            stk.push(str);
            idx++;
        } else {
            stk.push(String.valueOf(chs[idx++]));
        }
    }
    
    StringBuilder sb = new StringBuilder();
    while (!stk.isEmpty()) {
        sb.insert(0, stk.pop());
    }
    return sb.toString();
}
```

# Reverse Stack

给你一个栈，请你逆序这个栈，不能申请额外的数据结构，只能使用递归函数。

[Arctile Explain](https://leetcode.cn/circle/discuss/8g25gg/)

[Video Explain 01:32:06](https://www.bilibili.com/video/BV13g41157hK?vd_source=2b0f5d4521fd544614edfc30d4ab38e1&spm_id_from=333.788.player.switch&p=11)

```java
public static void reverse(Stack<Integer> stk) {
    if (stk.isEmpty()) {
        return;
    }
    int last = popLast(stk);
    reverse(stk);
    stk.push(last);
}

public static int popLast(Stack<Integer> stk) {
    if (stk.size() == 1) {
        return stk.pop();
    }
    Integer curr = stk.pop();
    int last = popLast(stk);
    stk.push(curr);
    return last;
}
```