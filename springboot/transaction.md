# Transaction

Service 开启一个新的 Transaction 后, TransactionSynchronizationManager 会将 Metadata (eg: DB Connection, Transaction Status) 存储到一个 ThreadLocal Obj 中.

Transaction 涉及的所有操作, 应该都是基于同一个 DB Connection 下, 所以后续该线程的 DAO 操作都会使用这个 ThreadLocal Var 存储的 Metadata.

```java
private static final ThreadLocal<Map<Object, Object>> resources =
    new NamedThreadLocal<>("Transactional resources");
```

# Transaction with Code

```java
DataSource dataSource = applicationContext.getBean(DataSource.class);
Connection connection = dataSource.getConnection();
try {
    connection.setAutoCommit(false);
    Statement statement = connection.createStatement();
    statement.executeUpdate("delete from user where id = 1");
    connection.commit();
} catch (SQLException e) {
    connection.rollback();
} finally {
    connection.close();
}
```

# Transaction with Anno

add @Transactional to Interface Method to enable Transaction for the Method

- it is generally to add @Transaction to Interface Method to decoupling

```java
@Transactional
void deleteById(Integer id);
```

add @Transactional to Interface to enable Transaction for all Method

```java
@Transactional
public interface UserService {}
```

# Transaction Timeout

```java
@Transactional(timeout = 500) // def. -1
```

# Transaction ReadOnly

```java
@Transactional(readOnly = true) // def. false
```

# Transaction Rollback

```java
// 设置捕获 Exception 回滚, (默认为捕获 RuntimeException 回滚)
@Transactional(rollbackFor = Exception.class)
void deleteById(Integer id);
```

# Transaction Log

application.properties

```properties
logging.level.org.springframework.jdbc.support.JdbcTransactionManager=debug
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811397.png)

# Propagation

## Propagation.REQURIED

`Propagation.REQURIED` (def): 如果所在 Method 有 Transaction, 就加入该 Transcation, 如果所在方法没有 Transaction, 就创建新的 Transaction

```java
@Transactional(propagation = Propagation.REQUIRED)
public void test1() {
    try {
        // Exception
    } finally {
        test2()
    }
}
```

```java
// test1() 有 Transcation, test2() 就加入 test1() 的 Transaction, 如果 try {} 有 Exception 就 roll back, finllay {} 中的 test2() 也 roll back
@Transactional(propagation = Propagation.REQUIRED)
public void test2() {}
```

## Propagation.REQUIRES_NEW

一个购物车中的结账操作中, 包含了多个关键步骤 (更新库存, 创建订单, 处理付款), 如果有一些容易出错但关联性又不太强的独立操作 (生成分析日志, 记录购买行为), 为了避免因为这些不太重要的数据异常导致事务回滚, 就可以使用 `Propagation.REQUIRES_NEW` 单独开启一个事务, 或使用 `Propagation.NEVER` 不开启事务

`Propagation.REQUIRES_NEW`: 无论所在方法有没有 Transcation, 都创建新的 Transcation

```java
@Transactional
public void test1() {
    try {
        // Exception
    } finally {
        test2()
    }
}
```

```java
// test2() 创建新 Transaction, 如果 try {} 有 Exception 就 roll back, finally {} 中的 test2() 不 roll back
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void test2() {}
```

下面这段代码中 log() 会加入外层 test() 的事务，log() 内部发生异常后，整个事务都会标记为异常，即将进行回滚，即使 test() 内部将 log() 包住了异常，但是依旧会发生会滚。

- 这里就不能再使用 Propagation.REQUIRED 了，应该使用 Propagation.REQUIRES_NEW。

```java
@Transactional
public void test() {
    try {
        self.log();
    } catch (Exception e) {
        log.error("failed to log, ", e.getMessage());
    }
    userDao.save(user);
}

@Transactional
public void log() {
    log.info("logging");
    throw new RuntimeException("fake exception during logging");
}
```

# Transaction Invalidation

## Rollback Exception

Spring 的 TRX 默认只能感知到 Runtime Exception, 如果是 Compile Exception 则无法感知, 这里 FileNotFoundException 就会导致 Transaction Invalidation

```java
@Transactional
public void m1() throws FileNotFoundException {
    userMapper.inc();
    new FileInputStream("...");
    userMapper.dec();
}
```

只需要扩展 Spring 的 TRX 的处理范围, 即可解决 Transaction Invalidation

```java
@Transactional(rollbackFor = Exception.class)
public void m1() throws FileNotFoundException {
    userMapper.inc();
    new FileInputStream("...");
    userMapper.dec();
}
```

## Access Permissions

如果不实用 public 修饰, 就会导致 Transaction Invalidation

```java
@Transactional
void m1() throws Exception {
    userMapper.inc();
    userMapper.dec();
}
```

## final

Spring Transaction 是通过 Spring AOP 实现的, 而 Spring AOP 是通过 JDK 或 CGLib 的 Dynamic Proxy 实现的, 如果 final 修饰了方法, 就无法重写, 就无法实现 Dynamic Proxy

```java
@Transactional
public final void m1() throws Exception {
    userMapper.inc();
    userMapper.dec();
}
```

## Inner Invocation

这里 m1() 调用了 m2(), 是默认通过 this 调用的, 而不是通过 AOP 的 Dynamic Proxy 调用的, 所以会导致 Transaction Invalidation

```java
@Service
public class UserService {
    public void m1() {
        m2();
    }
    
    @Transactional
    public void m2() {
        userMapper.inc();
        userMapper.dec();   
    }
}
```

可以自己注入自己, 通过 Bean 的方式调用 m2(), 解决 Transaction Invalidation, 同时这里的 Circular Reference 已经被 Spring 的 Three-Level Cache 解决了, 不需要担心

```java
@Service
public class UserService {
    @Autowired
    private UserService userService;

    public void m1() {
        userService.m2();
    }
    
    @Transactional
    public void m2() {
        userMapper.inc();
        userMapper.dec();   
    }
}
```

可以通过 AopContext 获取当前 Bean 的 Proxy Obj 解决 Transaction Invalidation

```java
@Service
public class UserService {
    public void m1() {
        UserService userServiceProxy = (UserService) AopContext.currentProxy();
        userServiceProxy.m2();
    }
    
    @Transactional
    public void m2() {
        userMapper.inc();
        userMapper.dec();   
    }
}
```

## Ignore IOC

没有将 Class 声明为 Bean 交给 IOC 管理, 自然就不存在 Dynamic Proxy, 所以会导致 Transaction Invalidation

```java
public class UserService {
    @Transactional
    public void m1() {
        userMapper.inc();
        userMapper.dec();   
    }
}
```

## Multi Thread

多线程环境下, 每个线程都需要维护一个 ThreadLocal Obj 来存储当前的会话信息, 新开的线程就需要与数据库建立了一个新的会话保证数据隔离, 这个特性就会导致 Transaction Invalidation

```java
@Transactional
public void m1() {
    userMapper.inc();
    new Thread(() => {
        userMapper.dec();
    }).start();
}
```

## Catch Exception

Spring 的 TRX 需要接受到 Exception 后, 才会触发, 这里 Exception 被 catch 处理掉了, Spring 就无法感知该 Exception, 就会导致 Transaction Invalidation

```java
@Transactional
public void m1() {
    try {
        userMapper.inc();
        userMapper.dec();
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

只需要在 catch 中再次抛出异常, 即可解决 Transaction Invalidation

```java
@Transactional
public void m1() throws Exception {
    try {
        userMapper.inc();
        userMapper.dec();
    } catch (Exception e) {
        throw new Exception();
    }
}
```

这里 m2() 抛出异常后, 会影响到 m1(), 导致 inc() 和 dec() 都发生回滚, 通过 try-catch 捕获 m2() 的异常, 可以避免波及到 m1(), 这样即使 dec() 发生异常回滚了, inc() 也不会回滚

```java
@Autowired
private UserService userService;

@Transactional
public void m1() throws Exception {
    userMapper.inc();
    try {
        userService.m2();
    } catch (Exception e) {
        log.error(e.getMessage(), e);
    }
}

@Transactional
public void m2() throws Exception {
    userMapper.dec();
}
```

## Multi Database

在我们的项目中，会需要去访问多个数据库，不只局限于 `application.properties` 里配置的单一固定的数据库。我们内部有类似于下面这个 `@Database` 的注解，只要打在 Mapper 上面，后续使用该 Mapper，就会自动去访问指定的数据库。(我后续可以出文章来解释一下这个 `@Database` 是如何实现的)

```java
@Mapper
@Database("db01") // UserMapper 访问 db01
public class UserMapper {
    public void inser(UserPo userPo);

    public UserPo selectById(Long id);
}

@Mapper
@Database("db02") // OrderMapper 访问 db01
public class OrderMapper {
    public OrderPo selectById(Long id);
}
```

下面这段代码通过 `@Transaction` 来保证事务就会存在问题，因为 `@Transaction` 本质上是通过 AOP 去代理连接数据库，默认会选择第一个数据源建立事务。下面这里涉及了两个数据库，就会出现事务失效的问题。

```java
@Resource
private UserMapper userMapper;

@Resource
private OrderMapper orderMapper;

@Transactional
public void updateOrderStatus(Long userId) {
    userMapper.selectById();
    // ...
    orderMapper.selectById();
    // ...
    userMapper.insert();
}
```

这里本质上就是分布式事务的场景，可以考虑使用用一下分布式事务的组件来解决。

```java
@GlobalTransactional
public void updateOrderStatus(Long userId) {
    userMapper.selectById();
    orderMapper.selectById();
    userMapper.insert();
}
```

# Exercise

## Operation Log

DeptLogServiceImpl.java

```java
@Service
public class DeptLogServiceImpl implements DeptLogService {
    @Autowired
    DeptLogMapper deptLogMapper;

    // 开启新事务, 不受调用者的的事务影响
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void insert(DeptLog deptLog) {
        deptLogMapper.insert(deptLog);
    }
}
```

DeptServiceImpl.java

```java
@Service
public class DeptServiceImpl implements DeptService {
    @Autowired
    private DeptMapper deptMapper;
    @Autowired
    private EmpMapper empMapper;
    @Autowired
    private DeptLogService deptLogService;

    @Transactional
    @Override
    public void delete(Integer id) {
        // deptLogService.insert() 开启新的 Transaction, 如果 try{} 中的 delete() 有 Exception 就 roll back, finally{} 中的 deptLogService.insert() 不 roll back
        try {
            deptMapper.deleteById(id);
            empMapper.deleteByDeptId(id);
        } finally {
            // 无乱是否有 Exception, 都要记录 Operation Log
            deptLogService.insert(new DeptLog("delete dept by id " + id, LocalDateTime.now()));
        }
    }
}
```
