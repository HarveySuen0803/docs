# Basic

Authentication 是判断一个用户是否为合法用户的处理过程 (eg: 输入 username 和 password 判断 user 是否合法)

Authorization 是访问控制, 控制哪些用户可以访问哪些资源, 一般完成 Authentication 后, 就需要进行 Authorization 赋予一定权限

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031744401.png)

SpringBoot 需要导入的 Dependency

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

SpringCloud 需要导入的 Dependency, 除了包含 Spring Security 的所有功能外, 还提供了对 Spring Cloud 相关组件（eg: Zuul, Gateway）的安全控制, 以及对 OAuth2 的支持

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-cloud-starter-security</artifactId>
</dependency>
```

Spring 项目需要添加 @EnableWebSecurity 允许 Spring Security 的自定义配置, 而 SpringBoot 默认开启, 所以可以省略这一项配置

```java
@EnableWebSecurity
```

配置 username 和 password

```properties
spring.security.user.name=admin
spring.security.user.password=111
```

请求 /login (POST) 进行登陆, 此时所有的请求都会被 SpringSecurity 的 Fileter 拦截转发到这

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811799.png)

请求 /logout (POST) 进行登出

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811800.png)

# Architecture

SpringSecurity 的 Authentication 和 Authorization 不是通过 JavaWeb 原生的 Filter 实现的, 而是嵌入一个 DelegatingFilterProxy 到 JavaWeb 的原生的 Filter 中. 由 DelegatingFilterProxy 管理 FilterChainProxy, FilterChainProxy 再管理多个 SecurityFilterChain

SpringBoot 通过 DelegatingFilterProxyRegistrationBean 注册 springSecurityFilterChain, 生成 DelegatingFilterProxy 并注册到 IOC

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031744402.png)

SecurityContextHolder 存储当前用户的安全上下文, 通常是一个 ThreadLocal, 包含了 SecurityContext

SecurityContext 存储了当前请求所属用户的相关信息 (eg: Authentication Obj)

Authentication 表示用户身份信息

AuthenticationManager 负责验证 Authentication Obj, 通常包含一个或多个 AuthenticationProvider Obj

AuthenticationProvider 提供了 authenticate() 可以根据传入的 Authentication Obj 进行认证, SpringSecurity 自带多个 AuthenticationProvider Obj (eg: DaoAuthenticationProvider)

ProviderManager 实现了 AuthenticationManager, 默认的认证管理器, 包含一组 AuthenticationProvider, 并尝试使用其中一个来验证 Authentication Obj

UserDetailsService 提供了 loadUserByUsername() 用于从数据库或其他存储中加载用户信息

GrantedAuthority 表示用户被授予的权限, Authentication Obj 通常包含一组 GrantedAuthority

AccessDecisionManager 负责决定是否允许或拒绝用户对资源的访问

FilterChainProxy 是一个特殊的过滤器, 包含一个或多个 FilterChain, 每个 FilterChain 包含了一组过滤器, 这些过滤器负责执行不同的安全性任务 (eg: Authentication, Authorization)

SecurityConfigurerAdapter 用于自定义安全性配置

WebSecurityConfigurerAdapter 用于自定义 Web App 的安全性配置

# DefaultSecurityFilterChain

DefaultSecurityFilterChain 是 Spring Security 中默认的过滤器链, 用于处理安全性相关的任务, 它包含了一系列的过滤器, 每个过滤器负责不同的安全性功能

- DisableEncodeUrlFilter 可以阻止 SpringSecurity 对 URL 进行自动编码, 在某些情况下, 用户可能希望 URL 保持原始状态
- WebAsyncManagerIntegrationFilter 用于集成 WebAsyncManager, 它在处理异步请求时起着重要的作用, 并确保在异步处理过程中正确地管理安全上下文
- SecurityContextHolderFilter 存储 SecurityContext 到 SecurityContextHolder
- HeaderWriterFilter 向当前请求添加了一些 HTTP Header, 这对启用浏览器保护的某些头部信息的添加非常有用 (eg: X-Frame-Options, X-XSS-Protection, X-Content-Type-Options)
- CorsFilter 处理跨域资源共享
- CsrfFilter 提供跨站请求伪造保护
- LogoutFilter 处理用户登出操作
- UsernamePasswordAuthenticationFilter 处理基于用户名密码的身份验证, 当用户提交他们的用户名和密码时, 创建一个 UsernamePasswordAuthenticationToken, 然后传递到 AuthenticationManager 进行认证
- DefaultLoginPageGeneratingFilter 主要负责生成默认的登录页面, 如果请求 URL 是 /login, 它会直接生成一个登录页面
- DefaultLogoutPageGeneratingFilter 主要负责生成默认的登出页面, 如果请求 URL 是 /logout, 它会直接生成一个确认等出页面
- BasicAuthenticationFilter 用于处理 HTTP 基本身份验证, 当用户提交他们的用户名和密码时, 从 HTTP Header 中提取 Token, 创建一个 UsernamePasswordAuthenticationToken, 然后传递到 AuthenticationManager 进行认证
- RequestCacheAwareFilter 将原始的请求信息保存到请求缓存中, 这样用户完成身份验证后就可以获取到这些原始请求信息, 在某些情况下, 用户可能需要通过重定向重新进行身份验证, 这个过滤器可以确保用户在重新认证后能够返回到原始请求
- SecurityContextHolderAwareRequestFilter 包装请求以确保它在后续处理中能够访问 SecurityContext
- AnonymousAuthenticationFilter 为匿名用户创建一个匿名的身份认证, 创建一个 anonymousUser, 并赋予 ROLE_ANONYMOUS
- ExceptionTranslationFilter 负责处理 Spring Security 认证和授权过程中的 AccessDeniedException 和 AuthenticationException, 可以将异常转换为适当的 HTTP Rep, 以便客户端能够正确地处理认证和授权错误
- AuthorizationFilter 从 SecurityContext 获取当前的 Authentication, 并将其传递给 AuthorizationManager
- FilterSecurityInterceptor 负责基于访问控制决策的访问控制, 是 Spring Security 授权的核心, 根据配置的访问控制规则对请求进行访问决策

# SecurityFilterChain

SecurityFilterChain 可以管理过滤器链中的过滤器

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
    // Enable authentication with custom
    httpSecurity.authorizeHttpRequests((authorize) -> {
        authorize.requestMatchers("/login", "/registry", "/home/**").permitAll()
                .anyRequest().authenticated();
    });

    // Enable login page with custom
    httpSecurity.formLogin((formLogin) -> {
        formLogin.loginProcessingUrl("/login")
                 .defaultSuccessUrl("/index");
    });

    // Disable csrf to allow any request method to access server
    httpSecurity.csrf((csrf) -> csrf.disable());
    
    // Set cors with defaults, default to disable cors
    httpSecurity.cors(Customizer.withDefaults());

    return httpSecurity.build();
}
```

# Authentication

User 认证后, 会将 User 的 Username, Password, Authority 分别封装到 Authentication 的 Principal, Credentials, Authorities 中, 再将 Authentication 存储到 SecurityContext 中


![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401041101964.png)

SpringSecurity 通过SecurityContextHolder 将 Authentication Obj 存储在一个 ﻿ThreadLocal Obj 中，这样在一个线程内的任何地方, 都可以通过﻿ SecurityContextHolder 获取到当前用户的信息.

```java
public class SecurityContextHolder {
    public static final String MODE_THREADLOCAL = "MODE_THREADLOCAL";
    private static String strategyName = System.getProperty("spring.security.strategy");
    public static final SecurityContextImpl emptyContext = new SecurityContextImpl();
 
    private static ThreadLocal<SecurityContext> contextHolder;

    public static void setContext(SecurityContext context) {
        contextHolder.set(context);
    }
 
    public static SecurityContext getContext() {
        return contextHolder.get();
   }
}
```

直接封装一个 Authentication 对象存储到 SecurityContext, 再将 SecurityContext 存储到 SecurityContextHolder 中, 就可以完成对一个 User 的认证

```java
SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
Authentication authentication = new TestingAuthenticationToken("username", "password", "ROLE_USER");
securityContext.setAuthentication(authentication);
SecurityContextHolder.setContext(securityContext);
```

通过 Authentication 获取用户信息

```java
SecurityContext securityContext = SecurityContextHolder.getContext();
Authentication authentication = securityContext.getAuthentication();
User user = (User) authentication.getPrincipal();
String password = (String) authentication.getCredentials();
Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
```

# Login Request

配置 Login Form

```js
let login = () => {
  let formData = {
    username: 'harvey',
    password: '111',
    remember: true
  }
  request.post('/login', formData).then(({data: {code, data}}) => {
    if (code != 200) {
      ElMessage({showClose: true, message: 'Fail to login', type: 'error'})
      return
    }
    router.push('/dashboard')
  })
}
```

配置 User Entity

```java
@Data
@TableName("t_user")
public class User implements UserDetails, Serializable {
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    @TableField("username")
    private String username;
    
    @TableField("password")
    private String password;
    
    @TableField("is_account_non_expired")
    private Integer isAccountNonExpired;
    
    @TableField("is_account_non_locked")
    private Integer isAccountNonLocked;
    
    @TableField("is_credentials_non_expired")
    private Integer isCredentialsNonExpired;
    
    @TableField("is_enabled")
    private Integer isEnabled;
    
    @TableField(exist = false)
    private List<String> authNameList;
    
    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return AuthorityUtils.createAuthorityList(authNameList);
    }
    
    @Override
    @JsonIgnore
    public String getPassword() {
        return password;
    }
    
    @Override
    @JsonIgnore
    public String getUsername() {
        return username;
    }
    
    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return isAccountNonExpired == 1;
    }
    
    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return isAccountNonLocked == 1;
    }
    
    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return isCredentialsNonExpired == 1;
    }
    
    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return isEnabled == 1;
    }
}
```

配置 SecurityFilterChain

```java
@Bean
public SecurityFilterChain securityFilterChain(
    HttpSecurity httpSecurity,
    AuthenticationManager authenticationManager,
    AuthenticationSuccessHandler authenticationSuccessHandler,
    AuthenticationFailureHandler authenticationFailureHandler
) throws Exception {
    httpSecurity.formLogin((formLogin) -> {
        formLogin.loginProcessingUrl("/login")
            .usernameParameter("username")
            .passwordParameter("password")
            .successHandler(authenticationSuccessHandler)
            .failureHandler(authenticationFailureHandler);
    });
    
    httpSecurity.authenticationManager(authenticationManager);
    
    httpSecurity.csrf(AbstractHttpConfigurer::disable);
    httpSecurity.cors(AbstractHttpConfigurer::disable);
    
    return httpSecurity.build();
}
```

配置 AuthenticationManager

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

@Bean
public UserDetailsService userDetailsService() {
    return (username) -> {
        User user = Db.lambdaQuery(User.class)
            .eq(User::getUsername, username)
            .one();
        if (user == null) {
            throw new UsernameNotFoundException("username is not found");
        }
        
        List<Auth> authList = Db.lambdaQuery(Auth.class)
            .eq(Auth::getUserId, user.getId())
            .list();
        
        user.setAuthNameList(authList.stream().map(Auth::getName).toList());
        
        return user;
    };
}

@Bean
public AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(userDetailsService);
    provider.setPasswordEncoder(passwordEncoder);
    return new ProviderManager(provider);
}
```

配置 AuthenticationSuccessHandler

```java
@Component
public class MyAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    @Autowired
    private RedisTemplate redisTemplate;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse rep, Authentication authentication) throws IOException {
        User user = (User) authentication.getPrincipal();

        User userDetails = new User();
        userDetails.setId(user.getId());
        userDetails.setUsername(user.getUsername());
        userDetails.setAuthNameList(user.getAuthNameList());

        // Create Jwt token
        HashMap<String, Object> jwtPayload = new HashMap<>();
        jwtPayload.put(JWTPayload.ISSUED_AT, DateTime.now());
        jwtPayload.put(JWTPayload.EXPIRES_AT, DateTime.now().offset(DateField.MONTH, 1));
        jwtPayload.put(JWTPayload.NOT_BEFORE, DateTime.now());
        jwtPayload.put("userDetails", JSONUtil.toJsonStr(userDetails));
        String token = JWTUtil.createToken(jwtPayload, "login_token.key".getBytes());

        // Store token to Redis
        redisTemplate.opsForValue().set("token:login::" + user.getId(), token, 30L, TimeUnit.DAYS);

        // Return token and userId to the front-end
        LoginVo loginVo = new LoginVo();
        loginVo.setToken(token);
        loginVo.setUserId(user.getId());

        try {
            response.setContentType("application/json;charset=utf-8");
            response.getWriter().write(JSONUtil.toJsonStr(Result.success(loginVo)));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```

配置 AuthenticationFailureHandler

```java
@Component
public class MyAuthenticationFailureHandler implements AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(HttpServletRequest req, HttpServletResponse rep, AuthenticationException exception) throws IOException, ServletException {
        try {
            rep.setContentType("application/json;charset=utf-8");
            rep.getWriter().write(JSONUtil.toJsonStr(Result.failure()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```

# Logout Request

配置 LogoutHandler 做退出登陆的业务逻辑

```java
@Component
public class MyLogoutHandler implements LogoutHandler {
    @Autowired
    RedisTemplate redisTemplate;
    
    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        JWT tokenJwt = JWT.of(request.getHeader(HttpHeader.AUTHORIZATION)).setKey(HttpConstant.LOGIN_TOKEN_KEY);
        
        // If the token is invalid or expired
        if (!tokenJwt.verify() || !tokenJwt.validate(0)) {
            ResponseUtil.write(response, Result.failure());
            return;
        }
        
        // Get user info from token
        User userDetails = JSONUtil.toBean(tokenJwt.getPayload("userDetails").toString(), User.class);
        
        redisTemplate.delete(RedisKey.LOGIN_TOKEN + "::" + userDetails.getId());
    }
}
```

配置 LogoutSuccessHandler 响应结果给前端

```java
@Component
public class MyLogoutSuccessHandler implements LogoutSuccessHandler {
    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        try {
            response.setContentType("application/json;charset=utf-8");
            response.getWriter().write(JSONUtil.toJsonStr(Result.success()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```

配置 SecurityFilterChain 注册 LogoutHandler 和 LogoutSuccessHandler

```java
httpSecurity.logout((logout) -> {
    logout.logoutUrl("/logout")
        .addLogoutHandler(myLogoutHandler)
        .logoutSuccessHandler(myLogoutSuccessHandler);
});
```

# JWT Token

配置 AuthenticationSuccessHandler 下发 Token

```java
@Component
public class MyAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    @Autowired
    private RedisTemplate redisTemplate;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse rep, Authentication authentication) throws IOException {
        User user = (User) authentication.getPrincipal();

        User userDetails = new User();
        userDetails.setId(user.getId());
        userDetails.setUsername(user.getUsername());
        userDetails.setAuthNameList(user.getAuthNameList());

        // Create Jwt token
        HashMap<String, Object> jwtPayload = new HashMap<>();
        jwtPayload.put(JWTPayload.ISSUED_AT, DateTime.now());
        jwtPayload.put(JWTPayload.EXPIRES_AT, DateTime.now().offset(DateField.MONTH, 1));
        jwtPayload.put(JWTPayload.NOT_BEFORE, DateTime.now());
        jwtPayload.put("userDetails", JSONUtil.toJsonStr(userDetails));
        String token = JWTUtil.createToken(jwtPayload, "login_token.key".getBytes());

        // Store token to Redis
        redisTemplate.opsForValue().set("token:login::" + user.getId(), token, 30L, TimeUnit.DAYS);

        // Return token and userId to the front-end
        LoginVo loginVo = new LoginVo();
        loginVo.setToken(token);
        loginVo.setUserId(user.getId());

        try {
            response.setContentType("application/json;charset=utf-8");
            response.getWriter().write(JSONUtil.toJsonStr(Result.success(loginVo)));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```

前端收到 Token 后, 保存到 LocalStroage 中

```js
request.post('/login', formData).then(({data: {code, data}}) => {
  if (code != 200) {
    ElMessage({showClose: true, message: 'Fail to login', type: 'error'})
    return
  }

  localStorage.removeItem(StorageConstant.LOGIN_TOKEN)
  localStorage.removeItem(StorageConstant.USER_ID)
  localStorage.removeItem(StorageConstant.USER_NAME)

  ElMessage({showClose: true, message: 'Success to login', type: 'success'})
  localStorage.setItem(StorageConstant.LOGIN_TOKEN, data.token)
  localStorage.setItem(StorageConstant.USER_ID, data.userId)
  localStorage.setItem(StorageConstant.USER_NAME, data.username)
  router.push('/')
})
```

前端携带 Token 请求后端

```java
axios.get('/some-endpoint', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem("token") || undefined}`,
  }
})
.then(rep => {
  console.log(rep.data);
})
.catch(error => {
  console.error(error);
});
```

配置 Token Fitler 校验 Token

```java
@Component
public class MyTokenFilter extends OncePerRequestFilter {
    @Autowired
    private RedisTemplate redisTemplate;
    @Autowired
    private ThreadPoolTaskExecutor threadPoolTaskExecutor;
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // If the request is login, then skip the filter
        String requestURI = request.getRequestURI();
        if (requestURI.equals(HttpUri.LOGIN)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // If the request is logout, then skip the filter
        String token = request.getHeader(HttpHeader.AUTHORIZATION);
        if (StrUtil.isBlank(token)) {
            ResponseUtil.write(response, Result.unauthorized());
            return;
        }
        
        // If the token is invalid or expired
        JWT tokenJwt = JWT.of(token).setKey(HttpConstant.LOGIN_TOKEN_KEY);
        if (!tokenJwt.verify() || !tokenJwt.validate(0)) {
            ResponseUtil.write(response, Result.unauthorized());
            return;
        }
        
        // Get user info from token
        User userDetails = JSONUtil.toBean(tokenJwt.getPayload("userDetails").toString(), User.class);
        
        // Token renew by thread pool
        threadPoolTaskExecutor.execute(() -> {
            redisTemplate.expire(RedisKey.LOGIN_TOKEN + userId, RedisKey.LOGIN_TOKEN_L_TTL, RedisKey.LOGIN_TOKEN_TTL_UNIT);
        });
        
        // If the user is not authenticated, then authenticate the user
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
        }
        
        filterChain.doFilter(request, response);
    }
}
```

配置 SecurityFilterChain 注册 TokenFilter

```java
httpSecurity.addFilterBefore(myTokenFilter, UsernamePasswordAuthenticationFilter.class);
```

# PasswordEncoder

PasswordEncoder 是一个接口, 用于对密码进行编码和比较, 它的主要实现类有 BCryptPasswordEncoder, Pbkdf2PasswordEncoder, SCryptPasswordEncoder

SpringSecurity 比较推荐使用 BCryptPasswordEncoder 进行密码加密, 这是一种专为密码哈希设计的函数

- 会使用随机的盐值, 这意味着即使两个用户的原始密码相同, 他们的哈希密码也会不同
- 哈希过程是不可逆的, 这意味着不能从哈希密码反推出原始密码
- 提供了 matches(), 用于比较用户输入的原始密码和存储的哈希密码是否匹配, 这个方法并不需要解密哈希密码, 而是将用户输入的密码进行同样的哈希处理, 然后比较两个哈希值是否相同
- 安全性非常高，它可以有效地防止彩虹表攻击, 
- 允许配置强度参数, 也就是 BCrypt 的 log rounds, 这个参数决定了哈希密码需要做多少次工作, 强度越大, 哈希密码的计算就越慢, 从而增加了暴力破解的难度

配置 BCryptPasswordEncoder Obj, 指定 log rounds 增加了暴力破解的难度

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(4);
}
```

通过 BCryptPasswordEncoder 进行加密, 在对密码进行哈希处理时, 会使用一个随机的盐值, 并且嵌入这个盐到最终结果中, 这意味着即使原始密码相同, 每次生成的哈希密码也会不同

```java

String encoded = passwordEncoder.encode("111"); // $2a$10$IwJ8Qz2t...
```

通过 BCryptPasswordEncoder 进行匹配, 验证一个原始密码和一个哈希密码是否匹配时, 它会从哈希密码中提取出盐值, 然后用这个盐值对原始密码进行哈希处理, 最后比较两个哈希值是否相同

```java
boolean isMatches = passwordEncoder.matches("111", encoded);
```

# DelegatingPasswordEncoder

DelegatingPasswordEncoder 可以根据密码的前缀来选择合适的 PasswordEncoder 进行密码的编码和匹配, 意味着你可以在同一个系统中使用多种密码编码方式

- 如果你想要改变密码的编码方式, 你只需要添加一个新的 PasswordEncoder 到 DelegatingPasswordEncoder 中, 然后更新密码的前缀即可, 这使得密码的升级和迁移变得非常容易
- 通过使用不同的密码编码方式, 你可以为不同的用户或者不同的应用提供不同级别的安全保护, 你可以为存储敏感信息的用户使用更强的密码编码方式

配置 DelegatingPasswordEncoder Bean, 指定 Encoders 和 Default encoder

```java
@Bean
public PasswordEncoder passwordEncoder() {
    String idForEncode = "bcrypt"; // Default encoder
    Map<String, PasswordEncoder> encoders = new HashMap<>();
    encoders.put("bcrypt", new BCryptPasswordEncoder());
    encoders.put("noop", NoOpPasswordEncoder.getInstance());
    encoders.put("pbkdf2", new Pbkdf2PasswordEncoder());
    encoders.put("scrypt", new SCryptPasswordEncoder());
    encoders.put("sha256", new StandardPasswordEncoder());
    
    return new DelegatingPasswordEncoder(idForEncode, encoders);
}
```

SpringSecurity 提供了一个 PasswordEncoderFactories 指定好了很多 Encoders, 并且 Default encoder 为 BCryptPasswordEncoder, 可以直接拿来使用

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
}
```

通过 DelegatingPasswordEncoder 进行加密, 得到的结果都会有一个前缀, 表示当前使用的加密算法

```java
String encoded = passwordEncoder.encode("111"); // {bcrypt}$2a$10$FRHKS...
```

通过 DelegatingPasswordEncoder 进行匹配, 支持不同的加密算法的匹配

```java
String encoded1 = "{bcrypt}$2a$10$KaGRJKh1lNck...";
String encoded2 = "{pbkdf2}e38aab074c91ea00714...";
String encoded3 = "{sha256}cd3d2e5de00720ac029...";
System.out.println(passwordEncoder.matches("111", encoded1)); // true
System.out.println(passwordEncoder.matches("111", encoded2)); // true
System.out.println(passwordEncoder.matches("111", encoded3)); // true
```

# Exception Handler

Spring Security 提供了一套完整的异常处理机制, 用于处理在认证和授权过程中可能出现的各种异常

- AuthenticationException, 当用户试图访问需要认证的资源但尚未认证时抛出
- AccessDeniedException, 当用户试图访问他们没有权限的资源时抛出
- BadCredentialsException, 当提供的凭证无效时抛出
- AccountExpiredException, 当账户已过期时抛出
- LockedException, 当账户被锁定时抛出

配置 SecurityFilterChain 注册 Exception Handler 解决指定的异常

```java
httpSecurity.exceptionHandling((exception) -> {
    exception.authenticationEntryPoint(myAuthenticationEntryPoint)
        .accessDeniedHandler(myAccessDeniedHandler);
});
```

虽然 Spring Security 提供了一套异常的解决方案, 但在 Global Handler 中处理异常也是一个蛮好的选择

```java
@RestControllerAdvice
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public Result exceptionHandler(Exception e) {
        System.out.println(e.getLocalizedMessage());
        return Result.failure();
    }

    @ExceptionHandler(AuthenticationException.class)
    public Result accessDeniedExceptionHandler(AuthenticationException e) {
        System.out.println(e.getLocalizedMessage());
        return Result.unauthorized();
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public Result accessDeniedExceptionHandler(AccessDeniedException e) {
        System.out.println(e.getLocalizedMessage());
        return Result.forbidden();
    }
}
```

# AuthenticationException

AuthenticationEntryPoint 转门用来处理认证异常, 当用户未登录就访问了某些路由时, 就会抛出 AuthenticationException, 通过这个处理器处理异常, 返回一个错误结果给前端, 但是现在主流项目中都采用 Token 进行认证, 在 TokenFilter 中校验 Token 是否合法, 所以就用不着这个 AuthenticationEntryPoint 了

配置 AuthenticationEntryPoint 处理认证异常, 响应错误结果

```java
@Component
public class MyAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        try {
            response.setContentType("application/json;charset=utf-8");
            response.getWriter().write(JSONUtil.toJsonStr(Result.unauthorized()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```

配置 SecurityFilterChain 注册 Exception Handler

```java
httpSecurity.exceptionHandling((exception) -> {
    exception.authenticationEntryPoint(myAuthenticationEntryPoint);
});
```

前端接受到错误结果后, 路由到登陆页面

```java
axios.get('/user/list').then(({data: {code, data}}) => {
  if (code == 401) {
    router.push({path: `/login`})
  }
  console.log(data)
})
```

# AccessDeniedException

AccessDeniedHandler 转门用来处理权限异常, 当用户试图访问他们没有权限的资源时, 就会抛出 AccessDeniedException, 通过这个处理器处理异常, 返回一个错误结果给前端

配置 AccessDeniedHandler 处理认证异常, 响应错误结果

```java
@Component
public class MyAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        try {
            response.setContentType("application/json;charset=utf-8");
            response.getWriter().write(JSONUtil.toJsonStr(Result.unauthorized()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```

配置 SecurityFilterChain 注册 Exception Handler

```java
httpSecurity.exceptionHandling((exception) -> {
    exception.authenticationEntryPoint(myAuthenticationEntryPoint);
});
```

# Authorization by Ant

```java
httpSecurity.authorizeHttpRequests((authorize) -> {
    authorize.requestMatchers("/login", "/registry").permitAll() // permit `/login`, `/registry`
            .requestMatchers("/admin/**").hasRole("ADMIN") // with `ROLE_ADMIN` authority can access
            .requestMatchers("/guest/**").hasAnyRole("GUEST", "ADMIN") // with `ROLE_GUEST` or `ROLE_ADMIN` role can access
            .requestMatchers("/file/read/**").hasAnyAuthority("FILE_READ") // with `FILE_READ` authority can access
            .requestMatchers("/file/update/**").hasAuthority("FILE_SAVE", "FILE_UPDATE", "FILE_DELETE") // with `FILE_SAVE`, `FILE_UPDATE` or `FILE_DELETE` authority can access
            .requestMatchers("/api/read/te?t").hasRole("GUEST")
            .requestMatchers("/api/read/*").hasRole("GUEST")
            .anyRequest().authenticated(); // any other request need to be authenticated
});
```

# Authorization by Method

通过 Method Authorization 代替 Ant Authorization

开启 Method Security

```java
@EnableMethodSecurity
```

通过 @PreAuthorize 校验 Authority

```java
// with `admin` role can access
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/test")
public String test() {
    return "hello world";
}

// with `file_write` authority can access
@PreAuthorize("hasAuthority('READ_FILE')")
@GetMapping("/test")
public String write() {
    return "hello world";
}

// logical judgment
@PreAuthorize("hasAuthority('READ_FILE') && hasAnyRole('ADMIN', 'USER)")
@GetMapping("/test")
public String write() {
    return "hello world";
}
```

通过 @PostAuthorize 校验返回结果

```java
@PreAuthorize("hasRole('ADMIN')")
@PostAuthorize("returnObject.length() > 3")
@GetMapping("/show")
public String show() {
    return "hello world";
}
```

通过 @PreFilter 过滤参数列表, 目标参数必须为 Collection 或 Map 或 Array

```java
@PreFilter(filterTarget="ids", value="filterObject%2==0")
public void delete(List<Integer> ids, List<String> usernames) {}
```

通过 @PostFilter 过滤返回结果列表, 移除不满足条件的元素, 返回结果必须为 Collection 或 Map 或 Array

```java
// Filter elements with length greater than 3
@PostFilter("filterObject.length() > 3")
@GetMapping("/show")
public List<String> show() {
    ArrayList<String> list = new ArrayList<>();
    list.add("aa");
    list.add("bbb");
    list.add("cccc");
    return list;
}
```

# RBAC

RBAC (Role-Based Access Control) 是一种基于角色的访问控制机制, 它通过将用户赋予不同的角色, 进而定义用户对系统资源的访问权限, RBAC 在权限管理方面有很好的可扩展性和维护性, 因此被广泛应用于系统和应用程序的安全设计中

User Table

```sql
CREATE TABLE user (
    user_id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL
);
```

Role Table

```sql
CREATE TABLE role (
    role_id INT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);
```

Perm Table

```sql
CREATE TABLE perm (
    perm_id INT PRIMARY KEY,
    perm_name VARCHAR(50) UNIQUE NOT NULL
);
```

UserRole Table

```sql
CREATE TABLE user_role (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id)
);
```

RolePerm Table

```sql
CREATE TABLE role_perm (
    role_id INT,
    perm_id INT,
    PRIMARY KEY (role_id, perm_id)
);
```