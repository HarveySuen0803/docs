## ThreadLocal 的介绍

下面这段代码中，初始化了一个公共的 `ThreadLocal Obj`，然后创建了十个线程去操作这一个公共的 `ThreadLocal Obj`，去总计累加 10 次，这里也并没有去做什么线程同步控制，最终每个线程都能得到结果 10，是不是很神奇，每个线程竟然可以相互隔离，不去影响别的线程。

```java
ThreadLocal<Integer> threadLocal = ThreadLocal.withInitial(() -> 0);;

for (int i = 0; i < 10; i++) {
    new Thread(() -> {
        try {
            for (int j = 0; j < 10; j++) {
                threadLocal.set(threadLocal.get() + 1);
            }
            System.out.println(Thread.currentThread().getName() + " " + threadLocal.get()); // 这里最终结果都为 10
        } finally {
            threadLocal.remove();
        }
    }).start();
}
```

## ThreadLocal 的基本实现原理

我们在讨论 `ThreadLocal` 底层是如何实现上面这个效果之前，先思考一下，如果是你，你想要实现这个效果，该如何做呢？

其实非常简单，只需要让每个线程去复制一份值，然后各自操作各自的值，就像下面这样，让每个线程去复制一份 `num` 得到 `copyNum`，然后去操作各自的 `copyNum` 即可。

```java
int num = 0;

for (int i = 0; i < 10; i++) {
    new Thread(() -> {
        int copyNum = num;
        for (int j = 0; j < 10; j++) {
            num++;
        }
        System.out.println(Thread.currentThread().getName() + " " + num); // 这里最终结果都为 10
    }).start();
}
```

事实上，`ThreadLocal` 底层确实是这样做的，`ThreadLocal` 提供了一系列用于访问和操作线程局部变量的方法，使得每个线程都可以拥有自己的变量副本，而不需要考虑线程安全性，不同的方法之间就不需要通过全局变量实现通信了。

## ThreadLocal 的详细实现原理

每一个 `Thread Obj` 内部都维护了一个 `ThreadLocalMap Obj` 用于存储一系列的 `ThreadLocal Obj` 的副本，因为一个线程可以拥有多个 `ThreadLocal Obj` 嘛，当然要通过一个 `Map` 来管理了。

```java
public class Thread implements Runnable {
    ThreadLocal.ThreadLocalMap threadLocals = null;
}
```

`ThreadLocalMap` 就是一个 `HashMap`，结构和 `HashMap` 一致，内部通过 `Entry` 来表示每一个元素，而 `ThreadLocalMap` 的 `Entry` 稍微有点特别，这个 `Entry` 的 `key` 为指向 `ThreadLocal` 的弱引用（下面的 `Entry` 继承了 `WeakReference<ThreadLocal<?>`，就表示 `Entry` 中存储的 `ThreadLocal Obj` 都是弱引用），`value` 为 `Object`，这个 `Object` 就是存储的拷贝的副本值。

```java
public class ThreadLocal<T> {
    static class ThreadLocalMap {
        static class Entry extends WeakReference<ThreadLocal<?>> {}
    }
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202408101229787.png)

调用 `ThreadLocal Obj` 的 `set()` 时，会去尝试获取当前 `Thread Obj` 的 `ThreadLocalMap Obj`，如果获取不到，则认为之前没有创建过 `ThreadLocalMap Obj`，就会去调用 `setInitialValue()` 创建一个 `ThreadLocalMap Obj`，并且顺带创建一个 `Entry` 存储到 `ThreadLocalMap Obj`，这个 `Entry` 的 `key` 为 `ThreadLocal Obj` 的弱引用，`val` 为 `ThreadLocal Obj` 的默认值的拷贝值。

```java
public class ThreadLocal<T> {
    // 先尝试获取 ThreadLocalMap Obj，如果获取不到，则认为是第一次创建 ThreadLocalMap Obj，就调用 setInitialValue() 去创建 ThreadLocalMap Obj，并且返回 ThreadLocal Obj 的默认值，因为是第一次创建 ThreadLocalMap Obj 嘛，所以肯定之前是没有执行过 set() 去修改默认值的，直接返回默认值即可
    public T get() {
        // ...
        return setInitialValue();
    }

    // 直接调用 createMap() 去创建 ThreadLocalMap Obj
    public void set(T value) {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            map.set(this, value);
        } else {
            createMap(t, value);
        }
    }

    // 做了一些初始化的操作，最核心的就是调用 createMap() 去创建 ThreadLocalMap Obj，然后返回默认值
    private T setInitialValue() {
        T value = initialValue();
        // ...
        createMap(t, value);
        // ...
        return value;
    }

    // 给当前的 Thread Obj 创建一个 ThreadLocalMap Obj，并且顺带创建一个 Entry，Entry 的拷贝值为传递来的 firstValue
    void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }
}
```

调用 `ThreadLocal Obj` 的 `set()` 时，会去尝试获取当前 `Thread Obj` 的 `ThreadLocalMap Obj`，如果获取不到，则认为之前没有创建过 `ThreadLocalMap Obj`，就会调用 `createMap()` 去创建 `ThreadLocalMap Obj`，并且顺便修改掉 `Entry` 的值为要修改的值（上面 `get()` 调用的 `setInitialValue()` 创建玩 `ThreadLocalMap Obj` 后，创建的 `Entry` 是默认值的拷贝值）。

```java
public class ThreadLocal<T> {
    public void set(T value) {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            map.set(this, value);
        } else {
            createMap(t, value);
        }
    }

    // 给当前的 Thread Obj 创建一个 ThreadLocalMap Obj，并且顺带创建一个 Entry，Entry 的拷贝值为传递来的 firstValue
    void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }
}
```

## ThreadLocalMap 的销毁问题

`Thread Obj` 执行完程序后完成了销毁，而 `ThreadLocal Obj` 并不会销毁，因为 `ThreadLocal Obj` 有可能是全局变量嘛。

下面这里通过 `ThreadLocal` 存储用户上下文信息，定义成了全局静态变量，是不会销毁的。所以流水的 `Thread Obj`，永远的 `ThreadLocal Obj`，那么该如何回收刚刚给 `Thread Obj` 使用的那些 `Entry` 副本呢？

```java
public class UserContextHolder {
    private static final ThreadLocal<UserContext> CONTEXT = new ThreadLocal();
}
```

JDK 的设计是，每一个 `Thread Obj` 都维护一个专属于自己的 `ThreadLocalMap Obj`。每一个 `Entry` 的 `key` 都通过弱引用指向 `ThreadLocal Obj`，`value` 存储 `ThreadLocal Obj` 的拷贝值。

```java
public class Thread implements Runnable {
    ThreadLocal.ThreadLocalMap threadLocals = null;
}
```

当 `Thread Obj` 执行完程序销毁后，就会断开对 `ThreadLocalMap Obj` 的强引用，就会自动回收 `ThreadLocalMap Obj` 了。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403141417049.png)

## ThreadLocal 在线程池中的内存泄漏问题

刚才将了 `ThreadLocalMap` 的销毁问题，只要线程销毁了，就可以很轻松的销毁每一个 `Thread` 关联的 `ThreadLocalMap`，但是在线程池中，线程池并不会销毁，即永远不会销毁 `ThreadLocalMap`，那么也就不会销毁内部的 `Entry`。

每一个 `Entry` 的 `key` 都是通过弱引用指向了 `ThreadLocal Obj`，当发生 GC 时，就会断开弱引用，此时 `key` 为 null，但是 `val` 依旧存储着之前 `ThreadLocal Obj` 的副本，如果这个 `Entry` 一直不销毁，那么 `val` 中就一直存储着副本，导致了严重的内存泄漏问题。

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202403141345757.png)

这种 `key` 为 null，`val` 为副本的 `Entry` 被称为 `StaleEntry`。`ThreadLocal` 的 `set()`, `get()`, `remove()` 底层都会去 `expungeStaleEntry()` 去销毁这种 `StaleEntry`。

```java
private int expungeStaleEntry(int staleSlot) {
    // ...
    if (k == null) {
        e.value = null;
        tab[i] = null;
        size--;
    }
    // ...
}
```

尽管 `set()`, `get()`, `remove()` 会去调用 `expungeStaleEntry()` 销毁 `StaleEntry`，但是如果一个线程遗留了 `StaleEntry` 后，就再也没有用这个线程去执行刚才那三个方法了，那么这个内存泄漏的问题依旧会存在。直到下一次执行 `expungeStaleEntry()` 时，才能解决掉刚才的内存泄漏问题。

很搞笑的一件事，如果好不容易轮转到刚刚那一个内存泄漏的线程，该线程执行了 `set()`, `get()` 销毁了之前遗留的 `StaleEntry`，但是现在执行完 `set()`, `get()` 后，就又创建了一个 `Entry` 呀，等这个线程销毁了，依旧会有一个新的 `StaleEntry` 产生，所以内存泄漏问题会一直存在。

想要解决这个内存泄漏问题非常简单，就是在每一次使用完 `ThreadLocal` 之后，调用一下 `remove()` 去销毁不用 `Entry`。直接干掉了 `Entry` 了，就不存在遗留导致 `StaleEntry` 的问题了。

```java
try {
    System.out.println(threadLocal.get());
} finally {
    threadLocal.remove();
}
```

## ThreadLocal 在线程池中的脏读问题

下面这里，为了更好的演示问题，我们创建一个线程池，并且只是设置一个线程。这里的 `pool-1-thread-1` 在执行第一个任务的时候，修改了副本的值为 `1`，即修改了自己 `ThreadLocalMap Obj` 下的 `Entry` 的 `value` 为 `1`。执行完任务，由于线程池中不会销毁线程，所以这里的 `Entry` 变成了 `Stale Entry`。接下来又提交了一个任务，好巧不巧，又是刚才线程来执行任务了，再次去获取值的时候，就会获取到了上次任务残留的 `Stale Entry`，即发生了脏读问题。

```java
private static final ThreadLocal<Integer> userId = ThreadLocal.withInitial(() -> null);

public static void main(String[] args) {
    ExecutorService threadPool = Executors.newFixedThreadPool(1);
    
    threadPool.submit(() -> {
        System.out.println(Thread.currentThread().getName() + " get " + userId.get()); // pool-1-thread-1 get null
        userId.set(1);
        System.out.println(Thread.currentThread().getName() + " get " + userId.get()); // pool-1-thread-1 get 1
    });
    
    try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

    // 按道理来说，这里应该获取到的是 null 才合理，结果这里确获取到了 1
    threadPool.submit(() -> {
        System.out.println(Thread.currentThread().getName() + " get " + userId.get()); // pool-1-thread-1 get 1
    });
    
    threadPool.shutdown();
}
```

想要解决脏读问题，也非常简单，和前面内存泄漏的问题一样，本质都是因为在使用完 `ThreadLocal` 之后并没有去手动释放 `Entry` 导致的。

下面这里在执行完任务后，去主动移除掉 `Entry`，防止产生 `Stale Entry`。

```java
private static final ThreadLocal<Integer> userId = ThreadLocal.withInitial(() -> null);

public static void main(String[] args) {
    ExecutorService threadPool = Executors.newFixedThreadPool(1);
    
    threadPool.submit(() -> {
        userId.set(1);
        System.out.println(Thread.currentThread().getName() + " get " + userId.get()); // pool-1-thread-1 get 1
        // 移除 Entry
        userId.remove();
    });
    
    try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    
    threadPool.submit(() -> {
        System.out.println(Thread.currentThread().getName() + " get " + userId.get()); // pool-1-thread-1 get null
    });
    
    threadPool.shutdown();
}
```

## ThreadLocal 在 Web 服务下的问题

其实也就只有线程池中会存在这个问题 `StaleEntry` 的问题，我们在线程中使用 `ThreadLocal` 时，要去注意手动释放 `Entry`，然后你就确定其他场景下，就不存在问题了？就不需要去手动释放 `Entry` 了？

哈哈哈，Tomcat 就是通过线程池来管理线程的，每次来一个请求，就会去分配个线程处理任务，即我们在开发 Web 服务时，在写接口时，其实在使用完 `ThreadLocal` 之后，依旧需要手动释放 `Entry`。

## ThreadLocal 保存用户上下文信息

下面这里在过滤器中，先从请求头获取 JWT，从 JWT 上解析出用户信息，将用户信息封装到 `UserContextHolder` 中，我们这里就是通过 `ThreadLocal` 来实现的 `UserContextHolder`，接下来就是执行 `filterChain.doFilter(request, response)` 放行，后续的程序就可以通过 `UserContextHolder` 来访问到用户信息了。

注意，我们在执行 `filterChain.doFilter(request, response)` 放行后，一定要在下面去手动释放 `Entry`，防止内存泄漏和脏读问题。

```java
@Component
public class AuthenticationFilter extends OncePerRequestFilter {
    @Resource
    private UserContextHolder userContextHolder;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // If the request header does not carry Login Token.
        String accessToken = request.getHeader(HttpHeaders.AUTHORIZATION);
        
        // Get user info from token.
        Long userId = Long.valueOf(accessTokenJwt.getPayload(SecurityConstant.USER_ID).toString());
        String username = accessTokenJwt.getPayload(SecurityConstant.USERNAME).toString();
        String password = accessTokenJwt.getPayload(SecurityConstant.PASSWORD).toString();
        String authoritiesJson = accessTokenJwt.getPayload(SecurityConstant.AUTHORITIES).toString();
        Collection<? extends GrantedAuthority> authorities = JSON.parseObject(authoritiesJson, new TypeReference<>() {});
        
        // Set user info to UserContext.
        UserContext userContext = new UserContext(userId, username);
        userContextHolder.setUserContext(userContext);

        // Release, execute the subsequent program.
        filterChain.doFilter(request, response);
        
        // Remove user context entry, avoid memory leaks and dirty read issues
        userContextHolder.clear();
    }
}

@Component
public class UserContextHolderImpl implements UserContextHolder {
    private static final ThreadLocal<UserContext> USER_CONTEXT_THREAD_LOCAL = new ThreadLocal<>();
    
    public void setUserContext(UserContext userContext) {
        USER_CONTEXT_THREAD_LOCAL.set(userContext);
    }
    
    public UserContext getUserContext() {
        return USER_CONTEXT_THREAD_LOCAL.get();
    }
    
    public String getUsername() {
        return getUserContext().getUsername();
    }
    
    public Long getUserId() {
        return getUserContext().getUserId();
    }
    
    public void clear() {
        USER_CONTEXT_THREAD_LOCAL.remove();
    }
}
```

## InheritableThreadLocal 的介绍

`ThreadLocal` 在不同的线程之间都采用数据备份的方案，做到线程隔离，也就是说，`ThreadLocal` 没法在父子线程之间共享 `ThreadLocal` 数据。

下面这里父线程设置了 `ThreadLocal` 的值为 `1`，子线程去访问 `ThreadLocal` 的值的时候，还是 `0`。

```java
ThreadLocal<Integer> threadLocal = ThreadLocal.withInitial(() -> 0);;

threadLocal.set(1);
System.out.println(threadLocal.get()); // 1

new Thread(() -> {
    System.out.println(threadLocal.get()); // 0
}).start();
```

`InheritableThreadLocal` 是 `ThreadLocal` 的一个扩展，它的作用是允许子线程继承父线程的 `ThreadLocal` 值。在某些情况下，子线程需要访问父线程的上下文信息，这时 `InheritableThreadLocal` 就显得非常有用。

下面这里父线程设置了 `InheritableThreadLocal` 的值为 `1`，子线程去访问 `InheritableThreadLocal` 的值的时候，可以访问到父线程设置的 `1`。

```java
InheritableThreadLocal<Integer> threadLocal = new InheritableThreadLocal<>();

threadLocal.set(1);
System.out.println(threadLocal.get()); // 1

new Thread(() -> {
    System.out.println(threadLocal.get()); // 1
}).start();
```

可以通过 `InheritableThreadLocal` 在父线程和子线程之间共享用户会话信息。

```java
private static final InheritableThreadLocal<String> sessionInfo = new InheritableThreadLocal<>();

public static void main(String[] args) {
    sessionInfo.set("UserSessionID: 123456");

    System.out.println("Par Thread: " + sessionInfo.get());

    new Thread(() -> {
        System.out.println("Sub Thread: " + sessionInfo.get());
    }).start();

    sessionInfo.remove();
}
```

## InheritableThreadLocal 的详细实现原理

`Thread` 不仅仅维护了一个 `ThreadLocalMap threadLocals`，还维护了一个 `ThreadLocalMap inheritableThreadLocals`。

```java
public class Thread implements Runnable {
    ThreadLocal.ThreadLocalMap threadLocals = null;
    ThreadLocal.ThreadLocalMap inheritableThreadLocals = null;
}
```

创建 `Thread Obj` 时，会调用 `init()` 去初始化每一个 `Thread Obj`。在初始化过程中，就会去判断父线程是否有 `inheritableThreadLocals`，如果有，就说明父线程也使用了这个 `InheritableThreadLocal`，此时子线程就基于父线程的 `inheritableThreadLocals` 创建一个 `ThreadLocal`，存储到自己的 `inheritableThreadLocals` 中。

```java
public class Thread implements Runnable {
    private void init(ThreadGroup g, Runnable target, String name, long stackSize, AccessControlContext acc, boolean inheritThreadLocals) {
        // 这里的 currentThread() 是父线程 (当前执行 init() 的线程), this 是子线程 (正在被创建的线程)
        Thread parent = currentThread();
        
        if (inheritThreadLocals && parent.inheritableThreadLocals != null)
            this.inheritableThreadLocals = ThreadLocal.createInheritedMap(parent.inheritableThreadLocals);
    
        // ...
    }

    static ThreadLocalMap createInheritedMap(ThreadLocalMap parentMap) {
        return new ThreadLocalMap(parentMap);
    }
}
```

`InheritableThreadLocal` 继承自 `ThreadLocal`，并且重写了 `set()`, `get()`, `remove()` 方法，不再去操作 `Thread Obj` 的 `threadLocals` 了，而是去操作的 `inheritableThreadLocals`。

```java
public class ThreadLocal<T> {
    public T get() {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        // Do something with the map
    }
}
```

```java
public class InheritableThreadLocal<T> extends ThreadLocal<T> {
    ThreadLocalMap getMap(Thread t) {
       return t.inheritableThreadLocals;
    }
}
```

## TransmittableThreadLocal 的介绍

`TransmittableThreadLocal` 是阿里巴巴开源的一个工具类，简称 TTL，它增强了 Java 自带的 `InheritableThreadLocal`，旨在解决 `ThreadLocal` 在使用线程池和异步编程时上下文传递的问题，并且在一定程度上解决了线程池中线程复用时的脏读问题和内存泄漏问题。

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>transmittable-thread-local</artifactId>
    <version>2.14.5</version>
</dependency>
```

下面这段代码中，通过 TTL 解决父子线程之间上下文传递问题。

```java
TransmittableThreadLocal<Integer> threadLocal = new TransmittableThreadLocal<>();

threadLocal.set(1);
System.out.println(threadLocal.get()); // 1

new Thread(() -> {
    System.out.println(threadLocal.get()); // 1
}).start();
```

下面这段代码中，通过 TTL 的 `TtlExecutors` 线程池，在执行完子线程任务后，会去帮我释放 `ThreadLocal` 的 `Entry`，即我们再也不需要担心内存泄漏和脏读的问题了。

```java
TransmittableThreadLocal<Integer> threadLocal = new TransmittableThreadLocal<>();

ExecutorService jdkExecutorService = Executors.newFixedThreadPool(1);
ExecutorService ttlExecutorService = TtlExecutors.getTtlExecutorService(jdkExecutorService);

ttlExecutorService.submit(() -> {
    System.out.println(Thread.currentThread().getName() + " get " + threadLocal.get()); // pool-1-thread-1 get null
    threadLocal.set(1);
    System.out.println(Thread.currentThread().getName() + " get " + threadLocal.get()); // pool-1-thread-1 get 1
});

try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

ttlExecutorService.submit(() -> {
    System.out.println(Thread.currentThread().getName() + " get " + threadLocal.get()); // pool-1-thread-1 get null
});
```

TTL 的线程池底层本质上就是通过代理的方式，代理了 `Runnable` 和 `Callable`，在任务执行前进行上下文传递，保证子线程能访问父线程的 `ThreadLocal` 值。在执行任务后，释放 `Entry`，解决线程池中线程复用时的脏读问题和内存泄漏问题。

```java
public final class TtlRunnable implements Runnable {
    private final Runnable runnable;
    private final Map<TransmittableThreadLocal<?>, Object> captured;

    // 代理 Runnable，执行任务前，进行上下文传递
    private TtlRunnable(Runnable runnable) {
        this.runnable = runnable;
        this.captured = TransmittableThreadLocal.Transmitter.capture();
    }

    public static TtlRunnable get(Runnable runnable) {
        if (runnable == null) {
            return null;
        }
        return new TtlRunnable(runnable);
    }

    @Override
    public void run() {
        Map<TransmittableThreadLocal<?>, Object> backup = TransmittableThreadLocal.Transmitter.replay(captured);
        try {
            runnable.run();
        } finally {
            // 代理 Runnable，执行任务后，释放 Entry，解决线程池中线程复用时的脏读问题和内存泄漏问题
            TransmittableThreadLocal.Transmitter.restore(backup);
        }
    }
}

```
