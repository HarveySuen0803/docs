# Minio

import dependency

```xml
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.6</version>
</dependency>
```

set MinioClient Bean

```java
@Configuration
public class MinioConfiguration {
    @Value("${minio.endpoint}")
    private String endpoint;
    @Value("${minio.access-key}")
    private String accessKey;
    @Value("${minio.secret-key}")
    private String secretKey;
    
    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                          .endpoint(endpoint)
                          .credentials(accessKey, secretKey)
                          .build();
    }
}
```

# put file

```java
minioClient.putObject(PutObjectArgs.builder()
                                   .bucket("bucket-file")
                                   .object("/harvey/test.txt")
                                   .stream(inputStream, inputStream.available(), -1)
                                   .contentType("multipart/form-data")
                                   .build());
```

# get file

```java
InputStream inputStream = minioClient.getObject(GetObjectArgs.builder()
                                                             .bucket("bucket-file")
                                                             .object("/harvey/test.txt")
                                                             .build());
```

# remove file

```java
minioClient.removeObject(RemoveObjectArgs.builder()
                                         .bucket("bucket-file")
                                         .object("/harvey/test.txt"))
                                         .build());
```

# upload file

```java
minioClient.uploadObject(UploadObjectArgs.builder()
                                         .filename("/Users/HarveySuen/Downloads/test.mp4") // local file
                                         .bucket("bucket-file")
                                         .object("/harvey/test.txt")
                                         .build());
```