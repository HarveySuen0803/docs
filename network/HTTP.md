# HTTP

HTTP 是一种网络通信协议, 基于 TCP, 面向连接, 安全, 建立连接后, 需要进行三次握手, 可以使浏览器工作更高效, 减少网络传输. 端口 80.

HTTP 是无状态协议, 服务端响应完后, 不会记录任何数据, 响应速度快, 但是多请求之间不能共享数据, 需要通过 Cookie, Session 解决.

# HTTP Request

请求的组成: 请求行 + 请求头 + 请求体

```
# 请求行, [请求方式] [请求路径] [HTTP 协议及版本号]
POST / HTTP/1.1
# 请求头, key-value 格式
Host: localhost:3000
Connection: keep-alive
Content-Length: 25
Cache-Control: max-age=0
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36 Edg/95.0.1020.53
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Referer: HTTP://localhost:63342/
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,zh-TW;q=0.5
Cookie: Webstorm-46a075f9=2c28767f-84f5-43ab-ba30-03a72a719916
...

# 请求体, GET 没有请求体, POST 有请求体
username=sun&password=111
```

GET 请求

- 没有请求体
- 请求参数存储在请求行中
- 请求参数有大小限制

```
GET /list.html?curPage=1&perPage=10 HTTP/1.1
Host: 127.0.0.1:8080
# 连接方式, 长连接
Connection: keep-alive
# 支持 HTTPS
Upgrade-Insecure-Requests: 1
# 用户代理, 客户端相关信息
User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36
# 浏览器可接受的资源类型 (比如: text/* 文本数据, image/* 图片资源, */* 任何数据)
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3
# 浏览器接收的编码方式
Accept-Encoding: gzip, deflate, br
# 浏览器接受的语言类型
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
```

POST 请求

- 有请求体
- 请求参数存储在请求体中
- 请求参数没有大小限制

```
POST / HTTP/1.1
Host: localhost:3000
Connection: keep-alive
Content-Length: 25
Cache-Control: max-age=0
sec-ch-ua: "Microsoft Edge";v="95", "Chromium";v="95", ";Not A Brand";v="99"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
Upgrade-Insecure-Requests: 1
Origin: HTTP://localhost:63342
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36 Edg/95.0.1020.53
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Sec-Fetch-Site: same-site
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Referer: HTTP://localhost:63342/
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,zh-TW;q=0.5
Cookie: Webstorm-46a075f9=2c28767f-84f5-43ab-ba30-03a72a719916

username=sun&password=111
```

# HTTP Response

响应数据的组成: 响应行 + 响应头 + 响应体

```
# 响应行, [HTTP 协议及版本] [状态码及状态描述]
HTTP/1.1 200 OK
# 响应体, k-v 形式
Cache-Control: private
Content-Encoding: gzip
Content-Type: text/html;charset=utf-8
Transfer-Encoding: chunked...
Date: Fri, 06 Apr 2018 09:05:27 GMT
Server: BWS/1.1

# 响应体
<html>
    <head>...</head>
    <body>...</body>
</html>
```

常见的状态码

| 状态码 | 状态描述                        | 解释                                                         |
| ------ | ------------------------------- | ------------------------------------------------------------ |
| 200    | OK                              | 客户端请求成功，即**处理成功**，这是我们最想看到的状态码     |
| 302    | Found                           | 指示所请求的资源已移动到由Location响应头给定的 URL，浏览器会自动重新访问到这个页面 |
| 304    | Not Modified                    | 告诉客户端，你请求的资源至上次取得后，服务端并未更改，你直接用你本地缓存吧。隐式重定向 |
| 400    | Bad Request                     | 客户端请求有**语法错误**，不能被服务器所理解                 |
| 403    | Forbidden                       | 服务器收到请求，但是**拒绝提供服务**，比如：没有权限访问相关资源 |
| 404    | Not Found                       | **请求资源不存在**，一般是 URL 输入有误，或者网站资源被删除了 |
| 428    | Precondition Required           | **服务器要求有条件的请求**，告诉客户端要想访问该资源，必须携带特定的请求头 |
| 429    | Too Many Requests               | **太多请求**，可以限制客户端请求某个资源的数量，配合 Retry-After(多长时间后可以请求)响应头一起使用 |
| 431    | Request Header Fields Too Large | **请求头太大**，服务器不愿意处理请求，因为它的头部字段太大。请求可以在减少请求头域的大小后重新提交。 |
| 405    | Method Not Allowed              | 请求方式有误，比如应该用 GET 请求方式的资源，用了 POST       |
| 500    | Internal Server Error           | **服务器发生不可预期的错误**。服务器出异常了，赶紧看日志去吧 |
| 503    | Service Unavailable             | **服务器尚未准备好处理请求**，服务器刚刚启动，还未初始化好   |
| 511    | Network Authentication Required | **客户端需要进行身份验证才能获得网络访问权限**               |

# HTTPS

HTTPS 是 HTTP 的增强版, 在 HTTP 的基础上增加了一系列安全机制, 可以认为是 HTTP + SSL, 既可以保证数据传输安全, 也可以对访问者进行校验. 端口 443.

HTTP or HTTPS

- HTTP

  - 无状态连接
  - 免费
  - 不安全
  - 速度快

- HTTPS

  - 有状态连接
  - 收费, 收费还不低
  - HTTPS 安全, 但是 Credential 不安全
  - 速度慢


