# Memento Pattern

Memento Pattern 提供了一种保存对象状态的机制, 以便在适当的时候恢复对象.

Memento Pattern 的角色

- Originator: 负责创建一个 Memento, 用以记录当前时刻自身的内部状态, 并可使用 Memento 恢复到某一时刻的状态.
- Memento: 负责存储 Originator 对象某一时刻的内部状态.
- Caretaker: 负责保存好备忘录 Memento, 不能对备忘录的内容进行操作或检查.

这里 Document 就是 Originator, Backup 就是 Memento, History 就是 Caretaker. Document 通过 save() 保存 Document 某一时刻的状态, 即封装成 Backup Object, 通过 undo() 恢复到某一时刻的状态. History 维护一个 BackupStack 来存储 Backup, 后续就可以操作 BackupStack 来灵活的切换 Document 状态.

```java
public class Main {
    public static void main(String[] args) {
        History history = new History();
        Document document = new Document();
        
        document.modify("point 1");
        history.saveVersion(document.save());
        
        document.modify("point 2");
        history.saveVersion(document.save());
        
        document.modify("point 3");
        history.saveVersion(document.save());
        
        document.undo(history.getLastVersion());
        document.print(); // point 3
        
        document.undo(history.getLastVersion());
        document.print(); // point 2
        
        document.undo(history.getLastVersion());
        document.print(); // point 1
    }
}

class Document {
    private String content;
    
    public Backup save() {
        return new Backup(content);
    }
    
    public void modify(String content) {
        this.content = content;
    }
    
    public void undo(Backup backup) {
        this.content = backup.getContent();
    }
    
    public void print() {
        System.out.println(content);
    }
}

class Backup {
    private String content;
    
    public Backup(String content) {
        this.content = content;
    }
    
    public String getContent() {
        return content;
    }
}

class History {
    private Stack<Backup> backupStack = new Stack<>();
    
    public void saveVersion(Backup backup) {
        backupStack.push(backup);
    }
    
    public Backup getLastVersion() {
        return backupStack.pop();
    }
}
```

Memento Pattern 可以在不破坏封装性的前提下, 捕获一个对象的内部状态, 并在该对象之外保存这个状态, 便于后续恢复, 帮助我们避免存储大量的历史信息, 节省存储空间.

Memento Pattern 的应用场景

- Version Management: 需要保存对象的多个历史状态时, 例如, 文本编辑器的撤销功能, 这时可以使用一个栈或队列来保存多个备忘录.
- Persistence: 关闭程序后依然需要保留对象状态时, 我们可以将备忘录持久化, 存储到数据库中.
- Distributed System: 需要在不同的节点上保存和恢复对象的状态时, 可以使用备忘录来同步.

# Black Box Mode

Black Box Mode 中, Caretaker 只可见 Memento 的 Narrow Interface, 只能传递 Memento Object. Originator 可见 Wide Interface, 允许访问返回到先前状态所需的所有数据.

这里 History 只可见 Backup 的 Narrow Interface, 不能访问到 Backup Object 的内部信息, 只能简单传递 Backup Object. Document 可见 Backup 的 Wide Interface, 允许访问 Backup 的 content 来恢复数据.

```java
interface Memento {}

class Backup implement Memento {
    private String content;
}

class History {
    private Stack<Memento> backupStack = new Stack<>();
}
```

# White Box Mode

White Box Mode 中, Caretaker 通过 Memento Object 可以访问 Originator Object 的内部信息, 破坏封装性了.

这里 History 可见 Backup 的 Wide Interface, 可以访问到 Backup Object 的内部信息, 从而访问到 Document 的 content.

```java
class Backup {
    private String content;
}

class History {
    private Stack<Backup> backupStack = new Stack<>();
}
```
