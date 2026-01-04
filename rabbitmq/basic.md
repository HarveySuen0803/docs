# RabbitMQ

Sync invoke, implemented by Fegin, after invoking a service, we need to wait for it to finish before invoking other services.

Async invoke, implemented by event-driver, publish message to a broker, then other services consume message from the broker.

RabbitMQ is a message broker, it accepts and forwards messages.

You can think about it as a post office, when you put the mail that you want posting in a post box, you can be sure that the letter carrier will eventually deliver the mail to your recipient. In this analogy, RabbitMQ is a post box, a post office, and a letter carrier.

The major difference between RabbitMQ and the post office is that it doesn't deal with paper, instead it accepts, stores, and forwards binary blobs of data ‒ messages.

RabbitMQ architecture

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751889.png)

# Install RabbitMQ by Docker

pull RabbitMQ image

```shell
docker image pull rabbitmq:3.12
```

set volume

```shell
docker volume create rabbitmq-conf
docker volume create rabbitmq-data
docker volume create rabbitmq-plugin

sudo mkdir -p /opt/rabbitmq/data

sudo ln -s /var/lib/docker/volumes/rabbitmq-conf/_data /opt/rabbitmq/conf
sudo ln -s /var/lib/docker/volumes/rabbitmq-data/_data /opt/rabbitmq/data
sudo ln -s /var/lib/docker/volumes/rabbitmq-plugin/_data /opt/rabbitmq/plugin
```

startup RabbitMQ server

```shell
docker container run \
    --hostname rabbitmq-node-01 \
    --name rabbitmq \
    --privileged \
    -e RABBITMQ_DEFAULT_USER=harvey \
    -e RABBITMQ_DEFAULT_PASS=111 \
    -v rabbitmq-conf:/etc/rabbitmq \
    -v rabbitmq-data:/var/lib/rabbitmq \
    -v rabbitmq-plugin:/plugins \
    -p 5672:5672 \
    -p 15672:15672 \
    -d rabbitmq:3.12
```

# rabbitmq-server Command

```shell
# startup rabbitmq server
rabbitmq-server

# startup rabbitmq server in background
rabbitmq-server -detached

# shutdown rabbitmq server
rabbitmq-server shutdown
```

# rabbitmqctl Command

```shell
# stop app
rabbitmqctl stop_app

# reset app
rabbitmqctl reset

# start app
rabbitmqctl start_app

# check rabbitmq status
rabbitmqctl status

# list user
rabbitmqctl list_users

# add user
rabbitmqctl add_user admin 111

# set permission
rabbitmqctl set_persmissions admin ".*" ".*" ".*"

# list permission
rabbitmqctl list_permissions
```

# rabbitmq-plugins Command

```shell
# list plugin
rabbitmq-plugins list

# enable plugin
rabbitmq-plugins enable rabbitmq_management
```

# RabbitMQ Dashboard

startup dashboard

```shell
rabbitmq-plugins enable rabbitmq_management
```

enable metrics collector (conf.d/20-management_agent.disable_metrics_collector.conf)

```shell
management_agent.disable_metrics_collector = false
```

access http://127.0.0.1:15672

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751890.png)

# Virtual Host

create virtual host

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751891.png)

specify the virtual host of user

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751892.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751893.png)

# Integrate SpringBoot

import dependency

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

set RabbitMQ

```properties
spring.rabbitmq.host=127.0.0.1
spring.rabbitmq.port=5672
spring.rabbitmq.username=harvey
spring.rabbitmq.password=111
spring.rabbitmq.virtual-host=/harvey
```

AmqpTemplate, implementation of AMQP Protocol

```java
@Autowried
AmqpTemplate amqpTemplate
```

RabbitTemplate, implementation of AMQP Protocol by RabbitMQ

```java
@Autowired
RabbitTemplate rabbitTemplate;
```

# Publish Message

set queue

```java
@Bean
public Queue directQueue() {
    return QueueBuilder
        .durable("direct.queue")
        .build();
}
```

publish message

```java
// publish message to `direct.queue`
rabbitTemplate.convertAndSend("direct.queue", "hello world");
```

# Consume Message

```java
@Component
public class UserListener {
    // listening for message on `direct.queue`
    @RabbitListener(queues = {"direct.queue"})
    public void listener(String msg) {
        System.out.println(msg);
    }
}
```

# Message Properties

```java
Message msg = MessageBuilder
    .withBody("hello world".getBytes(StandardCharsets.UTF_8))
    .setDeliveryMode(MessageDeliveryMode.PERSISTENT)
    .setExpiration("1000")
    .build();

rabbitTemplate.convertAndSend("direct.exchange.a", "queue.a", msg);
```

# Queue Properties

```java
@Bean
public Queue directQueue() {
    return QueueBuilder
        .durable("direct.queue")
        .expires(10000)
        .autoDelete()
        .maxLength(5)
        .maxLengthBytes(10)
        .overflow(QueueBuilder.Overflow.dropHead)
        .deadLetterExchange("dead.letter.exchange")
        .deadLetterRoutingKey("dead.letter.key")
        .singleActiveConsumer()
        .build();
}
```

# Multi Consumers

architecture

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241751897.png)

set number of prefetched message

```properties
# prefetch one message at a time, and then prefetch the message after processing
spring.rabbitmq.listener.simple.prefetch=1
```

set multi consumers

```java
@RabbitListener(queues = {"direct.queue"})
public void listener1(Message message) throws InterruptedException {
    System.out.println(new String(message.getBody()));
    // fake high performance
    Thread.sleep(10);
}

@RabbitListener(queues = {"direct.queue"})
public void listener2(Message message) throws InterruptedException {
    System.err.println(new String(message.getBody()));
    // fake low performance
    Thread.sleep(100);
}
```

# Message Serialization

SpringAMQP defaults to serialize message through ObjectOutputStream, but the performance is too poor. Jackson can convert message to JSON format instead of ObjectOutputStream.

import Dependency

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```

set MessageConverter

```java
@Bean
public MessageConverter messageConverter() {
    return new Jackson2JsonMessageConverter();
}
```

```java
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
```

publish JSON message

```java
rabbitTemplate.convertAndSend("harvey.simple.queue", new User(1, "harvey", 18, "F"));
```

consume JSON message

```java
@Component
public class MyRabbitListener {
    @RabbitListener(queues = "harvey.simple.queue")
    public void listener(User user) {
        System.out.println(user); // User(id=1, name=harvey, age=18, sex=F)
    }
}
```

# Explicit Declaration

采用 Implicitly Declaration 的方式配置 Exchange 和 Queue

```java
@Bean
public DirectExchange directExchange() {
    return new DirectExchange("direct.exchange");
}

@Bean
public Queue directQueue() {
    return new Queue("direct.queue");
}
```

采用 Explicit Declaration 的方式配置 Exchange 和 Queue

```java
@Autowired
private AmqpAdmin amqpAdmin;

@Bean
public Queue queue() {
    Queue queue = QueueBuilder.durable("queue").build();
    amqpAdmin.declareQueue(queue);
    return queue;
}

@Bean
public DirectExchange directExchange() {
    DirectExchange exchange = ExchangeBuilder.directExchange("direct.exchange").build();
    amqpAdmin.declareExchange(exchange);
    return exchange;
}

@Bean
public Binding binding(Queue queue, DirectExchange directExchange) {
    Binding binding = BindingBuilder.bind(queue).to(directExchange).with("direct.key");
    amqpAdmin.declareBinding(binding);
    return binding;
}
```

# Batch Consumption





