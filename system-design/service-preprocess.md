# 入参预处理最佳实践

接口如下：

```java
CacheHitRateTrend getCacheHitRateTrend(WarmupCacheHitRateGet dto);
```

在 WarmupCacheHitRateGet 内部实现 preprocess() 对入参进行预处理：

```java
@Data
public abstract class BaseDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    public abstract void preprocess();
}

@Data
@EqualsAndHashCode(callSuper = true)
public class WarmupCacheHitRateGet extends BaseDto {
    private Long spotId;
    
    private String granularity = "day";
    
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date beginDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date endDate;

    @Override
    public void preprocess() {
        if (ObjUtil.isNull(spotId)) {
            throw new IllegalArgumentException("spotId is required");
        }
        
        if (ObjUtil.isNull(beginDate) || ObjUtil.isNull(endDate)) {
            throw new IllegalArgumentException("beginDate and endDate are required");
        }
        if (beginDate.after(endDate)) {
            throw new IllegalArgumentException("beginDate must be before endDate");
        }
        endDate = DateUtil.endOfDay(endDate);
        
        granularity = granularity.toLowerCase();
        if (!TimePeriod.contains(granularity)) {
            throw new IllegalArgumentException("granularity is invalid");
        }
    }
}
```

通过 AOP 去拦截所有的方法，依次调用入参的 preprocess()，实现预处理

```java
@Aspect
public class PreprocessAspect {
    @Around("execution(* com.deveek.*.service.*ServiceImpl.*(..))")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        Object[] args = joinPoint.getArgs();
        for (Object arg : args) {
            if (arg instanceof BaseDto) {
                ((BaseDto) arg).preprocess();
            }
        }
        return joinPoint.proceed();
    }
}
```
