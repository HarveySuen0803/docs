# OpenFeign

Feign can send Http request just like invoke local method

import dependency

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

enable Feign function for SpringBoot

```java
@EnableFeignClients
```

set Feign client

```java
@FeignClient("user-service") // set client name
public interface UserClient {
    @GetMapping("/user/{id}") // set client path
    User selectById(@PathVariable Integer id);
}
```

invoke client method to send Http request

```java
User user = userClient.selectById(1);
```

# OpenFeign API module

project structure

```
spring-cloud-demo
├── feign-api
├── order-service
└── user-service
```

import feign-api module

```xml
<dependency>
    <groupId>com.harvey</groupId>
    <artifactId>feign-api</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

enable Feign function for module

```java
@EnableFeignClients
```

send Http request

```java
User user = userClient.selectById(1);
```

# public path

```java
// set `/user` as public path, similar to @RuequstMapping("/user")
@FeignClient(name = "user-service", path = "/user")
```

# import client

import class

```java
@EnableFeignClients(clients = {UserClient.class, OrderClient.class})
```

import package

```java
@EnableFeignClients(basePackages = {"com.harvey.client", "com.suen.client"})
```

# set Feign by profile

set local config

```properties
# log leavel: NONE < BASIC < HEADERS < FULL
spring.cloud.openfeign.client.config.user-service.logger-level=basick

spring.cloud.openfeign.client.config.default.connect-timeout=5000

spring.cloud.openfeign.client.config.default.read-timeout=3000
```

set global config

```properties
spring.cloud.openfeign.client.config.default.logger-level=basic
```

# set Feign by Configuration

set Feign configuration

```java
@Configuration
public class FeignConfiguration {
    @Bean
    public Logger.Level level() {
        return Logger.Level.BASIC;
    }
}
```

set local config

```java
@FeignClient(value = "user-service", configuration = FeignConfiguration.class)
public interface UserClient {}
```

set global config

```java
@SpringBootApplication
@EnableFeignClients(defaultConfiguration = FeignConfiguration.class)
public class OrderServiceApplication {}
```

# HttpClient

Feign uses URLConnection to send Http request by deafult, but URLConnection does not have connection pool. we can use Apache HttpClient to instead of URLConnection to optimize performance

import dependency

```xml
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-httpclient</artifactId>
</dependency>
```

set HttpClient config

```properties
spring.cloud.openfeign.httpclient.enabled=true
spring.cloud.openfeign.httpclient.connection-timeout=2000
spring.cloud.openfeign.httpclient.max-connections=200
spring.cloud.openfeign.httpclient.max-connections-per-route=50
```

# interceptor

set interceptor

```java
public class UserInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate requestTemplate) {
        requestTemplate.header("token", "wjeoifwijfisjdfse");
        requestTemplate.query("username", "harvey");
        requestTemplate.uri("/user");
    }
}
```

impot interceptor

```java
feign.client.config.user-service.requestInterceptors[0]=com.harvey.interceptor.feign.UserInterceptor
```

# circuit breaker

import dependency

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
```

set properties

```properties
spring.cloud.openfeign.circuitbreaker.enabled=true
spring.cloud.openfeign.circuitbreaker.alphanumeric-ids.enabled=true

resilience4j.circuitbreaker.instances.UserClienttest.minimum-number-of-calls=69
resilience4j.timelimiter.instances.UserClienttest.timeout-duration=10s
```

set client

```java
@FeignClient(value = "user-service", fallbackFactory = UserClientFallbackFactory.class)
public interface UserClient {
    @GetMapping(value = "/test")
    String test();
}
```

set fallbackfactory

```java
@Component
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
    @Override
    public UserClient create(Throwable cause) {
        return new UserClient() {
            @Override
            public String test() {
                return cause.getMessage();
            }
        };
    }
}
```

