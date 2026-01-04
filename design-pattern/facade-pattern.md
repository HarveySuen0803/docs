# Facade Pattern

由 Facade 代替 main() 创建 SubFlow1 object, SubFlow2 object, SubFlow3 object, 调用 show(), 不仅可以做一层封装简化操作, 也可以保护 SubFlow, 不让 client 直接调用

Facade Pattern 不符合 Open-Closed Principle, 要扩展 SubFlow class 的功能, 就必须修改 Facade

```java
public class Main {
    public static void main(String[] args) throws IOException {
        new Facade().show();
    }
}

class SubFlow1 {
    public void show() {
        System.out.println("hello world");
    }
}

class SubFlow2 {
    public void show() {
        System.out.println("hello world");
    }
}

class SubFlow3 {
    public void show() {
        System.out.println("hello world");
    }
}

class Facade {
    SubFlow1 subFlow1 = new SubFlow1();
    SubFlow2 subFlow2 = new SubFlow2();
    SubFlow3 subFlow3 = new SubFlow3();
    
    public void show() {
        subFlow1.show();
        subFlow2.show();
        subFlow3.show();
    }
}
```

