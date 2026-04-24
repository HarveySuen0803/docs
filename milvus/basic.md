# Compile

克隆最新的 Milvus 代码。

```shell
git clone https://github.com/milvus-io/milvus.git milvus-latest
cd /mnt/storage00/sxc/milvus-latest
```

编译 cpp core，包含 proto 生成，以及 thridpart 编译。

```shell
make build-cpp mode=Debug
```

设置环境变量。

```shell
source scripts/setenv.sh
```

如果你需要完整 Milvus 编译，可以执行下面的命令。

```shell
make milvus
```

vscode 环境配置

```json
{
  "C_Cpp.intelliSenseEngine": "disabled",
  "C_Cpp.errorSquiggles": "disabled",
  "C_Cpp.copilotHover": "disabled",
  "C_Cpp.codeAnalysis.runAutomatically": false,
  "clangd.path": "/usr/bin/clangd-19",
  "clangd.arguments": [
    "--compile-commands-dir=/mnt/storage00/sxc/milvus-latest/cmake_build",
    "--background-index",
    "--completion-style=detailed",
    "--header-insertion=iwyu",
    "--pch-storage=memory"
  ],
  "go.goroot": "/usr/local/lib/golang-1.25.5",
  "gopls": {
    "buildFlags": [
      "-tags=test"
    ]
  },
  "go.toolsEnvVars": {
    "CGO_ENABLED": "1",
    "MILVUS_WORK_DIR": "/mnt/storage00/sxc/milvus-latest",
    "PKG_CONFIG_PATH": "/mnt/storage00/sxc/milvus-latest/internal/core/output/lib/pkgconfig:/mnt/storage00/sxc/milvus-latest/internal/core/output/lib64/pkgconfig",
    "LD_LIBRARY_PATH": "/mnt/storage00/sxc/milvus-latest/internal/core/output/lib:/mnt/storage00/sxc/milvus-latest/internal/core/output/lib64"
  },
  "go.toolsManagement.autoUpdate": false,
}
```

