### AOP 介绍

AOP (Aspect-Oriented Programming) 是面向切面编程, 可以不修改源代码的情况下, 抽取并封装一个可重用的模块, 可以同时作用于多个方法, 减少模块耦合的同时, 扩展业务功能. 可用于记录操作日志, 处理缓存, 事务处理

OOP 可以解决 Class 级别的代码冗余问题, AOP 可以解决 Method 级别的代码冗余问题.

Bean Lifecycle 的 postProcessAfterInitialization 阶段, 会调用 BeanPostProcessor 的实现类 AbstractAutoProxyCreator 的 postProcessAfterInitialization(), 先判断 Bean 是否需要实现 Dynamic Proxy, 如果需要则会去根据当前 Bean 是否有 Interface 选择是采用 JDK 还是 CGLib 实现 Dynamic Proxy.

Spring 底层的 TRX 就是通过 AOP 实现的, 通过 Surround 的方式扩展, 在方法开启前开启事务, 在方法结束后提交事务, 无侵入, 碉堡了 !!!

### MethodInterceptor 介绍

MethodInterceptor 是 AOP 联盟（AOP Alliance）中的标准接口，用于定义方法拦截的通用逻辑。它的核心方法是 invoke()，用于拦截方法调用。invoke() 方法接受一个 MethodInvocation 对象，该对象包含了被拦截方法的所有信息，如方法本身、参数、目标对象等。

```java
public interface MethodInterceptor extends Interceptor {
    Object invoke(MethodInvocation invocation) throws Throwable;
}
```

- MethodInvocation：表示方法调用的上下文，包含了目标对象、方法、参数等信息。通过 invocation.proceed() 可以继续执行目标方法。

定义一个简单的目标类 SimpleService，包含一个被拦截的方法 sayHello。

```java
public class SimpleService {
    public void sayHello() {
        System.out.println("Hello from SimpleService!");
    }

    public void sayGoodbye() {
        System.out.println("Goodbye from SimpleService!");
    }
}
```

实现 MethodBeforeAdvice, MethodInterceptor 和 AfterReturningAdvice 实现自定义 Advie。

```java
public class CustomBeforeAdvice implements MethodBeforeAdvice {
    @Override
    public void before(Method method, Object[] args, Object target) throws Throwable {
        System.out.println("Before method: " + method.getName());
        System.out.println("Executing custom logic before method execution.");
    }
}

public class CustomAroundAdvice implements MethodInterceptor {
    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        System.out.println("Around before method: " + invocation.getMethod().getName());
        
        Object result = invocation.proceed();  // 调用目标方法
        
        System.out.println("Around after method: " + invocation.getMethod().getName());
        
        return result;
    }
}

public class CustomAfterAdvice implements AfterReturningAdvice {
    @Override
    public void afterReturning(Object returnValue, Method method, Object[] args, Object target) throws Throwable {
        System.out.println("After method: " + method.getName());
        System.out.println("Executing custom logic after method execution.");
    }
}
```

接下来，使用 ProxyFactory 将 Advice 和 PointCut 绑定，封装成 Interceptor 添加到 ProxyFactory 中，再使用 ProxyFactory 创建代理对象。

```java
public static void main(String[] args) {
    // 创建目标对象
    SimpleService target = new SimpleService();

    // 创建代理工厂并设置目标对象
    ProxyFactory proxyFactory = new ProxyFactory();
    proxyFactory.setTarget(target);

    // 创建 Pointcut，只匹配 sayHello 方法
    NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut();
    pointcut.setMappedName("sayHello");

    // 创建并添加 Before, Around, After 拦截器，同时将 Pointcut 与 MethodInterceptor 结合
    CustomBeforeAdvice beforeAdvice = new CustomBeforeAdvice(pointcut);
    MethodBeforeAdviceInterceptor beforeInterceptor = new MethodBeforeAdviceInterceptor(beforeAdvice);

    CustomAroundAdvice aroundAdvice = new CustomAroundAdvice(pointcut);

    CustomAfterAdvice afterAdvice = new CustomAfterAdvice(pointcut);
    AfterReturningAdviceInterceptor afterInterceptor = new AfterReturningAdviceInterceptor(afterAdvice);

    // 将拦截器添加到代理工厂
    proxyFactory.addAdvice(beforeInterceptor);
    proxyFactory.addAdvice(aroundAdvice);
    proxyFactory.addAdvice(afterInterceptor);

    // 获取代理对象
    SimpleService proxy = (SimpleService) proxyFactory.getProxy();

    // 调用代理对象的方法
    proxy.sayHello();   // 该方法会被拦截
    proxy.sayGoodbye(); // 该方法不会被拦截
}
```

执行代码后，将只拦截 sayHello 方法：

```
Before method: sayHello
Executing custom logic before method execution.
Around before method: sayHello
Hello from SimpleService!
Around after method: sayHello
After method: sayHello
Executing custom logic after method execution.
Goodbye from SimpleService!
```

### MethodInterceptor 原理

ProxyFactory 是 Spring AOP 中的代理工厂类，它根据目标对象的类型（是否实现接口）决定使用 JDK 动态代理 还是 CGLIB 代理。其 getProxy() 方法用于生成代理对象。

```java
public class ProxyFactory extends AdvisedSupport implements AopProxyFactory {
    public Object getProxy() {
        return createAopProxy().getProxy();
    }

    protected final synchronized AopProxy createAopProxy() {
        return this.aopProxyFactory.createAopProxy(this);
    }
}
```

AopProxy 是代理对象的接口，有两个主要实现类：

- JdkDynamicAopProxy：如果目标类实现了接口，Spring 优先使用 JDK 动态代理。
- CglibAopProxy：如果目标类没有实现任何接口，Spring 使用 CGLIB 生成一个子类代理。

AopProxyFactory 的 createAopProxy 方法根据目标类是否实现接口来选择代理类型：

```java
public AopProxy createAopProxy(AdvisedSupport config) {
    if (config.isOptimize() || config.isProxyTargetClass() || hasNoUserSuppliedProxyInterfaces(config)) {
        return new CglibAopProxy(config);  // 使用 CGLIB 代理
    }
    return new JdkDynamicAopProxy(config);  // 使用 JDK 动态代理
}
```

对于实现了接口的目标对象，ProxyFactory 使用 JdkDynamicAopProxy 生成代理对象。JdkDynamicAopProxy 实现了 java.lang.reflect.InvocationHandler 接口，核心方法是 invoke()，负责拦截方法调用并执行拦截器链。

```java
public class JdkDynamicAopProxy implements AopProxy, InvocationHandler {
    private final AdvisedSupport advised;

    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 如果方法属于基础设施方法，直接调用，不进行拦截
        if (this.advised.opaque || this.advised.isFrozen() || method.getDeclaringClass() == Object.class) {
            return method.invoke(this.advised.getTargetSource().getTarget(), args);
        }

        // 构建拦截器链
        List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);

        // 如果拦截器链为空，直接调用目标方法
        if (chain.isEmpty()) {
            return method.invoke(this.advised.getTargetSource().getTarget(), args);
        }

        // 执行拦截器链
        ReflectiveMethodInvocation invocation = new ReflectiveMethodInvocation(
            proxy, this.advised.getTargetSource().getTarget(), method, args, targetClass, chain);
        return invocation.proceed();
    }
}
```

- 基础设施方法检查：如果调用的是 toString、hashCode 等基础方法，直接调用目标方法。
- 构建拦截器链：调用 getInterceptorsAndDynamicInterceptionAdvice 获取匹配的拦截器链。
- 执行拦截器链：使用 ReflectiveMethodInvocation 执行拦截器链。

getInterceptorsAndDynamicInterceptionAdvice 通过 DefaultAdvisorChainFactory 的 getInterceptorsAndDynamicInterceptionAdvice 方法来创建拦截器链。该方法会根据 Advisor 中的切点（Pointcut）规则来匹配方法并生成拦截器。

```java
public List<Object> getInterceptorsAndDynamicInterceptionAdvice(
        Advised config, Method method, Class<?> targetClass) {

    // 遍历所有的 advisors，根据 class 和 pointcut 规则来匹配方法，返回所有匹配到的整个拦截器
    List<Object> interceptorList = new ArrayList<>();
    for (Advisor advisor : config.getAdvisors()) {
        if (advisor instanceof PointcutAdvisor) {
            PointcutAdvisor pointcutAdvisor = (PointcutAdvisor) advisor;
            if (pointcutAdvisor.getPointcut().getClassFilter().matches(targetClass) &&
                    pointcutAdvisor.getPointcut().getMethodMatcher().matches(method, targetClass)) {
                MethodInterceptor interceptor = (MethodInterceptor) advisor.getAdvice();
                interceptorList.add(interceptor);
            }
        }
    }
    return interceptorList;
}
```

ReflectiveMethodInvocation 是执行拦截器链的核心类，实现了 MethodInvocation 接口，并提供 proceed() 方法以控制拦截器链的执行流程。它持有目标对象、方法、参数、拦截器链等信息，并逐个调用拦截器。

```java
public class ReflectiveMethodInvocation implements ProxyMethodInvocation, Cloneable {
    protected final Object proxy;
    protected final Object target;
    protected final Method method;
    protected Object[] arguments;
    protected final List<Object> interceptorsAndDynamicMethodMatchers;
    private int currentInterceptorIndex = -1;

    public ReflectiveMethodInvocation(Object proxy, Object target, Method method, Object[] arguments, List<Object> interceptorsAndDynamicMethodMatchers) {
        this.proxy = proxy;
        this.target = target;
        this.method = method;
        this.arguments = arguments;
        this.interceptorsAndDynamicMethodMatchers = interceptorsAndDynamicMethodMatchers;
    }

    @Override
    public Object proceed() throws Throwable {
        // 检查是否有下一个拦截器，如果没有则直接执行目标方法
        if (this.currentInterceptorIndex == this.interceptorsAndDynamicMethodMatchers.size() - 1) {
            return this.method.invoke(this.target, this.arguments);
        }

        // 获取下一个拦截器
        Object interceptorOrInterceptionAdvice = this.interceptorsAndDynamicMethodMatchers.get(++this.currentInterceptorIndex);
        return ((MethodInterceptor) interceptorOrInterceptionAdvice).invoke(this);
    }
}
```

以下是 MethodBeforeAdviceInterceptor 和 AfterReturningAdviceInterceptor 的示例代码，它们是 MethodInterceptor 的实现类。

```java
public class MethodBeforeAdviceInterceptor implements MethodInterceptor {
    private final MethodBeforeAdvice advice;

    public MethodBeforeAdviceInterceptor(MethodBeforeAdvice advice) {
        this.advice = advice;
    }

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        // 执行前置增强逻辑
        this.advice.before(invocation.getMethod(), invocation.getArguments(), invocation.getThis());
        
        // 调用下一个拦截器或目标方法
        return invocation.proceed();
    }
}
```

```java

public class AfterReturningAdviceInterceptor implements MethodInterceptor {
    private final AfterReturningAdvice advice;

    public AfterReturningAdviceInterceptor(AfterReturningAdvice advice) {
        this.advice = advice;
    }

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        // 先执行目标方法或拦截器链中的下一个拦截器
        Object returnValue = invocation.proceed();

        // 在目标方法成功返回后执行 afterReturning
        this.advice.afterReturning(returnValue, invocation.getMethod(), invocation.getArguments(), invocation.getThis());

        // 返回目标方法的结果
        return returnValue;
    }
}
```

### Spring AOP 原理

Spring AOP 的底层实现主要依赖于 动态代理，包括 JDK 动态代理 和 CGLIB 动态代理。以下将详细解析 Spring AOP 的实现原理，包括代理对象的创建流程、代理类型的选择、通知的执行机制等，并结合关键源码展示 Spring AOP 是如何工作的。

Spring AOP 的实现包含多个核心组件和接口：

- ProxyFactory：负责创建代理对象。
- AopProxy 和 AopProxyFactory：AopProxy 是代理对象的接口，JDK 动态代理和 CGLIB 代理都是其实现。AopProxyFactory 是创建 AopProxy 的工厂类。
- AdvisedSupport：封装了 AOP 代理所需的信息，包括目标对象、通知和切点。
- MethodInterceptor：方法拦截器接口，负责增强逻辑的具体执行。
- Advice：定义增强逻辑的接口，用于在方法执行前、执行后或抛出异常时执行特定操作。

AnnotationAwareAspectJAutoProxyCreator 是 BeanPostProcessor 的一个具体实现，用于在 Spring 中实现 AOP 自动代理。它会在 Bean 初始化过程中检查目标 Bean 是否符合 AOP 切面条件，并为符合条件的 Bean 自动创建代理对象。AnnotationAwareAspectJAutoProxyCreator 的主要任务是基于注解（如 @Aspect 和 @EnableAspectJAutoProxy）实现切面代理。

AnnotationAwareAspectJAutoProxyCreator 在 postProcessAfterInitialization() 方法中调用 wrapIfNecessary() 来检查当前 Bean 是否符合 AOP 的条件，如果符合条件，则生成代理对象。

```java
public Object postProcessAfterInitialization(Object bean, String beanName) {
    // 如果已经代理过，不再处理
    if (bean != null && !beanName.startsWith("scopedTarget.")) {
        return wrapIfNecessary(bean, beanName, cacheKey);
    }
    return bean;
}
```

wrapIfNecessary 方法会判断 Bean 是否符合代理条件（例如，是否匹配某个切面），如果符合条件，则调用 createProxy 方法生成代理对象。

```java
protected Object wrapIfNecessary(Object bean, String beanName, Object cacheKey) {
    // 判断当前 Bean 是否需要代理
    if (shouldSkip(bean.getClass(), beanName)) {
        return bean;
    }

    // 获取适用于当前 Bean 的拦截器链
    Object[] specificInterceptors = getAdvicesAndAdvisorsForBean(bean.getClass(), beanName, null);
    
    // 如果有拦截器链，则创建代理对象
    if (specificInterceptors != DO_NOT_PROXY) {
        return createProxy(bean.getClass(), beanName, specificInterceptors, new SingletonTargetSource(bean));
    }
    return bean;
}
```

在 AbstractAdvisorAutoProxyCreator 类中，getAdvicesAndAdvisorsForBean 方法负责检查 Bean 是否符合切面条件，并返回适用于该 Bean 的增强逻辑列表。以下是简化的 getAdvicesAndAdvisorsForBean 源码：

```java
protected Object[] getAdvicesAndAdvisorsForBean(Class<?> beanClass, String beanName, TargetSource customTargetSource) {
    // 获取所有的 Advisor（包括 Before、After、Around 等 Advice）
    List<Advisor> candidateAdvisors = findEligibleAdvisors(beanClass, beanName);

    // 如果有符合条件的 Advisor 则返回，否则返回 DO_NOT_PROXY 表示不代理
    if (!candidateAdvisors.isEmpty()) {
        return candidateAdvisors.toArray();
    }
    return DO_NOT_PROXY;
}
```

findEligibleAdvisors 方法会调用 findCandidateAdvisors 查找所有可能的增强逻辑（Advisor），然后调用 findAdvisorsThatCanApply 筛选出适用于当前 Bean 的增强逻辑。

```java
protected List<Advisor> findEligibleAdvisors(Class<?> beanClass, String beanName) {
    // 获取所有注册的 Advisor
    List<Advisor> candidateAdvisors = findCandidateAdvisors();
    
    // 筛选适用于当前 Bean 的 Advisor
    List<Advisor> eligibleAdvisors = findAdvisorsThatCanApply(candidateAdvisors, beanClass);

    return eligibleAdvisors;
}
```

```java
protected List<Advisor> findCandidateAdvisors() {
    // 查找容器中所有的 Advisor，主要是由 AspectJ 切面生成的 Advisor
    return this.advisorRetrievalHelper.findAdvisorBeans();
}
```

最后 createProxy 方法使用 ProxyFactory 来创建代理对象，并根据目标类选择 JDK 动态代理或 CGLIB 代理。

```java
protected Object createProxy(Class<?> beanClass, String beanName, Object[] specificInterceptors, TargetSource targetSource) {
    ProxyFactory proxyFactory = new ProxyFactory();
    proxyFactory.copyFrom(this);

    // 设置目标对象
    proxyFactory.setTargetSource(targetSource);

    // 添加拦截器链
    proxyFactory.addAdvisors(specificInterceptors);

    // 根据目标类决定代理方式
    if (!proxyFactory.isProxyTargetClass() && beanClass.isInterface()) {
        return proxyFactory.getProxy();
    }
    return proxyFactory.getProxy(beanClass.getClassLoader());
}
```

### AspectJ AOP 介绍

AspectJ 是一个强大的 AOP 框架，通过直接修改字节码实现 AOP 功能。在 AspectJ 中，切面逻辑会在编译、加载、或运行时直接织入到字节码中，因此它并不依赖代理对象。AspectJ 的织入方式有多种，包括编译时织入、类加载时织入 和 运行时织入。以下是对 AspectJ AOP 的底层实现原理的详细分析。

AspectJ 的织入方式：

1. 编译时织入（Compile-Time Weaving, CTW）：在编译阶段使用 AspectJ 编译器（ajc）将切面逻辑直接织入到字节码中。ajc 会在编译时分析源代码中的切面，并在生成的字节码中添加切面代码。这种方式需要直接使用 ajc 编译器编译源文件。
2. 类加载时织入（Load-Time Weaving, LTW）：在类加载时通过 ClassLoader 动态织入切面逻辑。这种方式需要配置 AspectJ 的 Weaving ClassLoader 或使用 Java 代理，并将切面织入到类加载器加载的类中。
3. 运行时织入（Runtime Weaving）：AspectJ 不直接支持运行时织入，但可以通过 Spring AOP 提供的动态代理方式在运行时进行切面增强。

AspectJ 编译时织入的实现原理：


1. 分析切面和切点：ajc 编译器首先会分析项目中的切面类（带有 @Aspect 注解的类）和切点表达式，并确定哪些方法或构造函数需要织入切面逻辑。
2. 修改字节码：ajc 编译器在字节码中插入切面代码，通常是方法的前后或特定代码块周围。切面代码包括方法增强（例如 @Before、@After、@Around 注解的方法）等。
3. 生成新的字节码：编译器生成包含切面逻辑的新的 .class 文件，替代原始 .class 文件。

通过编译时织入，切面逻辑直接在类的字节码中生效，无需运行时动态代理，具有更高的性能。


