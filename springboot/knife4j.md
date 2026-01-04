# Knife4j

import denpendency

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
    <version>4.4.0</version>
</dependency>
```

set Knife4j Docket generator

```properties
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.tags-sorter=alpha
springdoc.swagger-ui.operations-sorter=alpha
springdoc.api-docs.path=/v3/api-docs
springdoc.group-configs[0].group=default
springdoc.group-configs[0].paths-to-match=/**
springdoc.group-configs[0].packages-to-scan=com.harvey.oj.controller
knife4j.enable=true
```

access `http://127.0.0.1:8080/doc.html`

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810208.png)

# @Api

```java
@RestController
@Api("UserController API")
public class UserController {}
```

# @ApiOperation

```java
@GetMapping("/user/{id}")
@ApiOperation("get user by id")
public User getUserById(@PathVariable Integer id) { return null; }
```

# @ApiModel

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@ApiModel("User Domain")
public class User {
}
```

# @ApiModelProperty

```java
@ApiModelProperty("primary key")
private Integer id;
```

