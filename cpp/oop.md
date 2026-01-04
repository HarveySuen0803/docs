# OOP

```cpp
class Animal {
private:
    std::string name;
    int age;

public:
    Animal(const std::string& name, int age) : name(name), age(age) {
        std::cout << "Animal constructor called." << std::endl;
    }

    virtual ~Animal() {
        std::cout << "Animal destructor called." << std::endl;
    }

    virtual void sayHello() {
        std::cout << "Aniaml sayHello" << std::endl;
    }
};

class Dog : public Animal {
private:
    std::string color;
    std::string* hobies;

public:
    Dog(const std::string& name, int age, const std::string& color) 
        : Animal(name, age), color(color) {
        std::cout << "Dog constructor called." << std::endl;
    }

    Dog(const std::string& name, int age)
        : Animal(name, age) {
        std::cout << "Dog constructor called." << std::endl;
    }

    ~Dog() override {
        delete[] hobies;
        std::cout << "Dog destructor called." << std::endl;
    }

    void sayHello() override {
        std::cout << "Dog sayHello" << std::endl;
    }
};

class Cat : public Animal {
private:
    std::string color;
    
public:
    Cat(const std::string& name, int age, const std::string& color)
        : Animal(name, age), color(color) {
        std::cout << "Cat constructor called." << std::endl;
    }

    ~Cat() override {
        std::cout << "Dog destructor called." << std::endl;
    }

    void sayHello() override {
        std::cout << "Cat sayHello" << std::endl;
    }
};

int main() {
    Animal* animal = new Animal("harvey", 18);
    Animal* dog = new Dog("brutus", 20, "yellow");
    Animal* cat = new Cat("jerry", 22, "brown");

    animal->sayHello();
    dog->sayHello();
    cat->sayHello();

    delete animal;
    delete dog;
    delete cat;
    
    return 0;
}
```

# 构造器

采用赋值实现构造器：

```cpp
class Animal {
private:
    std::string name;
    int age;

public:
    Animal(const std::string& name, int age) {
        this->name = name;
        this->age = age;
    }
};
```

采用初始化列表实现构造器：

```cpp
class Animal {
private:
    std::string name;
    int age;

public:
    Animal(const std::string& name, int age) : name(name), age(age) {}
};
```

成员变量直接初始化，避免了默认构造和赋值操作，特别是对于复杂类型（如 std::string）。常量（const）和引用（&）必须使用初始化列表。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412041840835.png)

# 析构器

基类的析构函数应该声明为 virtual，确保派生类的资源能被正确释放。如果基类的析构函数没有声明为 virtual，通过基类指针删除派生类对象时，只会调用基类的析构函数，派生类的析构函数不会被调用。导致派生类中定义的资源（如动态分配的内存或其他独特的属性）无法被正确释放，从而引起内存泄漏。

```cpp
class Animal {
private:
    std::string name;
    int age;

public:
    Animal(const std::string& name, int age) : name(name), age(age) {
        std::cout << "Animal constructor called." << std::endl;
    }

    virtual ~Animal() {
        std::cout << "Animal destructor called." << std::endl;
    }
};

class Dog : public Animal {
private:
    std::string color;
    std::string* hobies;

public:
    Dog(const std::string& name, int age, const std::string& color) 
        : Animal(name, age), color(color) {
        std::cout << "Dog constructor called." << std::endl;
    }

    ~Dog() override {
        delete[] hobies;
        std::cout << "Dog destructor called." << std::endl;
    }
};

```

# 继承修饰符

C++ 区别于 Java，可以由子类来控制继承的级别：

- public 继承：基类的 public 和 protected 成员在派生类中保持不变，private 成员仍不可访问。
- protected 继承：基类的 public 成员在派生类中变为 protected，protected 成员保持不变，private 成员仍不可访问。
- private 继承（默认继承方式）：基类的 public 和 protected 成员在派生类中都变为 private，private 成员仍不可访问。

```cpp
class Animal {
public:
    void publicMethod() { std::cout << "Animal public method" << std::endl; }
protected:
    void protectedMethod() { std::cout << "Animal protected method" << std::endl; }
private:
    void privateMethod() { std::cout << "Animal private method" << std::endl; }
};

class Dog : Animal { // 默认 private 继承
public:
    void accessMethods() {
        publicMethod();     // 合法：原 public 成员在 Dog 中变为 private，但派生类内部仍可访问
        protectedMethod();  // 合法：原 protected 成员在 Dog 中变为 private，但派生类内部仍可访问
        // privateMethod(); // 不合法：基类的 private 成员永远不可访问
    }
};

int main() {
    Dog d;
    // d.publicMethod(); // 不合法：原 public 成员在 Dog 中变为 private，对外不可访问
    d.accessMethods();   // 合法
    return 0;
}
```

```
Animal public method
Animal protected method
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412041826318.png)

# 虚拟函数

子类想要实现重写，就必须要求父类在指定方法上添加 virtual，将该方法标记为虚拟函数，否则无法动态绑定子类的重写方法。

虚拟函数可以有默认实现，如果子类没有实现，就会采用父类的默认实现。

```cpp
class Animal {
private:
    std::string name;
    int age;

public:
    Animal(const std::string& name, int age) : name(name), age(age) {}

    // 必须打上 virtual，不然无法实现多态子类的动态绑定
    virtual void sayHello() {
        std::cout << "Aniaml sayHello" << std::endl;
    }
};

class Dog : public Animal {
private:
    std::string color;

public:
    Dog(const std::string& name, int age, const std::string& color) 
        : Animal(name, age), color(color) {}

    Dog(const std::string& name, int age)
        : Animal(name, age) {}

    // 显示声明 override 表示重写
    void sayHello() override {
        std::cout << "Dog sayHello" << std::endl;
    }
};
```

可以定义纯虚函数，即父类不给出默认实现，必须要求子类重写，否则子类也会变为抽象类，就类似于 Java 的 abstract。

```cpp
class Animal {
private:
    std::string name;
    int age;

public:
    Animal(const std::string& name, int age) : name(name), age(age) {}

    // 定义 sayHello() 为纯虚函数
    virtual void sayHello() = 0;
};

class Dog : public Animal {
private:
    std::string color;

public:
    Dog(const std::string& name, int age, const std::string& color) 
        : Animal(name, age), color(color) {}

    Dog(const std::string& name, int age)
        : Animal(name, age) {}

    // 子类必须要实现，否则 Dog 将变为抽象类，无法实例化
    void sayHello() override {
        std::cout << "Dog sayHello" << std::endl;
    }
};
```

# 虚析构函数

如果一个类被用作基类，并且可能通过基类指针指向派生类对象，如 `Base* b = new Derived;`，如果基类的析构函数不是虚函数，当执行 `delete b` 时，只会调用基类的析构函数，而不会调用派生类的析构函数。

```cpp
#include <iostream>

class Base {
public:
    ~Base() { std::cout << "Base 析构函数\n"; }
};

class Derived : public Base {
public:
    ~Derived() { std::cout << "Derived 析构函数\n"; }
};

int main() {
    Base* b = new Derived;
    delete b; // 只调用 Base 的析构函数
    return 0;
}
```

通过在基类析构函数前加 virtual，保证 delete 基类指针时 能调用正确的析构函数链，先析构派生类，再析构基类：

```cpp
#include <iostream>

class Base {
public:
    virtual ~Base() { std::cout << "Base 析构函数\n"; }
};

class Derived : public Base {
public:
    ~Derived() { std::cout << "Derived 析构函数\n"; }
};

int main() {
    Base* b = new Derived;
    delete b; // 调用 Derived 析构函数，再调用 Base 析构函数
    return 0;
}
```

```
Derived 析构函数
Base 析构函数
```

# 默认实现

特殊成员函数（如构造函数、析构函数、拷贝构造、赋值运算符等）可以通过 default 关键字来指示编译器生成函数的默认实现。

```cpp
class Resource {
public:
    Resource() = default; // 默认构造函数
    Resource(const Resource&) = delete; // 禁用拷贝构造函数
    Resource& operator=(const Resource&) = delete; // 禁用拷贝赋值运算符

    Resource(Resource&&) = default; // 显式恢复移动构造函数

    void show() const {
        std::cout << "Resource instance" << std::endl;
    }
};

int main() {
    Resource r1;
    // Resource r2 = r1; // 错误！拷贝构造函数被删除
    Resource r3 = std::move(r1); // 可以，移动构造函数被显式恢复

    r3.show(); // 输出：Resource instance

    return 0;
}
```

# 静态成员

静态成员在整个程序运行期间只占用一块内存（即类的所有对象共享同一份静态成员数据）。

```cpp
class Logger {
private:
    static string logLevel;  // 静态数据成员
public:
    static void setLogLevel(const string& level) {  // 静态成员函数
        logLevel = level;
    }

    static string getLogLevel() {  // 静态成员函数
        return logLevel;
    }
};

// 在类外初始化静态数据成员
string Logger::logLevel = "INFO";

int main() {
    cout << "Default Log Level: " << Logger::getLogLevel() << endl;

    Logger::setLogLevel("DEBUG");  // 调用静态函数修改静态变量
    cout << "Updated Log Level: " << Logger::getLogLevel() << endl;

    return 0;
}
```

如果静态成员是整型常量（int、short、long、long long、char、bool），并且其值在编译期已知，可以在类内直接初始化。

```cpp
class Example {
public:
    static const int staticConst = 10;  // 类内初始化
};
```

# 栈上创建对象

栈上创建对象是指在栈内存中分配对象的空间，通常是在函数作用域内直接声明对象（非指针），它的生命周期与作用域一致。当离开作用域时，栈上对象会被自动销毁，其析构函数会自动调用。

```cpp
Animal animal = Animal("harvey", 18); // 此处的 animal 是对象
animal.sayHello(); // animal 是对象，使用 "." 访问成员
```

采用简写的方式创建对象：

```cpp
// 无参构造器
Animal animal;
// 有参构造器
Animal animal("harvey", 18);
```

采用隐式调用的方式创建对象：

```cpp
Animal animal = {};
Animal animal = {"harvey", 18};
```

# 堆上创建对象

使用 new 创建的对象分配在堆上，指针 animal 保存该对象的地址，通过指针访问对象的成员，需使用箭头操作符 ->。

- 堆上对象的生命周期由程序员控制，必须使用 delete 手动释放内存。
- 如果未释放，也会导致内存泄漏。

```cpp
Animal* animal = new Animal("harvey", 18); // 此处的 animal 是指针，指向堆上的对象
animal->sayHello(); // animal 是指针，使用 "->" 访问成员
(*animal).sayHello(); // 对 animal 进行解引用，得到具体的对象后，使用 "." 访问成员
delete animal;
```

使用 new Animal 在堆上分配了一个 Animal 对象，然后通过解引用操作符 * 将堆上对象的值拷贝到栈上的对象 animal，所以这里创建了两个对象。

- 栈上的对象 animal 的生命周期由作用域决定，作用域结束时自动销毁，但是，new 创建的堆上对象没有释放，导致内存泄漏。

```cpp
Animal animal = *new Animal("harvey", 18);
animal.sayHello();
```

使用智能指针管理堆上的对象，在离开作用域时自动释放资源，避免内存泄漏。

```cpp
unique_ptr<Animal> animal = make_unique<Animal>("harvey", 18);
animal->sayHello();
```

# 类型转换操作符

类型转换操作符是一个特殊的成员函数，用于将自定义类型的对象转换为其他类型。这种类型转换通常由开发者显式定义，以支持类之间或与基础类型之间的类型转换。

```cpp

class Fraction {
private:
    int numerator;   // 分子
    int denominator; // 分母
public:
    Fraction(int num, int den) : numerator(num), denominator(den) {}

    // 类型转换操作符，将 Fraction 转换为 int
    operator int() const {
        return numerator / denominator;
    }
};

int main() {
    Fraction frac(7, 2);

    int result = frac; // 自动调用类型转换操作符
    cout << "Result as int: " << result << endl;

    return 0;
}
```

- frac 是一个 Fraction 对象。
- 通过定义 operator int() const，允许将 frac 隐式转换为 int 类型。

将一个类对象转换为另一个类对象：

```cpp
class Person {
private:
    string name;
    int age;
public:
    Person(string n, int a) : name(n), age(a) {}

    string getName() const { return name; }
    int getAge() const { return age; }
};

class Student {
private:
    string name;
    int age;
public:
    Student(const Person& person) : name(person.getName()), age(person.getAge()) {
        cout << "Student created from Person!" << endl;
    }

    void introduce() const {
        cout << "I am " << name << ", " << age << " years old." << endl;
    }
};

int main() {
    Person person("Alice", 20);

    Student student = person; // 自动调用类型转换操作符
    student.introduce();

    return 0;
}
```

# 重载运算符

运算符重载是指为自定义的类赋予特定的运算符行为，使其能够像基础数据类型一样使用运算符。运算符重载通过定义特殊形式的函数实现。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412062155968.png)

```cpp
class Complex {
private:
    double real, imag;

public:
    Complex(double r, double i) : real(r), imag(i) {}

    // 重载加法运算符，operator+ 被定义为成员函数。
    Complex operator+(const Complex& other) const {
        return Complex(real + other.real, imag + other.imag);
    }

    void display() const {
        cout << real << " + " << imag << "i" << endl;
    }
};

int main() {
    Complex c1(1.0, 2.0), c2(3.0, 4.0);

    Complex c3 = c1 + c2;  // 调用重载后的加法运算符
    c3.display();

    return 0;
}
```

重载比较运算符 operator== 实现对象的比较：

```cpp
class Person {
private:
    string name;
    int age;

public:
    Person(string n, int a) : name(n), age(a) {}

    // 重载比较运算符 ==
    bool operator==(const Person& other) const {
        return name == other.name && age == other.age;
    }
};

int main() {
    Person p1("Alice", 30), p2("Alice", 30), p3("Bob", 25);

    cout << (p1 == p2) << endl;  // 输出 1（true）
    cout << (p1 == p3) << endl;  // 输出 0（false）

    return 0;
}
```

重载运算符 operator() 可以将对象作为函数对象使用：

```cpp
struct ByAge {
    bool operator()(const Person& a, const Person& b) const { // 重载 operator()
        if (a.age != b.age)
            return a.age < b.age;
        return a.name < b.name; // 如果年龄相同，用名字区分
    }
};

int main() {
    ByAge cmp;
    Person a{"Alice", 30}, b{"Bob", 25};
    bool result = cmp(a, b); // 重载了 operator()，可以将 cmp 当作是函数对象使用，实际调用 cmp.operator()(a, b)
}
```



# 隐式转换

如果一个构造函数可以接受单个参数，而没有使用 explicit 修饰，它会被编译器视为隐式类型转换构造函数。这可能导致非预期的隐式类型转换行为，进而引发潜在的错误。

```cpp
class Animal {
public:
    Animal(int age) {  // 单参数构造函数，没有 explicit 修饰
        cout << "Animal created, age: " << age << endl;
    }
};

void printAnimal(const Animal& animal) {
    cout << "Animal is valid!" << endl;
}

int main() {
    Animal animal = 5;  // 隐式调用构造函数，等效于 Animal animal(5);
    printAnimal(10);    // 隐式转换 int -> Animal

    return 0;
}
```

- 隐式转换：Animal animal = 5 和 printAnimal(10) 都触发了隐式类型转换，可能导致误用。
- 代码易出错：调用 printAnimal 时，本意可能是传递一个已有的 Animal 对象，但实际上可以无意间传入整数。

使用 explicit 修饰避免隐式转换：

```cpp
class Animal {
public:
    explicit Animal(int age) {  // 使用 explicit 修饰
        cout << "Animal created, age: " << age << endl;
    }
};

void printAnimal(const Animal& animal) {
    cout << "Animal is valid!" << endl;
}

int main() {
    // Animal animal = 5;  // 错误：隐式类型转换被禁止
    Animal animal(5);       // 正确：显式调用构造函数
    printAnimal(animal);    // 正确

    // printAnimal(10);  // 错误：隐式转换被禁止

    return 0;
}
```

使用 explicit 限制类型转换操作符，避免隐式类型转换。

```cpp
class Fraction {
private:
    int numerator, denominator;

public:
    Fraction(int num, int den) : numerator(num), denominator(den) {}

    explicit operator double() const { // 显式类型转换操作符
        return static_cast<double>(numerator) / denominator;
    }
};

int main() {
    Fraction frac(3, 4);

    // double result = frac;  // 错误：显式转换操作符禁止隐式转换
    double result = static_cast<double>(frac); // 正确：显式调用

    cout << "Result as double: " << result << endl;

    return 0;
}
```

- 使用 explicit 修饰类型转换操作符，禁止隐式类型转换。
- 必须通过 static_cast 或其他显式方式调用类型转换操作符。

# 创建对象

```cpp
MyClass obj1; // 调用构造函数

MyClass obj2 = obj1; // 调用拷贝构造函数

MyClass obj3 = std::move(obj2); // obj3 还没创建，接受到右值时，调用移动构造函数

MyClass obj4;
MyClass obj4 = std::move(obj3); // obj4 已经创建，接受到右值时，调用移动赋值函数
```

# 拷贝构造

拷贝构造函数是一种特殊构造函数，用于创建一个对象，并用同类的另一个对象对其初始化。通常用于对象的拷贝操作。

```cpp
class Animal {
private:
    std::string name;
    int age;

public:
    Animal(const std::string& name, int age) : name(name), age(age) {
        std::cout << "Animal constructor called." << std::endl;
    }

    // 拷贝构造函数
    Animal(const Animal& animal): name(animal.name), age(animal.age) {
        std::cout << "Animal copy constructor called." << std::endl;
    }

    virtual ~Animal() {
        std::cout << "Animal destructor called." << std::endl;
    }

    virtual void sayHello() {
        std::cout << "Aniaml sayHello" << std::endl;
    }
};
```

```cpp
// 在栈上创建一个 animal1 对象
Animal animal1 = Animal("harvey", 18);
// 复制 animal1 对象，注意这里和 Java 的区别，在 Java 中，这里是引用，会指向同一个对象
// 这里是调用了 Animal 的拷贝构造函数
Animal animal2 = animal1;

cout << &animal1 << endl; // 0x16fdfeea0
cout << &animal2 << endl; // 0x16fdfee50
```

如果没有指定拷贝构造函数，则编译器生成了一个默认拷贝构造函数，对对象成员逐字节拷贝（浅拷贝）。

默认拷贝构造函数是由编译器自动生成的构造函数，执行逐成员拷贝（即按字节拷贝对象的成员变量）。如果类中包含指针或动态分配的资源，浅拷贝可能导致多个对象共享同一块内存，从而引发问题，例如双重释放（Double Free）或资源冲突。

```cpp
class Example {
private:
    int* data; // 动态分配的内存

public:
    // 构造函数
    Example(int value) {
        data = new int(value); // 动态分配内存
        cout << "Constructor called. Data: " << *data << endl;
    }

    // 默认拷贝构造函数（由编译器生成）
    // Example(const Example& other);

    // 打印数据
    void print() const {
        cout << "Data: " << *data << endl;
    }

    // 析构函数
    ~Example() {
        cout << "Destructor called. Data: " << *data << endl;
        delete data; // 释放动态分配的内存
    }
};

int main() {
    Example obj1(10);     // 调用构造函数
    Example obj2 = obj1;  // 调用默认拷贝构造函数（浅拷贝）

    obj1.print();
    obj2.print();

    // 由于是浅拷贝，所有 obj1 和 obj2 的 int* data 指向了同一个地址
    // 执行结束后，会分别释放 obj1 和 obj2 的空间，分别调用析构函数
    // 就会执行两次 delete data，导致未定义行为
    return 0; 
}
```

# 拷贝赋值

```cpp
class MyClass {
private:
    char* data; // 指向动态分配的内存
public:
    // **构造函数**
    MyClass(const char* str) {
        data = new char[strlen(str) + 1]; // 分配内存
        strcpy(data, str);
        cout << "构造: " << data << endl;
    }

    // **拷贝构造**
    MyClass(const MyClass& other) {
        data = new char[strlen(other.data) + 1];
        strcpy(data, other.data);
        cout << "拷贝构造: " << data << endl;
    }

    // **拷贝赋值运算符**
    MyClass& operator=(const MyClass& other) {
        if (this != &other) {  // 避免自赋值
            delete[] data;  // 释放原有资源
            data = new char[strlen(other.data) + 1];
            strcpy(data, other.data);
            cout << "拷贝赋值: " << data << endl;
        }
        return *this;
    }

    // **析构函数**
    ~MyClass() {
        cout << "析构: " << (data ? data : "nullptr") << endl;
        delete[] data;
    }
};

int main() {
    MyClass obj1("Hello");
    MyClass obj2("World");

    cout << "\n== 左值赋值（拷贝赋值） ==" << endl;
    obj2 = obj1;  // **调用拷贝赋值运算符**

    return 0;
}
```

```
构造: Hello
构造: World

== 左值赋值（拷贝赋值） ==
拷贝赋值: Hello

析构: Hello
析构: Hello
```

# 移动构造

移动构造函数 是 C++11 引入的一种特殊的构造函数，用于将一个对象的资源从一个对象“移动”到另一个对象，而不是进行传统的深拷贝。它通常与右值引用（T&&）配合使用，用于实现 移动语义，提高性能。

大多数情况下，一个类需要同时实现拷贝构造和移动构造，以适应不同的场景。

```cpp
#include <iostream>
#include <cstring>

class MyString {
public:
    // 构造函数
    MyString(const char* str) {
        size_ = std::strlen(str) + 1;
        data_ = new char[size_];
        std::strcpy(data_, str);
        std::cout << "Constructed: " << data_ << std::endl;
    }

    // 拷贝构造函数（深拷贝）
    MyString(const MyString& other) {
        size_ = other.size_;
        data_ = new char[size_];
        std::strcpy(data_, other.data_);
        std::cout << "Copied: " << data_ << std::endl;
    }

    // 移动构造函数
    MyString(MyString&& other) noexcept
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr; // 转移资源后清空原对象的数据指针
        other.size_ = 0;
        std::cout << "Moved: " << data_ << std::endl;
    }

    // 析构函数
    ~MyString() {
        delete[] data_;
        std::cout << "Destroyed: " << (data_ ? data_ : "null") << std::endl;
    }

private:
    char* data_;
    size_t size_;
};

int main() {
    MyVector v1(10);       // 调用默认构造函数
    MyVector v2 = v1;      // 调用拷贝构造函数
    MyVector v3 = std::move(v1); // 调用移动构造函数
    return 0;
}
```

```
Constructed
Copied
Moved
Destroyed
Destroyed
Destroyed
```

C++ 标准库的容器（如 std::vector 和 std::string）广泛使用移动构造函数，优化性能。

```cpp
std::vector<std::string> vec;

std::string temp = "Hello";
vec.push_back(temp);           // 拷贝 temp
vec.push_back(std::move(temp)); // 移动 temp

std::cout << "vec[0]: " << vec[0] << std::endl;
std::cout << "vec[1]: " << vec[1] << std::endl;
```

- push_back(temp) 调用了拷贝构造，temp 被复制到容器中。
- push_back(std::move(temp)) 调用了移动构造，temp 的内容直接转移到容器中，无需额外的内存分配。

# 移动赋值

```cpp
class MyClass {
private:
    char* data;
public:
    // **构造函数**
    MyClass(const char* str) {
        data = new char[strlen(str) + 1];
        strcpy(data, str);
        cout << "构造: " << data << endl;
    }

    // **拷贝构造**
    MyClass(const MyClass& other) {
        data = new char[strlen(other.data) + 1];
        strcpy(data, other.data);
        cout << "拷贝构造: " << data << endl;
    }

    // **移动构造**
    MyClass(MyClass&& other) noexcept {
        data = other.data;
        other.data = nullptr;  // 清空原对象
        cout << "移动构造: " << (data ? data : "nullptr") << endl;
    }

    // **拷贝赋值**
    MyClass& operator=(const MyClass& other) {
        if (this != &other) {
            delete[] data;
            data = new char[strlen(other.data) + 1];
            strcpy(data, other.data);
            cout << "拷贝赋值: " << data << endl;
        }
        return *this;
    }

    // **移动赋值**
    MyClass& operator=(MyClass&& other) noexcept {
        if (this != &other) {
            delete[] data;  // 释放当前对象的旧资源
            data = other.data;  // 直接接管资源
            other.data = nullptr;  // 清空右值对象
            cout << "移动赋值: " << (data ? data : "nullptr") << endl;
        }
        return *this;
    }

    // **析构函数**
    ~MyClass() {
        cout << "析构: " << (data ? data : "nullptr") << endl;
        delete[] data;
    }
};

int main() {
    MyClass obj1("Hello");
    MyClass obj2("World");

    cout << "\n== 右值赋值（移动赋值） ==" << endl;
    obj2 = std::move(obj1);  // **调用移动赋值运算符**

    return 0;
}
```

```
构造: Hello
构造: World

== 右值赋值（移动赋值） ==
移动赋值: Hello

析构: nullptr
析构: Hello
```

# 继承构造函数

可以使用 using Base::Base 的语法继承父类的所有构造器。

```cpp
class Person {
public:
    Person(std::string name, int age) {
        std::cout << "Person: " << name << ", " << age << std::endl;
    }
};

class Student : public Person {
public:
    using Person::Person; // 继承所有构造函数
};

int main() {
    Student s("Tom", 20); // ✅ OK，自动调用 Person(std::string, int)
}
```

这里 Student 没有构造器，并且没有使用 using 继承 Person 的构造器，即编译器报错。

```cpp
class Person {
public:
    Person(std::string name, int age) {
        std::cout << "Person: " << name << ", " << age << std::endl;
    }
};

class Student : public Person {
    // ❌ 没有 using，也没有构造函数
};

int main() {
    Student s("Tom", 20); // ❌ 编译错误：Student 没有匹配的构造函数
}
```

# 访问成员

```cpp
int value = 100; // 全局变量

class Parent {
public:
    int value;

    Parent(int v) : value(v) {}

    void showValue() {
        cout << "Parent value: " << value << endl;
    }
};

class Child : public Parent {
public:
    int value;

    Child(int parentValue, int childValue)
        : Parent(parentValue), value(childValue) {}

    void showValues() {
        int value = 50; // 局部变量

        cout << "Local value: " << value << endl;       // 局部变量
        cout << "Child value: " << this->value << endl; // 当前类成员变量
        cout << "Parent value: " << Parent::value << endl; // 基类成员变量
        cout << "Global value: " << ::value << endl;    // 全局变量
    }
};
```

```cpp
Local value: 50
Child value: 20
Parent value: 10
Global value: 100
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412062102182.png)

# 初始化器

C++20 借鉴 C23，支持按名字指定成员初始化，顺序可任意：

```cpp
struct Color { int r, g, b, a; };

// 只设置部分成员
Color c1{ .g = 128, .r = 255 };  
// 等价于：r=255, g=128, b=0, a=0

// 任意顺序
Color c2{ .a = 200, .b = 50, .r = 10 };  
// 其余成员零初始化
```

# 聚合初始化

聚合初始化使用一对花括号 {…}，按成员声明顺序逐个提供初始值。

```cpp
truct Point { 
    int x; 
    int y; 
};

// 传统方式
Point p1 = { 10, 20 };   // p1.x = 10, p1.y = 20

// C++11 统一初始化
Point p2{ 30, 40 };      // p2.x = 30, p2.y = 40
```

- 若初始器列表中元素 少于 成员数，则剩余成员 零初始化（内置类型为 0）。
- 若元素 多于 成员数，则编译错误。

数组也是聚合理性，本质上也是采用的聚合初始化，未显式初始化的元素会被置为 0。

```cpp
int a1[5] = { 1, 2, 3 };  // 等价于 {1,2,3,0,0}
int a2[]   = { 4, 5, 6 };  // 编译器自动推断大小为 3
```

---

嵌套聚合初始化。

```cpp
struct Rect {
    Point topLeft;
    Point bottomRight;
};

Rect r = { {0,0}, {100,100} };
// 等同于：
// r.topLeft.x = 0;  r.topLeft.y = 0;
// r.bottomRight.x = 100;  r.bottomRight.y = 100;
```

对于多层嵌套的聚合，如果最内层依次只有一个聚合，也可省略中间的 {}。

```cpp
Rect r2 = {  {0,0}, {100,100} };  
// 更省略也合法（但可读性差）：
Rect r3 = { 0,0, 100,100 };
```

---

如果聚合成员提供了默认成员初始化器，聚合初始化时，未显式赋值的成员会使用它们的默认值。

```cpp
struct Config {
    int width  = 800;
    int height = 600;
    bool fullscreen = false;
};

// 部分初始化
Config cfg1 = { 1024, 768 };    
// cfg1.width=1024, cfg1.height=768, cfg1.fullscreen=false

// 全部使用默认
Config cfg2 = {};  
// cfg2.width=800, cfg2.height=600, cfg2.fullscreen=false
```

std::array 在 C++11 起即为聚合类型，可直接使用聚合初始化。

```cpp
std::array<int,4> arr = { 1, 2, 3, 4 };
// C++17 以后可以省略模板参数，利用 CTAD（类模板参数推导）：
std::array arr2{ 5, 6, 7, 8 };
```

---

传递参数时可以用 {…} 构造一个匿名的 initializer_list 作为参数传递。

```cpp
void print_list(std::initializer_list<int> list) {
    std::cout << "size = " << list.size() << "\n";
    for (int x : list)   // 可用范围 for
        std::cout << x << " ";
    std::cout << "\n";
}

int main() {
    print_list({1, 2, 3, 5, 8});  // 直接传花括号
    // 输出：
    // size = 5
    // 1 2 3 5 8 
}
```

initializer_list 可以搭配模版类型推导使用。

```cpp
template<typename T>
void foo(std::initializer_list<T> list) {
    for (const auto &e : list) 
        std::cout << e << " ";
}

int main() {
    foo({10, 20, 30});      // T 推导为 int
    // foo({"a","b"});      // 错误：无法统一推导成同一 T
}
```

构造函数也可以接收 initializer_list。

```cpp
struct A {
    A(int);                            // (1)
    A(std::initializer_list<int>);     // (2)
};

A a2( 42 );    // 调用 (1)：括号初始化，不是 initializer_list
A a1{ 42 };    // 调用 (2)：initializer_list 版本
```

- {} 初始化会优先匹配 initializer_list 构造，其次才考虑其他构造函数。

结合这些特性，可以在构造对象时，实现下面这种复杂的嵌套构造。

```cpp
class Config {
public:
    Config(std::initializer_list<std::pair<std::string, int>> opts) {
        std::cout << "Config with " << opts.size() << " options\n";
        for (auto &p : opts)
            std::cout << "  " << p.first << " = " << p.second << "\n";
    }
    // 其它构造略…
};

int main() {
    Config cfg{ 
        {"width",  1024}, 
        {"height", 768}, 
        {"depth",  24} 
    };

    // 也可用于临时列表：
    std::vector<int> v = {1,2,3,4};
    for (int x : {10,20,30}) 
        std::cout << x << " ";  // 10 20 30
    std::cout << "\n";
}
```

- 把每一对 {name,value} 构造成 std::pair<std::string,int>，再收集到 initializer_list。

# 常函数

常函数的主要作用是保证函数不会修改调用对象的成员变量，从而提高代码的安全性和可读性。

- 不能修改类的成员变量（除非它们被声明为 mutable）。
- 不能调用类的非常函数（因为非常函数可能修改成员变量）。

```cpp
class Example {
private:
    int value;

public:
    Example(int v) : value(v) {}

    int getValue() const {  // 常函数
        return value;
    }

    void setValue(int v) {  // 非常函数
        value = v;
    }
};

int main() {
    Example obj(10);

    cout << "Value: " << obj.getValue() << endl;  // 调用常函数

    obj.setValue(20);  // 调用非常函数
    cout << "Updated Value: " << obj.getValue() << endl;

    return 0;
}
```

如果一个对象被声明为 const，则只能调用它的常函数，不能调用非常函数。

```cpp

class Example {
private:
    int value;

public:
    Example(int v) : value(v) {}

    int getValue() const {  // 常函数
        return value;
    }

    void setValue(int v) {  // 非常函数
        value = v;
    }
};

int main() {
    const Example obj(10);  // 常对象

    cout << "Value: " << obj.getValue() << endl;  // 调用常函数

    // obj.setValue(20);  // 错误：无法调用非常函数

    return 0;
}
```

常函数和非常函数可以基于 const 进行重载。

```cpp
public:
    Example(int v) : value(v) {}

    void print() {  // 非常函数
        cout << "Non-const print. Value: " << value << endl;
    }

    void print() const {  // 常函数
        cout << "Const print. Value: " << value << endl;
    }
};

int main() {
    Example obj(10);       // 非常对象
    const Example cobj(20); // 常对象

    obj.print();  // 调用非常函数
    cobj.print(); // 调用常函数

    return 0;
}
```

# 可变成员

尽管常函数不能修改对象的成员变量，但如果成员变量被声明为 mutable，则允许修改它。

```cpp

class Example {
private:
    mutable int accessCount;  // 可变成员变量
    int value;

public:
    Example(int v) : value(v), accessCount(0) {}

    int getValue() const {  // 常函数
        accessCount++;      // 修改 mutable 成员
        return value;
    }

    int getAccessCount() const {
        return accessCount;
    }
};

int main() {
    const Example obj(10);  // 常对象

    cout << "Value: " << obj.getValue() << endl;
    cout << "Access Count: " << obj.getAccessCount() << endl;

    cout << "Value: " << obj.getValue() << endl;
    cout << "Access Count: " << obj.getAccessCount() << endl;

    return 0;
}
```

# 友元

通常，类的成员变量是私有的，外部无法直接访问。如果某些外部函数或类需要对这些私有成员进行操作（但并非该类的成员），友元提供了一种安全的方式允许访问，而不需要公开这些成员。

友元是通过关键字 friend 声明的函数或类，允许它们访问某个类的私有（private）和保护（protected）成员。友元关系是单向的，即被声明为友元的函数或类可以访问指定类的私有成员，而反过来不成立。

全局友元函数，允许单个全局函数访问类的私有和保护成员。

```cpp
class Box {
private:
    double length;

public:
    Box(double l) : length(l) {}

    // 声明友元函数
    friend void printLength(const Box& b);
};

// 定义友元函数
void printLength(const Box& b) {
    cout << "Length of box: " << b.length << endl; // 访问私有成员
}

int main() {
    Box box(10.5);
    printLength(box); // 调用友元函数
    return 0;
}
```

成员友元函数，将另一个类的成员函数声明为友元，可以让该函数访问当前类的私有成员，从而实现类之间的协作。这样可以避免破坏封装性，同时保持灵活性。

```cpp
class Engine;  // 前向声明

class Car {
private:
    int speed;

public:
    Car(int s) : speed(s) {}

    // 声明 Engine 的成员函数为友元
    friend void Engine::showCarSpeed(const Car& car);
};

class Engine {
public:
    void showCarSpeed(const Car& car) {
        // 访问 Car 的私有成员 speed
        cout << "Car's speed is: " << car.speed << " km/h" << endl;
    }
};

int main() {
    Car car(120);
    Engine engine;

    engine.showCarSpeed(car);  // 调用 Engine 的友元方法访问 Car 的私有成员

    return 0;
}
```

友元类，允许整个类的所有成员函数访问另一个类的私有和保护成员。

```cpp
class Engine {
private:
    double horsepower;

public:
    Engine(double hp) : horsepower(hp) {}

    // 声明 Car 为友元类
    friend class Car;
};

class Car {
public:
    void displayEnginePower(const Engine& engine) {
        // 访问 Engine 的私有成员
        cout << "Engine horsepower: " << engine.horsepower << endl;
    }
};

int main() {
    Engine engine(300.0);
    Car car;

    car.displayEnginePower(engine); // 通过友元类访问私有成员

    return 0;
}
```

友元函数常用于运算符重载，尤其是当运算符的左操作数不是类类型时，必须将其定义为友元函数。

```cpp
class Complex {
private:
    double real, imag;

public:
    Complex(double r, double i) : real(r), imag(i) {}

    // 声明友元函数，重载 + 运算符
    friend Complex operator+(const Complex& c1, const Complex& c2);

    void display() const {
        cout << real << " + " << imag << "i" << endl;
    }
};

// 定义友元函数
Complex operator+(const Complex& c1, const Complex& c2) {
    return Complex(c1.real + c2.real, c1.imag + c2.imag);
}

int main() {
    Complex c1(1.0, 2.0), c2(3.0, 4.0);
    Complex c3 = c1 + c2; // 调用友元函数，重载后的 + 运算符

    c3.display();
    return 0;
}
```

# 菱形继承

菱形继承（diamond inheritance）是一个经典问题，出现在多重继承中。其核心问题是子类通过多条继承路径访问基类时，可能会导致基类的成员被多次继承或实例化。

在下面这个类的结构关系中，一个基类 A，两个派生类 B 和 C，分别继承自 A，一个最终的派生类 D 同时继承自 B 和 C，出现菱形继承。

```
    A
   / \
  B   C
   \ /
    D
```

```cpp
class A {
public:
    int value;

    A() : value(0) {}
    void show() {
        cout << "Value from A: " << value << endl;
    }
};

class B : public A {}; // B 继承自 A
class C : public A {}; // C 继承自 A

class D : public B, public C {}; // D 同时继承自 B 和 C
```

D 类中可能会包含两份来自 A 类的成员（通过 B 和 C 两条路径），这会导致二义性问题。

```cpp
D obj;
// obj.value = 10;  // 错误：二义性
```

- 如果直接访问 obj.value，编译器会报二义性错误，因为它无法判断访问的是哪一份 A 的 value。

可以明确指定访问的路径，解决二义性问题。

```cpp
D obj;
obj.B::value = 10;   // 通过 B 的路径访问 A
obj.C::value = 20;   // 通过 C 的路径访问 A
obj.B::show();       // 调用 B::A 的 show()
obj.C::show();       // 调用 C::A 的 show()
```

- 可以通过作用域解析符（如 obj.B::value）明确访问哪一份 A 的成员，但这会增加代码复杂性。

# 虚继承

虚继承（virtual inheritance）是一种特殊继承方式，用于解决多重继承（如菱形继承）中基类成员重复的问题。通过虚继承，所有派生类共享基类的唯一实例，避免了冗余拷贝和二义性。

虚继承是一种机制，确保在多重继承时，无论通过多少条继承路径，基类的成员在最终派生类中只存在一份实例。

```cpp
class A {
public:
    int value;

    A(int v) : value(v) {
        cout << "A constructor called with value: " << value << endl;
    }
};

class B : virtual public A {
public:
    B() : A(0) {  // 虚继承时不会调用这里的 A 构造函数
        cout << "B constructor called" << endl;
    }
};

class C : virtual public A {
public:
    C() : A(0) {  // 虚继承时不会调用这里的 A 构造函数
        cout << "C constructor called" << endl;
    }
};

class D : public B, public C {
public:
    D(int v) : A(v) {  // 最底层派生类负责调用 A 的构造函数
        cout << "D constructor called" << endl;
    }
};

int main() {
    D obj(42);

    cout << "Value in A: " << obj.value << endl;

    return 0;
}
```

- 每个派生类中需要维护一个虚基类指针（vptr），增加了存储开销。
- 最底层派生类负责初始化虚基类，增加了构造函数设计的复杂性。

# 模版函数

模板函数（template function）是一种泛型编程工具，允许编写可以适用于多种数据类型的函数，而无需为每种类型重复编写代码。

```cpp
// 模板函数定义
template <typename T>
void swapValues(T& a, T& b) {
    T temp = a;
    a = b;
    b = temp;
}

// 多类型模板函数
template <typename T1, typename T2>
void displayPair(const T1& a, const T2& b) {
    cout << "First: " << a << ", Second: " << b << endl;
}

int main() {
    int x = 10, y = 20;
    swapValues(x, y);  // 调用模板函数
    cout << "Swapped integers: " << x << ", " << y << endl;

    double p = 1.1, q = 2.2;
    swapValues(p, q);  // 调用模板函数
    cout << "Swapped doubles: " << p << ", " << q << endl;

    displayPair(10, 3.14);         // int 和 double
    displayPair("Alice", 25);      // const char* 和 int
    displayPair(42, "Hello");      // int 和 const char*

    return 0;
}
```

模板函数的类型可以由实参自动推导，也可以显式指定。

```cpp
template <typename T>
T add(T a, T b) {
    return a + b;
}

int main() {
    cout << add(3, 4) << endl;       // 自动推导为 int
    cout << add(3.5, 4.2) << endl;   // 自动推导为 double

    // 显式指定类型
    cout << add<int>(3.5, 4.2) << endl;  // 强制为 int，结果为 7

    return 0;
}
```

模板还可以接受非类型参数，例如整数或指针。

```cpp
template <typename T, int size>
void printArray(const T (&arr)[size]) {
    for (int i = 0; i < size; ++i) {
        cout << arr[i] << " ";
    }
    cout << endl;
}

int main() {
    int arr1[] = {1, 2, 3, 4, 5};
    double arr2[] = {1.1, 2.2, 3.3};

    printArray(arr1);  // 自动推导 size 为 5
    printArray(arr2);  // 自动推导 size 为 3

    return 0;
}
```

模板函数的返回值类型也可以使用模板参数定义的类型。

```cpp
template <typename T>
T getMax(T a, T b) {
    return (a > b) ? a : b;  // 返回类型为 T
}

template <typename T>
T* createArray(size_t size) {
    return new T[size];  // 返回动态分配的数组指针
}

int main() {
    cout << getMax(10, 20) << endl;       // 返回 int
    cout << getMax(3.14, 2.71) << endl;  // 返回 double
    
    int* arr = createArray<int>(5);  // 显式指定 T 为 int
    for (int i = 0; i < 5; ++i) {
        arr[i] = i + 1;
        cout << arr[i] << " ";
    }
    delete[] arr;  // 释放动态内存
    
    return 0;
}
```

模板函数的返回值类型可以使用 auto 关键字自动推导。编译器会根据函数体的 return 表达式推导出返回值的类型。

```cpp
template <typename T>
auto square(T value) {
    return value * value;  // 返回值类型由表达式推导
}

int main() {
    cout << square(5) << endl;       // 推导为 int
    cout << square(3.14) << endl;   // 推导为 double

    return 0;
}
```

如果返回值类型需要复杂表达式推导，或者需要明确表达式的类型，可以结合 decltype 使用。

```cpp
template <typename T1, typename T2>
auto multiply(T1 a, T2 b) -> decltype(a * b) {
    return a * b;
}

int main() {
    cout << multiply(2, 3.5) << endl;    // 返回 double
    cout << multiply(4, 3) << endl;      // 返回 int

    return 0;
}
```

- decltype(a * b) 明确返回值类型是 a * b 的类型。
- 这种写法在复杂模板函数中非常有用，尤其是当返回值类型依赖于参数间的操作结果时。

普通函数在调用时支持隐式类型转换。如果函数的参数类型与实参类型不完全匹配，但可以通过隐式类型转换兼容，则调用会成功。

模板函数不支持隐式类型转换。模板参数的类型必须与实参类型完全匹配，否则编译器会尝试进行模板实例化失败。

当一个调用既满足普通函数的参数类型，也满足模板函数的推导规则时，普通函数的优先级高于模板函数。原因是普通函数的匹配规则更严格，更具体，而模板函数是泛型的。

```cpp
// 普通函数
void func(int x) {
    cout << "Ordinary function: " << x << endl;
}

// 模板函数
template <typename T>
void func(T x) {
    cout << "Template function: " << x << endl;
}

int main() {
    func(42);        // 满足普通函数和模板函数，优先调用普通函数
    func(3.14);      // 普通函数不匹配，调用模板函数
    func('A');       // 普通函数不匹配，调用模板函数
    func(static_cast<int>(3.14)); // 显式转换后，调用普通函数

    return 0;
}
```

# 模版函数重载

函数模板可以像普通函数一样被重载。函数模板的重载指的是为不同的参数类型或参数组合定义多个模板版本。此外，普通函数也可以与模板函数一起重载，编译器会根据调用时的匹配规则来选择最适合的版本。

```cpp
// 模板函数 1
template <typename T>
void print(T value) {
    cout << "Template function: " << value << endl;
}

// 模板函数 2（重载）
template <typename T, typename U>
void print(T value1, U value2) {
    cout << "Template function (overloaded): " << value1 << " and " << value2 << endl;
}

int main() {
    print(42);             // 调用模板函数 1
    print(3.14, "Hello");  // 调用模板函数 2
    return 0;
}
```

下面这里直接使用模版函数对 Animal 进行比较会报错：

```cpp
template <typename T>
bool compare(T& t1, T& t2) {
    return t1 > t2;
}

int main() {
    Animal animal1 = Animal("harvey", 18);
    Animal animal2 = Animal("bruce", 20);
    bool flag = compare(animal1, animal2); // 报错，因为 Animal 不支持直接进行 >  和 < 的比较
    return 0;
}
```

可以重载 Animal 的比较运算符，解决这个问题：

```cpp
bool operator>(const Animal& a1, const Animal& a2) {
    return a1.getAge() > a2.getAge();
}

bool operator<(const Animal& a1, const Animal& a2) {
    return a1.getAge() < a2.getAge();
}

template <typename T>
bool compare(T& t1, T& t2) {
    return t1 > t2;
}

int main() {
    Animal animal1 = Animal("harvey", 18);
    Animal animal2 = Animal("bruce", 20);
    bool flag = compare(animal1, animal2);
    return 0;
}
```

可以重载模版函数解决这个问题（推荐）：

```cpp
template <typename T>
bool compare(T& t1, T& t2) {
    return t1 > t2;
}

template <>
bool compare<Animal>(Animal& animal1, Animal& animal2) {
    return animal1.getAge() > animal2.getAge();
}

int main() {
    Animal animal1 = Animal("harvey", 18);
    Animal animal2 = Animal("bruce", 20);
    bool flag = compare(animal1, animal2); // 调用重载后的 compare
    return 0;
}
```

# 模版类

模板类是中一种泛型编程技术，允许在类的设计阶段定义类型参数，而在实例化阶段通过指定实际类型来生成特定的类。

```cpp
template <typename T1, typename T2>
class Pair {
private:
    T1 first;
    T2 second;

public:
    Pair(T1 f, T2 s) : first(f), second(s) {}

    T1 getFirst() const {
        return first;
    }

    T2 getSecond() const {
        return second;
    }
};

int main() {
    Pair<int, double> p1(42, 3.14);  // 存储 int 和 double
    Pair<string, int> p2("Alice", 25); // 存储 string 和 int

    cout << "p1: (" << p1.getFirst() << ", " << p1.getSecond() << ")" << endl;
    cout << "p2: (" << p2.getFirst() << ", " << p2.getSecond() << ")" << endl;

    return 0;
}
```

# 模板类特化

完全特化是针对特定类型为模板类提供专用实现。

```cpp
// 通用模板类
template <typename T>
class Box {
private:
    T value;

public:
    Box(T v) : value(v) {}

    T getValue() const {
        return value;
    }
};

// 完全特化：针对 const char*
template <>
class Box<const char*> {
private:
    string value; // 使用 string 存储 const char*

public:
    Box(const char* v) : value(v) {}

    string getValue() const {
        return value;
    }
};

int main() {
    Box<int> intBox(42);
    Box<const char*> strBox("Hello, world!");

    cout << "intBox: " << intBox.getValue() << endl;
    cout << "strBox: " << strBox.getValue() << endl;

    return 0;
}
```

偏特化是为模板的一部分参数提供特化实现。偏特化只能用于类模板，不能用于函数模板。

```cpp
// 通用模板
template <typename T1, typename T2>
class Pair {
private:
    T1 first;
    T2 second;

public:
    Pair(T1 f, T2 s) : first(f), second(s) {}

    void display() const {
        cout << first << ", " << second << endl;
    }
};

// 偏特化：当两个类型相同时
template <typename T>
class Pair<T, T> {
private:
    T first;
    T second;

public:
    Pair(T f, T s) : first(f), second(s) {}

    void display() const {
        cout << "Same types: " << first << ", " << second << endl;
    }
};

int main() {
    Pair<int, double> p1(42, 3.14);
    Pair<int, int> p2(10, 20);

    p1.display();
    p2.display();

    return 0;
}
```

在类外实现模版函数：

```cpp

template <typename T>
class Box {
private:
    T value;

public:
    Box(T v);         // 构造函数声明
    void setValue(T); // 成员函数声明
    T getValue();     // 成员函数声明
};

// 类外实现构造函数
template <typename T>
Box<T>::Box(T v) : value(v) {}

// 类外实现 setValue
template <typename T>
void Box<T>::setValue(T v) {
    value = v;
}

// 类外实现 getValue
template <typename T>
T Box<T>::getValue() {
    return value;
}

int main() {
    Box<int> intBox(10);  // 实例化 Box<int>
    intBox.setValue(20);  // 调用成员函数
    cout << intBox.getValue() << endl;

    Box<string> strBox("Hello");  // 实例化 Box<string>
    cout << strBox.getValue() << endl;

    return 0;
}
```

# 模版类继承

```cpp
template <typename T>
class Base {
protected:
    T value;

public:
    Base(T v) : value(v) {}

    void showValue() const {
        cout << "Value: " << value << endl;
    }
};

template <typename T>
class Derived : public Base<T> {
public:
    Derived(T v) : Base<T>(v) {}

    void doubleValue() {
        this->value *= 2;
    }
};

int main() {
    Derived<int> obj(10);
    obj.showValue(); // 调用基类函数
    obj.doubleValue();
    obj.showValue();

    return 0;
}
```

# 延迟编译

模板函数（以及模板类的成员函数）采用了延迟编译，只有在被实际调用或使用时，才会由编译器为特定的模板参数类型生成具体的机器代码。

- 模板本身并不是完整的机器代码，而是一个通用的模式。
- 当模板被实例化为某个具体类型（如 int、double 等）时，编译器会根据模板生成该类型的具体机器代码。
- 未被调用的模板函数不会生成机器代码，从而优化了编译效率和二进制文件大小。

```cpp
template <typename T>
class Box {
private:
    T value;

public:
    Box(T v) : value(v) {}

    T getValue() const {
        cout << "getValue() called" << endl;
        return value;
    }

    void setValue(T v) {
        cout << "setValue() called" << endl;
        value = v;
    }

    void unusedFunction() {
        cout << "This function is not used!" << endl;
    }
};

int main() {
    Box<int> intBox(10);         // 实例化 Box<int>
    cout << intBox.getValue() << endl; // 调用 getValue()，生成 getValue<int>
    intBox.setValue(20);         // 调用 setValue()，生成 setValue<int>
    // intBox.unusedFunction();  // 未调用，unusedFunction<int> 不会被实例化

    return 0;
}
```

如果模板函数中包含错误代码，但未被调用，则编译器不会报错。

```cpp
template <typename T>
class Box {
public:
    void validFunction() {
        cout << "validFunction called" << endl;
    }

    void invalidFunction() {
        T* ptr = nullptr;
        *ptr = 10; // 如果 T 是 int，会报错，但未调用不会报错
    }
};

int main() {
    Box<int> intBox;
    intBox.validFunction(); // validFunction<int> 被实例化
    // intBox.invalidFunction(); // 若调用，将触发编译错误
    return 0;
}
```

有时，为了优化编译或避免潜在问题，可能希望强制实例化模板类的某些成员函数。可以通过显式实例化来实现。

```cpp
template <typename T>
class Box {
public:
    void funcA() {
        cout << "funcA called" << endl;
    }

    void funcB() {
        cout << "funcB called" << endl;
    }
};

// 显式实例化
template void Box<int>::funcA(); // 仅实例化 funcA<int>

int main() {
    Box<int> intBox;
    intBox.funcA(); // funcA<int> 已实例化
    // intBox.funcB(); // funcB<int> 未实例化，若调用，会实例化
    return 0;
}
```

```cpp
template <typename T>
class Person {
private:
    T pet;
public:
    Person(const T& pet) 
        :pet(pet) {}

    void play() {
        pet.bark(); // Dog 有 bark()，Cat 没有 bark()，这里在编译时不会报错
    }
};

int main() {
    Dog dog = Dog("Pluto", 3, "yellow");
    Person p1 = Person<Dog>(dog);
    p1.play();
    
    Cat cat = Cat("tom", 2, "blue");
    Person p2 = Person<Cat>(cat); // 这里不会报错
    // p2.play(); // 执行到这里，才会去编译 Person<Cat> 的 play() ，发现 Cat 没有 bark() 而报错
    
    return 0;
}
```

# 普通类拆分

普通类的拆分非常常见，头文件 (.h) 用于声明类的接口，源文件 (.cpp) 用于实现类的功能。以下是完整的例子和步骤。

```cpp
project/
|-- include/
|   |-- MyClass.h
|-- src/
|   |-- MyClass.cpp
|-- main.cpp
```

```cpp
#ifndef MYCLASS_H
#define MYCLASS_H

#include <string>

class MyClass {
private:
    int id;
    std::string name;

public:
    MyClass(int id, const std::string& name); // 构造函数
    void setId(int id);                       // 设置 ID
    int getId() const;                        // 获取 ID
    void setName(const std::string& name);    // 设置 Name
    std::string getName() const;              // 获取 Name
};

#endif // MYCLASS_H
```

```cpp
#include "MyClass.h"

// 构造函数
MyClass::MyClass(int id, const std::string& name) : id(id), name(name) {}

// 设置 ID
void MyClass::setId(int id) {
    this->id = id;
}

// 获取 ID
int MyClass::getId() const {
    return id;
}

// 设置 Name
void MyClass::setName(const std::string& name) {
    this->name = name;
}

// 获取 Name
std::string MyClass::getName() const {
    return name;
}
```

```cpp
#include <iostream>
#include "MyClass.h"

int main() {
    MyClass obj(1, "Alice");
    std::cout << "ID: " << obj.getId() << ", Name: " << obj.getName() << std::endl;

    obj.setId(2);
    obj.setName("Bob");
    std::cout << "ID: " << obj.getId() << ", Name: " << obj.getName() << std::endl;

    return 0;
}
```

普通类的实现通常放在 .cpp 文件中，编译器在编译 .cpp 文件时会将实现转化为机器代码 .o 目标文件。头文件只提供声明，编译器在编译使用普通类的代码时，只需要知道类的接口，而不需要实现细节。

编译 MyClass.cpp 生成 MyClass.o 目标文件，其中包含了所有实现函数的机器代码。编译 main.cpp 生成 main.o 目标文件，其中包含了对 setId, setName, getId, getName 等函数的符号引用。

链接阶段，链接器将所有的符号引用解析成 MyClass.cpp 中的实现地址，完成链接。

# 模版类拆分

模板类的拆分略有不同，因为模板的实例化发生在编译阶段，编译器需要看到模板的完整实现。以下是模板类拆分头文件和实现文件的示例。

```
project/
|-- include/
|   |-- Box.h
|-- src/
|   |-- Box.tpp
|-- main.cpp
```

```cpp
#ifndef BOX_H
#define BOX_H

template <typename T>
class Box {
private:
    T value;

public:
    Box(T v);              // 构造函数
    void setValue(T v);    // 设置值
    T getValue() const;    // 获取值
};

// 包含实现文件
#include "Box.tpp"

#endif // BOX_H
```

```cpp
template <typename T>
Box<T>::Box(T v) : value(v) {}

template <typename T>
void Box<T>::setValue(T v) {
    value = v;
}

template <typename T>
T Box<T>::getValue() const {
    return value;
}
```

```cpp
#include <iostream>
#include "Box.h"

int main() {
    Box<int> intBox(42);
    Box<std::string> strBox("Hello");

    std::cout << "intBox value: " << intBox.getValue() << std::endl;
    strBox.setValue("World");
    std::cout << "strBox value: " << strBox.getValue() << std::endl;

    return 0;
}
```

模板代码本身只是一个“模式”，在实例化之前没有具体的实现代码。编译器在编译时根据模板参数实例化出具体的代码，而不是依赖链接器。

模板代码的实现不会被单独编译为 .o 文件，因为它不是一个具体的实现。只有当模板被实例化时（即被使用时），编译器才会生成具体的目标代码。

编译器遇到 Box\<int\> 的实例化点，在编译 main.cpp 时根据模板代码生成 Box\<int\> 的具体实现机器代码，并没有链接的过程，所以我们在使用模版类的时候，不能只有声明，还需要有具体的实现。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412081419544.png)

# 仿函数

函数对象是一个重载了 operator() 的类或结构体对象。它表现得像一个函数，可以被调用，但它是一个类的实例，能同时携带数据和方法。

- 可以通过成员变量在调用中保存额外信息。
- 可用作算法的参数（如 std::sort 的比较器）。
- 通常比普通函数灵活，也可以在编译时内联，提高性能。

```cpp
class Multiply {
public:
    int operator()(int a, int b) {
        return a * b;
    }
};

int main() {
    Multiply multiply;

    // 使用函数对象调用 operator()
    int result = multiply(3, 4);
    std::cout << "3 * 4 = " << result << std::endl;

    return 0;
}
```

```cpp
struct Multiply {
    int operator()(int a, int b) {
        return a * b;
    }
};

int main() {
    Multiply multiply;

    // 使用函数对象调用 operator()
    int result = multiply(3, 4);
    std::cout << "3 * 4 = " << result << std::endl;

    return 0;
}
```

函数对象可用作 std::map 或 std::set 的自定义比较器。

```cpp
struct StringLengthComparator {
    bool operator()(const std::string& a, const std::string& b) const {
        return a.size() < b.size(); // 按字符串长度比较
    }
};

int main() {
    std::map<std::string, int, StringLengthComparator> myMap;

    myMap["short"] = 1;
    myMap["longer"] = 2;
    myMap["longest"] = 3;

    for (const auto& pair : myMap) {
        std::cout << pair.first << ": " << pair.second << std::endl;
    }

    return 0;
}
```

# 内置仿函数

STL 提供了一些 内置仿函数，主要分为以下几类：

- 算术运算仿函数
- 关系运算仿函数
- 逻辑运算仿函数

```cpp
std::plus<int> add;                 // 加法
std::minus<int> subtract;           // 减法
std::multiplies<int> multiply;      // 乘法
std::divides<int> divide;           // 除法
std::modulus<int> mod;              // 取模
std::negate<int> negate;            // 取负

std::cout << "3 + 4 = " << add(3, 4) << std::endl;
std::cout << "10 - 7 = " << subtract(10, 7) << std::endl;
std::cout << "2 * 6 = " << multiply(2, 6) << std::endl;
std::cout << "8 / 2 = " << divide(8, 2) << std::endl;
std::cout << "10 % 3 = " << mod(10, 3) << std::endl;
std::cout << "-5 = " << negate(5) << std::endl;
```

```cpp
std::equal_to<int> eq;          // 相等
std::not_equal_to<int> neq;    // 不相等
std::greater<int> gt;          // 大于
std::less<int> lt;             // 小于
std::greater_equal<int> ge;    // 大于等于
std::less_equal<int> le;       // 小于等于

std::cout << "5 == 5: " << eq(5, 5) << std::endl;
std::cout << "5 != 3: " << neq(5, 3) << std::endl;
std::cout << "5 > 3: " << gt(5, 3) << std::endl;
std::cout << "5 < 7: " << lt(5, 7) << std::endl;
std::cout << "5 >= 5: " << ge(5, 5) << std::endl;
std::cout << "5 <= 7: " << le(5, 7) << std::endl;
```

```cpp
std::logical_and<bool> logicalAnd;  // 逻辑与
std::logical_or<bool> logicalOr;    // 逻辑或
std::logical_not<bool> logicalNot;  // 逻辑非

std::cout << "true && false: " << logicalAnd(true, false) << std::endl;
std::cout << "true || false: " << logicalOr(true, false) << std::endl;
std::cout << "!true: " << logicalNot(true) << std::endl;
```

在 std::sort 中使用仿函数：

```cpp
std::vector<int> numbers = {5, 2, 8, 1, 3};

// 使用 std::greater 仿函数实现降序排序
std::sort(numbers.begin(), numbers.end(), std::greater<int>());
```

```cpp
std::vector<int> nums = {5, 2, 8, 1, 6};

// [](int a, int b) { return a > b; } 是一个匿名函数对象（Lambda），与 Descending 类的功能相同
std::sort(nums.begin(), nums.end(), [](int a, int b) {
    return a > b;  // 降序
});
```

在 std::remove_if 中使用仿函数：

```cpp
std::vector<int> numbers = {1, 2, 3, 4, 5};

// 使用 std::modulus 结合 std::bind2nd 移除偶数
auto it = std::remove_if(numbers.begin(), numbers.end(), [](int n) { return n % 2 == 0; });

numbers.erase(it, numbers.end());

for (int n : numbers) {
    std::cout << n << " ";
}
std::cout << std::endl;
```

# 谓语

谓语（Predicate） 是指返回 true 或 false 的函数、函数对象或 Lambda 表达式，通常用于判断条件。谓语被广泛应用于 STL 算法中，例如 std::find_if、std::sort 和 std::remove_if 等。

使用函数作为谓语：

```cpp
bool isEven(int value) {
    return value % 2 == 0;
}

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};

    // 使用 find_if 找到第一个偶数
    auto it = std::find_if(numbers.begin(), numbers.end(), isEven);

    if (it != numbers.end()) {
        std::cout << "First even number: " << *it << std::endl;
    } else {
        std::cout << "No even number found." << std::endl;
    }

    return 0;
}
```

使用函数对象作为谓语：

```cpp
struct IsPositive {
    bool operator()(int value) const {
        return value > 0;
    }
};

int main() {
    std::vector<int> numbers = {-1, -2, 3, 4, -5};

    // 使用 find_if 找到第一个正数
    auto it = std::find_if(numbers.begin(), numbers.end(), IsPositive());

    if (it != numbers.end()) {
        std::cout << "First positive number: " << *it << std::endl;
    } else {
        std::cout << "No positive number found." << std::endl;
    }

    return 0;
}
```

使用 Lambda 表达式作为谓语：

```cpp
int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};

    // 使用 Lambda 表达式作为谓语
    auto it = std::find_if(numbers.begin(), numbers.end(), [](int value) {
        return value > 3; // 判断是否大于 3
    });

    if (it != numbers.end()) {
        std::cout << "First number greater than 3: " << *it << std::endl;
    } else {
        std::cout << "No number greater than 3 found." << std::endl;
    }

    return 0;
}
```

# 可调用对象

可调用对象（Callable Object） 是指任何可以使用 () 运算符调用的对象，包括但不限于：普通函数，Lambda 表达式，函数指针，仿函数，成员函数。

```cpp
void normalFunction() {
    std::cout << "普通函数被调用" << std::endl;
}

int main() {
    auto lambda = []() { std::cout << "Lambda 表达式被调用" << std::endl; };
    std::function<void()> funcObj = lambda;  // std::function 也是可调用对象

    normalFunction();  // 调用普通函数
    lambda();          // 调用 Lambda
    funcObj();         // 调用 std::function

    return 0;
}
```

# 函数对象

函数对象（Function Object, Functor）是指重载了 operator() 的类的具体实现，使其对象可以像函数一样调用。

```cpp
// Multiply 重载了 operator()
struct Multiply {
    int operator()(int a, int b) const {
        return a * b;
    }
};

int main() {
    Multiply multiply;  // 创建函数对象
    std::cout << multiply(3, 5) << std::endl;  // 输出 15
}
```

std::bind 创建的函数都想本质上就是一个重载了 operator() 的匿名类的实现。

```cpp
int add(int a, int b) {
    return a + b;
}

int main() {
    // 创建了一个匿名类，按照 add(2, 3) 重载了 operator()，示例化该匿名类，得到 bound_func 函数对象
    auto bound_func = std::bind(add, 2, 3);
    std::cout << bound_func() << std::endl;
}
```

# 引用限定符

