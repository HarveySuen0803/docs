# Actuator

pom.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

application.properties

```properties
# enable endpoint
management.endpoints.enabled-by-default=true

# exposure all endpoint (def. health)
management.endpoints.web.exposure.include=*
```

访问 `http://localhost:8080/actuator`, 查看 Actuator

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810719.png)

# Health Endpoint

application.properties

```properties
# enable health endpoint
management.endpoint.health.enabled=true

# enable health endpoint details (def. never)
management.endpoint.health.show-details=always
```

component/MyComponent.java

```java
@Component
public class MyComponent {
    public Boolean isHealth() {
        return true;
    }
}
```

indicator/MyHealthIndicator.java

```java
@Component
public class MyHealthIndicator extends AbstractHealthIndicator {
    @Autowired
    MyComponent myComponent;

    @Override
    protected void doHealthCheck(Health.Builder builder) throws Exception {
        if (myComponent.isHealth()) {
            builder
                    .up()
                    .withDetail("code", "100")
                    .withDetail("msg", "success")
                    .build();
        } else {
            builder
                    .down()
                    .withDetail("code", "200")
                    .withDetail("msg", "failure")
                    .build();
        }
    }
}
```

访问 `http://localhost:8080/actuator/health`, 查看 Health Endpoint

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810721.png)

# Metrics Endpoint

MyComponent.java, 通过 MeterRegistry 配置 Counter

```java
@Component
public class MyComponent {
    Counter counter = null;

    public MyComponent(MeterRegistry meterRegistry) {
        // myComponent.test 为 Counter name
        counter = meterRegistry.counter("myComponent.test");
    }

    public void test() {
        System.out.println("hello world");
        // increment
        counter.increment();
    }
}
```

访问 `http://localhost:8080/actuator/metrics`, 查看 Metrics

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810722.png)

访问 `http://localhost:8080/actuator/metrics/myComponent.test`, 查看 myComponent.test Metrics

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810723.png)

