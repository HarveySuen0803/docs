# Class

```java
class Animal {
    public name: string;
    public age: number;
    
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
    
    protected show(msg: string) {
        console.log(msg);
    }
}

class Dog extends Animal {
    private sex: string;
    // Readonly field, only modifiable in the constructor, type must be specified
    readonly tenent: string;

    constructor(name: string, age: number, sex: string, tenent: string) {
        super(name, age);
        this.sex = sex;
        this.tenent = tenent;
    }
    
    public sleep() {
        console.log('Dog is sleeping');
    }
}
```

# Interface

```ts
interface Moveable {
    move(): void;
}

interface Runable extends Moveable {
    run(): void;    
}

class Dog implements Runable {
    name: string;
    age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    move(): void {
        console.log('Dog is moving');
    }
    
    run(): void {
        console.log("Dog is running");
    }
    
    show(msg: string) {
        console.log(msg);
    }
}
```

# Enum

```ts
enum Direction {
    UP,
    DOWN,
    RIGHT,
    LEFT
}

enum Status {
    ENABLE = 'enable',
    DISABLE = 'disable'
}

function changeDirection(direction: Direction, status: Status) {
    console.log(direction, status);
}

changeDirection(Direction.UP, Status.ENABLE)
```

# Generic

```ts
function fn<T>(val: T): T {
    return val;
}

const num = fn<number>(10); // number
const str = fn<string>('hello'); // string
// Omit type by Type Inference Mechanism
const num = fn(10); // number
const str = fn('hello'); // string
```

```java
interface IA<T> {
    show: (val: T) => void;
}

class A<T> implements IA<T> {
    public show(val: T): void {
        console.log(val);
    }
}

let a = new A<string>();
a.show('hello world');
```

```ts
interface ILength {
    length: number
}

function fn<T extends ILength>(val: T): void {
    console.log(val.length);
}

fn('abc'); // 3
fn(['a', 'b', 'c', 'd']); // 4
fn(123); // error, Must have length attribute
```

# Generic Utils

## Partial

Use Partial to make all the fields in Props optional.

```ts
interface Props {
    col1: string,
    col2: string
}

type PartialProps = Partial<Props>;
```

Similar to this.

```ts
interface PartialProps {
    col1?: string,
    col2?: string
}
```

## Readonly

Use Readonly to make all the fields in Props readonly.

```ts
interface Props {
    col1: string,
    col2: string
}

type ReadonlyProps = Readonly<Props>;
```

Similar to this.

```ts
interface ReadonlyProps {
    readonly col1: string,
    readonly col2: string
}
```

## Pick

Use Pick to select Col1 Field and Col2 Field of Props as the new Type.

```ts
interface Props {
    col1: string,
    col2: string,
    col3: string    
}

type PickProps = Pick<Props, 'col1' | 'col2'>
```

Similar to this.

```ts
interface PickProps {
    col1: string,
    col2: string  
}
```

## Record

Create object type with Record

```ts
type RecordType = Record<'col1' | 'col2' | 'col3', string>;

let obj: RecordType = {
    col1: 'aaa',
    col2: 'bbb',
    col3: 'ccc'
}
```

Similar to this.

```ts
type RecordType = {
    col1: string,
    col2: string,
    col3: string
}
```
