# 文件描述符

fd（file descriptor，文件描述符）是一个整数，用于表示进程打开的文件或其他输入/输出资源的引用。它是一种抽象的标识符，用来统一管理文件、设备、套接字等资源，操作系统通过文件描述符来追踪和管理这些资源。

每个进程都有一个文件描述符表（file descriptor table），由操作系统维护。文件描述符是表中的索引值，通常是一个非负整数。文件描述符与内核中的文件对象相关联，文件对象记录了文件的具体状态，如偏移量、权限等。

open() 调用会让操作系统创建或打开文件，返回一个文件描述符 fd。

- 操作系统在内核中为 fd 分配一个文件对象，记录文件名、打开模式、当前偏移量等信息。
- 例如，返回值 fd = 3，它是该进程的文件描述符表中的一个索引。通常，0、1 和 2 分别对应标准输入、标准输出和标准错误，3 是进程打开的第一个文件。

```c
// 打开文件，获取文件描述符
int fd = open("example.txt", O_RDWR | O_CREAT, 0644);
```

write() 使用 fd 来找到文件对象，将 text 中的数据写入到文件。

系统调用流程：

- 用户态传递 fd 和数据到内核态。
- 内核根据 fd 找到对应的文件对象。
- 将数据写入文件的指定位置，并更新文件偏移量。

```c
// 写入内容到文件
const char *text = "Hello, File Descriptor!";
ssize_t bytes_written = write(fd, text, 24);
```

lseek() 会操作内核中的文件对象，将偏移量设置为指定位置。

```c
// 调整文件指针到文件开头，用于后续读取。
lseek(fd, 0, SEEK_SET);
```

read() 使用 fd 来找到文件对象，从当前偏移量读取数据。

系统调用流程类似于 write()，但方向是从文件读取到内存。

```c
ssize_t bytes_read = read(fd, buffer, 24);
```

close() 释放文件描述符在文件描述符表中的位置。

如果这是最后一个引用，内核会释放与文件对象相关的资源。

```c
close(fd);
```

---

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20251105164914.png)

以 `echo "data" > file.txt` 为例，

```c
pid_t pid = fork();  // 创建子进程

if (pid == 0) {
    // =================== 子进程 ===================
    
    // 1. 打开文件, 假设 fd = 3
    int fd = open("file.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    
    // 2. 重定向 stdout 到文件
    dup2(fd, STDOUT_FILENO);  // fd = 1 现在指向文件，此时 fd = 1 和 fd = 3 都指向了该文件
    close(fd); // 关闭 fd = 3
    
    // 3. 执行 echo 命令
    execve("/bin/echo", ["echo", "data"], env); // echo 默认输出到 fd = 1 标准输出
} else {
    // =================== 父进程 ===================

    wait(&status);  // 等待子进程结束
}
```

---

准备一个测试脚本，将 "success log" 输出到 stdout，将 "failure log" 输出到 stderr。

```
cat > test.sh << 'EOF'
#!/bin/bash
echo "success log"      # 输出到 stdout (fd=1)
echo "failure log" >&2  # 输出到 stderr (fd=2)
EOF
```

将结果输出到 output.txt 文件中，可以发现 stderr 的内容丢失了，只写入了 stdout 的内容。

```
➜  temp ./test.sh > output.txt
failure log
➜  temp cat output.txt 
success log
```

通过 `2>&1` 将 stderr 的内容重定向到 stdout 中，即可写入全部的数据。

```cpp
➜  temp ./test.sh > output.txt 2>&1
➜  temp cat output.txt 
success log
failure log
```

# 微内核

微内核操作系统是一种操作系统架构，其核心设计思想是将内核功能最小化，只保留最基础的功能，将其他功能模块移至用户态运行。这种架构旨在提高操作系统的可扩展性、灵活性和安全性。

微内核只负责最基本的功能，例如：

1. 进程管理：创建、销毁、调度进程。
2. 内存管理：分配和管理内存。
3. 消息传递：不同进程之间的通信（IPC, Inter-Process Communication）。
4. 基本的硬件抽象：与硬件设备进行最低限度的交互。

微内核与宏内核对比：

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412271141575.png)

尽管微内核理论上更安全和稳定，但由于其性能问题和复杂性，传统操作系统（如 Linux、Windows、macOS）多采用 宏内核架构。不过，在嵌入式、实时系统领域，微内核因为其可靠性和灵活性，仍然具有不可替代的价值。

# 内核空间

为了避免 User App 破坏 Kernel, 需要分离 User 和 Kernel, 就分为了 User Space 和 Kernel Space. User Space 只能执行 Ring3, 不能直接调用系统资源, 需要通过 Kernel 提供的 System Call Interface 访问. Kernel Space 可以执行 Ring0, 调用一切系统资源

进程运行时, 既要执行 Ring3, 也要执行 Ring0, 所以需要频繁切换 User Mode 和 Kernel Mode

User 想要读取数据, 发送请求给 System Call Interface, 等待 Kernel 查询数据 (eg: 从 Disk 或 Network 中查询数据), 找到数据后, 先存储到 Kernel Space 的 Buffer 中, 再拷贝到 User Space 的 Buffer 中, 完成一次读取操作

User 想要写入数据时, 也需要先写入到 User Space 的 Buffer 中, 再复制到 Kernel Space 的 Buffer 中, Kernel 再从 Buffer 中读取数据, 写入到 Disk, 完成一次写入操作

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401031139646.png)

# 机制与策略分离

机制与策略分离原理是软件设计和系统设计中的一种重要原则。其核心思想是将“如何实现功能（机制）”与“具体实现什么功能（策略）”分开，从而使系统更具灵活性、可扩展性和易维护性。

- 机制（Mechanism）：系统的基础功能模块，提供操作和功能的实现方法。解决 “如何做” 的问题。通常是通用的、可重用的。
- 策略（Policy）：具体的操作规则或行为决策。解决 “做什么” 的问题。通常与应用需求相关，变化较大。

# 机制与策略分离的意义

- 提高灵活性：不同策略可以复用同一套机制，系统功能适配性更强。
- 便于扩展：新的策略可以在无需修改底层机制的情况下轻松添加。
- 便于维护：改变策略不会影响机制，减少耦合。
- 支持动态决策：根据运行时环境动态选择策略。

# 机制与策略分离的应用场景

文件系统的权限管理

- 机制：提供基本的访问控制方法，例如读、写、执行操作。
- 策略：定义哪些用户或角色有权限执行读写操作（例如：用户 A 可以读写文件，用户 B 只能读取文件）。

---

CPU 调度

- 机制：提供进程切换、抢占、计时器中断的基础能力。
- 策略：定义进程切换的规则（例如：LRU、LFU、FIFO）。

---

网络协议栈

- 机制：提供分组发送、接收、校验的功能。
- 策略：决定数据传输的规则（例如：TCP、UDP）。

# 回刷机制

操作系统的回刷机制（Write-Back Mechanism），也称为写回机制，是指将内存中的脏数据（Dirty Data）同步到磁盘的过程。这一机制主要目的是在提高系统 I/O 性能的同时保证数据持久化的可靠性。通过写回机制，操作系统可以延迟数据写入磁盘的时间，将数据写入内存后立即返回，减少频繁的磁盘 I/O 操作。

在了解回刷机制之前，首先需要理解以下几个关键概念：

- 脏页（Dirty Page）：指被修改但尚未写入磁盘的内存页。在写操作后，数据被存放在内存中的 Page Cache 内，标记为“脏”状态。
- Page Cache：用于缓存文件系统数据的内存区域，可以加速文件的读写操作。
- 回刷（Write-Back）：指将脏页中的数据同步到磁盘的过程，使数据得到持久化保存。
- 写直达（Write-Through）：与写回不同，写直达机制在每次写操作后立即将数据写入磁盘，不做延迟。

回刷机制延迟了磁盘写入，通过控制脏页的数量和写入频率，操作系统可以减少磁盘写入的次数，从而提升性能。

# 回刷机制的执行流程

1. 标记脏页：当数据被写入到 Page Cache 时，页面会被标记为“脏”。
2. 检查触发条件：操作系统定期检查脏页数量、系统内存压力、以及文件状态等触发条件。
3. 触发回刷：当触发条件满足时，系统会启动后台回刷进程（如 pdflush 或 kswapd），扫描脏页列表，将数据写入磁盘。
4. 写回到磁盘：回刷进程按 FIFO（先进先出）顺序将脏页写入磁盘，每次写入一部分，以避免磁盘 I/O 阻塞。

# 回刷机制的触发条件

**定期回刷**

操作系统通常会以固定的时间间隔进行脏页回刷，保证数据的最终一致性。

时间间隔可以在 Linux 系统中通过 /proc/sys/vm/dirty_writeback_centisecs 配置项调整，该项的值单位为百分之一秒，默认值通常为 500（即 5 秒）。

例如，将该值设置为 1000 表示每 10 秒执行一次回刷操作，清理内存中的脏页。

---

**脏页数量达到阈值**

当系统中的脏页数量达到一定的比例或绝对值时，回刷机制会被触发，清理部分脏页。

配置阈值：

- 配置 /proc/sys/vm/dirty_ratio 系统允许的最大脏页比例，默认为 20%。当脏页超过总内存的这个比例时，新的写操作会被阻塞，等待回刷完成。
- 配置 /proc/sys/vm/dirty_background_ratio 后台回刷进程的触发比例，默认为 10%。当脏页比例超过这个值时，后台进程会主动触发回刷，但不会阻塞新的写操作。

示例：

- 如果 dirty_ratio 设置为 20%，则当脏页达到 2GB 时，操作系统会强制暂停新的写入请求，直到部分脏页被回刷，降低脏页占比。
- 如果系统总内存为 10GB，dirty_background_ratio 设置为 10%，即当脏页大小超过 1GB 时，系统会自动触发后台回刷，将部分数据写入磁盘。

---

**系统内存压力增大**

当系统内存不足时，内存管理模块会触发回刷操作，将脏页写回磁盘以释放内存。这种情况下，Page Cache 中的部分脏页被写入磁盘并释放为“干净页”或被直接回收，用于满足其他应用程序的内存需求。这类回刷由内存管理模块自动触发，尤其在内存紧张时，通过写回脏页避免内存耗尽。

---

**文件关闭或显式同步操作**

当系统内存不足时，内存管理模块会触发回刷操作，将脏页写回磁盘以释放内存。

这种情况下，Page Cache 中的部分脏页被写入磁盘并释放为“干净页”或被直接回收，用于满足其他应用程序的内存需求。

这类回刷由内存管理模块自动触发，尤其在内存紧张时，通过写回脏页避免内存耗尽。

---

**文件关闭或显式同步操作**

当文件被关闭（如 close() 系统调用）或应用程序调用了 fsync()、fdatasync()、sync() 等同步操作时，操作系统会立即将该文件的脏页写入磁盘。

Linux 系统会在关机时调用 sync 命令，确保 Page Cache 中的所有数据写入磁盘。

# 进程等待队列

通过 进程等待队列，操作系统可以有效管理进程的挂起和唤醒，使得程序能够高效地等待事件发生，避免浪费 CPU 资源，从而实现更高效的并发和资源管理。进程等待队列广泛应用于 I/O 操作、同步原语、信号量、锁等场景。

**示例：IO 多路复用**

在 select() 或 poll() 系统调用中，进程等待队列的作用尤为明显。这些系统调用允许一个进程同时等待多个 I/O 事件（如读、写、异常等），并在某个文件描述符变得可操作时被唤醒。

假设有一个简单的网络服务器，它同时处理多个客户端连接。服务器使用 select() 函数来监听多个套接字，当某个套接字的数据可读时，select() 会返回，服务器可以从中读取数据。

1. 进程挂起：当服务器调用 select() 来等待套接字的可读事件时，操作系统会把服务器进程挂起，直到其中一个套接字的数据可读或者出现其他指定的事件。
2. 进程等待队列：这些被挂起的进程会进入内核的进程等待队列，每个套接字有一个队列，存储着那些等待这个套接字的事件的进程。
3. 事件通知：当有数据到达某个套接字时，操作系统会唤醒等待该套接字的进程。select() 返回后，服务器可以知道哪个套接字的数据准备好了，从而执行相应的操作。

在这个例子中，进程等待队列 实际上是用来管理多个进程等待的 I/O 事件。当这些事件发生时，操作系统会唤醒对应的进程，避免了无谓的忙等。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412211612351.png)

**示例：信号量与同步**

在多线程编程中，信号量（Semaphore）是一种常见的同步原语，用于控制对共享资源的访问。信号量操作中也使用了进程等待队列。当一个线程尝试获取一个已被其他线程占用的信号量时，操作系统会将该线程挂起，直到信号量可用为止。

假设有两个线程，它们共享一个资源，只有一个线程可以同时访问这个资源。使用信号量来控制资源访问。

1. 线程挂起：线程 A 执行 sem_wait() 请求资源时，信号量的值是 0，表示没有可用的资源。在这种情况下，线程 A 会被挂起，放入进程等待队列中，等待信号量变为 1（即资源可用）。
2. 进程等待队列：线程 A 会被内核放入与信号量相关的等待队列中，直到另一个线程释放信号量（调用 sem_post()），将信号量值加 1。
3. 资源释放与唤醒：线程 B 执行完对资源的访问后，调用 sem_post() 来释放资源，信号量值变为 1。此时，线程 A 会从等待队列中被唤醒，重新获得信号量，继续执行。

在这个例子中，进程等待队列 的作用是让线程 A 等待直到信号量可用，从而实现对共享资源的互斥访问。

**示例：互斥锁**

在多线程程序中，互斥锁（mutex）用于确保同一时刻只有一个线程能访问临界区。当一个线程试图获取一个已经被另一个线程持有的互斥锁时，线程会被挂起，进入进程等待队列，直到锁被释放。

假设有两个线程，它们共享一个临界资源，通过互斥锁来控制对该资源的访问。

1. 线程挂起：线程 A 尝试获取一个已经被线程 B 锁定的互斥锁，线程 A 就会被挂起，放入等待队列中，直到线程 B 释放锁。
2. 进程等待队列：线程 A 被放入与互斥锁相关的进程等待队列中，直到线程 B 调用 unlock() 释放锁。
3. 锁释放与唤醒：线程 B 完成对临界资源的操作后，释放锁，线程 A 被唤醒并获得锁，继续执行。

在这种情况下，进程等待队列 使得线程 A 能够高效地等待锁的释放，避免了不必要的 CPU 占用。

# 硬中断

硬中断是由硬件设备（如 CPU、网卡、磁盘控制器等）触发的，目的是让操作系统能够及时响应外部设备的事件。硬中断的触发通常是由于外部设备需要向 CPU 发出信号，告诉操作系统有数据或事件需要处理。硬中断会打断当前正在执行的代码，CPU 会暂停当前任务并转向中断处理程序来处理中断事件。

假设有一个网络设备（如网卡），它在接收到数据包时会触发一个硬中断。硬中断处理的流程如下：

1. 网卡接收到数据包。 
2. 网卡发出硬中断信号，通知 CPU 处理数据。
3. CPU 在当前执行的任务（比如一个应用程序）中断，转去执行网卡硬中断处理程序（即中断服务例程 ISR）。
4. 在中断服务例程中，网卡驱动会检查数据包、确认数据包的状态，可能还会读取数据到内存中。
5. 完成硬中断处理后，CPU 会恢复之前的任务。

硬中断的特点：

- 优先级高：硬中断具有较高的优先级，会暂停正在执行的程序。
- 实时性强：硬中断是对硬件事件的即时响应，处理速度要求高。
- 由硬件触发：硬中断是由外部设备（如网卡、磁盘、键盘等）触发的。

# 软中断

软中断通常是由操作系统内核触发的，用于延迟处理或实现异步处理。当硬中断处理完毕后，内核可能会使用软中断来完成一些较为复杂或耗时的任务。软中断不同于硬中断，它不会直接中断当前的执行流程，而是由内核调度，在合适的时机异步处理。

接下来我们看一下软中断在网卡驱动中的应用：

1. 网卡接收到数据包并触发硬中断，硬中断服务例程将数据拷贝到内存的缓冲区。
2. 硬中断处理完后，网卡驱动可能会触发一个软中断来完成一些后续的工作，例如：
   - 网络协议栈的处理（例如 IP 层、TCP 层等协议的解析）。
   - 将数据包从内存缓冲区拷贝到相应的接收队列，供上层应用读取。
3. 软中断通常是在中断处理程序结束后执行的，保证了长时间的处理不会直接影响硬中断的响应。

软中断的特点：

- 由内核触发：软中断是由操作系统内核在硬中断处理后触发的。
- 异步执行：软中断通常是异步的，不会立刻阻塞当前任务，它们在合适的时机被执行。
- 低优先级：相比硬中断，软中断的优先级较低，可以推迟处理，且不会中断当前执行的任务。

# 聚集拷贝

Gather Copy 是一种数据传输和组装技术，通常用于优化数据传输效率。它的核心思想是将分散（非连续）的数据段聚集（gather）起来并一次性传输到目标位置。这种技术广泛应用于网络通信、存储系统和并行计算中。

在实际应用中，数据往往分散存储在不同的内存地址或缓冲区中。如果逐一拷贝这些数据并组装成连续的数据块，通常会导致多次内存拷贝操作，增加 CPU 的开销。

Gather Copy 避免了这些冗余的拷贝，通过以下方法实现优化：

- Gather（聚集）：将分散的内存数据段通过指针或者描述符记录。
- Copy（拷贝）：一次性将这些分散的数据段传输到目标位置（如内存或网络缓冲区）。

---

**示例：网络传输中的 Scatter-Gather I/O**

一个应用需要将以下三段内存中的数据通过网络发送出去：

- 数据段 1：存储在地址 0x1000，长度为 512 字节。
- 数据段 2：存储在地址 0x2000，长度为 256 字节。
- 数据段 3：存储在地址 0x3000，长度为 128 字节。

传统方法需要多次内存拷贝，效率较低：

- 将数据段 1、2、3 分别拷贝到一个连续的缓冲区。
- 将缓冲区的数据发送到网络。

Gather Copy 一次性发送全部数据，避免了额外的内存拷贝，提升了性能：

- NIC 通过描述符记录三个数据段的地址和长度。
- NIC 在发送数据时直接从这些分散的地址读取数据，组装成网络包并发送。

---

**示例：存储系统中的 Gather Copy**

在分布式存储系统中，一个文件的数据块分布在多个内存地址（或硬盘的不同扇区）中，但需要传输到客户端作为一个整体文件。

传统方法：

- 将这些数据块逐一读取到内存中的临时缓冲区。
- 从缓冲区写到网络或者目标位置。

Gather Copy：

- DMA 控制器记录所有数据块的地址和大小。
- 数据块直接通过 DMA 被读取并传输到目标位置（如网络缓冲区）。

---

**Gatery Copy 的实现**

现代硬件（如 NIC 或存储控制器）广泛支持 Scatter-Gather DMA：

- 描述符记录分散的数据块的地址和大小。
- DMA 控制器根据描述符一次性完成数据聚集和传输。

Linux 提供了一种系统接口支持 Scatter-Gather 模式，常用于文件 I/O 和网络通信，例如：

- 网络协议栈中，通过 sendmsg() 可以直接发送多个分散的内存缓冲区。
- 文件系统中，通过 readv() 和 writev() 系统调用，可以高效地读取和写入分散的数据块。

---

Gather Copy 的优点

- 减少内存拷贝：避免了将分散的数据块复制到一个连续缓冲区的过程。
- 提高 CPU 利用率：数据聚集和传输通常由 DMA 或其他硬件完成，CPU 仅参与控制。
- 提高吞吐量：在高性能网络和存储中，Gather Copy 可以显著提升数据传输速度。

Gather Copy 的缺点

- 硬件依赖：需要硬件支持（如 Scatter-Gather DMA 和 SmartNIC）。
- 数据块过多时的效率问题：如果数据块数量太多，记录这些块的元数据（如地址和大小）可能成为新的瓶颈。
- 额外的控制开销：描述符管理需要 CPU 或硬件额外处理。

# 零拷贝

零拷贝（Zero Copy）是一种优化技术，旨在减少数据在不同位置之间传输时的拷贝次数，从而提高效率，减少 CPU 和内存的使用。传统的数据传输中，数据通常会被多次拷贝，而零拷贝通过直接操作缓冲区，避免了多余的拷贝操作。

---

传统的 IO 操作在读取本地文件并传输给客户端时，涉及四次数据拷贝和三次状态切换，步骤非常繁琐。

1. 调用 `read()`，从用户空间切换到内核空间，从磁盘读取数据到内核缓冲区。
   - 此过程可以利用 DMA 进行数据传输，不需要 CPU 参与，非常适合数据传输。
2. 从内核缓冲区拷贝数据到用户缓冲区，从内核空间切换到用户空间。
   - 此过程无法利用 DMA，需要 CPU 参与。
3. 调用 `write()`，从用户缓冲区拷贝数据到 Socket 缓冲区。
   - 此过程无法利用 DMA，需要 CPU 参与。
4. 从内核空间切换到用户空间，从 Socket 缓冲区拷贝数据到 NIC。
   - 此过程可以利用 DMA 进行数据传输，不需要 CPU 参与，非常适合数据传输。

```java
RandomAccessFile raf = new RandomAccessFile(new File("test.txt"), "r");
byte[] buf = new byte[16];
raf.read(buf);
socket.getOutputStream().write(buf);
```

![传统 IO 数据传输](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403201119803.png)

---

Linux v2.1 提供了 `sendFile()` 进一步优化，总共涉及三次数据拷贝和一次状态切换，效率非常高。

1. 调用 `sendFile()`，从用户空间切换到内核空间，使用 DMA 从磁盘读取数据到内核缓冲区。
2. 使用 CPU 从内核缓冲区拷贝数据到 Socket 缓冲区。
3. NIC Driver 通过 DMA 从 Socket 缓冲区拷贝数据到 NIC。

![sendFile 优化](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403201119805.png)

---

Linux v2.4 对 `sendFile()` 进一步优化，实现了零拷贝，总共涉及两次数据拷贝和一次状态切换，效率更高。

1. 调用 `sendFile()`，从用户空间切换到内核空间，使用 DMA 从磁盘读取数据到内核缓冲区。
2. 使用 DMA 从内核缓冲区拷贝一些偏移量和长度到 Socket 缓冲区（Gather Copy 的前置操作），此过程几乎没有损耗。
3. NIC Driver 通过 DMA + Gather Copy 从内核缓冲区读取数据并传输到 NIC，避免了多余的数据拷贝，同时实现了高效的数据传输。

![Linux v2.4 优化](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403201119806.png)


零拷贝并不是真正无拷贝，而是 CPU 不参与拷贝，适合小文件传输，通过 DMA 减少 CPU 压力，降低 CPU 缓存伪共享。

# 内存映射

mmap（memory map，内存映射）是一种将文件内容直接映射到进程地址空间的技术，它允许用户在内存中操作文件内容而无需显式的读取和写入操作。通过 mmap，实现了文件与内存的直接映射，可以显著减少数据拷贝次数，从而达到零拷贝的效果。

在 mmap 零拷贝中，数据从文件到内存或从内存到设备的传输过程中，避免了传统的中间缓冲区拷贝步骤，大幅提升了效率。

mmap 零拷贝的核心思想

- 使用内存映射技术将文件内容映射到用户进程的虚拟地址空间。
- 操作系统通过页表机制将文件内容直接映射到物理内存，而不需要实际拷贝数据。
- 直接使用 DMA 技术将数据从映射的内存区域传输到目标设备（如网络或存储设备）。

![DirectByteBuffer 优化](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403201119804.png)

---

Java Nio 的 DirectByteBuffer 就是 mmap 的具体实现。Java NIO 的 `ByteBuffer.allocateDirect()` 使用的是操作系统内存，不同于 `ByteBuffer.allocate()` 使用的是 Java 堆内存，总共涉及三次数据拷贝和三次状态切换。

- DirectByteBuffer 将堆外内存映射到 JVM 内存中直接访问使用，这块内存不受 JVM 垃圾回收的影响，内存地址固定，有助于 IO 操作。
- DirectByteBuffer 对象只维护内存的虚引用，垃圾回收时，DirectByteBuffer 对象被回收，虚引用加入引用队列，通过专门线程访问引用队列，根据虚引用释放堆外内存。

---

**示例：文件传输中的 mmap 零拷贝**

1. 使用 mmap() 将文件内容映射到用户空间：

- 操作系统通过页表机制，将文件内容直接映射到虚拟地址空间，实际数据仍在内核缓冲区中。
- 用户空间并未实际复制数据，只是获得了对内核缓冲区的直接访问权限。

2. 通过 write() 或类似函数将映射区域的数据发送到网络：

- NIC（网卡）通过 DMA 直接从映射区域读取数据并发送给客户端。

# 进程

进程是操作系统中资源分配和调度的基本单位，是一个正在执行的程序的实例，每个进程都有自己独立的地址空间、全局变量、文件描述符表、堆和栈。

进程控制块（PCB）是操作系统内核为每个进程创建的数据结构，用来存储与该进程相关的所有关键信息。它是操作系统管理和调度进程的核心部分。

每个进程在操作系统中都有唯一的 PCB，操作系统通过 PCB 跟踪和管理进程的运行状态。

```c
struct task_struct {
    // 标识信息
    pid_t pid;                    // 进程 ID
    pid_t tgid;                   // 线程组 ID
    struct task_struct *parent;   // 父进程指针
    struct list_head children;    // 子进程链表

    // 状态信息
    volatile long state;          // 进程状态，TASK_RUNNING、TASK_STOPPED ...
    unsigned int flags;           // 进程标志，用于标识进程的特定属性，如内核线程

    // 调度信息
    int prio;                     // 动态优先级，决定进程调度的优先级，可能会在运行过程中变化
    int static_prio;              // 静态优先级，初始设定的优先级。
    struct sched_entity se;       // 调度实体，包含调度器需要的信息，如进程运行时间和等待时间
    struct list_head run_list;    // 进程在就绪队列中的位置

    // 内存管理信息
    struct mm_struct *mm;         // 用户地址空间，描述用户空间的内存映射信息，包括代码段、数据段、堆和栈
    struct mm_struct *active_mm;  // 当前活动地址空间，对于内核线程，其 mm 可能为空，此时使用 active_mm
    void *stack;                  // 指向该进程的内核栈，内核栈用于处理系统调用和中断。

    // 文件系统信息
    struct fs_struct *fs;         // 指向与文件系统相关的信息，如当前工作目录和根目录
    struct files_struct *files;   // 记录打开的文件描述符列表

    // 信号和中断
    struct signal_struct *signal;   // 信号相关信息，例如挂起的信号
    struct sighand_struct *sighand; // 信号处理程序，例如 SIGINT 的处理函数

    // 时间和会计信息
    u64 start_time;               // 进程启动时间
    u64 real_start_time;          // 实际启动时间（考虑系统挂起等）
    u64 utime;                    // 进程在用户态运行的累计时间
    u64 stime;                    // 进程在内核态运行的累计时间
    unsigned long nvcsw;          // 自愿上下文切换次数
    unsigned long nivcsw;         // 非自愿上下文切换次数

    // 网络信息
    struct nsproxy *nsproxy;      // 记录进程所在的命名空间信息，支持容器化和虚拟化环境

    // 线程相关
    struct thread_struct thread;  // 线程上下文信息，包括寄存器内容等
};
```

mm_struct 是 task_struct 的一个成员变量，用于描述进程的内存管理信息。代码段的起始地址和结束地址通常存储在 mm_struct 的以下字段中：

```c
struct mm_struct {
    unsigned long start_code;  // 代码段的起始地址
    unsigned long end_code;    // 代码段的结束地址
    unsigned long start_data;  // 数据段的起始地址
    unsigned long end_data;    // 数据段的结束地址
    unsigned long start_brk;   // 堆的起始地址
    unsigned long brk;         // 堆的结束地址
    unsigned long start_stack; // 栈的起始地址
};
```

操作系统需要高效管理和调度进程，因此必须设计合适的数据结构来存储和组织每个进程的 PCB，PCB 的组织方式直接影响进程的创建、调度、状态切换以及资源回收的效率。

常见的 PCB 组织方式包括链表，多级队列，哈希表，树等结构。

---

**示例：单链表管理 PCB**

操作系统运行了 3 个进程（PID 101、102、103），使用单链表存储 PCB。

```
Head -> PCB(101) -> PCB(102) -> PCB(103) -> NULL
```

系统遍历链表查找就绪进程，若进程阻塞（如等待 I/O），将其从链表中移除。

---

**示例：多级队列管理 PCB**

由 就绪队列 和 阻塞队列组成：

- 就绪队列：PID 201（时间片用完）、PID 202（刚完成 IO）
- 阻塞队列：PID 203（等待文件读写完成）

```
就绪队列：Head -> PCB(201) -> PCB(202) -> NULL
阻塞队列：Head -> PCB(203) -> NULL
```

调度器从就绪队列选择最高优先级进程运行，IO 操作完成时，将 PCB(203) 从阻塞队列移到就绪队列。

# 进程切换

进程切换是指操作系统暂停当前正在运行的进程，并将 CPU 控制权交给另一个进程的过程。这个过程包括保存当前进程的状态、恢复新进程的状态，以及必要的资源管理。进程切换是操作系统调度程序的重要职责。

进程切换可以由以下事件触发：

- 时间片耗尽：调度器发现当前进程的时间片用完，需要切换到另一个进程。
- I/O 操作阻塞：当前进程需要等待 I/O 操作，进入阻塞状态。
- 进程结束：当前进程终止，需要调度其他进程。
- 高优先级进程抢占：有更高优先级的进程进入就绪队列。

---

进程切换的过程：

- 触发进程上下文切换时，操作系统将当前进程的状态保存在其 PCB 中。
  - 保存的状态包括：CPU 寄存器状态，进程状态（阻塞 或 就绪），内存信息（当前页表地址），调度信息（如剩余时间片）。
- 当前进程的 PCB 被移到合适的队列。
  - 如果进程进入阻塞状态，PCB 会移到阻塞队列。
  - 如果进程时间片耗尽，PCB 会移到就绪队列。
- 调度器根据调度算法（如时间片轮转、优先级调度）选择下一个进程。
  - 通过读取下一个进程的 PCB 获取其状态信息。
- 加载新进程的 PCB 信息到 CPU 和内存。
- CPU 开始执行新进程的指令，新进程进入运行状态（Running）。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412281521187.png)

---

**示例：两个进程 A 和 B 的切换**

1. 进程 A 运行：

- 当前 CPU 正在执行进程 A，进程 A 的状态为 Running。
- 程序计数器指向进程 A 的某条指令地址，例如 0x400100。

2. 时间片耗尽，触发进程切换：

- 调度器检测到进程 A 的时间片用完，需要切换到进程 B。

3. 保存进程 A 的状态到 PCB：

- 操作系统将进程 A 的 CPU 状态保存到其 PCB：
  - 程序计数器 = 0x400100。
  - 通用寄存器的值，如 eax = 10，ebx = 20。
  - 页表基地址。
  - 调度信息，如剩余时间片 = 0。
- 更新进程 A 的状态为 Ready，并将其 PCB 移到就绪队列。

4. 选择进程 B 并恢复状态：

- 调度器选择进程 B 的 PCB，从中读取信息：
  - 程序计数器 = 0x400100。
  - 通用寄存器的值，如 eax = 10，ebx = 20。
  - 页表基地址。
  - 调度信息，如剩余时间片 = 0。
- 更新进程 A 的状态为 Ready，并将其 PCB 移到就绪队列。

5. 开始执行进程 B：

- CPU 开始从 0x500200 地址执行进程 B 的指令，进程 B 状态更新为 Running。

# 进程状态

进程在操作系统中运行时，其状态会随着事件的发生不断变化。操作系统通过 PCB 记录进程的当前状态，并根据状态的变化进行管理和调度。

新建状态（New）：进程正在被创建，尚未加入调度队列。

- 程序启动后，程序刚刚被操作系统加载到内存，但还未准备好运行，分配 PCB 和相关资源，创建完成后进入就绪状态。

就绪状态（Ready）：进程已分配好所需资源，保留程序计数器和寄存器状态，随时可以被调度运行。

- 进程在 CPU 就绪队列中，等待 CPU 分配。被调度时，会进入运行状态。被暂停时，会回到就绪状态。

运行状态（Running）：进程正在使用 CPU，指令正在被执行。

- 进程被调度，获得 CPU 的控制权时，会进入运行状态。请求资源或事件，会进入阻塞状态。请求 I/O 操作，会进入阻塞状态。时间片耗尽，会回到就绪状态。

阻塞状态（Blocked）：进程无法继续执行，因为等待某些事件或资源。

- 等待 IO 完成 或 等待某个信号或进程间通信 时会进入阻塞状态。当事件完成，会回到就绪状态。

结束状态（Terminated）：进程已完成所有任务或因某种原因终止。

- 操作系统回收进程的所有资源时，或者 删除进程的 PCB 时，会进入结束状态，此后不再发生状态变化。

僵尸状态（Zombie）：进程已终止，但其 PCB 信息仍保留。

- 一个子进程运行完毕，但其父进程尚未调用 wait()，导致子进程进入僵尸状态。
- 父进程回收后，PCB 被销毁时，会进入结束状态。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202412281931794.png)

# 进程创建

进程创建是指操作系统为新任务分配资源、初始化所需状态，并将其纳入调度管理的过程。一个进程的创建可以由系统、父进程、用户操作触发，涉及多个步骤来保证新进程的正常运行。

进程创建的触发方式：

- 用户操作：用户在终端运行一个程序，如 ./a.out。
- 父进程调用创建系统调用：父进程调用 fork() 创建子进程。
- 系统自动创建：操作系统初始化时自动创建特殊进程（如 init 或 systemd）。
- 应用程序需求：应用程序通过多进程模型并发执行任务，如 Web 服务器为每个请求创建一个进程。

进程创建的过程：

- 分配唯一的进程 ID（PID）：系统为新进程分配一个唯一的标识符（PID）来区分进程。
- 创建并初始化 PCB（进程控制块）：分配内存空间用于 PCB，初始化 PCB，包括进程状态、优先级、计数器、寄存器状态等信息。
- 分配资源：分配内存（代码段、数据段、堆、栈等），为进程分配文件描述符表、I/O 设备。
- 继承或初始化父进程的资源：子进程继承父进程的部分资源，如打开的文件、信号处理程序、环境变量等。
- 设置进程关系：设置父进程和子进程的关系，更新父进程的子进程列表。
- 添加到调度队列：将新进程的 PCB 加入就绪队列，等待 CPU 调度。

# 进程终止

进程终止是指操作系统将一个进程从执行状态移除的过程。当进程完成任务或因异常退出时，操作系统需要释放该进程占用的资源并将其状态更新为终止状态。

进程终止的触发方式：

- 正常退出：进程执行完成后正常终止，例如调用 exit()。
- 父进程请求终止子进程：父进程通过系统调用（如 kill()）终止子进程。
- 外部干预：用户通过终端命令（如 kill PID）终止进程。
- 异常终止：进程因错误或未处理的异常（如段错误）被操作系统终止。
- 系统关闭：操作系统关闭时会终止所有用户进程。

进程终止的过程：

- 更新进程状态：将进程状态设置为终止（Terminated/Zombie）。
- 释放资源：回收进程占用的内存（如堆、栈、代码段）。关闭打开的文件描述符和释放 I/O 设备。
- 通知父进程：子进程终止后，将退出状态通知父进程。
- 移除进程控制块（PCB）：系统调用 wait() 或 waitpid() 后，彻底删除终止进程的 PCB。
- 回收 PID：释放进程 ID（PID），使其可用于新进程。

进程终止的状态变化：

1. Running -> Terminated

- 满足进程终止的触发条件后，发生该状态变化。
- 此时，进程的资源（如内存和文件描述符）已经释放，但 PCB（进程控制块） 仍然保留，用于记录退出信息（如退出状态、CPU 使用时间等）。

2. Terminated -> Zombie

- 子进程已终止，但父进程尚未回收其退出状态的状态，发生该状态变化。
- 僵尸进程不占用内存、文件描述符等资源，但 PCB 保留，占用系统表项。
- 操作系统保留该进程的 PCB，记录退出信息以便父进程获取。

3. Zombie -> Removed

- 父进程通过 wait() 或 waitpid() 获取子进程的退出状态后，操作系统删除子进程的 PCB，从系统中完全移除，触发该状态变化。

```
Running   →   Terminated   →   Zombie   →   Removed
   ↑                             ↑             ↑
正常运行                    父进程未回收状态  父进程回收状态
```

# 进程阻塞

进程阻塞是指进程因为某种原因无法继续执行当前任务而被暂停，主动让出 CPU，进入等待某个事件发生的状态（Blocked）。阻塞状态下，进程停止运行但保留在内存中，等待条件满足后重新进入就绪状态。

进程阻塞的触发方式：

- IO 操作：等待磁盘读写、网络传输或用户输入时，进程会阻塞。
- 资源不可用：请求的资源（如文件、内存）被其他进程占用。
- 同步机制：进程等待信号量、条件变量或锁释放。
- 进程间通信：进程等待信号量、条件变量或锁释放。
- 人为控制：进程调用系统接口（如 sleep()）主动进入阻塞状态。

进程阻塞的状态变化：

1. Running -> Blocked

- 满足进程阻塞的条件后，触发该状态变化，操作系统将该进程从就绪队列移到阻塞队列。

2. Blocked -> Ready

- 等待事件完成后，触发该状态变化，进程进入就绪状态，操作系统将该进程从阻塞队列移到就绪队列，等待 CPU 调度。

# 进程挂起

挂起（Suspend）和 激活（Resume）是进程状态的一种特殊转换，它使得操作系统可以暂时停止某个进程的运行并将其存储到磁盘或其他介质中，以便释放内存资源或者让更高优先级的任务运行。

挂起后，进程不会占用 CPU 和内存资源，但其状态信息被保存，以便后续激活时能够恢复运行。

进程挂起的常见场景：

- 内存不足：当系统内存资源紧张时，操作系统可能会将某些进程挂起，将其内存内容保存到磁盘的交换区（Swap）。
- 优先级调度：系统为让高优先级任务执行，可能挂起低优先级任务。
- 用户操作：用户通过某些命令（如 kill -STOP）挂起一个进程。
- 资源不可用：进程所需的资源暂时不可用，例如等待设备准备好。

挂起的过程：

1. 保存进程状态到 PCB：将进程的 CPU 寄存器状态、程序计数器（PC）、内存映射表等保存到其 PCB 中。
2. 写出内存数据到磁盘：如果是内存挂起，操作系统会将进程的内存内容写到磁盘交换区（Swap）。
3. 标记进程为挂起状态：在 PCB 中更新进程的状态为挂起（Suspended）。
4. 释放资源：释放该进程占用的内存和其他系统资源。

激活的过程：

1. 从磁盘读取进程状态：如果进程被写入磁盘，操作系统会从磁盘交换区将其数据读回内存。
2. 恢复进程状态：从 PCB 恢复进程的 CPU 寄存器、程序计数器等信息。
3. 更新进程状态为就绪或运行：将进程状态更新为就绪（Ready）或者直接调度运行（Running）。

在进程状态中，挂起通常涉及以下状态：

1. 就绪挂起（Ready-Suspended）：进程已被挂起，但满足执行条件，等待被激活。
2. 阻塞挂起（Blocked-Suspended）：进程因等待某事件或资源而阻塞，同时被挂起。
3. 激活后回到就绪（Ready）或运行（Running）：挂起的进程被激活后进入就绪队列，等待调度运行。

---

默认情况下，进程 的 就绪状态 和 阻塞状态 都是 活动 的，即 活动就绪状态 和 活动阻塞状态。当进程被挂起后，就会进入 静止就绪状态 和 静止阻塞状态。只有当进程被重新激活后，才会回到 活动就绪状态 和 活动阻塞状态。

在活动状态下，进程始终占用一定的内存资源，调度器直接操作活动状态的进程，无需额外激活。

静止状态用于帮助操作系统管理资源，特别是在内存不足时，通过将不活跃的进程移出内存，释放内存空间。挂起操作通常是由操作系统的内存管理机制（如分页或交换）或用户命令触发的。

- 例如，当进程处于活动就绪状态，等待 CPU 调度时，由于系统内存不足，则可能会被挂起，进入静止就绪状态。
- 例如，当进程处于活动阻塞状态，等待 IO 完成时，由于系统内存不足，则可能会被挂起，进入静止阻塞状态。

---

**示例：内存不足引发的挂起与激活**

挂起过程，系统内存不足，有 4 个进程运行（A、B、C、D），系统决定挂起进程 C。

- 保存进程 C 的状态到其 PCB。
- 将进程 C 的内存内容写入磁盘交换区。
- 更新进程 C 的状态为 Ready-Suspended。

激活过程，内存释放后，系统决定激活进程 C。

- 从磁盘读取进程 C 的内存内容。
- 恢复进程 C 的 CPU 状态和程序计数器。
- 更新进程 C 的状态为 Ready。
- 将进程 C 放入就绪队列，等待调度。

---

**示例：用户挂起与激活**

挂起过程，用户运行了一个下载工具（进程 D），紧接着输入 kill -STOP PID 挂起下载工具。

- 系统保存进程 D 的状态到 PCB。
- 更新进程 D 的状态为 Ready-Suspended。

激活过程，用户输入 kill -CONT PID 恢复下载工具。

- 系统从 PCB 恢复进程 D 的状态。
- 更新进程 D 的状态为 Ready，并加入就绪队列。

# 父子进程

父子进程是进程之间的层次关系，子进程由父进程通过系统调用创建（如 fork()），继承父进程的一些资源，同时它们可以协作完成任务。父子进程的关系在多任务操作系统中非常重要，例如在进程管理、任务调度、资源共享等场景中。

子进程有自己独立的程序计数器和堆栈空间。子进程继承父进程的一些资源，如文件描述符、环境变量、用户 ID 等。

父子进程在创建后可以独立运行，不受对方的直接干扰。子进程退出后，父进程需要调用 wait() 系统调用来回收子进程的资源。

父子进程之间的通信是操作系统进程管理中的重要内容。由于父子进程通常共享资源，但运行在不同的地址空间中，它们需要通过特定的机制进行数据交换和协作。常见的通信方式包括：管道（Pipe）、共享内存（Shared Memory）、信号（Signal）、消息队列（Message Queue）、套接字（Socket）。

# 管道通信

管道允许一个进程将数据写入管道的输出端，另一个进程从输入端读取数据，从而实现通信。管道是基于字节流的通信方式，通常由操作系统提供支持。

管道的特点：

- 单向通信：数据流只能在一个方向上传输。如果需要双向通信，需要创建两个管道。
- 半双工：一个管道可以用来传输数据，但不能同时进行读写操作。
- 父子进程关系：管道通常用于父子进程或兄弟进程之间的通信。
- 内核支持：管道在内存中由操作系统维护，数据不需要经过磁盘，通信效率较高。

管道的类型：

- 匿名管道：通过 pipe() 创建，只能在有亲缘关系的进程间使用（如父子进程）。
- 命名管道：通过 mkfifo() 创建，先进先出队列，可用于无亲缘关系的进程之间通信。

---

**示例：使用匿名管道通信**

父进程向子进程发送消息，子进程读取消息并输出。

```c
int main() {
    int pipe_fd[2]; // 用于存储管道的读端和写端文件描述符
    pid_t pid;
    char write_msg[] = "Hello from parent!";
    char read_msg[100];

    // 创建管道
    if (pipe(pipe_fd) == -1) {
        perror("pipe");
        exit(EXIT_FAILURE);
    }

    // 创建子进程
    pid = fork();
    if (pid < 0) {
        perror("fork");
        exit(EXIT_FAILURE);
    }

    if (pid > 0) { // 父进程
        close(pipe_fd[0]); // 关闭管道读端
        write(pipe_fd[1], write_msg, strlen(write_msg) + 1); // 写入数据
        close(pipe_fd[1]); // 关闭管道写端
    } else { // 子进程
        close(pipe_fd[1]); // 关闭管道写端
        read(pipe_fd[0], read_msg, sizeof(read_msg)); // 读取数据
        printf("Child process received: %s\n", read_msg);
        close(pipe_fd[0]); // 关闭管道读端
    }

    return 0;
}
```

```
Child process received: Hello from parent!
```

---

**示例：使用命名管道通信**

一个进程向命名管道写入消息，另一个进程从命名管道读取消息。

1. 进程 1 写入数据

```c
#define FIFO_NAME "/tmp/my_fifo"

int main() {
    int fifo_fd;
    char message[] = "Hello from writer!";

    // 创建命名管道
    if (mkfifo(FIFO_NAME, 0666) == -1) {
        perror("mkfifo");
    }

    // 打开管道写端
    fifo_fd = open(FIFO_NAME, O_WRONLY);
    if (fifo_fd == -1) {
        perror("open");
        exit(EXIT_FAILURE);
    }

    // 写入数据
    write(fifo_fd, message, strlen(message) + 1);
    printf("Message sent: %s\n", message);

    // 关闭管道
    close(fifo_fd);
    return 0;
}
```

2. 进程 2 读取数据

```c
#define FIFO_NAME "/tmp/my_fifo"

int main() {
    int fifo_fd;
    char buffer[100];

    // 打开管道读端
    fifo_fd = open(FIFO_NAME, O_RDONLY);
    if (fifo_fd == -1) {
        perror("open");
        exit(EXIT_FAILURE);
    }

    // 读取数据
    read(fifo_fd, buffer, sizeof(buffer));
    printf("Message received: %s\n", buffer);

    // 关闭管道
    close(fifo_fd);

    // 删除管道文件
    unlink(FIFO_NAME);
    return 0;
}
```

3. 输出结果

```
Message sent: Hello from writer!
Message received: Hello from writer!
```

---

**示例：全双工通信**

通过管道实现全双工通信，即进程之间能够同时进行双向数据传输，通常需要创建两个独立的管道：一个管道用于一个方向的数据传输，另一个管道用于反方向的数据传输。

```c
int main() {
    int pipe1[2]; // 管道1：父进程到子进程
    int pipe2[2]; // 管道2：子进程到父进程
    pid_t pid;

    // 创建管道1
    if (pipe(pipe1) == -1) {
        perror("pipe1");
        exit(EXIT_FAILURE);
    }

    // 创建管道2
    if (pipe(pipe2) == -1) {
        perror("pipe2");
        exit(EXIT_FAILURE);
    }

    // 创建子进程
    pid = fork();
    if (pid < 0) {
        perror("fork");
        exit(EXIT_FAILURE);
    }

    if (pid > 0) { // 父进程
        char parent_msg[] = "Hello from parent!";
        char child_msg[100];

        // 关闭不需要的管道端
        close(pipe1[0]); // 关闭管道1读端
        close(pipe2[1]); // 关闭管道2写端

        // 向子进程发送消息
        write(pipe1[1], parent_msg, strlen(parent_msg) + 1);
        printf("Parent sent: %s\n", parent_msg);

        // 从子进程接收消息
        read(pipe2[0], child_msg, sizeof(child_msg));
        printf("Parent received: %s\n", child_msg);

        // 关闭管道端
        close(pipe1[1]);
        close(pipe2[0]);
    } else { // 子进程
        char child_msg[] = "Hello from child!";
        char parent_msg[100];

        // 关闭不需要的管道端
        close(pipe1[1]); // 关闭管道1写端
        close(pipe2[0]); // 关闭管道2读端

        // 从父进程接收消息
        read(pipe1[0], parent_msg, sizeof(parent_msg));
        printf("Child received: %s\n", parent_msg);

        // 向父进程发送消息
        write(pipe2[1], child_msg, strlen(child_msg) + 1);
        printf("Child sent: %s\n", child_msg);

        // 关闭管道端
        close(pipe1[0]);
        close(pipe2[1]);
    }

    return 0;
}
```

# 共享内存通信

一个物理内存区域被多个进程映射到其各自的虚拟地址空间，从而实现内存共享。进程之间通过共享内存（Shared Memory）通信是一种高效的进程间通信（IPC）方式，无需通过内核传递数据。

共享内存本身不提供同步机制，多个进程对共享内存的访问需要额外的同步工具（如信号量、互斥锁）避免竞争条件。

---

以下是一个使用 POSIX API 的共享内存通信示例，其中两个进程通过共享内存传递消息。

1. 主进程创建共享内存并写入数据：

```c
// 创建共享内存对象
int shm_fd = shm_open(SHARED_MEM_NAME, O_CREAT | O_RDWR, 0666);
if (shm_fd == -1) {
    perror("shm_open");
    exit(EXIT_FAILURE);
}

// 设置共享内存大小
if (ftruncate(shm_fd, SHARED_MEM_SIZE) == -1) {
    perror("ftruncate");
    exit(EXIT_FAILURE);
}

// 将共享内存映射到地址空间
char *shared_mem = mmap(NULL, SHARED_MEM_SIZE, PROT_WRITE, MAP_SHARED, shm_fd, 0);
if (shared_mem == MAP_FAILED) {
    perror("mmap");
    exit(EXIT_FAILURE);
}

// 写入数据
const char *message = "Hello from shared memory!";
strncpy(shared_mem, message, SHARED_MEM_SIZE);

printf("Message written to shared memory: %s\n", message);

// 保持程序运行，等待读取
sleep(10);

// 解除映射并删除共享内存
munmap(shared_mem, SHARED_MEM_SIZE);
shm_unlink(SHARED_MEM_NAME);
```

2. 从进程读取共享内存数据：

```c
// 打开共享内存对象
int shm_fd = shm_open(SHARED_MEM_NAME, O_RDONLY, 0666);
if (shm_fd == -1) {
    perror("shm_open");
    exit(EXIT_FAILURE);
}

// 将共享内存映射到地址空间
char *shared_mem = mmap(NULL, SHARED_MEM_SIZE, PROT_READ, MAP_SHARED, shm_fd, 0);
if (shared_mem == MAP_FAILED) {
    perror("mmap");
    exit(EXIT_FAILURE);
}

// 读取数据
printf("Message read from shared memory: %s\n", shared_mem);

// 解除映射
munmap(shared_mem, SHARED_MEM_SIZE);
```

# 消息传递通信

消息传递通信是一种通过操作系统提供的消息传递机制（如消息队列、信号或套接字）在进程之间传递数据的方法。这种方法解耦了进程的共享资源，允许进程以消息为单位传递数据，而无需直接共享内存。

- 数据以消息的形式组织，具有结构化的内容，消息可以包含多个字段（如 ID、优先级、数据）。

消息传递通信的实现方案：

- System V 消息队列：基于操作系统内核的消息队列（msgget, msgsnd, msgrcv）。
- POSIX 消息队列：提供面向文件的消息队列（mq_open, mq_send, mq_receive）。
- 套接字：使用网络套接字（如 TCP/UDP）在本地或网络间发送消息。
- 高级消息队列：使用消息中间件（如 RabbitMQ、Kafka）实现复杂的消息传递。

消息传递通信的优点：

- 解耦性：消息队列将发送者和接收者解耦，适用于异步通信。
- 结构化数据：消息可以包含丰富的字段信息。
- 可靠性：消息可以持久化，即使进程退出也不会丢失消息。

---

**示例：System V 消息队列**

1. 发送者向消息队列中发送消息：

```c
#define QUEUE_KEY 1234

// 消息结构体
struct message {
    long message_type;      // 消息类型
    char message_text[100]; // 消息内容
};

int main() {
    int msg_id;
    struct message msg;

    // 创建消息队列
    msg_id = msgget(QUEUE_KEY, IPC_CREAT | 0666);
    if (msg_id == -1) {
        perror("msgget");
        exit(EXIT_FAILURE);
    }

    // 设置消息内容
    msg.message_type = 1; // 消息类型
    strcpy(msg.message_text, "Hello from sender!");

    // 发送消息
    if (msgsnd(msg_id, &msg, sizeof(msg.message_text), 0) == -1) {
        perror("msgsnd");
        exit(EXIT_FAILURE);
    }

    printf("Message sent: %s\n", msg.message_text);
    return 0;
}
```

2. 接收者从消息队列接收数据

```c
#define QUEUE_KEY 1234

// 消息结构体
struct message {
    long message_type;      // 消息类型
    char message_text[100]; // 消息内容
};

int main() {
    int msg_id;
    struct message msg;

    // 获取消息队列
    msg_id = msgget(QUEUE_KEY, 0666);
    if (msg_id == -1) {
        perror("msgget");
        exit(EXIT_FAILURE);
    }

    // 接收消息
    if (msgrcv(msg_id, &msg, sizeof(msg.message_text), 1, 0) == -1) {
        perror("msgrcv");
        exit(EXIT_FAILURE);
    }

    printf("Message received: %s\n", msg.message_text);

    // 删除消息队列
    if (msgctl(msg_id, IPC_RMID, NULL) == -1) {
        perror("msgctl");
        exit(EXIT_FAILURE);
    }

    return 0;
}
```

# 套接字通信

Socket 通信是一种强大的进程间通信方式，用于本地或网络上的进程之间进行通信。Socket（套接字）是操作系统提供的抽象接口，通过网络协议实现数据传输，支持在同一台主机或不同主机之间进行通信。Socket 通信支持 TCP（可靠的面向连接通信）和 UDP（无连接的快速通信）两种主要协议。

# 进程同步

互斥制约和合作制约是操作系统中进程同步的重要概念，它们分别描述了进程间如何竞争资源或如何协同工作。

---

互斥制约是指多个进程竞争临界资源（如打印机、文件），必须确保同一时间只有一个进程可以使用该资源，其他进程必须等待。

- 资源独占性：临界资源一次只能被一个进程访问。
- 互斥访问：当一个进程进入临界区时，其他进程必须等待。
- 保护临界区：使用同步机制（如锁、信号量）实现互斥。

示例：两个线程竞争一个共享变量。

```c
#include <stdio.h>
#include <pthread.h>
#include <unistd.h>

int shared_resource = 0;  // 临界资源
pthread_mutex_t mutex;    // 互斥锁

void *increment(void *arg) {
    pthread_mutex_lock(&mutex);  // 加锁
    printf("Thread %ld entering critical section.\n", pthread_self());
    shared_resource++;
    sleep(1);  // 模拟任务耗时
    printf("Thread %ld exiting critical section. Shared resource: %d\n", pthread_self(), shared_resource);
    pthread_mutex_unlock(&mutex);  // 解锁
    return NULL;
}

int main() {
    pthread_t t1, t2;

    pthread_mutex_init(&mutex, NULL);

    pthread_create(&t1, NULL, increment, NULL);
    pthread_create(&t2, NULL, increment, NULL);

    pthread_join(t1, NULL);
    pthread_join(t2, NULL);

    pthread_mutex_destroy(&mutex);

    return 0;
}
```

---

合作制约是指多个进程通过同步机制协同工作，完成某个共同任务。一个进程的执行需要依赖于其他进程的执行结果或状态。

- 依赖关系：进程之间通过条件或信号协同工作。
- 顺序性：某些任务必须按照一定的顺序完成。
- 通信机制：使用同步工具（如信号量、条件变量）协调进程行为。

示例：生产者-消费者问题，生产者线程向缓冲区中生产数据，消费者线程从缓冲区中消费数据。

- 缓冲区未满时生产者才能继续生产。
- 缓冲区非空时消费者才能继续消费。

```c
#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>

#define BUFFER_SIZE 5
int buffer[BUFFER_SIZE];
int in = 0, out = 0;

sem_t empty_slots;  // 空槽信号量
sem_t full_slots;   // 满槽信号量
pthread_mutex_t mutex;  // 互斥锁

void *producer(void *arg) {
    for (int i = 1; i <= 10; i++) {
        sem_wait(&empty_slots);  // 等待有空槽
        pthread_mutex_lock(&mutex);  // 加锁
        buffer[in] = i;  // 生产数据
        printf("Produced: %d\n", i);
        in = (in + 1) % BUFFER_SIZE;
        pthread_mutex_unlock(&mutex);  // 解锁
        sem_post(&full_slots);  // 增加满槽
    }
    return NULL;
}

void *consumer(void *arg) {
    for (int i = 1; i <= 10; i++) {
        sem_wait(&full_slots);  // 等待有满槽
        pthread_mutex_lock(&mutex);  // 加锁
        int item = buffer[out];  // 消费数据
        printf("Consumed: %d\n", item);
        out = (out + 1) % BUFFER_SIZE;
        pthread_mutex_unlock(&mutex);  // 解锁
        sem_post(&empty_slots);  // 增加空槽
    }
    return NULL;
}

int main() {
    pthread_t prod, cons;

    sem_init(&empty_slots, 0, BUFFER_SIZE);
    sem_init(&full_slots, 0, 0);
    pthread_mutex_init(&mutex, NULL);

    pthread_create(&prod, NULL, producer, NULL);
    pthread_create(&cons, NULL, consumer, NULL);

    pthread_join(prod, NULL);
    pthread_join(cons, NULL);

    sem_destroy(&empty_slots);
    sem_destroy(&full_slots);
    pthread_mutex_destroy(&mutex);

    return 0;
}
```

# 进程同步准则

同步机制准则是设计多进程或多线程同步时需要遵循的一组基本原则。这些准则确保并发系统能够正确、安全地执行，避免死锁、资源竞争或数据不一致等问题。

- 互斥：只允许一个进程或线程在同一时刻访问临界资源，确保数据一致性，避免并发修改引发冲突。
- 进程间推进：系统应确保进程能够继续推进，不能因缺乏进程协调机制而无限等待，避免长时间阻塞或饿死问题。
- 有限等待：每个进程在尝试进入临界区时，必须在有限时间内成功进入。防止出现饥饿现象（某些进程被长期阻止而无法访问资源）。
- 让权等待：如果一个进程无法进入临界区，它应立即释放 CPU，让其他进程执行，避免无意义的忙等（Busy Waiting）。

# 信号量

信号量（Semaphore）是一种用于解决多进程或多线程间同步与互斥问题的重要机制。它是一个整型计数器，能够用来控制对共享资源的访问，并防止数据竞争。

- P 操作（Wait 操作）检查信号量值是否大于 0。如果大于 0，则减 1；否则，阻塞当前进程或线程。常用于线程请求资源时减少信号量。
- V 操作（Signal 操作）增加信号量值。如果有线程因信号量为 0 而阻塞，则唤醒一个线程。常用于释放资源时增加信号量。

信号量的类型：

- 二值信号量（Binary Semaphore）：信号量的值只能是 0 或 1，类似于互斥锁，用于实现互斥访问。
- 计数信号量（Counting Semaphore）：信号量的值可以是任意非负整数，用于管理多个资源的分配。

```c
sem_t resources;  // 资源信号量

void *worker(void *arg) {
    sem_wait(&resources);  // 请求资源
    printf("Thread %ld acquired a resource.\n", pthread_self());
    sleep(2);  // 模拟资源使用
    printf("Thread %ld released a resource.\n", pthread_self());
    sem_post(&resources);  // 释放资源
    return NULL;
}

int main() {
    pthread_t threads[5];
    sem_init(&resources, 0, 3);  // 初始化信号量，表示有 3 个资源

    for (int i = 0; i < 5; i++) {
        pthread_create(&threads[i], NULL, worker, NULL);
    }

    for (int i = 0; i < 5; i++) {
        pthread_join(threads[i], NULL);
    }

    sem_destroy(&resources);
    return 0;
}
```

```
Thread 140071122351872 acquired a resource.
Thread 140071113959168 acquired a resource.
Thread 140071105566464 acquired a resource.
Thread 140071122351872 released a resource.
Thread 140071097173760 acquired a resource.
...
```

- 信号量初值为 3，表示可以同时分配 3 个资源。
- 每个线程获取资源时信号量减 1，释放资源时信号量加 1。
- 超过 3 个线程的请求会阻塞，直到资源释放。

# 管程

管程（Monitor）是一种高级同步机制，用于解决进程或线程间的同步与互斥问题。它将共享资源和对共享资源的操作封装在一个模块中，通过条件变量和互斥锁控制对共享资源的访问。

管程将共享资源和操作封装在一个模块内，外部线程只能通过管程提供的接口访问资源。保护了数据的完整性，简化了并发程序的设计。

管程使用条件变量实现线程之间的同步协调，同一时刻，只有一个线程能够进入管程，其他线程必须等待。

```c
#define BUFFER_SIZE 5

typedef struct {
    int buffer[BUFFER_SIZE];
    int count;
    pthread_mutex_t mutex;
    pthread_cond_t not_empty;
    pthread_cond_t not_full;
} Monitor;

Monitor monitor = {
    .count = 0,
    .mutex = PTHREAD_MUTEX_INITIALIZER,
    .not_empty = PTHREAD_COND_INITIALIZER,
    .not_full = PTHREAD_COND_INITIALIZER
};

// 生产数据
void produce(int item) {
    pthread_mutex_lock(&monitor.mutex);

    while (monitor.count == BUFFER_SIZE) {
        // 缓冲区已满，等待 not_full 条件
        pthread_cond_wait(&monitor.not_full, &monitor.mutex);
    }

    // 添加数据到缓冲区
    monitor.buffer[monitor.count++] = item;
    printf("Produced: %d\n", item);

    // 通知消费者缓冲区不为空
    pthread_cond_signal(&monitor.not_empty);

    pthread_mutex_unlock(&monitor.mutex);
}

// 消费数据
int consume() {
    pthread_mutex_lock(&monitor.mutex);

    while (monitor.count == 0) {
        // 缓冲区为空，等待 not_empty 条件
        pthread_cond_wait(&monitor.not_empty, &monitor.mutex);
    }

    // 从缓冲区读取数据
    int item = monitor.buffer[--monitor.count];
    printf("Consumed: %d\n", item);

    // 通知生产者缓冲区不满
    pthread_cond_signal(&monitor.not_full);

    pthread_mutex_unlock(&monitor.mutex);
    return item;
}

void *producer_thread(void *arg) {
    for (int i = 1; i <= 10; i++) {
        produce(i);
        sleep(1);  // 模拟生产时间
    }
    return NULL;
}

void *consumer_thread(void *arg) {
    for (int i = 1; i <= 10; i++) {
        consume();
        sleep(2);  // 模拟消费时间
    }
    return NULL;
}

int main() {
    pthread_t producer, consumer;

    pthread_create(&producer, NULL, producer_thread, NULL);
    pthread_create(&consumer, NULL, consumer_thread, NULL);

    pthread_join(producer, NULL);
    pthread_join(consumer, NULL);

    return 0;
}
```

- pthread_mutex_lock 确保对缓冲区的访问是互斥的。
- 使用条件变量 pthread_cond_wait 和 pthread_cond_signal 实现生产者和消费者的同步。
  - 当缓冲区为空时，消费者等待 not_empty 条件。
  - 当缓冲区已满时，生产者等待 not_full 条件。

# 线程

线程是操作系统调度的基本单位，线程是属于进程的一个执行单元，一个进程可以包含多个线程，多个线程共享同一个进程的地址空间和资源（如文件描述符、全局变量、堆内存等），但每个线程有自己独立的栈和寄存器。

线程 和 进程 的对比：

- 每个进程有独立的资源，创建和销毁进程的开销高。
- 同一进程内的多个线程共享内存空间和资源，线程之间通信的代价低，创建、切换和销毁开销小。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501011903501.png)

# 内核线程

KST（Kernel-Level Thread）是由操作系统内核直接管理的线程，内核负责线程的创建、调度、切换，以及与硬件资源（如 CPU）的交互，每个 KST 由内核维护相应的数据结构（如线程控制块 TCB）。

KST 的调度由操作系统内核完成，内核对线程是可见的，内核可以直接调度线程，同一进程中的线程可以分配到不同的 CPU 核心上运行，实现并行。

KST 的创建、切换和销毁都需要系统调用，开销较大。如果一个线程执行了阻塞操作（如 I/O 操作），内核可以将其他线程继续调度运行。

---

**示例：KST 的使用**

在 Linux 中，POSIX 线程（pthread）是通过内核级线程实现的，每个 pthread 都是一个独立的 KST，由内核调度。

```c
void* thread_function(void* arg) {
    printf("Thread ID: %ld, PID: %d\n", pthread_self(), getpid());
    sleep(2); // 模拟线程的执行任务
    return NULL;
}

int main() {
    pthread_t thread1, thread2;

    // 创建两个线程
    pthread_create(&thread1, NULL, thread_function, NULL);
    pthread_create(&thread2, NULL, thread_function, NULL);

    // 等待线程完成
    pthread_join(thread1, NULL);
    pthread_join(thread2, NULL);

    printf("Main thread completed.\n");
    return 0;
}
```

# 内核线程实现

线程 涉及到 线程管理 和 调度机制 的实现。在底层，内核通过维护线程的数据结构、使用调度算法、管理线程的生命周期等实现对内核级线程的支持。

- TCB（Thread Control Block，线程控制块）：每个线程都有一个独立的 TCB，存储线程的运行状态（如寄存器上下文、栈指针等）。
- PCB（Process Control Block，进程控制块）：KST 通常与 PCB 配合实现，因为一个进程可以包含多个线程。

内核调度器通过 TCB 对线程进行管理，支持线程的创建、切换和销毁。根据调度策略（如时间片轮转、优先级等）对线程进行分配和运行。

在 Linux 内核中，每个线程和进程都用一个 task_struct 数据结构表示，它们的区别主要体现在 标志位（flags） 和 资源共享情况 上。

```c
struct task_struct {
    pid_t pid;                     // 进程/线程的唯一标识
    unsigned long state;           // 任务的当前状态（运行、阻塞等）
    unsigned int priority;         // 线程的优先级
    struct mm_struct *mm;          // 内存空间（线程共享，进程独立）
    struct thread_struct thread;   // 硬件上下文（寄存器、栈指针等）
    struct list_head tasks;        // 线程链表，用于调度器管理
    struct files_struct *files;    // 文件描述符表（线程共享）
};
```

Linux 使用 clone() 系统调用实现线程的创建。

```c
long do_fork(unsigned long clone_flags, unsigned long stack_start) {
    struct task_struct *p;

    // 1. 分配新的 task_struct（线程控制块）
    p = allocate_task_struct();

    // 2. 复制当前线程的上下文到新线程
    copy_process(p, clone_flags, stack_start);

    // 3. 将新线程加入调度器
    wake_up_new_task(p);

    return p->pid;
}
```

clone() 提供了多个标志位，用于指定线程共享的资源。

- CLONE_VM：共享进程的地址空间。
- CLONE_FS：共享文件系统信息。
- CLONE_FILES：共享文件描述符表。
- CLONE_SIGHAND：共享信号处理器。
- CLONE_THREAD：标识线程而非独立进程。

每个线程都有独立的内核栈（Kernel Stack），用于保存线程运行时的上下文信息，如函数调用帧和中断处理。

- 内核栈大小通常是固定的（Linux 默认 8KB）。
- 在线程切换时，内核栈的内容会被保存，以便线程重新运行时恢复状态。

线程切换的核心逻辑实现为 switch_to()，它负责切换线程的寄存器上下文和内核栈指针。

```c
#define switch_to(prev, next) do {
    // 保存当前线程的上下文
    save_context(prev);

    // 加载新线程的上下文
    load_context(next);
} while (0)
```

调度器负责在线程之间分配 CPU 时间。Linux 使用完全公平调度器（CFS）来管理线程。

- 每个线程都有一个 虚拟运行时间（vruntime），表示该线程已经运行的时间。
- 调度器选择 vruntime 最小的线程优先运行。
- 调度器通过定时器中断触发线程切换。

```c
void schedule() {
    struct task_struct *prev = current;    // 当前线程
    struct task_struct *next = pick_next_task(); // 选择下一个线程

    if (prev != next) {
        context_switch(prev, next); // 切换线程上下文
    }
}
```

# 用户级线程

ULT 是由用户空间库（如线程库）在用户态实现的线程，操作系统内核并不知道这些线程的存在。ULT 的调度、创建、切换完全由用户态完成，不涉及系统调用，用户可以完全控制线程的行为，但实现复杂度较高。

线程调度是由用户空间的线程库完成的，切换线程无需进入内核，调度速度比 KST 快，开销更小。

由于内核只知道进程而不知道线程，ULT 无法将多个线程分配到多个 CPU 核心运行。如果一个 ULT 执行了阻塞系统调用（如 I/O 操作），整个进程都会被阻塞，其他线程无法继续运行。

---

**示例：用户级线程的使用**

ULT 通过用户态的线程库（如 libco 或 ucontext）实现，内核无法感知这些线程。

```c
ucontext_t context1, context2;

void function1() {
    printf("Function 1 running\n");
    sleep(1);
    swapcontext(&context1, &context2); // 切换到 context2
}

void function2() {
    printf("Function 2 running\n");
    sleep(1);
    swapcontext(&context2, &context1); // 切换回 context1
}

int main() {
    char stack1[1024*128];
    char stack2[1024*128];

    // 初始化上下文 context1
    getcontext(&context1);
    context1.uc_stack.ss_sp = stack1;
    context1.uc_stack.ss_size = sizeof(stack1);
    context1.uc_link = NULL;
    makecontext(&context1, function1, 0);

    // 初始化上下文 context2
    getcontext(&context2);
    context2.uc_stack.ss_sp = stack2;
    context2.uc_stack.ss_size = sizeof(stack2);
    context2.uc_link = NULL;
    makecontext(&context2, function2, 0);

    // 切换到 context1
    swapcontext(&context2, &context1);

    return 0;
}
```

# 用户线程实现

ULT 和 KST 实现原理差不多，都需要去维护 线程控制块 和 线程调度策略，只不过这一切都是在用户态实现的。

这里使用 Linux 的 ucontext 库实现一个简单的用户级线程库。

```c
#include <stdio.h>
#include <stdlib.h>
#include <ucontext.h>

#define STACK_SIZE 1024 * 64

typedef struct thread {
    ucontext_t context;      // 线程上下文
    struct thread* next;     // 下一个线程
} thread_t;

thread_t* current_thread = NULL; // 当前运行的线程
thread_t* main_thread = NULL;    // 主线程

void thread_function1() {
    printf("Thread 1: Start\n");
    for (int i = 0; i < 5; i++) {
        printf("Thread 1: %d\n", i);
        swapcontext(&current_thread->context, &current_thread->next->context);
    }
    printf("Thread 1: End\n");
}

void thread_function2() {
    printf("Thread 2: Start\n");
    for (int i = 0; i < 5; i++) {
        printf("Thread 2: %d\n", i);
        swapcontext(&current_thread->context, &current_thread->next->context);
    }
    printf("Thread 2: End\n");
}

void create_thread(thread_t** thread, void (*func)()) {
    *thread = malloc(sizeof(thread_t));
    getcontext(&(*thread)->context);

    (*thread)->context.uc_stack.ss_sp = malloc(STACK_SIZE);
    (*thread)->context.uc_stack.ss_size = STACK_SIZE;
    (*thread)->context.uc_link = NULL;

    makecontext(&(*thread)->context, func, 0);
}

int main() {
    // 创建线程 1 和线程 2
    thread_t* thread1;
    thread_t* thread2;
    create_thread(&thread1, thread_function1);
    create_thread(&thread2, thread_function2);

    // 将线程加入循环链表
    thread1->next = thread2;
    thread2->next = thread1;

    // 设置当前线程
    current_thread = thread1;

    // 运行线程
    swapcontext(&main_thread->context, &current_thread->context);

    // 清理资源
    free(thread1->context.uc_stack.ss_sp);
    free(thread1);
    free(thread2->context.uc_stack.ss_sp);
    free(thread2);

    printf("Main thread: End\n");
    return 0;
}
```

- 线程上下文：
  - 使用 ucontext_t 表示每个线程的上下文。
  - 使用 getcontext() 和 makecontext() 初始化线程上下文。
- 线程切换：
  - 使用 swapcontext() 实现线程切换。
  - 当前线程的上下文保存到 current_thread->context，切换到目标线程的上下文。
- 线程调度：
  - 使用循环链表管理线程，每次切换到下一个线程。
- 线程栈：
  - 每个线程都有独立的栈（uc_stack.ss_sp），在创建线程时分配。

# 组合线程

Linux 底层结合 KST（Kernel-Level Thread）和 ULT（User-Level Thread） 的方式通常是在内核级线程之上通过用户态线程库实现用户级线程。这样的设计允许系统充分利用 KST 的多核并行能力，同时通过 ULT 的高效用户态切换 提高性能。

- KST 提供多核能力：在多对多模型中，多个用户级线程被调度到有限的内核级线程上，内核级线程提供多核并行的支持。
- ULT 提供高效调度：ULT 的切换在用户态完成，速度快，用户态库可以自定义调度策略。
- 阻塞操作的处理：阻塞调用由 KST 负责。如果某个用户线程阻塞，调度器可以切换到另一个用户线程，不影响进程的整体运行。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501012031136.png)

---

**示例：一对一模型**

在 Linux 中，pthread 是通过 1:1 模型实现的。以下代码展示了 pthread 如何通过 KST 提供多核支持，同时结合用户态的轻量调度。

```c

void* thread_function(void* arg) {
    printf("Thread ID: %ld, PID: %d\n", pthread_self(), getpid());
    sleep(2);
    return NULL;
}

int main() {
    pthread_t thread1, thread2;

    // 创建两个用户线程，每个用户线程对应一个 KST
    pthread_create(&thread1, NULL, thread_function, NULL);
    pthread_create(&thread2, NULL, thread_function, NULL);

    // 等待线程完成
    pthread_join(thread1, NULL);
    pthread_join(thread2, NULL);

    printf("Main thread completed.\n");
    return 0;
}
```

- 每个用户线程通过 pthread_create 调用底层的 clone() 系统调用创建 KST。
- 两个线程在多核 CPU 上可以并行运行，阻塞互不干扰。

---

**示例：多对多模型**

以下示例展示了如何通过一个简单的调度器将多个 ULT 映射到少量 KST。用户线程切换在用户态完成，阻塞调用通过 KST 支持

```c
#include <pthread.h>
#include <ucontext.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#define STACK_SIZE 1024 * 64
#define MAX_ULT 4

typedef struct ult {
    ucontext_t context;      // 用户线程上下文
    struct ult* next;        // 下一个用户线程
    int id;                  // 用户线程 ID
} ult_t;

ult_t* current_ult = NULL;   // 当前运行的用户线程
ult_t* ult_list = NULL;      // 用户线程列表

// 用户线程调度器
void scheduler() {
    while (current_ult) {
        swapcontext(&current_ult->context, &current_ult->next->context);
    }
}

// 用户线程函数
void ult_function(int id) {
    for (int i = 0; i < 5; i++) {
        printf("ULT %d: %d\n", id, i);
        swapcontext(&current_ult->context, &current_ult->next->context);
    }
    printf("ULT %d completed.\n", id);
}

// 创建用户线程
void create_ult(void (*func)(int), int id) {
    ult_t* new_ult = malloc(sizeof(ult_t));
    getcontext(&new_ult->context);

    new_ult->context.uc_stack.ss_sp = malloc(STACK_SIZE);
    new_ult->context.uc_stack.ss_size = STACK_SIZE;
    new_ult->context.uc_link = NULL;
    new_ult->id = id;

    makecontext(&new_ult->context, (void (*)(void))func, 1, id);

    // 加入用户线程链表
    if (!ult_list) {
        ult_list = new_ult;
        new_ult->next = new_ult;
    } else {
        new_ult->next = ult_list->next;
        ult_list->next = new_ult;
    }
    current_ult = new_ult;
}

void* kst_function(void* arg) {
    scheduler();
    return NULL;
}

int main() {
    // 创建 4 个用户线程
    for (int i = 1; i <= MAX_ULT; i++) {
        create_ult(ult_function, i);
    }

    // 创建 2 个内核级线程，每个运行一个调度器
    pthread_t kst1, kst2;
    pthread_create(&kst1, NULL, kst_function, NULL);
    pthread_create(&kst2, NULL, kst_function, NULL);

    pthread_join(kst1, NULL);
    pthread_join(kst2, NULL);

    printf("All threads completed.\n");
    return 0;
}
```

# 作业

作业是用户提交给操作系统的一组任务，可能包含程序、数据以及运行指令，作业的目的是完成某种特定的计算或任务，如数据处理、科学计算、文件打印等。作业的粒度较大，一个作业可能包含多个进程（进程是作业的一个子单位）。

作业控制块是操作系统为每个作业维护的一个数据结构，用于存储作业的相关信息。它是操作系统调度、管理和跟踪作业状态的核心工具。

作业控制块通常包含以下信息：

- 作业标识符：唯一标识作业的 ID。
- 作业状态：如“等待调度”、“运行中”或“完成”。
- 优先级：作业的执行优先级。
- 资源需求：所需的 CPU、内存、I/O 设备等资源信息。
- 运行时间信息：预计运行时间、已经运行时间。
- 作业队列位置：作业在调度队列中的位置。
- 作业结果存储位置：如输出文件路径或终端。

# 调度算法

调度算法的共同目标：

- 提供高效性：最大化吞吐量和处理器利用率。
- 提供用户满意度：降低等待时间和响应时间。
- 提供公平性：确保所有任务都能获得合理的资源分配。
- 提供稳定性：在各种负载下保持高效运行。

---

先来先服务（FCFS）：队列中第一个进程先获得 CPU。

- 例子：队列中有 P1、P2、P3，P1 执行完后依次执行 P2 和 P3。

最短作业优先（SJF）：CPU 选择剩余执行时间最短的进程。

- 例子：队列中有 P1（执行时间 10ms）、P2（执行时间 5ms）、P3（执行时间 2ms），P3 会被最先调度。

优先级调度（Priority Scheduling）：按优先级最高的任务调度，优先级低的任务可能等待。

- 例子：P1（优先级 3）、P2（优先级 1）、P3（优先级 2），P2 会先执行。

高响应比优先（HRRN）：计算每个作业的响应比，优先调度响应比最高的作业。

- 响应比 = (作业处理时间 + 作业等待时间) / 作业处理时间

时间片轮转（Round Robin）：每个进程分配固定时间片，时间片耗尽后切换到下一个进程。

- 例子：时间片为 4ms，队列中有 P1（10ms）、P2（6ms）、P3（4ms）。调度顺序为 P1 → P2 → P3 → P1 → P2。

多级反馈队列调度：进程根据执行情况在不同优先级队列中调整。

- 系统维护多个优先级队列，每个队列对应不同的时间片长度。
  - 高优先级队列分配较短的时间片。
  - 低优先级队列分配较长的时间片。
- 新进程总是从最高优先级队列开始执行。
  - 如果一个进程用完了分配的时间片但没有完成，则被移动到更低优先级的队列。
  - 如果一个进程在低优先级队列中等待时间过长，可能会被提升到更高优先级队列（避免饥饿问题）。
  - 空闲时优先处理高优先级队列中的任务。

保证调度：根据任务的需求，合理分配 CPU 时间，以确保所有任务都能按时完成。

- 先对 n 个任务进行可调度性测试验证（一个公示计算），确保保证所有任务按时完成。
- 使用最早截止时间优先算法调度任务，对任务进行排序和分配，保证所有任务在其截止时间内完成

多队列调度算法：可以在不同的 CPU 核心上分别运行不同的调度算法。

- 系统将所有进程按照优先级、类型或需求划分到不同的队列，例如：
  - 高优先级队列用于交互任务。
  - 中优先级队列用于普通批处理任务。
  - 低优先级队列用于后台计算任务。
- 每个队列可以使用不同的调度算法，例如：
  - 高优先级队列： 使用抢占式短任务优先算法，确保交互任务快速响应。
  - 中优先级队列： 使用时间片轮转算法，保证所有任务公平分配 CPU 时间。
  - 低优先级队列： 使用先到先服务（FCFS）或批量调度算法，最大化吞吐量。
- 在多核环境下，不同的队列可以绑定到不同的 CPU 核心，每个核心运行不同的调度算法。例如：
  - 核心 1 运行高优先级任务（使用实时调度算法）。
  - 核心 2 运行中优先级任务（使用时间片轮转）。
  - 核心 3 运行低优先级任务（使用批处理调度）。

# 处理机调度

处理机调度（CPU scheduling）是操作系统的重要功能，用于分配 CPU 资源给各种任务。

- 长程调度：控制系统中创建频率，同时运行的进程数量，以维持系统的平衡负载。
  - 在批处理系统中，操作系统决定从输入队列中选择哪些作业进入内存，成为可执行进程。
  - 如果有大量 IO 密集型和计算密集型任务，长程调度器会选择一部分 IO 密集型任务和一部分计算密集型任务，从而平衡系统性能。
- 中程调度：通过挂起或恢复进程，优化 CPU 和内存的使用。
  - 当内存不足时，中程调度器将某些低优先级的进程挂起，将它们移出内存（换页到磁盘）。
  - 当资源充足时，挂起的进程会被恢复，并重新加载到内存中继续运行。
- 短程调度：短程调度是核心任务，即决定哪个进程可以获得 CPU，并将其切换到运行状态。其主要依据是调度算法。

# 作业调度

作业调度是操作系统的重要功能，用于管理作业的生命周期，从作业提交到完成的全过程。作业调度决定了哪些作业可以进入系统并占用资源，例如 CPU、内存和 I/O 设备。

- 长程调度：决定哪些作业可以加载到内存进入系统，成为可执行作业，平衡系统负载，控制进入系统的作业数量。
- 中程调度：通过挂起和恢复作业，动态调整内存和资源的分配，优化资源使用。
  - 在内存不足时挂起某些作业，将它们换页到磁盘。
- 短程调度：确定哪个作业的进程可以获得 CPU。
  - 在多任务环境中，轮流分配 CPU 给各个作业的进程。

# 进程调度

进程调度是操作系统的核心功能之一，用于管理在系统中运行的进程，决定哪个进程可以使用 CPU 和其他资源。以下通过详细解释和举例来说明进程调度的本质、分类和实际应用。

- 长程调度：决定哪些进程可以进入就绪队列，控制系统中并发进程的数量，平衡系统负载，避免过载或资源闲置。
- 中程调度：通过挂起或恢复进程，优化内存和 CPU 使用率。
- 短程调度：决定哪个就绪进程可以使用 CPU，并切换到运行状态，最大化 CPU 使用率，最小化等待时间和响应时间。

进程调度和处理机调度是紧密相关的概念，甚至在许多情况下可以被认为是同一过程的不同表述。然而，二者实际上有细微的差别，尤其是在描述它们的层次和目标时。

- 进程调度：更广义的概念，包含所有与进程管理和资源分配相关的调度工作，包括内存、I/O 设备、CPU 等资源。
- 处理机调度：进程调度的一个子集，专门指分配 CPU 给就绪队列中的进程的过程。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501021413128.png)

进程调度方式可以根据是否允许进程被强制中断分为 抢占式调度 和 非抢占式调度 两种。

- 抢占式调度：CPU 分配给某个进程后，如果有更高优先级或更紧急的任务到达，可以强制中断当前进程并切换到新任务。
  - 提高系统响应时间，适合实时任务，但上下文切换开销较大。
- 非抢占式调度：一旦 CPU 被分配给某个进程，进程将一直运行到完成或进入等待状态（如等待 IO），其他进程需要等待，直到当前进程释放 CPU。
  - 更简单，但可能导致长任务占用 CPU，导致其他任务长期等待。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501021440756.png)

# 实时调度

实时调度（Real-Time Scheduling）是为满足实时应用的严格时间约束而设计的调度机制。它的目标是确保任务在确定的时间限制内完成，而不是仅仅追求高吞吐量或资源利用率。

- 硬实时调度：任务必须在截止时间（Deadline）之前完成，否则后果严重（如物理系统崩溃或设备损坏）。
  - 例如：火箭控制系统、心脏起搏器。
- 软实时调度：尽可能满足任务的时间约束，但允许偶尔的超时（不会造成严重后果）。
  - 例如：视频播放（延迟可能导致卡顿，但不会致命）。




