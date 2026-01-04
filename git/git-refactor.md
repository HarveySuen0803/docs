# Git

## working space

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241807692.png)

- Working Space: 存放代码
- Stage: 存放临时改动的代码
- Local Repository: 存放最终改动的代码
- Remote Repository: 远程服务器存放最终改动的代码

# config

## check config

```shell
# 查看 config
git config --list

# 查看 local config
git config --local --list

# 查看 system config
git config --system --list

# 查看 global config, 相当于 user config
git config --global --list
```

## edit config

```shell
git config --global --edit
```

## set user info

```shell
git config --global user.name "Harvey"
git config --global user.email "harveysuen0803@gmail.com"
```

# check status

```shell
git status
```

# initialization

```shell
# 初始化 git project
git init
```

# add

```shell
# 添加 test.txt 到 Stage
git add test.txt

git add .
```

# commit

```shell
# 提交 Stage 中的 test.txt 到 Local Repository, 携带信息 "first commit"
git commit -m "first commit" test.txt

git commit -m "first commit" .

# 出现合并冲突时, 不能添加 文件名 或 "."
git commit -m "first commit"
```

# log

## check log

```shell
git log
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241807693.png)

## check reflog

```shell
git reflog
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241807694.png)

# history

## check history

.git/refs/heads/main, 当前版本号

```txt
d3f1c039064855325301293221d72e7316459e0f
```

## switch history

```shell
# 切换到 7d56cfc 版本
git reset --hard 7d56cfc
```

# remote repository

## check remote repository

```shell
git remote -v
```

## create remote repository

```shell
git remote add git-demo https://github.com/HarveySuen0803/git-demo.git
```

## delete remote repository

```shell
git remote rm git-demo
```

## push

```shell
git push git-demo main
```

# pull

```shell
git pull git-demo main
```

# clone

```shell
git clone https://github.com/HarveySuen0803/git-demo.git
```

# branch

## check branch

查看 local branch

```shell
git branch -v
```

查看 remote branch

```shell
git brach -r
```

.git/HEAD, 查看 current branch

```txt
ref: refs/heads/main
```

## create brach

```shell
# 基于 hot-fix 分支, 为当前分支的副本
git brach hot-fix
```

## switch branch

```shell
git checkout -b hot-fix
```

## delete branch

先检查 merge status, 再删除 local branch

```shell
git branch -d hot-fix
```

不检查, 直接删除 local branch

```shell
git branch -D hot-fix
```

删除 remote branch

```shell
git push git-demo -d hot-fix
```

## merge branch

```shell
# 合并 current branch 和 hot-fix branch
git merge hot-fix
```

