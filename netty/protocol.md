# RESP

配置 Redis Client 采用 RESP 发送请求给 Redis Server

```java
@Slf4j
public class RedisClient {
    public static void main(String[] args) throws IOException {
        EventLoopGroup eventLoopGroup = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(eventLoopGroup);
            bootstrap.channel(NioSocketChannel.class);
            bootstrap.handler(new ChannelInitializer<Channel>() {
                @Override
                protected void initChannel(Channel ch) {
                    ch.pipeline().addLast(new LoggingHandler());
                    ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                        @Override
                        public void channelActive(ChannelHandlerContext ctx) throws Exception {
                            auth(ctx);
                            setKey(ctx);
                        }
                        
                        @Override
                        public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                            ByteBuf buf = (ByteBuf) msg;
                            System.out.println(buf.toString(Charset.defaultCharset()));
                            ctx.close();
                        }
                    });
                }
            });
            ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 6379).sync();
            channelFuture.channel().closeFuture().sync();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            eventLoopGroup.shutdownGracefully();
        }
    }
    
    private static byte[] CRLF = {13, 10}; // \r\n
    
    private static void auth(ChannelHandlerContext ctx) {
        ByteBuf buf = ctx.alloc().buffer();
        buf.writeBytes("*2".getBytes());
        buf.writeBytes(CRLF);
        buf.writeBytes("$4".getBytes());
        buf.writeBytes(CRLF);
        buf.writeBytes("auth".getBytes());
        buf.writeBytes(CRLF);
        buf.writeBytes("$3".getBytes());
        buf.writeBytes(CRLF);
        buf.writeBytes("111".getBytes());
        buf.writeBytes(CRLF);
        ctx.writeAndFlush(buf);
    }
    
    private static void setKey(ChannelHandlerContext ctx) {
        ByteBuf buf = ctx.alloc().buffer();
        buf.writeBytes("*3".getBytes());
        buf.writeBytes(CRLF);
        buf.writeBytes("$3".getBytes());
        buf.writeBytes(CRLF);
        buf.writeBytes("set".getBytes());
        buf.writeBytes(CRLF);
        buf.writeBytes("$2".getBytes());
        buf.writeBytes(CRLF);
        buf.writeBytes("k1".getBytes());
        buf.writeBytes(CRLF);
        buf.writeBytes("$2".getBytes());
        buf.writeBytes(CRLF);
        buf.writeBytes("v1".getBytes());
        buf.writeBytes(CRLF);
        ctx.writeAndFlush(buf);
    }
}
```

# HTTP

配置 HTTP Server 接受 HTTP Client 的 HTTP Request

```java
@Slf4j
public class NettyServer {
    public static void main(String[] args) {
        EventLoopGroup boss = new NioEventLoopGroup(1);
        EventLoopGroup worker = new NioEventLoopGroup(2);
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        serverBootstrap.group(boss, worker);
        serverBootstrap.channel(NioServerSocketChannel.class);
        serverBootstrap.childHandler(new ChannelInitializer<NioSocketChannel>() {
            @Override
            protected void initChannel(NioSocketChannel ch) {
                ch.pipeline().addLast(new LoggingHandler(LogLevel.DEBUG));
                ch.pipeline().addLast(new HttpServerCodec());
                
                // Client 发送请求, 可能是 GET 或 POST, 所以有可能只发送了请求头, 也有可能既发送了请求头, 也发送了请求体
                
                // 添加一个 Handler, 只关心 HttpRequest 请求头
                ch.pipeline().addLast(new SimpleChannelInboundHandler<HttpRequest>() {
                    @Override
                    protected void channelRead0(ChannelHandlerContext ctx, HttpRequest msg) throws Exception {
                        // 接受请求信息
                        log.debug("HttpRequest: {}", msg);
                        log.debug("uri: {}", msg.uri());
                        log.debug("headers: {}", msg.headers());
                        
                        byte[] bytes = "<h1>hello world</h1>".getBytes();
                        
                        // 返回响应信息
                        DefaultFullHttpResponse rep = new DefaultFullHttpResponse(msg.protocolVersion(), HttpResponseStatus.OK);
                        rep.headers().setInt(HttpHeaderNames.CONTENT_LENGTH, bytes.length); // 设置响应数据的长度 (必须, 否则会一直转圈圈, 因为不知道具体要返回多长的数据)
                        rep.content().writeBytes(bytes); // 设置响应数据
                        ctx.writeAndFlush(rep);
                    }
                });
                
                // 添加一个 Handler, 只关心 HttpContent 请求体
                ch.pipeline().addLast(new SimpleChannelInboundHandler<HttpContent>() {
                    @Override
                    protected void channelRead0(ChannelHandlerContext ctx, HttpContent msg) throws Exception {
                        log.debug("HttpContent: {}", msg);
                    }
                });
            }
        });
        try {
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

HTTP Client 访问 http://127.0.0.1:10100 发送请求给 HTTP Server, 接收到 HTTP Server 响应的 "hello world"

# Custom Protocol

## Custom Message

配置 Custom Message 用于消息传输

- LoginRequestMessage 用于登录请求的消息, LoginResponseMessage 用于登录响应的消息

```java
public abstract class Message implements Serializable {

    public static Class<?> getMessageClass(int messageType) {
        return messageClasses.get(messageType);
    }

    private int sequenceId;

    private int messageType;

    public abstract int getMessageType();

    public static final int LoginRequestMessage = 0;
    public static final int LoginResponseMessage = 1;
    public static final int ChatRequestMessage = 2;
    public static final int ChatResponseMessage = 3;
    public static final int GroupCreateRequestMessage = 4;
    public static final int GroupCreateResponseMessage = 5;
    public static final int GroupJoinRequestMessage = 6;
    public static final int GroupJoinResponseMessage = 7;
    public static final int GroupQuitRequestMessage = 8;
    public static final int GroupQuitResponseMessage = 9;
    public static final int GroupChatRequestMessage = 10;
    public static final int GroupChatResponseMessage = 11;
    public static final int GroupMembersRequestMessage = 12;
    public static final int GroupMembersResponseMessage = 13;
    private static final Map<Integer, Class<?>> messageClasses = new HashMap<>();

    static {
        messageClasses.put(LoginRequestMessage, LoginRequestMessage.class);
        messageClasses.put(LoginResponseMessage, LoginResponseMessage.class);
        messageClasses.put(ChatRequestMessage, ChatRequestMessage.class);
        messageClasses.put(ChatResponseMessage, ChatResponseMessage.class);
        messageClasses.put(GroupCreateRequestMessage, GroupCreateRequestMessage.class);
        messageClasses.put(GroupCreateResponseMessage, GroupCreateResponseMessage.class);
        messageClasses.put(GroupJoinRequestMessage, GroupJoinRequestMessage.class);
        messageClasses.put(GroupJoinResponseMessage, GroupJoinResponseMessage.class);
        messageClasses.put(GroupQuitRequestMessage, GroupQuitRequestMessage.class);
        messageClasses.put(GroupQuitResponseMessage, GroupQuitResponseMessage.class);
        messageClasses.put(GroupChatRequestMessage, GroupChatRequestMessage.class);
        messageClasses.put(GroupChatResponseMessage, GroupChatResponseMessage.class);
        messageClasses.put(GroupMembersRequestMessage, GroupMembersRequestMessage.class);
        messageClasses.put(GroupMembersResponseMessage, GroupMembersResponseMessage.class);
    }
}
```

```java
public class LoginRequestMessage extends Message {
    private String username;
    private String password;
    private String nickname;

    public LoginRequestMessage() {
    }

    public LoginRequestMessage(String username, String password, String nickname) {
        this.username = username;
        this.password = password;
        this.nickname = nickname;
    }

    @Override
    public int getMessageType() {
        return LoginRequestMessage;
    }
}
```

## Custom MessageCodec

配置 Custom MessageCodec 的 encode() 和 decode() 对消息进行编解码

```java
@Slf4j
public class MessageCodec extends ByteToMessageCodec<Message> {
    @Override
    protected void encode(ChannelHandlerContext ctx, Message msg, ByteBuf out) throws Exception {
        // 魔术 (4B)
        out.writeBytes(new byte[]{'C', 'A', 'F', 'E'});
        
        // 版本 (1B)
        out.writeByte(1);
        
        // 序列化方式 (1: JDK, 2: JSON, 3: Hessian) (1B)
        out.writeByte(1);
        
        // 消息类型 (1B)
        out.writeByte(msg.getMessageType());
        
        // 消息序列号, 用于双工通信 (4B)
        out.writeInt(msg.getSequenceId());
        
        // 对齐 (1B), 保证组成部分 4 + 1 + 1 + 1 + 1 + 4 + 4 B = 16B (除了消息内容) 为 2 的整数倍, 专业一点 ^_^
        out.writeByte(0xff);
        
        // 通过 JDK 进行序列化
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(bos);
        oos.writeObject(msg);
        byte[] bytes = bos.toByteArray();
        
        // 消息内容长度 (4B)
        out.writeInt(bytes.length);

        // 消息内容
        out.writeBytes(bytes);
    }
    
    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> msgList) throws Exception {
        // 魔术
        int magicNum = in.readInt();
        
        // 版本
        byte version = in.readByte();
        
        // 序列化器类型
        byte serializerType = in.readByte();
        
        // 消息类型
        byte messageType = in.readByte();
        
        // 消息序列号
        int sequenceId = in.readInt();
        
        // 对齐
        in.readByte();
        
        // 消息内容长度
        int length = in.readInt();
        
        // 通过 JDK 进行反序列化
        byte[] bytes = new byte[length];
        in.readBytes(bytes, 0, length);
        ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(bytes));
        
        // 消息内容
        Message msg = (Message) ois.readObject();

        log.debug("Decoded msg info: {}, {}, {}, {}, {}, {}", magicNum, version, serializerType, messageType, sequenceId, length);
        log.debug("Decoded msg: {}", msg);
        
        msgList.add(msg);
    }
}
```

```java
public static void main(String[] args) throws Exception {
    EmbeddedChannel channel = new EmbeddedChannel(
        // 通过 LengthFieldBasedFrameDecoder 解决 Packet Problem
        //   maxFrameLength      = 1024
        //   lengthFieldOffset   = 12
        //   lengthFieldLength   = 4
        //   lengthAdjustment    = 0
        //   initialBytesToStrip = 0
        new LengthFieldBasedFrameDecoder(1024, 12, 4, 0, 0),
        new LoggingHandler(),
        new MessageCodec()
    );
    
    // 出站时调用 encode(), 对 srcMsg 进行 encode 转成 tarMsg
    LoginRequestMessage srcMsg = new LoginRequestMessage("Harvey Suen", "111", "Harvey");
    channel.writeOutbound(srcMsg);
    ByteBuf tarMsg = channel.readOutbound();
    
    // 入站时调用 decode(), 对 tarMsg 进行 decode 转成 srcMsg
    channel.writeInbound(tarMsg);
    LoginRequestMessage srcMsg1 = channel.readInbound();
}
```

手动拆分一个 buf 用来模拟 Packet Problem 的半包

```java
public static void main(String[] args) throws Exception {
    EmbeddedChannel channel = new EmbeddedChannel(
        new LengthFieldBasedFrameDecoder(1024, 12, 4, 0, 0),
        new LoggingHandler(),
        new MessageCodec()
    );
    
    LoginRequestMessage srcMsg = new LoginRequestMessage("Harvey Suen", "111", "Harvey");
    channel.writeOutbound(srcMsg);
    ByteBuf tarMsg = channel.readOutbound();
    
    // 将一个 ByteBuf 通过 slice() 拆分成两个 ByteBuf 来模拟半包问题
    ByteBuf tarMsgSlice1 = tarMsg.slice(0, 100);
    ByteBuf tarMsgSlice2 = tarMsg.slice(100, tarMsg.readableBytes() - 100);
    
    // slice() 拆分后的 ByteBuf() 实际是 Zero Copy 的体现, 底层还是公用的原来的物理内存,
    // channel.writeInBound(tarMsgSlice1) 执行后, 会去进行 release(), 减少一次 tarMsgSlice1 的引用计数,
    // 实际上就是 tarMsg 的引用计数, 导致 tarMsgSlice1 和 tarMsgSlice2 都失效了,
    // 所以这里需要执行 tarMsgSlice().retain() 防止被错误释放
    tarMsgSlice1.retain();
    
    channel.writeInbound(tarMsgSlice1);
    channel.writeInbound(tarMsgSlice2);
}
```

## Custom MessageCodecSharable

ByteToMessageCodec 是用于 UnSharable 的 MessageCodec 的, 在 Constructor 中, 通过 ensureNotSharable() 保证了子类无法添加 @Sharable

MessageToMessageCodec 是用于 Sharable 的 MessageCodec 的, 其子类可以添加 @Sharable

- 我们在给 MessageCodec 添加 @Sharable 时, 应该充分考虑 encode() 和 decode() 是否存在并发问题

```java
@Slf4j
@ChannelHandler.Sharable
public class MessageCodecSharable extends MessageToMessageCodec<ByteBuf, Message> {
    @Override
    protected void encode(ChannelHandlerContext ctx, Message msg, List<Object> outList) throws Exception {
        ByteBuf out = ctx.alloc().buffer();
        out.writeBytes(new byte[]{'C', 'A', 'F', 'E'});
        out.writeByte(1);
        out.writeByte(1);
        out.writeByte(msg.getMessageType());
        out.writeInt(msg.getSequenceId());
        out.writeByte(0xff);
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(bos);
        oos.writeObject(msg);
        byte[] bytes = bos.toByteArray();
        out.writeInt(bytes.length);
        out.writeBytes(bytes);
        outList.add(out);
    }
    
    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> msgList) throws Exception {
        int magicNum = in.readInt();
        byte version = in.readByte();
        byte serializerType = in.readByte();
        byte messageType = in.readByte();
        int sequenceId = in.readInt();
        in.readByte();
        int length = in.readInt();
        byte[] bytes = new byte[length];
        in.readBytes(bytes, 0, length);
        ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(bytes));
        Message msg = (Message) ois.readObject();

        log.debug("Decoded msg info: {}, {}, {}, {}, {}, {}", magicNum, version, serializerType, messageType, sequenceId, length);
        log.debug("Decoded msg: {}", msg);

        msgList.add(msg);
    }
}
```