# Command Pattern

通过 Command Pattern 实现分层, decoupling

```java
public class Main {
    public static void main(String[] args) {
        SaveButton saveButton = new SaveButton();
        saveButton.setCommand(new PrintCommand());
        saveButton.execute();
    }
}

class SaveButton {
    private Command command;
    
    public void setCommand(Command command) {
        this.command = command;
    }
    
    public void execute() {
        command.execute();
    }
}

interface Command {
    void execute();
}

class PrintCommand implements Command {
    private PrintService printService = new PrintService();
    
    @Override
    public void execute() {
        printService.print();
    }
}

class PrintService {
    public void print() {
        System.out.println("hello world");
    }
}
```

