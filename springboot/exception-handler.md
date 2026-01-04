# Exception handler mechanism

SpringMVC 通过 global Exception handler 或 local Exception handler 处理 Exception

SpringBoot 处理 SpringMVC 没有处理的 Exceptio

1. 匹配 templates/error 的 precise status code page (eg. 500 code 匹配 templates/error/500.html)
2. 匹配 static resource 的 precise status code page (eg. 500 code 匹配 static resource/500.html)
3. 匹配 templates/error 的 fuzzy status code page (eg. 500 code 匹配 templates/error/5\*\*.html)
4. 匹配 static resource 的 fuzzy status code page (eg. 500 code 匹配 static resource/5\*\*.html)
5. 匹配 templates/error.html

# global Exception handler

exception/GlobalExceptionHandler.java, 处理 global Exception

```java
@RestControllerAdvice
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class GlobalExceptionHandler {
    // 捕获 Exception
    @ExceptionHandler(Exception.class)
    public Result exceptionHandler(Exception e) {
        return Result.failure("Exception");
    }

    // 捕获 IOException
    @ExceptionHandler(IOException.class)
    public Result ioExceptionHandler(IOException e) {
        return Result.failure("IO Exception");
    }
}
```

@RestControllerAdvice 是支持了 Restful 的 @RestControllerAdvice

# local Exception handler

controller/TestController.java, 处理 local Exception

```java
@RestController
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class UserController {
    @GetMapping("/test")
    public void test() {
        int i = 1 / 0;
    }

    @ExceptionHandler(Exception.class)
    public void handleException(Exception e) {
        System.out.println(e.getMessage());
    }
}
```

# business Exception

bussinessException.java

```java
public class BusinessException extends RuntimeException {
    private Integer code;

    // getter(), setter()

    public BusinessException(Integer code, String message) {
        this.code = code;
    }

    public BusinessException(Integer code, String message, Throwable cause) {
        this.code = code;
    }
}
```

Code.java

```java
public static final Integer BUSINESS_EXCEPTION = 60001;
public static final Integer BUSINESS_RUNTIME_EXCEPTION = 60002;
```

App.java

```java
throw new BusinessException(Code.BUSINESS_EXCEPTION, "Business Exception");
```

GlobalExceptionHandler.java, 处理 business Exception

```java
@ExceptionHandler(BusinessException.class)
public Result businessExceptionHandler(BusinessException e) {
    return Result.failure(e.getCode(), e.getMessage());
}
```

# system Exception

SystemException.java

```java
public class SystemException extends RuntimeException {
    private Integer code;

    // getter(), setter()
    
    public SystemException(Integer code, String message) {
        this.code = code;
    }

    public SystemException(Integer code, String message, Throwable cause) {
        this.code = code;
    }
}
```

ExceptionCodeConstant.java

```java
public static final Integer SYSTEM_EXCEPTION = 50001;
public static final Integer SYSTEM_TIMEOUT_EXCEPTION = 50002;
```

App.java

```java
throw new SystemException(Code.SYSTEM_EXCEPTION, "System Exception");
```

GlobalExceptionHandler.java, 处理 system Exception

```java
@ExceptionHandler(SystemException.class)
public Result systemExceptionHandler(SystemException e) {
    return Result.failure(e.getCode(), e.getMessage());
}
```
