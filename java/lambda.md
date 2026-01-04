# Lambda

Lambda 和 anon inner cls 类似, 底层都是创建一个 anon cls 实现 interface

```java
public class Main {
    public static void main(String[] args) {
        // anon inner cls impl
        IA ia1 = new IA() {
            @Override
            public void show() {
                System.out.println("hello world");
            }
        };
        ia1.show();
        
        // Lambda impl
        IA ia2 = () -> {
            System.out.println("hello world");
        };
        ia2.show();
    }
}

// 添加 @FunctionalInterface 声明为 functional interface, 只能有一个 abstract method
@FunctionalInterface
interface IA {
    void show();
}
```

# Lambda param

```java
public class Main {
    public static void main(String[] args) {
        IA ia1 = (int n1, int n2) -> {
            System.out.println(n1 + n2);
        };
        ia1.show(10, 20); // 30
        
        // Simplify
        IA ia2 = (n1, n2) -> {
            System.out.println(n1 + n2);
        };
    }
} 

interface IA {
    void show(int n1, int n2);
}
```

# pass Lambda as param

```java
public class Main {
    public static void main(String[] args) {
        test(() -> {
            System.out.println("hello world");
        });
    }

    public static void test(IA ia) {
        ia.show();
    }
}

interface IA {
    void show();
}
```

# return Lambda

```java
public class Main {
    public static void main(String[] args) {
        IA ia = getIA();
    }

    public static IA getIA() {
        return () -> {
            System.out.println("hello world");
        };
    }
}

interface IA {
    void show();
}
```

# Runnable

```java
public static void main(String[] args) {
    Runnable runnable = () -> {
        System.out.println("hello world");
    };
    new Thread(runnable).start();
}
```

# Suppiler

```java
public static void main(String[] args) {
    Supplier<String> supplier = () -> {
        return "hello world";
    };
    String str = supplier.get();
}
```

# Consumer

```java
public static void main(String[] args) {
    test1((msg) -> {
        System.out.println(msg);
    });
    
    test2((msg) -> {
        System.out.println(msg.toUpperCase()); // HELLO WORLD
    }, (msg) -> {
        System.out.println(msg.toLowerCase()); // hello world
    });
}

public static void test1(Consumer<String> consumer) {
    consumer.accept("hello world");
}

public static void test2(Consumer<String> consumer1, Consumer<String> consumer2) {
    // consumer1 调用 toUpperCase("hello WORLD"), consumer2 调用 toLowerCase("hello WORLD"), 不是 consumer1 的 ret val 作为 consumer2 的 param
    consumer1.andThen(consumer2).accept("hello WORLD");
}
```

# Compartor

```java
public static void main(String[] args) {
    Comparator<String> comparator = (o1, o2) -> {
        return o1.length() - o2.length();
    };
    String[] strs = {"sun", "xue", "cheng"};
    Arrays.sort(strs, comparator);
}
```

# Predicate

```java
public static void main(String[] args) {
    validation((str) -> {
        return str.contains("hello");
    }, (str) -> {
        return str.contains("world");
    });
}

public static void validation(Predicate<String> predicate1, Predicate<String> predicate2) {
    // predicate1 && predicate2
    boolean isValid1 = predicate1.and(predicate2).test("hello world");
    
    // predicate1 || predicate2
    boolean isValid2 = predicate1.or(predicate2).test("hello world");
    
    // !predicate1
    boolean isValid3 = predicate1.negate().test("hello world");
}
```

# Function

```java
public static void main(String[] args) {
    test1((s) -> {
        return Integer.parseInt(s);
    });

    test2((s) -> {
        return Integer.parseInt(s); // 10
    }, (i) -> {
        return i * 100; // 1000
    });
}

public static void test1(Function<String, Integer> function) {
    // 接收 String, 返回 Integer, 接收 "10", 返回 10
    int res = function.apply("10");
}

public static void test2(Function<String, Integer> function1, Function<Integer, Integer> function2) {
    // function1 调用 return Integer.parseInt("10"), 返回 10 作为 function2 的 param, function2 调用 return 10 * 100
    int res = function1.andThen(function2).apply("10"); // 1000
}
```

# ref method

```java
public class Main {
    public static void main(String[] args) {
        // Lambda impl
        IA ia1 = (str) -> {
            System.out.println(str);
        };
        ia1.show("hello world");

        // method ref impl, 通过 System.out.println() 代替 Lambda 实现 IA 的 show(), 要求 show() 和 println() 的 param list 兼容, ret val 兼容
        IA ia2 = System.out::println;
        ia2.show("hello world");
    }
}

interface IA {
    void show(String str);
}
```

param list 兼容

- param type 向下兼容
    - eg. test1(Object obj) 兼容 test2(String str) 
- var param 兼容
    - eg. test1(String str, Integer... nums) 兼容 test2(String str) 

ret val 兼容

- void 兼容
    - eg. void test1() 兼容 String test2()

## ref static method

```java
public class Main {
    public static void main(String[] args) {
        // Lambda impl
        IA ia1 = (str) -> {
            return Integer.parseInt(str);
        };
        int n1 = ia1.test("10");

        // method ref impl
        IA ia2 = Integer::parseInt;
        int n2 = ia2.test("10");
    }
}

interface IA {
    int test(String str);
}
```

## ref method

```java
public class Main {
    public static void main(String[] args) {
        // Lambda impl
        IA ia1 = (str) -> {
            return str.toUpperCase();
        };
        String str1 = ia1.test("hello world");

        // method ref impl
        IA ia2 = String::toUpperCase;
        String str2 = ia2.test("hello world");
    }
}

interface IA {
    String test(String str);
}
```

## ref ctor

```java
public class Main {
    public static void main(String[] args) {
        // Lambda impl
        UserFactory factory1 = (name) -> {
            return new User(name);
        };
        User user1 = factory1.getUser();
        
        // method ref impl
        UserFactory factory2 = User::new;
        User user2 = factory2.getUser();
    }
}

interface UserFactory {
    User getUser(String name);
}

class User implements UserFactory {
    private String name;

    // getUser(String name) 对应 User(String name)
    public User(String name) {
        this.name = name;
    }

    @Override
    public User getUser(String name) {
        return null;
    }
}
```

## ref this method

```java
interface IA {
    void iaShow(String str);
}

class A {
    void aShow(String str) {
        System.out.println(str);
    }
    
    void test() {
        // Lambda impl
        IA ia1 = (str) -> {
            this.aShow(str);
        };
        ia1.iaShow("hello world");

        // method ref impl
        IA ia2 = this::aShow;
        ia2.iaShow("hello world");
    }
}
```

## ref arr ctor

```java
public class Main {
    public static void main(String[] args) {
        IA ia1 = (len) -> {
            return new int[len];
        };
        int[] arr1 = ia1.getArr(10);

        IA ia2 = int[]::new;
        int[] arr2 = ia2.getArr(10);
    }
}

interface IA {
    int[] getArr(int len);
}
```




