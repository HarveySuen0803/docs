# Seata

Seata 是分布式事务的一种解决方案, 提供了 XA, AT, TCC 三种模式

Seata 全局管理事务中三个重要的角色

- TC (Transaction Coordinator): 维护全局和分支事务的状态, 协调全局事务的提交和回滚
- TM (Transaction Manager): 定义全局事务的范围, 开启全局事务, 提交全局事务, 回滚全局事务
- RM (Resource Manager): 管理分支事务, 注册分支事务, 报告分支事务状态, 驱动分支事务提交和回滚

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401221833065.png)

# Seata Server

pull image

```shell
docker image pull seataio/seata-server:1.5.2
```

startup container

```shell
docker container run \
    --name seata \
    -p 8091:8091 \
    -p 7091:7091 \
    -e STORE_MODE=db \
    -v seata-resources:/seata-server/resources \
    -d seataio/seata-server:1.5.2
```

set Seata to connect to Nacos (file: resources/application.yml)

```yml
seata:
  config:
    type: nacos
    nacos:
      server-addr: 127.0.0.1:8848
      group: DEFAULT_GROUP
      username: nacos
      password: nacos
      data-id: seata-server.properties
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      group: DEFAULT_GROUP
      cluster: default
      username: nacos
      password: nacos
```

set Seata to connect to MySQL (file: nacos/DEFAULT_GROUP/seata-server.properties)

```properties
store.mode=db
store.lock.mode=db
store.session.mode=db

store.db.datasource=druid
store.db.dbType=mysql
store.db.driverClassName=com.mysql.cj.jdbc.Driver
store.db.url=jdbc:mysql://127.0.0.1:3306/seata?useSSL=false&useUnicode=true&rewriteBatchedStatements=true
store.db.user=root
store.db.password=111
store.db.minConn=5
store.db.maxConn=30
store.db.globalTable=global_table
store.db.branchTable=branch_table
store.db.distributedLockTable=distributed_lock
store.db.lockTable=lock_table
store.db.queryLimit=100
store.db.maxWait=5000

server.undo.logSaveDays=7
server.undo.logDeletePeriod=86400000
server.maxCommitRetryTimeout=-1
server.maxRollbackRetryTimeout=-1
server.recovery.committingRetryPeriod=1000
server.recovery.asynCommittingRetryPeriod=1000
server.recovery.rollbackingRetryPeriod=1000
server.recovery.timeoutRetryPeriod=1000
```

create table

```shell
curl -LJO https://raw.githubusercontent.com/apache/incubator-seata/develop/script/server/db/mysql.sql
```

```sql
create database seata;

use seata;

source /Users/HarveySuen/Downloads/mysql.sql;
```

access http://127.0.0.1:7091 (username: seata, password: seata)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403092232910.png)

# Seata Client

import dependency

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
```

set Nacos profile to connect to Seata server

```txt
Data ID: seata-server.properties
Group: DEFAULT_GROUP
```

```properties
seata.registry.type=nacos
seata.registry.nacos.server-addr=127.0.0.1:8848
seata.registry.nacos.namespace=public
seata.registry.nacos.group=DEFAULT_GROUP
seata.registry.nacos.application=seata-server
seata.registry.nacos.username=nacos
seata.registry.nacos.password=nacos
seata.tx-service-group=seata-demo
seata.service.vgroup-mapping.seata-demo=default
```

# XA Mode

XA Mode 属于 CP Mode, 一致性较强, 性能较差, 其实 MySQL 已经通过 2PC 实现了 XA, Seata 对 MySQL 的实现又做了进一步的封装

TM 通知 TC 开启 Global Transaction, TM 调用 RM 向 TC 注册 Branch Transaction, 执行 SQL, 报告 Transaction State

TM 通知 TC 执行 Commit 或 Rollback, TC 检查 Branch Transaction State, 通知 RM 执行 Commit 或 Rollback

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753970.png)

enable XA standard

```properties
seata.data-source-proxy-mode=XA
```

enable Seata Global Transaction

```java
@GlobalTransactional
public void update() {
    userService.update();
    
    // fake exception
    int i = 1 / 0;
}
```

# AT Mode

AT Mode 属于 AP Mode, 一致性较差, 性能较强, 企业一般都是采用 AT Mode

TM 通知 TC 开启 Global Transaction, TM 调用 RM 向 TC 注册 Branch Transaction, 存储 Snapshotting (Undo Log), 执行 SQL, 执行 Commit, 报告 Branch Transaction State

TM 通知 TC 执行 Commit 或 Rollback, TC 检查 Branch Transaction State, 通知 RM 异步删除 Snapshotting 或根据 Snapshotting 恢复 Data, 恢复完再通过异步的方式删除 Snapshotting

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753971.png)


enable AT standard (def)

```properties
seata.data-source-proxy-mode=AT
```

create table

```sql
DROP TABLE IF EXISTS `undo_log`;
CREATE TABLE `undo_log`  (
  `branch_id` bigint(20) NOT NULL COMMENT 'Branch Transaction id',
  `xid` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Global Transaction id',
  `context` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'undo_log context,such as serialization',
  `rollback_info` longblob NOT NULL COMMENT 'rollback info',
  `log_state` int(11) NOT NULL COMMENT '0:normal state,1:defense state',
  `log_created` datetime(6) NOT NULL COMMENT 'create datetime',
  `log_modified` datetime(6) NOT NULL COMMENT 'modify datetime',
  UNIQUE INDEX `ux_undo_log`(`xid`, `branch_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = 'AT transaction mode undo table' ROW_FORMAT = Compact;
```

enable Seata Global Transaction

```java
@GlobalTransactional
public void test() {
    userService.update();
    
    // fake exception
    int i = 1 / 0;
}
```

# TCC Mode

TCC Mode 属于 CP, 可以保证较好的一致性, 性能也很出色, 就是代码耦合度较高, 实现比较复杂

TM 通知 TC 开启 Global Transaction, TM 调用 RM 向 TC 注册 Branch Transaction, 执行 try, 检测 Resource, 预留 Resource, 报告 Branch Transaction State

TM 通知 TC 执行 Commit 或 Rollback, TC 检查 Branch Transaction State, 通知 RM 执行 Confirm 或 Cancel

- Confirm 就是执行 Commit, 操作预留的 Resource
- Cancel 就是执行 Rollback, 释放预留的 Resource

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753975.png)

TM 调用 RM 执行 try 失败, 造成服务堵塞, TM 发现超市, 通知 TC 执行 Rollback, RM 此时 try 失败, 无法正常执行 Cancel, 可以执行一次 Blank Rollback

Service Blocking 恢复后, 在 Cancel 后执行 try, 而本次 Transaction 已经结束了, 不会再去执行 Confirm 或 Cancel, 导致 Service Suspension, 所以执行 try 前, 应当判断 Cancel 是否已执行, 避免 Service Suspension

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753976.png)

create table

```sql
CREATE TABLE IF NOT EXISTS `tcc_fence_log`
(
    `xid`           VARCHAR(128)  NOT NULL COMMENT 'global id',
    `branch_id`     BIGINT        NOT NULL COMMENT 'branch id',
    `action_name`   VARCHAR(64)   NOT NULL COMMENT 'action name',
    `state`        TINYINT       NOT NULL COMMENT 'state(tried:1;committed:2;rollbacked:3;suspended:4)',
    `gmt_create`    DATETIME(3)   NOT NULL COMMENT 'create time',
    `gmt_modified`  DATETIME(3)   NOT NULL COMMENT 'update time',
    PRIMARY KEY (`xid`, `branch_id`),
    KEY `idx_gmt_modified` (`gmt_modified`),
    KEY `idx_state` (`state`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- record reserved resource info
CREATE TABLE IF NOT EXISTS `tcc_fence_log`
(
    `id`           VARCHAR(128)  NOT NULL,
    `user_id`       BIGINT        NOT NULL,
    `user_balance`  VARCHAR(64)   NOT NULL,
    `state`         TINYINT       NOT NULL,
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
```

create UserFreeze entity to reserve resource

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserFreeze {
    String xid;
    Integer userId;
    Integer userBalance;
    Integer state;

    public static abstract class State {
        public final static int TRY = 0;
        public final static int CONFIRM = 1;
        public final static int CANCEL = 2;
    }
}
```

enable Seata Global Transaction

```java
@Autowired
UserTCCService userTCCService;

@GlobalTransactional
public void update(Integer userId, Integer userBalance) {
    userTCCService.update(userId, userBalance);
    
    // fake exception
    int i = 1 / 0;
}
```

set TCC service

```java
@LocalTCC
public interface UserTCCService {
    // commitMethod prop can not be `commit`, rollbackMethod prop can not be `rollback`
    @TwoPhaseBusinessAction(name = "update", commitMethod = "confirm", rollbackMethod = "cancel", useTCCFence = true)
    void update(@BusinessActionContextParameter(paramName = "userId") Integer userId, @BusinessActionContextParameter(paramName = "userAmount") Integer userAmount);

    boolean confirm(BusinessActionContext ctx);

    boolean cancel(BusinessActionContext ctx);
}
```

```java
@Service
public class UserTCCServiceImpl implements UserTCCService {
    @Autowired
    UserMapper userMapper;
    @Autowired
    UserFreezeMapper userFreezeMapper;

    @Override
    @Transactional
    public void update(Integer userId, Integer userBalance) {
        // get Global Transaction id
        String userFreezeId = RootContext.getXID();

        // deal service suspension
        UserFreeze userFreeze = userFreezeMapper.selectById(userFreezeId);
        if (userFreeze != null) {
            return;
        }

        User user = userMapper.selectById(userId);

        // execute try
        userFreeze = new UserFreeze();
        userFreeze.setId(userFreezeId);
        userFreeze.setUserId(user.getId());
        userFreeze.setUserBalance(user.getBalance());
        userFreeze.setState(UserFreeze.State.TRY);
        userFreezeMapper.insert(userFreeze);

        // execute SQL
        user.setBalance(userBalance);
        userMapper.update(user);
    }

    @Override
    public boolean confirm(BusinessActionContext ctx) {
        String userFreezeId = ctx.getXid();
        Integer affectedRows = userFreezeMapper.deleteById(userFreezeId);
        return affectedRows == 1;
    }

    @Override
    public boolean cancel(BusinessActionContext ctx) {
        String userFreezeId = ctx.getXid();
        Integer userId = (Integer) ctx.getActionContext("userId");

        UserFreeze userFreeze = userFreezeMapper.selectById(userFreezeId);

        // set a blank userFreeze to execute blank rollback
        if (userFreeze == null) {
            userFreeze = new UserFreeze();
            userFreeze.setId(userFreezeId);
            userFreeze.setUserId(userId);
            userFreeze.setUserBalance(0);
            userFreeze.setState(UserFreeze.State.CANCEL);
            userFreezeMapper.insert(userFreeze);
            return true;
        }

        // idempotent judgement
        if (userFreeze.getState().equals(UserFreeze.State.CANCEL)) {
            return true;
        }

        // rollback
        User user = new User();
        user.setId(userFreeze.getUserId());
        user.setBalance(userFreeze.getUserBalance());
        userMapper.update(user);

        // update userFreeze
        Integer affectedRows = userFreezeMapper.deleteById(userFreezeId);

        return affectedRows == 1;
    }
}
```

# Dirty Write

AT Mode 存在 Dirty Write, 这里 T1 和 T2 都是 Seata Transaction, 发生了 Dirty Write

- T1 获取 DB Lock, 存储 Snapshotting, 执行 SQL, 设置 mony=90, 执行 Commit, 释放 DB Lock
- T2 获取 DB Lock, 存储 Snapshotting, 执行 SQL, 设置 mony=80, 执行 Commit, 释放 DB Lock
- T1 执行 Rollback, 恢复 Data, 设置 mony=100 导致 T2 的写丢失

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753972.png)

# Write Isolation

AT Mode 可以通过 Global Lock 处理 Seata Transaction, 可以通过 Image 处理 Non-Seata Transaction

这里 T1 和 T2 都是 Seata Transaction, 通过 Global Lock 实现 Write Isolation 解决 Dirty Write

- T1 获取 DB Lock, 存储 Snapshotting, 获取 Global Lock, 执行 SQL, 设置 mony=90, 释放 DB Lock
    - Global Lock 记录 Transaction 操作的 Row, 表示该 Transaction 持有该 Row 的 Global Transaction, 在此期间, 其他 Transaction 无法操作该 Row
    - Global Lock 只作用于 Seata Transaction, 不作用于 Non-Seata Transaction
- T2 获取 DB Lock, 存储 Snapshotting, 无法获取 Global Lock, 无法执行 SQL, 重试 30 times, 间隔 10ms, 执行失败, 释放 DB Lock
- T1 等待 T2 释放 DB Lock, 获取 DB Lock, 执行 Rollback, 实现 Write Isolation, 解决 Dirty Write

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753973.png)

这里 T1 是 Seata Transaction, T2 是 Non-Seata Transaction, 通过 Before Image 和 After Image 实现 Write Isolation 解决 Dirty Write

- T1 获取 DB Lock, 存储 Snapshotting (Before Image), 获取 Global Lock, 执行 SQL, 设置 money=90, 存储 Snapshotting (After Image), 释放 DB Lock
- T2 获取 DB Lock, 执行 SQL, 设置 money=80
- T1 获取 DB Lock, 执行 Rollback, 对比 Current Data 和 Before Image, 发现 Exception, 发送 Alert

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753974.png)

# Seata Cluster

configure Seata cluster

```yaml
seata:
  config:
    type: nacos
    nacos:
      server-addr: 127.0.0.1:8848
      namespace:
      group: DEFAULT_GROUP
      username: nacos
      password: nacos
      context-path:
      data-id: seata-server.properties
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      namespace: public
      username: nacos
      password: nacos
      context-path:
      # group
      group: DEFAULT_GROUP
      # cluster name
      cluster: JS
```

startup Seata cluster

```shell
sh bin/seata-server.sh -p 7091
```

check Seata cluster

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241753977.png)

configure Nacos profile

```txt
Data ID: seata-client.properties
Group: DEFAULT_GROUP
```

```properties
# group mapping
service.vgroupMapping.seata-demo=JS

service.enableDegrade=false
service.disableGlobalTransaction=false

transport.type=TCP
transport.server=NIO
transport.heartbeat=true
transport.enableClientBatchSendRequest=false
transport.threadFactory.bossThreadPrefix=NettyBoss
transport.threadFactory.workerThreadPrefix=NettyServerNIOWorker
transport.threadFactory.serverExecutorThreadPrefix=NettyServerBizHandler
transport.threadFactory.shareBossWorker=false
transport.threadFactory.clientSelectorThreadPrefix=NettyClientSelector
transport.threadFactory.clientSelectorThreadSize=1
transport.threadFactory.clientWorkerThreadPrefix=NettyClientWorkerThread
transport.threadFactory.bossThreadSize=1
transport.threadFactory.workerThreadSize=default
transport.shutdown.wait=3

client.rm.asyncCommitBufferLimit=10000
client.rm.lock.retryInterval=10
client.rm.lock.retryTimes=30
client.rm.lock.retryPolicyBranchRollbackOnConflict=true
client.rm.reportRetryCount=5
client.rm.tableMetaCheckEnable=false
client.rm.tableMetaCheckerInterval=60000
client.rm.sqlParserType=druid
client.rm.reportSuccessEnable=false
client.rm.sagaBranchRegisterEnable=false

client.tm.commitRetryCount=5
client.tm.rollbackRetryCount=5
client.tm.defaultGlobalTransactionTimeout=60000
client.tm.degradeCheck=false
client.tm.degradeCheckAllowTimes=10
client.tm.degradeCheckPeriod=2000

client.undo.dataValidation=true
client.undo.logSerialization=jackson
client.undo.onlyCareUpdateColumns=true
client.undo.logTable=undo_log
client.undo.compress.enable=true
client.undo.compress.type=zip
client.undo.compress.threshold=64k
client.log.exceptionRate=100
```

configure micro-service to connect to Seata cluster

```properties
seata.registry.type=nacos
seata.registry.nacos.server-addr=127.0.0.1:8848
seata.registry.nacos.namespace=public
seata.registry.nacos.group=DEFAULT_GROUP
seata.registry.nacos.application=seata-server
seata.registry.nacos.username=nacos
seata.registry.nacos.password=nacos
seata.config.type=nacos
seata.config.nacos.server-addr=127.0.0.1:8848
seata.config.nacos.username=nacos
seata.config.nacos.password=nacos
seata.config.nacos.group=DEFAULT_GROUP
# set group name
seata.tx-service-group=seata-demo
# set data id to access Nacos profile
seata.config.nacos.data-id=seata-client.properties
```

modify Nacos profile to dynamic switch cluster

```properties
service.vgroupMapping.seata-demo=SH
```

