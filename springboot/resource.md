# Resource

Resource 是 Spring 框架中用于抽象和封装各种资源（如文件、类路径资源、URL 资源等）的接口。它提供了一种统一的方式来访问不同类型的资源，使得应用程序可以方便地处理这些资源，而不需要关心资源的具体类型和访问方式。

Resource 对象的主要作用包括：

- 统一资源访问接口：通过统一的接口方法访问各种类型的资源。
- 抽象资源细节：封装资源的具体访问细节，使得代码更加简洁和可维护。
- 便捷的资源操作：提供便捷的方法来读取、写入资源内容，以及获取资源的元数据。

以下是一个示例，展示如何直接使用这些 Resource 实现类来加载和读取资源内容。

```java
ApplicationContext applicationContext = new ClassPathXmlApplicationContext("applicationContext.xml");
Resource resource = applicationContext.getResource("classpath:test.txt");
boolean isExists = resource.exists();
boolean isReadable = resource.isReadable();
boolean isFile = resource.isFile();
File file = resource.getFile();
String fileName = resource.getFilename();
URI uri = resource.getURI();
URL url = resource.getURL();
String desc = resource.getDescription();
InputStream is = resource.getInputStream();
```

# ClassPathResource

ClassPathResource 用于从类路径加载资源。类路径资源通常是打包在 JAR 文件中的资源或在项目的 src/main/resources 目录下的资源。

假设在 src/main/resources 目录下有一个名为 application.properties 的文件。

```java
// 加载类路径资源
Resource resource = new ClassPathResource("application.properties");

// 读取资源内容
try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
    String content = reader.lines().collect(Collectors.joining("\n"));
    System.out.println("ClassPathResource content: \n" + content);
}
```

# FileSystemResource

FileSystemResource 用于从文件系统加载资源。文件系统资源是指存储在本地文件系统中的文件。

假设在文件系统中的某个路径下有一个名为 example.txt 的文件。

```java
Resource resource = new FileSystemResource("/path/to/your/example.txt");

// 读取资源内容
try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
    String content = reader.lines().collect(Collectors.joining("\n"));
    System.out.println("FileSystemResource content: \n" + content);
}
```

访问绝对路径的文件：

```java
FileSystemResource resource = new FileSystemResource("/Users/HarveySuen/Downloads/test.txt");
```

访问相对路径的文件：

```java
FileSystemResource resource = new FileSystemResource("../resources/test.txt");
```

# UrlResource

UrlResource 用于从 URL 加载资源。URL 资源可以是通过 HTTP、HTTPS 或 FTP 等协议访问的资源。

```java
// 加载 URL 资源
Resource resource = new UrlResource("http://example.com/resource");

// 读取资源内容
try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
    String content = reader.lines().collect(Collectors.joining("\n"));
    System.out.println("UrlResource content: \n" + content);
}
```

# ByteArrayResource

ByteArrayResource 用于从字节数组加载资源。字节数组资源是指直接从内存中的字节数组加载的资源

```java
byte[] data = "Hello, World!".getBytes(StandardCharsets.UTF_8);
Resource resource = new ByteArrayResource(data);

// 读取资源内容
try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
    String content = reader.lines().collect(Collectors.joining("\n"));
    System.out.println("ByteArrayResource content: \n" + content);
}
```

# InputStreamResource

InputStreamResource 用于从 InputStream 加载资源。InputStream 资源是指直接从输入流加载的资源。

```java
InputStream inputStream = new ByteArrayInputStream("Hello, World!".getBytes(StandardCharsets.UTF_8));
Resource resource = new InputStreamResource(inputStream);

// 读取资源内容
try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
    String content = reader.lines().collect(Collectors.joining("\n"));
    System.out.println("InputStreamResource content: \n" + content);
}
```

# ResourceLoader

ResourceLoader 是 Spring 框架中的一个接口，用于加载资源（如文件、类路径资源、URL 资源等）。它提供了一个统一的资源加载策略，使得应用程序可以方便地访问不同类型的资源。ResourceLoader 的主要功能是通过 getResource 方法返回一个 Resource 对象，Resource 对象封装了资源的实际内容和元数据。

ResourceLoader 的主要作用包括：

- 统一资源加载接口：提供一种统一的方式来加载各种类型的资源，无论是文件系统中的文件、类路径中的资源，还是通过 URL 访问的资源。
- 抽象资源访问：通过 Resource 接口抽象出资源的访问方式，使得代码不需要关心具体的资源类型和访问方式。
- 灵活的资源定位：支持多种资源定位方式，包括类路径、文件系统、URL 等。

创建一个实现 ResourceLoaderAware 接口的类，该类将使用 ResourceLoader 来加载资源。

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
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
            String content = reader.lines().collect(Collectors.joining("\n"));
            System.out.println("Resource content: \n" + content);
        }
    }
}
```

ApplicationContext 本身就是一个 ResourceLoader，因为 ApplicationContext 接口继承了 ResourceLoader 接口。因此，你可以直接使用 ApplicationContext 来加载资源。

```java
Resource resource = applicationContext.getResource(resourcePath);
if (resource.exists() && resource.isReadable()) {
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
        String content = reader.lines().collect(Collectors.joining("\n"));
        System.out.println("Resource content: \n" + content);
    }
} else {
    System.out.println("Resource not found or not readable: " + resourcePath);
}
```

ClassPathXmlApplicationContext 使用 ClassPathResource 来加载位于类路径中的配置文件。

```java
ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");

MyBean myBean = context.getBean(MyBean.class);
System.out.println(myBean.getName());
```

FileSystemXmlApplicationContext 使用 FileSystemResource 来加载位于文件系统中的配置文件。

```java
ApplicationContext context = new FileSystemXmlApplicationContext("/path/to/applicationContext.xml");

// 获取 Bean
MyBean myBean = context.getBean(MyBean.class);
System.out.println(myBean.getName());
```