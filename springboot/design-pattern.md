# Design Pattern

Singleton Pattern: Bean 默认采用 Singleton Pattern, 通过 Container 管理 Bean Lifecycle, 保证每个 Bean 只被创建一次.

Factory Pattern: BeanFactory 和 ApplicationContext 采用 Factory Pattern 创建并管理 Bean.

Proxy Pattern: AOP 采用 Dynamic Proxy Pattern 创建 Aspect, 这里的 Aspect 就是 Proxy Obj.

Observer Pattern: ApplicationEventPublisher 采用 Observer Pattern, 异步处理 Event, 实现 Decoupling.

Template Pattern: JdbcTemplate, RedisTemplate 和 RestTemplate 都是采用的 Template Pattern. 抽象出了公共的操作流程, 将差异化的部分交给子类或者回调函数实现, 极大地提高了代码的复用性并且降低了出错可能性.

Strategy Pattern: MultipartResolver 采用了 Strategy Pattern, 可以选择 StandardServletMultipartResolver 或 CommonsMultipartResolver 对其进行实现, 在不同的环境或配置中选择不同的策略, 可以使得代码更灵活, 扩展性更好.

Chain of Responsibility Pattern: Filter 和 Interceptor 采用了 Chain of Responsibility Pattern, 多个 Filter 和 Interceptor 按照一定顺序执行, 每个 Filter 和 Interceptor 可以拦截请求或者响应并做出相应的处理