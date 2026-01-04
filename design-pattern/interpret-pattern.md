# Interpret Pattern

Interpret Pattern 用于实现一个解释器, 用于特定的简单语言需求.

Interpret Pattern 只适合简单的文法. 例如, 解析运算表达式, 解析 SQL, 解析 Symbol. 对于复杂的文法, Interpret Pattern 的文法类层次结构将变得很庞大而无法管理, 此时最好的方式是使用语法分析程序生成器.

Interpret Pattern 的 Role

- Abstract Expression: 声明其他 Expression 需要实现的 Method, 主要是一个 interpret().
- Terminal Expression: 最基本的 Expression, 它代表了语言中的一个元素, 例如一个变量或一个常数.
- NonTerminal Expression: 通常代表了语言中的运算符或其他关键字, 使用一个或多个 Terminal Expression 通过某种规则组合而成的复合表达式. 

这里 Expression 就是 Abstract Expression, NumberExpression 就是 Terminal Expression, AddExpression 就是 NonTerminal Expression. NumberExpression 是最基本的 Expression, AddExpression 是组合了两个 NumberExpression 的复合表达式.

```java
public class Main {
    public static void main(String[] args) {
        NumberExpression expr1 = new NumberExpression(10);
        NumberExpression expr2 = new NumberExpression(20);
        AddExpression expr3 = new AddExpression(expr1, expr2);
        System.out.println(expr3.interpret()); // 30
    }
}

interface Expression {
    Integer interpret();
}

class NumberExpression implements Expression {
    private Integer number;

    public NumberExpression(Integer number) {
        this.number = number;
    }

    @Override
    public Integer interpret() {
        return number;
    }
}

class AddExpression implements Expression {
    private Expression expr1;
    private Expression expr2;
    
    public AddExpression(Expression expr1, Expression expr2) {
        this.expr1 = expr1;
        this.expr2 = expr2;
    }
    
    @Override
    public Integer interpret() {
        return expr1.interpret() + expr2.interpret();
    }
}
```

Context 含有解释器之外的一些全局信息, 通常用于存储和访问文法中各个 Expression 所需要的属性值. 

这里 x 和 y 的映射作为环境变量, 存储到 Context 中, Expression 就可以从 Context 中获取需要的数据

```java
public class Main {
    public static void main(String[] args) {
        Context context = new Context();
        context.set("x", 10);
        context.set("y", 20);
        
        VariableExpression expr1 = new VariableExpression("x");
        VariableExpression expr2 = new VariableExpression("y");
        AddExpression expr3 = new AddExpression(expr1, expr2);
        
        System.out.println(expr3.interpret(context)); // 30
    }
}

class Context {
    private Map<String, Integer> map = new HashMap<>();
    
    public void set(String key, Integer value) {
        map.put(key, value);
    }
    
    public Integer get(String key) {
        return map.get(key);
    }
}

interface Expression {
    Integer interpret(Context context);
}

class VariableExpression implements Expression {
    private String variableKey;
    
    public VariableExpression(String variableKey) {
        this.variableKey = variableKey;
    }
    
    @Override
    public Integer interpret(Context context) {
        return context.get(variableKey);
    }
}

class AddExpression implements Expression {
    private Expression expr1;
    private Expression expr2;
    
    public AddExpression(Expression expr1, Expression expr2) {
        this.expr1 = expr1;
        this.expr2 = expr2;
    }
    
    @Override
    public Integer interpret(Context context) {
        return expr1.interpret(context) + expr2.interpret(context);
    }
}
```
