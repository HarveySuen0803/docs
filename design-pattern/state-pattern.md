# State Pattern

```java
public class Main {
    public static void main(String[] args) {
        new Context(new PositiveState()).work();
        new Context(new PessimisticState()).work();
    }
}

abstract class State {
    abstract void work();
}

class PositiveState extends State {
    @Override
    void work() {
        System.out.println("positive work");
    }
}

class PessimisticState extends State {
    @Override
    void work() {
        System.out.println("pessimistic work");
    }
}

class Context {
    private State state;
    
    public Context(State state) {
        this.state = state;
    }
    
    public void work() {
        state.work();
    }
}
```

