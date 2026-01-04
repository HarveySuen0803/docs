### ZAB 介绍

ZAB（Zookeeper Atomic Broadcast）协议是 Zookeeper 专门设计的分布式一致性协议，用于实现高可用、高性能的分布式协调服务。它是 Zookeeper 集群的一致性核心，支持 Leader 选举、事务日志同步和广播。

- 提供线性一致性：保证所有写请求的全局顺序一致。
- 高可用性：即使部分节点宕机，系统仍能处理读操作，写操作会等到重新选出 Leader。
- 崩溃恢复：在集群故障后能够快速恢复一致性。

ZAB 协议分为两个状态：

- 崩溃恢复（Crash Recovery）：当集群首次启动或 Leader 宕机时，集群会进入崩溃恢复状态。主要任务是通过 Leader 选举，选出新的 Leader 并同步数据，确保所有节点的状态一致。
- 消息广播（Atomic Broadcast）：当集群进入稳定状态后，Leader 将客户端的写请求以事务的形式广播给所有 Follower。提交成功后，数据的写操作才会生效。

ZAB 核心机制：

- Leader 选举：通过投票机制选出一个 Leader，Leader 负责处理所有写请求并广播事务。
- 事务日志同步：Follower 在崩溃恢复阶段从 Leader 同步缺失的事务日志。
- Quorum：ZAB 使用多数派（Quorum）机制，确保写操作被超过半数节点确认后才提交。

### ZAB Leader 选举

在 Zookeeper 的 ZAB 协议中，Leader 选举是整个协议的核心组件之一。它在集群首次启动或现有 Leader 宕机时被触发，通过广播投票机制选出一个 Leader，确保分布式系统的一致性。

Leader 选举过程：

1. 节点初始化：所有节点的状态被设置为 LOOKING，表示正在寻找 Leader。
2. 广播投票：每个节点将自己的投票广播给其他节点。
3. 投票比较：节点根据收到的投票，比较优先级并更新自己的投票。
4. Quorum 判断：当某个候选节点获得 Quorum（多数派）支持时，该节点成为 Leader。
5. 角色切换：胜出的节点切换为 LEADING 状态，其他节点切换为 FOLLOWING 或 OBSERVING 状态。

QuorumPeer 是 Zookeeper 中的核心类，负责管理节点的状态以及 Leader 选举的入口。

```java
public class QuorumPeer extends Thread {
    private ServerState state = ServerState.LOOKING; // 初始状态为 LOOKING
    private QuorumCnxManager manager; // 负责网络通信
    private FastLeaderElection electionAlg; // 选举算法

    public void run() {
        while (true) {
            switch (state) {
                case LOOKING:
                    // 进入 Leader 选举
                    try {
                        leader = electionAlg.lookForLeader();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    break;
                case LEADING:
                    // 当前节点为 Leader，开始处理事务
                    leader.lead();
                    break;
                case FOLLOWING:
                    // 当前节点为 Follower，开始同步状态
                    follower.followLeader();
                    break;
            }
        }
    }
}
```

FastLeaderElection 是 Zookeeper 中的快速选举算法实现。

```java
public class FastLeaderElection implements Election {
    private QuorumPeer self; // 当前节点
    private Messenger messenger; // 负责接收和发送投票消息

    public Vote lookForLeader() throws InterruptedException {
        Map<Long, Vote> votes = new HashMap<>(); // 存储收到的投票
        Vote currentVote = self.getCurrentVote(); // 初始化投票为当前节点

        while (self.getPeerState() == ServerState.LOOKING) {
            sendNotifications(); // 广播投票给其他节点

            Notification n = messenger.pollNotification(); // 接收投票
            if (n != null) {
                if (isValidVote(n)) {
                    updateVote(n); // 根据优先级更新自己的投票
                }

                // 检查是否达成 Quorum
                if (hasQuorum(votes)) {
                    self.setPeerState(ServerState.LEADING); // 成为 Leader
                    return currentVote;
                }
            }
        }
        return null;
    }

    private void sendNotifications() {
        for (QuorumServer server : self.getVotingView().values()) {
            // 创建投票通知
            Notification n = new Notification();
            n.leader = self.getCurrentVote().getLeader();
            n.zxid = self.getCurrentVote().getZxid();
            n.epoch = self.getCurrentVote().getEpoch();
            n.state = self.getPeerState();
    
            // 广播投票
            messenger.queueNotification(n);
        }
    }

    private boolean hasQuorum(Map<Long, Vote> votes) {
        Map<Long, Integer> voteCounts = new HashMap<>();
        for (Vote vote : votes.values()) {
            long leader = vote.getLeader();
            voteCounts.put(leader, voteCounts.getOrDefault(leader, 0) + 1);
        }
    
        // 检查是否有某个节点获得 Quorum 支持
        for (Map.Entry<Long, Integer> entry : voteCounts.entrySet()) {
            if (entry.getValue() >= quorumSize) {
                return true;
            }
        }
        return false;
    }

    private void updateVote(Notification n) {
        // 比较投票优先级，并决定是否更新当前投票
        if (compareVotes(n, currentVote) > 0) {
            currentVote = new Vote(n.getLeaderId(), n.getEpoch());
        }
    }
}
```

compareVotes 比较投票优先级，并决定是否更新当前投票

```java
private int compareVotes(Vote v1, Vote v2) {
    // Epoch（时代）优先级最高，代表事务日志的最新状态。
    if (v1.getEpoch() > v2.getEpoch()) {
        return 1;
    } else if (v1.getEpoch() < v2.getEpoch()) {
        return -1;
    } else {
        // 如果 Epoch 相同，比较事务 ID。
        if (v1.getZxid() > v2.getZxid()) {
            return 1;
        } else if (v1.getZxid() < v2.getZxid()) {
            return -1;
        } else {
            // 如果 Zxid 相同，选择节点 ID 较大的节点。
            return Long.compare(v1.getLeaderId(), v2.getLeaderId());
        }
    }
}
```
