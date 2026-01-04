# `[[nodiscard]]`

nodiscard 用来标记函数或类型，提示调用者不要忽略返回值。也就是说，当一个函数被标记为 nodiscard 后，如果调用该函数时忽略了它返回的结果，编译器通常会发出警告，以防止潜在的错误或遗漏重要的信息。

---

**示例 1：函数返回值不应被忽略**

```cpp
[[nodiscard]] int computeValue() {
    return 42;
}

int main() {
    computeValue(); // 如果不使用返回值，编译器可能会给出警告
    // 正确用法：
    int result = computeValue();
    std::cout << "Computed value: " << result << std::endl;
    return 0;
}
```

在这个例子中，computeValue 函数返回一个整数，并被标记为 nodiscard。如果在 main 函数中调用 computeValue() 而不使用它的返回值，编译器会发出警告，提示可能忽略了返回值，这样有助于开发者避免遗漏重要的计算结果。

---

**示例 2：用于错误处理**

很多情况下，函数返回值包含错误码或者状态信息，开发者必须检查返回值以确认操作是否成功。使用 `[[nodiscard]]` 可以确保错误信息不会被无意中忽略。

```cpp
enum class Status {
    Ok,
    Error
};

[[nodiscard]] Status performOperation() {
    // 假设这里进行了某种操作
    return Status::Error;
}

int main() {
    // 忽略返回值可能会导致错误信息丢失
    // performOperation(); // 编译器会警告

    // 正确做法：检查返回值
    Status status = performOperation();
    if (status == Status::Error) {
        std::cerr << "Operation failed!" << std::endl;
    }
    return 0;
}
```

在这个例子中，performOperation 返回一个状态枚举，表示操作是否成功。标记为 nodiscard 后，调用者必须处理返回的状态，否则编译器会提醒调用者可能忽略了关键的错误检查。

---

**示例 3：应用于类或结构体**

nodiscard 也可以用来修饰类或结构体，这样如果一个函数返回该类型的对象而调用者忽略了返回值，也会收到警告。

```cpp
class [[nodiscard]] ImportantResult {
public:
    ImportantResult(int data) : data_(data) {}
    int getData() const { return data_; }
private:
    int data_;
};

ImportantResult generateResult() {
    return ImportantResult(100);
}

int main() {
    generateResult(); // 忽略返回的 ImportantResult 会触发警告
    ImportantResult result = generateResult();
    std::cout << "Result data: " << result.getData() << std::endl;
    return 0;
}
```

在此例中，ImportantResult 被标记为 nodiscard，因此任何返回 ImportantResult 对象的函数调用，都不应被忽略其返回值。

# `[[maybe_unused]]`

用于标记可能未被使用的变量、参数或函数，防止编译器对这些未使用的实体发出警告。在编写模板代码或者占位符代码时非常有用。

```cpp
void process([[maybe_unused]] int unusedParam) {
    // 标记变量 unusedVar，避免未使用警告
    [[maybe_unused]] int unusedVar = 100;
    // 这里可能暂时不需要使用 unusedParam 和 unusedVar
}
```

# `[[deprecated]]`

用于标记某个函数、类、变量等已经过时，建议不要再使用。如果代码中使用了被标记为 [[deprecated]] 的实体，编译器会发出警告，并且可以附带说明信息，告知开发者替代方案。

```cpp
// 标记 oldFunction 已经过时，并给出替代建议
[[deprecated("Use newFunction instead")]]
void oldFunction() {
    std::cout << "This function is deprecated." << std::endl;
}

void newFunction() {
    std::cout << "This is the new function." << std::endl;
}

int main() {
    oldFunction(); // 编译器会警告 oldFunction 已经被弃用
    newFunction();
    return 0;
}
```

# `[[fallthrough]]`

用于 switch-case 语句中，明确表明某个 case 分支是故意“贯穿”到下一个 case 的，防止编译器因遗漏 break 而发出警告。

```cpp
int main() {
    int value = 1;
    switch (value) {
        case 1:
            std::cout << "Case 1" << std::endl;
            [[fallthrough]]; // 表明是有意贯穿
        case 2:
            std::cout << "Case 2" << std::endl;
            break;
        default:
            std::cout << "Default case" << std::endl;
    }
    return 0;
}
```

# `[[likely]]`

likely 和 unlikely 这些属性为条件分支提供了预测信息，告诉编译器哪个分支更有可能被执行，从而可能帮助编译器进行优化。

```cpp
int main() {
    bool condition = true;
    if ([[likely]] condition) {
        std::cout << "Condition is likely true." << std::endl;
    } else {
        std::cout << "Condition is unlikely true." << std::endl;
    }
    return 0;
}
```

# `[[no_unique_address]]`

每个非静态数据成员通常都有它独立的内存地址，即使该成员的类型为空（即不包含任何数据），编译器通常仍会为它分配至少一个字节的存储空间，以保证不同成员具有不同的地址。而 no_unique_address 属性的作用就是告诉编译器：如果一个数据成员为空或者满足合并条件，可以不为它分配独立的存储空间，从而与其他成员共享内存位置，减少对象的整体内存占用。

```cpp
struct Empty {};

struct Data {
    [[no_unique_address]] Empty emptyMember; // 标记为空成员，允许合并存储
    int value;
};

int main() {
    Data d;
    d.value = 10;
    return 0;
}
```

- 如果不使用 no_unique_address，即使 Empty 类不包含任何数据，编译器仍可能为 emptyMember 分配至少 1 字节的存储空间，导致 Data 的大小至少为 sizeof(int) + 1（考虑内存对齐，可能更大）。
- 如果使用了 no_unique_address，编译器可以判断 Empty 是一个空类型，并且允许它与其他成员共享存储空间，所以可能只为 int value 分配内存。这样 Data 的大小就可能仅仅是 sizeof(int)（当然，具体结果还取决于编译器的优化和对齐规则）。

# `__attribute__`

`__attribute__` 是 GCC 和 Clang 等编译器提供的一种扩展语法，用来为函数、变量、类型等添加额外的属性（metadata）。这些属性可以指导编译器进行优化、改变代码生成方式或者提供其他编译时信息。下面通过一些详细例子说明其用法，并介绍类似的语法。

## always_inline

使用 `__attribute__((always_inline))` 强制编译器内联函数，从而消除函数调用的开销。

```cpp
#define ALWAYS_INLINE __attribute__((always_inline))

ALWAYS_INLINE int add(int a, int b) {
    return a + b;
}

int main() {
    std::cout << "Sum: " << add(2, 3) << std::endl;
    return 0;
}
```

在这个例子中，add 函数被要求在每次调用时都内联展开。

## no_inline

使用 `__attribute__((no_inline))` 禁止编译器内联函数，保持函数调用的形式。

```cpp
#define NO_INLINE __attribute__((noinline))

NO_INLINE int compute(int x) {
    return x * x;
}

int main() {
    std::cout << "Compute: " << compute(4) << std::endl;
    return 0;
}
```

## deprecated

使用 `__attribute__((deprecated))` 标记函数或变量为“已弃用”，在使用时编译器会发出警告。

```cpp
int oldFunction() __attribute__((deprecated("请使用 newFunction 代替")));

int oldFunction() {
    return 42;
}

int newFunction() {
    return 100;
}

int main() {
    // 使用 oldFunction 会触发编译器警告
    std::cout << "Old function returns: " << oldFunction() << std::endl;
    std::cout << "New function returns: " << newFunction() << std::endl;
    return 0;
}
```

编译器会提示开发者该函数已过时，并建议使用新的替代方案。

## aligned

使用 `__attribute__((aligned(n)))` 指定变量或类型的内存对齐要求。

```cpp
struct __attribute__((aligned(16))) AlignedStruct {
    int a;
    double b;
};

int main() {
    AlignedStruct s;
    std::cout << "Alignment of AlignedStruct: " << alignof(AlignedStruct) << std::endl;
    return 0;
}
```

这里要求 AlignedStruct 的实例在内存中按 16 字节对齐。

## packed

使用 `__attribute__((packed))` 告诉编译器不要在结构体成员之间填充额外的字节，常用于与硬件或网络数据格式匹配。

下面这段示例中，Unpacked 的成员 a 占 1 个字节，成员 b 占 4 个字节。但为了让 b 在内存中按照 4 字节对齐，编译器会在 a 后面插入 3 个填充字节，使得 b 的起始地址是 4 的倍数。

```cpp
struct Unpacked {
    char a; // 1B，后面需要填充 3B
    int b; // 4B
};

int main() {
    std::cout << "Unpacked structure:" << std::endl;
    std::cout << "  Size: " << sizeof(Unpacked) << std::endl; // 8
    std::cout << "  Offset of a: " << offsetof(Unpacked, a) << std::endl; // 0
    std::cout << "  Offset of b: " << offsetof(Unpacked, b) << std::endl; // 4
    return 0;
}
```

- sizeof(Unpacked) 可能为 8 字节，而不是 1 + 4 = 5 字节。
- a 的偏移量是 0，b 的偏移量则通常是 4。

下面这段示例中，Packed 使用编译器提供的属性语法 `__attribute__((packed))`，可以指示编译器取消这些填充字节，使结构体按照各成员大小的严格排列。

```cpp
struct __attribute__((packed)) Packed {
    char a; // 1B，后面不需要填充 3B
    int ib; // 4B，紧贴着 a
};

int main() {
    std::cout << "\nPacked structure:" << std::endl;
    std::cout << "  Size: " << sizeof(Packed) << std::endl; // 5
    std::cout << "  Offset of a: " << offsetof(Packed, a) << std::endl; // 0
    std::cout << "  Offset of b: " << offsetof(Packed, b) << std::endl; // 1
    return 0;
}
```

- sizeof(Packed) 可能为 5 字节（1 字节 + 4 字节）。
- a 的偏移量是 0，b 的偏移量紧跟 a，即为 1。

除了 GCC，Clang `__attribute__((packed))`，在 Microsoft Visual C++ 中通常使用 `#pragma pack` 指令来控制结构体对齐。

```cpp
#pragma pack(push, 1)
struct PackedMSVC {
    char a;
    int  b;
};
#pragma pack(pop)
```

- 这段代码的效果与 `__attribute__((packed))` 类似，同样取消填充字节。

## unused

标记变量或函数参数可能未使用，避免编译器产生警告。

```cpp
void foo(int a, int b __attribute__((b))) {
    std::cout << "Used parameter: " << b << std::endl;
}

int main() {
    foo(10, 20);
    return 0;
}
```

这里 b 参数被标记为未使用，编译器不会对其发出警告。

## noreturn

标记函数不会返回，用于那些调用后程序终止的函数。

```cpp
void fatalError(const char* msg) __attribute__((noreturn));

void fatalError(const char* msg) {
    std::cerr << "Fatal error: " << msg << std::endl;
    std::exit(1);
}

int main() {
    fatalError("Something went wrong!");
    // 此处代码不会执行
    return 0;
}
```

标记 fatalError 为 noreturn 后，编译器知道此函数调用后不会返回，从而进行更好的优化和静态检查。

## pure

通过 `__attribute__((pure))` 声明纯函数，表示函数的返回值只依赖于参数和全局状态，但可能访问全局数据，不修改全局数据。

```cpp
// 只依赖参数计算结果，但可能访问全局变量（如errno）
double squareRoot(double x) __attribute__((pure));
double squareRoot(double x) {
    return std::sqrt(x);
}

int main() {
    int sum = add(3, 4);
    double root = squareRoot(16.0);
    return 0;
}
```

## const

通过 `__attribute__((const))` 声明常函数，表示函数不访问任何全局内存，也不修改参数，只依赖输入参数计算返回值。

```cpp
// 完全只依赖参数，没有副作用
int add(int a, int b) __attribute__((const));
int add(int a, int b) {
    return a + b;
}

int main() {
    int sum = add(3, 4);
    return 0;
}
```

## hot & cold

告诉编译器哪个函数更可能被频繁调用（hot），哪个函数较少调用（cold），从而可能优化代码布局以提高性能。

```cpp
void hotFunction() __attribute__((hot));
void hotFunction() {
    std::cout << "This is a hot function." << std::endl;
}

void coldFunction() __attribute__((cold));
void coldFunction() {
    std::cout << "This is a cold function." << std::endl;
}

int main() {
    hotFunction();
    coldFunction();
    return 0;
}
```

## weak

weak 属性用于将符号（函数或变量）标记为弱符号，如果同一符号有多个定义（比如在不同翻译单元中），弱符号可以被强符号覆盖。如果没有强符号，链接器将使用弱符号。

```cpp
// 弱变量
int globalValue __attribute__((weak)) = 42;

// 弱函数，提供默认实现
__attribute__((weak))
void weakFunction() {
    std::cout << "Default weakFunction implementation" << std::endl;
}

int main() {
    std::cout << "globalValue = " << globalValue << std::endl;
    // 如果没有其它地方提供强定义，调用此默认实现
    weakFunction();
    return 0;
}
```

如果在另一个文件中，提供了一个强定义，那么链接时会选择强定义，而忽略弱定义。

```cpp
void weakFunction() {
    std::cout << "Overridden strong weakFunction implementation" << std::endl;
}
```

## visibility

visibility 属性用来控制符号在共享库（动态链接库）中的导出范围。

- default：符号对外部可见（正常导出）。
- hidden：符号仅在库内部可见，不会被导出给外部链接使用。

```cpp
// 导出到共享库外部，外部可链接调用
__attribute__((visibility("default")))
void publicFunction() {
    std::cout << "publicFunction is visible externally" << std::endl;
}

// 隐藏于共享库内部，不导出到外部
__attribute__((visibility("hidden")))
void hiddenFunction() {
    std::cout << "hiddenFunction is hidden from external linking" << std::endl;
}

int main() {
    publicFunction();
    hiddenFunction();
    return 0;
}
```

在构建动态链接库时，只有标记为 "default" 的符号会被导出供外部使用，而标记为 "hidden" 的符号仅在库内部有效。这对于实现模块内部封装非常有用。

## may_alias

编译器通常假定不同类型的指针不会指向同一内存区域，这种假设可以帮助编译器进行优化，但如果假定不成立，两个不同类型的指针操作了同一块内存地址，而编译器无法识别，就可能因为编译器的优化，导致程序行为未定义。

```cpp
float readFloat(void* mem) {
    float* fptr = reinterpret_cast<float*>(mem);
    return *fptr;
}

void writeInt(void* mem, int value) {
    int* iptr = reinterpret_cast<int*>(mem);
    *iptr = value;
}

void example(void* mem) {
    float a = readFloat(mem);  // 第一步，从内存中读取一个 float 值
    writeInt(mem, 123);        // 第二步，通过 int* 写入一个整数到同一内存区域
    float b = readFloat(mem);  // 第三步，再次读取同一内存区域的 float 值
}
```

- readFloat() 通过 float* 读取 mem，writeInt() 通过 int* 写入 mem，编译器会认为两次操作的内存地址不同，两个指针操作互不影响，从而更积极地进行缓存数据、重排指令等优化。
- 缓存数据：第一次调用 readFloat() 后，编译器可能将 a 缓存在寄存器中，在调用 writeInt() 后，这个值不会改变。这就可能导致编译器认为第二次调用 readFloat(mem) 得到的值 b 与第一次读取的 a 一样，或者完全忽略对内存重新加载的必要。
- 重排指令：编译器可能把两次读取操作合并或者调整顺序，使得写操作看起来与读取操作无关。

当你在代码中确实需要通过不同类型的指针来访问同一块内存时，使用 `__attribute__((may_alias))` 提示编译器当前指针操作内存，可能被其他类型的指针操作，从而在优化时会更加谨慎，不会错误地假设这些指针互不干扰，避免了潜在问题。

```cpp
float readFloat(void* mem) {
    float* __attribute__((may_alias)) fptr = reinterpret_cast<float*>(mem);
    return *fptr;
}

void writeInt(void* mem, int value) {
    int* __attribute__((may_alias)) iptr = reinterpret_cast<int*>(mem);
    *iptr = value;
}

void example(void* mem) {
    float a = readFloat(mem);
    writeInt(mem, 123);
    float b = readFloat(mem);
}
```

## sentinel

sentinel 属性用于标记变长参数（variadic）函数，要求参数列表的最后一个参数必须为哨兵值（通常是 NULL 或 nullptr），确保调用者在传递可变参数时遵循预定的结束标记，防止参数解析错误。

```cpp
// 声明一个变长参数函数，并使用 sentinel 属性要求最后一个参数必须为 NULL
void logMessage(const char* format, ...) __attribute__((sentinel));

void logMessage(const char* format, ...) {
    va_list args;
    va_start(args, format);
    vprintf(format, args);
    va_end(args);
}

int main() {
    // 正确使用：最后一个参数是 nullptr，作为哨兵
    logMessage("Logging values: %d, %s\n", 42, "example", nullptr);

    // 如果调用时没有以 nullptr 结束，编译器可能会发出警告：
    // logMessage("Logging values: %d, %s\n", 42, "example");
    return 0;
}
```

在这个例子中，logMessage 函数要求参数列表必须以 nullptr 结尾。`sentinel` 属性使编译器在调用时进行检查，如果最后一个参数没有提供哨兵值，则会给出警告，帮助开发者防止错误的参数传递。

# `__restrict__`

`__restrict__` 是对编译器的承诺 —— 通过这个指针访问的内存，在该指针的作用域内不会被其他指针别名（alias）访问。编译器据此可以做更激进的重排/寄存器缓存/向量化优化。如果承诺被违反，程序行为就是未定义（UB）。

下面这段示例中，进行简单向量加法（没有 restrict），编译器在没有别名信息时必须保守：a, b, c 可能互相别名（指向相同内存），因此编译器不能随意把 b[i] / c[i] 保存在寄存器跨越 store a[i]；这可能阻止自动向量化或寄存器缓存优化。

```cpp
// no-restrict.cc
void add_no_restrict(int *a, const int *b, const int *c, size_t n) {
    for (size_t i = 0; i < n; ++i) {
        a[i] = b[i] + c[i];
    }
}
```

下面这段示例中，使用 restrict 明确无别名，向编译器承诺 a、b、c 三个指针指向的内存区域互不重叠。编译器可以据此把 b[i] / c[i] 保存在寄存器而不担心 a[i] 的写覆盖，更容易进行循环向量化或内存访问重排序，从而显著加速。

```cpp
// restrict.cc
void add_restrict(int * __restrict a,
                  const int * __restrict b,
                  const int * __restrict c,
                  size_t n) {
    for (size_t i = 0; i < n; ++i) {
        a[i] = b[i] + c[i];
    }
}
```

下面这段示例中，a, b, c 三个指针指向的内存显然会重叠。编译器在优化时会假设不会发生这种情况，结果程序可能产生错误结果或崩溃（未定义行为）。

```cpp
int buffer[100];

int * a = buffer;
int * b = buffer + 1;
int * c = buffer + 2;

// 错：下面的调用违反了 restrict 的承诺，产生 UB
add_restrict(a, b, c, 90);
```