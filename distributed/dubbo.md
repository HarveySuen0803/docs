# Basic

Dubbo 是一个高性能, 轻量级的开源 Java RPC 框架, 提供了面向接口的远程方法调用, 智能容错, 负载均衡, 以及服务自动注册和发

- 透明远程方法调用: 支持高性能的 RPC 通信, 允许客户端像调用本地方法一样调用远程方法
- 负载均衡: 内置多种负载均衡策略 (eg: 随机、轮询、最少活跃调用), 以适应不同的使用场景
- 服务注册与发现: 支持与多种服务注册中心集成 (eg: Zookeeper, Nacos), 实现服务的自动注册与发现
- 容错和集群支持: 提供了容错机制, 确保分布式环境中的稳定性和可靠性, 支持多种集群配置, 实现高可用性

Dubbo 的架构主要由四个核心部分组成

- Provider: 提供服务的应用, 将自己提供的服务接口发布到注册中心, 以供消费者发现和调用
- Consumer: 调用服务的应用, 从注册中心订阅自己所需的服务, 并根据获得的服务地址信息进行远程调用
- Registry: 服务地址的注册与发现的中心点, 服务提供者在启动时, 会将自己能提供的服务信息注册到注册中心, 服务消费者则从注册中心订阅并获取服务地址信息, 注册中心支持服务的动态注册与发现, 是实现负载均衡和容错的关键
- Common Api: 存储 Provider 和 Consuemr 需要公用的 Entity 和 Interface

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403191025025.png)

配置 Dependency

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>3.2.13</version>
</dependency>
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-serialization-fastjson2</artifactId>
    <version>3.2.13</version>
</dependency>
```

配置 JVM Options 关闭 JDK9 之后深反射的错误提示

```txt
-Dio.netty.tryReflectionSetAccessible=true
--add-opens java.base/java.math=ALL-UNNAMED
--add-opens java.base/jdk.internal.misc=ALL-UNNAMED
--add-opens java.base/java.nio=ALL-UNNAMED
--add-opens java.base/java.lang=ALL-UNNAMED
--add-opens java.base/java.util=ALL-UNNAMED 
--add-opens java.base/java.lang.invoke=ALL-UNNAMED
--add-opens java.base/java.text=ALL-UNNAMED
```

配置 Commons Api, 将公用的 Service 和 Model 存储在这方便 RPC 调用 (module: commons-api)

```txt
+ src/main/java/com/harvey/
  + model
    + UserDo.java
  + service
    + UserService.java
```

```java
public interface UserService {
    String test();
}
```

```java
public class UserDo implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
```

配置 Provider (module: user-service)

1. 导入 Commons Api

```xml
<dependency>
    <groupId>com.harvey</groupId>
    <artifactId>commons-api</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

2. 注册 user-service 为 Provider

```properties
# service name, can be replaced by `spring.application.name`
dubbo.application.name=user-service
# communication protocol
dubbo.protocol.name=dubbo
# provider's port
#   -1  automatically select an available port (recommend)
dubbo.protocol.port=20880
# quality of service
dubbo.application.qos-enable=false
# base package
dubbo.scan.base-packages=com.harvey.service

dubbo.protocol.serialization=fastjson2
dubbo.provider.serialization=fastjson2
dubbo.provider.prefer-serialization=fastjson2
dubbo.protocol.prefer-serialization=fastjson2

dubbo.application.serialize-check-status=DISABLE
```

3. 注册 UserServiceImpl 为 RPC 服务到 Dubbo 中

```java
@Service
@DubboService(parameters = {"serialization", "fastjson2"})
public class UserServiceImpl implements UserService {
    @Override
    public String test() {
        return "hello world";
    }
}
```

配置 Consumer (module: order-service)

1. 导入 Commons Api

```xml
<dependency>
    <groupId>com.harvey</groupId>
    <artifactId>commons-api</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

2. 通过 dubbo 远程调用 user-service 的 test()

- Consumer 访问的其实是 UserServiceImpl 的 Proxy Obj, 该 Proxy Obj 在内部帮我们实现了复杂的网络通信 (eg: 通信方式, 通信协议, 序列化)

```java
@DubboReference(url = "dubbo://198.19.249.3:20880", parameters = {"serialization", "fastjson2"})
public UserService userService;

@Test
public void test() {
    String test = userService.test();
}
```

# QoS

QoS (Quality of Service) 是 Dubbo 框架提供的一种管理和监控服务质量的机制, 允许开发者和运维人员通过 CLI 来执行各种操作 (eg: 查询服务状态, 调整配置, 控制服务)

QoS 为 Dubbo 应用提供了一个内置的轻量级 HTTP 服务器, 通过这个服务器, 用户可以执行各种操作 (eg: 查看服务列表, 查看服务详情, 动态修改日志级别)

```properties
# 开启 QoS 功能
dubbo.application.qos.enable=true
# 设置 QoS 监听端口, 注意避免端口重复
dubbo.application.qos.port=22222
```

可以配置下面选项开启 QoS 的远程访问, 这可能会暴露敏感操作给任意远程用户, 不建议在生产环境中开启 QoS 的远程访问

如果决定开启远程访问, 强烈建议通过防火墙或其他网络安全措施来限制可访问 QoS 端口的 IP 范围

```properties
dubbo.application.qos.accept.foreign.ip=true
```

# Protocol

Dubbo 既支持私有协议 (eg: dubbo), 也支持公有协议 (eg: Http, Http2), Dubbo 内置的 dubbo 协议支持多种通信方式 (eg: BIO, NIO, Netty Mina) 

```properties
dubbo.protocol.name=dubbo
```
