# Inner Class

内部类: 一个类的内部嵌套了另一个类, 属于类的成员之一

内部类可以直接访问外部类的成员

# Local Inner Class

局部内部类: 地位类似于局部变量, 定义在方法或代码块中, 可以直接访问外部类的成员

```java
public class Main {
    public static void main(String[] args) {
        Outer outer = new Outer();
        outer.show();
    }
}

class Outer {
    private String name = "sun";
    private int age = 18;

    public void show() {
        // 定义在方法中
        class Inner {
            private int age = 20;
            
            public void innerShow() {
                // 内部类访问外部类
                System.out.println(name); // "sun"

                // 访问重名的成员, 遵循就近原则
                System.out.println(age); // 18
                
                // 通过 外部类名.this.成员名 访问外部类的成员, Outer.this 指向了 调用 outer.show() 的 Outer 对象, 
                System.out.println(Outer.this.age); // 20
            }
        }
        
        // 通过局部内部类的对象访问局部内部类的成员
        Inner inner = new Inner();
        inner.innerShow();
    }
}
```

局部内部类可以被继承, 也可以被 final 修饰, 表示该局部内部类不可以被继承

```java
class Outer {
    public void show() {
        class Inner {}

        class Inner02 extends Inner {}
        
        final class Inner03 extends Inner02 {}

        class Inner04 extends Inner03 {} // error
    }
}
```

# Anonymous Innner Class

匿名内部类: 地位类似于局部变量, 定义在方法或代码块中, 可以直接访问外部类的成员

匿名内部类没有类名, 相当于创建一个类只调用一次

```java
interface IA {
    void show();
}

class Outer {
    private String name = "sun"
    public int age = 18;
    
    public void method() {
        // 创建匿名内部类实现 IA, 调用 show()
        IA ia = new IA() {
            public int age = 20;

            @Override
            public void show() {
                // 内部类访问外部类
                System.out.println(name); // "sun"
                System.out.println(age); // 18
                System.out.println(Outer.this.age); // 20
            }
        };
        ia.show();

        // 省略引用, 一次性调用
        new IA() {
            @Override
            public void show() {
                System.out.println("show()");
            }
        }.show();

        // 箭头函数, 基于匿名内部类实现
        IA ia = () -> System.out.println("show()");
        ia.show();
    }
}
```

```java
abstract class A {
    abstract public void show();
}

class Outer {
    public void method() {
        A a = new A() {
            @Override
            public void show() {
                System.out.println("show()");
            }
        };

        a.show();
    }
}
```

匿名内部类作为参数传递

```java
public class Main {
    public static void main(String[] args) {
        A a = new A();
        
        a.method(new IA() {
            @Override
            public void show() {
                System.out.println("show()");
            }
        });
        
        a.method(() -> System.out.println("show()"));
    }
}

interface IA {
    void show();
}

class A {
    public void method(IA ia) {
        ia.show();
    }
}
```

匿名内部类, 在底层个是有类名的, 不过只用一次, 一般为 外部类名$数字, 比如: Outer$1

```java
class Outer {
    public void method() {
        IA ia = new IA() {
            @Override
            ...
        };

        System.out.println(ia.getClass()); // class Outer$1
    }
}
```

本质上, 底层是创建一个 Outer$1 类 实现 IA, 相当于

```java
class Outer {
    public void method() {
        class Outer$1 implements IA {
            @Override
            ...
        }
        
        IA ia = new Outer$1();
        
        System.out.println(ia.getClass()); // class Outer$1
    }
}
```

# Member Inner Class

成员内部类: 地位类似于类的成员, 定义在外部类的成员位置, 可以直接访问外部类的成员, 可以使用访问修饰符

```java
class Outer {
    private String name = "sun";
    private int age = 18;

    public class Inner {
        private int age = 20;

        public void innerShow() {
            // 内部类访问外部类
            System.out.println(name); // "sun"
            System.out.println(age); // 20
            System.out.println(Outer.this.age); // 18
        }
    }

    public void outerShow() {
        // 外部类访问内部类
        Inner inner = new Inner();
        inner.innerShow();
    }
}
```

外部其他类访问内部类

```java
class Outer {
    public class Inner {}
}

class Other {
    public void otherShow() {
        Outer outer = new Outer();
        Outer.Inner inner = outer.new Inner();
        
        Outer.Inner inner = new Outer().new Inner();
    }
}
```

```java
class Outer {
    public class Inner {}

    public Inner getInner() {
        return new Inner();
    }
}

class Other {
    public void otherShow() {
        Outer.Inner inner = outer.getInner();
    }
}
```

# Static Inner Class

静态内部类: 地位类似于类的成员, 定义在外部类的成员位置, 可以直接访问外部类的静态成员, 可以使用访问修饰符

```java
class Outer {
    private static String name = "sun";
    private static int age = 18;
    private char sex = 'M';

    public static class Inner {
        private int age = 20;
        public void innerShow() {
            // 内部类访问外部类
            System.out.println(name); // "sun"
            System.out.println(age); // 20
            System.out.println(Outer.age); // 18
            System.out.println(sex); // error; 不可以访问外部类的非静态成员
        }
    }

    public void outerShow() {
        // 外部类访问内部类
        Inner inner = new Inner();
        inner.innerShow();
    }
}
```

外部其他类访问内部类

```java
class Outer {
    public static class Inner {}
}

class Other {
    public void otherShow() {
        Outer.Inner inner = new Outer.Inner();
    }
}
```

```java
class Outer {
    public static class Inner {}

    public Inner getInner1() {
        return new Inner();
    }
}

class Other {
    public void otherShow() {
        Outer outer = new Outer();
        Outer.Inner inner = outer.getInner();

        Outer.Inner inner = new Outer().getInner();
    }
}
```

