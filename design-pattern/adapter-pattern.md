# Adapter Pattern

适配器模式（Adapter Pattern）是一种结构型设计模式，它的主要目的是将一个类的接口转换成客户端期望的另一个接口。该模式使得原本接口不兼容的类可以一起工作。

假设我们有一个老的支付系统（Old Payment System），但现在需要将其适配到一个新的支付系统（Payment System）中。

```java
public class Main {
    public static void main(String[] args) {
        PaymentSystem paymentSystem = new OldPaymentSystemAdapter(new OldPaymentSystem());
        
        paymentSystem.pay("1", 1000);
    }
}

class OldPaymentSystem {
    public void makePayment(String customerName, double amount) {
        System.out.println("Making payment of " + amount + " for " + customerName + " using old payment system.");
    }
}

interface PaymentSystem {
    void pay(String customerId, double amount);
}

class OldPaymentSystemAdapter implements PaymentSystem {
    private OldPaymentSystem oldPaymentSystem;
    
    public OldPaymentSystemAdapter(OldPaymentSystem oldPaymentSystem) {
        this.oldPaymentSystem = oldPaymentSystem;
    }
    
    @Override
    public void pay(String customerId, double amount) {
        // Adapt here by converting customerId to customerName.
        String customerName = getCustomerName(customerId);
        
        oldPaymentSystem.makePayment(customerName, amount);
    }
    
    private String getCustomerName(String customerId) {
        return "Customer" + customerId;
    }
}
```

# Adapter Pattern Case

JDK 的 StreamEncode 都采用了 Adapter Pattern

OutputStreamWriter 维护了一个 StreamEncoder, 调用 StreamEncoder 的 write() 实现了 Writer 的功能

StreamEncoder 维护了一个 OutputStream, 调用 OutputStream 的 write() 实现了 Writer 的功能

FileOutputStream 和 Writer 没有关系, 而 FileOutputStream 可以实现 Writer 的 write(), 由 StreamEncoder 作中间件, 直接调用 FileOutputStream object 的 write() 实现了 Writer 的功能

```java
OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream("/Users/HarveySuen/Downloads/test.txt"));
osw.write("hello world");
```

```java
public class OutputStreamWriter extends Writer {
    private final StreamEncoder se;
    
    public void write(String str) {
        se.write(String str);
    }
}
```

```java
public class StreamEncoder extends Writer {
    private final OutputStream out;
    
    public void write(String str) {
        out.write(str);
    }
}
```

