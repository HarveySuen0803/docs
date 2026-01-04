# Connection Timeout

```properties
spring.rabbitmq.connection-timeout=1s
```

# Publisher Retry

网络不稳定时, Publisher 可能连接不上 MQ Server, 就可以设置 Publisher Retry 尝试连接, 这种重试是阻塞式的, 如果对性能有要求, 建议关闭 Publisher Retry

设置 Publisher Retry

```properties
# enable publisher retry
spring.rabbitmq.template.retry.enabled=true

# duration between the first and second attempt to deliver a message
spring.rabbitmq.template.retry.initial-interval=1000ms

# multiplier to apply to the previous retry interval
spring.rabbitmq.template.retry.multiplier=1

# maximum number of attempts to deliver a message
spring.rabbitmq.template.retry.max-attempts=3
```

这里发送消息失败后, 会重试连接

```java
// blocking
rabbitTemplate.convertAndSend("direct.exchange", "direct.queue", "hello world");

// this will not execute
System.out.println("hello world");
```

# Consumer Retry

```properties
spring.rabbitmq.listener.simple.retry.enabled=true
spring.rabbitmq.listener.simple.retry.initial-interval=1000ms
spring.rabbitmq.listener.simple.retry.multiplier=1
spring.rabbitmq.listener.simple.retry.max-attempts=3
spring.rabbitmq.listener.simple.retry.stateless=true
```

# Publisher Confirm

RabbitMQ 提供 Publisher Confirm 进行消息确认, 保证消息能被安全传递, Publisher 发送消息给 MQ 后, MQ 返回 ACK 表示消息发送成功, 其余情况都会返回 NACK 表示发送失败

- Publisher 发送消息给 Exchange, Exchange 路由失败, 返回 ACK
- Publisher 发送消息给 Exchange, Exchange 路由给 Queue, 返回 ACK
- Publisher 发送消息给 Exchange, Exchange 路由给 Queue, Queue 持久化, 返回 ACK
- Publisher 发送消息给 Exchange, 发送失败, 返回 NACK

Publisher 接受到 ACK 后, 根据不同的 ACK 进行处理, 保证 Publisher -> Exchange 这一段的 Reliability

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401291226537.png)

开启 Publisher Confirm, 通过阻塞的方式处理 ACK

```properties
spring.rabbitmq.publisher-confirm-type=simple
```

开启 Publisher Confirm, 通过异步回掉 Callback 的方式处理 ACK

```properties
spring.rabbitmq.publisher-confirm-type=correlated
```

配置 Publisher Confirm 的 Callback 处理 ACK

```java
// set confirm callback, invoked after the exchange receives the message
rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
    if (!ack) {
        System.out.println("publish failure, cause: " + cause);
        return;
    }
    System.out.println("publish success, id: " + correlationData.getId());
});

// set CorrelationData
CorrelationData correlationData = new CorrelationData(UUID.randomUUID().toString());

rabbitTemplate.convertAndSend("direct.exchange", "direct.queue", "hello world", correlationData);
```

# Publisher Return

RabbitMQ 提供 Publish Return 进行消息确认, 主要用于处理不可达路由的消息 (eg: Exchange 不存在, Routing Key 不存在)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751677.png)

开启 Publisher Return

```properties
spring.rabbitmq.publisher-returns=true
```

配置 Publisher Return 的 Callback 处理不可达的消息, 可以在这里发布异常, 可以将消息发送给 Alternative Exchange

```java
// set return callback, invoked after routing failure
rabbitTemplate.setReturnsCallback((returned) -> {
    System.out.println("message returned, cause: " + returned.getMessage());
});

rabbitTemplate.convertAndSend("direct.exchange", "direct.queue", "hello world");
```

配置 Publisher Return 的 Global Callback

```java
@Configuration
public class RabbitMQConfiguration implements ApplicationContextAware {
    @Autowired
    RabbitTemplate rabbitTemplate;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        rabbitTemplate.setReturnsCallback((returned) -> {
            System.out.println("message returned, cause: " + returned.getMessage());
        });
    }
}
```

# Consumer Confirm

RabbitMQ 提供 Consumer Confirm 进行消息确认, 保证消息被安全处理消息, Consumer 处理完消息后, 会发送一个回执给 Queue

- ACK: 成功处理, MQ 会从 Queue 中删除该消息
- NACK: 失败处理, MQ 会重新发送消息给该 Consumer
- REJECT: 拒绝处理, MQ 会从 Queue 中删除该消息

如果某个 Consumer Instance 宕机了, MQ 没有接受到 ACK, 则 MQ 会重新发送消息给其他的 Consumer, 保证 Queue -> Consumer 这一段的 Reliability

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401291346731.png)

配置 None Acknowledge 不返回回执, MQ 会直接从 Queue 中删除消息

```properties
spring.rabbitmq.listener.simple.acknowledge-mode=none
```

配置 Auto Acknowledge 自动返回回执, 业务正常返回 ACK, 业务异常返回 NACK, 消息处理异常或校验异常返回 REJECT

```properties
spring.rabbitmq.listener.simple.acknowledge-mode=auto
```

配置 Manual Acknowledge 手动返回回执

```properties
spring.rabbitmq.listener.simple.acknowledge-mode=manual
```

```java
@RabbitListener(queues = {"direct.queue"})
public void listener(Message message, Channel channel) {
    MessageProperties messageProperties = message.getMessageProperties();
    // get the unique identification of the message
    long deliveryTag = messageProperties.getDeliveryTag();
    try {
        // business process
        System.out.println(new String(message.getBody()));
        // acknowledge the message including the supplied delivery tag
        channel.basicAck(deliveryTag, false);
    } catch (IOException e) {
        try {
            // reject and discard the message including the supplied delivery tag, the message will be sent to the dead letter exchange
            channel.basicNack(deliveryTag, false, false);
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
        throw new RuntimeException(e);
    }
}
```

# Message Recover

如果 Consumer Retry 后还是失败, 直接抛出异常, 有些太草率了, 可以通过 Message Recover 再进一步处理

开启 Message Recover

```properties
spring.rabbitmq.listener.simple.retry.enabled=true
```

配置 RejectAndDontRequeueRecoverer, 返回 REJECT, 将消息发送到 Dead-Letter Exchange

```java
@Configuration
@ConditionalOnProperty(prefix = "spring.rabbitmq.listener.simple.retry", name = "enabled", havingValue = "true")
public class ErrorExchangeConfiguration {
    @Bean
    public MessageRecoverer republicMessageRecoverer(RabbitTemplate rabbitTemplate) {
        return new RejectAndDontRequeueRecoverer();
    }
}
```

配置 ImmediateRequeueMessageRecoverer, 返回 NACK

```java
@Configuration
@ConditionalOnProperty(prefix = "spring.rabbitmq.listener.simple.retry", name = "enabled", havingValue = "true")
public class ErrorExchangeConfiguration {
    @Bean
    public MessageRecoverer republicMessageRecoverer(RabbitTemplate rabbitTemplate) {
        return new ImmediateRequeueMessageRecoverer();
    }
}
```

配置 RepublishMessageRecoverer, 将消息重新发送到 Error Queue 中, 通过人工解决, 这个消息的 x-exception 会存储 Exception Stack Trace

```java
@Configuration
@ConditionalOnProperty(prefix = "spring.rabbitmq.listener.simple.retry", name = "enabled", havingValue = "true")
public class ErrorExchangeConfiguration {
    @Bean
    public MessageRecoverer republicMessageRecoverer(RabbitTemplate rabbitTemplate) {
        return new RepublishMessageRecoverer(rabbitTemplate, "error.exchange", "error.key");
    }
}
```

# Persistence

MQ 默认基于内存存储丢失, Persistence 可以保证消息不丢失, 也可以处理消息堆积的问题

Persistence 先存储消息到磁盘, 再存储消息到内存, 达到一定上线后, 发生暂停, 清除一部分内存中的旧消息, 这个暂停较短

Non Persistence 直接存储消息到内存, 达到一定上线后, 发生暂停, 进行 Page Out, 存储一部分旧消息到磁盘, 这个暂停较长

Message Persistence

```java
Message msg = MessageBuilder
    .withBody("hello world".getBytes(StandardCharsets.UTF_8))
    .setDeliveryMode(MessageDeliveryMode.PERSISTENT)
    .build();

rabbitTemplate.convertAndSend("direct.exchange.a", "queue.a", msg);
```

Queue Persistence

```java
@Bean
public Queue directQueue() {
    return QueueBuilder
        .durable("direct.queue")
        .build();
}
```

Exchange Persistene

```java
@Bean
public DirectExchange directExchange() {   
    return ExchangeBuilder
        .directExchange("direct.exchange")
        .durable(true)
        .build();
}
```

# Lazy Queue

Lazy Queue 接受到消息后, 会直接存储到磁盘中, 需要时再从磁盘加载到内存, 内存中只保存一部分最新的消息 (def: 2048), v3.12 所有的 Queue 都是 Lazy Queue

Lazy Queue 对性能有一定影响, 这个影响可接受, 常用于处理消息堆积问题

```java
@Bean
public Queue queueA() {
    return QueueBuilder
        .durable("queue.a")
        .lazy()
        .build();
}
```

# Error Queue

Error Queue 专门处理一些疑难杂症, 后续通过人工处理

```java
@Bean
public DirectExchange errorExchange() {
    return new DirectExchange("error.exchange");
}

@Bean
public Queue errorQueue() {
    return new Queue("error.queue");
}

@Bean
public Binding errorQueueBinding(Queue errorQueue, DirectExchange errorExchange) {
    return BindingBuilder.bind(errorQueue).to(errorExchange).with("error.key");
}
```

# Idempotent

RabbitMQ 的消息可能会被重复消费, 所以我们需要保证 Consumer 业务的 Idempotent

RabbitMQ 发送的消息默认不会生成 Message Id, 需要配置 MessageConverter 生成 Message Id

```java
@Bean
public MessageConverter messageConverter() {
    Jackson2JsonMessageConverter jackson2JsonMessageConverter = new Jackson2JsonMessageConverter();
    jackson2JsonMessageConverter.setCreateMessageIds(true);
    return jackson2JsonMessageConverter;
}
```

通过 Redis 实现 Idempotent

```java
@Autowired
RedisTemplate redisTemplate;

@RabbitListener(queues = {"direct.queue"})
public void listener(Message message) {
    // Store message into Redis, key is message id, val is message
    Boolean isAbsent = redisTemplate.opsForValue().setIfAbsent("message:" + message.getMessageProperties().getMessageId(), new String(message.getBody()));

    if (!isAbsent) {
        return;
    }
    
    System.out.println("deal non-idempotent business");
}
```

# Message Accumulation

Message Accumulation 是 Publisher 发布消息的速度太快, Consumer 消费消息的速度太慢, 导致大量消息堆积在队列中

Message Accumulation 解决方案

- 增加 Consumer 提高消费速度
- 通过 ThreadPool 提高消费速度
- 通过 Lazy Queue 提高消息的存储能力

# Message Orderliness

有些场景我们需要保证消息的顺序 (eg: 对数据的加减操作, 不能先执行减导致了负数的情况)

想要保证消息的有序性, 就得从 Publisher 和 和 Consumer 两个角度考虑

- 只能有一个 Publisher 发送消息, 并且只能是串行发送, 保证消息到达 Queue 的顺序是一致的
- Publisher 发送的消息只能发送到同一个 Queue 中
- 保证 Consumer 消费消息的顺序, 要么只设置一个 Consumer 消费, 要么设置多个 Consumer, 但是通过 `x-single-active-consumer` 设置单活模式, 每次只有一个消费者可以消费消息

# Peak Shaving and Valley Filling

削峰填谷（Peak Shaving and Valley Filling）是一种负载均衡策略，旨在通过平衡系统的负载来提高系统的稳定性和效率。在高峰期，将部分请求或任务延迟处理，以避免系统过载；在低谷期，处理积压的任务或请求，以充分利用系统资源。

MQ通过异步消息传递机制，可以在高峰期将大量请求存入队列，等到系统负载较低时再逐步处理这些请求，从而实现负载均衡。

MQ 削峰填谷的工作原理：

- 生产者（Producer）: 在高峰期，生产者将消息发送到消息队列，而不是直接处理这些消息。
- 消息队列（Queue）: 消息队列暂存这些消息，充当缓冲区。
- 消费者（Consumer）: 在系统负载较低时，消费者从消息队列中取出消息并处理。

这种机制确保了系统在高峰期不会因为瞬时负载过高而崩溃，同时在低谷期可以充分利用资源处理积压的任务。

假设我们有一个在线购物平台，在促销活动期间，用户请求量暴增。为了避免服务器过载，可以使用MQ来实现削峰填谷。

```java
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;

public class Producer {
    private final static String QUEUE_NAME = "orderQueue";

    public static void main(String[] argv) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {
            channel.queueDeclare(QUEUE_NAME, true, false, false, null);
            String message = "Order details";

            for (int i = 0; i < 1000; i++) {
                channel.basicPublish("", QUEUE_NAME, null, (message + i).getBytes("UTF-8"));
                System.out.println(" [x] Sent '" + message + i + "'");
            }
        }
    }
}
```

```java
import com.rabbitmq.client.*;

public class Consumer {
    private final static String QUEUE_NAME = "orderQueue";

    public static void main(String[] argv) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {
            channel.queueDeclare(QUEUE_NAME, true, false, false, null);
            System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                String message = new String(delivery.getBody(), "UTF-8");
                System.out.println(" [x] Received '" + message + "'");
                
                // 模拟处理时间
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException _ignored) {
                    Thread.currentThread().interrupt();
                }
                System.out.println(" [x] Done");
            };
            channel.basicConsume(QUEUE_NAME, true, deliverCallback, consumerTag -> { });
        }
    }
}
```

- 生产者（Producer）: 在高峰期，当用户下单时，订单信息被发送到RabbitMQ的orderQueue队列，而不是直接处理订单。
- 消息队列（Queue）: orderQueue队列暂存这些订单信息，充当缓冲区。
- 消费者（Consumer）: 在系统负载较低时，消费者从orderQueue队列中取出订单信息并处理。消费者处理订单的速度可以根据系统当前的负载情况进行调整。

