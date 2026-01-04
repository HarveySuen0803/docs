# DisjointSet

[Explain p94, p95, p96, p97](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=94)

```java
/**
 * This class represents a disjoint-set data structure, also known as a union-find data structure.
 * It provides operations for union and find, and is used to determine and manipulate 
 * the connected components of a graph.
 */
public class DisjointSet {
    // The parent array represents the parent node of each element in the set
    int[] pars;
    // The size array keeps track of the size of each set
    int[] size;
    
    public DisjointSet(int cap) {
        this.pars = new int[cap];
        this.size = new int[cap];
        for (int i = 0; i < cap; i++) {
            // Each element is initially in its own set
            pars[i] = i;
            // The size of each set is initially 1
            size[i] = 1;
        }
    }
    
    /**
     * Find the root of the set that i belongs to
     */
    public int findRoot(int i) {
        // If the parent of i is not i, then i is not the root of its set
        if (pars[i] != i) {
            // Find the root of the set that i belongs to
            pars[i] = findRoot(pars[i]);
        }
        return pars[i];
    }
    
    /**
     * Merge the sets that i and j belong to
     */
    public void union(int i, int j) {
        // Find the root of the set that i belongs to
        int iRoot = findRoot(i);
        int jRoot = findRoot(j);
        
        // If i and j are already in the same set, then do nothing
        if (iRoot == jRoot) {
            return;
        }
        
        // If i and j are not in the same set, then merge the two sets
        if (size[iRoot] < size[jRoot]) {
            // Make the smaller set's representative point to the larger set's
            pars[iRoot] = jRoot;
            // Update the size of the new set
            size[jRoot] += size[iRoot];
        } else {
            pars[jRoot] = iRoot;
            size[iRoot] += size[jRoot];
        }
    }

    @Override
    public String toString() {
        return Arrays.toString(pars);
    }

    public static void main(String[] args) {
        DisjointSet set = new DisjointSet(5);
        set.union(1, 2);
        set.union(3, 4);
        set.union(1, 3);
        System.out.println(set);
        
        set.union(1, 0);
        System.out.println(set);
    }
}
```

# DisjointSet

```java
public class DisjointSet<T> {
    private Map<T, T> pars;
    private Map<T, Integer> size;

    public DisjointSet() {
        pars = new HashMap<>();
        size = new HashMap<>();
    }

    public DisjointSet() {
        pars = new HashMap<>();
        size = new HashMap<>();
    }

    public DisjointSet(Collection<T> items) {
        this();
        init(items);
    }

    public void init(List<T> items) {
        for (T item : items) {
            pars.put(item, item);
            size.put(item, 1);
        }
    }

    public void add(T item) {
        assertNotExists(item);
        pars.put(item, item);
        size.put(item, 1);
    }

    public T find(T cur) {
        assertExists(cur);
        T par = pars.get(cur);
        if (par != cur) {
            par = find(par);
            pars.put(cur, par);
        }
        return par;
    }

    public boolean isConnected(T cur1, T cur2) {
        T par1 = find(cur1);
        T par2 = find(cur2);
        return par1.equals(par2);
    }

    public void union(T cur1, T cur2) {
        assertExists(cur1);
        assertExists(cur2);
        T par1 = find(cur1);
        T par2 = find(cur2);
        int size1 = size.get(par1);
        int size2 = size.get(par2);
        if (size1 < size2) {
            pars.put(par1, par2);
            size.put(par2, size1 + size2);
        } else {
            pars.put(par2, par1);
            size.put(par1, size1 + size2);
        }
    }

    public void assertExists(T item) {
        if (!pars.containsKey(item)) {
            throw new IllegalArgumentException("Element not found in the disjoint set: " + item);
        }
    }

    public void assertNotExists(T item) {
        if (pars.containsKey(item)) {
            throw new IllegalArgumentException("Item already exists in the disjoint set: " + item);
        }
    }

    public static void main(String[] args) {
        DisjointSet<Object> disjointSet = new DisjointSet<>();

        disjointSet.add("a");
        disjointSet.add("b");
        disjointSet.add("c");
        disjointSet.add("d");

        disjointSet.union("a", "b");
        disjointSet.union("c", "d");

        System.out.println(disjointSet.find("a"));
        System.out.println(disjointSet.find("b"));
        System.out.println(disjointSet.find("c"));
        System.out.println(disjointSet.find("d"));

        disjointSet.union("b", "c");

        System.out.println(disjointSet.find("a"));
        System.out.println(disjointSet.find("b"));
        System.out.println(disjointSet.find("c"));
        System.out.println(disjointSet.find("d"));
    }
}
```

