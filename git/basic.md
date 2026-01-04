# basic

```shell
git remote add upstream https://github.com/ClickHouse/ClickHouse.git
git fetch upstream

git cherry-pick -m <merge-commit-sha>
git cherry-pick -m <parent-number> <merge-commit-sha>

git log --all-match \
  --grep="lazy materialization\|lazy column" \
  --grep="Merge"
```

```
git update-index --skip-worktree .clang-tidy

git update-index --no-skip-worktree .clang-tidy
```

