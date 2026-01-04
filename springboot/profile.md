# application.properties

```properties
server.port=8080

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/db?serverTimezone=UTC&characterEncoding=utf8&useUnicode=true&useSSL=false&rewriteBatchedStatements=true
spring.datasource.username=root
spring.datasource.password=111
spring.datasource.type=com.zaxxer.hikari.HikariDataSource
```

# application.yaml

```yml
server:
  port: 8080

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/db
    username: root
    password: 111
```

# profile priority

command args > external profile > inner profile

```
target
├── application-dev.properties # inner profile
├── application.properties
├── profile
│   ├── application-dev.properties # external profile
│   ├── application.properties
│   └── profile
│       ├── application-dev.properties
│       └── application.properties
└── application.jar
```

# custom Banner

configure banner (resource/banner.txt)

```txt
 _        _ _                      _    _ 
| |_  ___| | |___  __ __ _____ _ _| |__| |
| ' \/ -_) | / _ \ \ V  V / _ \ '_| / _` |
|_||_\___|_|_\___/  \_/\_/\___/_| |_\__,_|                                           
```

set banner location

```properties
spring.banner.location=classpath:banner.txt
```

console

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810895.png)

# close banner

```properties
spring.main.banner-mode=off
```