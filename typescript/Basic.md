# Install TypeScript

Install TypeScript.

```shell
npm install --global typescript
```

Check TypeScript version.

```shell
tsc -v
```

Create TypeScript config file.

```shell
tsc --init
```

Install ts-node.

```shell
npm install --global ts-node
```

Compile and run TS File through ts-node. The ts-node compiles TS File to JS File and runs JS File through Node.

```shell
ts-node app.ts
```

# Normal Type

```ts
let v1: number = 0
let v2: string = ''
let v3: boolean = true
let v4: null = null
let v5: undefined = undefined
let v6: symbol = Symbol()
let v7: number[] = [0, 0, 0]
let v8: [number, number] = [0, 0]
let v9: (number | string)[] = [0, 0, '']
```

# Function Type

```ts
function add(num1: number, num2: number): number {
    return num1 + num2
}

let add = (num1: number, num2: number):number => {
    return num1 + num2
}
```

# Type Alias

```ts
type customType = (number | string)[];
let v1: customType = [0, 0, ''];

type F1 = (msg: string) => void;
let f1: F1 = (msg: string) => {
    console.log(msg);
}

type User = {
    name: string,
    age: number,
    show(msg: string): void
}

let user: User = {
    name: 'harvey',
    age: 18,
    show() {
        console.log('hello world');
    }
}
```

# Optional Parameter

```ts
function f1(num1?: number, num2?:number): void {
    console.log('hello world');
}

f1();
f1(10);
f1(10, 20);
```

# Object Type

```ts
let user: {uname: string; age: number; show(msg: string): void} = {
    uname: 'jack',
    age: 19,
    show(msg) {}
}
```

# Type Assert

Type Assert is similar to Type Cast.

Here, HTMLAnchorElement is the HTMLElement's sub class, while document.getElementById() can only get the HTMLElement class, and Transform Downward is required to access the HTMLAnchorElement member.

```ts
let link = document.getElementById('link') as HTMLAnchorElement;
```

# Literal Type

Any literal can be used as a type.

```ts
let str: 'hello' = 'hello';
let str: 'hello' = 'world'; // error
let age: 18 = 18;
let age: 18 = 19; // error
```

Constraint a list of selected values by literal type.

```ts
function changeDirection(direction: 'up' | 'down' | 'left' | 'right') {
    console.log(direction);
}

changeDirection('up');
changeDirection('hello'); // error
```

# Any Type

```ts
let obj: any = {};
```

# typeof

typeof can be used to get the type of a specified field.

```ts
let user = { uname: 'harvey', age: 18 };

let uname: typeof user.uname = 'harvey';
let age: typeof user.age = 18;
function show(param: typeof user) { console.log(param); }
```

# Type Compatibility

TypeScript used STS (Structural Type System) to deal Type.

Here Point3D contains the Point2D structure, in the Structural Type System, it is considered Point3D compatible Point2D.

```ts
class Point2D { x: number; y: number }
class Point3D { x: number; y: number; z: number }
const p1: Point2D = new Point2D();
const p2: Point2D = new Point3D();
const p3: Point3D = new Point2D(); // error
```

Here F has 2 parameters, so it is compatible to pass one parameter and two parameters, but not compatible with passing three parameters.

```ts
type F = (p1: number, p2:number) => void;
let f1: F = () => {}
let f2: F = (p1) => {}
let f3: F = (p1, p2) => {}
let f4: F = (p1, p2, p3) => {} // error
```

Here F2 can accept Point3D, and Point3D is compatible with Point2D, so F2 can also accept Point2D.

```ts
class Point2D { x: number; y: number }
class Point3D { x: number; y: number; z: number }
type F1 = (p: Point2D) => void;
type F2 = (p: Point3D) => void;
let f1: F1;
let f2: F2;

f1 = (p: Point2D) => {}
f1 = (p: Point3D) => {} //error
f2 = (p: Point2D) => {}
f2 = (p: Point3D) => {}
```

Here F1 only needs one return value, and passing more than a few has no effect. F2 needs two return values, and if passing less, it will report an error.

```ts
type F1 = () => { p1: number }
type F2 = () => { p1: number; p2: number }

let f1: F1;
let f2: F2;

f1 = () => {
    return { p1: 10 };
}

f1 = () => {
    return { p1: 10, p2: 20 }
}

f2 = () => {
    return { p1: 10 }; // error
}

f2 = () => {
    return { p1: 10, p2: 20 };
}
```

# Cross Type

```ts
interface Person { name: string }
interface Contact { phone: string }
type PersonDetail = Person & Contact;

let obj: PersonDetail = {
    name: 'harvey',
    phone: '110'
}
```

```ts
interface A {
    fn: (val: string) => void
}
interface B {
    fn: (val: number) => void
}
type C = A & B;

// Like overload
let c: C = {
    fn(val: number | string) {}
}
```

# Index Signature

```ts
interface AnyObject<T> {
    [key: string]: T
}

let obj: AnyObject<string> = {
    key1: 'value1',
    key2: 'value2',
    key3: 'value3'
}

interface AnyArray<T> {
    [index: number]: T
}

let arr: AnyArray<string> = {
    1: 'a',
    2: 'b',
    3: 'c'
}
```

# keyof

`keyof` can accept an object type and convert all the keys of an object into a unified type.

```ts
type Direction = {
    'up': string,
    'down': string,
    'left': string,
    'right': string
}

type D = keyof Direction; // 'up' | 'down' | 'left' | 'right'

// Similar to this
type D = 'up' | 'down' | 'left' | 'right';
```

The value that can be obtained from the object key by using `keyof`.

```ts
function getProp<O, K extends keyof O>(obj: O, key: K) {
    return obj[key];
}

let obj = { name: 'harvey', age: 18 }

let age = getProp(obj, 'age'); // 18
```

# Mapping Type

```ts
type Keys = 'a' | 'b' | 'c';
type Type = { [Key in Keys]: number };

// Similar to this
type Type = { a: number; b: number; c: number }
```

```ts
type Props = { a: number; b: string; c: boolean }
type Type = { [Key in keyof Props]: string }

// Similar to this
type Type = { [Key in 'a' | 'b' | 'c']: string }
// Similar to this
type Type = { a: string; b: string; c: stirng }
```

# Index Type

```ts
type Props = {
    a: number,
    b: string,
    c: boolean
}

type TypeA = Props['a']; // number
type TypeAB = Props['a' | 'b']; // number | string
type TypeABC = Props[keyof Props]; // number | string | boolean
```

# Import Type File

Create a `.d.ts` file to declare types.

```ts
export interface UserType {
  name: string;
  age: number;
}
```

Import `.d.ts` file to use.

```ts
import { UserType } from "./type.d.ts"

let user: UserType = { name: 'harvey', age: 18 }
```

# Global Type File

Create a `types/global.d.ts` file to declare types in the global namespace.

```ts
interface UserType {
  name: string;
  age: number;
}
```

Declare the import. tsconfig.json

```ts
"include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "src/types/**/*.d.ts"],
```

You can use the type directly in the ts file without importing it.

```ts
let user: UserType = { name: 'harvey', age: 18 }
```

# Global Variable

Declare global variables. index.html

```ts
let globalVar = 'hello';
let globalObj = {
  name: 'harvey',
  age: 18,
};
let globalFun = (msg) => {
  console.log(msg);
};
```

Declare the type of global variables in the `.d.ts` file.

```ts
declare var globalVar: string;

type ObjType = { name: string, age: number }
declare var globalObj: ObjType;

declare function globalFun(msg?: string): void;

declare class A {}

declare interface IA {}

declare namespace $ {
  function ajax(): void;
}
```

Access global variables directly in other files.

```ts
console.log(globalVar);
```

