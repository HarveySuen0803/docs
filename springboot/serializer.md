# @JsonFormat

添加 Jackson 依赖：

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.15.2</version>
</dependency>
```

可以在实体类中的日期字段上使用 ﻿`@JsonFormat` 注解来指定日期格式。这个注解可以直接用于日期类型的属性上，控制序列化输出和反序列化输入的格式。

```java
@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
private LocalDateTime createTime;
```

输出结果：

```json
{
    "createTime": "2023-08-13 12:35:24"
}
```

# Custom Serializer

可以给字段添加 `@JsonSerializer` 指定序列化器，做一些特殊的序列化。这里给 `phone` 指定了 `PhoneJsonSerializer` 来做特定的序列化，对 `phone` 做脱敏操作。

```java
public class PhoneJsonSerializer extends JsonSerializer<String> {
    @Override
    public void serialize(String srcValue, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        String tarValue = srcValue;
        
        if (srcValue.length() == 11) {
            tarValue = srcValue.substring(0, 3) + "****" + srcValue.substring(7, 11);
        }
        
        jsonGenerator.writeString(tarValue);
    }
}
```

```java
@JsonSerialize(using = PhoneJsonSerializer.class)
private String phone;
```