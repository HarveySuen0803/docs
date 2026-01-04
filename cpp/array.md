# 数组长度

使用 sizeof 操作符计算长度：

```cpp
int main() {
    int arr[] = {1, 2, 3, 4, 5};
    int length = sizeof(arr) / sizeof(arr[0]);

    std::cout << "Length of the array: " << length << std::endl;

    return 0;
}
```

- 此方法仅适用于在编译时已知大小的数组（如局部定义的静态数组）。
- 不能用于指针或动态分配的数组。

如果 arr 是一个静态数组，那么 sizeof(arr) 计算的是该数组的长度，如果 arr 是一个指针，那么 sizeof(arr) 计算的是该指针的长度，默认为 8 B。

```cpp
int arr[] = {1, 2, 3, 4, 5}; // 静态数组
int length = sizeof(arr) / sizeof(arr[0]); // 20 / 4 = 5，计算长度

int* arr = new int[5]; // 动态分配数组
int length = sizeof(arr) / sizeof(arr[0]); // 8 / 4 = 2，尝试计算长度
```

如果你需要一个通用的解决方案，可以使用模板封装数组长度计算：

```cpp
template <typename T, size_t N>
constexpr size_t arrayLength(T (&)[N]) {
    return N;
}

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    std::cout << "Length of the array: " << arrayLength(arr) << std::endl;

    return 0;
}
```

- 编译期安全，避免误将指针传递给 sizeof。

# 数组拷贝

```cpp
int nums1[] = {3, 1, 4, 1, 5};

// 浅拷贝，拷贝了 nums1 首元素的地址，通过 nums2 操作数组，依旧操作的是原数组
int* nums2 = nums1;

// 深拷贝，拷贝了 nums1 的所有元素的具体的值
int nums3[5];
for (int i = 0; i < 5; i++) {
    nums3[i] = nums1[i];
}
```

# 二维数组

```cpp
// 完全初始化
int arr1[2][3] = {{1, 2, 3}, {4, 5, 6}};

// 部分初始化，未指定的元素会初始化为 0
int arr2[2][3] = {{1, 2}, {4}};

// 初始化为全 0
int arr3[2][3] = {0};

// 自动推导列数
int arr4[][3] = {{1, 2, 3}, {4, 5, 6}};

std::cout << "arr1[0][1]: " << arr1[0][1] << std::endl;
```

```cpp
int arr[2][3] = {{1, 2, 3}, {4, 5, 6}};

// 使用索引遍历二维数组
for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 3; j++) {
        std::cout << arr[i][j] << " ";
    }
    std::cout << std::endl;
}

// 使用指针遍历二维数组
for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 3; j++) {
        std::cout << *(*(arr + i) + j) << " ";
    }
    std::cout << std::endl;
}
```

使用指针实现动态分配

```cpp
int rows = 2, cols = 3;

// 动态分配二维数组
int** arr = new int*[rows];
for (int i = 0; i < rows; i++) {
    arr[i] = new int[cols];
}

// 初始化数组
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        arr[i][j] = i * cols + j + 1;
    }
}

// 打印数组
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        std::cout << arr[i][j] << " ";
    }
    std::cout << std::endl;
}

// 释放内存
for (int i = 0; i < rows; i++) {
    delete[] arr[i];
}
delete[] arr;
```

- 动态分配内存时，先为行分配指针数组，再为每行分配列数组。
- 动态分配的二维数组需要手动释放内存。