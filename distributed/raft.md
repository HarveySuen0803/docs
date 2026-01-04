### Raft 介绍

Raft 是一种分布式一致性协议，用于在分布式系统中确保多个节点对同一组操作（如日志条目）达成一致。它解决的问题是：即使部分节点发生故障或网络分裂，系统仍能确保所有节点最终一致并且能够继续工作

Raft 角色

- Leader: 领导者负责处理所有的客户端请求, 并将日志条目复制到其他的服务器, 在任何时候, 只有一个 Leader, 在更换 Leader 的过程中, 可能会短暂的出现没有 Leader 的情况, Leader 只会在它的日志里增加新的条目, 不会去删除或修改已存在的条目
- Follower: 响应 Leader 的请求, 如果 Leader 挂了, 会参与投票选举新的 Leader
- Candidate: 候选者通过 RPC 请求其他节点给自己投票

### Leader 选举

Leader 选举流程：

- A，B，C 在初始状态都是 Follower，此时还没有 Leader，所以不会接受到 Leader 的 PING，都会进入超时等待的状态。
- 每个节点的超时时间都是随机的，防止同时有多个 Candicate 去拉票导致平票的情况，假设 A 150ms，B 300ms，C 200ms，其中 A 最先完成超时等待。
- A 从 Follower 切换为 Candidate，并将自身的 Term 从 0 更新为 1。
- A 先投自己一票，然后向其他节点请求投自己一票，这里 B，C 最先收到 A 的拉票请求后，就会立即给他 A 投一票，并且也跟着修改自己的 Term 为 A 的 Term，后续如果还有节点想要来拉票，这里的 B, C 都会直接拒绝。
- A 的票数为 3 >= 2 (N / 2 + 1 = 3 / 2 + 1 = 2) 完成选举，成为 Leader，开始处理客户端请求。

Leader 宕机后恢复流程：

- 如果 A 发生宕机，B 和 C 收不到心跳后，会进入超时等待，开启下一届选举，假设这里 B 当选成功。
- 等 A 恢复后，他依旧会认为自己是 Leader，会尝试去对外提供服务，直到 A 收到 B 的心跳，他会发现自己的任期小于 B 的任期，就会自动成为 Follower。

投票条件：条件1 && (条件2 || (条件3 && 条件4))

- 条件1：请求的任期 Term >= 本节点的任期 Term
- 条件2：请求的最后一条日志的任期 LastLogTerm > 本节点的最后一条日志的任期 LastLogTerm
- 条件3：请求的最后一条日志的任期 LastLogTerm == 本节点的最后一条日志的任期 LastLogTerm
- 条件4：请求的最后一条日志的索引 LastLogIndex >= 本节点的最后一条日志的索引 LastLogIndex

### 状态机

状态机的核心作用是记录并维护系统的 最终状态，例如键值对的状态。在分布式系统中，状态机不仅代表最终的状态，还定义了系统如何从一系列输入（日志操作）中计算出这些状态。

- 日志条目是输入，状态机是输出
  - 日志条目记录了所有客户端的请求（操作），是系统状态更新的依据。
  - 状态机将这些操作应用到当前状态，生成最终的系统状态。
- 日志条目保证一致性，状态机保证正确性。
  - Raft 确保所有节点的日志条目按相同顺序一致。
  - 状态机根据一致的日志，独立计算出相同的最终状态。

### 日志条目

Log Entry 是用于记录状态机指令（如键值存储操作）及其元数据的核心结构。每个 Log Entry 都包含足够的信息，以便在分布式环境中保持日志的一致性，并能够在系统故障后恢复状态。每一次的客户端请求，或者系统状态的改变，都会生成一条日志条目。

Log Entry 组成

- Index：日志条目的唯一编号，用于标识日志在日志序列中的位置，保证日志条目在所有节点上的顺序一致。
- Term：标识日志条目生成时的任期号，每个 Leader 在其任期内生成的所有日志条目都带有相同的任期号。用于解决日志冲突，如果两条日志的 Index 相同但 Term 不同，则后一条日志覆盖前一条日志。
- Command：具体的操作指令，例如对键值存储的 put、delete 等。
- Metadata：元数据，用于存储日志条目的其他状态信息，例如，日志条目是否已提交（committed），日志条目是否已被应用到状态机（applied）。

```json
{
  "index": 5,
  "term": 3,
  "command": {
    "type": "put",
    "key": "username",
    "value": "Alice"
  },
  "committed": true,
  "applied": true
}
```

### 日志复制

领导者负责处理客户端请求，并需要将指令（如写入或修改数据）复制到所有节点：

1. 客户端向 A 发送一条命令 set x = 5。
2. A 将命令添加到自己的日志中，并生成一个索引号（如 Log[1]）。
3. A 向 B、C、D、E 发送 AppendEntries 请求，包含日志项 Log[1]: set x = 5。
4. Follower 节点收到日志后，返回成功确认。
5. A 收到大多数节点（如 B、C、D）的确认后，将该日志项标记为已提交（Committed）。
6. A 将提交结果返回给客户端。
7. A 的状态机应用已提交的日志 Log[1]，修改 x=5。
8. Follower 节点稍后也会应用该日志。

AppendEntries RPC 是 Raft 协议中用于日志复制和心跳检测的重要机制。它的主要作用包括：

- 将新日志条目从 Leader 复制到 Follower。
- 确保所有 Follower 的日志与 Leader 一致。
- 通过空的 AppendEntries 消息作为心跳，防止 Leader 被重新选举。

每个 AppendEntries RPC 消息通常包含以下字段：

- term：Leader 的当前任期号。
- leaderId：Leader 的唯一标识。
- prevLogIndex：Leader 日志中，当前条目之前的最后一个日志的索引。
- prevLogTerm：prevLogIndex 对应日志的任期号。
- entries[]：需要同步的新日志条目（可以为空，用于心跳）。
- leaderCommit：Leader 已提交的日志索引，用于通知 Follower 提交日志。

```json
{
  "type": "AppendEntries",
  "term": 5,                   // Leader 当前任期
  "leaderId": "node-1",        // Leader 的节点 ID
  "prevLogIndex": 4,           // 上一个日志条目的索引
  "prevLogTerm": 3,            // 上一个日志条目的任期
  "entries": [                 // 新日志条目
    {
      "index": 5,
      "term": 5,
      "command": {
        "key": "username",
        "value": "Alice",
        "type": "put"
      }
    }
  ],
  "leaderCommit": 3            // Leader 当前的提交索引
}
```

### 日志提交

日志是否提交指的是一条日志条目是否已经被多数节点确认并提交到状态机中执行。这是 Raft 实现分布式系统一致性的重要机制之一。

- 未提交的日志：日志条目被 Leader 写入本地日志，但尚未被复制到大多数节点（过半数的 Follower）。
- 已提交的日志：日志条目已经被复制到大多数节点，Leader 将日志标记为 “已提交”，并将其应用到状态机。

日志提交流程：

- Leader 收到客户端请求后，会生成一条日志存储在本地，然后复制日志给所有的 Follower。
- Follower 接收到日志后，会存储到本地，但是并没有标记为 “已提交”，存储完成后，Follower 会发送 ACK 给 Leader。
- 当 ACK 的数量超过半数后，Leader 会将该日志标记为 “已提交”，并将其应用到状态机。
- Leader 再次发送 AppendLogEntries RPC 时，会在 RPC 中设置 leaderCommit 字段为最新已提交的日志索引。
- Follower 收到 Leader 的提交指令后，会去提交 小于等于 leaderCommit 的所有日志，并将其应用到状态机。

Leader 通过记录每条日志的复制进度，决定日志是否可以提交。

```java

public class Leader {
    private final Map<Long, Integer> replicationCount = new HashMap<>(); // 日志索引到复制数的映射
    private final List<LogEntry> logEntries = new ArrayList<>();         // 本地日志
    private final int quorum; // 集群过半数节点数

    public Leader(int clusterSize) {
        this.quorum = clusterSize / 2 + 1; // 过半数
    }

    // 添加日志条目
    public void appendLogEntry(LogEntry entry) {
        logEntries.add(entry);
        replicationCount.put(entry.getIndex(), 1); // 自己默认确认
    }

    // 处理 Follower 的确认
    public void handleReplicationAck(long index) {
        int count = replicationCount.getOrDefault(index, 0) + 1;
        replicationCount.put(index, count);

        // 检查是否达到过半数
        if (count >= quorum) {
            commitLogEntry(index);
        }
    }

    // 提交日志
    private void commitLogEntry(long index) {
        for (LogEntry entry : logEntries) {
            if (entry.getIndex() == index && !entry.isCommitted()) {
                entry.setCommitted(true);
                System.out.println("Log entry committed: " + entry);
                applyLogEntry(entry);
            }
        }
    }

    // 应用日志到状态机
    private void applyLogEntry(LogEntry entry) {
        System.out.println("Applying log entry to state machine: " + entry.getCommand());
    }
}
```

Follower 接收 Leader 的 AppendEntries RPC 后，确认日志并返回。

```java
public class Follower {
    private final List<LogEntry> logEntries = new ArrayList<>();

    // 接收日志条目
    public void appendLogEntry(LogEntry entry) {
        logEntries.add(entry);
        System.out.println("Log entry appended: " + entry);
    }

    // 确认日志
    public void sendAck(Leader leader, long index) {
        leader.handleReplicationAck(index);
        System.out.println("Acknowledged log entry: " + index);
    }
}
```

测试日志提交流程：

```java
public class RaftLogExample {
    public static void main(String[] args) {
        // 创建 Leader 和 Follower
        Leader leader = new Leader(5);
        Follower follower1 = new Follower();
        Follower follower2 = new Follower();
        Follower follower3 = new Follower();
        Follower follower4 = new Follower();

        // Leader 添加日志
        LogEntry entry = new LogEntry(4, 2, "Command4");
        leader.appendLogEntry(entry);

        // 模拟 Follower 确认日志
        follower1.appendLogEntry(entry);
        follower1.sendAck(leader, 4);

        follower2.appendLogEntry(entry);
        follower2.sendAck(leader, 4);

        follower3.appendLogEntry(entry);
        follower3.sendAck(leader, 4); // 达到过半数，日志被提交
    }
}
```

### 日志修复

如果一个 Follower 的日志落后于 Leader（例如由于网络分区或崩溃恢复），Raft 会通过日志复制机制将其日志与 Leader 日志同步。这个过程被称为 日志修复（Log Reconciliation）。

Leader 要保证所有 Follower 的日志与自己的日志一致，如果 Follower 的日志落后，Leader 会主动补发缺失的日志。

日志修复流程：

1. Leader 发送的 AppendEntries RPC 包含 prevLogIndex 和 prevLogTerm 用于 Follow 检查日志是否存在冲突。
2. Follower 如果发现 prevLogIndex 和 prevLogTerm 不一致，会拒绝新日志的追加。
3. Leader 通过递减 prevLogIndex，逐步回退日志，不断尝试同步，直到找到匹配点。

Follower 检测是否存在日志冲突：

```java
public boolean handleAppendEntries(long prevLogIndex, long prevLogTerm, List<LogEntry> entries) {
    // 检查 prevLogIndex 是否存在，以及 Term 是否匹配
    if (prevLogIndex > lastLogIndex || getLogTerm(prevLogIndex) != prevLogTerm) {
        System.out.println("Log mismatch detected. Rejecting AppendEntries.");
        return false;
    }

    // 删除冲突的日志
    deleteLogsFromIndex(prevLogIndex + 1);

    // 追加新的日志条目
    for (LogEntry entry : entries) {
        appendLog(entry);
    }

    // 更新提交索引
    commitIndex = Math.min(leaderCommit, lastLogIndex);
    return true;
}

// 删除冲突日志
private void deleteLogsFromIndex(long startIndex) {
    while (logMap.containsKey(startIndex)) {
        logMap.remove(startIndex);
        startIndex++;
    }
    System.out.println("Deleted logs starting from index " + startIndex);
}

// 追加日志条目
private void appendLog(LogEntry entry) {
    logMap.put(entry.getIndex(), entry);
    System.out.println("Appended log: " + entry);
}
```

Leader 根据失败响应回退日志，找到匹配点：

```java
public void synchronizeWithFollower(FollowerNode follower) {
    long prevLogIndex = follower.getNextIndex() - 1;

    while (true) {
        try {
            long prevLogTerm = getLogTerm(prevLogIndex); // 获取 Leader 的 prevLogTerm

            // 构造 AppendEntries 请求
            List<LogEntry> entries = getEntriesFrom(prevLogIndex + 1);
            boolean success = follower.handleAppendEntries(prevLogIndex, prevLogTerm, entries);

            if (success) {
                System.out.println("Synchronization succeeded for Follower: " + follower.getNodeId());
                break;
            }
            // 回退到前一个日志
            prevLogIndex--;
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

```java
public class LogStore {
    private final TreeMap<Long, LogEntry> logMap = new TreeMap<>();

    // 添加日志条目
    public void addLogEntry(LogEntry entry) {
        logMap.put(entry.getIndex(), entry);
    }

    // 获取日志条目
    public LogEntry getLogEntry(long index) {
        return logMap.get(index);
    }

    // 获取从 startIndex 开始的所有日志条目
    public List<LogEntry> getEntriesFrom(long startIndex) {
        List<LogEntry> entries = new ArrayList<>();
        for (Map.Entry<Long, LogEntry> entry : logMap.tailMap(startIndex).entrySet()) {
            entries.add(entry.getValue());
        }
        return entries;
    }
}
```

### 日志修复（快速回退）

Raft 协议的默认日志修复方案是 Leader 逐步回退日志索引，找到与 Follower 日志匹配的最后一个条目（匹配点），然后从匹配点开始发送缺失日志。这种方案在某些情况下可能效率较低，例如 Follower 日志严重落后时，需要多次发送 AppendEntries RPC。

当 Follower 检测到日志冲突时，可以返回其本地日志中与 Leader 任期匹配的最大索引，帮助 Leader 快速回退到匹配点。

```java
public long handleAppendEntriesWithProgress(long prevLogIndex, long prevLogTerm, List<LogEntry> entries) {
    // 检查 prevLogIndex 和 prevLogTerm 是否匹配
    if (prevLogIndex > lastLogIndex || getLogTerm(prevLogIndex) != prevLogTerm) {
        // 如果不匹配，返回 Follower 当前日志中与 Leader 任期匹配的最大索引
        return findMaxMatchingIndex(prevLogTerm);
    }

    // 删除冲突日志
    deleteLogsFromIndex(prevLogIndex + 1);

    // 追加新的日志条目
    for (LogEntry entry : entries) {
        appendLog(entry);
    }

    // 返回成功的最大索引
    return lastLogIndex;
}

// 找到最大匹配索引
private long findMaxMatchingIndex(long term) {
    for (long index = lastLogIndex; index > 0; index--) {
        if (getLogTerm(index) == term) {
            return index;
        }
    }
    return 0; // 如果没有匹配条目，返回 0
}
```

Leader 根据 Follower 返回的最大匹配索引，直接调整起点，从该索引开始发送日志。

```java
public void synchronizeWithFollower(FollowerNode follower) {
    long nextIndex = follower.getNextIndex();

    while (true) {
        try {
            long prevLogIndex = nextIndex - 1;
            long prevLogTerm = getLogTerm(prevLogIndex);

            // 获取从 nextIndex 开始的日志条目
            List<LogEntry> entries = logStore.getEntriesFrom(nextIndex);

            // 发送 AppendEntries 请求
            long progress = follower.handleAppendEntriesWithProgress(prevLogIndex, prevLogTerm, entries);

            if (progress >= nextIndex) {
                System.out.println("Synchronization succeeded for Follower: " + follower.getNodeId());
                follower.setNextIndex(progress + 1); // 更新 Follower 的 nextIndex
                break;
            } else {
                nextIndex = progress + 1; // 快速调整 nextIndex
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 日志修复（快照修复）

如果 Follower 的日志严重落后，Leader 不必通过逐步回退日志来找到匹配点，而是直接通过发送 快照（Snapshot） 的方式让 Follower 恢复到最新状态。

- Leader 创建一个快照，包含已提交的状态机快照、最新的日志索引、最新的任期。
- Leader 通过 InstallSnapshot RPC 将快照发送给 Follower。
- Follower 应用快照，更新自己的日志状态。

状态机的快照管理：

```java
public class StateMachine {
    private Map<String, String> keyValueStore = new HashMap<>(); // 示例：键值存储

    // 生成快照
    public byte[] takeSnapshot() {
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(bos);
            oos.writeObject(keyValueStore);
            return bos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error creating snapshot", e);
        }
    }

    // 应用快照
    @SuppressWarnings("unchecked")
    public void applySnapshot(byte[] snapshot) {
        try {
            ByteArrayInputStream bis = new ByteArrayInputStream(snapshot);
            ObjectInputStream ois = new ObjectInputStream(bis);
            keyValueStore = (Map<String, String>) ois.readObject();
            System.out.println("State machine restored from snapshot.");
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException("Error applying snapshot", e);
        }
    }

    // 示例操作
    public void put(String key, String value) {
        keyValueStore.put(key, value);
    }

    public String get(String key) {
        return keyValueStore.get(key);
    }
}
```

```java
class Snapshot {
    private final long lastIndex; // 快照中最后一条日志的索引
    private final long lastTerm;  // 快照中最后一条日志的任期
    private final byte[] state;   // 状态机的快照数据

    public Snapshot(long lastIndex, long lastTerm, byte[] state) {
        this.lastIndex = lastIndex;
        this.lastTerm = lastTerm;
        this.state = state;
    }

    public long getLastIndex() {
        return lastIndex;
    }

    public long getLastTerm() {
        return lastTerm;
    }

    public byte[] getState() {
        return state;
    }
}
```

Leader 生成快照，并通过 InstallSnapshot RPC 发送给 Follower。

```java
public class LeaderNode {
    private StateMachine stateMachine; // 状态机
    private long lastLogIndex;         // 当前日志的最后索引
    private long lastLogTerm;          // 当前日志的最后任期

    public void sendSnapshot(FollowerNode follower) {
        Snapshot snapshot = createSnapshot();
    
        // 发送快照
        boolean success = follower.installSnapshot(snapshot);
        if (success) {
            System.out.println("Snapshot installed for Follower: " + follower.getNodeId());
            // 更新 Follower 的 nextIndex 为快照最后一条日志的索引
            follower.setNextIndex(snapshot.getLastIndex() + 1);
        }
    }

    public Snapshot createSnapshot() {
        // 从状态机生成快照数据
        byte[] snapshotState = stateMachine.takeSnapshot();
        return new Snapshot(lastLogIndex, lastLogTerm, snapshotState);
    }
}
```

Follower 接收快照并更新其状态机和日志。

```java
public class FollowerNode {
    private StateMachine stateMachine; // 状态机
    private long lastAppliedIndex;     // 已应用的日志索引
    private long lastAppliedTerm;      // 已应用的日志任期

    // 安装快照
    public boolean installSnapshot(Snapshot snapshot) {
        System.out.println("Installing snapshot...");

        // 更新状态机为快照的状态
        stateMachine.applySnapshot(snapshot.getState());

        // 更新日志状态
        lastAppliedIndex = snapshot.getLastIndex();
        lastAppliedTerm = snapshot.getLastTerm();

        // 删除现有日志并从快照索引开始
        resetLogs(snapshot.getLastIndex());

        System.out.println("Snapshot installed: lastIndex=" + lastAppliedIndex + ", lastTerm=" + lastAppliedTerm);
        return true;
    }

    // 重置日志状态
    private void resetLogs(long lastIndex) {
        // 假设日志存储在 TreeMap 中
        TreeMap<Long, LogEntry> logMap = new TreeMap<>();
        logMap.tailMap(lastIndex, false).clear();
        System.out.println("Logs reset. Starting from index " + lastIndex);
    }
}
```

### 日志修复（分块快照修复）

快照修复不一定需要将所有的数据完整地发送给 Follower，而是可以通过分块（chunk）传输的方式来优化网络带宽的使用。这种分块传输策略特别适用于数据量较大的场景，通过将快照数据切分为多个小块逐步发送，可以显著提高效率并减少失败时的重新发送成本。

- Leader 将快照数据切分为多个小块，每次通过 RPC 发送一部分。
- Follower 在接收到所有块后组装完整的快照并应用到状态机。

```java
public class SnapshotChunk {
    private final int chunkIndex; // 当前块的序号
    private final int totalChunks; // 总块数
    private final byte[] data; // 当前块的数据

    public SnapshotChunk(int chunkIndex, int totalChunks, byte[] data) {
        this.chunkIndex = chunkIndex;
        this.totalChunks = totalChunks;
        this.data = data;
    }

    public int getChunkIndex() {
        return chunkIndex;
    }

    public int getTotalChunks() {
        return totalChunks;
    }

    public byte[] getData() {
        return data;
    }
}

public class Snapshot {
    private final long lastIndex;
    private final long lastTerm;
    private final byte[] state;

    public Snapshot(long lastIndex, long lastTerm, byte[] state) {
        this.lastIndex = lastIndex;
        this.lastTerm = lastTerm;
        this.state = state;
    }

    public long getLastIndex() {
        return lastIndex;
    }

    public long getLastTerm() {
        return lastTerm;
    }

    public List<SnapshotChunk> splitSnapshot(int chunkSize) {
        List<SnapshotChunk> chunks = new ArrayList<>();
        int totalChunks = (int) Math.ceil((double) state.length / chunkSize);
        for (int i = 0; i < totalChunks; i++) {
            int start = i * chunkSize;
            int end = Math.min(start + chunkSize, state.length);
            byte[] chunkData = Arrays.copyOfRange(state, start, end);
            chunks.add(new SnapshotChunk(i, totalChunks, chunkData));
        }
        return chunks;
    }
}
```

Leader 通过 InstallSnapshot RPC 逐块发送快照。

```java
public class LeaderNode {
    public void sendSnapshotChunks(FollowerNode follower, Snapshot snapshot, int chunkSize) {
        List<SnapshotChunk> chunks = snapshot.splitSnapshot(chunkSize);
        for (SnapshotChunk chunk : chunks) {
            boolean success = follower.receiveSnapshotChunk(snapshot.getLastIndex(), snapshot.getLastTerm(), chunk);
            if (!success) {
                System.out.println("Failed to send chunk " + chunk.getChunkIndex() + ". Retrying...");
                // 可以实现重试逻辑
            }
        }
        System.out.println("Snapshot transfer complete for Follower: " + follower.getNodeId());
    }
}
```

Follower 保存接收到的快照块，并在接收完整后组装快照。

```java
public class FollowerNode {
    private final Map<Integer, byte[]> receivedChunks = new HashMap<>(); // 临时保存块
    private int totalChunks = -1; // 总块数
    private long lastSnapshotIndex = -1;

    public boolean receiveSnapshotChunk(long snapshotIndex, long snapshotTerm, SnapshotChunk chunk) {
        System.out.println("Receiving chunk " + chunk.getChunkIndex());

        if (totalChunks == -1) {
            totalChunks = chunk.getTotalChunks(); // 初始化总块数
            lastSnapshotIndex = snapshotIndex;
        }

        // 保存块数据
        receivedChunks.put(chunk.getChunkIndex(), chunk.getData());

        // 检查是否所有块已接收
        if (receivedChunks.size() == totalChunks) {
            assembleAndApplySnapshot(snapshotIndex, snapshotTerm);
        }
        return true;
    }

    private void assembleAndApplySnapshot(long snapshotIndex, long snapshotTerm) {
        System.out.println("Assembling snapshot...");

        // 组装快照数据
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        for (int i = 0; i < totalChunks; i++) {
            try {
                bos.write(receivedChunks.get(i));
            } catch (IOException e) {
                throw new RuntimeException("Error assembling snapshot", e);
            }
        }
        byte[] snapshotData = bos.toByteArray();

        // 应用快照到状态机
        StateMachine stateMachine = new StateMachine();
        stateMachine.applySnapshot(snapshotData);

        // 清理快照临时数据
        receivedChunks.clear();
        totalChunks = -1;

        System.out.println("Snapshot applied: lastIndex=" + snapshotIndex + ", lastTerm=" + snapshotTerm);
    }
}
```

### 成员变更

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411171546521.png)

这里 S1，S2，S3 为老节点，S4 和 S5 为新增节点。由于同步新的配置（例如，节点的总数）需要时间，就有可能发生脑裂情况：

- S1，S2，S3 原先设定只需要得到 2 票即可当选，假设 S1 得到 S2 的选票，当选成功。
- S4，S5 需要 3 票当选，假设 S5 收到 S3 和 S4 的选票，当选成功。

Raft 通过两阶段变更的方案，避免了脑裂问题：

- 第一阶段，Leader 发送 c_old_new，将集群切换至联合一致（joint consensus）状态，当应用到多数节点时，完成状态切换。
- 第二阶段，Leader 发送 c_new 使整个集群进入新配置状态，这时所有的 RPC 只要新配置下达到多数就算成功。

添加节点时，需要等新增的节点完成日志同步后，再开始进行两阶段变更，这部分新增节点，在完成调整前，不具备投票权和提供服务的能力。

移除节点时，可能就是要移除 Leader 节点，这时只需要在发送 c_new 之后让该节点自动退位，此时会进入一个没有 Leader 的环境，只需要再使用新的配置进行一次选举即可。

### 自动降级

如果移除集群的节点并没有及时下线，这部分节点超时后尝试增加任期开始选举，频繁的发送 Vote RPC 给到集群中的其他节点，虽然这部分节点不会当选成功，但是会影响到集群的正常运作。

Raft 为次新增了一个 自动降级规则（PreVote 机制）用于缓解离群节点对集群的干扰。

- 在 Vote RPC 请求前，节点需要通过一个预选阶段来确认自己是否有资格发起正式的选举。
- 当一个节点的选举超时后，它不会直接进入 Candidate 状态，它首先进入一个预选阶段，向其他节点发送 PreVote RPC。
- 其他节点会去检查 PreVote 是否符合条件：
  - 如果该节点的日志 足够新，则返回 yes。
  - 如果该节点的日志 较旧 或 自己已经有一个有效的 Leader，则返回 no。
- 只需要集群内的节点正常收到 Leader 的 AppendLog RPC 就可以保证不受影响。

由于这个自动降级策略较为麻烦，也还有一个更简单的解决方案，只要保证每次只新增一个节点，就永远不会出现脑裂的情况。

### 主从切换

Raft 主从切换 是 Raft 分布式一致性协议的核心功能之一。当主节点（Leader）失效时，Raft 通过一种选举机制选出一个新的主节点，保证系统的高可用性和数据一致性。同时，Raft 还支持主动的主从切换（Leader Transfer），用于在正常情况下调整主节点的角色分布。

系统为了实现主节点负载均衡，主动将 Leader 的角色转移到另一个副本。	例如，当某个节点的负载过高时，将它的主节点角色交给其他负载较低的节点。

Raft 提供了一种 Leader Transfer 的机制，用于在主节点正常运行时，将主节点角色安全地交给一个指定的 Follower。

- A 收到 Leader Transfer 请求，目标是将 B 设为新的 Leader。
- A 将请求转发给 B，并标记自己为准备退出 Leader 状态。
- A 确保 B 的日志与自己完全一致。
- 如果 B 的日志滞后，A 会将最新的日志条目复制给 B，直到 B 的日志与 A 一致。
- A 向 B 发送 Transfer Leadership 信号。
- B 开始发起选举，并成为新的 Leader（由于 B 的日志最新，其他节点会支持 B）。
- B 成为新的 Leader，并开始发送心跳。
- A 转为 Follower。

### 一致性

在分布式存储系统中，客户端缓存回退问题 是因为客户端可能从不同的副本读取数据，而这些副本的状态可能不同步（例如副本 A 的日志进度比副本 B 更快）。这会导致客户端看到的数据不一致，甚至缓存被回退。

#### 验证读取

验证读取：允许客户端从任意副本读取，但要求副本验证数据的一致性。

- 客户端读取到的键值队增加 commitIndex 和 logTerm 元数据字段。
- 客户端维护最近读取到的 commitIndex 和 logTerm。
- 当从其他副本读取时，确保新读取的数据的 commitIndex 和 logTerm 不小于之前的数据。
- 如果新读取的数据的元数据不满足条件，客户端重试或从 Leader 重新读取。

优点：Leader 负载小，支持更好的读扩展性。

缺点：客户端逻辑复杂，需要处理元数据验证和重试。

#### 线性读取

线性读取：确保客户端的每次读取都具有线性一致性。

- 强制读取通过 Leader。
- Leader 在回复数据前确保自己的提交索引（commitIndex）已更新到最新。
- Leader 执行读请求前，通过向大多数节点发送心跳或检查确认日志进度。
- 确保读取的数据是最新的已提交数据。

优点：读操作线性一致，保证客户端读取最新数据。

缺点：增加了读取的延迟（需要额外的 quorum 通信），对性能有一定影响。

#### 快照读取

快照读取：通过定期生成快照的方式，允许客户端从快照读取数据，避免不一致问题。

- Leader 定期生成当前状态的快照，并分发给所有副本，副本根据快照更新本地数据。
- 客户端可以从任意副本读取，但只读取快照状态，保证所有副本的快照一致。

优点：读取效率高，读取一致性强。

缺点：快照存在延迟（只反映生成快照时的状态），快照的生成和分发增加了系统开销。

#### 租约读取

租约读取是一种高效的读取一致性保障机制，通过 Leader 向特定 Follower 授予短期的租约（lease），允许这些 Follower 在租约期间处理读请求。租约的核心思想是利用时间窗口，保证 Follower 在租约有效期内的数据与 Leader 一致，从而允许客户端从这些 Follower 读取数据。

- Leader 向一个或多个 Follower 授予租约，在租约期间，Leader 承诺不会提交新的数据。
- 被授予租约的 Follower 可以直接处理客户端读请求，读取的数据是 Leader 提交的最新状态。
- 如果租约到期，Follower 需要重新向 Leader 申请租约，如果租约续期失败，Follower 停止处理读请求。
- Follower 在租约期间，仍然会接受来自 Leader 的 AppendEntries RPC 请求，Follower 会将新日志追加到本地日志存储中，但这些日志不会立刻被应用到状态机（需要等到被标记为提交后）。
- Leader 的租约机制依赖于集群中同步的时钟（如 NTP），确保在租约有效期内不会有新的提交。

Leader 向某个 Follower 授予租约，记录租约的有效时间。

```java
public class LeaseManager {
    private long leaseExpirationTime = 0; // 租约过期时间

    // 授予租约（单位：毫秒）
    public void grantLease(long leaseDurationMs) {
        leaseExpirationTime = System.currentTimeMillis() + leaseDurationMs;
        System.out.println("Lease granted until: " + leaseExpirationTime);
    }

    // 检查租约是否有效
    public boolean isLeaseValid() {
        return System.currentTimeMillis() < leaseExpirationTime;
    }
}
```

Follower 在处理读请求时，先检查租约是否有效。如果租约有效，则读取本地已提交的数据。

```java
public class Follower {
    private final Map<String, String> dataStore = new HashMap<>(); // 数据存储
    private final LeaseManager leaseManager = new LeaseManager(); // 租约管理器

    // 写入数据
    public void put(String key, String value) {
        dataStore.put(key, value);
    }

    // 读取数据（需检查租约）
    public String read(String key) {
        if (!leaseManager.isLeaseValid()) {
            throw new IllegalStateException("Lease expired. Cannot serve read requests.");
        }
        return dataStore.get(key);
    }

    // 模拟从 Leader 获取租约
    public void requestLeaseFromLeader(long leaseDurationMs) {
        leaseManager.grantLease(leaseDurationMs);
    }
}
```

要通过租约机制保证多个副本之间数据的一致性，就需要副本都采用相同的租约，一块续期，一块到期。如果租约到期后，所有 Follower 暂停接受客户端的读请求，此时所有的读请求都会转向 Leader，可能导致 Leader 压力骤增，甚至成为性能瓶颈。为了解决这个问题，需要对租约机制进行进一步优化和设计，避免租约到期带来的系统性能下降。

减少无效续约：

- 在租约即将到期时，Follower 主动向 Leader 请求续约，避免租约到期后中断读请求。
- 如果 Follower 的状态与 Leader 保持一致，Leader 可以直接续约，整个过程不需要 Follower 停止对外提供服务。
- 如果 Follower 的状态落后，需要先同步数据后再续约。

采用滚动续约：

- Follower 到期后，先由部分节点尝试续约，如果续约成功，其他的节点停止提供读请求，由这部分续约成功的 Follower 提供读请求。
- 剩余的 Follower 再去进行续约，同时要保证多批续约的 Follower 的到期时间是一样的，并且要求状态是一致的。

### 可靠性

#### Leader 宕机

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202411171510769.png)

日志丢失过程：

- a 任期，S1 同步 log2 给 S2 后发生宕机，但是未提交 log2。
- b 任期，S5 凭借高任期，当选成功。
- c 任期，S1 当选成功后，同步 log2 给 S3，但是未提交 log2。
- d 任期，S5 凭借高任期，当选成功，同步 log3 给所有的 Follower，同时覆盖了所有的 log2 和 log4。
  - S1 的 log2 并没有提交，因而被覆盖。
  - S1 的 log4 并为在多数节点达成共识，因而被覆盖。

这里对于 log2 的处理有两种方案：

- 如果不希望 log2 丢失，就需要 S1 在 d 任期当选成功，S1 将 log2 和 log4 复制到其他节点上（这里会覆盖 S5 的 log3）。
- 等达成共识后，提交 log4，并且设置 RPC 的 leaderCommit 为 4，就可以顺带提交 log2 了。
- No Operation 很好的实现了这个方案，专门用于解决这类问题，可以往下看。

#### Follower 宕机

如果 Follower 和 Candidate 发生宕机，Leader 无限重试发送 AppendLogEntries RPC，等节点恢复后，会收到 RPC 同步日志和状态，AppendLogEntries RPC 可以保证幂等，不会有任何影响。

#### 时间限制

必须要保证 广播时间 << 选举超时时间 << 平均宕机间隔时间（MTBF）不然无法完成选举。

一般设置选举超时时间在 10ms ~ 500ms 之间。

#### No Operation

当一个节点被选举为新的 Leader 时，可能存在旧的未提交日志条目（由上一任 Leader 写入）。新 Leader 通过添加一个 No-OP 日志并将其提交，表明它能够成功控制集群的提交状态。

No-OP 本质上就是一个心跳，没有 Log Entries 内容，只有一个 leaderCommit 字段，帮助快速保存未提交的日志，确保集群中日志状态的一致性。

No-OP 只是一个空心跳，开销非常小，目前大部分应用于生产的 Raft 算法，都会开启 No-OP。