# basic

Zookeeper 是一个分布式协调服务, 主要用于协调和管理大型分布式系统中的数据, ZooKeeper 的设计目标是提供一种简单且高性能的机制来协调分布式应用程序, 确保信息的同步, 配置维护, 命名和分布式同步等

Zookeeper 特性

- 一致性: 保证所有客户端将看到一致的数据视图
- 低延迟: 确保可以快速地响应客户端请求
- 可靠性: 通过复制数据存储在服务集群中的多个节点上, 即使在单个或多个节点失败的情况下也能保证服务的可用性
- 层次数据模型: 提供了一个类似于文件系统的层次数据结构, 这使得它既容易理解又便于使用
- 观察通知机制: 客户端可以在某个节点上设置观察点, 当节点发生变化时, ZooKeeper 可以通知这些客户端
- 顺序访问: 可以为客户端的所有操作维护一个全局顺序

Zookeeper 应用

- 配置管理: 自动更新系统组件的配置信息, 当配置数据更新时, ZooKeeper 可以通知各个客户端应用最新的配置信息
- 命名服务: 像 DNS 那样提供命名服务, 用于翻译一组易记的字符串名字到系统或网络资源
- 分布式锁: 协调分布式应用中的进程, 以便它们能够按顺序访问共享资源
- 集群管理: 监控集群状态, 实时掌握成员节点的加入与离开
- 队列管理: 实现分布式队列, 客户端可以并发地向队列中添加元素, 而队列将安全地排队处理这些元素

# Storage Structure

Zookeeper 是以类似文件系统的层次树形结构来保存数据, 每一个节点称为一个 znode, 每个znode可以持有数据量和子节点

- 文件系统结构中的节点要么是目录, 要么就是文件, 而 znode 既可以有数据也可以有子节点

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202405031131905.png)

znode 有多种类型

- Persistent 持久节点: 持久节点一旦创建, 除非被显式删除, 否则不会因为创建它的客户端会话结束而消失
- Ephemeral 临时节点: 临时节点的生命周期依赖于创建它们的客户端会话, 会话结束时, 这些节点会被自动删除
- Sequential 顺序节点: 顺序节点是在创建时自动追加一个单调递增的数字作为名字后缀

# Install Zookeeper by Docker

拉取 Zookeeper Image

```shell
docker image pull zookeeper:3.9.2-jre-17
```

启动 Zookeeper Container

```shell
docker container run \
		--name zookeeper \
    --network global \
		--privileged \
		-e TZ="Asia/Shanghai" \
		-p 2181:2181 \
		-d zookeeper:3.9.2-jre-17
```

查看 Zookeeper Server 状态

```shell
zkServer.sh status
```

# Server Command

```shell
zkServer.sh status

zkServer.sh start

zkServer.sh stop

zkServer.sh restart
```

# Client Command

```txt
zkCli.sh -server 127.0.0.1:2181

ls /
ls /app1/p1
ls -s /app1 # 查看 /app1 的详细信息

create /app1 app1_val
create /app1/p1 app1_p1_val

create /app2 app2_val # 创建持久节点
create -e /app2 app2_val # 创建临时节点
create -s /app2 app2_val # 创建顺序节点
create -es /app2 app2_val # 创建临时顺序节点

get /app1/p1

set /app1/p1 app1_p1_new_val

delete /app1/p1

delete /app1 # fail, 有子节点存在, 无法直接删除
deleteall /app1 # succ, 强制删除所有
```

# Curator Client

导入 Dependency

```xml
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-framework</artifactId>
    <version>5.6.0</version>
</dependency>
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-recipes</artifactId>
    <version>5.6.0</version>
</dependency>
```

通过 Curator Client 连接 Zookeeper Server 进行基础操作

```java
RetryPolicy retryPolicy = new ExponentialBackoffRetry(3000, 10);

CuratorFramework curatorClient = CuratorFrameworkFactory.builder()
    .connectString("127.0.0.1:2181")
    .sessionTimeoutMs(60 * 1000)
    .connectionTimeoutMs(15 * 1000)
    .retryPolicy(retryPolicy)
    .namespace("app") // 后续操作的所有节点都以 /app 开头
    .build();

curatorClient.start();

String res = curatorClient.create().forPath("/n1", "v1".getBytes()); // /app/n1

curatorClient.close();
```

# Create Operation

创建不同类型的节点

```java
curatorClient.create()
    .withMode(CreateMode.PERSISTENT)
    .forPath("/n1", "v1".getBytes());

curatorClient.create()
    .withMode(CreateMode.EPHEMERAL)
    .forPath("/n1", "v1".getBytes());

curatorClient.create()
    .withMode(CreateMode.PERSISTENT_SEQUENTIAL)
    .forPath("/n1", "v1".getBytes());

curatorClient.create()
    .withMode(CreateMode.EPHEMERAL_SEQUENTIAL)
    .forPath("/n1", "v1".getBytes());
```

创建多级节点

```java
curatorClient.create()
    .creatingParentsIfNeeded() // 如果需要创建父节点, 就会自动创建
    .forPath("/n1/n2/n3", "v1".getBytes());
```

# Delete Operation

删除单个节点

```java
curatorClient.delete().forPath("/n1");
```

删除带有子节点的节点

```java
curatorClient.delete().deletingChildrenIfNeeded().forPath("/n1");
```

强制保证必须删除成功, Curator 将持续尝试删除该节点直到确实被删除

```java
curatorClient.delete()
    .guaranteed()
    .deletingChildrenIfNeeded()
    .forPath("/n1");
```

给删除操作绑定事件回掉

```java
curatorClient.delete()
    .guaranteed()
    .deletingChildrenIfNeeded()
    .inBackground(new BackgroundCallback() {
        @Override
        public void processResult(CuratorFramework client, CuratorEvent event) throws Exception {
            log.info("Delete result: {}", event.getResultCode());
        }
    })
    .forPath("/n1");
```

# Get Operation

获取节点数据

```java
// get /n1
byte[] data = curatorClient.getData().forPath("/n1");
System.out.println(new String(data));
```

获取节点列表

```java
// ls /
List<String> pathList = curatorClient.getChildren().forPath("/");
System.out.println(pathList);
```

获取节点元数据

```java
// ls -s /n1
Stat stat = new Stat();
curatorClient.getData().storingStatIn(stat).forPath("/n1");

System.out.println(stat);
System.out.println(stat.getAversion());
System.out.println(stat.getCversion());
System.out.println(stat.getCtime());
```

# Set Operation

直接修改节点的值

```java
curatorClient.setData().forPath("/n1", "v2".getBytes());
```

先查询版本号, 然后根据版本号设置节点的值, 类似于 CAS

```java
Stat stat = new Stat();

curatorClient.getData()
    .storingStatIn(stat)
    .forPath("/n1");
System.out.println(stat.getVersion()); // 1

curatorClient.setData()
    .withVersion(stat.getVersion())
    .forPath("/n1", "v2".getBytes());

curatorClient.getData()
    .storingStatIn(stat)
    .forPath("/n1");
System.out.println(stat.getVersion()); // 2
```

# Watcher

ZooKeeper 的监听功能允许客户端订阅节点的变化通知, 当指定的节点或其子节点发生变化时, 会向订阅的客户端发送通知

Curator 抽象了 ZooKeeper 的低级 API, 提供了更高级的 API ——包括对监听管理的改进, Curator 保证了跨多个客户端的监听器触发和重新连接管理

通过 CuratorCacheListener 监听当前节点和子节点的变化

```java
CuratorCache curatorCache = CuratorCache.builder(curatorClient, "/n1").build();

CuratorCacheListener curatorCacheListener = CuratorCacheListener.builder()
    .forChanges((oldNode, newNode) -> {
        String oldNodeData = oldNode != null ? new String(oldNode.getData()) : "null";
        String newNodeData = newNode != null ? new String(newNode.getData()) : "null";
        log.info("Node changed, {} -> {}", oldNodeData, newNodeData);
    })
    .forCreates((newNode) -> {
        String newNodeData = newNode != null ? new String(newNode.getData()) : "null";
        String newNodePath = newNode != null ? newNode.getPath() : "null";
        log.info("Node created, data: {}, path: {}", newNodeData, newNodePath);
    })
    .forDeletes((oldNode) -> {
        String oldNodeData = oldNode != null ? new String(oldNode.getData()) : "null";
        String oldNodePath = oldNode != null ? oldNode.getPath() : "null";
        log.info("Node deleted, data: {}, path: {}", oldNodeData, oldNodePath);
    })
    .build();
    
curatorCache.listenable().addListener(curatorCacheListener);

curatorCache.start();
```

# Ttl

ZooKeeper 配置启用 TTL

```txt
extendedTypesEnabled=true
emulate353TTLNodes=true
```

通过 Curator 创建节点携带 TTL

```java
curatorClient.create()
    .withTtl(5 * 1000L)
    .withMode(CreateMode.PERSISTENT_WITH_TTL)
    .forPath("/n1", "v1".getBytes());
```

# Distributed Lock

通过 Zookeeper 实现分布式锁的思路

1. 客户端创建临时顺序节点, 这里的 Client1 创建了 /lock/1, Client2 创建了 /lock/2, Client3 创建了 /lock/3

- 创建临时节点, 如果客户端发生宕机, 断开了和 Zookeeper 的连接后, 会由 Zookeeper 来自动删除 /lock/1, 相当于帮助 Client 释放了锁, 防止死锁
- 创建顺序节点, 可以很方便的实现公平锁

2. 客户端获取所有 /lock 的子节点, 判断自己创建的节点是否为最小序号

- 如果是最小序号, 就认为该客户端抢到了锁, 使用完后, 需要主动去删除该节点
    - Client1 获取 /lock/1, /lock/2, /lock/3 后发现自己创建的 /lock/1 是最小序号的节点, 就认为 Client1 抢到了锁, Client1 使用完锁之后需要去删除 /lock/1
- 如果不是最小序号, 就认为该客户端没有抢到锁, 该客户端会找到最近的一个比自己序号小的节点, 给他添加删除事件的监听
    - Client2 获取 /lock/1, /lock/2, /lock/3 后发现自己创建的 /lock/2 不是最小序号的节点, 就找到最近一个比 /lock/2 小的节点 /lock/1, 给 /lock/1 添加删除事件的监听, 等 Client1 删除了 /lock/1 后, 就会触发删除事件, 由 Client2 获取锁
    - Client3 获取 /lock/1, /lock/2, /lock/3 后发现自己创建的 /lock/3 不是最小序号的节点, 就找到最近一个比 /lock/3 小的节点 /lock/2, 给 /lock/2 添加删除事件的监听, 等 Client2 删除了 /lock/2 后, 就会触发删除事件, 由 Client3 获取锁

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202405041646911.png)

使用 Curator 的 Mutex Lock

```java
InterProcessMutex lock = new InterProcessMutex(curatorClient, "/lock");
```

```java
try {
    boolean isAcquire = lock.acquire(3, TimeUnit.SECONDS);
    if (!isAcquire) {
        continue;
    }
    
    try {
        log.info("Sell tickets");
    } finally {
        lock.release();
    }
} catch (Exception e) {
    throw new RuntimeException(e);
}
```

# Service Discovery

导入 Dependency

```xml
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-framework</artifactId>
    <version>5.6.0</version>
</dependency>
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-x-discovery</artifactId>
    <version>5.6.0</version>
</dependency>
```

初始化 ServiceDiscovery

```java
ServiceDiscovery<Void> serviceDiscovery = ServiceDiscoveryBuilder.builder(Void.class)
    .client(curatorClient)
    .basePath("/rpc")
    .build();

try {
    serviceDiscovery.start();
} catch (Exception e) {
    throw new RuntimeException(e);
}
```

关闭 ServiceDiscovery

```java
serviceDiscovery.close();
```

注册 Service

```java
// 注册 my-service 的 instance1
ServiceInstance<Void> serviceInstance1 = ServiceInstance.<Void>builder()
    .id("instance1")
    .name("my-service")
    .address("192.168.1.101")
    .port(8080)
    .build();
    
serviceDiscovery.registerService(serviceInstance1);

// 注册 my-service 的 instance2
ServiceInstance<Void> serviceInstance2 = ServiceInstance.<Void>builder()
    .id("instance2")
    .name("my-service")
    .address("192.168.1.102")
    .port(8080)
    .build();

serviceDiscovery.registerService(serviceInstance2);

// 注册 my-service 的 instance3
ServiceInstance<Void> serviceInstance3 = ServiceInstance.<Void>builder()
    .id("instance3")
    .name("my-service")
    .address("192.168.1.103")
    .port(8080)
    .build();
    
serviceDiscovery.registerService(serviceInstance3);
```

注册 Service, 并携带 Payload

```java
ServiceDiscovery<ServiceMeta> serviceDiscovery = ServiceDiscoveryBuilder
    .builder(ServiceMeta.class)
    .client(curatorClient)
    .basePath("/rpc")
    .serializer(new JsonInstanceSerializer<>(ServiceMeta.class))
    .build();
```

```java
String serviceName = "my-service";
String serviceHost = "192.168.1.101";
String servicePort = 8080;
String serviceId = serviceHost + ":" + servicePort;
String details = "...";

ServiceMeta serviceMeta = new ServiceMeta(
    serviceName,
    serviceHost,
    servicePort,
    details
)

// 携带 ServiceMeta Payload
ServiceInstance serviceInstance = ServiceInstance.builder()
    .id(serviceId)
    .name(serviceName)
    .address(serviceHost)
    .port(servicePort)
    .payload(serviceMeta)
    .build();
    
serviceDiscovery.registerService(serviceInstance);
```

注销 Service

```java
ServiceInstance<Void> serviceInstance1 = ServiceInstance.<Void>builder()
    .id("instance1")
    .name("my-service")
    .address("192.168.1.101")
    .port(8080)
    .build();

serviceDiscovery.unregisterService(serviceInstance1);
```

根据 Service 的 id 获取 Service Instance

```java
ServiceInstance<Void> serviceInstance = serviceDiscovery.queryForInstance("my-service", "instance1");

System.out.println(serviceInstance);
System.out.println(serviceInstance.getAddress());
System.out.println(serviceInstance.getPort());
```

获取所有的 Service Instance

```java
Collection<ServiceInstance<Void>> serviceInstances = serviceDiscovery.queryForInstances("my-service");

for (ServiceInstance<Void> serviceInstance : serviceInstances) {
    System.out.println(serviceInstance);
    System.out.println(serviceInstance.getAddress());
    System.out.println(serviceInstance.getPort());
}
```

# Exercise Sell Tickets

```java
public class TicketService {
    private static final Logger log = LoggerFactory.getLogger(TicketService.class);
    
    private CuratorFramework curatorClient;
    
    private int tickets = 100;
    
    private InterProcessMutex lock;
    
    public TicketService() {
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(3000, 10);
        
        curatorClient = CuratorFrameworkFactory.builder()
            .connectString("127.0.0.1:2181")
            .sessionTimeoutMs(60 * 1000)
            .connectionTimeoutMs(15 * 1000)
            .retryPolicy(retryPolicy)
            .build();
        
        curatorClient.start();
        
        lock = new InterProcessMutex(curatorClient, "/lock");
    }
    
    private final ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(
        3,
        5,
        60, TimeUnit.SECONDS,
        new LinkedBlockingDeque<>(),
        Executors.defaultThreadFactory(),
        new ThreadPoolExecutor.AbortPolicy()
    );
    
    public void sellTickets() {
        for (int i = 0; i < threadPoolExecutor.getCorePoolSize(); i++) {
            threadPoolExecutor.submit(new SellTicketsTask());
        }
    }
    
    private class SellTicketsTask implements Runnable {
        @Override
        public void run() {
            while (true) {
                try {
                    boolean isAcquire = lock.acquire(3, TimeUnit.SECONDS);
                    if (!isAcquire) {
                        continue;
                    }
                    
                    
                    try {
                        if (tickets == 0) {
                            log.info("No tickets available");
                            return;
                        }
                        
                        tickets--;
                        log.info("Tickets left: {}", tickets);
                    } finally {
                        lock.release();
                    }
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }
    
    public static void main(String[] args) {
        TicketService ticketService = new TicketService();
        ticketService.sellTickets();
    }
}
```
