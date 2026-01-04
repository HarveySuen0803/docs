# Coin Change

[Problem Description](https://leetcode.cn/problems/coin-change/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6?p=105&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * This method calculates the minimum number of coins needed to make up the given amount.
 * It uses a greedy algorithm, which may not provide the correct result for all coin sets and amounts.
 *
 * @param coins  An array of integers representing the available coin denominations.
 * @param amount The total amount to make up with the given coins.
 * @return The minimum number of coins needed to make up the amount, or -1 if it's not possible.
 */
public static int coinChange(int[] coins, int amount) {
    int count = 0;
    
    for (int coin : coins) {
        while (amount - coin >= 0) {
            amount -= coin;
            count++;
        }
        
        if (amount == 0) {
            return count;
        }
    }
    
    return -1;
}

public static void main(String[] args) {
    System.out.println(coinChange(new int[]{5, 2, 1}, 18));
}
```

# Coin Change II

[Problem Description](https://leetcode.cn/problems/coin-change-ii/description/)

[Explain p99, p100](https://www.bilibili.com/video/BV1rv4y1H7o6?p=99)

```java
public static int change(int amount, int[] coins) {
    return rec(0, amount, coins);
}

public static int rec(int idx, int amount, int[] coins) {
    if (amount < 0) {
        return 0;
    }
    
    if (amount == 0) {
        return 1;
    }
    
    int count = 0;
    for (int i = idx; i < coins.length; i++) {
        count += rec(i, amount - coins[i], coins);
    }
    return count;
}
```

# Coin Change II

[Problem Description](https://leetcode.cn/problems/coin-change-ii/description/)

[Explain p101, p102](https://www.bilibili.com/video/BV1rv4y1H7o6?p=99)

```java
// The minimum number of coins needed to make up the amount. Initialized to -1 as a flag value.
int min = -1;

/**
 * This method starts the recursive process of finding the minimum number of coins to make up the amount.
 * @param amount The total amount to make up.
 * @param coins The array of available coins.
 * @return The minimum number of coins needed to make up the amount.
 */
public int change(int amount, int[] coins) {
    // Start the recursive process with an initial count of -1 and an empty stack to hold the coins used.
    rec(0, coins, amount, new AtomicInteger(-1), new LinkedList<>(), true);
    // Return the minimum number of coins found.
    return min;
}

/**
 * This method recursively explores all possible combinations of coins to make up the amount.
 * @param index The current index in the coins array.
 * @param coins The array of available coins.
 * @param remainder The remaining amount to make up.
 * @param count The current count of coins used.
 * @param stack A stack to hold the coins used.
 * @param isFirst A flag to indicate if this is the first call to the method.
 */
public void rec(int index, int[] coins, int remainder, AtomicInteger count, LinkedList<Integer> stack, boolean isFirst) {
    // If this is not the first call, push the current coin onto the stack.
    if (!isFirst) {
        stack.push(coins[index]);
    }

    // Increment the count of coins used.
    count.incrementAndGet();

    // If the remainder is 0, we have found a combination of coins that makes up the amount.
    if (remainder == 0) {
        // Print the stack of coins used.
        System.out.println(stack);
        // If this is the first combination found, set min to the current count.
        // Otherwise, update min to the smaller of the current count and min.
        if (min == -1) {
            min = count.get();
        } else {
            min = Math.min(count.get(), min);
        }
    // If the remainder is greater than 0, continue the recursive process with the remaining coins.
    } else if (remainder > 0) {
        for (int i = index; i < coins.length; i++) {
            rec(i, coins, remainder - coins[i], count, stack, false);
        }
    }

    // Decrement the count of coins used.
    count.decrementAndGet();

    // If the stack is not empty, remove the top coin.
    if (!stack.isEmpty()) {
        stack.poll();
    }
}
```

# Activity Selection

[Explain p112, p113](https://www.bilibili.com/video/BV1rv4y1H7o6?p=112)

```java
public static class Activity {
    public int idx;
    public int srt;
    public int end;
    
    public Activity(int idx, int srt, int end) {
        this.idx = idx;
        this.srt = srt;
        this.end = end;
    }
    
    @Override
    public String toString() {
        return "Activity{" +
            "idx=" + idx +
            ", srt=" + srt +
            ", end=" + end +
            '}';
    }
}

public static void select(Activity[] activities) {
    Arrays.sort(activities, Comparator.comparingInt(o -> o.end));
    
    ArrayList<Activity> r = new ArrayList<>();
    Activity prev = activities[0];
    r.add(prev);
    for (int i = 1; i < activities.length; i++) {
        Activity cur = activities[i];
        if (cur.srt >= prev.end) {
            r.add(cur);
            prev = cur;
        }
    }
    
    System.out.println(r);
}

public static void main(String[] args) {
    Activity[] activities = new Activity[]{
        new Activity(3, 4, 6),
        new Activity(4, 5, 7),
        new Activity(2, 3, 5),
        new Activity(5, 6, 8),
        new Activity(7, 8, 10),
        new Activity(0, 1, 3),
        new Activity(1, 2, 4),
        new Activity(6, 7, 9),
    };
    
    select(activities);
}
```

# Knapsack Fractional

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6?p=114)

```java
/**
 * This class represents an item in the Fractional Knapsack problem.
 * Each item has an index, a weight, and a value.
 */
public static class Item {
    int idx;  // Index of the item
    int wt;   // Weight of the item
    int val;  // Value of the item
    
    public Item(int idx, int wt, int val) {
        this.idx = idx;
        this.wt = wt;
        this.val = val;
    }

    public int unitVal() {
        return val / wt;
    }

    @Override
    public String toString() {
        return "Item(" + idx + ")";
    }
}

/**
 * This method implements the Fractional Knapsack algorithm.
 * It selects items based on their unit values to maximize the total value.
 *
 * @param items The array of items.
 * @param cap   The capacity of the knapsack.
 */
public static void select(Item[] items, int cap) {
    // Sort the items in descending order of unit value
    Arrays.sort(items, Comparator.comparingInt(Item::unitVal).reversed());

    int maxVal = 0;  // The maximum total value of the items selected

    // Iterate over each item
    for (Item item : items) {
        // If the item's weight is more than the remaining capacity
        if (cap < item.wt) {
            // Add the fraction of the item's value that fits in the remaining capacity
            maxVal += cap * item.unitVal();
            break;
        }

        // Subtract the item's weight from the remaining capacity
        cap -= item.wt;

        // Add the item's value to the total value
        maxVal += item.val;
    }

    // Print the maximum total value
    System.out.println(maxVal);
}

public static void main(String[] args) {
    Item[] items = new Item[]{
        new Item(0, 4, 24),
        new Item(1, 8, 160),
        new Item(2, 2, 4000),
        new Item(3, 6, 108),
        new Item(4, 1, 4000),
    };

    select(items, 10);
}
```

# Jump Game

[Problem Description](https://leetcode.cn/problems/jump-game/description/?envType=study-plan-v2&envId=top-interview-150)

```java
public static boolean canJump(int[] nums) {
    int farthest = 0;
    for (int i = 0; i < nums.length; i++) {
        // 如果当前位置超出了最远可达位置，返回 false
        if (i > farthest) return false;
        // 更新最远可达位置
        farthest = Math.max(farthest, i + nums[i]);
        // 如果最远可达位置已经覆盖了最后一个索引，返回 true
        if (farthest >= nums.length - 1) return true;
    }
    return false;
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411191720252.png)

# Jump Game II

[Problem Description](https://leetcode.cn/problems/jump-game-ii/description/?envType=study-plan-v2&envId=top-interview-150)

```java
public static int jump(int[] nums) {
    int count = 0;
    int farthest = 0; // 在 boundary 范围内，最远的跳跃举例
    int boundary = 0; // 可以跳跃到的边界
    for (int i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);
        // 记录 boundary 范围内，可以跳到的最远距离
        if (i == boundary) {
            count++;
            boundary = farthest;
        }
    }
    return count;
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411191741452.png)

# Cut Gold Bar

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501021705251.png)

- [Video Explain 01:52:30](https://www.bilibili.com/video/BV13g41157hK/?vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=10&spm_id_from=333.788.videopod.episodes)
- [Article Explain](https://juejin.cn/post/7050107225355845668)

```java
public static int lessMoney(int[] nums) {
    if (nums == null || nums.length == 0) {
        return 0;
    }
    PriorityQueue<Integer> minQueue = new PriorityQueue<>();
    for (int num : nums) {
        minQueue.offer(num);
    }
    int res = 0;
    while (minQueue.size() >= 2) {
        int cur = minQueue.poll() + minQueue.poll();
        res += cur;
        minQueue.offer(cur);
    }
    return res;
}
```

# IPO

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202501021737519.png)

- [Problem Description](https://leetcode.cn/problems/ipo/description/)
- [Video Explain 02:02:45](https://www.bilibili.com/video/BV13g41157hK/?vd_source=2b0f5d4521fd544614edfc30d4ab38e1&p=10&spm_id_from=333.788.videopod.episodes)
- [Article Explain](https://juejin.cn/post/7050107225355845668#heading-8)

```java
public static class Node {
    public int cost;
    public int profit;

    public Node() {
        this.cost = 0;
        this.profit = 0;
    }

    public Node(int cost, int profit) {
        this.cost = cost;
        this.profit = profit;
    }
}

public static int findMaximizedCapital(int k, int funds, int[] profits, int[] costs) {
    if (costs.length == 0) {
        return funds;
    }

    PriorityQueue<Node> minHeap = new PriorityQueue<>((a, b) -> a.cost - b.cost);
    PriorityQueue<Node> maxHeap = new PriorityQueue<>((a, b) -> b.profit - a.profit);
    for (int i = 0; i < costs.length; i++) {
        minHeap.offer(new Node(costs[i], profits[i]));
    }
    if (funds < minHeap.peek().cost) {
        return funds;
    }

    int i = 0;
    while (i < k && (!minHeap.isEmpty() || !maxHeap.isEmpty())) {
        while (!minHeap.isEmpty() && funds >= minHeap.peek().cost) {
            maxHeap.offer(minHeap.poll());
        }
        if (maxHeap.isEmpty()) {
            return funds;
        }
        Node node = maxHeap.poll();
        funds += node.profit;
        i++;
    }

    return funds;
}
```

# N Queen

