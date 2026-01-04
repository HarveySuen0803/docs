# Stream

Stream 采用聚合, 将中间操作存放在 stack 中, 不进行处理, 一直到最终操作进行整体处理

- 底层提供串行和并行两种处理模式, 并行采用 Fork/Join 拆分任务

```java
List<String> list = new ArrayList<>();
list.add("sun");
list.add("xue");
list.add("cheng");

Stream<String> stream1 = list.stream();
Stream<String> stream2 = stream1.filter((name) -> name.contains("n"));
Stream<String> stream3 = stream2.filter((name) -> name.length() == 3);
stream3.forEach(System.out::println); // sun

// chained programming
list.stream()
    .filter((name) -> name.contains("n"))
    .filter((name) -> name.length() == 3)
    .forEach(System.out::println); // sun
```

# Get Stream

Array -> Stream

```java
Stream<String> stream = Stream.of(new String[]{"sun", "xue", "cheng"});

// Simplify
Stream<String> stream = Stream.of("sun", "xue", "cheng");
```

List -> Stream

```java
Stream<String> stream = new ArrayList<String>().stream();
```

Set -> Stream

```java
Stream<String> stream = new HashSet<String>().stream();
```

Map keySet -> Stream

```java
Stream<String> stream = new HashMap<String, Integer>().keySet().stream();
```

Map valueSet -> Stream

```java
Stream<Integer> stream = new HashMap<String, Integer>().values().stream();
```

Map entrySet -> Stream

```java
Stream<Map.Entry<String, Integer>> stream = new HashMap<String, Integer>().entrySet().stream();
```

# filter()

```java
Stream<String> stream = Stream.of("sun", "xue", "cheng");
stream.filter((name) -> name.contains("n"))
      .filter((name) -> name.length() == 3)
      .forEach(System.out::println); // sun
```

# map()

```java
stream.map(String::toUpperCase).forEach(System.out::println);

Stream<String> stream = Stream.of("name=harvey", "age=18", "sex=male");
Set<String> keySet = stream.map((str) -> str.split("=")[0]).collect(Collectors.toSet());

Stream<String> stream = Stream.of("name=harvey", "age=18", "sex=male");
Set<String> valSet = stream.map((str) -> str.split("=")[1]).collect(Collectors.toSet());
```

# flatMap()

```java
Stream<String> stream = Stream.of("hello world", "I am a software engineer");
List<String> list = stream.flatMap((str) -> Arrays.stream(str.split(" ")))
                          .toList(); // [hello, world, I, am, a, software, engineer]
```

# mapToObj()

```java
String[] strs = Arrays.stream(nums).mapToObj(Integer::toString).toArray(String[]::new);
```

# boxed()

```java
IntStream intStream = IntStream.of(1, 2, 3);
Stream<Integer> stream = IntStream.of(1, 2, 3).boxed();
Stream<Long> stream = LongStream.of(1L, 2L, 3L).boxed();
Stream<Double> stream = DoubleStream.of(1.0, 2.0, 3.0, 4.0, 5.0).boxed();

int[] arr = stream.mapToInt(Integer::valueOf).toArray();
```

# limit()

```java
Stream<String> stream = Stream.of("a", "b", "c", "d", "e");
stream.limit(3).forEach(System.out::println); // a, b, c
```

# skip()

```java
Stream<String> stream = Stream.of("a", "b", "c", "d", "e");
stream.skip(3).forEach(System.out::println); // d, e
```

# concat()

```java
Stream<String> stream1 = Stream.of("a", "b", "c");
Stream<String> stream2 = Stream.of("b", "c", "d");
Stream.concat(stream1, stream2).forEach(System.out::println); // a, b, c, b, c, d
```

# distinct()

```java
Stream<String> stream = Stream.of("a", "a", "a", "b", "b", "c");
stream.distinct().forEach(System.out::println); // a, b, c
```

# forEach()

```java
stream.forEach(System.out::println);
```

# count()

```java
long count = stream.count();
```

# collect()

```java
List<String> list = stream.collect(Collectors.toList());
```

```java
Set<String> set = stream.collect(Collectors.toSet());
```

```java
Stream<String> stream = Stream.of(new String[]{"sun:18", "xue:20", "cheng:22"});
// (str) -> str.split(":")[0] 作 key, (str) -> Integer.parseInt(str.split(":")[1] 作 val
Map<String, Integer> map = stream.collect(Collectors.toMap((str) -> {
    return str.split(":")[0];
}, (str) -> {
    return Integer.parseInt(str.split(":")[1]);
}));
```

```java
Stream<String> stream = Stream.of("I", "am", "a", "software", "engineer");
String str = stream.collect(Collectors.joining(" ")); // I am a software engineer
```

```java
Stream<Integer> stream = Stream.of(1, 2, 3, 4, 5);
Double avg = stream.collect(Collectors.averagingInt(num -> num * 10)); // 30.0
```

```java
Stream<Integer> stream = Stream.of(1, 2, 3, 4, 5);
IntSummaryStatistics summary = stream.collect(Collectors.summarizingInt(num -> num)); // IntSummaryStatistics{count=5, sum=15, min=1, average=3.000000, max=5}
```

# toArray()

```java
Stream<String> stream = Stream.of("a", "b", "c");

Object[] objs = stream().toArray();
String[] strs = stream().toArray(String[]::new);
```

# toList()

```java
Stream<String> stream = Arrays.stream(new String[]{"a", "b", "c"});

List<String> list = stream.toList();
```

# Immutable Collection

通过 of() 创建 Immutable Collection

```java
List<String> list = List.of("a", "b", "c");
list.add("d"); // Error

Set<String> set = Set.of("a", "b", "c");
set.add("d"); // Error

Map<String, Integer> map = Map.of("a", 1, "b", 2, "c", 3);
map.put("d", 4); // Error
```

Map 可以通过 of() 创建 10 个元素以内的 Immutable Collection, 超过 10 元素, 就需要通过 ofEntries() 传递 Map.Entry[] 转成 Map

```java
Map<String, Integer> map1 = new HashMap<>();
map1.put("a", 1);
map1.put("b", 2);
map1.put("c", 3);

Map<String, Integer> map2 = Map.ofEntries(map1.entrySet().toArray(Map.Entry[]::new));
map2.put("d", 4); // Error
```

Map 的 copyOf() 底层就是通过 ofEntries() 将 Map.Entry[] 转成的 Immutable Collection, 帮我吗封装好了, 使用更方便

```java
Map<String, Integer> map3 = Map.copyOf(map1);
map3.put("d", 4); // Error
```

# anyMatch()

```java
Stream<Integer> stream = Stream.of(1, 2, 3, 4, 5);
boolean anyMatch = stream.anyMatch((num) -> num == 3); // true
```

```java
Stream<String> stream = Stream.of("1", "2", "3", "4", "5");
boolean anyMatch = stream.anyMatch("3"::equals); // true
```

# ifPersent()

```java
Stream<String> stream = Stream.of(" 1", "2 ", " 3", "4 ", " 5 ");
stream.map((str) -> Integer.parseInt(str.trim()))
      .findFirst()
      .ifPresent(System.out::println);
```

# Exercixe

```java
Stream<Integer> stream = Stream.of(103, 101, 102, 105, 104);
List<User> list = stream.filter((id) -> id % 2 == 0)
                        .distinct()
                        .map(User::new)
                        .sorted(Comparator.comparingInt(User::getId))
                        .toList();
```

