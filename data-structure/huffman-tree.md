# Huffman Tree

```java
/**
 * This class represents a Huffman Tree, which is a type of binary tree used for data compression.
 * The core idea of the Huffman Tree Algorithm is to use a variable-length code table for encoding 
 * a source symbol where the variable-length code table has been derived in a particular way based 
 * on the estimated probability of occurrence for each possible value of the source symbol.
 */
public class HuffmanTree {
    public static class Node {
        public Character ch;  // The character this node represents
        public int freq;  // The frequency of the character
        public String code;  // The Huffman code of the character
        public Node left; 
        public Node right;

        /**
         * Constructor for leaf nodes.
         * @param ch The character this node represents
         */
        public Node(Character ch) {
            this.ch = ch;
        }

        /**
         * Constructor for internal nodes.
         * @param freq The sum of the frequencies of the two child nodes
         * @param left The left child node
         * @param right The right child node
         */
        public Node(int freq, Node left, Node right) {
            this.freq = freq;
            this.left = left;
            this.right = right;
        }

        public int getFreq() {
            return freq;
        }

        public boolean isLeaf() {
            return left == null;
        }

        @Override
        public String toString() {
            return "Node{" +
                       "ch=" + ch +
                       ", freq=" + freq +
                       '}';
        }
    }

    public Node root;  // The root node of the Huffman Tree
    public String str;  // The string to be encoded
    public int size;  // The total length of the encoded string
    public Map<Character, Node> map = new HashMap<>();  // A map from characters to their corresponding nodes

    /**
     * Constructor for the Huffman Tree.
     * @param str The string to be encoded
     */
    public HuffmanTree(String str) {
        this.str = str;
        char[] chs = str.toCharArray();
        // Calculate the frequency of each character
        for (char ch : chs) {
            map.computeIfAbsent(ch, Node::new);
            map.get(ch).freq++;
        }

        // Build a priority queue of nodes, with the node having the lowest frequency at the top
        PriorityQueue<Node> heap = new PriorityQueue<>(Comparator.comparingInt(Node::getFreq));
        heap.addAll(map.values());

        // Build the Huffman Tree
        while (heap.size() > 1) {
            Node n1 = heap.poll();
            Node n2 = heap.poll();
            heap.offer(new Node(n1.freq + n2.freq, n1, n2));
        }

        root = heap.poll();
        // Generate the Huffman codes
        size = dfs(root, new StringBuilder());

        // Print the nodes for debugging purposes
        for (Node node : map.values()) {
            System.out.println(node);
        }
    }

    /**
     * A recursive function to generate the Huffman codes.
     * @param cur The current node
     * @param code The current Huffman code
     * @return The total length of the encoded string
     */
    private int dfs(Node cur, StringBuilder code) {
        int size = 0;
        
        if (cur.isLeaf()) {
            // If the current node is a leaf node, assign the current Huffman code to it
            cur.code = code.toString();
            // The length of the encoded string is the product of the frequency and the length of the Huffman code
            size = cur.freq * code.length();
        } else {
            // If the current node is an internal node, recursively generate the Huffman codes for the left and right child nodes
            size += dfs(cur.left, code.append("0"));
            size += dfs(cur.right, code.append("1"));
        }

        // Backtrack to generate the Huffman codes for other nodes
        if (!code.isEmpty()) {
            code.deleteCharAt(code.length() - 1);
        }

        return size;
    }

    public static void main(String[] args) {
        HuffmanTree huffmanTree = new HuffmanTree("hello world aaa bbb ccccc");
    }
}
```

# Encode

```java
/**
 * Encodes a string using Huffman coding.
 * The core idea of this method is to replace each character in the input string with its corresponding Huffman code.
 * The Huffman code is retrieved from a map where the key is the character and the value is the Huffman code.
 *
 * @return The encoded string.
 */
public String encode() {
    char[] chs = str.toCharArray();
    StringBuilder sb = new StringBuilder();
    
    // Traverse the original string, and append the code of each character to the encoded string
    for (char ch : chs) {
        sb.append(map.get(ch).code);
    }
    
    return sb.toString();
}

public static void main(String[] args) {
    HuffmanTree huffmanTree = new HuffmanTree("hello world aaa bbb ccccc");
    System.out.println(huffmanTree.encode());
}
```

# Decode

```java
/**
 * Decodes a Huffman encoded string.
 * The core idea of this method is to traverse the Huffman tree based on the encoded string. 
 * A '0' in the encoded string means to go to the left child of the current node, and a '1' means to go to the right child.
 * When a leaf node is reached, append the character of the leaf node to the decoded string.
 *
 * @param str The Huffman encoded string.
 * @return The decoded string.
 */
public String decode(String str) {
    char[] chs = str.toCharArray();
    StringBuilder sb = new StringBuilder();
    Node cur = root;
    
    // Traverse the encoded string
    for (char ch : chs) {
        // If the current node is not a leaf node
        if (ch == '0') {
            // Go to the left child
            cur = cur.left;
        } else {
            // Go to the right child
            cur = cur.right;
        }
        
        // If the current node is a leaf node
        if (cur.isLeaf()) {
            // Append the character of the leaf node to the decoded string
            sb.append(cur.ch);
            // Reset to the root for the next character
            cur = root;
        }
    }
    
    return sb.toString();
}

public static void main(String[] args) {
    HuffmanTree huffmanTree = new HuffmanTree("hello world aaa bbb ccccc");
    System.out.println(huffmanTree.decode(huffmanTree.encode()));
}
```

