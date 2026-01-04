# install Ngnix by manual

download Nginx

```shell
curl -LJO https://nginx.org/download/nginx-1.25.2.tar.gz
```

compile Nginx

```sh
sh ./configure --prefix=/usr/local/nginx && sudo make && sudo make install
```

startup Nginx

```shell
cd /usr/local/nginx/sbin && sudo ./nginx
```

# install Nginx by Docker

pull Nginx

```shell
sudo docker image pull nginx:1.25.2
```

create volume

```shell
sudo docker volume create nginx-conf
sudo docker volume create nginx-html
sudo docker volume create nginx-logs

sudo mkdir -p /opt/nginx

sudo ln -s /var/lib/docker/volumes/nginx-conf/_data /opt/nginx/config
sudo ln -s /var/lib/docker/volumes/nginx-html/_data /opt/nginx/html
sudo ln -s /var/lib/docker/volumes/nginx-logs/_data /opt/nginx/log
```

startup Nginx

```shell
sudo docker container run \
    --name nginx \
    --privileged \
    -p 80:80 \
    -v nginx-conf:/etc/nginx \
    -v nginx-html:/usr/share/nginx/html \
    -v nginx-logs:/var/log/nginx \
    -d nginx:1.25.2
```

# basic command

```shell
./nginx 

./nginx -s stop

./nginx -s quit

./nginx -s reload
```

# Nginx system service

set Nginx system service (/lib/systemd/system/nginx.service)

```shell
[Unit]
Description=nginx - high performance web server
After=network.target remote-fs.target nss-lookup.target
[Service]
Type=forking
ExecStart=/usr/local/nginx/sbin/nginx -c /usr/local/nginx/config/nginx.conf
ExecReload=/usr/local/nginx/sbin/nginx -s reload
ExecStop=/usr/local/nginx/sbin/nginx -s stop
[Install]
WantedBy=multi-user.target
```

restart system daemon

```shell
sudo systemctl daemon-reload
```

operating system service

```shell
sudo systemctl status nginx

sudo systemctl start nginx

sudo systemctl stop nginx

sudo systemctl reload nginx

sudo systemctl disable nginx

sudo systemctl enable nginx
```

# process of execution

启动 Nginx 后, 会开启一个 master process, 读取并校验 nginx.conf, 开启多个 worker process (sub process), worker process 等待 request, 处理 request

check process

```shell
ps -aux | grep nginx
```

```console
nginx: master process /usr/local/nginx/sbin/nginx -c /usr/local/nginx/config/nginx.conf
nginx: worker process
```

# basic configuration

```nginx
# worker process number
worker_processes  1;

events {
    # most connection per worker process
    worker_connections  1024;
}

http {
    # response content-type according to mini.types
    include       mime.types;
    
    # default content-type
    default_type  application/octet-stream;
    
    sendfile        on;
    
    keepalive_timeout  65;

    # virual host
    server {
        listen       80;
        server_name  localhost;

        location / {
            # root path is /usr/local/nginx/html
            root   html;
            
            # home page file
            index  index.html index.htm;
        }

        # error page file
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

# DNS

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241750348.png)

# server name

match ip

```shell
server_name localhost;
```

match domain name

```shell
server_name www.nginx-demo.com;
```

match multi domain names

```shell
server_name www.nginx-demo.com mail.nginx-demo.com
```

match by wildcard

```shell
server_name *.nginx-demo.com
```

```shell
server_name *.nginx-demo.*
```

match by RegExp

```shell
server_name ~^[0-9]+\.nginx-demo\.com$;
```

# multi-user domain name

nginx 接受 harvey.nginx-demo.com 的 request, 发送给 Tomcat

Tomcat 拦截后, 解析 harvey, 去 DB 中查询 harvey 的 data, 返回给 nginx

nginx 再返回给 client

# short domain name

nginx 存储 short domain name 的 UUID 和 real ip 到 DB, key 为 UUID, value 为 real ip

nginx 接受 nginx-demo.com/4923402 的 request, 根据 UUID (4923402) 查询 DB, 获取 real ip, 重定向到 real ip

# reverse proxy

proxy 和 revser proxy 的区别, proxy 是 client 和 proxy server 处于 intranet, reverse proxy 是 proxy server 和 server 处于 intranet

Tunnel model, client 发送 request 经过 proxy server, app server 响应 response 也要经过 proxy server, app server 容易受制于 proxy server, 当 proxy server 性能不佳时, 会拖累到 app server

DR model, client 发送 request 经过 proxy server, app server 响应 response 不需要经过 proxy server, 直接响应给 client

set reverse proxy

```nginx
location / {
    proxy_pass http://www.baidu.com;
}
```

# load balancing

```nginx
# load balancing 
upstream webservers {
    # weight policy
    server 192.168.10.11:80 weight=6;
    server 192.168.10.12:80 weight=3 backup;
    server 192.168.10.13:80 weight=1 down;
}

server {
    listen       80;
    server_name  localhost;

    location / {
        proxy_pass http://webservers;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   html;
    }
}
```

# deploy static resource

architecture that default deploy

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241750349.png)

architecture that deploy static resource to Nginx

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241750350.png)

store static resource to Nginx

```shell
sudo scp ./css root@192.168.10.11:/usr/local/nginx/html/css
sudo scp ./js root@192.168.10.11:/usr/local/nginx/html/js
sudo scp ./img root@192.168.10.11:/usr/local/nginx/html/img
```

deploy static resource to Nginx

```nginx
location /css {
    root   html;
    index  index.html index.htm;
}
location /js {
    root   html;
    index  index.html index.htm;
}

location /img {
    root   html;
    index  index.html index.htm;
}
```

deploy by regular expression

```nginx
location ~*(css|js|img) {
    root   html;
    index  index.html index.htm;
}
```

# URL rewrite

## break

```nginx
location / {
    # access `http://127.0.0.1/index` will access `http://127.0.0.1/index.html?page=1`, and end the match
    rewrite ^/index$ /index.html?page=1 break;
    proxy_pass http://webserver;
}
```

## last

```nginx
location / {
    # access `http://127.0.0.1/index` will access `http://127.0.0.1/index.html?page=1`, and continue to match the following rules
    rewrite ^/index$ /index.html?page=1 last;
    proxy_pass http://webserver;
}
```

## redirect

```nginx
location / {
    # access `http://127.0.0.1/index` will redirect to `http://127.0.0.1/index.html?page=1`, change the displayed url, and return 302 status code
    rewrite ^/index$ /index.html?page=1 redirect;
    proxy_pass http://webserver;
}
```

## permanent

```nginx
location / {
    # access `http://127.0.0.1/index` will redirect to `http://127.0.0.1/index.html?page=1`, change the displayed url, and return 301 status code
    rewrite ^/index$ /index.html?page=1 permanent;
    proxy_pass http://webserver;
}
```

# valid referer

/home 引用 /js, 那么 /home 就是 /js 的 referer, 设置 /js 的 valid referer 为 /home, 那么只能 /home 引用 /js

check referer

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241750351.png)

set valid referer

```nginx
location ~*/(js|img|css) {
    # specify valid referer
    valid_referers http://192.168.10.11 http://192.168.10.12

    # specify valid referer and allow no referer
    valid_referers none http://192.168.10.13 http://192.168.10.14

    # invalid referer
    if ($invalid_referer) {
        return 403;
    }

    root   html;
    index  index.html index.htm;
}
```

rewrite to specify image

```nginx
location ~*/(js|img|css) {
    valid_referers http://192.168.10.11/home;

    if ($invalid_referer) {
        return 403;
    }

    root   html;
    index  index.html index.htm;
}
```

# error page

set error page (html/40x.html)

```html
<h1>error page</h1>
```

set nginx

```nginx
location ~*/(js|img|css) {
    valid_referers http://192.168.10.11;
}

error_page 400 401 402 403 /40x.html
locatino = /40x.html {
    root html;
}
```

# keepalived

多台 Nginx 安装了 keepalived, keepalived 之间可以相互通信, 生成一个 virtual ip, 用户访问这个 virutal ip, 如果 master node 下线了, virtual ip 就会到 backup node 上, 实现高可用

install keeepalived

```shell
sudo apt install keepalived
```

configure master node

```shell
global_defs {
    router_id lb21
}

vrrp_instance VI_1 {
    state MASTER
    interface enp0s5
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth type PASS
        auth pass 1111
    }
    virtual_ipaddress {
        192.168.10.20
    }
}
```

configure backup node

```shell
global_defs {
    router_id lb22
}

vrrp_instance VI_1 {
    state BACKUP
    interface enp0s5
    virtual_router_id 51
    priority 50
    advert_int 1
    authentication {
        auth type PASS
        auth pass 1111
    }
    virtual_ipaddress {
        192.168.10.20
    }
}
```

startup keepalived

```shell
sudo systemctl start keepalived
```

