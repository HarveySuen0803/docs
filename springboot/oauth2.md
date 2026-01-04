# OAuth2 Authentication

Server 通过 Session 存储 User Info, 基于 Session 对 Client 进行 Authentication, 更安全, 但是在分布式环境下, 想要保证 Session Unification 非常困难, 通常有下面几种方案

- Nginx 转发 Request 给存储了 Session 的 Server, 让 User 固定请求同一台 Server
- Server 存储 Session 后, 通过 MQ 去通知其他 Server 去同步 session
- Server 存储 Session 到 Redis, 其他 Server 从 Redis 中同步 Session
- Token Authentication 可以完美应对分布式环境, 但是容易泄漏 User Info, 而且 Token 太大, 也会造成网络堵塞

OAuth2 Authentication Role

- Client: 请求访问资源的应用程序
- Resource Owner: 是拥有受保护资源的用户, 授权给客户端访问其资源的权限
- Resource Server: 存储受保护的资源, 验证令牌的有效性, 并根据令牌的权限信息控制对资源的访问
- Authorization Server: 负责验证用户身份, 处理用户授权, 颁发访问令牌给客户端

# Token Authentication

如果 Authorization Server 和 Resource Server 相互信任, 双方共同存储 Secret Key

- Client 携带 Token 请求 Resource Server
- Resource Server 直接通过 Secret Key 解密, 比较 Signature, 获取 User Info, 不需要请求 Authorization Server, 减少通信, 提高性能

如果 Authorization Server 和 Resource Server 不信任, 只有 Authorization Server 存储 Secret Key

- Client 携带 Token 请求 Resource Server
- Resource Serve 携带 Token 请求 Authorization Server
- Authorization Serve 通过 Secret Key 解密, 比较 Signature, 返回 User Info 给 Resource Serve

# Authorization Code Grant

Authorization Code Grant Process

- User Agent (eg: Browser) 请求 Resource Server (eg: Baidu)
- Resource Server 引导 User Agent 携带 Client Identifier 和 Redirection URL 请求 Authorization Server (eg: Wechat) 获取 Code
- Client 携带 Code 访问 Resource Server
- Resource Server 携带 Code 访问 Authorization Server 获取 Token, 返回 Token 给 User
- User 携带 Token 访问 Resource Server, Server 解析 Token, 获取 User Info, 实现 Authentication

# Implicit Grant

Implicit Model 需要保证 Resource Server 和 Authorization Server 相互信任

Implicit Grant Process

- User 请求 Resource Server
- Resource Server 引导 User 携带 Client Identifier 和 Redirection URL 请求 Authorization Server 获取 Token
- Client 携带 Token 访问 Resource Server, Server 解析 Token, 获取 User Info, 实现 Authentication

# Resource Owner Credentials Grant

Resource Owner Credentials Grant Process

- User Agent 携带 Resource Owner 和 Password Credentials 请求 Resource Server
- Resource Server 携带 Resource Owner 和 Password Credentials 请求 Authorization Server 获取 Token, Resource Server 返回 Token 给 User
- Client 携带 Token 访问 Resource Server, Server 解析 Token, 获取 User Info, 实现 Authentication

# Client Credentials Grant

Client Credentials Grant 主要用于服务端到服务端的通信, 这种模式下, 客户端代表自己向认证服务器请求访问令牌, 这种模式适用于那些安全性要求较高, 需要保护客户端秘钥的场景, 这里 User 并不直接参与, 所有的交互都在 Server 进行

Client Credentials Grant Process

- Client 携带 Client Authentication 请求 Authorization Server
- Authorization Server 校验 Client Authentication 后返回 Access Token 给 Client
- Client 携带 Token 访问 Resource Server, Server 解析 Token, 获取 User Info, 实现 Authentication
