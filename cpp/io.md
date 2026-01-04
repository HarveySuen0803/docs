# 输入流

cin 在读取数据时默认会忽略空白字符（如空格、换行符和制表符）作为分隔符，并在遇到空格或换行符时停止读取。这适用于基本的输入操作，如读取整数、浮点数和字符串。

- 对于基本数据类型（如 int, float）：cin 会跳过所有空白字符，直到遇到第一个非空白字符开始读取，再次遇到空格、换行符或制表符时停止读取。
- 对于字符串（string 类型）：cin >> string_variable 读取一个以空白字符（如空格、换行符或制表符）结束的单词，读取时，不包括空白字符。

```cpp
string word;
cout << "Enter a word: ";
cin >> word;  // 默认读取到空格或换行符为止
cout << "You entered: " << word << endl;
```

```
# Input ###

Hello World!

# Output ###

Enter a word: Hello
You entered: Hello
```

如果你需要输入一个完整的句子而不是单个单词，cin 无法正常工作，因为它会在第一个空格处停止。可以使用 getline 读取整行。

```cpp
string sentence;
cout << "Enter a sentence: ";
getline(cin, sentence);  // 读取整行，包括空格
cout << "You entered: " << sentence << endl;
```

```
# Input ###

Hello World!

# Output ###

Enter a sentence: Hello World!
You entered: Hello World!
```

# 输入流状态

输入流有四种主要状态：

- goodbit：表示流处于正常状态，可以继续进行操作。
- eofbit：表示已经到达输入流的末尾（例如，读取文件到末尾或用户输入的终止符）。
- failbit：表示流遇到非致命错误，例如试图读取错误类型的数据（如从 int 输入读取字母）。
- badbit：表示流遇到严重错误，例如硬件故障或不可恢复的错误。

输入流状态函数：

- cin.good()	true	输入流处于正常状态，未发生错误	检查输入流是否可以继续读取。
- cin.fail()	true	输入流发生了非致命错误（类型不匹配、格式错误等）	检测用户输入是否符合预期的数据类型。
- cin.eof()	true	到达输入流的末尾	检查输入结束（例如文件输入的末尾或终止符，或用户通过 Ctrl+D 或 Ctrl+Z 手动结束输入）。
- cin.bad()	true	输入流发生了不可恢复的错误	检查输入流是否损坏（如硬件错误或系统问题）。

```cpp
int sum = 0;     // 累加的总和
int number;      // 存储当前输入的整数

cout << "Enter integers to sum them up. Type 'Ctrl+D' (Linux/macOS) or 'Ctrl+Z' (Windows) to finish.\n";

while (true) {
    cout << "Enter a number: ";
    cin >> number;  // 尝试读取用户输入

    // 检查流状态
    if (cin.eof()) {  // 用户按下 Ctrl+D/Ctrl+Z，输入结束
        cout << "End of input detected. Exiting...\n";
        break;
    } else if (cin.fail()) {  // 输入不是整数
        cout << "Invalid input. Please enter a valid integer.\n";
        cin.clear();  // 清除 fail 状态
        cin.ignore(numeric_limits<streamsize>::max(), '\n');  // 丢弃无效输入
        continue;  // 回到循环顶部
    } else if (cin.good()) {  // 输入成功
        sum += number;  // 累加有效整数
    }
}

// 输出结果
cout << "Total sum: " << sum << endl;
```

```
# Input ###

Enter integers to sum them up. Type 'Ctrl+D' (Linux/macOS) or 'Ctrl+Z' (Windows) to finish.
Enter a number: 10
Enter a number: 20
Enter a number: hello
Invalid input. Please enter a valid integer.
Enter a number: 30
Enter a number: (Ctrl+D or Ctrl+Z)

# Output ###

Enter integers to sum them up. Type 'Ctrl+D' (Linux/macOS) or 'Ctrl+Z' (Windows) to finish.
Enter a number: 10
Enter a number: 20
Enter a number: hello
Invalid input. Please enter a valid integer.
Enter a number: 30
Enter a number: End of input detected. Exiting...
Total sum: 60
```

# 缓冲区

缓冲区是一个中间存储区域，用来临时存储从输入设备读取的数据或即将输出到输出设备的数据。它的主要作用是提高性能，因为与硬件设备直接交互的操作相对耗时。

当用户通过键盘输入时，所有输入的字符会先存入输入缓冲区，直到按下 Enter 键。然后，程序从缓冲区中读取数据。

- 用户输入的内容不会立即传递给程序，只有按下 Enter 键后，输入才会生效。
- 输入缓冲区会保留未使用的数据，供后续读取

当程序使用 cout 进行输出时，数据会先存入输出缓冲区，并不会立即显示在控制台上：

- 当遇到换行符（endl 或 '\n'）时，缓冲区的内容会被刷新到屏幕。
- 如果程序正常结束（例如 return 0），缓冲区也会被自动刷新。
- 也可以手动调用 std::flush 来强制刷新输出缓冲区。

缓冲区的工作流程

```cpp
char c1, c2;
cout << "Enter two characters: ";
cin >> c1 >> c2;  // 连续读取两个字符
cout << "First: " << c1 << ", Second: " << c2 << endl;
```

- 用户输入 A，然后按下空格，输入 B，最后按下 Enter。
- 键入的字符 A 和 B 进入输入缓冲区，缓冲区内容为：A B\n。
- cin >> c1 读取第一个字符 A，cin >> c2 读取第二个字符 B。
- 缓冲区在读取后清空。

缓冲区的延迟输出问题：

```cpp
cout << "Hello, ";
sleep(2);  // 等待 2 秒
cout << "World!" << endl;
```

```
（等待 2 秒后）Hello, World!
```

通过手动刷新缓冲区，解决延迟输出问题

```cpp
cout << "Hello, ";
cout.flush();  // 手动刷新输出缓冲区
sleep(2);      // 等待 2 秒
cout << "World!" << endl;
```

```
Hello, （等待 2 秒后）World!
```

# 缓冲区的残留问题

缓冲区残留问题指的是，当你从标准输入（如键盘）中读取数据时，输入缓冲区可能会保留未处理的字符（如换行符 \n、空格等），这些残留字符可能会导致后续的输入操作行为异常。

---

**cin 和 getline() 混用时的缓冲区残留**

```cpp
int number;
string line;

cout << "Enter a number: ";
cin >> number;  // 输入一个整数

cout << "Enter a line: ";
getline(cin, line);  // 尝试读取一整行

cout << "Number: " << number << ", Line: " << line << endl;
```

```
# Input ###

42
Hello, World!

# Output ###

Enter a number: 42
Enter a line: Number: 42, Line:
```

- 当 cin >> number 读取了整数 42 时，用户按下 Enter，产生了一个换行符 \n，但 cin 不会读取这个换行符。
- 换行符 \n 仍然留在输入缓冲区中。
- 当 getline(cin, line) 被调用时，它会直接读取缓冲区中的换行符，认为用户输入了一整行空行，结果 line 为空。

---

**连续使用 cin 读取字符或字符串**

```cpp
char c1, c2;

cout << "Enter the first character: ";
cin >> c1;  // 读取第一个字符

cout << "Enter the second character: ";
cin >> c2;  // 读取第二个字符

cout << "First: " << c1 << ", Second: " << c2 << endl;
```

```
# Input ###

A
B

# Output ###

Enter the first character: A
Enter the second character: B
First: A, Second: B
```

- 用户输入 A 后按下 Enter，换行符 \n 留在缓冲区中。
- 第二次调用 cin >> c2 时，它会跳过换行符，等待用户输入新的字符。
- 这可能会给用户带来困惑，因为程序没有明显提示换行符的作用。

---

**使用 cin.ignore() 丢弃残留字符**

```cpp
cin.ignore(1000, '\n');  // 丢弃缓冲区中最多 1000 个字符，直到遇到换行符

cin.ignore(); // 丢弃缓冲区中的 1 个字符

cin.ignore(2); // 丢弃缓冲区中的 2 个字符
```

```cpp
int number;
string line;

cout << "Enter a number: ";
cin >> number;  // 读取整数

cin.ignore(1000, '\n');  // 清除缓冲区中残留的换行符

cout << "Enter a line: ";
getline(cin, line);  // 正常读取一整行

cout << "Number: " << number << ", Line: " << line << endl;
```

# 文本文件操作

写入文本文件：

```cpp
#include <iostream>
#include <fstream>

int main() {
    // 创建 ofstream 对象，表示输出文件流
    std::ofstream outfile("example.txt");

    // 检查文件是否成功打开
    if (!outfile.is_open()) {
        std::cerr << "Failed to open file for writing." << std::endl;
        return 1;
    }

    // 写入内容
    outfile << "Hello, C++ File Operations!" << std::endl;
    outfile << "This is the second line." << std::endl;

    // 关闭文件
    outfile.close();

    std::cout << "Data written to example.txt" << std::endl;

    return 0;
}
```

读取文本文件：

```cpp
#include <iostream>
#include <fstream>
#include <string>

int main() {
    // 创建 ifstream 对象，表示输入文件流
    std::ifstream infile("example.txt");

    // 检查文件是否成功打开
    if (!infile.is_open()) {
        std::cerr << "Failed to open file for reading." << std::endl;
        return 1;
    }

    // 按行读取文件内容
    std::string line;
    while (std::getline(infile, line)) {
        std::cout << line << std::endl;
    }

    // 关闭文件
    infile.close();

    return 0;
}
```

读写同一个文本文件

```cpp
#include <iostream>
#include <fstream>

int main() {
    // 创建 fstream 对象，表示输入输出文件流
    std::fstream file("example.txt", std::ios::in | std::ios::out);

    // 检查文件是否成功打开
    if (!file.is_open()) {
        std::cerr << "Failed to open file for reading and writing." << std::endl;
        return 1;
    }

    // 读取文件的第一行
    std::string line;
    if (std::getline(file, line)) {
        std::cout << "First line: " << line << std::endl;
    }

    // 在文件末尾追加内容
    file.clear();  // 清除 EOF 标志
    file.seekp(0, std::ios::end); // 移动写指针到文件末尾
    file << "This is an appended line." << std::endl;

    // 关闭文件
    file.close();

    std::cout << "Data appended to example.txt" << std::endl;

    return 0;
}
```

# 二进制文件操作

C++ 支持通过二进制模式操作文件，适合处理非文本数据。

写入二进制文件：

```cpp
#include <iostream>
#include <fstream>

int main() {
    // 创建输出文件流，使用二进制模式
    std::ofstream outfile("data.bin", std::ios::binary);

    // 写入数据
    int number = 42;
    double pi = 3.14159;

    outfile.write(reinterpret_cast<char*>(&number), sizeof(number));
    outfile.write(reinterpret_cast<char*>(&pi), sizeof(pi));

    outfile.close();

    std::cout << "Binary data written to data.bin" << std::endl;

    return 0;
}
```

读取二进制文件：

```cpp
#include <iostream>
#include <fstream>

int main() {
    // 创建输入文件流，使用二进制模式
    std::ifstream infile("data.bin", std::ios::binary);

    // 检查文件是否成功打开
    if (!infile.is_open()) {
        std::cerr << "Failed to open binary file for reading." << std::endl;
        return 1;
    }

    // 读取数据
    int number;
    double pi;

    infile.read(reinterpret_cast<char*>(&number), sizeof(number));
    infile.read(reinterpret_cast<char*>(&pi), sizeof(pi));

    infile.close();

    // 输出读取的内容
    std::cout << "Read number: " << number << std::endl;
    std::cout << "Read pi: " << pi << std::endl;

    return 0;
}
```

# 文件描述符

FD 是一个小的整数，是操作系统级别的抽象，用于表示操作系统打开的文件、套接字或管道。FD 由系统调用（例如，open）生成，从 0 开始，标准输入、输出和错误分别对应 0、1 和 2。

在底层，文件描述符是内核中的索引。每个文件描述符指向一个内核数据结构，称为文件表项，其中存储了文件的元信息，文件表项本身是进程文件表中的一部分，且进一步指向系统全局的文件信息。

- 文件位置指针：标记文件的当前读/写位置。
- 访问模式：只读、只写或读写。
- 引用计数：表明有多少进程共享该描述符。

CPP 标准库中的 fstream 底层依赖 C 标准库（例如，fopen），而 C 标准库底层依赖系统调用（例如，open），所以 CPP 也允许获取文件描述符用于与 C API 交互。

```cpp
int fd = open("example_fd.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
if (fd == -1) {
    perror("Error opening file");
    return 1;
}

const char* message = "Hello, File Descriptor!\n";
write(fd, message, strlen(message)); // 写入数据到文件

close(fd); // 关闭文件描述符
```

