# Type Object Pattern

Type Object Pattern 是一种用于解决对象元数据（如类型信息）管理的问题。简单来说，它将对象的类型信息抽象为独立的类，以便更灵活地处理不同类型的对象，尤其是在运行时能够动态地定义和管理类型。

以下是一个使用 Type Object 设计模式的 Java 示例，展示如何定义和管理不同类型的游戏角色（比如战士、法师、弓箭手等）：

```java
// Type class representing different character types
class CharacterType {
    private String name;
    private int baseHealth;
    private int baseMagic;
    
    public CharacterType(String name, int baseHealth, int baseMagic) {
        this.name = name;
        this.baseHealth = baseHealth;
        this.baseMagic = baseMagic;
    }

    public String getName() {
        return name;
    }

    public int getBaseHealth() {
        return baseHealth;
    }

    public int getBaseMagic() {
        return baseMagic;
    }
}

// Character class using CharacterType
class Character {
    private String name;
    private CharacterType type;
    private int level;
    private int health;
    private int magic;
    
    public Character(String name, CharacterType type, int level) {
        this.name = name;
        this.type = type;
        this.level = level;
        this.health = type.getBaseHealth() * level;
        this.magic = type.getBaseMagic() * level;
    }
    
    public void printCharacterInfo() {
        System.out.println("Character: " + name);
        System.out.println("Type: " + type.getName());
        System.out.println("Level: " + level);
        System.out.println("Health: " + health);
        System.out.println("Magic: " + magic);
    }
}

public class TypeObjectPatternExample {
    public static void main(String[] args) {
        // Define different character types
        CharacterType warrior = new CharacterType("Warrior", 100, 30);
        CharacterType mage = new CharacterType("Mage", 50, 100);
        CharacterType archer = new CharacterType("Archer", 70, 50);
        
        // Create characters of different types
        Character character1 = new Character("Aragon", warrior, 5);
        Character character2 = new Character("Gandalf", mage, 7);
        Character character3 = new Character("Legolas", archer, 4);
        
        // Print character information
        character1.printCharacterInfo();
        System.out.println();
        character2.printCharacterInfo();
        System.out.println();
        character3.printCharacterInfo();
    }
}
```

- CharacterType 定义了角色类型的信息，包括类型名称、基础生命值和基础魔法值。这些信息是所有特定类型角色的共同属性。
- Character 表示具体的角色对象。通过 ﻿CharacterType 对象，它可以灵活地使用不同的角色类型信息。在创建角色时，通过其类型对象来初始化角色的属性（如生命值和魔法值）。
- TypeObjectPatternExample 展示了如何定义多个角色类型（战士、法师和弓箭手），并创建不同类型的角色对象。最后，打印出每个角色的信息。

这种设计模式特别适合于对对象类型有动态需求的系统，如游戏开发中的角色类型管理、插件系统等。

- 灵活性：动态地定义和管理对象类型。可以在运行时添加新的类型而不需修改现有的类。
- 代码复用：不同类型的对象共享相同的属性和行为实现，减少了重复代码。
- 扩展性：方便地添加新类型和新属性，而不影响现有系统。