# FlyWeight Pattern

BoxFactory 中维护一个 HashMap, 存储需要频繁使用的 object, 控制 object 的使用, 节省资源, 但是逻辑变复杂了

```java
public class Main {
    public static void main(String[] args) throws IOException {
        BoxFactory.getInstance().getBox("I").show();
        BoxFactory.getInstance().getBox("L").show();
        BoxFactory.getInstance().getBox("O").show();
    }
}

abstract class AbstractBox {
    public abstract void show();
}

class IBox extends AbstractBox {
    @Override
    public void show() {
        System.out.println("I Box");
    }
}

class LBox extends AbstractBox {
    @Override
    public void show() {
        System.out.println("L Box");
    }
}

class OBox extends AbstractBox {
    @Override
    public void show() {
        System.out.println("O Box");
    }
}

class BoxFactory {
    private static HashMap<String, AbstractBox> map;
    
    private BoxFactory() {
        map = new HashMap<String, AbstractBox>();
        AbstractBox iBox = new IBox();
        AbstractBox lBox = new LBox();
        AbstractBox oBox = new OBox();
        map.put("I", iBox);
        map.put("L", lBox);
        map.put("O", oBox);
    }
    
    private static class SingletonHolder {
        private static final BoxFactory INSTANCE = new BoxFactory();
    }
    
    public static BoxFactory getInstance() {
        return SingletonHolder.INSTANCE;
    }
    
    public AbstractBox getBox(String shape) {
        return map.get(shape);
    }
}
```

# FlyWeight Pattern Case

String Constant Pool 就使用了 FlyWeight Pattern, 统一管理 constant

```java
String str1 = "harvey";
String str2 = "harvey";
System.out.println(str1 == str2); // true
```