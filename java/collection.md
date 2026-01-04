# Collection structure

| 集合          | 结构                              |
| ------------- | --------------------------------- |
| ArrayList     | 可变数组 (Object[] elementData)   |
| Vector        | 可变数组 (Object[] elementData)   |
| LinkedList    | 双向链表                          |
| HashSet       | 哈希表 (数组 + 单向链表 + 红黑树) |
| LinkedHashSet | 哈希表 (数组 + 双向链表)          |
| TreeSet       | 哈希表 (数组 + 单向链表 + 红黑树) |
| HashMap       | 哈希表 (数组 + 单向链表 + 红黑树) |
| Hashtable     | 哈希表 (数组 + 单向链表 + 红黑树) |
| TreeMap       | 哈希表 (数组 + 单向链表 + 红黑树) |
| Properties    | 哈希表 (数组 + 单向链表 + 红黑树) |

# Collection feature

| 集合          | 默认      | 扩容倍数  | 线程安全 | 有序✓/无序✗/排序○ | null |
| ------------- | --------- | --------- | -------- | ----------------- | ---- |
| ArrayList     | 10        | 1.5       | ✗        | ✓                 | ✓    |
| Vector        | 10        | 2         | ✓        | ✓                 | ✓    |
| LinkedList    | \         | \         | ✗        | ✓                 | ✓    |
| HashSet       | 16 (0.75) | 2         | ✗        | ✗                 | ✓    |
| LinkedHashSet | 16 (0.75) | 2         | ✗        | ✓                 | ✓    |
| TreeSet       | 16 (0.75) | 2         | ✗        | ○                 | ✓    |
| HashMap       | 16 (0.75) | 2         | ✗        | ✗                 | ✓    |
| Hashtable     | 16 (0.75) | 2         | ✓        | ✗                 | ✗    |
| TreeMap       | 8 (0.75)  | 2 * x + 1 | ✗        | ○                 | ✗    |
| Properties    | 16 (0.75) | 2         | \        | ✗                 | ✗    |

# Intertation (iterator)

Collection 实现了 Iterable, 可以使用 iterator() 完成遍历

- 迭代器的数据结构是栈

```java
Collection col = new ArrayList();

col.add("sun");
col.add("xue");
col.add("cheng");

// 获取 list 的迭代器
Iterator iterator = col.iterator();

// hasNext() 判断下一个元素是否存在
while (iterator.hasNext()) {
    // next() 访问下一个元素
    Object obj = iterator.next();
    System.out.println(obj);
}

// 迭代器指向了栈的底端, 再次遍历, 需要重新获取迭代器
iterator = col.iterator();

while (iterator.hasNext()) {
    Object next = iterator.next();
    System.out.println(next);
}
```

# Intertation (for)

```java
Collection col = new ArrayList();

col.add("sun");
col.add("xue");
col.add("cheng");

// 遍历集合
for (Object obj : col) {
    System.out.println(obj);
}

int[] nums = {1, 2, 3, 4, 5};

// 遍历数组
for (int num : nums) {
    System.out.println(num);
}
```

# Iteration Error

Java 集合框架的迭代器设计遵循了 Fast Fail 原则, 如果不通过 Iterator 进行迭代删除, 则会造成集合的结构修改, 存在并发访问问题, 不同的 Java 实现不同, 具体原因不清楚, 总之想要修改集合元素结构, 就得使用 Iterator

这里通过增强 for 删除 1 和 2 不会报错, 但是删除 3 会报错

```java
List<String> list = new ArrayList<>();
list.add("1");
list.add("2");
list.add("3");

for (String item : list) {
    if ("3".equals(item)) {
        list.remove(item);
    }
}
```

# Collection

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170912678.png)

```java
ArrayList arrayList = new ArrayList();

arrayList.add("sun");
arrayList.add("xue");
arrayList.add("cheng");

System.out.println(arrayList); // [sun, xue, cheng]
```

# List

List 的实现类的集合, 存储的元素有序, 支持索引, 可以存储重复元素, 可以存储 null

- 比如: ArrayList, LinkedList, Vector, Stack, AbstractList, RoleList

```java
List list = new ArrayList();

list.add(100);
list.add(true);
list.add("haha");

// 返回 索引 0 的元素
System.out.println(list.get(0)); // 100

System.out.println(list); // [100, true, haha]
```

ArrayList, Vector, LinkedList

- 改查结点多, 使用 ArrayList (大部分操作都是查询, 一般都使用 ArrayList)
- 增删结点多, 使用 LinkedList
- 多线程, 使用 Vector

# ArrayList

ArrayList 线程不安全, 数据存储在 Object[] elementData 中

elementData 扩容机制

- 访问无参构造器
    - 初始容量为 0
    - 第一次添加元素时, 扩容 10
    - 后续扩容, 每次扩容 1.5 倍
- 访问有参构造器
    - 初始容量为指定参数大小
    - 后续扩容, 每次扩容 1.5 倍

# Vector

Vector 线程安全, 数据存储在 Object[] elementData 中

elementData 扩容机制

- 访问无参构造器
    - 初始容量为 0
    - 第一次添加元素时, 扩容 10
    - 后续扩容, 每次扩容 2 倍
- 访问有参构造器
    - 初始容量为指定参数大小
    - 后续扩容, 每次扩容 2 倍

# LinkedList

LinkedList 线程不安全, 数据存储在双向链表中

# Set

Set 的实现类, 存储的元素无序, 不支持索引, 不可以存储重复元素, 可以存储一个 null

- 比如: HashSet, LinkedHashSet, TreeSet, AbstractSet

```java
Set set = new HashSet();

set.add(10);
set.add("sun");
set.add(true);
set.add(new String("xue"));
set.add(null);

System.out.println(set); // [xue, 10, sun, true, null]
```

Set 根据 hashCode 判断添加的对象是否重复

```java
public class Main {
    public static void main(String[] args) throws Exception {
        HashSet<Person> hashSet = new HashSet<>();
        hashSet.add(new Person("sun", 18));
        hashSet.add(new Person("sun", 18)); // 添加无效
    }
}

class Person {
    public String name;
    public int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}
```

# HashSet

HashSet 数据存储在数组中, 数组存储单向链表, 采用 HashMap 的存储机制, 扩容机制

# LinkedHashSet

HashSet 数据存储在数组中, 数组存储双向链表, 采用 HashMap 的存储机制

# TreeSet

TreeSet 存储的数据可以通过 Comparator 排序

```java
TreeSet treeSet = new TreeSet(new Comparator() {
    @Override
    public int compare(Object o1, Object o2) {
        String str1 = (String) o1;
        String str2 = (String) o2;

        return str2.compareTo(str1);
    }
});

treeSet.add("d");
treeSet.add("a");
treeSet.add("g");
treeSet.add("e");
treeSet.add("c");
treeSet.add("f");
treeSet.add("b");

System.out.println(treeSet); // [g, f, e, d, c, b, a]
```

去重机制

- 如果传入的 Comparator != null, 就通过 compare() 进行比较
    - 如果相同, 返回 0, 就不添加元素
    - 如果不同, 返回非 0, 就添加元素
- 如果传入的 Comparator == null, 就通过传入的对象实现的 Comparable 接口的 compareTo() 比较
    - 比如: 添加一个 "abc", 就通过 String 实现的 Compareable 接口的 compareTo() 去重

```java
final int compare(Object k1, Object k2) {
    return comparator == null ? ((Comparable<? super K>)k1).compareTo((K)k2) : comparator.compare((K)k1, (K)k2);
}
```

# Map

Map 双列集合: 存储 key-value

- key 和 value 可以是任意类型的数据, 会被封装到到 HashMap$Node 中
- key 不可以重复存储, value 可以重复存储
- key 和 value 都可以存储 null, key 只可以存储一个 null

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170912690.png)

```java
HashMap hashMap = new HashMap();

hashMap.put("no1", "sun");
hashMap.put("no2", "xue");
hashMap.put("no3", "cheng");

System.out.println(hashMap); // {no1=sun, no2=xue, no3=cheng}
```

# entrySet()

一对 k-v 对应 HashMap.Node object, 存储在 Node<K, V>\[\] table 中

HashMap.Node 实现了 Map.Entry, 一个 HashMap.Node object 对应一个 Map.Entry object, 存储在 Set<Map.Entry<K, V>> entrySet 中

```java
public class HashMap<K,V> extends AbstractMap<K,V> {
    Node<K,V>[] table;
    
    Set<Map.Entry<K, V>> entrySet;
    
    static class Node<K,V> implements Map.Entry<K,V> {}
}
```

HashMap.Node object 的简化存储过程

```java
Node<K,V>[] table;

HashMap.Node node1 = newNode(hash, key, value, null)
HashMap.Node node2 = newNode(hash, key, value, null)
HashMap.Node node3 = newNode(hash, key, value, null)

table[0] = node1;
node1.next = node2;
table[1] = node3;
```

Map.Entry object 的简化存储过程

```java
Set<Map.Entry<K, V>> entrySet;

Map.Entry entry1 = node1;
Map.Entry entry2 = node2;

entrySet.add(entry1);
entrySet.add(entry2);
```

通过 Map.Entry object 的 getKey() 和 getValue 访问 HashMap.Node object

```java
String key = entry.getKey;
String value = entry.getValule;
```

遍历 Map 集合

```java
Map map = new HashMap();

map.put("no1", "sun");
map.put("no2", "xue");
map.put("no3", "cheng");

// 获取 map 的 entrySet
Set entrySet = map.entrySet(); // [no2=xue, no1=sun, no3=cheng]

// 通过 Iterator 遍历 entrySet
Iterator iterator = entrySet.iterator();
while (iterator.hasNext()) {
    Map.Entry entry = (Map.Entry) iterator.next();

    System.out.println(entry.getKey() + ": " + entry.getValue());
}
/*
    no2: xue
    no1: sun
    no3: cheng
 */

// 通过 for 遍历 entrySet
for (Object obj : entrySet) {
    Map.Entry entry = (Map.Entry) obj;

    System.out.println(entry.getKey() + ": " + entry.getValue());
}
/*
    no2: xue
    no1: sun
    no3: cheng
 */
```

# keySet()

key 引用 不仅存储在 entrySet 中, 也存储在 keySet 中

```java
Set<K> keySet();
```

```java
Set keySet = map.keySet();

Iterator iterator = keySet.iterator();

while (iterator.hasNext()) {
    Object obj = iterator.next();
    System.out.println(obj + " - " + map.get(obj));
}

for (Object key : keySet) {
    System.out.println(key + " - " + map.get(key));
}
```

# values()

value 引用 不仅存储在 entrySet 中, 也存储在 values 中

```java
Collection<V> values();
```

```java
Collection values = map.vlaues(); // 获取到values集合

Iterator iterator = values.iterator();

while (iterator.hasNext()) {
    Object obj = iterator.next();
    System.out.println(obj);
}

for (Object value : values) {
    System.out.println(value);
}
```

# HashMap

HashMap 采用 Array + LinkedList + RedBlackTree 的结构, 无法保证线程安全.

HashMap 是懒惰加载, 在创建对象时并没有初始化数组, 在无参的构造函数中, 设置了默认的 Load Factor 为 0.75.

HashMap Infinite Loop, [Explain](https://www.bilibili.com/video/BV1yT411H7YK?p=85&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

- JDK7 的 HashMap 采用头插法, 扩容后链表顺序会颠倒, 在并发场景下, 数组进行扩容数据迁移时, 有可能导致死循环.
- JDK8 的 HashMap 采用尾插法, 扩容后链表顺序不\会颠倒, 避免了死循环.

JDK8 的 Hash Algo 通过 hash ^ (hash >>> 16) 是在 hash 的基础上增加了高位对低位的影响, 这种混淆和干扰能够更均匀地分布 Hash, 降低碰撞的概率.

HashMap 采用 RedBlackTree 不仅可以提高查询效率, 还可以防止 DDos. 

- RedBlackTree 是一种自平衡的二叉搜索树, 与普通的平衡二叉树相比, 主要区别在于其引入了颜色标记和一些额外的规则, 以保持树的平衡性.
- 颜色标记提供了额外信息, 规则简化了平衡维护, 通过颜色变化和旋转等操作可以相对简单地调整树的结构, 而无需进行复杂的平衡计算, 使得平衡调整可以在常数时间内完成, 而不会导致整个树的结构变化.

当 LinkedList 的元素个数 > 8 && Array 的容量 > 64 时, 就会将 LinkedList 进化成 RedBlackTree. 当 LinkedList 的元素个数 < 6 是, 就会将 RedBlackTree 退化成 LinkedList.

# HashTable

HashTable 线程安全, 数据存储在数组中, 数组存储单向链表, key 和 value 都不可以存储 null.

# ConcurrentHashMap

JDK7 采用 Array + LinkedList, 通过 Segment + ReentrantLock 保证线程安全.

- Segment 本质上就是一个独立的 ﻿HashTable, 也就是说 ﻿ConcurrentHashMap 是由多个 ﻿Segment 组成的.
- ﻿Segment 可以独立锁定, 这允许多个线程可以同时访问 ﻿ConcurrentHashMap 的不同部分, 从而实现了比完全锁定整个 ﻿Map 更高级别的并发性.
- Segment 包含一个 ReentrantLock, 当一个线程需要访问某个 Segment 中的元素时, 需要先获得这个 Segment 对应的 ReentrantLock, 实现了对数据的分段加锁, 这种策略是 ﻿ConcurrentHashMap 能提供比 ﻿HashTable 更好的并发性能的关键.

JDK8 采用 Array + LinkedList + RedBlackTree, 通过 CAS + synchronized 保证线程安全, 放弃了 Segment 的臃肿设计, 通过 synchronized 锁定每个索引上的第一个结点, 如果当前索引有结点了, 就需要通过 CAS 去争抢锁添加结点, 如果当前索引没有结点, 就不受 synchronized 影响, 效率还是很高的.

JDK8 引入了多线程并发扩容, 对原始数组进行分片, 每个线程负责一个分片的数据迁移, 从而提升了扩容的效率

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403022009974.png)

ConcurrentHashMap 可以通过 size() 获取元素格式, 这要求在保证 Atomicity 的前提下, 去维护一个整形的递增, 这个效率是非常低的, ConcurrentHashMap 针对此做了特殊优化.

ConcurrentHashMap 通过维护 CounterCell[] 来实现 size(), CounterCell 的 volatile long value 记录了 ConcurrentHashMap 的元素个数, 不同的线程操作不同的 ConcurrentCell, 不存在并发问题. 最终调用 size() 时, 就遍历 CounterCell[] 进行求和, 类似于 LongAddr.

```java
public class ConcurrentHashMap {
    public int size() {
        long n = sumCount();
        return ((n < 0L) ? 0 :
                (n > (long)Integer.MAX_VALUE) ? Integer.MAX_VALUE :
                (int)n);
    }

    final long sumCount() {
        CounterCell[] cs = counterCells;
        long sum = baseCount;
        if (cs != null) {
            for (CounterCell c : cs)
                if (c != null)
                    sum += c.value;
        }
        return sum;
    }

    @jdk.internal.vm.annotation.Contended static final class CounterCell {
        volatile long value;
        CounterCell(long x) { value = x; }
    }
}
```

# Properties

Properties 继承 Hashtable, 实现 Map, key 和 value 都不可以存储 null

Properties 可以读取 xxx.properties 配置文件, 加载数据到 Properties 对象中

# TreeMap

TreeMap 和 TreeSet 类似, 存储的数据可以通过 Comparator 排序

