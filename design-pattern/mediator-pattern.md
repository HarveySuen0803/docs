# Mediator Pattern

```java
public class Main {
    public static void main(String[] args) {
        Airplane airplaneA = new Airplane("the message of airplane A");
        Airplane airplaneB = new Airplane("the message of airplane B");
        Airplane airplaneC = new Airplane("the message of airplane C");
        
        ControlCenter controlCenter = new ControlCenter();
        controlCenter.register(airplaneA);
        controlCenter.register(airplaneB);
        controlCenter.register(airplaneC);
        
        controlCenter.fanout(airplaneA);
    }
}

interface Mediator {
    void fanout(Airplane airplane);
    void register(Airplane airplane);
}

class Airplane {
    private String message;
    
    public Airplane(String message) {
        this.message = message;
    }
    
    public void receive(String message) {
        System.out.println(this + " receive " + message);
    }
    
    public String getMessage() {
        return message;
    }
}

class ControlCenter implements Mediator {
    private List<Airplane> airplaneList = new ArrayList<>();
    
    @Override
    public void register(Airplane airplane) {
        airplaneList.add(airplane);
    }
    
    @Override
    public void fanout(Airplane sender) {
        for (Airplane receiver : airplaneList) {
            if (receiver == sender) {
                continue;
            }
            receiver.receive(sender.getMessage());
        }
    }
}
```

