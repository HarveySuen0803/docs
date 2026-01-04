# XxlJob

import dependency

```xml
<dependency>
    <groupId>com.xuxueli</groupId>
    <artifactId>xxl-job-core</artifactId>
    <version>2.4.0</version>
</dependency>
```

set XxlJob properties

```properties
xxl.job.admin.addresses=http://127.0.0.1:11200/xxl-job-admin/
xxl.job.executor.appname=media-process-service
xxl.job.executor.address=
xxl.job.executor.ip=
xxl.job.executor.port=11201
xxl.job.executor.logpath=/Users/HarveySuen/Options/xxl-job/log
xxl.job.executor.logretentiondays=30
xxl.job.accessToken=default_token
```

set XxlJobSpringExecutor Bean

```java
@Configuration
public class XxlJobConfiguration {
    private Logger logger = LoggerFactory.getLogger(XxlJobConfiguration.class);
    
    @Value("${xxl.job.admin.addresses}")
    private String adminAddresses;
    
    @Value("${xxl.job.accessToken}")
    private String accessToken;
    
    @Value("${xxl.job.executor.appname}")
    private String appname;
    
    @Value("${xxl.job.executor.address}")
    private String address;
    
    @Value("${xxl.job.executor.ip}")
    private String ip;
    
    @Value("${xxl.job.executor.port}")
    private int port;
    
    @Value("${xxl.job.executor.logpath}")
    private String logPath;
    
    @Value("${xxl.job.executor.logretentiondays}")
    private int logRetentionDays;
    
    @Bean
    public XxlJobSpringExecutor xxlJobExecutor() {
        logger.info(">>>>>>>>>>> xxl-job config init.");
        XxlJobSpringExecutor xxlJobSpringExecutor = new XxlJobSpringExecutor();
        xxlJobSpringExecutor.setAdminAddresses(adminAddresses);
        xxlJobSpringExecutor.setAppname(appname);
        xxlJobSpringExecutor.setAddress(address);
        xxlJobSpringExecutor.setIp(ip);
        xxlJobSpringExecutor.setPort(port);
        xxlJobSpringExecutor.setAccessToken(accessToken);
        xxlJobSpringExecutor.setLogPath(logPath);
        xxlJobSpringExecutor.setLogRetentionDays(logRetentionDays);
        return xxlJobSpringExecutor;
    }
}
```

add executor

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811006.png)

check connection

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811007.png)

# task scheduling

perform task

```java
@Component
public class MediaJob {
    @XxlJob("testMediaJob")
    public void testMediaJob() {
        XxlJobHelper.log("hello world");
    }
}
```

set task scheduling

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811008.png)

# shardcast policy

Broadcasting task for all the shard, perform tasks at the same time, support for dynamic expansion, to achieve high availability.

perform task

```java
@XxlJob("shardCastJob")
public void shardCastJob() {
    int shardIndex = XxlJobHelper.getShardIndex();
    int shardTotal = XxlJobHelper.getShardTotal();
    System.out.println(shardIndex + "," + shardTotal);
}
```

set shardcast policy 

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811009.png)

check services

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811010.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241811011.png)





