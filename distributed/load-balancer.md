# 负载均衡

Micro Service 同一个模块可能有多个实例, 就需要通过 Load Balancing 选取一个模块进行通信, 最新的 RestTemplate 和 OpenFeign 都可以通过 LoadBalancer 实现 Load Balancing

配置 Dependency

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

配置 RestTemplate Bean, 添加 @LoadBalanced 开启 Load Balancing

```java
@Bean
@LoadBalanced
public RestTemplate restTemplate(){
    return new RestTemplate();
}
```

通过 RestTemplate 发送 Http Request, 默认采用 RoundRobinLoadBalancer Policy

```java
// send get request, convert the returned value to User Entity
User user = restTemplate.getForObject("http://user-service/user/1", User.class)
```

# 负载均衡策略

常见的 Load Balancing Policy

- Random Load Balancing: 随机算法, 适用于服务器性能相近的情况
- Weighted Random Load Balancing: 权重随机算法, 权重可以根据服务器的性能, 负载, 网络带宽等因素来设置
- Round Robin Load Balancing: 轮询算法, 适用于服务器性能相近的情况
- Weighted Round Robin Load Balancing: 权重轮询算法, 在轮询算法的基础上加入了权重的考虑
- Least Connections Load Balancing: 最少连接算法, 将新的请求分配给当前连接数最少的服务器, 适用于处理请求所需时间差异较大的情况
- Source IP Hash Load Balancing: 源地址哈希算法, 根据请求的源地址进行哈希计算, 将请求分配给服务器, 可以保证来自同一源地址的请求总是被分配到同一台服务器

配置 Load Balancing Policy, 不同的 Service 可能采用不同的 Policy, 所以不能添加 @Configuration 将该 Bean 加入到 Spring Context 中

```java
public class LoadBalancingPolicyConfig {
    @Bean
    ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(Environment environment, LoadBalancerClientFactory loadBalancerClientFactory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class), name);
    }
}
```

配置 @LoadBalancerClients 导入 Policy, 让其作用于单一 Service

```java
@SpringBootApplication
@LoadBalancerClients(defaultConfiguration = LoadBalancingPolicyConfig.class)
public class UserApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserApplication.class, args);
    }
}
```
