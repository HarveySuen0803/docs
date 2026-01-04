# Enum

枚举: 一种特殊的类, 类的内部包含了有限个常量对象

```java
public class Main {
    public static void main(String[] args) {
        System.out.println(Season.SPRING);
        System.out.println(Season.SUMMER);
    }
}

// 枚举类
enum Season {
    // SPRING 调用 Season()
    // SUMMER 调用 Season()
    // AUTUMN 调用 Season(name)
    // WINTER 调用 Season(name, desc)
    SPRING, SUMMER(), AUTUMN("autumn"), WINTER("winter", "cold");

    private String name;
    private String desc;

    // 构造器默认访问修饰符为 private, 不需要手动添加 private, 防止其他类 new Season()
    Season() {}

    Season(String name) {
        this.name = name;
    }

    Season(String name, String desc) {
        this.name = name;
        this.desc = desc;
    }

    // 可以提供 getter(), 不可以提供 setter(), 防止修改
    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "Season{" +
                "name='" + name + '\'' +
                ", desc='" + desc + '\'' +
                '}';
    }
}
```

SPRING("spring") 相当于

```java
public final static Season SPRING = new Season("spring")
```

枚举对象必须在第一行

```java
enum Season {
    private String name;
    
    SPRING, SUMMER(), AUTUMN("autumn"), WINTER("winter", "cold"); // error
}
```

# Enum Api

### name()

```java
Season winter = Season.WINTER;

// 返回对象名
System.out.println(winter.name()); // "WINTER"
```

## ordinal() 

```java
Season winter = Season.WINTER;

// 返回对象的索引
System.out.println(winter.ordinal()); // 3
```

## values() 

```java
// 返回所有的对象
Season[] seasons = Season.values();

for (Season season : seasons) {
    System.out.println(season);
}
```

## valueOf() 

```java
Season autumn = Season.valueOf("AUTUMN");

// 根据对象名, 返回对象
System.out.println(autumn); // "Season{name='autumn', desc='null'}"
```

## compareTo() 

```java
Season winter = Season.WINTER;
Season autumn = Season.AUTUMN;

// 比较索引
System.out.println(winter.compareTo(autumn)); // 1
System.out.println(autumn.compareTo(winter)); // -1
```

# Switch Enum

```java
public class Main {
    public static void main(String[] args) {
        Color green = Color.GREEN;

        switch (green) {
            case GREEN:
                System.out.println("green");
                break;
            case BLUE:
                System.out.println("blue");
                break;
            case RED:
                System.out.println("red");
                break;
            default:
                System.out.println("match failed");
                break;
        }

        // 箭头函数实现
        switch (green) {
            case GREEN -> System.out.println("green");
            case BLUE -> System.out.println("blue");
            case RED -> System.out.println("red");
            default -> System.out.println("match failed");
        }
    }
}

enum Color {
    RED(255, 0, 0), BLUE(0, 0, 255), GREEN(0, 255, 0);
    
    private int redValue;
    private int greenValue;
    private int blueValue;

    private Color(int redValue, int greenValue, int blueValue) {
        this.redValue = redValue;
        this.greenValue = greenValue;
        this.blueValue = blueValue;
    }
}
```

# Extend Class

枚举类是一个 final 类, 不可以被继承, 通过 javap 反编译可以查看到

```java
enum Season {}

class A extends Season {} // error
```

枚举类隐式的继承了 Enum 类, 不可以再继承其他类

```java
class A {}

enum Season extends A {} // error
```

# Implement Interface

枚举类可以实现接口

```java
interface IA {
    void iaShow();
}

interface IB {
    void ibShow();
}

enum Season implements IA, IB {
    SPRING(), SUMMER(), AUTUMN(), WINTER();
    
    @Override
    public void iaShow() {
        System.out.println("iaShow()");
    }

    @Override
    public void ibShow() {
        System.out.println("ibShow()");
    }
}
```
