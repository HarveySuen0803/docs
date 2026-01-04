### Lambda

Lambda 表达式是 C++11 引入的一种功能强大的匿名函数机制，允许定义内联函数，可以捕获周围的变量（环境）。它增强了代码的灵活性和简洁性，尤其适用于回调、STL 算法和事件处理等场景。

```cpp
// 定义 Lambda 表达式
auto add = [](int a, int b) -> int {
    return a + b;
};

// 调用 Lambda 表达式
std::cout << "3 + 5 = " << add(3, 5) << std::endl;
```

如果 参数列表 () 为空，则可以 省略参数列表。

```cpp
auto lambda1 = [] { return ready; };  // 省略参数列表
auto lambda2 = []() { return ready; }; // 显式指定空参数列表

std::cout << "Lambda1: " << lambda1() << std::endl;
std::cout << "Lambda2: " << lambda2() << std::endl;
```

### 捕获变量

Lambda 表达式可以捕获外部作用域中的变量，通过值捕获或引用捕获来使用。

```cpp
int x = 10;

// 值捕获 x
auto lambda = [x]() {
    std::cout << "Inside Lambda: x = " << x << std::endl;
};

x = 20; // 修改外部变量
lambda(); // 输出捕获时的值

std::cout << "Outside Lambda: x = " << x << std::endl;
```

```cpp
int x = 10;

// 引用捕获 x
auto lambda = [&x]() {
    x += 5; // 修改外部变量
    std::cout << "Inside Lambda: x = " << x << std::endl;
};

lambda();
std::cout << "Outside Lambda: x = " << x << std::endl;
```

```cpp
int x = 10, y = 20;

// 捕获所有变量的值
auto lambda1 = [=]() {
    std::cout << "x + y = " << x + y << std::endl;
};

// 捕获所有变量的引用
auto lambda2 = [&]() {
    x += 5;
    y += 10;
};

lambda1();
lambda2();

std::cout << "x = " << x << ", y = " << y << std::endl;
```

默认情况下，值捕获的变量在 Lambda 中是只读的。如果需要修改值捕获的变量，可以使用 mutable 关键字。

```cpp
// 值捕获 + mutable
auto lambda = [x]() mutable {
    x += 5; // 修改捕获的变量
    std::cout << "Inside Lambda: x = " << x << std::endl;
};

lambda();
std::cout << "Outside Lambda: x = " << x << std::endl; // 外部 x 不受影响
```

### 返回类型

如果 Lambda 的函数体只有一条 return 语句，编译器会自动推断返回类型。

```cpp
auto add = [](int a, int b) {
    return a + b; // 返回类型由编译器推断为 int
};

std::cout << "3 + 5 = " << add(3, 5) << std::endl;
```

也可以显示指定返回类型

```cpp
auto divide = [](double a, double b) -> double { // 显式指定返回类型为 double
    if (b == 0) return 0.0;
    return a / b;
};

std::cout << "10 / 2 = " << divide(10, 2) << std::endl;
```