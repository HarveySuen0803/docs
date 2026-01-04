# Proxy Pattern

通过 proxy object 访问 target object, 可以在 proxy object 中做中间处理, 保护 target object, 增强 target object 的 method, 使 client 和 target object 分离, 做到一定程度的 decoupling

# Static Proxy Pattern

Static Proxy Pattern 的 Proxy Object 是在 Compile Stage 生成的, 需要手动编写代理类

```java
public class Main {
    public static void main(String[] args) {
        new UserServiceImplProxy(new UserServiceImpl()).show();
    }
}

interface UserService {
    void show();
}

class UserServiceImpl implements UserService {
    @Override
    public void show() {
        System.out.println("show()");
    }
}

class UserServiceImplProxy implements UserService {
    private UserServiceImpl UserServiceImpl;
    
    public UserServiceImplProxy(UserServiceImpl UserServiceImpl) {
        this.UserServiceImpl = UserServiceImpl;
    }
    
    @Override
    public void show() {
        System.out.println("Before static proxy");
        UserServiceImpl.show();
        System.out.println("After static proxy");
    }
}
```

# Dynamic Proxy Pattern

Dynamic Proxy Pattern 的 Proxy Object 是在 Runtime Stage 生成的, 直接自动生成代理对象 (JDK 是通过反射实现的, CGLib 底层是通过字节码继承目标类实现的)

```java
public class Main {
    public static void main(String[] args) {
        UserService userService = new UserServiceImpl();
        
        UserService userServiceProxy = (UserService) Proxy.newProxyInstance(
            userService.getClass().getClassLoader(),
            new Class[]{UserService.class},
            new InvocationHandler() {
                @Override
                public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                    System.out.println("Before method invoked");
                    Object result = method.invoke(userService, args);
                    System.out.println("After method invoked");
                    return result;
                }
            }
        );
        userServiceProxy.show();
    }
}

interface UserService {
    void show();
}

class UserServiceImpl implements UserService {
    @Override
    public void show() {
        System.out.println("show()");
    }
}
```

# JDK's Dynamic Proxy

通过 JDK 实现 Dynamic Proxy Pattern

```java
public class Main {
    public static void main(String[] args) {
        UserService UserServiceImpl = new UserServiceImpl();
        UserService UserServiceImplProxy = (UserService) Proxy.newProxyInstance(
            UserServiceImpl.getClass().getClassLoader(),
            UserServiceImpl.getClass().getInterfaces(),
            new InvocationHandler() {
                @Override
                public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                    System.out.println("Before method invoked");
                    Object result = method.invoke(UserServiceImpl, args);
                    System.out.println("After method invoked");
                    return result;
                }
            }
        );
        UserServiceImplProxy.show();
    }
}

interface UserService {
    void show();
}

class UserServiceImpl implements UserService {
    @Override
    public void show() {
        System.out.println("show()");
    }
}
```

Proxy.newProxyInstance() 的底层是创建一个 Anonymous Inner class 继承 Proxy, 实现 Interface, 通过 Reflect 调用 Method, 所以 JDK 的 Dynamic Proxy 只能代理有 Interface 的类

```java
public class Proxy {
    protected InvocationHandler h;

    protected Proxy(InvocationHandler h) {
        this.h = h;
    }
}

public class $Proxy0 extends Proxy implements UserService {
    private static Method m;
    
    static {
        m = Class.forName("com.harvey.UserService").getMethod("show", new Class[0]);
    }

    public $Proxy0 (InvocationHandler invocationHandler) {
        super(invocationHandler);
    }

    public final void show() {
        this.h.invoke(this, m, null);
    }
}
```

# CGLib's Dynamic Proxy

实际开发一般都是面向接口开发的, 大部分类都是有接口的, 所以 JDK 的 Dynamic Proxy 是合理的, 但有些单独的类没有接口, 就可以借助 CGLib 来实现 Dynamic Proxy

CGLib 创建代理类继承目标类, 重写的方法中包含了拦截器的逻辑, 当调用代理对象的被代理方法时, 就会跳转到拦截器的逻辑

CGLib 创建的代理对象, 只会覆盖所有非 final 的方法, 所以无法对 final 类型的类进行代理

CGLib 的底层采用 ASM 字节码技术生成代理类的字节码, 将字节码加载到 JVM 里, 此时就得到了可以使用的代理类, 且直接生成对应的二进制类文件, 所以在性能上较 JDK 自带的动态代理有所提高

CGLib 创建的代理对象在性能上通常优于 JDK 动态代理, 但 CGLib 在创建代理对象时所花费的时间却比 JDK 动态代理多, 至于是否会选择使用 CGLib 来进行方法的增强, 主要还是看其是否有接口, 并且是目标类的方法个数与调用频率来定

```java
public class Main {
    public static void main(String[] args) {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(UserService.class);
        enhancer.setCallback(new MethodInterceptor() {
            @Override
            public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
                System.out.println("Before method invoked");
                Object result = proxy.invokeSuper(obj, args);
                System.out.println("After method invoked");
                return result;
            }
        });
        UserService userService = (UserService) enhancer.create();
        userService.show();
    }
}

class UserService {
    public void show() {
        System.out.println("show");
    }
}
```

# Spring's Dynamic Proxy

Spring 在创建动态代理时, 如果目标对象实现了至少一个接口, 则使用 JDK 动态代理, 如果目标对象没有实现接口, 则使用 CGLib 动态代理

虽然 CGLib 代理效率高, 但是产生字节码文件有一定的开销, 并且生成的代理类无法被 JVM HotSpot 进行优化, 相比之下, JDK 使用 Reflect 进行 Dynamic Proxy, 在最近的几个版本中已得到大幅优化 (eg: 访问的方法被标记为 @HotSpotIntrinsicCandidate 时, JVM 能够直接调用原生代码, 避免了反射的开销)

Spring AOP 的设计原则是应尽可能做到轻量级和最小侵入性, 面向接口编程, JDK Dynamic Proxy 对接口代理更符合这一原则

```java
@Aspect
@Component
public class UserServiceAspect {
    @Around("execution(* com.harvey.service.UserService.show(..))")
    public Object recordTime(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        System.out.println("Before method invoked");
        Object result = proceedingJoinPoint.proceed();
        System.out.println("After method invoked");
        return result;
    }
}
```