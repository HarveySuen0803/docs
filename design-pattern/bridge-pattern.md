# Bridge Pattern

Product 内部维护了一个 Payment, 创建 Product 时, 就需要传入一个 Payment 的实现, 由 Product 来调用 Payment 的 method

扩展 Payment, 不需要修改 Product 和 Payment

```java
public class Main {
    public static void main(String[] args) throws IOException {
        new Product(new AlipayPayment()).pay();
        new Product(new WechatPayment()).pay();
    }
}

interface Payment {
    void pay();
}

class AlipayPayment implements Payment {
    @Override
    public void pay() {
        System.out.println("Pay with credit alipay");
    }
}

class WechatPayment implements Payment {
    @Override
    public void pay() {
        System.out.println("Pay with wechat");
    }
}

class Product {
    private Payment payment;
    
    public Product(Payment payment) {
        this.payment = payment;
    }
    
    public void pay() {
        payment.pay();
    }
}
```
