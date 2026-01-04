# Aliyun OSS

import dependency

```xml
<dependency>
    <groupId>com.aliyun.oss</groupId>
    <artifactId>aliyun-sdk-oss</artifactId>
    <version>3.16.1</version>
</dependency>

<dependency>
    <groupId>javax.xml.bind</groupId>
    <artifactId>jaxb-api</artifactId>
    <version>2.4.0-b180830.0359</version>
</dependency>
<dependency>
    <groupId>javax.activation</groupId>
    <artifactId>activation</artifactId>
    <version>1.1.1</version>
</dependency>
<dependency>
    <groupId>org.glassfish.jaxb</groupId>
    <artifactId>jaxb-runtime</artifactId>
    <version>4.0.2</version>
</dependency>
```

set OssClient Bean

```java
@Value("${aliyun-oss.access-key-id}")
private String accessKeyId;
@Value("${aliyun-oss.access-key-secret}")
private String accessKeySecret;
@Value("${aliyun-oss.endpoint}")
private String endpoint;

@Bean
public Oss ossclient() {
    return new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
}
```

# upload file

```java
try {
    // upload object
    ossClient.putObject("bucket-file", "/harvey/test.txt",  new FileInputStream("/Users/HarveySuen/Downloads/test.txt"));
    
    // set policy
    ossClient.setBucketAcl("bucket-file", CannedAccessControlList.PublicRead);
} catch (OSSException oe) {
    System.out.println("Caught an OSSException, which means your request made it to OSS, "
                           + "but was rejected with an error response for some reason.");
    System.out.println("Error Message:" + oe.getErrorMessage());
    System.out.println("Error Code:" + oe.getErrorCode());
    System.out.println("Request ID:" + oe.getRequestId());
    System.out.println("Host ID:" + oe.getHostId());
} catch (ClientException ce) {
    System.out.println("Caught an ClientException, which means the client encountered "
                           + "a serious internal problem while trying to communicate with OSS, "
                           + "such as not being able to access the network.");
    System.out.println("Error Message:" + ce.getMessage());
} finally {
    if (ossClient != null) {
        ossClient.shutdown();
    }
}
```

# download file

```java
try {
    InputStream inputStream = ossClient.getObject("bucket-file", "/harvey/test.txt").getObjectContent();
} catch (OSSException oe) {
    System.out.println("Caught an OSSException, which means your request made it to OSS, "
            + "but was rejected with an error response for some reason.");
    System.out.println("Error Message:" + oe.getErrorMessage());
    System.out.println("Error Code:" + oe.getErrorCode());
    System.out.println("Request ID:" + oe.getRequestId());
    System.out.println("Host ID:" + oe.getHostId());
} catch (ClientException ce) {
    System.out.println("Caught an ClientException, which means the client encountered "
            + "a serious internal problem while trying to communicate with OSS, "
            + "such as not being able to access the network.");
    System.out.println("Error Message:" + ce.getMessage());
} finally {
    if (ossClient != null) {
        ossClient.shutdown();
    }
}
```



