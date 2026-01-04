# Junit

pom.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

AppTest.java, 添加 @SpringBootTest 开启测试

```java
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AppTest {
    @Autowired
    UserMapper userMapper;

    @Test
    public void show() {
        User user = userMapper.selectById(1);
        System.out.println(user);
    }
}
```

# Test Method name

```java
@DisplayName("test1()")
@Test
void test1() {
    System.out.println("test1");
}
```

# Hook Method

```java
// 运行 Test Cls 前调用
@BeforeAll
static void beforeAll() {
    System.out.println("beforeAll()");
}

// 运行 Test Method 前调用
@BeforeEach
void beforeEach() {
    System.out.println("beforeEach()");
}

@AfterAll
static void afterAll() {
    System.out.println("afterAll()");
}

@AfterEach
void afterEach() {
    System.out.println("afterEach()");
}
```

# Asserations

Asserations API

- assertEquals 判断是否相等
- assertNotEquals
- assertSame 判断是否为同一个对象
- assertNotSame
- assertTrue 判断是否为 true
- assertFalse
- assertNull 判断是否为 null
- assertNotNull
- assertArrayEquals 数组断言
- assertAll 组合断言
- assertThrows 异常断言
- assertTimeout 超时断言

```java
@Test
void test1() {
    Assertions.assertEquals("sun", name);
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241810462.png)

# @ParameterizedTest

## @ValueSource

```java
@ParameterizedTest
@ValueSource(strings = {"sun", "xue", "cheng"})
void test1(String name) {
    System.out.println(name);
}
```

## @MethodSource

```java
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest
class SpringBootDemo1ApplicationTests {
    Stream<String> method() {
        return Stream.of("sun", "xue", "cheng");
    }

    @ParameterizedTest
    @MethodSource("method")
    void test1(String name) {
        System.out.println(name);
    }
}
```

