# WebSocket

WebSocket 是一种在客户端和服务器之间建立持久性连接的通信协议，允许在一个单独的 TCP 连接上进行全双工通信，与传统的 HTTP 请求-响应模型不同，WebSocket 允许服务器主动向客户端推送数据，而不需要客户端发起请求。

双工通信和半双工通信是两种不同的通信方式，它们描述了数据在通信中的流动方式。

- 双工通信：双工通信是指数据能够在通信的两个方向上同时进行传输。例如：SMTP, FTP。
- 半双工通信：半双工通信是指数据只能在通信的两个方向上的一个方向进行传输。例如：HTTP。

客户端和服务器如何通过 WebSocket 进行通信交互的基本过程：

1. 建立连接：

- 客户端向服务器发起 WebSocket 连接请求，请求头里携带 `Upgrade: websocket`。
- 服务器接受 WebSocket 连接请求，并返回一个握手响应 `HTTP 101 Switching Protocols`，确认连接已建立。

2. 数据传输：

- 一旦连接建立，客户端和服务器之间就可以通过这个连接进行数据传输。双方可以同时发送和接收数据。
- 客户端可以通过 WebSocket 连接向服务器发送消息，而服务器也可以通过这个连接向客户端发送消息。

3. 保持连接：

- WebSocket 连接是持久性的，意味着一旦建立连接，它将保持打开状态直到客户端或服务器关闭连接。
- 为了保持连接活动，客户端和服务器可以周期性地发送 ping 帧。如果一方没有及时响应 ping 帧，另一方可以关闭连接。

4. 关闭连接：

- 当客户端或服务器决定关闭连接时，它可以发送一个关闭帧来通知另一方。收到关闭帧后，另一方也会发送一个关闭帧，然后双方关闭连接。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202405150635555.png)

WebSocket 的消息格式：

- WebSocket 消息可以是文本或二进制形式。文本消息通常是普通的字符串，而二进制消息可以是任意的二进制数据。
- 消息可以分为多个帧进行传输。每个帧都有自己的控制信息和有效载荷。控制信息包括帧类型（文本、二进制、Ping、Pong等）以及数据长度。

# Integrate JavaScript

当使用 JavaScript 来使用 WebSocket 时，你可以使用浏览器原生的 WebSocket API。下面是一个简单的示例，演示了如何在客户端使用 JavaScript 来建立 WebSocket 连接并发送和接收消息：

```java
// 创建 WebSocket 对象，指定服务器的 URL 为 websocket
const socket = new WebSocket('ws://example.com/websocket');

// 当连接建立时触发的事件处理程序
socket.onopen = function(event) {
    console.log('WebSocket 连接已建立');
    
    // 发送消息给服务器
    socket.send('Hello, server!');
};

// 当接收到消息时触发的事件处理程序
socket.onmessage = function(event) {
    console.log('接收到服务器的消息:', event.data);
    
    // 在这里可以处理接收到的消息
};

// 当发生错误时触发的事件处理程序
socket.onerror = function(error) {
    console.error('WebSocket 错误:', error);
};

// 当连接关闭时触发的事件处理程序
socket.onclose = function(event) {
    if (event.wasClean) {
        console.log('WebSocket 连接已关闭');
    } else {
        console.error('WebSocket 连接意外关闭');
    }
    console.log('关闭代码:', event.code, '关闭原因:', event.reason);
};

// 可选的关闭 WebSocket 连接的方法
// socket.close();
```

# Integrate Java

在 Java 中，WebSocket 的 Endpoint 是一个特殊的类，用于定义 WebSocket 服务端点的行为。它允许你定义处理 WebSocket 连接的逻辑，包括处理连接、接收消息、发送消息和关闭连接等操作。

在 Java 中，使用 @ServerEndpoint 注解来标记一个类作为 WebSocket Endpoint。当有客户端发送 WebSocket 连接请求到服务器时，服务器会根据 URL 中指定的路径来查找对应的 Endpoint 类，如果找到了匹配的类，就会实例化一个该类的对象来处理该连接。如果没有找到匹配的类，或者找到了但没有可用的构造函数来实例化对象，服务器将返回错误响应，拒绝连接。

以下是一个简单的 Java WebSocket Endpoint 的示例：

```java
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

// 客户端请求的 URL "ws://example.com/websocket" 中的 /websocket 就是匹配的这里的 /websocket
@ServerEndpoint("/websocket")
public class WebSocketEndpoint {
    // 当客户端连接时调用
    @OnOpen
    public void onOpen(Session session) {
        System.out.println("客户端连接成功: " + session.getId());
    }

    // 当接收到客户端消息时调用
    @OnMessage
    public void onMessage(String message, Session session) {
        System.out.println("接收到来自客户端的消息: " + message);
        // 可以在这里处理接收到的消息，然后回复客户端
        session.getAsyncRemote().sendText("已收到消息: " + message);
    }

    // 当连接关闭时调用
    @OnClose
    public void onClose(Session session) {
        System.out.println("连接关闭: " + session.getId());
    }
}
```

