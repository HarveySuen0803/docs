# 搭建编译环境

添加 LLVM 官方仓库：

```bash
# 添加 LLVM 官方 GPG 密钥
wget -O - https://apt.llvm.org/llvm-snapshot.gpg.key | sudo apt-key add -

# 添加 LLVM 仓库到 sources.list
echo "deb https://apt.llvm.org/bullseye/ llvm-toolchain-bullseye-19 main" | sudo tee /etc/apt/sources.list.d/llvm.list

# 更新包列表
sudo apt update
```

安装 Clang-19 编译器套件：

```shell
sudo apt install -y \
    clang-19 \
    clang++-19 \
    libclang-19-dev \
    llvm-19 \
    llvm-19-dev \
    lld-19 \
    lldb-19 \
    libc++-19-dev \
    libc++abi-19-dev
```

安装构建工具：

```bash
sudo apt install -y \
    cmake \
    ninja-build \
    ccache \
    git \
    python3 \
    python3-pip \
    nasm
```

安装开发库和工具：

```bash
sudo apt install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    libicu-dev \
    libreadline-dev \
    gperf \
    zlib1g-dev \
    liblz4-dev \
    libzstd-dev \
    libbz2-dev \
    libsnappy-dev \
    libcurl4-openssl-dev \
    libxml2-dev \
    libevent-dev \
    libprotobuf-dev \
    protobuf-compiler \
    librdkafka-dev \
    libsasl2-dev \
    libkrb5-dev \
    libxar-dev
```

安装数据库相关依赖：

```bash
sudo apt install -y \
    unixodbc-dev \
    libpq-dev \
    libmysqlclient-dev \
    libsqlite3-dev
```

克隆和准备源码：

```bash
# 如果还没有克隆仓库
git clone https://github.com/your-repo/clickhouse-bili-24.8.git
cd clickhouse-bili-24.8

# 确保子模块已初始化
git submodule sync --recursive
git submodule update --init --recursive
```

CMake 配置：

```bash
cd clickhouse-bili-24.8
mkdir -p build && cd build

# 使用 clang-19 配置 CMake
cmake -G Ninja \
  -DCMAKE_C_COMPILER=clang-19 \
  -DCMAKE_CXX_COMPILER=clang++-19 \
  -DCMAKE_BUILD_TYPE=Debug \
  -DENABLE_TESTS=OFF \
  -DENABLE_UTILS=OFF \
  ..
```

- `-G Ninja`: 使用 Ninja 构建系统（比 Make 更快）
- `-DCMAKE_BUILD_TYPE=RelWithDebInfo`: 发布版本带调试信息
- `-DENABLE_GRPC=OFF`: 禁用 gRPC（可选，减少依赖）
- `-DENABLE_GOOGLE_CLOUD_CPP=OFF`：Google Cloud 依赖 GRPC，也需要禁用掉

链接 compile_commands.json 用于 clangd lsp：

```shell
cd clickhouse-bili-24.8
ln -sf build/compile_commands.json compile_commands.json && ls -la compile_commands.json
```

vscode settings.json 配置：

```json
{
  "clangd.path": "/usr/bin/clangd-19",
  "editor.tabSize": 4,
  "editor.insertSpaces": true,
  "editor.formatOnSave": false,
  "editor.semanticHighlighting.enabled": true,
  "files.associations": {
    "*.h": "cpp",
    "*.hpp": "cpp",
    "*.cpp": "cpp",
    "*.cc": "cpp",
    "*.cxx": "cpp"
  },
  "search.exclude": {
    "**/build/**": true,
    "**/contrib/**": true,
    "**/.git/**": true,
    "**/CMakeFiles/**": true,
    "**/*.a": true,
    "**/*.so": true,
    "**/*.o": true,
    "**/__pycache__": true,
    "**/*.pyc": true,
    "**/.pytest_cache": true
  },
  "files.watcherExclude": {
    "**/build/**": true,
    "**/contrib/**": true,
    "**/.git/**": true,
    "**/__pycache__": true,
    "**/*.pyc": true,
    "**/.pytest_cache": true
  }
}
```

可以执行编译：

```shell
ninja
```

# ClickHouse 25.4

```shell
cmake -G Ninja \
    -DCMAKE_C_COMPILER=clang-19 \
    -DCMAKE_CXX_COMPILER=clang++-19 \
    -DCMAKE_BUILD_TYPE=RelWithDebInfo \
    -DENABLE_GRPC=OFF \
    -DPARALLEL_COMPILE_JOBS=12 \
    -DPARALLEL_LINK_JOBS=4 \
    ..
```

# ClickHouse Bili 24.8

```shell
cmake -G Ninja \
  -DCMAKE_C_COMPILER=clang-19 \
  -DCMAKE_CXX_COMPILER=clang++-19 \
  -DCMAKE_BUILD_TYPE=Debug \
  -DENABLE_TESTS=OFF \
  -DENABLE_UTILS=OFF \
  -DENABLE_GRPC=OFF \
  ..
```

# ClickHouse Bili 25.5

```
s jscs-datacenter-olap-ck-online-test02-06
```

```shell
cd /mnt/storage00/sxc/clickhouse-bili-25.5-release

git pull

# build
./private/build.sh

# upload clickhouse program to  01 ~ 06 node
./private/upload.sh

# deploy clickhouse on 01 ~ 06 node
./private/deploy.sh
```
