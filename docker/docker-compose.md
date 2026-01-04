# DockerCompose

DockerCompose is a tool for defining and running multi-container Docker applications

with DockerCompose, you use a YAML file to configure your application's services

with a single command, you create and start all the services from your configuration

DockerCompose works in all environments, production, staging, development, testing, as well as CI workflows

it also has commands for managing the whole lifecycle of your application

- start, stop, and rebuild services
- view the status of running services
- stream the log output of running services
- run a one-off command on a service

check [DockerCompose version management](https://docs.docker.com/compose/compose-file/compose-versioning/)

# install DockerCompose

install DockerCompose

```shell
sudo curl -LJO https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-linux-aarch64

sudo mv ./docker-compose-linux-aarch64 /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose
```

check DockerCompose version

```shell
docker-compose --version
```

basic command

```shell
docker-compse up

docker-compose down

docker-compse logs

docker-compse restart gateway user-service order-servie
```

# startup container by DockerCompose

configure DockerCompose file (docker-compose.yml)

```yaml
version: "3"
services:
  user-service:
    image: user-service:1.0
    # similar to `--name user-service-01`
    container_name: user-service-01
    # similar to `--network demo-network`
    networks:
      - demo-network
    # similar to `-p 9001:9001`
    ports:
      - "9001:9001"
    # similar to `-v /home/harvey/user-service/data:/data`
    volumes:
      - /home/harvey/user-service/data:/data
    depends_on:
      - redis
      - mysql
  mysql:
    image: mysql:8.1.0
    container_name: mysql-01
    networks:
      - demo-network
    # similar to `-e MYSQL_ROOT_PASSWORD 111`
    environment:
      MYSQL_ROOT_PASSWORD: '111'
      MYSQL_ALLOW_EMPTY_PASSWORD: 'no'
      MYSQL_DATABASE: 'db01'
      MYSQL_USER: 'root'
      MYSQL_PASSWORD: '111'
    ports:
      - "3306:3306"
    volumes:
      - /home/harvey/mysql/conf:/etc/mysql/conf.d
      - /home/harvey/mysql/data:/var/lib/mysql
      - /home/harvey/mysql/log:/var/log/mysql
    # similar to `docker container run ... mysql:8.1.0 --default-authentication-plugin=mysql_native_password`
    command: --default-authentication-plugin=mysql_native_password
# simiar to `docker network create demo-network`
networks:
  demo-network:
```

create and startup container

```shell
docker-compose up -d
```


