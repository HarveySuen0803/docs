# Cookie

Cookie 是一种在远程浏览器端存储并在用户的本地机器上保留的小型数据, 该数据被用来追踪用户, 这对于保持网站会话的持续性非常有用, Cookie 包含了用户对某一网页或网站交互的信息

Cookie 交互

- 客户端发送请求, 服务端接受请求, 创建一个 Cookie 对象 存储数据, 响应 Cookie 给客户端 (添加响应头 Set-Cookie: name=sun), 客户端接受后, 会将 Cookie 存储在浏览器内
- 客户端携带 Cookie 再次请求 (添加请求头 Cookie: name=sun), 服务端就可以访问 Cookie 中存储的数据, 实现两次请求之间的数据共享

Cookie 特点

- 数据存储在客户端, 最大存储 3KB, 不安全

Cookie 应用

- 购物车
- 记住勾选


# Session

Session 也被使用来在用户的浏览器会话中存储信息, 但与 Cookie 不同的是, Session 数据存储在服务器端, 因此, 当用户对网站下一次请求时, 该网站可以查看并访问存储的 Session 数据

Session 特点

- 数据存储在服务端, 无限制存储, 安全

Session 应用

- 存储用户登录后的数据
- 用户登录后的名称显示
- 验证码

Session 交互

- 客户端发送请求, 服务端接受请求, 创建一个 Session 对象 存储数据, 将 Session 的 id 封装成一个 Cookie, 响应 Cookie 给客户端 (添加响应头 Set-Cookie: SESSIONID=10), 客户端接受后, 会将 Cookie 存储在浏览器内
- 客户端携带 Cookie 再次请求 (添加请求头 Cookie: JESSIONID=10), 服务端就可以根据  Cookie 中存储的 id 找到服务端的 Session, 实现两次请求之间的数据共享
