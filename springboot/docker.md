# Basic

配置 Docker Daemon 允许接受连接

```json
{
    "hosts": ["tcp://0.0.0.0:2375", "unix:///var/run/docker.sock"],
    "tls": false // Disable TLS (not recommended)
}
```

配置 Dependency

```xml
<dependency>
    <groupId>com.github.docker-java</groupId>
    <artifactId>docker-java</artifactId>
    <version>3.3.0</version>
</dependency>
<dependency>
    <groupId>com.github.docker-java</groupId>
    <artifactId>docker-java-transport-httpclient5</artifactId>
    <version>3.3.0</version>
</dependency>
<dependency>
    <groupId>org.apache.httpcomponents.client5</groupId>
    <artifactId>httpclient5</artifactId>
    <version>5.3</version>
</dependency>
```

配置 DockerClient

```java
@Bean
public DockerClient dockerClient() {
    DockerClientConfig clientConfig = DefaultDockerClientConfig.createDefaultConfigBuilder()
        .withDockerHost("unix:///var/run/docker.sock")
        .build();
    ApacheDockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
        .dockerHost(clientConfig.getDockerHost())
        .build();
    return DockerClientBuilder.getInstance(clientConfig).withDockerHttpClient(httpClient).build();
}
```

通过 DockerClient 操作 Docker

```java
List<Container> containerList = dockerClient.listContainersCmd().exec();
```

