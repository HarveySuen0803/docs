# Strategy Pattern (Object)

```java
public class Main {
    public static void main(String[] args) {
        NumberSorter sorter = new NumberSorter(new BubbleSortStrategy());
        
        sorter.sort(new int[]{5, 1, 3, 2, 4});
        
        sorter.setStrategy(new QuickSortStrategy());
        sorter.sort(new int[]{5, 1, 3, 2, 4});
        
        sorter.setStrategy(new BubbleSortStrategy());
        sorter.sort(new int[]{5, 1, 3, 2, 4});
    }
}

interface SortingStrategy {
    int[] sort(int[] numbers);
}

class QuickSortStrategy implements SortingStrategy {
    public int[] sort(int[] numbers) {
        return numbers;
    }
}

class BubbleSortStrategy implements SortingStrategy {
    public int[] sort(int[] numbers) {
        return numbers;
    }
}

class NumberSorter {
    private SortingStrategy strategy;
    
    public NumberSorter(SortingStrategy strategy) {
        this.strategy = strategy;
    }
    
    public int[] sort(int[] numbers) {
        return strategy.sort(numbers);
    }
}
```

# Strategy Pattern (Class)

```java
public class Main {
    public static void main(String[] args) throws Exception {
        NumberSorter numberSorter = new NumberSorter(QuickSortStrategy.class);
        numberSorter.sort(new int[]{5, 1, 3, 2, 4});
        
        numberSorter.setStrategy(BubbleSortStrategy.class);
        numberSorter.sort(new int[]{5, 1, 3, 2, 4});
    }
}

interface SortingStrategy {
    void sort(int[] numbers);
}

class QuickSortStrategy implements SortingStrategy {
    public void sort(int[] numbers) {
        System.out.println("Quick sort: " + numbers);
    }
}

class BubbleSortStrategy implements SortingStrategy {
    public void sort(int[] numbers) {
        System.out.println("Bubble sort: " + numbers);
    }
}

class NumberSorter {
    private SortingStrategy strategy;
    
    public NumberSorter(Class<? extends SortingStrategy> cls) throws Exception {
        strategy = cls.getDeclaredConstructor().newInstance();
    }
    
    public void sort(int[] numbers) {
        strategy.sort(numbers);
    }
    
    public void setStrategy(Class<? extends SortingStrategy> cls) throws Exception {
        strategy = cls.getDeclaredConstructor().newInstance();
    }
}
```

# Optimize If-Else

如果不使用 Design Pattern, 程序中会含有大量 if-else, 如果需要添加策略, 就需要去修改源代码, 不符合 Open-Closed Principle

```java
String type = "A";

if ("A".equals(type)) {
    System.out.println("StrategyA is executed");
} else if ("B".equals(type)) {
    System.out.println("StrategyB is executed");
}
```

通过 Strategy Pattern + Factory Pattern 优化代码, 去除 if-else, 后续添加策略, 只需要添加到 Strategy, 并且注册到 StrategyFactory 即可

```java
public class Main {
    public static void main(String[] args) throws Exception {
        String type = "A";
        StrategyFactory.getStrategy(type).execute();
    }
}

interface Strategy {
    void execute();
}

class StrategyA implements Strategy {
    @Override
    public void execute() {
        System.out.println("StrategyA is executed");
    }
}

class StrategyB implements Strategy {
    @Override
    public void execute() {
        System.out.println("StrategyB is executed");
    }
}

class StrategyFactory {
    static {
        StrategyFactory.register("A", new StrategyA());
        StrategyFactory.register("B", new StrategyB());
    }
    
    private static HashMap<String, Strategy> strategyMap = new HashMap<>();
    
    public static Strategy getStrategy(String type) {
        return strategyMap.get(type);
    }
    
    public static void register(String type, Strategy strategy) {
        strategyMap.put(type, strategy);
    }
}
```

Spring 底层并没有用到 HashMap, 也就是没有用到 Factory Pattern, 而是直接通过 for 进行遍历判断, 不存在并发问题, 但是效率不高

Spring 在 Strategy 中添加了一个 support(String type) 进行判断, 将所有硬编码都放在了 Strategy 中, 这也是非常值得学习的, 能最大程度减少对 StrategyFactory 的依赖

```java
public class Main {
    public static void main(String[] args) throws Exception {
        String type = "A";
        StrategyFactory.getStrategy(type).execute();
    }
}

interface Strategy {
    void execute();
    boolean isSupport(String type);
}

class StrategyA implements Strategy {
    @Override
    public void execute() {
        System.out.println("StrategyA is executed");
    }
    
    @Override
    public boolean isSupport(String type) {
        return "A".equals(type);
    }
}

class StrategyB implements Strategy {
    @Override
    public void execute() {
        System.out.println("StrategyB is executed");
    }
    
    @Override
    public boolean isSupport(String type) {
        return "B".equals(type);
    }
}

class StrategyFactory {
    private static List<Strategy> strategyList = new ArrayList<>();
    
    static {
        strategyList.add(new StrategyA());
        strategyList.add(new StrategyB());
    }
    
    public static Strategy getStrategy(String type) {
        for (Strategy strategy : strategyList) {
            if (strategy.isSupport(type)) {
                return strategy;
            }
        }
        return null;
    }
    
    public static void register(Strategy strategy) {
        strategyList.add(strategy);
    }
}
```