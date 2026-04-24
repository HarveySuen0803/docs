# 常用命令

```shell
mvn dependency:resolve -U -DskipTests

# generate grpc ...
mvn clean generate-sources

mvn clean compile -U -DskipTests

mvn clean package -U -DskipTests

mvn clean deploy -U -DskipTests

# force refresh dependency
mvn clean install -U -DskipTests

mvn clean install -s ~/.m2/settings.xml

mvn clean install -pl clickhouse-dictionary-toolkits -am -U -DskipTests

mvn clean package -U -DskipTests dependency:copy-dependencies -DoutputDirectory=target/dependency
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
