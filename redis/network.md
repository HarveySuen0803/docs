# Network Model

Server Socket 注册 FD 到 EventLoop 上 (epoll 实例)

- Server Socket 注册 FD 之后, 会立刻绑定 Connection Acceptance Handler
- Client Socket 注册 FD 之后, 会立刻绑定 Command Request Handler
- epoll_wait() 调用之前, 会调用 beforeSleep() 遍历 server.clients_pending_write 给所有的 Client Obj 绑定 Command Reply Handler

通过 Connection Acceptance Handler 处理 Server Socket 的可读事件, Client Socket 连接到 Server Socket, Server Socket 会发送请求触发 Handler, 将 Client 的 FD 注册到EventLoop

通过 Command Request Handler 处理 Client Socket 的可读事件, Client Socket 发送请求后, 就会触发 Handler, 封装一个 Client Obj, 先将请求数据写入 c->queryBuf 中, 再解析 c->queryBuf 的数据转换成命令, 将命令的执行结果写入到 c->buf 和 c->reply 中, 再将这个 Client Obj 塞入 server.clients_pending_write 中

通过 Command Reply Handler 处理 Client Socket 的可写事件, 读取 server.clients_pending_write 中的 Client Obj, 将数据写入到 Client Socket, 完成响应

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401021459048.png)
