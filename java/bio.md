# Classify

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170914530.jpg)

按 操作数据的单位 分类

- 字节流: 按字节读取, 可以操作二进制文件, 无损
    - 比如: InputStream, OutputStream, FileInputStream, FileOutputStream
- 字符流: 按字符读取, 可以操作文本文件, 效率高
    - 比如: Reader, Writer, FileReader, FileWriter, BufferReader, BufferWriter

按 操作数据的方式 分类

- 节点流: 从一个特定的数据源读取数据
    - 比如: FileInputStream, FileOutputStream, FileReader, FileWriter
- 处理流: 基于节点流, 提供更强大的读写功能
    - 比如: BufferInputStream, BufferOutputStream, BufferReader, BufferWriter

字节流读取中文会乱码, 一个中文占三个字符, 需要通过字符流读取

# File

## Create File

```java
String filePath = "/Users/HarveySuen/Downloads/test.txt";
File file = new File(filePath);
file.createNewFile();
```

```java
File fileDir = new File("/Users/HarveySuen/Downloads");
String fileName = "test.txt";
File file = new File(fileDir, fileName);
file.createNewFile();
```

```java
String fileDir = "/Users/HarveySuen/Downloads";
String fileName = "test.txt";
File file = new File(fileDir, fileName);
file.createNewFile();
```

## Get File Info

```java
File file = new File("/Users/HarveySuen/Downloads/test.txt");

String fileName = file.getName(); // test.txt

String fileAbsolutePath = file.getAbsolutePath(); // /Users/HarveySuen/Downloads/test.txt

String filePath = file.getPath(); // /Users/HarveySuen/Downloads/test.txt

String fileDir = file.getParent(); // /Users/HarveySuen/Downloads

Long fileLength = file.length(); // 12

boolean isExists = file.exists(); // true

boolean isFile = file.isFile(); // true

boolean isDir = file.isDirectory(); // false
```

## Delete File

```java
File file = new File("/Users/HarveySuen/Downloads/test.txt");

if (file.delete()) {
    System.out.println("success");
} else {
    System.out.println("failure");
}
```

## Create Dir

```java
File dir = new File("/Users/HarveySuen/Downloads/test");

// mkdir() 新建一级目录, mkdirs() 新建多级目录
if (dir.mkdir()) {
    System.out.println("success");
} else {
    System.out.println("failure");
}
```

# byte stream

## FileInputStream

```java
String filePath = "/Users/HarveySuen/Downloads/test.txt";
FileInputStream fileInputStream = null;
int readData = 0;

try {
    fileInputStream = new FileInputStream(filePath);

    // read() 一次读取一个字节, 每个字节的 ASCII 存储在 readData 中
    while ((readData = fileInputStream.read()) != -1) {
        // int 转 Char
        System.out.print((char) readData);
    }
} catch (IOException e) {
    e.printStackTrace();
} finally {
    try {
        // 关闭 IO 流
        fileInputStream.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

```java
String filePath = "/Users/HarveySuen/Downloads/test.txt";
FileInputStream fileInputStream = null;
byte[] buf = new byte[8];
int readLen = 0;

try {
    fileInputStream = new FileInputStream(filePath);

    // read(byte[] b) 一次读取 8 个字节, 返回读取到的字节数, 每个字节的 ASCII 存储在 buf 中
    while ((readLen = fileInputStream.read(buf)) != -1) {
        // byte[] 转 String
        System.out.print(new String(buf, 0, readLen));
    }
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        fileInputStream.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

## FileOutputStream

```java
String filePath = "/Users/HarveySuen/Downloads/test.txt";
FileOutputStream fileOutputStream = null;

try {
    // FileOutputStream(String name) 覆盖写入
    // FileOutputStream(String name, boolean append) 追加写入
    fileOutputStream = new FileOutputStream(filePath, true);

    // write(int b) 写入字符, 字符自动转字节
    fileOutputStream.write('a');

    String str = "hello world";

    // write(byte[] b) 写入字节数组
    fileOutputStream.write(str.getBytes());

    // write(byte[] b, int off, int len) 写入 [2, 4] 的字节数组
    fileOutputStream.write(str.getBytes(), 2, 3);
} catch (IOException e) {
    e.printStackTrace();
} finally {
    try {
        fileOutputStream.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

## BufferedInputStream

```java
BufferedInputStream bufferedInputStream = null;
int readData = 0;

try {
    bufferedInputStream = new BufferedInputStream(new FileInputStream("/Users/HarveySuen/Downloads/test.txt"));

    // read() 一次读取一个字节, 每个字节的 ASCII 存储在 readData 中
    while ((readData = bufferedInputStream.read()) != -1) {
        System.out.print((char) readData);
    }
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        bufferedInputStream.close();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

```java
BufferedInputStream bufferedInputStream = null;
int readLen = 0;
byte[] buf = new byte[8];

try {
    bufferedInputStream = new BufferedInputStream(new FileInputStream("/Users/HarveySuen/Downloads/test.txt"));

    // read(byte[] b) 一次读取 8 个字节, 返回读取到的字节的长度, 每个字节的 ASCII 存储在 buf 中
    while ((readLen = bufferedInputStream.read(buf)) != -1) {
        System.out.print(new String(buf, 0, readLen));
    }
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        bufferedInputStream.close();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

## BufferedOutputStream

```java
BufferedOutputStream bufferedOutputStream = null;

try {
    bufferedOutputStream = new BufferedOutputStream(new FileOutputStream("/Users/HarveySuen/Downloads/test.txt", true));

    // write(int b) 写入字符, 自动转成字节
    bufferedOutputStream.write('a');

    String str = "hello world";

    // write(byte[] b) 写入字节数组
    bufferedOutputStream.write(str.getBytes());

    // write(byte[] b, int off, int len) 写入 [2, 4] 的字节数组
    bufferedOutputStream.write(str.getBytes(), 2, 3);
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        bufferedOutputStream.close();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

# character stream

## FileReader

```java
String filePath = "/Users/HarveySuen/Downloads/test.txt";
FileReader fileReader = null;
int readData = 0;

try {
    fileReader = new FileReader(filePath);

    // read() 一次读取一个字符, 每个字符的编码存储在 readData 中
    while ((readData = fileReader.read()) != -1) {
        System.out.print((char) readData);
    }
} catch (IOException e) {
    e.printStackTrace();
} finally {
    try {
        fileReader.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

```java
String filePath = "/Users/HarveySuen/Downloads/test.txt";
FileReader fileReader = null;
char[] buf = new char[8];
int readLen = 0;

try {
    fileReader = new FileReader(filePath);

    // read(char[] cbuf) 一次读取 8 个字符, 返回读取到的字符长度, 每个字符的编码存储在 buf 中
    while ((readLen = fileReader.read(buf)) != -1) {
        System.out.print(new String(buf, 0, readLen));
    }
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        fileReader.close();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

## FileWriter

```java
String filePath = "/Users/HarveySuen/Downloads/test.txt";
FileWriter fileWriter = null;

try {
    // FileWriter(String fileName) 覆盖写入
    // FileWriter(String fileName, boolean append) 追加写入
    fileWriter = new FileWriter(filePath);

    // write(int c) 写入字符
    fileWriter.write('a');

    // write(String str) 写入字符串
    fileWriter.write("hello world");

    // write(String str, int off, int len) 写入 [2, 4] 的字符串 
    fileWriter.write("hello world", 2, 3);

    char[] chars = {'a', 'b', 'c', 'd', 'e', 'f', 'g'};

    // write(char[] cbuf) 写入字符数组
    fileWriter.write(chars);

    // write(char[] cbuf, int off, int len) 写入 [2, 4] 的字符数组 
    fileWriter.write(chars, 2, 3);
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        fileWriter.close();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

## BufferedReader

```java
BufferedReader bufferedReader = null;
String line = null;
try {
    bufferedReader = new BufferedReader(new FileReader("/Users/HarveySuen/Downloads/test.txt"));

    while ((line = bufferedReader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        // 关闭外层的 处理流 BufferedReader 即可, 不需要关闭内层的 节点流 FileReader
        bufferedReader.close();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

## BufferedWriter

```java
BufferedWriter bufferedWriter = null;

try {
    bufferedWriter = new BufferedWriter(new FileWriter("/Users/HarveySuen/Downloads/test.txt", true));

    // 写入字符串
    bufferedWriter.write("hello world");

    // 写入换行符
    bufferedWriter.newLine();
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        bufferedWriter.close();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

# Serialization

Serialization 是将 object 转成 binary byte stream, 存储 data 和 data type

Deserialization 是将 binary byte stream 转成 object, 恢复 data 和 data type

Serilization 会对 class 的所有 member 进行 Serialization, 除了 static member 和 transient member

Serializable 可以被继承, Integer 继承 Number, Number 继承 Serializable, 则 Integer 也可以进行 Serializatioin

Serialization file

```
aced 0005 7715 6400 0000 c801 004d 000b
6865 6c6c 6f20 776f 726c 6473 7200 0141
6090 9788 d5e1 af30 0200 0078 70
```

class 实现 Serializable 表示该 class 的 object 需要进行序列化, 这仅仅是一个标识作用, 明确指定哪些 object 需要进行序列化, 防止不需要进行序列化的 object 也被序列化了

```java
public class User implements Serializable {}
```

serialVersionUID 标识了 class 的 version, 每次修改完 class, 就会自动生成不同的 serialVersionUID, 进行 Deserialization 时, 会去比较 serialVersionUID 是否相同, 如果我们在 Deserialization 之前就修改了 class, 则会报错

手动固定 serialVersionUID 就不会有这样的问题了

```java
public class User implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
```

## ObjectOutputStream

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws IOException {
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("/Users/HarveySuen/Downloads/test.txt"));

        // int 转 Integer
        oos.write(100);
        // int 转 Integer
        oos.writeInt(200);
        // boolean 转 Boolean
        oos.writeBoolean(true);
        // char 转 Character
        oos.writeChar('M');
        // 存储 String
        oos.writeUTF("hello world");
        // 存储对象, A 需要实现 Serializable
        oos.writeObject(new A());

        oos.close();
    }
}

class A implements Serializable {}
```

## ObjectInputStream

```java
public class Main {
    @SuppressWarnings("all")
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("/Users/HarveySuen/Downloads/test.txt"));

        // 反序列化的顺序 需要和 序列化的顺序 一致
        Integer i1 = ois.read();
        Integer i2 = ois.readInt();
        Boolean b = ois.readBoolean();
        Character c = ois.readChar();
        String s = ois.readUTF();
        A a = (A) ois.readObject();

        ois.close();
    }
}

class A implements Serializable {}
```

# standard stream

## System.in

System.in 标准输入流, 键盘输入, 编译类型 InputStream, 运行类型 BufferedInputStream

```java
public static final InputStream in = null;
```

```java
Scanner scanner = new Scanner(System.in);
```

## System.out

System.out 标准输出流, 终端输出, 编译类型 PrintStream, 运行类型 PrintStream

```java
public static final PrintStream out = null;
```

```java
System.out.println("hello world");
```

# transform stream

处理文本文件时, 字节流 转 字符流, 可以解决中文乱码的问题, 可以提高效率, 可以指定编码格式

## InputStreamReader

FileInputStream 包装成 InputStreamReader

```java
// 字节流 转 字符流, 指定字符编码
InputStreamReader inputStreamReader = new InputStreamReader(new FileInputStream("/Users/HarveySuen/Downloads/test.txt"), "utf-8");

int readData = 0;
while ((readData = inputStreamReader.read()) != -1) {
    System.out.println((char) readData);
}
```

InputStreamReader 包装成 BufferedReader

```java
InputStreamReader inputStreamReader = new InputStreamReader(new FileInputStream("/Users/HarveySuen/Downloads/test.txt"), "utf-8");

BufferedReader bufferedReader = new BufferedReader(inputStreamReader);

String line = "";

while ((line = bufferedReader.readLine()) != null) {
    System.out.println(line);
}

bufferedReader.close();
inputStreamReader.close();
```

## OutputStreamWriter

FileOutputStream 封装成 OutputStreamWriter

```java
OutputStreamWriter outputStreamWriter = new OutputStreamWriter(new FileOutputStream("/Users/HarveySuen/Downloads/test.txt"), "utf-8");

outputStreamWriter.write("hello world");

outputStreamWriter.close();
```

OutputStreamWriter 封装成 BufferedWriter

```java
OutputStreamWriter outputStreamWriter = new OutputStreamWriter(new FileOutputStream("/Users/HarveySuen/Downloads/test.txt"), "utf-8");

BufferedWriter bufferedWriter = new BufferedWriter(outputStreamWriter);

bufferedWriter.write("hello world");

bufferedWriter.newLine();

bufferedWriter.close();
outputStreamWriter.close();
```

# print stream

## PrintStream

printStream 字节打印流, 按字节输出

```java
// PrintStream() 可以接受 File, String, OutputStream
PrintStream printStream = new PrintStream(new FileOutputStream("/Users/HarveySuen/Downloads/test.txt", true));

// write(byte[] buf)
printStream.write("hello world".getBytes());

// write(byte[] buf, int off, int len)
printStream.write("hello world".getBytes(), 2, 3);

// print(String s)
printStream.print("hello world");

printStream.close();
```

输出到终端

```java
PrintStream out = System.out;

out.write("hello world".getBytes());

out.write("hello world".getBytes(), 2, 3);

out.print("hello world");

out.close();
```

设置 System.out 的输出位置

```java
// 设置输出到 test.txt
System.setOut(new PrintStream(new FileOutputStream("/Users/HarveySuen/Downloads/test.txt", true)));

// 输出到 test.txt, 而不是终端
System.out.print("hell world");
```

## PrintWriter

PrintWriter 字符打印流, 按字符输出

```java
PrintWriter printWriter = new PrintWriter(new FileWriter("/Users/HarveySuen/Downloads/test.txt", true));

printWriter.println("hello world");
printWriter.println(100);
printWriter.println('M');
printWriter.println(true);
printWriter.println(new String("hello world"));

printWriter.print("hello world");

printWriter.close();
```

# Properties

properties 配置文件存储程序的配置信息, key=value 格式

```properties
#comments...
#Sat Apr 22 19:32:02 CST 2023
age=18
name=sun
sex=female
```

## Output

```java
Properties properties = new Properties();

// 存储 key-value
properties.setProperty("name", "sun");
properties.setProperty("age", "18");
properties.setProperty("sex", "female");

// store(OutputStream out, String comments) 按字节输出
// store(Writer writer, String comments) 按字符输出
properties.store(new FileOutputStream("/Users/HarveySuen/Downloads/test.properties"), "comments ...");
```

## Input

```java
Properties properties = new Properties();

// load(InputStream inStream) 按字节输入
// load(Reader reader) 按字符输入
properties.load(new FileReader("/Users/HarveySuen/Downloads/test.properties"));

// 输出配置到终端
properties.list(System.out);

// 根据 key, 获取 value
String name = properties.getProperty("name");
String age = properties.getProperty("age");
String sex = properties.getProperty("sex");
```

# Resource

```java
URL resource = Main.class.getResource(""); // file:/Users/HarveySuen/Projects/spring-boot-demo/order-service/target/classes/com/harvey/

URL resource = Main.class.getResource("/") // file:/Users/HarveySuen/Projects/spring-boot-demo/order-service/target/classes/

URL resource = Main.class.getClassLoader().getResource(""); // file:/Users/HarveySuen/Projects/spring-boot-demo/order-service/target/classes/

String filePath = resource.getPath(); // /Users/HarveySuen/Projects/spring-boot-demo/order-service/target/classes/test.txt
``` 

# Exercise

## FileInputStream, FileOutputStream

```java
String srcFilePath = "/Users/HarveySuen/Downloads/test.png";
String destFilePath = "/Users/HarveySuen/Downloads/test/test.png";
FileInputStream fileInputStream = null;
FileOutputStream fileOutputStream = null;
byte[] buf = new byte[8];
int readLen = 0;

try {
    fileInputStream = new FileInputStream(srcFilePath);
    fileOutputStream = new FileOutputStream(destFilePath);

    while ((readLen = fileInputStream.read(buf)) != -1) {
        fileOutputStream.write(buf, 0, readLen);
    }
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        if (fileInputStream != null) {
            fileInputStream.close();
        }
        if (fileOutputStream != null) {
            fileOutputStream.close();
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

## FileReader, FileWriter

```java
String srcFilePath = "/Users/HarveySuen/Downloads/test.txt";
String destFilePath = "/Users/HarveySuen/Downloads/test/test.txt";
FileReader fileReader = null;
FileWriter fileWriter = null;
char[] buf = new char[8];
int readLen = 0;

try {
    fileReader = new FileReader(srcFilePath);
    fileWriter = new FileWriter(destFilePath);
    
    while ((readLen = fileReader.read(buf)) != -1) {
        fileWriter.write(buf, 0, readLen);
    }
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        if (fileReader != null) {
            fileReader.close();
        }
        if (fileWriter != null) {
            fileWriter.close();
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

## BufferedInputStream, BufferOutputStream

```java
String srcFilePath = "/Users/HarveySuen/Downloads/test.png";
String destFilePath = "/Users/HarveySuen/Downloads/test/test.png";
BufferedInputStream bufferedInputStream = null;
BufferedOutputStream bufferedOutputStream = null;
byte[] buf = new byte[8];
int readLen = 0;

try {
    bufferedInputStream = new BufferedInputStream(new FileInputStream(srcFilePath));
    bufferedOutputStream = new BufferedOutputStream(new FileOutputStream(destFilePath));
    
    while ((readLen = bufferedInputStream.read()) != -1) {
        bufferedOutputStream.write(buf, 0, readLen);
    }
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        if (bufferedInputStream != null) {
            bufferedInputStream.close();
        }
        if (bufferedOutputStream != null) {
            bufferedOutputStream.close();
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

## BufferedReader, BufferedWriter

```java
String srcFilePath = "/Users/HarveySuen/Downloads/test.txt";
String destFilePath = "/Users/HarveySuen/Downloads/test/test.txt";
BufferedReader bufferedReader = null;
BufferedWriter bufferedWriter = null;
String line = null;

try {
    bufferedReader = new BufferedReader(new FileReader(srcFilePath));
    bufferedWriter = new BufferedWriter(new FileWriter(destFilePath));

    while ((line = bufferedReader.readLine()) != null) {
        bufferedWriter.write(line);
        bufferedWriter.newLine();
    }
} catch (IOException e) {
    throw new RuntimeException(e);
} finally {
    try {
        if (bufferedReader != null) {
            bufferedReader.close();
        }
        if ( bufferedWriter != null) {
            bufferedWriter.close();
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

## add line number

给文件的每行添加行号

```java
BufferedReader br = null;
BufferedWriter bw = null;
String line = null;

// 读取 text.txt, 添加行号写入 textCopy.txt
try {
    br = new BufferedReader(new FileReader("/Users/HarveySuen/Downloads/test.txt"));
    bw = new BufferedWriter(new FileWriter("/Users/HarveySuen/Downloads/testCopy.txt"));
    line = null;
    int lineNum = 0;
    while ((line = br.readLine()) != null) {
        bw.write(++lineNum + " " + line);
        bw.newLine();
    }
} catch (IOException e) {
    e.printStackTrace();
} finally {
    try {
        br.close();
        bw.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}

// 读取 textCopy.txt, 写入 text.txt
try {
    br = new BufferedReader(new FileReader("/Users/HarveySuen/Downloads/testCopy.txt"));
    bw = new BufferedWriter(new FileWriter("/Users/HarveySuen/Downloads/test.txt"));
    while ((line = br.readLine()) != null) {
        bw.write(line);
        bw.newLine();
    }
} catch (IOException e) {
    e.printStackTrace();
} finally {
    try {
        br.close();
        bw.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}

// 删除 testCopy.txt
new File("/Users/HarveySuen/Downloads/testCopy.txt").delete();
```

## serialize object

```java

public class Main {
    public static void main(String[] args) throws Exception {
        // output properties
        Properties properties = new Properties();
        properties.setProperty("name", "sun");
        properties.setProperty("age", "18");
        properties.setProperty("sex", "M");
        properties.store(new FileWriter("/Users/HarveySuen/Downloads/test.properties"), null);

        // input properties
        properties.load(new FileReader("/Users/HarveySuen/Downloads/test.properties"));
        String name = properties.getProperty("name");
        int age = Integer.parseInt(properties.getProperty("age"));
        char sex = properties.getProperty("sex").charAt(0);

        // create object
        A a = new A(name, age, sex);

        // serialize object
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("/Users/HarveySuen/Downloads/test.dat"));
        oos.writeObject(a);
        oos.close();

        // deserialize object
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("/Users/HarveySuen/Downloads/test.dat"));
        Object o = ois.readObject();
        ois.close();
    }
}

// implement Serializable
class A implements Serializable {
    public String name;
    public int age;
    public char sex;

    public A(String name, int age, char sex) {
        this.name = name;
        this.age = age;
        this.sex = sex;
    }

    @Override
    public String toString() {
        return "A{" +
                "name='" + name + '\'' +
                ", age=" + age +
                ", sex=" + sex +
                '}';
    }
}
```

