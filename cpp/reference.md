# 引用

引用（Reference）是一个变量的别名，提供了对已有变量的直接访问，简化了指针操作，提高了代码的可读性和安全性。

引用的特点：

- 必须初始化：引用在声明时必须初始化，不能像指针那样单独声明。
- 不可改变绑定：一旦引用绑定到某个变量，就无法重新绑定到另一个变量。
- 简化语法：引用的语法比指针更简洁，不需要显式解引用操作。
- 与指针的区别：引用是别名，操作引用就像操作原变量本身。指针是内存地址的变量，可以指向不同的对象。

```cpp
int a = 10;
int& ref = a; // 声明引用 ref，绑定到变量 a

std::cout << "Value of a: " << a << std::endl; // 10
std::cout << "Value of ref: " << ref << std::endl; // 10

ref = 20; // 修改引用，实际上修改了 a 的值
std::cout << "Updated value of a: " << a << std::endl; // 20
```

- ref 是变量 a 的引用，任何对 ref 的操作都会作用在 a 上。
- 通过 ref 修改值实际上修改了 a。

按值传递会拷贝数据，效率低，可采用引用传递直接操作原始数据，更高效。

```cpp
void increment(int& num) { // 引用作为参数
    num++;
}

int main() {
    int a = 10;
    increment(a); // 通过引用传递 a
    std::cout << "Value after increment: " << a << std::endl; // 11

    return 0;
}
```

- 使用引用，函数直接操作原变量 a，避免了值拷贝，提高了效率。

引用可以作为函数返回值，但需要保证返回的引用指向合法的内存。

```cpp
int& getValue(int& x) {
    return x; // 返回引用
}

int main() {
    int a = 10;
    int& ref = getValue(a); // 引用接收返回值
    ref = 20; // 修改返回的引用

    std::cout << "Value of a: " << a << std::endl; // 20

    return 0;
}
```

- 函数返回一个引用，调用者可以直接操作返回值，改变原变量的值。

不要返回局部变量的引用，原因和指针相同。

```cpp
int& invalid() {
    int x = 10;
    return x; // 错误：返回局部变量引用
}
```

引用是需要区分好对象和指针：

```cpp
Animal* animal = new Animal("Dog", 5);
const auto & animalRef = *animal; // animal 是指针，需要通过 * 解引用得到具体的对象

Animal animal("Dog", 5);
const auto & animalRef = animal; // animal 是对象，可以直接引用

int num = 10;
const auto & numRef = num;
```

# 引用参数

指针作为函数参数时，传递的只是指针的拷贝，但指针指向的对象仍然是原来的对象。

```cpp
void modifyPointer(int* ptr) {
    *ptr = 20;  // 修改 ptr 指向的对象
    ptr = nullptr;  // 只改变局部拷贝，不影响外部指针
}

int main() {
    int a = 10;
    int* p = &a;

    modifyPointer(p);
    
    std::cout << "a: " << a << std::endl;  // 输出 20
    std::cout << "p: " << p << std::endl;  // p 仍然指向 a，不是 nullptr

    return 0;
}
```

引用作为函数参数时，传递的就是原来的对象，函数内部操作的是原始对象本身。

```cpp
void modifyReference(int& ref) {
    ref = 30;  // 直接修改 a
}

int main() {
    int a = 10;
    
    modifyReference(a);

    std::cout << "a: " << a << std::endl;  // 输出 30

    return 0;
}
```

# 常量引用

常量引用用于保护原数据，防止通过引用修改内容，常用于函数参数，传递大对象时既高效又安全。

```cpp
void printMessage(const std::string& msg) { // 常量引用
    std::cout << "Message: " << msg << std::endl;
}

int main() {
    std::string message = "Hello, world!";
    printMessage(message); // 传递常量引用
    return 0;
}
```

# 数组引用

数组引用是指对一个数组的引用，和数组指针相同，就是将指针更换为了引用。

```cpp
void modifyWithPointer(int (*arr)[3]) {
    (*arr)[0] = 100;  // 修改第一个元素
}

void modifyWithReference(int (&arr)[3]) {
    arr[1] = 200;  // 修改第二个元素
}

int main() {
    int arr[3] = {1, 2, 3};

    modifyWithPointer(&arr);  // 传入数组指针
    modifyWithReference(arr); // 传入数组引用

    for (int i : arr) {
        cout << i << " ";
    }
    return 0;
}
```

# 范围循环引用

引用可以避免在范围循环中拷贝数据，提高效率。

```cpp
std::vector<int> nums = {1, 2, 3, 4, 5};

for (int& num : nums) { // 使用引用避免拷贝
    num *= 2; // 修改原数组
}

for (const int& num : nums) { // 常量引用，避免修改
    std::cout << num << " ";
}
std::cout << std::endl;
```

# 引用折叠

引用折叠主要用于模板编程和完美转发（perfect forwarding）场景。当涉及到对引用类型再次引用时，C++编译器会根据特定规则将多重引用"折叠"成单一引用。

C++ 允许引用的引用，参考下面的规则：

```
T& &   →   T&   (左值引用折叠)
T& &&  →   T&   (左值引用折叠)
T&& &  →   T&   (左值引用折叠)
T&& && →   T&&  (右值引用折叠)
```

```cpp
template <typename T>
void test(T&& param) {
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
    test(x);   // 传入左值
    test(10);  // 传入右值
    return 0;
}
```

```
T is lvalue reference
T is neither lvalue nor rvalue reference
```

- test(x) 传递的是左值，T 被推导为 int&，符合 T& & → T&。
- test(10) 传递的是右值，T 被推导为 int，没有引用折叠。

在 完美转发（Perfect Forwarding）中，引用折叠至关重要：

```cpp
void process(int& x) { std::cout << "Lvalue reference\n"; }
void process(int&& x) { std::cout << "Rvalue reference\n"; }

template <typename T>
void wrapper(T&& arg) {
    process(std::forward<T>(arg)); // 保持原始类型的转发
}

int main() {
    int x = 5;
    wrapper(x);   // 传递左值
    wrapper(10);  // 传递右值
    return 0;
}
```

```
Lvalue reference
Rvalue reference
```

- wrapper(x) 中 T 推导为 int&，`std::forward<T>(x)` 等价于 process(x)，调用 左值版本。
- wrapper(10) 中 T 推导为 int&&，`std::forward<T>(10)` 等价于 process(10)，调用 右值版本。

# 引用的本质

引用是通过指针实现的一个语法糖，本质上就是一个指针常量的封装，不能改变指针指向的地址，但可以通过指针修改指向的数据。引用在底层会直接与被引用对象的地址绑定，引用操作实际上是对指针的简化。编译器会将对引用的操作转换为对指针的解引用。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412072106240.png)

- 引用 和 指针常量最大的区别就是，引用不需要额外开辟一个指针的空间，和原变量共享地址。

在底层，编译器会将引用转换为指针操作：

```cpp
int a = 10;  // 原变量
int& ref = a; // 引用 ref 绑定到 a
ref = 20;    // 修改引用，实际上修改了 a
```

```cpp
int a = 10;
int* const ref = &a; // 引用实际上是一个指针常量
*ref = 20;           // 通过指针修改值
```

引用不占用额外内存的核心原因：

- 编译器直接将引用映射到原变量：
  - 引用没有独立的存储空间，它是被引用变量的别名。
  - 编译器在生成代码时，将引用的所有操作直接映射为对原变量的操作。
  - 引用的地址和被引用变量的地址完全相同。
- 编译器优化：
  - 在语法层面，引用看起来像一个新变量，但编译器会将它优化为对原变量的直接操作。
  - 编译器不会为引用分配新的存储空间，而是通过操作符重载或解引用机制直接操作原变量。

我们可以通过代码和内存地址的观察，验证引用不会占用额外的内存空间。

```cpp
int a = 10;
int& ref = a; // 引用绑定到 a

std::cout << "Address of a: " << &a << std::endl; // 0x7ffee79b0
std::cout << "Address of ref: " << &ref << std::endl; // 0x7ffee79b0
```

汇编代码验证：

```cpp
int a = 10;
int& ref = a; // 引用绑定到 a

ref = 20; // 修改引用，实际上修改了 a
std::cout << a << std::endl;
```

```
mov DWORD PTR [rsp-4], 10   ; 将 10 存储到 a 的内存位置
mov DWORD PTR [rsp-4], 20   ; 通过 ref 修改 a 的值为 20
```

- ref 的绑定仅在语义层面，编译器在实际代码中根本没有单独的 ref 存储。
- 对 ref 的操作直接被替换为对 a 的内存操作。

```cpp
void modify(int& ref) {
    ref = 42; // 修改引用
}

int main() {
    int a = 10;
    modify(a);

    std::cout << a << std::endl;

    return 0;
}
```

```
mov rdi, OFFSET FLAT:a     ; 将 a 的地址传递给函数
mov DWORD PTR [rdi], 42    ; 通过地址直接修改 a 的值
```

- ref 在底层被实现为指针。
- 函数参数传递的是变量 a 的地址，函数内部通过地址修改原变量的值。
- 无需为 ref 分配单独的内存。

引用在绑定数组时，同样不占用额外内存。

```cpp
int arr[3] = {1, 2, 3};
int(&ref)[3] = arr; // 引用绑定整个数组

ref[0] = 10; // 修改引用，实际上修改原数组
std::cout << arr[0] << std::endl;
```

- ref 是数组 arr 的引用。
- 编译器在底层直接将 ref 映射为对 arr 的访问。
- ref[0] 被直接优化为对 arr[0] 的访问。

即使是 const 引用，也不会占用额外的内存。

```cpp
void print(const int& ref) {
    std::cout << ref << std::endl;
}

int main() {
    int a = 10;
    print(a);

    return 0;
}
```

- ref 在函数中不会占用新的内存，编译器会将其实现为 a 的地址传递。
- 常量引用只是对原变量的只读访问权限的语法约束，不涉及额外的存储空间。

为什么引用比指针更高效？

- 引用在语法层面更加接近直接变量操作，避免了指针的解引用和取地址。
- 编译器可以在语法层面将引用优化为直接访问变量，而指针的间接性可能会降低优化效率。
- 引用绑定后无法更改，避免了指针可能为空或指向非法内存的情况。
