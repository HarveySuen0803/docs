# Template Pattern

Cook 的 cook() 是一套流程模版, 抽象其中需要调整的细节, 通过 Parent Class 调用 Sub Class 的 method, 不同 implement 有不同的细节

Tempalte Pattern 符合 Open-Closed Principle, 但是容易导致 Class Explode

```java
public class Main {
    public static void main(String[] args) throws IOException {
        Cook firedRice = new FiredRice();
        firedRice.cook();
        
        Cook firedNoodles = new FiredNoodles();
        firedNoodles.cook();
    }
}

abstract class Cook {
    public final void cook() {
        this.prepare();
        this.pour();
        this.fry();
    }
    
    public void prepare() {
        System.out.println("prepare");
    }
    
    public abstract void pour();
    
    public void fry() {
        System.out.println("fry");
    }
}

class FiredRice extends Cook {
    @Override
    public void pour() {
        System.out.println("pour rice");
    }
}

class FiredNoodles extends Cook {
    @Override
    public void pour() {
        System.out.println("pour noodles");
    }
}
```

# Template Pattern Case

InputStream 的 read() 采用了 Template Pattern, 抽象 read(), 再调用 implement 的 read()

```java
public abstract class InputStream implements Closeable {
    public abstract int read() throws IOException;

    public int read(byte b[], int off, int len) throws IOException {
        // ...
        c = read();
        // ...
    }
}
```

