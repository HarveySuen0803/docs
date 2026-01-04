# Packet Problem

这里 Client 发送了 10 组 16B 的数据给 Server, Server 应该也是接收到 10 组 16B 的数据才对, 但是 Server 接受到了 1 组 160B 的数据, 这就是粘包问题

```java
bootstrap.handler(new ChannelInitializer<Channel>() {
    @Override
    protected void initChannel(Channel ch) {
        ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
            @Override
            public void channelActive(ChannelHandlerContext ctx) throws Exception {
                for (int i = 0; i < 10; i++) {
                    ByteBuf buf = ctx.alloc().buffer(16);
                    buf.writeBytes(new byte[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15});
                    ctx.writeAndFlush(buf);
                }
            }
        });
    }
});
```

这里 Client 发送了 1 组 160B 的数据给 Server, Server 应该也是接收到 1 组 160B 的数据才对, 但是 Server 接受到了多组数据加起来正好是 160B, 这就是半包问题

- 为了效果明显, 可以通过 `serverBootstrap.option(ChannelOption.SO_RCVBUF, 1);` 将 Server 的接受缓冲区设置的小一点
- 如果出不来半包的效果, 就说明你的机子太厉害了, 得增大发送的数据的大小 (eg: 发送一个 1600B 的数据)

```java
ByteBuf buffer = ctx.alloc().buffer();
for (int i = 0; i < 10; i++) {
    buffer.writeBytes(new byte[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15});
}
ctx.writeAndFlush(buffer);
```

# Sliding Window

TCP 以 Segment 为单位进行数据通信, 每发送一个段就需要进行一次确认应答, 包的往返时间越长性能就越差, 为了解决这个问题, TCP 引入了滑动窗口, 窗口大小决定了无需等待应答而可以继续发送的数据最大值

- 窗口实际就起到一个缓冲区的作用, 同时也能起到流量控制的作用
- 当发送的数据大小未达到窗口的最大值时, 就不需要等待确认应答, 直接发送请求
- 当发送的数据大小已达到窗口的最大值时, 就需要等待确认应答, 然后窗口向下移动, 就可以继续发送请求了

TCP 的滑动窗口的大小直接影响数据的发送和接收, 就可能导致粘包和半包问题

- 粘包: 如果接收方的应用程序没有及时读取数据, 数据就会缓冲在接收方的滑动窗口中, 当积累了多个报文后, 就导致了粘包
- 半包: 对于大于滑动窗口当前大小的数据包, TCP 必须将其分割为多个较小的段来发送, 这可能导致接收方在一次读取操作中只接收到部分数据, 造成了半包

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202404071854379.png)

# Nagle Algo

Nagle Algo 也会导致粘包, Nagle Algo 是为了提高网络效率而设计的一种数据传输优化机制, 通过减少需要传输的小包数量来减少网络拥塞, 该算法的核心思想是在 TCP 层聚集多个小的数据包, 直到积累到一定大小后再一起发送, 这就导致了粘包问题

- IP 报头占 20B, TCP 报头占 20B, 如果一个数据包的实际数据量非常小, 还要携带这两货一块传输, 非常的不划算, 干脆积累到一定的数据量后, 一块传输

# MSS

MSS 也会导致半包, MSS (Maximum Segment Size) 是 TCP 协议中定义的一个选项, 指的是 TCP 层能够接收的最大数据段的大小, 当应用层发送的一条消息大于 MSS 大小时, 这条消息会被分割成多个 TCP Segment 发送, 这就导致了半包问题

- MSS 主要用来通知对端 TCP 连接的接收方在不进行 IP 分段的情况下能够接收的最大数据量, 目的是为了避免在网络中发生 IP 分片, 从而提高网络传输的效率

# Short Connection

客户端只建立短连接, 一次连接只发送一组数据, 发送完就关闭连接, 然后再建立连接发送数据, 可以解决粘包问题, 但是无法解决半包问题, 而且效率非常低, 不推荐

```java
@Slf4j
public class NettyClient {
    public static void main(String[] args) throws IOException {
        for (int i = 0; i < 10; i++) {
            sendMsg();
        }
        System.out.println("hello world");
    }
    
    private static void sendMsg() {
        EventLoopGroup eventLoopGroup = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(eventLoopGroup);
            bootstrap.channel(NioSocketChannel.class);
            bootstrap.handler(new ChannelInitializer<Channel>() {
                @Override
                protected void initChannel(Channel ch) {
                    ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                        @Override
                        public void channelActive(ChannelHandlerContext ctx) throws Exception {
                            // 发送 1 组数据
                            ByteBuf buf = ctx.alloc().buffer();
                            buf.writeBytes(new byte[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15});
                            ctx.writeAndFlush(buf);
                            // 关闭会话
                            ctx.close();
                        }
                    });
                }
            });
            ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 10100).sync();
            channelFuture.channel().closeFuture().sync();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            eventLoopGroup.shutdownGracefully();
        }
    }
}
```

# FixedLengthFrameDecoder

FixedLengthFrameDecoder 是一个解码器, 用于处理定长消息的粘包和半包问题, 这个解码器按照指定的消息长度来分割接收到的数据包, 确保每个处理单元都是一个完整的, 固定长度的消息, 这种方法非常适合那些具有固定长度消息格式的协议

这里的 "ABC" 发生半包问题, 变成了 "A" 和 "BC", 这里的 "DEF" 和 "GHI" 发生粘包和半包问题, 变成了 "DEFG" 和 "HI"

```txt
+---+----+------+----+
| A | BC | DEFG | HI |
+---+----+------+----+
```

添加 new FixedLengthFrameDecoder(3) 可以有效解决粘包, 半包问题

- 接收到 "A" 后, 发现不足 3, 就会等待, 等到 "BC" 后, 拼接成 "ABC"
- 接收到 "DEFG" 后, 发现超出了 3, 就只取前 3 个, 得到 "DEF", 剩下 "G" 留在缓冲区中
- 接收到 "HI" 后, 和 "G" 拼接得到 "GHI"

```txt
+-----+-----+-----+
| ABC | DEF | GHI |
+-----+-----+-----+
```

只需要在 HandlerChain 中添加一个 FixedLengthFrameDecoder 即可解决粘包和半包问题

```java
@Slf4j
public class NettyServer {
    public static void main(String[] args) {
        EventLoopGroup boss = new NioEventLoopGroup(1);
        EventLoopGroup worker = new NioEventLoopGroup(2);
        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap.group(boss, worker);
            serverBootstrap.channel(NioServerSocketChannel.class);
            serverBootstrap.childHandler(new ChannelInitializer<NioSocketChannel>() {
                @Override
                protected void initChannel(NioSocketChannel ch) {
                    // 指定固定长度为 8
                    ch.pipeline().addLast(new FixedLengthFrameDecoder(8));
                    ch.pipeline().addLast(new LoggingHandler(LogLevel.DEBUG));
                }
            });
            ChannelFuture channelFuture = serverBootstrap.bind(10100).sync();
            channelFuture.channel().closeFuture().sync();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            boss.shutdownGracefully();
            worker.shutdownGracefully();
        }
    }
}
```

```java
@Slf4j
public class NettyClient {
    public static void main(String[] args) throws IOException {
        sendMsg();
    }
    
    private static void sendMsg() {
        EventLoopGroup eventLoopGroup = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(eventLoopGroup);
            bootstrap.channel(NioSocketChannel.class);
            bootstrap.handler(new ChannelInitializer<Channel>() {
                @Override
                protected void initChannel(Channel ch) {
                    ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                        @Override
                        public void channelActive(ChannelHandlerContext ctx) throws Exception {
                            ByteBuf buf = ctx.alloc().buffer();
                            // 发送 10 组 8B 的数据, 测试粘包和半包问题是否解决
                            for (int ch = 0; ch < 10; ch++) {
                                buf.writeBytes(getRandomBytes('a', 8));
                            }
                            ctx.writeAndFlush(buf);
                        }
                    });
                }
            });
            ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 10100).sync();
            channelFuture.channel().closeFuture().sync();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            eventLoopGroup.shutdownGracefully();
        }
    }

    // 随机生成一个 byte[] 长度为 8, 但是有效数据长度为随机, 这个 8 就是固定长度
    // 如 "aaa_____", 其中 "aaa" 为有效数据, "______" 为对齐到长度 8 的字符
    private static byte[] getRandomBytes(char ch, int cap) {
        int len = (int) (Math.random() * 8 + 1);
        StringBuilder sb = new StringBuilder(cap);
        for (int i = 0; i < len; i++) {
            sb.append(ch);
        }
        for (int i = len; i < cap; i++) {
            sb.append("_");
        }
        return sb.toString().getBytes();
    }
}
```

通过 FixedLengthFrameDecoder 解决粘包和半包问题的优点

- 性能优良: 处理定长消息通常比处理变长消息更高效, 因为可以预分配固定大小的缓冲区, 避免了动态分配和复制数据
- 易于实现: 使用 FixedLengthFrameDecoder 可以轻松实现基于定长消息的协议, 不需要复杂的状态管理或边界查找逻辑

通过 FixedLengthFrameDecoder 解决粘包和半包问题的缺点

- 浪费空间: 固定长度需要对齐包的大小
- 不灵活: 固定长度的消息格式对于许多应用来说可能太过限制, 特别是当消息大小有较大变化时

# LineBasedFrameDecoder

LineBasedFrameDecoder 是一个基于行的解码器, 用于处理以行结束符 (eg: `\n` 和 `\r\n`) 为分隔符的文本协议, 这种解码器在遇到指定的行结束符时, 将数据分割成一行一行的帧 (Frame), 通过这种方式, 它能够解决 TCP 传输中的粘包和半包问题

```java
@Slf4j
public class NettyServer {
    public static void main(String[] args) {
        EventLoopGroup boss = new NioEventLoopGroup(1);
        EventLoopGroup worker = new NioEventLoopGroup(2);
        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap.group(boss, worker);
            serverBootstrap.channel(NioServerSocketChannel.class);
            serverBootstrap.childHandler(new ChannelInitializer<NioSocketChannel>() {
                @Override
                protected void initChannel(NioSocketChannel ch) {
                    // 添加 LineBasedFrameDecoder, 并指定最大长度为 1024B, 如果超出了 1024B 还没有遇到 '\n' 或 '\r\n' 就抛出异常
                    ch.pipeline().addLast(new LineBasedFrameDecoder(1024));
                    ch.pipeline().addLast(new LoggingHandler(LogLevel.DEBUG));
                }
            });
            ChannelFuture channelFuture = serverBootstrap.bind(10100).sync();
            channelFuture.channel().closeFuture().sync();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            boss.shutdownGracefully();
            worker.shutdownGracefully();
        }
    }
}
```

```java
@Slf4j
public class NettyClient {
    public static void main(String[] args) throws IOException {
        sendMsg();
    }
    
    private static void sendMsg() {
        EventLoopGroup eventLoopGroup = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(eventLoopGroup);
            bootstrap.channel(NioSocketChannel.class);
            bootstrap.handler(new ChannelInitializer<Channel>() {
                @Override
                protected void initChannel(Channel ch) {
                    ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                        @Override
                        public void channelActive(ChannelHandlerContext ctx) throws Exception {
                            ByteBuf buf = ctx.alloc().buffer();
                            // 发送 10 组 8B 的数据, 测试粘包和半包问题是否解决
                            for (int ch = 0; ch < 10; ch++) {
                                buf.writeBytes(getRandomBytes('a', 1, 8));
                            }
                            ctx.writeAndFlush(buf);
                        }
                    });
                }
            });
            ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 10100).sync();
            channelFuture.channel().closeFuture().sync();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            eventLoopGroup.shutdownGracefully();
        }
    }
    
    // 生成一个长度在 minLen ~ maxLen 范围内随机的 byte[], 并且以 '\n' 结尾
    // 如 "aaaaa\n" 长度在 minLen ~ maxLen 之间, 以 '\n' 结尾
    private static byte[] getRandomBytes(char ch, int minLen, int maxLen) {
        int len = (int) (Math.random() * (maxLen - minLen + 1) + 1);
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(ch);
        }
        sb.append("\n");
        return sb.toString().getBytes();
    }
}
```

通过 FixedLengthFrameDecoder 解决粘包和半包问题的优点

- 节省空间: 相比于 FixedLengthFrameDecoder, 可以发送不定长的数据

通过 FixedLengthFrameDecoder 解决粘包和半包问题的缺点

- 受制于文本协议: 主要适用于文本协议, 对于二进制协议, 这种方法不适用
- 行长度限制: 如果设置的最大行长度过小, 可能会导致长消息被截断, 如果过大, 则可能会在恶意数据注入或错误的数据格式时消耗过多内存
- 性能稍差: 需要数长度, 肯定没有 FixedLengthFrameDecoder 那种预分配来的快

# LengthFieldBasedFrameDecoder

LengthFieldBasedFrameDecoder 是一种解码器, 用于处理那些在消息体前包含长度字段的协议, 这种解码器能够根据消息头中的长度字段来确定每个消息的边界, 有效解决粘包和半包问题, 这种方法特别适用于消息长度动态变化的协议

LengthFieldBasedFrameDecoder 有下面这几个关键参数, 需要注意和理解

- lengthFieldOffset: 记录 Length Field 的偏移量
- lengthFieldLength: 记录 Length Field 的长度
- lengthAdjustment: 记录从 Legnth Field 到 Actual Content 的长度
- initialBytesToStrip: 记录要从头开始剥离几个字节

```txt
lengthFieldOffset   = 0
lengthFieldLength   = 2
lengthAdjustment    = 0
initialBytesToStrip = 0

BEFORE DECODE (14 bytes)         AFTER DECODE (14 bytes)
+--------+----------------+      +--------+----------------+
| Length | Actual Content |----->| Length | Actual Content |
| 0x000C | "HELLO, WORLD" |      | 0x000C | "HELLO, WORLD" |
+--------+----------------+      +--------+----------------+

- 这里的 Length 记录了 Actual Content 的长度, 
- lengthFieldLength 记录 Length Field 的 Length, 这里 "0x000C" 用到了 2B, 所以 lengthFieldOffset = 2
```

```txt
lengthFieldOffset   = 0
lengthFieldLength   = 2
lengthAdjustment    = 0
initialBytesToStrip = 2
 
BEFORE DECODE (14 bytes)         AFTER DECODE (12 bytes)
+--------+----------------+      +----------------+
| Length | Actual Content |----->| Actual Content |
| 0x000C | "HELLO, WORLD" |      | "HELLO, WORLD" |
+--------+----------------+      +----------------+

- initialBytesToStrip 记录要从头开始剥离几个字节, 这里剥离了 2B, 剥离了整个 Length, 所以 initialBytesToStrip = 2
```

```txt
lengthFieldOffset   = 2
lengthFieldLength   = 3
lengthAdjustment    = 0
initialBytesToStrip = 0
 
BEFORE DECODE (17 bytes)                      AFTER DECODE (17 bytes)
+----------+----------+----------------+      +----------+----------+----------------+
| Header 1 |  Length  | Actual Content |----->| Header 1 |  Length  | Actual Content |
|  0xCAFE  | 0x00000C | "HELLO, WORLD" |      |  0xCAFE  | 0x00000C | "HELLO, WORLD" |
+----------+----------+----------------+      +----------+----------+----------------+


- lengthFieldOffset 记录了 Length Field 的偏移量, 这里跳过 Header 需要 2B, 所以 lengthFieldOffset = 2
- lengthFieldLength 记录了 Length Field 的长度, 这里 "0x00000C" 用到了 3B, 所以 lengthFieldOffset = 3
```

```txt
lengthFieldOffset   = 1
lengthFieldLength   = 2
lengthAdjustment    = 1
initialBytesToStrip = 3
 
BEFORE DECODE (16 bytes)                       AFTER DECODE (13 bytes)
+------+--------+------+----------------+      +------+----------------+
| HDR1 | Length | HDR2 | Actual Content |----->| HDR2 | Actual Content |
| 0xCA | 0x000C | 0xFE | "HELLO, WORLD" |      | 0xFE | "HELLO, WORLD" |
+------+--------+------+----------------+      +------+----------------+

- lengthAdjustment 记录了从 Length 到 Actual Content 的长度, 中间的 HDR2 占用 1B, 所以 lengthAdjustment = 1
```

```java
@Slf4j
public class Main {
    public static void main(String[] args) throws IOException, InterruptedException, ExecutionException {
        EmbeddedChannel channel = new EmbeddedChannel(
            new LengthFieldBasedFrameDecoder(1024, 6, 4, 2, 12),
            new LoggingHandler(LogLevel.DEBUG)
        );
        
        ByteBuf buf = ByteBufAllocator.DEFAULT.buffer();
        sendMsg(buf, "header", "v1", "Hello world");
        sendMsg(buf, "header", "v1", "Hi, I' am harvey");
        channel.writeInbound(buf);
    }
    
    private static void sendMsg(ByteBuf buf, String header, String version, String msg) {
        // 设置 Msg 的 Header, 同时应该设置 lengthFieldOffset = header.length() = 6
        buf.writeBytes(header.getBytes());
        // 设置 Length Field, 记录了 Actual Content 的长度, 这里设置的是 int 类型, 所以 lengthFieldLength = 4
        buf.writeInt(msg.length());
        // 设置 Length Field 和 Actual Content 中间的内容, 所以 lengthAdjustment = version.length() = 2
        buf.writeBytes(version.getBytes());
        // 设置 Actual Content
        buf.writeBytes(msg.getBytes());
        // 如果想要在 DECODE 后, 去除掉 header, Length Field 和 version, 就设置 initialBytesToStrip =  header.length() + lengthFieldLength + version.length() = 6 + 4 + 2 = 12
    }
}
```

```txt
23:34:06.596 [main] DEBUG io.netty.handler.logging.LoggingHandler - [id: 0xembedded, L:embedded - R:embedded] READ: 11B
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 48 65 6c 6c 6f 20 77 6f 72 6c 64                |Hello world     |
+--------+-------------------------------------------------+----------------+
23:34:06.596 [main] DEBUG io.netty.handler.logging.LoggingHandler - [id: 0xembedded, L:embedded - R:embedded] READ: 16B
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 48 69 2c 20 49 27 20 61 6d 20 68 61 72 76 65 79 |Hi, I' am harvey|
+--------+-------------------------------------------------+----------------+
23:34:06.596 [main] DEBUG io.netty.handler.logging.LoggingHandler - [id: 0xembedded, L:embedded - R:embedded] READ COMPLETE
```

