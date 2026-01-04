## 一、安装 duti（只需一次）

```bash
brew install duti
```

确认安装成功：

```bash
duti -h
```

---

## 二、准备工作：确认 VS Code 的 Bundle ID

一般都是这个（99% 情况）：

```bash
com.microsoft.VSCode
```

如果你想自己确认一次：

```bash
osascript -e 'id of app "Visual Studio Code"'
```

---

## 三、最常见用法：**单个后缀**

语法：

```bash
duti -s <bundle-id> <扩展名> <角色>
```

示例：让 `.md` 用 VS Code 打开

```bash
duti -s com.microsoft.VSCode .md all
```

说明：
- `.md`：文件后缀（**一定要带点**）
- `all`：表示 open / edit / view 全部角色  
  （一般直接用 `all` 就对了）

---

## 四、重点：**批量修改多个文件类型（推荐）**

### ✅ 方法 1：规则文件（最推荐）

#### 1️⃣ 新建规则文件

```bash
vim ~/duti-vscode.rules
```

内容示例：

```txt
# Text / Basic formats
com.microsoft.VSCodeInsiders    .txt    all
com.microsoft.VSCodeInsiders    .md     all
com.microsoft.VSCodeInsiders    .log    all
com.microsoft.VSCodeInsiders    .jsx    all
com.microsoft.VSCodeInsiders    .ts     all
com.microsoft.VSCodeInsiders    .tsx    all
com.microsoft.VSCodeInsiders    .py     all
com.microsoft.VSCodeInsiders    .java   all
com.microsoft.VSCodeInsiders    .c      all
com.microsoft.VSCodeInsiders    .cpp    all
com.microsoft.VSCodeInsiders    .cc     all
com.microsoft.VSCodeInsiders    .cxx    all
com.microsoft.VSCodeInsiders    .h      all
com.microsoft.VSCodeInsiders    .hpp    all
com.microsoft.VSCodeInsiders    .go     all
com.microsoft.VSCodeInsiders    .rs     all
com.microsoft.VSCodeInsiders    .php    all
com.microsoft.VSCodeInsiders    .rb     all
com.microsoft.VSCodeInsiders    .sh     all
com.microsoft.VSCodeInsiders    .bash   all
com.microsoft.VSCodeInsiders    .zsh    all
```

⚠️ 规则格式很严格：
```
<扩展名> <bundle-id> <角色>
```

用 **空格或 tab 分隔**，不要多余字符。

---

#### 2️⃣ 一次性应用所有规则

```bash
duti ~/duti-vscode.rules
```

✔️ 立即生效  
✔️ 不需要重启 Finder  
✔️ 对“所有该后缀文件”生效
