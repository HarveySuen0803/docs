# req header impl

通过 req header 进行 content negotiation (def. open)

- req header 携带 Accept 指定 data type (eg. Accept: application/json)
- server 根据 Accept 返回 data

## response JSON

SpringBoot 底层默认通过 JackSON 处理 data 返回 JSON

UserController.java, 添加 @ResponseBody, 返回的 data 自动转 JSON

```java
@RequestMapping("/test")
@ResponseBody
public User test() {
    return new User();
}
```

req header 携带 Accpet: application/json

## response XML

SpringBoot 底层没有处理 XML 的方式, 需要手动配置

pom.xml

```xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
    <version>2.15.2</version>
</dependency>
```

User.java, 添加 @JacksonXmlRootElement 开启 XML support

```java
@JacksonXmlRootElement
public class User {}
```

UserController.java, 添加 @ResponseBody, 返回的 data 自动转 XML

```java
@RequestMapping("/test")
@ResponseBody
public User test() {
    return new User();
}
```

req header 携带 Accept:application/xml

# req param impl

通过 req param 进行 content negotiation (def. close)

- req param 携带 param 指定的 data type (eg. GET /users?format=json)
- server 根据 param 返回 data

application.properties, 配置 Content Negotiation

```properties
# open Content Negotiation (def. false)
spring.mvc.contentnegotiation.favor-parameter=true

# modify param name
spring.mvc.contentnegotiation.parameter-name=format
```

## response JSON

UserController.java, 添加 @ResponseBody, 返回的 data 自动转 JSON

```java
@RequestMapping("/test")
@ResponseBody
public User test() {
    return new User();
}
```

req param 携带 format=json

## response XML

pom.xml

```xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
    <version>2.15.2</version>
</dependency>
```

User.java, 添加 @JacksonXmlRootElement 开启 XML support

```java
@JacksonXmlRootElement
public class User {}
```

UserController.java, 添加 @ResponseBody, 返回的 data 自动转 XML

```java
@RequestMapping("/test")
@ResponseBody
public User test() {
    return new User();
}
```

req param 携带 format=xml

# HttpMessageConverter

SpringBoot 通过 HttpMessageConverter 进行 Content Negotiation, 根据 data type 调用对应的 MessageConverter 处理 data

- eg. 调用 MappingJackson2HttpMessageConverter 将 data 转成 JSON, 调用 MappingJackson2XMLHttpMessageConverter 将 data 转成 XML

默认的 MessageConverter

- ByteArrayHttpMessageConverter 处理 Byte Array
- StringHttpMessageConverter 处理 String
- ResourceHttpMessageConverter 处理 Resource
- ResourceRegionHttpMessageConverter 处理 Resource Region
- AllEncompassingFormHttpMessageConverter 处理 form
- MappingJackson2HttpMessageConverter 处理 JSON

# custom YAML MessageConverter

pom.xml

```xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-yaml</artifactId>
</dependency>
```

application.properties, 配置 media type 对应的 req header

```properties
spring.mvc.contentnegotiation.media-types.yaml=application/yaml
```

MyYamlHttpMessageConverter.java, 配置 custom Converter

```java
public class MyYamlHttpMessageConverter extends AbstractHttpMessageConverter<Object> {
    private ObjectMapper objectMapper = null;

    // 配置 ObjectMapper
    public MyYamlHttpMessageConverter() {
        // 配置 media type
        super(new MediaType("application", "yaml", StandardCharsets.UTF_8));
        YAMLFactory factory = new YAMLFactory();
        // 禁用 YAML 的 doc start marker
        factory.disable(YAMLGenerator.Feature.WRITE_DOC_START_MARKER);
        // 通过 ObjectMapper 将 Domain 转成 YAML
        this.objectMapper = new ObjectMapper(factory);
    }

    // 配置支持哪些 Cls
    @Override
    protected boolean supports(Class<?> clazz) {
        // 支持所有 Cls
        return true;
    }

    // 搭配 @RequestBody, 输入 req body, 配置 Cls
    @Override
    protected Object readInternal(Class<?> clazz, HttpInputMessage inputMessage) throws IOException, HttpMessageNotReadableException {
        return null;
    }

    // 搭配 @ResponseBody, 配置 输出 resp body
    @Override
    protected void writeInternal(Object obj, HttpOutputMessage outputMessage) throws IOException, HttpMessageNotWritableException { // obj 为 Controller 返回的 obj
        // outputMessagegetBody() 为 resp body 的 os
        try (OutputStream os = outputMessagegetBody()) {
            // 通过 ObjectMapper, 将 obj 转成 YAML, 再通过 os 输出到 resp body
            this.objectMapper.writeValue(os, obj);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```

SpringBootMvcConfiguration.java, converters 添加 custom Converter

```java
@Configuration
public class SpringBootMvcConfiguration implements WebMvcConfigurer {
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // add MyYamlHttpMessageConverter and set the converte to the first
        converters.add(0, new MyYamlHttpMessageConverter());
    }
}
```





