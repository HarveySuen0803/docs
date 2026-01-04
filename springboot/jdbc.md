# Druid

import Dependency

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.2.18</version>
</dependency>
```

set Properties (file. jdbc.properties)

```properties
jdbc.driverClassName=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/db
jdbc.username=root
jdbc.password=111
```

set DataSource Bean

```java
@PropertySource({"classpath:jdbc.properties"})
@Configuration
public class JdbcConfiguration {
    @Value("${jdbc.driverClassName}")
    private String driverClassName;
    @Value("${jdbc.url}")
    private String url;
    @Value("${jdbc.username}")
    private String username;
    @Value("${jdbc.password}")
    private String password;

    @Bean
    public DataSource dataSource() {
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setDriverClassName(this.driverClassName);
        dataSource.setUrl(this.url);
        dataSource.setUsername(this.username);
        dataSource.setPassword(this.password);
        return dataSource;
    }
}
```

# JdbcTemplate

set JdbcTemplate Bean

```java
@Bean
public JdbcTemplate jdbcTemplate(DataSource dataSource) {
    return new JdbcTemplate(dataSource);
}
```

## select Object

select Object

```java
// queryForObject(String sql, RowMapper<T> rowMapper, @Nullable Object... args)
User user = jdbcTemplate.queryForObject("select * from user where id = ?", (ret, row) -> {
    User obj = new User();
    obj.setId(ret.getInt("id"));
    obj.setName(ret.getString("name"));
    obj.setAge(ret.getInt("age"));
    obj.setSex(ret.getString("sex"));
    return obj;
}, 1);
```

auto encap Object

```java
User user = jdbcTemplate.queryForObject("select * from user where id = ?", new BeanPropertyRowMapper<>(User.class), 1);
```

## select list

```java
List<User> users = jdbcTemplate.query("select * from user", new BeanPropertyRowMapper<>(User.class));
```

## insert

```java
int rows = jdbcTemplate.update("insert into user (name, age, sex) values (?, ?, ?)", "sun", 18, "F");
```

## update

```java
jdbcTemplate.update("update user set name = ? where id = ?", "sun", 1);
```

## delete 

```java
int rows = jdbcTemplate.update("delete from user where id = ?", 1);
```

## count()

```java
Integer count = jdbcTemplate.queryForObject("select count(*) from user where id = 1", Integer.class);
```

