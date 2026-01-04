# std::vector

std::vector 是标准模板库（STL）中常用的动态数组容器。

- 根据需要自动调整其大小，当元素超过当前容量时，会重新分配内存。
- 支持通过索引快速访问元素。
- 提供插入、删除等操作，动态调整元素布局。
- 提供与原生数组相似的接口，如指针访问。

```cpp
std::vector<int> v1; // 空 vector
std::vector<int> v2(5); // 预分配 5 个元素，初始值为 0
std::vector<int> v3(5, 10); // 预分配 5 个元素，值为 10
std::vector<int> v4 = {1, 2, 3, 4, 5}; // 使用初始化列表

// 输出 v4 的内容
for (int num : v4) {
    std::cout << num << " ";
}
```

```cpp
std::vector<int> vec;

// 添加元素
vec.push_back(10);
vec.push_back(20);
vec.push_back(30);

// 删除元素
vec.pop_back(); // 删除最后一个元素

// 插入到指定位置
vec.insert(vec.begin(), 5); // 在起始位置插入 5

// 删除指定位置的元素
vec.erase(vec.begin() + 1); // 删除第二个元素

// 输出结果
for (int num : vec) {
    std::cout << num << " ";
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412091123502.png)

## 遍历容器

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 使用范围 for 循环
for (int num : vec) {
    std::cout << num << " ";
}
std::cout << std::endl;

// 使用迭代器
for (auto it = vec.begin(); it != vec.end(); ++it) {
    std::cout << *it << " ";
}
```

## 自动扩容

std::vector 的底层实现是基于动态数组，通过动态扩展内存来实现其灵活的动态调整能力。

std::vector 的底层使用连续的内存块存储元素。当存储的元素数量超过当前容量时，vector 会分配一块更大的内存区域，并将旧元素复制到新内存中。扩容时，一般采用 倍增策略（通常是 2 倍），以减少频繁的内存分配开销。

```cpp
std::vector<int> vec;

for (int i = 0; i < 10; ++i) {
    vec.push_back(i);
    std::cout << "Size: " << vec.size() << ", Capacity: " << vec.capacity() << std::endl;
}
```

```
Size: 1, Capacity: 1
Size: 2, Capacity: 2
Size: 3, Capacity: 4
Size: 4, Capacity: 4
Size: 5, Capacity: 8
Size: 6, Capacity: 8
...
```

## 手动缩容

std::vector 并没有提供 自动缩容 的机制，即使删除元素导致 size 小于 capacity，也不会自动释放多余的内存。

采用 shrink_to_fit() 进行手动缩容，尝试将 capacity 调整为等于当前 size。它只是一个提示（hint），依赖于标准库的具体实现，有时即使调用了它，容量也可能不会缩小。

```cpp
std::vector<int> vec(100, 1);

std::cout << "Before shrinking: " << std::endl;
std::cout << "Size: " << vec.size() << ", Capacity: " << vec.capacity() << std::endl;

// 删除大部分元素
vec.resize(20);

std::cout << "\nAfter resizing: " << std::endl;
std::cout << "Size: " << vec.size() << ", Capacity: " << vec.capacity() << std::endl;

// 使用 shrink_to_fit
vec.shrink_to_fit();

std::cout << "\nAfter shrink_to_fit: " << std::endl;
std::cout << "Size: " << vec.size() << ", Capacity: " << vec.capacity() << std::endl;
```

```
Before shrinking: 
Size: 100, Capacity: 100

After resizing: 
Size: 20, Capacity: 100

After shrink_to_fit: 
Size: 20, Capacity: 20
```

采用 swap() 进行手动缩容，这种方法更加可靠，确保释放多余内存。

```cpp
std::vector<int> vec(100, 1);

std::cout << "Before shrinking: " << std::endl;
std::cout << "Size: " << vec.size() << ", Capacity: " << vec.capacity() << std::endl;

// 删除大部分元素
vec.resize(20);

std::cout << "\nAfter resizing: " << std::endl;
std::cout << "Size: " << vec.size() << ", Capacity: " << vec.capacity() << std::endl;


// 使用 vec 的内容（当前的元素）初始化一个新的临时容器，新容器的容量等于 vec.size()，临时容器中并没有多余的未使用内存。
// 使用 swap 交换临时容器和 vec 的内部状态（数据指针、大小 size 和容量 capacity），原来的 vec 现在拥有临时容器的内存区域，容量被缩减到当前大小。临时容器持有原来 vec 的多余内存。
// 临时容器在作用域结束时自动销毁，其析构函数会释放它持有的多余内存，因此，未使用的内存被释放掉，不会造成内存泄漏。
std::vector<int>(vec).swap(vec);

std::cout << "\nAfter shrinking: " << std::endl;
std::cout << "Size: " << vec.size() << ", Capacity: " << vec.capacity() << std::endl;
```

```
Before shrinking: 
Size: 100, Capacity: 100

After resizing: 
Size: 20, Capacity: 100

After shrinking: 
Size: 20, Capacity: 20
```

## 兼容原生数组

td::vector 提供 data() 方法，可以获取指向底层数组的指针，方便与 C 风格函数或其他需要原生数组的接口交互。

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 获取原生数组的指针
int* ptr = vec.data();

// 使用指针访问元素
for (size_t i = 0; i < vec.size(); ++i) {
    std::cout << *(ptr + i) << " ";
}
```

## 释放资源

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

vec.clear(); // 清空内容，但容量不变
std::cout << "Size after clear: " << vec.size() << std::endl;

vec.shrink_to_fit(); // 减小容量以适应大小
std::cout << "Capacity after shrink_to_fit: " << vec.capacity() << std::endl;
```

## 存储模型

std::vector 对象本身（即控制块）存储在栈中，包括：指向动态内存（堆）的指针，当前大小（size），容量（capacity）。动态分配的内存在堆上，存储真实的数据。

## 底层原理

Cpp std::vector 和 Java ArrayList 在增删改查上的设计几乎一摸一样，唯独扩容 ArrayList 增加了一个 Load Factor 机制。

插入包括 尾部插入（push_back） 和 中间插入（insert）。

- 尾部插入：在 data[size] 写入新元素，size++。
- 中间插入：将插入位置后的元素向后移动一位（std::memmove 或手动循环），将新元素插入指定位置，size++。

删除包括 尾部删除（pop_back） 和 中间删除（erase）。

- 尾部删除：直接将 size--，但不减少容量，调用析构函数销毁最后一个元素（如果是复杂对象）。
- 中间删除：将删除位置之后的元素向前移动一位（覆盖被删除的元素），调用析构函数销毁最后一个元素，size--。

std::vector 在移动元素和扩容时会优先使用 std::move 转移资源的所有权，将它们转移到新内存，避免深拷贝。如果对象不支持移动构造函数，则 std::vector 会退化为调用 拷贝构造函数 逐个复制数据。

std::vector 在复制元素时会优使用 std::copy，避免逐个调用赋值运算符。如果对象是简单类型，则会调用 memmove 或 memcpy 按字节复制。如果对象是复杂类型，则会逐个调用拷贝构造复制数据。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412091208336.png)

std::vector 在插入元素时（例如：emplace_back, push_back）会针对左值和右值进行不同的处理：

- 如果传递的是 左值，会调用该类型的 拷贝构造函数。
- 如果传递的是 右值，会调用该类型的 移动构造函数（如果存在）。
- 如果类型没有拷贝构造函数或移动构造函数（如 unique_ptr），那么尝试传递左值会导致 编译错误。

下面这段代码编译报错的原因就是，std::unique_ptr 是 独占所有权智能指针，其设计目标是禁止复制（避免多个指针管理同一个资源），std::unique_ptr 没有拷贝构造函数，只有移动构造函数，这里 vector 接收到左值后，尝试去调用拷贝构造函数，就会编译出错。

```cpp
std::vector<std::unique_ptr<std::thread>> threads;
auto thread = std::make_unique<std::thread>());
threads.emplace_back(thread); // 编译失败，接收到左值，尝试调用拷贝构造失败
threads.emplace_back(std::move(thread)); // 编译成功，接收到右值，尝试调用移动构造成功
threads.emplace_back(std::make_unique<std::thread>())); // 编译成功，接收到右值，尝试调用移动构造成功
```

```cpp
class Person {
public:
    Person(std::string name, int age) {
        std::cout << "Constructor called: " << name << ", " << age << std::endl;
    }

    Person(const Person& other) {
        std::cout << "Copy constructor called" << std::endl;
    }

    Person(Person&& other) {
        std::cout << "Move constructor called" << std::endl;
    }
};

int main() {
    Person p("Alice", 30);
    
    std::vector<Person> v;
    
    v.emplace_back(p); // 调用拷贝构造
    v.emplace_back(Person("Alice", 30)); // 调用移动构造
    v.emplace_back(std::move(p)); // 调用移动构造
    
    v.push_back(p); // 调用拷贝构造
    v.push_back(Person("Alice", 30)); // 调用移动构造
    v.push_back(std::move(p)); // 调用移动构造
    
    // emplace_back 相比 push_back 提供了一个更加高效简洁的接口，
    // 可以在插入元素时，根据类型原地构造对象，避免了拷贝和移动的过程
    v.emplace_back("Alice", 30); // 原地构造对象
}
```

# std::deque

std::deque（双端队列）是一个支持高效地在头部和尾部插入或删除元素的容器。

```cpp
std::deque<int> dq;

// 插入元素
dq.push_back(1); // 在尾部插入
dq.push_back(2);
dq.push_front(0); // 在头部插入

std::cout << "Deque after push operations: ";
for (int num : dq) {
    std::cout << num << " ";
}
std::cout << std::endl;

// 访问元素
std::cout << "Front element: " << dq.front() << std::endl;
std::cout << "Back element: " << dq.back() << std::endl;

// 删除元素
dq.pop_front(); // 删除头部元素
dq.pop_back();  // 删除尾部元素

std::cout << "Deque after pop operations: ";
for (int num : dq) {
    std::cout << num << " ";
}
std::cout << std::endl;
```

```cpp
std::deque<int> dq = {1, 2, 3, 4, 5};

// 插入元素
dq.insert(dq.begin() + 2, 99); // 在索引 2 位置插入 99

std::cout << "Deque after insert: ";
for (int num : dq) {
    std::cout << num << " ";
}
std::cout << std::endl;

// 删除元素
dq.erase(dq.begin() + 2); // 删除索引 2 的元素

std::cout << "Deque after erase: ";
for (int num : dq) {
    std::cout << num << " ";
}
std::cout << std::endl;
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412091255736.png)

## 底层原理

std::deque 的底层实现并不是链表，而是一个 分段数组（segmented array）结构。尽管它支持快速的头部和尾部操作，但其存储方式与链表完全不同。std::deque 通过在底层使用多个连续的小内存块（chunk）和一个控制这些块的指针数组来实现高效的操作。

- 块数组（chunks）：存储实际的元素，每个块大小固定（通常为 512 字节或其他实现定义的大小），不同块的内存地址不连续。
- 块指针数组（map）：用于管理这些块的指针数组，每个指针指向一个块，这个数组本身是连续存储的。

```
块指针数组 (map):
+--------+--------+--------+
| Chunk1 | Chunk2 | Chunk3 |
+--------+--------+--------+

块内容 (chunks):
Chunk1: [A, B, C, D]
Chunk2: [E, F, G, H]
Chunk3: [I, J, _, _]
```

std::deque 不采用双端链表的原因：

- 随机访问性能：链表无法支持高效的随机访问，其访问时间复杂度为 O(n)，而 std::deque 支持随机访问，时间复杂度为 O(1)。
- 空间开销：链表每个节点需要额外存储指针，导致空间利用率低，std::deque 的分段数组结构避免了这些额外开销。
- 缓存友好：分段数组的每个块是连续内存，更加缓存友好，能提升访问效率，链表节点散布在内存中，不利于缓存利用。

std::deque 采用分段数组的原因：

- 支持快速的头部和尾部操作：插入时，如果需要扩展，可以直接在 map 的前后追加新的块，而无需移动已有数据。
- 支持随机访问：通过块指针数组和块内的偏移量，能够快速计算出任何位置元素的地址。
- 扩展性强：当元素数量超过当前块指针数组容量时，可以动态扩展 map，并不会影响已有数据的布局。

插入包括 尾部插入（push_back）和 头部插入（push_front）：

- 尾部插入（push_back）：如果尾部块有剩余空间，则直接插入。如果尾部块满了，分配一个新块，并更新块指针数组。
- 头部插入（push_front）：如果头部块有剩余空间，则直接插入。如果头部块满了，分配一个新块，并在 map 的前面插入块指针。

删除包括 尾部删除（pop_back）和 尾部删除（pop_back）：

- 尾部删除（pop_back）：如果尾部块有元素，直接删除。如果尾部块空了，释放该块的内存，并更新块指针数组。
- 头部删除（pop_front）：同理，如果头部块空了，释放头部块的内存。

# std::stack

std::stack 是基于某种底层容器（如 std::deque, std::vector）实现的适配器，通过限制接口实现了 栈 的行为，提供了一组简化的操作接口，如入栈、出栈和访问栈顶元素。

```cpp
std::stack<int> st;

// 入栈
st.push(10);
st.push(20);
st.push(30);

// 查看栈顶元素
std::cout << "Top element: " << st.top() << std::endl;

// 出栈
st.pop();
std::cout << "After pop, top element: " << st.top() << std::endl;

// 检查是否为空
std::cout << "Is stack empty? " << (st.empty() ? "Yes" : "No") << std::endl;

// 查看栈的大小
std::cout << "Stack size: " << st.size() << std::endl;
```

std::stack 默认使用 std::deque 作为底层容器，但可以指定其他容器，如 std::vector 或 std::list。

```cpp
// 使用 std::vector 作为底层容器
std::stack<int, std::vector<int>> st;

st.push(1);
st.push(2);
st.push(3);

while (!st.empty()) {
    std::cout << st.top() << " ";
    st.pop();
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412091309945.png)

## 底层原理

std::stack 是基于底层容器的适配器，通过限制接口，实现了栈的行为，提供了一组简化的操作接口，如入栈、出栈和访问栈顶元素。

std::stack 对外只暴露了 push、pop、top、empty、size。所有其他操作（如直接访问某个位置的元素、插入到非栈顶的位置）都被底层容器封装，不允许直接调用。因此，std::stack 的行为被严格限制为栈的特性（后进先出）。

```cpp
template <typename T, typename Container = std::deque<T>>
class stack {
protected:
    Container c; // 底层容器
public:
    // 基本操作接口
    bool empty() const { return c.empty(); }
    size_t size() const { return c.size(); }
    T& top() { return c.back(); }
    const T& top() const { return c.back(); }
    void push(const T& value) { c.push_back(value); }
    void push(T&& value) { c.push_back(std::move(value)); }
    void pop() { c.pop_back(); }
};
```

# std::queue

std::queue 和 std::stack 类似，std::queue 也不是一个独立的数据结构，而是对底层容器（默认是 std::deque）的封装，只提供了一组用于实现队列操作的接口。

```cpp
std::queue<int> q;

// 入队
q.push(10);
q.push(20);
q.push(30);

// 查看队头和队尾元素
std::cout << "Front element: " << q.front() << std::endl;
std::cout << "Back element: " << q.back() << std::endl;

// 出队
q.pop();
std::cout << "After pop, front element: " << q.front() << std::endl;

// 检查是否为空
std::cout << "Is queue empty? " << (q.empty() ? "Yes" : "No") << std::endl;

// 查看队列大小
std::cout << "Queue size: " << q.size() << std::endl;
```

默认情况下，std::queue 使用 std::deque 作为底层容器。如果需要，可以使用 std::list 替代：

```cpp
// 使用 std::list 作为底层容器
std::queue<int, std::list<int>> q;

q.push(1);
q.push(2);
q.push(3);

while (!q.empty()) {
    std::cout << q.front() << " ";
    q.pop();
}
```

## 底层原理

std::queue 是基于底层容器的适配器。以下是 std::queue 的实现原理（伪代码）：

```cpp
template <typename T, typename Container = std::deque<T>>
class queue {
protected:
    Container c; // 底层容器

public:
    bool empty() const { return c.empty(); }
    size_t size() const { return c.size(); }
    T& front() { return c.front(); }
    const T& front() const { return c.front(); }
    T& back() { return c.back(); }
    const T& back() const { return c.back(); }
    void push(const T& value) { c.push_back(value); }
    void push(T&& value) { c.push_back(std::move(value)); }
    void pop() { c.pop_front(); }
};
```

# std::set

std::set 是标准模板库中的一个关联容器，用于存储唯一的键值，同时还支持自排序，中序遍历。

```cpp
std::set<int> s;

// 插入元素
s.insert(10);
s.insert(20);
s.insert(10); // 重复插入，集合中只有一个 10
s.insert(15);

// 遍历集合
std::cout << "Elements in the set: ";
for (int x : s) {
    std::cout << x << " ";
}
std::cout << std::endl;
```

```
Elements in the set: 10 15 20
```

```cpp
std::set<int> s = {5, 10, 15, 20};

// 查找元素
int target = 15;
if (s.find(target) != s.end()) {
    std::cout << target << " is found in the set." << std::endl;
} else {
    std::cout << target << " is not found in the set." << std::endl;
}

// 删除元素
s.erase(15);
std::cout << "After erasing 15, set contains: ";
for (int x : s) {
    std::cout << x << " ";
}
std::cout << std::endl;
```

```
15 is found in the set.
After erasing 15, set contains: 5 10 20
```

```cpp
std::set<int> s = {10, 20, 30, 40, 50};

// lower_bound 返回第一个不小于 25 的元素
auto it = s.lower_bound(25);
if (it != s.end()) {
    std::cout << "The first element not less than 25 is " << *it << std::endl;
} else {
    std::cout << "No elements not less than 25." << std::endl;
}

// upper_bound 返回第一个大于 25 的元素
it = s.upper_bound(25);
if (it != s.end()) {
    std::cout << "The first element greater than 25 is " << *it << std::endl;
} else {
    std::cout << "No elements greater than 25." << std::endl;
}
```

```
The first element not less than 25 is 30
The first element greater than 25 is 30
```

std::set 默认按照升序排序，但可以使用自定义比较函数实现不同的排序规则（如降序）。

```cpp
struct DescendingOrder {
    bool operator()(int a, int b) const {
        return a > b; // 降序
    }
};

int main() {
    std::set<int, DescendingOrder> s;

    s.insert(10);
    s.insert(20);
    s.insert(15);

    std::cout << "Elements in the set (in descending order): ";
    for (int x : s) {
        std::cout << x << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

```
Elements in the set (in descending order): 20 15 10
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412091315951.png)

## 底层原理

std::set 的底层实现通常是红黑树，因此它具有高效的插入、删除和查找操作，时间复杂度为 O(logn)。

# std::multiset

std::multiset 类似于 std::set，但它允许重复元素存储，同时还支持自动排序，中序遍历。

```cpp
std::multiset<int> ms;

// 插入元素
ms.insert(10);
ms.insert(20);
ms.insert(10); // 允许重复插入
ms.insert(15);

// 遍历集合
std::cout << "Elements in the multiset: ";
for (int x : ms) {
    std::cout << x << " ";
}
std::cout << std::endl;
```

```
Elements in the multiset: 10 10 15 20
```

std::multiset 提供了 count 方法，用于统计指定值的数量：

```cpp
std::multiset<int> ms = {10, 20, 10, 15, 10};

// 统计元素 10 的个数
int num = ms.count(10);
std::cout << "Number of 10s: " << num << std::endl;
```

## 底层原理

std::multiset 和 std::set 都基于 红黑树 实现，区别在于：

- std::set 不允许重复值，插入时会检查是否存在重复元素。
- std::multiset 允许重复值，插入时直接将新元素插入树中。

# std::map

std::map 用于存储键值对（key-value pairs），并根据键值自动排序。

```cpp
std::map<int, std::string> m;

// 插入元素
m.insert(std::make_pair(1, "Apple"));
m.insert(std::make_pair(2, "Banana"));
m.insert(std::make_pair(3, "Cherry"));

// 遍历
for (const auto& pair : m) {
    std::cout << "Key: " << pair.first << ", Value: " << pair.second << std::endl;
}
```

```cpp
std::map<int, std::string> m;

// 使用 operator[] 插入键值对
m[1] = "Dog";
m[2] = "Cat";

// 访问键对应的值
std::cout << "Key 1: " << m[1] << std::endl;

// 插入新键时赋默认值
std::cout << "Key 3: " << m[3] << std::endl;
```

```cpp
std::map<int, std::string> m = {
    {1, "One"}, {2, "Two"}, {3, "Three"}
};

// 查找
int key = 2;
auto it = m.find(key);
if (it != m.end()) {
    std::cout << "Found: Key " << key << ", Value: " << it->second << std::endl;
} else {
    std::cout << "Key " << key << " not found." << std::endl;
}

// 删除
m.erase(2);

// 遍历
for (const auto& pair : m) {
    std::cout << "Key: " << pair.first << ", Value: " << pair.second << std::endl;
}
```

```cpp
std::map<int, std::string> m = {
    {10, "A"}, {20, "B"}, {30, "C"}, {40, "D"}
};

// 范围 [15, 35)
auto lower = m.lower_bound(15);
auto upper = m.upper_bound(35);

std::cout << "Elements in range [15, 35):" << std::endl;
for (auto it = lower; it != upper; ++it) {
    std::cout << "Key: " << it->first << ", Value: " << it->second << std::endl;
}
```

```cpp
struct DescendingOrder {
    bool operator()(int a, int b) const {
        return a > b;
    }
};

int main() {
    std::map<int, std::string, DescendingOrder> m;

    m[1] = "One";
    m[2] = "Two";
    m[3] = "Three";

    for (const auto& pair : m) {
        std::cout << "Key: " << pair.first << ", Value: " << pair.second << std::endl;
    }

    return 0;
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412091326195.png)

## 底层原理

std::map 的底层实现通常是红黑树，因此它具有高效的插入、删除和查找操作，时间复杂度为 O(logn)。

# std::unordered_map

std::map 底层基于红黑树，可以保证有序，std::unordered_map 底层基于哈希表，无法保证有序。

- 性能优先，选择 std::unordered_map，适合查找和插入频繁但不需要顺序的场景。
- 有序性优先，选择 std::map，适合需要按顺序操作或范围查询的场景

```cpp
int main() {
    std::unordered_map<std::string, int> umap;

    // 插入键值对
    umap["Alice"] = 30;
    umap["Bob"] = 25;
    umap["Charlie"] = 35;

    // 查找元素
    if (umap.find("Alice") != umap.end()) {
        std::cout << "Alice's age: " << umap["Alice"] << std::endl;
    }

    // 遍历元素（无序）
    for (const auto& pair : umap) {
        std::cout << pair.first << ": " << pair.second << std::endl;
    }

    return 0;
}
```

## 底层原理

std::unordered_map 底层实现是基于哈希表，键值对的存储顺序是无序的，不能保证元素按键值顺序排列。

# std::multimap

std::multimap 与 std::map 类似，但它允许键重复。

```cpp
std::multimap<int, std::string> mm;

// 插入元素
mm.insert(std::make_pair(1, "Apple"));
mm.insert(std::make_pair(2, "Banana"));
mm.insert(std::make_pair(1, "Cherry")); // 键 1 重复

// 遍历 multimap
for (const auto& pair : mm) {
    std::cout << "Key: " << pair.first << ", Value: " << pair.second << std::endl;
}
```

## 底层原理

std::multimap 和 std::map 都基于 红黑树 实现，区别在于：

- std::map 不允许重复值，插入时会检查是否存在重复元素。
- std::multimap 允许重复值，插入时直接将新元素插入树中。

# std::pair

std::pair 用于存储一对值。它常用于需要将两个相关值绑定在一起的场景，例如字典、关联容器中的键值对等。

```cpp
// 构造一个 pair
std::pair<int, std::string> p1(1, "Apple");

// 访问成员
std::cout << "First: " << p1.first << ", Second: " << p1.second << std::endl;

// 修改成员
p1.first = 2;
p1.second = "Banana";
std::cout << "After modification: First: " << p1.first << ", Second: " << p1.second << std::endl;
```

```
First: 1, Second: Apple
After modification: First: 2, Second: Banana
```

std::make_pair 是一个方便的函数，用于创建 std::pair 对象：

```cpp
// 使用 make_pair 创建 pair
auto p = std::make_pair(42, "Hello");

std::cout << "First: " << p.first << ", Second: " << p.second << std::endl;
```

std::pair 非常适合作为函数返回值，以返回两个相关的数据。

```cpp
// 返回一个键值对
std::pair<int, std::string> getKeyValuePair() {
    return std::make_pair(100, "Value");
}

int main() {
    auto p = getKeyValuePair();
    auto [key, val] = getKeyValuePair();
    
    std::cout << "Key: " << p.first << ", Value: " << p.second << std::endl;
    std::cout << "Key: " << key << ", Value: " << val << std::endl;

    return 0;
}
```

## 底层原理

std::pair 的定义如下：

```cpp
template <class T1, class T2>
struct pair {
    T1 first; // 第一个元素
    T2 second; // 第二个元素

    pair(); // 默认构造函数
    pair(const T1& a, const T2& b); // 构造一个 pair
    template<class U1, class U2>
    pair(U1&& a, U2&& b); // 移动构造函数
};
```

std::pair 的内存布局由其两个成员变量的类型决定。例如：

```cpp
std::pair<int, double> p(10, 3.14);
```

```
|   first (int)   |    second (double)    |
|  4 bytes        |      8 bytes          |
```

std::pair 是一个轻量级的结构体，直接存储两个值，无需动态分配内存，因此非常高效。它常用作函数的返回值：

- 避免使用多个参数的返回值。
- 避免动态内存分配或创建自定义结构体。
