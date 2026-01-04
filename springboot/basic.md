# SpringBoot

SpringBoot 是基于 Spring Framework 的 Development Framework, 通过 Auto Configuration 基于约定大于配置原则, 提供了更加简单, 快速的开发体验.

SpringBoot 集成了很多第三方库和工具 (eg: Spring Data, Spring Security Thymeleaf, Logback), 可以极大地提高开发效率.

SpringBoot  内置了 Tomcat、Undertow 等服务器, 不用 像传统 SSM 一样自己去搭 Tomcat 等环境了, 简化了开发.

# project structure

```
SpringProject
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── harvey
    │   │           └── SpringProjectApplication.java
    │   └── resources
    │       ├── application.properties
    │       ├── static
    │       └── templates
    └── test
        └── java
            └── com
                └── harvey
                    └── SpringProjectApplicationTests.java
```

# starter class

```java
@SpringBootApplication
public class SpringBootDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringBootDemoApplication.class, args);
    }
}
```

# SpringApplication

configure app by SpringApplicatin instead of application.properties

```java
@SpringBootApplication
public class SpringBootDemo1Application {
    public static void main(String[] args) {
        SpringApplication springApplication = new SpringApplication(SpringBootDemo1Application.class);

        // app config
        springApplication.setBannerMode(Banner.Mode.OFF);
        springApplication.setDefaultProperties(new Properties());

        // run app
        springApplication.run(args);
    }
}
```

# SpringApplicationBuilder

configure app by SpringApplicationBuilder instead of application.properties

```java
@SpringBootApplication
public class SpringBootDemo1Application {
    public static void main(String[] args) {
        new SpringApplicationBuilder()
                .sources(SpringBootDemo1Application.class)
                .properties()
                .bannerMode(Banner.Mode.CONSOLE)
                .environment(null)
                .run(args);
    }
}
```

# parent dependency

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.1.0</version>
    <relativePath/>
</parent>
```

# inner tomcat

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

# version management

check [version info](https://sca.aliyun.com/zh-cn/docs/2022.0.0.0/overview/version-explain)

Used for SpringBoot 3

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.1.5</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2022.0.4</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-dependencies</artifactId>
            <version>2022.0.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Used for SpringBoot 2

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.6.13</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2021.0.5</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-dependencies</artifactId>
            <version>2021.0.5.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

# module programming

project structure

```
spring-boot-demo
├── gateway
│   ├── pom.xml
│   └── src
├── order-service
│   ├── pom.xml
│   └── src
├── user-service
│   ├── pom.xml
│   └── src
└── pom.xml
```

configure parent module (file: spring-boot-demo/pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- inherit base module-->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.harvey</groupId>
    <artifactId>spring-boot-demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <!-- parent module must be pom packaging-->
    <packaging>pom</packaging>

    <!-- configure sub module-->
    <modules>
        <module>gateway</module>
        <module>user-service</module>
        <module>order-service</module>
    </modules>

    <!-- java version -->
    <properties>
        <java.version>17</java.version>
    </properties>

    <!-- public depenency -->
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <!-- dependency version management -->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>3.0.2</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

configure sub module (file: user-service/pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- inherit parent module-->
    <parent>
        <groupId>com.harvey</groupId>
        <artifactId>spring-boot-demo</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>
    
    <artifactId>user-service</artifactId>
    <!-- packaging -->
    <packaging>jar</packaging>
    
    <!-- private dependency -->
    <dependencies>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
        <!-- import order-service module -->
        <dependency>
            <groupId>com.harvey</groupId>
            <artifactId>order-service</artifactId>
            <version>0.0.1-SNAPSHOT</version>
        </dependency>
    </dependencies>

    <!-- maven plugin -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```