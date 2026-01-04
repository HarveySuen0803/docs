# gateway

gateway feature

- match route
- route predicate
- gateway filter
- limit request rate
- rewrite path
- check authority

project structure

 ```
spring-cloud-demo
├── gateway
├── order-service
├── user-service
└── pom.xml
```

import dependency

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
```

register gateway module to Nacos server

```properties
server.port=9000
spring.application.name=gateway
spring.profiles.active=dev

spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
spring.cloud.nacos.discovery.username=nacos
spring.cloud.nacos.discovery.password=nacos
spring.cloud.nacos.discovery.namespace=public
spring.cloud.nacos.discovery.group=DEFAULT_GROUP
```

register routes

```properties
spring.cloud.gateway.routes[0].id=user-service
spring.cloud.gateway.routes[0].uri=lb://user-service
spring.cloud.gateway.routes[0].predicates[0]=Path=/user/**
```

access http://127.0.0.1:9000/user/test will navigate to the user-serice route

# auto discovery routes

auto discovery routes instead of manual configuration

```properties
spring.cloud.gateway.discovery.locator.enabled=true
```

# Reactor Netty log

add JVM option to enable log

```shell
-Dreactor.netty.http.server.accessLogEnabled=true
```

customize log (file. logback.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
	<include resource="org/springframework/boot/logging/logback/defaults.xml"/>
	<include resource="org/springframework/boot/logging/logback/console-appender.xml" />
	<root level="INFO">
		<appender-ref ref="CONSOLE" />
	</root>
	<logger name="org.springframework.web" level="DEBUG"/>
</configuration>
```

# predicate

check [predicate docs](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#gateway-request-predicates-factories)

set predicate for gateway

```properties
# request path prefix
spring.cloud.gateway.routes[0].predicates[0]=Path=/user/{id}/**

# accept request after 2037-01-20T17:42:47.789-07:00[America/Denver]
spring.cloud.gateway.routes[0].predicates[0]=After=2037-01-20T17:42:47.789-07:00[America/Denver]

# accept request before Before=2031-04-13T15:14:47.433+08:00[Asia/Shanghai]
spring.cloud.gateway.routes[0].predicates[0]=Before=2031-04-13T15:14:47.433+08:00[Asia/Shanghai]

# require token Cookie
spring.cloud.gateway.routes[0].predicates[0]=Cookie=token

# require X-Request-Id Header
spring.cloud.gateway.routes[0].predicates[0]=Header=X-Request-Id

# request method must be GET or POST
spring.cloud.gateway.routes[0].predicates[0]=Method=GET,POST

# request param must contain `name`
spring.cloud.gateway.routes[0].predicates[0]=Query=name

# host must contain `.harvey.com` or `.suen.com`
spring.cloud.gateway.routes[0].predicates[0]=Host=.harvey.com, .suen.com

# ip must within 192.168.1.1/24
spring.cloud.gateway.routes[0].predicates[0]=RemoteAddr=192.168.1.1/24

# access weight
spring.cloud.gateway.routes[1].predicates[0]=Weight=group1 3
spring.cloud.gateway.routes[2].predicates[0]=Weight=group1 7
```

## custom predicate

create custom predicate (file. predicate/CheckNameRoutePredicateFactory.java)

```java
/**
 * check weather the name is legal
 */
@Component
public class CheckNameRoutePredicateFactory extends AbstractRoutePredicateFactory<CheckNameRoutePredicateFactory.Config> { // if the predicate prefix is `CheckName`, the class name must be `CheckNameRoutePredicateFactory`
    public CheckNameRoutePredicateFactory() {
        super(CheckNameRoutePredicateFactory.Config.class);
    }

    @Override
    public List<String> shortcutFieldOrder() {
        return Arrays.asList("name");
    }

    /**
     * predicate business logic
     * @return weather pass the route
     */
    @Override
    public Predicate<ServerWebExchange> apply(CheckNameRoutePredicateFactory.Config config) {
        return new GatewayPredicate() {
            @Override
            public boolean test(ServerWebExchange exchange) {
                if (config.getName().equals("harvey")) {
                    return true;
                }
                return false;
            }
        };
    }

    /**
     * accept the predicate value
     */
    @Validated
    public static class Config {
        @NotEmpty
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
```

set custom predicate for gateway

```properties
spring.cloud.gateway.routes[0].predicates[0]=CheckName=harvey
```

# filter

check [filter docs](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#gatewayfilter-factories)

set filter

```properties
# add request header, key is `Msg`, value is `hello world`
spring.cloud.gateway.routes[0].filters[0]=AddRequestHeader=Msg, hello world

# match prefix path `/user-service`
# user-service module needs to add a property `server.servlet.context-path=/user-service`
spring.cloud.gateway.routes[0].filters[0]=PrefixPath=/user-service

# redirect to https://www.baidu.com with 302 status code
spring.cloud.gateway.routes[0].filters[0]=RedirectTo=302, https://www.baidu.com
```

## local filter

set local filter, work on local route

```properties
# add request header, key is `Msg`, value is `hello world`
spring.cloud.gateway.routes[0].filters[0]=AddRequestHeader=Msg, hello world
```

## custom local filter

create custom filter (file. predicate/CheckNameGatewayFilterFactory.java)

```java
@Component
public class CheckNameGatewayFilterFactory extends AbstractGatewayFilterFactory<CheckNameGatewayFilterFactory.Config> { // if the filter prefix is `CheckName`, the class name must be `CheckNameGatewayFilterFactory`
    public CheckNameGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public List<String> shortcutFieldOrder() {
        return Arrays.asList("name");
    }

    @Override
    public GatewayFilter apply(Config config) {
        return new GatewayFilter() {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
                // not release
                if (!config.getName().equals("harvey")) {
                    ServerHttpResponse response = exchange.getResponse();
                    response.setStatusCode(HttpStatus.NOT_FOUND);
                    return response.setComplete();
                }

                // release
                return chain.filter(exchange);
            }
        };
    }

    @Validated
    public static class Config {
        @NotEmpty
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
```

set custom filter for gateway

```properties
spring.cloud.gateway.routes[0].filters[0]=CheckName=harvey
```

## global filter

set default filter, work on global route

```properties
spring.cloud.gateway.default-filters[0]=AddRequestHeader=Msg, hello world
```

## custom global filter

set global filter, work on global route (file. AuthorizeFilter.java)

```java
@Component
public class AuthorizeFilter implements GlobalFilter, Ordered {
    /**
     * filter route
     * @return weather pass the filter
     */
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // get param
        ServerHttpRequest request = exchange.getRequest();
        MultiValueMap<String, String> params = request.getQueryParams();
        String auth = params.getFirst("authorization");
        
        // not release
        if (!auth.equals("admin")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // release
        return chain.filter(exchange);
    }

    /**
     * @return the execution order of filter
     */
    @Override
    public int getOrder() {
        return 0;
    }
}
```

# CORS

## set CORS by profile

```properties
# allowed request origin
spring.cloud.gateway.globalcors.corsConfigurations.[/user/**].allowedOrigins[0]=http://localhost:8001/user
spring.cloud.gateway.globalcors.corsConfigurations.[/order/**].allowedOrigins[1]=http://localhost:8002/order

# allowed request method
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedMethods[0]=GET
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedMethods[1]=POST
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedMethods[2]=DELETE
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedMethods[3]=PUT
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedMethods[4]=OPTIONS

# allowed request header
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedHeaders=*

# allowed cookie
spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowCredentials=true

# CORS expire time
spring.cloud.gateway.globalcors.corsConfigurations.[/**].maxAge=360000

# allowed optional method
spring.cloud.gateway.globalcors.add-to-simple-url-handler-mapping=true
```

## set CORS by Cofiguration

```java
@Bean
public CorsWebFilter corsWebFilter() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedHeader("/user/**");
    configuration.addAllowedHeader("GET");
    configuration.addAllowedHeader("*");

    // used for WebFlux
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(new PathPatternParser());
    source.registerCorsConfiguration("/**", configuration);

    return new CorsWebFilter(source);
}
```

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.util.pattern.PathPatternParser;
```

# integrate Sentinel

import dependency

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-alibaba-sentinel-gateway</artifactId>
</dependency>
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

connect to Sentinel

```java
spring.cloud.sentinel.transport.dashboard=127.0.0.1:8858
```

## flow control

set flow control rule

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753852.png)

set group for API

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753853.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753854.png)

## custom block hanlder by GatewayCallbackManager

```java
@PostConstruct
public void init() {
    BlockRequestHandler blockRequestHandler = new BlockRequestHandler() {
        @Override
        public Mono<ServerResponse> handleRequest(ServerWebExchange serverWebExchange, Throwable throwable) {
            Map<String, String> map = new HashMap<>();
            map.put("code", HttpStatus.TOO_MANY_REQUESTS.toString());
            map.put("msg", "flow limiting");

            return ServerResponse
                    .status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(BodyInserters.fromValue(map));
        }
    };

    GatewayCallbackManager.setBlockHandler(blockRequestHandler);
}
```

## custom block handler by profile

```properties
spring.cloud.sentinel.scg.fallback.mode=response
spring.cloud.sentinel.scg.fallback.response-body="{code: 429, message: 'flow limiting'}"
```






