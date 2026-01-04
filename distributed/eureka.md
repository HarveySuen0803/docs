# Eureka

Eureka 是一个 Register Center

Service Supplier 向 Eureka 注册 Service, 定时发送心跳表示存活, 否则 Eureka 会将 Service 移除 Service List

Service Consumer 定时向 Eureka 拉取 Service List, 缓存并更新 Service List

Service Consumer 通过 Service List 发送 Http Req

# Eureka Server

Dependency Version Association

- SpringBoot v3.1.4 --- SpringCloud v2022.0.3
- SpringBoot v2.6.4 --- SpringCloud v2021.0.3

project structure

```
spring-cloud-demo
├── order-service
│   └── pom.xml
├── user-service
│   └── pom.xml
├── eureka-server
│   └── pom.xml
└── pom.xml
```

spring-cloud-dem«o/pom.xml

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2022.0.3</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
</dependencies>
```

eureka-server/pom.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

eureka-server/application.properties

```properties
server.port=9001
spring.application.name=eureka-server
eureka.client.service-url.defaultZone=http://127.0.0.1:9001/eureka
```

eureka-server/EurekaApplication.java, 添加 @EnableEurekaServer 开启 Eureka Server

```java
@EnableEurekaServer
@SpringBootApplication
public class EurekaApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaApplication.class, args);
    }
}
```

访问 `http://localhost:9001`, 查看 Eureka Server Kanban

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241752169.png)
  
# Eureka Client

user-service/pom.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

user-service/application.properties

```properties
server.port=8002
spring.application.name=user-service
eureka.client.service-url.defaultZone=http://127.0.0.1:9001/eureka
```

查看 Service List

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241752170.png)

# Eureka Service

RestTemplate Bean 添加 @LoadBalanced 开启 Load Balanced

```java
@Bean
@LoadBalanced
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

通过 Eureka Client 的 Application name 配置 URL

```java
User user = restTemplate.getForObject("http://user-service/user/1", User.class);
```

# modify Load Balanced Rule

application.properties, 配置 Policy

```properties
user-service.ribbon.NFLoadBalancerRuleClassName=com.netflix.loadbalancer.RandomRule
```

通过 Bean 代替 properties 配置 Policy

```java
@Bean
public IRule randomRule() {
    return new RandomRule();
}
```

# Load Balanced

SpringBoot2 默认通过 Ribbon 进行 Load Balanced

RibbonLoadBalancerClient 拦截 HTTP Req (eg. http://user-service/user/1), 获取 URL 中的 Service ID (eg. user-service)

DynamicServerListLoadBalancer 根据 Service ID 定时向 Eureka Server 拉取 Service List (eg. localhost:8001, localhost8002), 缓存并更新 Service List

IRule 选择策略, 进行 Load Balanced, 返回一个 Service (eg. localhost:8001)

RibbonLoadBalancerClient 替换 Server ID, 得到一个真实的 URL (eg. `http://localhost:8001/user/1`)

# Load Balanced Rule

- RoundRobinRule (def): 轮询 Service List
- AvailabilityFilteringRule: 忽略 Short Circuit Service, High Concurrent Service
- WeightedResponseTimeRule: 根据 Weight 选择 Service
- ZoneAvoidanceRule: 先对 Server 进行分类, 再轮询 Server List
- BestAvailableRule: 忽略 Short Circuit Service, High Concurrent Service
- RandomRule: 随机选择 Service
- RetryRule: 根据重试机制选择 Service

# Eager Load

Ribbon 默认采用 Lazy Load, 在首次访问 Service 时, 创建 LoadBalanceClient, 首次访问较慢, 后续访问较快

通过 Eager Load, 在启动 application 时, 创建 LoadBalanceClient, 首次启动较慢, 访问较快

application.properties, 配置 Eager Load

```properties
# enable Eager Load (def. false)
riboon.eager-load.enabled=true

# Eager Load Service
riboon.eager-load.clients=user-service
```
