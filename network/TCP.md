### TCP

TCP (Transmission Control Protocol) 是互联网协议套件的主要协议之一, 提供了在通过 IP 网络通信的主机上运行的应用程序之间的可靠, 有序和错误检查的字节流传输. TCP 是 TCP/IP 套件的传输层的一部分, SSL/TLS 经常在 TCP 上运行. 诸如万维网, 电子邮件, 远程管理和文件传输等主要的互联网应用都依赖于 TCP.

### 3-Way Handshake

TCP 的三次握手, 是建立 TCP 连接的重要过程, 以保证连接的双向通信

- Client 发送 SYN 给 Server, 表示要建立连接, Client 切换状态为 SYN_SEND
- Server 接受到 SYN 后, 返回 SYN 和 ACK 给 Client, Server 切换状态为 SYN_RCVD
- Client 接受到 SYN 和 ACK 后, 返回 ACK 给 Server, Client 切换状态为 ESTABLISHED. Server 接受到 ACK 后, Server 切换状态为 ESTABLISHED, 完成 TCP 的三次握手, 可以开始传输数据了

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202402151439103.png)

TCP 的三次握手以最少的通信次数确认了双方的接收和发送能力是否正常, 确认了双方的初始序列号以便后续的数据传输

如果只进行两次握手, 就会因为网络延迟导致的 Client 和 Server 的连接状态不一致

- Client 发送 SYN1 给 Server, 但因为网络延迟没有到达 Server, 于是 Client 又发送一个 SYN2 给 Server
- Server 接受到 SYN2 后, 返回 SYN2 和 ACK2 给 Client 建立 Connection2
- 等 SYN1 到达 Server 后, Server 会以为是 Client 想要建立 Connection1, 于是返回一个 ACK1 给 Client, 在 Server 视角会认为已经建立了两个连接
- Client 接受到 SYN1 和 ACK1 后, 会判断该连接失败, 在 Client 视角会认为只建立一个连接

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202402151451792.png)

### 4-Way Wavehand

TCP 的四次挥手是指在 TCP 连接中, Client 和 Server 中任意一方在数据传输结束后, 想要结束连接, 就务器必须要做的四个动作

- Client 发送 FIN 给 Server, 表示要关闭连接, Client 切换状态为 FIN_WAIT_1
- Server 接受到 FIN 后, 返回 ACK 给 Client, Server 切换状态为 CLOSE_WAIT, 在这个过程中, Server 还可以发送数据给 Client, Server 发送完数据后, 发送 FIN 给 Client, Server 切换状态为 LAST_ACK
- Client 接受到 FIN 后, 返回 ACK 给 Server, Client 切换状态为 TIME_WAIT, 在这过程中, Client 会进入等待, 防止 Server 没有接受到刚才的 ACK 重新发送 FIN 要求结束, Client 等待两倍的 MSL 的时间后没有重新接受到 FIN, 就会切换状态为 CLOSED
- Server 接受到 ACK 后, 直接切换状态为 CLOSED

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202402151515308.png)

所有的 ACK 都不会重发，当 Client 没有收到 Server 的 ACK 时，Client 会重新发送 FIN 给 Server。

### Graceful Close

优雅关闭（Graceful Close）：采用四次挥手的流程。

- 一般由客户端调用 shutdown(sockfd, SHUT_WR) 关闭了写通道，表示不再向服务端写入数据，执行 close() 开始进行四次挥手的流程，发送 FIN 进入 ESTABLISHED 状态。此时客户端依旧开启着读通道，还可以接受服务端发送的善后数据请求。
- 服务端在第一次回复完 ACK 后，会进入善后工作，然后发送数据给客户端。

```c
void graceful_close(int sock) {
    // 主动关闭，发送 FIN
    if (shutdown(sock, SHUT_WR) < 0) {
        perror("shutdown failed");
        close(sock);
        return;
    }
    printf("Sent FIN, waiting for FIN-ACK and FIN from peer...\n");

    char buffer[1024];
    ssize_t len = recv(sock, buffer, sizeof(buffer), 0); // 等待对方的 FIN
    if (len == 0) {
        printf("Received FIN from peer, connection closed gracefully.\n");
    } else if (len > 0) {
        printf("Unexpected data received: %.*s\n", (int)len, buffer);
    } else {
        perror("recv failed");
    }

    close(sock); // 关闭套接字
    printf("Socket closed.\n");
}

int main() {
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) {
        perror("Socket creation failed");
        return 1;
    }

    struct sockaddr_in server_addr = {
        .sin_family = AF_INET,
        .sin_port = htons(12345),
    };

    inet_pton(AF_INET, "127.0.0.1", &server_addr.sin_addr);

    if (connect(sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Connect failed");
        close(sock);
        return 1;
    }

    printf("Connected to server.\n");
    graceful_close(sock);
    return 0;
}
```

### Abortive Close

强制关闭（Abortive Close）：不采用四次挥手的流程，直接关闭连接。

- 一般由客户端直接进入 CLOSED 状态，后续服务端发送来的任何消息，客户端只会回复一个 RST (RESET) 表示连接已重置。
- 当客户端发生崩溃或异常退出，没来得及调用 close() 或 shutdown() 时，操作系统会在进程退出时自动释放相关资源，向服务端发送 RST 包，表示连接被异常终端。

```c
void force_close(int sock) {
    struct linger linger_opt = {1, 0}; // 立即中断，不等待
    if (setsockopt(sock, SOL_SOCKET, SO_LINGER, &linger_opt, sizeof(linger_opt)) < 0) {
        perror("setsockopt failed");
        close(sock);
        return;
    }
    close(sock); // 此时发送 RST 包
    printf("Socket forcibly closed with RST.\n");
}

int main() {
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) {
        perror("Socket creation failed");
        return 1;
    }

    struct sockaddr_in server_addr = {
        .sin_family = AF_INET,
        .sin_port = htons(12345),
    };

    inet_pton(AF_INET, "127.0.0.1", &server_addr.sin_addr);

    if (connect(sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Connect failed");
        close(sock);
        return 1;
    }

    printf("Connected to server. Forcing closure...\n");
    force_close(sock);

    return 0;
}
```

### SYN, FIN, ACK

SYN (Synchronize), FIN (Finish) 和 ACK (Acknowledgment) 是 TCP 用于建立连接和确认数据包成功到达的标志位, 本质上 TCP 的数据包 Segment 在二进制位上做一些标识来标识的

SYN 和 FIN 会在 Sequence Number 中存储一个随机的数字 x, Node1 发送给 Node2 后, Node2 需要返回一个 ACK, ACK 会在 Acknowledgment Number 中存储 x+1, Node1 接受到 Segment 后, 去判断是否返回正确, 从而实现一次握手

- Sequence Number 可以处理乱序问题, Sequence Number 是顺序递增的, 可以确认 Segment 的顺序
- Sequence Number 可以处理丢包问题, 一个数据是被切分成多个数据包的, 如果因为网络问题丢包了, 就可以通过 Sequence Number 确认少的是哪一个包, 重新向对方申请这个包即可

TCP 就是使用 Sequence Number 为每个字节的数据进行编号，每个数据包的序列号表示该段数据的第一个字节在整个数据流中的位置，接收方通过检查序列号判断数据的顺序，并在接收到乱序数据时进行重新排序，从而保证了 TCP 通信的顺序。

### SYN Flood

SYN Flood 是一种常见的 DoS 攻击, 它通过 Client 大量伪造 IP 发送 SYN 给 Server，Server 需要返回 SYN 和 ACK 给 Client, 而 Client 又不回复 Server, 就会导致 Server 有大量的连接处于 SYN_RCVD 状态, 这些 Half-Open Connection 会一直占用 Half-Open Connection Queue, 当 Queue 满后, 就无法处理正常的请求连接了

### RTT

RTT (Round Trip Time) 表示往返延迟, 是指一个信号被发送出去到收到确认该信号已被接收的总时间. 这个时间延迟包括了两个通信端点之间的路径传播时间. 在计算机网络的语境中, 这个信号通常是一个数据包. RTT 也被称为 ping 时间, 可以通过 ping 确认. RTT 的一半通常被近似计算为端到端的延迟

### TFO

TFO (TCP Fast Open) 是对 TCP 的一种简化握手流程的拓展, 用于提高两端点间连接的打开速度

- Client 发送 SYN 给 Server, 通过一个标识符表示要开启 Fast Open
- Server 接受到 SYN 后, 不仅返回 SYN 和 ACK, 还会返回一个 Cookie 给 Client
- Client 接受到 SYN 和 ACK 后, 返回 ACK 给 Server 完成三次握手后, 存储 Cookie 到本地, 后续请求都携带这个 Cookie, Server 只需要校验 Cookie 是否正确, 既可以直接进入连接状态, 不需要三次握手了

TFO 在后续的每次请求中都会少一个 RTT, 效率提升很多

TFO 能有效解决 SYN Flood, Server 接受到 SYN 后, 会去检查是否携带 Cookie, 如果没有 Cookie 就不会再进行后续的三次握手了

TFO 存在一定安全风险, TFO 默认不会对结果的 TCP 连接提供任何形式的加密保护, 也不对端点进行身份保证, 如果需要这类防护, 可以与 TLS 或 IPsec 这样的加密协议组合使用

### MSL

MSL (Maximum Segment Life) 指的是网络数据包 (Segment) 在网络中可能存在的最长寿命, MSL 定义了一个数据包从发送到不能再被使用也就是丢弃所需的时间, 这是为了防止网络中的数据包过多导致网络拥塞, 数据包超过 MSL 时限后, 将被自动丢弃

TCP 中, MSL 常常关联到 TIME_WAIT 状态, 当一个 TCP 连接关闭后, 为了保证确保最后的 ACK 确认包能够成功送达, 或是为了避免已经关闭的连接的延迟数据包在新的连接中被错误处理, TCP 会进入一种叫做 TIME_WAIT 的状态, 并等待 2 倍的 MSL 时长, 这样设定的原因是要让网络中该连接两端可能存在的任何数据包都在网络中消失

### 连接队列大小

listen() 是服务端进入被动监听状态的关键一步。它将绑定的套接字转化为监听套接字，从而允许接受客户端连接。通过合理设置 backlog 参数和结合 accept() 的使用，可以高效地处理并发连接请求。

```c
#include <sys/socket.h>

// sockfd：套接字文件描述符，通过 socket() 创建并绑定到地址的套接字。
// backlog：未完成连接队列的最大长度，表示系统允许等待处理的客户端连接数量。
int listen(int sockfd, int backlog);
```

backlog 决定了服务器能容纳的连接请求数量，包括以下两部分：

- 未完成连接队列（SYN 队列）：
  - 包含客户端发出 SYN 后，服务器尚未完成三次握手的连接。
  - 此队列的长度由系统参数 tcp_max_syn_backlog 决定。
- 已完成连接队列（Accept 队列）：
  - 包含已经完成三次握手但尚未被 accept() 处理的连接。
  - 此队列的长度受 backlog 和系统参数 net.core.somaxconn 的共同限制。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412101618695.png)

backlog 不直接影响 SYN 队列的大小，但是通过控制 Accept 队列的大小，其实也会间接影响到 SYN 队列：

- 如果 backlog 过小，ACCEPT 队列会迅速填满。
- 当 ACCEPT 队列满时，SYN 队列中的连接无法及时被处理并转移到 ACCEPT 队列，最终可能导致 SYN 队列变得不堪重负。

backlog 决定了服务器能容忍的连接压力：

- 如果并发量较高，且服务器能够及时处理连接，可以将 backlog 设置为较大值。
- 如果连接处理较慢或资源有限，应选择适当的值，避免过多未处理连接耗尽系统资源。

### 大量 CLOSE_WAIT

如果 Server 存在大量 CLOSE_WAIT 状态，通常意味着 Server 存在问题，未能正确关闭连接。

```cpp
client_sock = accept(server_sock, NULL, NULL);
if (client_sock < 0) {
    perror("Accept failed");
    continue;
}
// 一般情况下，执行完简单的逻辑处理后，直接执行 close() 不会导致 CLOSE_WAIT 堆积
close(client_sock);
```

常见的原因包括：

- 未调用 close()：服务器程序在处理连接后未调用 close() 释放资源。
- 资源泄漏：连接过多，套接字未正确关闭，导致文件描述符耗尽。
- 阻塞操作：应用程序被其他操作（如 I/O 阻塞或死循环）卡住，无法处理连接的关闭。
- 高并发问题：在高并发场景中，程序处理不及时，导致连接堆积。

```c
client_sock = accept(server_sock, NULL, NULL);
if (client_sock < 0) {
    perror("Accept failed");
    continue;
}

printf("Accepted a connection, but simulating a long task...\n");

// 模拟长时间任务阻塞
sleep(60);

// 处理完后再关闭，耗时太久，导致大量的 CLOSE_WAIT
close(client_sock);
```

### 拥塞控制

拥塞控制是网络协议（如 TCP）的一项关键机制，用于防止网络因数据流量过大而发生拥塞（过载）。拥塞会导致数据包丢失、延迟增加、网络吞吐量下降。拥塞控制通过动态调整发送方的数据发送速率，使网络保持高效和稳定。

TCP 拥塞控制一般包括以下四个阶段，具体机制由算法实现：

1. 慢启动（Slow Start）

- 目标：逐步探测网络容量，从低速开始发送数据，避免一开始就发送过多数据导致网络拥塞。
- 机制：从 拥塞窗口（Congestion Window, CWND） 的初始值（如 1 MSS）开始，每次收到一个确认（ACK），CWND 增加一倍，CWND 通常以指数方式增长。
- 限制：当 CWND 达到 慢启动阈值（Slow Start Threshold, SSTHRESH） 时，进入拥塞避免阶段。

2. 拥塞避免（Congestion Avoidance）

- 目标：在接近网络容量时，以较慢的速度增加发送速率，避免触发拥塞。
- 机制：每个 RTT（往返时间），CWND 按线性方式增加（例如，每收到一个 ACK，增加 1/CWND）。
- 优点：避免了指数增长引发的拥塞风险。

3. 快速重传（Fast Retransmit）

- 目标：快速检测和恢复丢包，避免超时触发重传。
- 机制：当发送方收到 3 个重复的 ACK 时，立即重传丢失的数据包，而无需等待超时。

4. 快速恢复（Fast Recovery）

- 目标：在快速重传后快速恢复数据传输。
- 机制：将 SSTHRESH 设置为当前 CWND 的一半。将 CWND 设置为 SSTHRESH，然后进入拥塞避免阶段。

