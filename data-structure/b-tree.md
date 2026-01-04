# B Tree

```java
public class BTree {
    public Node root;
    private int t; // The minimum degree of the B-Tree
    private final int MIN_KEY_NUM; // The minimum number of keys a node can hold
    private final int MAX_KEY_NUM; // The maximum number of keys a node can hold

    public static class Node {
        public int[] keyArr; // Array to hold keys
        public Node[] childArr; // Array to hold child nodes
        public boolean isLeaf = true; // Boolean to check if the node is a leaf
        public int keyNum; // The number of keys in the node
        public int t; // The minimum degree of the B-Tree

        public Node(int t) {
            this.t = t;
            this.keyArr = new int[t * 2 - 1];
            this.childArr = new Node[t * 2];
        }

        public Node(int[] keyArr) {
            this.keyArr = keyArr;
        }

        @Override
        public String toString() {
            return Arrays.toString(Arrays.copyOfRange(keyArr, 0, keyNum));
        }

        /**
         * Method to get a node with a specific key.
         * @param key The key to search for
         * @return The node with the specific key, or null if the key is not found
         */
        public Node get(int key) {
            int i = 0;
            while (i < keyNum) {
                if (keyArr[i] == key) {
                    return this;
                }
                if (keyArr[i] > key) {
                    break;
                }
                i++;
            }

            if (isLeaf) {
                return null;
            }

            return childArr[i].get(key);
        }

        /**
         * Method to insert a key at a specific index in the node.
         * @param key The key to insert
         * @param idx The index to insert the key at
         */
        public void insertKey(int key, int idx) {
            System.arraycopy(keyArr, idx, keyArr, idx + 1, keyNum - idx);
            keyArr[idx] = key;
            keyNum++;
        }

        /**
         * Method to insert a child node at a specific index in the node.
         * @param child The child node to insert
         * @param idx The index to insert the child node at
         */
        public void insertChild(Node child, int idx) {
            System.arraycopy(childArr, idx, childArr, idx + 1, keyNum - idx);
            childArr[idx] = child;
        }

        /**
         * Method to remove a key at a specific index in the node.
         * @param idx The index to remove the key from
         * @return The key that was removed
         */
        public int removeKey(int idx) {
            int t = keyArr[idx];
            System.arraycopy(keyArr, idx + 1, keyArr, idx, --keyNum - idx);
            return t;
        }

        /**
         * Method to remove the leftmost key in the node.
         * @return The key that was removed
         */
        public int removeLeftmostKey() {
            return removeKey(0);
        }

        /**
         * Method to remove the rightmost key in the node.
         * @return The key that was removed
         */
        public int removeRightmostKey() {
            return removeKey(keyNum - 1);
        }

        /**
         * Method to remove a child node at a specific index in the node.
         * @param idx The index to remove the child node from
         * @return The child node that was removed
         */
        public Node removeChild(int idx) {
            Node t = childArr[idx];
            System.arraycopy(childArr, idx + 1, childArr, idx, keyNum - idx);
            childArr[keyNum] = null;
            return t;
        }

        /**
         * Method to remove the leftmost child node in the node.
         * @return The child node that was removed
         */
        public Node removeLeftmostChild() {
            return removeChild(0);
        }

        /**
         * Method to remove the rightmost child node in the node.
         * @return The child node that was removed
         */
        public Node removeRightmostChild() {
            return removeChild(keyNum);
        }

        /**
         * Method to get the left sibling of a child node at a specific index in the node.
         * @param idx The index of the child node
         * @return The left sibling of the child node, or null if the child node is the leftmost child
         */
        public Node childLeftSibling(int idx) {
            return idx > 0 ? childArr[idx - 1] : null;
        }

        /**
         * Method to get the right sibling of a child node at a specific index in the node.
         * @param idx The index of the child node
         * @return The right sibling of the child node, or null if the child node is the rightmost child
         */
        public Node childRightSibling(int idx) {
            return idx == keyNum ? null : childArr[idx + 1];
        }

        /**
         * Method to move all keys and child nodes from this node to a target node.
         * @param tar The target node to move keys and child nodes to
         */
        public void moveToTarget(Node tar) {
            int start = tar.keyNum;
            if (!isLeaf) {
                if (keyNum + 1 >= 0) System.arraycopy(childArr, 0, tar.childArr, start, keyNum + 1);
            }
            for (int i = 0; i < keyNum; i++) {
                tar.keyArr[tar.keyNum++] = keyArr[i];
            }
        }
    }

    /**
     * Default constructor to create a new B-Tree with a minimum degree of 2.
     */
    public BTree() {
        this(2);
    }

    /**
     * Constructor to create a new B-Tree with a specific minimum degree.
     * @param t The minimum degree of the B-Tree
     */
    public BTree(int t) {
        this.t = t;
        this.root = new Node(t);
        this.MAX_KEY_NUM = t * 2 - 1;
        this.MIN_KEY_NUM = t - 1;
    }

    /**
     * Method to check if the B-Tree contains a specific key.
     * @param key The key to check for
     * @return True if the B-Tree contains the key, false otherwise
     */
    public boolean hasKey(int key) {
        return root.get(key) != null;
    }
}
```

# Split Tree

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=8)

```java
/**
 * This method is used to split a full node into two nodes.
 * @param left The node to be split.
 * @param par The parent of the node to be split.
 * @param idx The index of the node to be split in its parent node's children array.
 */
public void split(Node left, Node par, int idx) {
    // If the node to be split is the root, create a new root.
    if (par == null) {
        Node newRoot = new Node(t);
        newRoot.isLeaf = false;
        newRoot.insertChild(left, 0);
        root = newRoot;
        par = newRoot;
    }

    // Create a new node and move half of the keys and children (if any) from the node to be split to the new node.
    Node right = new Node(t);
    right.isLeaf = left.isLeaf;
    System.arraycopy(left.keyArr, t, right.keyArr, 0, t - 1);
    if (!left.isLeaf) {
        System.arraycopy(left.childArr, t, right.childArr, 0, t);
    }
    right.keyNum = t - 1;
    left.keyNum = t - 1;

    // Insert the middle key into the parent node and add the new node as a child of the parent node.
    int mid = left.keyArr[t - 1];
    par.insertKey(mid, idx);
    par.insertChild(right, idx + 1);
}
```

# Put Node

[Explain p7, p12](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=7)

```java
/**
 * This method is used to add a key to the B Tree.
 * @param key The key to be added.
 */
public void put(int key) {
    doPut(root, null, key, 0);
}

/**
 * This method is used to recursively find the correct position of the key and insert it into the B Tree.
 * @param cur The current node.
 * @param par The parent of the current node.
 * @param key The key to be added.
 * @param idx The index of the current node in its parent node's children array.
 */
private void doPut(Node cur, Node par, int key, int idx) {
    // Find the correct position of the key.
    int i = 0;
    while (i < cur.keyNum) {
        if (cur.keyArr[i] == key) {
            return;  // If the key already exists, return.
        }
        if (cur.keyArr[i] > key) {
            break;  // If the current key is greater than the key to be inserted, break the loop.
        }
        i++;
    }

    // If the current node is a leaf node, insert the key. Otherwise, recursively insert the key into the appropriate child node.
    if (cur.isLeaf) {
        cur.insertKey(key, i);
    } else {
        doPut(cur.childArr[i], cur, key, i);
    }

    // If the current node is full after the insertion, split it.
    if (cur.keyNum == MAX_KEY_NUM) {
        split(cur, par, idx);
    }
}
```

# Remove Node

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=13)

```java
/**
 * Method to remove a key from the B-Tree.
 * @param key The key to remove
 */
public void remove(int key) {
    doRemove(root, null, key, 0);
}

/**
 * Recursive method to remove a key from a node in the B-Tree.
 * @param cur The current node
 * @param par The parent of the current node
 * @param key The key to remove
 * @param idx The index of the current node in its parent's child array
 */
private void doRemove(Node cur, Node par, int key, int idx) {
    int i = 0;
    while (i < cur.keyNum) {
        if (cur.keyArr[i] >= key) {
            break;
        }
        i++;
    }

    if (cur.isLeaf) {
        if (!isFound(cur, key, i)) {
            return;
        } else {
            cur.removeKey(i);
        }
    } else {
        if (!isFound(cur, key, i)) {
            doRemove(cur.childArr[i], cur, key, i);
        } else {
            Node s = cur.childArr[i + 1];
            while (!s.isLeaf) {
                s = s.childArr[0];
            }
            int sk = s.keyArr[0];
            cur.keyArr[i] = sk;
            doRemove(cur.childArr[i + 1], cur, sk, i + 1);
        }
    }

    if (cur.keyNum < MIN_KEY_NUM) {
        balance(cur, par, idx);
    }
}

/**
 * Method to balance a node in the B-Tree.
 * @param cur The current node
 * @param par The parent of the current node
 * @param idx The index of the current node in its parent's child array
 */
private void balance(Node cur, Node par, int idx) {
    if (cur == root) {
        if (root.keyNum == 0 && root.childArr[0] != null) {
            root = root.childArr[0];
        }
        return;
    }

    Node left = par.childLeftSibling(idx);
    Node right = par.childRightSibling(idx);

    if (left != null && left.keyNum > MIN_KEY_NUM) {
        cur.insertKey(par.keyArr[idx - 1], 0);
        if (!cur.isLeaf) {
            cur.insertChild(left.removeRightmostChild(), 0);
        }
        par.keyArr[idx - 1] = left.removeRightmostKey();
        return;
    } else if (right != null && right.keyNum > MIN_KEY_NUM) {
        cur.insertKey(par.keyArr[idx], cur.keyNum);
        if (!right.isLeaf) {
            cur.insertChild(right.removeLeftmostChild(), cur.keyNum);
        }
        par.keyArr[idx] = right.removeLeftmostKey();
        return;
    }

    if (left != null) {
        par.removeChild(idx);
        left.insertKey(par.removeKey(idx - 1), left.keyNum);
        cur.moveToTarget(left);
    } else {
        par.removeChild(idx + 1);
        cur.insertKey(par.removeKey(0), cur.keyNum);
        right.moveToTarget(cur);
    }
}

/**
 * Method to check if a key is found in a node.
 * @param cur The current node
 * @param key The key to check for
 * @param idx The index to start the search from
 * @return True if the key is found, false otherwise
 */
private boolean isFound(Node cur, int key, int idx) {
    return idx < cur.keyNum && cur.keyArr[idx] == key;
}
```



