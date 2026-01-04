# RestTemplate

set RestTemplate Bean

```java
@Bean
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

send http request

```java
// send get request, convert the returned value to User Entity
User user = restTemplate.getForObject("http://localhost:8080/user/1", User.class)
```

