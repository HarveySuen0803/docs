# Interface

接口类似于抽象类, 更多的用于设计, 实现类需要实现接口中所有的抽象方法

```java
interface Interface {
    // 属性必须初始化
    public String name = "sun";
    public int age = 18;
    
    // 抽象方法
    public abstract void test1();

    // 省略 abstract
    public void test2();

    // 省略 public abstract
    void test3();
    
    // 静态方法, 需要方法体
    public static void test4() {
        System.out.println("test4()");
    };

    // 默认方法, 需要方法体
    public default void test5() {
        System.out.println("test5()");
    }
}

// 实现 Interface 接口, 需要实现 Interface 中的所有抽象方法
class Animal implements Interface {
    @Override
    public void test1() {
        System.out.println("nimal test1()");
    }

    @Override
    public void test2() {
        System.out.println("Animal test2()");
    }

    @Override
    public void test3() {
        System.out.println("Animal test3()");
    }
}
```

一个类可以实现多个接口

```java
interface IA {}
interface IB {}
interface IC {}

class A implements IA, IB, IC {}
```

# Interface Polymorphism

```java
public class Main {
    public static void main(String[] args) {
        Usb usb1 = new Phone();
        usb1.show(); // "Phone show()"
        usb1.test(); // "Usb test()"
        
        Usb usb2 = new Camera();
        usb2.show(); // "Camera show()"

        Usb usbs[] = new Usb[3];
        usbs[0] = new Phone();
        usbs[1] = new Camera();
        usbs[2] = new Camera();
    }
}

interface Usb {
    public abstract void show();
    
    public default void test() {
        System.out.println("Usb test()");
    }
}

class Phone implements Usb {
    @Override
    public void show() {
        System.out.println("Phone show()");
    }
}

class Camera implements Usb {
    @Override
    public void show() {
        System.out.println("Camera show()");
    }
}
```

# Interface Inheritance

```java
public class Exercise03 {
    public static void main(String[] args) {
        Interface interface = new Phone();
        Usb usb = new Phone();
    }
}

interface Interface {}

interface Usb extends Interface{}

class Phone implements Usb {} 
```
