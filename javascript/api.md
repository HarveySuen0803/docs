# Object

## keys(), values()

```js
let arr = [10, 20, 30];

// 遍历数组的 key
console.log(Object.keys(arr));
    /* 
        (3) ['0', '1', '2']
            0: "0"
            1: "1"
            2: "2"
            length: 3
            [[Prototype]]: Array(0)
    */

// 遍历数组的 value
console.log(Object.values(arr));
    /*
        (3) [10, 20, 30]
            0: 10
            1: 20
            2: 30
            length: 3
            [[Prototype]]: Array(0)
    */

let obj = {
    name: "sun",
    age: 18,
    show: function () {
        console.log("name is " + this.name);
    }
}

// 遍历对象的 key
console.log(Object.keys(obj));
    /*
        (3) ['name', 'age', 'show']
            0: "name"
            1: "age"
            2: "show"
            length: 3
            [[Prototype]]: Array(0)
    */

// 遍历对象的 value
console.log(Object.values(obj));
    /*

        (3) ['sun', 18, ƒ]
            0: "sun"
            1: 18
            2: ƒ ()
            length: 3
            [[Prototype]]: Array(0)
    */
```

## entries(), formEntries()

```js
// 对象 转 数组
let result = Object.entries({name: "sun", age: 18}); // [['name', 'sun'], ['age', 18]]

// 数组 转 对象
let result = Object.fromEntries([["name", "sun"], ["age", 18]]); // result: {name: 'sun', age: 18}

// map 的 Entries 数组 转 对象
let map = new Map();
map.set("name", "sun");
map.set("age", 18);
map.set("show", function () {
    console.log("hello world");
});
let result = Object.fromEntries(map); // result: {name: 'sun', age: 18, show: ƒ}
```

## defineProperty()

```js
let person = {
    name: 'sun',
    sex: 'male'
}

let number = 18;

// 通过 Object.defineProperty() 来添加对象属性 (如果已经有了该属性, 就跳过)
Object.defineProperty(person, 'age', {
    // 设置属性值
    value: number,
    // 控制属性是否可以枚举 (遍历), 默认为 false
    enumerable: true,
    // 控制属性是否可以修改, 默认为 false
    writable: true,
    // 控制属性是否可以删除, 并且控制该属性是否可以修改第三个参数中的特性 (即 enumerable, writeable, configurable 的值), 默认为 false
    configurable: true,

    // 将 age 私有化, 每当有人获取 age 的值时, 就会调用该方法, 该方法返回 age 的值 (注意: 不能和 value, writable 同时存在)
    get: function () {
        return number;
    },
    // 将 age 私有化, 每当有人给 age 设置值时, 就会调用该方法, 通过该方法来修改 age 的值 (注意: 不能和 value, writable 同时存在)
    set: function (value) {
        number = value;
    }
})

// 遍历person对象
for (let key in person) {
    console.log(key, person[key]);
}
    /*
        name sun
        sex male
        age 18
     */
```

## is()

```js
// 判断两个值是否相等
console.log(Object.is(10, 20)); // false
console.log(Object.is(0.1 + 0.2, 0.3)); // false
console.log(Object.is("hello", "hello")); // true
console.log(Object.is(NaN, NaN)); // true
console.log(NaN === NaN); // false
```

## assign()

```js
let person1 = {
    name: "sun",
    age: 18,
    sex: "male",
    show() {
        console.log("p1 show()")
    }
}
let person2 = {
    name: "xue",
    hobby: "programming",
    show() {
        console.log("p2 show()");
    }
}
// 合并对象, person2 覆盖 person1
let person3 = Object.assign(person1, person2); // p3: {name: 'xue', age: 18, sex: 'male', hobby: 'programming', show: ƒ}; 
```

## getPrototypeOf(), setPrototypeOf()

```js
let person = {name: "sun"}

// 给 person 的原型对象添加属性和方法
Object.setPrototypeOf(person, {
    age: 18,
    show: function () {
        console.log("hello world");
    }
})

// 获取 person 的原型对象身上的属性和方法
console.log(Object.getPrototypeOf(person)); // {age: 18, show: ƒ}

console.log(person);
    /*
        {name: 'sun'}
            name: "sun"
            [[Prototype]]: Object
                age: 18
                show: ƒ ()
                [[Prototype]]: Object
    */
```

## getOwnPropertyDescriptors()

```javascript
// 获取到对象每个属性的描述对象, 即通过 Object.defineProperty() 设置的那些 (eg: writable, enumerable, configurable)
console.log(Object.getOwnPropertyDescriptors(person));
```

# Number

## Number()

```js
let str = "123.34";

// 字符串类型 转成 数值类型
let num = Number(str);
```

## EPSILON

- js中浮点数之间存在精度的问题
    - `console.log(0.1 + 0.2); // 0.30000000000000004`
    - `console.log(0.1 + 0.2 == 0.3); // false`
- Number.EPSILON是一个非常小的数,用来表示js中的最小精度
    - 我们可以规定: 当两个数的差小于Number.EPSILON,就表示这两个数相等

```js
function isEqual(num1, num2) {
    return Math.abs(num1 - num2) < Number.EPSILON
}
console.log(isEqual(0.1 + 0.2, 0.3)); // true
```

## MAX_SAFE_INTEGER

```javascript
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
```

## toFixed()

```js
let str = "123.34";

// 四舍五入到指定小数位
let num2 = 123.toFixed(2); // 123.00
let num3 = 10.45.toFixed(1); // 10.5
```

## isFinite()

```js
// 判断一个数值是否为有限数
console.log(Number.isFinite(100)); // true
console.log(Number.isFinite(Math.PI)); // true
console.log(Number.isFinite(100 / 0)); // false
console.log(Number.isFinite(Infinity)); // false
```

## isNaN()
```js
// 判断一个数值是否为 NaN
console.log(Number.isNaN(NaN)); // true
console.log(Number.isNaN(10 * "hello")); // true
console.log(Number.isNaN("hello world")); // false
console.log(Number.isNaN(100)); // false
```

## parseInt(), parseFloat()

```js
// 字符串 转 数值
console.log(Number.parseInt("12345sun67890")); // 12345
console.log(Number.parseFloat("3.12415926...我不记得后面是啥了")) // 3.12415926
```

## isInteger()

```js
// 判断一个数是否为整数
console.log(Number.isInteger(5)); // true
console.log(Number.isInteger(3.14)); // false
console.log(Number.isInteger("5")); // false
```

## trunc()

```js
// 将数字的小数部分抹掉
console.log(Math.trunc(3.14)); // 3
```

## sign()

```js
// 正数返回 1, 负数返回 -1, 0 返回 0
console.log(Math.sign(10)); // 1
console.log(Math.sign(0)); // 0
console.log(Math.sign(-3)); // -1
```

# Math

## PI

```js
// 圆周率
Math.PI; 
```

## max(), min(), abs()

```js
// 最大值
Math.max(); 

// 最小值
Math.min(); 

// 绝对值
Math.abs();
```

## floor(), ceil(), round()

```js
// 向下取整
Math.floor(); 
// 向上取整
Math.ceil(); 
// 四舍五入 (注意: Math.round(-3.5): -3)
Math.round(); 
```

## random()

```js
// 返回一个 [0,1) 的随机数
Math.random(); 

// 随机值 random() 计算公式
function getRandom(min, max) {
    return Math.floor(Math.random() * max - min + 1) + min;
}
```

# Date

## Date()

```js
// 创建Date对象
var date1 = new Date();
var date2 = new Date(2021, 8, 6);
var date3 = new Date("2021-8-6 8:8:8");

// 获取年
date1.getFullYear();

// 获取月 (0 - 11, 0 为 一月)
date1.getMonth();

// 获取日
date1.getDate();

// 获取星期 (0 - 6, 0 为 周一)
date1.getDay();

// 获取时
date1.getHours();

// 获取分
date1.getMinutes();

// 获取秒
date1.getSeconds();
```

## TimeStamp

- 时间戳: 当前时间距离 1970 年 1 月 1 日起的总的毫秒数
- 时间戳推算时间计算公式:
    - day = parseInt(时间戳 / 60 / 60 / 24)
    - hour = parseInt(时间戳 / 60 / 60 % 24)
    - minute = parseInt(时间戳 / 60 % 60)
    - second = parseInt(时间戳 % 60)

```js
// 获取时间戳 (方法 1): 通过 valueOf() 或 getTime() 获取
var date = new Date();
console.log(date.valueOf());
console.log(dategetTime());

// 获取时间戳 (方法 2): new Date 前面加一个 "+"
var date = +new Date();
console.log(date);

// 获取时间抽 (方法 3): H5 新增
console.log(Date.now());
```

# Array

## push(), unshift(), pop(), shift()

```js
let arr = [30, 10, 20, 50, 40];

// 末尾添加元素, 并返回新数组长度
arr.push(60);
arr.push(60, 70, 80);

// 开头添加元素, 并返回新数组长度
arr.unshift(60);
arr.unshift(60, 70, 80);

// 末尾删除元素, 并返回删除的元素
arr.pop();

// 开头删除元素, 并返回第一个元素
arr.shift();
```

## reverse(), sort()

```js
let arr = [30, 10, 20, 50, 40];

// 颠倒元素排列, 并返回新数组
arr.reverse(); // arr: [40, 50, 20, 10, 30]

// 顺序排列元素, 并返回新数组
arr.sort(function (a, b) {
    return a - b; // 升序排列
}); // arr: [10, 20, 30, 40, 50]
```

## toString(), join()

```js
let arr = [30, 10, 20, 50, 40];

// 数组 转 字符串
let str1 = arr.toString(); // str1: "30, 10, 20, 50, 40"

// 数组 转 字符串, 通过 " - " 拆分
let str2 = arr.join(" - "); // str2: "30 - 10 - 20 - 50 - 40"
```

## indexOf(), lastIndexOf()

```js
let arr = [30, 10, 20, 50, 40, 10];

// 返回该元素第一次出现时的索引值, 如果不存在返回 -1
let index = arr.indexOf(10); // index: 1

// 返回该元素最后一次出现时的索引值, 如果不存在返回 -1
let index = arr.lastIndexOf(10); // index: 5 
```

## concat(), slice(), splice()

```js
let arr1 = [10, 20, 30];
let arr2 = [40, 50, 60];

// 拼接 arr1 和 arr2
concatArr = arr1.concat(arr2); // concatArr: [10, 20, 30, 40, 50, 60]

let arr = [10, 20, 30, 40, 50, 60];

// 获取 [2, 3) 的元素
sliceArr = arr.slice(2, 3);

// 从 idx = 2 开始, 删除 3 个元素
arr.splice(2, 3);
```

## forEach(), map(), filter(), some(), every(), find()

```js
let arr = [10, 20, 30, 40, 50];

arr.forEach(function (value, index, array) {
    console.log(value, index, array);
});

let newArr = arr.map(function (value, index, array) {
    console.log(value, index, array);
    return value * 10
});

let newArr = arr.filter(function (value, index) {
    return value >= 30;
}); // newArr: [30, 40, 50]; arr; [10, 20, 30, 40, 50];

// 查找数组中是否有符合条件的元素, 返回一个 boolean, 查询数组中唯一的元素时 some() 效率更高
let flag1 = arr.some(function (value, index, array) {
    // 判断 arr 中是否有元素 30
    return value == 30;
}); // flag1: true

// 查找数组中的元素是否都满足条件, 返回一个 boolean
let flag2 = arr.every(function (value, index, array) {
    return value == 30;
}); // flag2: false

// 查找 10 的元素
let result = arr.find((item) => {
    return item == 10;
});
```

## reduce()

```js
let obj = [
    { id: "001", name: "sun", done: false },
    { id: "002", name: "xue", done: true },
    { id: "003", name: "cheng", done: true },
];

// reduce() 会调用 obj.length 次回调函数 
obj.reduce((per, curVal, curIndex, arr) => {
    // per: 初始值 或 每次回调结束后的返回值
    // curVal: 当前元素
    // curIndex: 当前元素的索引
    // arr: 当前元素所属的数组

    // 结束这次回调, 并返回 per + 1, 下一次回调时, per 的值就是 per + 1 了 
    // 第一次回调时 per: 0, 第二次回调时 per: 1, 第三次回调时 per: 2, 结束所有回调, 再返回 per + 1, 即 3
    return per + 1;
}, 0); // 设置 per 的初始化

// 统计 obj 中的 done 属性为 true 的元素个数
let count = obj.reduce((per, curVal) => {
    return per + (curVal.done ? 1 : 0);
}, 0);

// 简化后:
let count = obj.reduce((per, curVal) => per + (curVal.done ? 1 : 0), 0);
```

## flat(), flatMap()

```js
let arr1 = [1, 2, 3, [4, 5, [6, 7, [8, 9]]]];

// 二维数组 转 一维数组
console.log(arr1.flat()); // [1, 2, 3, 4, 5, [6, 7, [8, 9]]]

// 二维数组, 三维数组 转 一维数组
console.log(arr1.flat(2)); // [1, 2, 3, 4, 5, 6, 7, [8, 9]]

// 二维数组, 三维数组, 四维数组 转 一维数组
console.log(arr1.flat(3)); // [1, 2, 3, 4, 5, 6, 7, 8, 9]

let arr2 = [[1], [2], [3], [4]];

// 先通过 map() 操作数组中的每个元素, 再通过 flat() 降维
let result = arr2.map(item => [item * 10]).flat(); // result: [10, 20, 30, 40]

// flatMap() = map() + flat()
let result = arr2.flatMap(item => [item * 10]); // result: [10, 20, 30, 40]
```

# String

## toUpperCase(), toLowerCase()

```js
let str = "hello world"

// 大写字符串
let upperCaseStr = str.toUpperCase(); // upperCaseStr: "HELLO WORLD"

// 小写字符串
let lowerCaseStr= upperCaseStr.toLowerCase(); // lowerCaseStr: "hello world"
```

## indexOf(), lastIndexOf()

```js
let str = "hello world";

// 返回该字符串第一次出现时的索引值, 如果不存在返回 -1
let index = str.indexOf("l"); // index: 2

// 从索引 5 开始查找, 返回该字符串第一次出现时的索引值, 如果不存在返回 -1
let index = str.indexOf("l", 5); // index: 9

// 返回该字符串最后一次出现时的索引值, 如果不存在返回 -1
let index = str.lastIndexOf("l"); // index: 9
```

## charAt(), charCodeAt()

```js
let str = "hello world";

// 返回索引为 1 的字符
let char = str.charAt(1); // char: 'e'

// 返回索引为 1 的字符的 ASCII 值
let charCode = str.charCodeAt(1); // charCode: 101
```

## concat(), substr(), slice()

```js
let str1 = "hello";
let str2 = " "
let str3 = "word";

// 拼接字符串
let str = str1.concat(str2, str3); // str: "hello world"

let str = "hello world"

// 截取 [1, 3] 的字符串
let subStr = str.substr(1, 3); // subStr: "ell"; str: "hello world"

// 截取 [1, 3) 的字符串
let sliceStr = str.slice(1, 3); // sliceStr: "el"; str: "hello world"
```

## split()

```js
let str = "hello world"

// 字符串 转 数组, 通过 " " 拆分
let arr = str.split(" "); // arr: ["hello world"]; str: "hello world"
```

## replace()

```js
let str = "hello world"

// 替换字符串
let replaceStr = str.replace("hello", "Hello"); // replaceStr: "Hello world"; str: "hello world" 
```

## trim(), trimStart(), trimEnd()

```js
let str1 = " hello world ";

// 清楚字符串前后的空格
console.log(str1.trim()); // "hello world"

// 清楚字符串开头的空格
console.log(str.trimStart()); // "hello world "

// 清除字符串尾部的空格
console.log(str.trimEnd()); // " hello world"
```