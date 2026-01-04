# Install Redis by Docker

pull Redis

```shell
docker image pull redis:7.2
```

startup Redis

```shell
docker container run \
    --name redis \
    --network global \
    --privileged \
    -p 6379:6379 \
    -p 16379:16379 \
    -d redis:7.2
```

client connection

```shell
docker container exec -it redis redis-cli -h 127.0.0.1 -p 6379
```

connect client with support of chinese

```shell
docker container exec -it redis redis-cli -h 127.0.0.1 -p 6379 -a 111 --raw
```

---

configure Redis by config file (file: config/redis.conf)

```shell
docker exec -it redis bash
```

```shell
vim /usr/local/etc/redis/redis.conf
```

```shell
# run as a daemon in background
daemonize no

# disable protected mode
protected-mode no

# disable bind to allow remote connection
# bind 127.0.0.1 -::1

# SET password
requirepass 111

# persistent storage
appendonly yes
```

restart redis server

```shell
docker restart redis
```

client connection

```shell
redis-cli -h 127.0.0.1 -p 6379 -a 111
```

shutdown Redis in local

```shell
redis-cli shutdown
```

shutdown Redis in remote 

```shell
redis-cli -h 127.0.0.1 -p 6379 -a 111 shutdown
```

create user

```
ACL SETUSER root +@all  on >111 ~*
ACL SETUSER harvey +@all -@admin on >111 ~*
ACL SETUSER bruce +@read +@write +@keyspace +ping on >111 ~*
```

# Install Redis by manual

install Redis

```shell
curl -LJO https://github.com/redis/redis/archive/refs/tags/7.2.0.zip

unzip redis-7.2.0.zip && cd redis-7.2.0

sudo make

sudo make install
```

check Redis version

```shell
redis-server -v
```

SET config (file: redis.conf)

```shell
# run as a daemon in background
daemonize yes

# disable protected mode
protected-mode no

# disable bind to allow remote connection
# bind 127.0.0.1 -::1

# SET password
requirepass 111
```

SET memory

```shell
sysctl vm.overcommit_memory=1
```

start Redis

```shell
redis-server
```

start Redis with specify config

```shell
redis-server ./config/redis.conf
```

client connection

```shell
redis-cli -h 127.0.0.1 -p 6379 -a 111
```

uninstall Redis

```shell
rm -rf /usr/local/bin/redis-*
```

# Basic Operation

```
# select DB10
select 10

# move k1 to DB10
move k1 10

# count data size in current DB
dbsize

keys my*

exists k1

type k1

del k1

# delete with no blocking
unlink k1

ttl k1

# clear current DB
flushdb

# clear DB asynchronously
flushdb async

# clear all DB
flushall

help @string
```

# String Operation

## SET, GET

```
SET k1 "hello world"

GET k1

# GET old value, and then SET new value
SET k1 "hello world" GET
```

## NX, XX, EX, PX, EXAT, KEEPTTL

```
# if Field does not exist, SET Field 
SET k1 "hello world" NX

# if Field exist, SET Field
SET k1 "hello world" XX

# expired in 60s
SET k1 "hello world" EX 60

SET k1 "hello world" EX 10 NX

# expired in 60ms
SET k1 "hello world" PX 60

# expired at 1693726772 (unix time stamp)
SET k1 "hello world" EXAT 1693726772

# modify value and inherit the rest of ttl
SET k1 "hello world" KEEPTTL
```

## MSET, MGET

```
MSET k1 "sun" k2 "xue" k3 "cheng"

MGET k1 k2 k3
```

## SETRANGE, GETRANGE

```
SET k1 "hello world"

GETRANGE k1 1 3 # "ell"

GETRANGE k1 0 -1 # "hello world"

SETRANGE k1 1 "..." # k1: "h...o world"
```

## INCR, DECR

```
SET k1 10

# increment 1
INCR k1

# increment 5
INCR k1 5

# decrement 1
DECR k1

# decrement 5
DECR k1 5
```

## STRLEN, APPEND

```
SET k1 "hello world"

STRLEN k1 # 11

APPEND k1 " !!!" # k1: "hello world !!!"
```

# List Operation

## LPUSH, LPOP, RPUSH, RPOP

```
LPUSH k1 "sun" "xue" "cheng"

LPOP k1

LPOP k1 3

RPUSH k1 "sun" "xue" "cheng"

RPOP k1 3
```

## LRANGE

```
LPUSH k1 "a" "b" "c" "d" "e"

LRANGE k1 0 2 # k1: {"e", "d", "c"}

LRANGE k1 0 -1 # k1: {"e", "d", "c", "b", "a"}
```

## LINDEX

```
LPUSH k1 "sun" "xue" "cheng"

LINDEX k1 0 # "cheng"
LINDEX k1 1 # "xue"
```

## LLEN

```
LLEN k1
```

## LREM

```
LPUSH k1 "a" "a" "a" "a" "a" "b" "c"

# LREM key count element
LREM k1 4 "a" # k1: {"a", "b", "c"}
```

## LTRIM

```
LPUSH k1 "a" "b" "c" "d" "e"

# LREM key count element
LTRIM k1 1 3 # k1: {"d", "c", "b"}
```

## RPOPLPUSH

```
LPUSH k1 "a" "b"
LPUSH k2 "c" "d"

RPOPLPUSH k1 k2 # k1: {"a"}, k2: {"b", "c", "d"}
```

## LSET

```
LPUSH k1 "a" "b" "c"

LSET k1 1 "B" # k1: {"a", "B", "c"}
```

## LINSERT

```
LPUSH k1 "a" "b" "c"

LINSERT k1 before "b" "|" # k1: {"a", "|", "b", "c"}

LINSERT k2 after "b" "|" # k1: {"a", "|", "b", "|", "c"}
```

# Hash Operation

## HSET, HGET, HDEL

```
HSET user name "sun"

HGET user name

HDEL user name
```

## HGETALL HKEYS, HVALS

```
# GET all key and all value
HGETALL user

# GET all key
HKEYS user

# GET all value
HVALS user
```

## HLEN

```
HLEN user
```

## HEXISTS

```
HEXISTS user age
```

## HINCRBY, HINCRBYFLOAT

```
HINCRBY user age

HINCRBY user age 5

HINCRBYFLOAT user score

HINCRBYFLOAT user score 5.0
```

# SET Operation

## SADD, SREM

```
# auto remove repetitive elements
SADD k1 "a" "b" "c" "d" "e"

SREM k1 "b" # k1: {"a", "c", "d", "e"}

# delete in random
SPOP k1 1
```

## SISMEMBER, SMEMBERS, SRANDMEMBERS

```
SISMEMBER k1 'a'

# GET all value
SMEMBERS k1 # {"a", "b", "c"}

# GET 1 element at random
SRANDMEMBER k1
```

## SCARD

```
# GET length
SCARD k1
```

## SMOVE

```
SADD k1 "a" "b" "c"

SADD k2 "a" "b"

SMOVE k1 k2 # k1: {"a", "b"}, k2: {"a", "b", "c"}
```

## SDIFF, SINTER, SUNION, SINTERCARD

```
SADD k1 "a" "b" "c"
SADD k2 "b" "c" "d"

SDIFF k1 k2 # {"a"}

SUNION k1 k2 # {"a", "b", "c", "d"}

SINTER k1 k2 # {"b", "c"}

# The number of inter result
SINTERCARD 2 k1 k2
```

# ZSET Operation

## ZADD, ZREM, ZSCORE, ZMPOP

```
ZADD k1 10 "sun" 20 "xue" 30 "cheng"

ZREM k1

# GET score
ZSCORE k1 "sun"

# pop 3 element that socre is lowest
zmpop 1 k1 min count 3
```

## ZRANGE, ZREVRANGE

```
ZRANGE k1 0 5

ZRANGE k1 0 -1

ZRANGE k1 0 5 WITHSCORES

ZRANGEBYSCOER k1 10 30

ZRANGEBYSCOER k1 10 30 WITHSCORES

ZRANGEBYSCORE k1 10 30 WITHSCORES LIMIT 1 2

ZREVRANGE k1 0 5

ZREVRANGEBYSCORE k1 30 10 WITHSCORES LIMIT 1 2
```

## ZCOUNT

```
# GET values that score between 10 and 50
ZCOUNT k1 10 50
```

## ZCARD

```
ZCARD k1
```

## ZINCRBY

```
ZINCRBY k1 5 "sun"
```

# Bitmap Operation

## SETBIT, GETBIT

```
SETBIT k1 3 1

GETBIT k1 3

# Find the position of the first 0
BITPOS k1 0
# Find the position of the first 1
BITPOS k1 1
``` 

## STRLEN

```
SETBIT k1 0 1
SETBIT k1 1 1
SETBIT k1 2 1
SETBIT k1 3 1
SETBIT k1 4 1
SETBIT k1 5 1
SETBIT k1 6 1
SETBIT k1 7 1

STRLEN k1 # 1

SETBIT k1 8 1

STRLEN k1 # 2
```

## BITCOUNT

```
SETBIT k1 0 1
SETBIT k1 1 1
SETBIT k1 2 1
SETBIT k1 3 0
SETBIT k1 4 0

# count 1
BITCOUNT k1 # 3
```

## BITOP

```
SETBIT k1 0 1
SETBIT k1 1 1
SETBIT k1 2 1
SETBIT k1 3 1

SETBIT k2 0 1
SETBIT k2 1 0
SETBIT k2 2 0
SETBIT k2 3 0

# and operation
bitop and k3 k1 k2
BITCOUNT k3 # 1

# or operation
BITOP or k3 k1 k2
BITCOUNT k3 # 4

# xor operation
BITOP xor k3 k1 k2
BITCOUNT k3 # 3
```

## BITFIELD

```
BITFIELD key [GET type offset] [SET type offset value] [INCRBY type offset increment] [OVERFLOW WRAP|SAT|FAIL]

SETBIT k1 0 1
SETBIT k1 1 1
SETBIT k1 2 1

# 从 offset [0, 8) 的无符号数, 这里的 "00000111", 取出的是 "11100000" 的十进制数, 非常操蛋
BITFIELD k1 GET u8 0

# 设置 offset [16, 24) 的有符号数位 120 ("x")
SET k1 "hello world"
BITFIELD k1 SET i8 16 120 # k1: "hexlo world"

# WRAP (def): 超过位字段的最大范围后重新从最小值开始
BITFIELD k1 SET i8 0 127 OVERFLOW WRAP # k1: 127
BITFIELD k1 SET i8 0 128 OVERFLOW WRAP # k1: -128
BITFIELD k1 SET i8 0 129 OVERFLOW WRAP # k1: -127
BITFIELD k1 SET i8 0 130 OVERFLOW WRAP # k1: -126

# SAT: 超过位字段的最大或最小范围的值会被截断为最大或最小值
BITFIELD k1 OVERFLOW SAT SET i8 0 300 # k1: 127
BITFIELD k1 OVERFLOW SAT SET i8 0 -300 # k1: -128
BITFIELD k1 OVERFLOW SAT SET u8 0 300 # k1: 255

# FAIL: 直接操作失败
BITFIELD k1 OVERFLOW FAIL SET i8 0 300 # (nil)
```

# HyperLogLog Operation

HasHSET 和 Bitmap 在处理 BigData 的去重时, 有着各种各样的问题.

HyperLogLog 只进行去重的基数统计, 不存储数据, 采用 Probability AlgoritHMGET, 牺牲准确率换取空间, 通过一定的概率统计方法预估基数值, 保证误差在一定范围内.

## PFADD

```
PFADD k1 "a" "b" "c"
```

## PFCOUNT

```
PFADD k1 "a" "a" "a" "b" "b" "c"

PFCOUNT k1 # 3
```

## PFMERGE

```
PFADD k1 "a" "b" "c"
PFADD k2 "b" "c" "d"

PFMERGE k3 k1 k2

PFCOUNT k3 # 4
```
 
# GEO Operation

## GEOADD, GEOPOS, GEOHASH, GEODIST

```
GEOADD city 119.4127 32.3936 "YZ" 120.5832 31.2983 "SZ"

GEOPOS city "YZ"

GEOHASH city "YZ"

GEODIST city "YZ" "SZ" # "164534.1622"
GEODIST city "YZ" "SZ" KM # "164.5342"
```

## GEORADIUS, GEORADIUSBYMEMBER, GEOSEARCH

```
GEORADIUS city 120.0000 32.0000 100 KM

GEORADIUS city 120.0000 32.0000 100 KM WITHDIST WITHCOORD WITHHASH COUNT 10 DESC

GEORADIUSBYMEMBER city "YZ" 100 KM WITHDIST WITHCOORD WITHHASH COUNT 10 DESC

GEOSEARCH city FROMLONLAT 120.0000 32.0000 BYRADIUS 100 KM WITHDIST DESC
```

