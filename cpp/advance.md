# posix_memalign

posix_memalign 是一个 POSIX 标准的内存分配函数，用于分配指定对齐方式的内存。普通的 malloc 并不保证内存对齐到特定边界，而某些场景（SIMD、硬件加速、内存映射 I/O）需要特定对齐。

```cpp
int posix_memalign(void **memptr, size_t alignment, size_t size);
```

- memptr：指向一个 void* 指针的指针，用于接收分配的内存地址
- alignment：返回的内存的首地址必须是 alignment 的倍数（memory address % alignment == 0），要求是 2 的幂且是 sizeof(void*) 的倍数
- size：分配的内存大小

返回值：

- 0：分配成功
- ENOMEM：内存不足
- EINVAL：alignment 不合法

注意：分配成功后，必须用 free 释放，不能用 delete。

---

```cpp
#include <iostream>
#include <cstdlib> // posix_memalign, free

int main() {
    void* ptr = nullptr;
    size_t alignment = 64;  // 对齐到 64 字节
    size_t size = 1024;     // 分配 1024 字节

    int result = posix_memalign(&ptr, alignment, size); // ptr 指向的内存首地址一定是 alignment 的倍数
    if (result != 0) {
        std::cerr << "内存分配失败，错误码: " << result << std::endl;
        return 1;
    }

    // ptr 现在指向一个 64 字节对齐的内存块
    std::cout << "分配成功，内存地址: " << ptr << std::endl;

    // 示例：向内存写入数据
    int* int_ptr = static_cast<int*>(ptr);
    for (size_t i = 0; i < size / sizeof(int); ++i) {
        int_ptr[i] = static_cast<int>(i);
    }

    // 检查对齐，将 ptr 地址 转成 uintptr_t 无符号整数类型 取模 alignment
    if (reinterpret_cast<uintptr_t>(ptr) % alignment == 0) {
        std::cout << "内存对齐正确" << std::endl;
    } else {
        std::cout << "内存对齐错误" << std::endl;
    }

    // 释放内存
    free(ptr);

    return 0;
}
```

# aligned_alloc

aligned_alloc 是 C11/C++17 提供的函数，用于分配指定对齐的内存，它类似 posix_memalign，但接口更简洁。

```cpp
void* aligned_alloc(std::size_t alignment, std::size_t size);
```

- aligned_alloc 相比 posix_memalign，多了一个要求，size 必须是 alignment 的倍数。

---

```cpp
#include <iostream>
#include <cstdlib>  // aligned_alloc, free

int main() {
    size_t alignment = 64;  // 对齐到 64 字节
    size_t size = 1024;     // 分配 1024 字节

    // 注意：size 必须是 alignment 的倍数
    void* ptr = std::aligned_alloc(alignment, size);
    if (!ptr) {
        std::cerr << "内存分配失败" << std::endl;
        return 1;
    }

    std::cout << "分配成功，内存地址: " << ptr << std::endl;

    // 检查对齐
    if (reinterpret_cast<uintptr_t>(ptr) % alignment == 0) {
        std::cout << "内存对齐正确" << std::endl;
    } else {
        std::cout << "内存未对齐" << std::endl;
    }

    // 使用内存
    int* int_ptr = static_cast<int*>(ptr);
    for (size_t i = 0; i < size / sizeof(int); ++i) {
        int_ptr[i] = static_cast<int>(i);
    }

    // 释放内存
    free(ptr);

    return 0;
}
```

# operator new

operator new 是 C++ 的内存分配运算符，类似于 C 的 malloc，用于分配指定字节数的原始内存，但不会调用构造函数。返回指向分配内存的指针，内存分配失败会抛出 std::bad_alloc 异常（除非使用 nothrow 版本）。与 new 运算符不同，operator new 只分配内存，不初始化对象。

```cpp
void* operator new(std::size_t size);                 // 普通版
void* operator new(std::size_t size, std::nothrow_t&) noexcept; // 不抛异常版

// C++17 对齐版本
void* operator new(std::size_t size, std::align_val_t alignment);
```

---

```cpp
#include <iostream>
#include <new>  // operator new, std::bad_alloc

int main() {
    try {
        // 分配 100 个字节的原始内存
        void* ptr = operator new(100);

        std::cout << "分配成功，内存地址: " << ptr << std::endl;

        // 可以用它存放任意对象
        int* arr = static_cast<int*>(ptr);
        arr[0] = 42;
        arr[1] = 99;
        std::cout << "arr[0] = " << arr[0] << ", arr[1] = " << arr[1] << std::endl;

        // 释放内存
        operator delete(ptr);
    } catch (const std::bad_alloc& e) {
        std::cerr << "分配失败: " << e.what() << std::endl;
    }

    return 0;
}
```

```
分配成功，内存地址: 0x55a1c3f52040
arr[0] = 42, arr[1] = 99
```

---

C++17 引入对齐版本 operator new(std::size_t, std::align_val_t)，可以像 aligned_alloc 一样分配对齐内存。

```cpp
#include <iostream>
#include <new>
#include <cstdint>

int main() {
    size_t size = 1024;
    std::align_val_t alignment = std::align_val_t(64);

    void* ptr = ::operator new(size, alignment); // 分配 64 字节对齐内存
    std::cout << "对齐内存地址: " << ptr << std::endl;

    // 检查对齐
    if (reinterpret_cast<uintptr_t>(ptr) % 64 == 0) {
        std::cout << "内存对齐正确" << std::endl;
    } else {
        std::cout << "内存未对齐" << std::endl;
    }

    // 释放内存
    ::operator delete(ptr, alignment);

    return 0;
}
```

# SIMD

SIMD（Single Instruction, Multiple Data）一条指令同时处理 多个数据元素，与普通逐元素处理（标量）相比，能显著加速向量/数组运算。

- SSE（Streaming SIMD Extensions）：128 位寄存器（一次可处理 4 个 float / 2 个 double），要求 16 字节对齐。
- AVX（Advanced Vector Extensions）：256 位寄存器（一次可处理 8 个 float / 4 个 double），要求 32 字节对齐。
- AVX-512：512 位寄存器（16 个 float / 8 个 double），要求 64 字节对齐。

```cpp
#include <immintrin.h>
#include <iostream>

int main() {
    alignas(16) float a[4] = {1, 2, 3, 4};
    alignas(16) float b[4] = {5, 6, 7, 8};
    alignas(16) float c[4];

    // 将数组加载到 128-bit 寄存器
    __m128 va = _mm_load_ps(a); // aligned load
    __m128 vb = _mm_load_ps(b);
    __m128 vc = _mm_add_ps(va, vb); // SIMD 加法

    _mm_store_ps(c, vc); // 将结果存回数组

    for(int i=0;i<4;i++)
        std::cout << c[i] << " "; // 输出：6 8 10 12
    return 0;
}
```

```cpp
#include <immintrin.h>
#include <iostream>

int main() {
    alignas(32) float a[8] = {1,2,3,4,5,6,7,8};
    alignas(32) float b[8] = {8,7,6,5,4,3,2,1};
    alignas(32) float c[8];

    __m256 va = _mm256_load_ps(a);
    __m256 vb = _mm256_load_ps(b);
    __m256 vc = _mm256_add_ps(va, vb);

    _mm256_store_ps(c, vc);

    for(int i=0;i<8;i++)
        std::cout << c[i] << " "; // 输出：9 9 9 9 9 9 9 9
    return 0;
}
```

SIMD 指令要求数据地址是寄存器宽度的倍数，如果不对齐，直接使用 aligned load store 会导致 CPU 报错，使用 unaligned load store 可以避免报错，但会导致性能下降 10%-50%。
