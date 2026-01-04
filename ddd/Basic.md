# Domain

核心子域（Core Domain）是该领域的关键子域，高度定制，是区分其他领域的核心部分。

- 例如：电商领域的订单管理就是核心子域，电商独有的订单管理，直接区分其他的领域，并且订单管理是直接决定了电商业务的发展，是非常重要的。

支撑子域（Supporting Domain）不是领域的核心部分，但是支持了核心子域。

- 例如：电商领域的库存管理就是支撑资源，库存管理虽然也是电商独有的业务，但他并不是最核心的，往往是辅助订单管理的。

通用子域（Generic Domain）并非领域的独特部分，通用子域往往在其他领域都有几户相同的实现。

- 例如：电商领域的用户管理就是通用领域，很多领域都有用户管理。

# Ubiquitous Language

通用语言（Ubiquitous Language）是一个非常关键的概念，旨在创建一个整个项目团队共享的语言，确保开发人员、业务专家、及其他相关干系人之间在交流中使用一致的术语和概念。

- 例如：定义 "用户" 为中文通用语言，"User" 为英文通用语言，如果使用 "账户", "Person", "Account" 来表达，则是违反了通用语言的规定，在代码开发中也要使用 "User" 来表示

分享一下我在学习 DDD 的 DP (Domain Primitive) 时的一些感受，以及在实战中的轻度使用，因为 DP 最理想的状态非常复杂，难以在团队中落地，所以我这里给出了一个简单的使用场景。

我们在接受参数时，一定会对参数进行大量的异常值处理，这些代码就是胶水代码，他们高度重复且与业务割裂。

```java
@PostMapping("/register")
public Result<Void> register(UserRegisterDto userRegisterDto) {
    if (StrUtil.isBlank(username)) {
        throw new ClientException(UserResult.USERNAME_INVALID);
    }
    if (StrUtil.isBlank(password)) {
        throw new ClientException(UserResult.PASSWORD_INVALID);
    }
    if (StrUtil.isBlank(email)) {
        throw new ClientException(UserResult.EMAIL_INVALID);
    }
    
    UserDo userDo = new UserDo();
    BeanUtils.copyProperties(userDo, userRegisterDto);
    // ...
}
```

这些胶水代码其实就可以放在参数对象的构造器里，在创建参数对象时，就做好了异常值处理。这里接受的 UserRegisterDto 作为参数对象，那我们就可以在 UserRegisterDto 的构造器里进行异常值处理。

```java
@Data
public class UserRegisterDto {
    private String username;
    
    private String password;
    
    private String email;
    
    public UserRegisterDto(String username, String password, String email) {
        if (StrUtil.isBlank(username)) {
            throw new ClientException(UserResult.USERNAME_INVALID);
        }
        if (StrUtil.isBlank(password)) {
            throw new ClientException(UserResult.PASSWORD_INVALID);
        }
        if (StrUtil.isBlank(email)) {
            throw new ClientException(UserResult.EMAIL_INVALID);
        }
        
        this.username = username;
        this.password = password;
        this.email = email;
    }
}
```

```java
@PostMapping("/register")
public Result<Void> register(UserRegisterDto userRegisterDto) {
    UserDo userDo = new UserDo();
    BeanUtils.copyProperties(userDo, userRegisterDto);
    // ...
}
```

# Domain Primitive

领域原语（Domain Primitive）封装单个属性，封装基本的验证逻辑，确保每次创建的数据都是合法的，通常用于代表简单但有业务含义的值（如：电子邮件地址、用户名、货币金额）。

定义一个 EmailAddress Dp 和 Password Dp：

```java
public class EmailAddress {
    private final String value;

    public EmailAddress(String value) {
        if (value == null || !value.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email address");
        }
        this.value = value;
    }

    public String getValue() { return value; }
    
    public boolean isSameDomain(EmailAddress other) { 
        return this.value.split("@")[1].equals(other.value.split("@")[1]);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EmailAddress that = (EmailAddress) o;
        return value.equals(that.value);
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }

    @Override
    public String toString() {
        return value;
    }
}
```

# Value Object

值对象（Value Object）封装多个属性，不具唯一标识，通过属性值进行比较，通常不可变，表示复杂的领域概念（如：地址、货币、时间范围）。

定义一个 Address Vo：

```java
public class Address {
    private final String street;
    private final String city;
    private final String zipCode;

    public Address(String street, String city, String zipCode) {
        this.street = street;
        this.city = city;
        this.zipCode = zipCode;
    }

    // 行为 - 验证邮编格式
    public boolean isValidZipCode() {
        return zipCode.matches("^\\d{5}(?:[-\\s]\\d{4})?$");
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Address address = (Address) o;
        return street.equals(address.street) && city.equals(address.city) && zipCode.equals(address.zipCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(street, city, zipCode);
    }

    @Override
    public String toString() {
        return street + ", " + city + ", " + zipCode;
    }
}
```

# Entity

实体（Entity）封装了 Domain Primitive、Value Object、普通属性。实体是具有唯一标识（ID）的领域对象，封装了与其相关的业务逻辑，确保其一致性和业务规则的正确性。实体有生命周期，并且可以经历状态变化。

假设我们有一个用户实体（User），它包含了用户的基本信息和业务逻辑。用户的基本信息可以由领域原语和值对象组成。

```java
public class User {
    private UserId id;
    private String name;
    private EmailAddress email;
    private Password password;
    private Address address;

    public User(UserId id, String name, EmailAddress email, Password password, Address address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.address = address;
    }

    public void changeEmail(EmailAddress newEmail) {
        if (!this.email.isSameDomain(newEmail)) {
            throw new IllegalArgumentException("Domain of new email must be the same as the old one");
        }
        this.email = newEmail;
    }

    public void changePassword(Password newPassword) {
        if (this.password.matches(newPassword.getValue())) {
            throw new IllegalArgumentException("New password must be different from the old one");
        }
        this.password = newPassword;
    }

    // Getter 方法
    public UserId getId() { return id; }
    public String getName() { return name; }
    public EmailAddress getEmail() { return email; }
    public Password getPassword() { return password; }
    public Address getAddress() { return address; }
}
```

在一个聚合内部，实体之间可以自由地相互引用和交互，但跨聚合的实体应该引用对方的唯一标识（ID）来实现，以保持松耦合。

当我们创建一个订单时，我们不会直接把 ﻿Customer 实体传递给 ﻿Order 实体，而是传递 ﻿CustomerId 来表示哪个客户下的订单。

```java
public class Customer {
    private final UUID customerId;
    private final String name;
    private final String email;
}

public class Order {
    private final UUID orderId;
    private final UUID customerId;
    private final List<OrderItem> items;
    private final Date orderDate;
    private double totalAmount;
}

public class OrderService {
    private final Repository<Customer> customerRepository;
    private final Repository<Order> orderRepository;
    private final Repository<Product> productRepository;

    public OrderService(Repository<Customer> customerRepository, Repository<Order> orderRepository, Repository<Product> productRepository) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    public Order createOrder(UUID customerId, List<Pair<UUID, Integer>> items) throws Exception {
        Customer customer = customerRepository.findById(customerId);

        if (customer == null) {
            throw new Exception("Customer does not exist.");
        }

        Order order = new Order(customerId);

        for (Pair<UUID, Integer> item : items) {
            Product product = productRepository.findById(item.getLeft());
            order.addItem(product, item.getRight());
        }

        orderRepository.save(order);
        return order;
    }
}
```

# Aggregate

聚合根（Aggregate Root）是聚合的入口点和唯一外部访问点，保证聚合内数据一致性。它管理聚合内部的所有对象的生命周期、行为和一致性。

- 聚合根是一种特殊的实体，它不仅具有实体的所有特征，还承担着管理和维护整个聚合内所有对象一致性和完整性的职责。

聚合（Aggregate）由一组相关对象（实体和值对象）组成的集合，由聚合根来管理。聚合确保它内部对象的一致性和业务规则。

假设我们有一个电商系统，其中订单（Order）是一个聚合根，订单项（OrderItem）是订单的一个组成部分（实体），Order 作为聚合根，是唯一的外部访问入口，管理着 OrderItem。整个 Order 就是一个聚合。

```java
public class Order {
    private String orderId;
    private String customerId;
    private List<OrderItem> items;
    private OrderStatus status;

    public Order(String customerId) {
        this.orderId = UUID.randomUUID().toString();
        this.customerId = customerId;
        this.items = new ArrayList<>();
        this.status = OrderStatus.CREATED;
    }

    // 添加订单项
    public void addItem(String productId, int quantity, double unitPrice) {
        if (this.status != OrderStatus.CREATED) {
            throw new IllegalStateException("Cannot add items to a processed order");
        }
        OrderItem item = new OrderItem(productId, quantity, unitPrice);
        this.items.add(item);
    }

    // 确认订单
    public void confirm() {
        if (this.items.isEmpty()) {
            throw new IllegalStateException("Cannot confirm an empty order");
        }
        this.status = OrderStatus.CONFIRMED;
    }

    // 取消订单
    public void cancel() {
        this.status = OrderStatus.CANCELLED;
    }

    // 获取订单总金额
    public double getTotalAmount() {
        return items.stream().mapToDouble(OrderItem::getTotalPrice).sum();
    }

    // Getters
    public String getOrderId() { return orderId; }
    public String getCustomerId() { return customerId; }
    public List<OrderItem> getItems() { return items; }
    public OrderStatus getStatus() { return status; }

    // Other necessary methods
}
```

# Double Dispatch

通过依赖注入直接在实体中引用服务或其他实体被认为是错误的。这涉及到聚合内实体的独立性和不变性。

这段代码破坏了实体的独立性，Player 作为一个实体，应该只保留自己的状态（如属性和基本行为）。直接依赖 ﻿EquipmentService 使得 ﻿Player 无法独立运行，而是依赖外部服务。

- 测试 ﻿Player 时，你必须同时设置和测试 ﻿EquipmentService，增加了测试的复杂性。
- 违反了聚合边界，DDD 强调聚合的独立性，应该通过外部传递所需的依赖，而不是内嵌依赖。

```java
public class Player {
    @Autowired
    EquipmentService equipmentService; // 错误：不应在实体中依赖服务

    public void equip(Weapon weapon) {
        if (equipmentService.canEquip(this, weapon)) {
            this.weaponId = weapon.getId();
        } else {
            throw new IllegalArgumentException("Cannot Equip: " + weapon);
        }
    }
}
```

正确的引用方式是通过方法参数传递服务，即 Double Dispatch。

```java
public class Player {
    private UUID weaponId;

    public void equip(Weapon weapon, EquipmentService equipmentService) {
        if (equipmentService.canEquip(this, weapon)) {
            this.weaponId = weapon.getId();
        } else {
            throw new IllegalArgumentException("Cannot Equip: " + weapon);
        }
    }

    // 其他属性和方法...
}
```

在 EquipmentService 里实现相关的逻辑判断，这里我们用了另一个常用的 Strategy 设计模式。

- 这样设计的最大好处是未来的规则增加只需要添加新的 Policy 类，而不需要去改变原有的类。

```java
public class EquipmentServiceImpl implements EquipmentService {
    private EquipmentManager equipmentManager; 

    @Override
    public boolean canEquip(Player player, Weapon weapon) {
        return equipmentManager.canEquip(player, weapon);
    }
}

// 策略优先级管理
public class EquipmentManager {
    private static final List<EquipmentPolicy> POLICIES = new ArrayList<>();
    static {
        POLICIES.add(new FighterEquipmentPolicy());
        POLICIES.add(new MageEquipmentPolicy());
        POLICIES.add(new DragoonEquipmentPolicy());
        POLICIES.add(new DefaultEquipmentPolicy());
    }

    public boolean canEquip(Player player, Weapon weapon) {
        for (EquipmentPolicy policy : POLICIES) {
            if (!policy.canApply(player, weapon)) {
                continue;
            }
            return policy.canEquip(player, weapon);
        }
        return false;
    }
}

// 策略案例
public class FighterEquipmentPolicy implements EquipmentPolicy {

    @Override
    public boolean canApply(Player player, Weapon weapon) {
        return player.getPlayerClass() == PlayerClass.Fighter;
    }

    /**
     * Fighter能装备Sword和Dagger
     */
    @Override
    public boolean canEquip(Player player, Weapon weapon) {
        return weapon.getWeaponType() == WeaponType.Sword
                || weapon.getWeaponType() == WeaponType.Dagger;
    }
}
```

# Domain Service

到底应该是 Player.attack(Monster) 还是 Monster.receiveDamage(Weapon, Player) ？在 DDD 里，因为这个行为可能会影响到 Player、Monster 和 Weapon，所以属于跨实体的业务逻辑。在这种情况下需要通过一个第三方的领域服务（Domain Service）来完成。

```java
public interface CombatService {
    void performAttack(Player player, Monster monster);
}

public class CombatServiceImpl implements CombatService {
    private WeaponRepository weaponRepository;
    private DamageManager damageManager;

    @Override
    public void performAttack(Player player, Monster monster) {
        Weapon weapon = weaponRepository.find(player.getWeaponId());
        int damage = damageManager.calculateDamage(player, weapon, monster);
        if (damage > 0) {
            monster.takeDamage(damage); // （Note 1）在领域服务里变更Monster
        }
        // 省略掉Player和Weapon可能受到的影响
    }
}
```

同样的在这个案例里，可以通过 Strategy 设计模式来解决 damage 的计算问题：

```java
// 策略优先级管理
public class DamageManager {
    private static final List<DamagePolicy> POLICIES = new ArrayList<>();
    
    static {
        POLICIES.add(new DragoonPolicy());
        POLICIES.add(new DragonImmunityPolicy());
        POLICIES.add(new OrcResistancePolicy());
        POLICIES.add(new ElfResistancePolicy());
        POLICIES.add(new PhysicalDamagePolicy());
        POLICIES.add(new DefaultDamagePolicy());
    }

    public int calculateDamage(Player player, Weapon weapon, Monster monster) {
        for (DamagePolicy policy : POLICIES) {
            if (!policy.canApply(player, weapon, monster)) {
                continue;
            }
            return policy.calculateDamage(player, weapon, monster);
        }
        return 0;
    }
}

// 策略案例
public class DragoonPolicy implements DamagePolicy {
    public int calculateDamage(Player player, Weapon weapon, Monster monster) {
        return weapon.getDamage() * 2;
    }
    
    @Override
    public boolean canApply(Player player, Weapon weapon, Monster monster) {
        return player.getPlayerClass() == PlayerClass.Dragoon &&
                monster.getMonsterClass() == MonsterClass.Dragon;
    }
}
```

特别需要注意的是这里的 CombatService 领域服务和 EquipmentService 领域服务，虽然都是领域服务，但实质上有很大的差异。上文的 EquipmentService 更多的是提供只读策略，且只会影响单个对象，所以可以在 Player.equip 方法上通过参数注入。但是 CombatService 有可能会影响多个对象，所以不能直接通过参数注入的方式调用。


# ACL

防腐层 (Anti-Corruption Layer, ACL) 是领域驱动设计（DDD）中的一个重要概念，用于保护系统的领域模型不受外部系统的影响。防腐层通过适配器模式将外部系统的数据和行为转换为领域模型内的表示和操作，从而确保领域模型的纯洁性。

- 防止领域模型被侵蚀：通过防腐层，可以避免外部系统对领域模型的直接依赖和影响。
- 适配器模式：防腐层通常使用适配器模式，将外部系统的接口和数据格式转换为领域模型的接口和数据格式。
- 缓存与兜底策略：为了提高性能和可靠性，防腐层可以使用缓存以减少对外部系统的调用，并在外部系统不可用时提供兜底策略。

假设我们有一个电商系统，需要与一个外部库存管理系统集成。我们将使用防腐层来处理外部库存系统的集成，并使用适配器模式、缓存和兜底策略进行优化。

# ACL Encap External Service

首先定义一个领域接口，用于领域模型与外部系统的交互。

```java
public interface InventoryService {
    int getAvailableStock(String productId);
}
```

假设我们有一个外部系统的库存服务接口和一个模拟实现：

```java
public interface ExternalInventorySystem {
    int fetchStock(String externalProductId);
}

public class ExternalInventorySystemImpl implements ExternalInventorySystem {
    @Override
    public int fetchStock(String externalProductId) {
        // 模拟调用外部系统获取库存信息
        return 100; // 假设每个产品都有100个库存
    }
}
```

定义一个适配器，将外部库存系统的接口转换为领域接口：

```java
public class ExternalInventoryAdapter implements InventoryService {
    private final ExternalInventorySystem externalInventorySystem;

    public ExternalInventoryAdapter(ExternalInventorySystem externalInventorySystem) {
        this.externalInventorySystem = externalInventorySystem;
    }

    @Override
    public int getAvailableStock(String productId) {
        // 转换内部产品ID到外部系统的产品ID
        String externalProductId = convertToExternalProductId(productId);
        return externalInventorySystem.fetchStock(externalProductId);
    }

    private String convertToExternalProductId(String productId) {
        // 模拟转换逻辑
        return "EXT-" + productId;
    }
}
```

为了优化性能，我们实现一个带缓存和兜底策略的防腐层。

```java
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class CachingInventoryService implements InventoryService {
    private final InventoryService delegate;
    private final Map<String, Integer> cache = new ConcurrentHashMap<>();

    public CachingInventoryService(InventoryService delegate) {
        this.delegate = delegate;
    }

    @Override
    public int getAvailableStock(String productId) {
        return cache.computeIfAbsent(productId, key -> {
            try {
                return delegate.getAvailableStock(productId);
            } catch (Exception e) {
                // 兜底策略：在外部系统调用失败时返回一个默认值
                return 0;
            }
        });
    }
}
```

将防腐层集成到领域服务中，并在客户端代码中使用：

```java
public class OrderService {
    private final InventoryService inventoryService;

    public OrderService(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    public void placeOrder(String productId, int quantity) {
        int availableStock = inventoryService.getAvailableStock(productId);
        if (availableStock >= quantity) {
            System.out.println("Order placed for product " + productId + " with quantity " + quantity);
        } else {
            System.out.println("Insufficient stock for product " + productId);
        }
    }
}

// 客户端代码
public class Main {
    public static void main(String[] args) {
        // 初始化外部库存系统和适配器
        ExternalInventorySystem externalInventorySystem = new ExternalInventorySystemImpl();
        InventoryService inventoryService = new ExternalInventoryAdapter(externalInventorySystem);

        // 包装为带缓存的库存服务
        InventoryService cachingInventoryService = new CachingInventoryService(inventoryService);

        // 使用领域服务
        OrderService orderService = new OrderService(cachingInventoryService);

        // 执行订单操作
        orderService.placeOrder("123", 10);
    }
}
```

代码解释：

- 统一领域接口：﻿InventoryService 提供领域内的库存服务接口。
- 外部系统接口：﻿ExternalInventorySystem 提供外部库存系统的接口。
- 防腐层适配器：﻿ExternalInventoryAdapter 实现了 ﻿InventoryService 接口，并将领域内的调用转换为对外部系统的调用。
- 缓存与兜底策略：﻿CachingInventoryService 在调用防腐层适配器时增加了缓存和兜底策略，从而提高性能和可靠性。
- 领域服务：﻿OrderService 使用 ﻿InventoryService 进行库存检查和订单操作。
- 客户端代码：初始化并使用不同的服务和适配器，实现对外部系统的集成而不会影响领域模型。

通过这种架构设计，我们成功将外部系统的接口与领域模型解耦，通过防腐层（ACL）保护领域模型，确保领域逻辑的纯洁性和稳定性，同时使用缓存和兜底策略提高系统性能和可靠性。

# ACL Encap Kafka with

在这个案例里，我们通过封装一个抽象的AuditMessageProducer和AuditMessage DP对象，实现对底层kafka实现的隔离：

```java
@Value
@AllArgsConstructor
public class AuditMessage {

    private UserId userId;
    private AccountNumber source;
    private AccountNumber target;
    private Money money;
    private Date date;

    public String serialize() {
        return userId + "," + source + "," + target + "," + money + "," + date;   
    }

    public static AuditMessage deserialize(String value) {
        // todo
        return null;
    }
}

public interface AuditMessageProducer {
    SendResult send(AuditMessage message);
}

public class AuditMessageProducerImpl implements AuditMessageProducer {

    private static final String TOPIC_AUDIT_LOG = "TOPIC_AUDIT_LOG";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Override
    public SendResult send(AuditMessage message) {
        String messageBody = message.serialize();
        kafkaTemplate.send(TOPIC_AUDIT_LOG, messageBody);
        return SendResult.success();
    }
}
```
