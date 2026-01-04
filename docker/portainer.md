# Portainer

Portainer is a lightweight service delivery platform for containerized applications that can be used to manage Docker, Swarm, Kubernetes and ACI environments. 

It is designed to be as simple to deploy as it is to use. The application allows you to manage all your orchestrator resources (containers, images, volumes, networks and more) through a 'smart' GUI and/or an extensive API.

Portainer consists of a single container that can run on any cluster. It can be deployed as a Linux container or a Windows native container.

# install Portainer by Docker

pull Portainer image

```shell
docker image pull portainer/portainer-ce:linux-arm64
```

create volume directory

```shell
mkdir /home/harvey/portainer
mkdir /home/harvey/portainer/data
```

startup Portainer

```shell
sudo docker container run \
    --name portainer \
    --restart=always \
    -p 8000:8000 \
    -p 9443:9443 \
    -p 9000:9000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /home/harvey/portainer/data:/data \
    -d portainer/portainer-ce:linux-arm64
```

access http://127.0.0.1:9000

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241806250.png)