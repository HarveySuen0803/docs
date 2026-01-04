# Junit5

导入 Junit5 Dependency

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>5.9.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-engine</artifactId>
    <version>5.9.0</version>
    <scope>test</scope>
</dependency>
```

使用 Junit5 进行单元测试

```java
public class MainTest {
    @Test
    public void test() {
        System.out.println("hello world");
    }
}
```