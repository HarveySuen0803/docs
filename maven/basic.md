# 常用命令

```shell
# generate grpc ...
mvn clean generate-sources

mvn clean compile -DskipTests

mvn clean package -DskipTests

mvn clean deploy -DskipTests

# force refresh dependency
mvn clean install -U
```

## 依赖范围

依赖的作用范围 (默认为 compile)

|          | compile environment | test environment | runtime environment |
| -------- | ------------------- | ---------------- | ------------------- |
| compile  | true                | true             | true                |
| test     |                     | true             |                     |
| provided | true                | true             |                     |
| runtime  |                     | true             | true                |
| system   | true                | true             |                     |

- 编译环境: 作用于 main, 只有 main 中可以使用对应的 jar
- 测试环境: 作用于 test, 只有 test 中可以使用对应的 jar
- 运行环境: 作用于运行时 (比如: 动态绑定机制调用对应的 jar 中的程序)
