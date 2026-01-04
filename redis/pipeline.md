# Pipeline

PIPELINE 是 Redis 提供的 Batch Operation, 可以将多个命令一次性发送给 Server, Server 通过 Queue 保证命令顺序, 按顺序执行所有命令, 并将结果一次性返回给 Client, 避免每执行完一条命令就返回一次结果来减少网络开销

PIPELINE 不保证原子性, 执行命令遇到异常, 会继续执行后续的命令, 当命令过多时, 可能引起较大的网络延迟, CPU 也有一定消耗, 需要对每一个命令进行单独解析和执

PIPELINE VS MSET

- PIPELINE 是 Non Atomic, MSET 是 Atomic
- MSET 和 PIPELINE 执行命令不会被插队, 一旦开始执行, 就会连续执行到结束, 中间不会插入其他命令
- PIPELINE 可以执行多类型命令, MSET 只能执行单类型命令

PIPELINE VS Transaction

- PIPELINE 是 Non Atomic, Transaction 是 Atomic
- PIPELINE 不会堵塞其他命令, Transaction 会堵塞其他命令

Set command file (file. cmd.txt)

```shell
set k1 100
set k2 200
set k3 300
```

Execute command file by pipeline

```shell
cat ./redis-test | redis-cli -h 192.168.10.11 -p 6379 -a 111 --pipe
```

