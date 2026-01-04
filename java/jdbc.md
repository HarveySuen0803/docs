# JDBC

JDBC: 统一数据库接口, 完成对各种数据库的操作

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170913397.png)

```java
import com.mysql.cj.jdbc.Driver;

import java.sql.Connection;
import java.sql.Statement;
import java.util.Properties;

public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        // 注册驱动 (导入 mysql-connector.jar 到 libs 目录, 再 add as library)
        Driver driver = new Driver();

        String url = "jdbc:mysql://localhost:3306/db";

        Properties properties = new Properties();
        properties.setProperty("user", "root");
        properties.setProperty("password", "111");

        // 连接数据库
        Connection connection = driver.connect(url, properties);

        String sql = "insert into users (name, age, sex) values ('sun', '18', 'M')";

        Statement statement = connection.createStatement();

        // 执行 sql, 返回结果对象
        int rows = statement.executeUpdate(sql);

        System.out.println(rows > 0 ? "success" : "failure");

        // 结束资源
        statement.close();
        connection.close();
    }
}
```

# JDBC Design Pattern

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170913398.png)

# JDBC API

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170913399.png)

# Connection

直接创建 Driver 对象实例

```java
Driver driver = new Driver();

String url = "jdbc:mysql://localhost:3306/db";

Properties properties = new Properties();
properties.setProperty("user", "root");
properties.setProperty("password", "111");

Connection connection = driver.connect(url, properties);
```

通过反射创建 Driver 对象实例

```java
Class<?> cls = Class.forName("com.mysql.cj.jdbc.Driver");

Driver driver = (Driver) cls.getDeclaredConstructor().newInstance();

String url = "jdbc:mysql://localhost:3306/db";

Properties properties = new Properties();
properties.setProperty("user", "root");
properties.setProperty("password", "111");

Connection connection = driver.connect(url, properties);
```

通过 DriverManager 替换 Driver, 进行统一管理

```java
Class<?> cls = Class.forName("com.mysql.cj.jdbc.Driver");

Driver driver = (Driver) cls.getDeclaredConstructor().newInstance();

String url = "jdbc:mysql://localhost:3306/db";
String user = "root";
String password = "111";

Connection connection = DriverManager.getConnection(url, user, password);
```

Class.forName() 反射时, 触发类加载, Driver 内部的静态代码块会自动创建 Driver 对象, 无需再手动创建 Driver 对象了 (推荐)

```java
Class.forName("com.mysql.cj.jdbc.Driver");

String url = "jdbc:mysql://localhost:3306/db";
String user = "root";
String password = "111";

Connection connection = DriverManager.getConnection(url, user, password);
```

jdbc 5.1.6 后, 无需调用 Class.forName() 注册驱动了 (推荐)

```java
String url = "jdbc:mysql://localhost:3306/db";
String user = "root";
String password = "111";

Connection connection = DriverManager.getConnection(url, user, password);
```

读取 Properties 配置文件, 连接数据库, 更灵活 (推荐)

```properties
user=root
password=111
url=jdbc:mysql://localhost:3306/db
driver=com.mysql.cj.jdbc.Driver
```

```java
Properties properties = new Properties();
properties.load(new FileInputStream("src/mysql.properties"));
String url = properties.getProperty("url");
String user = properties.getProperty("user");
String password = properties.getProperty("password");
String driver = properties.getProperty("driver");

Connection connect = DriverManager.getConnection(url, user, password);
```

# ResultSet

```java
Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/db", "root", "111");
Statement statement = connection.createStatement();

String sql = "select id, name, age, sex from users";
// 执行 SQL, 返回查询结果
ResultSet resultSet = statement.executeQuery(sql);
// resultSet.next() 指向下一条记录, 并判断下一条是否存在
while (resultSet.next()) {
    // 根据 index, 返回 value
    int id = resultSet.getInt(1);
    String name = resultSet.getString(2);
    int age = resultSet.getInt(3);
    String sex = resultSet.getString(4);
    // 根据 key, 返回 value
    int id1 = resultSet.getInt("id");
    String name1 = resultSet.getString("name");

    System.out.println(id + " " + name + " " + age + " " + sex);
}

resultSet.close();
statement.close();
connection.close();
```

# SQL Injection

Statement 存在 SQL Injection

PrepareStatement 会对 SQL 进行预处理, 不需要 "+" 拼接字符串, 不存在 SQL Injection

```java
Scanner scanner = new Scanner(System.in);
// name 输入 1' or
String name = scanner.nextLine();
// password 输入 or '1' = '1
String password = scanner.nextLine();
// select * from accounts where name = '1' or' and password = 'or '1' = '1';
String sql = "select * from accounts where name = '" + name + "' and password = '" + password + "';";
```

```sql
select * from accounts where name = '1' or ' and password = ' or '1' = '1';
```

# Statement

```java
Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/db", "root", "111");
Statement statement = connection.createStatement();

String sql = "select * from users where name = 'sun'";
// executeUpdate(String sql) 执行 DML, 返回影响的行数
// executeQuery(String sql) 执行 DQL, 返回 ResultSet 对象
// execute(String sql) 执行 SQL, 返回 boolean
ResultSet resultSet = statement.executeQuery(sql);
if (resultSet.next()) {
    System.out.println("success");
} else {
    System.out.println("failure");
}

resultSet.close();
statement.close();
connection.close();
```

# PrepareStatement

```java
Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/db", "root", "111");
// 通过 占位符 "?" 占位
String sql = "select * from users where name = ? and age = ?;";
PreparedStatement preparedStatement = connection.prepareStatement(sql);
// 给占位符赋值
preparedStatement.setString(1, "sun");
preparedStatement.setInt(2, 18);
// executeUpdate() 执行 DML, 返回影响的行数
// executeQuery() 执行 DQL, 返回 ResultSet 对象
// execute() 执行 SQL, 返回 boolean
ResultSet resultSet = preparedStatement.executeQuery();
if (resultSet.next()) {
    System.out.println("success");
} else {
    System.out.println("failure");
}

resultSet.close();
preparedStatement.close();
connection.close();
```

# precompiled SQL

预编译 SQL: 带 "?" 的 SQL

```sql
select * from users where name = ? and age = ?;
```

预编译 SQL 的优点

- 性能更强: 执行一条 SQL 需要经过语法解析, 优化, 编译, 缓存, 下一次执行 SQL 时, 会先访问缓存, 查询是否有相同的 SQL, 预编译 SQL 结构相同, 大多可以直接使用缓存
- 防止 SQL 注入

# Connection Pooling

JDBC 使用 DriverManager 获取数据库连接的问题

- 频繁的连接操作, 占用过多
- 每次使用完都需要断开连接
- 连接数据量过多时, 程序容易崩溃, 导致泄漏内存

连接池: 管理连接, 预先在缓冲池中放入一些连接, 需要连接时, 只需要从缓冲池中取出连接, 使用完毕再放回

- 连接数量过多时, 请求会加入等待队列

## C3P0

```java
import com.mchange.v2.c3p0.ComboPooledDataSource;

import java.sql.*;

public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        // 导入 C3P0.jar
        ComboPooledDataSource cpds = new ComboPooledDataSource();
        // 设置连接参数
        cpds.setDriverClass("com.mysql.cj.jdbc.Driver");
        cpds.setJdbcUrl("jdbc:mysql://localhost:3306/db");
        cpds.setUser("root");
        cpds.setPassword("111");
        // 初始化连接 10 个, 后续可以增长
        cpds.setInitialPoolSize(10);
        // 最大连接 50 个, 超出就需要加入等待队列
        cpds.setMaxPoolSize(50);
        Connection connection = cpds.getConnection();

        connection.close();
    }
}
```

通过 c3p0-config.xml 配置文件, 完成数据池连接

```xml
<c3p0-config>
    <named-config name="sun">
        <property name="driverClass">com.mysql.cj.jdbc.Driver</property>
        <property name="jdbcUrl">jdbc:mysql://127.0.0.1:3306/db</property>
        <property name="user">root</property>
        <property name="password">111</property>
        <property name="initialPoolSize">10</property>
        <!-- 每次增长的连接数 -->
        <property name="acquireIncrement">5</property>
        <property name="minPoolSize">5</property>
        <property name="maxPoolSize">50</property>
        <!-- 最多可连接的命令对象数 -->
        <property name="maxStatements">5</property>
        <!-- 每个对象最多可连接的命令对象数 -->
        <property name="maxStatementsPerConnection">2</property>
    </named-config>
</c3p0-config>
```

```java
import com.mchange.v2.c3p0.ComboPooledDataSource;

import java.sql.*;

public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        ComboPooledDataSource cpds = new ComboPooledDataSource("sun");
        Connection connection = cpds.getConnection();
        connection.close();
    }
}
```

## Druid

```java
import com.alibaba.druid.pool.DruidDataSourceFactory;

import javax.sql.DataSource;
import java.sql.*;
import java.util.Properties;

public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws Exception {
        Properties properties = new Properties();
        properties.setProperty("driverClassName", "com.mysql.cj.jdbc.Driver");
        properties.setProperty("url", "jdbc:mysql://localhost:3306/db");
        properties.setProperty("username", "root");
        properties.setProperty("password", "111");
        // 初始化连接数
        properties.setProperty("initialSize", "10");
        // 空闲连接数, 相当于最小连接数
        properties.setProperty("minIdle", "5");
        // 最大连接数
        properties.setProperty("maxActive", "50");
        // 最大等待时间
        properties.setProperty("maxWait", "5000");
        // 导入 druid.jar
        DataSource dataSource = DruidDataSourceFactory.createDataSource(properties);
        Connection connection = dataSource.getConnection();
        connection.close();
    }
}
```

# JDBC Utils

## JDBCUtils

配置 mysql.properties

```properties
user=root
password=111
url=jdbc:mysql://localhost:3306/db
driver=com.mysql.cj.jdbc.Driver
```

封装 JDBCUtils

```java
package utils;

import java.io.FileInputStream;
import java.sql.*;
import java.util.Properties;

public class JDBCUtils {
    private static String user;
    private static String password;
    private static String url;
    private static String driver;

    // 初始化
    static{
        try {
            Properties properties = new Properties();
            properties.load(new FileInputStream("src/mysql.properties"));
            user = properties.getProperty("user");
            password = properties.getProperty("password");
            url = properties.getProperty("url");
            driver = properties.getProperty("driver");
            Class.forName(driver);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // 建立连接
    public static Connection getConnection() {
        try {
            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    // 结束资源
    public static void close(ResultSet set, Statement statement, Connection connection) {
        try {
            if (set != null) {
                set.close();
            }
            if (statement != null) {
                statement.close();
            }
            if (connection != null) {
                connection.close();
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
```

处理 SQL

```java
Connection connection = null;
PreparedStatement preparedStatement = null;
ResultSet resultSet = null;
String sql = "select * from users where name = ? and age = ?";

try {
    connection = JDBCUtils.getConnection();
    preparedStatement = connection.prepareStatement(sql);
    preparedStatement.setString(1, "sun");
    preparedStatement.setInt(2, 18);
    resultSet = preparedStatement.executeQuery();
    if (resultSet.next()) {
        System.out.println("success");
    } else {
        System.out.println("failure");
    }
} catch (Exception e) {
    throw new RuntimeException(e);
} finally {
    JDBCUtils.close(resultSet, preparedStatement, connection);
}
```

## JDBCUtilsByDruid

配置 druid.properties

```properties
driverClassName=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/db
username=root
password=111
initialSize=10
minIdle=5
maxActive=50
maxWait=5000
```

封装 JDBCUtilsByDruid

```java
package utils;

import com.alibaba.druid.pool.DruidDataSourceFactory;

import javax.sql.DataSource;
import java.io.FileInputStream;
import java.sql.*;
import java.util.Properties;

public class JDBCUtilsByDruid {
    private static DataSource dataSource;

    static {
        try {
            Properties properties = new Properties();
            properties.load(new FileInputStream("src/druid.properties"));
            dataSource = DruidDataSourceFactory.createDataSource(properties);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Connection getConnection() {
        try {
            return dataSource.getConnection();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public static void close(ResultSet resultSet, Statement statement, Connection connection) {
        try {
            if (resultSet != null) {
                resultSet.close();
            }
            if (statement != null) {
                statement.close();
            }
            if (connection != null) {
                connection.close();
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
```

处理 SQL

```java
Connection connection = null;
PreparedStatement preparedStatement = null;
ResultSet resultSet = null;
String sql = "select * from users where name = ? and age = ?";
try {
    connection = JDBCUtilsByDruid.getConnection();
    preparedStatement = connection.prepareStatement(sql);
    preparedStatement.setString(1, "sun");
    preparedStatement.setInt(2, 18);
    resultSet = preparedStatement.executeQuery();
    if (resultSet.next()) {
        System.out.println("success");
    } else {
        System.out.println("failure");
    }
} catch (Exception e) {
    throw new RuntimeException(e);
} finally {
    JDBCUtilsByDruid.close(resultSet, preparedStatement, connection);
}
```

# Affair

```java
Connection connection = null;
PreparedStatement preparedStatement = null;
String sql1 = "update users set age = age + 1 where name = ?";
String sql2 = "update users set age = age - 1 where name = ?";

try {
    connection = JDBCUtilsByDruid.getConnection();
    // 关闭自动提交
    connection.setAutoCommit(false);
    // 执行 sql1
    preparedStatement = connection.prepareStatement(sql1);
    preparedStatement.setString(1, "sun");
    preparedStatement.executeUpdate();
    // 执行 sql2
    preparedStatement = connection.prepareStatement(sql2);
    preparedStatement.setString(1, "xue");
    preparedStatement.executeUpdate();
    // 手动提交
    connection.commit();
} catch (Exception e) {
    // 发生异常就回滚
    try {
        connection.rollback();
    } catch (SQLException ex) {
        throw new RuntimeException(ex);
    }
} finally {
    JDBCUtilsByDruid.close(null, preparedStatement, connection);
}
```

# Batch

批处理: 将多条 SQL 一次性提交给数据库进行批处理

配置 properties, 添加参数 rewriteBatchedStatements, 开启批处理

```properties
url=jdbc:mysql://localhost:3306/db?rewriteBatchedStatements=true
```

处理 SQL

```java
Connection connection = JDBCUtilsByDruid.getConnection();
String sql = "insert into users (name, age, sex) values (?, ?, ?)";
PreparedStatement preparedStatement = connection.prepareStatement(sql);
for (int i = 0; i < 50000; i++) {
    preparedStatement.setString(1, "sun");
    preparedStatement.setInt(2, 18);
    preparedStatement.setString(3, "F");
    // 将 SQL 添加到批处理包中
    preparedStatement.addBatch();
    // 满 100 条
    if ((i + 1) % 100 == 0) {
        // 执行批处理
        preparedStatement.executeBatch();
        // 清空批处理包
        preparedStatement.clearBatch();
    }
}
JDBCUtilsByDruid.close(null, preparedStatement, connection);
```

# domain

通过 resultSet 管理数据, 只可以访问一次数据, 关闭连接后, 就不可以访问了, 不方便

将 resultSet 中的记录封装成 User 对象, 存储到 List 中, 方便后续的数据管理

- User 类 的属性 id, name, age, sex 对应 Users 表 的属性 id, name, age, sex
- 一个 User 对象 对应 一条 Users 表 的记录

domain 类, `User.java`

```java
public class User {
    // 对应 int
    private Integer id;
    // 对应 short
    private Short age;
    // 对应 char, varchar
    private String name;
    private String sex;
    // 对应 date
    private LocalDate birthday;
    // 对应 datetime
    private LocalDateTime createTime;

    // 反射需要无参构造器
    public User() {
    }

    public User(Integer id, Short age, String name, String sex, LocalDate birthday, LocalDateTime createTime) {
        this.id = id;
        this.age = age;
        this.name = name;
        this.sex = sex;
        this.birthday = birthday;
        this.createTime = createTime;
    }

    // getter(), setter(), toString()
}
```

处理 SQL

```java
Connection connection = JDBCUtilsByDruid.getConnection();
String sql = "select * from users";
PreparedStatement preparedStatement = connection.prepareStatement(sql);
ResultSet resultSet = preparedStatement.executeQuery();
// 存储 User 对象
ArrayList<User> arrayList = new ArrayList<>();
// 一个 User 对象 对应 一条记录
while (resultSet.next()) {
    int id = resultSet.getInt("id");
    String name = resultSet.getString("name");
    Short age = resultSet.getShort("age");
    String sex = resultSet.getString("sex");

    arrayList.add(new User(id, name, age, sex));
}
JDBCUtilsByDruid.close(resultSet, preparedStatement, connection);
```

# QueryRunner

QueryRunner 是一个 utils class, 封装了 domain 操作

处理 DQL, 多行记录

```java
Connection connection = JDBCUtilsByDruid.getConnection();
// 导入 dbutils.jar
QueryRunner queryRunner = new QueryRunner();
String sql = "select * from users where name = ? and age = ?";
// 执行 sql, 底层通过反射获取 User 类, 将 resultSet 中的记录封装成 User 对象, 存储到 list 中,
List<User> list = queryRunner.query(connection, sql, new BeanListHandler<>(User.class), "sun", 18);
JDBCUtilsByDruid.close(null, null, connection);
```

处理 DQL, 单行记录

```java
String sql = "select * from users where name = ? and age = ?";
User user = queryRunner.query(connection, sql, new BeanHandler<>(User.class), "sun", 18);
```

处理 DQL, 单行单列

```java
String sql = "select name from actor where id = ?;";
Object obj = queryRunner.query(connection, sql, new ScalarHandler(), 1);
String name = (String) obj;
```

处理 DML

```java
String sql = "update users set sex = 'M' where name = ? and age = ?";
int rows = queryRunner.update(connection, sql, "sun", 18);
```

# DAO

domain 类

```java
public class User {
    private Integer id;
    private String name;
    private Integer age;
    private String sex;

    public User() {
    }

    public User(Integer id, String name, Integer age, String sex) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.sex = sex;
    }

    // getter(), setter(), toString()
}
```

BasicDAO: 其他 DAO 的父类

```java
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import utils.JDBCUtilsByDruid;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public class BasicDAO<T> {
    private final QueryRunner qr = new QueryRunner();
    Connection connection = null;

    public int update(String sql, Object... params) {
        try {
            connection = JDBCUtilsByDruid.getConnection();
            return qr.update(connection, sql, params);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        } finally {
            JDBCUtilsByDruid.close(null, null, connection);
        }
    }

    public List<T> queryMulti(String sql, Class<T> cls, Object... params) {
        try {
            connection = JDBCUtilsByDruid.getConnection();
            return qr.query(connection, sql, new BeanListHandler<>(cls), params);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public T querySingle(String sql, Class<T> cls, Object... params) {
        try {
            connection = JDBCUtilsByDruid.getConnection();
            return qr.query(connection, sql, new BeanHandler<>(cls), params);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public Object queryScalar(String sql, Object... params) {
        try {
            connection = JDBCUtilsByDruid.getConnection();
            return qr.query(connection, sql, new ScalarHandler<>(), params);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

UserDAO 继承 BasicDAO, 操作 Users 表

```java
public class UserDAO extends BasicDAO<User> {}
```

处理 DQL, 多行记录

```java
UserDAO userDAO = new UserDAO();
String sql = "select * from users where name = ? and age = ?";
List<User> list = userDAO.queryMulti(sql, User.class, "sun", 18);
```

处理 DQL, 单行记录

```java
String sql = "select * from users where id = ?";
User user = userDAO.querySingle(sql, User.class, 1);
```

处理 DQL, 单行单列

```java
String sql = "select name from users where id = ?";
Object o = userDAO.queryScalar(sql, 1);
```

处理 DML

```java
String sql = "update users set sex = 'M' where name = ? and age = ?";
int rows = userDAO.update(sql, User.class, "sun", 18);
```
