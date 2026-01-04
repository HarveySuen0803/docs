# Decorater Pattern

通过 Decorator Pattern 动态扩展功能, 比 Extends 有更好的扩展性

当通过 Extends 扩展功能时, 会导致产生大量 sub class 时, 或 class 无法被 Extends 时, 可以使用 Decorator Pattern

FastFood 有 FriedRice 和 FriedNoodles, 这时要在 FriedRice 和 FriedNoodles 基础上扩展功能, 可以通过 Decorator 进行动态扩展

Decorator 继承 FastFood, SuperFriedRice 和 SuperFriedNoodles 继承 Decorator, 内部维护一个 FastFood object, 通过 FastFood object 在原由基础上扩展

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241805331.png)

```java
public class Main {
    public static void main(String[] args) {
        FastFood friedRice = new FriedRice();
        System.out.println(friedRice.cost());
        
        SuperFriedRice superFriedRice = new SuperFriedRice(friedRice);
        System.out.println(superFriedRice.cost());
        
        FastFood friedNoodles = new FriedNoodles();
        System.out.println(friedNoodles.cost());
        
        SuperFriedNoodles superFriedNoodles = new SuperFriedNoodles(friedNoodles);
        System.out.println(superFriedNoodles.cost());
    }
}

abstract class FastFood {
    public abstract Integer cost();
}

class FriedRice extends FastFood {
    public Integer cost() {
        return 10;
    }
}

class FriedNoodles extends FastFood {
    public Integer cost() {
        return 12;
    }
}

class SuperFriedRice extends FastFood {
    private FastFood fastFood;
    
    public SuperFriedRice(FastFood fastFood) {
        this.fastFood = fastFood;
    }
    
    @Override
    public Integer cost() {
        return fastFood.cost() + 10;
    }
}

class SuperFriedNoodles extends FastFood {
    private FastFood fastFood;
    
    public SuperFriedNoodles(FastFood fastFood) {
        this.fastFood = fastFood;
    }
    
    @Override
    public Integer cost() {
        return fastFood.cost() + 10;
    }
}
```

# Decorater Pattern Case

JDK 的 BufferedWriter 采用了 Decorater Pattern, 在 FileWriter 基础上动态扩展功能, BufferedWriter 内部维护一个 Writer, 通过 Writer 在原先基础上扩展功能

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241805334.png)

```java
FileWriter fw = new FileWriter("/Users/HarveySuen/Downloads/test.txt");
fw.write("hello world");

BufferedWriter bw = new BufferedWriter(fw);
bw.write("hello world");
```

```java
public class BufferedWriter extends Writer {
    private Writer out;

    public BufferedWriter(Writer out) {
        this(out, defaultCharBufferSize);
    }
}
```

