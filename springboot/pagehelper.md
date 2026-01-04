# PageHelper

import dependency

```xml
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.4.6</version>
</dependency>
```

set mapper

```java
@Mapper
public interface EmpMapper {
    @Select("select * from emp")
    List<Emp> select();
}
```

set service

```java
@Service
public class EmpServiceImpl implements EmpService {
    @Autowired
    EmpMapper empMapper;

    @Override
    public PageBean getPageBean(Integer pageNo, Integer pageSize) {
        PageHelper.startPage(pageNo, pageSize);
        Page<Emp> page = (Page<Emp>) empMapper.select();
        System.out.println(page.getTotal());
        System.out.println(page.getResult());
        return new PageBean(page.getTotal(), page.getResult());
    }
}
```

# PageResult

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageResult implements Serializable {
    private long total;
    private List records;
}
```
