# Aliyun registry

check [container-image service](https://cr.console.aliyun.com/cn-hangzhou/instance/dashboard)

create namespace

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241806679.png)

create registry

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241806680.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241806681.png)

login Aliyun registry

```shell
docker login --username=HarveySuen registry.cn-shanghai.aliyuncs.com
```

push image

```shell
docker image tag d55d2d2a0776 registry.cn-shanghai.aliyuncs.com/harveysuen/repository-demo:latest

docker image push registry.cn-shanghai.aliyuncs.com/harveysuen/repository-demo:latest
```

pull image

```shell
docker image pull registry.cn-shanghai.aliyuncs.com/harveysuen/repository-demo:latest
```

# private registry

enable push image by HTTP

```json
{
    "insecure-registries": ["127.0.0.1:5000"]
}
```

restart Docker

```shell
sudo systemctl restart docker
```

pull registry image

```shell
docker image pull registry
```

run registry image

```shell
docker container run \
--name my-registry \
--privileged=true \
-p 5000:5000 \
-v /harvey/my-registry:/tmp/registry 
-d registry
```

push image

```shell
docker image tag d55d2d2a0776 127.0.0.1:5000/my-nginx:latest

docker image push 127.0.0.1:5000/my-nginx:latest
```

pull image

```shell
docker image pull 127.0.0.1:5000/my-nginx:latest
```