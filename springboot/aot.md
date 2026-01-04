# AOT

JIT: 及时编译, 程序运行时, 将字节码转换成机器码

- 优点: 性能优化, 可动态生成代码
- 缺点: 启动速度慢, 内存占用高

AOT: 提前编译, 程序运行前, 将字节码转换成机器码

- 优点: 启动速度快, 内存占用低, 打包体积小
- 缺点: 不可动态生成代码, 程序安装时间长, 不可跨平台, 性能没有优化


# GraalVM

GraalVM: 一个高性能的 JDK, 支持 JIT, AOT

https://www.graalvm.org/downloads, 下载 GraalVM

.zshrc, 配置 GraalVM, gu

```shell
# GraalVM
export GRAALVM_20_HOME=$HOME/Applications/graalvm-20/Contents/Home
export JAVA_HOME=$GRAALVM_20_HOME
export PATH=$JAVA_HOME:$PATH

# gu
export PATH=/Users/HarveySuen/Applications/graalvm-20/Contents/Home/lib/installer/bin:$PATH
```

安装 native-image

```shell
gu install native-image
```

.zshrc, 配置 native-image

```shell
export PATH=/Users/HarveySuen/Applications/graalvm-20/Contents/Home/lib/svm/bin:$PATH
```

package project

```shell
mvn package
```

compile jar

```shell
# start program 为 com.harvey.App, App 为 executable program
native-image -cp java-demo1-1.0-SNAPSHOT.jar com.harvey.App -o App

# execute program
./App
```

compile cls

```shell
native-image -cp ./classes com.harvey.App -o App
```

# AOT

pom.xml

```xml
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
</plugin>
```

compile project

```
mvn -Pnative native:compile -f pom.xml
```

execute project

```shell
./spring-boot-demo
```

