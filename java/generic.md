# Generic

集合指定泛型, 集合中只能存储对应泛型或其子类的对象, 没有指定泛型, 默认为 Object

```java
// 规定 arrayList 只能存储 String 数据
ArrayList<String> arrayList = new ArrayList<String>();
// 简写
ArrayList<String> arrayList = new ArrayList<>();

arrayList.add("sun");
arrayList.add("xue");
arrayList.add("cheng");
arrayList.add(10); // error

// 规定 hashMap 只能存储 String, Integer 数据
HashMap<String, Integer> hashMap = new HashMap<String, Integer>();
// 简写
HashMap<String, Integer> hashMap = new HashMap<>();

hashMap.put("no1", 10);
hashMap.put("no2", 20);
hashMap.put("no3", 30);
hashMap.put(0, 30); // error
```

泛型不可以继承

泛型只能接受引用类型, 不可以是基本类型

如果不添加泛型

- 元素没有进行约束, 不安全
- 集合中数据量较大时, 类型转换效率低

如果添加泛型

- 编译阶段检查元素类型, 安全
- 增强 for 中, 可以直接定义该类型的引用, 避免了数据类型转换, 效率高

# Identifier

泛型标识符用于接受数据类型

```java
// public class ArrayList<E> 中 E 接受 String
ArrayList<String> arrayList = new ArrayList<>();

// public class HashMap<K,V> 中 K 接受 String, V 接受 Integer
HashMap<String, Integer> hashMap = new HashMap<>();
```

泛型标识符可以用于表示属性的数据类型, 方法返回类型, 方法的参数类型

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) {
        String name = new String("sun");
        Integer age = new Integer(10);

        Animal<String, Integer> animal = new Animal<>(name, age);

        System.out.println(animal.getName());
        System.out.println(animal.getAge());
    }
}

// 泛型约束类, 定义泛型 K, V
class Animal<K, V> {
    // 泛型约束属性
    K name;
    V age;
    
    // 泛型约束方法的参数
    public Animal(K name, V age) {
        this.name = name;
        this.age = age;
    }
    
    // 泛型约束方法的参数, 定义泛型 M, N (没有在类声明时定义的泛型, 需要在方法声明时定义)
    public <M, N> void show(M m, N n) {
        System.out.println(m);
        System.out.println(n);
    }
    
    // 泛型约束方法的返回类型
    public K getName() {
        return name;
    }
}

// 泛型约束接口
interface IA<T, R, M> {}
```

# Transerve

```java
ArrayList<String> arrayList = new ArrayList<>();

arrayList.add("sun");
arrayList.add("xue");
arrayList.add("cheng");

// 创建指定泛型的 iterator
Iterator<String> iterator = arrayList.iterator();

while (iterator.hasNext()) {
    System.out.println(iterator.next());
}

// for 遍历 arrayList, 指定数据类型为 String
for (String s : arrayList) {
    System.out.println(s);
}
```

```java
HashMap hashMap = new HashMap<>();

hashMap.put("no1", 10);
hashMap.put("no2", 20);
hashMap.put("no3", 30);

Set entrySet = hashMap.entrySet();

// 创建指定泛型的 iterator, 避免了数据类型转换
Iterator<Map.Entry> iterator = entrySet.iterator();

while (iterator.hasNext()) {
    Map.Entry entry = iterator.next();

    System.out.println(entry.getKey() + ": " + entry.getValue());
}
```

```java
// public class HashMap<K,V>
HashMap<String, Integer> hashMap = new HashMap<>();

hashMap.put("no1", 10);
hashMap.put("no2", 20);
hashMap.put("no3", 30);

// 创建指定泛型的 entrySet
Set<Map.Entry<String, Integer>> entrySet = hashMap.entrySet();

// 创建指定泛型的 iterator, 避免了数据类型转换
Iterator<Map.Entry<String, Integer>> iterator = entrySet.iterator();

while (iterator.hasNext()) {
    Map.Entry<String, Integer> entry = iterator.next();

    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// for 遍历 entrySet, 指定数据类型为 Map.Entry<String, Integer> 避免了数据类型转换
for (Map.Entry<String, Integer> entry : entrySet) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
```

# Generic Extend

```java
interface IA<U, R> {
    void showIA(U u, R r);
}

// 实现 IA, 没有指定泛型, 实现的方法的参数默认为 Object
class A1 implements IA {
    @Override
    public void showIA(Object o1, Object o2) {
        System.out.println(o1 + " " + o2);
    }
}

// 实现 IA, 指定泛型 <String, Integer>, 实现的方法的参数为 String, Integer
class A2 implements IA<String, Integer> {
    @Override
    public void showIA(String s, Integer i) {
        System.out.println(s + " " + i);
    }
}

// 继承 IAA, 指定泛型 <String, Integer>
interface IAA extends IA<String, Integer> {}

// 实现 IAA, 不需要指定泛型了, 实现的方法的参数为 String, Integer
class AA implements IAA {
    @Override
    public void showIA(String s, Integer i) {
        System.out.println(s + " " + i);
    }
}
```

# Generic Wildcards

`<?>` 接受任意泛型类型

`<? extends A>` 接受 A 类 及 A 类的子类, 规定了上限 A 类

`<? super A>` 接受 A 类 及 A 类的父类, 规定了下限 A 类

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) {
        List<Object> list1 = new ArrayList<>();
        List<A> list2 = new ArrayList<>();
        List<AA> list3 = new ArrayList<>();
        List<AAA> list4 = new ArrayList<>();

        f1(list1);
        f1(list2);
        f1(list3);
        f1(list4);

        f2(list1); // error
        f2(list2); // error
        f2(list3);
        f2(list4);

        f3(list1);
        f3(list2);
        f3(list3);
        f2(list4); // error
    }

    // 接受任意泛型类型
    public static void f1(List<?> list) {}

    // 接受 AA 类 及 AA 类的子类, 即接受 AA 类, AAA 类
    public static void f2(List<? extends AA> list) {}

    // 接受 AA 类 及 AA 类的父类, 即接受 AA 类, A 类, Object 类
    public static void f3(List<? super AA> list) {}
}

class A {}

class AA extends A {}

class AAA extends AA {}
```