# system.part_log

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20251022094726.png)

- NewPart (1) - 新数据写入
- MergeParts (2) - 后台合并操作
- DownloadPart (3) - 从其他副本下载
- RemovePart (4) - 删除过期/合并后的part
- MutatePart (5) - 数据变更（ALTER DELETE/UPDATE）
- MovePart (6) - 数据在磁盘间移动（冷热分层）
- ReceivePart (7) - 接收数据分片

查看 part 信息

```sql
SELECT 
    count() AS total_parts,
    countIf(active) AS active_parts,
    countIf(NOT active) AS inactive_parts
FROM system.parts;
```

```
-- 后台 Merge: 合并 Part1 + Part2 → Part3

┌─────────────────────────────────────────────────────┐
│ Before Merge:                                       │
│   202510_1_1_0  (Active)   5GB                      │
│   202510_2_2_0  (Active)   4GB                      │
├─────────────────────────────────────────────────────┤
│ During Merge:                                       │
│   202510_1_1_0  (Active)   ← 旧 parts 仍然 Active   │
│   202510_2_2_0  (Active)   ← 查询继续使用这些        │
│   202510_1_2_1  (Temporary) ← 新 part 生成中         │
├─────────────────────────────────────────────────────┤
│ Merge Complete:                                     │
│   202510_1_1_0  (Outdated) ← 标记为过时！            │
│   202510_2_2_0  (Outdated) ← 标记为过时！            │
│   202510_1_2_1  (Active)   9GB ← 新 part 激活        │
├─────────────────────────────────────────────────────┤
│ After Cleanup (约 8 分钟后):                        │
│   202510_1_2_1  (Active)   9GB                      │
│   [旧 parts 已物理删除]                              │
└─────────────────────────────────────────────────────┘
```