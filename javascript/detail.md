# 深层概念

## 内存分布

> 基本类型,引用类型

* 基本类型: string,number,boolean,undefined,null,

  注意这里的null是个特殊的,它其实是对象类型,即引用类型,但他存储在栈区里

  注意string这个基本类型,会进行包装,包装成引用类型

* 引用类型: Object,Array,Date...

> 堆, 栈

![image-20210807071543476](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508741.png)

## 三种创建元素的区别

![image-20210808225722705](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508742.png)

## dom事件流

![image-20210809084004136](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508743.png)

事件发生时,会在元素节点之间按照特定的顺序传播,分为捕获阶段和冒泡阶段,

当触发时间的时,进入捕获阶段,从外往里传播事件,如果父级没有该事件,就不会执行,如果父级有该事件,也会执行该事件,直到最里面的事件(div)执行完, 进入冒泡阶段,从子级开始一层一层向父级传播,如果父级有该事件,也会执行该事件,直到执行到最外层父级(document)

在js机制中,代码一次只能得到捕获阶段和冒泡阶段其中之一

* onclick 和 attachEvent 只能得到冒泡阶段
* addEventListener 既可以得到冒泡阶段,也可以得到捕获阶段,
* 有些事件是没有冒泡的,比如onblur,onfocus,onmouseover,onmouseleave

## 事件委托

```html
<ul>
    <li></li>
    <li></li>
    <li></li>
</ul>

<script>
    var ul = document.querySelector("ul");
    // 这样就可以做到,点击每一个li都会弹出警示框
    // 通过给ul添加一个侦听器,点击每个子级li,会触发事件冒泡,传给事件的触发者ul,此时在ul里调用相应的方法,大大提高效率
    // e.target是返回触发者事件对象,点击li,返回的则就是li,因为点击li,事件会冒泡到ul上
    ul.addEventListener("click", function(e) {
        console.log(e.target);
    });
</script>
```

## JS执行机制

> 同步,异步

![image-20210810084250931](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508744.png)

执行:

* 先执同步任务,把这个三条语句,放在同步任务里,
* 然后执行第一条输出1,
* 接着执行setTimeout()的时候,发现该语句是异步的,就把该语句放到了任务队列里,
* 然后去执行同步任务里的其他语句,输出完2之后,
* 再来到任务队里,执行输出3的语句

同步, 异步:

* 同步任务都在主线程上执行,形成了一个执行栈

* 异步是通过回调函数实现的
  * 普通事件: click, resize...
  * 资源加载: load, error...
  * 定时器: setInterval, setTimeout...

> 事件循环

![image-20210810091453697](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508745.png)

任务循环: 主线程不断的从任务队列中获取任务,执行任务,再获取任务,再执行任务

# 构造函数和原型

## 构造函数

```js
// 在es5,没有class,constructor,static...的时候,都是使用构造函数来创建对象

// 构造函数
function Person(name, age) {
    this.name = name;
    this.show = function () {
        console.log("name: " + this.name);
    };
}
// 搭配new来创建Person对象
let p = new Person("sun");

// 给p对象添加普通属性
p.job = "java工程师";
// 访问普通属性
console.log(p.job); // "java工程师"

// 给Person类添加静态属性
Person.msg = "hello world";
// 访问静态属性
console.log(Person.msg); // "hello world"

// 给Person类添加静态方法
Person.run = function () {
    console.log("Person can run");
};
// 调用静态方法
Person.run(); // Person can run
```

## prototype

```js
/*
    在构造器中,存放复杂的数据类型(比如: 函数),会导致内存浪费
        存储复杂的数据类型,会单独为其开辟一块内存,多次调用构造器,就会多次开辟内存,如果是一个内容不变的函数,我们为其重复开辟空间,就非常浪费了
    我们可以通过 构造器的prototype属性 访问其原型对象,将复杂的数据类型(比如: 函数)放在原型对象身上
        每次调用构造器,就不会去为其重复开辟内存,由原型对象开辟一次即可
    一般情况: 将公共属性定义在构造函数内,将公共的方法定义在原型对象身上
*/

// 构造函数
function Person(name) {
    this.name = name;
    /*
        // 不要将公共的函数,放在构造器中
        this.show = function () {
            console.log("name: " + this.name);
        };
     */
}

// Person构造器身上由一个 prototype属性 指向了Person原型对象, 我们将公共的函数放在Person原型对象身上
Person.prototype.show = function () {
    console.log("name is " + this.name);
};

// 调用多次构造器,创建多个Person对象,但是show()只开辟了一次的内存,非常的nice啊
let p1 = new Person("sun");
let p2 = new Person("xue");
p1.show(); // "name is sun"
p2.show(); // "name is xue"
```

## \_\_proto\_\_

```js
function Person(name) {
    this.name = name;
}

// Person构造器身上由一个 prototype属性 指向了Person原型对象
Person.prototype.show = function () {
    console.log("name is " + this.name);
};

let p = new Person("sun");

// 实例对象身上有一个 __proto__属性 也指向了Person原型对象
console.log(p.__proto__ === Person.prototype); // true

// 对象查找方法的规则: 先在实例对象身上找,如果没有就通过__proto__访问其原型对象,去原型对象身上找,如果还是没有,就去其原型对象的原型对象身上找... (与java一致)
p.show();
```

## constructor

```js
function Person(name) {
    this.name = name;
}

// Person原型对象身上有一个constructor()
console.log(Person.prototype);
    /*
        {constructor: ƒ}
            constructor: ƒ Person(name)
                ...
            [[Prototype]]: Object
     */
// 这个constructor()就指向了我们调用的构造器
console.log(Person.prototype.constructor === Person); // true
console.log(Person.prototype.constructor);
    /*
        ƒ Person(name) {
                this.name = name;
            }
     */

// 相关使用场景: 如果我们整个修改了Person原型对象,我们需要手动让constructor指回Person()构造器
Person.prototype = {
    // 指定一个constructor属性
    constructor: Person,
    run: function () {
        console.log("Person can run");
    },
    eat: function () {
        console.log("Person can eat");
    }
}
console.log(Person.prototype);
    /*
        {constructor: ƒ, run: ƒ, eat: ƒ}
            constructor: ƒ Person(name)
            eat: ƒ ()
            run: ƒ ()
            [[Prototype]]: Object
     */
```

## 扩展内置对象

```js
// 给内置的Array对象的原型对象添加一个sum()
Array.prototype.sum = function () {
    let sum = 0;
    for (let i = 0; i < this.length; i++) {
        sum += this[i];
    }
    return sum;
};
// 创建一个Array的实例对象 (这里是简化后的创建方式,完整的应该是 let arr = new Array(10, 20, 30);
let arr = [10, 20, 30];
// 调用我们自定义的sum()
let sum = arr.sum();

console.log(sum); // 60
```

## 原型链的继承

```js
/*
    prototype, __proto__, constructor 三个属性之间的关系
        构造函数Person() 创建出 原型对象p,实例对象person
            let p = Person()
            let person = Person()
        构造函数Person() 通过prototype属性 访问到 原型对象p
            Person.prototype = p
        原型对象p 通过constructor属性  访问到 构造函数Person()
            p.constructor = Person
        实例对象person 通过__proto__属性 访问到 原型对象p
            person.__proto__ = p

    原型链: 一个Cat类继承Animal类, Animal类默认继承Object类, Object类没有父类
        实现Cat类继承Animal类
            方法1: 设置Cat类的原型对象为Animal类的实例对象 (尚硅谷的老师是这么讲的)
                Cat.prototype = new Animal()
                // Cat类的原型对象整个被替换成了Animal类的实例对象,所以Cat原型对象本身的constructor属性就没有了,我们需要手动设置一个
                Cat.prototype.constructor = Cat
            方法2: 设置Cat类的原型对象的__proto__属性为Animal类的实例对象,这样就能保留Cat类本身的原型对象,同时也能实现继承 (我自己研究的实现方式,我觉得更好)
                // 这里就不需要手动设置构造器了,因为只是给原先Cat原型对象添加了一个__proto__的属性
                Cat.prototype.__proto__ = new Animal()
        实现Animal类默认继承Object类: 设置Animal类的原型对象的__proto__属性为Object类的实例对象 (js底层就是这个写法)
            Animal.prototype.__proto__ = new Object
*/

// Animal的构造函数
function Animal(name) {
    this.name = name;
    this.run = function () {
        console.log("Animal run()");
    };
}

// Cat的构造函数
function Cat(name) {
    this.eat = function () {
        console.log("Cat eat()");
    };
}

// 通过方法1进行继承

// 设置Cat类的原型对象为Animal类的实例对象 (这就实现了继承)
// 执行了这一步之后,就可以在原型对象身上添加 属性 和 方法 了
Cat.prototype = new Animal();
// 给Cat类的原型对象身上添加一个constructor属性 (因为原先的整个Cat原型对象都被替换了,constructor属性就没有了)
Cat.prototype.constructor = Cat;
// 给Cat类的原型对象身上添加一个show()
Cat.prototype.show = function () {
    console.log("Cat show()");
};

let cat = new Cat("sun");

// 访问自身的方法
cat.eat();
// 访问父类的方法
cat.run();
// 访问原型对象身上的方法
cat.show();

console.log(cat);
    /*
        Cat {eat: ƒ}
            eat: ƒ ()
            [[Prototype]]: Animal
                constructor: ƒ Cat(name)
                name: undefined
                run: ƒ ()
                show: ƒ ()
                [[Prototype]]: Object
                    constructor: ƒ Animal(name)
                    [[Prototype]]: Object
     */
```

## call()

> call()的基本使用

```js
function show(x, y) {
    console.log(x + y); // 30

    // 如果没有在call()中指定this的指向,默认是指向的window
    console.log(this);
        /*
            {name: 'sun'}
                name: "sun"
                [[Prototype]]: Object
        */
    console.log(this.name); // "sun"
}

let person = {
    name: "sun"
}

// 通过call()能调用方法,同时可以指定show()中的this指向
show.call(person, 10, 20);
```

> 调用父类的构造器

```js
function Animal(name, age) {
    this.name = name;
    this.age = age;
}

Animal.prototype.run = function () {
    console.log("Animal run()");
};
function Cat(name, age, sex) {
    // 通过call()调用Animal(),同时传入this,让Animal()中的this指向Cat的实例对象 (相当于super()调用父类的构造器)
    Animal.call(this, name, age);
    this.sex = sex;
}

Cat.prototype = new Animal();
Cat.prototype.constructor = Cat;

Cat.prototype.eat = function () {
    console.log("Cat eat()");
};

let cat = new Cat("sun", 18, "male");

// 访问自身的方法
cat.eat();
// 访问父类的方法
cat.run();

console.log(cat);
    /*
        Cat {name: 'sun', age: 18, sex: 'male'}
            age: 18
            name: "sun"
            sex: "male"
            [[Prototype]]: Animal
                age: undefined
                constructor: ƒ Cat(name, age, sex)
                name: undefined
                run: ƒ ()
                [[Prototype]]: Object
                    eat: ƒ ()
                    constructor: ƒ Animal(name, age)
                    [[Prototype]]: Object
     */
```

## es6类的本质

```js
class Person {
    constructor(name) {
        this.name = name;
    }

    show() {
        console.log("name is " + this.name);
    }
}

let p = new Person("sun");

// Person类本身还是一个function,我们可以简单的理解为是构造函数的另一种写法
console.log(typeof Person); // function
// 还是能访问到原型对象
console.log(Person.prototype);
// 依然保留了构造器
console.log(Person.prototype.constructor);
// 在原型对象身上添加方法
Person.prototype.run = function () {
    console.log("Person run");
};
```

# ES5新增方法

## Math方法

```js
let arr = [10, 20, 30, 40, 50];

// forEach()遍历数组
arr.forEach(function (value, index, array) {
    console.log("元素值: " + value);
    console.log("索引值: " + index);
    console.log("数组本身: " + array);
});

// map()和forEach()基本一样
arr.map(function (value, index, array) {
    console.log(value, index, array);
});

// filter()筛选数组,返回一个新的数组
let newArr = arr.filter(function (value, index) {
    return value >= 30;
});
console.log(newArr); // [30, 40, 50]

// some()查找数组中是否有符合条件的元素,返回一个boolean
// 查询数组中唯一的元素时,使用some()效率更高
let flag1 = arr.some(function (value, index, array) {
    // 我们可以手动设置返回的值
    // * 如果返回true,会终止查找,flag1接受到true
    // * 如果返回false,会接着查找,直到查找完整个数组,flag1接受到false
    return value == 30;
});
console.log(flag1); // true

// every()和some()基本一样
let flag2 = arr.every(function (value, index, array) {
    return value == 30;
});
console.log(flag2); // true
```

## String方法

```js
// trim()去除掉字符串前后的空格
let str1 = " sun xue cheng ";
console.log(str1.trim()); // "sun xue cheng"
```

## Object方法

### keys(),values()

```js
let arr = [10, 20, 30];
// 遍历数组的key
console.log(Object.keys(arr));
// 遍历数组的value
console.log(Object.values(arr));
    /*
        (3) ['0', '1', '2']
            0: "0"
            1: "1"
            2: "2"
            length: 3
            [[Prototype]]: Array(0)

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
// 遍历对象的key
console.log(Object.keys(obj));
// 遍历对象的value
console.log(Object.values(obj));
/*
    (3) ['name', 'age', 'show']
        0: "name"
        1: "age"
        2: "show"
        length: 3
        [[Prototype]]: Array(0)

    (3) ['sun', 18, ƒ]
        0: "sun"
        1: 18
        2: ƒ ()
        length: 3
        [[Prototype]]: Array(0)
 */
```

### defineproperty()

```js
let person = {
    name: 'sun',
    sex: 'male'
}

/*
    // 我们原先给对象添加属性,非常的方便,但是功能没有Object.defineProperty()多
    person.number = 18
*/

let number = 18;

// 通过Object.defineProperty()来添加对象属性 (如果已经有了该属性,就通过)
Object.defineProperty(person, 'age', {
    // 设置属性值
    value: number,
    // 控制属性是否可以枚举(遍历),默认为 false
    enumerable: true,
    // 控制属性是否可以修改,默认为 false
    writable: true,
    // 控制属性是否可以删除,并且控制该属性是否可以修改第三个参数中的特性(即enumerable,writeable,configurable的值),默认为 false
    configurable: true,

    /*
        // 通过get(),set()来控制属性值,和java里的setter()和getter()很像(注: 这两个方法不能和value/writable同时存在)

        // * get()会将age私有化,每当有人获取age的值时,就会调用该方法,该方法返回age的值
        get: function () {
            // get()返回的是属性number
            return number;
        },
        // * set()会将age私有化,每当有人给age设置值时,就会调用该方法,通过该方法来修改age的值
        set: function (value) {
            // 修改number的值,别人在访问age值的时候,调用get(),返回的就是修改完的number的值
            number = value;
        }
     */
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

# 严格模式

## 开启严格模式

```html
<!--
    js开启严格模式后
        * 消除js语法的一些不合理,不严谨指出,减少了一些怪异行为
        * 消除代码的一些不安全指出,保证代码运行的安全
        * 提高编译效率,增加运行速度
        * 禁用了ECMAScript的未来版本可能定义的一些语法,为未来新版本的js做好铺垫,比如一些保留字: class, enum, export, extends, import, super...不能做变量名
-->

<!--整个script标签开启严格模式-->
<script>
    "use strict";
    // 下面的代码就会按照严格模式执行
</script>

<!--立即函数中开启严格模式-->
<script>
    (function () {
        "use strict";
        // ...
    })();
</script>

<!--局部开启严格模式-->
<script>
    function f1() {
        "use strict";
        // f1()中的代码会按照严格模式执行
    }

    function f2() {
        // f2()中的代码依旧按照正常模式执行
    }
</script>
```

## 严格模式中的主要变化

```js
"use strict";
// 1. 变量必须先声明再使用
n1 = 10; // error
console.log(n1); // error

// 2. 不能随意删除已经声明好的便令
let n2 = 20;
delete n2; // error

// 3. 全局作用域中,普通函数里的this指向undefined,并不是指向window了
function f1() {
    console.log(this); // undefined
}

// 4. 定时器函数中this还是指向window, 构造函数中this还是指向当前实例对象
setTimeout(function () {
    console.log(this); // window
});
function Person() {
    console.log(this); // Person {}
}
new Person();

// 5. 函数的形参不可重名
function add(a, a) {} // error
```

# 闭包

## Info

```js
// 闭包(closure): 一个函数有权访问另一个函数作用域中变量
// 闭包的主要作用: 延长变量的使用范围

// 这里f2()可以访问到f1()作用域中的变量num,此时就形成了闭包
function f1() {
    let num = 10;
    function f2() {
        console.log(num);
    }
    f2();
}
f1();

// 这里在全局作用域中可以访问到fn()作用域中的变量,此时就形成了闭包
function fn() {
    let content = "hello world"
    return function () {
        console.log(content);
    };
}
fn();
```

## 闭包的应用

```html
<ul>
<li>sun</li>
<li>xue</li>
<li>cheng</li>
<li>jack</li>
</ul>

<script>
let lis = document.querySelectorAll("li")

// 应用1: 输出每个li对应的index
// * 通过传统方式解决
for (let i = 0; i < lis.length; i++) {
    lis[i].index = i;
    lis[i].onclick = function () {
        console.log(this.index);
    };
}
// * 通过闭包解决
for (let i = 0; i < lis.length; i++) {
    // click事件的回调函数中,用到了外部函数的变量i,就形成了闭包
    (function (i) {
        lis[i].onclick = function () {
            console.log(i);
        };
    })(i); // 调用函数,并且传递参数i
}

// 应用2: 延时1s输出所有li标签中的内容
for (let i = 0; i < lis.length; i++) {
    (function (i) {
        setTimeout(function () {
            console.log(lis[i].innerHTML);
        }, 1000);
    })(i);
}
</script>
```

# 对象中的key

```js
// 对象中的key完整写法
let p1 = {
    // key是以字符串的形式书写的
    "name": "sun",
    "age": 18,
    "show": function () {
        console.log("hello world");
    },
    // 如果是"user-name"这种形式的key,就需要通过""包裹起来表示
    "user-name": "Mr_WisSun"
}
// 对象中的key简写形式
let p2 = {
    name: "sun",
    age: 18
}

// 访问属性和方法
console.log(p1["name"], p2["age"]); // sun 18
p1["show"](); // hello world

// 访问"user-name"只能通过这种方式访问了
p1["user-name"]

// 添加属性和方法
p1["hobby"] = ["抽烟", "喝酒", "烫头"];
p1["run"] = function () {
    console.log("i can run");
};

// 对象中的key为变量
name1 = "sun";
name2 = "xue";
let info = {
    /*
        // 这样子是不可以的
        name1: {age: 18, sex: "male"}
     */

    [name1]: {age: 18, sex: "male"},
    [name2]: {age: 20, sex: "female"}
}
console.log(info); // {sun: {…}, xue: {…}}
```

# for-in, for-of

```js
let arr = [10, 20, 30, 40];

// for-in遍历数组的key
for (let key in arr) {
    console.log(key, arr[key]);
}
    /*
        0 10
        1 20
        2 30
        3 40
     */

// for-of遍历value (遍历的数据必须支持iterator, 比如: Array, Arguments, Set, Map, String, TypedArray, NodeList)
for (let value of arr) {
    console.log(value);
}
    /*
        10
        20
        30
        40
     */
```

# 判断一个对象是否空

```js
let obj = {}
let res = JSON.stringify(obj) === "{}" ? true : false; // true
```

# clasList

```js
// classList属性是HTML5新增的一个属性,返回元素的类名,但是ie10以上版本支持

// 获取了div类名的列表,即获取div的所有的类名
console.log(div.classList);
// 支持索引, 获取div的第2个类名
console.log(div.classList[1]);
// 添加一个类名到最后, 注意前面不需要加小点
div.classList.add("three");
// 删除一个类名, 删除一个叫做one的类名
div.classList.remove("one");
// 切换类名, 如果有four这个类名,就删除,如果没有就添加该类名
div.classList.toggle("four");
```

# 双击禁止选中文字

```js
// 绑定双击事件
div.ondblclick = function() {
    // 禁止双击选中文字 (win默认,鼠标双击会选中相应的内容,我们要禁止这个功能,需要复制下面这段代码)
    window.getSelection() ? window.getSelection().removeAllRanges() : document.selection.empty();
}
```

# select()

```html
<input type="text" value="hello world">

<script>
    let input = document.querySelector("input")
    // 点击了文本框后,就全选里面的内容
    input.onclick = function () {
        input.select(); // 全选文本框中的内容
    };
</script>
```

# 立即执行函数

> 两种书写方式: (function(){})() | (function(){}()) 

```js
(function() {
    var num = 20;
    console.log(num); // 20
})(); // 1

(function() {
    var num = 10;
    console.log(num); // 10
}()); // 2
```

这个函数写法是不需要调用的,立即执行, 第二个小括号可以看做是调用函数

* 立即执行函数最大的作用就是, 独立创建一个作用域
* 里面的所有的变量都是局部变量,不会有命名冲突的现象

# window.scroll(x,y)

>window.scroll(x,y) 将页面移动到坐标(x,y)处

```js
goBack.addEventListener("click", function () {
    window.scroll(0, 0);
});
```

> 缓动返回顶部

使用封装的动画函数,只需要将所有的left相关的值,改成跟页面垂直滚动相关的就可以了

页面滚动了多少,可以用window.pageYOffset得到

```js
goBack.addEventListener("click", function () {
    animate(window, 0);
});

function animate(obj, target, callback) {
    // console.log(callback);  callback = function() {}  调用的时候 callback()
    // 先清除以前的定时器，只保留当前的一个定时器执行
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        // 步长值写到定时器的里面
        // 把我们步长值改为整数 不要出现小数的问题
        // var step = Math.ceil((target - obj.offsetLeft) / 10);
        var step = (target - window.pageYOffset) / 10;
        step = step > 0 ? Math.ceil(step) : Math.floor(step);
        if (window.pageYOffset == target) {
            // 停止动画 本质是停止定时器
            clearInterval(obj.timer);
            // 回调函数写到定时器结束里面
            // if (callback) {
            //     调用函数
            //     callback();
            // }
            callback && callback();
        }
        // 把每次加1 这个步长值改为一个慢慢变小的值  步长公式：(目标值 - 现在的位置) / 10
        window.scroll(0, window.pageYOffset + step);
    }, 15);
}
```

# transitionend事件

transitionend事件,是transition过渡完成之后触发,可以用于处理轮播图滚动到最后一张和第一张的特殊情况

```js
// transitionend事件,是transition过渡完成之后触发
ul.addEventListener("transitionend", function () {
    if (index == 4) {
        index = 1;
        // 清除过渡效果,然后在进行位移操作
        ul.style.transition = "none";
        // 让盒子移动到原始的位置
        ul.style.transform = "translateX(" + -index * 20 + "%)";
    }
    // 当图片移动到index=1,即在最后一张图片的克隆图片位置时,让其瞬移到index=3的位置
    else if (index == 0) {
        index = 3;
        // 清除过渡效果,然后在进行位移操作
        ul.style.transition = "none";
        // 让盒子移动到原始的位置
        ul.style.transform = "translateX(" + -index * 20 + "%)";
    }
});
```

# 深拷贝,浅拷贝

```js
/*
    浅拷贝: 只拷贝对象的第一层数据,更深层次的数据只拷贝了一个引用(即地址)
    深拷贝: 拷贝对象中的每一层数据
 */

let obj1 = {
    name: "sun",
    job: {
        type: "java工程师"
    }
}

// 通过for(),进行浅拷贝操作
let obj2 = {};
for (let key in obj1) {
    obj2[key] = obj1[key];
}
console.log(obj2); // {name: 'sun', job: {type: "java工程师"}}
// 此时修改obj2中的深层次数据(比如:obj2.job.type), obj1中的数据也会发生改变
obj2.job.type = "web工程师";
console.log(obj1); // {name: 'sun', job: {type: "web工程师"}}
console.log(obj2); // {name: 'sun', job: {type: "web工程师"}}

// 通过Object.assign(),进行浅拷贝操作,非常的方便
let obj3 = {};
Object.assign(obj3, obj1);
console.log(obj3); // {name: 'sun', job: {type: "web工程师"}}

/*
    封装deepCopy(),进行深拷贝操作
    
    实现思路:
        * 拷贝obj
            obj = {
                name: "sun",
                job: {
                    type: "java工程师"
                },
                arr: [10, 20, 30]
            }
        * 判断obj中第一层的数据是什么类型的
            * 如果是基本类型的数据,直接拷贝
            * 如果是对象类型的数据,进入该对象,接着判断这一层是什么类型的数据
                * 如果是基本类型的数据...
            * 如果是数组类型的数据,进入该数组,接着判断这一层是什么类型的数据
                * 如果是基本类型的数据...
 */
function deepCopy(newObj, oldObj) {
    for (let k in oldObj) {
        let item = oldObj[k];
        if (item instanceof Array) {
            // 如果是数组
            newObj[k] = [];
            deepCopy(newObj[k], item);
        } else if (item instanceof Object) {
            // 如果是对象
            newObj[k] = {};
            deepCopy(newObj[k], item);
        } else {
            // 如果是简单数据类型
            newObj[k] = item;
        }
    }
}
let obj4 = {};
deepCopy(obj4, obj1);
console.log(obj4); // {name: 'sun', job: {type: "web工程师"}}
// 此时修改obj4中的深层次数据, obj1中的数据不会发生改变
obj4.job.type = "python工程师";
console.log(obj1); // {name: 'sun', job: {type: "web工程师"}}
console.log(obj4); // {name: 'sun', job: {type: "java工程师"}}
```























