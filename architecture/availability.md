# Idempotent

Idempotent 要求重复多次调用接口不会改变业务状态, 保证单次调用结果和多次调用结果一致 (eg: 用户重复点击下单, 要求只能有一个订单生效)

- GET 和 DELETE 符合 Idempotent, PUT 和 POST 不符合 Idempotent

通过 Token + Redis 实现 Idempotent, 适合高并发场景, 前端压力大, 性能最强

- 前端生成 Token 连着表单一块传递给后端, 后端通过 SETNX + TTL 处理 Token. 如果操作失败, 就直接报错或者返回空结果. 如果操作成功, 就执行后续业务逻辑
- 这种方法只能防止 RPC 或 MQ 的重试导致的非幂等问题, 而用户重复点击提交, 造成的 Repeated Request 就无法解决了, 一般需要搭配前端的按钮置灰进行处理

```js
import axios from 'axios'; 
import { nanoid } from 'nanoid';

const token = nanoid();
const formData = {};

axios({
    method: 'post',
    url: '/your-endpoint',
    data: formData,
    headers: {
        'X-Token': token,
    },
}).then((response) => {
    console.log(response.data);
}).catch((error) => {
    console.log(error);
});
```

```java
@Aspect
@Component
public class IdempotentAspect {
    @Autowired
    private RedisTemplate redisTemplate;

    @Around("@annotation(Idempotent)")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();
        String token = request.getHeader("X-Token");
        if (StringUtils.isBlank(token)) {
            throw new RuntimeException("Token does not exists");
        }
        if (!redisTemplate.setIfAbsent(token, "", 60, TimeUnit.SECONDS)) {
            throw new RuntimeException("Repetitive operation");
        }
        Object result = point.proceed();
        return result;
    }
}
```

通过 Token + Redis 实现 Idempotent, 适合高并发场景, 前端压力小, 但是资源耗费多

- 进入表单提交页面时, 就先向后端申请一个 Token, 前端提交表单时携带上 Token, 后端通过 SETNX + TTL 或者 DEL 来处理 Token. 如果操作失败, 就直接报错或者返回空结果. 如果操作成功, 就执行后续业务逻辑
- 这种方法可以解决所有幂等问题, 也不需要担心用户重复点击提交导致的非幂等问题, 因为在进入表单提交页面时, 就确定了 Token

通过 Business 实现 Idempotent, 不适合高并发场景

- 后端执行业务前先查询 Status, 判断是否已经操作过

通过 MessageId + Redis 解决 MQ 的 Idempotent, 专用于保证 MQ 的 Idempotent, 效率高, 性能强

- RabbitMQ 发送的消息默认不会生成 Message Id, 需要配置 MessageConverter 生成 Message Id
- RabbitMQ 的每条 Message 都可以设置 Message Id, 将 Message Id 作为 Token, 通过 SETNX + TTL 处理 Token 实现 Idempotent.

```java
@Bean
public MessageConverter messageConverter() {
    Jackson2JsonMessageConverter jackson2JsonMessageConverter = new Jackson2JsonMessageConverter();
    jackson2JsonMessageConverter.setCreateMessageIds(true);
    return jackson2JsonMessageConverter;
}
```

```java
@Autowired
RedisTemplate redisTemplate;

@RabbitListener(queues = {"direct.queue"})
public void listener(Message message) {
    // Store message into Redis, key is message id, val is message
    Boolean isAbsent = redisTemplate.opsForValue().setIfAbsent(
        message.getMessageProperties().getMessageId(), 
        new String(message.getBody()), 
        60, TimeUnit.SECONDS);

    if (!isAbsent) {
        return;
    }
    
    System.out.println("deal non-idempotent business");
}
```

# Flow Limited

Flow Limited 在 Architecture 中是非常有必要的, 不仅可以处理突发的流量, 处理高并发, 还可以防止恶意攻击, 一般可以在 Tomcat, Sentinel, Nginx, Gateway 中设置 Flow Limited.

Nginx 的 Flow Limited 采用 Leaky Bucket Algo, 以固定的速度处理请求, 来不及处理的都会溢出抛弃.

SpringCloud Gateway 的 Flow Limited 采用 Token Bucket Algo, 以固定的速率生成令牌, 申请到令牌的请求才会被处理, 相比 Leaky Bucket Algo, 处理请求的速度不是固定的 (eg: 令牌桶中存放了 3 个令牌, 此时有 6 个请求过来, 立即派发掉 3 个令牌, 1s 后又生成 3 个令牌, 即在 1s 内处理了 6 个请求).
