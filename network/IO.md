# IO Type

Blocking, NonBlocking

- Blocking 是线程发送请求后, 线程进入堵塞状态, 等待请求后的结果
- NonBlocking 是线程发送请求后, 不会去堵塞等待, 而是继续去执行其他任务, 通过轮询或者被通知的方式去处理请求后的结果

Synchronous, Asynchronous

- Synchronous 是自己去获取结果
- Asynchronous 是自己不获取结果, 由其他线程来送结果

常见的 IO Mode 的 IO Type

- Blocking IO 是 Synchronous Blocking
- NonBlocking IO 是 Synchronous NonBlocking
- Multiplexing IO 是 Synchronous NonBlocking
- Signal Dirven IO 是 Synchronous NonBlocking
- Asynchronous IO 是 Asynchronous NonBlocking

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031139648.png)

# Blocking IO

Blocking IO 中, User 想要读取数据, 如果 Kernel 查找不到数据, 不会返回查找不到的信息给 User, 而是会一直等待, 直到数据就位后, 再完成后续操作, 返回结果给 User

Blocing IO 全程需要等待, 性能非常差

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031139649.png)

# Nonblocking IO

Nonblocking IO 中, User 想要读取数据, 如果 Kernel 查找不到数据, 会直接返回查找不到的信息给 User, User 过段时间再发送读取数据的请求, 循环往复, 直到读取到数据, 整个过程中, 只有数据拷贝会进入等待

Nonblocking IO 看似没有太多堵塞, 但是性能还是很差, User 读取不到数据, 没办法执行后续操作了, 还是需要反复请求 Kernel, 这个过程需要 CPU 执行各种命令, 反而性能不如 Blocking IO


![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031139650.png)

# Multiplexing IO

Blocking IO 和 Non Blocing IO 都是第一时间调用 recvfrom() 获取数据, 数据不存在时, 要么等待, 要么空转, 都无法很好的利用 CPU, 还会导致其他 Socket 的等待, 非常糟糕

Client 连接 Server 后, 会建立一个关联的 Socket, 这个 Socket 有一个对应的 File Descriptor (FD), FD 是一个从 0 开始递增的 Unsigned Int, 用来关联一个文件, 在 Linux 中一切皆文件, 所以 FD 可以关联一些, 当然就可以用来关联 Socket

Multiplexing IO 中, User 想要读取数据, 会先调用 epoll(), 将所有 Socket 的 FD 传递给 Kernel, Kernel 只需要一个单线程时刻监听这些 FD, 哪个数据就绪了, 就告知 User 去获取数据, 这个时候 User 再调用 recvfrom() 去获取数据, 就不会有堵塞和空转的情况了, 非常好的利用了 CPU

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031139651.png)

## select()

select() 会将所有的文件描述符（FD）存储在 fds_bits 中，这是一个固定大小为 1024 字节的数组。在调用 select() 时，fds_bits 需要先从用户空间复制到内核空间；当 select() 执行完后，fds_bits 又需要从内核空间复制回用户空间。由于用户无法直接知道哪个文件描述符就绪，必须遍历 fds_bits 来查找。当前，1024 字节的 fds_bits 大小已远远不能满足需求，尤其是在文件描述符较多的情况下。

内核态中的每一个 Socket 都有一个进程等待队列和数据接收队列，当客户端发送的数据到达服务端的网卡时，会

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412211657928.png)

## poll()

poll() 通过一个 LinkedList 存储 FD, 所以可以存储的 FD 就没有上限了, 但是依旧无法避免两次复制和遍历寻找就绪的 FD. 如果存储的 FD 太多, 遍历的时间会变长, 性能就会下降

## epoll()

select() 和 poll() 是早期用于 Multiplexing IO 的函数, 他们只会通知 User 有 FD 就绪了, 但是不确定是哪个 FD, 需要 User 遍历所有的 FD 来确定. epoll() 则会告知是哪些 FD 就绪了, 不需要 User 查找了, 非常高效

epoll() 通过一个 RedBlackTree 存储所有的 FD (rbr), 通过一个 LinkedList 存储就绪的 FD (rdlist). Server 启动时, 会调用 epoll_create() 创建一个 epoll 实例, 包含 rbr 和 rdlist. User 想要添加一个 FD 时, 会调用 epoll_ctl() 添加一个 FD 到 rbr 上, 并且绑定一个 ep_poll_callback, 一旦该 FD 就绪, 就会触发该 Callback, 将 FD 添加到 rdlist 中. 后续只需要循环调用 epoll_wait() 检查 rdlist 中是否有 FD, 如果没有, 就进入等待, 如果有, 就复制到 User Space 的 events 中, 实现事件通知, User 就知道哪些 FD 就绪了, 就可以针对性的发送请求进行读写操作了. epoll() 不需要来回的两次复制, 也不需要遍历寻找就绪的 FD, 性能极强, 而且通过 RedBlackTree 存储 FD, 既能存储大量的 FD, 也能保证性能的稳定

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031139652.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031139653.png)

## 事件通知

epoll_wait() 的事件通知有 LevelTriggered (LT, def) 和 EdgeTriggered (ET) 两种模式

LT 进行事件通知后, 会判断该 FD 是否已经全部处理完毕, 如果没有处理完, 就会反复通知, 直到处理完毕, 才会将该 FD 从 rdlist 中移除 (eg: A 需要处理 3KB 的数据, 调用 epoll_wait() 得到数据后, 只处理了 1KB 数据, 此时 LT 模式下, 不会移除该 FD, 而是再次通知 A 去处理数据)

ET 进行事件通知后, 会直接移除该 FD (eg: A 还剩 2KB 数据没有处理, 此时 ET 模式下, 不会管 A 是否处理完的, 直接移除 FD)

通过 LT 处理数据, 需要反复调用 epoll_wait() 进行处理, 这个过程是非常消耗资源的. 如果多个线程都在等待一个 FD, 通知一次给一个线程后, 还会再去通知其他线程, 这就造成了惊群

通过 ET 处理数据, 可以开启一个异步线程, 将 FD 中的所有数据全部循环处理完即可, 不需要反复调用 epoll_wait(), 性能极强, 而且一个线程被通知处理完数据后, 其他线程直接从 User Space 中读取数据即可, 不存在惊群

## 网卡驱动程序

当网卡接收到数据后，流程如下：

1. 网卡接收数据包：
- 网卡通过物理网络接口（如以太网）接收到数据包。
- 网卡硬件将数据存入内存中的接收缓冲区（RX Ring Buffer），这是一个通过 DMA 映射的区域。

2. 网卡触发硬件中断：

- 网卡生成一个硬件中断信号，通知 CPU 数据包已到达。

3. 网卡驱动程序的作用：

- 中断处理程序运行：
- 检查网卡的中断状态寄存器，确认中断来源。
- 从网卡的 RX Ring Buffer 中读取数据。
- 将数据封装为内核中的 sk_buff（Socket Buffer）。
- 将 sk_buff 放入内核协议栈进行处理（例如，放入 sk_receive_queue，这是文件描述符对应 socket 的接收队列）。
- 如果有对应的文件描述符，并且文件描述符注册了 IO 事件（如 EPOLLIN），网卡驱动程序会通知内核事件机制。

4. 内核通知机制：

- 内核通过等待队列和回调机制，将事件状态标记为就绪，并唤醒等待在文件描述符上的进程（如通过 epoll_wait）。

网卡驱动如何找到关联的文件描述符的？

- 在网络协议栈中，每个连接（如 TCP 连接）对应一个 sock 结构。
- 每个 sock 结构又通过文件描述符与用户空间关联。
- 驱动程序在将数据提交到协议栈时，会找到对应的 sock，然后放入其 sk_receive_queue 中：

```
skb_queue_tail(&sk->sk_receive_queue, skb); // 数据放入接收队列
```

驱动程序如何通知内核事件状态？

- 驱动程序会调用 wake_up()，唤醒文件描述符对应的等待队列。
- wake_up() 会触发与文件描述符关联的 IO 事件机制（如 epoll），触发回掉函数（如 将就绪的 fd 添加到 rdlist 中）。

```
void sock_def_readable(struct sock *sk) {
    wake_up_interruptible(&sk->sk_wq->wait); // 唤醒等待队列
}
```

# Signal Driven IO

Signal Driven IO 中, User 先调用 sigaction() 告知 Kernel 去寻找数据, Kernel 直接返回结果给 User. Kernel 发现数据就绪后, 再调用 sigio() 发送信号给 User. 这个时候 User 再调用 recvfrom() 进行数据的复制, 所以 Signal Driven IO 的流程更类似于我们理解中的 Non Blocking IO

当 IO 数量增多时, 需要发送的信号就越多, sigio() 处理不及时的话, 就会导致 Signal Queue 溢出, 导致信号丢失, 而且这个信号的通知方式就是来回复制一份数据, 效率非常低

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031139654.png)

# Asynchronous IO

Asynchronous IO 中, User 调用 aio_read() 通知 Kernel 去查找数据后, 就可以干别的事去啦. Kernel 查找到数据后, 直接复制数据到 User Space 中, 再通知 User 去处理数据, 整个过程不需要 User 去等待, 非常的高效

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031139655.png)

Multiplexing IO 和 Asynchronous IO 的主要区别在于数据就绪后，由谁来执行数据拷贝这个动作。

- Multiplexing IO 中，数据就绪后，是系统通知程序数据已经就绪，需要由程序去调用 read 和 recvfrom 从内核态拷贝数据到用户态后，再处理数据。
- Asynchronous IO 中，数据就绪后，是系统自动拷贝数据到程序所在的用户态，再通知程序去处理数据。用户态的程序压力较小，需要更长的时间去等待数据，这个数据拷贝的过程不需要切换上下文状态，不需要系统调用。

Multiplexing IO 和 Asynchronous IO 的效率对比：

- 拷贝效率：
  - Multiplexing IO 需要由程序去调用 read 和 recvfrom 从内核态拷贝数据到用户态后，涉及了两次系统调用，需要从用户态切换为内核态。
  - Asynchronous IO 整个数据拷贝过程都有系统完成，不涉及系统调用，不需要切换上下文。
- 数据量较大时的拷贝效率：
  - Multiplexing IO 常常需要对数据进行分块 IO，就需要多次切换用户态和内核态，状态切换的开销会被放大。
- 并发效率：
  - Multiplexing IO 需要额外管理大量的文件描述符和事件，每个事件都需要应用程序手动处理（包括解析、拷贝等），对 CPU 和内存的压力较大。
  - Asynchronous IO 事件处理由操作系统管理，应用程序只处理完成的事件，避免了对大量事件的轮询和解析。在大数据场景下，这种模型可以显著减少应用程序的负担，提高吞吐量。

# Reactor IO Mode

Reactor 通信模型中分为两个线程组，其中 Boss 线程组处理连接事件，Worker 线程组处理 IO 事件。每一个 EventLoop 都对应一个线程，每一个 EvnetLoop 都绑定了一个 Selector 实现 IO 多路复用。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501011558610.png)

# Proactor IO Mode

Reactor 通信模型采用的是 Multiplexing IO，Proactor 通信模型采用的是 Asynchronous IO 技术，这就是他俩的核心区别，在数据量较大时，Proactor 通信模型效率更高。

- 详细对比可以看 Asynchronous IO 的介绍


