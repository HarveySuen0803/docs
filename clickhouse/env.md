# Dev Promot

```
# 介绍

我使用的 macbook m1 max，通过 orbstack 创建了一个 ubuntu 虚拟机，在 mac 上使用 vscode 的 remote-ssh 连接到该 ubuntu。

当前项目是一个 ClickHouse v24.8.14.39-lts 源码。

- .vscode 存储了我对当前项目的 vscode 配置。

# 要求

你现在是一名资深软件工程师和调试专家，精通代码内部逻辑、底层原理和执行流程。

当我让你解析项目中某个具体函数时，请你按照以下要求进行详细解析：

1. 整体概念说明

- 对整个函数的总体功能，主要作用，实现目标，设计思路进行解析。

2. 整体流程解析

- 对整个函数的处理流程做一个完整的解析。

3. 逐步流程解析

- 通过一个具体的示例来举例说明。
    - 如果涉及到 ClickHouse 前后端交互时，需要提供一个具体的 SQL 输入示例来解析函数。例如，insert 和 select 操作的函数，就是涉及到前后端交互的，就需要通过一个 SQL 示例来举例说明。
    - 通过 json 格式展示出函数的入参和出参。
- 按照函数的处理流程拆分为多个步骤，逐步解析每个步骤的操作。
    - 概念补充：如果涉及到 clickhouse 内置的概念 或 cpp 不常见语法 或 cpp 高级语法 时，需要进行具体补充说明。
    - 功能解析：详细举例解析当前步骤的功能。
    - 原理解析：详细举例解析当前步骤的底层实现原理，如果当前步骤底层实现比较复杂，需要对其进行进一步的补充和说明。
    - 关键变量：结合刚刚的示例说明每个关键变量的含义，作用，以及处理前和处理后的值（可以通过 json 格式展示出当前示例中具体的值）。
```

# Git Ignore

```
# custom
.cursorignore
.cursor
config.xml
users.xml
/data
/logs
```

# Launch

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug ClickHouse Server",
      "type": "lldb",
      "request": "launch",
      "program": "${workspaceFolder}/build/programs/clickhouse",
      "args": [
        "server",
        "--config-file=${workspaceFolder}/config.xml"
      ],
      "cwd": "${workspaceFolder}",
      "env": {
        "CLICKHOUSE_WATCHDOG_ENABLE": "0",
        "CLICKHOUSE_WATCHDOG_INTERVAL": "0"
      }
    },
    {
      "name": "Debug ClickHouse Client",
      "type": "lldb",
      "request": "launch",
      "program": "${workspaceFolder}/build/programs/clickhouse",
      "args": [
        "client",
        "--host=localhost",
        "--port=9000",
        "--user=default"
      ],
      "cwd": "${workspaceFolder}",
      "env": {
        "CLICKHOUSE_WATCHDOG_ENABLE": "0",
        "CLICKHOUSE_WATCHDOG_INTERVAL": "0"
      }
    }
  ]
}
```

# Settings

```json
{
  "cmake.generator": "Ninja",
  "cmake.configureOnOpen": true,
  "cmake.buildDirectory": "${workspaceFolder}/build",
  "cmake.defaultVariants": {
    "buildType": {
      "default": "debug",
      "description": "The build type.",
      "choices": {
        "debug": {
          "short": "Debug",
          "long": "Debug build",
          "buildType": "Debug"
        },
        "release": {
          "short": "Release",
          "long": "Release build",
          "buildType": "Release"
        },
        "minsize": {
          "short": "MinSizeRel",
          "long": "Minimum Size Release",
          "buildType": "MinSizeRel"
        }
      }
    }
  },
  "cmake.useCMakePresets": "never",
  "cmake.cmakePath": "/usr/bin/cmake",
  "cmake.configureSettings": {
    "CMAKE_C_COMPILER": "/usr/bin/clang-18",
    "CMAKE_CXX_COMPILER": "/usr/bin/clang++-18",
    "CMAKE_LINKER": "/usr/bin/ld.lld-18",
    "NO_ARMV81_OR_HIGHER": "1",
    "CMAKE_CXX_COMPILER_LAUNCHER": "ccache",
    "CMAKE_C_COMPILER_LAUNCHER": "ccache",
    "ENABLE_TESTS": "OFF",
    "ENABLE_EXAMPLES": "OFF",
    "ENABLE_BENCHMARKS": "OFF",
    "ENABLE_JEMALLOC": "ON",
    "CONFIG_XML_PATH": "${workspaceFolder}/config.xml"
  },
  "cmake.configureArgs": [
    "-DENABLE_JEMALLOC=ON",
    "-DENABLE_RDKAFKA=OFF"
  ],
  "cmake.buildBeforeRun": true,
  "cmake.parallelJobs": 8,
  "cmake.saveBeforeBuild": true,
  "cmake.preferredGenerators": [
    "Ninja"
  ],
  "cmake.configureOnEdit": false,
  "cmake.exportCompileCommandsFile": true,
  "cmake.parseBuildDiagnostics": true,
  "cmake.debugConfig": {
    "stopAtEntry": false,
    "MIMode": "lldb"
  },
  "cmake.buildArgs": [
    "--target", "clickhouse"
  ],
  "cmake.installPrefix": "${workspaceFolder}/install",
  "C_Cpp.default.configurationProvider": "ms-vscode.cmake-tools",
  "C_Cpp.errorSquiggles": "enabled",
  "C_Cpp.dimInactiveRegions": true,
  "C_Cpp.inactiveRegionOpacity": 0.1,
  "C_Cpp.files.exclude": {
    "**/.vscode": true,
    "**/.vs": true,
    "contrib/**": true,
  },
  "clangd.path": "/usr/bin/clangd-18",
  "clangd.arguments": [
    "--background-index",
    "--clang-tidy",
    "--completion-style=detailed",
    "--header-insertion=iwyu",
    "--pch-storage=memory",
    "--compile-commands-dir=${workspaceFolder}/build"
  ],
  "search.exclude": {
    "build": true,
    "**/build": true,
    "**/build/**": true,
    "**/build/**/**": true,
    "**/build/**/**/**": true,
    ".cache": true,
    ".vscode": true,
    ".git": true,
  },
  "files.watcherExclude": {
    "**/build/**": true,
    "**/.git/**": true,
    "**/contrib/**": true
  },
  "editor.formatOnSave": false,
  "debug.inlineValues": "on",
  "debug.allowBreakpointsEverywhere": true
}
```

# CPP Properties

```json{
  "configurations": [
    {
      "name": "Linux",
      "compileCommands": "${workspaceFolder}/build/compile_commands.json",
      "intelliSenseMode": "linux-clang-x64",
      "cppStandard": "c++20",
      "cStandard": "c17",
      "configurationProvider": "ms-vscode.cmake-tools",
      "browse": {
        "path": [
          "${workspaceFolder}/src",
          "${workspaceFolder}/base",
          "${workspaceFolder}/programs",
          "${workspaceFolder}/utils",
          "${workspaceFolder}/build",
          "${workspaceFolder}/contrib/libxml2/include",
          "${workspaceFolder}/contrib/boost/include",
          "${workspaceFolder}/contrib/poco/Foundation/include",
          "${workspaceFolder}/contrib/poco/Net/include",
          "${workspaceFolder}/contrib/poco/Util/include"
        ],
        "limitSymbolsToIncludedHeaders": true,
        "databaseFilename": "${workspaceFolder}/.vscode/browse.db"
      },
      "compilerPath": "/usr/bin/clang-18"
    }
  ],
  "version": 4
}
```

# Cursor Ignore

```
# Add directories or file patterns to ignore during indexing (e.g. foo/ or *.csv)

benchmark/
build/
cmake/
contrib/
docker/
packages/
programs/
rust/
tests/
utils/
data/
logs/

.cache/
.github/
.cursor/
```