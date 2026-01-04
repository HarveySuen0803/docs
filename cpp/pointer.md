# 指针

指针是一个变量，它存储另一个变量的内存地址，允许开发者直接操作内存，提供强大的灵活性和高效性。

```cpp
int a = 10;        // 定义一个变量
int* ptr = &a;     // 定义一个指针并存储 a 的地址

std::cout << "Value of a: " << a << std::endl;
std::cout << "Address of a: " << &a << std::endl;
std::cout << "Value of ptr: " << ptr << std::endl;
std::cout << "Value pointed by ptr: " << *ptr << std::endl;
```

数组的名称本质上是一个指针，指向数组的首地址。

```cpp
int arr[3] = {1, 2, 3};
int* ptr = arr; // 指针指向数组首元素

std::cout << "First element: " << *ptr << std::endl;
std::cout << "Second element: " << *(ptr + 1) << std::endl;
std::cout << "Third element: " << *(ptr + 2) << std::endl;
```

使用 new 动态分配内存，并用指针管理它。

```cpp
int* ptr = new int(42); // 动态分配一个整型内存

std::cout << "Value: " << *ptr << std::endl;

delete ptr; // 释放动态分配的内存
ptr = nullptr; // 避免悬垂指针
```

空指针是一个指向无效地址的指针，用于初始化未指向有效地址的指针。

```cpp
int* ptr = nullptr; // 初始化为空指针

if (ptr == nullptr) {
    std::cout << "Pointer is null." << std::endl;
}
```

未初始化的指针可能指向任意地址。

```cpp
int* ptr;
std::cout << *ptr << std::endl; // 未定义行为
```

# 空指针

nullptr 和 NULL 都用于表示空指针，但它们之间存在显著区别，特别是在现代 C++（C++11 及更高版本）中。以下是两者的详细对比：

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412041420406.png)

类型安全性，nullptr 只能用于指针，而 NULL 可以隐式转换为整数 0，可能导致不明确的行为。

```cpp
void func(int) {
    std::cout << "Called func(int)." << std::endl;
}

void func(int*) {
    std::cout << "Called func(int*)." << std::endl;
}

int main() {
    func(NULL);    // 调用 func(int)（因为 NULL 被解释为 0）
    func(nullptr); // 调用 func(int*)
    return 0;
}
```

# 野指针

野指针是指没有被初始化或指向无效内存区域的指针。使用野指针会导致未定义行为，如程序崩溃或意外输出。野指针是 C++ 编程中常见的错误之一，尤其在指针操作频繁的场景。

```cpp
void uninitializedPointer() {
    int* ptr; // 未初始化的指针
    std::cout << "Value of uninitialized pointer: " << ptr << std::endl;
    // 解引用未初始化的指针
    std::cout << "Dereferenced value: " << *ptr << std::endl; // 未定义行为
}
```

- ptr 未初始化，其值是内存中的随机地址。
- 解引用未初始化的指针访问了无效地址，可能导致程序崩溃。

```cpp
void danglingPointer() {
    int* ptr = new int(42); // 动态分配内存
    delete ptr;             // 释放内存
    std::cout << "Value after delete: " << *ptr << std::endl; // 未定义行为
}
```

- ptr 指向已释放的内存区域，但仍被访问。
- 此内存可能被系统回收或分配给其他程序，导致未定义行为。

# 常量指针

常量指针是指针指向的数据是常量，但指针本身可以改变，即指针可以指向不同的地址。

```cpp
const type* ptr; // 或 type const* ptr;
```

- type 是指针指向的数据类型。
- const 修饰 type，表示指针指向的数据是常量，不能通过指针修改

```cpp
int a = 10;
int b = 20;
const int* ptr = &a; // 常量指针，指向 a

std::cout << "Value pointed by ptr: " << *ptr << std::endl;

// *ptr = 15; // 错误，不能通过 ptr 修改 a 的值

ptr = &b; // 可以改变指针指向的地址
std::cout << "Value pointed by ptr: " << *ptr << std::endl;
```

- `const int* ptr` 表示 `*ptr` 是只读的，不能通过指针修改值。
- `ptr = &b` 是合法的，指针本身可以指向不同的地址。

# 指针常量

指针常量是指针本身是常量，不能改变指针指向的地址，但可以通过指针修改指向的数据。

```cpp
type* const ptr = address;
```

- type 是指针指向的数据类型。
- const 修饰指针本身，表示指针是常量，不能改变它的指向。

```cpp
int a = 10;
int b = 20;
int* const ptr = &a; // 指针常量，指向 a

std::cout << "Value pointed by ptr: " << *ptr << std::endl;

*ptr = 15; // 可以通过指针修改 a 的值
std::cout << "Updated value of a: " << a << std::endl;

// ptr = &b; // 错误，不能改变 ptr 的指向
```

- `int* const ptr` 表示 ptr 是常量，不能指向其他地址。
- `*ptr = 15` 是合法的，可以通过指针修改指向的数据。

# 常量指针常量

常量指针常量是一个指针既是常量指针又是指针常量，则既不能通过指针修改指向的数据，也不能改变指针本身的指向。

```cpp
const type* const ptr = address;
```

```cpp
int a = 10;
const int* const ptr = &a; // 常量指针+指针常量

std::cout << "Value pointed by ptr: " << *ptr << std::endl;

// *ptr = 15; // 错误，不能通过 ptr 修改值
// ptr = &b;  // 错误，不能修改 ptr 的指向
```

# 数组指针

数组指针是一个指针，它指向整个数组的首地址，而不是单个元素的地址。

```cpp
type (*pointer_name)[size];
```

```cpp
int arr[3] = {1, 2, 3};
int (*arrPtr)[3] = &arr; // 定义一个数组指针，指向 arr

// 使用数组指针访问数组
std::cout << "First element: " << (*arrPtr)[0] << std::endl;
std::cout << "Second element: " << (*arrPtr)[1] << std::endl;
```

- arrPtr 是一个数组指针，指向整个 arr 数组的首地址。
- 使用 `(*arrPtr)[i]` 访问数组元素。

虽然 数组指针 和 普通指针 看起来相似，但它们在功能和应用场景上是不同的。数组指针的复杂性是为了解决特定的问题，尤其是在处理多维数组、函数参数和复杂数据结构时，它提供了更精确的类型信息。

数组指针的主要目的是：

- 区分单个元素指针和整个数组指针：普通指针操作的是单个元素的地址，数组指针指向的是整个数组的首地址。
- 简化多维数组的操作：在多维数组的场景中，数组指针可以表示特定维度的子数组。
- 函数参数传递数组：数组指针明确传递的是数组的结构和维度，而不仅仅是一个指向首元素的普通指针。

普通指针无法表达数组的结构信息，仅仅是一个地址。如下例：

```cpp
void printArray(int* ptr) { // 接收普通指针
    for (int i = 0; i < 5; i++) {
        std::cout << ptr[i] << " ";
    }
    std::cout << std::endl;
}

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    printArray(arr); // 传递数组的首地址
    return 0;
}
```

- 函数 printArray 只知道 ptr 是一个指针，但不知道指针指向的数组长度。
- 如果数组维度或大小不匹配，程序可能出现问题。

数组指针可以传递数组的结构信息，让函数明确知道它接收的参数是一个特定大小的数组。

- 函数签名明确说明接收的是一个 5 个整数的数组。
- 减少了普通指针导致的数组信息丢失问题。

```cpp
void printArray(int (*arrPtr)[5]) { // 接收数组指针
    for (int i = 0; i < 5; i++) {
        std::cout << (*arrPtr)[i] << " ";
    }
    std::cout << std::endl;
}

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    printArray(&arr); // 传递数组指针
    return 0;
}
```

# 指针数组

指针数组是一个数组，其中每个元素都是一个指针，指向某种数据类型。

```cpp
type* array_name[size];
```

```cpp
int a = 10, b = 20, c = 30;
int* ptrArray[3] = {&a, &b, &c}; // 定义一个指针数组

// 通过指针数组访问变量
for (int i = 0; i < 3; i++) {
    std::cout << "Value pointed by ptrArray[" << i << "]: " << *ptrArray[i] << std::endl;
}
```

字符串指针数组：

```cpp
const char* fruits[] = {"Apple", "Banana", "Cherry"}; // 字符串指针数组

// 通过指针数组访问字符串
for (int i = 0; i < 3; i++) {
    std::cout << "Fruit " << i + 1 << ": " << fruits[i] << std::endl;
}
```

- fruits 是一个指针数组，每个元素指向一个字符串常量。
- 使用 fruits[i] 获取字符串地址。

更多的用法：

```cpp
void printStudentNames(Student** students, int size) {
    for (int i = 0; i < size; ++i) {
        // 通过指针访问
        cout << students[i]->getName() << endl;
        // 传递给 Student & 访问，通过 students[i] 拿到具体的指针，通过 &students[i] 传递具体指针指向的地址
        printName(*students[i])
    }
}

void printName(const Student & student) {
    cout << student.getName() << endl;
}

int main() {
    Student s1("Alice");
    Student s2("Bob");
    Student s3("Charlie");

    Student* students[] = { &s1, &s2, &s3 };
    int size = sizeof(students) / sizeof(students[0]);
    printStudentNames(students, size);

    return 0;
}
```

# 函数指针

函数指针是一个可以存储 函数地址 的指针，允许通过指针调用函数。函数指针提供了一种动态调用函数的机制，使得程序更加灵活，常用于回调机制、动态函数选择等场景。

```cpp
// 定义一个普通函数
int add(int a, int b) {
    return a + b;
}

int main() {
    // 定义函数指针
    int (*func_ptr)(int, int);

    // 将函数地址赋值给指针
    func_ptr = add;

    // 使用函数指针调用函数
    int result = func_ptr(3, 4);

    std::cout << "Result: " << result << std::endl;

    return 0;
}
```

函数指针可以存储在数组中，用于调用多个具有相同签名的函数。

```cpp
// 定义三个操作函数
int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }
int multiply(int a, int b) { return a * b; }

int main() {
    // 定义函数指针数组
    int (*operations[])(int, int) = {add, subtract, multiply};

    // 调用每个函数
    int x = 6, y = 2;
    std::cout << "Add: " << operations[0](x, y) << std::endl;
    std::cout << "Subtract: " << operations[1](x, y) << std::endl;
    std::cout << "Multiply: " << operations[2](x, y) << std::endl;

    return 0;
}
```

函数指针可以作为参数传递给其他函数，用于实现回调机制。

```cpp
// 回调函数
void performOperation(int a, int b, int (*operation)(int, int)) {
    std::cout << "Result: " << operation(a, b) << std::endl;
}

// 操作函数
int add(int a, int b) { return a + b; }
int multiply(int a, int b) { return a * b; }

int main() {
    // 使用回调机制
    performOperation(3, 4, add);       // 调用 add 函数
    performOperation(3, 4, multiply);  // 调用 multiply 函数

    return 0;
}
```

函数指针与动态分派。

```cpp

// 操作函数
int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }
int multiply(int a, int b) { return a * b; }

int main() {
    std::string op_name;
    int (*operation)(int, int) = nullptr;

    // 根据用户输入动态选择操作
    std::cout << "Enter operation (add, subtract, multiply): ";
    std::cin >> op_name;

    if (op_name == "add") {
        operation = add;
    } else if (op_name == "subtract") {
        operation = subtract;
    } else if (op_name == "multiply") {
        operation = multiply;
    }

    if (operation) {
        std::cout << "Result: " << operation(10, 5) << std::endl;
    } else {
        std::cout << "Invalid operation!" << std::endl;
    }

    return 0;
}
```

函数指针作为类的成员。

```cpp
class Calculator {
public:
    // 成员函数指针
    int (*operation)(int, int);

    Calculator(int (*op)(int, int)) : operation(op) {}

    int calculate(int a, int b) {
        return operation(a, b);
    }
};

// 操作函数
int add(int a, int b) { return a + b; }
int multiply(int a, int b) { return a * b; }

int main() {
    // 创建对象时指定函数指针
    Calculator calc(add);
    std::cout << "Add: " << calc.calculate(10, 5) << std::endl;

    calc.operation = multiply; // 动态更改函数指针
    std::cout << "Multiply: " << calc.calculate(10, 5) << std::endl;

    return 0;
}
```

# 通用指针

`void*` 是一种特殊的指针类型，称为 通用指针。它可以指向任何类型的数据，但不能直接解引用或进行指针运算。

- 可以存储任何类型对象的地址，不需要提前知道所指向的具体类型。
- 不带类型信息，不能直接解引用，必须先转换为具体类型。
- 适用于需要通用性的数据结构和函数，例如动态内存分配（malloc）、通用容器等。

`void*` 常用于定义通用函数参数，允许函数处理多种类型的数据。

```cpp
void printValue(void* data, char type) {
    if (type == 'i') { // 整数类型
        std::cout << *static_cast<int*>(data) << std::endl; // 先转换为具体类型，再解引用
    } else if (type == 'f') { // 浮点类型
        std::cout << *static_cast<float*>(data) << std::endl;
    } else if (type == 'c') { // 字符类型
        std::cout << *static_cast<char*>(data) << std::endl;
    }
}

int main() {
    int intVal = 42;
    float floatVal = 3.14f;
    char charVal = 'A';

    printValue(&intVal, 'i'); // 输出：42
    printValue(&floatVal, 'f'); // 输出：3.14
    printValue(&charVal, 'c'); // 输出：A

    return 0;
}
```

`void*` 可以与函数指针结合，传递自定义数据到线程或回调函数。

```cpp
void threadFunction(void* arg) {
    int* intPtr = static_cast<int*>(arg); // 转换为 int 指针
    std::cout << "Thread received value: " << *intPtr << std::endl;
}

int main() {
    int value = 100;
    std::thread t(threadFunction, &value);

    t.join(); // 等待线程结束
    return 0;
}
```

当函数需要返回分配的内存地址，但分配的内存类型可以多样时，可以使用 `void*` 作为返回值。

```cpp
void* allocateMemory(size_t size) {
    void* ptr = malloc(size); // 动态分配内存
    if (!ptr) {
        std::cerr << "Memory allocation failed!" << std::endl;
        return nullptr; // 分配失败返回空指针
    }
    return ptr; // 返回通用指针
}

int main() {
    // 为 int 类型分配内存
    int* intPtr = static_cast<int*>(allocateMemory(sizeof(int)));
    if (intPtr) {
        *intPtr = 42; // 使用分配的内存
        std::cout << "Value: " << *intPtr << std::endl; // 输出：Value: 42
        free(intPtr); // 释放内存
    }

    return 0;
}
```

在实现类似于工厂函数的接口时，`void*` 可以作为返回值，以适配多种不同的类型。

```cpp
struct ObjectA {
    void display() { std::cout << "This is ObjectA" << std::endl; }
};

struct ObjectB {
    void display() { std::cout << "This is ObjectB" << std::endl; }
};

void* createObject(char type) {
    if (type == 'A') {
        return new ObjectA(); // 返回 ObjectA 的指针
    } else if (type == 'B') {
        return new ObjectB(); // 返回 ObjectB 的指针
    }
    return nullptr; // 未知类型返回空指针
}

int main() {
    void* objA = createObject('A');
    void* objB = createObject('B');

    if (objA) {
        static_cast<ObjectA*>(objA)->display(); // 输出：This is ObjectA
        delete static_cast<ObjectA*>(objA);    // 释放内存
    }

    if (objB) {
        static_cast<ObjectB*>(objB)->display(); // 输出：This is ObjectB
        delete static_cast<ObjectB*>(objB);    // 释放内存
    }

    return 0;
}
```

# std::unique_ptr

std::unique_ptr 是一个独占所有权的智能指针，确保某块内存只有一个指针拥有，生命周期由这个指针控制。

- 不可复制，但可以转移所有权，自动释放资源。

```cpp
class MyClass {
public:
    MyClass() { std::cout << "MyClass Constructor" << std::endl; }
    ~MyClass() { std::cout << "MyClass Destructor" << std::endl; }
    void sayHello() { std::cout << "Hello from MyClass!" << std::endl; }
};

int main() {
    std::unique_ptr<MyClass> ptr1 = std::make_unique<MyClass>(); // 创建智能指针
    ptr1->sayHello();

    // std::unique_ptr<MyClass> ptr2 = ptr1; // 错误：unique_ptr 不支持复制

    std::unique_ptr<MyClass> ptr2 = std::move(ptr1); // 转移所有权
    if (!ptr1) {
        std::cout << "ptr1 is now nullptr" << std::endl;
    }
    ptr2->sayHello();

    return 0; // 离开作用域时，ptr2 自动释放内存
}
```

# std::shared_ptr

std::shared_ptr 是一种共享所有权的智能指针，可以被多个指针共享同一块内存，内部使用共享引用计数 use_count 管理资源，当最后一个 shared_ptr 被销毁时，释放内存。

每个由 std::shared_ptr 或 std::weak_ptr 管理的对象，都有一个控制块，用来跟踪引用计数和对象的状态。控制块包含以下信息：

- use_count 共享引用计数器：跟踪当前有多少个 std::shared_ptr 共享同一个对象，当 use_count == 0 时，托管对象会被销毁。
- weak_count 弱引用计数器：跟踪当前有多少个 std::weak_ptr 引用控制块，控制块本身的生命周期由 use_count 和 weak_count 共同决定，当 use_count == 0 且 weak_count == 0 时，控制块会被销毁。
- 托管对象指针：存储了指向托管对象的原生指针，std::shared_ptr 和 std::weak_ptr 通过这个指针访问对象。

```cpp
class MyClass {
public:
    MyClass() { std::cout << "MyClass Constructor" << std::endl; }
    ~MyClass() { std::cout << "MyClass Destructor" << std::endl; }
};

int main() {
    std::shared_ptr<MyClass> ptr1 = std::make_shared<MyClass>(); // 创建 shared_ptr
    std::shared_ptr<MyClass> ptr2 = ptr1; // 共享所有权

    std::cout << "Use count: " << ptr1.use_count() << std::endl; // 引用计数为 2

    ptr1.reset(); // ptr1 放弃所有权
    std::cout << "Use count after ptr1.reset(): " << ptr2.use_count() << std::endl;

    return 0; // 离开作用域时，ptr2 释放内存
}
```

---

**示例：数据结构中共享节点**

std::shared_ptr 常用于图或链表等数据结构中，多个节点可能共享相同的子节点。

```cpp
class Node {
public:
    int value;
    std::vector<std::shared_ptr<Node>> children;

    Node(int val) : value(val) { std::cout << "Node created: " << val << "\n"; }
    ~Node() { std::cout << "Node destroyed: " << value << "\n"; }
};

int main() {
    auto root = std::make_shared<Node>(1);
    auto child1 = std::make_shared<Node>(2);
    auto child2 = std::make_shared<Node>(3);

    root->children.push_back(child1);
    root->children.push_back(child2);

    // child1 和 child2 也可以单独使用
    std::cout << "Root's children count: " << root->children.size() << "\n";
    return 0; // 所有节点在这里被释放
}
```

---

**示例：工厂模式和多模块共享**

当对象由一个工厂函数创建，并在多个模块中共享时，std::shared_ptr 是理想选择。

```cpp
class Resource {
public:
    Resource() { std::cout << "Resource acquired\n"; }
    ~Resource() { std::cout << "Resource released\n"; }
};

std::shared_ptr<Resource> createResource() {
    return std::make_shared<Resource>();
}

int main() {
    auto resource1 = createResource();
    auto resource2 = resource1; // 共享同一资源

    std::cout << "Use count: " << resource1.use_count() << "\n"; // 引用计数
    return 0;
}
```

# std::weak_ptr

std::weak_ptr 是一种弱引用指针，它不增加共享引用计数 use_count，通常用来解决 shared_ptr 循环引用 的问题。

- 不管理资源，只能通过 lock() 方法获取 shared_ptr，常用于观察者模式或打破循环引用。

```cpp
class Node {
public:
    std::shared_ptr<Node> next; // 循环引用
    std::weak_ptr<Node> prev;   // 弱引用，避免循环引用

    ~Node() { std::cout << "Node Destructor" << std::endl; }
};

int main() {
    std::shared_ptr<Node> node1 = std::make_shared<Node>();
    std::shared_ptr<Node> node2 = std::make_shared<Node>();

    node1->next = node2;       // node1 指向 node2
    node2->prev = node1;       // node2 弱引用 node1

    return 0; // 离开作用域时，内存正常释放
}
```

---

**示例：解决循环引用问题**

```cpp
class A;
class B;

class A {
public:
    std::shared_ptr<B> b_ptr; // 循环引用
    ~A() { std::cout << "A Destructor" << std::endl; }
};

class B {
public:
    std::shared_ptr<A> a_ptr; // 循环引用
    ~B() { std::cout << "B Destructor" << std::endl; }
};

int main() {
    std::shared_ptr<A> a = std::make_shared<A>();
    std::shared_ptr<B> b = std::make_shared<B>();

    a->b_ptr = b;
    b->a_ptr = a;

    return 0; // 循环引用导致内存泄漏，将 A 或 B 其中一个引用换成 std::weak_ptr 即可解决问题
}
```

# std::enable_shared_from_this

std::enable_shared_from_this 是 C++ 标准库中提供的一个辅助模板类，用于使一个对象能够安全地生成一个指向自身的 std::shared_ptr。这在某些场景中非常有用，比如你希望在类的成员函数中获取一个共享指针，确保对象在后续使用中不会被意外销毁。

```cpp
class MyClass : public std::enable_shared_from_this<MyClass> {
public:
    // 一个成员函数，用于获取指向自身的 shared_ptr
    std::shared_ptr<MyClass> getShared() {
        // 返回一个共享指针，与管理该对象的 shared_ptr 共用相同的引用计数
        return shared_from_this();
    }

    void sayHello() {
        std::cout << "Hello from MyClass!" << std::endl;
    }
};

int main() {
    // 正确的方式：通过 std::make_shared 创建对象，此时对象由 shared_ptr 管理
    std::shared_ptr<MyClass> obj = std::make_shared<MyClass>();

    // 在成员函数内部通过 shared_from_this 获取一个新的 shared_ptr
    std::shared_ptr<MyClass> objShared = obj->getShared();

    // 两个 shared_ptr 指向相同的对象，并共享引用计数
    std::cout << "obj.use_count() = " << obj.use_count() << std::endl; // 输出 2
    std::cout << "objShared.use_count() = " << objShared.use_count() << std::endl; // 同样输出 2

    // 调用对象的成员函数
    objShared->sayHello();

    return 0;
}
```

如果对象没有由 std::shared_ptr 管理，那么调用 shared_from_this() 会导致未定义行为。

```cpp
MyClass obj; // 对象在栈上创建
// 下面调用将导致错误，因为 obj 没有被 std::shared_ptr 管理
std::shared_ptr<MyClass> ptr = obj.getShared();
```

下面这段代码中，Worder 对象内部开启了一个异步线程去执行任务，而该异步线程需要访问 Worder 对象的程序，自然希望延长 Worker 的生命周期，防止外部断开了对 Worker 的引用导致意外销毁。

通过 `std::shared_ptr<Worker> self = shared_from_this();` 实现对 Worker 对象的引用，同时增加了引用计数。不能直接使用 `std::shared_ptr<Worker> self = this`，因为 this 是一个裸指针，这个操作只是新建了一个控制块，引用计数始终为 1。

```cpp
class Worker : public std::enable_shared_from_this<Worker> {
public:
    void doWork() {
        // 启动一个异步线程，并传递 shared_ptr 给 lambda 表达式
        std::shared_ptr<Worker> self = shared_from_this();
        std::thread([self]() {
            // 模拟长时间操作
            std::this_thread::sleep_for(std::chrono::seconds(2));
            std::cout << "Worker completed work." << std::endl;
        }).detach();
    }
};

int main() {
    {
        std::shared_ptr<Worker> worker = std::make_shared<Worker>();
        worker->doWork();
    } // 此处 worker 超出作用域，引用计数减少，但是异步线程也持有了当前对象的 std::shared_ptr，所以当前对象不会销毁

    // 主线程等待，确保异步任务有足够时间完成
    std::this_thread::sleep_for(std::chrono::seconds(3));
    return 0;
}
```

# std::is_pointer_v

std::is_pointer_v 用于在编译期判断一个类型是否是指针类型。

```cpp
std::cout << std::boolalpha;

std::cout << "int: " << std::is_pointer_v<int> << "\n";               // false
std::cout << "int*: " << std::is_pointer_v<int*> << "\n";             // true
std::cout << "double*: " << std::is_pointer_v<double*> << "\n";       // true
std::cout << "int**: " << std::is_pointer_v<int**> << "\n";           // true
std::cout << "int&: " << std::is_pointer_v<int&> << "\n";             // false

std::cout << "const int*: " << std::is_pointer_v<const int*> << "\n";          // true
std::cout << "int* const: " << std::is_pointer_v<int* const> << "\n";          // true
std::cout << "const int&: " << std::is_pointer_v<const int&> << "\n";          // false

// std::is_pointer_v 是 std::is_pointer<T>::value 的简写形式
std::cout << "int: " << std::is_pointer<int>::value << "\n";         // false
std::cout << "int*: " << std::is_pointer<int*>::value << "\n";       // true
std::cout << "double**: " << std::is_pointer<double**>::value << "\n"; // true
std::cout << "int&: " << std::is_pointer<int&>::value << "\n";       // false
```

# std::remove_pointer_t

std::remove_pointer_t 用于移除目标类型最外层的指针，如果目标类型不是指针类型，则原样返回。

```cpp
using T1 = std::remove_pointer_t<int*>;      // int
using T2 = std::remove_pointer_t<int**>;     // int*
using T3 = std::remove_pointer_t<double*>;   // double
using T4 = std::remove_pointer_t<int>;       // int (无变化)

std::cout << std::boolalpha;
std::cout << "is int: " << std::is_same<T1, int>::value << "\n";         // true
std::cout << "is int*: " << std::is_same<T2, int*>::value << "\n";       // true
std::cout << "is double: " << std::is_same<T3, double>::value << "\n";   // true
std::cout << "is int (unchanged): " << std::is_same<T4, int>::value << "\n"; // true
```

# 指针问题

## Lambda 捕获外部变量不当导致的问题

```cpp
std::vector<std::function<void()>> tasks;

{   // 创建一个作用域
    auto ptr = std::make_shared<Resource>(42);
    std::cout << "Before adding lambda, use_count: " << ptr.use_count() << std::endl;

    // 错误方式：通过引用捕获
    tasks.emplace_back([&ptr]() {
        std::cout << "Trying to access value: " << ptr->getValue() << std::endl;
    });

    std::cout << "After adding lambda, use_count: " << ptr.use_count() << std::endl;
}   // ptr 在这里被销毁

std::cout << "Executing stored task..." << std::endl;
// 危险！这将访问已经被销毁的对象
tasks[0]();  // 这里会崩溃或产生未定义行为
```

- lambda 通过引用捕获了外部的共享指针 ptr，代码块结束后会销毁该共享指针，lambda 内部的 ptr 会变成一个悬垂引用，从而导致未定义行为。

```cpp
std::vector<std::function<void()>> tasks;

{   // 创建一个作用域
    auto ptr = std::make_shared<Resource>(42);
    std::cout << "Before adding lambda, use_count: " << ptr.use_count() << std::endl;

    // 正确方式：通过值捕获
    tasks.emplace_back([ptr]() {
        std::cout << "Safely accessing value: " << ptr->getValue() << std::endl;
    });

    std::cout << "After adding lambda, use_count: " << ptr.use_count() << std::endl;
}   // 原始的 ptr 在这里被销毁，但 lambda 中的副本仍然有效

std::cout << "Executing stored task..." << std::endl;
tasks[0]();  // 安全！lambda持有了ptr的一份拷贝
```

- lambda 通过值获取了外部的共享指针 ptr，调用的是 ptr 的拷贝构造，同时增加了 use_count，避免出现悬垂问题。

## Double Delete

下面这段代码中，raw 为指向 Foo 对象的裸指针，sp1 和 sp2 都是基于 raw 创建了一份独立的控制块，尽管 raw 被引用了两份，但是对于 sp1 和 sp2 都以为只引用了一份。

当 sp1 断开了对 raw 的引用后，会认为没有其他指针引用该对象，就会立刻执行析构，此时 sp2 就是指向了一块非法内存，任何操作，包括析构都会导致程序崩溃。

```cpp
struct Foo {
    Foo() { std::cout << "Foo constructed\n"; }
    ~Foo() { std::cout << "Foo destroyed\n"; }
    void print() { std::cout << "Hello\n"; }
};

int main() {
    auto sp1 = std::make_shared<Foo>();
    Foo* raw = sp1.get(); // 获取裸指针

    // ❌ 错误：直接用裸指针创建新的 shared_ptr
    std::shared_ptr<Foo> sp2(raw);

    std::cout << "sp1.use_count(): " << sp1.use_count() << "\n";
    std::cout << "sp2.use_count(): " << sp2.use_count() << "\n";

    return 0;
}
```

```
Foo constructed
sp1.use_count(): 1
sp2.use_count(): 1
Foo destroyed
Foo destroyed   <-- double delete
```

下面这段代码，共享已有的 shared_ptr，而不是基于裸指针新建 shared_ptr 才是正确的做法，此时 sp1 和 sp2 都知道引用了两份，不会导致 double delete。

```cpp
struct Foo {
    Foo() { std::cout << "Foo constructed\n"; }
    ~Foo() { std::cout << "Foo destroyed\n"; }
    void print() { std::cout << "Hello\n"; }
};

int main() {
    auto sp1 = std::make_shared<Foo>();

    // ✅ 正确：直接复制已有的 shared_ptr，共享控制块
    std::shared_ptr<Foo> sp2 = sp1;

    std::cout << "sp1.use_count(): " << sp1.use_count() << "\n";
    std::cout << "sp2.use_count(): " << sp2.use_count() << "\n";

    return 0;
}
```