# JWT

JWT is a JSON that stores user info and is encrypted by secret key to implement tamper prevention

- eg: eyJhbGciOiJIUzI.eyJzdWIiOiIxMjM0N.dozjgNryP4J3jVmNHl0w5N

JWT composition: header.playload.signature

- header include algorithm identify and token type
    - eg: {"alg": "HS256", "type": "JWT"}
- playload include some user info
    - eg: {"name": "sun", "age": 18}
- signature used for merge header, payload and token to prevent tampering

import dependency

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>
<!-- Java version supplement -->
<dependency>
    <groupId>javax.xml.bind</groupId>
    <artifactId>jaxb-api</artifactId>
    <version>2.3.1</version>
</dependency>
<dependency>
    <groupId>com.sun.xml.bind</groupId>
    <artifactId>jaxb-impl</artifactId>
    <classifier>sources</classifier>
</dependency>
<dependency>
    <groupId>com.sun.xml.bind</groupId>
    <artifactId>jaxb-core</artifactId>
    <classifier>sources</classifier>
</dependency>
```

create JWT token

```java
Map<String, Object> claims = new HashMap<>();
claims.put("name", "sun");
claims.put("age", 18);

String jwt = Jwts
        .builder()
        .signWith(SignatureAlgorithm.HS256, "hello world") // `HS256` is sign algo, `hello world` is signing key
        .setClaims(claims) // data
        .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // expiration
        .compact();

System.out.println(jwt); // eyJhbGciOiJIUzI1Ni...
```

parse JWT token

```java
Claims claims = Jwts
        .parser()
        .setSigningKey("hello world")
        .parseClaimsJws(jwt)
        .getBody();

System.out.println(claims); // {name=sun, exp=1685425727, age=18}
```

# JWT utils

```java
package com.harvey.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;
import java.util.Map;

public class JwtUtils {
    private static String signKey = "itheima";
    private static Long expire = 43200000L;

    public static String generateJwt(Map<String, Object> claims) {
        return Jwts
                .builder()
                .addClaims(claims)
                .signWith(SignatureAlgorithm.HS256, signKey)
                .setExpiration(new Date(System.currentTimeMillis() + expire))
                .compact();
    }

    public static Claims parseJWT(String jwt) {
        return Jwts
                .parser()
                .setSigningKey(signKey)
                .parseClaimsJws(jwt)
                .getBody();
    }
}
```

# login check

```java
@RestController
@RequestMapping("/login")
public class LoginController {
    @Autowired
    EmpService empService;

    @PostMapping
    public Result login(@RequestBody Emp emp) {
        Emp e = empService.login(emp);

        if (e == null) {
            return Result.failure("username or password is error");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("id", e.getId());
        claims.put("name", e.getName());
        claims.put("username", e.getUsername());

        String jwt = JwtUtils.generateJwt(claims);

        return Result.success("success", jwt);
    }
}
```

