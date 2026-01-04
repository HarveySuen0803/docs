# Hungry Man Pattern

Hungry Man Pattern, 私有化 constructor, 在 Class Loading 时, 创建一个 static object, 通过 get() 获取 object

通过 Hungry Man Pattern 获取 object, 如果没有调用 get(), 会存在浪费

```java
public class Singleton {
    private static Singleton instance = new Singleton();
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        return instance;
    }
}
```

通过 enum 实现 Hungry Man Patter 是唯一一种不会被破坏的 single pattern

```java
public enum Singleton {
    INSTANCE;
}
```

# Lazy Man Pattern

Lazy Man Pattern 在调用 get() 时, 创建 static object, 不存在浪费

```java
public class Singleton {
    private Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

Lazy Man Pattern 在 multithreaed 下, 容易创建多个 object, 可以通过 DCL 解决

```java
public class Singleton {
    private volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

static inner class 是在 class member 被访问时加载, 可以防止资源浪费, static field 是 thread safty, 可以防止重复创建 object 的问题

通过 static inner class 实现 Lazy Man Pattern

```java
public class Singleton {
    private Singleton() {}
    
    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }
    
    public static Singleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

# Destroy Single Pattern with Reflect

Reflect 可以忽略 security check, 直接调用 contructor 创建 object

```java
Constructor<Singleton> cons = Singleton.class.getDeclaredConstructor();
cons.setAccessible(true);
Singleton instance1 = (Singleton) cons.newInstance();
Singleton instance2 = (Singleton) cons.newInstance();
System.out.println(instance1 == instance2); // false
```

通过 flag 来标识是否是创建过 object 解决问题

```java
private static volatile boolean flag = false;

private Singleton() {
    if (flag) {
        throw new RuntimeException();
    }
    flag = false;
}
```

# Destroy Single Pattern with Serialization

ObjectInputStream 是通过 Reflect 调用了 public 的 contructor 创建 object, 破坏了 Single Pattern

```java
public static void main(String[] args) throws Exception {
    writeObject();
    Singleton instance1 = readObject();
    Singleton instance2 = readObject();
    System.out.println(instance1 == instance2); // false
}

public static void writeObject() throws Exception {
    Singleton instance = Singleton.getInstance();
    ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("/Users/HarveySuen/Downloads/test.txt"));
    oos.writeObject(instance);
    oos.close();
}

public static Singleton readObject() throws Exception {
    ObjectInputStream ois = new ObjectInputStream(new FileInputStream("/Users/HarveySuen/Downloads/test.txt"));
    Singleton instance = (Singleton) ois.readObject();
    ois.close();
    return instance;
}
```

ObjectInputStream 在 deserialization 时, 会通过 Reflect 调用 readResolve() 获取 object, 所以添加一个 readResolve() 就可以解决问题

```java
@Serial
private Object readResolve() {
    return SingletonHolder.INSTANCE;
}
```