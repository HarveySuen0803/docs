# RESP

Redis Client 和 Redis Server 之间通信需要遵守 RESP, 现在主流使用的是 RESP2, 虽然 RESP3 非常强悍, 但是兼容性较差, 没有广泛使用

RESP 中, 通过 Prefix 来区分不同的数据类型, 下面是常用的几种数据类型

- Simple Strings, 以 `+` 开头, 以 `\r\n` 结尾 (eg: `+OK\r\n`)
- Errors, 以 `-` 开头, 以 `\r\n` 结尾 (eg: `-Error Message\r\n`)
- Integers, 以 `:` 开头, 以 `\r\n` 结尾 (eg: `:10\r\n`)
- Bulk Strings, 以 `$` 开头, 后面跟一个数字表示字符串的长度 (eg: `$6\r\nfoobar\r\n`)
- Arrays, 以 `*` 开头, 后面跟一个数字表示元素个数 (eg: `set k1 v1` 就是 `*3\r\n$3\r\nset\r\n$2\r\nk1\r\n$2\r\nv1\r\n`)

# Simple Redis Client

```java
Socket socket = new Socket("127.0.0.1", 6379);

OutputStream outputStream = socket.getOutputStream();

String command = "";

command = "*2\r\n$4\r\nauth\r\n$3\r\n111\r\n";
outputStream.write(command.getBytes());

command = "*3\r\n$3\r\nSET\r\n$2\r\nk1\r\n$2\r\nv1\r\n";
outputStream.write(command.getBytes());

BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

String response = reader.readLine();
System.out.println("Response from Redis: " + response);

socket.close();
```
