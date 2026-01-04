# Install OpenResty by Docker

拉取 OpenResty Image

```shell
sudo docker image pull openresty/openresty:1.21.4.1-0-jammy
```

配置 OpenResty Volume

```shell
sudo docker volume create openresty-conf
sudo docker volume create openresty-html
sudo docker volume create openresty-log
sudo docker volume create openresty-cert
sudo docker volume create openresty-run
sudo docker volume create openresty-lua
sudo docker volume create openresty-lualib
sudo docker volume create openresty-luajit

sudo mkdir -p /opt/openresty

sudo ln -s /var/lib/docker/volumes/openresty-conf/_data /opt/openresty/conf
sudo ln -s /var/lib/docker/volumes/openresty-html/_data /opt/openresty/html
sudo ln -s /var/lib/docker/volumes/openresty-log/_data /opt/openresty/log
sudo ln -s /var/lib/docker/volumes/openresty-cert/_data /opt/openresty/cert
sudo ln -s /var/lib/docker/volumes/openresty-run/_data /opt/openresty/run
sudo ln -s /var/lib/docker/volumes/openresty-lua/_data /opt/openresty/lua
sudo ln -s /var/lib/docker/volumes/openresty-lualib/_data /opt/openresty/luaib
sudo ln -s /var/lib/docker/volumes/openresty-luajit/_data /opt/openresty/luajit
```

启动 OpenResty

```shell
sudo docker container run \
    --name openresty \
    --restart always \
    --privileged \
    -p 80:80 \
    -v openresty-conf:/usr/local/openresty/nginx/conf \
    -v openresty-html:/usr/local/openresty/nginx/html \
    -v openresty-log:/usr/local/openresty/nginx/log \
    -v openresty-cert:/usr/local/openresty/nginx/cert \
    -v openresty-run:/var/run/openresty \
    -v openresty-lua:/usr/local/openresty/nginx/lua \
    -v openresty-lualib:/usr/local/openresty/lualib \
    -v openresty-luajit:/usr/local/openresty/luajit \
    -d openresty/openresty:1.21.4.1-0-jammy
```

配置 Config (file: conf/nginx.conf)

```nginx
worker_processes  1;

events {
  worker_connections  1024;
}

http {
  include       mime.types;
  default_type  application/octet-stream;
  sendfile      on;
  keepalive_timeout 65;
  client_max_body_size 1000m;

  server {
    listen       80;

    ssi on;
    ssi_silent_errors on;

    location / {
      root   html;
      index  index.html index.htm;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
      root   html;
    }
  }
}
```

访问 http:127.0.0.1:80

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312281652235.png)

# Handle Request

配置 OpenResty 通过 Lua 处理请求, 返回 JSON 数据 (file: conf/nginx.conf)

```nginx
http {
  lua_package_path "/usr/local/openresty/lualib/?.lua";
  lua_package_cpath "/usr/local/openresty/lualib/?.so";

  server {
    listen 8081;
    location /api/item {
      default_type application/json;
      content_by_lua_file lua/item.lua;
    }
  }
}
```

配置 Nginx 转发请求到 OpenResty

```nginx
upstream openresty-cluster {
  server 127.0.0.1:8081;
}

server {
  listen 80;
      
  location /api {
    proxy_pass http://openresty-cluster;
  }
}
```

编写 Lua, 处理请求 (lua/item.lua)

```lua
ngx.say('{"id": 1, "name": "harvey", "age": 18}')
```

# Get Request Param

通过 RegExp 匹配 Path Param

```nginx
location ~ /api/item/(\d+)/(\d+) {
  default_type application/json;
  content_by_lua_file lua/item.lua;
}
```

获取匹配到的 Path Param

```lua
local param1 = ngx.var[1]
local param2 = ngx.var[2]
```

# Send Request

封装 HTTP Request 工具包, 类似于 AJAX (file: lualib/common.lua)

```lua
local function read_http(path, params)
  local resp = ngx.location.capture(path, {
    method = ngx.HTTP_GET,
    args = params,
  })
  if not resp then
    ngx.log(ngx.ERR, "http not found, path: ", path, ", args: ", args)
    ngx.exit(404)
  end
  return resp.body
end
local _M = {
  read_http = read_http
}
return _M
```

发送请求给本地的 Nginx (file: lua/item.lua)

```lua
local common = require('common')
local cjson = require('cjson')

local id = ngx.var[1]

local read_http = common.read_http
local itemJson = read_http('/item/' .. id, nil)
local stockJson = read_http('/item/stock/' .. id, nil)

local item = cjson.decode(itemJson)
local stock = cjson.decode(stockJson)
item.stock = stock.stock
item.sold = stock.sold

ngx.say(cjson.encode(item))
```

本地的 Nginx 再转发请求给 Tomcat Cluster, 通过 Hash 取模的方式将相同的请求转发给相同的 Tomcat, 保证缓存的命中率 (file: conf/nginx.conf)

```nginx
upstream tomcat-cluster {
  hash $request_uri;
  server 172.20.10.1:8081;
  server 172.20.10.2:8081;
  server 172.20.10.3:8081;
}

location /item {
  proxy_pass http://tomcat-cluster;
}
```

# Redis

封装 Redis 的工具包 (file: lualib/common.lua)

```lua
-- Close Redis connection (keepalive)
local function close_redis(red)
  local pool_max_idle_time = 10000
  local pool_size = 100
  local ok, err = red:set_keepalive(pool_max_idle_time, pool_size)
  if not ok then
    ngx.log(ngx.ERR, "Failed to place Redis connection pool: ", err)
  end
end

-- Query Redis
local function read_redis(host, port, pwd, key)
  -- Check Redis object
  if not red then
    ngx.log(ngx.ERR, "Redis object is nil")
    return nil
  end

  -- Connect to Redis
  local ok, err = red:connect(host, port)
  if not ok then
    ngx.log(ngx.ERR, "Connection to Redis failed:", err)
    return nil
  end
  
  -- Redis auth
  local ok, err = red:auth(pwd)
  if not ok then
    ngx.log(ngx.ERR, "Redis auth failed:", err)
    return nil
  end

  -- Query from Redis
  local resp, err = red:get(key)

  -- Query failed or empty data_type
  if not resp then
    ngx.log(ngx.ERR, "Failed to query Redis:", err, ", key = ", key)
  end

  -- Handle empty data_type
  if resp == ngx.null then
    resp = nil
    ngx.log(ngx.ERR, "The Redis data to be queried is empty, key =", key)
  end

  close_redis(red)
  return resp
end

-- Read data from Redis or HTTP
local function read_data(key, path, params)
  local resp = read_redis("127.0.0.1", 6379, "111", key)
  if not resp then
    ngx.log(ngx.ERR, "Failed to query data from Redis, key: ", key)
    resp = read_http(path, params)
  end
  return resp
end

local _M = {
  read_data = read_data
}
return _M
```

先从 Redis 中查询数据, 如果 Redis 中没有, 再去请求 Tomcat (file: lua/item.lua)

```lua
local common = require('common')
local cjson = require('cjson')

local id = ngx.var[1]

local read_data = common.read_data
local itemJson = read_data('item:id:' .. id, '/item/' .. id, nil)
local stockJson = read_data('item:stock:id:' .. id, '/item/stock/' .. id, nil)

local item = cjson.decode(itemJson)
local stock = cjson.decode(stockJson)
item.stock = stock.stock
item.sold = stock.sold

ngx.say(cjson.encode(item))
```

# Local Cache

开启 OpenResty 的 Local Cache (file: conf/nginx.conf)

```nginx
lua_shared_dict item_cache 150m;
lua_shared_dict stock_cache 150m;
```

先查询 Local Cache, 再查询 Redis, 最后查询 Tomcat (file: lualib/common.lua)

```lua
local item_cache = ngx.shared.item_cache

-- Read data from cache, Redis, HTTP
local function read_data(key, expire, path, params)
  -- Query from cache
  local resp = item_cache:get(key)
  if resp then
    return resp
  end
  
  -- Query from Redis
  resp = read_redis("127.0.0.1", 6379, "111", key)
  if resp then
    item_cache:set(key, resp, expire)
    return resp
  end
  
  -- Query from HTTP
  resp = read_http(path, params)
  if not resp then
    ngx.log(ngx.ERR, "Failed to query data from HTTP, path: ", path, ", args: ", args)
    return nil
  end
  
  -- Cache data
  item_cache:set(key, resp, expire)
  
  return resp
end
```
