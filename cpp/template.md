# 可变参数

可变参数模板（Variadic Template） 允许模板参数的数量可变，即一个模板可以接受 任意数量 的类型参数或函数参数。

```cpp
template <typename... Args>
void func(Args... args) { /* 实现 */ }
```

- Args... 是 模板参数包（parameter pack），可以匹配 任意数量 的模板参数。
- args... 是 函数参数包（function parameter pack），表示对应的多个函数参数。

---

可变参数模板的大小可以通过 sizeof... 获取：

```cpp
template <typename... Args>
void countArgs(Args... args) {
    std::cout << "Number of arguments: " << sizeof...(args) << std::endl;
}

int main() {
    countArgs(1, 2.5, "hello", 'c');
    return 0;
}
```

---

使用递归展开，打印任意数量的参数：

```cpp
// 递归终止条件（无参数时）
void print() { std::cout << "End of recursion\n"; }

// 递归展开可变参数
template <typename T, typename... Args>
void print(T first, Args... rest) {
    std::cout << first << " ";
    print(rest...);  // 递归调用展开参数
}

int main() {
    print(1, 2.5, "hello", 'c');
    return 0;
}
```

```
1 2.5 hello c End of recursion
```

```
-> print(1, 2.5, "hello", 'c') // first: 1, rest: {2.5, "hello", 'c'}
-> print(2.5, "hello", 'c') // first: 2.5, rest: {"hello", 'c'}
-> print("hello", 'c')
-> print('c')
-> print()
```

---

可变参数模板常与 完美转发（Perfect Forwarding） 结合，提高泛型函数的效率。

```cpp
void func(int& x) { std::cout << "Lvalue reference\n"; }
void func(int&& x) { std::cout << "Rvalue reference\n"; }

template <typename... Args>
void wrapper(Args&&... args) {
    func(std::forward<Args>(args)...);
}

int main() {
    int x = 10;
    wrapper(x);   // 传递左值
    wrapper(10);  // 传递右值
    return 0;
}
```

```
Lvalue reference
Rvalue reference
```

---

可变参数模板可以用于 类模板，比如实现 Tuple 数据结构。

```cpp
// 可变参数类模板
template <typename... Args>
class Tuple {};

// 递归展开
template <typename First, typename... Rest>
class Tuple<First, Rest...> {
public:
    First value;
    Tuple<Rest...> next;  // 递归定义
    Tuple(First v, Rest... rest) : value(v), next(rest...) {}
    
    void print() {
        std::cout << value << " ";
        next.print();
    }
};

// 递归终止类模板
template <>
class Tuple<> {
public:
    void print() {} // 空的 print 终止递归
};

int main() {
    Tuple<int, double, char> t(1, 2.5, 'c');
    t.print();  // 1 2.5 c
    return 0;
}
```

# 依赖参数类型

在模板编程中，当一个类型名称依赖于模板参数（也叫“依赖名”）时，编译器无法直接判断该名称是否表示一个类型，因此必须用 typename 明确指出它是一个类型

```cpp
template<typename Container>
void printFirstElement(const Container& c) {
    // 注意：由于 Container::const_iterator 依赖于模板参数 Container，
    // 因此必须加 typename 来表明它是一个类型。
    if (!c.empty()) {
        typename Container::const_iterator it = c.begin();
        std::cout << "First element: " << *it << std::endl;
    }
}

int main() {
    std::vector<int> vec = {10, 20, 30};
    printFirstElement(vec);
    return 0;
}
```

在 printFirstElement 中，Container::const_iterator 是一个依赖于模板参数 Container 的类型。由于编译器在解析模板时无法确定它是否为类型，所以必须使用 typename 关键字。

# 折叠表达式

折叠表达式（Fold Expressions） 是 C++17 引入的特性，旨在 简化可变参数模板的递归展开。
在 C++11/14 版本中，我们通常使用 递归展开 来处理可变参数模板，而 C++17 允许直接在参数包上使用运算符进行折叠计算。

假设 args... 是一个 参数包（parameter pack），运算符 op 可以是 `+, *, &&, ||` 等。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501191145556.png)

---

通过一元左折叠求和：

```cpp
template <typename... Args>
auto sum(Args... args) {
    return (args + ...);  // 右折叠
}

int main() {
    std::cout << "Sum: " << sum(1, 2, 3, 4, 5) << std::endl;
    return 0;
}
```

```
Sum: 15
```

展开过程：

```
(1 + (2 + (3 + (4 + 5))))
```

---

通过一元左折叠检查是否都为真：

```cpp
template <typename... Args>
bool allTrue(Args... args) {
    return (args && ...);  // 右折叠
}

int main() {
    std::cout << std::boolalpha;  // 显示 true/false
    std::cout << "allTrue(true, true, false): " << allTrue(true, true, false) << std::endl;
    std::cout << "allTrue(true, true, true): " << allTrue(true, true, true) << std::endl;
    return 0;
}
```

```
allTrue(true, true, false): false
allTrue(true, true, true): true
```

展开过程：

```
(true && (true && false)) → (true && false) → false
```

---

通过一元左折叠检查是否有一个为真：

```cpp
template <typename... Args>
bool anyTrue(Args... args) {
    return (args || ...);  // 右折叠
}

int main() {
    std::cout << std::boolalpha;
    std::cout << "anyTrue(false, false, false): " << anyTrue(false, false, false) << std::endl;
    std::cout << "anyTrue(false, true, false): " << anyTrue(false, true, false) << std::endl;
    return 0;
}
```

```
anyTrue(false, false, false): false
anyTrue(false, true, false): true
```

展开过程：

```
(false || (true || false)) → (false || true) → true
```

---

通过一元右折叠打印多个参数：

```cpp
template <typename... Args>
void print(Args... args) {
    (std::cout << ... << args) << std::endl;  // 右折叠
}

int main() {
    print("Hello ", "World", "!", 123, 4.5);
    return 0;
}
```

```
Hello World!1234.5
```

展开过程：

```
(std::cout << "Hello " << "World" << "!" << 123 << 4.5)
```

---

通过一元右折叠执行函数对象：

```cpp
template <typename... Args>
void execute(Args... args) {
    (..., args());  // 右折叠
}

void task1() { std::cout << "Task 1 executed\n"; }
void task2() { std::cout << "Task 2 executed\n"; }
void task3() { std::cout << "Task 3 executed\n"; }

int main() {
    execute(task1, task2, task3);
    return 0;
}
```

```
Task 1 executed
Task 2 executed
Task 3 executed
```

展开过程：

```
(task1(), (task2(), task3()))
```

---
通过二元左折叠计算总和：

```cpp
template <typename... Args>
auto sumWithInit(int init, Args... args) {
    return (init + ... + args);  // 左折叠
}

int main() {
    std::cout << "Sum with init: " << sumWithInit(10, 1, 2, 3) << std::endl;
    return 0;
}
```

# 万能引用

万能引用（Universal Reference）是 C++11 引入的概念，它指的是 函数模板参数 T&&，其中 T 是一个模板参数，且 T&& 不是用于特定类型（如 int&& 或 std::string&&），而是通用的。

- 左值会导致 T 被推导为 T&，然后 T&& 折叠成 T&（左值引用）。
- 右值则保持 T&&，使其仍然是 T&&（右值引用）。

```cpp
template <typename T>
void checkType(T&& arg) {
    if constexpr (std::is_lvalue_reference_v<T>) {
        std::cout << "T is lvalue reference\n";
    } else if constexpr (std::is_rvalue_reference_v<T>) {
        std::cout << "T is rvalue reference\n";
    } else {
        std::cout << "T is neither lvalue nor rvalue reference\n";
    }
}

int main() {
    int x = 10;
    checkType(x);   // 传递左值
    checkType(20);  // 传递右值
    return 0;
}
```

```
T is lvalue reference
T is neither lvalue nor rvalue reference
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501191309218.png)

# 完美转发

std::forward 是 C++11 引入的标准库函数，用于 完美转发（Perfect Forwarding），它可以 保留参数的左值/右值属性，从而避免不必要的拷贝或移动。

```cpp
void process(const std::string& s) { std::cout << "Lvalue reference\n"; }
void process(std::string&& s) { std::cout << "Rvalue reference\n"; }

template <typename T>
void wrapper(T&& arg) {
    process(std::forward<T>(arg));  // 保持参数原始的左值/右值特性
}

int main() {
    std::string str = "Hello";
    wrapper(str);   // 传递左值
    wrapper("World");  // 传递右值
    return 0;
}
```

- wrapper(str) 传递左值，`std::forward<T>(arg)` 仍然是 左值。
- wrapper("World") 传递右值，`std::forward<T>(arg)` 保持 右值特性，正确调用 process(std::string&&)。
- T&& arg 可以绑定左值或右值，即这里的 arg 保留了左值或右值的状态，但是 arg 本身是一个左值，需要通过 std::forward 传递 arg 给 process，并且不丢失左值或右值的特性。
- T arg 不是引用，它总是通过拷贝或移动创建新的对象，而不会保留原始的左值或右值特性，所以搭配 std::forward 就没有任何意义。

```cpp
void process(const std::string& s) { std::cout << "Lvalue reference\n"; }
void process(std::string&& s) { std::cout << "Rvalue reference\n"; }

template <typename T>
void wrapperByValue(T arg) {  // T 不是引用
    process(std::forward<T>(arg));  // ❌ 无法正确转发
}

int main() {
    std::string str = "Hello";
    wrapperByValue(str);   // 传递左值
    wrapperByValue("World");  // 传递右值
    return 0;
}
```