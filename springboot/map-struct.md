# Overview

MapStruct is a simple Java Bean mapper. This API contains functions that automatically map between two Java Beans. With MapStruct, we only need to create the interface, and the library will automatically create a concrete implementation during compile time.

For most applications, you’ll notice a lot of boilerplate code converting POJOs to other POJOs.

For example, a common type of conversion happens between persistence-backed entities and DTOs that go out to the client-side.

So, that is the problem that MapStruct solves: Manually creating bean mappers is time-consuming. But the library can generate bean mapper classes automatically.

Let’s add the below dependency into our Maven pom.xml:

```xml
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
</dependency>
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct-processor</artifactId>
    <version>1.5.5.Final</version>
    <scope>provided</scope>
</dependency>
```

# Basic Mapping

Let’s first create a simple Java POJO:

```java
public class SimpleSource {
    private String name;
    private String description;
    // getters and setters
}
 
public class SimpleDestination {
    private String name;
    private String description;
    // getters and settersThe Mapper Interface
}
```

Create the Mapper Interface:

```java
@Mapper
public interface SimpleSourceDestinationMapper {
    SimpleDestination sourceToDestination(SimpleSource source);
    
    SimpleSource destinationToSource(SimpleDestination destination);
}
```

Directly call the methods of SimpleSourceDestinationMapper for Basic Mapping:

```java
SimpleSource simpleSource = new SimpleSource;
simpleSource.setName("harvey");
simpleSource.setDescription("harvey's description");

SimpleDestination simpleDestination = simpleSourceDestinationMapper.sourceToDestination(simpleSource);
```

# The New Mapper

Notice we did not create an implementation class for our SimpleSourceDestinationMapper — because MapStruct creates it for us.

We can trigger the MapStruct processing by executing an mvn clean install.

This will generate the implementation class under /target/generated-sources/annotations/.

Here is the class that MapStruct auto-creates for us:

```java
public class SimpleSourceDestinationMapperImpl
  implements SimpleSourceDestinationMapper {
    @Override
    public SimpleDestination sourceToDestination(SimpleSource source) {
        if ( source == null ) {
            return null;
        }
        SimpleDestination simpleDestination = new SimpleDestination();
        simpleDestination.setName( source.getName() );
        simpleDestination.setDescription( source.getDescription() );
        return simpleDestination;
    }
    @Override
    public SimpleSource destinationToSource(SimpleDestination destination){
        if ( destination == null ) {
            return null;
        }
        SimpleSource simpleSource = new SimpleSource();
        simpleSource.setName( destination.getName() );
        simpleSource.setDescription( destination.getDescription() );
        return simpleSource;
    }
}
```

# Reference

MapStruct

- https://www.baeldung.com/mapstruct