# input

```js
let content = prompt("input: ");
```

# typeof

```js
console.log(typeof 10); // number

console.log(typeof 'sun'); // string

console.log(typeof []); // object

console.log(typeof null); // object
```

# instanceof

```js
console.log([] instanceof Array); // true
```

# for

```javascript
let arr = ["sun", "xue", "cheng"];

for (let key in arr) {
    console.log(key);
}

for (let val of arr) {
    console.log(val);
}
```

# function area

```js
if (true) {
    var num = 10;
}
console.log(10); // 10
```

```js
function fun() {
    // use it directly without declaration, which is equivalent to a global variable
    num = 10;
}
console.log(10); // 10
```

# pre analysis

```js
/*
    pre analysis
        var num;
        console.log(num);
        num = 10;
*/
console.log(num); // undefined; not error
var num = 10;
```

```js
/*
    pre analysis
        function func() {
            console.log(10);
        }
        func();
*/
fun(); // 10
function fun() {
    console.log(10);
}
```

```js
/*
    pre analysis
        var func;
        func(); // error
        var func = function function() {
            console.log(10);
        }
*/
fun(); // error
var func = function fun() {
    console.log(10);
}
```

# type conversion

```js
let num = parseInt(120px); // 120

let b = Boolean("hello"); // true

// "", 0, NaN, null, undefined 的 bool 为 false
let b = Boolean(NaN); // false
```

# &&

```js
console.log(123 && 456); // 456
console.log(0 && 123); // 0

var num = 10;
console.log(1 && 0 && num++); // 0
console.log(num); // 10
```

# || 

```js
console.log(123 || 456); // 123
console.log(0 || 456); // 456

var num = 10;
console.log(1 || 0 || num++); // 1
console.log(num); // 10
```

# function

```js
// normal function
function f() {
    console.log("f()");
}
```

```js
// anonymous function
let f = function () {
    console.log("f()");
};
```

```js
// callback function
function f(callback) {
    callback();
}
f(function () { 
    console.log("hello world");
});
```

```js
// Function constructor
let f = new Function("x", "y", "console.log(x, y)");
console.log(typeof f); // function
f(10, 20);

// access prototype object
console.log(Function.prototype); // ƒ () { [native code] }
console.log(f.__proto__); // ƒ () { [native code] }
```

# arguments

```js
function show() {
    console.log(arguments);
        /*
            Arguments(3)
                0: 1
                1: 2
                2: 3
                callee: ƒ add()
                length: 3
                Symbol(Symbol.iterator): ƒ values()
                [[Prototype]]: Object
         */
    console.log(arguments.length); // 3
    console.log(arguments[2]); // 3
}
show(1, 2, 3);
```

# this

```js
function f() {
    console.log(this); // Window {window: Window …}
}
f();

function P() {
    console.log(this); // P {}
}
new P()
```

```js
let obj = {
    f: function () {
        console.log(this); // {f: ƒ}
        return function () {
            console.log(this); // Window {window: Window …}
        }
    }
}
obj.f()();
```

```js
document.querySelector("btn").onclick = function () {
    console.log(this); // <button>click</button>
};

document.querySelector("btn").onclick = () => {
    console.log(this); // Window {window: Window …}
};
```

```javascript
class Button {
    show() {
        console.log(this); // Button {}

        document.querySelector("#btn").onclick = function () {
            console.log(this); // <button id="btn">Click</button>
        }

        document.querySelector("#btn").onclick = () => {
            console.log(this); // Button {}
        }
    }
}
```

```js
setTimeout(() => {
    console.log(this); // Window {window: Window …}
});

setTimeout(function () {
    console.log(this);
})
```

# change this by call()

```js
function Father(name, age) {
    // this 指向了 Son 的原型对象
    console.log(this); // Son {name: 'sun', age: 18}
    this.name = name;
    this.age = age;
}
function Son(name, age) {
    // 修改 Father() 中 this 的指向为 Son 的实例对象
    Father.call(this, name, age);
}
let son = new Son("sun", 18);
console.log(son); // Son {name: 'sun', age: 18}
```

# change this by apply()

```js
let obj1 = {
    name: "sun"
}
// 接受第二个数组参数, 将其转换成字符串
function fn(age, sex) {
    // 此时的this指向了obj对象
    console.log(this); // {name: 'sun'}
    this.age = age;
    this.sex = sex;
}
// 指定fn中this指向obj1,同时传入参数(要求: 第二个参数必须是 数组/伪数组 的形式)
fn.apply(obj1, [18, "male"]);
console.log(obj1); // {name: 'sun', age: 18, sex: 'male'}

// apply()的应用: 利用apply()借助Math对象求最大值
let arr = [20, 10, 40, 30];
let max = Math.max.apply(Math, arr); // 调用Math的max(),同时指定this指向Math(当然本身就是指向的this),传入arr数组
console.log(max); // 40
```

# change this by bind()

```js
let obj2 = {
    name: "sun"
}
function fn(age, sex) {
    console.log(this);
    this.age = age;
    this.sex = sex;
}
// 通过bind()指定fn()中的this指向obj2, 我们也可以在bind()中传入参数 (比如: fn.bind(obj2, 18, "male"))
let newFn = fn.bind(obj2);
newFn(18, "male");
console.log(obj2);

// bind()的应用1
let btn = document.querySelector("button")
btn.onclick = function () {
    console.log(this); // <button>点我</button>
    this.disabled = true; // 关闭按钮
    setTimeout(function () {
        // setTimeout()中的this本身指向的是window,这里我们可以通过bind()修改this的指向,让其指向btn按钮
        this.disabled = false; // 打开按钮
    }.bind(btn), 1000);
};

// bind()的应用2
let show = function (that) { // 接受bind()中的第二个参数
    console.log(this); // Window {window: Window, self: Window, document: document…}
    console.log(that); // <button>点我</button>
};
// 通过bind()修改show()中this的指向为window,同时传递第二个参数过去
btn.onclick = show.bind(window, btn);
```

# object

```js
let obj = {
    uname: "sun",
    show: function () {
        console.log("name is " + this.uname);
    }
}

console.log(obj) // {uname: 'sun', show: ƒ}

for (let key in obj) {
    console.log(key, obj[key]);
}
```

```javascript
let obj = {}
let name = "name"
let age = "age"

obj[name] = "sun"
obj[age] = 18

console.log(obj) // { name: 'sun', age: 18 }
```

```js
let obj = new Object();
obj.uname = "sun";
obj.show = function () {
    console.log("name is" + obj2.uname);
};
```

```js
function Person(uname) {
    this.uname = uname;

    this.show = function () {
        console.log("name is " + this.uname);
    };
}

let p = new Person("sun");
```

# let

```js
// 变量不能重复声明
let num1 = 10;
let num1 = 20; // error

// 支持块级作用域 (if, else, while, for...)
if (true) {
    let num2 = 20;
}
console.log(num2); // error

// 不存在变量提升
console.log(num3); // error
let num3 = 30;

// 不影响作用域链
{
    let num4 = 40;
    function f1() {
        console.log(num4);
    }
    f1();
}
```

```html
<!--
    let的经典案例: 点击li,输出对应的index
-->
<ul>
    <li>sun</li>
    <li>xue</li>
    <li>cheng</li>
</ul>

<script>
    let lis = document.querySelectorAll("li")

    // 通过var解决,存在很多的问题
    for (var i = 0; i < lis.length; i++) {
        lis[i].index = i;
        lis[i].onclick = function () {
            console.log(this.index);
        };
    }
    console.log(window.i); // 3

    // 通过let解决,很方便
    for (let i = 0; i < lis.length; i++) {
        // 因为let具有块级作用域,所以每个i的值只会在对应的作用域里有效
        lis[i].onclick = function () {
            console.log(i);
        };
    }
</script>
```

# const

```js
// const定义的变量一定要赋初始值,变量名一般为大写(潜规则)
const NAME = "sun";

// 不可以替换变量的地址
// NAME = "xue"; // error

// 支持块级作用域
{
    const AGE = 18;
}

// 可以修改变量的值
const arr = [10, 20, 30];
const p = {
    name: "sun",
    age: 18
}
arr.push(40);
p.sex = "male";

console.log(arr); // (4) [10, 20, 30, 40]
console.log(p); // {name: 'sun', age: 18, sex: 'male'}
```

# Destructuring Assignment

```js
// 数组解构
let arr = ["sun", "xue", "cheng"];
let [str1, str2, str3] = arr;
console.log(str1, str2, str3); // sun xue cheng

// 对象解构
let p = {
    name: "sun",
    age: 18,
    show: function () {
        console.log("name is " + this.name);
    },
    run: function () {
        console.log("i can run");
    }
}
let {name, age, show} = p;
console.log(name, age, show); // sun 18 ƒ () {console.log("name is " + this.name)}

let {run} = p;
run(); // "i can run"
```

# Template String

```js
let name = "harvey";
let str =  `${name} is a master of programming`;
console.log(str);
```

# Simplify Object

```js
let name = "sun";
let show = function () {
    console.log("hello world");
};

let p = {
    // 直接将外面的name和show()拿进来
    name,
    show,
    // 对象中方法的简化写法
    run() {
        console.log("i can run");
    }
}
```

# Arrow Function

```js
// 普通箭头函数的书写
let f1 = () => {
    console.log("这是一个箭头函数");
}
f1();

// 箭头函数的this是静态的(不绑定this),始终指向函数声明所在作用域下的this的值
function Person() {
    this.show1 = function () {
        setTimeout(function () {
            console.log(this); // window
        });
    };
    this.show2 = function () {
        setTimeout(() => {
            console.log(this); // Person {show1: ƒ, show2: ƒ}
        })
    };
}

// 箭头函数不能作为构造函数来实例化对象
let P = (name) => {
    console.log(this); // window
    // this.name = name; // 这是将name添加到window下
};
let p = new P("sun"); // error

// 不能使用arguments
let f2 = () => {
    console.log(arguments); // error
}
f2(10, 20, 30);
```

# Default Value of Param

```js
// 给c赋初始值30,如果add()没有传入参数值,就默认为30,一般将赋初始值的变量靠后写(潜规则)
function add(a, b, c = 30) {
    console.log(a + b + c);
}
add(10, 20); // 60

// 搭配解构使用
function show({host = "127.0.0.1", username, password, port = "8080"}) {
    console.log(host); // localhost
    console.log(username); // sun
    console.log(password); // 123
    console.log(port); // 8080
}
show({
    host: "localhost",
    username: "sun",
    password: "123",
})
```

# Rest Param

```js
// 使用arguments
function f1() {
    console.log(arguments); // Arguments(3) ['sun', 'xue', 'cheng', callee: ƒ, Symbol(Symbol.iterator): ƒ]
}
f1("sun", "xue", "cheng");

// 使用rest参数代替arguments
function f2(...args) {
    console.log(args); // (3) ['sun', 'xue', 'cheng']
}
f2("sun", "xue", "cheng");

// rest参数一般放在最后
function f3(a, b, ...args) {
    console.log(a); // 10
    console.log(b); // 20
    console.log(args); // (4) [30, 40, 50, 60]
}
f3(10, 20, 30, 40, 50, 60);
```

# Extended Operator

实现 Iterator Interface, 就可以使用 Extended Operator

Array, Arguments, Set, Map, String, TypedArray, NodeList 默认实现了 Iterator Interface

```html
<div></div>
<div></div>
<div></div>

<script>
let arr = ["sun", "xue", "cheng"];

// 使用扩展运算符
console.log(...arr); // sun xue cheng

// 使用扩展运算符来拆解数组传参
let f1 = function () {
    console.log(arguments); // Arguments(3) ['sun', 'xue', 'cheng', callee: ƒ, Symbol(Symbol.iterator): ƒ]
};
f1(...arr);

// 数组合并
let arr1 = [10, 20, 30];
let arr2 = [40, 50, 60];
let arr3 = [...arr1, ...arr2];
console.log(arr3); // (6) [10, 20, 30, 40, 50, 60]

// 克隆数组
let arr4 = [...arr3];
console.log(arr4); // (6) [10, 20, 30, 40, 50, 60]

// 将伪数组转成真正的数组
let divs = document.querySelectorAll("div")
let divArr = [...divs];
console.log(divs);
    /*
        // 伪数组
        NodeList(3) [div, div, div]
            0: div
            1: div
            2: div
            length: 3
            [[Prototype]]: NodeList
    */
console.log(divArr);
    /*
        // 真正的数组
        (3) [div, div, div]
            0: div
            1: div
            2: div
            length: 3
            [[Prototype]]: Array(0)
     */
</script>
```

# Symbol

一个 Symbol 类型的数据, 可以理解为是一个独一无二的字符串

```javascript
let s = Symbol();
console.log(s); // Symbol()
console.log(s, typeof s); // Symbol() 'symbol'

let s = Symbol("sun");
console.log(s); // Symbol(sun)
console.log(s.description); // sun
```

即时描述字符串相同, 得到的都是不同的 Symbol, 两个 "sun" 都是独一无二的

```javascript
let s1 = Symbol("sun");
let s2 = Symbol("sun");
console.log(s1 === s2); // false
```

Symbol 值不能与其他数据进行运算

```javascript
let res1 = s1 + 100; // error
let res2 = s1 > 100; // error
let res3 = s1 + s1; // error
```

通过 Symbol 添加唯一成员, 解决命名冲突

```javascript
let obj = {
    name: "xue",
    show: function () {
        console.log("hi");
    },
    [Symbol("name")]: "sun",
    [Symbol("show")]: function () {
        console.log("hello world");
    }
}
console.log(obj) // { name: 'xue', show: [Function: show], [Symbol(name)]: 'sun', [Symbol(show)]: [Function: [show]] }
```

通过 Symbol 私有化成员

```javascript
let member = {
    name: Symbol("name")
}

class User {
    constructor(name) {
        this[member.name] = name;
    }

    getName() {
        return this[member.name];
    }
}

let user = new User("harvey");
console.log(user.name); // undefined
console.log(user.getName()); // harvey
```

# Symbol Traverse

Symbol 类型的数据不能使用 for in, 只能使用 for of

```javascript
let person = {
    name: "sun",
    [Symbol("age")]: 18,
    [Symbol("show")]: function () {
        console.log("hello world");
    }
}

for (let key in person) { // error
    console.log(key);
}

// Object.getOwnPropertySymbols() 只能遍历 Symbol 数据
for (let key of Object.getOwnPropertySymbols(person)) {
    console.log(key);
}
    /*
        Symbol(age)
        Symbol(show)
     */

// Reflect.ownKeys() 即可以遍历 Symbol 数据, 也可以遍历非 Symbol 数据
for (let key of Reflect.ownKeys(person)) {
    console.log(key);
}
    /*
        name
        Symbol(age)
        Symbol(show)
     */

```

# Global Symbol

Symbol.for() 创建 Global Symbol

```javascript
let s = Symbol.for("sun");

console.log(s, typeof s); // Symbol(sun) 'symbol'
console.log(s.description) // undefined
console.log(Symbol.keyFor(s)); // sun
```

如果字符串相同, 则得到的是唯一的 Symbol 数据

```java
let s1 = Symbol.for("sun");
let s2 = Symbol.for("sun");
console.log(s1 == s2); // true
```

# Symbol Field

Symbol 内置了 11 个 Field (eg: Symbol.hasInstance, Symbol.isConcatSpreadable, Symbol.iterator)

```javascript
class Person {
    // 每当通过 instanceof 比较数据类型是, 就会触发这个 Static Method
    static [Symbol.hasInstance](param) {
        console.log(param); // {name: 'sun', age: 18}
    }
}
let obj = { name: "sun", age: 18 };
console.log(obj instanceof Person); // false
```

```javascript
let arr1 = [10, 20, 30];
let arr2 = [40, 50, 60];

// 设置 arr2 无法展开拼接
arr2[Symbol.isConcatSpreadable] = false;

console.log(arr1.concat(arr2)); // (4) [10, 20, 30, Array(3)]
```

# Iterator 

for of 底层就是通过 Iterator 进行遍历的, 只要是实现了 Iterator Interface, 就可以通过 for of 进行自动遍历

```javascript
// Array 默认实现了 Iterator Interface
let arr = ["sun", "xue", "cheng"];
for (let val of arr) {
    console.log(val);
}
```

直接获取数组的 Iterator, 手动遍历

```javascript
let arr = ["sun", "xue", "cheng"];
let iterator = arr[Symbol.iterator]();
console.log(iterator); // Object [Array Iterator] {}
console.log(iterator.next()); // {value: 'sun', done: false}
console.log(iterator.next()); // {value: 'xue', done: false}
console.log(iterator.next()); // {value: 'cheng', done: false}
console.log(iterator.next()); // {value: undefined, done: true}
```

我们自定的对象, 需要实现 Iterator Interface, 才可以通过 for of 自动遍历

```javascript
let list = {
    name: "人员表",
    stus: [
        "sun",
        "xue",
        "cheng"
    ],
    // Implement iterator interface
    [Symbol.iterator]() {
        let index = 0;
        let _this = this;
        return {
            next: function () {
                // If the array has not yet been traversed, set done to false. If the traversal is complete, set done to true
                if (index < _this.stus.length) {
                    return {value: _this.stus[index++], done: false};
                } else {
                    return {value: undefined, done: true}
                }
            }
        }
    }
}

for (let val of list) {
    console.log(val);
}
```

# Generator Function

Generator Function 可以通过 yield 实现分段执行, 通过维护 value 和 done 实现状态管理

```javascript
// 通过 yield 分成 3 部分, 需要调用 3 次 next() 才能执行完
function* gen() {
    console.log("start task 1");

    // 第一次调用 next() 会卡在这, 并且封装一个对象返回
    yield "end task 1";

    console.log("start task 2");
    
    yield "end task 2";

    console.log("start task 3");
}

let iterator = gen();

let res1 = iterator.next(); // start task 1
let res2 = iterator.next(); // start task 2
let res3 = iterator.next(); // start task 3

console.log(res1); // { value: 'end task 1', done: false }
console.log(res2); // { value: 'end task 2', done: false }
console.log(res3); // { value: 'end task 3', done: true }
```

传递参数

```javascript
function* gen(param1) {
    console.log(param1); // param 1

    let param2 = yield;
    console.log(param2); // param 2

    let param3 = yield;
    console.log(param3); // param 3
}

let iterator = gen("param 1");
iterator.next();
iterator.next("param 2");
iterator.next("param 3");
```

通过 Generator 实现 Async Programming

```javascript
function getUser() {
    setTimeout(() => {
        iterator.next("user");
    }, 1000)
}
function getOrder() {
    setTimeout(() => {
        iterator.next("order");
    }, 1000)
}
function getGoods() {
    setTimeout(() => {
        iterator.next("goods");
    }, 1000)
}
function* gen() {
    let user = yield getUser();
    console.log(user); // user

    let order = yield getOrder();
    console.log(order); // order

    let goods = yield getGoods();
    console.log(goods); // goods
}

let iterator = gen();
iterator.next();
```

# Set

```javascript
let s = new Set(["sun", "xue", "cheng", "sun", "xue"]);

console.log(s); // Set { 'sun', 'xue', 'cheng' }
console.log(...s); // sun xue cheng
console.log(s.size); // 3
console.log(s.has("sun")); // true
console.log(s.has("harvey")); // false

s.add("harvey");
s.delete("harvey");
s.clear();
```

```javascript
let arr1 = ["sun", "xue", "cheng", "sun", "xue"];
let arr2 = ["sun", "cheng", "jack"];

// Duplicate removal
let res = [...new Set(arr1)]; // [ 'sun', 'xue', 'cheng' ]
let res = [...new Set([...arr1, ...arr2])]; // ['sun', 'xue', 'cheng', 'jack']

// Intersection
let res = [...new Set(arr1)].filter((item) => new Set(arr2).has(item)); // ['sun', 'cheng']
```

# Map

```javascript
let m = new Map();

let newMap = m.set("name", "sun"); // {'name' => 'sun'}

// key is object
m.set({age: "AGE"}, 18);

// value is function
m.set("show", function () {
    console.log("hello world");
});

console.log(m.size); // 3
console.log(m.get("name")); // "sun"
console.log(m.has("name")); // true
m.delete("name") // true
m.clear();

let map = new Map([
    [
        "name", "sun"
    ],
    [
        "age", "18"
    ],
    [
        "show", function () {console.log("hello world")}
    ]
]);

for (let val of map) {
    console.log(val);
}
```

# Class

```js
class Person {
    // public field
    _name;
    // private field
    #age;
    // static field
    static msg = 'hello world';
    
    constructor(name, age) {
        this._name = name;
        this.#age = age;
    }

    // getter
    get age() {
        return this.#age;
    }

    // setter
    set age(age) {
        this.#age = age;
    }
    
    // public method
    show() {
        console.log('hello world');
    }
    
    // static method
    static showMsg() {
        console.log(this.msg);
    }
}
```

# Inheritance

```js
class Animal {
    constructor(name) {
        this.name = name;
    }

    show() {
        console.log("name is " + this.name);
    }

    run() {
        console.log("Animal run()");
    }
}

class Dog extends Animal {
    constructor(name, age) {
        super(name);
        this.age = age;
    }

    show() {
        super.show();
    }

    run() {
        console.log("Dog run()");
    }
}

let dog = new Dog("jack", 18);
dog.show(); // "name is jack"
dog.run(); // "Dog run()"
```

# export

```javascript
export let name = "sun";
export let show = function () {
    console.log("hello world");
};
```

```javascript
let name = "sun";
let show = function () {
    console.log("hello world");
};

export {
    name,
    show
};
```

```javascript
export default {
    name: "sun",
    show: function () {
        console.log("hello world");
    }
}
```

# import

```javascript
import * as app from './js/app.js';
console.log(app); // Module {Symbol(Symbol.toStringTag): 'Module'}
console.log(app.default.name); // sun
```

```javascript
import {default as app} from "./app.js";
console.log(app); // {name: 'sun', show: ƒ}
console.log(app.name); // sun
```

```javascript
import app from "./app.js";
console.log(app); // {name: 'sun', show: ƒ}
console.log(app.name); // sun
```

```javascript
let app = import('./app.js').then((module) => {
    console.log(module); // Module {Symbol(Symbol.toStringTag): 'Module'}
    console.log(module.default.name); // sun
});
```

# includes()

```javascript
let arr = [10, 20, 30, 40];
console.log(arr.includes(10)); // true
console.log(arr.includes(50)); // false
```

# Power Operation

```javascript
// similar to `Math.pow(2, 10)`
console.log(2 ** 10); // 1024
```

# Optional Chain

```js
let p = {};
console.log(p.address.city); // error,Uncaught TypeError: Cannot read properties of undefined (reading 'type')
console.log(p?.address?.city); // undefined
```

# BitInt

```javascript
console.log(100n); // 100n
console.log(typeof 100n); // bitint
console.log(BigInt(100)); // 100n
console.log(Number.MAX_SAFE_INTEGER + 10); // 9007199254741000; 这里已经超出最大值了, 计算错误
console.log(BigInt(Number.MAX_SAFE_INTEGER) + BigInt(10)); // 9007199254741001n; 使用 BitInt 计算正确
```

# globalThis

Browser Environment

```javascript
console.log(globalThis); // Window {window: Window …}
```

Node Environment

```javascript
console.log(globalThis); // Object [global]
```
