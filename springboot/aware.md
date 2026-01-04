# Aware

Aware 接口是一组接口的集合，这些接口允许 Spring Bean 通过回调方法访问 Spring 容器中的特定资源。通过实现这些接口，Spring Bean 可以获取到 Spring 容器中的一些特定对象或信息，例如 ApplicationContext、BeanFactory、Environment 等。

以下是一些常见的 Aware 接口：

- ApplicationContextAware：获取 ApplicationContext。
- BeanFactoryAware：获取 BeanFactory。
- BeanNameAware：获取当前 Bean 的名称。
- EnvironmentAware：获取 Environment。
- ResourceLoaderAware：获取 ResourceLoader。

# ApplicationContextAware

ApplicationContextAware 接口允许 Bean 获取到 ApplicationContext 对象。

```java
@Component
public class MyApplicationContextAware implements ApplicationContextAware {
    private ApplicationContext applicationContext;
    
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
    
    public void displayAllBeanNames() {
        String[] beanNames = applicationContext.getBeanDefinitionNames();
        for (String beanName : beanNames) {
            System.out.println(beanName);
        }
    }
}
```

- Spring 容器会在创建 MyApplicationContextAware Bean 时调用 setApplicationContext 方法，将 ApplicationContext 注入到该 Bean 中。

# BeanNameAware

BeanNameAware 接口允许 Bean 获取到自身在 Spring 容器中的名称。

```java
@Component
public class MyBeanNameAware implements BeanNameAware {
    private String beanName;

    @Override
    public void setBeanName(String name) {
        this.beanName = name;
    }

    public void printBeanName() {
        System.out.println("Bean name is: " + beanName);
    }
}
```

- Spring 容器会在创建 MyBeanNameAware Bean 时调用 setBeanName 方法，将该 Bean 的名称注入到该 Bean 中。

# BeanFactoryAware

BeanFactoryAware 接口允许 Bean 获取到 BeanFactory 对象。

```java
@Component
public class MyBeanFactoryAware implements BeanFactoryAware {

    private BeanFactory beanFactory;

    @Override
    public void setBeanFactory(BeanFactory beanFactory) {
        this.beanFactory = beanFactory;
    }

    public void displayBeanFactoryInfo() {
        System.out.println("BeanFactory is of type: " + beanFactory.getClass().getName());
    }
}
```

# EnvironmentAware

EnvironmentAware 接口允许 Bean 获取到 Environment 对象。

```java
@Component
public class MyEnvironmentAware implements EnvironmentAware {

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    public void displayActiveProfiles() {
        String[] activeProfiles = environment.getActiveProfiles();
        System.out.println("Active profiles: " + String.join(", ", activeProfiles));
    }
}
```

# ResourceLoaderAware

ResourceLoaderAware 接口允许 Bean 获取到 ResourceLoader 对象。

```java
@Component
public class MyResourceLoaderAware implements ResourceLoaderAware {

    private ResourceLoader resourceLoader;

    @Override
    public void setResourceLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    public void displayResourceContent(String resourcePath) throws IOException {
        Resource resource = resourceLoader.getResource(resourcePath);
        InputStream inputStream = resource.getInputStream();
        String content = new BufferedReader(new InputStreamReader(inputStream))
                .lines().collect(Collectors.joining("\n"));
        System.out.println("Resource content: \n" + content);
    }
}

```

# ServletContextAware

ServletContextAware 接口允许 Bean 获取到 ServletContext 对象。这个接口仅在 Web 应用程序中有效。

```java
@Component
public class MyServletContextAware implements ServletContextAware {

    private ServletContext servletContext;

    @Override
    public void setServletContext(ServletContext servletContext) {
        this.servletContext = servletContext;
    }

    public void displayServletContextInfo() {
        System.out.println("ServletContext name: " + servletContext.getServletContextName());
    }
}
```