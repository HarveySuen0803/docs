# Open-Closed Principle

Open-Closed Principle 要求对扩展开放, 对修改关闭, 扩展时, 不能修改原有的代码, 实现热插拔

```java
public class Main {
    public static void main(String[] args) {
        InputMethod inputMethod = new InputMethod();
        
        inputMethod.setSkin(new defaultSkin());
        inputMethod.displaySkin();
        
        inputMethod.setSkin(new customSkin());
        inputMethod.displaySkin();
    }
}

class InputMethod {
    private Skin skin;
    
    public void setSkin(Skin skin) {
        this.skin = skin;
    }
    
    public void displaySkin() {
        skin.displaySkin();
    }
}

interface Skin {
    void displaySkin();
}

class defaultSkin implements Skin{
    @Override
    public void displaySkin() {
        System.out.println("default skin");
    }
}

class customSkin implements Skin{
    @Override
    public void displaySkin() {
        System.out.println("default skin");
    }
}
```

# Liskov Substitution Principle

Liskov Substitution Principle 要求 sub class 可以扩展 parent class, 但尽量不要重写 parent class, 需要重写的部分, 尽量通过 interface 实现

Square 重写了 Rectangle 的 method, 违反了 Liskov Substitution Principle

```java
@Data
class Rectangle {
    private double length;
    private double width;
}

class Square extends Rectangle {
    @Override
    public void setLength(double length) {
        super.setLength(length);
        super.setWidth(length);
    }
    
    @Override
    public void setWidth(double width) {
        super.setLength(width);
        super.setWidth(width);
    }
}
```

Square, Rectangle 实现 Quadrilateral 改善 code

```java
interface Quadrilateral {
    double getLength();
    double getWidth();
}

@Data
class Rectangle implements Quadrilateral{
    private double length;
    private double width;
    
    @Override
    public double getLength() {
        return length;
    }
    
    @Override
    public double getWidth() {
        return width;
    }
}

@Data
class Square implements Quadrilateral{
    private double slide;
    
    @Override
    public double getLength() {
        return slide;
    }
    
    @Override
    public double getWidth() {
        return slide;
    }
}
```

# Dependence Inversion Principle

Dependence Inversion Principle 要求 high-level module 依赖 low-level module 时, 依赖 abstract, 不依赖 implementation

```java
public class Main {
    public static void main(String[] args) {
        Computer computer = new Computer();
        computer.setCpu(new IntelCpu());
        computer.setDisk(new XiJieDisk());
    }
}

@Data
class Computer { 
    private Disk disk;
    private Cpu cpu;
}

interface Disk {}

interface Cpu {}

class XiJieDisk implements Disk {}

class IntelCpu implements Cpu {}
```

# Interface Segregation Principle

Interface Segregation Principle 要求 interface 拆分到最小化

```java
// split interface
interface SafeProof {
    void theftProof();
    void fileProof();
}

interface TheftProof {
    void theftProof();
}
interface FireProof {
    void fileProof();
}
```

# Least Knowledge Principle

Least Knowledge Principle 要求两个无需直接通信的模块, 可以通过第三方模块协助通信

Fans 和 Star 没有强关联, Fans 直接访问 Star, 违反了 Least Knowledge Principle

```java
public class Main {
    public static void main(String[] args) {
        Fans fans = new Fans();
        fans.setStar(new Star());
        fans.meet();
    }
}

class Star {}

@Data
class Fans {
    private Star star;
    
    public void meet() {
        System.out.println(this + " meet " + star); 
    }
}
```

Agent 和 Star 有强关联, Fans 通过 Agent 访问 Star, 降低耦合度

```java
public class Main {
    public static void main(String[] args) {
        Agent agent = new Agent();
        agent.setFans(new Fans());
        agent.setStar(new Star());
        agent.meet();
    }
}

class Star {}

class Fans {}

@Data
class Agent {
    private Star star;
    private Fans fans;
    
    public void meet() {
        System.out.println(fans + " meet " + star);
    }
}
```

# Composite Reuse Principle

Composite Reuse Principle 要求尽量使用 composite 或 aggregation, 其他再考虑 inheritance

inheritance 的 sub class 和 parent class 存在 high coupling, 破坏了 class 的 encapsulation, reuse 也不灵活

PetrolCar 和 ElectricCar 继承 Car, 而 RedPetrolCar, BluePetrolCar 继承 Car, 通过 inheritance 实现过于繁琐, 存在 high coupling

```java
class Car {}

class PetrolCar extends Car {}

class ElectricCar extends Car {}

class RedPetrolCar extends PetrolCar {}

class BluePetrolCar extends PetrolCar {}

class RedElectricCar extends ElectricCar {}
```

单独封装一个 Color class, 通过 composite 代替 inheritance

```java
class Car {
    Color color;
}

class PetrolCar extends Car {}

class ElectricCar extends Car {}

class Color {}

class RedColor extends Color {}

class BlueColor extends Color {}
```


