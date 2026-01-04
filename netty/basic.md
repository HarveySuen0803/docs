# Basic

Netty 是一个异步的, 基于事件驱动的网络应用框架, 用于快速开发可维护, 高性能的网络服务器和客户端

配置 Dependency

```xml
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>4.1.39.Final</version>
</dependency>
```

配置 Server

```java
new ServerBootstrap()
    // 配置 Server 的 EventLoopGroup, 用于处理所有通过网络传输的事件, 可以简单理解为 ThreadPool + Selector
    .group(new NioEventLoopGroup())
    // 配置 Server 的 SocketChannel
    .channel(NioServerSocketChannel.class)
    // 配置 Handler 处理 Event, 当触发 OP_ACCEPT 时, 由 Netty 底层处理 OP_ACCEPT Event, 然后就会同时调用 Server 和 Client 的 initChannel()
    .childHandler(new ChannelInitializer<NioSocketChannel>() {
        @Override
        protected void initChannel(NioSocketChannel ch) {
            // SocketChannel 的 Pipeline 实际上是一个 Handler Chain, 专门设计用于处理网络 IO Event
        
            // 该 Handler 用来将 ByteBuf 解码成 String
            ch.pipeline().addLast(new StringDecoder());
            
            // 该 Handler 用来处理业务, 接收到上一个 Handler 的处理结果作为 msg 参数 (接收到上面 Decoder 返回的 String)
            ch.pipeline().addLast(new SimpleChannelInboundHandler<String>() {
                // 处理读事件
                @Override
                protected void channelRead0(ChannelHandlerContext ctx, String msg) {
                    log.info({}, msg);
                }
            });
        }
    })
    // ServerSocketChannel 绑定的监听端口
    .bind(8080);
```

配置 Client

```java
new Bootstrap()
    // 配置 Client 的 EventLoopGroup
    .group(new NioEventLoopGroup())
    // 配置 Client 的 SocketChannel
    .channel(NioSocketChannel.class)
    // 配置 Handler 处理 Event
    .handler(new ChannelInitializer<Channel>() {
        @Override
        protected void initChannel(Channel ch) {
            ch.pipeline().addLast(new StringEncoder());
        }
    })
    .connect("127.0.0.1", 8080)
    // 同步堵塞, 等待连接后
    .sync()
    // 获取 Channel
    .channel()
    // 通过 Channel 发送 "hello world" 字符串, 然后通过 Handler 中的 new StringEncoder 将 String 转成 ByteBuf 发送给 Server
    .writeAndFlush("hello world!");
```

# EventLoop

EventLoopGroup 的实现非常多, 常见的有 NioEventLoopGroup 和 DefaultEventLoop

- NioEventLoopGroup 可以处理 IO Event, 普通任务, 定时任务
- DefaultEventLoop 可以处理普通任务, 定时任务

```java
EventLoopGroup group = new NioEventLoopGroup();
EventLoopGroup group = new DefaultEventLoop();
```

可以指定 EventLoopGroup 内部包含的 EventLoop 的数量, 循环利用 EventLoop, 类似于 ThreadPool 和 Thread 的关系

```java
EventLoopGroup group = new NioEventLoopGroup(2);

System.out.println(group.next()); // io.netty.channel.nio.NioEventLoop@56cbfb61
System.out.println(group.next()); // io.netty.channel.nio.NioEventLoop@1134affc
System.out.println(group.next()); // io.netty.channel.nio.NioEventLoop@56cbfb61
```

一个 EventLoop 可以绑定多个 SocketChannel, 后续该 SocketChannel 上的所有 Event 都由该 EventLoop 处理

```java
new ServerBootstrap()
    // 指定 EventLoopGroup 内部有两个 EventLoop, 当连接的 SocketChannel 数量超出 2 后, 就会由一个 EventLoop 绑定多个 SocketChannel
    .group(new NioEventLoopGroup(2))
    .channel(NioServerSocketChannel.class)
    .childHandler(new ChannelInitializer<NioSocketChannel>() {
        @Override
        protected void initChannel(NioSocketChannel ch) {
            ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                @Override
                public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                    ByteBuf buf = (ByteBuf) msg;
                    log.info(buf.toString(Charset.defaultCharset()));
                }
            });
        }
    })
    .bind(8080);
```

```txt
Client A send "a msg1"
Client B send "b msg1"
Client C send "c msg1"
Server EventLoop A handle "a msg1"
Server EventLoop B handle "a msg1"
Server EventLoop A handle "c msg1" # EventLoopGroup 内部只设置了两个 EventLoop, 所以这里超出后, 由 EventLoop A 同时绑定了 Client A 和 Client C 的 SocketChannel

Client A send "a msg2"
Client B send "b msg2"
Server EventLoop A handle "a msg2" # EventLoop 绑定 SocketChannel 后, 后续该 SocketChannel 上的所有 Event 都由该 EventLoop 处理 
Server EventLoop B handle "a msg2"
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202404061246417.png)

细分任务, 单独指定一个 EventLoopGroup 作为 Boss 负责 OP_ACCEPT, 单独指定一个 EventLoopGroup 作为 Worker 负责 OP_READ, OP_WRITE

```java
// Boss 负责 OP_ACCEPT
EventLoopGroup boss = new NioEventLoopGroup(1);
// Worker 负责 OP_READ, OP_WRITE
EventLoopGroup worker = new NioEventLoopGroup(1);
new ServerBootstrap()
    .group(boss, worker)
    .channel(NioServerSocketChannel.class)
    .childHandler(new ChannelInitializer<NioSocketChannel>() {
        @Override
        protected void initChannel(NioSocketChannel ch) {
            ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                @Override
                public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                    ByteBuf buf = (ByteBuf) msg;
                    log.info(buf.toString(Charset.defaultCharset()));
                }
            });
        }
    })
    .bind(8080);
```

细分任务, ShortTermWorker 作为默认 Worker 处理耗时短的 Handler, 单独指定一个 LongTermWoker 执行耗时久的 Handler, 避免因为一个耗时较久的 Handler 卡住了 Woker, 导致堵塞

```java
EventLoopGroup boss = new NioEventLoopGroup(1);
EventLoopGroup shortTermWorker = new NioEventLoopGroup(2);
EventLoopGroup longTermWorker = new DefaultEventLoop();
new ServerBootstrap()
    .group(boss, shortTermWorker)
    .channel(NioServerSocketChannel.class)
    .childHandler(new ChannelInitializer<NioSocketChannel>() {
        @Override
        protected void initChannel(NioSocketChannel ch) {
            // 默认是 shortTermWorker 执行 Handler
            ch.pipeline().addLast("handler 1", new ChannelInboundHandlerAdapter() {
                @Override
                public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                    ByteBuf buf = (ByteBuf) msg;
                    log.info(buf.toString(Charset.defaultCharset()));
                    // 传递 ctx 和 msg 给下一个 Handler
                    super.channelRead(ctx, msg);
                }
            });
            // 这里指定 longTermWorker 执行耗时较久的 Handler
            ch.pipeline().addLast(longTermWorker, "handler 2", new ChannelInboundHandlerAdapter() {
                @Override
                public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                    ByteBuf buf = (ByteBuf) msg;
                    log.info(buf.toString(Charset.defaultCharset()));
                }
            });
        }
    })
    .bind(8080);
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202404061246419.png)

通过 EventLoopGroup 执行普通任务

```java
group.next().submit(() -> {
    System.out.println("hello world");
});
```

通过 EventLoopGroup 执行定时任务

```java
// ScheduledFuture<?> scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnit unit);
group.next().scheduleAtFixedRate(() -> {
    System.out.println("hello world");
}, 3, 1, TimeUnit.SECONDS);
```

# Channel

Client 执行 connect() 后拿到的就是 ChannelFuture 用于表示异步操作的结果, 允许用户以非阻塞的方式获取操作的完成状态

```java
ChannelFuture channelFuture = new Bootstrap()
    .group(new NioEventLoopGroup())
    .channel(NioSocketChannel.class)
    .handler(new ChannelInitializer<Channel>() {
        @Override
        protected void initChannel(Channel ch) {
            ch.pipeline().addLast(new StringEncoder());
        }
    })
    // 异步非堵塞
    .connect("127.0.0.1", 8080);
```

connect() 是异步非堵塞的, Main Thread 只发起调用, 真正执行连接的是 Nio Thread, 所以 Main Thread 想要执行 IO, 就需要等待 Nio Thread 先建立连接, 有下面两种方式

1. Main Thread 同步堵塞等待 Nio Thread 完成连接后, 执行 IO

```java
channelFuture.sync();
Channel channel = channelFuture.channel();
channel.writeAndFlush("hello world");
```

2. Main Thread 异步监听, 回掉执行 IO

```java
channelFuture.addListener(new ChannelFutureListener() {
    @Override
    public void operationComplete(ChannelFuture future) throws Exception {
        Channel channel = future.channel();
        channel.writeAndFlush("hello world");
    }
})
```

# Close Channel

通过 channel.close() 关闭 Channel, 这里 Netty 采用了异步的手段, 如果想要在关闭后做一些其他的操作, 无法保证同步

```java
EventLoopGroup eventLoopGroup = new NioEventLoopGroup();
Bootstrap bootstrap = new Bootstrap()
    .group(eventLoopGroup)
    .channel(NioSocketChannel.class)
    .handler(new ChannelInitializer<Channel>() {
        @Override
        protected void initChannel(Channel ch) {
            ch.pipeline().addLast(new LoggingHandler(LogLevel.INFO));
            ch.pipeline().addLast(new StringEncoder());
        }
    });
ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 8080).sync();
Channel channel = channelFuture.channel();
Scanner scanner = new Scanner(System.in);
while (true) {
    String line = scanner.next();
    if ("quit".equals(line)) {
        channel.close(); // Nio Thread 执行这一行
        log.info("Do something after channel closed"); // Main Thread 执行这一行
        break;
    }
    channel.writeAndFlush(line);
}
```

```txt
[main] INFO com.harvey.NettyClient -- Do something after channel closed
[nioEventLoopGroup-2-1] INFO io.netty.handler.logging.LoggingHandler -- [...] CLOSE
[nioEventLoopGroup-2-1] INFO io.netty.handler.logging.LoggingHandler -- [...] INACTIVE
[nioEventLoopGroup-2-1] INFO io.netty.handler.logging.LoggingHandler -- [...] UNREGISTERED
```

通过 closeFuture() 处理 Channel 关闭后的操作

1. Main Thread 同步堵塞等待 Nio Thread 完成关闭后, 执行后续操作

```java
while (true) {
    String line = scanner.next();
    if ("quit".equals(line)) {
        channel.close(); // Nio Thread 执行这一行
        channel.closeFuture().sync(); // Main Thread 堵塞在这里等待 Nio Thread 执行完
        log.info("Do something after channel closed");
        eventLoopGroup.shutdownGracefully();
        break;
    }
    channel.writeAndFlush(line);
}
```

2. Nio Thread 异步回掉执行后续操作

```java
ChannelFuture closeFuture = channel.closeFuture();
closeFuture.addListener(new ChannelFutureListener() {
    @Override
    public void operationComplete(ChannelFuture future) throws Exception {
        log.info("Do something after channel closed");
        eventLoopGroup.shutdownGracefully();
    }
});

while (true) {
    String line = scanner.next();
    if ("quit".equals(line)) {
        channel.close(); // Nio Thread 执行这一行
        channel.closeFuture().addListener(new ChannelFutureListener() { // Main Thread 绑定了 Listener 后, 就直接 break 走人了, Nio Thread 关闭 Channel 后, 就异步回掉该方法执行后续操作
            @Override
            public void operationComplete(ChannelFuture future) throws Exception {
                log.info("Do something after channel closed");
                eventLoopGroup.shutdownGracefully();
            }
        });
        break;
    }
    channel.writeAndFlush(line);
}
```

ctx.channel.close() 类似于上面的 bootstrap.connect().sync().channel.close() 都是先获取当前的 Channel Obj, 然后调用该 Channel Obj 的 close(), 断开底层的连接

ctx.close() 是从当前的 Handler 开始, 沿着管道向前和向后传播关闭事件 (eg: Pipeline 中有一些特定的 Handler 来发送一个告别消息或者进行清理工作处理)

ctx.channel.close() 和 ctx.close() 都是通过 Nio Thread 去异步的关闭 Thread, 而且会返回的是一个 ChannelFuture, 所以依旧可以采用上面的几种方式来处理, 下面就列出一个最基本的用法, 其他的关闭方法就省略了

```java
bootstrap.handler(new ChannelInitializer<Channel>() {
    @Override
    protected void initChannel(Channel ch) {
        ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
            @Override
            public void channelActive(ChannelHandlerContext ctx) throws Exception {
                // ctx.writeAndFlush() 和 ctx.close() 都是异步执行的, 所以有可能还没有写入完成, 就执行了 ctx.close(), 非常不安全
                ctx.writeAndFlush(msg);
                ctx.close();
            }
        });
    }
})
ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 10100).sync();
channelFuture.channel().closeFuture().sync(); // Main Thread 堵塞在这里等待 Channel 关闭
eventLoopGroup.shutdownGracefully();
```

推荐给 ChannelFuture 添加 addListener(ChannelFutureListener.CLOSE), 在执行完异步操作后, 回掉 ChannelFutureListener.CLOSE 完成关闭 Channel 的操作

```java
bootstrap.handler(new ChannelInitializer<Channel>() {
    @Override
    protected void initChannel(Channel ch) {
        ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
            @Override
            public void channelActive(ChannelHandlerContext ctx) throws Exception {
                ctx.writeAndFlush(msg).addListener(ChannelFutureListener.CLOSE);
            }
        });
    }
})
ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 10100).sync();
channelFuture.channel().closeFuture().sync(); // Main Thread 堵塞在这里等待 Channel 关闭
eventLoopGroup.shutdownGracefully();
```

通过下面这段优化, 可以让主线程只去进行绑定 Listener 的工作, 而不需要去堵塞等待连接, 提高效率

```java
ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 10100);

CountDownLatch latch = new CountDownLatch(1);

// Main Thread 只需要绑定一个 Listener 即可, 不需要堵塞等待连接完成, 可以继续执行后续操作
channelFuture.addListener(new ChannelFutureListener() {
    @Override
    public void operationComplete(ChannelFuture future) throws Exception {
        if (future.isSuccess()) {
            log.debug("Connection established");
            // Nio Thread 来绑定 Listener
            channelFuture.channel().closeFuture().addListener(new ChannelFutureListener() {
                @Override
                public void operationComplete(ChannelFuture future) throws Exception {
                    latch.countDown();
                }
            });
        } else {
            log.debug("Connection attempt failed");
            future.cause().printStackTrace();
            latch.countDown();
        }
    }
});

try {
    latch.await(); // Main Thread 堵塞在这里等待
} catch (InterruptedException e) {
    throw new RuntimeException(e);
} finally {
    eventLoopGroup.shutdownGracefully();
}
```

# LoggingHandler

LoggingHandler 用于记录进入和离开当前 ChannelHandler 的所有事件, 包括入站事件和出站事件

```java
ChannelInitializer<SocketChannel> initializer = new ChannelInitializer<SocketChannel>() {
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        // other handlers ...
        ch.pipeline().addLast("logger", new LoggingHandler(LogLevel.INFO));
        // other handlers ...
    }
};
```

LoggingHandler 既是 ChannelInboundHandler 也是 ChannelOutboundHandler, 所以他的位置至关重要

- 这里, 入站事件会先经过 LoggingHandler, 然后经过 MessageCodec 的 decode(). 出站事件会先经过 MessageCodec 的 encode(), 然后经过 LoggingHandler

```java
EmbeddedChannel channel = new EmbeddedChannel(
    new LoggingHandler(LogLevel.DEBUG),
    new MessageCodec()
);
```

- 这里, 入站事件会先经过 MessageCodec 的 decode(), 然后经过 LoggingHandler. 出站事件会先经过 LoggingHandler, 然后经过 MessageCodec 的 encode()

```java
EmbeddedChannel channel = new EmbeddedChannel(
    new MessageCodec(),
    new LoggingHandler(LogLevel.DEBUG)
);
```

# Future

Netty Future 代表了一个异步操作的结果, 与 JUC Future 不同, Netty Future 提供了更加丰富的功能, 特别是对于异步 IO 的支持, 这些特性使得 Netty Future 成为开发高性能网络应用时处理异步操作的关键组件

```java
EventLoop eventLoop = new NioEventLoopGroup().next();
Future<Object> future = eventLoop.submit(new Callable<Object>() {
    @Override
    public Object call() throws Exception {
        return new Object();
    }
});

log.info("waiting for result");
log.info("result: {}", future.get());
```

```java
log.info("waiting for result");
future.addListener(new GenericFutureListener<Future<? super Object>>() {
    @Override
    public void operationComplete(Future<? super Object> future) throws Exception {
        // 只有得到结果了才会回掉该监听器, 所以这里直接通过 getNow() 来获取即可, 不会有任何阻塞
        log.info("result: {}", future.getNow());
    }
});
```

# Promise

Promise 是 Future 的一个子接口, 它不仅代表了一个异步操作的结果, 还提供了设置这个结果的方法, 相当于一个可以由操作执行者显式完成的 Future

```java
EventLoop eventLoop = new NioEventLoopGroup().next();
Promise<Integer> promise = new DefaultPromise<>(eventLoop);

new Thread(() -> {
    log.info("Start calculating");
    try {
        TimeUnit.SECONDS.sleep(1);
        promise.setSuccess(10);
    } catch (InterruptedException e) {
        e.printStackTrace();
        promise.setFailure(e);
    }
}).start();

log.info("Waiting for the result");
log.info("Result is {}", promise.get());
```

# Pipeline

ChannelHandler 用来处理 Channel 上的各种事件，分为 Inboudhandler，OutboundHandler 两种，所有的 Handler 构成一个 Double Linked List。有些 Handler 可以既是 InboudHandler，也是 OutBoundHandler，这种 Handler 就可以同时出入 Inboud Event 和 Outbound Event。

- InboundHandler 一般都是 ChannelInboundHandlerAdapter 的子类，主要用来读取客户端数据，写回结果
- OutboundHandler 一般都是 ChannelOutboundHandlerAdapter 的子类，主要对写回结果进行加工
- HeadContext 位于 ChannelPipeline 的头部，负责处理底层 I/O 操作，如读写操作的实际执行
- TailContext 位于 ChannelPipeline 的尾部，捕获未被其他处理器处理的事件，如未捕获的异常

如果 InboundHandler 没有调用 ctx.fireChannelRead()，那么事件就会在他这里停止传播，如果是最后一个 InboudHandler 没有执行 ctx.fireChannelRead()，那么也不会传播事件到 TailContext 那里。

- 入站数据流动：head -> in_1 -> in_2 -> in_3 -> tail

如果 OutboundHandler 没有调用 ctx.write()，那么事件就会在他那里停止传播，就没法响应结果了，所以一般所有的 OutboundHandler 都要去写一个 ctx.write()

- 出站数据流动：tail -> out_1 -> out_2 -> out_3 -> head

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202404061715527.png)

```java
// head <-> in_1 <-> in_2 <-> in_3 <-> out_3 <-> out_2 <-> out_1 <-> tail
serverBootstrap.childHandler(new ChannelInitializer<NioSocketChannel>() {
    @Override
    protected void initChannel(NioSocketChannel ch) {
        ch.pipeline().addLast("in_1", new ChannelInboundHandlerAdapter() {
            @Override
            public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                log.info("in_1");
                // 执行 ctx.fireChannelRead() 会调用后一个 Inbound Handler
                ctx.fireChannelRead(msg);
            }
        });
        ch.pipeline().addLast("in_2", new ChannelInboundHandlerAdapter() {
            @Override
            public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                log.info("in_2");
                // 执行 ctx.fireChannelRead() 会调用后一个 Inbound Handler
                ctx.fireChannelRead(msg);
            }
        });
        ch.pipeline().addLast("in_3", new ChannelInboundHandlerAdapter() {
            @Override
            public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                log.info("in_3");
        
                // 执行 ch.write() 会依次执行 tail -> out_1 -> out_2 -> out_3 -> head
                // ch.writeAndFlush(ctx.alloc().buffer().writeBytes("hello world".getBytes()));
                
                // 执行 ctx.channel().write() 会依次执行 tail -> out_1 -> out_2 -> out_3 -> head
                // ctx.channel().writeAndFlush(ctx.alloc().buffer().writeBytes("hello world".getBytes()));

                ctx.channel().writeAndFlush(ctx.alloc().buffer().writeBytes("hello world".getBytes()));
            }
        });
        ch.pipeline().addLast("out_3", new ChannelOutboundHandlerAdapter() {
            @Override
            public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
                log.info("out_3");
                // 执行 ctx.write() 会调用前一个 Outbound Handler
                ctx.write(msg, promise);
            }
        });
        ch.pipeline().addLast("out_2", new ChannelOutboundHandlerAdapter() {
            @Override
            public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
                log.info("out_2");
                // 执行 ctx.write() 会调用前一个 Outbound Handler
                ctx.write(msg, promise);
            }
        });
        ch.pipeline().addLast("out_1", new ChannelOutboundHandlerAdapter() {
            @Override
            public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
                log.info("out_1");
                // 执行 ctx.write() 会调用前一个 Outbound Handler
                ctx.write(msg, promise);
            }
        });
    }
})
```

```txt
in_1
in_2
in_3
out_1
out_2
out_3
```

# EmbeddedChannel

EmbeddedChannel 是 Netty 提供的一个特殊的 Channel 实现, 用于测试和模拟场景, 它允许开发者在不实际建立网络连接的情况下测试 ChannelHandler 和 ChannelPipeline 的行为, 执行和验证入站和出站处理逻辑, 这对于单元测试非常有用

```java
ChannelInboundHandlerAdapter h1 = new ChannelInboundHandlerAdapter() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        log.info("h1");
        ctx.fireChannelRead(msg);
    }
};
ChannelInboundHandlerAdapter h2 = new ChannelInboundHandlerAdapter() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        log.info("h2");
        ctx.fireChannelRead(msg);
    }
};
ChannelInboundHandlerAdapter h3 = new ChannelInboundHandlerAdapter() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        log.info("h3");
        ctx.fireChannelRead(msg);
    }
};

EmbeddedChannel embeddedChannel = new EmbeddedChannel(h1, h2, h3);
embeddedChannel.writeInbound(ByteBufAllocator.DEFAULT.buffer().writeBytes("hello world".getBytes()));
```

EmbeddedChannel 内部有出站和入站两种缓冲区来分别模拟网络的写出和读入操作

- Outbound Data: 当你使用 writeOutbound(msg) 时, EmbeddedChannel 会通过它的 ChannelPipeline 处理这个消息, 处理完成后的数据会被存储在内部的出站缓冲区中
- Inbound Data: 当你使用 writeInbound(msg) 时, EmbeddedChannel 会通过它的 ChannelPipeline 处理这个消息, 处理完成后的数据会被存储在内部的入站缓冲区中

```java
EmbeddedChannel channel = new EmbeddedChannel(h1, h2, h3);

ByteBuf buf1 = ByteBufAllocator.DEFAULT.buffer();

// 写入数据, 经过出站处理器
channel.writeOutbound(buf1)

// 从出站缓冲区读数据
ByteBuf buf2 = channel.readOutbound();
```

# ByteBuf

ByteBuf 是 Netty 中用于处理字节数据的一个核心类, 与 JDK ByteBuffer 不同, Netty ByteBuf 提供了更高效, 更灵活的数据操作接口, 特别适合用于网络数据的读写操作, 通过优化的内存管理和访问模式, 大幅提升了网络应用的性能

基于 Heap Memory 的 ByteBuf, 创建和销毁的成本低, 读写性能差 (需要额外一次复制), 受 JVM GC 限制

```java
ByteBuf buf = ByteBufAllocator.DEFAULT.heapBuffer(10);
```

基于 Direct Memory 的 ByteBuf, 创建和销毁成本高, 读写性能强 (不需要额外一次复制), 不受 JVM GC 限制

```java
ByteBuf buf = ByteBufAllocator.DEFAULT.directBuffer(10);
```

# ByteBuf Pool

基于 Direct Memory 的 ByteBuf 的创建和销毁成本太高, 可以参考 ThreadPool 和 ConnectionPool 的思想, 将 ByteBuf 池化起来, 避免了创建和销毁的开销, 更高效利用的资源

- Netty 4.1 之后, 除了 Android, 都默认开启了池化

```java
ByteBufAllocator.DEFAULT.directBuffer(10).getClass(); // PooledUnsafeDirectByteBuf
  
ByteBufAllocator.DEFAULT.heapBuffer(10).getClass(); // PooledUnsafeHeapByteBuf
```

# ByteBuf Structure

Netty ByteBuf 相比 JDK ByteBuffer, 采用了两个 Ptr 实现读写分离, 不需要非常麻烦的切换读写模式, 大致分为了四个部分

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202404061246425.png)

# ByteBuf Write

指定初始容量为 5B, 写入 {1, 2, 3, 4}

```java
ByteBuf buf = ByteBufAllocator.DEFAULT.buffer(5);
buf.writeBytes(new byte[]{1, 2, 3, 4});
```

```txt
read index: 0,  write index: 4,  capacity: 5
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 01 02 03 04                                     |....            |
+--------+-------------------------------------------------+----------------+
```

再写入 {5, 6, 7, 8} 超出了初始的 5B 容量, 自动扩容

- 如果写入后数据大小未超过 512B, 则扩容到下一个 16 的整数倍 (eg: 写入后为 12B, 则扩容到 16B)
- 如果写入后数据大小已超过 512B, 则扩容到下一个 2^n (eg: 写入后为 513B, 则扩容到 2^10 = 1024, 因为 2^9 = 512 已经不够了)
- 扩容不能超过 max capacity, 否则会报错

```java
buf.writeBytes(new byte[]{5, 6, 7, 8});
byteBufLog(buf);
```

```txt
read index: 0,  write index: 8,  capacity: 64
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 01 02 03 04 05 06 07 08                         |........        |
+--------+-------------------------------------------------+----------------+
```

# ByteBuf Read

ByteBuf 会根据 Read Index 进行读取, 读过的内容, 就属于废弃部分了, 再读只能读那些尚未读取的部分

```java
ByteBuf buf = ByteBufAllocator.DEFAULT.buffer(16);
buf.writeBytes("hello world".getBytes());

System.out.println((char) buf.readByte()); // h
System.out.println((char) buf.readByte()); // e
System.out.println((char) buf.readByte()); // l
System.out.println((char) buf.readByte()); // l

byteBufLog(buf);
```

```txt
read index: 4,  write index: 11,  capacity: 16
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 6f 20 77 6f 72 6c 64                            |o world         |
+--------+-------------------------------------------------+----------------+
```

通过 markReaderIndex() 标记当前的读索引位置, 通过 resetReaderIndex() 重置到之前标记的位置

```java
ByteBuf buf = ByteBufAllocator.DEFAULT.buffer(16);
buf.writeBytes("hello world".getBytes());

System.out.println((char) buf.readByte()); // h
System.out.println((char) buf.readByte()); // e
System.out.println((char) buf.readByte()); // l

buf.markReaderIndex();

System.out.println((char) buf.readByte()); // l
System.out.println((char) buf.readByte()); // o

buf.resetReaderIndex();

System.out.println((char) buf.readByte()); // l
System.out.println((char) buf.readByte()); // o
```

# ByteBuf Memory Management

基于 Direct Memory 的 ByteBuf Obj 最好是手动来释放, 而不是等 GC 垃圾回收, 可以更加及时的释放内存, 避免内存泄漏

- UnpooledHeapByteBuf 使用的是 JVM 内存, 只需等 GC 回收内存即可
- UnpooledDirectByteBuf 使用的就是直接内存了, 需手动回收内存
- PooledByteBuf 和它的子类使用了池化机制, 需要更复杂的规则来回收内存

Netty 这里采用了引用计数法来控制回收内存, 每个 ByteBuf 都实现了 ReferenceCounted 接口

- 每个 ByteBuf 对象的初始计数为 1
- 调用 release() 计数减 1, 当计数为 0 时, 底层内存会被回收
- 调用 retain() 计数加 1, 表示调用者没用完之前, 其它 handler 即使调用了 release() 也不会造成回收

这里 h1 和 h2 都没有使用 ByteBuf Obj，直接传递给 h3，那么就由 h3 来执行 release() 释放 ByteBuf Obj

```java
ChannelInboundHandlerAdapter h1 = new ChannelInboundHandlerAdapter() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ctx.fireChannelRead(msg);
    }
};
ChannelInboundHandlerAdapter h2 = new ChannelInboundHandlerAdapter() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ctx.fireChannelRead(msg);
    }
};
ChannelInboundHandlerAdapter h3 = new ChannelInboundHandlerAdapter() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ByteBuf buf = (ByteBuf) msg;
        // 确保在写操作完成后释放引用计数
        ctx.channel().writeAndFlush(buf).addListener(future -> buf.release());
    }
};

EmbeddedChannel embeddedChannel = new EmbeddedChannel(h1, h2, h3);
embeddedChannel.writeInbound(ByteBufAllocator.DEFAULT.buffer().writeBytes("hello world".getBytes()));
```

这里 h1 和 h3 都使用了 ByteBuf Obj，那么为了防止 h3 执行 release() 后直接释放了 ByteBuf Obj，就需要由 h1 执行一次 retain() 来让计数 + 1，最终由 h3 来释放

```java
ChannelInboundHandlerAdapter h1 = new ChannelInboundHandlerAdapter() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ByteBuf buf = (ByteBuf) msg;
        // 计数 + 1，防止 h3 给释放了
        buf.retain()
        // 执行下一个 Handler
        ctx.fireChannelRead(buf);
        // h3 来操作 buf，操作完之后，释放 buf
        ctx.channel().writeAndFlush(buf).addListener(future -> buf.release());
    }
};
ChannelInboundHandlerAdapter h2 = new ChannelInboundHandlerAdapter() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ctx.fireChannelRead(msg);
    }
};
ChannelInboundHandlerAdapter h3 = new ChannelInboundHandlerAdapter() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ByteBuf buf = (ByteBuf) msg;
        // 确保在写操作完成后释放引用计数
        ctx.channel().writeAndFlush(buf).addListener(future -> buf.release());
    }
};

EmbeddedChannel embeddedChannel = new EmbeddedChannel(h1, h2, h3);
embeddedChannel.writeInbound(ByteBufAllocator.DEFAULT.buffer().writeBytes("hello world".getBytes()));
```

如何是 SimpleChannelInboundHandler 的实现类，那么 SimpleChannelInboundHandler 会自动去执行 release() 释放掉资源，所以我们使用多个 SimpleChannelInboundHandler 连接时，就只需要注意执行 retain() 即可，让 SimpleChannelInboundHandler 自动释放资源。

```java
SimpleChannelInboundHandler<ByteBuf> h1 = new SimpleChannelInboundHandler<>() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, ByteBuf buf) throws Exception {
        buf.retain();
        ctx.fireChannelRead();
        ctx.channel().writeAndFlush(buf);
    }
};
SimpleChannelInboundHandler<ByteBuf> h2 = new SimpleChannelInboundHandler<>() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, ByteBuf buf) throws Exception {
        // 只需要在传递给下一个 SimpleChannelInboundHandler 之前执行一下 retain() 即可，不需要再去执行 release() 了
        buf.retain();
        ctx.fireChannelRead();
    }
};
SimpleChannelInboundHandler<ByteBuf> h3 = new SimpleChannelInboundHandler<>() {
    @Override
    public void channelRead(ChannelHandlerContext ctx, ByteBuf buf) throws Exception {
        ctx.channel().writeAndFlush(buf);
    }
};

EmbeddedChannel embeddedChannel = new EmbeddedChannel(h1, h2, h3);
embeddedChannel.writeInbound(ByteBufAllocator.DEFAULT.buffer().writeBytes("hello world".getBytes()));
```

ctx.channel().writeAndFlush(buf) 是一个异步操作，这意味着它会立即返回并继续执行后续代码，即通过 finally 来包裹是无法保证释放 ByteBuf Obj 的，会过早释放 ByteBuf Obj，导致 IllegalReferenceCountException

```java
try {
    ctx.channel().writeAndFlush(buf);
} finally {
    buf.release();
}
```

```java
ctx.channel().writeAndFlush(buf).addListener(future -> buf.release());
```

HeadContext 和 TailContext 作为整个 HandlerChain 的头和尾，如果事件传递到了他们那，并且也传递了 ByteBuf Obj 给他们，那么他们内部在处理完之后会去安全的释放掉 ByteBuf Obj，不需要我们担心。

- HeadContext 和 TailContext 只能对传递到他们那的 ByteBuf Obj 进行 release()，如果是 Handler 内部创建的 ByteBuf Obj 是无法干预的，依旧存在内存泄漏
- 如果中间的 Handler 拿到 ByteBuf Obj 后, 转成了 String Obj 传递给了下一个 Handler, 并且忘记执行 release(), 则最终的 HeadContext 和 TailContext 就都不会拿到 ByteBuf Obj 完成释放内存的操作了, 这就导致了内存泄漏

# ByteBuf Log Util

```java
private static void byteBufLog(ByteBuf buffer) {
    int length = buffer.readableBytes();
    int rows = length / 16 + (length % 15 == 0 ? 0 : 1) + 4;
    StringBuilder buf = new StringBuilder(rows * 80 * 2)
        .append("read index: ").append(buffer.readerIndex())
        .append(",  write index: ").append(buffer.writerIndex())
        .append(",  capacity: ").append(buffer.capacity())
        .append(StringUtil.NEWLINE);
    ByteBufUtil.appendPrettyHexDump(buf, buffer);
    System.out.println(buf.toString());
}
```

```txt
read index: 0,  write index: 11,  capacity: 256
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 68 65 6c 6c 6f 20 77 6f 72 6c 64                |hello world     |
+--------+-------------------------------------------------+----------------+
```

# slice()

slice() 是对 Zero Copy 的体现之一, 对原始 ByteBuf 进行切片成多个 ByteBuf, 切片后的 ByteBuf 并没有发生内存复制, 还是使用原始 ByteBuf 的内存, 切片后的 ByteBuf 维护独立的 Read Ptr 和 Write Ptr

- 对切片进行修改, 会影响到原先的 ByteBuf Obj
- 切片的容量也不能修改, 只能在最初指定的范围内操作

```java
ByteBuf buf = ByteBufAllocator.DEFAULT.buffer(16);
buf.writeBytes(new byte[]{'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'});
// ByteBuf slice(int index, int length)
ByteBuf slice1 = buf.slice(0, 5);
ByteBuf slice2 = buf.slice(5, 5);
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202404061246426.png)

# duplicate()

duplicate() 是对 Zero Copy 的体现之一, 截取了原始 ByteBuf 所有内容, 并且没有 max capacity 的限制, 也是与原始 ByteBuf 使用同一块底层内存, 只是读写指针是独立的

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202404061246427.png)

# CompositeByteBuf

CompositeByteBuf 是对 Zero Copy 的体现之一, 可以将多个 ByteBuf 合并为一个逻辑上的 ByteBuf, 避免拷贝

```java
ByteBuf buf1 = ByteBufAllocator.DEFAULT.buffer(5);
buf1.writeBytes(new byte[]{1, 2, 3, 4, 5});
ByteBuf buf2 = ByteBufAllocator.DEFAULT.buffer(5);
buf2.writeBytes(new byte[]{6, 7, 8, 9, 10});

CompositeByteBuf buf3 = ByteBufAllocator.DEFAULT.compositeBuffer();
// true 表示增加新的 ByteBuf 自动递增 write index, 否则 write index 会始终为 0
buf3.addComponents(true, buf1, buf2);
```

```txt
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 01 02 03 04 05 06 07 08 09 0a                   |..........      |
+--------+-------------------------------------------------+----------------+
```

# Unpooled

Unpooled 是一个工具类, 类如其名, 提供了非池化的 ByteBuf 创建, 组合, 复制等操作, 还可以用来包装零拷贝的 ByteBuf

```java
ByteBuf buf1 = ByteBufAllocator.DEFAULT.buffer(5);
buf1.writeBytes(new byte[]{1, 2, 3, 4, 5});
ByteBuf buf2 = ByteBufAllocator.DEFAULT.buffer(5);
buf2.writeBytes(new byte[]{6, 7, 8, 9, 10});

// 当包装 ByteBuf 个数超过一个时, 底层使用了 CompositeByteBuf
ByteBuf buf3 = Unpooled.wrappedBuffer(buf1, buf2);
System.out.println(ByteBufUtil.prettyHexDump(buf3));
```

```txt
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 01 02 03 04 05 06 07 08 09 0a                   |..........      |
+--------+-------------------------------------------------+----------------+
```

# Exercise

echo server

- https://www.bilibili.com/video/BV1py4y1E7oA/?p=94

```
为什么建议使用 ctx.alloc().buffer() 创建 ByteBuf Obj, 而不是 ByteBufAllocator.DEFAULT.buffer()?

Java IO 双工? Netty IO 双工?
```

# Sharable

这里的 FrameDecoder 会维护一些内部状态来处理分段接收的数据包, 存在线程安全问题

- Client A 访问 Server, 发送了一个半包, 暂时存储在共享的 FrameDecoder 中
- Client B 访问 Server, 发送了一个半包, 又存储到了同一个 FrameDecoder 中, 甚至积累到指定长度后, 还会得到一个错误的拼接包

```java
LengthFieldBasedFrameDecoder frameDecoder = new LengthFieldBasedFrameDecoder(1024, 12, 4, 0, 0);

EmbeddedChannel channel = new EmbeddedChannel(
    frameDecoder,
    new MessageCodec()
);
```

这里的 LoggingHandler 用于记录日志, 不存在线程安全问题

```java
LoggingHandler loggingHandler = new LoggingHandler();

EmbeddedChannel channel = new EmbeddedChannel(
    loggingHandler,
    new MessageCodec()
);
```

Netty 通过 @Sharable 来标记一个 ChannelHandler 可以被安全地共享, 即可以被添加到多个 ChannelPipeline 中而不会出现线程安全问题

- 当 Handler 不保存状态时, 就可以安全地在多线程下被共享

```java
@Sharable
public class LoggingHandler extends ChannelDuplexHandler {}
```

# IdleStateHandler

IdleStateHandler 是一种处理器, 用于检测连接的空闲状态 (eg: 没有数据读, 数据写), 这可以帮助实现如超时断开, 心跳机制等功能

```java
// IdleStateHandler(int readerIdleTimeSeconds, int writerIdleTimeSeconds, int allIdleTimeSeconds)
//   如果 10s 内没有读事件发生, 将触发一个 IdleState.READER_IDLE
//   如果 15s 内没有写事件发生, 将触发一个 IdleState.WRITE_IDLE
//   如果 20s 内没有读或写事件发生, 将触发一个 IdleState.ALL_IDLE
ch.pipeline().addLast(new IdleStateHandler(10, 15, 20));

ch.pipeline().addLast(new ChannelDuplexHandler() {
    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        IdleStateEvent event = (IdleStateEvent) evt;
        
        if (event.state() == IdleState.READER_IDLE) {
            log.debug("No read for 10 seconds, closing channel");
            ctx.channel().close();
        } else if (event.state() == IdleState.WRITER_IDLE) {
            log.debug("No write for 15 seconds, sending heartbeat");
            ctx.writeAndFlush("HEARTBEAT");
        } else if (event.state() == IdleState.ALL_IDLE) {
            log.debug("No read or write for 20 seconds, do something");
        }
    }
})
```

# Exception Handler

每个 ChannelInboundHandler 都有一个 exceptionCaught 方法，用于处理在 ChannelPipeline 中抛出的异常。当处理过程中出现异常时，Netty 会调用 exceptionCaught 方法。这个方法的主要作用是捕获和处理异常，防止异常传播并导致连接关闭或其他未定义的行为。

当 ChannelPipeline 中的某个 handler 抛出异常时，Netty 会调用该 handler 的 exceptionCaught 方法。

```java
public class MyInboundHandler extends ChannelInboundHandlerAdapter {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        // 处理消息
        // ...
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        // 记录异常
        cause.printStackTrace();

        // 关闭连接
        ctx.close();
    }
}
```

如果异常未被捕获和处理，它将沿着 ChannelPipeline 传播，直到被某个 handler 捕获或到达 ChannelPipeline 的末端。未处理的异常可能导致连接关闭。

当异常在 ChannelPipeline 中传播时，如果没有任何 handler 处理该异常，Netty 会最终调用 AbstractChannelHandlerContext 的 invokeExceptionCaught 方法。这个方法的默认实现是记录异常日志并关闭连接。

在 Netty 中定义全局异常处理器可以确保所有未处理的异常都能被捕获和处理。通常，这可以通过在 ChannelPipeline 的末端添加一个专门的异常处理 ChannelInboundHandler 来实现。这个全局异常处理器将捕获并处理所有在 ChannelPipeline 中未被其他 handler 捕获的异常。

```java
public class GlobalExceptionHandler extends ChannelInboundHandlerAdapter {
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        // 记录异常
        cause.printStackTrace();

        // 发送错误响应，具体实现可以根据需要进行调整
        ByteBuf errorMessage = Unpooled.copiedBuffer("Internal Server Error".getBytes());
        ctx.writeAndFlush(errorMessage).addListener(ChannelFutureListener.CLOSE);
    }
}
```

```java
public class MyChannelInitializer extends ChannelInitializer<SocketChannel> {
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline pipeline = ch.pipeline();

        // 添加其他 handler
        pipeline.addLast(new Handler1());
        pipeline.addLast(new Handler2());
        pipeline.addLast(new Handler3());

        // 添加全局异常处理器
        pipeline.addLast(new GlobalExceptionHandler());
    }
}
```