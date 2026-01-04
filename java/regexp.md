# RegExp

```java
String content = "1998 年12 月8 日，第二代Java 平台的企业版J2EE 发布。1999 年6 月，Sun 公司发布了" +
        "第二代Java 平台（简称为Java2）的3 个版本：J2ME（Java2 Micro Edition，Java2 平台的微型" +
        "版），应用于移动、无线及有限资源的环境；J2SE（Java 2 Standard Edition，Java 2 平台的" +
        "标准版），应用于桌面环境；J2EE（Java 2Enterprise Edition，Java 2 平台的企业版），应" +
        "用3443 于基于Java 的应用服务器。Java 2 平台的发布，是Java 发展过程中最重要的一个" +
        "里程碑，标志着Java 的应用开始普及9889 ";
// 正则表达式
String regStr = "\\d\\d\\d\\d";
// 正则表达式对象
Pattern pattern = Pattern.compile(regStr);
// 匹配正则表达式
Matcher matcher = pattern.matcher(content);
// 遍历结果
// groups[0] = 匹配内容的开始索引 (比如: "1998" 的 0)
// groups[1] = 匹配内容的结束索引 + 1 (比如: "1998" 的 3 + 1)
// oldLast = 匹配内容的结束索引 + 1 的值, 下一次 find(), 就从 oldLast 开始 
while (matcher.find()) {
    System.out.println(matcher.group(0));
}
```

# ESC

`\\` 匹配 `.`, `*`, `+`, `?`, `(`, `)`, `[`, `]`, `/`, `\`

```java
String regStr1 = "\\(";
String regStr2 = "("; // error
```
# Character Matching

匹配字符串

```java
String regStr = "abc"; // 匹配 "abc"
```

匹配区分大小写

```java
String regStr = "(?i)abc"; // 匹配 "abc", 不区分大小写
String regStr = "a(?i)bc"; // 匹配 "abc, "a" 区分大小写, "bc" 不区分大小写
String regStr = "a((?i)b)c"; // 匹配 "abc", "a" 和 "c" 区分大小写, "b" 不区分大小写
```

设置参数, 规定不区分大小写

```java
Pattern pattern = Pattern.compile(regStr, Pattern.CASE_INSENSITIVE);
```

`|`

```java
String regStr = "sun|xue|cheng|"; // 匹配 "sun", "xue", "cheng"
```

`[]`

```java
String regStr = "[0-9]"; // 匹配 0-9
String regStr = "[a-z]"; // 匹配 a-z
String regStr = "[A-Z]"; // 匹配 A-Z
```

`[^]`

```java
String regStr = "[^0-9]"; // 不匹配 0-9
String regStr = "[^a-z]"; // 不匹配 a-z
String regStr = "[^adf]"; // 不匹配 'a', 'd', 'f'
```

`\\d`, `\\D`, `\\w`, `\\W`, `\\s`, `\\S`, `.`

```java
String regStr = "\\d"; // 匹配 0-9
String regStr = "\\D"; // 不匹配 0-9
String regStr = "\\w"; // 匹配 a-z, 0-9, '_'
String regStr = "\\W"; // 不匹配 a-z, 0-9, '_'
String regStr = "\\s"; // 匹配 空白字符 (space, tab, return)
String regStr = "\\S"; // 不匹配 空白字符
String regStr = "."; // 不匹配 `\n`, 匹配全部
```

# Feature Mathcing

(?:pattern)

```java
String regStr = "sun(?:AA|BB|CC)"; // 匹配 "sunAA" 或 "sunBB" 或 "sunCC"
```

(?=pattern)

```java
String regStr = "sun(?=AA|BB|CC)"; // 匹配 "sunAA" 或 "sunBB" 或 "sunCC" 中的 "sun"
```

(?!pattern)

```java
String regStr = "sun(?!AA|BB|CC)"; // 匹配不是 "sunAA" 和 "sunBB" 和 "sunCC" 中的 "sun"
```

# Qualifier

限定符: 限定匹配字符的个数

```java
String regStr = "a{3}"; // 匹配 3 个 "a"
String regStr = "a{3,}"; // 匹配 至少 3 个 "a"
String regStr = "a{3,5}"; // 匹配 3 到 5 个 "a"
String regStr = "a+"; // 匹配 1 个 或 多个 "a"
String regStr = "a*"; // 匹配 0 个 或 多个 "a"
String regStr = "a?"; // 匹配 0 个 或 1 个 "a"
```

java 遵循贪婪匹配, 会尽可能多的匹配

```java
String regStr = "a{3,5}"; // 尽量匹配 5 个 "a"
String regStr = "a+"; // 尽量匹配 多个 "a"
```

`?` 非贪婪匹配

```java
String regStr = "a{3,5}?"; // 尽量匹配 3 个 "a"
String regStr = "a+?"; // 尽量匹配 1 个 "a"
```

# Locator

`^`, `$`

```java
String regStr = "^[0-9]+[a-z]*"; // 匹配 至少 1 个 [0-9] 开头, 至少 0 个 [a-z]
String content1 = "123abc"; // 匹配到 "123abc"
String content2 = "a123bc"; // 匹配不到
String content3 = "12abc3"; // 匹配到 "12abc"

String regStr = "[0-9]+[a-z]*$"; // 匹配 至少 1 个 [0-9], 至少 0 个 [a-z] 结尾
String content1 = "123abc"; // 匹配到 "123abc"
String content2 = "a123bc"; // 匹配不到 "123bc"
String content3 = "12abc3"; // 匹配不到

String regStr = "^[0-9]+[a-z]*$"; // 匹配 至少 1 个 [0-9] 开头, 至少 0 个 [a-z] 结尾
String content1 = "123abc"; // 匹配到 "123abc"
String content2 = "a123bc"; // 匹配不到
String content3 = "12abc3"; // 匹配不到
```

`\\b`, `\\B`

```java
String regStr = "sun\\b"; // 匹配 "sun" 结尾 (不是指整句)
String content1 = "asun"; // 匹配到 "sun"
String content1 = "suna"; // 匹配不到
String content2 = "asuna"; // 匹配不到
String content3 = "aaas un"; // 匹配不到
String content3 = "asun aasun asuna"; // 匹配到 2 个 "sun"

String regStr = "sun\\B"; // 匹配 "sun" 开头 (不是指整句)
String content1 = "suna"; // 匹配到 "sun"
String content2 = "asun"; // 匹配不到
String content3 = "suna sunaa asuna"; // 匹配到 2 个 "sun"
```

# Group

普通分组

```java
String content = "123456";
// 将 "123456" 分成 "123", "45", "6" 三组
String regStr = "(\\d\\d\\d)(\\d\\d)(\\d)";
Pattern pattern = Pattern.compile(regStr);
Matcher matcher = pattern.matcher(content);
while (matcher.find()) {
    System.out.println(matcher.group(0)); // "123456"
    System.out.println(matcher.group(1)); // "123"
    System.out.println(matcher.group(2)); // "45"
    System.out.println(matcher.group(3)); // "6"
}
```

命名分组

```java
String content = "123456";
// 第一组命名 "g1", 第二组命名 "g2", 第三组命名 "g3"
String regStr = "(?<g1>\\d\\d\\d)(?<g2>\\d\\d)(?<g3>\\d)";
Pattern pattern = Pattern.compile(regStr);
Matcher matcher = pattern.matcher(content);
while (matcher.find()) {
    // 通过组名访问
    System.out.println(matcher.group("g1")); // "123"
    System.out.println(matcher.group("g2")); // "45"
    System.out.println(matcher.group("g3")); // "6
}
```

内部反向引用分组

```java
String regStr = "(\\d)\\1"; // \\1 引用 第 1 个 分组
String content = "a11a"; // 匹配到 "11"

String regStr = "(\\d)\\1{4}"; // \\1{4} 引用 第 1 个 分组 4 次
String content = "a11111a"; // 匹配到 "11111"

String regStr = "(\\d)(\\d)\\2\\1"; // \\1 引用 第 1 个 分组, \\2 引用 第 2 个分组
String content = "a1221a"; // 匹配到 "1221"
```

```java
String content = "a1221a"; // 匹配到 "1221"
String regStr = "(\\d)(\\d)\\2\\1";
Pattern pattern = Pattern.compile(regStr);
Matcher matcher = pattern.matcher(content);
while (matcher.find()) {
    System.out.println(matcher.group(0)); // "1221"
    System.out.println(matcher.group(1)); // "1"
    System.out.println(matcher.group(2)); // "2"
}
```

外部反向引用分组

```java
String content = "aabb";
String regStr = "(\\w)\\1(\\w)\\2";
Pattern pattern = Pattern.compile(regStr);
Matcher matcher = pattern.matcher(content);
content = matcher.replaceAll("$1$2$1$2"); // "abab"
```

# Pattern

Pattern 没有公共构造器, 通过 Pattern.compile(regStr) 创建 Pattern 对象

## matches()

```java
String content = "sun";

String regStr = "s";
// 判断 regStr 是否可以匹配 content
boolean matches = Pattern.matches(regStr, content); // false

String regStr = "[a-z]{3}";
boolean matches = Pattern.matches(regStr, content); // true

String regStr = ".*";
boolean matches = Pattern.matches(regStr, content); // true

String content = "我是孙学成";
String regStr = "[\u0391-\uffe5]*";
boolean matches = Pattern.matches(regStr, content); // true
```

# Matcher

## matches()

```java
String content = "sun";
String regStr = "[a-z]*";
Pattern pattern = Pattern.compile(regStr);
Matcher matcher = pattern.matcher(content);
// 判断 regStr 是否可以匹配 content
boolean matches = matcher.matches(); // true
```

## start(), end()

```java
String content = "hello sun xue cheng, hello harvey";
String regStr = "hello";
Pattern pattern = Pattern.compile(regStr);
Matcher matcher = pattern.matcher(content);
while (matcher.find()) {
    // 匹配内容的开始索引
    System.out.println(matcher.start());
    // 匹配内容的结束索引 + 1
    System.out.println(matcher.end());
    // 根据两个索引截取字符串
    System.out.println(content.substring(matcher.start(), matcher.end()));
}
```

## replaceAll()

```java
String content = "sunAA and sunBB";
String regStr = "sun(AA|BB)"
Pattern pattern = Pattern.compile(regStr);
Matcher matcher = pattern.matcher(content);
// 替换 matcher 匹配到的 "sunAA", "sunBB" 为 "sun"
String newContent = matcher.replaceAll("sun"); // "sun and sun"
```

# String

## mathces()

```java
String content = "sun";
boolean matches = content.matches("[a-z]*"); // true
```

## replaceAll()

```java
String content = "sunAA and sunBB";
String newContent = content.replaceAll("sun(AA|BB)", "sun"); // "sun and sun"
```

## split()

```java
String content = "harveysuen0803@gmail.com";
String[] splits = content.split("#|-|~|@|\\.");
System.out.println(Arrays.toString(splits)); // [harveysuen0803, gmail, com]
```

# Exercise

## stammer

```java
String content = "我 ... 我想 ... 学学学学 ... 编程";

// remove "."
Pattern pattern = Pattern.compile("\\.+");
Matcher matcher = pattern.matcher(content);
content = matcher.replaceAll(""); // "我  我想  学学学学  编程"
System.out.println(content);

// remove " "
pattern = Pattern.compile("\\s+");
matcher = pattern.matcher(content);
content = matcher.replaceAll(""); // "我我想学学学学编程"

// remove duplicate content
pattern = Pattern.compile("(.)\\1+");
matcher = pattern.matcher(content);
content = matcher.replaceAll("$1"); // "我想学编程"

System.out.println(content);
```
