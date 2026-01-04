# @SpringBootApplication

SpringBootApplication.java

```java
// 声明为 Configuration
@SpringBootConfiguration
// 开启 Auto Configuration
@EnableAutoConfiguration
// 排除 Component
@ComponentScan(excludeFilters = { @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
		@Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {
    SpringApplication.run(SpringBootApplication.class, args);
}
```

EnableAutoConfiguration.java

```java
// 导入 App pkg 的 Configuration
@AutoConfigurationPackage
// 导入 starter pkg 的 Configuration
@Import(AutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration {}
```

# BeanFactory

BeanFactory 是 SpringBoot 框架中的一个核心接口, 表示 IOC 的 Container, 负责实例化, 管理和配置应用程序中定义的 Bean.

通过 BeanFactory 获取 Bean.

```java
ClassPathResource resource = new ClassPathResource("beanfactory-example.xml");
BeanFactory factory = new XmlBeanFactory(resource);
ExampleBean exampleBean = (ExampleBean) factory.getBean("exampleBean");
System.out.println(exampleBean.getMessage());
```

# ApplicationContext

ApplicationContext 是 BeanFactory 的扩展, 也表示 IOC 的 Container, 但提供了更多的功能 (eg: i18n, AOP, Publish Event).

通过 ApplicationContext 获取 Bean.

```java
MyBean myBean = applicationContext.getBean(MyBean.class);
```

通过 ApplicationContext 获取 Enviroment.

```java
Environment environment = applicationContext.getEnvironment();
String property = environment.getProperty("my.property");
```

通过 ApplicationContext 发布 Event.

```java
applicationContext.publishEvent(new MyEvent(this, "TestEvent"));
```

BeanFactory 采用延迟加载, 在获取 Bean 时才会进行实例化, 可以减少系统资源的占用, 而 ApplicationContext 在启动时会立即加载所有的 Bean, 导致启动时间较⻓.

BeanFactory 是 Singleton, 整个 App 只有一个 BeanFactory Instance, 而 ApplicationContext 是 Multiton, 并且可以通过父子容器的方式组织起来, 方便模块化开发.

# Profile

配置 project env

```properties
# current profile (def. default)
spring.profiles.active=dev

# include profile, 开启 dev profile, test profile
spring.profiles.include=dev,test

# profile group
spring.profiles.group.profile1=dev,test
spring.profiles.group.profile2=test,prod

# profile arr group
spring.profiles.group.profile[0]=dev,test
spring.profiles.group.profile[1]=test,prod

# use profile
spring.profiles.active=profile[0]
```

# Env Profile

application-env.properties, 配置 env profile

```properties
server.port=8081
```

application-prod.properties, 配置 prod profile

```properties
server.port=8081
```

application.properties, 使用 env profile

- application.properties 和 application-env.properties 都生效, application-env.properties 优先级更高

```properties
spring.profiles.active=dev
```

# @Profile

配置 Bean 的作用 Profile

```java
// 作用于 dev env, test env, prod env (def. default)
@Profile({"dev", "test", "prod"})
@Controller
public class UserController {}
```

# DI

通过 @Autowired 注入 Bean, 先根据 Class 匹配, 再根据 Name 匹配

```java
@Autowired
UserService userservice;
```

通过 @Resource 注入 Bean, 先根据 Name 匹配, 再根据 Class 匹配

```java
@Resource
UserService userService;
```

通过 @Bean 声明的 Bean, 在参数列表中直接声明需要注入的 Bean, 就会自动注入, 相当于 @Autowired

```java
// Container 提供 DeptService Obj, EmpService Obj
@Bean
public SAXReader saxReader(DeptService deptService, EmpService empService) {
    System.out.println(deptService);
    System.out.println(empService);
    return new SAXReader();
}
```

注入 Bean 到 Setter 中

```java
UserService userService;

@Autowired
public void setUserService(UserService userService) {
    this.userService = userService;
}
```

注入 Bean 到 Constructor 中

```java
UserService userService;

@Autowired
public UserController(UserService userService) {
    this.userService = userService;
}
```

# DI Conflict

如果 UserServiceImplA, UserServiceImplB 都实现了 UserService, 那么 Container 创建 UserService Obj 时, 就会冲突

```java
@Service
public class UserServiceImplA implements UserService {}
```

```java
@Service
public class UserServiceImplB implements UserService {}
```

```java
@RestController
public class UserController {
    // 创建 UserService Obj 时, 发生冲突
    @Autowired
    private UserService userService;
}
```

通过 @Primary 解决 DI Conflict

```java
// 创建 UserServiceImplA Obj
@Primary
@Service
public class UserServiceImplA implements UserService {}
```

通过 @Qualifier 解决 DI Conflict

```java
@RestController
public class UserController {
    // 创建 UserServiceImplA Obj
    @Qualifier("userServiceImplA")
    @Autowired
    private UserService userService;
}
```

# @Component

可以通过 @Component 或 @Bean 声明一个类为 Bean, 交给 IOC 管理

```java
@Component
public class UserService {}
```

可以通过 @Component 设置 Bean 的名字, 默认为首字母小写的类名 (eg: UserService 为 userService)

```java
// name 或 value 修改 Bean name
@Component(name = "userController")
```

```java
// 默认为 value 属性, 可省略
@Component("userController")
```

# @Scope

通过 @Scope 设置 Bean 作用域

```java
@Scope("prototype")
@Component
public class UserComponent {}
```

# @Lazy

```java
@Lazy
@Controller
public class DeptController {}
```

# @Configuration

configuration/CommonConfiguration.java, 配置 Bean

```java
@Configuration
public class CommonConfiguration {
    // Container 管理 SAXReader Bean
    @Bean
    public SAXReader saxReader() {
        return new SAXReader();
    }
}
```

获取 Bean

```java
// Container 提供 SAXReader Obj
@Autowired
private SAXReader saxReader;
```

# @ComponentScan

通过 @ComponentScan 扫描 Bean, 被扫描到的 Bean 生效

```java
// 扫描 com.harvey.service 和 com.harvey.dao
@ComponentScan({"com.harvey.service", "com.harvey.dao"})
```

排出 Bean

```java
@ComponentScan(value = "com.harvey", excludeFilters = @ComponentScan.Filter (
        type = FilterType.ANNOTATION,
        classes = {RestController.class, Controller.class}
))
```

# @Import

通过 @Import 代替 @ComponentScan 导入 Bean

```java
@Import({MyComponent.class, MyConfiguration.class, MyImportSelector.class})
@Configuration
public class SpringConfiguration {}
```

导入 Component

```java
@Import({MyComponent.class})
```

导入 Configuration

```java
@Import({MyConfiguration.class})
```

# ImportSelector

封装 ImportSelector Cls, 返回需要导入的 Configuration

```java
public class MyImportSelector implements ImportSelector {
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        return new String[] {"com.example.MyConfiguration1", "com.example.MyConfiguration2", "com.example.MyConfiguration3"};
    }
}
```

导入 MyImportSelector.class, 相当于导入了所有的 Configuration

```java
@Import({MyImportSelector.class})
```

封装 Annotation, 导入 ImportSelector Cls

```java
@Import(MyImportSelector.class)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface EnableConfiguration {}
```

添加 Annotation 就相当于导入了所有的 Configuration

```java
@EnableConfiguration
@SpringBootApplication
public class SpringProjectApplication {}
```

# Scan External Bean

> spring-demo2

MyComponent.java

```java
@Component
public class MyComponent {}
```

MyConfiguration.java

```java
@Configuration
public class MyConfiguration {
    @Bean
    public Bean1 bean1() {
        return new Bean1();
    }

    @Bean
    public Bean2 bean2() {
        return new Bean2();
    }
}
```

> spring-demo1

spring-demo1 导入 spring-demo2, 配置 spring-demo2 dep

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>spring-demo2</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

扫描 spring-demo2 的 Bean pkg

```java
@ComponentScan({"com.harvey", "com.example"})
@SpringBootApplication
public class SpringProjectApplication {}
```

调用 spring-demo2 的 Bean

```java
@SpringBootTest
class SpringProjectApplicationTests {
    @Autowired
    private ApplicationContext applicationContext;

    @Test
    void test1() {
        System.out.println(applicationContext.getBean(MyComponent.class));
    }

    @Test
    void test2() {
        System.out.println(applicationContext.getBean(Bean1.class));
        System.out.println(applicationContext.getBean(Bean2.class));
    }
}
```

# Bean statement

@Controller 专用于 Controller, 底层包含 @Component

```java
@RestController
public class UserController {}
```

@Service 专用于 Service, 底层包含 @Component

```java
@Service
public class UserServiceImpl implements UserService {}
```

@Reposity 专用于 Dao, @Repository 底层包含 @Component

```java
@Repository
public class UserDaoImpl implements UserDao {}
```

@Mapper 专用于 Mapper, 添加 @Mapper 后, Spring 会自动创建带有 @Component 的 Obj 实现 Mapper 

```java
@Mapper
public interface EmpMapper {}
```

# Load Properties

application.properties, 配置 properties

```properties
aliyun.oss.endpoint=https://oss-cn-shanghai.aliyuncs.com
```

访问 properties

```java
@Value("${aliyun.oss.endpoint}")
private String endpoint;
```

# Auto Load Properties

pon.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
</dependency>
```

properties/AliOSSProperties.java, 配置 Properties 读取 application.properties (sug. 先封装 Properties, 后配置 properties)

```java
@Data
@Component
// 公共前缀 aliyun.oss
@ConfigurationProperties(prefix = "aliyun.oss")
public class AliOSSProperties {
    // 自动读取 application.properties 中的 aliyun.oss.endpoint
    private String endpoint;
}
```

application.properties, 配置 properties

```properties
aliyun.oss.endpoint=https://oss-cn-shanghai.aliyuncs.com
```

通过 Properties Obj 访问 properties

```java
@Component
public class AliOSSUtils {
    @Autowired
    private AliOSSProperties aliOSSProperties;

    public String upload(MultipartFile file) throws IOException {
        String endpoint = aliOSSProperties.getEndpoint();
    }
}
```

# CommandLineRunner

CommandLineRunner 用于在 SpringBoot 应用启动后执行一些代码, 这个时候应用上下文已经完全载入, 所有 Bean 都已经创建和初始化完毕, 通常用于在应用启动后执行一些应用外部的, 非关键的或者长时间运行的任务.

```java
@Component
public class MyRunner implements CommandLineRunner {
    @Override
    public void run(String...args) throws Exception {
        System.out.println("Application has been started.");
    }
}
```

通过 CommandLineRunner 在 App 启动后, 开启一个异步任务定期收集和发送统计报告.

```java
@Component
public class DailyReportRunner implements CommandLineRunner {
    @Autowired
    private ReportGenerator reportGenerator;

    @Override
    public void run(String... args) {
        new Thread(() -> reportGenerator.generateDailyReport()).start();
    }
}
```

通过 @Order 规定 Runner 的执行顺序.

```java
@Order(0)
@Component
public class ARunner implements CommandLineRunner {
    @Override
    public void run(String... args) throws Exception {
        System.out.println("A Runner is running");
    }
}
```

```java
@Order(1)
@Component
public class BRunner implements CommandLineRunner {
    @Override
    public void run(String... args) throws Exception {
        System.out.println("B Runner is running");
    }
}
```

```txt
A Runner is running
B Runner is running
```

# Circular Reference

这里 A Bean 的初始化阶段需要调用 populateBean() 去填充 B Bean, 需要去创建 B Bean, 而 B Bean 的初始化阶段需要调用 populateBean() 去填充 A Bean 产生 Circular Reference

```java
@Component
public class A {
    @Autowired
    private B b;
}
```

```java
@Component
public class B {
    @Autowired
    private A a;
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401151818697.png)

# Circular Reference (Constructor)

Spring 无法解决 Constructor 引起的 Circular Reference.

Bean Lifecycle 的 populateBean() 中通过 Three-Level Cache 解决了 Circular Reference, 而 createBeanInstance() 是早于 populateBean() 的. A 执行 createBeanInstance() 时, 在 Constructor 中需要去获取 B, 此时 Bean 只存储在 beanDefinitionMap 中, Spring 的 createBeanInstance() 并没有去解决 Circular Reference.

```java
@Component
public class A {
    private B b;

    public A(B b) {
        this.b = b;
    }
}
```

```java
@Component
public class B {
    private A a;

    public B(A a) {
        this.a = a;
    }
}
```

通过 @Lazy 延迟加载 A 或 B, 可以解决这个 Circular Reference

```java
@Component
public class A {
    private B b;

    public A(@Lazy B b) {
        this.b = b;
    }
}
```

# @PostConstructor

@PostConstruct 用于在依赖注入完成后, 进行一些初始化操作, 这个注解的方法在 Bean 初始化 (构造函数执行之后) 立即执行.

```java
@RestController
public class UserController {
    // invoke before IOC init
    @PostConstruct
    private static void init() {
        System.out.println("...");
    }
}
```

通过 @PostConstruct 在 Bean 初始化时, 就从 DB 中查询数据存储到 Cache 中.

```java
@Component
public class UserCache {
    private List<DataRecord> cache;

    @Autowired
    private DataRecordRepository repository;

    @PostConstruct
    public void init() {
        cache = repository.findAll();
    }
}
```

# @ConditionalOnClass

```java
@Bean
// 如果有 Jwt.class, Container 就添加 Emp Bean
@ConditionalOnClass(Jwts.class)
public Emp emp() {
    return new Emp();
}
```

```java
@ConditionalOnClass(name = "io.jsonwebtoken.Jwts")
```

# @ConditionalOnMissingBean

```java
@Bean
// 如果没有 Emp Bean, Container 就添加 Emp Bean
@ConditionalOnMissingBean
public Emp emp() {
    return new Emp();
}
```

# @ConditionalOnProperty

```java
// 如果 application.properties 有 name = "sun", age = "18", Container 就添加 Bean
@ConditionalOnProperty(name = "sun", age = "18")
```
