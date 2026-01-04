# Web Flux

pom.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

# Web Service

通过 Aliyun Market https://market.aliyun.com 购买 Web Service

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811942.png)

# WebClient

pom.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

配置 WebClient, 请求 server, 获取 resp data

```java
Mono<String> ret = WebClient
        .create()
        .get()
        .uri("https://ali-weather.showapi.com/area-to-weather-date?area={area}", "扬州")
        .accept(MediaType.APPLICATION_JSON)
        .header("Authorization", "APPCODE cf1ed9e4e4114a95a8faa8c29527a741")
        .retrieve()
        .bodyToMono(String.class);
```

通过 Map 配置 param

```java
Map<String, String> map = new HashMap<>();
map.put("area", "扬州");
map.put("areaCode", "321081");
Mono<String> ret = WebClient
        .create()
        .get()
        .uri("https://ali-weather.showapi.com/area-to-weather-date?area={area}&areaCode={areaCode}", map)
        .retrieve()
        .bodyToMono(String.class);
```

# HttpInterface

WeatherService.java, 配置 HttpInterface

```java
public interface WeatherService {
    // 请求 url, 携带 req param 和 req header 
    @GetExchange(url = "https://ali-weather.showapi.com/area-to-weather-date", accept = "application/json")
    // city 为 req param 别名为 area, auth 为 req header 别名为 Authorization
    Mono<String> getWeather(@RequestParam("area") String city, @RequestHeader("Authorization") String auth);
}
```

通过 HttpInterface 请求 server, 获取 resp data

```java
// 配置 WebClient
WebClient client = WebClient.builder().codecs((clientCodecConfigurer) -> {
    clientCodecConfigurer.defaultCodecs().maxInMemorySize(8 * 1024 * 1024);
}).build();
// 配置 Factory
HttpServiceProxyFactory factory = HttpServiceProxyFactory.builder(WebClientAdapter.forClient(client)).build();
// 获取 Proxy Obj
WeatherService weatherService = factory.createClient(WeatherService.class);
// 获取 resp data
Mono<String> ret = weatherService.getWeather("扬州", "APPCODE cf1ed9e4e4114a95a8faa8c29527a741");
```

# WebService Encap

WeatherService.java

```java
public interface WeatherService {
    @GetExchange(url = "https://ali-weather.showapi.com/area-to-weather-date", accept = "application/json")
    Mono<String> getWeather(@RequestParam String area);
}
```

SmsService.java

```java
public interface SmsService {
    @PostExchange(url = "https://gyytz.market.alicloudapi.com/sms/smsSend")
    Mono<String> sendSms(@RequestParam String mobile, @RequestParam String param, @RequestParam String smsSignId, @RequestParam String templateId);
}
```

application.properties

```properties
aliyun.appcode=cf1ed9e4e4114a95a8faa8c29527a741
```

WebServiceConfiguration.java

```java
@Configuration
public class WebServiceConfiguration {
    @Value("${aliyun.appcode}")
    private String appCode;

    @Bean
    HttpServiceProxyFactory httpServiceProxyFactory() {
        WebClient client = WebClient
                .builder()
                .defaultHeader("Authorization", "APPCODE " + appCode)
                .codecs((clientCodecConfigurer) -> {
                    clientCodecConfigurer.defaultCodecs().maxInMemorySize(8 * 1024 * 1024);
                })
                .build();
        return HttpServiceProxyFactory.builder(WebClientAdapter.forClient(client)).build();
    }

    @Bean
    WeatherService weatherService(HttpServiceProxyFactory factory) {
        return factory.createClient(WeatherService.class);
    }

    @Bean
    SmsService smsService(HttpServiceProxyFactory factory) {
        return factory.createClient(SmsService.class);
    }
}
```

Test

```java
@Autowired
WeatherService weatherService;
@Autowired
SmsService smsService;

@Test
public void test() {
    Mono<String> mono1 = weatherService.getWeather("扬州");
    Mono<String> mono2 = smsService.sendSms("19533093036", "**code**:1234,**minute**:5", "2e65b1bb3d054466b82f0c9d125465e2", "29833afb9ae94f21a3f66af908d54627");
}
```

