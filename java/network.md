# InetAddress

```java
// 根据 host 返回 InetAddress 对象
InetAddress host1 = InetAddress.getByName("harvey"); // harvey/192.168.31.17
// 根据 domain 返回 InetAddress 对象 
InetAddress host2 = InetAddress.getByName("www.baidu.com"); // www.baidu.com/36.152.44.96

// 返回 host
String hostName1 = host1.getHostName(); // harvey
String hostName2 = host2.getHostName(); // www.baidu.com

// 返回 address
String address1 = host1.getHostAddress(); // 192.168.31.17
String address2 = host2.getHostAddress(); // 36.152.44.95
```

查看网络情况

```shell
netstat -an
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170912199.png)

# TCP

通信双方通过 Socket 进行通信, 在网络上建立通信流

- Socket.getInputStream() 输入流
- Socket.getOutputStream() 输出流

## byte stream

```java
public class Server {
    public static void main(String[] args) throws IOException {
        // 监听 9999 端口
        ServerSocket serverSocket = new ServerSocket(9999);

        System.out.println("server is listening");

        // 有客户端请求时, 会返回 Socket
        // 没有客户端请求时, 会堵塞在这
        Socket socket = serverSocket.accept(); // class java.net.Socket

        // Input
        DataInputStream dis = new DataInputStream(socket.getInputStream());
        System.out.println(dis.readUTF());

        // Output
        DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
        dos.writeUTF("server response");

        dis.close();
        dos.close();
        socket.close();
        serverSocket.close();
    }
}
```

```java
public class Client {
    public static void main(String[] args) throws IOException {
        Socket socket = new Socket(InetAddress.getLocalHost(), 9999);

        // Output
        DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
        dos.writeUTF("client request");

        // Input
        DataInputStream dis = new DataInputStream(socket.getInputStream());
        System.out.println(dis.readUTF());

        dis.close();
        dos.close();
        socket.close();
    }
}
```

## character stream

```java
public class Server {
    public static void main(String[] args) throws IOException {
        ServerSocket serverSocket = new ServerSocket(9999);

        System.out.println("server is listening");

        Socket socket = serverSocket.accept();

        // Input
        BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        System.out.println(br.readLine());

        // Output
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
        bw.write("server response");
        bw.newLine();
        bw.flush();

        br.close();
        bw.close();
        socket.close();
        serverSocket.close();
    }
}
```

```java
public class Client {
    public static void main(String[] args) throws IOException {
        Socket socket = new Socket(InetAddress.getLocalHost(), 9999);

        // Output
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
        bw.write("client request");
        bw.newLine();
        bw.flush();

        // Input
        BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        System.out.println(br.readLine());

        br.close();
        bw.close();
        socket.close();
    }
}
```

# UDP

通信双方通过 DatagramSocket 进行通信, 在网络上建立通信流

数据封装到 DatagramPacket 对象中, 传输对象, 避免了文件流的结束标志工作

```java
public class A {
    public static void main(String[] args) throws Exception {
        DatagramSocket socket = new DatagramSocket(9999);

        // receive
        byte[] receiveData = new byte[1024];
        DatagramPacket packet = new DatagramPacket(receiveData, receiveData.length);
        socket.receive(packet);

        System.out.println(new String(packet.getData(), 0, packet.getLength()));

        // send
        byte[] sendData = "A packet".getBytes();
        packet = new DatagramPacket(sendData, sendData.length, InetAddress.getLocalHost(), 9998);
        socket.send(packet);

        socket.close();
    }
}
```

```java
public class B {
    public static void main(String[] args) throws Exception {
        DatagramSocket socket = new DatagramSocket(9998);

        // send
        byte[] sendData = "B packet".getBytes();
        DatagramPacket packet = new DatagramPacket(sendData, sendData.length, InetAddress.getLocalHost(), 9999);
        socket.send(packet);

        // receive
        byte[] receiveData = new byte[1024];
        packet = new DatagramPacket(receiveData, receiveData.length);
        socket.receive(packet);

        System.out.println(new String(packet.getData(), 0, packet.getLength()));

        socket.close();
    }
}
```

# Exercise

## send img

```java
public class Server {
    public static void main(String[] args) throws Exception {
        ServerSocket serverSocket = new ServerSocket(9999);

        System.out.println("server is listening");
        
        Socket socket = serverSocket.accept();

        // input img from client
        BufferedInputStream bis = new BufferedInputStream(socket.getInputStream());

        // bis input img, stream to byte[]
        byte[] buf = StreamUtils.streamToByteArray(bis);

        // output img to local
        BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("/Users/HarveySuen/Downloads/test/test.png"));
        bos.write(buf);
        bos.flush();

        bis.close();
        bos.close();
        socket.close();
        serverSocket.close();
    }
}
```

```java
public class Client {
    public static void main(String[] args) throws Exception {
        Socket socket = new Socket(InetAddress.getLocalHost(), 9999);

        // input img from local
        BufferedInputStream bis = new BufferedInputStream(new FileInputStream("/Users/HarveySuen/Downloads/test.png"));

        // bis input img, stream to byte[]
        byte[] buf = StreamUtils.streamToByteArray(bis);

        // output img to server
        BufferedOutputStream bos = new BufferedOutputStream(socket.getOutputStream());
        bos.write(buf);
        bos.flush();

        bis.close();
        bos.close();
        socket.close();
    }
}
```

## answer question

```java
public class Server {
    public static void main(String[] args) throws Exception {
        ServerSocket serverSocket = new ServerSocket(9999);

        System.out.println("server is listening");

        Socket socket = serverSocket.accept();

        BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));

        // input question
        String question = br.readLine();

        // output answer
        if (question.equals("name")) {
            bw.write("sun");
        } else if (question.equals("age")) {
            bw.write("18");
        } else {
            bw.write("...");
        }
        bw.newLine();
        bw.flush();

        br.close();
        bw.close();
        socket.close();
        serverSocket.close();
    }
}
```

```java
public class Client {
    public static void main(String[] args) throws Exception {
        Socket socket = new Socket(InetAddress.getLocalHost(), 9999);

        // scanner question
        Scanner scanner = new Scanner(System.in);
        System.out.print("question: ");
        String question = scanner.next();

        // output question
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
        bw.write(question);
        bw.newLine();
        bw.flush();

        // input answer
        BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        System.out.println(br.readLine());

        br.close();
        bw.close();
        socket.close();
    }
}
```

## download music

```java
public class Server {
    public static void main(String[] args) throws Exception {
        ServerSocket serverSocket = new ServerSocket(9999);

        System.out.println("server is listening");

        Socket socket = serverSocket.accept();
        
        // input music name
        BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        String filename = br.readLine();
        
        // input music
        BufferedInputStream bis = null;
        if (filename.equals("test.mp3")) {
            bis = new BufferedInputStream(new FileInputStream("/Users/HarveySuen/Downloads/test.mp3"));
        } else {
            bis = new BufferedInputStream(new FileInputStream("/Users/HarveySuen/Downloads/other.mp3"));
        }
        byte[] buf = StreamUtils.streamToByteArray(bis);

        // output music
        BufferedOutputStream bos = new BufferedOutputStream(socket.getOutputStream());
        bos.write(buf);
        bos.flush();

        socket.close();
        serverSocket.close();
    }
}
```

```java
public class Client {
    public static void main(String[] args) throws Exception {
        Socket socket = new Socket(InetAddress.getLocalHost(), 9999);

        Scanner scanner = new Scanner(System.in);

        System.out.print("music name: ");
        String filename = scanner.next();

        // output music name
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
        bw.write(filename);
        bw.newLine();
        bw.flush();

        System.out.println("downloading " + filename);

        // input music
        BufferedInputStream bis = new BufferedInputStream(socket.getInputStream());
        byte[] buf = StreamUtils.streamToByteArray(bis);

        // store music
        BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("/Users/HarveySuen/Downloads/test/test.mp3"));
        bos.write(buf);
        bos.flush();

        socket.close();
    }
}
```

