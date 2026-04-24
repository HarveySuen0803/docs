# Join

## Hash Join

```java
import java.util.*;

public class HashJoinExample {

    public static List<Result> hashJoin(List<Order> orders, List<User> users) {
        // 1️⃣ Build 阶段：构建 Hash 表
        Map<Integer, User> hashTable = new HashMap<>();
        for (User user : users) {
            hashTable.put(user.userId, user);
        }

        // 2️⃣ Probe 阶段：扫描 orders 并匹配
        List<Result> results = new ArrayList<>();
        for (Order order : orders) {
            User user = hashTable.get(order.userId);
            if (user != null) {
                results.add(new Result(order.userId, user.name, order.amount));
            }
        }

        return results;
    }

    public static void main(String[] args) {
        List<Order> orders = Arrays.asList(
                new Order(1, 100),
                new Order(2, 200),
                new Order(3, 300)
        );

        List<User> users = Arrays.asList(
                new User(1, "Alice"),
                new User(2, "Bob")
        );

        List<Result> results = hashJoin(orders, users);
    }
}
```

