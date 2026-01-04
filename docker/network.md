# network

container network refers to the ability for containers to connect to and communicate with each other, or to non-Docker workloads

a container has no information about what kind of network it's attached to, or whether their peers are also Docker workloads or not

a container only sees a network interface with an IP address, a gateway, a routing table, DNS services, and other networking details, that is, unless the container uses the none network driver

# network command

```shell
docker network list

docker network create test-network

docker network inspect test-network

docker network remove test-network

docker network prune

docker run --network test-network -d nginx:latest
```

# bridge network

Docker 通过 Linux bridge 在 host 上虚拟一个 docker0 bridge, 在 kernel layer 连通了 physical netcard 和 virtual netcard, 将 container 和 host 放在同一个 physical network 下, 配置了 IP 和 subnet mask, 通过 docker0 实现 container 和 host 的 communication

docker0 是 container 的 default gateway, container 的 eth0 virtual netcard 一对一连接 docker0 的 veth interface, 连接到 docker0 的 intranet, docker0 根据 network segment 给 container 分配 IP, 实现 intranet communication

set bridge network

```shell
docker container run --network bridge -d nginx:latest
```

# host network

host network 下, container 没有 independent network namespace, 共用 host 的 network namespace, 由 host 分配 ip 和 port, user 不需要考虑 ip 和 host

set host network

```shell
docker container run --network host -d nginx:latest
```

# container network

container network 下, container 共享 other container 的 ip 和 port, other container 停机后, container 失去 network settings

set container network

```shell
docker container run --name a1 -it alpine:latest /bin/sh

docker container run --name a2 --network container:a1 -it alpine:latest /bin/sh
```

# none network

none network 下, container 没有 netcard, ip, port, route, 只有一个 lo

set none network

```shell
docker container run --network none nginx:latest
```

# custom network

custom network 默认为 bridge network, custom network 下, container 可以通过 container name 访问 other container

create custom network

```shell
docker network create demo-network
```

```shell
docker container run --name mysql-01 --network demo-network ... -d mysql:8.1.0

docker container run --name redis-01 --network demo-network ... -d redis:7.2
```

previously, we could only access the service through ip

```properties
# MySQL
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/db?serverTimezone=UTC&characterEncoding=utf8&useUnicode=true&useSSL=false&rewriteBatchedStatements=true

# Redis
spring.redis.host=127.0.0.1
```

now, we can access the service through container name

```properties
# MySQL
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/db?serverTimezone=UTC&characterEncoding=utf8&useUnicode=true&useSSL=false&rewriteBatchedStatements=true

# Redis
spring.redis.host=redis-01
```

# set bridge network ip

set network ip (fiel: /etc/docker/daemon.json)

```json
{
    "bip": "172.168.10.1/24"
}
```

restart docker

```shell
sudo systemctl daemon-reload && sudo systemctl restart docker
```

