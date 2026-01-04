# Hutool

导入所有的 Hutool

```xml
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-all</artifactId>
    <version>5.8.25</version>
</dependency>
```

导入 HTTP 相关的 Hutool

```xml
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-http</artifactId>
    <version>5.8.25</version>
</dependency>
```

# FileUtil

```java
BufferedInputStream bis = FileUtil.getInputStream("/tmp/test.txt");
BufferedOutputStream bos = FileUtil.getOutputStream("/tmp/test.txt");
BufferedReader br = FileUtil.getReader("/tmp/test.txt", UTF_8);
BufferedWriter bw = FileUtil.getWriter("/tmp/test.txt", UTF_8, true);
```

# IoUtil

```java
ArrayList<String> lines = IoUtil.readLines(br, new ArrayList<>());
ArrayList<String> lines = IoUtil.readLines(bis, UTF_8, new ArrayList<>());
```

# ObjectUtil

```java
boolean isEmpty = ObjectUtil.isEmpty(new Object()); // true
boolean isNotEmpty = ObjectUtil.isNotEmpty(new Object()); // false
boolean isNull = ObjectUtil.isNull(null); // true
boolean isNotNull = ObjectUtil.isNotNull(null); // false
boolean isBasicType = ObjectUtil.isBasicType(); // true
```

# HtmlUtil

```java
// Escape the HTML characters in the text as safe characters
String escape = HtmlUtil.escape("<div>Hello World</div>"); // &lt;div&gt;Hello World&lt;/div&gt;

// Restore escaped HTML special characters
String unescape = HtmlUtil.unescape(escape); // <div>Hello World</div>
```

# ReUtil

```java
boolean isContains = ReUtil.contains(HtmlUtil.RE_HTML_MARK, "<div>Hello</div>"); // true

boolean isHtmlMark = ReUtil.isMatch(HtmlUtil.RE_HTML_MARK, "<div>Hello</div>"); // false
boolean isHtmlMark = ReUtil.isMatch(HtmlUtil.RE_HTML_MARK, "<div>"); // true
boolean isHtmlMark = ReUtil.isMatch(HtmlUtil.RE_HTML_MARK, "</div>"); // true

String res = ReUtil.extractMulti("(\\d+)-(\\d+)-(\\d+)", "123-45-6", "$1$2$3"); // 123456
```

# StrUtil

```java
boolean isBlank = StrUtil.isBlank(""); // true
boolean isBlank = StrUtil.isBlank(new String(" ")); // true
boolean isBlank = StrUtil.isBlank(new String("\t\n")); // false
boolean isEmpty = StrUtil.isEmpty(""); // true
boolean isEmpty = StrUtil.isEmpty(" "); // false
boolean isNull = StrUtil.isNullOrUndefined(null); // true
boolean isContains = StrUtil.contains("hello world", "hello"); // true

String str = StrUtil.removePrefix("test.txt", "test."); // txt
String str = StrUtil.removeSuffix("test.txt", ".txt"); // test

String str = StrUtil.format("input: {}, {}, {}", "a", "b", "c"); // intput: a, b, c

String str = StrUtil.str("hello".getBytes(UTF_8), UTF_8);

String str = StrUtil.join(new String[]{"a", "b", "c"}, ", ");
List<String> strs = StrUtil.split("a, b, c", ", ");

String str = StrUtil.upperFirst("hello"); // Hello

String str = StrUtil.sub("abcdefg", 1, 2); // b

StrBuilder sb = StrUtil.strBuilder("a", "b");
sb.append("c");
sb.append("d");
sb.append("e"); // abcde
sb.del(1, 3); // ade
sb.insert(1, "x"); // axde
sb.clear();
```

# ArrayUtil

```java
String[] strs = ArrayUtil.newArray(String.class, 10);

boolean isEmpty = ArrayUtil.isEmpty(new int[10]);
boolean isNotEmpty = ArrayUtil.isNotEmpty(new int[10]);
boolean isSorted = ArrayUtil.isSorted(new int[]{1, 2, 3, 4, 5});
```

# CollUtil

```java
ArrayList<String> list = CollUtil.newArrayList("a", "b", "c");
LinkedList<String> list = CollUtil.newLinkedList("a", "b", "c");
HashSet<String> set = CollUtil.newHashSet("a", "b", "c");
LinkedHashSet<String> set = CollUtil.newLinkedHashSet("a", "b", "c");

String joinStr = CollUtil.join(List.of("a", "b", "c"), ", ");
```

# MapUtil

```java
HashMap<Object, Object> map = MapUtil.newHashMap();

boolean isEmpty = MapUtil.isEmpty(new HashMap<>());
boolean isNotEmpty = MapUtil.isNotEmpty(new HashMap<>());
```

# SpringUtil

```java
UserService userService = SpringUtil.getBean(UserService.class);
UserService userService = SpringUtil.getBean("userService");

ApplicationContext context = SpringUtil.getApplicationContext();

String[] profiles = SpringUtil.getActiveProfiles();
```

# BeanUtil

```java
boolean isEmpty = BeanUtil.isEmpty(new User());
boolean isBean = BeanUtil.isBean(UserService.class);
boolean hasNullField = BeanUtil.hasNullField(new User());

UserDto userDto = new UserDto();
userDto.setName("harvey");
userDto.setAge(18);
User user = BeanUtil.copyProperties(userDto, User.class);

User user = new User();
user.setName("harvey");
user.setAge(18);
Map<String, Object> map = BeanUtil.beanToMap(user, false, true);
```

# NetUtil

```java
boolean isInnerIP = NetUtil.isInnerIP("192.168.10.10");
```

# JSONUtil

```java
JSONArray jsonArr = JSONUtil.createArray();
jsonArr.set(1, new User("harvey", 18));
jsonArr.set(2, new User("bruce", 20));
System.out.println(jsonArr); // [{"name":"harvey","age":18},{"name":"bruce","age":20}]

JSONObject jsonObj = JSONUtil.createObj();
jsonObj.set("name", "harvey");
jsonObj.set("age", 18);
System.out.println(jsonObj); // {"name":"harvey","age":18}

boolean isValid = JSONUtil.isJson("{\"name\":\"harvey\",\"age\":18}");

String jsonStr = JSONUtil.toJsonStr(new User("harvey", 18));

User user = JSONUtil.toBean(jsonStr, User.class);

JSONObject jsonObj = JSONUtil.parseObj(jsonStr);

JSONArray jsonArr = JSONUtil.parseArray(jsonStr);
```

# JWTUtil

```java
HashMap<String, Object> payload = new HashMap<>();
payload.put(JWTPayload.NOT_BEFORE, DateTime.now());
payload.put(JWTPayload.ISSUED_AT, DateTime.now());
payload.put(JWTPayload.EXPIRES_AT, DateTime.now().offset(DateField.MONTH, 1));
String token = JWTUtil.createToken(jwtPayload, "token_key".getBytes());

payload.put("username", user.getUsername());
payload.put("password", user.getPassword());
byte[] key = "key".getBytes();

String token = JWTUtil.createToken(payload, key);
System.out.println(token);

boolean isValid = JWTUtil.verify(token, key); // true

JWT jwt = JWTUtil.parseToken(token);
String username = (String) jwt.getPayload("username"); // harvey
boolean verifyKey = jwt.setKey(key).verify(); // true
boolean verifyTime = jwt.setKey(key).validate(0); // true
String algo = jwt.getAlgorithm(); // HS256
JWTHeader header = jwt.getHeader(); // {"typ":"JWT","alg":"HS256"}
Object header = jwt.getHeader(JWTHeader.TYPE); // JWT
```

# Validator

```java
boolean isEmail = Validator.isEmail("test@example.com");
boolean isCitizenId = Validator.isCitizenId("321003201112136510");
boolean isChinese = Validator.isChinese("你好");
boolean isUrl = Validator.isUrl("https://www.example.com");
boolean isMobile = Validator.isMobile("13800000000");
```

# Convert

```java
String str = Convert.toStr(123);
String str = Convert.toStr(new String[]{"1", "2", "3"}); // [1, 2, 3]

String[] strs = Convert.toStrArray(new int[]{1, 2, 3});
Integer[] ints = Convert.toIntArray(new String[]{"1", "2", "3"});
List<?> list = Convert.toList(new String[]{"a", "b", "c"});
List<String> list = Convert.toList(String.class, new String[]{"a", "b", "c"});

String dateStr = "2024-01-01";
Date date = Convert.toDate(dateStr);

String localDateTimeStr = "2024.01.01 12:34:56";
LocalDateTime localDateTime = Convert.toLocalDateTime(localDateTimeStr);
```
