### Two Phase Commit 介绍

Two Phase Commit (2PC) 是一种原子提交协议, 是 MySQL 对分布式事务的 XA Mode 的实现, 用于协调参与分布式原子事务的所有进程, 决定提交或回滚, 该协议在许多临时系统失败的情况下依然能实现其目标, 因此得到了广泛的使用. 然而, 两阶段提交协议并不能抵御所有可能的失败配置, 在极少数情况下, 需要人工干预来纠正结果, 为了从失败中恢复 (大部分情况下是自动的), 协议的参与者使用日志记录协议的状态

Two Phase Commit 由两个阶段组成, 如果这两个阶段的数据不一致, 则会进行回滚, 保证数据一致性

- Prepare Phase: TC 通知 RM 去执行修改操作, RM 先记录 Undo Log, 接着执行修改操作, 再记录 Redo Log, RM 通知 TC 是否执行完毕
- Commit Phase: TC 根据 RM 的响应结果进行处理, 如果都是 Ready, 则 TC 通知 RM 进行 Commit, 如果有 Fail, 则 TC 通知 RM 进行 Rollback

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403091222615.png)

Two Phase Commit 缺点

- 同步阻塞问题: 在二阶段提交协议中, 所有参与者在等待协调者的决定阶段都处于阻塞状态, 无法进行其它操作
- 单点故障: 如果在二阶段提交过程中, 协调者出现故障, 会导致所有参与者一直等待, 不能进行其它操作
- 数据不一致: 如果 RM 接收到 Prepare 请求后, 未发送 ACK 确认就宕机, 而在此之后其它 RM 都发送了 ACK 确认, 则此时 TC 将发起 Commit 请求, 导致数据状态不一致

### Three Phase Commit 介绍

Three Phase Commit (3PC) 对 Two Phase Commit 进行了优化, 引入了 Timeout 和 CanCommit Phase, 以避免阻塞和单点故障问题

- CanCommit Phase: TC 向所有 RM 发送 CanCommit 请求询问是否可以提交事务, RM 返回 Yes / No
- PreCommit Phase: 如果所有 RM 都返回 Yes, TC 向 RM 发送 PreCommit 请求, 接收到请求的 RM 表示接受 TC 的决定, 并回复 ACK
- doCommit Phase: TC 收到 RM 的 ACK 后, 向所有 RM 发送 doCommit 请求, RM 接受到请求后进行真正的事务提交并回复 ACK

Three Phase Commit 的任一阶段, 只要有 RM 回复 No 或者超时未回复, TC 都会向所有 RM 发送 Abort 请求, 所有 RM 在执行完事务的回滚操作后回复 ACK

Three Phase Commit 中的 TC 出现单点故障, 无法通知 RM 进行提交, 则 RM 会在等待一段时间后自动提交事务, 但是这也会导致一些问题. 如果某一个 RM 出现异常, 返回了 No, 刚好此时 TC 单点故障, 则会导致其他 RM 超时后自动提交, 造成不一致

Three Phase Commit 虽然解决了 Two Phase 的一些问题, 但是增加了一次网络往返, 而且在处理网络分区和多数故障的情况下, Three Phase Commit 也无法保证一致性, 当前实际使用中更常见的是使用具有超时和故障恢复机制的 Two Phase Commit (eg: Paxos, Raft)

