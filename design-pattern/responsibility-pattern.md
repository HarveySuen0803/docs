# Chain of Responsibility Pattern

Leader 和 Boss 都继承 Handler, 再组合一个逻辑上的上下级关系, Leader 先处理任务, 如果处理不了, 再让 Handle 处理任务

```java
public class Main {
    public static void main(String[] args) {
        Leader leader = new Leader();
        Boss boss = new Boss();
        leader.setNextHandler(boss);
        
        leader.process("vacation"); // leader handle
        leader.process("departure"); // boss handle
    }
}

abstract class Handler {
    protected Handler nextHandler;
    
    public void setNextHandler(Handler nextHandler) {
        this.nextHandler = nextHandler;
    }
    
    public abstract void process(String info);
}

class Leader extends Handler {
    @Override
    public void process(String info) {
        if (info.equals("vacation")) {
            System.out.println("leader handle");
        } else {
            nextHandler.process(info);
        }
    }
}

class Boss extends Handler {
    @Override
    public void process(String info) {
        System.out.println("boss handle");
    }
}
```

