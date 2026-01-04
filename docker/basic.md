# Docker

Docker is an open platform for developing, shipping, and running applications

Docker enables you to separate your applications from your infrastructure so you can deliver software quickly

you can manage your infrastructure in the same ways you manage your applications

by taking advantage of Docker's methodologies for shipping, testing, and deploying code, you can significantly reduce the delay between writing code and running it in production

# install Docker by manual

apt update

```shell
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
```

add GPG key

```shell
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

set up repository

```shell
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/debian \
$(lsb_release -cs) stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
```

install Docker engine

```shell
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

hello world !!!

```shell
sudo docker run hello-world
```

# uninstall Docker

uninstall Docker

```shell
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt remove $pkg; done
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

# Aliyun mirror

set mirror address (file: /etc/docker/daemon.json)

```json
{
    "registry-mirrors": [
        "https://op0zapiv.mirror.aliyuncs.com",
        "https://hub-mirror.c.163.com",
        "https://mirror.baidubce.com"
    ]
}
```

reload Docker

```shell
sudo systemctl daemon-reload && sudo systemctl restart docker
```

# Docker proxy

set Docker proxy (file: /etc/systemd/system/docker.service.d/http-proxy.conf)

```shell
# Replace the proxy URL below with your proxy (you already have http://127.0.0.1:7890)
Environment="HTTP_PROXY=http://127.0.0.1:7890"
Environment="HTTPS_PROXY=http://127.0.0.1:7890"
Environment="NO_PROXY=localhost,127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
# lowercase variants too (some tools read lowercase)
Environment="http_proxy=http://127.0.0.1:7890"
Environment="https_proxy=http://127.0.0.1:7890"
Environment="no_proxy=localhost,127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
```

set container proxy (file: ~/.docker/config.json)

```json
{
    "proxies": {
        "default": {
            "httpProxy": "http://127.0.0.1:7890",
            "httpsProxy": "http://127.0.0.1:7890",
            "noProxy": "localhost,127.0.0.1"
        }
    }
}
```

reload Docker

```shell
sudo systemctl daemon-reload && sudo systemctl restart docker
```

# Docker build proxy

set build arguments

```shell
docker build -t image:tag .\
--build-arg "HTTP_PROXY=http://172.20.10.2:7890" \
--build-arg "HTTPS_PROXY=http://172.20.10.2:7890" \
--build-arg "NO_PROXY=localhost,127.0.0.1" \
```

# basic command

```shell
# Docker overview
docker system df
```

# command alias

```shell
# Docker
alias d="sudo docker"
alias ds="sudo docker search"
alias dr="sudo docker container run"
alias dl="sudo docker container logs"
alias db="sudo docker build -t"
# Docker image
alias di="sudo docker image"
alias dil="sudo docker image list"
alias dir="sudo docker image remove"
alias dirf="sudo docker image remove -f"
alias dip="sudo docker image pull"
alias dirp="sudo docker image prune"
# Docker container
alias dc="sudo docker container"
alias dce="sudo docker container exec -it"
alias dcl="sudo docker container list"
alias dcla="sudo docker container list -a"
alias dcrm="sudo docker container remove"
alias dcrmf="sudo docker container remove -f"
alias dcrs="sudo docker container restart"
# Docker volume
alias dv="sudo docker volume"
alias dvl="sudo docker volume list"
alias dvla="sudo docker volume list -a"
alias dvc="sudo docker volume create"
alias dvi="sudo docker volume inspect"
alias dvr="sudo docker volume remove"
alias dvrf="sudo docker volume remove -f"
alias dvrp="sudo docker volume prune"
# Docker network
alias dn="sudo docker network"
alias dnl="sudo docker network list"
alias dnc="sudo docker network create"
alias dnr="sudo docker network remove"
alias dnrp="sudo docker network prune"
alias dni="sudo docker network inspect"
# DockerCompose
alias dco="sudo docker-compose"
alias dcou="sudo docker-compose up"
alias dcod="sudo docker-compose down"
```

# Docker point

Docker

- Docker 将 app 的 src, lib, dep, config 打包成 image 存放在 repository, Docker 根据 image 运行一个 container, 让 app 调用 image 的 lib 访问 host kernel, 而不是调用 OS 的 lib 访问 host kernel, 实现 compatibility
- 可以从 remote repository 中下载 image 到 local repository, 也可以上传自己打包的 image 到 local repository

Docker process

- Docker 基于 C/S, 在 host 上运行 Docker daemon
- Docker client 通过 Socket 访问 Docker daemon, 执行 command, 发送 request
- Docker daemon 调用 Docker server 处理 request
- Docker daemon 调用 Docker engine 执行 job 操作 container, 操作一个 mini linux kernel
- Docker daemon 通过 network driver 配置 container network 实现 multi Docker 的 communication, 通过 exec driver 执行 command, 通过 graph driver 存储 image 构成 repository

Docker or VM

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202308031651662.png)

- Docker app 调用 image 的 lib 访问 host kernel
- VM app 调用 VM OS 的 lib 访问 VM OS 的 kernel, 通过 Hypervisor 实现 VM OS 和 host OS 的交互

UnionFS

- UnionFS 是一个 layered FS, 一次加载多个 FS, 叠加在一块, 构成完整的 FS, 对 FS 的 update 会作为一次 commit 层层叠加
- UnionFS 是 image 的基础, image 可以通过 layered 实现 inheritance

BootFS

- BootFS 包含 bootloader 和 kernel, Linux 启动后, 会加载 BootFS, 调用 bootloader 引导 kernel, 加载完 kernel 后, 会卸载 BootFS, 由 kernel 操作 memory

RootFS

- RootFS 在 BootFS 上层, 相当于 Linux distribution, RootFS 很小, 只包含一些 basic Linux directory (eg: /etc, /bin, /dev), basic command (eg: ls, cd), baisc lib
- 不同的 RootFS 都是共用同一个 BootFS, 都是直接访问 host kernel

image layered

- 通过 UnionFS 实现 layered, 通过 layered 实现 resource sharing, easy replication, easy migration, reuse
- image 基于 base image, 是 read only, host 只需要加载一份 base image, 就可以供其他 container 使用
- container 基于 image, 是 writable