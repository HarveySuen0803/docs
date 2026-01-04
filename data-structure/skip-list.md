### Skiplist 实现

[Problem Description](https://leetcode.cn/problems/design-skiplist/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=191&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * Skiplist is a data structure with multiple layers, each representing a different level of granularity.
 * The layers allow for efficient search, add, and erase operations with expected time complexity O(log(n)).
 * The design involves the use of nodes with pointers to the next node in the same layer and the next node in the layer below.
 * Randomized skipping levels during insertion ensures a balanced structure.
 */
public static class Skiplist {
    public static class Node {
        int val;
        Node[] next;
        
        public Node(int val) {
            this.val = val;
            this.next = new Node[MAX_LEVEL + 1];
        }
        
        @Override
        public String toString() {
            return "Node{" +
                "val=" + val +
                '}';
        }
    }
    
    private static final int MAX_LEVEL = 9;
    private Node head = new Node(-1);
    
    /**
     * Helper method to find the path array for a given value in the Skiplist.
     * The path array contains the nodes encountered in each level while searching for the value.
     *
     * @param val The value to find in the Skiplist.
     * @return An array of nodes representing the path in each level.
     */
    public Node[] findPath(int val) {
        Node cur = head;
        Node[] path = new Node[MAX_LEVEL + 1];
        
        for (int level = MAX_LEVEL; level >= 0; level--) {
            while (cur.next[level] != null && cur.next[level].val < val) {
                cur = cur.next[level];
            }
            path[level] = cur;
        }
        
        return path;
    }
    
    public boolean isExists(int val) {
        Node[] path = findPath(val);
        Node tar = path[0].next[0];
        return tar != null && tar.val == val;
    }
    
    public void add(int val) {
        // Find the path array using the helper method find()
        Node[] path = findPath(val);
        // The next node after the path node at level 0 is the node to be added.
        Node tar = path[0].next[0];
        // If the value already exists in the Skiplist, we do not need to add it.
        if (tar != null && tar.val == val) {
            return;
        }
        
        Node added = new Node(val);
        
        // For each level in the Skiplist, insert the new node into the path.
        for (int i = 0; i <= randomLevel(); i++) {
            // The next node after the path node at level i is the new node to be added.
            added.next[i] = path[i].next[i];
            // The next node after the path node at level i is the new node to be added.
            path[i].next[i] = added;
        }
    }
    
    public void del(int val) {
        Node[] path = findPath(val);
        Node deled = path[0].next[0];
        
        // If the value does not exist in the Skiplist, we do not need to delete it.
        if (deled == null || deled.val != val) {
            return;
        }
        
        // For each level in the Skiplist, delete the node from the path.
        for (int i = 0; i <= MAX_LEVEL; i++) {
            // If the next node is not the one to be removed, stop disconnecting
            if (path[i].next[i] != deled) {
                break;
            }
            // Connect the previous node to the next node, effectively removing the current node
            path[i].next[i] = deled.next[i];
        }
    }
    
    /**
     * Helper method to generate a random level for a new node in the Skiplist.
     * The random level determines the number of layers the new node will be connected to.
     *
     * @return The randomly generated level for the new node.
     */
    private int randomLevel() {
        int level = 0;
        while (Math.random() < 0.5 && level < MAX_LEVEL) {
            level++;
        }
        return level;
    }
}

public static void main(String[] args) {
    Skiplist list = new Skiplist();
    Skiplist.Node head = list.head;
    Skiplist.Node n3 = new Skiplist.Node(3);
    Skiplist.Node n7 = new Skiplist.Node(7);
    Skiplist.Node n11 = new Skiplist.Node(11);
    Skiplist.Node n12 = new Skiplist.Node(12);
    Skiplist.Node n16 = new Skiplist.Node(16);
    Skiplist.Node n19 = new Skiplist.Node(19);
    Skiplist.Node n22 = new Skiplist.Node(22);
    Skiplist.Node n23 = new Skiplist.Node(23);
    Skiplist.Node n26 = new Skiplist.Node(26);
    Skiplist.Node n30 = new Skiplist.Node(30);
    Skiplist.Node n37 = new Skiplist.Node(37);
    head.next[0] = head.next[1] = head.next[2] = n3;
    head.next[3] = head.next[4] = head.next[5] = head.next[6] = head.next[7] = n19;
    n3.next[0] = n3.next[1] = n3.next[2] = n7;
    n7.next[0] = n11;
    n7.next[1] = n12;
    n7.next[2] = n16;
    n11.next[0] = n12;
    n12.next[0] = n12.next[1] = n16;
    n16.next[0] = n16.next[1] = n16.next[2] = n19;
    n19.next[0] = n19.next[1] = n19.next[2] = n22;
    n19.next[3] = n26;
    n22.next[0] = n23;
    n22.next[1] = n22.next[2] = n26;
    n23.next[0] = n26;
    n26.next[0] = n30;
    n26.next[1] = n37;
    n30.next[0] = n37;
    
    System.out.println(Arrays.toString(list.find(26)));
}
```

### SkipList 存储优化

SkipList 的空间复杂度为 O(N)，因为每个节点可能会有多个索引层，这会导致内存使用增加。

层级概率优化：

- 默认的层级概率 p = 0.5（每个节点以 50% 的概率成为上一层的索引）。
- 调整为更低的概率，例如 p = 0.25，可以减少高层节点的数量，降低空间使用。
- 缺点：可能略微降低查询速度。

索引层动态调整：

- 只为热点数据（如高频访问的节点）维护更多索引层。
- 对冷数据减少索引层数量

压缩存储：

- 使用紧凑的存储结构，将索引层存储在数组中，而非链表。
- 减少指针的存储开销。

### SkipList 查询优化

跳表的查询时间复杂度为 O(logN)，但随机性可能导致部分查询路径较长。

分层优化（Level Optimization）：

- 静态优化：通过预处理调整索引层的分布，使其更加均匀。
- 动态优化：根据实际查询频率，重新分配热点节点的索引层。

结合二分查找：

- 在每层使用二分查找代替线性扫描，尤其是索引层节点较多时。
- 此优化适合场景：单层链表中节点数量较大，链表线性查找过慢。

改进索引层结构：

- 使用更高效的索引结构，如稀疏数组代替链表，用来加速层级跳跃。

### SkipList 写入优化

随机数生成是 SkipList 的关键步骤，但生成随机数的成本在高性能场景中可能成为瓶颈。

高效随机数生成器：

- 使用更快的伪随机数生成算法，例如基于位操作的线性同余法。

批量插入优化：

- 对批量插入的键值先排序，然后直接构建跳表的索引层，避免逐一插入的重复调整。

延迟索引更新：

- 在插入过程中，先只处理底层链表的插入操作，将新节点加入基础的链表中，而不立即更新所有索引层的指针。索引层的更新推迟到批量插入完成后，统一处理。

### SkipList 并发优化

SkipList 插入和删除只需修改局部节点的指针，不需要全路径锁定，可以使用分段锁（对链表的某段进行加锁）和 无锁机制（基于 CAS 操作，避免全局锁）解决并发问题。

RebBlackTree 基于二叉搜索树，依赖旋转和颜色调整维持平衡，影响多节点，需要使用 细粒度锁（对路径节点依次加锁）和 全局写锁（简单但性能瓶颈大）解决并发问题。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411211810569.png)

虽然 SkipList 已经非常适合并发，但在高并发场景下仍可能出现瓶颈，尤其是热点区域（如索引层重叠区）。可以动态调整索引结构，使热点区域的索引更加密集，减少查询冲突。

