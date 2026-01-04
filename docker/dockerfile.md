# Dockerfile

Docker can build images automatically by reading the instructions from a Dockerfile

A Dockerfile is a text document that contains all the commands a user could call on the command line to assemble an image

This page describes the commands you can use in a Dockerfile

# build image

project structure

```
ubuntu-plus-build
|-- Dockerfile
|-- jdk-17_linux-aarch64_bin.tar.gz
```

pull basic image to build custom image

```shell
sudo docker image pull ubuntu:22.04
```

configure Dockerfile

```shell
FROM ubuntu:22.04
MAINTAINER harvey<harveysuen0803@gmail.com> 
  
ENV MYPATH /usr/local/lib
WORKDIR $MYPATH

RUN sed -i "s@http://deb.debian.org@http://mirrors.aliyun.com@g" /etc/apt/sources.list
RUN apt update
RUN apt install -y vim
RUN apt install net-tools
ADD ./jdk-17_linux-aarch64_bin.tar.gz /usr/local/lib

ENV PATH /usr/local/lib/jdk-17.0.8/bin:$PATH 
  
EXPOSE 80 
 
CMD echo $MYPATH 
CMD echo "ubuntu-plus build ----------------------- success" 
CMD /bin/bash 
```

build image

```shell
sudo docker build -t ubuntu-plus:1.0 .
```

startup image

```shell
sudo docker container run -it ubuntu-plus:1.0 /bin/bash
```

# build micro service as image

project structure

```
micro-service-build
|-- Dockerfile
|-- user-service-1.0.jar
```

configure Dockerfile

```shell
FROM openjdk:17

MAINTAINER harvey<harveysuen0803@gmail.com>

VOLUME /tmp

ADD ./user-service-1.0.jar ./user-service.jar 

ENTRYPOINT ["java", "-jar", "./user-service.jar"] 

# user-service port is 9001
EXPOSE 9001 
```

build image

```shell
docker build -t user-service:1.0 .
```

startup image

```shell
docker container run -p 9001:9001 -d user-service:1.0
```
