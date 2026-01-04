# Dead Letter Queue

Dead Letter Queue 常用于处理回执为 REJECT 的消息, 当一个消息发送到 Queue 后没有被消费, 直到 TTL 结束, 就会自动转发到 Dead Letter Queue 中, 最终由消费者去消费 Dead Letter Queue 中的消息, 这个过程就相当于 Delayed Queue

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751748.png)

配置 Dead Letter Queue

```java
@Bean
public DirectExchange deadLetterExchange() {
    return ExchangeBuilder
        .directExchange("dead.letter.exchange")
        .durable(true)
        .build();
}

@Bean
public Queue deadLetterQueue() {
    return QueueBuilder
        .durable("dead.letter.queue")
        .build();
}

@Bean
public Binding deadLetterQueueBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
    return BindingBuilder
        .bind(deadLetterQueue)
        .to(deadLetterExchange)
        .with("dead.letter.key");
}
```

配置 Queue 的 TTL, 所有消息的 TTL 都相同, 过期后, 自动转发给 Dead Letter Queue

- Queue 的 Expiration 通过 expires() 配置
- Queue 的 TTL 通过 ttl() 配置

```java
@Bean
public Queue queue() { 
    return QueueBuilder
        .durable("direct.queue")
        .ttl(10)
        .deadLetterExchange("dead.letter.exchange")
        .deadLetterRoutingKey("dead.letter.key")
        .build();
}
```

配置 Message 的 TTL, 如果没有配置, 则以 Queue 的 TTL 为准

- Message 的 Expiration 和 TTL 都是通过 setExpiration() 设置

```java
Message msg = MessageBuilder
    .withBody("hello world".getBytes(StandardCharsets.UTF_8))
    .setExpiration("10")
    .build();

rabbitTemplate.convertAndSend("direct.exchange.a", "queue.a", msg);
```

# Single Exchange

可以直接将 Dead Letter Queue 连接到 Queue 的 Exchange 上, 省去了一个 Dead Letter Exchange, 适合小项目, 简单快速

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751749.png)
 
```java
@Bean
public DirectExchange directExchange() {
    return new DirectExchange("direct.exchange");
}

@Bean
public Queue directQueue() {
    Map<String, Object> arguments = new HashMap<>();

    // Set dead letter condition
    arguments.put("x-message-ttl", 10000);
    arguments.put("x-max-length", 5);
    
    // Set direct exchange as dead letter exchange
    arguments.put("x-dead-letter-exchange", "direct.queue");
    
    // Set dead letter routing key
    arguments.put("x-dead-letter-routing-key", "dead.letter.key");
    
    return new Queue("direct.queue", true, false, false, arguments);
}

// Bind direct queue to direct exchange
@Bean
public Binding directQueueBinding(Queue directQueue, DirectExchange directExchange) {
    return BindingBuilder.bind(directQueue).to(directExchange).with("direct.queue");
}

@Bean
public Queue deadLetterQueue() {
    return new Queue("dead.letter.queue");
}

// Bind dead letter queue to direct exchange
@Bean
public Binding deadLetterQueueBinding(Queue deadLetterQueue, DirectExchange directExchange) {
    return BindingBuilder.bind(deadLetterQueue).to(directExchange).with("dead.letter.key");
}
```

# Delayed Message Plugin

下载 rabbitmq-delayed-message-exchange plugin

```shell
curl -LJO https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v3.12.0/rabbitmq_delayed_message_exchange-3.12.0.ez

sudo docker container cp ./rabbitmq_delayed_message_exchange-3.12.0.ez rabbitmq:/plugins
```

启动 rabbitmq-delayed-message-exchange plugin

```shell
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

在 Dashboard 中手动配置 Delayed Exchange

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202401292039247.png)

通过 Explicit Declaration 的方式配置 Delayed Queue 和 Delayed Exchange

```java
@Autowired
private AmqpAdmin amqpAdmin;

@Bean
public Queue delayedQueue() {
    Queue queue = QueueBuilder.durable("delayed.queue").build();
    amqpAdmin.declareQueue(queue);
    return queue;
}

@Bean
public CustomExchange delayedExchange() {
    HashMap<String, Object> args = new HashMap<>();
    args.put("x-delayed-type", "direct");
    CustomExchange exchange = new CustomExchange("delayed.direct", "x-delayed-message", true, false, args);
    amqpAdmin.declareExchange(exchange);
    return exchange;
}

@Bean
public Binding binding(Queue delayedQueue, CustomExchange delayedExchange) {
    Binding binding = BindingBuilder.bind(delayedQueue).to(delayedExchange).with("delayed.key").noargs();
    amqpAdmin.declareBinding(binding);
    return binding;
}
```

配置 Consumer

```java
@RabbitListener(queues = {"delayed.queue"})
public void listener(Message msg, Channel channel) {
    System.out.println(new String(msg.getBody()));
}
```

发送 Delayed Message

```java
Message msg = MessageBuilder
    .withBody("hello world".getBytes(StandardCharsets.UTF_8))
    .setHeader("x-delay", 5000) // 5000ms
    .build();

rabbitTemplate.convertAndSend("delayed.direct", "delayed.key", msg);
```

可以通过 Annotation 配置 Queue, Exchange, Binding 一步到位, 不需要再去配置 Bean

```java
@RabbitListener(bindings = @QueueBinding(
    value = @Queue(name = "delayed.queue", durable = "true"),
    exchange = @Exchange(name = "delayed.direct", delayed = "true"),
    key = {"delayed.key"}
))
public void listener(Message msg, Channel channel) {
    System.out.println(new String(msg.getBody()));
}
```

# Multi Delayed Message

Delayed Message 处理超时订单业务时, 默认所有的消息都需要等待 30m 后才会进行处理, 但实际上绝大多多数订单都不是超时任务, 没有必要让所有的消息都延迟 30m, 可以分为多个时间段发送多个消息, 隔一段时间处理一次超时订单, 只要保证 Idempotent, 就可以避免堆积大量的消息

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751750.png)



```java
OrderMessage orderMessage = new OrderMessage();
OrderMessage.setOrderId(1);
OrderMessage.setDelayedTimeList(10000, 20000, 30000, 40000, 50000, 60000)

rabbitTemplate.convertAndSend("delayed.exchange", "delayed.key", orderMessage, (message) -> {
    message.getMessageProperties().setDelay(orderMessage.getDelayedTime());
    return message;
});
```

```java
@RabbitListener(bindings = @QueueBinding(
        value = @Queue(name = "delayed.queue", durable = "true"),
        exchange = @Exchange(name = "delayed.exchange", delayed = "true"),
        key = {"delayed.key"}
))
public void listener(OrderMessage orderMessage) {
    // Check whether the payment is successful
    if (orderService.isPay(orderMessage.getOrdeId())) {
        System.out.println("payment success");
        return;
    }

    // Republish delayed message
    if (!orderMessage.hasDelayedTime()) {
        System.out.println("payment failure");
        return;
    }
    rabbitTemplate.convertAndSend("delayed.exchange", "delated.key", orderMessage, (message) -> {
        message.getMessageProperties().setDelay(orderMessage.getDelayedTime());
        return message;
    });
}
```

