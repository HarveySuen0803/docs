# Swagger

import dependency

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.1.0</version>
</dependency>
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-api</artifactId>
    <version>2.1.0</version>
</dependency>
```

set document info

```java
@Bean
public OpenAPI docsOpenApi() {
    License license = new License()
            .name("Harvey GitHub")
            .url("https://github.com/HarveySuen0803");
    Info info = new Info()
            .title("SpringBootDemo API")
            .description("SpringBootDemo API")
            .version("v 0.0.1")
            .license(license);
    return new OpenAPI()
            .info(info)
            .externalDocs(new ExternalDocumentation());
}
```

set controller

```java
@RestController
public class UserController {
    @GetMapping("/user/{id}")
    public User getUserById(@PathVariable Integer id) { return null; }

    @GetMapping("/user")
    public List<User> getUserList() { return null; }

    @PostMapping("/user")
    public void insert(@RequestBody User user) {}

    @PutMapping("/user/{id}")
    public void updateById(@RequestBody User user, @PathVariable Integer id) {}

    @DeleteMapping("/user/{id}")
    public void deleteById(@PathVariable Integer id) {}
}
```

access http://127.0.0.1:8080/swagger-ui.html

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811349.png)

# @Tag

```java
@Tag(name = "User", description = "User Controller")
@RestController
public class UserController {}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811351.png)

# @Operation

```java
@Operation(summary = "getUserById", description = "get user by id")
@GetMapping("/user/{id}")
public User getUserById(@PathVariable Integer id) {
    return null;
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811352.png)

# @Schema

```java
@Schema(title = "User Domain")
public class User {
    @Schema(title = "id Field")
    private Integer id;
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811353.png)

# Group

OpenApiConfiguration.java

```java
@Configuration
public class OpenApiConfiguration {
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder().group("User Api").pathsToMatch("/user/**", "/users/**").build();
    }
    
    @Bean
    public GroupedOpenApi deptApi() {
        return GroupedOpenApi.builder().group("Dept Api").pathsToMatch("/dept/**", "/depts/**").build();
    }
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811354.png)

