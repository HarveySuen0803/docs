# ResourceBundle

message_en_US.properties

```properties
test=hello world
```

Test

```java
ResourceBundle bundle = ResourceBundle.getBundle("message", new Locale("en", "US"));
String test = bundle.getString("test"); // hello world
```

