# MyBatis

spring-boot-starter-jdbc 可以配置 DataSource, JdbcTemplate, Transaction

mybatis-spring-boot-autoconfigure 可以配置 SqlSessionFactory, SqlSessionTemplate

通过 MapperScannerRegister.class 扫描 pkg, 给 Mapper Interface 创建 proxy Obj 配置成 Bean

import dependency

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.1</version>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

set datasource

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/db?serverTimezone=UTC&characterEncoding=utf8&useUnicode=true&useSSL=false&rewriteBatchedStatements=true
spring.datasource.username=root
spring.datasource.password=111
```

set Domain

```java
@Data
public class User {
    private Integer id;
    private String name;
    private Integer age;
    private String sex;
}
```

set Mapper Interface

```java
@Mapper
public interface UserMapper {
    public List<User> getUserList();
}
```

set Mapper XML 

```xml
<mapper namespace="com.harvey.mapper.UserMapper">
    <select id="selectAll" resultType="com.harvey.domain.User">
        select * from users;
    </select>
</mapper>
```

set Mapper XML location

```properties
mybatis.mapper-locations=classpath*:**/mapper/*Mapper.xml
```

Test

```java
@SpringBootTest
class SpringProjectApplicationTests {
    @Autowired
    private UserMapper userMapper;
    
    @Test
    void contextLoads() {
        List<User> userList = userMapper.getUserList();
    }
}
```

# MyBatis Process

- MyBatis 读取 XML, Annotation 和 Profile 加载 Env 和 Mapping File, 构建 SqlSessionFactory
    - SqlSessionFactory 全局唯一, 可以批量生产 SqlSession
- SqlSessionFactory 创建 SqlSession
    - SqlSession 包含需要执行的 SQL, 一次操作就是一个 SqlSession
- Executor 读取 MappedStatement, 封装 JDBC, 执行 DB Operation
    - MappedStatement 包含了各种信息 (eg: Resource Path, Mapper Id, SQL, ResultMaps)
    - Execturo 和 DB 交互时, 还需要转换 MappedStatement 的数据类型, 将 Java Type 转换为 DB Type, 操作 DB, 再将 DB Type 转换为 Java Type 操作 Java Obj

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221740211.png)

# Auto Camel Case Mapping

自动驼峰命名: 自动将 SQL 字段 的 user-name 转成 domain 属性 的 userName

```properties
mybatis.configuration.map-underscore-to-camel-case=true
```

# Mapper Location

```properties
mybatis.mapper-locations=classpath:/com/harvey/mapper/*.xml
```

# Hikari Connection Pool

Hikari 是 Spring 默认的连接池, 可以省略配置

```properties
spring.datasource.type=com.zaxxer.hikari.HikariDataSource
```

# Durid Connection Pool

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.2.16</version>
</dependency>
```

```properties
spring.datasource.type=com.alibaba.druid.pool.DruidDataSource
```

# Log

```properties
mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

# @ResultMap

```java
@Select("select * from users where id = #{id}")
@ResultMap("userResultMap")
User select(int id);
```

```xml
<resultMap id="userResultMap" type="com.harvey.domain.User">
    <id column="user_id" property="userId"/>
    <result column="user_name" property="userName"/>
    <result column="user_age" property="userAge"/>
</resultMap>
```

# @Results

```java
@Results({
        @Result(column = "user_name", property = "userName"),
        @Result(column = "user_age", property = "userAge")
})
@Select("select * from users where id = #{id}")
User select(int id);
```

# @One

User 和 IdCard 是 1:1 的关系, 需要使用 @One

这里调用 getUserById() 后, 就会自动调用指定的 getIdCardByUserId 查询 IdCard 填充数据到本次查询的 idCard Field 中

```java
@Select("SELECT * FROM user WHERE id=#{id}")
@Results({
    @Result(property = "id", column = "id"),
    @Result(property = "name", column = "name"),
    @Result(property = "idCard", column = "id", 
            one = @One(select = "com.example.mapper.IdCardMapper.getIdCardByUserId"))
})
User getUserById(@Param("id") Integer id);
```

# @Many

User 和 Order 是 1:n 的关系, 需要使用 @Many

这里调用 getUserById() 后, 就会自动调用指定的 getOrdersByUserId 查询 orders 填充数据到本次查询的 orders Field 中

```java
@Select("SELECT * FROM user WHERE id=#{id}")
@Results({
    @Result(property = "id", column = "id"),
    @Result(property = "name", column = "name"),
    @Result(property = "orders", column = "id", 
            many = @Many(select = "com.example.mapper.OrderMapper.getOrdersByUserId"))
})
User getUserById(@Param("id") Integer id);
```

# acheive simple param

```java
User selectByCondition(@Param("username") String name, Integer password);
```

```java
User user = userMapper.selectByCondition("sun", "111");
```

# achieve Domain param

```java
User selectByCondition(User user);
```

```java
User user = userMapper.selectByCondition(new User("sun", "111"));
```

# achieve Map param

```java
User selectByCondition(Map map);
```

```java
HashMap hashMap = new HashMap();
hashMap.put("username", "sun");
hashMap.put("password", "111")
User user = userMapper.selectByCondition(hashMap);
```

# param substitution

#{} 替换 SQL, 不存在 SQL Injection

```xml
<mapper namespace="com.harvey.mapper.UserMapper">
    <select id="selectById" resultType="com.harvey.domainUser">
        select * from users where id = #{id}
    </select>
</mapper>
```

${} 拼接 SQL, 存在 SQL Injection

```xml
<mapper namespace="com.harvey.mapper.UserMapper">
    <select id="selectById" resultType="com.harvey.domainUser">
        select * from users where id = ${id}
    </select>
</mapper>
```

# select

```java
public interface UserMapper {
    List<User> selectAll();
}
```

```xml
<mapper namespace="com.harvey.mapper.UserMapper">
    <select id="selectAll" resultType="com.harvey.domain.User">
        select * from users;
    </select>
</mapper>
```

```java
InputStream is = Resources.getResourceAsStream("mybatis-config.xml");
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(is);
SqlSession session = factory.openSession();
UserMapper userMapper = session.getMapper(UserMapper.class);
List<User> users = userMapper.selectAll();
session.close();
```

# insert

```java
public interface UserMapper {
    void insert(User user);
}
```

```xml
<mapper namespace="com.harvey.mapper.UserMapper">
    <insert id="insert">
        insert into users (name, age, sex) values (#{name}, #{age}, #{sex});
    </insert>
</mapper>
```

```java
InputStream is = Resources.getResourceAsStream("mybatis-config.xml");
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(is);
SqlSession session = factory.openSession();
UserMapper userMapper = session.getMapper(UserMapper.class);
User user = new User();
user.setName("sun");
user.setAge(18);
user.setSex("F");
userMapper.insert(user);
session.commit();
session.close();
```

# update

```java
public interface UserMapper {
    void updateById(User user);
}
```

```xml
<mapper namespace="com.harvey.mapper.UserMapper">
    <update id="updateById" parameterType="integer">
        update users set name = #{name}, age = #{age} where id = #{id};
    </update>
</mapper>
```

```java
InputStream is = Resources.getResourceAsStream("mybatis-config.xml");
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(is);
SqlSession session = factory.openSession();
UserMapper userMapper = session.getMapper(UserMapper.class);
User user = new User();
user.setId(1);
user.setName("sun");
user.setAge(18);
userMapper.updateById(user);
session.commit();
session.close();
```

# delete

```java
public interface UserMapper {
    void deleteById(Integer id);
}
```

```xml
<mapper namespace="com.harvey.mapper.UserMapper">
    <delete id="deleteById" parameterType="integer">
        delete from users where id = #{id};
    </delete>
</mapper>
```

```java
InputStream is = Resources.getResourceAsStream("mybatis-config.xml");
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(is);
SqlSession session = factory.openSession();
UserMapper userMapper = session.getMapper(UserMapper.class);
userMapper.deleteById(1);
session.commit();
session.close();
```

# dynamic where

```xml
<select id="selectByCondition" resultType="com.harvey.domain.User">
    select *
    from users
    <where>
        <!-- 如果不满足 test 条件, 会删除 <if> -->
        <if test="name != null and name != ''">
            and name = #{name}
        </if>
        <if test="sex != null and sex != ''">
            and sex = #{sex}
        </if>
        <if test="age != null and age != 0">
            and age = #{age}
        </if>
    </where>
</select>
```

# dynamic choose

```xml
<select id="selectByCondition" resultType="com.harvey.domain.User">
    select *
    from users
    where
        <!-- <choose> 相当于 switch -->
        <choose>
            <!-- <when> 相当于 case -->
            <when test="name != null and name != ''">
                name = #{name}
            </when>
            <when test="age != null and age != 0">
                age = #{age}
            </when>
            <when test="sex != null and sex != ''">
                sex = #{sex}
            </when>
            <!-- <otherwise> 相当于 default -->
            <otherwise>
                1 = 1
            </otherwise>
        </choose>
</select>
```

# dynamic set

```xml
<update id="update">
    update users
    <set>
        <if test="name != null and name != ''">
            name = #{name}, 
        </if>
        <if test="age != null and age != ''">
            age = #{age}, 
        </if>
    </set>
    where id = #{id}
</update>
```

# batch operation

```java
List<User> selectByIds(@Param("ids") Integer[] ids);
```

```xml
<mapper namespace="com.harvey.mapper.UserMapper">
    <select id="selectByIds" resultType="com.harvey.domain.User">
        select *
        from users
        where id in (
            <!-- <foreach> 遍历 ids, 通过 "," 分割, 相当于 where id in (1, 2, 3, 4, 5) -->
            <foreach collection="ids" item="id" separator=",">
                #{id}
            </foreach>
        )
    </select>
</mapper>
```

```java
List<User> users = userMapper.selectByIds(new int[]{1, 2, 3, 4 ,5});
session.close();
```

replace brackets with open attr and close attr

```xml
<select id="selectByIds" resultType="com.harvey.domain.User">
    select *
    from users
    where id in
    <!-- <foreach> 遍历 ids, 通过 "," 分割, 相当于 where id in (1, 2, 3, 4, 5) -->
    <foreach collection="ids" item="id" separator="," open="(" close=")">
        #{id}
    </foreach>
</select>
```

# col alias

如果 SQL Col name 和 Domian Field name 不相同, 会匹配失败

```xml
<insert id="insert", resultType="com.harvey.domain.User">
    insert into users (user_name, user_age) values (#{userName}, #{userAge});
</insert>
```

# SQL alias 

```xml
<select id="selectAll" resultType="com.harvey.domain.User">
    select user_name as userName from users;
</select>
```

抽出 SQL Snippet

```xml
<sql id="user_column">
    user_name as userName, user_age as userAge, user_sex as userSex
</sql>

<select id="select">
    select <include refid="user_column"/> from users;
</select>
```

# ResultMap

```xml
<resultMap id="userResultMap" type="com.harvey.domain.User">
    <!-- primary key alias, column 为 Col name, property 为 Field name-->
    <id column="user_id" property="userId"/>
    <!-- col alias -->
    <result column="user_name" property="userName"/>
    <result column="user_age" property="userAge"/>
</resultMap>

<!-- 调用 userResultMap, 上面配置 type 了, 这里就不需要 resultType 属性了 -->
<select id="select" resultMap="userResultMap">
    select * from users;
</select>
```

# Generate Primary Key

generate primary key by XML prop

```xml
<!-- userGeneratedKey 开启自动生成 primary key, keyColumn 为 SQL Col name, keyProperty 为 Domain Field name -->
<insert id="insert" useGeneratedKeys="true" keyColumn="id" keyProperty="id">
    insert into users (name, age, sex) values (#{name}, #{age}, #{sex});
</insert>
```

get primary key

```java
User user = new User("sun", 18, "F");
userMapper.insert(user);
System.out.println(user.getId());
```

generate primary key by Annotation prop

```java
@Options(useGeneratedKeys = true, keyColumn = "id", keyProperty = "id")
@Insert("insert into users (name, age, sex) values (#{name}, #{age}, #{sex});")
User select(User user);
```

# SqlSession

在 Spring Boot 中，MyBatis 是通过 SqlSessionTemplate 来管理 SqlSession 的。SqlSessionTemplate 是 MyBatis-Spring 提供的一个模板类，它对 SqlSession 进行了封装，并负责管理 SqlSession 的生命周期，确保在使用过程中资源能够正确释放。

- 事务范围内共享 SqlSession：SqlSessionTemplate 会在同一个事务中复用 SqlSession，在一个事务范围内，多个 Mapper 方法调用共享同一个 SqlSession 实例。
- 自动提交和关闭：SqlSessionTemplate 会根据事务配置在事务结束时自动提交或回滚，并在操作完成后自动关闭 SqlSession，不需要手动管理。
- 线程安全：SqlSessionTemplate 是线程安全的，可以在多线程环境下使用，而不需要担心 SqlSession 的并发问题。

当调用 Mapper 的方法时，Spring Boot 项目中的 MyBatis 实际执行过程如下：

1. 注入 Mapper 接口：在 Spring Boot 中注入 Mapper 接口时，MyBatis-Spring 会为 Mapper 创建一个代理对象，该代理对象在执行方法时会委托给 SqlSessionTemplate。
2. 代理调用 SqlSessionTemplate：在 Mapper 的方法被调用时，代理对象会调用 SqlSessionTemplate 来获取 SqlSession，并执行对应的 SQL 操作。
3. 在事务范围内共享 SqlSession：SqlSessionTemplate 会在同一个事务内共享 SqlSession，这意味着在同一个事务中，即使调用多次 Mapper 方法，也会使用相同的 SqlSession。
4. 事务提交或回滚时关闭 SqlSession：SqlSessionTemplate 会在事务结束时自动提交或回滚 SqlSession，并释放资源。

# 懒加载机制

MyBatis 的懒加载机制主要用于优化性能，特别是在处理 一对多 和 多对一 的复杂关联关系时，避免不必要的 SQL 查询。为了更好地理解它的作用，下面通过一个具体的例子来说明。

假设有一个电商系统，其中包括 User 和 Order 两个实体，分别表示用户和订单，关系是一对多，即一个用户可以拥有多个订单。在数据库中，这种关系可能会设计为如下结构：

- User 表：存储用户基本信息，如 id、name。
- Order 表：存储订单信息，如 id、user_id、order_date，其中 user_id 是 User 表的外键。

假设我们有一个业务场景，只需要展示用户的基本信息，而不关心用户的订单信息。此时，如果没有懒加载机制，每次查询 User 时，MyBatis 可能会立即加载与之相关联的 Order 信息，也就是进行一次 额外的 SQL 查询 来获取订单数据。这种加载方式叫做 立即加载（Eager Loading）。

在懒加载开启时，只有在明确需要订单信息的时候，MyBatis 才会查询 Order 表，获取订单数据。这种按需加载的方式可以显著提升性能，因为减少了不必要的数据库查询。

这里定义了 User 对象的查询 SQL，并通过 `<collection>` 标签设置与 Order 的关联

```xml
<mapper namespace="UserMapper">
    <select id="getUserById" resultMap="UserOrderMap">
        SELECT * FROM User WHERE id = #{id}
    </select>

    <resultMap id="UserOrderMap" type="User">
        <id property="id" column="id" />
        <result property="name" column="name" />
        <collection property="orders" ofType="Order" select="getOrdersByUserId" lazy="true" />
    </resultMap>

    <select id="getOrdersByUserId" resultType="Order">
        SELECT * FROM Order WHERE user_id = #{userId}
    </select>
</mapper>
```

我们这里调用 getUserById 获取到 user 对象后，只使用了 name 属性，并未访问 orders 列表。由于懒加载的存在，getOrdersByUserId 方法不会被调用，Order 表的数据不会查询，节省了数据库资源。

```java
User user = mapper.getUserById(1);
System.out.println("User Name: " + user.getName());
```

只有在访问 orders 时，MyBatis 才会调用 getOrdersByUserId 查询 Order 表的数据，将结果填充到 orders 列表中。

```java
List<Order> orders = user.getOrders();
for (Order order : orders) {
    System.out.println("Order Date: " + order.getOrderDate());
}
```

# 懒加载机制的底层原理

MyBatis 的懒加载底层是通过 动态代理模式 和 懒加载触发器 实现的。其核心是在访问关联属性时，通过代理对象延迟查询数据。

MyBatis 懒加载的主要实现组件包括：

- 代理对象：用于延迟加载的属性并不是直接加载，而是通过一个代理对象来控制何时加载。
- LazyLoader：懒加载触发器，负责在访问代理对象属性时触发实际的 SQL 查询。
- ResultLoader：在真正执行 SQL 查询时使用，负责将查询结果映射到目标属性中。

当查询 User 对象时，MyBatis 并不会直接查询并填充 orders 集合，而是创建一个代理对象，通过动态代理的方式来延迟加载 orders 集合。在 MyBatis 中，懒加载的代理对象创建主要通过 CglibProxyFactory 或 JavassistProxyFactory 实现：

```java
public Object createProxy(Target target) {
    // 判断是否启用 CGLIB 或 Javassist
    if (proxyFactory instanceof CglibProxyFactory) {
        return ((CglibProxyFactory) proxyFactory).createProxy(target);
    } else {
        return ((JavassistProxyFactory) proxyFactory).createProxy(target);
    }
}
```

在代理对象被创建的同时，MyBatis 会创建一个 LazyLoader，LazyLoader 中包含了目标对象和需要懒加载的 SQL 语句。当用户访问 orders 属性时，代理对象会检测到这一访问，并调用 LazyLoader 触发懒加载。

```java
public class LazyLoader {
    private final MetaObject metaObject;
    private final ResultLoader resultLoader;
    private boolean loaded;

    public LazyLoader(MetaObject metaObject, ResultLoader resultLoader) {
        this.metaObject = metaObject;
        this.resultLoader = resultLoader;
        this.loaded = false;
    }

    public boolean load() throws SQLException {
        if (!loaded) {
            resultLoader.loadResult();
            loaded = true;
            return true;
        }
        return false;
    }
}
```

LazyLoader 调用 ResultLoader 来执行 SQL 查询并填充目标属性。ResultLoader 的核心逻辑如下：

```java
public Object loadResult() throws SQLException {
    final Statement stmt = configuration.newStatementHandler(...).prepareStatement();
    ResultSet rs = stmt.executeQuery();
    Object result = resultHandler.handleResultSets(rs);
    metaObject.setValue(property, result);
    return result;
}
```

当调用 User 的目标方法（如 getOrders()）之前，代理会首先判断该方法是否是懒加载属性的方法（如 orders 属性的 getOrders()），如果是，则会触发数据库查询操作，将数据加载到该属性中。

```java
public class CglibLazyLoader implements MethodInterceptor {
    private final ResultLoaderMap lazyLoader;
    private final MetaObject metaObject;
    private final String objectFactory;

    @Override
    public Object intercept(Object object, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        // 检查当前方法是否为懒加载属性的方法
        if (lazyLoader.size() > 0 && lazyLoader.hasLoader(method.getName())) {
            lazyLoader.load(method.getName());
        }
        return methodProxy.invokeSuper(object, args); // 调用真实的方法
    }
}
```

hasLoader() 是 MyBatis 懒加载机制中用于检查某个属性是否需要加载的一个方法。它在 ResultLoaderMap 类中实现，用于判断懒加载属性是否已经存在相应的 ResultLoader，从而确定是否需要触发 SQL 查询。下面将详细解析 hasLoader() 方法的源码及其作用。

ResultLoaderMap 是 MyBatis 中的一个重要组件，用于管理懒加载的属性。它维护了一个 loaderMap，其中存储了需要懒加载的属性与其对应的 ResultLoader。ResultLoader 包含执行 SQL 查询的全部信息，包括查询语句、参数以及映射规则。

```java
public final class ResultLoaderMap {
    private final Map<String, ResultLoader> loaderMap = new HashMap<>();

    public boolean hasLoader(String property) {
        return loaderMap.containsKey(property);
    }

    public void addLoader(String property, MetaObject metaResultObject, ResultLoader resultLoader) {
        loaderMap.put(property, resultLoader);
    }

    public void load(String property) throws SQLException {
        ResultLoader loader = loaderMap.remove(property);
        if (loader != null) {
            loader.loadResult();
        }
    }
}
```

全局配置 Lazy Loading

```properties
# 全局开启或关闭 Lazy Loading (def: true)
mybatis.configuration.lazy-loading-enabled=true

# 开启后, 会一次性加载该对象全部的延迟属性, 关闭后, 会按需加载延迟属性  (def: true)
mybatis.configuration.aggressive-lazy-loading=true
```

局部配置 Lazy Loading

```java
@Select("select * from user where id = #{id}")
@Result(property = "id", column = "id", one = @One(fetchType = FetchType.LAZY))
User getUserById(int id);
```

# 一级缓存

一级缓存是 MyBatis 的本地缓存，作用范围是单个 SqlSession，默认开启。一级缓存的特点是，同一个 SqlSession 对象中执行相同查询时会直接从缓存中获取结果，避免重复查询数据库。

```java
// 开启一个 SqlSession
SqlSession session = sqlSessionFactory.openSession();
UserMapper mapper = session.getMapper(UserMapper.class);

// 第一次查询，发送 SQL 查询数据库
User user1 = mapper.getUserById(1);
System.out.println("第一次查询用户：" + user1);

// 第二次查询相同的 ID，命中一级缓存，不会发送 SQL
User user2 = mapper.getUserById(1);
System.out.println("第二次查询用户：" + user2);

session.close();  // 关闭 SqlSession
```

- 第一次查询 getUserById(1) 时，MyBatis 会执行 SQL 查询数据库并将结果放入一级缓存。
- 第二次查询 getUserById(1) 时，由于 SqlSession 没有关闭，一级缓存生效，所以 MyBatis 不会发送 SQL，而是直接从缓存中读取结果。

在以下情况下，一级缓存会失效，从而再次查询数据库：

- 不同的 SqlSession：一级缓存只在当前 SqlSession 中有效，不同的 SqlSession 无法共享缓存。
- 执行了更新操作：在执行 INSERT、UPDATE 或 DELETE 后，一级缓存会被清空。
- 手动清空缓存：调用 session.clearCache() 可以手动清空一级缓存。

# 二级缓存

二级缓存是 MyBatis 的全局缓存，作用范围是 Mapper 映射文件范围。二级缓存可以在不同的 SqlSession 间共享，但默认是关闭的，需要手动配置开启。

```xml
<configuration>
    <settings>
        <!-- 启用二级缓存 -->
        <setting name="cacheEnabled" value="true"/>
    </settings>
</configuration>
```

```java
// 第一次查询，使用第一个 SqlSession
SqlSession session1 = sqlSessionFactory.openSession();
UserMapper mapper1 = session1.getMapper(UserMapper.class);

// 第一次查询，发送 SQL 查询数据库，并将结果存入二级缓存
User user1 = mapper1.getUserById(1);
System.out.println("第一次查询用户：" + user1);
session1.close();  // 关闭 SqlSession，数据会存入二级缓存

// 第二次查询，使用另一个 SqlSession
SqlSession session2 = sqlSessionFactory.openSession();
UserMapper mapper2 = session2.getMapper(UserMapper.class);

// 第二次查询相同的 ID，此时从二级缓存中读取，不会发送 SQL
User user2 = mapper2.getUserById(1);
System.out.println("第二次查询用户：" + user2);

session2.close();
```

- 第一次查询 getUserById(1) 会发送 SQL 查询数据库，并将结果存入二级缓存。
- session1.close() 关闭时，MyBatis 会将一级缓存的数据提交到二级缓存。
- 第二次查询使用不同的 SqlSession，但是由于二级缓存已启用且有数据，因此 MyBatis 会直接从二级缓存中获取结果，避免了数据库查询。

二级缓存会在以下情况下失效：

- 执行增、删、改操作：当执行 INSERT、UPDATE 或 DELETE 操作时，二级缓存会清空，保证数据一致性。
- 不同 Mapper 之间无法共享缓存：二级缓存的作用范围是 Mapper 文件，每个 Mapper 有独立的二级缓存。
- 手动清空缓存：可以通过 sqlSessionFactory.getConfiguration().getCache("namespace").clear() 手动清空某个 Mapper 的二级缓存。