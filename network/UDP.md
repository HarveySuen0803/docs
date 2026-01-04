### UDP

UDP 是一种简单的、无连接的传输层协议，提供轻量级的通信机制。它适合需要快速传输和低延迟的应用，但不保证数据的可靠性、顺序或完整性。

UDP 特点

- 无连接：UDP 不需要建立连接即可发送数据。不存在像 TCP 的三次握手和四次挥手。
- 数据报模式：数据以独立的消息（数据报）形式发送，不拆分或重组数据流。
- 不可靠传输：不保证数据是否到达，也不提供重传机制。数据可能会丢失、重复或乱序。
- 高效：因为没有连接管理、重传机制，UDP 的开销低、延迟小。

UDP 应用场景

- 实时通信：如视频流、语音通话、在线游戏（低延迟比可靠性更重要）。
- 广播和多播：如网络发现协议、路由协议。
- 简单的查询协议：如 DNS 查询。

```c
// server.c

int main() {
    int server_sock;
    struct sockaddr_in server_addr, client_addr;
    char buffer[BUFFER_SIZE];
    socklen_t client_addr_len = sizeof(client_addr);

    // 创建 UDP 套接字
    server_sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (server_sock < 0) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    // 配置服务器地址
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    // 绑定套接字到指定端口
    if (bind(server_sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Bind failed");
        close(server_sock);
        exit(EXIT_FAILURE);
    }

    printf("UDP server is running on port %d...\n", PORT);

    // 接收数据并回复
    while (1) {
        memset(buffer, 0, BUFFER_SIZE);
        int len = recvfrom(server_sock, buffer, BUFFER_SIZE, 0,
                           (struct sockaddr *)&client_addr, &client_addr_len);
        if (len < 0) {
            perror("Receive failed");
            continue;
        }

        printf("Received message: %s\n", buffer);

        // 回复客户端
        const char *response = "Message received";
        sendto(server_sock, response, strlen(response), 0,
               (struct sockaddr *)&client_addr, client_addr_len);
    }

    close(server_sock);
    return 0;
}
```

```c
// client.c

int main() {
    int client_sock;
    struct sockaddr_in server_addr;
    char buffer[BUFFER_SIZE];
    socklen_t server_addr_len = sizeof(server_addr);

    // 创建 UDP 套接字
    client_sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (client_sock < 0) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    // 配置服务器地址
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    inet_pton(AF_INET, SERVER_IP, &server_addr.sin_addr);

    // 向服务器发送消息
    const char *message = "Hello, UDP server!";
    sendto(client_sock, message, strlen(message), 0,
           (struct sockaddr *)&server_addr, server_addr_len);
    printf("Message sent: %s\n", message);

    // 接收服务器回复
    memset(buffer, 0, BUFFER_SIZE);
    int len = recvfrom(client_sock, buffer, BUFFER_SIZE, 0,
                       (struct sockaddr *)&server_addr, &server_addr_len);
    if (len < 0) {
        perror("Receive failed");
        close(client_sock);
        exit(EXIT_FAILURE);
    }

    printf("Received from server: %s\n", buffer);

    close(client_sock);
    return 0;
}
```