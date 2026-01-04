# Visitor Pattern

```java
public class Main {
    public static void main(String[] args) {
        Circle circle = new Circle();
        Rectangle rectangle = new Rectangle();
        
        DrawVisitor drawVisitor = new DrawVisitor();
        ResizeVisitor resizeVisitor = new ResizeVisitor();
        
        circle.accept(drawVisitor); // draw a circle
        circle.accept(resizeVisitor); // resize a circle
        rectangle.accept(drawVisitor); // draw a rectangle
        rectangle.accept(resizeVisitor); // resize a rectangle
    }
}

interface Shape {
    void accept(Visitor visitor);
}

class Circle implements Shape {
    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }
}

class Rectangle implements Shape {
    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }
}

interface Visitor {
    void visit(Circle circle);
    void visit(Rectangle rectangle);
}

class DrawVisitor implements Visitor {
    @Override
    public void visit(Circle circle) {
        System.out.println("draw a circle");
    }
    
    @Override
    public void visit(Rectangle rectangle) {
        System.out.println("draw a rectangle");
    }
}

class ResizeVisitor implements Visitor {
    @Override
    public void visit(Circle circle) {
        System.out.println("resize a circle");
    }
    
    @Override
    public void visit(Rectangle rectangle) {
        System.out.println("resize a rectangle");
    }
}
```

