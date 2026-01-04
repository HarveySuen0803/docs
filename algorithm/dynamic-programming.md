# Fibonacci (1D Array)

```java
public static int fib(int n) {
    if (n == 0) {
        return 0;
    }
    
    if (n == 1) {
        return 1;
    }

    int[] dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = 1;
    for (int i = 2; i < n + 1; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}
```

# Fibonacci (Variable)

```java
public static int fib(int n) {
    if (n == 0) {
        return 0;
    }
    
    if (n == 1) {
        return 1;
    }
    
    int n1 = 0;
    int n2 = 1;
    int n3 = n1 + n2;
    for (int i = 2; i <= n; i++) {
        n3 = n1 + n2;
        n1 = n2;
        n2 = n3;
    }
    
    return n3;
}
```

# BellmanFord

[Explain p118, p119, p120](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=118)

```java
/**
 * The Bellman Ford algorithm. It finds the shortest path from the source to all other vertices.
 *
 * @param edges the list of edges in the graph
 * @param size the number of vertices in the graph
 */
public static void bellmanFord(List<Edge> edges, int size) {
    // Initialize the dp array
    int[] dp = new int[size + 1];
    dp[1] = 0; // The distance from the source to itself is 0
    // Initialize the rest of the array to infinity
    for (int i = 2; i < dp.length; i++) {
        dp[i] = Integer.MAX_VALUE;
    }

    // Relax the edges size - 1 times
    for (int i = 0; i < size - 1; i++) {
        // For each edge
        for (Edge e : edges) {
            // If the starting vertex of the edge has not been visited, skip it
            if (dp[e.from] == Integer.MAX_VALUE) {
                continue;
            }
            // Relax the edge
            dp[e.to] = Math.min(dp[e.from] + e.wt, dp[e.to]);
        }
    }

    // Print the shortest path array
    print(dp);
}

public static class Edge {
    int from;
    int to;
    int wt;

    /**
     * Constructs an Edge with the given parameters.
     *
     * @param from the starting vertex of the edge
     * @param to the ending vertex of the edge
     * @param wt the weight of the edge
     */
    public Edge(int from, int to, int wt) {
        this.from = from;
        this.to = to;
        this.wt = wt;
    }
}

public static void print(int[] dp) {
    System.out.println(Arrays.stream(dp)
                             .mapToObj(i -> i == Integer.MAX_VALUE ? "∞" : String.valueOf(i))
                             .collect(Collectors.joining(",", "[", "]")));
}

public static void main(String[] args) {
    List<Edge> edges = List.of(
        new Edge(6, 5, 9),
        new Edge(4, 5, 6),
        new Edge(1, 6, 14),
        new Edge(3, 6, 2),
        new Edge(3, 4, 11),
        new Edge(2, 4, 15),
        new Edge(1, 3, 9),
        new Edge(1, 2, 7)
    );

    bellmanFord(edges, 6);
}
```

# Unique Paths (2D Array)

[Problem Description](https://leetcode.cn/problems/unique-paths/description/)

[Explain p121, p122](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=121)

```java
/**
 * This method calculates the number of unique paths from the top-left corner to the bottom-right corner of a m x n grid.
 * The robot can only move either down or right at any point in time.
 *
 * @param m The number of rows in the grid.
 * @param n The number of columns in the grid.
 * @return The total number of unique paths.
 *
 * The core idea of this algorithm is dynamic programming. We initialize a 2D array dp where dp[i][j] represents the number of unique paths to reach cell (i, j).
 * The robot starts at cell (0, 0) and can either move right or down. Therefore, for the first row (i=0) and the first column (j=0), there is only one unique path to reach each cell.
 * For the rest of the grid, the number of ways to reach cell (i, j) is the sum of ways to reach cell (i-1, j) and cell (i, j-1).
 */
public int uniquePaths(int m, int n) {
    // Initialize the 2D dp array
    int[][] dp = new int[m][n];

    // There is only one way to reach each cell in the first column, by moving down
    for (int i = 0; i < m; i++) {
        dp[i][0] = 1;
    }

    // There is only one way to reach each cell in the first row, by moving right
    for (int j = 0; j < n; j++) {
        dp[0][j] = 1;
    }

    // For each cell (i, j), calculate the number of unique paths to reach it
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            // The number of unique paths to reach cell (i, j) is the sum of paths to reach cell (i-1, j) and cell (i, j-1)
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }

    // Return the number of unique paths to reach the bottom-right corner of the grid
    return dp[m - 1][n - 1];
}
```

# Unique Paths (1D Array)

[Problem Description](https://leetcode.cn/problems/unique-paths/description/)

[Explain p122 (04:40)](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=121)

```java
public int uniquePaths(int m, int n) {
    int[] dp = new int[n];
    Arrays.fill(dp, 1);
    
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[j] = dp[j - 1] + dp[j];
        }
    }
    
    return dp[n - 1];
}
```

# Knapsack 0-1 (2D Array)

[Explain p123, p124, p125](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=123&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * This method implements the 0-1 Knapsack problem using Dynamic Programming (DP).
 * The 0-1 Knapsack problem is a classic optimization problem where we aim to maximize the total value
 * of items picked without exceeding the capacity of the knapsack.
 *
 * @param items An array of Item objects where each item has a weight and a value.
 * @param cap The total capacity of the knapsack.
 * @return The maximum value that can be achieved with the given items and capacity.
 */
public static int select(Item[] items, int cap) {
    // Initialize the DP table. The row represents the items, and the column represents the capacity.
    int[][] dp = new int[items.length][cap + 1];
    
    // Populate the first row of the DP table considering only the first item.
    for (int j = 0; j < cap + 1; j++) {
        if (j >= items[0].wt) {
            // If the item's weight is less than or equal to the current capacity, we can pick this item.
            dp[0][j] = items[0].val;
        } else {
            // If the item's weight is more than the current capacity, we can't pick this item.
            dp[0][j] = 0;
        }
    }
    
    // Iterate over the rest of the items.
    for (int i = 1; i < items.length; i++) {
        Item item = items[i];
        // For each item, iterate over all possible capacities.
        for (int j = 0; j < cap + 1; j++) {
            if (j >= item.wt) {
                // If the item's weight is less than or equal to the current capacity, we have two options:
                // 1. Don't pick this item: In this case, the maximum value is the same as the maximum value achieved from the previous item at this capacity.
                // 2. Pick this item: In this case, the maximum value is the value of this item plus the maximum value achieved from the previous item at the remaining capacity.
                // We take the maximum of these two options.
                dp[i][j] = Math.max(dp[i - 1][j], item.val + dp[i - 1][j - item.wt]);
            } else {
                // If the item's weight is more than the current capacity, we can't pick this item.
                // So, we carry forward the maximum value achieved from the previous item at this capacity.
                dp[i][j] = dp[i - 1][j];
            }
        }
        // Print the DP table after considering each item.
        print(dp);
    }
    
    // The maximum value that can be achieved with the given items and capacity is the last cell in the DP table.
    return dp[items.length - 1][cap];
}

public static class Item {
    int idx;  // Index of the item
    int val;  // Value of the item
    int wt;   // Weight of the item
    
    public Item(int idx, int wt, int val) {
        this.idx = idx;
        this.wt = wt;
        this.val = val;
    }
    
    @Override
    public String toString() {
        return "Item(" + idx + ")";
    }
}

public static void print(int[][] dp) {
    System.out.println("   " + "-".repeat(63));
    Object[] array = IntStream.range(0, dp[0].length + 1).boxed().toArray();
    System.out.printf(("%5d ".repeat(dp[0].length)) + "%n", array);
    for (int[] d : dp) {
        array = Arrays.stream(d).boxed().toArray();
        System.out.printf(("%5d ".repeat(d.length)) + "%n", array);
    }
}

public static void main(String[] args) {
    Item[] items = new Item[]{
        new Item(1, 4, 1600),
        new Item(2, 8, 2400),
        new Item(3, 5, 30),
        new Item(4, 1, 10_000),
    };
    
    select(items, 10); // 12400
}
```

# Knapsack 0-1 (1D Array)

[Explain p126](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=126)

```java
public static int select(Item[] items, int cap) {
    // Initialize the dynamic programming table with size cap + 1.
    int[] dp = new int[cap + 1];
    
    // Initialize the first item's value in the DP table.
    Item item = items[0];
    for (int j = 1; j < cap + 1; j++) {
        if (j >= item.wt) {
            dp[j] = item.val;
        } else {
            dp[j] = 0;
        }
    }
    
    // Iterate over the remaining items.
    for (int i = 1; i < items.length; i++) {
        item = items[i];
        // For each item, iterate over all capacities from cap to 0.
        for (int j = cap; j >= 0; j--) {
            // If the item's weight is less than or equal to the current capacity,
            // update the DP table by comparing the current value and the value obtained by including this item.
            if (j >= item.wt) {
                dp[j] = Math.max(dp[j], item.val + dp[j - item.wt]);
            }
        }
    }
    
    // Return the maximum value that can be obtained with the given knapsack capacity.
    return dp[cap];
}
```

# Knapsack Complete (2D Array)

[Explain p127, p128](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=127&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int select(Item[] items, int cap) {
    // Initialize the DP table. The row represents the items, and the column represents the capacity.
    int[][] dp = new int[items.length][cap + 1];

    // Process the first item separately as a base case.
    Item item = items[0];
    for (int j = 1; j < cap + 1; j++) {
        // If the current capacity is greater than or equal to the weight of the item,
        // update the DP table by adding the value of the item.
        if (j >= item.wt) {
            dp[0][j] = item.val + dp[0][j - item.wt];
        }
    }

    // Iterate over the remaining items.
    for (int i = 1; i < items.length; i++) {
        item = items[i];
        for (int j = 0; j < cap + 1; j++) {
            // If the current capacity is greater than or equal to the weight of the item,
            // choose the maximum value between the current item plus the maximum value of the remaining capacity,
            // and the maximum value without including the current item.
            if (j >= item.wt) {
                dp[i][j] = Math.max(dp[i - 1][j], item.val + dp[i][j - item.wt]);
            }
            // If the current capacity is less than the weight of the item,
            // the item cannot be included, so we take the maximum value without including the item.
            else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }

    return dp[items.length - 1][cap];
}

public static void main(String[] args) {
    Item[] items = new Item[]{
        new Item(1, 4, 1600),
        new Item(2, 8, 2400),
        new Item(3, 5, 30),
        new Item(4, 1, 10_000),
    };
    
    select(items, 10); // 100000
}
```

# Knapsack Complete (1D Array)

[Explain p128 (12:35)](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=128&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int select(Item[] items, int cap) {
    int[] dp = new int[cap + 1];
    
    Item item = items[0];
    for (int j = 1; j < cap + 1; j++) {
        if (j >= item.wt) {
            dp[j] = item.val + dp[j - item.wt];
        }
    }
    
    for (int i = 1; i < items.length; i++) {
        item = items[i];
        for (int j = 1; j < cap + 1; j++) {
            if (j >= item.wt) {
                dp[j] = Math.max(dp[j], item.val + dp[j - item.wt]);
            }
        }
    }
    
    return dp[cap];
}
```

# Coin Change (2D Array)

[Problem Description](https://leetcode.cn/problems/coin-change/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=129&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int coinChange(int[] coins, int amount) {
    int[][] dp = new int[coins.length][amount + 1];
    
    for (int j = 1; j < amount + 1; j++) {
        if (j % coins[0] == 0) {
            dp[0][j] = j / coins[0];
        } else {
            dp[0][j] = -1;
        }
    }
    
    for (int i = 1; i < coins.length; i++) {
        for (int j = 1; j < amount + 1; j++) {
            if (j >= coins[i]) {
                int min = Integer.MAX_VALUE;
                for (int k = 0; k <= j / coins[i]; k++) {
                    int t = dp[i - 1][j - k * coins[i]];
                    if (t != -1) {
                        min = Math.min(min, t + k);
                    }
                }
                dp[i][j] = min == Integer.MAX_VALUE ? -1 : min;
            } else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }
    
    return dp[coins.length - 1][amount];
}

public static void main(String[] args) {
    int[] coins = {1, 2, 5};
    int amount = 11;
    System.out.println(coinChange(coins, amount)); // 3
}
```

# Coin Change (1D Array)

[Problem Description](https://leetcode.cn/problems/coin-change/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=131&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    
    for (int j = 1; j < amount + 1; j++) {
        if (j % coins[0] == 0) {
            dp[j] = j / coins[0];
        } else {
            dp[j] = -1;
        }
    }
    
    for (int i = 1; i < coins.length; i++) {
        for (int j = 1; j < amount + 1; j++) {
            if (j >= coins[i]) {
                int min = Integer.MAX_VALUE;
                for (int k = 0; k <= j / coins[i]; k++) {
                    int t = dp[j - k * coins[i]];
                    if (t != -1) {
                        min = Math.min(min, t + k);
                    }
                }
                dp[j] = min == Integer.MAX_VALUE ? -1 : min;
            }
        }
    }
    
    return dp[amount];
}

public static void main(String[] args) {
    int[] coins = {1, 2, 5};
    int amount = 11;
    System.out.println(coinChange(coins, amount)); // 3
}
```

# Coin Change II

[Problem Description](https://leetcode.cn/problems/coin-change-ii/description/)

```java
public int change(int amount, int[] coins) {
    // Initialize a 2D array to store the number of combinations for each amount
    int[][] dp = new int[coins.length][amount + 1];

    // For each coin, there is one way to make up an amount of 0 (by not using any coins)
    for (int i = 0; i < coins.length; i++) {
        dp[i][0] = 1;
    }

    // For the first type of coin, calculate the number of combinations for each amount
    for (int j = 1; j < amount + 1; j++) {
        // If the current amount is greater than or equal to the coin value
        if (j >= coins[0]) {
            // The number of combinations is the number of combinations without the coin
            // plus the number of combinations with the coin
            dp[0][j] = dp[0][j - coins[0]];
        }
    }

    // For the remaining types of coins
    for (int i = 1; i < coins.length; i++) {
        // Calculate the number of combinations for each amount
        for (int j = 1; j < amount + 1; j++) {
            // If the current amount is greater than or equal to the coin value
            if (j >= coins[i]) {
                // The number of combinations is the number of combinations without the coin
                // plus the number of combinations with the coin
                dp[i][j] = dp[i - 1][j] + dp[i][j - coins[i]];
            } else {
                // If the current amount is less than the coin value
                // The number of combinations is the number of combinations without the coin
                dp[i][j] = dp[i - 1][j];
            }
        }
    }

    // Return the total number of combinations for the amount using all types of coins
    return dp[coins.length - 1][amount];
}

public static void main(String[] args) {
    int[] coins = {1, 2, 5};
    int amount = 5;
    System.out.println(coinChange(coins, amount)); // 4
}
```

# Cut Rod

[Explain p134, p135](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=134)

```java
public static int cut(int[] vals, int len) {
    int[][] dp = new int[vals.length][len + 1];
    
    for (int i = 1; i < vals.length; i++) {
        for (int j = 1; j < len + 1; j++) {
            if (j >= i) {
                dp[i][j] = Math.max(dp[i - 1][j], vals[i] + dp[i][j - 1]);
            } else {
                dp[i][j] = dp[i - 1][j];
            } 
        }
    }
    
    return dp[vals.length - 1][len];
}
```

# Longest Common Substring

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=136&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int longestCommonSubsequence(String txt1, String txt2) {
    int[][] dp = new int[txt1.length() + 1][txt2.length() + 1];
    int maxLen = 0;
    for (int i = 1; i < txt1.length() + 1; i++) {
        for (int j = 1; j < txt2.length() + 1; j++) {
            if (txt1.charAt(i - 1) == txt2.charAt(j - 1)) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
                maxLen = Math.max(maxLen, dp[i][j]);
            } else {
                dp[i][j] = 0;
            }
        }
    }
    return dp[txt1.length()][txt2.length()];
}

public static void main(String[] args) {
    System.out.println(longestCommonSubsequence("harvey", "eyharv")); // 4
}
```

# Longest Common Subsequence

[Problem Description](https://leetcode.cn/problems/longest-common-subsequence/description/)

[Explain p137, p138](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=137&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public int longestCommonSubsequence(String txt1, String txt2) {
    int[][] dp = new int[txt1.length() + 1][txt2.length() + 1];
    for (int i = 1; i < txt1.length() + 1; i++) {
        for (int j = 1; j < txt2.length() + 1; j++) {
            if (txt1.charAt(i - 1) == txt2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            } 
        }
    }
    return dp[txt1.length()][txt2.length()];
}
```

# Maximum Subarray

[Problem Description](https://leetcode.cn/problems/maximum-subarray/description/?envType=study-plan-v2&envId=top-100-liked)

```java
public static int maxSubArray(int[] nums) {
    int[] dp = new int[nums.length];
    dp[0] = nums[0];
    int maxSum = dp[0];
    for (int i = 1; i < nums.length; i++) {
        if (dp[i - 1] > 0) {
            dp[i] = dp[i - 1] + nums[i];
        } else {
            dp[i] = nums[i];
        }
        maxSum = Math.max(maxSum, dp[i]);
    }
    return maxSum;
}
```

# Delete Operation for Two Strings

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=139)

```java
public static int minDistance(String word1, String word2) {
    char[] chs1 = word1.toCharArray();
    char[] chs2 = word2.toCharArray();
    int[][] dp = new int[chs1.length + 1][chs2.length + 1];
    
    for (int i = 1; i < chs1.length + 1; i++) {
        char c1 = chs1[i - 1];
        for (int j = 1; j < chs2.length + 1; j++) {
            char c2 = chs2[j - 1];
            if (c1 == c2) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            } 
        }
    }
    
    return chs1.length + chs2.length - dp[chs1.length][chs2.length] * 2;
}
```

# Longest Increasing Subsequence

[Problem Description](https://leetcode.cn/problems/longest-increasing-subsequence/description/)

[Explain p140, p141](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=140&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int lengthOfLIS(int[] nums) {
    int[] dp = new int[nums.length];
    Arrays.fill(dp, 1);
    for (int i = 1; i < nums.length; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], 1 + dp[j]);
            }
        }
    }
    return Arrays.stream(dp).max().getAsInt();
}

public static void main(String[] args) {
    System.out.println(lengthOfLIS(new int[] { 10, 9, 2, 5, 3, 7, 101, 18 })); // 4
}
```

# Catalan

[Explain p142, p143](https://www.bilibili.com/video/BV1rv4y1H7o6?p=142)

```java
public static int catalan(int n) {
    int[] dp = new int[n + 1];
    dp[0] = 1;
    dp[1] = 1;
    for (int j = 2; j < n + 1; j++) {
        for (int i = 0; i < j; i++) {
            dp[j] += dp[i] * dp[j - i - 1];
        }
    }
    return dp[n];
}
```

# Generate Parentheses

[Problem Description](https://leetcode.cn/problems/generate-parentheses/description/)

[Explain p145, p146](https://www.bilibili.com/video/BV1rv4y1H7o6?p=145&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static List<String> generateParenthesis(int n) {
    ArrayList<String>[] dp = new ArrayList[n + 1];
    dp[0] = new ArrayList<>(List.of(""));
    dp[1] = new ArrayList<>(List.of("()"));
    for (int i = 2; i < n + 1; i++) {
        dp[i] = new ArrayList<>();
        for (int j = 0; j < i; j++) {
            for (String k1 : dp[j]) {
                for (String k2 : dp[i - 1 - j]) {
                    dp[i].add("(" + k1 + ")" + k2);
                }
            }
        }
        System.out.println(Arrays.toString(dp));
    }
    return dp[n];
}
```

# House Robber

[Problem Description](https://leetcode.cn/problems/house-robber/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=147&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int rob(int[] vals) {
    int[] dp = new int[vals.length];
    if (vals.length == 1) {
        return vals[0];
    }
    dp[0] = vals[0];
    dp[1] = Math.max(vals[0], vals[1]);
    for (int i = 2; i < vals.length; i++) {
        dp[i] = Math.max(dp[i - 1], vals[i] + dp[i - 2]);
    }
    return dp[vals.length - 1];
}
```

# Travelling Salesman

[Explain p148, p149, 150, p151, p152](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=148&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * This method solves the TSP using DP.
 * 
 * @param g The adjacency matrix representation of the graph.
 * @return The minimum cost to visit all cities and return to the origin.
 */
public int tsp(int[][] g) {
    // Number of cities
    int m = g.length;
    // Total number of states in DP
    int n = 1 << (g.length - 1);
    // DP array
    int[][] dp = new int[m][n];

    // Initialize the DP array
    for (int i = 0; i < m; i++) {
        dp[i][0] = g[i][0];
    }

    // Iterate over all states
    for (int j = 1; j < n; j++) {
        // For each city
        for (int i = 0; i < m; i++) {
            dp[i][j] = Integer.MAX_VALUE >>> 1;
            // If the city is in the current state, skip
            if (contains(j, i)) continue;
            // For each city in the current state
            for (int k = 0; k < m; k++) {
                if (!contains(j, k)) continue;
                // Update the DP value
                dp[i][j] = Math.min(dp[i][j], g[i][k] + dp[k][exclude(j, k)]);
            }
        }
    }

    // Return the minimum cost to visit all cities and return to the origin
    return dp[0][n - 1];
}

/**
 * This method checks if a city is in the current set of cities.
 * 
 * @param set The set of cities.
 * @param city The city to check.
 * @return True if the city is in the set, false otherwise.
 */
public boolean contains(int set, int city) {
    return (set >> (city - 1) & 1) == 1;
}

/**
 * This method removes a city from the current set of cities.
 * 
 * @param set The set of cities.
 * @param city The city to remove.
 * @return The new set of cities after removal.
 */
public int exclude(int set, int city) {
    return set ^ (1 << (city - 1));
}

public static void main(String[] args) {
    int[][] graph = {
        {0, 1, 2, 3},
        {1, 0, 6, 4},
        {2, 6, 0, 5},
        {3, 4, 5, 0}
    };
    System.out.println(new Main().tsp(graph));
}
```

# Stock I

[Problem Description](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=195&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maxProfit(int[] prices) {
    int i1 = 0;
    int i2 = 1;
    int maxProfit = 0;
    while (i2 < prices.length) {
        int profit = prices[i2] - prices[i1];
        if (profit > 0) {
            maxProfit = Math.max(maxProfit, profit);
        } else {
            i1 = i2;
        }
        i2++;
    }
    return maxProfit;
}

public static void main(String[] args) {
    System.out.println(maxProfit(new int[]{7, 1, 5, 3, 6, 4})); // 5
}
```

# Stock I

```java
public static int maxProfit(int[] prices) {
    int[] hold = new int[prices.length];
    int[] sell = new int[prices.length];
    hold[0] = -prices[0];
    sell[0] = 0;
    for (int i = 1; i < prices.length; i++) {
        hold[i] = Math.max(hold[i - 1], -prices[i]);
        sell[i] = Math.max(sell[i - 1], hold[i - 1] + prices[i]);
    }
    return sell[prices.length - 1];
}
```

# Stock I

```java
public static int maxProfit(int[] prices) {
    int preHold = -prices[0];
    int preSell = 0;
    for (int i = 1; i < prices.length; i++) {
        int curHold = Math.max(preHold, -prices[i]);
        int curSell = Math.max(preSell, preHold + prices[i]);
        preHold = curHold;
        preSell = curSell;
    }
    return preSell;
}
```

# Stock I

```java
public static int maxProfit(int[] prices) {
    int hold = Integer.MIN_VALUE;
    int sell = 0;
    for (int price : prices) {
        hold = Math.max(hold, -price);
        sell = Math.max(sell, hold + price);
    }
    return sell;
}
```

# Stock II

[Problem Description](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=196&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maxProfit(int[] prices) {
    int i1 = 0;
    int i2 = 1;
    int sumProfit = 0;
    while (i2 < prices.length) {
        int profit = prices[i2] - prices[i1];
        if (profit > 0) {
            sumProfit += profit;
        }
        i1++;
        i2++;
    }
    return sumProfit;
}

public static void main(String[] args) {
    System.out.println(maxProfit(new int[]{7, 1, 5, 3, 6, 4})); // 7
}
```

# Stock III

[Problem Description](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iii/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=199&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maxProfit(int[] prices) {
    int hold1 = Integer.MIN_VALUE;
    int sell1 = 0;
    int hold2 = Integer.MIN_VALUE;
    int sell2 = 0;
    for (int price : prices) {
        hold1 = Math.max(hold1, -price);
        sell1 = Math.max(sell1, hold1 + price);
        
        hold2 = Math.max(hold2, sell1 - price);
        sell2 = Math.max(sell2, hold2 + price);
    }
    return sell2;
}

public static void main(String[] args) {
    System.out.println(maxProfit(new int[]{3, 3, 5, 0, 0, 3, 1, 4})); // 6
}
```

# Stock IV

[Problem Description](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iv/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=200&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maxProfit(int k, int[] prices) {
    if (k > prices.length / 2) {
        return maxProfit(prices);
    }
    
    int[] hold = new int[k];
    int[] sell = new int[k];
    Arrays.fill(hold, Integer.MIN_VALUE);
    for (int price : prices) {
        hold[0] = Math.max(hold[0], -price);
        sell[0] = Math.max(sell[0], hold[0] + price);
        
        for (int i = 1; i < k; i++) {
            hold[i] = Math.max(hold[i], sell[i - 1] - price);
            sell[i] = Math.max(sell[i], hold[i] + price);
        }
    }
    
    return sell[k - 1];
}

public static int maxProfit(int[] prices) {
    int i1 = 0;
    int i2 = 1;
    int sumProfit = 0;
    while (i2 < prices.length) {
        int profit = prices[i2] - prices[i1];
        if (profit > 0) {
            sumProfit += profit;
        }
        i1++;
        i2++;
    }
    return sumProfit;
}

public static void main(String[] args) {
    System.out.println(maxProfit(2, new int[]{3, 3, 5, 0, 0, 3, 1, 4})); // 6
    System.out.println(maxProfit(4, new int[]{3, 3, 5, 0, 0, 3, 1, 4})); // 8
    System.out.println(maxProfit(8, new int[]{3, 3, 5, 0, 0, 3, 1, 4})); // 8
    System.out.println(maxProfit(4, new int[]{1, 2, 0, 1, 0, 3, 1, 4, 5})); // 9
}
```

# Stock with Fee (Two 1D Array)

[Problem Description](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=197&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maxProfit(int[] prices, int fee) {
    int[] hold = new int[prices.length];
    int[] sell = new int[prices.length];
    hold[0] = -prices[0];
    sell[0] = 0;
    for (int i = 1; i < prices.length; i++) {
        hold[i] = Math.max(hold[i - 1], sell[i - 1] - prices[i]);
        sell[i] = Math.max(sell[i - 1], hold[i - 1] + prices[i] - fee);
    }
    return sell[prices.length - 1];
}

public static void main(String[] args) {
    System.out.println(maxProfit(new int[] {1, 3, 2, 8, 4, 9}, 2)); // 8
}
```

# Stock with Fee (Two Variable)

```java
public static int maxProfit(int[] prices, int fee) {
    int preHold = -prices[0];
    int preSell = 0;
    for (int i = 1; i < prices.length; i++) {
        int curHold = Math.max(preHold, preSell - prices[i]);
        int curSell = Math.max(preSell, preHold + prices[i] - fee);
        preHold = curHold;
        preSell = curSell;
    }
    return preSell;
}
```

# Stock with Fee (Two Variable)

```java
public static int maxProfit(int[] prices, int fee) {
    int hold = Integer.MIN_VALUE;
    int sell = 0;
    for (int price : prices) {
        hold = Math.max(hold, sell - price);
        sell = Math.max(sell, hold + price - fee);
    }
    return sell;
}
```

# Stock with Cooldown

[Problem Description](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-cooldown/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6?p=198&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int maxProfit(int[] prices) {
    if (prices.length == 1) {
        return 0;
    }
    int[] hold = new int[prices.length];
    int[] sell = new int[prices.length];
    hold[0] = -prices[0];
    hold[1] = Math.max(hold[0], -prices[1]);
    sell[0] = 0;
    sell[1] = Math.max(sell[0], hold[0] + prices[1]);
    for (int i = 2; i < prices.length; i++) {
        hold[i] = Math.max(hold[i - 1], sell[i - 2] - prices[i]);
        sell[i] = Math.max(sell[i - 1], hold[i - 1] + prices[i]);
    }
    return sell[prices.length - 1];
}

public static void main(String[] args) {
    System.out.println(maxProfit(new int[]{1,2,3,0,2})); // 3
}
```

