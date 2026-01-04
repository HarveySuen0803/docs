# Scheduling

Scheduling: timing execute programming

add @EnableScheduling to enable SpringTask

```java
@EnableScheduling
@SpringBootApplication
public class SkyApplication {}
```

set Task

```java
@Component
public class MyTask {
    @Scheduled(cron = "0/5 * 8 31 8 ?")
    public void executeTask() {
        System.out.println("hello world");
    }
}
```

# cron expression

cron expression: trigger time of scheduled tasks

| second | minute | hour | day | month | week | year (optinal) | cron expression    | 
| ------ | ------ | ---- | --- | ----- | ---- | -------------- | --- |
| 0      | 0      | 9    | 12  | 10    | ?    | 2022           | 0 0 9 12 10 ? 2022    |

online generator: https://www.freeformatter.com/cron-expression-generator-quartz.html


