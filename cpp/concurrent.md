# std::thread

以下是一个简单的多线程示例：

```cpp
void print_message(const std::string& msg, const std::string& name, int cnt) {
    for (int i = 0; i < cnt; i++) {
        std::cout << "msg: " << msg << ", name: " << name << std::endl;
    }
}

int main() {
    // 创建线程
    std::thread t1(print_message, "hello world", "thread 1", 5);
    std::thread t2(print_message, "hello world", "thread 2", 3);

    // 等待线程结束
    t1.join();
    t2.join();

    return 0;
}
```

使用 lambda 创建线程：

```cpp
int main() {
    std::string msg = "hello world";
    std::string name = "thread 1";
    int cnt = 5;

    std::thread t1([msg, name, cnt]() {
        for (int i = 0; i < cnt; i++) {
            std::cout << "msg: " << msg << ", name: " << name << std::endl;
        }
    });

    t1.join();

    return 0;
}
```

detach() 是 std::thread 的一个成员函数，用于将线程与当前的 std::thread 对象分离，转为后台线程运行，它的生命周期由操作系统管理，而不再由 std::thread 对象管理，即便 std::thread 已经提前效果，也不会影响到分离后到线程。线程会在后台继续运行，直到任务完成后，其资源会被系统自动回收。

```cpp
void print_numbers() {
    for (int i = 1; i <= 5; ++i) {
        std::cout << "Number: " << i << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
}

int main() {
    // 创建线程
    std::thread t(print_numbers);

    // 将线程分离
    t.detach();

    // 主线程继续执行
    std::cout << "Main thread continues..." << std::endl;

    // 等待一段时间以观察后台线程输出
    std::this_thread::sleep_for(std::chrono::seconds(6));

    return 0;
}
```

# std::mutex

在多线程中，多个线程可能会访问共享数据，导致数据竞争。为了解决这些问题，可以使用互斥锁（std::mutex）。

```cpp
std::mutex mtx;
int counter = 0;

void increment_counter(const std::string& name) {
    for (int i = 0; i < 5; i++) {
        std::lock_guard<std::mutex> lock(mtx); // 自动加锁解锁
        counter++;
        std::this_thread::sleep_for(std::chrono::milliseconds(100)); // 睡 100ms
        std::cout << name << " increment counter to " << counter << std::endl;
    }
}

int main() {
    std::thread t1(increment_counter, "thread 1");
    std::thread t2(increment_counter, "thread 2");
    t1.join();
    t2.join();
    std::cout << "final counter: " << counter << std::endl;
    return 0;
}
```

```
thread 1 increment counter to 1
thread 2 increment counter to 2
thread 1 increment counter to 3
thread 2 increment counter to 4
thread 2 increment counter to 5
...
final counter: 10
```

# std::lock_guard

std::lock_guard 是一种 RAII 风格的锁机制，确保异常情况下也能自动释放锁。简单易用，专注于锁的基本管理，在构造时加锁，在析构时解锁。不支持锁的延迟、解锁后重新锁定或转移所有权。

std::lock_guard 适合简单的加锁解锁，生命周期内锁操作不复杂的场景。

```cpp
std::mutex mtx;

void print_message(const std::string& message) {
    // 构造时加锁，析构时自动解锁
    std::lock_guard<std::mutex> lock(mtx);
    std::cout << message << std::endl;
}

int main() {
    std::thread t1(print_message, "Hello from Thread 1");
    std::thread t2(print_message, "Hello from Thread 2");

    t1.join();
    t2.join();
    return 0;
}
```

# std::unique_lock

std::unique_lock 是一种 RAII 风格的锁机制，相比 std::lock_guard，提供了更多的锁管理灵活性。

std::unique_lock 适合需要更灵活的锁操作的场景。

- 延迟锁定：可以在构造时不锁定，稍后手动锁定。
- 解锁后重新锁定：支持动态解锁和重新锁定。
- 锁的所有权转移：可以将锁的所有权转移到另一个 std::unique_lock 对象。

std::unique_lock 可以延迟锁定，可以在构造时不锁定，稍后手动锁定。

```cpp
std::mutex mtx;

void print_message(const std::string& message) {
    std::unique_lock<std::mutex> lock(mtx, std::defer_lock); // 延迟锁定
    // 手动锁定
    lock.lock();
    std::cout << message << std::endl;
    // 手动解锁
    lock.unlock();
}

int main() {
    std::thread t1(print_message, "Hello from Thread 1");
    std::thread t2(print_message, "Hello from Thread 2");

    t1.join();
    t2.join();
    return 0;
}
```

std::unique_lock 可以基于 C++ 的 RAII（Resource Acquisition Is Initialization）机制自动管理锁的生命周期，从而实现锁的自动释放。

```cpp
std::mutex mtx;

void critical_section(int thread_id) {
    std::unique_lock<std::mutex> lock(mtx);  // 加锁
    // 临界区代码
    std::cout << "Thread " << thread_id << " is in the critical section.\n";
    // 不需要显式调用 lock.unlock()，作用域结束时会自动释放锁
}

int main() {
    std::thread t1(critical_section, 1);
    std::thread t2(critical_section, 2);

    t1.join();
    t2.join();

    return 0;
}
```

- 每个线程进入 critical_section 函数时，创建一个 std::unique_lock 对象并加锁。
- 在函数结束时，std::unique_lock 对象析构，自动释放锁。
- 不同线程依次进入临界区，避免数据竞争。

std::unique_lock 可以转移锁的所有权。

```cpp
std::mutex mtx;

void thread2_task(std::unique_lock<std::mutex> lock) {
    std::cout << "thread 2 acquirred the lock" << std::endl;
}

void thread1_task() {
    std::unique_lock<std::mutex> lock(mtx);
    std::cout << "thread 1 transfering the lock" << std::endl;
    std::thread t2(thread2_task, std::move(lock)); // 转移锁的所有权到另一个线程
    t2.join();
}

int main() {
    std::thread t1(thread1_task);
    t1.join();
    return 0;
}
```

std::unique_lock 可以搭配条件变量 std::condition_variable 动态控制加锁解锁。

```cpp
std::mutex mtx;
std::condition_variable cv;
bool ready = false;

void work() {
    std::unique_lock<std::mutex> lock(mtx); // 给 mtx 加锁
    cv.wait(lock, []() {return ready;}); // 解锁，等待 ready 为 true
    std::cout << "Worker thread is running" << std::endl;
}

int main() {
    std::thread worker(work);
    {
        std::unique_lock<std::mutex> lock(mtx);
        ready = true;
    }
    cv.notify_all(); // 唤醒等待线程
    worker.join();
    return 0;
}
```

- std::unique_lock 必须与 std::condition_variable 一起使用，因为 std::condition_variable 需要访问锁对象。
- cv.wait(lock, predicate) 会释放锁并阻塞线程，直到条件满足。

# std::call_once

std::call_once 用于确保某段代码只执行一次，无论有多少线程调用它。它与 std::once_flag 配合使用，能够高效地实现单次初始化模式（One-Time Initialization），常用于初始化全局资源或配置。

以下代码展示了如何使用 std::call_once 和 std::once_flag 确保全局资源只初始化一次：

```cpp
std::once_flag init_flag; // 标志变量，用于记录是否已初始化

void initialize(const std::string& msg, int val) {
    std::cout << "Initializing resources, msg: " << msg << ", val: " << val << std::endl;
}

void thread_task() {
    std::cout << "Thread " << std::this_thread::get_id() << " is trying to initialize." << std::endl;
    std::call_once(init_flag, initialize, "hello world", "42"); // 只会调用一次 initialize()
}

int main() {
    std::thread t1(thread_task);
    std::thread t2(thread_task);
    std::thread t3(thread_task);

    t1.join();
    t2.join();
    t3.join();

    return 0;
}
```

```
Thread 139981905270528 is trying to initialize.
Initializing resources, msg: hello world, val: 42
Thread 139981896877824 is trying to initialize.
Thread 139981888485120 is trying to initialize.
```

std::call_once 非常适合实现线程安全的单例模式。

```cpp
class Singleton {
private:
    Singleton() = default;
    static Singleton* instance;
    static std::once_flag init_flag;
public:
    static Singleton& get_instance() {
        std::call_once(init_flag, [] {
            instance = new Singleton();
            std::cout << "Singleton instance initialized" << std::endl;
        });
        return *instance;
    }
};

Singleton* Singleton::instance = nullptr;
std::once_flag Singleton::init_flag;

int main() {
    Singleton& s1 = Singleton::get_instance();
    Singleton& s2 = Singleton::get_instance();
    Singleton& s3 = Singleton::get_instance();
    return 0;
}
```

# std::async

std::async 是一种方便的方式，可以在后台执行一个任务，并返回一个 std::future 对象，用于获取任务的结果。

```cpp
int compute(int x, int y) {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    return x + y;
}

int main() {
    // 异步调用 compute 函数
    std::future<int> result = std::async(std::launch::async, compute, 5, 10);

    std::cout << "Computing asynchronously...\n";

    // 在这里可以进行其他操作
    std::this_thread::sleep_for(std::chrono::seconds(1));
    std::cout << "Still working...\n";

    // 获取异步任务的结果（会阻塞直到任务完成）
    int value = result.get();
    std::cout << "Result: " << value << "\n";

    return 0;
}
```

# std::future

std::future 是一个持有异步任务结果的对象，可以用来访问任务返回值，或者检查任务是否完成。

```cpp
int compute(int x, int y) {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    return x + y;
}

int main() {
    // 异步调用任务
    std::future<int> result = std::async(std::launch::async, compute, 5, 10);

    // 检查任务状态
    while (result.wait_for(std::chrono::milliseconds(500)) != std::future_status::ready) {
        std::cout << "Task is not ready yet...\n";
    }

    std::cout << "Task is ready!\n";
    std::cout << "Result: " << result.get() << "\n";

    return 0;
}
```

wait_for：允许检查任务状态，返回以下值：

- std::future_status::ready：任务完成。
- std::future_status::timeout：等待超时。
- std::future_status::deferred：任务未启动。

# std::packaged_task

std::packaged_task 是一个函数包装器，它可以包装任何可调用对象（普通函数、Lambda、函数对象等），并将其 异步执行的结果 通过 std::future 进行管理。

```cpp
// 计算平方的函数
int square(int x) {
    return x * x;
}

int main() {
    // 1. 用 std::packaged_task 包装 square 函数
    std::packaged_task<int(int)> task(square);

    // 2. 获取 future，用于获取任务的执行结果
    std::future<int> result = task.get_future();

    // 3. 在新线程中执行任务
    std::thread t(std::move(task), 5);
    
    // 4. 阻塞等待获取任务执行结果
    std::cout << "5^2 = " << result.get() << std::endl;

    // 5. 确保线程执行完毕，
    t.join();

    return 0;
}
```

- 这里执行 `t.join()` 是为了保证子线程完整的结束生命周期，`result.get()` 阻塞等待到了返回结果不代表子线程的生命周期结束了，这里必须执行 `t.join()`，否则会导致资源泄露或未定义行为。

std::packaged_task 也可以包装 Lambda 表达式：

```cpp
std::packaged_task<int(int, int)> task([](int a, int b) {
    return a + b;
});
```

---

**示例：包装一个复杂模版函数**

```cpp
template<typename Func, typename... Args>
auto submit(Func&& func, Args&&... args) -> std::future<decltype(func(args...))> {
    using return_type = decltype(func(args...));
    // 通过 std::packaged_task 创建了一个任务包装器，包装了一个可调用对象（注意区分可调用对象和函数对象），无参，返回值是 return_type
    // 通过 std::make_shared 创建一个智能指针，指向任务包装器
    // 通过 std::bind(std::forward<Func>(func), std::forward<Args>(args)...) 创建一个无参函数对象交给任务包装器，这个无参函数对象本质上就是在调用 func(args...)
    auto task = std::make_shared<std::packaged_task<return_type()>>(
        std::bind(std::forward<Func>(func), std::forward<Args>(args)...)
    );
    auto future = task->get_future();
    // ...
    return future;
}
```

# std::promise

std::promise 是一个承诺值的容器，通常与 std::future 配合使用，用于在线程之间显式传递数据。

```cpp
void produce(std::promise<int> promise) {
    std::cout << "Producint the resource..." << std::endl;
    sleep(1);
    promise.set_value(10);
}

void consume(std::future<int> future) {
    std::cout << "Waiting for the resource..."  << std::endl;
    int res = future.get();
    std::cout << "Get the resource: " << res << std::endl;
}

int main() {
    std::promise<int> promise;
    std::future<int> future = promise.get_future();

    std::thread t1(produce, std::move(promise));
    std::thread t2(consume, std::move(future));

    t1.join();
    t2.join();

    return 0;
}
```

使用 std::promise 实现一个生产者消费者模型。

```cpp
std::queue<int> dataQueue;
std::mutex mtx;
std::condition_variable cv;
bool done = false;

void producer(std::promise<void> prom) {
    for (int i = 0; i < 10; ++i) {
        {
            std::lock_guard<std::mutex> lock(mtx);
            dataQueue.push(i);
            std::cout << "Produced: " << i << std::endl;
        }
        cv.notify_one(); // 唤醒消费者
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
    prom.set_value(); // 通知完成
}

void consumer(std::future<void> fut) {
    while (true) {
        std::unique_lock<std::mutex> lock(mtx);
        cv.wait(lock, [] { return !dataQueue.empty() || done; });

        if (!dataQueue.empty()) {
            int val = dataQueue.front();
            dataQueue.pop();
            std::cout << "Consumed: " << val << std::endl;
        } else if (done) {
            break;
        }
    }
    fut.get(); // 等待生产者完成通知
}

int main() {
    std::promise<void> prom;
    std::future<void> fut = prom.get_future();

    std::thread producerThread(producer, std::move(prom));
    std::thread consumerThread(consumer, std::move(fut));

    producerThread.join();
    {
        std::lock_guard<std::mutex> lock(mtx);
        done = true;
    }
    cv.notify_one();
    consumerThread.join();

    return 0;
}
```

# std::atomic

原子操作是指通过标准库提供的 std::atomic 类型实现的线程安全操作，这些操作无需锁机制即可保证操作的原子性。在多线程编程中，原子操作用于避免竞争条件，确保多个线程对共享变量的操作不会出现数据竞态。

- 原子操作是不可分割的，即操作在任意时间点，要么完成全部操作，要么不执行任何操作。
- 使用原子操作时，其他线程无法观察到变量的中间状态。
- 不需要显式使用锁（如 std::mutex），避免了锁竞争。
- 在硬件支持下，性能优于基于锁的线程同步。

```cpp
std::atomic<int> counter(0); // 原子计数器

void increment(int n) {
    for (int i = 0; i < n; ++i) {
        ++counter; // 原子递增操作
    }
}

int main() {
    std::thread t1(increment, 1000);
    std::thread t2(increment, 1000);

    t1.join();
    t2.join();

    std::cout << "Final counter value: " << counter.load() << std::endl; // 使用 load 获取值
    return 0;
}
```

```
Final counter value: 2000
```

- std::atomic 提供线程安全的整数操作，++counter 是原子的，不会发生竞争条件。

原子操作支持 Compare-and-Swap（比较并交换），即在更新值前检查当前值是否等于预期值。

```cpp
std::atomic<int> counter(0);

void update_if_match(int expected, int desired) {
    int current = counter.load(); // 加载当前值
    if (counter.compare_exchange_strong(expected, desired)) {
        std::cout << "Updated from " << current << " to " << desired << std::endl;
    } else {
        std::cout << "Update failed, current value: " << counter.load() << std::endl;
    }
}

int main() {
    counter.store(10); // 初始化值为 10

    std::thread t1(update_if_match, 10, 20); // 如果 counter == 10，更新为 20
    std::thread t2(update_if_match, 10, 30); // 如果 counter == 10，更新为 30

    t1.join();
    t2.join();

    std::cout << "Final counter value: " << counter.load() << std::endl;
    return 0;
}
```

```
Updated from 10 to 20
Update failed, current value: 20
Final counter value: 20
```

fetch_add 是一种更显式的递增方法，返回操作前的值。

```cpp
std::atomic<int> counter(0);

void add_value(int value) {
    int prev = counter.fetch_add(value); // 原子加操作
    std::cout << "Thread added " << value << ", previous value: " << prev << std::endl;
}

int main() {
    std::thread t1(add_value, 5);
    std::thread t2(add_value, 10);

    t1.join();
    t2.join();

    std::cout << "Final counter value: " << counter.load() << std::endl;
    return 0;
}
```

```
Thread added 5, previous value: 0
Thread added 10, previous value: 5
Final counter value: 15
```

# std::atomic_flag

std::atomic_flag 是最简单的原子类型，常用于实现自旋锁。

```cpp
std::atomic_flag lock = ATOMIC_FLAG_INIT; // 初始化为未设置

void critical_section(int id) {
    while (lock.test_and_set(std::memory_order_acquire)) {
        // 自旋等待，直到锁可用
    }
    std::cout << "Thread " << id << " is in critical section.\n";
    lock.clear(std::memory_order_release); // 释放锁
}

int main() {
    std::thread t1(critical_section, 1);
    std::thread t2(critical_section, 2);

    t1.join();
    t2.join();

    return 0;
}
```

```
Thread 1 is in critical section.
Thread 2 is in critical section.
```

# std::memory_order

在现代处理器和编译器优化中，为了提高性能，可能会发生指令重排序，即代码的执行顺序可能与编写顺序不同。C++ 的 std::atomic 和 memory_order 提供了一种精细控制这种行为的机制，确保多线程程序中的可预测性和正确性。

memory_order 是用来防止指令重排序的，它定义了原子操作在多线程程序中如何与内存的其他操作进行同步，确保操作顺序的一致性。

- std::memory_order_relaxed：无同步，仅保证原子性。
- std::memory_order_acquire：获取操作，确保此操作之前的读写操作对当前线程可见。
- std::memory_order_release：释放操作，确保此操作之后的读写操作对其他线程可见。

```cpp
std::atomic<int> data(0);
std::atomic<bool> ready(false);

void producer() {
    data.store(42, std::memory_order_relaxed); // 无同步，仅原子写
    ready.store(true, std::memory_order_release); // 发布信号
}

void consumer() {
    while (!ready.load(std::memory_order_acquire)) {
        // 等待信号
    }
    std::cout << "Data: " << data.load(std::memory_order_relaxed) << std::endl;
}

int main() {
    std::thread t1(producer);
    std::thread t2(consumer);

    t1.join();
    t2.join();

    return 0;
}
```

- memory_order_release 确保写入操作在 ready.store(true) 之前完成。
- memory_order_acquire 确保读取操作在 ready.load() 之后开始。

在多线程中，重排序可能导致不可预测的行为。例如这里采用了 memory_order_relaxed 策略，不防止指令重排序，C2 可能在 C1 之前执行，这就会导致消费者读取到 data 时可能还是未初始化的状态（data == 0）

```cpp
std::atomic<int> data(0);
std::atomic<bool> flag(false);

void producer() {
    data.store(42, std::memory_order_relaxed); // 写数据（C1）
    flag.store(true, std::memory_order_relaxed); // 设置标志（C2）
}

void consumer() {
    while (!flag.load(std::memory_order_relaxed)); // 等待标志为真（C3）
    int value = data.load(std::memory_order_relaxed); // 读取数据（C4）
    std::cout << "Data: " << value << std::endl;
}

int main() {
    std::thread t1(producer);
    std::thread t2(consumer);

    t1.join();
    t2.join();

    return 0;
}
```

采用 memory_order_release 确保 C1 在 C2 之前执行，采用 memory_order_acquire 确保消费者读取到 flag == true 之后，能看见生产者设置的 data。

```cpp
std::atomic<int> data(0);
std::atomic<bool> flag(false);

void producer() {
    data.store(42, std::memory_order_release); // 写数据，释放语义（C1）
    flag.store(true, std::memory_order_release); // 设置标志，释放语义（C2）
}

void consumer() {
    while (!flag.load(std::memory_order_acquire)); // 获取标志，获取语义（C3）
    int value = data.load(std::memory_order_acquire); // 读取数据，获取语义（C4）
    std::cout << "Data: " << value << std::endl;
}

int main() {
    std::thread t1(producer);
    std::thread t2(consumer);

    t1.join();
    t2.join();

    return 0;
}
```

# std::counting_semaphore

std::counting_semaphore 表示一个计数信号量，计数器有上限，可以控制多个线程同时访问共享资源。

```cpp
std::counting_semaphore<3> semaphore(3); // 最大计数为 3，初始计数为 3

void worker(int id) {
    std::cout << "Thread " << id << " waiting to acquire semaphore...\n";
    semaphore.acquire(); // 等待信号量
    std::cout << "Thread " << id << " acquired semaphore.\n";

    std::this_thread::sleep_for(std::chrono::seconds(2)); // 模拟工作
    std::cout << "Thread " << id << " releasing semaphore.\n";

    semaphore.release(); // 释放信号量
}

int main() {
    std::vector<std::thread> threads;

    for (int i = 0; i < 6; ++i) {
        threads.emplace_back(worker, i); // 创建 6 个线程
    }

    for (auto& t : threads) {
        t.join(); // 等待所有线程完成
    }

    return 0;
}
```

```
Thread 0 waiting to acquire semaphore...
Thread 0 acquired semaphore.
Thread 1 waiting to acquire semaphore...
Thread 1 acquired semaphore.
Thread 2 waiting to acquire semaphore...
Thread 2 acquired semaphore.
Thread 3 waiting to acquire semaphore...
Thread 4 waiting to acquire semaphore...
Thread 5 waiting to acquire semaphore...
Thread 0 releasing semaphore.
Thread 3 acquired semaphore.
Thread 1 releasing semaphore.
Thread 4 acquired semaphore.
Thread 2 releasing semaphore.
Thread 5 acquired semaphore.
Thread 3 releasing semaphore.
Thread 4 releasing semaphore.
Thread 5 releasing semaphore.
```

# std::binary_semaphore

std::binary_semaphore 表示一个二进制信号量，其计数值只有 0 或 1，常用于实现简单的线程同步或互斥。

```cpp

std::binary_semaphore semaphore(0); // 初始计数为 0

void worker1() {
    std::cout << "Worker 1: Doing work...\n";
    std::this_thread::sleep_for(std::chrono::seconds(2)); // 模拟工作
    std::cout << "Worker 1: Done, signaling worker 2.\n";
    semaphore.release(); // 通知 worker2
}

void worker2() {
    std::cout << "Worker 2: Waiting for worker 1 to finish...\n";
    semaphore.acquire(); // 等待信号
    std::cout << "Worker 2: Received signal, continuing work.\n";
}

int main() {
    std::thread t1(worker1);
    std::thread t2(worker2);

    t1.join();
    t2.join();

    return 0;
}
```

```
Worker 1: Doing work...
Worker 2: Waiting for worker 1 to finish...
Worker 1: Done, signaling worker 2.
Worker 2: Received signal, continuing work.
```