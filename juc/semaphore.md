# Semaphore

Semaphore 是一个同步工具类, 用于控制对临界资源的访问, Semaphore 维护了一个信号量，表示可用的许可数, 线程可以通过 acquire() 方法获取许可, 通过 release() 方法释放许可, 主要用于限制同时访问某个资源的线程数量

acquire() 获取一个许可. 如果当前有可用许可, 则线程将获取许可并继续执行; 如果没有可用许可，则线程将阻塞，直到有许可可用或线程被中断

acquire(int permits) 获取指定数量的许可. 如果当前可用许可数不足, 则线程将阻塞, 直到有足够数量的许可可用或线程被中断

acquire(long timeout, TimeUnit unit), 使线程在等待获取许可时最多等待一定的时间, 超过该时间后会放弃获取许可而继续执行

release() 释放一个许可. 将许可归还给信号量, 增加可用许可数. 如果有其他线程在等待许可, 会选择其中一个线程唤醒

release(int permits) 释放指定数量的许可. 增加可用许可数, 并唤醒等待许可的线程

availablePermits() 获取当前可用的许可数

```java
Semaphore semaphore = new Semaphore(3);

for (int i = 0; i < 5; i++) {
    new Thread(() -> {
        try {
            System.out.println(Thread.currentThread().getName() + " is waiting for a permit...");
            
            semaphore.acquire();
            System.out.println(Thread.currentThread().getName() + " gets a permit.");
            
            Thread.sleep(2000);
            
            System.out.println(Thread.currentThread().getName() + " releases the permit.");
            semaphore.release();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }).start();
}
```

# Semaphore vs Lock

Semaphore 允许多个线程同时访问共享资源, 可以通过设置合适的许可数量来控制并发度, 较为灵活

Lock 在同一时刻只允许一个线程访问共享资源, 较为严格
