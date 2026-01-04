# Validation

import dependency

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

set validation rule

```java
@Data
public class UserDTO {
    @NotNull(message = "id value error")
    Integer id;

    @NotBlank
    @Length(min = 5, max = 30, message = "name value error")
    String name;
    
    @Max(value = 150, message = "age value error")
    @Min(value = 0, message = "age value error")
    Integer age;
    
    @Email(message = "email value error")
    String email;
}
```

validate param

```java
public User getById(@Validated UserDTO userDTO) {}
```

set exception handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result exceptionHandler(MethodArgumentNotValidException e) {
        List<FieldError> fieldErrors = e.getFieldErrors();
        StringBuilder errorMessage = new StringBuilder();
        for (FieldError fieldError : fieldErrors) {
            errorMessage.append(fieldError.getDefaultMessage()).append(", ");
        }
        return Result.failure(errorMessage.toString());
    }
}
```

# Group

set group for field

```java
@NotEmpty(message = "name must not be empty", groups = ValidationGroup.Select.class)
@Length(min = 5, max = 30, message = "name value error", groups = {ValidationGroup.Insert.class, ValidationGroup.Update.class})
String name;
```

specify group

```java
@PostMapping
public void save(@Validated(ValidationGroup.Insert.class) @RequestBody UserDTO userDTO) {}
```

# Validation rule

- @NotNull
- @NotEmpty, 作用于字符串
- @NotBlank, 作用于字符串, trim() 后也不为空
- @DecimalMax(value), <= value
- @DecimalMin(value), >= value
- @Max(value)
- @Min(value)
- @Pattern(regexp), 匹配正则
- @Size(max, min)
- @Email, 匹配 email format

