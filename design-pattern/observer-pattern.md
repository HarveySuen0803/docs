### 观察者模式

观察者模式（Observer Pattern）是一种设计模式，它定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。当主题对象的状态发生变化时，它会通知所有观察者对象，使它们能够自动更新。这个模式经常用于实现事件处理系统。

下面这段代码中，`ConsumerA` 和 `ConsumerB` 就是观察者，`Publisher` 就是主题对象，内部维护了一个 `consumerList` 集合，当 `Publisher` 状态发生变化了时，就可以调用 `fanout` 通知所有的观察者。

```java
public class Main {
    public static void main(String[] args) {
        Consumer consumerA = new ConsumerA();
        Consumer consumerB = new ConsumerB();
        
        Publisher publisher = new Publisher();
        publisher.register(consumerA);
        publisher.register(consumerB);
        
        publisher.fanout("hello world");
    }
}

class Publisher {
    private List<Consumer> consumerList = new ArrayList<>();
    
    public void register(Consumer consumer) {
        consumerList.add(consumer);
    }
    
    public void fanout(String msg) {
        for (Consumer consumer : consumerList) {
            consumer.consume(msg);
        }
    }
}

interface Consumer {
    void consume(String msg);
}

class ConsumerA implements Consumer {
    @Override
    public void consume(String msg) {
        System.out.println(msg);
    }
}

class ConsumerB implements Consumer {
    @Override
    public void consume(String msg) {
        System.out.println(msg);
    }
}
```

### 事件监听

事件监听就是观察者模式的具体实现。在事件监听中，事件源充当“主题”角色，而监听器充当“观察者”角色。当事件源状态发生变化（例如，按钮被点击）时，它会通知所有注册的监听器。下面我将举例按钮点击事件，来说明在 Java 中如何实现事件监听。

首先，定义一个事件类，它将包含事件相关的信息。

```java
public class ButtonClickEvent {
    private final Object source;

    public ButtonClickEvent(Object source) {
        this.source = source;
    }

    public Object getSource() {
        return source;
    }
}
```

接下来，定义一个监听器接口，声明事件处理方法。

```java
public interface ButtonClickListener {
    void onButtonClick(ButtonClickEvent event);
}
```

创建一个按钮类，它可以注册监听器并在按钮被点击时通知它们。

```java
public class Button {
    private List<ButtonClickListener> listeners = new ArrayList<>();

    // Method to add listener
    public void addButtonClickListener(ButtonClickListener listener) {
        listeners.add(listener);
    }

    // Method to simulate button click
    public void click() {
        System.out.println("Button clicked!");
        ButtonClickEvent event = new ButtonClickEvent(this);
        notifyListeners(event);
    }

    // Notify all registered listeners
    private void notifyListeners(ButtonClickEvent event) {
        for (ButtonClickListener listener : listeners) {
            listener.onButtonClick(event);
        }
    }
}
```

最后，创建一个测试类，注册监听器并触发按钮点击事件。

```java
public class ButtonTest {
    public static void main(String[] args) {
        Button button = new Button();

        // Register a listener
        button.addButtonClickListener(new ButtonClickListener() {
            @Override
            public void onButtonClick(ButtonClickEvent event) {
                System.out.println("Button was clicked! Source: " + event.getSource());
            }
        });

        // Simulate button click
        button.click();
    }
}
```

### Spring 事件监听应用

Spring 提供了一个简单且灵活的方式来实现应用程序中的事件驱动开发。事件监听器可以在应用程序的不同部分之间传递信息和触发逻辑，而不需要直接依赖彼此，从而实现松耦合的设计。

首先，我们需要定义一个事件类，继承自 `ApplicationEvent`。

```java
public class CustomEvent extends ApplicationEvent {
    private String message;

    public CustomEvent(Object source, String message) {
        super(source);
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
```

接下来，创建一个事件监听器，可以通过实现 `ApplicationListener` 接口或者使用 `@EventListener` 注解。

1. 使用 `ApplicationListener` 接口实现监听：

```java
@Component
public class CustomEventListener implements ApplicationListener<CustomEvent> {
    @Override
    public void onApplicationEvent(CustomEvent event) {
        System.out.println("Received custom event - " + event.getMessage());
    }
}
```

2. 使用 `@EventListener` 注解实现监听：

```java
@Component
public class AnnotatedCustomEventListener {
    @EventListener
    public void handleCustomEvent(CustomEvent event) {
        System.out.println("Handled event using annotation - " + event.getMessage());
    }
}
```

使用 `ApplicationEventPublisher` 来发布事件。可以在任何 `Spring` 管理的 `bean` 中注入 `ApplicationEventPublisher`。

```java
@Component
public class EventPublisherBean {
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    public void publishEvent(String message) {
        CustomEvent customEvent = new CustomEvent(this, message);
        applicationEventPublisher.publishEvent(customEvent);
    }
}
```

在 Spring Boot 应用程序中使用这些组件：

```java
@SpringBootApplication
public class SpringBootEventDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootEventDemoApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(EventPublisherBean eventPublisherBean) {
        return args -> {
            eventPublisherBean.publishEvent("Hello, Spring Boot Events!");
        };
    }
}
```

### Spring 事件监听关键类

Spring 通过 `ApplicationEvent`、`ApplicationListener`、`ApplicationEventPublisher` 和 `ApplicationEventMulticaster` 等接口和类实现了一种灵活而强大的事件驱动模型。通过 `ApplicationContext` 作为事件发布者，`SimpleApplicationEventMulticaster` 作为事件广播器，Spring 能够在应用程序中实现松耦合的组件通信。

事件对象是 `ApplicationEvent` 的一个实例或子类实例。事件对象包含了事件源和事件相关的信息。

```java
public abstract class ApplicationEvent extends EventObject {
    private final long timestamp;
    
    public ApplicationEvent(Object source) {
        super(source);
        this.timestamp = System.currentTimeMillis();
    }

    public final long getTimestamp() {
        return this.timestamp;
    }
}
```

监听器需要实现 `ApplicationListener` 接口，并重写 `onApplicationEvent` 方法。

```java
public interface ApplicationListener<E extends ApplicationEvent> extends EventListener {
    void onApplicationEvent(E event);
}
```

`ApplicationEventPublisher` 是事件发布的核心接口。Spring 的 `ApplicationContext` 实现了这个接口，因此任何 Spring Bean 都可以通过上下文发布事件。

```java
public interface ApplicationEventPublisher {
    void publishEvent(ApplicationEvent event);
    void publishEvent(Object event);
}
```

`ApplicationEventMulticaster` 是事件广播的核心接口，负责将事件广播给所有注册的监听器。Spring 的默认实现是 `SimpleApplicationEventMulticaster`。

```java
public interface ApplicationEventMulticaster {
    void addApplicationListener(ApplicationListener<?> listener);
    void removeApplicationListener(ApplicationListener<?> listener);
    void multicastEvent(ApplicationEvent event);
}
```

### Spring 事件监听源码解析

事件的发布和处理流程

- 事件发布：通过 `ApplicationEventPublisher` 的 `publishEvent` 方法发布事件。
- 事件广播：`ApplicationEventMulticaster` 将事件广播给所有注册的监听器。Spring 的 `SimpleApplicationEventMulticaster` 默认使用同步方式调用监听器的 `onApplicationEvent` 方法。
- 事件处理：监听器接收到事件后，执行 `onApplicationEvent` 方法进行处理。

`ApplicationEventPublisher` 定义了 `publishEvent` 事件发布方法，`ApplicationContext` 继承了这个接口，在 `AbstractApplicationContext` 中有具体的实现：

```java
public abstract class AbstractApplicationContext extends DefaultResourceLoader implements ConfigurableApplicationContext {
    private ApplicationEventMulticaster applicationEventMulticaster;
    
    @Override
    public void publishEvent(ApplicationEvent event) {
        getApplicationEventMulticaster().multicastEvent(event);
    }
    
    public ApplicationEventMulticaster getApplicationEventMulticaster() {
        if (applicationEventMulticaster == null) {
            this.applicationEventMulticaster = new SimpleApplicationEventMulticaster(beanFactory);
        }
        return this.applicationEventMulticaster;
    }
}
```

`SimpleApplicationEventMulticaster` 是默认的事件广播实现：

```java
public class SimpleApplicationEventMulticaster extends AbstractApplicationEventMulticaster {
    @Override
    public void multicastEvent(final ApplicationEvent event) {
        ResolvableType eventType = resolveDefaultEventType(event);
        for (ApplicationListener<?> listener : getApplicationListeners(event, eventType)) {
            invokeListener(listener, event);
        }
    }
    
    protected void invokeListener(ApplicationListener listener, ApplicationEvent event) {
        listener.onApplicationEvent(event);
    }
}
```

`AbstractApplicationEventMulticaster` 的 `getApplicationListeners` 方法用于获取所有符合条件的监听器：

```java
public abstract class AbstractApplicationEventMulticaster implements ApplicationEventMulticaster, BeanClassLoaderAware, BeanFactoryAware {
    protected Collection<ApplicationListener<?>> getApplicationListeners(
            ApplicationEvent event, ResolvableType eventType) {
    
        // 获取所有注册的监听器
        List<ApplicationListener<?>> allListeners = new ArrayList<>();
        for (ApplicationListener<?> listener : this.applicationListeners) {
            if (supportsEvent(listener, eventType, event)) {
                allListeners.add(listener);
            }
        }
        
        return allListeners;
    }
}
```
