# DataStructure

Redis 的 DB 通过 RedisDB 这个结构体实现

RedisDb 的 Dict* dict 存储了所有的 Key-Val, dict 的 Key 就对应 Key-Val 的 Key, dict 的 Val 就是一个 RedisObject, RedisObject 内部有一个 ptr 指向具体存储 Val 的不同数据结构

RedisDb 的 Dict* expires 存储所有 Key 的 Expiration, 根据 hash(key) % dict.size() 存储 Entry 到 Dict* dict

# RedisObject

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742569.png)

# RedisObject Type

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742570.png)

# RedisObject Encoding

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742571.png)


# SDS

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742538.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742539.png)

# IntSet

IntSet 将所有整数元素保存在一个整数数组中，并且数组中的元素永远是有序的。当我们需要增删改查元素时，IntSet可以利用二分法快速地找到目标元素，大大提升了效率。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742540.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742541.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742543.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742544.png)

# Dict

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742545.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742546.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742547.png)

# Dict Expand Size

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742548.png)

# Dict Shrink Size

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742549.png)

# Dict Rehash

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742550.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403120818117.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742551.png)

# ZipList

Dict 使用的内存不连续, 通过指针指向内存, 存在大量的内存碎片, 非常浪费内存, ZipList 非常节省内存

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742552.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742553.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742554.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742555.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411132104555.png)

# ZipList Encoding

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742556.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742557.png)


![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411132114007.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411132115314.png)

# ZipList Chaining Update

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742558.png)

# ListPack

ListPack 是 Redis 引入的一种紧凑型数据结构，旨在用于存储小型、连续的数据块。它通过连续的内存块存储一组数据元素，兼顾了内存紧凑性和操作效率。ListPack 的设计目标之一是替代早期的 ZipList 结构，避免 ZipList 容易出现的内存溢出问题，同时提升性能和内存利用率。以下是 ListPack 的底层实现和各个细节。

ListPack 是一个连续的内存区域，它的整体结构包括以下几个部分：

- 总字节数：用于记录整个 ListPack 的字节大小。这使得 Redis 可以快速获取 ListPack 的总长度，在需要扩展、缩减或复制整个 ListPack 时特别高效。这个字段通常为 4 个字节，足够容纳 ListPack 的最大大小信息。
- 元素计数：用于记录 ListPack 中存储的元素数量，便于 Redis 在读取时快速判断 ListPack 的数据规模。段通常为 2 个字节，当元素数量超过计数最大值时，该字段不再更新为实际值，而是标记为一个特殊值（如 65535），此时 Redis 会改为遍历整个 ListPack 来获取元素数量。
- 元素数据：紧凑地存储每个元素，元素之间紧密排列，不留多余空间。
- 结尾标志：0xFF，用于标记 ListPack 的结尾。

元素的编码方式：

- 字符串编码：当元素为字符串时，ListPack 使用不同长度的编码来存储字符串数据。
  - 如果字符串长度小于 63 字节，则使用 1 字节编码长度。
  - 如果字符串长度在 63 到 16383 字节之间，则使用 2 字节编码长度。
  - 更长的字符串则使用 5 字节编码。
- 整数编码：当元素为整数时，ListPack 会根据整数的大小选择最紧凑的编码方式。
  - 使用 1 字节编码 8 位整数。
  - 使用 2 字节编码 16 位整数。
  - 使用 4 字节或 8 字节编码更大的整数。

ListPack 的存储示例：

```
假设我们有一个 ListPack，存储了以下元素：

- 字符串 "hello"
- 整数 123
- 字符串 "world"

ListPack 的内存布局可能如下：

| 总字节数 | 元素计数 | 元素1 ("hello") | 元素2 (123) | 元素3 ("world") | 结束标志 (0xFF) |
```

由于 ListPack 是连续内存结构，插入和删除操作需要移动部分数据。Redis 通过以下方式确保操作效率：

- 插入操作：当插入一个元素时，Redis 会先检查剩余空间是否足够。
  - 如果有空间，则直接在目标位置插入元素，并将插入位置之后的元素向后移动。
  - 如果没有足够空间，ListPack 会分配更大的内存，并将所有数据复制到新位置。
- 删除操作：删除元素时，Redis 会将目标元素之后的所有数据向前移动，并更新元素计数和总字节数。

当插入操作需要的空间超出当前 ListPack 的容量时，ListPack 会进行扩展。扩展方式为：

- 重新分配内存：分配一块更大的连续内存，并将现有数据复制到新内存区域。
- 预分配额外空间：在重新分配内存时，ListPack 会适当多分配一些空间，减少后续频繁扩展的开销。

为什么 ListPack 的每个元素移除了 previous_entry_length 不会显著影响 ListPack 的效率？

- 减少了内存占用：
  - 移除 previous_entry_length 字段，能够显著减少每个元素的内存开销，从而提升内存利用率。对于存储大量小元素的场景，节省的空间是显著的。
  - Redis 的 ListPack 设计主要应用于小型、紧凑的结构（如小型集合、哈希表、Stream 记录等），减少每个元素的内存占用更有助于在小型数据场景下提升效率。
- 向前遍历在应用场景中并不常见：
  - 在 Redis 的使用场景中，ListPack 通常用于顺序遍历或在特定位置插入/删除元素，而这些操作一般都可以通过单向遍历完成，向前遍历的需求并不常见。
  - 例如，在小型集合或哈希表等场景中，操作往往是按顺序处理或者直接查找某个元素值，因此单向遍历足以满足需求。
- 减少了内存碎片和复杂度：
  - 移除 previous_entry_length 后，每个元素的存储结构更加简单，减少了不必要的内存碎片和管理复杂度。
  - 由于元素结构更加紧凑，ListPack 的整体内存布局更紧密，有助于提升缓存局部性，从而加速顺序读取操作的效率。
- 常见操作仍然高效：
  - 顺序读取：ListPack 是一个连续的内存块，顺序读取性能较高，因为可以在 CPU 缓存中预取到相邻元素。
  - 插入和删除操作：在 ListPack 的前端或后端进行插入或删除操作时，不需要进行向前遍历，而只需调整当前位置之后的元素即可。
  - 随机读取：由于每个元素的长度在 ListPack 中已知，因此可以直接跳到下一个元素的位置。这对操作效率的影响不大。

ListPack Vs ZipList

- 内存效率对比
  - ZipList：ZipList 在每个元素中包含一个前向指针，用于快速回溯到前一个元素。虽然这有助于双向遍历，但增加了额外的空间开销，特别是在存储大量小元素时。
  - ListPack：ListPack 省去了前向指针，采用单向存储结构，以减少内存使用。ListPack 的布局更加紧凑，适合频繁的顺序访问，存储小元素的内存效率更高。
- 操作效率对比
  - ZipList：插入和删除操作较为复杂，因为需要调整相邻元素的前向指针和偏移量。在元素数量较多的情况下，频繁的插入和删除可能导致大量内存操作，性能较低。
  - ListPack：插入和删除操作相对简单，因为没有前向指针，因此无需调整指针。元素位置变动时只需移动相邻数据，不涉及前向偏移调整，操作更快。
- 数据安全性对比
  - ZipList：由于存储结构的复杂性，ZipList 容易发生内存溢出等问题，特别是在进行扩展、删除或插入操作时。
  - ListPack：ListPack 的内存结构更为严格，并引入了边界检查和错误检测，避免了 ZipList 中可能出现的溢出问题，数据安全性更高。

ListPack 作为 Redis 5.0 后的紧凑数据结构，显著改进了 ZipList 的内存布局和操作安全性，提供了更高的内存效率和操作性能。ListPack 的设计减少了内存碎片，避免了溢出问题，适用于 Redis 中多种小型数据类型的存储需求。综上，ListPack 成为了 Redis 新版本中 ZipList 的理想替代方案。

# QuickList

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742559.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742560.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742561.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742562.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742563.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742564.png)

QuickList + ZipList Vs Normal LinkedList

- 对比内存

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411141243086.png)

- 对比顺序遍历

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411141244445.png)

- 对比插入删除

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411141247065.png)

- 总结

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411141248956.png)

缓存局部性是一种在计算机内存管理中的概念，指的是程序在执行过程中往往会访问一组相邻或相近的内存位置。这种规律分为空间局部性和时间局部性，而缓存局部性指的就是利用这些局部性来提高 CPU 缓存的命中率，从而提升程序的执行效率。在 Redis 的 QuickList + ZipList 结构中，缓存局部性在顺序访问和插入时发挥了重要作用，极大地提升了数据访问的速度。

- 时间局部性：如果一个数据在某个时间点被访问过，那么不久之后很可能会再次访问它。
- 空间局部性：如果一个数据被访问过，那么与它临近的数据也很可能会被访问。

这两种局部性都可以增加缓存命中率。当一个内存块被加载到缓存中时，CPU 可以更快速地访问相邻的内存单元，而不必频繁地从主内存中加载数据。

在 Redis 中，QuickList 是一个双向链表，每个链表节点存储一个 ZipList。而 ZipList 是一个连续的内存块，其中的每个元素（entry）紧密排列在一起，这种设计能够很好地利用空间局部性。

- 顺序读取和遍历：由于 ZipList 中的元素是连续存储的，因此在遍历 ZipList 时，访问每个元素会触发缓存的预取（prefetching），使得相邻的多个元素被加载到缓存中，提升访问速度。
- 插入和删除操作：当数据插入或删除时，由于 ZipList 使用紧密的内存块，可以减少指针跳转次数，同时每次操作的元素都位于缓存的相邻位置，降低了缓存未命中的概率。

# SkipList

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742565.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742566.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742567.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742568.png)

# SkipList Level

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411141313584.png)

# SkipList Vs RedBlackTree

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411141309891.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411141310480.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411141310491.png)

SkipList 的每一个节点也是一个链表，完美符合 ZipList 的设计理念，既节省了内存，也控制了大小，同时高效利用了 CPU 缓存的空间局部性。

# String Encoding

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742572.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742573.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742574.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742575.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742576.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742577.png)

查看 Encoding

```
OBJECT ENCODING k1
```

# List Encoding

List 使用了 Ziplist 和 LinkedList

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742578.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742579.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411141413907.png)

# Set Encoding

Set 刚开始存储的都是整数时, 会采用 IntSet 进行存储, 当要存储一个字符串时, 会先转换成 Dict, 再进行存储

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742580.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742581.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742582.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411141438240.png)

# ZSet Encoding

Redis 的 ZSet 底层由 SkipList 和 HashTable 共同实现，这两个数据结构在 ZSet 中共同维护，同步更新，使得 ZSet 既能高效地进行排序，又能快速查找元素。

跳表（SkipList）：用于按分值排序，以支持按分值范围查询和排序操作。

- 分值（score）：跳表中的每个节点都包含一个分值，用于按顺序排列节点。
- 成员（member）：跳表节点还包含一个成员值（字符串），用于唯一标识元素。
- 按分值排序：跳表的节点按分值排序，ZSet 可以基于跳表结构进行按分值排序的范围查询，例如 ZRANGEBYSCORE 和 ZRANK。
- 范围查询：跳表能够支持按分值范围查找的操作，例如查找某个分值区间内的所有元素。

```c
typedef struct zskiplistNode {
    sds ele;                           // 成员（member），以 sds（简单动态字符串）类型存储
    double score;                      // 分值（score）
    struct zskiplistNode *backward;    // 指向前一个节点的指针，用于反向遍历
    struct zskiplistLevel {         
        struct zskiplistNode *forward; // 每层指向下一个节点的指针
        unsigned int span;             // 跨度，记录到下一个节点的距离
    } level[];                         // 层级数组
} zskiplistNode;
```

哈希表（HashTable）：用于快速查找元素的分值。

- 快速查找和更新分值：哈希表支持通过成员名快速查找到对应的分值，确保了 ZSet 能够在 O(1) 的时间内完成查找。
- 辅助跳表更新：当需要更新某个成员的分值时，哈希表可以快速查找到该成员的分值，并更新到跳表中对应的位置。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742585.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411141508973.png)

ZipList 和 ListPack 都是 List，不支持 score-member 的键值对的存储，所以就采用了特定的输入方式，插入一个 ZSet 元素时，其实是插入了两个元素到 ZSet 中，先插入 score，再插入 member。

```
例如，假设我们有一个 ZSet，包含以下分值和成员对：

(10, "apple"), (20, "banana"), (15, "cherry")

Redis 会将数据插入 ListPack 中，使其按分值顺序排列为：

[10, "apple", 15, "cherry", 20, "banana"]
```

# Hash Encoding

Hash 类型是一种用于存储键值对的数据结构，类似于小型的键值对集合。Redis 的 Hash 类型通常用于存储结构化的数据，比如用户信息或产品属性。Redis 的 Hash 类型根据存储的数据量自动选择不同的底层实现，以实现高效的存储和访问。

Redis 的 Hash 类型可以使用两种底层数据结构实现：

- ZipList（压缩列表） 或 ListPack：用于存储少量的键值对，结构紧凑，占用内存较少。
- HashTable（哈希表）：用于存储大量的键值对或较大的数据，提供高效的查找、插入、删除操作。

当 Hash 中的键值对数量较少，并且每个键值对的数据量较小（即符合以下配置的限制条件）时，Redis 会使用 ZipList 或 ListPack 来存储 Hash，存储的格式和 ZSet 一摸一样，具体怎么存储的可以看下 ZSet

- hash-max-ziplist-entries：表示 ZipList 或 ListPack 的最大键值对数量，默认值为 512。
- hash-max-ziplist-value：表示 ZipList 或 ListPack 中每个键或值的最大字节数，默认值为 64 字节。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221742590.png)

# Bitmap Encoding

Bitmap 本质上可以抽象为一个数组, 每个索引位上存储 0 或 1, 

Bitmap 是通过 SDS 实现的, char buf[] 存储的最小单位是 1B, 每次操作二进制位就是在操作这 1B 的数据, SETBIT k1 10 1 就是在操作 buf[1] 的 1B 数据, 10 对应到第二个字节嘛
