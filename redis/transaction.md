# exec transaction

```shell
multi
set k1 "v1"
set k2 "v2"
set k3 "v3"
exec
```

# discard transaction

```shell
multi
set k1 "v1"
set k2 "v2"
set k3 "v3"
discard
```

# exec errors

if errors before `exec`, then all commands will exec fail

```shell
multi
set k1 "v1"
set k2 "v2"
set k3 # Redis recongnize the error before exec
exec
```

if errrors after `exec`, then the error command will exec fail

```shell
multi
set k1 "v1"
set k2 "v2"
incr k1 # Redis did not recognize the error before exec
exec
```

# CAS watch

```shell
set k1 100

watch k1 

# somebody change k1 to 300 during this Transaction
multi # OK
set k1 200 # QUEUED
exec # nil

get k1 # 300
```

# CAS unwatch

```shell
set k1 100

watch k1

unwatch k1

# somebody change k1 to 300 during this Transaction
multi # OK
set k1 200 # QUEUED
exec # OK

get k1 # 200
```

# transaction point

Redis transaction info

- 一次 transaction 中, 存储 multi command 到 queue 中, 序列化 command, 按顺序执行 command, 不会被其他 command 插入

Redis transaction feature

- 单独 isolation operation, 没有 isolation level, 只能决定是否执行全部 command, 没有 fallback function

CAS info

- 一种 optimistic lock, 通过 `watch` 监控 data, 如果 data 被人修改, 本次 operation 失效
