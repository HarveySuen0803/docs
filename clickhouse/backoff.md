# Backoff 机制介绍

Backoff 机制是 ClickHouse 中一种动态调整并发读取线程数量的自适应策略，主要用于处理存储设备性能瓶颈问题。

- 监控读取性能：系统持续监控每个线程的读取性能指标（如吞吐量、延迟）
- 触发条件：当检测到读取速度低于预设阈值时触发
- 减少线程数：通过减少活跃的查询线程数来降低对存储设备的压力
- 资源重分配：将被"杀死"线程的任务重新分配给剩余的活跃线程

假设初始配置为8个并发读取线程，但系统检测到磁盘读取速度缓慢：

```
{
  "初始状态": {
    "总线程数": 8,
    "backoff_state.current_threads": 8,
    "活跃线程": [0, 1, 2, 3, 4, 5, 6, 7]
  },
  "检测到慢读后": {
    "backoff_state.current_threads": 6,
    "活跃线程": [0, 1, 2, 3, 4, 5],
    "被backoff的线程": [6, 7]
  }
}
```

在 MergeTreeReadPool::profileFeedback 方法中实现：

```cpp
void MergeTreeReadPool::profileFeedback(ReadBufferFromFileBase::ProfileInfo info)
{
    // 如果未配置backoff或禁止任务窃取，则不启用backoff机制
    if (backoff_settings.min_read_latency_ms == 0 || do_not_steal_tasks)
        return;

    // 检查读取延迟是否超过阈值
    if (info.nanoseconds < backoff_settings.min_read_latency_ms * 1000000)
        return;

    // 如果当前线程数已经达到最小值，不再减少
    if (backoff_state.current_threads <= backoff_settings.min_concurrency)
        return;

    // 计算吞吐量
    size_t throughput = info.bytes_read * 1000000000 / info.nanoseconds;

    // 如果吞吐量高于阈值，不需要backoff
    if (throughput >= backoff_settings.max_throughput)
        return;

    // 控制backoff事件频率
    if (backoff_state.time_since_prev_event.elapsed() < backoff_settings.min_interval_between_events_ms * 1000000)
        return;

    // 记录慢读事件
    backoff_state.time_since_prev_event.restart();
    ++backoff_state.num_events;
    ProfileEvents::increment(ProfileEvents::SlowRead);

    // 当累积足够多的慢读事件后，减少一个线程
    if (backoff_state.num_events < backoff_settings.min_events)
        return;

    backoff_state.num_events = 0;
    --backoff_state.current_threads;  // 减少活跃线程数
    ProfileEvents::increment(ProfileEvents::ReadBackoff);
}
```