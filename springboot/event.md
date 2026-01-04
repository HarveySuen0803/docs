# Event

配置 Event

```java
public class SigninSuccessEvent extends ApplicationEvent {
    public SigninSuccessEvent(Object source) {
        super(source);
    }
    
    @Override
    public String toString() {
        return super.toString();
    }
}
```

通过 ApplicationListener 配置 Listener

```java
@Component
public class SigninSuccessEventListener implements ApplicationListener<SigninSuccessEvent> {
    @Override
    public void onApplicationEvent(SigninSuccessEvent event) {
        System.out.println(event);
    }
}
```

通过 @EventListener 配置 Listener

```java
@Component
public class SigninSuccessEventListener {
    @EventListener
    public void onSigninSuccess(SigninSuccessEvent event) {
        System.out.println(event);
    }
}
```

通过 ContextApplication 发布 Event

```java
@Resource
private ApplicationContext applicationContext;

@GetMapping("/signin")
public void signin() {
    applicationContext.publishEvent(new SigninSuccessEvent(new User(1, "harvey", 18)));
}
```

配置 Event Publisher

```java
@Component
public class UserEventPublisher implements ApplicationEventPublisher {
    @Resource
    private ApplicationEventPublisher eventPublisher;
    
    @Override
    public void publishEvent(Object event) {
        System.out.println("Do something in event publisher");
        eventPublisher.publishEvent(event);
    }
}
```

通过自定义的 Event Publisher 发布 Event

```java
@Resource
private UserEventPublisher userEventPublisher;

@GetMapping("/signin")
public void signin() {
    userEventPublisher.publishEvent(new SigninSuccessEvent(new User(1, "harvey", 18)));
}
```