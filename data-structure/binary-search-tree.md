# Binary Search Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=162&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
package com.harvey;

import java.util.ArrayList;
import java.util.LinkedList;

public class BinarySearchTree<K extends Comparable<K>, V> {
    private Node<K, V> root;
    
    private static class Node<K, V> {
        public K key;
        public V value;
        public Node<K, V> left;
        public Node<K, V> right;
        
        public Node(K key) {
            this.key = key;
        }
        
        public Node(K key, V value) {
            this.key = key;
            this.value = value;
        }
        
        public Node(K key, V value, Node<K, V> left, Node<K, V> right) {
            this.key = key;
            this.value = value;
            this.left = left;
            this.right = right;
        }
        
        @Override
        public String toString() {
            return this.key + " " + this.value;
        }
    }
    
    public void print() {
        if (root == null) {
            return;
        }
        
        LinkedList<Node<K, V>> queue = new LinkedList<>();
        queue.offer(root);
        
        while (!queue.isEmpty()) {
            int size = queue.size();
            
            for (int i = 0; i < size; i++) {
                Node<K, V> node = queue.poll();
                System.out.print(node + "\t");
                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }
            
            System.out.println();
        }
    }
}
```

# Put Node

```java
/**
 * Inserts a new node with the specified key and value into the binary search tree.
 * If the key already exists in the tree, updates the value of the existing node.
 *
 * @param key The key of the new node.
 * @param value The value of the new node.
 */
public void put(K key, V value) {
    // If the tree is empty, create a new root node with the specified key and value.
    if (root == null) {
        root = new Node<>(key, value);
        return;
    }
    
    Node<K, V> par = null;
    Node<K, V> cur = root;
    
    // Traverse the tree until we find an empty spot where we can insert the new node.
    while (cur != null) {
        par = cur;

        if (key.compareTo(cur.key) < 0) {
            cur = cur.left;
        } else if (key.compareTo(cur.key) > 0) {
            cur = cur.right;
        } else {
            cur.value = value;
        }
    }
    
    // Create a new node and insert it into the correct position in the tree.
    if (key.compareTo(par.key) < 0) {
        par.left = new Node<>(key, value);
    } else {
        par.right = new Node<>(key, value);
    }
}
```

# Put Node (Recursive)

```java
public void put(K key, V value) {
    doPut(key, value, root);
}

private Node<K, V> doPut(Node<K, V> node, K key, V value) {
    if (root == null) {
        return new Node<>(key, value);
    }
    
    if (key.compareTo(node.key) < 0) {
        node.left = doPut(node.left, key, value);
    } else if (key.compareTo(node.key) > 0) {
        node.right = doPut(node.right, key, value);
    } else {
        node.value = value;
    }
    
    return node;
}
```

# Get Value

```java
public V get(K key) {
    Node<K, V> cur = root;
    
    while (cur != null) {
        if (key.compareTo(cur.key) < 0) {
            cur = cur.left;
        } else if (key.compareTo(cur.key) > 0) {
            cur = cur.right;
        } else {
            return cur.value;
        }
    }
    
    return null;
}
```

# Get Value (Recursive)

```java
public V get(K key) {
    return doGet(key, root);
}

private V doGet(Node<K, V> node, K key) {
    if (node == null) {
        return null;
    }

    if (key.compareTo(node.key) < 0) {
        return doGet(key, node.left);
    } else if (key.compareTo(node.key) > 0) {
        return doGet(key, node.right);
    } else {
        return node.value;
    }
}
```

# Get Min and Max

```java
public V getMinValue() {
    return getMinNode(root).value;
}

private Node<K, V> getMinNode(Node<K, V> root) {
    if (node == null) {
        return null;
    }
    
    Node<K, V> cur = root;
    while (cur.left != null) {
        cur = cur.left;
    }
    
    return cur;
}

public V getMaxValue() {
    return getMaxNode(root).value;
}

private Node<K, V> getMaxNode(Node<K, V> root) {
    if (node == null) {
        return null;
    }
    
    Node<K, V> cur = root;
    while (cur.right != null) {
        cur = cur.right;
    }
    
    return cur;
}
```

# Get Min and Max (Recursive)

```java
public V getMinValue() {
    if (root == null) {
        return null;
    }

    return doGetMinValue(root);
}

private V doGetMinValue(Node<K, V> node) {
    if (node.left == null) {
        return node.value;
    }

    return doGetMinValue(node.left);
}

public V getMaxValue() {
    if (root == null) {
        return null;
    }

    return doGetMaxValue(root);
}

private V doGetMaxValue(Node<K, V> node) {
    if (node.right == null) {
        return node.value;
    }

    return doGetMaxValue(node.right);
}
```

# Get Predecessor

[Explain p167, p168](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=167&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public V getPredecessorVal(K key) {
    Node<K, V> cur = root;
    Node<K, V> leftPar = null;
    
    while (cur != null) {
        int cmp = key.compareTo(cur.key);
        if (cmp < 0) {
            cur = cur.left;
        } else if (cmp > 0) {
            leftPar = cur;
            cur = cur.right;
        } else {
            if (cur.left != null) {
                return getMinNode(cur.left).val;
            } else {
                return leftPar != null ? leftPar.val : null;
            }
        }
    }
    
    return null;
}
```

# Get Successor

```java
public V getSuccessorVal(K key) {
    Node<K, V> cur = root;
    Node<K, V> rightPar = null;
    
    while (cur != null) {
        int cmp = key.compareTo(cur.key);
        if (cmp < 0) {
            rightPar = cur;
            cur = cur.left;
        } else if (cmp > 0) {
            cur = cur.right;
        } else {
            if (cur.left != null) {
                return getMinNode(cur.left).val;
            } else {
                return rightPar != null ? rightPar.val : null;
            }
        }
    }
    
    return null;
}
```

# Get Successor II

TreeNode 有一个 par 字段记录父节点，有办法快速获取后继节点么？

[Explain 01:53:54](https://www.bilibili.com/video/BV13g41157hK?vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=8&spm_id_from=333.788.player.switch)

```java
public static TreeNode getSuccessorNode(TreeNode cur) {
    if (cur == null) {
        return cur;
    }
    // 如果有右子树
    if (cur.right != null) {
        return getMinNode(cur.right);
    }
    // 如果没有右子树
    else {
        // 一直往上找，如果打破了 par.right == cur 说明 cur 为 tar 的左子树的最右边的节点，则 cur 的后继节点就是 tar
        // 如果打破了 par != null 说明 cur 为 root 的右子树的最右边的节点，则 cur 的后继节点就是 null
        TreeNode par = cur.par;
        while (par != null && par.right == cur) {
            cur = par;
            par = cur.par;
        }
        return par;
    }
}
```

# Delete Node

[Explain Video p169, p170, p171](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=169)

```java
/**
 * This method deletes a node with a specific key from the binary search tree (BST).
 * The deletion process follows these steps:
 * 1. Start from the root and search for the node with the key to delete.
 * 2. If the node has no children or one child, replace the node with its child.
 * 3. If the node has two children, replace the node with its in-order successor and delete the successor node.
 *
 * @param key The key of the node to be deleted.
 */
public void del(K key) {
    // Initialize parent and current node pointers
    Node<K, V> par = null;
    Node<K, V> cur = root;

    // Start searching for the key
    while (cur != null) {
        int cmp = key.compareTo(cur.key);
        // If the key is less than the current node's key, go left
        if (cmp < 0) {
            par = cur;
            cur = cur.left;
        } 
        // If the key is greater than the current node's key, go right
        else if (cmp > 0) {2
            par = cur;
            cur = cur.right;
        } 
        // Key is found
        else {
            break;
        }
    }

    // Key not found
    if (cur == null) {
        return;
    }

    // Node to be deleted has only right child or no child
    if (cur.left == null) {
        shiftNode(par, cur, cur.right);
    } 
    // Node to be deleted has only left child
    else if (cur.right == null) {
        shiftNode(par, cur, cur.left);
    } 
    // Node to be deleted has two children
    else {
        // Find the in-order successor (smallest in the right subtree)
        Node<K, V> sp = cur; // parent of successor node
        Node<K, V> s = cur.right; // successor node
        while (s.left != null) {
            sp = s;
            s = s.left;
        }
        // If the successor node has a right child, replace the successor with its right child
        if (sp != cur) {
            shiftNode(sp, s, s.right);
            s.right = cur.right;
        }
        // Replace the left child of the successor node
        s.left = cur.left;
        // Replace the node to be deleted with the successor node
        shiftNode(par, cur, s);
    }
}

/**
 * This method replaces the current node with the substitute node in the binary search tree.
 *
 * @param par The parent node of the current node.
 * @param cur The current node to be replaced.
 * @param sub The substitute node.
 */
private void shiftNode(Node par, Node cur, Node sub) {
    // If the current node is the root, replace the root
    if (par == null) {
        root = sub;
    } 
    // If the current node is the left child of its parent, replace the parent's left child
    else if (cur == par.left) {
        par.left = sub;
    } 
    // If the current node is the right child of its parent, replace the parent's right child
    else if (cur == par.right) {
        par.right = sub;
    }
}
```

# Delete Node (Recursive)

[Explain Video p172, p173](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=172)

```java
/**
 * This method deletes a node with a specific key from the binary search tree (BST).
 * The deletion process follows these steps:
 * 1. Start from the root and search for the node with the key to delete.
 * 2. If the node has no children or one child, replace the node with its child.
 * 3. If the node has two children, replace the node with its in-order successor and delete the successor node.
 *
 * @param key The key of the node to be deleted.
 */
public void del(K key) {
    // Call the helper function doDel to delete the node with the given key
    root = doDel(null, root, key);
}

/**
 * This is a helper method that recursively deletes a node with a specific key from the binary search tree.
 *
 * @param par The parent node of the current node.
 * @param cur The current node.
 * @param key The key of the node to be deleted.
 * @return The root of the modified subtree.
 */
private Node<K, V> doDel(Node<K, V> par, Node<K, V> cur, K key) {
    // If the current node is null, return null
    if (cur == null) {
        return null;
    }

    // Compare the key with the current node's key
    int cmp = key.compareTo(cur.key);
    // If the key is less than the current node's key, go left
    if (cmp < 0) {
        cur.left = doDel(cur, cur.left, key);
        return cur;
    } 
    // If the key is greater than the current node's key, go right
    else if (cmp > 0) {
        cur.right = doDel(cur, cur.right, key);
        return cur;
    }

    // Key is found
    // Node to be deleted has only right child or no child
    if (cur.left == null) {
        return cur.right;
    } 
    // Node to be deleted has only left child
    else if (cur.right == null) {
        return cur.left;
    } 
    // Node to be deleted has two children
    else {
        // Find the in-order successor (smallest in the right subtree)
        Node<K, V> sp = cur; // parent of successor node
        Node<K, V> s = cur.right; // successor node
        while (s.left != null) {
            sp = s;
            s = s.left;
        }
        // If the successor node has a right child, replace the successor with its right child
        if (sp != cur) {
            shiftNode(sp, s, s.right);
            s.right = cur.right;
        }
        // Replace the left child of the successor node
        s.left = cur.left;
        // Replace the node to be deleted with the successor node
        shiftNode(par, cur, s);
        return s;
    }
}
```

# Range Query

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=174&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
// Less than key
public List<V> lt(K key) {
    ArrayList<V> r = new ArrayList<>();
    Node<K, V> cur = root;
    LinkedList<Node<K, V>> stack = new LinkedList<>();
    
    while (cur != null || !stack.isEmpty()) {
        if (cur != null) {
            stack.push(cur);
            cur = cur.left;
        } else {
            Node<K, V> par = stack.pop();
            if (par.key.compareTo(key) < 0) {
                r.add(par.val);
            } else {
                break;
            }
            cur = par.right;
        }
    }
    
    return r;
}

// Greater than key
public List<V> gt(K key) {
    ArrayList<V> r = new ArrayList<>();
    Node<K, V> cur = root;
    LinkedList<Node<K, V>> stack = new LinkedList<>();
    
    while (cur != null || !stack.isEmpty()) {
        if (cur != null) {
            stack.push(cur);
            cur = cur.right;
        } else {
            Node<K, V> par = stack.pop();
            if (par.key.compareTo(key) > 0) {
                r.add(par.val);
            } else {
                break;
            }
            cur = par.left;
        }
    }
    
    return r;
}

// Between key1 and key2
public List<V> bt(K key1, K key2) {
    ArrayList<V> r = new ArrayList<>();
    Node<K, V> cur = root;
    LinkedList<Node<K, V>> stack = new LinkedList<>();
    
    while (cur != null || !stack.isEmpty()) {
        if (cur != null) {
            stack.push(cur);
            cur = cur.left;
        } else {
            Node<K, V> par = stack.pop();
            if (par.key.compareTo(key1) > 0 && par.key.compareTo(key2) < 0) {
                r.add(par.val);
            } else if (par.key.compareTo(key2) > 0) {
                break;
            }
            cur = par.right;
        }
    }
    
    return r;
}
```

# Validate BST

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=176&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * This method checks if a binary tree is a valid Binary Search Tree (BST).
 * A BST is a tree where the nodes meet the following condition: 
 * every node on the right is larger than the current node and every node on the left is smaller.
 *
 * @param root The root node of the binary tree.
 * @return true if the tree is a valid BST, false otherwise.
 */
public boolean isValidBST(TreeNode root) {
    // Initialize the current node to the root of the tree
    TreeNode cur = root;
    
    // Initialize the predecessor node with the smallest integer value
    TreeNode pred = new TreeNode(Integer.MIN_VALUE);
    
    // Create a stack to keep track of the tree nodes
    LinkedList<TreeNode> stack = new LinkedList<>();

    // Traverse the tree while there are nodes left to visit
    while (cur != null || !stack.isEmpty()) {
        // Traverse to the leftmost node
        while (cur != null) {
            stack.push(cur);
            cur = cur.left;
        }
        // Backtrack from the empty subtree and visit the node at the top of the stack
        cur = stack.pop();
        
        // If the current node's value is less than or equal to the predecessor's value, then it's not a valid BST
        if (pred.val >= cur.val) {
            return false;
        }
        
        // Save the current node as the predecessor before visiting the right subtree
        pred = cur;
        cur = cur.right;
    }

    // If all nodes have been visited and no invalid BST conditions were found, return true
    return true;
}
```

# Validate BST

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=177&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * A TreeNode object to keep track of the predecessor node in the BST.
 */
private TreeNode pred = new TreeNode(Integer.MIN_VALUE);

/**
 * Method to validate if a given tree is a Binary Search Tree (BST).
 * 
 * A BST is a tree where every node has the following properties:
 * - The left subtree of a node contains only nodes with keys less than the node's key.
 * - The right subtree of a node contains only nodes with keys greater than the node's key.
 * - Both the left and right subtrees must also be binary search trees.
 *
 * @param cur The root node of the tree to validate.
 * @return true if the tree is a BST, false otherwise.
 */
public boolean isValidBST(TreeNode cur) {
    // Base case: if the current node is null, it's a BST
    if (cur == null) {
        return true;
    }

    // Check the left subtree. If it's not a BST, return false
    if (!isValidBST(cur.left)) {
        return false;
    }

    // Check the current node. If its value is less than or equal to the predecessor's value, return false
    if (pred.val >= cur.val) {
        return false;
    }

    // Update the predecessor to the current node
    pred = cur;

    // Check the right subtree. If it's not a BST, return false
    if (!isValidBST(cur.right)) {
        return false;
    }

    // If all checks pass, the tree is a BST
    return true;
}
```

# Validate BST

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=178&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * Checks if a given tree is a valid Binary Search Tree (BST).
 *
 * @param node The root node of the tree to be validated.
 * @return true if the tree is a valid BST, false otherwise.
 */
public boolean isValidBST(TreeNode node) {
    // The validation starts with the smallest possible long value.
    return doValid(node, new AtomicLong(Long.MIN_VALUE));
}

/**
 * Recursive helper method to validate the BST.
 * It performs an in-order traversal and checks if the values of the nodes are in ascending order.
 *
 * @param node The current node in the traversal.
 * @param predVal The value of the predecessor node in the in-order traversal.
 * @return true if the subtree rooted at 'node' is a valid BST, false otherwise.
 */
public boolean doValid(TreeNode node, AtomicLong predVal) {
    // Base case: an empty tree is a valid BST.
    if (node == null) {
        return true;
    }

    // Recursively check the left subtree.
    if (!doValid(node.left, predVal)) {
        return false;
    }

    // Check the current node. If its value is not greater than its predecessor's value, it's not a valid BST.
    if (predVal.get() >= node.val) {
        return false;
    }

    // Update the predecessor value.
    predVal.set(node.val);

    // Recursively check the right subtree.
    return doValid(node.right, predVal);
}
```

# Validate BST

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=179&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public boolean doValid(TreeNode cur, long min, long max) {
    if (cur == null) {
        return true;
    }
    
    if (cur.val < min || cur.val > max) {
        return false;
    }
    
    return doValid(cur.left, min, cur.val) && doValid(cur.right, cur.val, max);
}
```

# Range Sum of BST

[Problem Description](https://leetcode.cn/problems/range-sum-of-bst/description/)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=180&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public int rangeSumBST(TreeNode root, int low, int high) {
    LinkedList<TreeNode> stack = new LinkedList<>();
    TreeNode cur = root;
    int sum = 0;
    while (cur != null || !stack.isEmpty()) {
        if (cur != null) {
            stack.push(cur);
            cur = cur.left;
        } else {
            TreeNode pop = stack.pop();
            if (pop.val > high) {
                return sum;
            }
            if (pop.val >= low) {
                sum += pop.val;
            }
            cur = pop.right;
        }
    }
    return sum;
}
```

# Range Sum of BST

[Problem Description](https://leetcode.cn/problems/range-sum-of-bst/description/)

[Explain p180 (05:00)](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=180&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public int rangeSumBST(TreeNode node, int low, int high) {
    if (node == null) {
        return 0;
    }
    
    if (node.val < low) {
        return rangeSumBST(node.right, low, high);
    }
    if (node.val > high) {
        return rangeSumBST(node.left, low, high);
    }
    
    return node.val + rangeSumBST(node.left, low, high) + rangeSumBST(node.right, low, high);
}
```

# Construct BST from Preorder Traversal

[Problem Description](https://leetcode.cn/problems/construct-binary-search-tree-from-preorder-traversal/description/)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=181&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public TreeNode bstFromPreOrder(int[] preOrder) {
    TreeNode root = new TreeNode(preOrder[0]);
    
    for (int val : preOrder) {
        doPut(root, val);
    }
    
    return root;
}

public TreeNode doPut(TreeNode cur, int val) {
    if (cur == null) {
        return new TreeNode(val);
    }
    
    if (val < cur.val) {
        cur.left = doPut(cur.left, val);
    } else if (val > cur.val) {
        cur.right = doPut(cur.right, val);
    }
    
    return cur;
}
```

# Construct BST from Preorder Traversal

[Problem Description](https://leetcode.cn/problems/construct-binary-search-tree-from-preorder-traversal/description/)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=182&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public TreeNode bstFromPreOrder(int[] preOrder) {
    return doPut(preOrder, Integer.MIN_VALUE, Integer.MAX_VALUE);
}

public int idx;

public TreeNode doPut(int[] preOrder, int min, int max) {
    if (idx == preOrder.length) {
        return null;
    }
    
    int val = preOrder[idx];
    if (val > max) {
        return null;
    }
    if (val < min) {
        return null;
    }
    idx++;
    
    TreeNode cur = new TreeNode(val);
    cur.left = doPut(preOrder, min, val);
    cur.right = doPut(preOrder, val, max);
    
    return cur;
}
```

# Construct BST from Preorder Traversal

[Problem Description](https://leetcode.cn/problems/construct-binary-search-tree-from-preorder-traversal/description/)

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=183)

```java
/*
    8, 5, 1, 7, 10, 9, 12
    
    8, (5, 1, 7), (10, 9, 12)
    
    8, (5, (1, 7)), (10, (9, 12))
 */
public TreeNode bstFromPreOrder(int[] preOrder) {
    return partition(preOrder, 0, preOrder.length - 1);
}

public TreeNode partition(int[] preOrder, int srt, int end) {
    if (srt > end) {
        return null;
    }
    
    int idx = srt + 1;
    while (idx <= end) {
        if (preOrder[idx] > preOrder[srt]) {
            break;
        }
        idx++;
    }
    
    TreeNode cur = new TreeNode(preOrder[srt]);
    cur.left = partition(preOrder, srt + 1, idx - 1);
    cur.right = partition(preOrder, idx, end);
    
    return cur;
}
```

# Lowest Common Ancestor of a Binary Search Tree

[Problem Description](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree/description/)

[Explain 01:24:50](https://www.bilibili.com/video/BV13g41157hK?vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=8&spm_id_from=333.788.player.switch)

```java
public static TreeNode lowestCommonAncestor(TreeNode root, TreeNode o1, TreeNode o2) {
    // 遍历整颗树，存储每个节点的父节点
    HashMap<TreeNode, TreeNode> pars = new HashMap<>();
    pars.put(root, null);
    fillPars(root, pars);

    // 从 o1 开始向上遍历，将 o1 所有的父节点都存储在 set 中
    HashSet<TreeNode> set = new HashSet<>();
    TreeNode cur = o1;
    while (cur != null) {
        set.add(cur);
        cur = pars.get(cur);
    }

    // 从 o2 开始向上遍历，如果有节点在 set 中，说明相遇了
    cur = o2;
    while (cur != null) {
        if (set.contains(cur)) {
            return cur;
        }
        cur = pars.get(cur);
    }

    return null;
}

public static void fillPars(TreeNode node, Map<TreeNode, TreeNode> pars) {
    if (node == null) {
        return;
    }
    if (node.left != null) {
        pars.put(node.left, node);
        fillPars(node.left, pars);
    }
    if (node.right != null) {
        pars.put(node.right, node);
        fillPars(node.right, pars);
    }
}
```

# Lowest Common Ancestor of a Binary Search Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=184&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * Finds the Lowest Common Ancestor (LCA) of two nodes in a Binary Search Tree (BST).
 * The LCA is defined between two nodes p and q as the lowest node in T that has both p and q as descendants
 * (where we allow a node to be a descendant of itself).
 *
 * @param root The root node of the BST.
 * @param p The first node for which to find the LCA.
 * @param q The second node for which to find the LCA.
 * @return The LCA of the two nodes.
 */
public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    // Start from the root node.
    TreeNode cur = root;

    // Traverse down the tree.
    while (p.val < cur.val && q.val < cur.val || p.val > cur.val && q.val > cur.val) {
        // If both nodes are to the left of the current node, move to the left child.
        if (p.val < cur.val) {
            cur = cur.left;
        } 
        // If both nodes are to the right of the current node, move to the right child.
        else {
            cur = cur.right;
        }
    }

    // When we're here, cur is either one of the two nodes or the first node that has one node in its left subtree and the other node in its right subtree.
    // So it is the LCA.
    return cur;
}
```

# Lowest Common Ancestor of a Binary Search Tree

[Explain 01:33:20](https://www.bilibili.com/video/BV13g41157hK?vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=8&spm_id_from=333.788.player.switch)

```java
public static TreeNode lowestCommonAncestor(TreeNode node, TreeNode o1, TreeNode o2) {
    if (node == null || node == o1 || node == o2) {
        return node;
    }
    // 去左边找 o1 和 o2
    TreeNode left = lowestCommonAncestor(node.left, o1, o2);
    // 去右边找 o1 和 o2
    TreeNode right = lowestCommonAncestor(node.right, o1, o2);
    // 如果 o1 和 o2 都找到了，说明当前节点就是最近公共祖先
    if (left != null && right != null) {
        return node;
    }
    // 如果只在一边找到了 o1 或 o2，说明 o1 是 o2 的公共祖先，或者 o2 是 o1 的公共祖先
    else {
        return left != null ? left : right;
    }
}
```
