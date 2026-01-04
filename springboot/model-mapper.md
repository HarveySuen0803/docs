# Overview

The main role of ModelMapper is to map objects by determining how one object model is mapped to another called a Data Transformation Object (DTO).

In order to use ModelMapper, we start by adding the dependency to our pom.xml:

```xml
<dependency> 
    <groupId>org.modelmapper</groupId>
    <artifactId>modelmapper</artifactId>
  <version>3.2.0</version>
</dependency>
```

# Default Configuration

ModelMapper provides a drop-in solution when our source and destination objects are similar to each other.

Let’s have a look at Game and GameDTO, our domain object and corresponding data transfer object, respectively:

```java
public class Game {

    private Long id;
    private String name;
    private Long timestamp;

    private Player creator;
    private List<Player> players = new ArrayList<>();

    private GameSettings settings;

    // constructors, getters and setters
}

public class GameDTO {

    private Long id;
    private String name;

    // constructors, getters and setters
}
```

GameDTO contains only two fields, but the field types and names perfectly match the source.

In such a case, ModelMapper handles the conversion without additional configuration:

```java
@BeforeEach
public void setup() {
    this.mapper = new ModelMapper();
}

@Test
public void whenMapGameWithExactMatch_thenConvertsToDTO() {
    // when similar source object is provided
    Game game = new Game(1L, "Game 1");
    GameDTO gameDTO = this.mapper.map(game, GameDTO.class);
    
    // then it maps by default
    assertEquals(game.getId(), gameDTO.getId());
    assertEquals(game.getName(), gameDTO.getName());
}
```

# What Is Property Mapping in ModelMapper?

In our projects, most of the time, we need to customize our DTOs. Of course, this will result in different fields, hierarchies and their irregular mappings to each other. Sometimes, we also need more than one DTO for a single source and vice versa.

Therefore, property mapping gives us a powerful way to extend our mapping logic.

Let’s customize our GameDTO by adding a new field, creationTime:

```java
public class GameDTO {

    private Long id;
    private String name;
    private Long creationTime;

    // constructors, getters and setters
}
```

And we’ll map Game‘s timestamp field into GameDTO‘s creationTime field. Notice that the source field name is different from the destination field name this time.

To define property mappings, we’ll use ModelMapper’s TypeMap.

So, let’s create a TypeMap object and add a property mapping via its addMapping method:

```java
@Test
public void whenMapGameWithBasicPropertyMapping_thenConvertsToDTO() {
    // setup
    TypeMap<Game, GameDTO> propertyMapper = this.mapper.createTypeMap(Game.class, GameDTO.class);
    propertyMapper.addMapping(Game::getTimestamp, GameDTO::setCreationTime);
    
    // when field names are different
    Game game = new Game(1L, "Game 1");
    game.setTimestamp(Instant.now().getEpochSecond());
    GameDTO gameDTO = this.mapper.map(game, GameDTO.class);
    
    // then it maps via property mapper
    assertEquals(game.getId(), gameDTO.getId());
    assertEquals(game.getName(), gameDTO.getName());
    assertEquals(game.getTimestamp(), gameDTO.getCreationTime());
}
```

# Deep Mappings

There are also different ways of mapping. For instance, ModelMapper can map hierarchies — fields at different levels can be mapped deeply.

Let’s define a String field named creator in GameDTO.

However, the source creator field on the Game domain isn’t a simple type but an object — Player:

```java
public class Player {

    private Long id;
    private String name;
    
    // constructors, getters and setters
}

public class Game {
    // ...
    
    private Player creator;
    
    // ...
}

public class GameDTO {
    // ...
    
    private String creator;
    
    // ...
}
```

So, we won’t transfer the entire Player object’s data but only the name field, to GameDTO.

In order to define the deep mapping, we use TypeMap‘s addMappings method and add an ExpressionMap:

```java
@Test
public void whenMapGameWithDeepMapping_thenConvertsToDTO() {
    // setup
    TypeMap<Game, GameDTO> propertyMapper = this.mapper.createTypeMap(Game.class, GameDTO.class);
    // add deep mapping to flatten source's Player object into a single field in destination
    propertyMapper.addMappings(
      mapper -> mapper.map(src -> src.getCreator().getName(), GameDTO::setCreator)
    );
    
    // when map between different hierarchies
    Game game = new Game(1L, "Game 1");
    game.setCreator(new Player(1L, "John"));
    GameDTO gameDTO = this.mapper.map(game, GameDTO.class);
    
    // then
    assertEquals(game.getCreator().getName(), gameDTO.getCreator());
}
```

# Skipping Properties

Sometimes, we don’t want to expose all the data in our DTOs. Whether to keep our DTOs lighter or conceal some sensible data, those reasons can cause us to exclude some fields when we’re transferring to DTOs.

Luckily, ModelMapper supports property exclusion via skipping.

Let’s exclude the id field from transferring with the help of the skip method:

```java
@Test
public void whenMapGameWithSkipIdProperty_thenConvertsToDTO() {
    // setup
    TypeMap<Game, GameDTO> propertyMapper = this.mapper.createTypeMap(Game.class, GameDTO.class);
    propertyMapper.addMappings(mapper -> mapper.skip(GameDTO::setId));
    
    // when id is skipped
    Game game = new Game(1L, "Game 1");
    GameDTO gameDTO = this.mapper.map(game, GameDTO.class);
    
    // then destination id is null
    assertNull(gameDTO.getId());
    assertEquals(game.getName(), gameDTO.getName());
}
```

Therefore, the id field of GameDTO is skipped and not set.

# Converter

Another provision of ModelMapper is Converter. We can customize conversions for specific sources to destination mappings.

Suppose we have a collection of Players in the Game domain. Let’s transfer the count of Players to GameDTO.

As a first step, we define an integer field, totalPlayers, in GameDTO:

```java
public class GameDTO {
    // ...

    private int totalPlayers;
  
    // constructors, getters and setters
}
```

Respectively, we create the collectionToSize Converter:

```java
Converter<Collection, Integer> collectionToSize = c -> c.getSource().size();
```

Finally, we register our Converter via the using method while we’re adding our ExpressionMap:

```java
propertyMapper.addMappings(
  mapper -> mapper.using(collectionToSize).map(Game::getPlayers, GameDTO::setTotalPlayers)
);
```

As a result, we map Game‘s getPlayers().size() to GameDTO‘s totalPlayers field:

```java
@Test
public void whenMapGameWithCustomConverter_thenConvertsToDTO() {
    // setup
    TypeMap<Game, GameDTO> propertyMapper = this.mapper.createTypeMap(Game.class, GameDTO.class);
    Converter<Collection, Integer> collectionToSize = c -> c.getSource().size();
    propertyMapper.addMappings(
        mapper -> {
            mapper.using(collectionToSize).map(Game::getPlayers, GameDTO::setTotalPlayers);
            mapper.map(Game::getId, GameDTO::setId);
        }
    );
    
    // when collection to size converter is provided
    Game game = new Game();
    game.setId(1L);
    game.addPlayer(new Player(1L, "John"));
    game.addPlayer(new Player(2L, "Bob"));
    GameDTO gameDTO = this.mapper.map(game, GameDTO.class);
    
    // then it maps the size to a custom field
    assertEquals(2, gameDTO.getTotalPlayers());
}
```

# Reference

ModelMapper Guide

- https://www.baeldung.com/java-modelmapper
- https://www.baeldung.com/java-modelmapper-lists