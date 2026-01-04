# oauth server

import dependency

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-oauth2-authorization-server</artifactId>
</dependency>
```

enable SpringSecurity

```java
@EnableWebSecurity
```

define required components

```java
// Service interface for encoding passwords.
@Bean
PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// Core interface which loads user-specific data. (temporarily stored in memory when no DB is configured)
@Bean
public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
    // create a user
    UserDetails user = User.withUsername("harvey")
                            .password(passwordEncoder.encode("111"))
                            .roles("ADMIN")
                            .build();
    // store user to memory
    return new InMemoryUserDetailsManager(user);
}

// Defines a filter chain which is capable of being matched against an @HttpServletRequest}. in order to decide whether it applies to that request.
@Order(1)
@Bean
SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity httpSecurity) throws Exception {
    OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(httpSecurity);
    
    // enable OpenID Connect 1.0
    httpSecurity.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                .oidc(Customizer.withDefaults());
    
    // redirect to the login page when not authenticated from the authorization endpoint
    httpSecurity.exceptionHandling((exceptions) -> exceptions.defaultAuthenticationEntryPointFor(
            new LoginUrlAuthenticationEntryPoint("/login"),
            new MediaTypeRequestMatcher(MediaType.TEXT_HTML)
        )
    );
    
    // accept access tokens for User Info and/or Client Registration
    httpSecurity.oauth2ResourceServer((resourceServer) -> resourceServer.jwt(Customizer.withDefaults()));
    
    return httpSecurity.build();
}

@Order(2)
@Bean
public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity httpSecurity) throws Exception {
    httpSecurity.authorizeHttpRequests((authorize) -> {
        authorize.anyRequest().authenticated();
    });
    
    httpSecurity.formLogin(Customizer.withDefaults());
    
    return httpSecurity.build();
}

// A repository for OAuth 2.0 @RegisteredClient. (temporarily stored in memory when no oauth-client is configured)
@Bean
public RegisteredClientRepository registeredClientRepository(PasswordEncoder passwordEncoder) {
    RegisteredClient oidcClient = RegisteredClient.withId(UUID.randomUUID().toString())
        .clientId("oauth-client")
        .clientSecret(passwordEncoder.encode("111"))
        .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
        .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE) // grant_type that can be used
        .redirectUri("http://127.0.0.1:1001/callback")
        .scope(OidcScopes.OPENID) // scope of permissions for the client
        .scope(OidcScopes.PROFILE)
        .scope("message_read")
        .scope("message_write")
        .clientSettings(ClientSettings.builder()
            .requireAuthorizationConsent(true) // manual confirm authorization
            .build()) 
        .tokenSettings(TokenSettings.builder()
            .accessTokenTimeToLive(Duration.ofDays(5))
            .refreshTokenTimeToLive(Duration.ofDays(10))
            .build())
        .build();

    return new InMemoryRegisteredClientRepository(oidcClient);
}

// JSON Web Key (JWK) source. Exposes a method for retrieving JWKs matching a specified selector. An optional context parameter is available to facilitate passing of additional data between the caller and the underlying JWK source (in both directions). Implementations must be thread-safe.
@Bean
public JWKSource<SecurityContext> jwkSource() {
    KeyPair keyPair = generateRsaKey();
    RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
    RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
    RSAKey rsaKey = new RSAKey.Builder(publicKey)
                        .privateKey(privateKey)
                        .keyID(UUID.randomUUID().toString())
                        .build();
    JWKSet jwkSet = new JWKSet(rsaKey);
    return new ImmutableJWKSet<>(jwkSet);
}

private static KeyPair generateRsaKey() {
    KeyPair keyPair;
    try {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048, new SecureRandom("hello world".getBytes())); // 2048 is key size, `hello world` is secret key
        keyPair = keyPairGenerator.generateKeyPair();
    } catch (Exception ex) {
        throw new IllegalStateException(ex);
    }
    return keyPair;
}

@Bean
public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
    return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
}

// A facility for authorization server configuration settings
@Bean
public AuthorizationServerSettings authorizationServerSettings() {
    return AuthorizationServerSettings.builder().build();
}
```

# get authentication server info

```http
### get authentication server info
GET http://127.0.0.1:1001/.well-known/openid-configuration
```

```json
{
  "issuer": "http://127.0.0.1:1001",
  "authorization_endpoint": "http://127.0.0.1:1001/oauth2/authorize",
  "token_endpoint": "http://127.0.0.1:1001/oauth2/token",
  "token_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt"
  ],
  "jwks_uri": "http://127.0.0.1:1001/oauth2/jwks",
  "userinfo_endpoint": "http://127.0.0.1:1001/userinfo",
  "response_types_supported": [
    "code"
  ],
  "grant_types_supported": [
    "authorization_code",
    "client_credentials",
    "refresh_token"
  ],
  "revocation_endpoint": "http://127.0.0.1:1001/oauth2/revoke",
  "revocation_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt"
  ],
  "introspection_endpoint": "http://127.0.0.1:1001/oauth2/introspect",
  "introspection_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt"
  ],
  "subject_types_supported": [
    "public"
  ],
  "id_token_signing_alg_values_supported": [
    "RS256"
  ],
  "scopes_supported": [
    "openid"
  ]
}
```

# get authentication code

access authorization server to authorize service and get the authorizatin code

```http
### get authentication code
GET http://127.0.0.1:1001/oauth2/authorize?client_id=oauth-client&scope=profile&response_type=code&redirect_uri=http://127.0.0.1:1001/callback
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810526.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810527.png)

# get authentication token

access authorization server with the authentication code to get the authentication token

```http
### get authentication token
POST http://127.0.0.1:1001/oauth2/token?grant_type=authorization_code&code=tUil1oPvmCA7J_T1sspfkI&redirect_uri=http://127.0.0.1:1001/callback
Content-Type: application/x-www-form-urlencoded
Authorization: Basic oauth-client 111
```

```json
{
  "access_token": "eyJraWQiOiJhZDE1MTBiYi00NjUzLTQ2YWItOGNiNi0xMDIyM2JmODMxZDAiLCJhbGciOiJSUzI1NiJ9",
  "refresh_token": "xvOeq0s6LyBi3THvQp5XXr1PUuLQLdOmA",
  "scope": "profile",
  "token_type": "Bearer",
  "expires_in": 299
}
```

# refresh authentication token

```http
### refresh authentication token
POST http://127.0.0.1:1001/oauth2/token?grant_type=refresh_token&refresh_token=xvOeq0s6LyBi3THvQp5XXr1PUuLQLdOmA&redirect_uri=http://127.0.0.1:1001/callback
Content-Type: application/x-www-form-urlencoded
Authorization: Basic oauth-client 111
```

```json
{
  "access_token": "eyJraWQiOiJhZDE1MTBiYi00NjUzLTQ2YWItOGNiNi0xMDIyM2JmODMxZDAiLCJhbGciOiJSUzI1NiJ9",
  "refresh_token": "xvOeq0s6LyBi3THvQp5XXr1PUuLQLdOmA",
  "scope": "profile",
  "token_type": "Bearer",
  "expires_in": 299
}
```

# persistence

create database

```sql
CREATE DATABASE `oauth2_server`;

USE DATABASE `oauth2_server`;

CREATE TABLE oauth2_registered_client (
    id varchar(100) NOT NULL,
    client_id varchar(100) NOT NULL,
    client_id_issued_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    client_secret varchar(200) DEFAULT NULL,
    client_secret_expires_at timestamp DEFAULT NULL,
    client_name varchar(200) NOT NULL,
    client_authentication_methods varchar(1000) NOT NULL,
    authorization_grant_types varchar(1000) NOT NULL,
    redirect_uris varchar(1000) DEFAULT NULL,
    scopes varchar(1000) NOT NULL,
    client_settings varchar(2000) NOT NULL,
    token_settings varchar(2000) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE oauth2_authorization_consent (
    registered_client_id varchar(100) NOT NULL,
    principal_name varchar(200) NOT NULL,
    authorities varchar(1000) NOT NULL,
    PRIMARY KEY (registered_client_id, principal_name)
);

CREATE TABLE oauth2_authorization (
    id varchar(100) NOT NULL,
    registered_client_id varchar(100) NOT NULL,
    principal_name varchar(200) NOT NULL,
    authorization_grant_type varchar(100) NOT NULL,
    authorized_scopes varchar(1000) DEFAULT NULL,
    attributes blob DEFAULT NULL,
    state varchar(500) DEFAULT NULL,
    authorization_code_value blob DEFAULT NULL,
    authorization_code_issued_at timestamp DEFAULT NULL,
    authorization_code_expires_at timestamp DEFAULT NULL,
    authorization_code_metadata blob DEFAULT NULL,
    access_token_value blob DEFAULT NULL,
    access_token_issued_at timestamp DEFAULT NULL,
    access_token_expires_at timestamp DEFAULT NULL,
    access_token_metadata blob DEFAULT NULL,
    access_token_type varchar(100) DEFAULT NULL,
    access_token_scopes varchar(1000) DEFAULT NULL,
    oidc_id_token_value blob DEFAULT NULL,
    oidc_id_token_issued_at timestamp DEFAULT NULL,
    oidc_id_token_expires_at timestamp DEFAULT NULL,
    oidc_id_token_metadata blob DEFAULT NULL,
    refresh_token_value blob DEFAULT NULL,
    refresh_token_issued_at timestamp DEFAULT NULL,
    refresh_token_expires_at timestamp DEFAULT NULL,
    refresh_token_metadata blob DEFAULT NULL,
    PRIMARY KEY (id)
);

-- system user
CREATE TABLE `oauth2_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `username` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `status` tinyint DEFAULT NULL COMMENT '1 enable, 0 disable',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;

-- test data
INSERT INTO `oauth_server`.`oauth2_registered_client` (`id`, `client_id`, `client_id_issued_at`, `client_secret`, `client_secret_expires_at`, `client_name`, `client_authentication_methods`, `authorization_grant_types`, `redirect_uris`, `scopes`, `client_settings`, `token_settings`) VALUES ('3eacac0e-0de9-4727-9a64-6bdd4be2ee1f', 'oauth-client', '2023-07-12 07:33:42', '$2a$10$P1stzE8Iqnp35c1VzTU2iutFL0bJLYrgjTmukwBy0HzP0vCOV5jlu', NULL, 'oauth-client', 'client_secret_basic', 'refresh_token,authorization_code', 'http://127.0.0.1:1001/callback', 'OPENID,PROFILE,MESSAGE_READ,MESSAGE_WRITE', '{\"@class\":\"java.util.Collections$UnmodifiableMap\",\"settings.client.require-proof-key\":false,\"settings.client.require-authorization-consent\":true}', '{\"@class\":\"java.util.Collections$UnmodifiableMap\",\"settings.token.reuse-refresh-tokens\":true,\"settings.token.id-token-signature-algorithm\":[\"org.springframework.security.oauth2.jose.jws.SignatureAlgorithm\",\"RS256\"],\"settings.token.access-token-time-to-live\":[\"java.time.Duration\",300.000000000],\"settings.token.access-token-format\":{\"@class\":\"org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat\",\"value\":\"self-contained\"},\"settings.token.refresh-token-time-to-live\":[\"java.time.Duration\",3600.000000000],\"settings.token.authorization-code-time-to-live\":[\"java.time.Duration\",300.000000000],\"settings.token.device-code-time-to-live\":[\"java.time.Duration\",300.000000000]}');

INSERT INTO `oauth2_server`.`oauth2_user` (`id`, `username`, `password`, `name`, `description`, `status`) VALUES (1, 'harvey', '$2a$10$P1stzE8Iqnp35c1VzTU2iutFL0bJLYrgjTmukwBy0HzP0vCOV5jlu', 'test user', 'Spring Security test user', 1);

INSERT INTO `oauth2_server`.`oauth2_user` (`id`, `username`, `password`, `name`, `description`, `status`) VALUES (2, 'bruce', '$2a$10$P1stzE8Iqnp35c1VzTU2iutFL0bJLYrgjTmukwBy0HzP0vCOV5jlu', 'test user', 'Spring Security test user', 1);
```

define required components

```java
@Bean
PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// @Bean
// public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
//     // create a user
//     UserDetails user = User.withUsername("harvey")
//                            .password(passwordEncoder.encode("111"))
//                            .roles("ADMIN")
//                            .build();
//     // store user to memory
//     return new InMemoryUserDetailsManager(user);
// }

// @Bean
// public RegisteredClientRepository registeredClientRepository(PasswordEncoder passwordEncoder) {
//     RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())
//                                                   .clientId("learn-online-client")
//                                                   .clientSecret(passwordEncoder.encode("111"))
//                                                   .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
//                                                   .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
//                                                   .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
//                                                   .redirectUri("http://www.51xuecheng.cn")
//                                                   .scope("all")
//                                                   .scope("read")
//                                                   .scope("write")
//                                                   .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
//                                                   .build();
//     return new InMemoryRegisteredClientRepository(registeredClient);
// }

// get registered-client info from DB
@Bean
public RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbcTemplate) {
    return new JdbcRegisteredClientRepository(jdbcTemplate);
}

// get authentication info from DB
@Bean
public OAuth2AuthorizationService authorizationService(JdbcTemplate jdbcTemplate, RegisteredClientRepository registeredClientRepository) {
    return new JdbcOAuth2AuthorizationService(jdbcTemplate, registeredClientRepository);
}

// get authentication consent info from DB
@Bean
public OAuth2AuthorizationConsentService authorizationConsentService(JdbcTemplate jdbcTemplate, RegisteredClientRepository registeredClientRepository) {
    return new JdbcOAuth2AuthorizationConsentService(jdbcTemplate, registeredClientRepository);
}
```

set properties

```properties
server.port=1001
spring.application.name=oauth-server

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/oauth_server?serverTimezone=UTC&characterEncoding=utf8&useUnicode=true&useSSL=false&rewriteBatchedStatements=true
spring.datasource.username=root
spring.datasource.password=111
```

set UserDetailsService to get User from DB

```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserService userService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String password = userService.lambdaQuery()
                                     .eq(UserPO::getUsername, username)
                                     .one()
                                     .getPassword();
        List<SimpleGrantedAuthority> grantedAuthorityList = Stream.of("USER").map(SimpleGrantedAuthority::new).toList();
        return new User(username, password, grantedAuthorityList);
    }
}
```

```java
@TableName("oauth2_user")
@Data
public class UserPO implements Serializable {
    private Long id;

    private String username;

    private String password;

    private String name;

    private String description;

    private Integer status;

    @Serial
    private static final long serialVersionUID = 1L;
}
```

# oauth client

import dependency (module: oauth-client)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

set properties

```properties
# if the server and client use the same IP, the cookie will be overwritten
spring.security.oauth2.client.provider.oauth-server.issuer-uri=http://172.20.10.2:1001
spring.security.oauth2.client.provider.oauth-server.authorizationUri=${spring.security.oauth2.client.provider.oauth-server.issuer-uri}/oauth2/authorize
spring.security.oauth2.client.provider.oauth-server.tokenUri=${spring.security.oauth2.client.provider.oauth-server.issuer-uri}/oauth2/token
spring.security.oauth2.client.registration.oauth-client.provider=oauth-server
spring.security.oauth2.client.registration.oauth-client.client-name=oauth-client
spring.security.oauth2.client.registration.oauth-client.client-id=oauth-client
spring.security.oauth2.client.registration.oauth-client.client-secret=111
spring.security.oauth2.client.registration.oauth-client.client-authentication-method=client_secret_basic
spring.security.oauth2.client.registration.oauth-client.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.oauth-client.redirect-uri=http://127.0.0.1:1002/login/oauth2/code/oauth-client
spring.security.oauth2.client.registration.oauth-client.scope[0]=profile
spring.security.oauth2.client.registration.oauth-client.scope[1]=openid
spring.security.oauth2.client.registration.oauth-client.scope[2]=message_read
spring.security.oauth2.client.registration.oauth-client.scope[3]=message_write
```

set controller to request authorization server for token

```java
@GetMapping("/token")
public OAuth2AuthorizedClient token(@RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient oAuth2AuthorizedClient) {
    return oAuth2AuthorizedClient;
}
```

get authentication token

```http
GET http://127.0.0.1:1002/token
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810526.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810530.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810531.png)

# oauth resource

import dependency (module: oauth-resource)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

set properties

```properties
server.port=1003
spring.application.name=oauth-resource

# oauth-server ip
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://172.20.10.2:1001
```

set SpringSecurity

```java
@EnableMethodSecurity
@EnableWebSecurity
@Configuration
public class SecurityConfiguration {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests((authorize) -> authorize.anyRequest().authenticated());
        httpSecurity.oauth2ResourceServer((resourceServer) -> resourceServer.jwt(Customizer.withDefaults()));
        return httpSecurity.build();
    }
}
```

set controller with authority certification

```java
@RestController
public class MessageController {
    @GetMapping("/message1")
    @PreAuthorize("hasAuthority('SCOPE_profile')")
    public String getMessage1() {
        return " hello world";
    }
    
    @GetMapping("/message2")
    @PreAuthorize("hasAnyAuthority('SCOPE_message_read', 'SCOPE_message_write')")
    public String getMessage2() {
        return " hello world";
    }
}
```

get user info from token

```java
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
System.out.println(authentication.getPrincipal());
System.out.println(authentication.getCredentials());
System.out.println(authentication.getAuthorities());
System.out.println(authentication.getDetails());
```

access services with token

```http
### carrying token to access services
GET http://127.0.0.1:1001/message1
Authorization: Bearer eyJraWQiOiI4Mzk...
```
