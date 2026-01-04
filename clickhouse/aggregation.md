# windowFunnel()

windowFunnel 是 ClickHouse 的一个参数化聚合函数，用于在以某条事件为基点的滑动时间窗口中，查找某个有序条件链（funnel）的最长连续命中步数（即从第1步开始，能连续命中多少步）。它返回的结果是一个整数（0..N），表示最长连续触发的条件数量。 ￼

```
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

- window：滑动窗口长度（单位与 timestamp 列的类型有关，见下面说明）。
    - window 的单位取决于 timestamp 列本身的类型（如果用 Date，通常以“天”为单位；用 DateTime/Unix 秒，则以秒为单位；用 DateTime64(3) 则精度到毫秒……可以把它理解成“和 timestamp 的 tick 一致”）。
- mode：可选字符串模式（可设置多个），例如 'strict_order', 'strict_increase', 'strict_deduplication', 'strict_once' 等（下面会详细举例）。
    - default（不加 mode）：只看你传入的那些 cond 事件，非条件事件会被“跳过”（默认允许中间出现非关注事件）。
        - 例：事件流 A -> B -> D -> C，如果条件是 A,B,C，默认会忽略 D，仍可匹配 A->B->C（只要时间窗口允许）。
    - strict_order：不允许有“干扰事件”出现在两步之间；一旦出现非条件事件（或“打断”），就停止继续在该链上匹配。
    - strict_increase：要求匹配的条件事件时间戳必须严格递增（避免同一秒/相同时间戳导致的歧义）。同一秒发生的事件其顺序可能不确定，会影响结果。遇到重复时间戳造成的问题可以考虑此模式。 ￼
    - strict_deduplication：如果连续多次都满足同一条件，则这些重复会中断进一步匹配（对某些场景有用，但在事件同时满足多个条件时要小心）。 ￼
    - strict_once：避免同一事件被多次计入不同步骤（在某些版本中新增以防止重复计数问题）。如果一个事件同时满足多个步骤条件，strict_once 确保每个物理事件只算一次。注意：不同 ClickHouse 版本对这类边界行为的实现会有差异，参考发行说明。 

windowFunnel 从符合 第 1 个条件 的事件开始作为窗口起点，然后往后判断第 2、3……步是否在该窗口内按顺序被满足；并返回最长的“连续命中”步数（不是简单的任意匹配数）。 ￼

---

准备测试数据：

```sql
CREATE TABLE events
(
  user_id UInt32,
  event_time UInt32,  -- unix seconds
  event String
) ENGINE = Memory;

INSERT INTO events VALUES
-- user 1: 完整 A->B->C（都在 window 内）
(1, 1000, 'login'),
(1, 1200, 'search'),
(1, 1500, 'buy'),

-- user 2: login -> buy（没有 search）
(2, 2000, 'login'),
(2, 2500, 'buy'),

-- user 3: login -> search 在窗内，但 buy 超出 window
(3, 3000, 'login'),
(3, 3500, 'search'),
(3, 9000, 'buy'),  -- far away

-- user 4: A->B->D->C（用来演示 strict_order）
(4, 100, 'A'),
(4, 200, 'B'),
(4, 250, 'D'),
(4, 300, 'C'),

-- user 5: 一个事件同时满足多个条件的场景（用于 strict_once）
(5, 400, 'cta_click'),
(5, 450, 'purchase');
```

---

示例：基本 funnel，login → search → buy，窗口 3600 秒

```sql
SELECT
  user_id,
  windowFunnel(3600)(event_time,
                     event = 'login',
                     event = 'search',
                     event = 'buy') AS level
FROM events
GROUP BY user_id
ORDER BY user_id;
```

- user 1：login(1000) → search(1200) → buy(1500)，1500-1000 = 500s <3600 → level = 3。
- user 2：login(2000) → 没有 search，虽然后面有 buy(2500)，但 search 没有命中，连续命中只能到第 1 步 → level = 1。
- user 3：login(3000) → search(3500)（ok），buy(9000) 距离 login = 6000s >3600 → 所以 level = 2（只有前两步在 window 内）。 ￼

windowFunnel 计算的是从第 1 步开始 连续 命中的最大步数 —— 中间不能“跳过”某一步再算后面的那一步为连续。文档已明确这一点。 ￼

---

示例：strict_order 不允许“中间有非条件事件”

假设我们对 user 4 做 funnel (A, B, C)，window 很大（例如 1000 秒），看默认与 strict_order 的差别：

```sql
SELECT windowFunnel(1000)(event_time, event='A', event='B', event='C') AS lvl_default
FROM events
WHERE user_id = 4
GROUP BY user_id;
-- lvl_default = 3  （默认会忽略 D，因为 D 不是我们传入的 cond）

SELECT windowFunnel(1000, 'strict_order')(event_time, event='A', event='B', event='C') AS lvl_strict
FROM events
WHERE user_id = 4
GROUP BY user_id;
-- lvl_strict = 2   （因为 D 出现在 B 和 C 之间，strict_order 会把它当作“干扰”，停止匹配）
```

---

windowFunnel 的 cond 条件 参数确实要求是 UInt8 类型，但在实际写 SQL 时你不用手动转换，大多数情况下写布尔表达式就可以。

ClickHouse 在 SQL 中会自动把布尔表达式结果转换成 UInt8，例如，event = 'login'，event IN ('A','B')、url LIKE '%checkout%' 等结果都是 0 或 1，底层都会自动转成 UInt8。

示例，直接定义 UInt8 类型的字段和条件，避免底层的转换：

```sql
CREATE TABLE user_events (
    user_id UInt32,
    event_time DateTime,
    page_view UInt8,      -- 1: 浏览页面
    click_button UInt8,   -- 1: 点击按钮  
    add_to_cart UInt8,    -- 1: 加入购物车
    checkout UInt8        -- 1: 结账
) ENGINE = Memory;
-- 插入示例数据
INSERT INTO user_events VALUES
(1, '2024-01-01 10:00:00', 1, 0, 0, 0),
(1, '2024-01-01 10:01:00', 0, 1, 0, 0),
(1, '2024-01-01 10:02:00', 0, 0, 1, 0),
(1, '2024-01-01 10:03:00', 0, 0, 0, 1),
(2, '2024-01-01 10:00:00', 1, 0, 0, 0),
(2, '2024-01-01 10:01:00', 0, 1, 0, 0),
(2, '2024-01-01 10:05:00', 0, 0, 1, 0),
(3, '2024-01-01 10:00:00', 1, 0, 0, 0);

SELECT 
    user_id,
    windowFunnel(3600)(event_time, page_view, click_button, add_to_cart, checkout) as funnel_level
FROM user_events
GROUP BY user_id;
```