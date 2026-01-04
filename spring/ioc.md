# IOC

Spring 框架通过 IoC（Inversion of Control，控制反转）容器优化了组件的管理方式，有效减少了代码之间的耦合度，使得开发人员可以专注于核心业务逻辑，提升了代码的可维护性、扩展性和健壮性。以下详细解释 Spring 如何通过 IoC 容器优化这些设计原则，并给出具体的实现机制。

IoC 的核心思想：对象的创建和生命周期由容器管理

- 在传统的编程方式中，对象之间的依赖是显式声明的，需要在代码中手动管理对象的创建和装配。而 Spring IoC 容器实现了依赖注入（DI），通过配置或注解的方式，容器会自动创建、装配和管理对象之间的依赖关系。
- 模块解耦：通过 IoC，开发者只需定义对象及其依赖的接口，而不必担心具体的实例化和依赖管理，模块之间不再直接依赖，这大大减少了耦合性。
- 生命周期管理：Spring 容器负责 Bean 的创建、初始化、装配、生命周期管理和销毁，开发者可以通过配置文件或注解定义 Bean 的生命周期方法。

IoC 实现单例模式，提升资源利用率

- Spring IoC 容器采用单例模式（Singleton）作为默认的 Bean 作用域，这种设计能够有效减少不必要的对象创建，节省内存资源和 GC 开销。由于单例对象只有一个实例，Spring IoC 能够将 Bean 在容器启动时初始化，从而减少运行期的性能开销。
- 节省资源：单例模式可以避免多次重复创建对象，提升内存利用率，减少对象创建时的开销。
- 线程安全：单例 Bean 由容器管理，容器确保线程安全。对于无状态的服务类，可以有效避免线程安全问题。
- 快速失败（Fast Fail）：在容器启动时就初始化所有非懒加载的单例 Bean，确保在启动阶段就能发现依赖关系和初始化问题，避免运行时崩溃。

IoC 实现依赖倒置原则（DIP）

- 依赖倒置原则（DIP）的核心思想是：高层模块不依赖低层模块，而是依赖于抽象接口。Spring IoC 容器通过依赖注入机制，使得高层模块只需依赖接口，而具体实现由 IoC 容器管理。这种设计确保了模块之间的解耦，并有助于引入设计模式，提升代码的扩展性和灵活性。
- 解耦：高层模块通过接口调用底层模块，不依赖具体实现，这使得模块间解耦，便于维护和测试。
- 可扩展性：接口的引入使得实现类可以被替换，支持不同的实现方案，便于未来扩展。
- 便于使用设计模式：在接口的基础上，可以轻松地引入如代理模式、工厂模式等设计模式，提升代码的灵活性。

IoC 支持动态代理，提升扩展性

- 通过 Spring 的 IoC 容器，可以轻松实现 JDK 动态代理和 CGLIB 代理，为 Bean 提供增强功能，如事务、缓存、日志等横切关注点。代理的引入也是 IoC 解耦的一部分，使得应用程序可以无缝地引入设计模式，提高代码的扩展性和维护性。
- 代码解耦：代理模式可以将业务逻辑和横切关注点（如事务、日志）分离，降低耦合。
- 透明增强：在不修改业务代码的前提下，为 Bean 增加功能，如事务管理、方法拦截等。
- 扩展性强：动态代理使得 Bean 可以在运行时被增强，为后续扩展提供了便利。

# BeanFactory

BeanFactory 是 Spring IoC 容器的顶层接口，定义了最基本的 Bean 管理方法。它的主要职责是提供 Bean 的获取和依赖查找方法，例如 getBean、containsBean、isSingleton 等。

- 职责：管理和获取 Bean，定义 Bean 的基础操作。
- 特点：提供了最简单的 IoC 容器接口，只有基本的 Bean 操作，不关心 Bean 的加载、注册和缓存等实现细节。

BeanFactory 是一个面向用户的接口，通常不包含任何实际的实现逻辑。Spring 提供了多个 BeanFactory 实现类，如 DefaultListableBeanFactory。

DefaultSingletonBeanRegistry 是一个抽象类，它实现了 SingletonBeanRegistry 接口，专门负责管理 Spring 容器中的单例 Bean 实例。DefaultSingletonBeanRegistry 提供了单例 Bean 的缓存逻辑和基础方法，如 getSingleton、registerSingleton 等，这些方法保证同一个 Bean 只会创建一次。

- 职责：实现单例 Bean 的注册、缓存和获取。
- 特点：提供了单例缓存 singletonObjects，通过懒加载方式管理单例 Bean 的生命周期。

DefaultSingletonBeanRegistry 并不直接实现 BeanFactory 接口，而是作为 BeanFactory 的基础支持，处理底层的单例管理。singletonObjects 就存储在 DefaultSingletonBeanRegistry 中。

DefaultListableBeanFactory 继承了 AbstractAutowireCapableBeanFactory，而 AbstractAutowireCapableBeanFactory 又继承了 AbstractBeanFactory，最终继承 DefaultSingletonBeanRegistry，形成以下的类结构：

- DefaultSingletonBeanRegistry：单例缓存和管理功能。
- AbstractBeanFactory：定义 Bean 的基本获取逻辑，处理 Bean 的缓存。
- AbstractAutowireCapableBeanFactory：实现自动注入能力。
- DefaultListableBeanFactory：继承了以上所有的特性，实现了 BeanFactory 接口，并扩展了 Bean 注册和定义管理。

DefaultListableBeanFactory 的加载流程

- 解析 Bean 定义：将 Bean 的配置信息加载为 BeanDefinition 对象。
- 注册 BeanDefinition：将 BeanDefinition 存储到 beanDefinitionMap 中。
- 创建 Bean 实例：根据需要实例化和初始化 Bean，支持依赖注入。

# refresh()

Spring 的刷新机制在 Spring 框架中用于加载、初始化、刷新和销毁应用上下文。在 ApplicationContext 中，刷新机制的核心方法是 refresh()。这里将详细介绍 refresh() 方法的执行过程及底层源码的实现细节。

在 AbstractApplicationContext 类中，refresh() 方法定义了应用上下文的初始化和刷新流程。它的整体流程如下：

1. 准备刷新上下文环境 - prepareRefresh()：

- 初始化一些上下文环境，例如设置启动时间、活跃状态等。
- 为属性源配置 Environment，并验证必要的属性。

2. 创建并加载 BeanFactory - obtainFreshBeanFactory()：

- 如果是 GenericApplicationContext，则会使用 DefaultListableBeanFactory 作为底层容器。
- 加载 Bean 定义（在 XML 配置中定义的 Bean，或注解定义的 Bean）。

3. 准备 BeanFactory - prepareBeanFactory(beanFactory)：

- 设置 BeanFactory 的一些配置，如是否允许 Bean 覆盖、是否允许懒加载等。
- 注册一些系统级别的 Bean，如 environment、systemProperties 和 systemEnvironment 等。

4. 扩展点 - postProcessBeanFactory(beanFactory)：

- 允许子类对 BeanFactory 进行自定义处理，例如在 Web 容器中注册一些 Web 相关的 Bean。

5. 调用 BeanFactory 的后置处理器 - invokeBeanFactoryPostProcessors(beanFactory)：

- 在加载 Bean 之前，允许 BeanFactoryPostProcessor 修改 Bean 的定义属性。
- 此过程会执行 @Bean 和 @Component 的解析。

6. 注册 Bean 的后置处理器 - registerBeanPostProcessors(beanFactory)：

- 注册 BeanPostProcessor，它会拦截 Bean 的实例化过程，用于自定义 Bean 的创建逻辑，如 AOP。

7. 初始化消息资源 - initMessageSource()：

- 如果应用程序有国际化需求，这里会初始化 MessageSource 以支持多语言消息。

8. 初始化事件多播器 - initApplicationEventMulticaster()：

- 初始化事件广播器 ApplicationEventMulticaster，用于管理应用程序中的事件发布与监听。

9. 初始化其他特定 Bean - onRefresh()：

- 子类可以重写该方法来初始化特定的 Bean。例如在 Spring MVC 中，这里会初始化 DispatcherServlet。

10. 注册事件监听器 - registerListeners()：

- 注册所有的 ApplicationListener，用于事件发布和监听。

11. 完成剩余的单例 Bean 初始化 - finishBeanFactoryInitialization(beanFactory)：

- 实例化所有非懒加载的单例 Bean，以确保它们已完全初始化并准备就绪。

12. 发布上下文刷新事件 - finishRefresh()：

- 发布 ContextRefreshedEvent 事件，通知应用上下文已经刷新完毕，可以开始处理请求。

# obtainFreshBeanFactory()

obtainFreshBeanFactory() 是 Spring ApplicationContext 的一个关键方法，主要作用是获取一个新的 BeanFactory 实例，用于管理 Spring 容器中的所有 BeanDefinition 和 Bean 实例。在 ApplicationContext 的生命周期中，obtainFreshBeanFactory() 方法会负责创建或刷新 BeanFactory，以确保在容器启动时得到一个全新的、干净的 BeanFactory，为后续的 BeanDefinition 注册和 Bean 实例化提供基础。

在 AbstractApplicationContext 类中，obtainFreshBeanFactory() 的底层实现主要依赖 refreshBeanFactory() 和 getBeanFactory() 两个方法。我们以下详细解析这两个方法，了解 obtainFreshBeanFactory() 的工作原理。

以下是 AbstractApplicationContext 中 obtainFreshBeanFactory() 方法的源码：

```java
protected ConfigurableListableBeanFactory obtainFreshBeanFactory() {
    // 刷新或重新创建 BeanFactory
    refreshBeanFactory();
    // 返回新创建的 BeanFactory 实例
    return getBeanFactory();
}
```

obtainFreshBeanFactory() 的两个主要步骤

1. 调用 refreshBeanFactory() 方法：负责刷新或重新创建 BeanFactory 实例。对于基于 XML 配置的 ApplicationContext（例如 ClassPathXmlApplicationContext），refreshBeanFactory() 方法会加载 XML 配置文件中的 Bean 定义，并将其转换为 BeanDefinition，注册到新的 BeanFactory 中。
2. 调用 getBeanFactory() 方法：返回刚刚创建并初始化的 BeanFactory 实例。在 Spring 中，BeanFactory 通常是 DefaultListableBeanFactory 类型，用于存储和管理所有 BeanDefinition 和 Bean 实例。

refreshBeanFactory() 方法是一个抽象方法，不同的 ApplicationContext 实现会有不同的实现。以下以 AbstractRefreshableApplicationContext 类（ClassPathXmlApplicationContext 的父类）的 refreshBeanFactory() 为例，详细解析其实现过程。

```java
@Override
protected final void refreshBeanFactory() throws BeansException {
    // 判断是否已有 BeanFactory，若有则销毁已有的 BeanFactory
    if (hasBeanFactory()) {
        destroyBeans();
        closeBeanFactory();
    }
    try {
        // 创建一个新的 BeanFactory 实例
        DefaultListableBeanFactory beanFactory = createBeanFactory();
        // 设置是否允许 Bean 定义的重写
        beanFactory.setAllowBeanDefinitionOverriding(this.allowBeanDefinitionOverriding);
        // 设置是否允许循环依赖
        beanFactory.setAllowCircularReferences(this.allowCircularReferences);
        // 加载 Bean 定义
        loadBeanDefinitions(beanFactory);
        // 将创建的 BeanFactory 缓存为当前上下文的 BeanFactory
        this.beanFactory = beanFactory;
    } catch (IOException ex) {
        throw new ApplicationContextException("I/O error parsing bean definition source", ex);
    }
}
```

loadBeanDefinitions(beanFactory) 方法负责将用户定义的所有 BeanDefinition 加载到 BeanFactory 中。该方法是 AbstractApplicationContext 类中的一个抽象方法，不同的 ApplicationContext 实现类有不同的实现方式，用于加载 XML 配置、注解配置或 Java 配置类中的 BeanDefinition。

在 AbstractApplicationContext 中，loadBeanDefinitions 方法是一个抽象方法，用于在容器启动时由具体的 ApplicationContext 实现类进行实现。该方法通常会在 refresh() 方法的早期阶段调用，用于加载用户配置的 BeanDefinition，并注册到 BeanFactory 中，后续的 Bean 实例化和依赖注入都依赖于这些 BeanDefinition。

```java
protected abstract void loadBeanDefinitions(ConfigurableListableBeanFactory beanFactory) throws BeansException, IOException;
```

## 通过 ClassPathXmlApplicationContext 解析 XML Bean

对于基于 XML 配置的 ApplicationContext 实现（如 ClassPathXmlApplicationContext），loadBeanDefinitions 方法主要负责解析 XML 配置文件，将其中的 `<bean>` 标签解析为 BeanDefinition 并注册到 BeanFactory 中。

ClassPathXmlApplicationContext 继承自 AbstractXmlApplicationContext，后者在其 loadBeanDefinitions 方法中实现了 XML 文件的加载逻辑。以下是 AbstractXmlApplicationContext 中 loadBeanDefinitions 方法的实现：

```java
@Override
protected void loadBeanDefinitions(DefaultListableBeanFactory beanFactory) throws BeansException, IOException {
    // 创建 BeanDefinitionReader，用于解析 XML 文件
    XmlBeanDefinitionReader beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);

    // 设置一些属性，如环境、资源加载器等
    beanDefinitionReader.setEnvironment(this.getEnvironment());
    beanDefinitionReader.setResourceLoader(this);
    beanDefinitionReader.setEntityResolver(new ResourceEntityResolver(this));

    // 加载配置文件中的 BeanDefinition
    loadBeanDefinitions(beanDefinitionReader);
}
```

```java
protected void loadBeanDefinitions(XmlBeanDefinitionReader reader) throws BeansException, IOException {
    Resource[] configResources = getConfigResources();
    if (configResources != null) {
        reader.loadBeanDefinitions(configResources);
    }
}
```

```java
protected void loadBeanDefinitions(XmlBeanDefinitionReader reader) throws BeansException, IOException {
    Resource[] configResources = getConfigResources();
    if (configResources != null) {
        reader.loadBeanDefinitions(configResources);
    }
}
```

## 通过 AnnotationConfigApplicationContext 解析 Annotation Bean

对于基于注解的 ApplicationContext（如 AnnotationConfigApplicationContext），loadBeanDefinitions 方法会扫描带有 @Configuration、@Component 等注解的类，并将这些类解析为 BeanDefinition，注册到 BeanFactory 中。

AnnotationConfigApplicationContext 会在启动时将配置类解析成 BeanDefinition 并注册到 BeanFactory 中。其 loadBeanDefinitions 方法依赖于 AnnotatedBeanDefinitionReader 和 ClassPathBeanDefinitionScanner 进行注解扫描和解析。

```java
@Override
protected void loadBeanDefinitions(DefaultListableBeanFactory beanFactory) {
    AnnotatedBeanDefinitionReader reader = new AnnotatedBeanDefinitionReader(beanFactory);
    ClassPathBeanDefinitionScanner scanner = new ClassPathBeanDefinitionScanner(beanFactory);

    if (this.configLocations != null) {
        for (String configLocation : this.configLocations) {
            reader.register(Class.forName(configLocation));
        }
    }
}
```

AnnotatedBeanDefinitionReader 的 register 方法会直接将配置类转换为 BeanDefinition 并注册到 BeanFactory 中：

```java
public void register(Class<?>... componentClasses) {
    for (Class<?> componentClass : componentClasses) {
        // 检查是否为合法的配置类
        if (isConfigurationClass(componentClass)) {
            // 将 @Configuration 类注册为 BeanDefinition
            registerBeanDefinition(componentClass);
        }
    }
}
```

ClassPathBeanDefinitionScanner 会扫描指定包路径下的所有类，将符合条件的类（带有 @Component、@Service、@Repository 等注解）解析为 BeanDefinition。

```java
public Set<BeanDefinitionHolder> doScan(String... basePackages) {
    Set<BeanDefinitionHolder> beanDefinitions = new LinkedHashSet<>();
    for (String basePackage : basePackages) {
        Set<BeanDefinition> candidates = findCandidateComponents(basePackage);
        for (BeanDefinition candidate : candidates) {
            // 注册符合条件的 BeanDefinition
            beanDefinitions.add(registerBeanDefinition(candidate));
        }
    }
    return beanDefinitions;
}
```

- findCandidateComponents(basePackage)：扫描指定包路径，将符合条件的类（如带有 @Component 注解的类）解析为 BeanDefinition。
- registerBeanDefinition(candidate)：将符合条件的类注册为 BeanDefinition。

# postProcessBeanFactory(beanFactory)

postProcessBeanFactory(beanFactory) 是 AbstractApplicationContext 的 refresh() 方法中一个可供子类重写的钩子方法。此方法允许在 BeanFactory 初始化后但在 BeanPostProcessor 注册之前对其进行自定义操作。通过重写此方法，开发者可以在 BeanFactory 初始化完成后对 BeanDefinition 进行修改或添加属性。

postProcessBeanFactory(beanFactory) 方法定义在 AbstractApplicationContext 中：

```java
public abstract class AbstractApplicationContext extends DefaultResourceLoader implements ConfigurableApplicationContext {
    public void refresh() throws BeansException, IllegalStateException {
        // ...
        postProcessBeanFactory(beanFactory);
        // ...
    }
    
    protected void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        // 子类可以重写这个方法来对 BeanFactory 进行进一步的处理
    }
}
```

通常在自定义的 ApplicationContext 实现中可以重写这个方法。例如，我们可以创建一个自定义的 ApplicationContext，在 postProcessBeanFactory 方法中对某个 Bean 的 BeanDefinition 添加属性。

```java
public class CustomApplicationContext extends AnnotationConfigApplicationContext {
    @Override
    protected void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        // 修改 BeanDefinition，可以设置一些属性或添加依赖
        if (beanFactory.containsBeanDefinition("myBean")) {
            BeanDefinition bd = beanFactory.getBeanDefinition("myBean");
            bd.getPropertyValues().add("name", "CustomName");
        }
    }
}
```

# invokeBeanFactoryPostProcessors(beanFactory) 

invokeBeanFactoryPostProcessors(beanFactory) 方法用于执行 BeanFactoryPostProcessor，它是 BeanFactory 的后处理器，用于在所有 BeanDefinition 加载完成后，但在 Bean 实例化之前，允许修改 BeanDefinition 的属性。

ConfigurationClassPostProcessor 就是 BeanFactoryPostProcessor 的一个实现，它负责解析 @Configuration, @Bean 和 BeanPostProcessor 实现类，生成 BeanDefinition 注册到 beanDefinitionMap 中。

invokeBeanFactoryPostProcessors(beanFactory) 定义在 AbstractApplicationContext 中，实际处理过程由 PostProcessorRegistrationDelegate 类完成。

```java
protected void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory) {
    PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(beanFactory, getBeanFactoryPostProcessors());
}
```

在 PostProcessorRegistrationDelegate 中，invokeBeanFactoryPostProcessors 方法会遍历并执行 BeanFactoryPostProcessor：

```java
public static void invokeBeanFactoryPostProcessors(
        ConfigurableListableBeanFactory beanFactory, List<BeanFactoryPostProcessor> beanFactoryPostProcessors) {

    // 遍历所有的 BeanFactoryPostProcessor
    for (BeanFactoryPostProcessor postProcessor : beanFactoryPostProcessors) {
        postProcessor.postProcessBeanFactory(beanFactory);
    }

    // 执行容器中的 BeanFactoryPostProcessor，例如 ConfigurationClassPostProcessor
    String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanFactoryPostProcessor.class, true, false);
    for (String ppName : postProcessorNames) {
        BeanFactoryPostProcessor postProcessor = beanFactory.getBean(ppName, BeanFactoryPostProcessor.class);
        postProcessor.postProcessBeanFactory(beanFactory);
    }
}
```

BeanFactoryPostProcessor 的典型实现是 ConfigurationClassPostProcessor，它在 Spring 启动时扫描 @Configuration 类，解析 @Bean 注解，并将这些配置解析为 BeanDefinition。

以下是 ConfigurationClassPostProcessor 的主要工作流程：

1. 扫描和解析 @Configuration 注解的配置类。
2. 处理 @Bean 方法，生成对应的 BeanDefinition 并注册到 BeanFactory。
3. 解析 @Import、@ComponentScan 等注解，进一步处理嵌套的配置。

postProcessBeanDefinitionRegistry 方法是 ConfigurationClassPostProcessor 的核心方法。它会在 BeanFactory 注册阶段调用，并负责查找、解析 @Configuration 类及其相关注解。

```java
@Override
public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
    // 初始化配置类解析器
    ConfigurationClassParser parser = new ConfigurationClassParser(
            this.metadataReaderFactory, this.problemReporter, this.environment,
            this.resourceLoader, this.componentScanBeanNameGenerator, registry);

    // 获取所有的 BeanDefinition 名称
    String[] candidateNames = registry.getBeanDefinitionNames();

    // 遍历每个 BeanDefinition，判断是否带有 @Configuration 注解
    for (String beanName : candidateNames) {
        BeanDefinition beanDef = registry.getBeanDefinition(beanName);
        if (ConfigurationClassUtils.checkConfigurationClassCandidate(beanDef, this.metadataReaderFactory)) {
            // 将带有 @Configuration 注解的 BeanDefinition 注册到解析器
            parser.parse(beanDef);
        }
    }

    // 执行解析，解析器将扫描并处理 @Bean、@ComponentScan、@Import 等注解
    parser.processConfigBeanDefinitions();
}
```

ConfigurationClassParser 是 ConfigurationClassPostProcessor 的核心组件，负责对 @Configuration 类进行解析，包括 @Bean 方法、@ComponentScan、@Import 等注解。

- @Import 也是在这里进行解析的，即 SpringBoot 的自动装配也是在这里实现的。

```java
public void parse(BeanDefinition bd) {
    // 判断 BeanDefinition 是否符合 @Configuration 类的要求
    if (ConfigurationClassUtils.checkConfigurationClassCandidate(bd, this.metadataReaderFactory)) {
        // 解析并生成 ConfigurationClass 对象
        ConfigurationClass configClass = parseConfigurationClass(bd);
        this.configurationClasses.add(configClass);
    }
}
```

processConfigBeanDefinitions 方法会将解析得到的 ConfigurationClass 对象转换为 BeanDefinition 并注册到容器中：

```java
public void processConfigBeanDefinitions() {
    for (ConfigurationClass configClass : this.configurationClasses) {
        // 处理 @Bean 方法，将 @Bean 注解的方法解析为 BeanDefinition
        loadBeanDefinitionsForConfigurationClass(configClass);
    }
}
```

在解析 @Configuration 类时，ConfigurationClassParser 会判断每个 BeanDefinition 是否带有 @Configuration 或其他相关注解。如果带有 @Configuration 注解，则该类被认为是配置类，Spring 会将它视为 Java 配置类，递归解析其中的配置元素。

当 ConfigurationClassParser 解析到 @Bean 方法时，会调用 loadBeanDefinitionsForBeanMethod 方法，将 @Bean 方法解析为 BeanDefinition。此方法会根据 @Bean 注解的方法返回类型、作用域等信息生成 BeanDefinition。

```java
protected void loadBeanDefinitionsForBeanMethod(BeanMethod beanMethod) {
    ConfigurationClass configClass = beanMethod.getConfigurationClass();
    MethodMetadata metadata = beanMethod.getMetadata();
    // 创建 BeanDefinitionBuilder，根据返回类型创建 BeanDefinition
    BeanDefinitionBuilder definition = BeanDefinitionBuilder.genericBeanDefinition(metadata.getReturnType());
    registry.registerBeanDefinition(metadata.getMethodName(), definition.getBeanDefinition());
}
```

ConfigurationClassPostPro 同时还会扫描 BeanPostProcessor 的实现类，并生成对应的 BeanDefinition。

# registerBeanPostProcessors(beanFactory) 

registerBeanPostProcessors(beanFactory) 方法用于注册所有的 BeanPostProcessor。BeanPostProcessor 是对 Bean 实例化后的增强处理器，用于在 Bean 的初始化前后对其进行拦截、增强或代理。AOP（面向切面编程）就是通过 BeanPostProcessor 实现的。

registerBeanPostProcessors(beanFactory) 定义在 AbstractApplicationContext 中，注册逻辑由 PostProcessorRegistrationDelegate 处理。

```java
protected void registerBeanPostProcessors(ConfigurableListableBeanFactory beanFactory) {
    PostProcessorRegistrationDelegate.registerBeanPostProcessors(beanFactory, this);
}
```

在 PostProcessorRegistrationDelegate 中，registerBeanPostProcessors 方法会按照 PriorityOrdered 和 Ordered 接口的优先级顺序注册 BeanPostProcessor：

```java
public static void registerBeanPostProcessors(ConfigurableListableBeanFactory beanFactory, AbstractApplicationContext applicationContext) {

    // 获取所有 BeanPostProcessor 类型的 Bean
    String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanPostProcessor.class, true, false);

    // 实例化每个 BeanPostProcessor 并添加到列表
    List<BeanPostProcessor> beanPostProcessors = new ArrayList<>();
    for (String ppName : postProcessorNames) {
        beanPostProcessors.add(beanFactory.getBean(ppName, BeanPostProcessor.class));
    }

    // 将所有 BeanPostProcessor 注册到 beanFactory
    for (BeanPostProcessor postProcessor : beanPostProcessors) {
        beanFactory.addBeanPostProcessor(postProcessor);
    }
}
```

这个方法会扫描所有实现了 BeanPostProcessor 的 Bean，并调用 addBeanPostProcessor() 方法将其添加到 beanPostProcessors 列表中。之后，当每个 Bean 初始化时，Spring 会调用这些 BeanPostProcessor 的 postProcessBeforeInitialization 和 postProcessAfterInitialization 方法。

# ConfigurationClassParser

ConfigurationClassParser 是 Spring 框架中用于解析配置类（带有 @Configuration、@Bean、@Import 等注解）的核心类。它的主要作用是扫描和解析这些注解，将它们转换为 Spring IoC 容器能够理解的 BeanDefinition。在解析过程中，它会扫描配置类中的 @Configuration、@Bean 和 @Import 注解，并对这些注解所代表的 Bean 进行注册。

以下是 ConfigurationClassParser 解析 @Configuration、@Bean 和 @Import 的详细过程及关键源码。

ConfigurationClassParser 的入口方法是 parse()，该方法接收配置类的集合，并逐个解析它们。其内部会调用 doProcessConfigurationClass() 方法，针对每个配置类进行解析。

- doProcessConfigurationClass() 方法负责解析传入的配置类，其中包括 @Configuration、@Bean 和 @Import 注解的解析。

```java
public void parse(Set<BeanDefinitionHolder> configCandidates) {
    for (BeanDefinitionHolder holder : configCandidates) {
        ConfigurationClass configClass = new ConfigurationClass(holder.getBeanDefinition());
        // 处理配置类
        doProcessConfigurationClass(configClass);
    }
}
```

@Configuration 注解表示该类是一个配置类。ConfigurationClassParser 会对带有 @Configuration 注解的类进行解析，并将其视为一个完整的配置类。

- doProcessConfigurationClass() 方法首先检查类是否标注了 @Configuration 注解，如果存在，Spring 会对其进行代理以确保 @Bean 方法的正确调用。
- 在解析 @Configuration 注解的过程中，Spring 会把这个类注册为 ConfigurationClass，并标记为一个配置类，之后会解析该类中的其他注解。

```java
if (metadata.isAnnotated(Configuration.class.getName())) {
    configClass.addConfigurationClass();
}
```

@Bean 注解用于声明一个 Spring Bean。ConfigurationClassParser 会扫描 @Configuration 类中的所有方法，并解析带有 @Bean 注解的方法。

- doProcessConfigurationClass() 调用 processMemberClasses() 方法来扫描所有的方法，找到 @Bean 方法。
- 每个带有 @Bean 注解的方法会被转换为一个 BeanMethod，并添加到 ConfigurationClass 中。
- 在解析过程中，@Bean 方法被转换为 BeanDefinition 并注册到 Spring IoC 容器中。这样，当容器启动时，Spring 会调用这些方法以生成相应的 Bean 实例。

```java
if (methodMetadata.isAnnotated(Bean.class.getName())) {
    configClass.addBeanMethod(new BeanMethod(methodMetadata, configClass));
}
```

@Import 注解允许导入其他配置类或定义 Bean 的组件。Spring 会通过 @Import 将指定的类引入到当前的应用上下文。

- ConfigurationClassParser 在 doProcessConfigurationClass() 方法中检查类是否带有 @Import 注解。如果检测到 @Import 注解，会提取注解中的类名，并使用 processImports() 方法进行进一步处理。
- processImports() 方法会检查 @Import 注解引用的类是否实现了 ImportSelector 或 ImportBeanDefinitionRegistrar 接口。
  - 如果是 ImportSelector，则会调用其 selectImports() 方法来获取需要导入的类名列表。
  - 如果是 ImportBeanDefinitionRegistrar，则调用 registerBeanDefinitions() 方法将这些类注册到容器中。
- 在解析 @Import 的过程中，Spring 通过 processImports() 方法调用 AutoConfigurationImportSelector，使用 SpringFactoriesLoader 加载 spring.factories 文件中的自动配置类列表。

```java
Set<SourceClass> imports = retrieveImports(configClass, currentSourceClass);
processImports(configClass, currentSourceClass, imports);
```


# finishBeanFactoryInitialization(beanFactory)

finishBeanFactoryInitialization(beanFactory) 是 refresh() 方法中的关键步骤之一，专门负责完成 Bean 的初始化。它会遍历 BeanFactory 中所有非懒加载的单例 Bean，并调用 getBean() 方法触发每个 Bean 的创建、依赖注入、初始化和增强处理。

```java
protected void finishBeanFactoryInitialization(ConfigurableListableBeanFactory beanFactory) {
    // 如果使用了 ConversionService，则初始化 ConversionService Bean
    if (beanFactory.containsBean(CONVERSION_SERVICE_BEAN_NAME) &&
        beanFactory.isTypeMatch(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class)) {
        beanFactory.setConversionService(beanFactory.getBean(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class));
    }

    // 为 BeanFactory 注册默认的加载器（如果不存在的话）
    if (!beanFactory.hasEmbeddedValueResolver()) {
        beanFactory.addEmbeddedValueResolver(strVal -> getEnvironment().resolvePlaceholders(strVal));
    }

    // 初始化所有剩余的非懒加载单例 Bean
    beanFactory.preInstantiateSingletons();
}
```

preInstantiateSingletons() 方法是 DefaultListableBeanFactory 中的一个方法，负责遍历所有非懒加载的单例 Bean，调用 getBean() 方法触发 Bean 的实例化和初始化。

```java
public void preInstantiateSingletons() throws BeansException {
    List<String> beanNames = new ArrayList<>(this.beanDefinitionNames);

    // 遍历所有的 BeanDefinition
    for (String beanName : beanNames) {
        RootBeanDefinition bd = getMergedLocalBeanDefinition(beanName);
        
        // 检查是否为非懒加载的单例
        if (bd.isSingleton() && !bd.isLazyInit()) {
            getBean(beanName);
        }
    }
}
```

getBean() 方法是 BeanFactory 中负责获取 Bean 实例的方法。当 getBean() 方法被调用时，如果该 Bean 尚未实例化，Spring 会自动完成以下步骤：

- 创建 Bean 实例：调用 createBean() 方法来创建 Bean 实例。
- 依赖注入：通过 populateBean() 方法将依赖注入到该 Bean 实例中。
- 初始化：调用 initializeBean() 方法，执行初始化方法和 BeanPostProcessor 的处理逻辑。

```java
@Override
public Object getBean(String name) throws BeansException {
    return doGetBean(name, null, null, false);
}

protected <T> T doGetBean(String name, Class<T> requiredType, Object[] args, boolean typeCheckOnly) {
    // 尝试从缓存中获取单例 Bean
    Object sharedInstance = getSingleton(name);
    if (sharedInstance != null) {
        return (T) sharedInstance;
    }

    // 创建 Bean 实例
    RootBeanDefinition mbd = getMergedLocalBeanDefinition(name);
    Object bean = createBean(name, mbd, args);
    return (T) bean;
}
```

在 createBean() 方法中，会调用 initializeBean() 方法来完成 Bean 的初始化。initializeBean() 方法会依次执行以下步骤：

1. 调用 postProcessBeforeInitialization：调用所有注册的 BeanPostProcessor 的 postProcessBeforeInitialization 方法。
2. 执行初始化方法：执行 Bean 自身的初始化方法，如实现 InitializingBean 接口的 afterPropertiesSet() 方法，或配置的 init-method 方法。
3. 调用 postProcessAfterInitialization：调用所有 BeanPostProcessor 的 postProcessAfterInitialization 方法，完成对 Bean 的增强和代理。

```java
protected Object initializeBean(final String beanName, final Object bean, RootBeanDefinition mbd) {
    Object wrappedBean = applyBeanPostProcessorsBeforeInitialization(bean, beanName);
    invokeInitMethods(beanName, wrappedBean, mbd);
    wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
    return wrappedBean;
}
```

# Three-Level Cache

在 DefaultSingletonBeanRegistry 中，三级缓存用于保存 Bean 的不同生命周期阶段的实例：

- 一级缓存 singletonObjects：完成生命周期的单例 Bean 存储在这里，这就是 applicationContext.getBean() 方法返回的对象。
- 二级缓存 earlySingletonObjects：存放未完成生命周期的“半成品” Bean，用于解决循环依赖。当循环依赖发生时，Spring 会将一个 Bean 的早期引用放入此缓存中，以便在另一个 Bean 初始化时获取到这个“半成品” Bean。
- 三级缓存 singletonFactories：存放生成对象的 ObjectFactory，可以通过调用 getObject() 创建正常对象或代理对象。这是 Spring 解决循环依赖的关键。在 Bean 初始化前，将一个生成对象的 ObjectFactory 放入三级缓存，用于生成原始对象或代理对象。一旦 Bean 从三级缓存中被创建并转移到二级缓存，三级缓存中的该 Bean 会被移除。

```java
// Lv1 Cache
private final Map<String, Object> singletonObjects = new ConcurrentHashMap(256);
// Lv2 Cache
private final Map<String, Object> earlySingletonObjects = new ConcurrentHashMap(16);
// Lv3 Cache
private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap(16);
```

singletonsCurrentlyInCreation 记录正在创建过程中的 Bean 名称，用于判断是否存在循环依赖。

```java
private final Set<String> singletonsCurrentlyInCreation = Collections.newSetFromMap(new ConcurrentHashMap<>(16));
```

实例，当 A 和 B 发生循环依赖时，Spring 会借助三级缓存，按照下面的步骤解决循环应用：

- 调用 getBean() 获取 A, 依次查询 singletonObjects, earlySingletonObjects 和 singletonFactories, 未查询到 A Cache, 调用 getSingleton() 创建 A

  - 调用 beforeSingletonCreation() 添加 A 到 singletonsCurrentlyInCreation 中, 表示 A 正在创建过程中
  - 调用 singleFactory.getObject() 通过 Reflect 创建 A Obj, 此时 A Obj 的成员都是空的, 即 A 引用的 B 也是空的
  - 生成 A 的 ObjectFactory 存入 singletonFactories, ObjectFactory 本质是一个 Lambda, 可用于动态创建 A 的 Normal Obj 或 Proxy Obj
  - 调用 populateBean() 填充依赖时, 发现 A 依赖 B, 需要去创建 B

- 调用 getBean() 获取 B, 依次查询 singletonObjects, earlySingletonObjects 和 singletonFactories, 未查询到 B Cache, 调用 getSingleton() 创建 B

  - 调用 beforeSingletonCreation() 添加 B 到 singletonsCurrentlyInCreation 中
  - 调用 singleFactory.getObject() 通过 Reflect 创建 B Obj, 此时 B Obj 的成员都是空的, 即 B 引用的 A 也是空的
  - 生成 B 的 ObjectFactory 存入 singletonFactories
  - 调用 populateBean() 填充依赖时, 并发现 A 也在 singletonsCurrentlyInCreation 中, 说明 A 和 B 存在 Circular Reference, 需要去处理 Circular Reference

- 调用 getBean() 获取 A, 依次查询 singletonObjects, earlySingletonObjects 和 singletonFactories, 从 singletonFactories 中获取到 A 的 OpenFactory, 执行 Lambda 创建 A Obj 放入 earlySingletonObjects, 并移除 singletonFactories 中 A 的 OpenFactory

  - 如果 C 引用了 A, 直接从 earlySingletonObjects 获取 A 即可, 不需要再通过 A 的 OpenFactory 获取 A Obj 了

- 调用 populateBean() 填充 B 依赖的 A, 此时 B 创建完成, 向 singleObjects 添加 B, 从 singletonsCurrentlyInCreation 和 singletonFactories 移除 B

  - 如果再使用 B, 就可以直接从 singleObjects 中获取

- 调用 populateBean() 填充 A 依赖的 B, 此时 A 创建完成, 向 singleObjects 添加 A, 从 singletonsCurrentlyInCreation 和 earlySingletonObjects 移除 A

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401152302912.png)

getSingleton 是获取单例 Bean 的核心方法，它会依次检查一级缓存、二级缓存、三级缓存，并在必要时生成早期引用。

```java
protected Object getSingleton(String beanName, boolean allowEarlyReference) {
    // 先从一级缓存获取
    Object singletonObject = this.singletonObjects.get(beanName);
    if (singletonObject == null && this.singletonsCurrentlyInCreation.contains(beanName)) {
        // 如果一级缓存没有且正在创建中，从二级缓存获取
        singletonObject = this.earlySingletonObjects.get(beanName);
        if (singletonObject == null && allowEarlyReference) {
            // 如果二级缓存没有且允许早期引用，从三级缓存生成早期引用
            ObjectFactory<?> singletonFactory = this.singletonFactories.get(beanName);
            if (singletonFactory != null) {
                singletonObject = singletonFactory.getObject();
                this.earlySingletonObjects.put(beanName, singletonObject);
                this.singletonFactories.remove(beanName);
            }
        }
    }
    return singletonObject;
}
```

addSingletonFactory 方法用于将 ObjectFactory 存入三级缓存 singletonFactories。

```java
protected void addSingletonFactory(String beanName, ObjectFactory<?> singletonFactory) {
    synchronized (this.singletonObjects) {
        if (!this.singletonObjects.containsKey(beanName)) {
            this.singletonFactories.put(beanName, singletonFactory);
            this.earlySingletonObjects.remove(beanName);
        }
    }
}
```

beforeSingletonCreation 会将正在创建的 Bean 加入 singletonsCurrentlyInCreation，afterSingletonCreation 会在创建完成后将其移除。

```java
protected void beforeSingletonCreation(String beanName) {
    if (!this.singletonsCurrentlyInCreation.add(beanName)) {
        throw new BeanCurrentlyInCreationException(beanName);
    }
}

protected void afterSingletonCreation(String beanName) {
    this.singletonsCurrentlyInCreation.remove(beanName);
}
```

# Spring Lifecycle

创建 ApplicationContext 容器：

- ApplicationContext 是 Spring 的核心接口，负责加载配置和管理 Bean 的生命周期。开发者可以通过多种方式创建 ApplicationContext，如 XML 配置、注解配置等。

```java
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
```

调用 refresh() 方法，启动上下文:

- Spring 容器启动的核心逻辑在 refresh() 方法中。refresh() 方法由 AbstractApplicationContext 类实现，包含了启动容器的主要步骤和扩展点。在这个过程中，Spring 会加载 Bean 定义、初始化 BeanFactory，并触发各类监听器事件。

```java
public void refresh() throws BeansException, IllegalStateException {
    synchronized (this.startupShutdownMonitor) {
        prepareRefresh(); // 准备刷新上下文环境

        ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory(); // 创建 BeanFactory
        prepareBeanFactory(beanFactory); // 准备 BeanFactory（如注册默认的环境）

        postProcessBeanFactory(beanFactory); // 调用 BeanFactory 的后置处理器

        invokeBeanFactoryPostProcessors(beanFactory); // 调用 BeanFactoryPostProcessor

        registerBeanPostProcessors(beanFactory); // 注册 BeanPostProcessor

        initMessageSource(); // 初始化消息源

        initApplicationEventMulticaster(); // 初始化事件广播器

        onRefresh(); // 子类的特定刷新逻辑

        registerListeners(); // 注册事件监听器

        finishBeanFactoryInitialization(beanFactory); // 完成 BeanFactory 的初始化，实例化非懒加载单例 Bean

        finishRefresh(); // 完成刷新过程，启动容器
    }
}
```

BeanFactory 创建和初始化：

- 在 refresh() 方法中，obtainFreshBeanFactory() 用于创建或刷新 BeanFactory。此步骤主要是创建一个 DefaultListableBeanFactory 实例，并从配置中加载所有的 BeanDefinition。prepareBeanFactory() 会设置一些默认的配置（如 ClassLoader、Bean 后置处理器）。

```java
protected ConfigurableListableBeanFactory obtainFreshBeanFactory() {
    refreshBeanFactory();
    return getBeanFactory();
}
```

调用 BeanFactoryPostProcessor 和注册 BeanPostProcessor

- invokeBeanFactoryPostProcessors(beanFactory)：调用所有的 BeanFactoryPostProcessor，包括 ConfigurationClassPostProcessor，用于解析 @Configuration 配置类，进一步注册其他 BeanDefinition。BeanFactoryPostProcessor 可以在 Bean 实例化前对 BeanDefinition 进行修改。
- registerBeanPostProcessors(beanFactory)：注册 BeanPostProcessor，这些后处理器会在 Bean 初始化前后执行自定义逻辑，如 AutowiredAnnotationBeanPostProcessor 用于处理依赖注入。

加载、依赖注入和初始化 Bean：

- 在 finishBeanFactoryInitialization(beanFactory) 中，Spring 会实例化所有非懒加载的单例 Bean。这一阶段包括了依赖注入、Bean 的初始化等具体操作。

容器启动完成，进入运行阶段：

- 当 finishRefresh() 执行完毕后，Spring 容器启动完成，并进入运行阶段。此时，所有非懒加载的单例 Bean 已经被创建，开发者可以通过 ApplicationContext 获取 Bean 并使用它们。

当应用关闭或手动调用 close() 方法时，Spring 容器会进入关闭阶段。在这个阶段，Spring 会执行以下操作：

- 发布 ContextClosedEvent：通知监听器容器即将关闭。
- 销毁单例 Bean：调用所有单例 Bean 的销毁方法，如 DisposableBean.destroy() 或 @PreDestroy 注解的方法。
- 关闭资源：关闭容器中所有资源和线程池，释放系统资源。

```java
((AbstractApplicationContext) context).close();
```

# Bean Lifecycle

Spring 创建 Bean 的过程

- 调用 loadBeanDefinitions() 扫描 XML 或 Annotation 声明的 Bean, 封装成 BeanDefinition Obj 放入 beanDefinitionMap 中, 再遍历 beanDefinitionMap, 通过 createBean() 创建 Bean
- 调用 createBeanInstance() 构建 Bean Instance, 去获取 Constructor, 先准备 Constructor 需要的 Parameter, 再执行 Constructor
- 调用 populateBean() 填充 Bean, 通过 Three-Level Cache 去注入当前 Bean 所依赖的 Bean (通过 @Autowired 注入的 Bean)

Spring 初始化 Bean 的过程

- 调用 initializeBean() 初始化 Bean
- 调用 invokeAwareMethods() 去填充 Bean 实现的 Aware 信息, Bean 有可能实现了 BeanNameAware, BeanFactoryAware 或 ApplicationContextAware 去扩展 Bean (类似于 Neddle, 可以感知到 Bean Lifecycle 中的信息)
- 调用 applyBeanProcessorsBeforeInitialization() 去处理 Bean 实现的 BeanPostProcessor 的 postProcessBeforeInitialization()
- 调用 Bean 中添加了 @PostConstruct 的 Init Method
- 调用 Bean 实现的 InitializingBean 的 afterPropertiesSet()
- 调用 Bean 中添加了 @Bean(initMethod = "initMethod") 的 Init Method
- 调用 applyBeanProcessorsAfterInitialization() 去处理 Bean 实现的 BeanPostProcessor 的 postProcessAfterInitialization(), AOP 动态代理就是由该 Processor 实现的
- 调用 registerDisposableBean() 注册实现了 Disposable 的 Bean, 这样销毁时, 就会自动执行 destroy()
- 调用 addSingleton() 将 Bean 放入 singletonObjects 中, 后续使用 Bean 都是从 singletonObjects 中获取

Spring 销毁 Bean 的过程

- 调用 Bean 中添加了 @PreDestroy 的 Destroy Method
- 调用 destroyBeans() 遍历 singletonObjects, 逐一销毁所有的 Bean, 这个过程会依次执行 Bean 的 destroy()
- 调用 Bean 中添加了 @Bean(destroyMethod = "destroyMethod") 的 Destroy Method

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401081756800.png)

```java
@Component
public class User implements BeanNameAware, BeanFactoryAware, ApplicationContextAware, InitializingBean {
    public User() {
        System.out.println("User()");
    }
    
    @PostConstruct
    public void init() {
        System.out.println("init()");
    }
    
    @PreDestroy
    public void destroy() {
        System.out.println("destroy()");
    }
    
    @Override
    public void setBeanName(String name) {
        System.out.println("setBeanName()");
    }
    
    @Override
    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        System.out.println("setBeanFactory()");
    }
    
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        System.out.println("setApplicationContext()");
    }
    
    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("afterPropertiesSet()");
    }
}
```

```java
@Component
public class UserProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (beanName.equals("user")) {
            System.out.println("postProcessBeforeInitialization()");
        }
        return bean;
    }
    
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (beanName.equals("user")) {
            System.out.println("postProcessAfterInitialization()");
        }
        return bean;
    }
}
```

```console
User()
setBeanName()
setBeanFactory()
setApplicationContext()
postProcessBeforeInitialization()
init()
afterPropertiesSet()
postProcessAfterInitialization()
```

# My IOC

annotation/MyComponent.java

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyComponent {}
```

annotation/MyAutoWired.java

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAutoWired {}
```

MyApplicationContext.java

```java
public interface MyApplicationContext {
    Object getBean(Class cls);
}
```

MyAnnotationApplicationContext.java

```java
public class MyAnnotationApplicationContext implements MyApplicationContext {
    private Map<Class, Object> beanMap = new HashMap<>();

    @Override
    public Object getBean(Class cls) {
        return beanMap.get(cls);
    }

    public MyAnnotationApplicationContext(String pkgUrl) {
        try {
            pkgUrl = pkgUrl.replaceAll("\\.", "/");
            // get absolute urls
            Enumeration<URL> urls = Thread.currentThread().getContextClassLoader().getResources(pkgUrl);
            while (urls.hasMoreElements()) {
                URL url = urls.nextElement();
                String dirPath = URLDecoder.decode(url.getFile(), StandardCharsets.UTF_8); // eg. project/target/classes/com/harvey
                String baseDirPath = dirPath.substring(0, dirPath.length() - pkgUrl.length()); // eg. project/target/classes/
                loadBean(new File(dirPath), baseDirPath);
            }
            loadAutoWired();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // add Class with @MyComponent Annotation to the beanMap
    public void loadBean(File dir, String baseDirPath) throws Exception {
        if (!dir.isDirectory()) {
            return;
        }
        File[] files = dir.listFiles();
        if (files == null) {
            return;
        }
        for (File file : files) {
            if (file.isDirectory()) {
                loadBean(file, baseDirPath);
                continue;
            }
            String filePath = file.getAbsolutePath().substring(baseDirPath.length()); // eg. com/harvey/bean/UserServiceImpl.class
            if (!filePath.contains(".class")) {
                continue;
            }
            String fullClassName = filePath.replaceAll("/", "\\.").replace(".class", ""); // eg. com.harvey.bean.UserServiceImpl.class
            Class<?> cls = Class.forName(fullClassName);
            if (cls.isInterface()) {
                continue;
            }
            if (cls.getAnnotation(MyComponent.class) == null) {
                continue;
            }
            Object obj = cls.getConstructor().newInstance();
            if (cls.getInterfaces().length > 0) {
                // key is Interface, value is  Object
                beanMap.put(cls.getInterfaces()[0], obj);
            } else {
                // key is Class, value is Object
                beanMap.put(cls, obj);
            }
        }
    }

    // inject Object to the Field with @MyAutoWired Annotation
    public void loadAutoWired() throws IllegalAccessException {
        for (Map.Entry<Class, Object> entry : beanMap.entrySet()) {
            Class cls = entry.getKey();
            Object obj = entry.getValue();
            // set cls to obj's Class to get Field
            if (cls.isInterface()) {
                cls = obj.getClass();
            }
            Field[] fields = cls.getDeclaredFields();
            for (Field field : fields) {
                if (field.getAnnotation(MyAutoWired.class) == null) {
                    continue;
                }
                field.setAccessible(true);
                field.set(obj, beanMap.get(field.getType()));
            }
        }
    }
}
```

UserService.java

```java
public interface UserService {
    void show();
}
```

UserServiceImpl.java

```java
@MyComponent
public class UserServiceImpl implements UserService {
    @MyAutoWired
    private UserDao userDao;

    @Override
    public void show() {
        System.out.println(userDao);
    }
}
```

App.java

```java
MyApplicationContext applicationContext = new MyAnnotationApplicationContext("com.harvey");
UserService userService = (UserService) applicationContext.getBean(UserService.class);
userService.show();
```
