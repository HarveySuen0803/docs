# Binary Tree

```java
public class TreeNode {
    public int val;
    public TreeNode left;
    public TreeNode right;
    
    public TreeNode(int val) {
        this.val = val;
    }
    
    public TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
    
    @Override
    public String toString() {
        return String.valueOf(this.val);
    }
}
```

```java
public class Main {
    public static void main(String[] args) throws FileNotFoundException, InterruptedException {
        TreeNode root = new TreeNode(
            1,
            new TreeNode(
                2,
                new TreeNode(4),
                null
            ),
            new TreeNode(
                3,
                new TreeNode(5),
                new TreeNode(6)
            )
        );
    }
}
```

# Binary Tree Traversal (Recursive)

```java
public static void preOrder(TreeNode node) {
    if (node == null) {
        return;
    }
    System.out.println(node);
    preOrder(node.left);
    preOrder(node.right);
}

public static void inOrder(TreeNode node) {
    if (node == null) {
        return;
    }
    inOrder(node.left);
    System.out.println(node);
    inOrder(node.right);
}

public static void postOrder(TreeNode node) {
    if (node == null) {
        return;
    }
    postOrder(node.left);
    postOrder(node.right);
    System.out.println(node);
}

public static void main(String[] args) {
    /*
             1
           /   \
          2     3
         / \   / \
        4  5  6   7
     */
    TreeNode root = new TreeNode(1);
    root.left = new TreeNode(2);
    root.right = new TreeNode(3);
    root.left.left = new TreeNode(4);
    root.left.right = new TreeNode(5);
    root.right.left = new TreeNode(6);
    root.right.right = new TreeNode(7);
    preOrder(root);
}
```

# Binary Tree Traversal (Iteration)

[Explain p149, p150](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=149)

```java
public static void preOrder(TreeNode node) {
    TreeNode cur = node;
    LinkedList<TreeNode> stack = new LinkedList<>();
    while (cur != null || !stack.isEmpty()) {
        if (cur != null) {
            System.out.println("pre order: " + cur);
            stack.push(cur);
            cur = cur.left;
        } else {
            TreeNode par = stack.pop();
            cur = par.right;
        }
    }
}

public static void inOrder(TreeNode node) {
    TreeNode cur = node;
    LinkedList<TreeNode> stack = new LinkedList<>();
    while (cur != null || !stack.isEmpty()) {
        if (cur != null) {
            stack.push(cur);
            cur = cur.left;
        } else {
            TreeNode par = stack.pop();
            System.out.println("in order: " + par);
            cur = par.right;
        }
    }
}

public static void postOrder(TreeNode node) {
    TreeNode cur = node;
    TreeNode pop = null;
    LinkedList<TreeNode> stack = new LinkedList<>();
    while (cur != null || !stack.isEmpty()) {
        if (cur != null) {
            stack.push(cur);
            cur = cur.left;
        } else {
            TreeNode par = stack.peek();
            if (par.right == null || par.right == pop) {
                pop = stack.pop();
                System.out.println("post order: " + pop);
            } else {
                cur = par.right;
            }
        }
    }
}
```

# Binary Tree Traversal (Three in One)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=152&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static void traversal(TreeNode node) {
    TreeNode cur = node;
    TreeNode pop = null;
    LinkedList<TreeNode> stack = new LinkedList<>();
    while (cur != null || !stack.isEmpty()) {
        if (cur != null) {
            System.out.println("pre order: " + cur);
            stack.push(cur);
            cur = cur.left;
        } else {
            TreeNode par = stack.peek();
            if (par.right == null) {
                System.out.println("in order: " + par);
                pop = stack.pop();
                System.out.println("post order: " + pop);
            }
            else if (par.right == pop) {
                pop = stack.pop();
                System.out.println("post order: " + pop);
            }
            else {
                System.out.println("in order: " + par);
                cur = par.right;
            }
        }
    }
}
```

# Binary Tree Traversal (Reverse)

```java
public static void traversal(TreeNode node) {
    TreeNode cur = node;
    TreeNode pop = null;
    LinkedList<TreeNode> stack = new LinkedList<>();
    while (cur != null || !stack.isEmpty()) {
        if (cur != null) {
            System.out.println("reverse pre order: " + cur);
            stack.push(cur);
            cur = cur.right;
        } else {
            TreeNode par = stack.peek();
            if (par.left == null) {
                System.out.println("reverse in order: " + par);
                pop = stack.pop();
                System.out.println("reverse post order: " + pop);
            }
            else if (par.left == pop) {
                pop = stack.pop();
                System.out.println("reverse post order: " + pop);
            }
            else {
                System.out.println("reverse in order: " + par);
                cur = par.left;
            }
        }
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
        TreeNode polled = queue.poll();
        System.out.print(polled + " ");

        if (polled.left != null) {
            queue.offer(polled.left);
        }
        if (polled.right != null) {
            queue.offer(polled.right);
        }
    }
}

public static void levelOrderWithFormat(TreeNode root) {
    LinkedList<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    
    while (!queue.isEmpty()) {
        int curSize = queue.size();
        for (int i = 0; i < curSize; i++) {
            TreeNode polled = queue.poll();
            System.out.print(polled + " ");
            
            if (polled.left != null) {
                queue.offer(polled.left);
            }
            if (polled.right != null) {
                queue.offer(polled.right);
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

# Binary Tree Right Side View

[Problem Description](https://leetcode.cn/problems/binary-tree-right-side-view/?envType=study-plan-v2&envId=top-100-liked)

```java
public static List<Integer> rightSideView(TreeNode root) {
    if (root == null) {
        return new ArrayList();
    }
    
    List<Integer> level1 = new ArrayList<>();
    LinkedList<TreeNode> que = new LinkedList<>();
    que.offer(root);
    while (!que.isEmpty()) {
        LinkedList<Integer> level2 = new LinkedList<>();
        int size = que.size();
        for (int i = 0; i < size; i++) {
            TreeNode cur = que.poll();
            level2.addLast(cur.val);
            if (cur.left != null) {
                que.offer(cur.left);
            }
            if (cur.right != null) {
                que.offer(cur.right);
            }
        }
        level1.add(level2.peekLast());
    }
    return level1;
}
```

# Symmetric Tree

[Problem Description](https://leetcode.cn/problems/symmetric-tree/description/)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=153&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static boolean isSymmetric(TreeNode root) {
    return check(root.left, root.right);
}

public static boolean check(TreeNode l, TreeNode r) {
    if (l == null && r == null) {
        return true;
    }
    if (l == null || r == null || l.val != r.val) {
        return false;
    }
    return check(l.left, r.right) && check(l.right, r.left);
}
```

# Maximum Depth of Binary Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=154&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maxDepth(TreeNode root) {
    if (root == null) {
        return 0;
    }
    return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
}
```

# Maximum Depth of Binary Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=155&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maxDepth(TreeNode root) {
    TreeNode cur = root;
    TreeNode pop = null;
    LinkedList<TreeNode> stack = new LinkedList<>();
    int depth = 0;
    while (cur != null || !stack.isEmpty()) {
        if (cur != null) {
            stack.push(cur);
            maxDepth = Math.max(maxDepth, stk.size());
            cur = cur.left;
        } else {
            TreeNode par = stack.peek();
            if (par.right == null) {
                pop = stack.pop();
            }
            else if (par.right == pop) {
                pop = stack.pop();
            }
            else {
                cur = par.right;
            }
        }
    }
    return depth;
}
```

# Maximum Depth of Binary Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=156&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maxDepth(TreeNode root) {    
    LinkedList<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    int depth = 0;
    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (node.left != null) {
                queue.offer(node.left);
            }
            if (node.right != null) {
                queue.offer(node.right);
            }
        }
        depth++;
    }
    return depth;
}
```

# Minimum Depth of Binary Tree

```java
public static int minDepth(TreeNode node) {
    if (node == null) {
        return 0;
    }
    if (node.left == null) {
        return minDepth(node.right) + 1;
    }
    if (node.right == null) {
        return minDepth(node.left) + 1;
    }
    return Math.min(minDepth(node.left), minDepth(node.right)) + 1;
}
```

# Minimum Depth of Binary Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=157&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int minDepth(TreeNode node) {
    if (node == null) {
        return 0;
    }
    
    int leftCount = minDepth(node.left);
    int rightCount = minDepth(node.right);
    
    if (leftCount == 0) {
        return rightCount + 1;
    }
    if (rightCount == 0) {
        return leftCount + 1;
    }
    
    return Math.min(leftCount, rightCount) + 1;
}
```

# Minimum Depth of Binary Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=157&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int minDepth(TreeNode root) {
    LinkedList<TreeNode> que = new LinkedList<>();
    que.offer(root);
    int minDepth = 1;
    while (!que.isEmpty()) {
        int size = que.size();
        for (int i = 0; i < size; i++) {
            TreeNode cur = que.poll();
            if (cur.left == null && cur.right == null) {
                return minDepth;
            }
            if (cur.left != null) {
                que.offer(cur.left);
            }
            if (cur.right != null) {
                que.offer(cur.right);
            }
        }
        minDepth++;
    }
    return minDepth;
}
```

# Balanced Binary Tree

[Problem Description](https://leetcode.cn/problems/balanced-binary-tree/)

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=30&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public boolean isBalanced(TreeNode root) {
    return getDepth(root) != -1;
}

public int getDepth(TreeNode node) {
    if (node == null) {
        return 0;
    }
    
    int leftDepth = getDepth(node.left);
    
    int rightDepth = getDepth(node.right);
    
    if (leftDepth == -1 || rightDepth == -1 || Math.abs(leftDepth - rightDepth) > 1) {
        return -1;
    }
    
    return Math.max(leftDepth, rightDepth) + 1;
}
```

# Diameter of Binary Tree

[Problem Description](https://leetcode.cn/problems/diameter-of-binary-tree/?envType=study-plan-v2&envId=top-100-liked)

```java
public int diameter = 0;

public int diameterOfBinaryTree(TreeNode root) {
    depth(root);
    return diameter;
}

public int depth(TreeNode node) {
    if (node == null) {
        return 0;
    }
    int ld = depth(node.left);
    int rd = depth(node.right);
    diameter = Math.max(diameter, ld + rd);
    return Math.max(ld, rd) + 1;
}
```

# Invert Binary Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=158&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static void invertTree(TreeNode node) {
    if (node == null) {
        return;
    }
    
    TreeNode t = node.left;
    node.left = node.right;
    node.right = t;
    
    invertTree(node.left);
    invertTree(node.right);
}
```

# Suffix Expression Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=159&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/*
    Suffix Expression
        21-3*

    Suffix Expression Tree
            *
           / \
          -   3
         / \
        2   1
*/
public static TreeNode suffixExpressionTree(String[] tokens) {
    LinkedList<TreeNode> stack = new LinkedList<>();
    
    for (String token : tokens) {
        switch (token) {
            case "+", "-", "*", "/" -> {
                TreeNode<String> node = new TreeNode<>(token);
                node.right = stack.pop();
                node.left = stack.pop();
                stack.push(node);
            }
            default -> {
                stack.push(new TreeNode(token));
            }
        }
    }
    
    return stack.peek();
}

public static void main(String[] args) throws FileNotFoundException, InterruptedException {
    TreeNode root = suffixExpressionTree(new String[]{"2", "1", "-", "3", "*"});
    // Performing a post-order traversal of the suffix expression binary tree to obtain the suffix expression
    BinaryTree.postOrder(root); // 21-3*
}
```

# Convert Sorted Array to Binary Search Tree

[Problem Description](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/description/?envType=study-plan-v2&envId=top-100-liked)

```java
public static TreeNode sortedArrayToBST(int[] nums) {
    return buildTree(nums, 0, nums.length - 1);
}

public static TreeNode buildTree(int[] nums, int l, int r) {
    if (l > r) {
        return null;
    }
    int m = (l + r) / 2;
    TreeNode root = new TreeNode(nums[m]);
    root.left = buildTree(nums, l, m - 1);
    root.right = buildTree(nums, m + 1, r);
    return root;
}
```

# Construct Binary Tree from Preorder and Inorder Traversal

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=160&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static TreeNode buildTree(int[] preOrder, int[] inOrder) { // preOrder = {1, 2, 4, 3, 6, 7}, inOrder = {4, 2, 1, 6, 3, 7}, postOrder = {4, 2, 6, 7, 3, 1}
    if (preOrder.length == 0 || inOrder.length == 0) {
        return null;
    }
    
    TreeNode root = new TreeNode(preOrder[0]); // 1
    
    for (int i = 0; i < inOrder.length; i++) {
        if (inOrder[i] == root.val) {
            int[] leftInOrder = Arrays.copyOfRange(inOrder, 0, i); // {4, 2}
            int[] rightInOrder = Arrays.copyOfRange(inOrder, i + 1, inOrder.length); // {6, 3, 7}
            
            int[] leftPreOrder = Arrays.copyOfRange(preOrder, 1, i + 1); // {2, 4}
            int[] rightPreOrder = Arrays.copyOfRange(preOrder, i + 1, preOrder.length); // {3, 6, 7}
            
            root.left = buildTree(leftPreOrder, leftInOrder);
            root.right = buildTree(rightPreOrder, rightInOrder);
            
            break;
        }
    }
    
    return root;
}
```

# Construct Binary Tree from Inorder and Postorder Traversal

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=161&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static TreeNode buildTree(int[] inOrder, int[] postOrder) {
    if (inOrder.length == 0 || postOrder.length == 0) {
        return null;
    }
    
    TreeNode root = new TreeNode(postOrder[postOrder.length - 1]);
    
    for (int i = 0; i < inOrder.length; i++) { // // preOrder = {1, 2, 4, 3, 6, 7}, inOrder = {4, 2, 1, 6, 3, 7}, postOrder = {4, 2, 6, 7, 3, 1}
        if (inOrder[i] == root.val) {
            int[] leftInOrder = Arrays.copyOfRange(inOrder, 0, i); // {4, 2}
            int[] rightInOrder = Arrays.copyOfRange(inOrder, i + 1, inOrder.length); // {6, 3, 7}
            
            int[] leftPostOrder = Arrays.copyOfRange(postOrder, 0, i);
            int[] rightPostOrder = Arrays.copyOfRange(postOrder, i, postOrder.length - 1);
            
            root.left = buildTree(leftInOrder, leftPostOrder);
            root.right = buildTree(rightInOrder, rightPostOrder);
            
            break;
        }
    }
    return root;
}
```

# Validate Binary Search Tree

[Problem Description](https://leetcode.cn/problems/validate-binary-search-tree/description/?envType=study-plan-v2&envId=top-100-liked)

```java
public static boolean isValidBST(TreeNode node) {
    LinkedList<TreeNode> stk = new LinkedList<>();
    TreeNode cur = node;
    TreeNode par = null;
    long last = Long.MIN_VALUE;
    
    while (cur != null || !stk.isEmpty()) {
        if (cur != null) {
            stk.push(cur);
            cur = cur.left;
        } else {
            par = stk.pop();
            if (par.val <= last) {
                return false;
            } else {
                last = par.val;
            }
            cur = par.right;
        }
    }
    return true;
}
```

# Validate Binary Search Tree

```java
public static boolean isValidBST(TreeNode node) {
    return isValidBST(node, Long.MIN_VALUE, Long.MAX_VALUE);
}

public static boolean isValidBST(TreeNode node, long lower, long upper) {
    if (node == null) {
        return true;
    }
    if (node.val <= lower || node.val >= upper) {
        return false;
    }
    return isValidBST(node.left, lower, node.val) && isValidBST(node.right, node.val, upper);
}
```

# Validate Binary Search Tree

```java
public static boolean isValidBST(TreeNode root) {
    return process(root).isBst;
}

public static Result process(TreeNode node) {
    if (node == null) {
        return null;
    }

    Result leftResult = process(node.left);
    Result rightResult = process(node.right);

    boolean isBst = true;
    int min = node.val;
    int max = node.val;
    if (leftResult != null) {
        min = Math.min(min, leftResult.min);
        max = Math.max(max, leftResult.max);
        if (!leftResult.isBst || leftResult.max >= node.val) isBst = false;
    }
    if (rightResult != null) {
        min = Math.min(min, rightResult.min);
        max = Math.max(max, rightResult.max);
        if (!rightResult.isBst || rightResult.min <= node.val) isBst = false;
    }
    return new Result(isBst, min, max);
}

public static class Result {
    boolean isBst;
    int min;
    int max;

    public Result() {}

    public Result(boolean isBst) {
        this.isBst = isBst;
    }

    public Result(boolean isBst, int min, int max) {
        this.isBst = isBst;
        this.min = min;
        this.max = max;
    }
}
```

# Check Completeness of a Binary Tree

[Problem Description](https://leetcode.cn/problems/check-completeness-of-a-binary-tree/description/)

[Explain 00:20:00](https://www.bilibili.com/video/BV13g41157hK?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=8)

```java
public static boolean isCompleteTree(TreeNode root) {
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    boolean isFoundNull = false;
    while (!queue.isEmpty()) {
        TreeNode cur = queue.poll();
        if (cur == null) {
            isFoundNull = true;
        } else {
            // 在空节点之后又遇到非空节点，不是完全二叉树
            if (isFoundNull) return false;
            queue.offer(cur.left);
            queue.offer(cur.right);
        }
    }
    return true;
}
```

# Validate Full Binary Tree

```java
public static boolean isFull(TreeNode root) {
    return process(root).isFull;
}

public static Result process(TreeNode node) {
    if (node == null) return new Result(true, 0);
    Result leftResult = process(node.left);
    Result rightResult = process(node.right);
    boolean isFull = leftResult.isFull && rightResult.isFull && leftResult.size == rightResult.size;
    int size = leftResult.size + rightResult.size + 1;
    return new Result(isFull, size);
}

public static class Result {
    boolean isFull;
    int size;

    public Result() {}

    public Result(boolean isFull) {
        this.isFull = isFull;
    }

    public Result(boolean isFull, int size) {
        this.isFull = isFull;
        this.size = size;
    }
}
```

# Kth Smallest Element in a BST

[Problem Description](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/description/?envType=study-plan-v2&envId=top-100-liked)

```java
public static int kthSmallest(TreeNode root, int nth) {
    LinkedList<TreeNode> stk = new LinkedList<>();
    TreeNode cur = root;
    int n = 0;
    while (cur != null || !stk.isEmpty()) {
        if (cur != null) {
            stk.push(cur);
            cur = cur.left;
        } else {
            TreeNode par = stk.pop();
            if (++n == nth) {
                return par.val;
            }
            cur = par.right;
        }
    }
    return 0;
}
```

# Flatten Binary Tree to Linked List

[Problem Description](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/description/?envType=study-plan-v2&envId=top-100-liked)

[Explain](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/solutions/17274/xiang-xi-tong-su-de-si-lu-fen-xi-duo-jie-fa-by--26/?envType=study-plan-v2&envId=top-100-liked)

```java
public static void flatten(TreeNode root) {
    TreeNode cur = root;
    while (cur != null) {
        if (cur.left != null) {
            TreeNode pre = cur.left;
            while (pre.right != null) {
                pre = pre.right;
            }
            pre.right = cur.right;
            cur.right = cur.left;
            cur.left = null;
        } 
        cur = cur.right;
    }
}
```

# Path Sum

[Problem Description](https://leetcode.cn/problems/path-sum/description/)

```java
public static boolean hasPathSum(TreeNode root, int tarSum) {
    if (root == null) {
        return false;
    }
    LinkedList<TreeNode> queNode = new LinkedList<>();
    LinkedList<Integer> queSum = new LinkedList<>();
    queNode.offer(root);
    queSum.offer(root.val);
    while (!queNode.isEmpty()) {
        TreeNode cur = queNode.poll();
        Integer curSum = queSum.poll();
        if (cur.left == null && cur.right == null) {
            if (curSum == tarSum) {
                return true;
            }
        } else {
            if (cur.left != null) {
                queNode.offer(cur.left);
                queSum.offer(cur.left.val + curSum);
            }
            if (cur.right != null) {
                queNode.offer(cur.right);
                queSum.offer(cur.right.val + curSum);
            }
        }
    }
    return false;
}
```

# Path Sum

```java
public boolean hasPathSum(TreeNode root, int tarSum) {
    return hasPathSum(root, 0, tarSum);
}

public boolean hasPathSum(TreeNode node, int curSum, int tarSum) {
    if (node == null) {
        return false;
    }
    curSum += node.val;
    if (node.left == null && node.right == null) {
        return curSum == tarSum;
    }
    return hasPathSum(node.left, curSum, tarSum) || hasPathSum(node.right, curSum, tarSum);
}
```

# Path Sum

```java
public boolean hasPathSum(TreeNode node, int tarSum) {
    if (node == null) {
        return false;
    }
    if (node.left == null && node.right == null) {
        return node.val == tarSum;
    }
    return hasPathSum(node.left, tarSum - node.val) || hasPathSum(node.right, tarSum - node.val);
}
```

# Path Sum II

[Problem Description](https://leetcode.cn/problems/path-sum-ii/description/)

```java
public static List<List<Integer>> pathSum(TreeNode root, int tarSum) {
    if (root == null) {
        return new ArrayList<>();
    }
    List<List<Integer>> lv1 = new ArrayList<>();
    Map<TreeNode, TreeNode> map = new HashMap<>();
    LinkedList<TreeNode> queNode = new LinkedList<>();
    LinkedList<Integer> queSum = new LinkedList<>();
    queNode.offer(root);
    queSum.offer(root.val);
    while (!queNode.isEmpty()) {
        TreeNode cur = queNode.poll();
        Integer curSum = queSum.poll();
        if (cur.left == null && cur.right == null) {
            if (curSum == tarSum) {
                LinkedList<Integer> lv2 = new LinkedList<>();
                while (cur != null) {
                    lv2.addFirst(cur.val);
                    cur = map.get(cur);
                }
                lv1.add(lv2);
            }
        } else {
            if (cur.left != null) {
                map.put(cur.left, cur);
                queNode.offer(cur.left);
                queSum.offer(cur.left.val + curSum);
            }
            if (cur.right != null) {
                map.put(cur.right, cur);
                queNode.offer(cur.right);
                queSum.offer(cur.right.val + curSum);
            }
        }
    }
    return lv1;
}
```

# Path Sum II

```java
public static List<List<Integer>> pathSum(TreeNode root, int tarSum) {
    List<List<Integer>> lv1 = new ArrayList<>();
    dfs(root, tarSum, lv1, new LinkedList<>());
    return lv1;
}

public static void dfs(TreeNode node, int tarSum, List<List<Integer>> lv1, LinkedList<Integer> lv2) {
    if (node == null) {
        return;
    }
    lv2.addLast(node.val);
    if (node.left == null && node.right == null) {
        if (node.val == tarSum) {
            lv1.add(new ArrayList<>(lv2));
        }
    }
    dfs(node.left, tarSum - node.val, lv1, lv2);
    dfs(node.right, tarSum - node.val, lv1, lv2);
    lv2.removeLast();
}
```

# Path Sum III

[Problem Description](https://leetcode.cn/problems/path-sum-iii/description/?envType=study-plan-v2&envId=top-100-liked)

```java
```

# Serialize and Deserialize Binary Tree

[Problem Description](https://leetcode.cn/problems/serialize-and-deserialize-binary-tree/description/)

[Explain 02:01:47](https://www.bilibili.com/video/BV13g41157hK?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=8)

```java
public String serialize(TreeNode node) {
    if (node == null) return "#";
    return node.val + "," + serialize(node.left) + "," + serialize(node.right);
}

public TreeNode deserialize(String data) {
    Queue<String> vals = new LinkedList<>(Arrays.asList(data.split(",")));
    return buildTree(vals);
}

private TreeNode buildTree(Queue<String> vals) {
    String val = vals.poll();
    if (val.equals("#")) {
        return null;
    }
    TreeNode node = new TreeNode(Integer.parseInt(val));
    node.left = buildTree(vals);
    node.right = buildTree(vals);
    return node;
}
```

### Fold Paper Problem

[Problem Description](https://leetcode.cn/circle/discuss/7RCcxy/)

[Explain 02:11:44](https://www.bilibili.com/video/BV13g41157hK?spm_id_from=333.788.player.switch&vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=8)

假设一段纸条竖着放在桌面上：

- 对折一次后展开，折痕为 down（凹痕）。
- 对折两次后展开，折痕从上到下为：down, down, up。
- 对折三次后展开，折痕从上到下为：down, down, up, down, down, up, up。

折痕的规律：

- 每次对折，上一次折痕的中间插入一个新的凹痕 (down)，并递归产生左右子折痕。
- 折痕的生成结构可以用二叉树表示：
- 根节点为 down。
- 每个节点的左子节点为 down，右子节点为 up。

本质：折痕顺序等同于对这棵二叉树的 中序遍历。

N = 1

```
down
```

N = 2

```
      down
     /    \
  down    up
```

N = 3

```
          down
         /    \
      down    up
     /   \   /   \
  down  up down  up
```

```java
public void printAllFolds(int size) {
    printFolds(1, size, true);
}

private void printFolds(int level, int size, boolean isDown) {
    if (level > size) {
        return;
    }
    printFolds(level + 1, size, true);
    System.out.print(isDown ? "down " : "up ");
    printFolds(level + 1, size, false);
}
```

