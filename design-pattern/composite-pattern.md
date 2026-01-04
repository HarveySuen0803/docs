# Composite Pattern

City 和 Composite 都实现 Count, 建立一个 tree structure, 所有的 Count implement 都存储在 list 中, 最后遍历计算结果

Composite Pattern 清晰的定义了 object structure, 可以操作 root node, 也可以单独操作 leaf node, 非常方便, 增加 node 也很方便, 符合 Open-Closed Principle

```java
public class Main {
    public static void main(String[] args) throws IOException {
        Composite china = new Composite();
        
        Composite js = new Composite();
        js.addCity(new City(1000));
        js.addCity(new City(2000));
        js.addCity(new City(3000));
        
        Composite sc = new Composite();
        sc.addCity(new City(500));
        sc.addCity(new City(4000));
        
        china.addCity(js);
        china.addCity(sc);
    }
}

interface Count {
    int countPopulation();
}

class City implements Count {
    private int population;
    
    public City(int population) {
        this.population = population;
    }
    
    @Override
    public int countPopulation() {
        return population;
    }
}

class Composite implements Count {
    private List<Count> list = new ArrayList<>();
    
    public void addCity(Count count) {
        list.add(count);
    }
    
    public void deleteCity(Count count) {
        list.remove(count);
    }
    
    @Override
    public int countPopulation() {
        int population = 0;
        for (Count count : list) {
            population += count.countPopulation();
        }
        return population;
    }
}
```