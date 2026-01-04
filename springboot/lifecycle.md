# Lifecycle

Starting: 通过 BootstrapContext 启动 Application, 发布 ﻿ApplicationStartingEvent

Environment Prepared: 准备 ﻿Environment Obj, 会发布 ﻿ApplicationEnvironmentPreparedEvent

Context Prepared: 准备 SpringApplication Obj, 加载 Source, 创建 ApplicationContext Obj, 发布 ApplicationContextInitializedEvent

Context Loaded: 刷新 ApplicationContext, 初始化 Bean 的依赖关系, 发布 ApplicationPreparedEvent

Started: 在启动 CommandLineRunner 和 ApplicationRunner 之前, 此时 ApplicationContext 已经被刷新并且所有的 ﻿Spring Bean 都已经被创建, 发布 ApplicationStartedEvent

Ready: 在启动 CommandLineRunner 和 ApplicationRunner 之后, 已经完全启动并准备好接受 HTTP 请求, 发布 ApplicationReadyEvent

Shutdown: 关闭 Application, 完成一些清理工作或者关闭应用所用的资源, 发布 ﻿ContextClosedEvent

Failed: 启动过程中出现错误或异常, 就会发布 ApplicationFailedEvent 表示启动失败

# SpringApplicationRunListener

通过 SpringApplicationRunListener 监听 Spring Lifecycle

```java
public class MySpringApplicationRunListener implements SpringApplicationRunListener {
    @Override
    public void starting(ConfigurableBootstrapContext bootstrapContext) {
        System.out.println("starting()");
    }

    @Override
    public void environmentPrepared(ConfigurableBootstrapContext bootstrapContext, ConfigurableEnvironment environment) {
        System.out.println("environmentPrepared()");
    }

    // IOC Container 准备好后调用
    @Override
    public void contextPrepared(ConfigurableApplicationContext context) {
        System.out.println("contextPrepared()");
    }

    // IOC Container 加载后调用, 此前导入了 Configuration
    @Override
    public void contextLoaded(ConfigurableApplicationContext context) {
        System.out.println("contextLoaded()");
    }

    // App 启动后调用, 此前刷新了 IOC Container, 创建了 Bean
    @Override
    public void started(ConfigurableApplicationContext context, Duration timeTaken) {
        System.out.println("started()");
    }

    // App 准备好后调用, 此前调用了 CommandLineRunner 运行 App, 可以接受 Http Request 了
    @Override
    public void ready(ConfigurableApplicationContext context, Duration timeTaken) {
        System.out.println("ready()");
    }

    // App 启动失败后调用, 作用于 Environment Prepared, Context Prepared, Context Loaded, Started, Ready, Running
    @Override
    public void failed(ConfigurableApplicationContext context, Throwable exception) {
        System.out.println("failed()");
    }
}
```

注册 Spring Lifecycle, Listener 会读取 classpath:/META-INF/spring.factories 配置 SpringBoot

```properties
org.springframework.boot.SpringApplicationRunListener=com.harvey.listener.MyApplicationListener
```

# Custom Listener

通过 Custom Listener 监听 Spring LifeCycle 中发布的 Event, 从而实现监听 Spring Lifecycle

```java
@EventListener
public void onApplicationEvent(ApplicationEvent event) {
    System.out.println(event);
}
```