# SpringMVC

SpringMVC 是 Spring 一部分, 是基于 MVC Design Pattern 的 Web Framework, 用于构建 Web App, 提供了 Controller, View Parser, Exception Handling 等功能, 使得开发 Web App 变得更加简单.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

```java
@RestController
public class UserController {
    @RequestMapping("/show")
    public void show() {
        System.out.println("hello world");
    }
}
```

# SpringMVC Process

SpringMVC 处理 JSP 的流程

- Client 请求 Servlet, Servlet 转发请求给 SpringMVC 的 DispatcherServlet
- DispatcherServlet 请求 HandlerMapping 解析请求, 查询 Handler, HandlerMapping 返回 HandlerExecutionChain
    - HandlerMapping 就是一个 Map, Key 为 uri (eg: /user/1), Val 为 Class#Method (eg: com.harvey.controller.UserController#getById())
    - HandlerExecutionChain 包含了 Controller Method 和 Controller 的 Filter
- DispatcherServlet 携带 HandlerExecutionChain 请求 HandlerAdapter
- HandlerAdapter 根据 HandlerExecutionChain 找到对应的 Handler
    - HandlerAdapter 会处理请求参数 (eg: Query Param, Body Param, Path Param), 将处理好的参数交给 Handler
- Handler 执行 Method 后, 返回结果给 HandlerAdapter
    - HandlerAdapter 接受到响应结果后, 封装成 ModelAndView
- HandlerAdapter 返回 ModelAndView 给 DispatcherServlet
- DispatcherServlet 携带 ModelAndView 请求 ViewResolver
- ViewResolver 处理 ModelAndView, 返回 View Obj 给 DispatcherServlet
    - ViewResolver 会将 ModelAndVie 这个逻辑视图转成 JSP 视图或者 Thymeleaf视图
- DispatcherServlet 响应 View 给 Client

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401181550236.png)

SpringMVC 处理 JSON 的流程

- Client 请求 DispatcherServlet
- DispatcherServlet 请求 HandlerMapping 查询 Handler
- HandlerMapping 返回 HandlerExecutionChain
- DispatcherServlet 请求 HandlerAdapter
- HandlerAdapter 请求 Handler
- Handler 执行 Method, 通过 HttpMessageConverter 转换响应数据为 JSON 格式, 返回结果给 HandlerAdapter
- HandlerAdpater 返回结果给 DispatcherServlet
- DispatcherServlet 再返回给 Client

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221740209.png)

当应用启动时，Spring 会加载 DispatcherServlet，并初始化 HandlerMapping、HandlerAdapter、ViewResolver 等必要的组件。

```java
protected void initStrategies(ApplicationContext context) {
    this.initHandlerMappings(context);
    this.initHandlerAdapters(context);
    this.initViewResolvers(context);
    // 初始化其他策略...
}
```

当用户发送请求时，DispatcherServlet 的 doDispatch() 方法被调用。

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
    // 1. 获取处理器 (Handler)
    HandlerExecutionChain mappedHandler = getHandler(request);
    
    // 2. 获取处理器适配器 (HandlerAdapter)
    HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

    // 3. 调用处理器 (执行 Controller 方法)
    ModelAndView mv = ha.handle(request, response, mappedHandler.getHandler());

    // 4. 解析视图
    processDispatchResult(request, response, mappedHandler, mv);
}
```

DispatcherServlet 调用 getHandler() 方法，通过 HandlerMapping 匹配请求 URL 和处理器。

```java
protected HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
    for (HandlerMapping hm : this.handlerMappings) {
        HandlerExecutionChain handler = hm.getHandler(request);
        if (handler != null) {
            return handler;
        }
    }
    return null;
}
```

DispatcherServlet 根据 HandlerAdapter 调用具体的处理器方法。

```java
ModelAndView mv = ha.handle(request, response, mappedHandler.getHandler());
```

```java
public ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
    HandlerMethod handlerMethod = (HandlerMethod) handler;
    ModelAndView mav = invokeHandlerMethod(request, response, handlerMethod);
    return mav;
}
```

控制器返回 ModelAndView 对象后，DispatcherServlet 调用 ViewResolver 将逻辑视图名转换为具体视图。

```java
protected void render(ModelAndView mv, HttpServletRequest request, HttpServletResponse response) throws Exception {
    View view = resolveViewName(mv.getViewName(), mv.getModel(), locale, request);
    view.render(mv.getModel(), request, response);
}
```

# Request Protocol

```java
@RequestMapping(value = "/test", method = RequestMethod.GET)
public void test() {}

@GetMapping("/test")
public void test() {}
```

# Achieve Simple Param

接受 Simple Param

```java
@RequestMapping("/show")
public void show(String name, Integer age) {
    System.out.println(name); // sun
    System.out.println(age); // 18
}
```

访问 `http://localhost:8080/show?name=sun&age=18`

# Achieve JSON Param

接收 JSON Param

```java
@RequestMapping("/show")
public void show(@RequestBody User user) {
    System.out.println(user); // User{name='sun', age=18, address=Address{province='Jiangsu', city='Yangzhou'}}
}
```

访问 `http://localhost:8080/show`, 携带 JSON 请求体

```json
{
    "name": "sun",
    "age": 18,
    "address": {
        "province": "Jiangsu",
        "city": "Yangzhou"
    }
}
```

# Achieve Collection Param

接收 Collection Param

```java
@RequestMapping("/show")
public void show(@RequestBody List<String> names) {
    System.out.println(names); // [sun, xue, cheng]
}
```

访问 `http://localhost:8080/show`, 携带 Collection 请求体

```json
["sun", "xue", "cheng"]
```

# Achieve Date Param

接收 Data Param

```java
@RequestMapping("/show")
public void show(@DateTimeFormat(pattern = "yyyy.MM.dd_HH:mm:ss") LocalDateTime dateTime) {
    System.out.println(dateTime); // 2002-08-03T12:34:56
}
```

访问 `http://localhost:8080/show?dateTime=2002.08.03_12:34:56`

# Achieve Path Param

接收 Path Param

```java
@RequestMapping("/show/{name}/{age}")
public void show(@PathVariable String name, @PathVariable Integer age) {
    System.out.println(name); // sun
    System.out.println(age); // 18
}
```

访问 `http://localhost:8080/show/sun/18`

# Public Path

```java
// 抽取 /depts 作为公共路径
@RequestMapping("/depts")
@RestController
public class DeptController {
    @GetMapping("/test1")
    public void test1() {}

    @DeleteMapping("/test2/{id}")
    public void test2(@PathVariable Integer id) {}

    @PostMapping("/test3")
    public void test3(@RequestBody Dept dept) {}
}
```

# Param Attribute

访问 `http://localhost:8080/show?userName=sun&userAge=18`, 将 userName 转成 name, 将 userAge 转成 age

```java
@RequestMapping("/show")
public void show(@RequestParam(name = "userName") String name, @RequestParam(name = "userAge") Integer age) {
    System.out.println(name);
    System.out.println(age);
}
```

设置 Param 不是必须的

```java
@RequestMapping("/show")
public void show(@RequestParam(required = false) String name, @RequestParam(required = false) Integer age) {
    System.out.println(name);
    System.out.println(age);
}
```

设置 Param 的默认值

```java
@RequestMapping("/test")
public void test(@RequestParam(defaultValue = "sun") String name, @RequestParam(defaultValue = "10") Integer age) {
    System.out.println(name);
    System.out.println(age);
}
```

# @ResponseBody

通过 @ResponseBody 响应 data

```java
@ResponseBody
@RequestMapping("/show")
public User show() {
    return "hello world";
}
```

通过 @RestController 响应 data, 底层包含 @ResponseBody

```java
@RestController
public class UserController {
    @RequestMapping("/show")
    public String show() {
        return "hello world";
    }
}
```

# Response String

```java
@RequestMapping("/show")
public String show() {
    return "hello world";
}
```

# Response JSON

响应 JSON, Obj 自动转 JSON

```java
@RequestMapping("/show")
public User show() {
    return new User("sun", 18);
}
```

# Response Collection

响应 Collection, Map 自动转 Collection

```java
@RequestMapping("/show")
public Map show() {
    Map map = new HashMap();
    map.put("name", "sun");
    map.put("age", 18);
    return map;
}
```

# Response Page

去掉 @ResponseBody, 默认响应 Page

```java
@RequestMapping("/show")
public String show() {
    return "index.jsp";
}
```

# WebMvcConfigurer

WebMvcAutoConfiguration 底层包含 HiddenHttpMethodFilter Bean, FormContentFilter Bean

- HiddenHttpMethodFilter Bean 用于发送 Restful req
- FormContentFilter Bean 用于接收 req body

WebMvcAutoConfiguration.EnableWebMvcConfiguration 继承 DelegatingWebMvcConfiguration

DelegatingWebMvcConfiguration 的 configurers 会通过 IOC 获取所有 WebMvcConfigurer Bean 来配置 MVC, 所以只要配置一个 WebMvcConfigurer Bean 即可配置 MVC

implement WebMvcConfigurer to configure MVC

```java
@Configuration
public class WebMvcConfiguration implements WebMvcConfigurer {
    // configure resource
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // enable default config (explicitly declared, can be omitted)
        WebMvcConfigurer.super.addResourceHandlers(registry);

        // enable new config
        registry.addResourceHandler("/static/**") // intercept /static/** request
                .addResourceLocations("classpath:/test1/", "classpath:/test2/") // access classpath:/test1/, classpath:/test2/
                .setCacheControl(CacheControl.maxAge(3600, TimeUnit.SECONDS)); // cache 3600s expiration
    }

    // configure view
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("/login"); // access `/` will redirect to `/login`
    }
}
```

set WebMvcConfigurer Bean to configure MVC

```java
@Configuration
public class WebMvcConfiguration {
    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/static/**")
                        .addResourceLocations("classpath:/test1/", "classpath:/test2/")
                        .setCacheControl(CacheControl.maxAge(3600, TimeUnit.SECONDS));
            }
        };
    }
}
```

disable default config

```java
@EnableWebMvc
```

# Filter

Filter: 过滤请求, 做通用操作

App.java, 添加 @ServletComponentScan 开启 Servlet cmpnt 功能

```java
@ServletComponentScan
@SpringBootApplication
public class SpringProjectApplication {}
```

filter/DemoFilter.java, 过滤 req

```java
@WebFilter("/demo")
public class DemoFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Filter.super.init(filterConfig);
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        System.out.println("before filter");
        filterChain.doFilter(servletRequest, servletResponse);
        System.out.println("after filter");
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}
```

# Login Check with Filter

LoginCheckFilter.java, 过滤所有的 req, 验证 Token

```java
@Slf4j
@WebFilter("/*")
public class LoginCheckFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) servletRequest;
        HttpServletResponse resp = (HttpServletResponse) servletResponse;

        String url = req.getRequestURL().toString();

        // 放行 /login
        if (url.contains("login")) {
            filterChain.doFilter(req, resp);
            return;
        }

        String jwt = req.getHeader("token");

        // 如果令牌为 "" 或 null, 提示 failure
        if (!StringUtils.hasLength(jwt)) {
            String result = JSONObject.toJSONString(Result.failure("not login"));
            resp.getWriter().write(result);
            return;
        }

        // 解析 token, 如果出现 Exception, 提示 failure
        try {
            JwtUtils.parseJWT(jwt);
        } catch (Exception e) {
            e.printStackTrace();
            String result = JSONObject.toJSONString(Result.failure("not login"));
            resp.getWriter().write(result);
            return;
        }

        filterChain.doFilter(req, resp);
    }
}
```

# Interceptor

configure Interceptor

```java
@Component
public class LoginCheckInterceptor implements HandlerInterceptor {
    // invoke before request
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // true 放行, false 不放行
        return true;
    }

    // invoke after request
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {}

    // invoke after view rendering
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {}
}
```

register Interceptor

```java
@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    @Autowired
    LoginCheckInterceptor loginCheckInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginCheckInterceptor) // register loginCheckInterceptor
                .addPathPatterns("/**") // intercept /**
                .excludePathPatterns("/login") // not intercept /login
                .order(1); // order of interceptor
    }
}
```

# Interceptor Path

```java
addPathPatterns("/depts/*")

addPathPatterns("/depts/**")
```

# Interceptor Process

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810182.png)

```java
@WebFilter("/*")
public class LoginCheckFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        System.out.println("Filter before discharge");

        filterChain.doFilter(servletRequest, servletResponse);

        System.out.println("Filter after discharge");
    }
}
```

```java
@Component
public class LoginCheckInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("Interceptor preHandle()");
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("Interceptor postHandle()");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("Interceptor afterCompletion()");
    }
}
```

```java
@RestController
public class TestController {
    @RequestMapping("/test")
    public void test() {
        System.out.println("hello world");
    }
}
```

```
Filter before discharge
Interceptor preHandle()
hello world
Interceptor postHandle()
Interceptor afterCompletion()
Filter after discharge
```

# login check with Interceptor

LoginCheckInterceptor.java

```java
@Component
public class LoginCheckInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object handler) throws Exception {
        String url = req.getRequestURL().toString();

        // 放行 /login (可以在 WebConfiguration.java 中, 排除 /login)
        if (url.contains("login")) {
            return true;
        }

        String jwt = req.getHeader("token");

        // 如果令牌为 "" 或 null, 提示错误
        if (!StringUtils.hasLength(jwt)) {
            String result = JSONObject.toJSONString(Result.failure("not login"));
            resp.getWriter().write(result);
            return false;
        }

        // 解析 token, 如果出现异常, 提示错误
        try {
            JwtUtils.parseJWT(jwt);
        } catch (Exception e) {
            e.printStackTrace();
            String result = JSONObject.toJSONString(Result.failure("not login"));
            resp.getWriter().write(result);
            return false;
        }

        return true;
    }
}
```

# Static Resource

static resource dir

- `classpath:/META-INF/resources/**`
- `classpath:/resources/**`
- `classpath:/static/**`
- `classpath:/public/**`

enable static resource mapping

```properties
spring.web.resources.add-mappings=true
```

set static resource dir

```properties
spring.web.resources.static-locations=classpath:/test1/,classpath:/test2/,classpath:/test3
```

# Static Resource Handler

WebMvcConfigurer.java 配置 SpringMVC 处理所有的请求, 所以 SpringMVC 也会处理 Static Resource 的请求, 导致无法访问 Static Resource

配置 SpringMVC 排除 Static Resource 的请求

```java
@Configuration
public class WebMvcConfiguration implements WebMvcConfigurer {
    // configure resource
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 请求 /page/**, 就访问 resource/page/**
        registry.addResourceHandler("/page/**").addResourceLocations("/page/");
        registry.addResourceHandler("/js/**").addResourceLocations("/js/");
        registry.addResourceHandler("/css/**").addResourceLocations("/css/");
    }
}
```

# Cache

```properties
# cache 保存 3600s (简略设置)
spring.web.resources.cache.period=3600

# cache 保存 7200s (详细设置, 会覆盖简略设置)
spring.web.resources.cache.cachecontrol.max-age=7200

# server 和 browser 对比 resource 的 last modified time, 如果相同, 返回 status code 304, browser 直接使用 cache
spring.web.resources.cache.use-last-modified=true

# public cache
spring.web.resources.cache.cachecontrol.cache-public=true
```

# Request Path Prefix

```properties
# 请求 /demo/**, 访问 project
server.servlet.context-path=/demo

# 请求 /static/**, 访问 static resource dir (def. /**)
spring.mvc.static-path-pattern=/static/**

# 请求 /wj/**, 访问 classpath:/META-INF/resources/webjars/** (def. /webjars/**)
spring.mvc.webjars-path-pattern=/wj/**
```

# Path Matcher

通过 Path Matcher 匹配 req path

```java
@RequestMapping("/user/**")
```

配置 Path Matcher (def. PathPatternParser)

```properties
spring.mvc.pathmatch.matching-strategy=ant_path_matcher
```

# Web Server

SpringBoot 通过 ServletWebServerFactoryAutoConfiguration, EmbededWebServerFactoryCustomizerAutoConfiguration 配置 Web Server

ServletWebServerFactoryAutoConfiguration 导入了 EmbededTomcat, EmbededJetty, EmbededUndertow 配置 ServletWebServerFactory Bean

- 默认导入了 Tomcat 的 Dependency, 可以通过 EmbededTomcat 配置 TomcatServletWebServerFactory Bean, 其他的 Web Server 需要导入相应的 Dependency

IOC 启动时, 调用 onRefreash(), 通过 ServletWebServerFactory 创建 Web Server (eg. 通过 TomcatServletWebServerFactoryBean 创建 Tomcat)

配置一个 custom ServletWebFactory, 禁用 default ServletWebFactory, 即可部署 custom Web Server

# ProblemDetails

application.properties, 开启 ProblemDetails

```properties
# enable ProblemDetails (def. false)
spring.mvc.problemdetails.enabled=true
```

ProblemDetails 可以处理的 Exception

```java
@ExceptionHandler({
    HttpRequestMethodNotSupportedException.class,
    HttpMediaTypeNotSupportedException.class,
    HttpMediaTypeNotAcceptableException.class,
    MissingPathVariableException.class,
    MissingServletRequestParameterException.class,
    MissingServletRequestPartException.class,
    ServletRequestBindingException.class,
    MethodArgumentNotValidException.class,
    NoHandlerFoundException.class,
    AsyncRequestTimeoutException.class,
    ErrorResponseException.class,
    ConversionNotSupportedException.class,
    TypeMismatchException.class,
    HttpMessageNotReadableException.class,
    HttpMessageNotWritableException.class,
    BindException.class
})
```

不开启 ProblemDetails 时, 通过 Content-Type: application/json 返回 JSON 的 Model Obj

```json
{
    "timestamp": "2023-04-18T11:13:05.515+00:00",
    "status": 405,
    "error": "Method Not Allowed",
    "trace": "org.springframework.web...",
    "message": "Method 'POST' is not supported.",
    "path": "/list"
}
```

开启 ProblemDetails 后, 通过 Content-Type: application/problem+json 返回 ProblemDetails 的 Model Obj

```json
{
    "type": "about:blank",
    "title": "Method Not Allowed",
    "status": 405,
    "detail": "Method 'POST' is not supported.",
    "instance": "/list"
}
```

# RouterFunction

RouterConfiguration.java, 配置 Router

```java
@Configuration
public class RouterConfiguration {
    @Bean
    public RouterFunction<ServerResponse> userRouter(UserController userController) {
        return RouterFunctions.route()
                // req path 为 /users, 通过 ref method 代替 Lambda 实现 HandlerFunction 的 handle()
                .GET("/users", userController::getUserList)
                // 接收所有的 MediaType
                .POST("/users/{id}", RequestPredicates.accept(MediaType.ALL), userController::save)
                // 接收 JSON MediaType
                .PUT("/users/{id}", RequestPredicates.accept(MediaType.JSON), userController::updateById)
                .DELETE("/users/{id}", userController::deleteById)
                .build();
    }
}
```

UserController.java

```java
@RestController
public class UserController {
    public ServerResponse getUserList(ServerRequest req) {
        List<User> list = new ArrayList<>();
        list.add(new User());
        list.add(new User());
        // 通过 HttpMessageConverter 将 List 转成 JSON, 通过 resp body 返回 JSON, 相当于 @ResponseBody
        return ServerResponse.ok().body(list);
    }

    public ServerResponse save(ServerRequest req) throws ServletException, IOException {
        // 获取 path param
        String id = req.pathVariable("id");
        // 获取 req body param, 自动将 JSON 封装成 Domain
        User user = req.body(User.class);
        // 通过 resp body 返回 String, 返回 200 status code
        return ServerResponse.ok().body("success");
    }

    public ServerResponse updateById(ServerRequest req) {
        return ServerResponse.ok().build();
    }

    public ServerResponse deleteById(ServerRequest req) {
        return ServerResponse.ok().build();
    }
}
```

# CORS

```java
@Bean
public CorsFilter corsFilter() {
    CorsConfiguration corsConfiguration = new CorsConfiguration();
    corsConfiguration.addAllowedMethod("*");
    corsConfiguration.addAllowedOriginPattern("*");
    corsConfiguration.addAllowedHeader("*");
    corsConfiguration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
    urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);
    return new CorsFilter(urlBasedCorsConfigurationSource);
}
```

```java
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
```

# Result Entity

Result.java, 统一响应结果

```java
public class Result {
    // 执行结果 (0: failure; 1: success)
    private Integer code;
    // 提示信息
    private String msg;
    // 数据
    private Object data;

    public static Result success() {
        return new Result(1, "success", null);
    }

    public static Result success(String msg, Object data) {
        return new Result(1, msg, data);
    }

    public static Result failure() {
        return new Result(0, "failure", null);
    }

    public static Result failure(String msg, Object data) {
        return new Result(0, "failure", data);
    }
    
    public Result() {
    }

    public Result(Integer code, String msg, Object data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    // getter(), setter(), toString()
}
```

响应 Result Obj

```java
@RequestMapping("/show")
public Result show() {
    return Result.success();
}

@RequestMapping("/show")
public Result show() {
    return Result.success("show success", new User("sun", 18));
}
```

resp body

```json
{
    "code": 1,
    "msg": "show success",
    "data": {
        "name": "sun",
        "age": 18
    }
}
```

# Code Constant

Code.java, 配置 static code

```java
public class Code {
    public static final Integer SELECT_SUCCESS = 20011;
    public static final Integer SELECT_FAILURE = 20010;
    public static final Integer INSERT_SUCCESS = 20021;
    public static final Integer INSERT_FAILURE = 20020;
    public static final Integer UPDATE_SUCCESS = 20031;
    public static final Integer UPDATE_FAILURE = 20030;
    public static final Integer DELETE_SUCCESS = 20041;
    public static final Integer DELETE_FAILURE = 20040;

    public static final Integer SYSTEM_EXCEPTION = 50001;
    public static final Integer SYSTEM_TIMEOUT_EXCEPTION = 50002;
    public static final Integer BUSINESS_EXCEPTION = 60001;
}
```

使用 static code

```java
Result.success(Code.SELECT_SUCCESS, "select success");
```

# Thread Pool

SpringBoot 提供了一个 Thread Pool 供我们使用

```java
@Autowired
private ThreadPoolTaskExecutor threadPoolTaskExecutor;
```

```java
threadPoolTaskExecutor.execute(() -> {
    System.out.println("hello world");
});
```

# JsonFormat

```java
@Data
public class User{
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;
}
```

# Jackson

配置 Jackson

```properties
spring.jackson.time-zone=GMT+8
spring.jackson.date-format=yyyy-MM-dd HH:mm:ss
```
