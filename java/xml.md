# XML

XML: 可以表示非常复杂的数据结构

XML 的应用场景

- 网络传输
- 配置文件

```xml
<!-- 文档声明 -->
<?xml version="1.0" encoding="UTF-8" ?>

<users>
    <user id="1">
        <name>sun</name>
        <age>18</age>
    </user>
    <user id="2">
        <name>xue</name>
        <age>20</age>
    </user>
</users>
```

# ESC

```xml
<!-- < -->
&lt;
<!-- > -->
&gt;
<!-- & -->
&amp;
<!-- ' -->
&apos;
<!-- " -->
&quot;
```

# CDATA

CDATA 区域内可以输入任意特殊字符

```xml
<![CDATA[
    select * from users where id > 10 and id < 20;
]]>
```

# DTD

DTD: 可以约束 XML 格式, 不可以约束数据类型

user.dtd

```html
<!-- users 内至少有 0 个 user -->
<!ELEMENT users (user+)>
<!-- user 至少有 1 个 name, age, address-->
<!ELEMENT user (name, age, address)>
<!ELEMENT name (#PCDATA)>
<!ELEMENT age (#PCDATA)>
<!-- address 至少有 0 个 province, city -->
<!ELEMENT address (province*, city*)>
<!ELEMENT province (#PCDATA)>
<!ELEMENT city (#PCDATA)>
```

user.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!-- 导入 user.dtd -->
<!DOCTYPE users SYSTEM "user.dtd">
<users>
    <user>
        <name>sun</name>
        <age>18</age>
        <address>
            <province>Jiangsu</province>
            <city>Yangzhou</city>
        </address>
    </user>
    <user>
        <name>xue</name>
        <age>20</age>
        <address>
        </address>
    </user>
</users>
```

# Schema

Schema: 可以约束 XML 格式, 也可以约束数据类型

user.xsd

```xml
<?xml version="1.0" encoding="UTF-8" ?>

<schema xmlns="http://www.w3.org/2001/XMLSchema" targetNamespace="com/harvey/user.xsd" elementFormDefault="qualified">
    <element name="users">
        <complexType>
            <!-- 设置子标签可以是任意个 -->
            <sequence maxOccurs="unbounded">
                <element name="user">
                    <complexType>
                        <sequence maxOccurs="unbounded">
                            <element name="name" type="string"/>
                            <element name="age" type="integer"/>
                            <element name="address">
                                <complexType>
                                    <sequence maxOccurs="unbounded">
                                        <element name="province" type="string"/>
                                        <element name="city" type="string"/>
                                    </sequence>
                                </complexType>
                            </element>
                        </sequence>
                    </complexType>
                </element>
            </sequence>
        </complexType>
    </element>
</schema>
```

user.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!-- 根据 targetNamespace, 导入 user.xsd -->
<users xmlns="com/harvey/user.xsd" >
    <user>
        <name>sun</name>
        <age>18</age>
        <address>
            <province>Jiangsu</province>
            <city>Yangzhou</city>
        </address>
    </user>

    <user>
        <name>sun</name>
        <age>18</age>
        <address>
            <province>Jiangsu</province>
            <city>Yangzhou</city>
        </address>
    </user>
</users>
```

# XML analysis

DOM: 解析器将 XML 全部加载到内存, 生成一个 Document 对象

- 优点: 可以保留元素之间的结构, 可以针对元素进行增删改查
- 缺点: 文件过大, 可能会导致内存溢出

SAX: 解析器逐行扫描解析 XML, 以事件的方式进行解析, 每解析一行, 就会触发一个事件

- 优点: 速度快, 高校, 不会导致内存溢出, 可以处理大文件
- 缺点: 只能读, 不能写

常见的解析器类库

- dom4j
- jsoup: DOM 解析, 非常适合解析 HTML

## DOM4J

配置依赖

```xml
<dependency>
    <groupId>org.dom4j</groupId>
    <artifactId>dom4j</artifactId>
    <version>2.1.4</version>
</dependency>
```

准备解析的 XML, user.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>

<users>
    <user id="1">
        <name>sun</name>
        <age>18</age>
    </user>
    <user id="2">
        <name>xue</name>
        <age>20</age>
    </user>
</users>
```

解析 XML

```java
public class Main {
    public static void main(String[] args) {
        // 解析器对象
        SAXReader saxReader = new SAXReader();

        try {
            // 解析器读取 XML, 生成 Document 对象
            Document document = saxReader.read(Main.class.getClassLoader().getResource("user.xml"));
            // 返回根标签
            Element rootElement = document.getRootElement();
            // 返回子标签
            // List<Element> elements() 返回全部子标签
            // Element element(String name) 根据子标签名, 返回一个子标签
            // List<Element> elements(String name) 根据子标签名, 返回多个子标签
            List<Element> userElements = rootElement.elements();
            // 遍历子标签
            for (Element userElement : userElements) {
                // 返回标签名
                System.out.println(userElement.getName());
                // 根据属性名, 返回属性值
                System.out.println(userElement.attributeValue("id"));
                // 根据子标签名, 返回子标签值
                System.out.println(userElement.elementText("name"));
                List<Element> elementList = userElement.elements();
                for (Element element : elementList) {
                    // 返回标签值
                    System.out.println(element.getText());
                    // 返回标签值, 并去除前后空格
                    System.out.println(element.getTextTrim());
                }
            }
        } catch (DocumentException e) {
            e.printStackTrace();
        }
    }
}
```

## DOM4J parser utils

封装 utils/UserXmlParserUtils.java

```java
public class UserXmlParserUtils {
    public static <T> List<T> parse(URL url, Class<T> targetClass) throws Exception {
        List<T> list = new ArrayList<>();
        SAXReader saxReader = new SAXReader();
        Document document = saxReader.read(url);
        Element rootElement = document.getRootElement();
        List<Element> elements = rootElement.elements("user");

        for (Element element : elements) {
            String name = element.element("name").getText();
            String age = element.element("age").getText();
            String sex = element.element("sex").getText();

            Constructor<T> constructor = targetClass.getDeclaredConstructor(String.class, Integer.class, String.class);
            constructor.setAccessible(true);
            T object = constructor.newInstance(name, Integer.parseInt(age), sex);

            list.add(object);
        }

        return list;
    }
}
```

通过 UserXmlParserUtils.java 解析 user.xml, 并封装到 userList 中

```java
List<User> userList = UserXmlParserUtils.parse(TestController.class.getClassLoader().getResource("user.xml"), User.class);
```

## XPath

通过 XPath 搭配 dom4j 获取指定标签

配置依赖

```xml
<dependency>
    <groupId>jaxen</groupId>
    <artifactId>jaxen</artifactId>
    <version>2.0.0</version>
</dependency>
```

返回一个标签 (如果是多个标签, 就返回第一个)

```java
Node node = document.selectSingleNode("/userList/user/name");
Element element = (Element) node;
```

返回多个标签

```java
List<Node> nodes = document.selectNodes("/userList/user/name");
for (Node node : nodes) {
    Element element = (Element) node;
}
```

### select by absulate path

```java
Element element = (Element) document.selectSingleNode("/userList/user/name");
```

### select by relative path

```java
Element nameElement = (Element) document.selectSingleNode("/userList/user/name");
Element ageElement = (Element) nameElement.selectSingleNode("../age");
```

### select by global

```java
Element element = (Element) document.selectSingleNode("//name");
```

### select by condition

```java
// 返回属性为 id = "1" 的 user 标签
Element element = (Element) document.selectSingleNode("//user[@id='1']");
```

