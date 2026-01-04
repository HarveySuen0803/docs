# Batch Insert

```java
@Resource
private UserMapper userMapper;

@Resource
private ExecutorService executorService;

public void save() {
    List<UserPo> userPoList = new ArrayList<>();
    for (int i = 0; i < 1000000; i++) {
        userPoList.add(new UserPo());
    }
    
    int batchSize = 10000;
    int batchCount = userPoList.size() / batchSize + 1;
    
    List<List<UserPo>> userPoBatchList = CollUtil.split(userPoList, batchSize);
    
    CountDownLatch countDownLatch = new CountDownLatch(batchCount);
    
    for (List<UserPo> userPoBatch : userPoBatchList) {
        executorService.submit(() -> {
            try {
                userMapper.save(userPoBatch);
            } finally {
                countDownLatch.countDown();
            }
        });
    }
    
    try {
        countDownLatch.await();
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
}
```