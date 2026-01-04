# MyBatisPlus

import dependency

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.3.1</version>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
</dependency>
```

set datasource

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/db?serverTimezone=UTC&characterEncoding=utf8&useUnicode=true&useSSL=false&rewriteBatchedStatements=true
spring.datasource.username=root
spring.datasource.password=111

spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

mybatis-plus.mapper-locations=classpath*:**/mapper/*Mapper.xml
```

# BaseMapper api

set mapper

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {}
```

```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
```

invoke BaseMapper api

```java
User user = userMapper.selectById(1);

List<User> userList = userMapper.selectList(null);

List<User> userList = userMapper.selectBatchIds(List.of(1, 2, 3));

userMapper.insert(new User(1, "sun", 18));

userMapper.updateById(new User(1, "sun", 18));

userMapper.deleteById(1);

userMapper.deleteBatchIds(List.of(1, 2, 3));
```

# ServiceImpl api

set service

```java
public interface UserService extends IService<User> {}
```

```java
import com.baomidou.mybatisplus.extension.service.IService;
```

set service impl

```java
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {}
```

```java
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
```

invoke ServiceImpl api

```java
User user = userService.getById(1);

List<User> userList = userService.list();

List<User> userList1 = userService.listByIds(List.of(1, 2, 3));

userService.save(new User(1, "sun", 18));

userService.updateById(new User(1, "sun", 18));

userService.removeById(1);

userService.removeByIds(List.of(1, 2, 3));
```

# log impl

```properties
mybatis-plus.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

# disable banner

```properties
mybatis-plus.global-config.banner=false
```

# mapping config

```java
// UserPO PO -> user table
@TableName("user")
public class UserPO {
    // id field -> id col
    @TableId("id")
    Integer id;

    // username field -> user_name col
    @TableField("user_name")
    private String username;
    
    // execute `select * from users` will not return the field value to avoid information leakage
    @TableField(select = false)
    private String password;
    
    // only used for User class, this field doesn't exist in the table
    @TableField(exist = false)
    private String online
}
```

# global config

```properties
# default id type
mybatis-plus.global-config.db-config.id-type=assign_id

# default update strategy
mybatis-plus.global-config.db-config.update-strategy=not_null

# add mapping prefix (eg. User pojo -> tbl_user table)
mybatis-plus.global-config.db-config.table-prefix=tbl_

mybatis-plus.mapper-locations=classpath*:**/mapper/*Mapper.xml

mybatis-plus.configuration.map-underscore-to-camel-case=true
```

# IdType.AUTO

```java
// auto increment
@TableId(type = IdType.AUTO)
private Integer id;
```

# IdType.INPUT

```java
// need to specify a value
@TableId(type = IdType.INPUT)
private Integer id;
```

# IdType.ASSIGN_ID

基于 Snowflake Algo 生成唯一, 自增, 且不连续的 ID

```java
@TableId(type = IdType.ASSIGN_ID)
private Integer id;
```

# IdType.ASSIGN_UUID

```java
// generate id by UUID
@TableId(type = IdType.ASSIGN_UUID)
private Integer id;
```

# wrapper

```java
QueryWrapper<User> wrapper = new QueryWrapper<User>()
        .select("id", "name", "sex", "count(*) as count") // select name, age, sex, count(*) as count
        .eq("id", 1) // where id = 1
User user = userMapper.selectOne(wrapper);

QueryWrapper<User> wrapper = new QueryWrapper<User>()
        .gt("age", 10) // where age > 10
        .lt("age", 20) // where age < 20
        .in("id", 1, 2, 3); // where id in (1, 2, 3)
User user = userMapper.selectList(wrapper);

UpdateWrapper<User> wrapper = new UpdateWrapper<User>()
        .set("age", 18) // set age = 18
        .setSql("balance = balance - 10"); // set balance = balance - 10
userMapper.update(user, wrapper)

User user = userService.one(wrapper);
List<User> userList = userService.list(wrapper);
userService.update(user, wrapper);
```

# lambda wrapper

specify field name by lambda instead of hard coding to decoupling

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>()
        .select(User::getId, User::getName, User::getAge)
        .eq(User::getId, 1);
```

# encap lambda wrapper 

```java
List<User> userList = userService
        .lambdaQuery()
        .select(User::getId, User::getName, User::getAge)
        .eq(User::getAge, 10)
        .one();

User user = userService
        .lambdaQuery()
        .list();

userService
        .lambdaUpdate()
        .set(User::getAge, 18)
        .set(User::getName, "sun")
        .eq(User::getId, 1);
        .update();
```

# where

```java
// where age < 10
wrapper.lt(User::getAge, 10);

// where age <= 10
wrapper.le(User::getAge, 10);

// where age > 10
wrapper.gt(User::getAge, 10);

// where age >= 10
wrapper.ge(User::getAge, 10);

// where age = 10
wrapper.eq(User::getAge, 10);

// where age != 10
wrapper.ne(User::getAge, 10);

// where age between 10 and 30
wrapper.between(User::getAge, 10, 30);

// where age > 10 and age < 30
wrapper.gt(User::getAge, 10);
wrapper.lt(User::getAge, 30);

// where age > 10 and age < 30
wrapper.gt(User::getAge, 10).lt(User::getAge, 30);

// where age < 10 or age > 30
wrapper.lt(User::getAge, 10).or().gt(User::getAge, 30);

// where name like "%s%"
wrapper.like(User::getName, "s");

// where name like "%s"
wrapper.likeLeft(User::getName, "s");

// where name like "%s"
wrapper.likeRight(User::getName, "s");

// if `user.getAge() != null` is true, then add `where age < 10`
wrapper.lt(user.getAge() != null, User::getAge, 10);
```

# group

```java
wrapper.select("count(*) as count, sex").groupBy("sex");
```

# custom sql

set wrapper

```java
// set `where` by wrapper
UpdateWrapper<User> wrapper = new UpdateWrapper<User>()
        .in("id", 1, 2, 3, 4, 5);
userMapper.updateBalanceByIdList(wrapper);
```

set mapper

```java
void updateBalanceByIdList(@Param(Constants.WRAPPER) UpdateWrapper<User> wrapper);
```

stitch sql that generated by wrapper

```sql
-- set `set` by sql, stitch `where` that generated by wrapper
<update id="updateBalanceByIdList">
    update user set balance = balance - 10 ${ew.customSqlSegment}
</update>
```

# batch operation

enable batch operation

```properties
spring.datasource.url=dbc:mysql://127.0.0.1:3306/db?rewriteBatchedStatements=true
```

batch operation

```java
List<User> userList = new ArrayList<>();
for (int i = 0; i < 100000; i++) {
    userList.add(new User());
    if ((i + 1) % 1000 == 0) {
        userService.saveBatch(userList);
        userList.clear();
    }
}
```

# query()

```java
User user = query().select(User::getId, User::getName, User::getAge)
                   .gt(User::getAge, 10)
                   .lt(User::getAge, 20)
                   .list();
```

# Db API

```java
List<User> userList = Db.lambdaQuery(User.class)
                        .select(User::getId, User::getName, User::getAge)
                        .gt(User::getAge, 10)
                        .lt(User::getAge, 20)
                        .list();
```

# logic delete

add deleted col

```sql
alter table user add deleted int not null default 0;
```

set logic deleted

```java
@TableLogic(value = "0", delval = "1")
private Integer deleted;
```

```properties
mybatis-plus.global-config.db-config.logic-delete-field=deleted
mybatis-plus.global-config.db-config.logic-delete-value=1
mybatis-plus.global-config.db-config.logic-not-delete-value=0
```

delete operation

```java
userService.removeById(3);
```

```shell
c.harvey.mapper.UserMapper.deleteById: ==> Preparing: UPDATE user SET deleted=1 WHERE id=? AND deleted=0
c.harvey.mapper.UserMapper.deleteById: ==> Parameters: 3(Integer)
c.harvey.mapper.UserMapper.deleteById: <== Updates: 1
```

select operation

```java
User user = userService.getById(1);
```

```shell
c.harvey.mapper.UserMapper.selectById: ==> Preparing: SELECT id,name,age,balance,deleted FROM user WHERE id=? AND deleted=0
c.harvey.mapper.UserMapper.selectById: ==> Parameters: 1(Integer)
c.harvey.mapper.UserMapper.selectById: <== Total: 1
```

# OCC

add version column

```sql
alter table user add version int not null default 1;
```

enable OCC (file: User.java)

```java
@Version
private Integer version;
```

set OCC Interceptor

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor mybatisPlusInterceptor = new MybatisPlusInterceptor();
    mybatisPlusInterceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
    return mybatisPlusInterceptor;
}
```

update operation

```java
// OCC need current version to make judgement, so we should get a User from DB first to get current version
User user = userMapper.selectById(1);
user.setName("sun");
userMapper.updateById(user);
```

insert operation

```java
// insert operation do not need to get current version, because version column has default value
User user = new User();
user.setName("sun");
userMapper.insert()
```

# enum type handler

enable enum type handler

```properties
mybatis-plus.configuration.default-enum-type-handler=com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler
```

set enum

```java
public enum UserStatusConstant {
    NORMAL(0, "normal status"), FROZEN(1, "frozen status");

    // mapping column value
    @EnumValue
    private final Integer value;

    // returned value
    @JsonValue
    private final String description;

    UserStatusConstant(Integer value, String description) {
        this.value = value;
        this.description = description;
    }
}
```

set entity

```java
@Data
public class User {
    private Integer id;
    private String name;
    // represent field by enum
    private UserStatusConstant status;
}
```

set controller

```java
@GetMapping("/test")
public User test() {
    return userService.getById(1); // User(id=1, name=sun, status=NORMAL)
}
```

```json
{
  "id": 1,
  "name": "sun",
  "status": "normal status"
}
```

# json type handler

set entity

```java
@Data
// Nested objects need to declare resultmap
@TableName(autoResultMap = true)
public class User implements Serializable {
    private Integer id;

    private String name;

    // mapping json type column
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Address address;

    @Serial
    private static final long serialVersionUID = 1L;
}
```

set controller

```java
@GetMapping("/test")
public User test() {
    return userService.getById(1);
}
```

```json
{
  "id": 1,
  "name": "sun",
  "address": null
}
```

# pagination

set MyBatisPlus interceptor

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor mybatisPlusInterceptor = new MybatisPlusInterceptor();
    mybatisPlusInterceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
    return mybatisPlusInterceptor;
}
```

select by page

```java
// Page(long current, long size)
Page<User> page = new Page<>(1, 5);

// order
page.addOrder(new OrderItem("id", true));

userMapper.selectPage(page, wrapper);

// get page no
System.out.println(page.getCurrent());

// get page size
System.out.println(page.getSize());

// get page number
System.out.println(page.getPages());

// get total records
System.out.println(page.getTotal());

// get current page records
System.out.println(page.getRecords());
```

```java
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
```

other page api

```java
userMapper.page(page, wrapper);

userService.page(page, wrapper);

userService
        .lambdaQuery()
        .page(page);
```

# generate code

install MyBatisX plugin

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810617.png)

configure MyBatisx template

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810618.png)

replace with my template

```shell
cp -R ./mybatis-plus3 /Users/HarveySuen/Library/Application\ Support/JetBrains/IntelliJIdea2023.2/extensions/com.baomidou.plugin.idea.mybatisx/templates/
```

generate code

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810619.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810620.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810621.png)

# Redis Cache

使用 Redis 来做 Lv2 Cache

```properties
mybatis-plus.configuration.cache-enabled: true
```

```java
@Configuration
@EnableCaching
public class CacheConfiguration {}
```

配置 SpringBoot Redis

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

```properties
spring.redis.host=127.0.0.1
spring.redis.port=6379
spring.redis.database=0
```

指定 Mapper 开启 Lv2 Cache, 通过该 Mapper 查询数据后, 会自动缓存到 Redis

```java
@Mapper
@CacheNamespace
public interface UserMapper {}
```
