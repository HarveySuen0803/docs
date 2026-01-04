# Auto Configuration

导入 Dependency 的 starter pkg 后, 会自动导入该 Dependency 的 autoconfigure pkg (eg. 导入 spring-boot-stater 后, 会自动导入 spring-boot-autoconfigure)

App.java 的 @EnableAutoConfiguration 底层包含 @Import({AutoConfigurationImportSelector.class}), 根据 SPI 访问 META-INF/spring/%s.imports (eg. META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports), 动态加载 Component

%s.imports 包含该 Dependency 提供的所有 Configuration (eg. xxx.AutoConfiguration.imports 包含 xxx.aop.AopAutoConfiguration, xxx.amqp.RabbitAutoConfiguration), Configuration 包含 @Import({xxxSelector.class}) 通过 @Condition 按条件导入 Bean, 实现 Auto Configuration

通过 Auto Configuration 导入的 Configuration 用到的 Properties Obj 可以在 application.properties 中配置

```properties
# SpringMVC config
spring.mvc.*

# Web config
spring.web.*

# upload file config
spring.servlet.multipart.*

# server config
server.*
```

# Auto Configuration Detail

> aliyun-oss-spring-boot-autoconfigure

project structor

```
aliyun-oss-spring-boot-autoconfigure
├── pom.xml
└── src
    └── main
        ├── java
        │   └── com
        │       └── aliyun
        │           └── oss
        │               ├── AliOSSAutoConfiguration.java
        │               ├── AliOSSProperties.java
        │               └── AliOSSUtils.java
        └── resources
            └── META-INF
                └── spring
                    └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

pom.xml

```xml
<!-- Spring Boot -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>

<!-- Spring Boot Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>

<!-- Aliyun OSS SDK -->
<dependency>
    <groupId>com.aliyun.oss</groupId>
    <artifactId>aliyun-sdk-oss</artifactId>
    <version>3.16.1</version>
</dependency>

<!-- Java supplement -->
<dependency>
    <groupId>javax.xml.bind</groupId>
    <artifactId>jaxb-api</artifactId>
    <version>2.4.0-b180830.0359</version>
</dependency>
<dependency>
    <groupId>javax.activation</groupId>
    <artifactId>activation</artifactId>
    <version>1.1.1</version>
</dependency>
<dependency>
    <groupId>org.glassfish.jaxb</groupId>
    <artifactId>jaxb-runtime</artifactId>
    <version>4.0.2</version>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

AliOSSProperties.java

```java
@Data
@ConfigurationProperties(prefix = "aliyun.oss")
public class AliOSSProperties {
    private String endpoint;
    private String accessKeyId;
    private String accessKeySecret;
    private String bucketName;
}
```

AliOSSUtils.java

```java
public class AliOSSUtils {
    private AliOSSProperties aliOSSProperties;

    public void setAliOSSProperties(AliOSSProperties aliOSSProperties) {
        this.aliOSSProperties = aliOSSProperties;
    }

    // 工具类的方法
    public String upload(MultipartFile file) throws IOException {
        // ...
    }
}
```

AliOSSAutoConfiguration.java

```java
@Configuration
// 声明 AliOSSProperties Bean, 下面在参数列表中可以调用 AliOSSProperties Bean
@EnableConfigurationProperties(AliOSSProperties.class)
public class AliOSSAutoConfiguration {
    // 配置 AliOSSUtils Bean
    @Bean
    public AliOSSUtils aliOSSUtils(AliOSSProperties aliOSSProperties) {
        // 封装 AliOSSUtils obj
        AliOSSUtils aliOSSUtils = new AliOSSUtils();
        // AliOSSProperties Bean 仅仅作用于 AliOSSAutoConfiguration, 所以需要通过 setter() 给 AliOSSUtils 提供 AliOSSProperties
        aliOSSUtils.setAliOSSProperties(aliOSSProperties);
        // 返回 AliOSSUtils obj
        return aliOSSUtils;
    }
}
```

resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports, 导出 AliOSSAutoConfiguration

```
com.aliyun.oss.AliOSSAutoConfiguration
```

> aliyun-oss-spring-boot-starter

project structure

```
aliyun-oss-spring-boot-starter
└── pom.xml
```

pom.xml, 导入 aliyun-oss-spring-boot-autoconfigure

```xml
<dependencies>
    <!-- spring-boot-starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>

    <!-- aliyun-oss-spring-boot-autoconfigure -->
    <dependency>
        <groupId>com.aliyun.oss</groupId>
        <artifactId>aliyun-oss-spring-boot-autoconfigure</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </dependency>
</dependencies>
```

> spring-boot-test

pom.xml, 导入 spring-boot-starter, 相当于导入了 autoconfigure 的 imports, Spring 就可以扫描到 imports 中的 AliOSSAutoConfiguration, 容器就会管理 AliOSSUtils Bean

```xml
<dependency>
    <groupId>com.aliyun.oss</groupId>
    <artifactId>aliyun-oss-spring-boot-starter</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

application.properties, 配置参数

```properties
aliyun.oss.endpoint=https://oss-cn-shanghai.aliyuncs.com
aliyun.oss.accessKeyId=...
aliyun.oss.accessKeySecret=...
aliyun.oss.bucketName=demo-sun
```

UploadController.java

```java
@RestController
public class UploadController {
    @Autowired
    AliOSSUtils aliOSSUtils;

    @PostMapping("/upload")
    public String upload(MultipartFile file) throws Exception {
        return aliOSSUtils.upload(file);
    }
}
```