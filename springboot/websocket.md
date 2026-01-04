# WebSocket

导入 WebSocket Dependency。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

配置 WebSocket Endpoint。

```java
@Component
@ServerEndpoint("/ws/{sid}")
public class WebSocketEndpoint {
    private static Map<String, Session> sessionMap = new HashMap();

    // invoke after session connection
    @OnOpen
    public void onOpen(Session session, @PathParam("sid") String sid) {
        sessionMap.put(sid, session);
    }

    // invoke after client sends message
    @OnMessage
    public void onMessage(String message, @PathParam("sid") String sid) {
    }

    // close session connection
    @OnClose
    public void onClose(@PathParam("sid") String sid) {
        sessionMap.remove(sid);
    }

    // send message to all client
    public void sendToAllClient(String message) {
        Collection<Session> sessions = sessionMap.values();
        for (Session session : sessions) {
            try {
                session.getBasicRemote().sendText(message);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

配置 ServerEndpointExporter, ServerEndpointExporter 的作用是扫描并注册使用了 @ServerEndpoint 注解的 WebSocket 端点。

```java
@Bean
public ServerEndpointExporter serverEndpointExporter() {
    return new ServerEndpointExporter();
}
```

测试 WebSocket Endpoint 是否正常工作。

```java
@Component
public class WebSocketTask {
    @Autowired
    WebSocketServer webSocketServer;

    @Scheduled(cron = "0/5 * * * * ?")
    public void sendMessageToClient() {
        webSocketServer.sendToAllClient("hello world");
    }
}
```

# ServerEndpoint Configurator

在 Java 中使用 WebSocket，`@ServerEndpoint` 注解用于标记一个类作为 WebSocket 服务端点，而 `ServerEndpointConfig.Configurator` 则是一个可选的配置类，用于配置 WebSocket 服务端点。

下面是一个示例，展示了如何在 Java 中使用 `@ServerEndpoint` 和 `ServerEndpointConfig.Configurator`：

```java
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import javax.websocket.server.ServerEndpointConfig;

@ServerEndpoint(value = "/websocket", configurator = MyServerEndpointConfigurator.class)
public class MyWebSocketEndpoint {

    @OnOpen
    public void onOpen(Session session, EndpointConfig endpointConfig) {
        // 在这里可以处理 WebSocket 连接建立时的逻辑
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        // 在这里可以处理收到的消息
    }

    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        // 在这里可以处理 WebSocket 连接关闭时的逻辑
    }
}

public class MyServerEndpointConfigurator extends ServerEndpointConfig.Configurator {

    @Override
    public void modifyHandshake(ServerEndpointConfig sec, HandshakeRequest request, HandshakeResponse response) {
        // 在这里可以修改握手请求和响应的内容
    }

    @Override
    public boolean checkOrigin(String originHeaderValue) {
        // 在这里可以检查请求的 Origin 头部的值
        return true; // 默认允许所有请求
    }
}
```

在这个示例中：

- `configurator` 属性指定了一个配置类 `MyServerEndpointConfigurator`，用于配置 WebSocket 服务端点的一些行为。
- `MyServerEndpointConfigurator` 类继承自 `ServerEndpointConfig.Configurator`，并重写了 `modifyHandshake` 和 `checkOrigin` 方法，分别用于修改握手请求和响应的内容，以及检查请求的 Origin 头部的值。

通过使用 `@ServerEndpoint` 和 `ServerEndpointConfig.Configurator`，你可以轻松地创建和配置 WebSocket 服务端点，并且可以根据需要定制握手和连接行为。