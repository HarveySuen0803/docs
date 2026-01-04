# Direct Exchange

A direct exchange delivers messages to queues based on the message routing key. 

A queue binds to the exchange with a routing key K. When a new message with routing key R arrives at the direct exchange, the exchange routes it to the queue if K = R. If multiple queues are bound to a direct exchange with the same routing key K, the exchange will route the message to all queues for which K = R.

A direct exchange is ideal for the unicast routing of messages. 

architecture

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751894.png)

set exchange and queue

```java
// create direct exchange
@Bean
public DirectExchange directExchange() {
    return new DirectExchange("direct.exchange");
}

// create queue
@Bean
public Queue directQueueA() {
    return new Queue("direct.queue.a");
}
@Bean
public Queue directQueueB() {
    return new Queue("direct.queue.b");
}

// bind queue to exchange with routing key
@Bean
public Binding directQueueBindingA(Queue directQueueA, DirectExchange directExchange) {
    // bind `direct.key.a` as routing key
    return BindingBuilder.bind(directQueueA).to(directExchange).with("direct.key.a");
}
@Bean
public Binding directQueueBindingB(Queue directQueueB, DirectExchange directExchange) {
    // bind queue-name as routing key
    return BindingBuilder.bind(directQueueB).to(directExchange).withQueueName();
}
```

publish message

```java
// void convertAndSend(String exchange, String routingKey, Object object)
rabbitTemplate.convertAndSend("direct.exchange", "direct.key.a", "hello world");
rabbitTemplate.convertAndSend("direct.exchange", "direct.queue.b", "hello world");
```

consume message

```java
@RabbitListener(queues = {"direct.key.a", "direct.queue.b"})
public void listener(String message) {
    System.out.println(message);
}
```

# Fanout Exchange

A fanout exchange routes messages to all of the queues that are bound to it and the routing key is ignored. 

If N queues are bound to a fanout exchange, when a new message is published to that exchange a copy of the message is delivered to all N queues. 

Fanout exchanges are ideal for the broadcast routing of messages.

architecture

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751895.png)

set exchange and queue

```java
// create fanout exchange
@Bean
public FanoutExchange fanoutExchange() {
    return new FanoutExchange("fanout.exchange");
}

// create queue
@Bean
public Queue fanoutQueueA() {
    return new Queue("fanout.queue.a");
}
@Bean
public Queue fanoutQueueB() {
    return new Queue("fanout.queue.b");
}

// bind queue to exchange without routing key
@Bean
public Binding fanoutQueueBindingA(Queue fanoutQueueA, FanoutExchange fanoutExchange) {
    return BindingBuilder.bind(fanoutQueueA).to(fanoutExchange);
}
@Bean
public Binding fanoutQueueBindingB(Queue fanoutQueueB, FanoutExchange fanoutExchange) {
    return BindingBuilder.bind(fanoutQueueB).to(fanoutExchange);
}
```

publish message

```java
// publish onle one messsage
rabbitTemplate.convertAndSend("fanout.exchange", "", "hello world");
```

consume message

```java
@RabbitListener(queues = {"fanout.queue.a", "fanout.queue.b"})
public void listener(String message) {
    System.out.println(message);
}
```

# Topic Exchange

Topic exchanges route messages to one or many queues based on matching between a message routing key and the pattern that was used to bind a queue to an exchange. 

The topic exchange type is often used to implement various publish/subscribe pattern variations. 

Topic exchanges are commonly used for the multicast routing of messages.

architecture

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751896.png)

set exchange and queue

```java
// create topic exchange
@Bean
public TopicExchange topicExchange() {
    return new TopicExchange("topic.exchange");
}

// create queue
@Bean
public Queue topicQueueA() {
    return new Queue("topic.queue.a");
}
@Bean
public Queue topicQueueB() {
    return new Queue("topic.queue.b");
}

// bind queue to exchange with routing key
@Bean
public Binding topicQueueBindingA(Queue topicQueueA, TopicExchange topicExchange) {
    return BindingBuilder.bind(topicQueueA).to(topicExchange).with("*.*.a");
}
@Bean
public Binding topicQueueBindingB(Queue topicQueueB, TopicExchange topicExchange) {
    return BindingBuilder.bind(topicQueueB).to(topicExchange).with("#.b");
}
```

publish message

```java
rabbitTemplate.convertAndSend("topic.exchange", "topic.key.a", "hello world");
rabbitTemplate.convertAndSend("topic.exchange", "topic.key.b", "hello world");
```

consume message

```java
@RabbitListener(queues = {"topic.queue.a", "topic.queue.b"})
public void listener(String message) {
    System.out.println(message);
}
```

# Binding by Annotation

delcare exchange and queue by annotation instead of Bean, binding exchange and queue by annotation instead of Bean

```java
@Component
public class UserListener {
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = "direct.queue.a", durable = "true", arguments = {@Argument(name = "x-message-ttl", value = "10000")}),
            exchange = @Exchange(name = "direct.exchange", type = ExchangeTypes.DIRECT),
            key = {"direct.key.a"}
    ))
    public void listener(Message message) throws InterruptedException {
        System.out.println(new String(message.getBody()));
    }
}
```

# Exchange Properties

```java
@Bean
public Exchange directExchange() {
    return ExchangeBuilder
        .directExchange("direct.exchange")
        .alternate("direct.exchange.a.alternate")
        .durable(true)
        .build();
}
```
