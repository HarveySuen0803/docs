# Nacos

Nacos Server 是一个 Registration Center 和 Configuration Center

Nacos Client 请求 Nacos Server 实现注册, Nacos Server 会将各种信息 (eg: IP, Port) 存储到一个 Map 中

Nacos Client 会定时 (def: 20s) 向 Nacos Server 拉取最新的 Service List, 从而获取其他 Service 的信息实现通信, 当遇到多个相同服务时, 就通过 Load Balancing 选取一个 Service 进行通信

Nacos Server Cluster 中, Nacos Server 之间需要同步 Service List 保证数据一致性

Nacos Server 会定时检查 Service Health, 发现 Service 死亡后, 会推送变更消息给 Nacos Client

- Nacos Client 定时 (def: 5s) 发送 Heatbeat 给 Nacos Server, 表示健康
- Ephemeral Instance 在一定时间内 (def: 15s) 未发送 Heartbeat, 会被标记为 Unhealthy, 再过一段时间 (def: 30s) 未发送 Heartbeat, 会被剔除 Service List, Service 恢复后, 可以再次进行 Service Registry
- Persistent Instance 在一定时间内未发送 Heartbeat, 会被标记为 Unhealthy, 但是不会被剔除 Service List

Nacos Server 会在 Unhealthy Instance (eg: 5) / All Instance (eg: 10) < Protect Threshold (eg: 0.4) 时, 启动 Unhealthy 的 Persistent Instance 进行 Avalanche Protection

Server Load Balancing: Server 通过 Hardware (eg: F5) 或 Software (eg: Nginx) 拦截请求, 转发请求, 实现 Load Balancing

Client Load Balancing: Client 通过 Software (eg: Ribbon, LoadBalancer) 拦截请求, 转发请求, 实现 Load Balancing

pull Nacos image

```shell
docker image pull nacos/nacos-server:v2.1.1-slim
```

startup project

```shell
docker container run \
    --name nacos \
    --network global \
    --privileged \
    -p 8848:8848 \
    -p 9848:9848 \
    -p 9849:9849 \
    -v nacos-conf:/home/nacos/conf \
    -v nacos-data:/home/nacos/data \
    -v nacos-logs:/home/nacos/logs \
    -e MODE=standalone \
    -e NACOS_USER_NAME=nacos \
    -e NACOS_USER_PASSWORD=nacos \
    -e MYSQL_SERVICE_HOST=127.0.0.1 \
    -e MYSQL_SERVICE_PORT=3306 \
    -e MYSQL_SERVICE_DB_NAME=nacos \
    -e MYSQL_SERVICE_USER=root \
    -e MYSQL_SERVICE_PASSWORD=111 \
    -d nacos/nacos-server:v2.1.1-slim
```

access http://127.0.0.1:8848/nacos

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753014.png)

# install Nacos server by manual

install Nacos server

```shell
curl -LJO https://github.com/alibaba/nacos/releases/download/2.2.1/nacos-server-2.2.1.zip
```

get token secret key

```java
KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
keyGenerator.init(256);
String key = Base64.getEncoder().encodeToString(keyGenerator.generateKey().getEncoded()); // cBUZTHliIVvqrrjiOOhC5un7XGPlfoIEaclwnqd91/U=
System.out.println(key);
```

```java
import javax.crypto.KeyGenerator;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
```

set Nacos server config (file: conf/application.properties)

```
server.port=8848
server.servlet.contextPath=/nacos
nacos.core.auth.plugin.nacos.token.secret.key=javax.crypto.spec.SecretKeySpec@17926
```

startup Nacos server

```shell
sh bin/startup.sh -m standalone

# startup Nacos server on Ubuntu
bash bin/startup.sh -m standalone
```

# Nacos client

import dependency (module. user-servcie)

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

set Nacos client config (module. user-service)

```xml
server.port=8001
spring.application.name=user-service

spring.cloud.nacos.discovery.ip=127.0.0.1
spring.cloud.nacos.discovery.port=8848
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
spring.cloud.nacos.discovery.username=nacos
spring.cloud.nacos.discovery.password=nacos
spring.cloud.nacos.discovery.namespace=public
spring.cloud.nacos.discovery.group=DEFAULT_GROUP
```

startup Nacos client

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753015.png)

check service list

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753016.png)

# Nacos instance

set cluster name

```properties
spring.cloud.nacos.discovery.cluster-name=JS
```

check cluster name

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753023.png)

# request by Nacos

set load balance

```java
@Bean
@LoadBalanced
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

send request by Nacos instead of real ip

```java
String msg = restTemplate.getForObject("http://user-service/user/test", String.class);
```

# service weight

set service weight

```properties
spring.cloud.nacos.discovery.weight=0.1
```

check service state

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753017.png)

# persistent instance

set as persistent instance

```properties
spring.cloud.nacos.discovery.ephemeral=false
```

check instance state

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753018.png)

# namespace

create namespace

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753019.png)

check namespace

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753020.png)

set namespace

- set namespace in bootstrap.properties after setting Nacos profile

```properties
spring.cloud.nacos.discovery.namespace=25ee6847-26ce-4c3e-ade5-6e537ddd6d19
```

check service list

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753021.png)

# Nacos cluster

check [port problem](https://blog.csdn.net/SleepNot_Need/article/details/122473010)

set java option (file: bin/start.sh)

```sh
JAVA_OPT="${JAVA_OPT} -server -Xms512m -Xmx512m -Xmn256m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m"
```

set Nacos server config (file: conf/application.properties)

```properties
server.port=8848

# datasource
spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
db.user.0=root
db.password.0=111

# token
nacos.core.auth.plugin.nacos.token.secret.key=SuW4TG3k8B6gSHskxhhRiT3XQLOvr7hRBtI2ZGveG00=
```

create database

```sql
create database nacos
```

download mysql-schema.sql

```shell
curl -LJO https://raw.githubusercontent.com/alibaba/nacos/master/distribution/conf/mysql-schema.sql
```

```sql
source mysql-schema.sql
```

set cluster config (file: conf/cluster.conf)

```properties
192.168.10.21:8848
192.168.10.22:8848
192.168.10.23:8848
```

startup Nacos server (ip. 127.0.0.1, 192.168.10.22, 192.168.10.23)

```shell
sh bin/startup.sh -m cluster

# startup on Ubuntu
bash bin/startup.sh -m cluster
```

check cluster state

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753022.png)

# Nacos profile

create Nacos profile

- data id: `${spring.cloud.nacos.config.prefix}-${spring.profiles.active}.${spring.cloud.nacos.config.file-extension}`

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753024.png)

import dependency

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

point to server (file: bootstrap.properties) 

- client need to point to server by bootstrap.properties instead of application.properties

```properties
spring.application.name=user-service
spring.profiles.active=dev

spring.cloud.nacos.config.server-addr=127.0.0.1:8848
spring.cloud.nacos.config.file-extension=properties
spring.cloud.nacos.config.prefix=user-service
spring.cloud.nacos.config.namespace=25ee6847-26ce-4c3e-ade5-6e537ddd6d19
spring.cloud.nacos.config.group=DEFAULT_GROUP
```

set client config (file: application.properties)

```properties
server.port=9011
```

access Nacos profile

```java
@Value("${user.name}")
private String name;
```

```java
String name = applicationContext.getEnvironment().getProperty("user.naem");
```

# Nacos shard profile

create Nacos shard profile

- data id: `${spring.cloud.nacos.config.prefix}.${spring.cloud.nacos.config.file-extension}`

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753025.png)

set client config (file: bootstrap.properties)

```properties
# shared-configs[0] < shared-configs[1] < shared-configs[2]
spring.cloud.nacos.config.shared-configs[0].data-id=common-base.properties
spring.cloud.nacos.config.shared-configs[0].refresh=true
spring.cloud.nacos.config.shared-configs[0].group=DEFAULT_GROUP
```

access Nacos shard profile

```java
@Value("${common.msg}")
private String msg;
```

```java
String msg = applicationContext.getEnvironment().getProperty("common.msg");
```

# Nacos extension profile

set client config (file: bootstrap.properties)

```properties
# extension-configs[0] < extensions-conigs[1] < extensions-configs[2]
spring.cloud.nacos.config.extension-configs[0].data-id=common-mysql.properties
spring.cloud.nacos.config.extension-configs[0].refresh=true
spring.cloud.nacos.config.extension-configs[0].group=common-mysql.properties
```

access Nacos extension profile

```java
@Value("${common.mysql.username}")
private String username;
```

```java
String username = applicationContext.getEnvironment().getProperty("common.mysql.username");
```

# profile priority

profile priority

- Nacos profile > Nacos extension profile > Nasoc shard profile > bootstrap.properties > application.properties

execution order of profile

- bootstrap.properties -> Nacos profile -> application.properties

set the local profile has the highest priority (file: Nacos Profile)

```properties
spring.cloud.config.override-node=true
```

# dynamic load Nacos profile

access Nacos profile by Properties object, the program will dynamic load profile without restarting project after modification

access Nacos profile by @Value, the program will not dynamic load profile, we can add @RefreshScope to enable dynamic load function

```java
@RestController
@RefreshScope
public class UserController {
    @Value("${test.msg}")
    private String msg;
    
    @GetMapping("/test")
    public String test() {
        return msg;
    }
}
```

# Nacos user

create Nacos user

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753026.png)

check Nacos user

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753027.png)

# Nacos role

bind a role to a user

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753028.png)

check Nacos role

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753029.png)

z# Nacos permission

enable persmission management (file: conf/application.properties)

```properties
nacos.core.auth.enabled=true
```

add permission to a role

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753030.png)

check permission

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753031.png)
