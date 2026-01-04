# Factory Pattern

通过 new 获取 object, 存在 high coupling, 修改 class, 就需要修改每个 new 的地方, 违背了 Open-Closed Principle

通过 Factory Pattern 获取 object, client 只需要访问 factory, 修改 class 后, 只需要修改 factory 即可, 实现 decoupling

# Simple Factory Pattern

```java
public class Main {
    public static void main(String[] args) {
        Factory Factory = new Factory();
        Product productA = Factory.createProduct("A");
        Product productB = Factory.createProduct("B");
    }
}

class Factory {
    public Product createProduct(String type) {
        if ("A".equals(type)) {
            return new ProductA();
        } else if ("B".equals(type)) {
            return new ProductB();
        }
        return null;
    }
}

interface Product {}

class ProductA implements Product {}

class ProductB implements Product {}
```

# Factory Method Pattern

Factory Method Pattern 定义了一个创建对象的接口, 由子类决定要实例化的类是哪一个, 工厂方法模式将对象的实例化推迟到子类, 可以通过不同子类创建不同的实例, 不再需要通过指定类型来创建不同的实例

```java
public class Main {
    public static void main(String[] args) {
        Product productA = new FactoryA().createProduct();
        Product productB = new FactoryB().createProduct();
    }
}

interface Factory {
    Product createProduct();
}

class FactoryA implements Factory {
    @Override
    public Product createProduct() {
        return new ProductA();
    }
}

class FactoryB implements Factory {
    @Override
    public Product createProduct() {
        return new ProductB();
    }
}

interface Product {}

class ProductA implements Product {}

class ProductB implements Product {}
```

# Abstract Factory Pattern

Abstract Factory Pattern 在 Factory Method Pattern 上做了进一步扩展, 每个 Factory 可以生成不同的 Product

```java
public class Main {
    public static void main(String[] args) {
        Product1 product1 = new FactoryA().createProduct1();
        Product2 product2 = new FactoryB().createProduct2();
    }
}

interface Factory {
    Product1 createProduct1();
    Product2 createProduct2();
}

class FactoryA implements Factory {
    public Product1 createProduct1() {
        return new ProductA1();
    }
    public Product2 createProduct2() {
        return new ProductA2();
    }
}

class FactoryB implements Factory {
    public Product1 createProduct1() {
        return new ProductB1();
    }
    public Product2 createProduct2() {
        return new ProductB2();
    }
}

interface Product1 { }
interface Product2 { }

class ProductA1 implements Product1 { }
class ProductA2 implements Product2 { }

class ProductB1 implements Product1 { }
class ProductB2 implements Product2 { }
```

# Load Properties

```properties
america=com.harvey.AmericanCoffee
italy=com.harvey.ItalyCoffee
```

```java
class CoffeeFactory {
    private static Map<String, Coffee> map = new HashMap<>();
    
    static {
        Properties properties = new Properties();
        try {
            properties.load(CoffeeFactory.class.getClassLoader().getResourceAsStream("application.properties"));
            
            for (Map.Entry<Object, Object> property : properties.entrySet()) {
                String className = (String) property.getKey();
                Coffee coffee = (Coffee) Class.forName((String) property.getValue()).getDeclaredConstructor().newInstance();
                map.put(className, coffee);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    public static Coffee createCoffee(String type) {
        return map.get(type);
    }
}
```