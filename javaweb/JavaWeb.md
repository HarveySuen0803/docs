# JavaWeb

Web: 互联网中的网站

JavaWeb 通过 Java 解决 Web 问题

## B/S

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508270.png)

B/S (Borwser/Server): 客户端通过浏览器和服务端进行通讯, 程序逻辑和数据都存储在服务端中

- B/S 的优点: 易于维护, 服务端更新后, 客户端不需要任何部署

## Web resource

静态资源: 负责页面展示

- 比如: HTML, CSS, JavaScript, Image, Icon

动态资源: 负责页面逻辑

- 比如: Servlet, JSP

## create web project

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202305191727570.png)

## project structure

```
MavenProject/
├── pom.xml
└── src
    └── main
        ├── java
        ├── resources
        └── webapp
            ├── WEB-INF
            │   └── web.xml
            └── index.jsp
```

# MVC

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202305191715907.png)

Controller: 处理请求, 响应数据, 调用业务

Service: 处理业务

Mapper, Dao: 处理数据

# Sevlet

Servlet 属于 JavaEE 规范, 用于 dynamic Web development

- 服务单接受请求后, 会解析请求, 生成对应的 Servlet 对象 进行处理

Inheritance

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508310.png)

pom.xml, 配置 JDK 版本

```xml
<properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
</properties>
```

pom.xml, 配置依赖

```xml
<!-- servlet, tomcat 10 需要是 jarkarta.servlet-api -->
<dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    <version>5.0.0</version>
    <!-- 必须是 provided -->
    <scope>provided</scope>
</dependency>
```

Test.java

```java
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;

// urlPatterns 设置访问路径, 通过 https://localhost:8080/servletDemo 访问
// loadOnStartup 设置启创建 Servlet 对象 的时机, < 0, 首次访问时创建, >= 0, 服务端启动时创建 (数值越小, 优先级越高)
@WebServlet(urlPatterns = "/servletDemo", loadOnStartup = 1)
public class ServletDemo implements Servlet {
    ServletConfig servletConfig = null;
    
    // 初始化时调用, 创建 Servlet 对象 时调用
    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        // 初始化 ServletConfig 对象
        this.servletConfig = servletConfig;
        System.out.println("init()");
    }

    // 返回 ServletConfig 对象
    @Override
    public ServletConfig getServletConfig() {
        return servletConfig;
    }

    // 首次访问时调用
    @Override
    public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {
        // 输出到服务端终端, 而不是客户端终端
        System.out.println("hello world");
    }

    // 返回 Servlet 信息 (比如: 作者, 版本, 版权)
    @Override
    public String getServletInfo() {
        return null;
    }

    // 销毁时调用
    @Override
    public void destroy() {
        System.out.println("destroy()");
    }
}
```

## Servlet path

```java
// 单个 param, 可以省略 attr
@WebServlet("/demo")

// 多个 param, 需要添加 attr
@WebServlet(value = "/demo")

// value 和 urlPatterns 效果相同, urlPatterns 语义化更强
@WebServlet(urlPatterns = "/demo")

// /demo1 和 /demo2 都可以访问
@WebServlet(urlPatterns = {"/demo1", "/demo2"})

@WebServlet("/user/sun")

@WebServlet("/user/*")

// 是 \*.txt, 不是 /\*.txt, "\*" 中包含了 "/"
@WebServlet("*.txt")
```

## default path

tomcat 默认有一个 Servlet 的访问路径是 /, 一般用于做默认处理, 如果没有匹配到 Servlet, 就会走 /

手动设置 / 或 /\* 会覆盖默认的 /, 一般不使用

/\* 的优先级 > / 的优先级

- 比如: http://localhost/demo 访问 /\*

## lifecycle

实例化 对象: 首次访问 Servlet 时, Tomcat 实例化 Servlet 对象 (可以通过 loadOnStartup 修改创建时机)

初始化 对象: 实例化 Servlet 对象 后, 调用 init() 初始化 Servlet 对象 

服务处理: 接收到 client 请求时, 调用 service() 处理请求

服务终止: 关闭 Tomcat 时, 调用 destory() 释放资源, 垃圾回收机制会回收 Servlet 对象

## XML configuration

webapp/WEB-INF/web.xml, 配置 Servlet 访问路径, 代替 @WebServlet()

```xml
<web-app>
    <display-name>Archetype Created Web Application</display-name>
    
    <!-- com.harvey.ServletDemo 命名为 servletDemo -->
    <servlet>
        <servlet-name>servletDemo</servlet-name>
        <servlet-class>com.harvey.ServletDemo</servlet-class>
    </servlet>
    
    <!-- 指定 servletDemo 的访问路径为 /servletDemo -->
    <servlet-mapping>
        <servlet-name>servletDemo</servlet-name>
        <url-pattern>/servletDemo</url-pattern>
    </servlet-mapping>
</web-app>
```

ServletDemo.java, 不需要 @WebServlet() 了

```java
public class ServletDemo implements Servlet {}
```

## HttpServlet

HttpServlet 实现了 Servlet, 继承 HttpServlet 可以按需重写方法, 不需要再一次实现 5 个方法了

```java
@WebSevlet("/httpServletDemo")
public class HttpServletDemo extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("service()");
    }

    @Override
    public void destroy() {
        System.out.println("destroy()");
    }

    @Override
    public void init() throws ServletException {
        System.out.println("init()");
    }
}
```

### request protocol

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    System.out.println("doGet()");
}

@Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    System.out.println("doPost()");
}
```

### imitate HttpSevlet

```java
public class MyHttpServlet implements Servlet {
    @Override
    public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {
        HttpServletRequest req = (HttpServletRequest) servletRequest;
        HttpServletResponse resp = (HttpServletResponse) servletResponse;
        if (req.getMethod().equals("GET")) {
            doGet(req, resp);
        } else if (req.getMethod().equals("POST")) {
            doPost(req, resp);
        } else if (req.getMethod().equals("DELETE")) {
            doDelete(req, resp);
        }
    }
    
    protected void doGet(HttpServletRequest req, HttpServletResponse res) {}
    protected void doPost(HttpServletRequest req, HttpServletResponse res) {}
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) {}

    @Override
    public ServletConfig getServletConfig() {
        return null;
    }
    
    @Override
    public void init(ServletConfig servletConfig) throws ServletException {}

    @Override
    public String getServletInfo() {
        return null;
    }

    @Override
    public void destroy() {

    }
}
```

```java
@WebServlet("httpServletDemo")
public class HttpServletDemo extends MyHttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        System.out.println("doGet()");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        System.out.println("doPost()");
    }
}
```

## request

Inheritance

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508312.png)

Web 服务器 解析 HTTP 请求, 封装到 RequestFacade 对象 中

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    System.out.println(req); // org.apache.catalina.connector.RequestFacade@15ff0690
}
```

### get request info

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    // 返回请求方法
    String method = req.getMethod(); // GET

    // 返回项目路径, tomcat 配置的 path
    String contextPath = req.getContextPath(); // /web-demo

    // 返回 URL
    StringBuffer requestURL = req.getRequestURL(); // http://localhost/web-demo/servletDemo

    // 返回 URI
    String requestURI = req.getRequestURI(); // /web-demo/servletDemo

    // 返回 GET param
    String queryString = req.getQueryString(); // username=sun&password=123

    // 返回 请求头 User-Agent 的值
    String header = req.getHeader("User-Agent"); // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ...
}

@Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    // 返回字符输入流, 读取请求体
    BufferedReader br = req.getReader();
    System.out.println(br.readLine()); // username=sun&password=123

    // 返回字节输入流, 读取请求体
    ServletInputStream is = req.getInputStream();
    int readData = 0;
    while ((readData = is.read()) != -1) {
        System.out.print((char) readData); // username=sun&password=123
    }
}
```

### get request param

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    /*
        getParameterMap() 获取参数,返回一个Map集合
        比如: http://localhost/web-demo/demo?username=sun&password=111&username=xue&password=222&username=cheng&password=333&sex=male
            // 将username,password,sex的值封装到数组里,username,password,sex作为key
            username: sun, xue, cheng
            password: 111, 222, 333
            sex: male
     */
    
    // 将参数封装到 Map 中, 返回 Map
    Map<String, String[]> parameterMap = req.getParameterMap();
    String[] usernames = parameterMap.get("username"); // [sun, xue, cheng]
    String[] passwords = parameterMap.get("password"); // [111, 222, 333]

    // 根据 key 返回 value 数组
    String[] usernames = req.getParameterValues("username"); // [sun, xue, cheng]

    // 根据 key 返回 value, 如果有多个 value, 就返回第一个
    String username = req.getParameter("username"); // sun
}

@Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    this.doGet(req, resp);
}
```

### POST encoding

POST 通过输入流来读取请求体参数, 设置编码格式可以解决乱码

```java
@Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    // 设置编码格式
    req.setCharacterEncoding("UTF-8");
    String username = req.getParameter("username");
}
```

### GET encoding

GET 通过 getQueryString() 获取参数, 并没有通过输入流读取, 所以设置编码格式不能解决乱码

客户端通过 UTF-8 编码, 服务端通过 ISO-8859-1 解码, 就会导致乱码

```java
String username = "孙学成";
String encode = URLEncoder.encode(username, StandardCharsets.UTF_8); // %E5%AD%99%E5%AD%A6%E6%88%90
String decode = URLDecoder.decode(encode, StandardCharsets.ISO_8859_1); // å- å-¦æ
```

乱码通过 ISO-8895-1 解码, 再通过 UTF-8 编码, 就可以解决乱码

```java
String username = "å\u00AD\u0099å\u00AD¦æ";
String encode = URLEncoder.encode(username, StandardCharsets.ISO_8859_1); // %E5%AD%99%E5%AD%A6%E6%88%90
String decode = URLDecoder.decode(encode, StandardCharsets.UTF_8); // 孙学成
```

乱码通过 ISO-8895-1 解码, 转成字节数据, 再通过 UTF-8 编码 转成字符串

```java
String username = "å\u00AD\u0099å\u00AD¦æ";
byte[] bytes = username.getBytes(StandardCharsets.ISO_8859_1); // [-27, -83, -103, -27, -83, -90, -26]
username = new String(bytes, StandardCharsets.UTF_8); // 孙学成
```

这个方法, GET 和 POST 通用

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    String username = req.getParameter("username");
    username = new String(username.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
}
```

### dispatcher

转发请求: 服务端代替客户端发送请求, 得到响应后, 再将结果返回给客户端

- URL 不会变
- 可以共享资源

```java
@WebServlet("/demo1")
public class Demo1 extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 存储属性
        req.setAttribute("name", "sun");
        // 转发请求到 /demo2 (服务端使用, 不需要项目路径), 携带 req, resp
        req.getRequestDispatcher("/demo2").forward(req, resp);
    }
}
```

```java
@WebServlet("/demo2")
public class Demo2 extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 访问属性
        object name = req.getAttribute("name");
        // 删除属性
        req.removeAttribute("name");
    }
}
```

## resposne

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    // 设置响应状态码
    resp.setStatus(302);
    // 设置响应头
    resp.setHeader("Location", "web-demo/demo1");
}
```

### response character data

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    PrintWriter pr = resp.getWriter();
    pr.write("hello world");
    pr.write("<h1>hello world</h1>");
}
```

### response byte data

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    ServletOutputStream os = resp.getOutputStream();
    os.write("hello world".getBytes());
}
```

### messy code

设置编码, 解决乱码

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    resp.setHeader("content-type", "text/html; charset=utf-8");
    PrintWriter pr = resp.getWriter();
    pr.write("你好");
}
```

简写

```java
resp.setContentType("text/html; charset=utf-8");
```

### redirect

重定向: 服务端通知客户端重新请求另一个地址

- URL 会变
- 不可以共享资源

```java
@WebServlet("/demo1")
public class Demo1 extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 重定向到 /web-demo/demo2 (客户端使用, 不需要项目路径)
        resp.sendRedirect("/web-demo/demo2");
    }
}
```

动态获取路径

```java
String contextPath = req.getContextPath();
resp.sendRedirect(contextPath + "/demo2");
```

# Cookie

响应 Cookie

```java
Cookie cookie = new Cookie("name", "sun");

// > 0, 写入硬盘, 持久化存储
// < 0 (默认), 写入内存, 关闭会话自动销毁
// 0, 删除
cookie.setMaxAge(60 * 60 * 24 * 7);

resp.addCookie(cookie);
```

获取 Cookie

```java
Cookie[] cookies = req.getCookies();

for (Cookie cookie : cookies) {
    // Cookie 的 key
    String key = cookie.getName();
    // Cookie 的 value
    String value = cookie.getValue();
}
```

## encoding

```java
String value = URLEncoder.encode("孙学成", StandardCharsets.UTF_8); // %E5%AD%99%E5%AD%A6%E6%88%90
Cookie cookie = new Cookie("name", value);
```

## decoding

```java
Cookie[] cookies = req.getCookies();
for (Cookie cookie : cookies) {
    String value = URLDecoder.decode(cookie.getValue(), StandardCharsets.UTF_8);
}
```

# Session

响应 Session

```java
HttpSession session = req.getSession();
session.setAttribute("name", "sun");
```

获取 Session

```java
HttpSession session = req.getSession();
object name = session.getAttribute("name");
```

## passivation

钝化: 服务端关闭后, Web 服务器 将内存中的 Session 写入硬盘的 SESSIONS.ser

## activation

活化: 服务端启动后, Web 服务器 读取 SESSIONS.ser, 加载 Session 到内存, 同时删除 SESSIONS.ser

## destory

```java
HttpSession session = req.getSession();
session.invalidate();
// 销毁后, 就不可以访问了
session.getAttribute("name"); // error
```

## auto destory

webapp/WEB-INF/web.xml, 配置自动销毁间隔时长

```xml
<web-app>
    <!-- 设置 100 分钟自动销毁, 默认为 30 分钟 -->
    <session-config>
        <session-timeout>100</session-timeout>
    </session-config>
</web-app>
```

# Filter

filter/FilterDemo.java, 拦截请求, 做通用操作

```java
// 设置拦截路径 (不需要项目路径, 自动拦截 /web-demo/demo)
@WebFilter("/demo")
public class FilterDemo implements Filter {
    // 初始化前调用
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Filter.super.init(filterConfig);
    }

    // 访问前调用
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        System.out.println("...");

        filterChain.doFilter(servletRequest, servletResponse);

        System.out.println("...");
    }

    // 销毁前调用
    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}
```

## Filter path

```java
@WebFilter("/index.jsp")
@WebFilter("/user/*")
@WebFilter("*.jsp")
@WebFilter("/*")
```

## Filter priority

一个请求可以匹配多个拦截器, 先执行拦截路径优先级高的

拦截路径优先级相同, 按类名的自然排序拦截

- 比如: AFilter 比 BFilter 高, 就先执行 AFilter

AFilter.java


```java
@WebFilter("/demo")
public class AFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        System.out.println("AFilter before discharge");

        filterChain.doFilter(servletRequest, servletResponse);

        System.out.println("AFilter after discharge");
    }
}
```

BFilter.java

```java
@WebFilter("/demo")
public class BFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        System.out.println("BFilter before discharge");

        filterChain.doFilter(servletRequest, servletResponse);

        System.out.println("BFilter after discharge");
    }
}
```

Demo.java

```java
@WebServlet("/demo")
public class Demo extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("demo");
    }
}
```

log

```
AFilter before discharge
BFilter before discharge
demo
BFilter after discharge
AFilter after discharge
```

# Listener

Listener: 可以监听 application, session, request

常见的 Lisntener

- ServletContextListener 监听 ServletContext 对象 的 创建, 销毁
- ServletContextAttributeListener 监听 ServletContext 对象 的 属性
- HttpSessionListener 监听 Session 对象 的 创建, 销毁
- HttpSessionAttributeListener 监听 Session 对象 的 属性
- HttpSessionBindingListener 监听 Session 对象 的 绑定, 解绑
- HttpSessionActivationListener 监听 Session 对象 的 钝化, 活化
- ServletRequestListener 监听 Request 对象 的 创建, 销毁
- ServletRequestAttributeListener 监听 Request 对象 的 属性

listener/ListenerDemo.java

```java
@WebListener
public class ListenerDemo implements ServletContextListener {
    // 初始化资源
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("...");
    }

    // 销毁资源
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("...");
    }
}
```

# AJAX

前端发送请求, 接受响应

```js
let xhr = new XMLHttpRequest();
xhr.open("GET", "http://localhost:8080/web-demo/demo");
xhr.send();
xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
        console.log(xhr.response);
    }
}
```

后端接受请求, 响应结果

```java
@WebServlet("/demo")
public class Demo extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().write("hello world");
    }
}
```

# Axios

前端发送请求, 接受响应

```js
axios({
    method: "get",
    url: "http://localhost:8080/web-demo/demo"
}).then(() => {
    console.log(resp.data);
})
```

后端接受请求, 响应结果

```java
@WebServlet("/demo")
public class Demo extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().write("hello world");
    }
}
```

# JSON

pom.xml

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>2.0.25</version>
</dependency>
```

后端响应 JSON 数据

```java
String json = JSON.toJSONString(new User("sun", 18));
resp.setContentType("application/json");
resp.setCharacterEncoding("UTF-8");
resp.getWriter().write(json);
```

前端接受 JSON 数据

```js
axios({
    method: "get",
    url: "http://localhost:8080/web-demo/demo"
}).then(() => {
    let data = resp.data;
    console.log(data); // {age: 18, name: 'sun'}
    console.log(data.name); // sun
    console.log(data.age); // 18
})
```

## JSON transition

```java
// object to JSON
String json = JSON.toJSONString(new User("sun", 18));

// JSON to object
User user = JSON.parseobject(json, User.class);
```

# Vue

前端发送 AJAX 请求, 接受响应, 通过 Vue 封装数据, 展示数据

```html
<div id="app">
    <ul>
        <li v-for="(user, index) in userList" :key="index">
            <p>{{user.name}}</p>
            <p>{{user.age}}</p>
            <p>{{user.sex}}</p>
        </li>
    </ul>
</div>

<script src="https://cdn.jsdelivr.net/npm/axios@1.1.2/dist/axios.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<script>
    new Vue({
        el: "#app",
        data() {
            return {
                userList: []
            }
        },
        mounted() {
            axios({
                method: "get",
                url: "http://localhost:8080/web-demo/demo"
            }).then((resp) => {
                console.log("resp", resp);
                this.userList = resp.data;
            })
            console.log("userList", this.userList);
        }
    })
</script>
```

后端接受请求, 响应数据

```java
@WebServlet("/demo")
public class Demo extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        List<User> list = new ArrayList<>();
        list.add(new User("sun", 18, "F"));
        list.add(new User("xue", 20, "M"));
        list.add(new User("cheng", 22, "F"));
        String listJson = JSON.toJSONString(list);

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(listJson);
    }
}
```

# Exercise

## sign in verification

LoginFilter.java

```java
@WebFilter("/*")
public class LoginFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) servletRequest;
        String requestUrl = req.getRequestURL().toString();
        // 排除登录注册的业务
        String[] urls = {"/css/", "/img/", "login.jsp", "loginServlet", "registerServlet"};
        for (String url : urls) {
            if (requestUrl.contains(url)) {
                filterChain.doFilter(servletRequest, servletResponse);
                return;
            }
        }
        HttpSession session = req.getSession();
        object user = session.getAttribute("user");
        System.out.println(user);
        // Session 中有 user 就放行, 没有转发请求到 /login
        if (user != null) {
            filterChain.doFilter(servletRequest, servletResponse);
        } else {
            servletRequest.setAttribute("login_msg", "not logged in");
            servletRequest.getRequestDispatcher("/login").forward(servletRequest, servletResponse);
        }
    }
}
```

## username verification

index.html

```html
<form action="http://localhost:8080/web-demo/demo">
    username: <input type="text" name="username" id="username"> <br>
    username_msg: <span id="username_msg"></span> <br>
    <input type="submit" value="submit">
</form>

<script>
    document.querySelector("#username").addEventListener("blur", function () {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "http://localhost:8080/web-demo/demo?username=" + this.value);
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                if (xhr.response == "true") {
                    document.querySelector("#username_msg").innerText = "success";
                } else {
                    document.querySelector("#username_msg").innerText = "failure";
                }
            }
        }
    })
</script>
```

Demo.java

```java
@WebServlet("/demo")
public class Demo extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        boolean flag = true;
        String username = req.getParameter("username");

        // 验证用户名, 检查是否重复, 是否符合规范
        if (username == null || username.equals("")) {
            flag = false;
        }

        resp.getWriter().write(flag + "");
    }
}
```

