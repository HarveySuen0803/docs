# Red Black Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=192)

```java
public class RedBlackTree {
    private Node root;
    
    private enum Color {
        RED,
        BLACK
    }
    
    private static class Node {
        public int key;
        public int val;
        public Node left;
        public Node right;
        public Node par;
        public Color color = Color.RED;
                
        public boolean isLeftChild() {
            return par != null && par.left == this;
        }
        
        public boolean isRightChild() {
            return par != null && par.right == this;
        }
        
        public void toRed() {
            color = Color.RED;
        }
        
        public void toBlack() {
            color = Color.BLACK;
        }

        public Node unc() {
            if (par == null || par.par == null) {
                return null;
            }
            
            if (par.isLeftChild()) {
                return par.par.right;
            } else {
                return par.par.left;
            }
        }
        
        public Node sib() {
            if (par == null) {
                return null;
            }
            
            if (this.isLeftChild()) {
                return par.right;
            } else {
                return par.left;
            }
        }
    }
    
    private boolean isRed() {
        return root != null && root.color == Color.RED;
    }
    
    private boolean isBlack() {
        return root == null || root.color == Color.BLACK;
    }
    
    private Node findNode(int key) {
        Node cur = root;
        
        while (cur != null) {
            if (key < cur.key) {
                cur = cur.left;
            } else if (key > cur.key) {
                cur = cur.right;
            } else {
                return cur;
            }
        }
        
        return null;
    }
    
    /**
     * Find the node that will replace the removed node
     */
    private Node findRpl(Node cur) {
        // If the current node has two children
        if (cur.left != null && cur.right != null) {
            Node suc = cur.right;
            while (suc.left != null) {
                suc = suc.left;
            }
            return suc;
        }
        
        // If the current node has one child
        if (cur.left != null) {
            return cur.left;
        } else if (cur.right != null) {
            return cur.right;
        }
        
        // If the current node has no child
        return null;
    }
}
```

# Rotate Tree

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=192&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * Performs a right rotation on the given node in a Red Black Tree.
 *
 * @param oldRoot The node to be rotated.
 */
private void rightRotate(Node oldRoot) {
    Node newRoot = oldRoot.left;
    oldRoot.left = newRoot.right;
    
    // Update the new root's right child's par to the old root
    if (newRoot.right != null) {
        newRoot.right.par = oldRoot;
    }
    
    // Update the new root's par to the old root's par
    newRoot.par = oldRoot.par;
    if (oldRoot.par == null) {
        root = newRoot;
    } else if (oldRoot.isLeftChild()) {
        oldRoot.par.left = newRoot;
    } else {
        oldRoot.par.right = newRoot;
    }
    
    // Update the old root's par to the new root
    newRoot.right = oldRoot;
    oldRoot.par = newRoot;
}

/**
 * Performs a left rotation on the given node in a Red Black Tree.
 *
 * @param oldRoot The node to be rotated.
 */
private void leftRotate(Node oldRoot) {
    Node newRoot = oldRoot.right;
    oldRoot.right = newRoot.left;
    
    // Update the new root's left child's par to the old root
    if (newRoot.left != null) {
        newRoot.left.par = oldRoot;
    }
    
    // Update the new root's par to the old root's par
    newRoot.par = oldRoot.par;
    if (oldRoot.par == null) {
        root = newRoot;
    } else if (oldRoot.isLeftChild()) {
        oldRoot.par.left = newRoot;
    } else {
        oldRoot.par.right = newRoot;
    }
    
    // Update the old root's par to the new root
    newRoot.left = oldRoot;
    oldRoot.par = newRoot;
}
```

# Put Node

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=193)

```java
/**
 * Inserts a new node with the given key and val into the Red Black Tree.
 * If the key already exists, update the val.
 */
public void put(int key, int val) {
    // If the tree is empty, create a new node as the root
    if (root == null) {
        root = new Node(key, val);
        root.toBlack();
        return;
    }
    
    Node cur = root;
    Node par = null;
    
    // Find the parent of the new node, and check if the key already exists
    while (cur != null) {
        if (key < cur.key) {
            par = cur;
            cur = cur.left;
        } else if (key > cur.key) {
            par = cur;
            cur = cur.right;
        } else {
            cur.val = val;
            return;
        }
    }
    
    // Create a new node as the child of the parent
    Node newNode = new Node(key, val);
    newNode.par = par;
    if (key < par.key) {
        par.left = newNode;
    } else {
        par.right = newNode;
    }
    
    // Fix the violation caused by the insertion
    fixRedRed(newNode);
}

/**
 * Fixes the violation caused by the insertion of the given node in a Red Black Tree.
 */
private void fixRedRed(Node cur) {
    // If the current node is the root, color it black
    if (cur == root) {
        cur.toBlack();
        return;
    }
    
    // If the current node's parent is black, do nothing
    if (isBlack(cur.par)) {
        return;
    }
    
    // Get the current node's parent, uncle, and grandparent
    Node par = cur.par;
    Node unc = cur.unc();
    Node gpt = cur.par.par;
    
    // If the current node's parent is red, and the current node's uncle is red
    if (unc != null && isRed(unc)) {
        par.toBlack();
        unc.toBlack();
        gpt.toRed();
        fixRedRed(gpt);
        return;
    }
    
    // If the current node's parent is red, and the current node's uncle is black
    if (cur.isLeftChild() && par.isLeftChild()) {
        par.toBlack();
        gpt.toRed();
        rightRotate(gpt);
    } else if (cur.isRightChild() && par.isRightChild()) {
        par.toBlack();
        gpt.toRed();
        leftRotate(gpt);
    } else if (cur.isRightChild() && par.isLeftChild()) {
        leftRotate(par);
        fixRedRed(cur.left);
    } else if (cur.isLeftChild() && par.isRightChild()) {
        rightRotate(par);
        fixRedRed(cur.right);
    }
}
```

# Del Node

[Explain](https://www.bilibili.com/video/BV1Lv4y1e7HL/?p=195)

```java
/**
 * Delete a node with the specified key from the Red Black Tree.
 */
public void del(int key) {
    Node cur = findNode(key);
    
    if (cur == null) {
        return;
    }
    
    doDel(cur);
}

/**
 * Deletes the given node from the Red Black Tree.
 */
private void doDel(Node cur) {
    // Find the node that will replace the removed node
    Node rpl = findRpl(cur);
    
    // If the current node has no child
    if (rpl == null) {
        // If the current node is the root, delete it
        if (cur == root) {
            root = null;
            return;
        }
        
        // If the current node is black, fix the violation
        if (isBlack(cur)) {
            fixBlackBlack(cur);
        }
        
        // Delete the current node
        if (cur.isLeftChild()) {
            cur.par.left = null;
        } else {
            cur.par.right = null;
        }
    }
    // If the current node has one child
    else if (cur.left == null || cur.right == null) {
        // If the current node is the root, swap it with the replacement
        if (cur == root) {
            cur.key = rpl.key;
            cur.val = rpl.val;
            cur.left = cur.right = null;
            return;
        }
        
        // If the current node is black, fix the violation
        if (isBlack(cur)) {
            fixBlackBlack(cur);
        }
        
        // Swap the current node and the replacement
        if (cur.isLeftChild()) {
            cur.par.left = rpl;
        } else {
            cur.par.right = rpl;
        }
        rpl.par = cur.par;
        cur.par = cur.left = cur.right = null;
    }
    // If the current node has two children, swap it with the replacement, and delete the replacement
    else {
        int tmpKey = cur.key;
        int tmpVal = cur.val;
        cur.key = rpl.key;
        cur.val = rpl.val;
        rpl.key = tmpKey;
        rpl.val = tmpVal;
        doDel(rpl);
    }
}

/**
 * Fixes the violation caused by the deletion of the given node in a Red Black Tree.
 */
private void fixBlackBlack(Node cur) {
    // If the current node is the root, do nothing
    if (cur == root) {
        return;
    }
    
    // Get the current node's parent, sibling
    Node par = cur.par;
    Node sib = cur.sib();
    
    // If the current node's sibling is red
    if (isRed(sib)) {
        par.toRed();
        sib.toBlack();
        if (sib.isLeftChild()) {
            rightRotate(par);
        } else {
            leftRotate(par);
        }
        fixBlackBlack(cur);
        return;
    }
    
    // If the sibling is null, fix the black-black violation at the parent
    if (sib == null) {
        fixBlackBlack(par);
        return;
    }
    
    // If the sibling is black, and both of its children are black
    if (isBlack(sib.left) && isBlack(sib.right)) {
        // If the parent is red, color it black, and color the sibling red
        if (isRed(par)) {
            par.toBlack();
            sib.toRed();
        }
        // If the parent is black, fix the black-black violation at the parent
        else {
            sib.toRed();
            fixBlackBlack(par);
        }
    }
    
    // If the sibling has at least one red child, perform rotations and recoloring
    if (sib.isLeftChild()) {
        if (isRed(sib.left)) {
            sib.color = par.color;
            sib.left.toBlack();
            par.toBlack();
            rightRotate(par);
        } else {
            sib.right.color = par.color;
            par.toBlack();
            leftRotate(sib);
            rightRotate(par);
        }
    } else {
        if (isRed(sib.right)) {
            sib.color = par.color;
            sib.left.toBlack();
            par.toBlack();
            leftRotate(par);
        } else {
            sib.right.color = par.color;
            par.toBlack();
            rightRotate(sib);
            leftRotate(par);
        }
    }
}

private Node findNode(int key) {
    Node cur = root;
    
    while (cur != null) {
        if (key < cur.key) {
            cur = cur.left;
        } else if (key > cur.key) {
            cur = cur.right;
        } else {
            return cur;
        }
    }
    
    return null;
}

/**
 * Find the node that will replace the removed node
 */
private Node findRpl(Node cur) {
    // If the current node has two children
    if (cur.left != null && cur.right != null) {
        Node suc = cur.right;
        while (suc.left != null) {
            suc = suc.left;
        }
        return suc;
    }
    
    // If the current node has one child
    if (cur.left != null) {
        return cur.left;
    } else if (cur.right != null) {
        return cur.right;
    }
    
    // If the current node has no child
    return null;
}
```