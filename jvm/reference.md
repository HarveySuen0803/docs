# Strong Reference

GC 不会回收 Strong Reference

```java
public class Main {
    public static void main(String[] args) {
        User User = new User();

        // simulate OOM
        new Thread(() -> {
            ArrayList<Object> list = new ArrayList<>();
            while (true) {
                list.add(new byte[1 * 1024 * 1024]);
                try { TimeUnit.MILLISECONDS.sleep(100); } catch (InterruptedException e) { e.printStackTrace(); }
                System.out.println(phantomReference.get());
            }
        }).start();
    }
}

class User {
    // used for test
    @Override
    protected void finalize() throws Throwable {
        System.out.println("invoke before finalize");
    }
}
```

# Soft Reference

memory 不够用时, 回收 Soft Reference, 适合保存可有可无的缓存数据

```java
SoftReference<User> softReference = new SoftReference<>(new User());

System.out.println(softReference.get()); // com.harvey.User@28a418fc
```

# Weak Reference

只要发生 gc, 就会立即回收 Weak Reference, 适合保存可有可无的缓存数据

```java
WeakReference<User> weakReference = new WeakReference<>(new User());
```

WeakHashMap 底层维护了一个 Weak Reference 的 Entry, 用于存储一系列 WeakReference

```java
WeakHashMap weakHashMap = new WeakHashMap();
```

```java
public class WeakHashMap<K,V> {
    private static class Entry<K,V> extends WeakReference<Object> implements Map.Entry<K,V> {}
}
```

# Phantom Reference

PhantomReferene 可用于通知 Object 的回收情况, 相比 finalize() 更灵活, 这个 Reference 就好像不存在一样, 即 Phantom, 幻影.

PhantomReferene 需要搭配 ReferenceQueue 使用. GC 回收 Obj 时, 发现该 Obj 还有 PhantomReferene 指向, 就会将该 PhantomReferene 加入 Queue, 一个一个的通知回收情况.

```java
ReferenceQueue<User> phantomQueue = new ReferenceQueue<>();
PhantomReference<User> phantomReference = new PhantomReference<>(new User(), phantomQueue);

new Thread(() -> {
    while (true) {
        if (phantomQueue.remove() != null) {
            System.out.println("Phantom Reference entered the queue");
            break;
        }
    }
}).start();

user = null;
System.gc();
```
    
可以通过 PhantomReferene 实现一些资源释放操作

```java
FileInputStream fis = new FileInputStream("/Users/HarveySuen/Downloads/test.txt");

ReferenceQueue<FileInputStream> phantomQueue = new ReferenceQueue<>();
PhantomReference<FileInputStream> phantomReference = new PhantomReference<>(fis, phantomQueue);

fis = null;
System.gc();

// Waiting for GC
try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

Reference<? extends FileInputStream> ref = phantomQueue.remove();
if (ref != null) {
    // Get the reference and close the connection
    ref.get().close();
}
```

