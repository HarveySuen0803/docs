# Prototype Pattern

将一个 instance 作为 prototype, 后续复制 prototype 得到一个相同的 object

```java
class Sheep implements Cloneable {
    @Override
    public Sheep clone() throws CloneNotSupportedException {
        return (Sheep) super.clone();
    }
}
```

# Shallow Clone

```java
Sheep sheep1 = new Sheep();
Sheep sheep2 = sheep1.clone();
System.out.println(sheep1 == sheep2); // false
System.out.println(sheep1.getWool() == sheep2.getWool()); // true
```

# Deep Clone

```java
Sheep sheep1 = new Sheep();

ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("/Users/HarveySuen/Downloads/test.txt"));
oos.writeObject(sheep1);
oos.close();

ObjectInputStream ois = new ObjectInputStream(new FileInputStream("/Users/HarveySuen/Downloads/test.txt"));
Sheep sheep2 = (Sheep) ois.readObject();
ois.close();

System.out.println(sheep1 == sheep2); // false
System.out.println(sheep1.getWool() == sheep2.getWool()); // false
```


