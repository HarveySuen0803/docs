# MyBatis

project structure

```
maven-demo
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── harvey
    │   │           ├── Main.java
    │   │           └── domain
    │   │               └── User.java
    │   └── resources
    │       ├── UserMapper.xml
    │       └── mybatis-config.xml
    └── test
        └── java
```

导入依赖 (file. pom.xml)

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.32</version>
</dependency>
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.13</version>
</dependency>
```

配置 Domain (file. domain/User.java)

```java
package com.harvey.domain;

// User Domain 映射 user Table
public class User {
    Integer id;
    String name;
    Integer age;
    String sex;

    // ...
}
```

配置 Mapper (file. mapper/UserMapper.xml)

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="UserMapper">
    <!-- resultType 为返回类型 (如果报错, 需要在 IDEA 中配置数据库连接) -->
    <select id="selectAll" resultType="com.harvey.domain.User">
        select * from users;
    </select>
</mapper>
```

配置 MyBatis (file. mybatis-config.xml)

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">

<configuration>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <!-- 配置 JDBC -->
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.jdbc.Driver"/>
                <!-- mysql版本过新, 会报出 "The server time zone value...", 需要添加 serverTimezone=UTC -->
                <property name="url" value="jdbc:mysql://localhost:3306/db?serverTimezone=UTC"/>
                <property name="username" value="root"/>
                <property name="password" value="111"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <!-- 加载 UserMapper.xml -->
        <mapper resource="UserMapper.xml"/>
    </mappers>
</configuration>
```

Test

```java
// 加载 mybatis-config.xml
InputStream is = Resources.getResourceAsStream("mybatis-config.xml");
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(is);
SqlSession session = factory.openSession();
// 执行 SQL, user.selectAll 为 UserMapper.xml 的 namespace.id
List<Object> users = session.selectList("user.selectAll");
session.close();
```

# Mapper Interface

通过 namespace.id 指定 SQL Mapping, 存在 coupling

配置 UserMapper.java 对应 UserMapper.xml, 调用 Method 执行 SQL Mapping, 解决 coupling

```java
UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
List<User> users = userMapper.selectAll();
```

projct structure

```
maven-demo
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── harvey
    │   │           ├── Main.java
    │   │           ├── mapper
    │   │           │   └── UserMapper.java
    │   │           └── domain
    │   │               └── User.java
    │   └── resources
    │       ├── com
    │       │   └── harvey
    │       │       └── mapper
    │       │           └── UserMapper.xml
    │       └── mybatis-config.xml
    └── test
        └── java
```

compile 后, UserMapper.java 和 UserMapper.xml 合并到 target/classes/com/harvey/mapper/\*

```
maven-demo
└── target
    ├── classes
    │   ├── com
    │   │   └── harvey
    │   │       ├── Main.class
    │   │       ├── mapper
    │   │       │   ├── UserMapper.class
    │   │       │   └── UserMapper.xml
    │   │       └── domain
    │   │           └── User.class
    │   └── mybatis-config.xml
    └── generated-sources
        └── annotations
```

UserMapper.java

```java
public interface UserMapper {
    List<User> selectAll();
}
```

UserMapper.xml

```xml
<mapper namespace="com.harvey.mapper.UserMapper">
    <select id="selectAll" resultType="com.harvey.domain.User">
        select * from users;
    </select>
</mapper>
```

mybatis-config.xml

```xml
<mappers>
    <!-- 加载 UserMapper.xml -->
    <mapper resource="com.harvey.mapper.UserMapper.xml"/>
</mappers>
```

Test

```java
InputStream is = Resources.getResourceAsStream("mybatis-config.xml");
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(is);
SqlSession session = factory.openSession();
// 获取 UserMapper
UserMapper userMapper = session.getMapper(UserMapper.class);
// 调用 selectAll() 执行 UserMapper.xml 的 SQL Mapping, 相当于 session.selectList("namespace.id");
List<User> users = userMapper.selectAll();
session.close();
```

# load SQL Mapper

加载 Mapper file

```xml
<mappers>
    <mapper resource="com.harvey.mapper.UserMapper.xml"/>
    <mapper resource="com.harvey.mapper.ArticleMapper.xml"/>
    <mapper resource="com.harvey.mapper.AccountMapper.xml"/>
</mappers>
```

加载 Mapper pkg

```xml
<mappers>
    <package name="com.harvey.mapper"/>
</mappers>
```

# multiple environment

```xml
<!-- use development environment -->
<environments default="development">
    <!-- development environment -->
    <environment id="development">
        <transactionManager type="JDBC"/>
        <dataSource type="POOLED">
            <property name="driver" value="com.mysql.jdbc.Driver"/>
            <property name="url" value="jdbc:mysql://localhost:3306/db?serverTimezone=UTC"/>
            <property name="username" value="root"/>
            <property name="password" value="111"/>
        </dataSource>
    </environment>
    <!-- test environment -->
    <environment id="test">
        <transactionManager type="JDBC"/>
        <dataSource type="POOLED">
            <property name="driver" value="com.mysql.jdbc.Driver"/>
            <property name="url" value="jdbc:mysql://localhost:3306/db1?serverTimezone=UTC"/>
            <property name="username" value="root"/>
            <property name="password" value="111"/>
        </dataSource>
    </environment>
</environments>
```

# type alias

单独配置别名

```xml
<!-- <typeAliases> 需要在 <environments> 前面 -->
<typeAliases>
    <!-- com/harvey/domain/User 别名为 user -->
    <typeAlias type="com.harvey.domain.User" alias="user"/>
</typeAliases>

<environments default="development"></environments>
```

统一配置别名

```xml
<typeAliases>
    <!-- com/harvey/domain/** 别名为小写 Cls name (eg. User 别名为 user) -->
    <package name="com.harvey.domain"/>
</typeAliases>
```

使用别名

```xml
<mapper namespace="com.harvey.mapper.UserMapper">
    <!-- 设置 ret type 为 com/harvey/mapper/User 的别名 user -->
    <select id="selectAll" resultType="user">
        select * from users;
    </select>
</mapper>
```

# Annotation SQL

接口中通过注解编写 SQL, 不需要在 SQL 映射文件 里编写 SQL 了

```java
@Select("select * from users where id = #{id}")
User select(int id);

@Select("select * from users where name = #{name} and age = #{age}")
User select(@Param("name") String name, @Param("age") Integer age);
```

# auto camel case mapping

mybatis-config.xml, 配置自动驼峰命名映射 (eg. user_name 自动重命名为 userName)

```xml
<configuration>
    <settings>
      <setting name="mapUnderscoreToCamelCase" value="true"/>
    </settings>
</configuration>
```

# SqlSessionFactory Utils

封装一个 SqlSessionFactoryUtils, 返回一个 静态 SqlSessionFactory, 减少重复代码, 减少连接池的连接次数

```java
public class SqlSessionFactoryUtils {
    private static SqlSessionFactory factory;

    static {
        try {
            InputStream is = Resources.getResourceAsStream("mybatis-config.xml");
            factory = new SqlSessionFactoryBuilder().build(is);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    public static SqlSessionFactory getSqlSessionFactory() {
        return factory;
    }
}
```

```java
SqlSessionFactory factory = SqlSessionFactoryUtils.getSqlSessionFactory();
SqlSession session = factory.openSession();
session.close();
```

