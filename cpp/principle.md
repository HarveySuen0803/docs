# 构建流程

C++ 从源代码到机器可执行文件的整个构建流程通常包括以下几个阶段：

- 预处理（Preprocessing）
- 编译（Compilation）
- 汇编（Assembly）
- 链接（Linking）

```
源代码 --> 预处理器 --> 编译器 --> 汇编器 --> 链接器 --> 可执行文件
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412081337654.png)

## 预处理

预处理器处理所有以 # 开头的指令（例如 `#include`, `#define`, `#ifdef`），将所有包含的头文件内容插入到源文件中，处理宏替换和条件编译。预处理的结果是一个“纯粹的 C++ 源代码”（main.i），大致如下：

```shell
g++ -E main.cpp -o main.i
```

```cpp
// 从 <iostream> 和 "Math.h" 中插入的内容（内容被展开）
// 假设 <iostream> 中有很多系统级代码...

class Math {
public:
    static int add(int a, int b);
    static int multiply(int a, int b);
};

int main() {
    int sum = Math::add(3, 4);
    int product = Math::multiply(3, 4);

    std::cout << "Sum: " << sum << std::endl;
    std::cout << "Product: " << product << std::endl;

    return 0;
}
```

## 编译

编译器将预处理后的代码（main.i）翻译为汇编代码。语法检查、类型检查和优化会在此阶段完成。编译后将输出一个汇编代码文件（main.s），大致如下：

```shell
g++ -S main.i -o main.s
```

```cpp
.section .rodata
.LC0:
    .string "Sum: %d\n"
.LC1:
    .string "Product: %d\n"

.text
.globl main
main:
    pushq   %rbp
    movq    %rsp, %rbp
    subq    $16, %rsp
    movl    $3, -4(%rbp)
    movl    $4, -8(%rbp)
    movl    -4(%rbp), %edi
    movl    -8(%rbp), %esi
    call    _ZN4Math3addEii
    movl    %eax, -12(%rbp)
    ...
```

## 汇编

汇编器将汇编代码翻译为机器代码，输出一个目标文件（main.o），包含机器指令，但尚未完成链接。可以采用 objdump 查看，大致内容如下：

```shell
g++ -c main.s -o main.o
```

```cpp
0000000000000000 <main>:
   0:   55                      push   %rbp
   1:   48 89 e5                mov    %rsp,%rbp
   4:   48 83 ec 10             sub    $0x10,%rsp
   ...
```

- 此时，main.o 包含二进制的机器指令，但函数 Math::add 和 Math::multiply 的地址还未解析。

## 链接

链接器解析外部符号，将多个目标文件（main.o 和 Math.o）结合起来，解析不同目标文件之间的符号引用（如 Math::add，Math::multiply），生成最终的可执行文件（main）或者共享库。

- 符号解析：将每个目标文件中未定义（外部引用）的符号与其他目标文件或库中相应的定义匹配。
- 重定位：调整目标文件中代码和数据的地址，以便在可执行文件中正确运行。
- 符号合并：将重复的符号（例如内联函数、模板实例化等）合并，生成唯一的符号。

```shell
g++ main.o Math.o -o main
```

## 运行

可执行文件运行时，操作系统会将程序加载到内存中，初始化栈、堆和全局变量，调用 main 函数。

# 内存分区

C++ 的内存分区是指程序运行时内存的组织方式，通常分为以下几个主要区域：

- 代码区（Text Segment）
- 全局区（Global Segment 或 Data Segment）
- 栈区（Stack Segment）
- 堆区（Heap Segment）

内存分区示意图：

```
+--------------------+
|   栈区（Stack）      |  <--- 高地址
+--------------------+
|       空间          |  动态变化
+--------------------+
|   堆区（Heap）       |
+--------------------+
|  全局/静态区（Global）|
|  - 已初始化数据段     |
|  - 未初始化数据段     |
|  - 常量区           |
+--------------------+
|   代码区（Code）     |  <--- 低地址
+--------------------+
```

## 代码区

代码区是程序运行时内存的一部分，用于存储程序编译后的可执行机器指令。它是只读的，主要为了：

- 存储程序的指令：包括函数、方法和其他可执行的代码。
- 防止指令被修改：代码区通常是只读的，防止程序运行期间因误操作或恶意修改导致指令被改变。
- 共享性：对于多线程或多进程程序，代码区可以被多个进程共享，以节省内存资源。

以下是关于代码区的详细示例，结合 C++ 的运行情况进行说明：

```cpp
#include <iostream>

void sayHello() {
    std::cout << "Hello, world!" << std::endl;
}

void sayGoodbye() {
    std::cout << "Goodbye, world!" << std::endl;
}

int main() {
    sayHello();
    sayGoodbye();
    return 0;
}
```

- sayHello 函数的机器指令存储在代码区。
- sayGoodbye 函数的机器指令也存储在代码区。

通过打印函数的地址可以验证它们在代码区中的位置：

```cpp
#include <iostream>

void sayHello() {
    std::cout << "Hello, world!" << std::endl;
}

void sayGoodbye() {
    std::cout << "Goodbye, world!" << std::endl;
}

int main() {
    std::cout << "Address of sayHello: " << (void*)sayHello << std::endl;
    std::cout << "Address of sayGoodbye: " << (void*)sayGoodbye << std::endl;

    sayHello();
    sayGoodbye();
    return 0;
}
```

```
Address of sayHello: 0x105b0f5e0
Address of sayGoodbye: 0x105b0f620
Hello, world!
Goodbye, world!
```

- sayHello 和 sayGoodbye 的地址是它们在代码区的起始地址。
- 不同的函数会分配到代码区的不同位置。

尝试修改代码区内容会引发错误。以下示例说明这种情况：

```cpp
#include <iostream>

void sayHello() {
    std::cout << "Hello, world!" << std::endl;
}

int main() {
    void* funcPtr = (void*)sayHello;
    std::cout << "Address of sayHello: " << funcPtr << std::endl;

    // 尝试直接修改代码区内容（可能导致崩溃或错误）
    char* code = (char*)funcPtr;
    code[0] = 0x90; // 尝试修改代码段

    sayHello();
    return 0;
}
```

```
Segmentation fault (core dumped)
```

- sayHello 函数存储在代码区，代码区是只读的，试图修改会触发访问权限错误。

通过 fork() 创建子进程，可以观察到父进程和子进程共享同一代码区：

```cpp
#include <iostream>
#include <unistd.h>

void sayHello() {
    std::cout << "Hello from process " << getpid() << std::endl;
}

int main() {
    pid_t pid = fork();

    if (pid == 0) {
        // 子进程
        sayHello();
    } else if (pid > 0) {
        // 父进程
        sayHello();
    }

    return 0;

```

```
Hello from process 12345
Hello from process 12346
```

- 父进程和子进程共享 sayHello 的代码指令，代码区不会被复制。

线程在调用函数时，函数的代码始终存储在代码区（Text Segment），不会移动到栈中。栈用于存储函数调用的相关信息（例如：函数的返回地址，局部变量，函数的参数等）。

函数的机器指令会始终留在代码区中。调用函数时，程序通过跳转指令（例如 call 或 jmp）去执行代码区中对应的机器指令。

## 全局区

全局区是内存分区中的一部分，用于存储全局变量、静态变量和常量等数据。它贯穿程序的整个运行周期，由操作系统在程序启动时分配，并在程序结束时释放。

全局区又可以细分为以下几个子区域：

- 已初始化数据区（.data segment）：存储已初始化的全局变量和静态变量。
- 未初始化数据区（.bss segment）：存储未初始化的全局变量和静态变量，默认为零。
- 常量区：存储程序中的常量，包括字符串字面值和用 const 修饰的全局变量。

```cpp
int globalVar = 10; // 全局变量，已初始化，存储在已初始化数据区（.data）
int uninitializedVar; // 全局变量，未初始化，存储在未初始化数据区（.bss）
const int globalConst = 100; // 全局常量，已初始化，存储在常量区（可能与 .rodata 合并）

void displayAddresses() {
    static int staticVar = 20;  // 静态变量
    std::cout << "Address of globalVar: " << &globalVar << std::endl;
    std::cout << "Address of uninitializedVar: " << &uninitializedVar << std::endl;
    std::cout << "Address of staticVar: " << &staticVar << std::endl;
    std::cout << "Address of globalConst: " << &globalConst << std::endl;
}
```

```
Address of globalVar: 0x601040
Address of uninitializedVar: 0x601044
Address of staticVar: 0x601048
Address of globalConst: 0x60104C
```

- 全局变量、静态变量和常量的地址通常在全局区内连续分布。

全局区的特点：

- 数据生命周期：全局区中的数据从程序启动时分配，直到程序退出才被释放，生命周期贯穿整个程序运行。
- 全局可访问性：全局变量和静态变量在所有函数中都可访问（但作用域受限于声明位置）。
- 默认值：未初始化的全局和静态变量默认初始化为零。
- 线程安全：全局变量通常不是线程安全的，需注意多线程程序中的数据访问问题。

## 堆区

堆区是 C++ 中用来存储动态分配内存的区域，程序运行时由程序员显式分配和释放内存（如 new 和 delete）。堆区内存的大小和生命周期由程序员控制，适用于需要灵活管理内存的数据结构，如动态数组、链表和对象。

堆区的特点：

- 动态分配内存：使用 new 或 malloc 显式分配内存，使用 delete 或 free 释放内存。
- 存储位置：堆区位于内存的高地址部分，与栈区分开。地址通常由操作系统或运行时库分配。
- 生命周期：堆区内存在显式释放前一直存在，与变量作用域无关，忘记释放会导致 内存泄漏，多次释放会导致 未定义行为。
- 灵活性：堆区适合存储大小不确定或需要动态调整的结构（如动态数组）。

```cpp
void heapExample() {
    int* heapVar = new int(42); // 动态分配一个整型变量
    std::cout << "Value of heapVar: " << *heapVar << std::endl;
    std::cout << "Address of heapVar: " << heapVar << std::endl;
    
    delete heapVar; // 释放动态分配的内存
}
```

```cpp
void heapExample() {
    int size = 5;
    int* heapArray = new int[size]; // 动态分配一个数组
    
    // 初始化数组
    for (int i = 0; i < size; i++) {
        heapArray[i] = i * 10;
    }
    
    // 输出数组内容
    for (int i = 0; i < size; i++) {
        std::cout << "heapArray[" << i << "] = " << heapArray[i] << std::endl;
    }
    
    delete[] heapArray; // 释放动态数组内存
}
```

```cpp
void heapExample() {
    Person* person = new Person("Alice", 25); // 动态分配对象
    person->display();
    
    delete person; // 释放对象内存
}
```

## 栈区

栈区是程序运行时用于存储临时数据的一部分内存区域。它由编译器自动管理，主要用于存储局部变量、函数参数、返回地址以及部分中间计算结果。

栈区的特点：

- 自动分配与释放：栈区内存由编译器自动分配和回收，开发者无需手动管理。
- 高效性：栈区基于栈指针的增减操作，分配和释放速度非常快。
- 存储内容：局部变量、函数参数、返回地址。
- 存储限制：栈的大小通常有限（例如几 MB），递归过深或过大局部变量可能导致栈溢出。
- 生命周期：数据生命周期与作用域一致，超出作用域即释放内存。
- 增长方向：在大多数系统中，栈区内存从高地址向低地址增长（具体依赖于架构）。

```cpp
void stackExample() {
    int localVar = 42;    // 局部变量，存储在栈区
    int anotherVar = 84;  // 另一个局部变量，存储在栈区
    std::cout << "Address of localVar: " << &localVar << std::endl;
    std::cout << "Address of anotherVar: " << &anotherVar << std::endl;
}
```

栈区数据在函数返回后会被销毁，如果返回指向栈区数据的指针，会导致指针失效。

```cpp
int* invalidPointer() {
    int localVar = 42; // 局部变量，存储在栈区
    return &localVar;  // 返回栈区变量地址
}

int main() {
    int* ptr = invalidPointer();
    std::cout << "Dereferenced value: " << *ptr << std::endl; // 未定义行为
    return 0;
}
```

- 输出值可能是随机值或程序崩溃。
- 应该使用堆区分配内存返回数据，或返回值而非指针。

# 内存数据残留

内存数据残留是指当程序释放或覆盖内存区域时，内存中原有的数据仍可能存在，直到被其他数据覆盖。这种问题可能导致安全隐患（如数据泄露）或意外行为（如使用未初始化变量或未正确清空的内存）。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412041404954.png)

通过初始化变量、合理管理内存和使用工具检测，可以有效减少内存数据残留问题的风险。

---

**未初始化变量**

未初始化变量，栈区或堆区分配的变量在初始化前可能包含随机数据。

```cpp
void uninitializedVariable() {
    int a; // a 是栈区变量，未被初始化时，其内容是栈中遗留的数据。
    std::cout << "Value of uninitialized a: " << a << std::endl;
}
```

---

**悬垂指针**

释放后访问的内存（悬垂指针），动态分配的内存被释放后，原内存内容未被清理，可能被意外访问。

```cpp
void danglingPointer() {
    int* p = new int(42); // 动态分配内存
    delete p;             // 释放内存
    std::cout << "Value at dangling pointer: " << *p << std::endl;
}
```

- 动态分配的内存被释放后，指针 p 仍指向原地址。
- 如果此内存未被其他程序覆盖，则仍能访问残留数据。

在释放内存后将指针置为 nullptr，可解决该问题：

```cpp
delete p;
p = nullptr;
```

---

**数组越界**

数组或缓冲区越界访问，在数组或缓冲区范围外读取内存，可能获取到残留数据。

```cpp
void arrayOutOfBounds() {
    int arr[3] = {1, 2, 3};
    std::cout << "Accessing out-of-bounds memory: " << arr[5] << std::endl;
}
```

- 数组 arr 分配的空间仅有 3 个整数，但越界访问可能读取到栈中的残留数据。
- 数据值可能为上一次函数调用或栈帧中遗留的内容。

可以使用带边界检查的容器（例如 std::vector）解决该问题：

```cpp
std::vector<int> vec = {1, 2, 3};
std::cout << vec.at(5) << std::endl; // 抛出异常
```

---

**未清理敏感数据**

未清理的敏感数据，如密码或密钥在使用后未清理，可能被恶意程序利用。

```cpp
char password[16]; // 模拟存储密码
std::strcpy(password, "mypassword1234");
std::cout << "Password: " << password << std::endl;

// 假装密码用完了
std::cout << "Data after use: " << password << std::endl;
```

- password 使用后未清理，敏感数据仍留在内存中，可能被恶意程序读取。

可以使用 std::memset 清理敏感数据：

```cpp
std::memset(password, 0, sizeof(password));
```

---

**数据恢复技术**

数据恢复技术与内存数据残留密切相关。数据恢复的基本原理之一就是利用存储介质（内存、磁盘等）中数据未被完全清除的特点，从中提取原本认为已经被删除或覆盖的内容。

在内存中，分配的空间被释放后，数据仍可能保留，直到被新数据覆盖。数据恢复工具可以直接读取这些未被覆盖的内存数据，从而恢复丢失的内容。

磁盘、固态硬盘等存储设备在删除文件时，通常只是标记数据区域为空闲，并未立即清除实际数据。恢复工具通过扫描这些标记为空的数据区域，可以提取残留的内容。

# 动态链接库

共享库（动态链接库）是编译后生成的独立文件，其中包含了函数、类、数据等代码实体。它们可以被多个程序共享使用，避免重复代码存储，同时使得代码更新更加灵活（只需更新共享库而不必重新编译所有依赖它的应用程序）。

- 在 Windows 上常见的动态链接库后缀为 .dll。
- 在 Linux 上常见的动态链接库后缀为 .so（Shared Object）。

静态链接：编译器在构建可执行文件时，把库中需要的代码复制到可执行文件中。这样生成的可执行文件体积较大，并且更新库后需要重新编译应用程序。

动态链接：可执行文件在运行时加载共享库。多个程序可以共享同一份库代码，这样更新库时不需要重新编译所有依赖该库的程序（前提是接口没有改变）。

动态链接涉及到编译器、链接器和加载器的协同工作：

- 编译阶段：程序编译时，只需要知道库中函数和数据的声明（通常在头文件中），但不会包含具体实现代码。
- 链接阶段：链接器将应用程序与共享库关联，但不将库代码复制到可执行文件中，而是保存库的引用。
- 运行阶段：当程序启动或运行到需要库的代码时，动态链接器根据可执行文件中的符号引用，在运行时加载相应的共享库并解析这些符号。

# 符号的可见性

当我们在共享库中定义函数或变量时，有两种“可见性”的概念：

- 外部可见（Externally Visible / Exported Symbols）：外部程序可以链接到该共享库导出的符号并调用相应的功能。
    - 例如，一个图形库可能导出一个 draw() 函数，让应用程序调用它来绘图。
- 内部可见（Internally Visible / Hidden Symbols）：这些符号仅在共享库内部使用，不会被导出给外部应用程序。
    - 例如，库内部实现细节或者辅助函数，不希望用户直接调用。这可以减少符号冲突，也有助于编译器做更多优化。

通过 GCC，Clang 提供的 `__attribute__((visibility("default")))` 可以设置符号的可见性，制哪些函数和数据能够被外部访问。

假设你在写一个共享库，并且你希望只有 publicFunction 能够被外部调用，而 internalHelper 只用于库内部：

```cpp
// publicFunction.cpp

#include <iostream>

// 这个函数将导出到共享库外部，外部程序可以链接调用
__attribute__((visibility("default")))
void publicFunction() {
    std::cout << "This is a public function." << std::endl;
    internalHelper();
}

// 这个函数标记为 hidden，仅在库内部使用
__attribute__((visibility("hidden")))
void internalHelper() {
    std::cout << "This is an internal helper function." << std::endl;
}
```

在编译时，只有 publicFunction 会出现在共享库的导出符号表中，而 internalHelper 则不会。这减少了外部符号数量，也降低了符号冲突风险。

# 符号的链接

符号的链接（Symbol Linkage）决定了变量、函数或类在程序的不同翻译单元（translation unit）之间的可见性。

- 外部链接（External Linkage）
- 内部链接（Internal Linkage）
- 无链接（No Linkage）

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501171116550.png)

---

**外部链接（External Linkage）**

默认情况下，非 static 的全局变量和函数具有外部链接，外部链接的符号可以在多个翻译单元（多个 .cpp 文件）中被访问。

```cpp
// file1.cpp

int globalVar = 42;  // 具有外部链接（默认）
void showMessage() {  // 具有外部链接（默认）
    std::cout << "Hello from file1!" << std::endl;
}
```

```cpp
// file2.cpp

// 使用 extern 关键字声明 file1.cpp 中的变量和函数
extern int globalVar;
extern void showMessage();

int main() {
    std::cout << "globalVar = " << globalVar << std::endl; // 访问 file1.cpp 的变量
    showMessage(); // 调用 file1.cpp 的函数
    return 0;
}
```

---

**内部链接（Internal Linkage）**

使用 static 关键字修饰的全局变量或函数具有内部链接，内部链接的符号只能在定义它的那个翻译单元（.cpp 文件）中使用，不能被其他翻译单元访问，这主要用于避免名称冲突，以及隐藏实现细节。

```cpp
// file1.cpp

static int internalVar = 100;  // 具有内部链接
static void internalFunction() {  // 具有内部链接
    std::cout << "Hello from internal function in file1!" << std::endl;
}

void publicFunction() {
    std::cout << "This is a public function in file1" << std::endl;
}
```

```cpp
// file2.cpp

// extern int internalVar;  // ❌ 错误：internalVar 在 file1.cpp 内部，不可访问
// extern void internalFunction();  // ❌ 错误：internalFunction 在 file1.cpp 内部，不可访问

extern void publicFunction();  // ✅ 这个可以访问，因为它没有 static 修饰

int main() {
    // std::cout << "internalVar = " << internalVar << std::endl;  // ❌ 错误
    // internalFunction();  // ❌ 错误
    publicFunction();  // ✅ 正确
    return 0;
}
```

---

**无链接（No Linkage）**

局部变量（定义在函数内部的变量）和 constexpr 变量具有无链接，无链接的符号只能在它们定义的作用域内使用，不能跨翻译单元使用。

```cpp
void testFunction() {
    int localVar = 10;  // 这是一个局部变量，具有无链接
    static int staticLocalVar = 20;  // 也是无链接
    std::cout << "localVar = " << localVar << std::endl;
    std::cout << "staticLocalVar = " << staticLocalVar << std::endl;
}

int main() {
    testFunction();
    // std::cout << localVar << std::endl;  // ❌ 错误：无法访问局部变量
    return 0;
}
```

# 函数调用过程

1. 准备调用

- 将函数参数压入栈（或通过寄存器传递，具体取决于调用约定）。
- 保存调用现场，可能包括当前栈指针（ESP 或 RSP）和其他寄存器状态。

2. 跳转到代码区执行函数

- CPU 根据跳转指令（如 call）将控制权转移到代码区中对应的函数入口地址。

3. 在栈中创建函数调用帧

- 分配栈空间，用于存储局部变量、返回地址和其他调用信息。

4. 函数执行

- 在代码区中逐条执行函数的机器指令。
- 操作数（例如局部变量）会使用栈中的空间。

5. 函数结束

- 清理栈帧，恢复调用者的状态。
- 跳转到调用者的下一条指令（返回地址存储在栈中）。

# 地址

低地址：靠近内存的起始地址，通常用于存储代码和全局变量。

高地址：靠近内存的结束地址，通常用于存储局部变量（栈区）。

堆区与栈区的增长方向：

- 堆区：从低地址向高地址增长。
- 栈区：从高地址向低地址增长。

# 虚函数表

虚函数表 vtable 是一种由编译器生成的内部数据结构，用于支持虚函数调用和实现动态绑定。虚表是类级别的（而非对象级别），表中存储了该类的所有虚函数的地址，当派生类覆盖基类的虚函数时，派生类的虚表中会替换对应虚函数的地址。

每个包含虚函数的类的对象都会有一个隐藏的成员变量，称为虚表指针（vptr），指向该对象所属类的虚函数表。

当通过基类指针或引用调用虚函数时，编译器会在运行时通过对象的虚表指针找到实际要调用的函数地址，并调用该函数，实现动态绑定。

假设类 Base 和 Derived 的虚函数表如下：

```
VTable_Base:
+-----------------+
| Base::show()    |  <- 地址1
+-----------------+
| Base::print()   |  <- 地址2
+-----------------+

VTable_Derived:
+-----------------+
| Derived::show() |  <- 地址3
+-----------------+
| Derived::print()|  <- 地址4
+-----------------+
```

- 创建 Derived 对象时，其虚表指针 vptr 会指向 VTable_Derived。
- 当调用 base->show() 时，程序通过 vptr 找到 VTable_Derived 的 show() 地址，并调用 Derived::show()。
- 同样，调用 base->print() 时，调用的是 Derived::print()。

# RTTI

RTTI（运行时类型信息）是 C++ 提供的一种机制，用于在运行时获取对象的类型信息。通过 RTTI，可以实现 运行时类型检查（dynamic_cast） 和 类型识别（typeid），主要用于动态多态场景。

RTTI 只能用于 包含虚函数的类，因为 RTTI 的实现依赖 虚函数表（VTable），如果一个类没有虚函数，就不会生成运行时类型信息，也无法使用 dynamic_cast 或 typeid 进行类型操作。

- dynamic_cast 和 typeid 都会去查询虚表中存储的类型信息 type_info。

```cpp
#include <iostream>
#include <typeinfo> // 用于 std::bad_cast

class Base {
public:
    virtual ~Base() = default; // 必须有虚函数，支持 RTTI
};

class Derived : public Base {
public:
    void show() { std::cout << "Derived::show()" << std::endl; }
};

class AnotherDerived : public Base {};

int main() {
    Base* base1 = new Derived();
    Base* base2 = new AnotherDerived();

    // 安全地将 base1 转换为 Derived 类型
    if (Derived* derived = dynamic_cast<Derived*>(base1)) {
        derived->show(); // 输出：Derived::show()
    } else {
        std::cout << "base1 is not a Derived" << std::endl;
    }

    // 尝试将 base2 转换为 Derived 类型
    if (Derived* derived = dynamic_cast<Derived*>(base2)) {
        derived->show();
    } else {
        std::cout << "base2 is not a Derived" << std::endl; // 输出
    }

    delete base1;
    delete base2;

    return 0;
}
```

```
Derived::show()
base2 is not a Derived
```

typeid 是 C++ 提供的一个运行时类型识别（RTTI）机制，用于获取一个对象的真实类型信息。它返回一个 std::type_info 对象，该对象可以告诉你类型名称，并支持类型比较。

```cpp
int a = 10;
double b = 3.14;

std::cout << "a type: " << typeid(a).name() << std::endl;
std::cout << "b type: " << typeid(b).name() << std::endl;
```

```
a type: i     // i 代表 int（GCC 编译器中的名字修饰符）
b type: d     // d 代表 double
```

通过 typeid 获取获取对象运行时类型

```cpp
class Base {
public:
    // 增加析构虚函数，以开启 RTTI
    virtual ~Base() {}
};

class Derived : public Base {};

int main() {
    Base* a = new Base;
    Base* b = new Derived;
    std::cout << typeid(*a).name() << std::endl;  // 4Base，4 表示 Base类型名的长度
    std::cout << typeid(*b).name() << std::endl;  // 7Derived，7 表示 Derived 类型名的长度
}
```

- RTTI（运行时类型识别）依赖虚函数表（vtable），当一个类有至少一个虚函数时，它会在编译时生成一个 vtable 指针，指向类的虚表。
- 派生类对象也会维护一个自己的 vtable，指向派生类的虚函数实现。
- 如果没有虚函数，`typeid(*ptr)` 无法区分 `Base*` 指向的是 `Base` 还是 `Derived`，所以 `typeid(*ptr)` 将退化为返回静态类型，即 `Base`。
- 只需要在 `Base` 中定义虚函数，那么无论 `Derived` 有没有定义虚函数，所有继承自 `Base` 的类都会开启 RTTI

# RAII

RAII（资源获取即初始化）是 C++ 的核心设计理念之一，用于可靠和自动地管理资源（如内存、文件、网络连接等）。它的核心思想是将 资源的获取和释放 绑定到对象的 生命周期 上，通过对象的 构造函数和析构函数 来管理资源。

- 资源获取：在对象构造时，分配资源（如内存、文件句柄、锁等），通过构造函数进行资源初始化。
- 资源释放：在对象析构时，释放资源，通过析构函数确保资源被正确释放，无需显式调用释放操作。
- 生命周期管理：对象生命周期与资源绑定，确保在对象销毁时自动清理资源，即使发生异常，也能保证资源被释放，避免资源泄漏。

RAII 的典型应用场景：

- 内存管理：如 std::unique_ptr, std::shared_ptr。
- 文件管理：如 std::ifstream, std::ofstream。
- 多线程锁：如 std::lock_guard, std::unique_lock。
- 其他资源：如网络连接、数据库连接。

# RAII 内存管理

不使用 RAII 的内存管理，就需要手动管理内存，容易忘记 delete，如果在 delete 之前发生异常，会导致内存泄漏。

```cpp
void withoutRAII() {
    int* ptr = new int(42); // 动态分配内存
    std::cout << "Value: " << *ptr << std::endl;

    // 如果忘记释放内存，或者函数抛出异常，会导致内存泄漏
    delete ptr;
}
```

使用 RAII 的内存管理，通过封装动态内存的分配和释放到一个类中，确保资源安全。内存的分配和释放由构造函数和析构函数自动管理，即使发生异常，析构函数仍会被调用，确保资源释放。

```cpp
class RAIIInt {
private:
    int* ptr; // 动态分配的内存
public:
    RAIIInt(int value) : ptr(new int(value)) {
        std::cout << "Resource acquired" << std::endl;
    }
    ~RAIIInt() {
        delete ptr; // 自动释放内存
        std::cout << "Resource released" << std::endl;
    }

    int getValue() const { return *ptr; }
};

void withRAII() {
    RAIIInt resource(42);
    std::cout << "Value: " << resource.getValue() << std::endl;

    // 不需要手动释放内存，析构函数会自动调用
}
```

# RAII 文件管理

使用 RAII 的文件管理，通过封装文件操作为类，确保文件在对象销毁时自动关闭。

```cpp
class RAIIFile {
private:
    std::ifstream file;
public:
    RAIIFile(const std::string& filename) : file(filename) {
        if (!file.is_open()) {
            throw std::runtime_error("Failed to open file");
        }
        std::cout << "File opened" << std::endl;
    }

    ~RAIIFile() {
        if (file.is_open()) {
            file.close(); // 自动关闭文件
            std::cout << "File closed" << std::endl;
        }
    }

    void read() {
        std::string line;
        while (std::getline(file, line)) {
            std::cout << line << std::endl;
        }
    }
};

void withRAII() {
    try {
        RAIIFile file("example.txt");
        file.read();
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
    }
}
```

# RAII 线程锁管理

RAII 也常用于管理多线程中的锁，避免死锁或未释放锁的情况。

不实用 RAII 线程锁管理，如果在 mtx.unlock() 前发生异常，锁会保持未释放状态，导致死锁。

```cpp
std::mutex mtx;

void withoutRAII() {
    mtx.lock(); // 手动加锁
    std::cout << "Critical section" << std::endl;

    // 如果函数提前返回或抛出异常，锁可能无法释放
    mtx.unlock(); // 手动解锁
}
```

使用 RAII 线程锁管理，确保锁的正确释放。不会因异常导致死锁，加锁和解锁逻辑清晰，避免手动管理锁的复杂性。

```cpp
std::mutex mtx;

void withRAII() {
    std::lock_guard<std::mutex> lock(mtx); // 构造时加锁，析构时解锁
    std::cout << "Critical section" << std::endl;

    // 无需手动解锁，离开作用域时自动释放锁
}
```

# RVO

RVO（Return Value Optimization） 是编译器的一种优化技术，用于消除函数返回临时对象时的不必要的拷贝或移动。

```cpp
class Test {
public:
    Test() { std::cout << "Constructor\n"; }
    Test(const Test&) { std::cout << "Copy Constructor\n"; }
    Test(Test&&) noexcept { std::cout << "Move Constructor\n"; }
    ~Test() { std::cout << "Destructor\n"; }
};

Test createTest() {
    Test temp;
    return temp;
}

void demo() {
    std::cout << "in demo()\n";
    Test t = createTest();
    std::cout << "out demo()\n";
}

int main() {
    std::cout << "in main()\n";
    test();
    std::cout << "out main()\n";
    return 0;
}
```

```
### 禁用 RVO 的输出 ###

in main()
in demo()
Constructor
Move Constructor
Destructor
out demo()
Destructor
out main()
```

- 编译器执行 `return Test()` 时，首先会在 `createTest()` 的栈空间创建临时对象，接着再通过移动构造或拷贝构造在 `demo()` 的栈空间创建临时对象。
- 如果有移动构造，则会优先调用移动构造，减少一次拷贝，否则调用拷贝构造。

```
### 启用 RVO 的输出 ###

in main()
in demo()
Constructor
out demo()
Destructor
out main()
```

- 编译器不会在 `createTest()` 的栈空间创建临时变量，而是直接在 `demo()` 的栈空间创建临时变量，只调用一次构造函数，避免了额外的拷贝和移动，性能更优。

# NRVO

如果返回的是具名对象，而不是临时对象，RVO 仍然可能生效，但属于 NRVO（Named Return Value Optimization）。

```cpp
class Test {
public:
    Test() { std::cout << "Constructor\n"; }
    Test(const Test&) { std::cout << "Copy Constructor\n"; }
    Test(Test&&) noexcept { std::cout << "Move Constructor\n"; }
    ~Test() { std::cout << "Destructor\n"; }
};

Test createTest() {
    Test t;  // 具名对象
    return t;  // 可能触发 NRVO
}

int main() {
    std::cout << "Calling createTest()\n";
    Test t = createTest();
    std::cout << "Exiting main()\n";
}
```

```
### 禁用 NRVO 的输出 ###

Calling createTest()
Constructor
Move Constructor
Destructor
Exiting main()
Destructor
```

- 先在 `createTest()` 的栈空间创建具名对象，再移动到 `main()` 的 t 变量处。

```
### 启用 NRVO 的输出 ###

Calling createTest()
Constructor
Exiting main()
Destructor
```

- 直接在 `main()` 的栈空间创建具名对象。
