# 左值

左值是在程序运行期间有具体存储地址的对象，表示一个可寻址的实体。通常是变量、数组元素或某些返回引用的表达式。

- 左值表达式有明确的存储位置，可以通过地址访问。
- 左值可以被赋值，因此它可以出现在赋值操作的左侧（但不是所有左值都能修改，如 const 左值）。
- 左值通常是变量或数组元素，生命周期至少持续到其所在作用域结束。

```cpp
int x = 10;   // x 是左值，表示内存中的某个地址
x = 20;       // 左值可以出现在赋值操作符的左侧

int y = 30;   // y 是左值
int& ref = x; // ref 是一个左值引用

cout << x << endl;
cout << ref << endl; // ref 是左值，绑定到 x
```

左值表达式是产生左值的表达式。这些表达式可以表示一个明确的对象或存储位置，可以出现在赋值操作符的左侧。

int& 是左值引用，左值引用只能绑定到左值，而不能绑定到右值（如字面值 30 或表达式的结果），这是因为左值引用表示对变量的可修改访问，而右值（如 10）是临时的，不能被修改。

```cpp
int x = 30;
int& ref1 = x; // success
int& ref2 = 30; // failure
```

const int& 是一个常量左值引用，可以绑定到右值，编译器在这种情况下会创建一个临时变量，将右值 30 存储在其中，并将该临时变量的地址绑定到 const int& 引用上。

```cpp
const int& ref3 = 30; // success
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412151209277.png)

# 右值

右值是在程序运行时没有存储地址的临时值。右值通常是表达式的计算结果或字面值。

- 右值表示一个临时对象，不与内存地址绑定。
- 右值只能出现在赋值表达式的右侧（C++11 引入右值引用后，可绑定到 T&&）。
- 右值的生命周期较短，通常只存在于当前表达式中。

```cpp
int x = 10 + 20; // 10 和 20 是右值，表达式 10 + 20 的结果也是右值
cout << x << endl;

// 右值可以直接赋值给变量
int y = 42; // 42 是右值
cout << y << endl;
```

int&& 是右值引用，右值引用只能绑定到右值（如临时对象），可以通过右值引用直接操作右值，避免资源的浪费，右值引用可以延长右值的生命周期。

```cpp
int&& r = 10;      // r 是右值引用，绑定到右值 10
std::cout << r;    // 输出 10
```

右值引用无法直接绑定左值。如果需要绑定左值，需要显式使用 std::move 将左值转换为右值。

```cpp
int x = 10;
// int&& r1 = x;       // 错误：右值引用不能直接绑定左值
int&& r2 = std::move(x); // 正确：std::move 将左值 x 转为右值
```

右值通常会在表达式求值后销毁，但通过右值引用可以延长其生命周期。

```cpp
const std::string&& temp = "Hello, World!";
std::cout << temp; // 输出 "Hello, World!"，临时对象未销毁
```

右值引用的最重要用途是实现 移动语义，避免不必要的深拷贝。

```cpp
class MyVector {
public:
    std::vector<int> data;

    // 普通构造函数
    MyVector(size_t size) : data(size) {
        std::cout << "Constructed" << std::endl;
    }

    // 拷贝构造函数
    MyVector(const MyVector& other) : data(other.data) {
        std::cout << "Copied" << std::endl;
    }

    // 移动构造函数
    MyVector(MyVector&& other) noexcept : data(std::move(other.data)) {
        std::cout << "Moved" << std::endl;
    }
};

int main() {
    MyVector v1(10);       // 调用普通构造函数
    MyVector v2 = v1;      // 调用拷贝构造函数
    MyVector v3 = std::move(v1); // 调用移动构造函数
    return 0;
}
```

- 当 v2 = v1 时，调用拷贝构造函数，拷贝了 v1 的数据。
- 当 v3 = std::move(v1) 时，调用移动构造函数，转移了 v1 的数据，而不是拷贝，性能更高。
    - 可以理解 std::move(v1) 就是拿出 v1 指向的右值，而 v3 想要接受右值，就只能通过 MyVector&& other 这个右值引用。

右值引用在标准容器中用于高效插入临时对象，避免不必要的对象构造。

```cpp
std::vector<std::string> vec;

std::string temp = "Hello";
vec.push_back(temp);                // 调用拷贝构造
vec.push_back(std::move(temp));     // 调用移动构造

std::cout << "vec[0]: " << vec[0] << std::endl;
std::cout << "vec[1]: " << vec[1] << std::endl;
```

- push_back(temp) 拷贝了 temp 的内容。
- push_back(std::move(temp)) 直接转移了 temp 的资源到容器中，temp 的内容被“移动”。

右值引用可以用来显式地转移资源的所有权（如 FILE* 或操作系统资源句柄）从一个对象转移到另一个对象，避免不必要的资源拷贝和释放。

```cpp
class File {
public:
    // 默认构造函数
    File() : handle_(nullptr) {}

    // 打开文件的构造函数
    explicit File(const char* filename, const char* mode) {
        handle_ = std::fopen(filename, mode);
        if (handle_) {
            std::cout << "File opened: " << filename << std::endl;
        } else {
            std::cerr << "Failed to open file: " << filename << std::endl;
        }
    }

    // 禁用拷贝构造函数和拷贝赋值
    File(const File&) = delete;
    File& operator=(const File&) = delete;

    // 移动构造函数
    File(File&& other) noexcept : handle_(other.handle_) {
        other.handle_ = nullptr; // 清空原对象的句柄，转移所有权
        std::cout << "File moved" << std::endl;
    }

    // 移动赋值运算符
    File& operator=(File&& other) noexcept {
        if (this != &other) {
            close();              // 释放当前对象的资源
            handle_ = other.handle_;
            other.handle_ = nullptr; // 清空原对象的句柄，转移所有权
            std::cout << "File move-assigned" << std::endl;
        }
        return *this;
    }

    // 文件关闭函数
    void close() {
        if (handle_) {
            std::fclose(handle_);
            handle_ = nullptr;
            std::cout << "File closed" << std::endl;
        }
    }

    // 析构函数
    ~File() {
        close(); // 确保资源释放
    }

    // 检查文件句柄是否有效
    bool is_open() const { return handle_ != nullptr; }

private:
    FILE* handle_; // 文件句柄
};

int main() {
    // 创建并打开文件
    File f1("example.txt", "w");
    if (f1.is_open()) {
        std::cout << "File f1 is open" << std::endl;
    }

    // 转移文件句柄的所有权到 f2
    File f2 = std::move(f1); // f2 还没创建，并且接受到的是右值，所以调用移动构造函数
    if (!f1.is_open()) {
        std::cout << "File f1 is no longer open after move" << std::endl;
    }
    if (f2.is_open()) {
        std::cout << "File f2 is now open" << std::endl;
    }

    // 转移文件句柄的所有权到 f3
    File f3;
    f3 = std::move(f2); // f3 已经创建，并且接受到的是右值，所以调用移动赋值运算符
    if (!f2.is_open()) {
        std::cout << "File f2 is no longer open after move" << std::endl;
    }
    if (f3.is_open()) {
        std::cout << "File f3 is now open" << std::endl;
    }

    return 0;
}
```

```
File opened: example.txt
File f1 is open
File moved
File f1 is no longer open after move
File f2 is now open
File move-assigned
File f2 is no longer open after move
File f3 is now open
File closed
```

# 命名空间

命名空间（Namespace）是 C++ 中的一种用来组织代码和避免命名冲突的机制。它的主要作用是将名字（变量名、函数名、类名等）划分到不同的“空间”中，从而使得多个名字可以共存而不会冲突。

在一个项目中，可能会有很多开发者共同工作，同时也会用到不同的第三方库。这些库或开发者可能定义了一些同名的函数或变量。例如：

```cpp
#include <iostream>

void print() {
    std::cout << "This is my print function!" << std::endl;
}

int main() {
    print(); // 调用自己的 print 函数
    return 0;
}
```

现在，假设我们引入了一个第三方库，这个库里也有一个 print 函数。如果库没有使用命名空间，而直接定义了 print，就会引发命名冲突！此时，编译器无法确定你在 main 中调用的 print 函数是你自己的，还是来自第三方库的。

命名空间允许你将名字分组到不同的“空间”中。每个命名空间中的名字是独立的，即使名字相同，也不会冲突。

```cpp
namespace mynamespace {
    void print() {
        std::cout << "This is my print function!" << std::endl;
    }
}

namespace thirdparty {
    void print() {
        std::cout << "This is a print function from the third-party library!" << std::endl;
    }
}

int main() {
    mynamespace::print(); // 调用 mynamespace 中的 print 函数
    thirdparty::print();  // 调用 thirdparty 中的 print 函数
    return 0;
}
```

可以通过 using 引入单个成员，直接使用某个命名空间的特定成员，而不是每次都写命名空间。

```cpp
using std::cout; // 只引入 std::cout
using std::sqrt; // 只引入 std::sqrt

int main() {
    cout << "Square root of 16 is: " << sqrt(16) << std::endl;
    return 0;
}
```

可以通过 using 引入整个命名空间（尽量避免在大型项目中使用，以防止命名冲突）。

```cpp
using namespace std;

int main() {
    cout << "Using directive example" << endl;
    return 0;
}
```

前导的 :: 表示全局作用域，确保我们引用的是全局命名空间中的类型。

```cpp
// 在全局作用域中定义 UInt128 类型
struct UInt128 {
    // 定义细节...
};

namespace MyNamespace {
    // 如果在 MyNamespace 中有同名的类型，可能会引起混淆
    struct UInt128 {
        // 另一个定义...
    };

    // 这里我们使用全局作用域中的 UInt128，而不是 MyNamespace 中的 UInt128
    using GlobalUInt128 = ::UInt128;
}

int main() {
    // GlobalUInt128 指代全局定义的 UInt128
    GlobalUInt128 value;
    return 0;
}
```

# 匿名命名空间

匿名内部命名空间（Unnamed Namespace）是一种作用域限定机制，可以使定义在其中的变量、函数、类等仅在当前翻译单元（.cpp 文件）内部可见，类似于 static 作用域，避免全局作用域污染，防止符号名称冲突。

- 匿名命名空间是 static 的现代替代方案，作用类似，但适用于更多情况（如类、模板等）。

```cpp
namespace {
    int internal_var = 42;  // 仅在当前文件可见
    void internalFunction() {
        std::cout << "Hello from internal function!" << std::endl;
    }
}

static int internal_var = 42; // static 也有相同的作用
```

# 宏定义

宏定义是 C++ 中的一个预处理指令，用于定义一个标识符或表达式。这些宏在程序编译前会由预处理器替换为指定的值或代码片段。宏定义类似于文本替换，编译器并不会检查宏定义的语法正确性。

```cpp
#define PI 3.14159  // 定义圆周率
#define AREA(r) (PI * (r) * (r))  // 定义计算圆面积的宏

int main() {
    double radius = 5.0;
    cout << "Radius: " << radius << endl;
    cout << "Area: " << AREA(radius) << endl;  // 使用宏计算圆面积
    return 0;
}
```

宏可以用来简化代码中的重复内容：

```cpp
#define PRINT_HELLO cout << "Hello, World!" << endl;

int main() {
    PRINT_HELLO;  // 替换为：cout << "Hello, World!" << endl;
    return 0;
}
```

宏可以类似函数使用，但它的实现方式是直接文本替换，而不是通过函数调用。

```cpp
#define SQUARE(x) ((x) * (x))  // 宏定义
int square(int x) { return x * x; }  // 函数定义

int main() {
    int a = 5;
    cout << "Macro result: " << SQUARE(a) << endl;  // 使用宏
    cout << "Function result: " << square(a) << endl;  // 使用函数
    return 0;
}
```

宏是简单的文本替换，不会进行类型检查，可能导致意想不到的结果。

宏定义存在着诸多缺点：

- 无类型检查，可能导致错误
- 全局作用域，容易冲突
- 展开后代码难以调试

# 预处理指令

C++ 中的预处理指令（Preprocessor Directives）是以 # 开头的特殊指令，主要用于在代码被编译之前进行预处理。

`#include` 用于包含头文件，分为两种形式：

- `#include <file>`：用于标准库或系统头文件。
- `#include "file"`：用于用户定义的头文件。

```cpp
#include <iostream> // 包含标准库头文件
#include "my_header.h" // 包含用户头文件

int main() {
    std::cout << "This is a demonstration of #include!" << std::endl;
    return 0;
}
```

`#define` 和 `#undef` 用于处理宏定义。

```cpp
#define PI 3.14 // 定义一个常量宏
#define SQUARE(x) ((x) * (x)) // 定义一个带参数的宏

int main() {
    std::cout << "PI: " << PI << std::endl;
    std::cout << "Square of 5: " << SQUARE(5) << std::endl;

    #undef PI // 取消宏定义
    // std::cout << "PI: " << PI << std::endl; // 编译错误，PI 未定义

    return 0;
}
```

`#ifdef` 和 `#ifndef` 用于条件编译：

- `#ifdef`：当宏已定义时，编译其后的代码。
- `#ifndef`：当宏未定义时，编译其后的代码。

```cpp
#define DEBUG // 定义 DEBUG 宏

int main() {
    // 如果 DEBUG 被定义
    #ifdef DEBUG
        std::cout << "Debugging is enabled." << std::endl;
    #endif

    // 如果 RELEASE 没被定义
    #ifndef RELEASE
        std::cout << "Release mode is not enabled." << std::endl;
    #endif

    return 0;
}
```

```
Debugging is enabled.
Release mode is not enabled.
```

`#if`、`#elif`、`#else` 和 `#endif` 用于更复杂的条件判断，可以结合常量表达式和宏。

```cpp
#define VERSION 2

int main() {
    #if VERSION == 1
        std::cout << "Version 1" << std::endl;
    #elif VERSION == 2
        std::cout << "Version 2" << std::endl;
    #else
        std::cout << "Unknown version" << std::endl;
    #endif

    return 0;
}
```

`#pragma` 是编译器特定的指令，用于启用或禁用某些功能。

`#pragma once` 避免头文件重复包含。

```cpp
// 在头文件中
#pragma once
void myFunction();
```

`#pragma message` 在编译时生成消息。

```cpp
#pragma message("Compiling this file...")

int main() {
    return 0;
}
```

```
# Compilation Period Output ###

Compiling this file...
```

`#error` 在编译时生成错误并终止编译。

`#warning` 生成编译警告（某些编译器支持）。

# constexpr

constexpr 用于表示一个表达式或函数的值可以在编译时计算，它可以用来定义常量、函数或构造函数，使程序更加高效，同时提供编译时的类型检查。

constexpr 提供编译期计算能力，但编译器可能对非 constexpr 的代码也进行类似的优化。即使不用 constexpr，只要程序中出现常量表达式，编译器也可能在编译时优化。

## 编译期常量

```cpp
constexpr double PI = 3.14159;  // 定义一个常量

int main() {
    constexpr int radius = 5;  // 定义编译期常量
    constexpr double area = PI * radius * radius;  // 编译时计算

    cout << "Area: " << area << endl;
    return 0;
}
```

- PI 是一个 constexpr 常量，它的值在编译期已确定。
- 编译器会直接将 area 的值计算为 78.5398，提高了运行时效率。

## 编译期函数

```cpp
// 定义一个 constexpr 函数
constexpr int square(int x) {
    return x * x;
}

int main() {
    constexpr int value = 10;
    constexpr int result = square(value);  // 编译时计算

    cout << "Square of " << value << ": " << result << endl;

    int runtimeValue;
    cout << "Enter a number: ";
    cin >> runtimeValue;

    // 运行时调用
    cout << "Square of " << runtimeValue << ": " << square(runtimeValue) << endl;
    return 0;
}
```

- square 是一个 constexpr 函数，可以在编译时计算常量值。

constexpr 函数在编译期求值时，所有输入必须是常量，如果输入的是运行时数据，则会在运行时计算。

```cpp
constexpr int square(int x) {
    return x * x;
}

int runtimeValue = 5;
constexpr int result = square(10);  // 编译期计算
int runtimeResult = square(runtimeValue);  // 运行时计算
```

## 编译期对象

```cpp
class Circle {
    double radius;
public:
    constexpr Circle(double r) : radius(r) {}  // constexpr 构造函数

    constexpr double getArea() const {  // constexpr 成员函数
        return 3.14159 * radius * radius;
    }
};

int main() {
    constexpr Circle c(10.0);  // 编译期创建对象
    constexpr double area = c.getArea();  // 编译期计算面积

    cout << "Area: " << area << endl;

    Circle runtimeCircle(5.0);  // 运行时创建对象
    cout << "Area: " << runtimeCircle.getArea() << endl;  // 运行时计算面积

    return 0;
}
```

- Circle 类的构造函数和 getArea 成员函数都是 constexpr。
- 当 Circle 对象在编译时创建时，相关计算也会在编译期完成。
- 同一个 constexpr 函数在运行时仍然可以使用。

# inline

inline 用于建议编译器将函数的调用替换为函数体的代码，它的作用是减少函数调用的开销，特别是在频繁调用的小函数中。

```cpp
inline int add(int a, int b) {
    return a + b;
}

int main() {
    int x = 5, y = 10;
    cout << "Sum: " << add(x, y) << endl;  // 调用内联函数，编译器可能将这一行替换为 cout << "Sum: " << (x + y) << endl;
    return 0;
}
```

inline 是一个建议，编译器可能会忽略内联请求：

- 如果函数过于复杂，编译器可能选择不内联。
- 现代编译器（如 GCC、Clang）会根据函数的具体情况自动决定是否内联，无需明确标记。
- 递归函数一般不会被内联（因为递归次数在编译期不确定）。
- 代码较大的函数可能不会被内联（内联会导致可执行文件体积增加）。

inline 内联函数的定义需要出现在调用点之前，否则会导致链接错误，通常内联函数的实现放在头文件中。

# 头文件函数

```cpp
// main.cpp

#include <iostream>
#include "common.h"

int main() {
    sayHello("harvey");
    return 0;
}
```

```cpp
// common.h

#ifndef COMMON_H
#define COMMON_H

#include <iostream>
#include <string>

void sayHello(std::string name);

#endif
```

```cpp
// common.cpp

#include <iostream>
#include <string>
#include "common.h"

void sayHello(std::string name) {
    std::cout << "hello " << name << std::endl;
}
```

# 头文件保护

在声明头文件时，一般都会采用 `#ifndef` 和 `#define` 的组合，确保头文件的内容只会被编译一次。

```cpp
// common.h

#ifndef COMMON_H
#define COMMON_H

void sayHello();

#endif
```

假设没有采用头文件保护，并且结构是下面这样的，那么就会在编译时发生错误。

```
"a.cpp" include "common.h"
"b.cpp" include "common.h"
"main.cpp" include "a.cpp", "b.cpp" // main.cpp 重复导入了 common.h，报错提示 multiple definition of `sayHello`
```

# 静态变量

局部静态变量 和 全局静态变量 都是用 static 关键字修饰的，但它们在存储位置、作用域和使用场景上有所不同。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412041327573.png)

静态变量的初始化问题：

```cpp
void incrementCounter() {
    static int counter = 0; // 局部静态变量
    counter++;
    std::cout << "Counter: " << counter << std::endl;
}

int main() {
    incrementCounter(); // 第一次调用，初始化 counter 为 0
    incrementCounter(); // 第二次调用，counter 的值为 1
    incrementCounter(); // 第三次调用，counter 的值为 2
    return 0;
}
```

- counter 是局部静态变量，存储在全局区。
- 仅在第一次调用 incrementCounter 时初始化为 0，后续调用保留上次的值。

```cpp
static int globalCounter = 0;

void incrementGlobalCounter() {
    globalCounter++;
    std::cout << "Global Counter: " << globalCounter << std::endl;
}

int main() {
    incrementGlobalCounter(); // 全局变量加 1
    incrementGlobalCounter(); // 全局变量加 1
    return 0;
}
```

- globalCounter 是全局静态变量，存储在全局区，生命周期贯穿整个程序。
- 它的作用域仅限于当前文件（不可在其他文件中访问）。

# 代码块

花括号 {} 会创建一个新的作用域（scope）。在这个作用域内定义的变量或对象，作用范围仅限于这个块，超出块后就会被销毁。

```cpp
int main() {
    {
        int x = 10; // 变量 x 的作用域仅在这个块内
        std::cout << "Inside block: x = " << x << std::endl;
    }
    // x 超出了作用域，下面的代码会报错
    // std::cout << "Outside block: x = " << x << std::endl;

    return 0;
}
```

通过显式地使用 {}，可以控制某些对象的销毁时机。例如，智能指针或临时文件句柄在离开块时会被自动销毁。

```cpp
int main() {
    {
        std::ofstream file("example.txt");
        if (file.is_open()) {
            file << "Hello, World!" << std::endl;
            std::cout << "File written and closed within this block." << std::endl;
        }
    } // 离开块时，file 自动关闭

    std::cout << "Out of block, file is already closed." << std::endl;

    return 0;
}
```

在多线程编程中，使用 {} 可以更精确地控制互斥锁（std::mutex）的加锁和解锁范围。

```cpp
std::mutex mtx;

void thread_function() {
    {
        std::lock_guard<std::mutex> lock(mtx); // 锁的范围仅限于这个块
        std::cout << "Thread " << std::this_thread::get_id() << " is working." << std::endl;
    } // 离开块时，自动释放锁

    // 其他不需要锁的工作
    std::cout << "Thread " << std::this_thread::get_id() << " finished." << std::endl;
}

int main() {
    std::thread t1(thread_function);
    std::thread t2(thread_function);

    t1.join();
    t2.join();

    return 0;
}
```

在块内定义的 static 变量，其生命周期是整个程序运行期间，但作用域仅限于块内。

```cpp
void increment_counter() {
    static int counter = 0; // 静态变量只会初始化一次
    ++counter;
    std::cout << "Counter: " << counter << std::endl;
}

int main() {
    {
        increment_counter();
        increment_counter();
    }

    {
        increment_counter(); // 共享同一个静态变量
    }

    return 0;
}
```

```
Counter: 1
Counter: 2
Counter: 3
```

# 管道

管道是一种最常见的进程间通信（IPC）方式，用于父子进程或具有共同祖先的进程之间传递数据。管道由内核创建，提供一个缓冲区，用于进程间以字节流形式交换数据。

管道的特点：

- 单向通信：数据只能从管道的一端（写端）流向另一端（读端）。如果需要双向通信，需要创建两个管道。
- 进程相关性：管道通常由父进程创建，子进程通过继承使用。
- 内核管理：管道的缓冲区由内核维护，进程无法直接访问管道缓冲区。
- 同步机制：如果管道满，写操作会阻塞；如果管道为空，读操作会阻塞。

```c
int pipefd[2];  // 管道文件描述符
pipe(pipefd);   // 创建管道

pid_t pid = fork();  // 创建子进程

if (pid == 0) {
    // 子进程：读取数据
    close(pipefd[1]);  // 关闭写端
    char buffer[100];
    read(pipefd[0], buffer, sizeof(buffer));  // 从管道读数据
    printf("Child process received: %s\n", buffer);
    close(pipefd[0]);  // 关闭读端
} else if (pid > 0) {
    // 父进程：写入数据
    close(pipefd[0]);  // 关闭读端
    char message[] = "Hello from parent process!";
    write(pipefd[1], message, sizeof(message));  // 写数据到管道
    close(pipefd[1]);  // 关闭写端
}
```

```
Child process received: Hello from parent process!
```

- 父进程通过管道的写端发送消息，子进程通过读端接收消息。
- 不需要的管道端在两个进程中都被关闭，以确保通信单向性。
