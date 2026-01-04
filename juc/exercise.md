# Selling Tickets

```java
public class Main {
    public static void main(String[] args) throws InterruptedException {
        SellTicket sellTicket1 = new SellTicket();
        SellTicket sellTicket2 = new SellTicket();
        SellTicket sellTicket3 = new SellTicket();
        sellTicket1.start();
        sellTicket2.start();
        sellTicket3.start();
    }
}

class SellTicket extends Thread {
    private static int poll = 100;
    private static boolean loop = true;

    private synchronized static void sellTicket() {
        if (poll <= 0) {
            System.out.println("tickets sold out");
            loop = false;
            return;
        }

        System.out.println(Thread.currentThread().getName() + " " + poll--);

        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        while (loop) {
            sellTicket();
        }
    }
}
```

# Selling Tickets

```java
public class Main {
    public static void main(String[] args) throws InterruptedException {
        SellTicket sellTicket = new SellTicket();
        Thread thread1 = new Thread(sellTicket);
        Thread thread2 = new Thread(sellTicket);
        Thread thread3 = new Thread(sellTicket);
        thread1.start();
        thread2.start();
        thread3.start();
    }
}

class SellTicket implements Runnable {
    private int poll = 100;
    private boolean loop = true;

    private synchronized void sellTicket() {
        if (poll <= 0) {
            System.out.println("tickets sold out");
            loop = false;
            return;
        }

        System.out.println(Thread.currentThread().getName() + " " + poll--);

        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        while (loop) {
            sellTicket();
        }
    }
}
```

# Selling Tickets

```java
public class Main {
    public static void main(String[] args) throws InterruptedException, ExecutionException, TimeoutException {
        SellTicket sellTicket = new SellTicket();
        Thread thread1 = new Thread(sellTicket);
        Thread thread2 = new Thread(sellTicket);
        Thread thread3 = new Thread(sellTicket);
        thread1.start();
        thread2.start();
        thread3.start();
    }
}

class SellTicket implements Runnable {
    private int poll = 100;
    private boolean loop = true;
    private ReentrantLock lock = new ReentrantLock(true);
    
    private void sellTicket() {
        lock.lock();
        try {
            if (poll <= 0) {
                System.out.println("tickets sold out");
                loop = false;
                return;
            }
            System.out.println(Thread.currentThread().getName() + " " + poll--);
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
    
    @Override
    public void run() {
        while (loop) {
            sellTicket();
        }
    }
}
```

# Batch Import Data

项目上线之前, 需要把数据库中的数据一次性的同步到 ES 中, 一次性读取数据肯定不行 (OOM), 可以通过 CountDownLatch + ThreadPool 分批次导入数据

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202402071205444.png)

```java
// 模拟数据库的数据
private static final int TOTAL_SIZE = 1000;
private static final int PAGE_SIZE = 100;

public static void main(String[] args) {
    // 模拟从数据库获取数据
    // 实际中，这里应该是通过数据库连接获取数据
    String[] dataFromDB = new String[TOTAL_SIZE];
    for (int i = 0; i < TOTAL_SIZE; i++) {
        dataFromDB[i] = "Data-" + (i + 1);
    }

    // Elasticsearch 导入线程池
    ExecutorService esImportThreadPool = Executors.newFixedThreadPool(5);

    // CountDownLatch 用于控制并发度
    CountDownLatch countDownLatch = new CountDownLatch((int) Math.ceil((double) TOTAL_SIZE / PAGE_SIZE));

    // 模拟分批次导入数据到 Elasticsearch
    for (int i = 0; i < TOTAL_SIZE; i += PAGE_SIZE) {
        int startIndex = i;
        int endIndex = Math.min(i + PAGE_SIZE, TOTAL_SIZE);

        // 提交任务到线程池
        esImportThreadPool.submit(() -> {
            try {
                // 模拟导入数据到 Elasticsearch
                importDataToES(dataFromDB, startIndex, endIndex);

            } finally {
                // 每次导入完成后，减少 CountDownLatch 计数
                countDownLatch.countDown();
            }
        });
    }

    try {
        // 等待所有任务完成
        countDownLatch.await();
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        // 关闭线程池
        esImportThreadPool.shutdown();
    }
}

// 模拟导入数据到 Elasticsearch 的方法
private static void importDataToES(String[] dataFromDB, int startIndex, int endIndex) {
    // 实际中，这里应该是将 dataFromDB[startIndex, endIndex) 的数据导入到 Elasticsearch
    System.out.println("Importing data to ES: " + startIndex + " to " + endIndex);
}
```

# Data Aggregation

在一个电商网站中, 用户下单之后, 需要查询数据, 数据包含订单信息, 商品信息, 物流信息, 这三块信息都在不同的微服务中进行实现的, 可以使用 ThreadPool + Future 来提升性能, 避免串行等待, 只需要等待耗时最长的那个任务即可

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202402071224335.png)

```java
ExecutorService executorService = Executors.newFixedThreadPool(3);

Future<Map<String, Object>> f1 = executorService.submit(() -> {
    return restTemplate.getForObject("http://order-service/order/get/{id}", Map.class, 1);
});

Future<Map<String, Object>> f2 = executorService.submit(() -> {
    return restTemplate.getForObject("http://product-service/product/get/{id}", Map.class, 1);
});

Future<Map<String, Object>> f3 = executorService.submit(() -> {
    return restTemplate.getForObject("http://logistics-service/logistics/get/{id}", Map.class, 1);
});

Map<String, Object> resultMap = new HashMap<>();
resultMap.put("order", f1.get());
resultMap.put("product", f2.get());
resultMap.put("logistics", f3.get());
executorService.shutdown();
```

# Async Invocation

在进行搜索的时候, 需要保存用户的搜索记录, 而搜索记录不能影响用户的正常搜索, 我们通常会开启一个线程去执行历史记录的保存, 在新开启的线程在执行的过程中，可以利用线程提交任务

```java
orderService.get(keyword);
searchHistoryService.add(userId, keyword);
```

```java
@Service
public class SearchHistoryService {
    @Async("taskExecutor")
    @Override
    public void add(Integer userId, String keyword) {
        log.info("Add search history",userId, keyword);
    }
}
```