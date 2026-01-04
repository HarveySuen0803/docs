# AVL Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=185&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public class AVLTree {
    private Node root;
    
    private static class Node {
        public int key;
        public int val;
        public Node left;
        public Node right;
        public int height = 1;
        
        public Node(int key, int val) {
            this.key = key;
            this.val = val;
        }
        
        public Node(int key, int val, Node left, Node right) {
            this.key = key;
            this.val = val;
            this.left = left;
            this.right = right;
        }
    }
}
```

# Tree Height

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=186&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
private int getHeight(Node node) {
    return node == null ? 0 : node.height;
}

private void updHeight(Node node) {
    node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
}

private int bf(Node node) {
    return getHeight(node.left) - getHeight(node.right);
}
```

# Rotate Tree

[Explain p187, p188](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=187&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * Performs a right rotation on a given node in a binary search tree.
 *
 * @param oldRoot The node to be rotated. This becomes the right child of the new root.
 * @return newRoot The new root of the sub-tree, originally the left child of the old root.
 */
private Node rightRotate(Node oldRoot) {
    Node newRoot = oldRoot.left;
    oldRoot.left = newRoot.right;
    newRoot.right = oldRoot;
    updHeight(oldRoot);
    updHeight(newRoot);
    return newRoot;
}

/**
 * Performs a left rotation on a given node in a binary search tree.
 *
 * @param oldRoot The node to be rotated. This becomes the left child of the new root.
 * @return newRoot The new root of the sub-tree, originally the right child of the old root.
 */
private Node leftRotate(Node oldRoot) {
    Node newRoot = oldRoot.right;
    oldRoot.right = newRoot.left;
    newRoot.left = oldRoot;
    updHeight(oldRoot);
    updHeight(newRoot);
    return newRoot;
}

/**
 * Performs a left-right rotation on a given node.
 *
 * This method first performs a left rotation on the left child of the given node,
 * and then performs a right rotation on the given node itself.
 *
 * @param oldRoot The node to be rotated.
 * @return The new root after rotation.
 */
private Node leftRightRotate(Node oldRoot) {
    // Perform left rotation on the left child of the old root
    oldRoot.left = leftRotate(oldRoot.left);
    // Perform right rotation on the old root
    return rightRotate(oldRoot);
}

/**
 * Performs a right-left rotation on a given node.
 *
 * This method first performs a right rotation on the left child of the given node,
 * and then performs a left rotation on the given node itself.
 *
 * @param oldRoot The node to be rotated.
 * @return The new root after rotation.
 */
private Node rightLeftRotate(Node oldRoot) {
    // Perform right rotation on the left child of the old root
    oldRoot.right = rightRotate(oldRoot.right);
    // Perform left rotation on the old root
    return leftRotate(oldRoot);
}
```

# Balance Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=189)

```java
/**
 * Balances the AVL Tree by performing necessary rotations based on the balance factor of the given node.
 *
 * @param root The root node of the subtree to be balanced.
 * @return The balanced root node of the subtree.
 */
private Node balance(Node root) {
    // Check if the subtree is null, no balancing needed.
    if (root == null) {
        return null;
    }

    // Check the balance factor of the current node.
    int bf1 = bf(root);
    if (bf1 == 2) {
        // Subtree is left-heavy.
        int bf2 = bf(root.left);
        if (bf2 == 1) {
            // Subtree is left-right heavy, perform right rotation.
            return rightRotate(root);
        } else if (bf2 == -1) {
            // Subtree is left-left heavy, perform left-right rotation.
            return leftRightRotate(root);
        }
    } else if (bf1 == -2) {
        // Subtree is right-heavy.
        int bf2 = bf(root.right);
        if (bf2 == -1) {
            // Subtree is right-left heavy, perform left rotation.
            return leftRotate(root);
        } else if (bf2 == 1) {
            // Subtree is right-right heavy, perform right-left rotation.
            return rightLeftRotate(root);
        }
    }

    // If no rotation is needed, return the current root node.
    return root;
}

```

# Put Node

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=190&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * Inserts a key-value pair into the AVL Tree and ensures that the tree remains balanced after the insertion.
 * If the key already exists in the tree, it updates the value of the node.
 *
 * @param key The key of the node to be inserted.
 * @param val The value associated with the key.
 */
public void put(int key, int val) {
    // Call the helper method to perform the insertion and maintain balance.
    root = doPut(root, key, val);
}

/**
 * Recursively performs the insertion of a new node with the specified key and value in the AVL Tree,
 * and then balances the tree to maintain its AVL property.
 *
 * @param cur The current node being considered during the recursive insertion.
 * @param key The key of the node to be inserted.
 * @param val The value associated with the key.
 * @return The updated node after insertion and balancing.
 */
private Node doPut(Node cur, int key, int val) {
    // If the current node is null, create a new node with the given key and value.
    if (cur == null) {
        return new Node(key, val);
    }

    // Determine the direction to traverse based on the key comparison.
    if (key < cur.key) {
        // Insert into the left subtree.
        cur.left = doPut(cur.left, key, val);
    } else if (key > cur.key) {
        // Insert into the right subtree.
        cur.right = doPut(cur.right, key, val);
    } else {
        // Key already exists, update the value.
        cur.val = val;
    }

    // Update the height of the current node after the insertion.
    updHeight(cur);

    // Balance the tree starting from the current node.
    return balance(cur);
}

```

# Del Node

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL?p=191&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * Deletes a node with the specified key from the AVL Tree and ensures that the tree remains balanced after deletion.
 * If the key does not exist in the tree, no action is taken.
 *
 * @param key The key of the node to be deleted.
 */
public void del(int key) {
    // Call the helper method to perform the deletion and maintain balance.
    root = doDel(root, key);
}

/**
 * Recursively performs the deletion of a node with the specified key in the AVL Tree,
 * and then balances the tree to maintain its AVL property.
 *
 * @param cur The current node being considered during the recursive deletion.
 * @param key The key of the node to be deleted.
 * @return The updated node after deletion and balancing.
 */
private Node doDel(Node cur, int key) {
    // If the current node is null, nothing to delete, return null.
    if (cur == null) {
        return null;
    }

    // Determine the direction to traverse based on the key comparison.
    if (key < cur.key) {
        // Delete from the left subtree.
        cur.left = doDel(cur.left, key);
    } else if (key > cur.key) {
        // Delete from the right subtree.
        cur.right = doDel(cur.right, key);
    } else {
        // Node to be deleted found.
        if (cur.left == null) {
            // Case 1: Node has no left child, replace with the right child.
            cur = cur.right;
        } else if (cur.right == null) {
            // Case 2: Node has no right child, replace with the left child.
            cur = cur.left;
        } else {
            // Case 3: Node has both left and right children.
            // Find the in-order successor (smallest key in the right subtree).
            Node suc = cur.right;
            while (suc.left != null) {
                suc = suc.left;
            }
            // Copy the successor's key and value to the current node.
            cur.key = suc.key;
            cur.val = suc.val;
            // Delete the successor from the right subtree.
            cur.right = doDel(cur.right, suc.key);
        }
    }

    // Update the height of the current node after the deletion.
    updHeight(cur);

    // Balance the tree starting from the current node.
    return balance(cur);
}
```
