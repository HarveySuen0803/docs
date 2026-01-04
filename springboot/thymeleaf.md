# Thymeleaf

pom.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
    ```

HomeController.java

```java
@Controller
public class HomeController {
    @GetMapping("/home")
    public String home(String name, Model model) { // name 为 req param, model 用于给 view 传递 param
        // 给 home view 传递 msg param
        model.addAttribute("msg", "hello world"); // {msg=hello world}
        // 返回 classpath:/templates/home.html
        return "home";
    }
}
```

templates/home.index

```html
<!DOCTYPE html>
<!-- 添加 th namespace 开启 IDE support -->
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<!-- 通过 th:text 获取 param -->
<span th:text="${msg}"></span>
</body>
</html>
```

# ${}

${} 动态获取 val, 还可以进行运算

```html
<span th:text="${age > 18 ? 'adult' : 'minor'} "></span>
```

# @{}

@{} 动态获取 url, 如果项目有配置 root path, 就会自动补充 root path

```html
<img th:src="@{imgUrl}">
```

# || 

```html
<span th:text="|hello ${name}|"></span>
```

# \[\[\]\]

```html
<span>[[${msg}]]</span>
```

# th:text

th:text 渲染 plain text

```html
<span th:text="${msg}"/>
```

# th:utext

th:utext 渲染 rich text, 可以渲染 HTML tag

```html
<span th:utext="${msg}"/>
```

# th:

th:\*\* 渲染 attr

```html
<img th:src="${imgUrl}">
```

# th:attr

th:attr 渲染 attr, 可以同时渲染多个 attr

```html
<img th:attr="src=${imgUrl}, style=${style}">
```

# th:if

```html
<span th:if="${isShow}">hello world</span>
```

# th:each

```html
<ul th:each="user, status : ${userList}">
    <li th:text="${user.id}"></li>
    <li th:text="${user.name}"></li>
    <li th:text="${user.age}"></li>
    <li th:text="${user.sex}"></li>
    <li>
        index (index start at 0): [[${status.index}]]
        count (index start at 1): [[${status.count}]]
        size: [[${status.size}]]
        curObj: [[${status.current}]]
        isEvenCount: [[${status.even}]]
        isOddCount: [[${status.odd}]]
        isFirstObj: [[${status.first}]]
        isLastObj: [[${status.last}]]
    </li>
</ul>
```

# th:switch

```html
<ul th:switch="${name}">
    <li th:case="sun">hello sun</li>
    <li th:case="xue">hello xue</li>
    <li th:case="cheng">hello cheng</li>
</ul>
```

# th:object

```html
<ul th:object="${user}">
    <!-- 直接通过 *{} 访问 user attr -->
    <li th:text="*{id}"></li>
    <li th:text="*{name}"></li>
    <li th:text="*{age}"></li>
    <li th:text="*{sex}"></li>
</ul>
```

# priority

1. th:insert, th:replace
2. th:each
3. th:if, th:unless, th:switch, th:case
4. th:object, th:with
5. th:attr, th:attrprepend, th:attrappend
6. th:value, th:href, th:src
7. th:text, th:utext
8. th:fragment

# Component

header.html

```html
<div th:fragment="my-header">header</div>
```

index.html

```html
<!-- 将 header.html 的 my-header 插入 div tag -->
<div th:insert="~{header :: my-header}"></div>

<!-- 将 header.html 的 my-header 替换 div tag -->
<div th:replace="~{header :: my-header}"></div>
```

# i18n

messages.properties

```properties
msg=hello world
```

messages_en_US.properties

```properties
msg=hello world
```

messages_zh_CN.properties

```properties
msg=你好世界
```

Test

```html
<span th:text="#{msg}"></span>
```

获取 i18n messages

```java
@Autowired
MessageSource messageSource;

@GetMapping("/test")
public void test(HttpServletRequest req) {
    String msg = messageSource.getMessage("msg", null, req.getLocale());
}
```

# Exception handler

error.html, 访问 Model data

```html
<!-- timestamp -->
<div th:text="${timestamp}"></div>

<!-- status code -->
<div th:text="${status}"></div>

<!-- req path -->
<div th:text="${path}"></div>

<!-- error -->
<div th:text="${error}"></div>

<!-- error trace -->
<div th:text="${trace}"></div>

<!-- error message -->
<div th:text="${message}"></div>
```

# config

```properties
# access path prefix
spring.thymeleaf.prefix=classpath:/templates/

# view file suffix
spring.thymeleaf.suffix=.html

# enable cache
spring.thymeleaf.cache=true

# disable check
spring.thymeleaf.check-template=false

# i18n messages prefix
spring.messages.basename=messages

# i18n messages encoding
spring.messages.encoding=UTF-8

# error page prefix
server.error.path=/error
```

