# install Tomcat by Docker

pull Tomcat

```shell
sudo docker image pull tomcat:10.0.14
```

startup Tomcat

```shell
sudo docker container run \
    --name tomcat \
    --user $(id -u):$(id -g) \
    --restart always \
    --privileged \
    -p 8080:8080 \
    -d tomcat:10.0.14
```

configure webapps directory

```shell
sudo docker container exec -it tomcat1 /bin/bash
```

```shell
rm -r webapps
mv webapps.dist webapps
```

access http://127.0.0.1:8080

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241755723.png)

# project intergration

## IDEA impl

pom.xml, 配置 packaging

```xml
<packaging>war</packaging>
```

配置 Tomcat

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202309082317735.png)

配置 Tomcat Application Servers

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202309082317736.png)

部署项目到 Tomcat 中

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202309082317737.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202309082317738.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202309082317739.png)

- xxx:war 是将项目打包成 .war 部署到 Tomcat 的 webapps 中
- xxx:war expolded 是将项目的 target 文件夹部署到 Tomcat 的 webapps 中

## Maven impl

pom.xml, 配置 packaging, 安装 Tomcat Plugin

```xml
<packaging>war</packaging>

<build>
    <finalName>MavenProject</finalName>
    <plugins>
        <!-- tomcat -->
        <plugin>
            <groupId>org.apache.tomcat.maven</groupId>
            <artifactId>tomcat7-maven-plugin</artifactId>
            <version>2.2</version>
            <configuration>
                <port>8080</port>
                <path>/</path>
            </configuration>
        </plugin>
    </plugins>
</build>
```

IDEA 配置 maven command

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202309082317740.png)