# 模板语法

```html
<!--
    vue模板语法2大类:
        * 插值语法
            * 功能: 用于解析 标签体内容(比如div里的内容), 比如:
                {{url}}
        * 指令语法
            * 功能: 用于解析 标签(包括: 标签属性,标签体内容,绑定事件...), 比如:
                v-bind: 

    注意: 在 指令语法 和 插值语法 中 都可以填写 js表达式(区分 js表达式 和 js代码)
        * js表达式 (可以填写的)
            * 1 + 2
            * Date.now()
            * a
            * ...
        * js代码 (不可以填写到)
            * if () {}
            * while () {}
            * ...
-->

<div id="root">
    <!--插值语法-->
    <div>名称: {{name}}, 地址: {{url}}</div>

    <!--指令语法-->
    <a v-bind:href="url" v-bind:hello="hello">地址1</a> <!--这样就实现了动态绑定url-->
    <a :href="url" :time="Date.now()">地址2</a>
</div>

<script>
    Vue.config.productionTip = false; // 阻止 vue在启动时生成生产提示(提示你使用的生产类型的vue)

    const vm = new Vue({
        el: '#root',
        data: {
            name: 'baidu',
            url: 'https://www.baidu.com',
            hello: '你好'
        }
    })
</script>
```

# 数据绑定

```html
<template>
    <div class="test">
        <!-- v-bind 数据绑定, 数据只能从 data 流向 page, input 中的数据发生改变时, 无法实时更新数据 -->
        单向数据绑定: <input type="text" v-bind:value="msg01"> {{msg01}}
        <!-- v-bind 数据绑定, 数据即能从 data 流向 page, 也能从 page 流向 data, input 中的数据发生改变时, 可以实时更新数据 -->
        双向数据绑定: <input type="text" v-model:value="msg02"> {{msg02}}

        <!-- 简写 -->
        单向数据绑定: <input type="text" :value="msg01"> {{msg01}}
        双向数据绑定: <input type="text" v-mode="msg02"> {{msg02}}
    </div>
</template>

<script>
export default {
    name: "Test",
    data() {
        return {
            msg01: "",
            msg02: ""
        }
    }
}
</script>
```

v-bind 模拟实现 v-model 的效果

```html
<template>
    <div class="test">
        <!-- input 发生改变时, @input 就会触发, 不同于 @change 需要点击一下输入框外的部分才会触发  -->
        <input type="text" v-bind:value="msg01" @input="msg01 = $event.target.value"> {{msg01}}
    </div>
</template>
```

```html
<input type="text" @input="msg01 = $event.target.value">
```

# el配置项

```html
<!--
	通过配置el配置项,设置容器为"#root"
-->

<div id="root">

</div>

<script>
    // el 写法1: 实例化Vue对象时, 添加el属性
    const v1 = new Vue({
        el: '#root'
    });

    // el 写法2: 先创建Vue对象,在通过 $mount()来挂载到指定的容器中
    const v2 = new Vue({

    });
    v2.$mount('#root');
</script>
```

# data配置项

```html
<!--配置了data配置项后,就可以在页面中使用到该项目-->

<div id="root">
    <div>{{name}}</div>
</div>

<script>
    // data 写法1: 对象式
    const v3 = new Vue({
        el: '#root',
        data: {
            name: '小孙',
            age: 18
        }
    })

    // data 写法2: 函数式, 在脚手架中必须使用函数式的data,不然报错
    const v4 = new Vue({
        el: '#root',
        // 注意这里的函数必须使用 function(){},不可以使用 箭头函数, 不然this会执行window,而不是Vue
        data: function () {
            console.log(this); // vue
            return {
                name: '小孙',
                age: 18
            }
        },
        // 因为是在对象中 编写函数, 所以可以简化成这样:
        data() {
            console.log(this); // vue
            return {
                name: '小孙',
                age: 18
            }
        }
    })
</script>
```

# MVVM

![image-20220221084652931](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521017.png)

```html
<!--
    MVVM模型
        * M: 模型(Model) data中的数据
        * V: 视图(View) 模板代码
        * VM: 视图模型(ViewModel) Vue实例
    Vue的对象实例上,有传入的data中的数据,也还有Vue给我们封装的方法和属性,方便我们使用
-->

<div id="root">
    姓名: {{name}} <br> <!--视图 View-->
    年龄: {{age}} <br>
</div>

<script>
    Vue.config.productionTip = false;

    const vm = new Vue({ // 视图模型 ViewModel
        el: '#root',
        data() { // 模型 Model
            return {
                name: '小孙',
                age: 18
            }
        }
    })
</script>
```

# Vue的数据代理

## Object.defineproperty()

```javascript
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

## 数据代理

```js
// 数据代理: 通过对一个对象的属性的操作,从而可以对另一个对象的属性进行操作

let obj1 = {
    x: 100
}

let obj2 = {}

// 通过给obj2添加一个obj1的x属性,再设置get()和set(),从而完成数据代理, 此时obj2里有obj1的属性x
// * 修改了obj2的属性x,也会修改obj1的属性x
// * 修改了obj1的属性x,也会修改obj2的属性x
Object.defineProperty(obj2, 'x', {
    // 通过get()获取x的值
    get(){
        return obj1.x;
    },
    // 通过set()修改x的值,如果修改了obj2的x属性的值,那么obj1的x属性的值也会被修改
    set(value) {
      obj1.x = value;
    }
})
```

## Vue的数据代理(详解)

<img src="https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521018.png" alt="image-20220221085543670"  />

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521019.png)


```html
<div id="root">
    姓名: {{name}} <br>
    地址: {{address}} <br>
</div>

<script>
    /*
        对data配置项中属性进行加工处理,然后在vm里添加一个_data对象属性,做了类似于_data = data的操作后,_data里存储的就是加工后的属性, 即vm._data.name和vm._data.age, 私有化的name和age属性, 生成对应的getter()和setter()

        通过对vm._data做数据代理,vm里也包含了name和age属性,同时也包含响应的getter和setter, 即vm.name,vm.age

        在vm中,会将传入的data参数里的 每一个数据 通过defineProperty()追加到vm上(封装起来),以及生成对应的getter()和setter(),这样就可以更为方便的对数据进行操作, 比如: 针对这里的data
            * 会在vm对象中,生成对应的 name和age 属性,然后会生产 name和age 对应的 getter()和setter(),
            * 同时vm里会生成一个_data对象属性,name和age也会在_data属性中也要一份数据代理,所以我们同样可以通过 vm._data.name来获取name属性...
            * 我们获取name,会调用name的getter(),我们对name进行赋值操作,会调用name的setter()
    */
    const vm = new Vue({
        el: '#root',

        data: {
            name: 'sun',
            age: 18
        }
    });

    console.log(vm._data);
    console.log(vm._data.name); // 'sun'
    console.log(vm._data.age); // 18


    console.log(vm.name); // 'sun'
    console.log(vm.age); // 18
</script>
```

# 事件处理

## 事件绑定

```html
<!--
    * v-on:click 表示绑定click事件, 点击后会调用 showInfo1()
    * @click 是简写, 比如: @click 点击事件, @blur 失去焦点事件, @keyup 键盘弹起事件
    * 可以向方法中传入参数
        * 如果 不写参数, 底下方法默认接受到的 参数为event(即事件对象)
        * 如果 写参数, 底下方法接受到的就是 形参
        * 可以通过 $event 表示 事件对象的占位符,比如这里: 第一个传入的是event对象,第二个是传入的参数 10
-->
<div id="root">
    <button v-on:click="showInfo1">点我1</button>
    <button @click="showInfo2($event, 10)">点我2</button>
</div>

<script>
    const vm = new Vue({
        el: '#root',
        data: {
            name: '小孙',
            age: 18
        },
        // 在methods配置项里的方法,会被封装到vm下,但是不会进行数据代理
        methods: {
            // 和js一样,可以获取到 event事件对象
            showInfo1(event) {
                alert('1 你好');
                console.log(this); // vm,即当前所创建的Vue对象实例
                console.log(event);
            },

            // 上面是"showInfo2($event, 10)"表示第一个参数为 event事件对象, 第二个参数 为一个具体的参数值
            showInfo2(event, number) {
                alert(number + ' 你好');
                console.log(event);
            }
        }
    })
</script>
```

## 事件修饰符

Vue中的时间修饰符: 

* prevent: 阻止默认事件 (常用)
* stop: 阻止事件冒泡 (常用)
* once: 事件只触发一次 (常用)
* capture: 使用事件捕获模式
* self: 只有event.target是当前操作元素才出发事件
* passive: 事件的默认行为立即执行,无需等待事件回调执行完毕

注意: 事件修饰符可以连续使用, 比如: @click.prevent.stop=“showInfo” 表示阻止该事件的默认行为的同时,也阻止了事件冒泡

```html
<div id="root">
    <!--
        prevent: 阻止默认事件 (常用), 效果类似于 event.preventDefault()
            * 如果不添加 prevent, 点击a标签后,会先执行showInfo(),然后 执行 a标签的默认行为(即会跳转页面到href的位置)
            * 如果添加了 prevent, 点击了a标签后,会先执行showInfo(),然后 阻止 a标签的默认行为(即不会跳转页面)
    -->
    <a href="https://www.baidu.com" @click.prevent="showInfo">prevent测试</a>

    <!--
        stop: 阻止事件冒泡 (常用),效果类似于 event.stopPropagation()
            * 事件的执行是由 捕获 + 冒泡 完成的,在捕获阶段会从外向里,捕获事件,然后在冒泡阶段,从里向外进行冒泡,同时也会执行回调函数
            * 如果不添加 stop, 这里会先执行showInfo2()然后执行showInfo1()
            * 如果添加了 stop, 就会执行showInfo2(),然后就不会进行向上冒泡处理,即不会执行showInfo1()
            * 注意: 这里的stop是给 '.div2' 添加的,因为要在 '.div2' 的位置停止冒泡,如果 '.div1' 的外面还有click事件,而我们想要在 '.div1' 的位置停止冒泡,就需要在 '.div1' 处添加 stop
    -->
    <div @click="showInfo1" class="div1">
        <div @click.stop="showInfo2" class="div2">stop测试</div>
    </div>


    <!--
        once: 事件只触发一次 (常用)
            * 如果没有添加 once, 每点击一次div,就会触发一次click事件,即先执行 回调函数showInfo(),然后执行默认行为
            * 如果添加了 once, 当点击过一次div后,就会触发一次click事件,后面再点击就不会触发click事件
     -->
    <div @click.once="showInfo">once测试</div>

    <!--
        capture: 使用事件捕获模式
            * 事件的执行是由 捕获 + 冒泡 完成的,通常是在冒泡阶段执行事件
            * 如果不添加 capture, 就是默认在冒泡阶段执行事件(即从里向外进行冒泡,一边冒泡,一边执行事件,所以是 先执行 里面的showInfo2(), 后执行 外面的showInfo1())
            * 如果添加了 capture, 就会在捕获阶段执行事件(即从外向里进行捕获click事件,一边捕获,一边执行事件,所以是 先执行  外面的showInfo1(), 然后执行 里面的showInfo2())
            * 注意: capture 是添加在 外面的元素上, 因为捕获是从外向里捕获的, 表示从 '.div1' 开始向里的所有绑定了click事件的元素都是捕获阶段执行事件
    -->
    <div @click.capture="showInfo1" class="div1">
        <div @click="showInfo2" class="div2">capture测试</div>
    </div>

    <!--
        self: 只有event.target是当前操作元素才出发事件
            * event.target 会返回该触发事件的对象, 通过添加 self 可以达到阻止冒泡的效果
            * 如果不添加 self, 点击 '.div2' 后, '.div2' 会先执行click事件,然后冒泡到 '.div1' ,执行 '.div1' 的click事件
            * 如果添加了 self, 点击 '.div2' 后, '.div2' 会先执行click事件,然后冒泡到 '.div2' ,这里会判断 '.div1' 的 event.target 是否指向的 该元素,这里 event.target 是 '.div2' ,所以这里就不会执行 '.div1'的click事件
            * 注意: self 要给外层的 '.div1'加, 表示 冒泡到 '.div1' 时,判断 event.target 是否指向 '.div1'
    -->
    <div @click.self="showTarget" class="div1">
        <div @click="showTarget" class="div2">self测试</div>
    </div>

    <!--
        passive: 事件的默认行为立即执行,无需等待事件回调执行完毕
            * 如果不添加 passive, 会先执行 回调函数show,等show()将100000个'#'输出完了,才会执行默认行为,即向下滚动一下
            * 如果添加了 passive, 会立即执行默认行为, 即向下滚动一下, show()也会同步执行
            * 不是每个事件 都会等待回调函数执行完毕后,才去执行默认行文, 比如 scroll就会立即执行默认行为
        scroll 和 wheel 事件
            * scroll: 只要滚动条 每移动1px,就触发一次该事件, 如果 滚动条 到底了, 还往下 滚动,就不会触发该事件
            * wheel: 鼠标的滚轮 每滚动一个刻度,就触发一次该事件, 如果 拖动 滚动条,就不会触发该事件
    -->
    <ul @wheel.passive="show">
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
    </ul>

</div>

<script>
    const vm = new Vue({
        el: '#root',
        methods: {
            showInfo() {
                console.log('showInfo()执行了');
            },
            showInfo1() {
                console.log(1);
            },
            showInfo2() {
                console.log(2);
            },
            // e.target 表示 触发了该事件的对象, 比如: 给 '.div2' 添加了click事件, 点击 '.div2', e.target就是'.div2'
            // 当然会有冒泡机制, 如果 '.div2' 外面有一个 '.div1'也绑定了click事件,点击了'.div2'后, 会先执行'.div2'的click事件,通过冒泡机制,'.div1'也会触发click事件,同时它的 e.target 指向的还是 '.div2', 注意这里的 e.target是指向的 里面'.div2' 而不是 '.div1'
            showTarget(e) {
                console.log(e.target);
            },
            show() {
                for (let i = 0; i < 100000; i++) {
                    console.log('#');
                }
            }
        }
    })
</script>
```

## 键盘事件

```html
<!--
	键盘相关的事件
		* @keyup 按键抬起
        * @keydown 按键按下
    通过 别名 绑定事件(推荐)
        * 常用按键: a, b, c, d....
        * 特殊按键:
            * 常用的 特殊按键别名:
                * 回车: enter
                * 删除, 退格: delete (捕获 'delete' 和 'back' 按键)
                * 退出: esc
                * 空格: space
                * 换行: tab (特殊
                * 上: up
                * 下: down
                * 左: left
                * 右: right
            * 不常用的 特殊按键别名: 度需要遵循以下的规则
                * CapsLock(切换大小写): caps-lock:
                * ...
         * 系统修饰按键: ctrl, alt, shift, meta(win/command)
            * 搭配 @keydown 正常
            * 搭配 @keyup 需要按下 该键 + 普通按键,然后松开普通按键触发事件, 比如: 按住 ctrl + i,然后松开i,触发键盘事件

    通过 keyCode值 绑定事件(不推荐), 比如 Enter键的keyCode值为13,可以用 @keyup.13="showInfo"来绑定事件

    通过 Vue.config.keyCodes.自定义键名 = 键码(不推荐), 可以去定制按键别名
-->

<div id="root">
    <p>欢迎,{{name}}</p>
    <!--
        这里的 @keyup.enter="showInfo" 表示 当抬起enter键之后就会触发事件,调用showInfo(), @keyup.enter 也可以写成 @keyup.Enter
        如果想要按下 ctrl + y 然后才会触发事件, 就可以写 @keyup.ctrl.y
    -->
    <input type="text" placeholder="请输入内容" @keyup.enter="showInfo">
</div>

<script>
    // 自定义 keyCode为13 的 按键的别名 是 huiChe,我们后面就可以通过 'huiChe' 来绑定事件
    Vue.config.keyCodes.huiChe = 13;

    let vm = new Vue({
        el: '#root',
        data: {
            name: '小孙'
        },
        methods: {
            showInfo(e) {
                /*
                e.key 是 按键名(比如Enter, Space)
                e.keyCode 是 按键的keyCode值
                e.target.value 是 输入框里的内容
               */
                console.log(e.key, e.keyCode, e.target.value);
            }
        }
    })
</script>
```

# computed配置项

## 基本使用

```html
<!--
computed 计算属性
* 要用的属性不存在,要通过已有的属性计算得来, 可以在vm._computedWatchers下访问到
* 该属性会进行数据检测和数据代理, 即能在vm下访问到,也会生成setter()和getter()
* 优势: 与methods实现相比, 内部有缓存机制(复用),效率更高,调试方便
-->

<div id="root">
    姓: <input type="text" v-model="firstName"> <br>
    名: <input type="text" v-model="lastName"> <br>
    全民: <input type="text" v-model="fullName">
</div>

<script>
    let vm = new Vue({
        el: '#root',
        data: {
            firstName: '张',
            lastName: '三'
        },
        computed: {
            // fullName是一个计算属性, 是通过 普通属性 firstName和lastName计算出来的
            fullName: {
                // 当访问fullName时, 就调用get()
                // * 第一次访问完fullName,会在计算机里留一个缓存,当后面再次访问时,就会调用计算机里的缓存,不会调用这里的get()
                // * 当firstName和lastName被修改时,就会重新调用get(),然后再次做一个缓存
                get() {
                    console.log(this); // vm, 这里的this指向的是调用它的vm,所以可以通过this来获取很多属性和方法
                    return this.firstName.slice(0, 1) + ' - ' + this.lastName.slice(0, 2);
                },

                // 当修改fullName时,就会调用set()
                // 逻辑顺序: 在页面中修改fullName后,会自动调用这里的set(),我们在set()中修改firstName和lastName的值,因为这两个属性都是响应式的,他们一修改,就会引发模板的重新解析,就会更新页面中的firstName和lastName的值       
                set(value) { // fullName要修改的值
                    // 因为fullName是由firstName和lastName计算出来的,所以我们想要修改,得修改firstName和lastName的值才可以, 直接修改fullName的值是不可行的

                    // 因为 value 是 '张-三' 的形式,所以我们可以根据 '-' 将该字符串分割成一个数组
                    const arr = value.split('-');
                    // 修改firstName和lastName的值,从而达到修改fullName值的效果
                    this.firstName = arr[0];
                    this.lastName = arr[1];

                    console.log(this); // vm
                }
            }
        }
    })
</script>
```

## 简写形式

```js
// 当 计算属性,只需要getter(),不需要setter()时,可以采取以下的简写方式
// 正常开发中,我们使用计算属性都是展示的,不会更改,所以可以大量使用简写
computed: {
    // 这里的fullName以一个function()的形式展现,这个方法,就表示getter()
    // 注意: 这里只是一个方法的形式编写,底层还是会把fullName作为一个属性挂载到vm下,所以上面访问时,应该是{{fullName}},而不是{{fullName()}
    fullName() {
        console.log('get()执行了');
        console.log(this); // vm
        return this.firstName + ' - ' + this.lastName;
    }
}
```

# watch配置项

## 基本使用

```html
<!--
    watch 监视属性
        * 当被监视的属性变化时,回调函数handler()自动调用,进行相关的操作
        * 监视的两种写法:
            * new Vue里插入watch配置属性
            * 通过vm.$watch监视
-->

<div id="root">
    <h1>今天天气{{info}}, {{x}}</h1>

    <button @click="changeWeather">切换天气写法1</button>

    <!--
        可以在绑定事件里写一些简单的js语句,但不要太复杂了
        注意: 在模板中,我们直接访问的vm下的属性和方法,所以这里直接访问isHot和x
    -->
    <button @click="isHot = !isHot; x++">切换天气写法2</button>
</div>

<script>
    let vm = new Vue({
        el: '#root',
        data: {
            isHot: true,
            x: 1,
        },
        computed: {
            info() {
                return this.isHot ? '炎热' : '凉爽';
            }
        },
        methods: {
            changeWeather() {
                this.isHot = !this.isHot;
                (this.x)++;
            }
        },
        // 监视(写法1)
        watch: {
            // 监视isHot属性
            isHot: {
                // 当页面初始化时(即刚刷新),就调用一次handler()
                immediate: true,
                // 当isHot的值发生变化时,handler就会调用一次
                handler(newValue, oldValue) {
                    // newValue 修改前的值
                    // oldValue 修改后的值
                    console.log('watch被监视了', newValue, oldValue)
                }
            },

            // 监视info属性,不仅仅可以监视普通属性,也可以监视计算属性
            info: {
                handler(newValue, oldValue) {
                    console.log('info被监视了', newValue, oldValue);
                }
            }
        }
    })

    // 监视(写法2)
    vm.$watch('isHot', {
        immediate: true,
        handler(newValue, oldValue) {
            console.log('isHot被监视了', newValue, oldValue);
        }
    })
</script>
```

## 深度监视

```html
<!--
    深度监视:
        * Vue中的watch默认不监视对象内部的改变(即只监视一层)
        * 配置了deep:true后,就可以监视对象内部值的改变(即可以监视多层)
    注意:
        * Vue自身是可以监视对象内部的值的改变的,但是Vue提供的watch配置,默认不可以(因为只监视一层效率高)
        * 使用watch时根据数据的具体结构,决定是否采用深度监视
-->

<div id="root">
    <p>a: {{numbers.a}}, b: {{numbers.b}}</p>
    <button @click="numbers.a++">点我a++</button>
    <button @click="numbers.b++">点我b++</button>
</div>

<script>
    let vm = new Vue({
        el: '#root',
        data: {
            numbers: {
                a: 10,
                b: 20
            }
        },
        watch: {
            // 如果只是修改了numbers.a的值和numbers.b的值,numbers的监视是不会触发的, 因为numbers指向的地址没有改变,改变的只是该地址中里存储的数据
            // * 如果我们改变了numbers的指向,即指向了一个新的地址,numbers就会被监视到发生了改变
            // * 如果我们想要在不修改numbers的指向,而是修改numbers里的属性的值时,numbers也会被监视到,就需要添加 deep: true, 表示 深度监视
            numbers : {
                deep : true,
                handler() {
                    console.log('numbers 发生了改变');
                }
            },

            // 因为 这里是 key : value 的键值对,key为字符串,我们之前写的时候,都是简写,所以不需要加 '',这里需要通过对象来访问其属性了, 所以需要加 ''
            'numbers.a': {
                handler() {
                    console.log('numbers.a 发生了改变');
                }
            },
            'numbers.b': {
                handler() {
                    console.log('numbers.b 发生了改变')
                }
            }
        }
    });
</script>
```

## 简写形式

```html
<div id="root">
    <p>number1: {{number1}}</p>
    <button @click="number1++">点我</button>
    <p>number2: {{number2}}</p>
    <button @click="number2++">点我</button>
</div>

<script>
    let vm = new Vue({
        el: '#root',
        data: {
            number1: 10
        },
        watch: {
            // 简写形式, 当不需要写immediate和deep的时候, 就可以用简写形式
            number1: function (newValue, oldValue) {
                console.log('number2发生了改变', newValue, oldValue);
            },
            // 再对象解构,简化一下
            number2(newValue, oldValue) {
                console.log('number3发生了改变', newValue, oldValue);
            }
        }
    });
    // 简写形式, 当不需要写 immediate和deep 的时候, 就可以用简写形式
    vm.$watch('number1', function (newValue, oldValue) {
        console.log('number2发生了改变', newValue, oldValue);
    });
</script>
```

# Vue中的this指向问题

```html
<!--
    原则;
    * 所有被vue管理的函数, 最好都写成普通函数,这样this就指向了vm或组件实例对象
    * 所有不被vue管理的函数(定时器的回调函数,ajax的回调函数,Promise的回调函数...),最好写成箭头函数,不然会导致this的指向发生改变,从而无法访问vm下的成员
-->

<div id="root">
    <h1>内容 {{info}}</h1>
    <button @click="content='sun'">点我显示内容</button>
</div>

<script>
    let vm = new Vue({
        el: '#root',
        data: {
            content: '',
            info: ''
        },
        watch: {
            // 监视content,点击了button后,修改了content的值,调用这里的方法
            content(val) {
                // 这里是 window.setTimeout() 是一个定时器
                // 注意这里必须使用 箭头函数, 如果使用传统函数表达式, 那么this的指向就会被修改成 window,那么就不能通过this来访问info了
                setTimeout(() => {
                    this.info = val;
                    console.log(this); // vue
                }, 1000);
            }
        }
    });
</script>
```

# 绑定样式

## 绑定class样式

```html
<!--
    绑定class样式:
        * 字符串写法, 适用于: 样式的类名不确定,需要动态指定
        * 数组写法, 适用于: 要绑定的样式个数不确定,名字也不确定
        * 对象写法, 适用于: 要绑定的样式个数确定,名字也确定,但是要动态决定用不用
-->

<head>
    <meta charset="UTF-8"/>
    <title>Title</title>
    <!--引入开发版本的vue-->
    <script src="vue.js"></script>
    <style>
        .box {
            width: 100px;
            height: 100px;
            border: 1px solid #999;
        }
        .style1 {
            background-color: red;
        }
        .style2 {
            width: 200px;
        }
        .style3 {
            height: 200px;
        }
    </style>
</head>

<body>
<div id="root">
    <!--
        绑定class样式(字符串写法), 适用于: 样式的类名不确定,需要动态指定
        
         :class 表示 Vue里的动态绑定, 'style' 为 Vue里的data配置里的属性, 'style' 的值 就表示 绑定了什么class类
    -->
    <div class="box" :class="style" @click="changeStyle"></div>

    <!--
        绑定class样式(数组写法), 适用于: 要绑定的样式个数不确定,名字也不确定
    -->
    <div class="box" :class="styleArr"></div>
    <!--
        Array 的 几个 添加和删除的方法
            arr.shift()          删除 arr数组 的第一个元素
            arr.unshift('str')   添加 'str' 字符串 到arr数组的第一个位置
            arr.pop()            删除 arr数组 的最后一个元素
            arr.push('str')      添加 'str' 字符串 到arr数组的最后一个位置
    -->
    <button @click="styleArr.shift()">删除style1</button>
    <button @click="styleArr.unshift('style1')">添加style1</button>

    <!--
        绑定class样式(对象写法), 适用于: 要绑定的样式个数确定,名字也确定,但是要动态决定用不用
        
        styleObj对象属性里有两个属性,可以分别设置 style2和style3 的添加或是不添加
        通过修改 styleObj.style2 = true / false 就可以决定是否添加该class样式
    -->
    <div class="box" :class="styleObj"></div>
    <button @click="styleObj.style2 = !styleObj.style2">切换样式2</button>
    <button @click="styleObj.style3 = !styleObj.style3">切换样式3</button>
</div>

<script>
    let vm = new Vue({
        el: '#root',
        data: {
            // 字符串写法
            style: 'style1',
            // 数组写法
            styleArr: ['style1', 'style2', 'style3'],
            // 对象写法
            styleObj: {
                style2: false,
                style3: true
            }
        },
        methods: {
            changeStyle() {
                // 修改 'bgc' 的值为 'style2'
                this.style = 'style2';
            }
        }
    });
</script>
</body>
```

## 绑定style样式

```html
<div id="root">
    <!--绑定style样式, 对象写法-->
    <p :style="styleObj">hello, 我是小孙</p>
    <!--绑定style样式, 数组写法-->
    <p :style="styleArr">hello, 我是小孙</p>
</div>

<script>
    let vm = new Vue({
        el: '#root',
        data: {
            fsize: 40,
            styleObj: {
                fontSize: '40px'
            },
            styleArr: [
                {
                    fontSize: '50px'
                },
                {
                    color: 'red',
                }
            ]
        }
    });
</script>
```
# 内置指令

## v-show, v-if

```html
<div id="root">
    <!--表示 是否隐藏该元素, 如是是false 就会将其隐藏起来,就是添加了一个 style="display: none" 的样式-->
    <p v-show="false">我是小孙</p>
    <!--表示 是否删除该元素, 如果是false 就会直接删除该元素,注意不是隐藏起来-->
    <p v-if="false">我是大孙</p>
    <!--
        v-show 和 v-if 的值可以是 true / false / boolean的表达式(1 === 2之类的) / data配置中的属性
        v-show 适用于 使用频率高的项目, 因为 v-if 是在 页面中 不停的 删除/添加 一个元素, 效率肯定没有 隐藏/显示 效率高
    -->

    <!-- v-if, v-else-if, v-else 和 普通的 if, else if, else的逻辑是一模一样的 -->
    <p v-if="n === 1">我是内容1</p>
    <p v-else-if="n === 2">我是内容2</p>
    <!-- 注意: v-else-if会检测前一个标签是否有 v-if或者v-else-if,如果没有就会报错,所以我们不能在v-else-if前面放 一个别的标签,v-else也是同理 -->
    <p v-else-if="n === 3">我是内容3</p>
    <p v-else="n === 4">我是内容4</p>
    <button @click="n++">点我 n++</button>

    <!--
        v-if 和 template 的配合使用
            * 如果我们使想要 通过 v-if 控制 添加/删除 的多个标签元素,采用 v-if 是会破坏样式结构的,不可取.
            * template 标签 是不会在页面渲染的时候显示出来的,所以可以用来包裹一些标签元素,做一些特殊的效果(即template的内容的层级关系没有受到影响,页面中不会有template的标签元素)
        注意: template 只能搭配 v-if 来使用, v-show 用不了
    -->
    <template v-if="false">
        <h1>标题</h1>
        <p>内容</p>
        <h1>结尾</h1>
    </template>
</div>

<script>
    let vm = new Vue({
        el: '#root',
        data: {
            n: 0
        }
    });
</script>
```

## v-text, v-html

> v-text

```html
<div id="root">
    <p>{{str1}}</p>
    <!--
        v-text效果就和上面的{{str}}插值语法一个用法, 将str属性的内容按照文本格式渲染到页面中

        如果当前标签有内容,比如这里的p标签中有'sun', v-text会将其覆盖掉

        因为是按照文本的格式渲染,所以如果传过来一个'<h3>我是h3标题</h3>'在页面还是输出'<h3>我是h3标题</h3>',不会渲染成html格式
    -->
    <p v-text="str1">sun</p>
    <p v-text="str2"></p>
</div>

<script>
    const vm = new Vue({
        el: '#root',
        data: {
            str1: 'hello world',
            str2: '<h3>我是h3标题</h3>'
        },

    })
</script>
```

> v-html

```html
<div id="root">
    <!--
        v-html 相比 v-text的区别就在于, v-html是将内容按照html的形式渲染到页面上
        v-html 存在安全性问题!!!
            * 在网站上动态渲染任意html是非常危险的,容易XSS攻击
            * 一定要在可信的内容上使用v-html,永远不要在用户提交的内容上使用!!!
    -->
    <p v-html="str1"></p>
    <p v-html="str2"></p>
</div>

<script>
    const vm = new Vue({
        el: '#root',
        data: {
            str1: 'hello world',
            str2: '<h3>我是h3标题</h3>'
        },

    })
</script>
```

## v-for

> 基本使用

```html
<div id="root">
    <!--遍历 数组-->
    <ul>
        <!--
            通过 v-for 遍历 personList数组 中的 每个元素
                * person 为 personList中的每个元素
                * index 为 该person的索引(从0开始)
            "in"可以用"of"来代替,就和js的for一样
            :key 表示 该元素的唯一标示(即每个元素的:key不能重复),必须填写,可以用该person对象的id属性来标示,也可以用index来标示
        -->
        <li v-for="(person, index) in personList" :key="person.id">
            {{person.name}} - {{person.age}} - {{index}}
        </li>
    </ul>

    <!--遍历 对象-->
    <ul>
        <!-- k 为 Cat对象的key, v 为 Cat对象的value -->
        <li v-for="(v, k) in Cat" :key="k">
            {{k}} - {{v}}
        </li>
    </ul>

    <!--遍历 字符串-->
    <ul>
        <li v-for="(val, index) in str" :key="index">
            {{index}} - {{val}}
        </li>
    </ul>

    <!--遍历 指定数字-->
    <ul>
        <!--
            val 为 从 1 - 10 的数字
            index 为 索引(从0开始)
        -->
        <li v-for="(val, index) in 10">
            {{index}} - {{val}}
        </li>
    </ul>
</div>

<script>
    let vm = new Vue({
        el: '#root',
        data: {
            personList: [
                {id: '001', name: '张三', age: 18},
                {id: '002', name: '李四', age: 19},
                {id: '003', name: '王五', age: 20}
            ],
            Cat: {
                name: 'sun',
                age: 2,
                favor: '猫粮'
            },
            str: 'Hello'
        }
    });
</script>
```

> :key的原理

key是虚拟DOM对象的标识, 每个虚拟DOM对象都会带有key(如果我没有手动添加,就会默认为v-for里的index), 当数据发生变化时,Vue会根据"新数据"生成"新的虚拟DOM",然后Vue进行"新虚拟DOM"和"旧虚拟DOM"的差异比较, 最后是 生成/使用 "真实DOM"

比较规则: 

* 如果 "旧虚拟DOM" 中 找到了与 "新虚拟DOM" 相同的key
    * 若 "虚拟DOM" 中内容没变, 直接使用 "旧真实DOM"
    * 若 "虚拟DOM" 中内容变了, 则生成 "新真实DOM", 然后替换掉页面中的 "旧真实DOM"
* 如果 "旧虚拟DOM" 中 未找到与 "新虚拟DOMM" 相同的key
    * 创建 "新真实DOM", 随后渲染到页面中

用 index 作为 key 可能引发的问题: 

* 若对数据进行: 逆序添加, 逆序删除,等破坏顺序的操作 -- 会产生没必要的真实DOM更新,界面效果没问题,但效率低
* 如果结构中还包含输入类的DOM -- 界面会产生问题

开发中如何选择 key

* 最好使用每条数据的`唯一标识`作为key, 比如: id, 手机号, 身份证号, 学号...
* 如果不存在对数据的逆序添加, 逆序删除等破坏操作, 仅用于 渲染列表,展示... 就可以使用index来做为key

## v-cloak

```html
<head>
    <meta charset="UTF-8"/>
    <title>Title</title>
    <!--引入开发版本的vue-->
    <script src="vue.js"></script>

    <style>
        /* 选中带有 v-cloak属性的标签 */
        [v-cloak] {
            display: none;
        }

    </style>
</head>

<body>
<div id="root">
    <!--
		给p标签添加了v-cloak属性,当页面的js文件加载出来之后,就会立即删除v-cloak属性

        当网速较慢时,页面中有很多没有进行解析的标签,如果直接放{{name}}在页面上很丑,所以我们可以采取v-cloak,搭配style样式来编写, 通过[v-cloak]{}选择器 选中带有v-cloak属性的标签,让他们都隐藏起来,当js文件加载出来之后,v-cloak属性被删除, [v-cloak]就选中不了该标签了,该标签就很自然的显现出来了
			/* css代码,选中所有到v-cloak属性的标签,让他们隐藏起来 */
			[v-cloak] {
				display: none;
			}
    -->
    <p v-cloak>{{name}}</p>
</div>

<script>
    const vm = new Vue({
        el: '#root',
        data: {
            name: 'sun'
        },

    })
</script>

<script>Vue.config.productionTip = false;</script>
</body>
```

## v-once

```html
<!--
    v-once所在的结点在初次动态渲染之后,就视为静态内容了
    以后数据的改变不会引起v-once所在结构的更新,可以用于优化性能
-->

<div id="root">
    <!--添加了v-once之后,n的值,就会是第一次动态渲染之后的值,后面就不会再变化了-->
    <p v-once>初始化的n的值: {{n}}</p>
    <p>现在的n的值: {{n}}</p>
    <button @click="n++">点我n++</button>
</div>
```

## v-pre

```html
<!--
    v-pre 添加了之后,会跳过其的编译阶段,即Vue不会解析该模板
    给 没有 指令语法,插值语法 的语句添加 v-pre 可以提高编译效率
-->

<div id="root">
    <p v-pre>我是p标签</p>
    <!--给p添加了v-pre之后,Vue会跳过解析该模板,即在页面中会显示"{{n}}", 而不是n的值-->
    <p v-pre>{{n}}</p>
</div>
```

# 自定义指令(directives配置项)

## 基本使用 

```html
<div id="root">
    <!--需求1: 定义一个v-big指令, 和v-text功能类似,但会把绑定的值放大10倍-->
    <p>当前n的值: <span v-text="n"></span></p>
    <p>十倍之后的值: <span v-big="n"></span></p>
    <button @click="n++">点我n++</button>

    <!--需求2: 定义一个v-fbind指令, 和v-bind功能类似,但是可以让其所绑定的input元素默认获取焦点-->
    <input type="text" v-fbind="n">
</div>

<script>
    const vm = new Vue({
        el: '#root',
        data: {
            n: 1
        },
        // 在directives配置项中编写自定义指令
        directives: {            
            /*
            	简写形式: 编写v-big指令
            	
                big()的调用时机
                	* 第一次绑定的时候调用一次
                	* 当模板重新解析的时候,也会调用
            */
            big(element, binding) {					
                // * element 真实DOM,在这里就是添加了该big指令的span标签
				// * binding 一个对象,该对象包含了v-big="n"里n的值,我们通常用到 binding.value 这个属性来获取这个n的值
                
                // 放大数值
                element.innerText = binding.value * 10;
                
                // 验证element是HTMLElement的实例
                console.log(element instanceof HTMLElement); // true 
            },

            // 完整形式: 编写v-fbind指令
            fbind: {
                // 指令所在元素成功绑定时(一上来),调用该方法
                bind(element, binding) {
                    element.value = binding.value;
                },
                // 指令所在元素被插入到页面时(即该元素已经创建好),调用该方法
                inserted(element, binding) {
                    // 让该元素获得焦点, 因为 获得焦点这个属性,是要在浏览器中交互显示的,当该标签还没有创建好的时候,添加element.focus()是不管用的(即在bind(){...}编写element.focus()是不管用的,因为那个时候,element元素还没有创建好,只是刚做好链接操作)
                    element.focus();
                },
                // 指令所在模板被重新解析时,调用该方法
                update(element, binding) {
                    console.log(binding)
                    element.value = binding.value;
                }
            }
        }
    })
</script>
```

## 使用细节

> 指令里的this指向

```js
directives: {
    big(element, binding) {
        // 注意: 所有与指令相关的方法里,this指向永远都是window,而不是vm
        console.log(this); // window
    }
}
```

> 指令的命名

```html
<div>
    <!--这里的命名采用 '-' 来连接多个字符,而不是驼峰命名法-->
    <p>十倍之后的值: <span v-big-nunber="n"></span></p>
    <button @click="n++">点我n++</button>
</div>    

<script>
    const vm = new Vue({
        el: '#root',
        data: {
            n: 1
        },
        directives: {
            // 遇到多个单词拼接的名字,就编写完整的,我们之前写的 big: function(element, binding) {} 都是简写, 因为这里都是以键值对的形式编写的,第一个'big'就是可以key,应该是字符串,只不过vue帮我们简写了
            'big-number': function (element, binding) {}
        }
    })
</script>
```

> 局部作用, 全局作用

```html
<div id="root1">
    <p>十倍之后的值: <span v-big1="n"></span></p>
</div>
<div id="root2">
    <p>十倍之后的值: <span v-big2="n"></span></p>
</div>
<script>
    // 全局作用 使用方法和注意事项 和 过滤器一模一样
    Vue.directive('big2', function (element, binding) {
        element.innerText = binding.value * 20;
    });

    const vm = new Vue({
        el: '#root1',
        data: {
            n: 1
        },
        directives: {
            // 局部作用 
            big1(element, binding) {
                element.innerText = binding.value * 10;
            }
        }
    })

    new Vue({
        el: '#root2',
        data: {
            n: 2
        },

    })
</script>
```

# 列表操作

## 列表过滤

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521020.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521021.png)

> watch实现

```html
<div id="root">
    <input type="text" placeholder="请输入搜索" v-model="keyWords">
    <ul>
        <li v-for="(person, index) in filterPersonList" :key="person.id">
            {{person.name}} - {{person.age}}
        </li>
    </ul>
</div>

<script>
    let vm = new Vue({
        el: '#root',
        data: {
            keyWords: '',
            personList: [
                {id: '001', name: '马冬梅', age: 18},
                {id: '002', name: '周冬雨', age: 19},
                {id: '003', name: '周杰伦', age: 20},
                {id: '004', name: '温兆伦', age: 21}
            ],
            filterPersonList: []
        },
        watch: {
            keyWords: {
                // 刚刷新页面的时候,就立即执行一次handler()
                immediate: true,
                handler(val) {
                    // filter() 是数组的过滤函数, 会根据传入的函数来进行判断每个元素是否过滤掉,然后返回一个新的数组(注意: 原来的数组不会发生改变)
                    this.filterPersonList = this.personList.filter((person) => {
                        // str.indexOf('abc') 查找 str 字符串 是否含有子串'abc', 如果有,则返回'a'在str中的下标,如果没有则返回-1, 所以这个方法可以用来判断是否含有某个子串
                        // 细节: indexOf() 在判断是否含有 '' (即空)的时候,是会返回 0, 即判断含有该子串,所以此时filterPersonList中是含有personList的所有元素的. 我们可以利用这点,让页面一刷新,就立即执行一次handler(),然后页面就会一上来就含有所有的元素
                        return person.name.indexOf(val) !== -1;
                    });
                }
            }
        }
    });
</script>
```

> computed实现

```js
computed: {
    // filterPersonList一个是由personList计算得来的的计算属性
    // 这里的computed里的filterPersonList() 是 filterPersonList的get()的简写,所有我要返回一个值给filterPersonList
    filterPersonList() {
        // 这里的返回的是一个personList经过过滤之后的数组, 向filter()里传入传入一个函数(该函数有具体的过滤规则)
        return this.personList.filter((person) => { // 这里的person是personList的每个元素
            return person.name.indexOf(this.keyWords) !== -1
        })
    }
}
```

## 列表排序

```html
<!--
    添加三个button按钮, 当点击了该按钮后,会修改data配置里的sortType属性的值
        * sortType: 0 代表 原顺序
        * sortType: 1 代表 升序
        * sortType: 2 代表 降序
    在computed的filterPersonList的getter()里 先过滤数据,得到过滤好数据的数组后,进行排序操作,最后将该数组返回
-->

<div id="root">
    <input type="text" placeholder="请输入搜索" v-model="keyWords">
    <button @click="sortType = 0">原顺序</button>
    <button @click="sortType = 1">升序</button>
    <button @click="sortType = 2">降序</button>
    <ul>
        <li v-for="(person, index) in filterPersonList" :key="person.id">
            {{person.name}} - {{person.age}}
        </li>
    </ul>
</div>

<script>
    let vm = new Vue({
        el: '#root',
        data: {
            sortType: 0,
            keyWords: '',
            personList: [
                {id: '001', name: '马冬梅', age: 30},
                {id: '002', name: '周冬雨', age: 19},
                {id: '003', name: '周杰伦', age: 20},
                {id: '004', name: '温兆伦', age: 21}
            ],
        },
        computed: {
            filterPersonList() {
                let tempList =  this.personList.filter((person) => { // 这里的person是personList的每个元素
                    return person.name.indexOf(this.keyWords) !== -1
                })
                // 如果 当前的sortType不为0,即为1或2时,就进行排序(因为0为原顺序,不需要排序)
                if (this.sortType) {
                    tempList.sort((p1, p2) => { // p1, p2 为 tempList里的元素,该方法,会一次向后遍历排序
                        return this.sortType === 1 ? p1.age - p2.age : p2.age - p1.age;
                    })
                }
                return tempList;
            }
        }
    });
</script>
```

# Vue2的数据检测原理

## 对象的数据监测

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521019.png)

```js
// 模拟一下 Vue检测数据的操作

// 构造函数, 需要传入一个对象
function Observer(obj) {
    //  Object.keys() 将对象中的 key 汇总成一个数组返回, 即这里的keys数组里存储的是name和age,而不是具体的值
    const keys = Object.keys(obj);
    keys.forEach((k) => { // 这里的 k 表示 name, age ...等属性名
        // 将k属性私有化,挂载到Observer对象下, 再创建getter(),setter(),添加到Observer对象上,想要 获取或修改 k属性,就需要调用getter()和setter()
        Object.defineProperty(this, k, { // 这里的this是指向的Observer{}
            // 每当要获取k的值的时候, 调用getter()
            get() {
                return obj[k]; // 根据 key, 获取到 val值
            },
            // 每当要修改k的值的时候, 调用setter()
            set(val) {
                console.log(`${k}被修改了, 我要去解析模板, 生成虚拟DOM, 通过diff算法比较 新旧DOM是否相同,再决定是 直接复用旧真实DOM / 创建新真实DOM替换旧真实DOM`);
                obj[k] = val;
            }
        })
    })
}

/*
	vm._data是将data配置项所有的变量,进行object.defineProperty()操作,将所有的变量都设置为响应式的,存放到vm._data里
	
	vm._data.name
	vm.name
*/
let data = {
    name: 'sun',
    age: 18
}

// 创建一个Observer对象, 这一步就是对data配置项进行加工处理(即将其属性私有化,并且创建getter()和setter())
const obs = new Observer(data);
console.log(obs); // Observer {...}

let vm = {};
// 在vm对象里创建一个_data属性, 让_data和data都同时等于加工后的data
vm._data = data = obs;
```

## 数组的数据监测

```html
<!--
    我们知道Vue在监测对象数据的时候是借助setter(),当修改数据的时候会调用setter(),修改了数据之后,会引起模板的重新解析...

    Vue在监测数组的时候,不会生成对应数组每个元素的getter()和setter(),所以我们通过 vm._data.colors[0] = 'yellow'来修改,这里数组的元素虽然修改了底层的数据,但是无法引起页面改变的.

    Vue里的数组时继承了Array的,同时也重写了,pop(), push(), shift(), unshift(), reverse(), splice(), sort() 这几个方法, 这几个方法,不仅仅含有Array父类本身带有的方法,同时当通过这七个方法修改了Vue的数组,就会引起模板的重新解析,同时引起页面模板的改变, 我们想要更改页面内容,可以通过这七个方法来完成

    Vue.set()和vm.$set()也可以用来更改页面中数组的内容
-->

<div id="root">
    <p>颜色: {{colors[0]}}</p>
    <!--调用shift()删除colors数组的第一个元素,同时也会引起模板的重新解析,再生成虚拟DOM,对比新旧虚拟DOM,生成/复用 真实DOM-->
    <button @click="colors.shift()">换颜色</button>
    <!--通过Vue.set()来更改页面中数组的内容-->
    <button @click="changeColor()">换颜色</button>
</div>

<script>
    const vm = new Vue({
        el: '#root',
        data: {
            colors: ['red','green', 'blue']
        },
        methods: {
            changeColor() {
                // 修改 colors数组的index为0的元素的内容为'yello', 这样就可以, 不调用数组的那七个方法,也能更改页面的内容
                Vue.set(vm._data.colors, '0', 'yellow');
            }
        }
    })
</script>
```

# vm.$set(), Vue.set()

```html
<!--
    我们 经常需要 手动添加一个 属性 到_data里

    如果直接使用 vm._data.student.name = 'sun' 是不可行的,这样只会增加一个name属性到_data里,但是不会私有化,也不会生成对应getter()和setter(),如果没有可交互性的setter(),就没法在完成数据监视,即无法完成数据动态显示

    我们可以采取 Vue给我们的 vm.$set()和 Vue.set()来完成添加
-->
<div id="root">
    <!--
注意: 
* 这里如果是student不存在,写studnet就会报错
* 如果是name不存在,student.name是不会报错了,会返回的结果是undefined,在页面中的效果就是不显示
-->
    <p>姓名: {{student.name}}</p>
    <p>爱好: {{hobby}}</p>
    <button @click="addName">点我显示姓名</button>
</div>

<script>
    const vm = new Vue({
        el: '#root',
        data: {
            student: {},
            hobby: ['抽烟', '喝酒', '烫头']
        },
        methods: {
            addName() {
                this.student.name = 'sun' // error, 直接添加该属性,无法被setter监测到,即不会引起模板的重新解析

                // 方法1: vm.$set(), 这样添加的属性,就会自动 私有化,并且生成对应getter()和setter()
                this.$set(vm._data.student, 'name', 'sun');
                // 方法2: Vue.set(), 注意这里是Vue.set()不是vm.set()
                Vue.set(vm._data.student, 'name', 'xue');

                // 我们也可给vm.student添加'name'属性,因为是通过数据代理的将vm._data里的属性和方法转化到vm下的,所以,这里添加了'name'属性,vm._data里也会有改变
                this.$set(vm.student, 'name', 'cheng');

                // 处理数组类型的数据
                this.hobby[0] = '学习' // error, 数组类型的深层次的元素的改变,也是无法被监测到的
                this.$set(hobby, 0, '学习') // 也需要通过$set()来进行修改,修改hobby数组 下的 索引为0的元素 的值为'学习'
                /*
                	数组的就类似于对象,只不过是将key的值设置为了数字
                		hobby = {
                			'0': '抽烟',
                			'1': '喝酒',
                			'2': '烫头'
                		}
                   所以我们在获取数组下的某个元素的时候,hobby[0]可以抽象为hobby.'0',所以我们通过$set()添加的时候,是this.$set(hobby, 0, '学习'),即给hobby下的key为'0'的属性,修改value值为'学习'
                 */
                this.hobby.splice(0, 1, '学习') // 调用能引起数组的数据监测的7大方法之一,来修改数组的值,也是可以的
            }
        }
    })
</script>
```

# vm.$delete(), Vue.delete()

```html
<!--
	vm.$delete()和vm.$set(),都是为了解决setter在监测对象数据深层次变化的时候无法检测到的问题
		* vm.$set是添加属性,
		* vm.$delete是删除属性
-->
<div id="root">
    <p>姓名: {{student.name}}</p>
    <p>年龄: {{student.age}}</p>
    <button @click="deleteName">点我删除姓名</button>
</div>

<script>
    const vm = new Vue({
        el: '#root',
        data: {
            student: {
                name: 'sun',
                age: 18
            }
        },
        methods: {
            deleteName() {
                delete this.person.name // error, 直接删除该属性,是无法被setter监测到的,即不会引起模板的重新解析
                
                // 方法1: vm.$delete(), 删除深层属性,可以被监测到
                this.$delete(this.person, 'name')
                // 方法2:  Vue.delete(), 也是一样的效果,能被监测到
                Vue.delete(this.person, 'name')
            }
        }
    })
</script>
```

# filter配置项

```html
<head>
    <meta charset="UTF-8"/>
    <title>Title</title>
    <!--引入开发版本的vue-->
    <script src="vue.js"></script>
    <!--引入dayjs.min.js-->
    <script src="dayjs.min.js"></script>
</head>
<body>
    <!--
        filter 过滤器: 对要显示的数据进行特定的格式化后再显示(适用于一些简单逻辑的处理)
        注册过滤器:
            * 全局注册: Vue.filter(name, callback)
            * 局部注册: new Vue(filters:{})
        使用过滤器:
            * {{xxx | 过滤器名}} 也可以通过过滤器传入一些参数
            * {{v-bind:属性="xxx | 过滤器名"}}
        备注:
            * 过滤器也可以接受额外的参数
            * 多个过滤器可以进行串联操作 {{xxx | 过滤器1 | 过滤器2 | 过滤器3 | ...}}
            * 并没有改变原本的数据,是产生新的对应的数据
    -->

    <div id="root1">
        <!--过滤器实现 这里time并没有改变,而是对time进行了加工处理,然后返回一个新的数据回来-->
        <p>时间: {{time | timeFormater1}}</p>
        <!--传递参数-->
        <p>时间: {{time | timeFormater2('YYYY-MM-DD')}}</p>
        <!--多个过滤器串联使用, 后面再添加一个方法-->
        <p>时间: {{time | timeFormater2('YYYY-MM-DD') | mySlice}}</p>

        <!--过滤器用于属性操作,可以搭配 v-bind来使用, 但是不可以搭配v-model来使用-->
        <p :x="msg | mySlice">你好世界</p>
        <!--<input type="text" v-model="msg | mySlice">-->

        <!--computed实现-->
        <p>时间: {{fmtTime}}</p>
        <!--methods实现-->
        <p>时间: {{getFmtTime()}}</p>
    </div>

    <div id="root2">
        <!--这里使用的全局过滤器,所以在'#root2'的容器中也可以使用-->
        <p>{{"hello" | mySlice}}</p>
    </div>

    <script>
        // 全局过滤器 注意: 全局过滤器是filter(),局部过滤器是filters()
        Vue.filter('mySlice', function (val) {
            return val.slice(0, 4);
        });

        const vm1 = new Vue({
            el: '#root1',
            data: {
                time: Date.now(),
                msg: 'hello world!!!',
            },
            // 局部过滤器, 这里的过滤器只能在 '#root1' 的容器中使用
            filters: {
                // val是传入上面过滤器传入的time
                timeFormater1(val) {
                    return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
                },
                // 这里的str有一个默认值,即format默认有一个格式
                timeFormater2(val, str='YYYY-MM-DD HH:mm:ss') {
                    return dayjs(val).format(str);
                }
            },
            computed: {
                fmtTime() {
                    return dayjs(this.time).format('YYYY-MM-DD HH:mm:ss');
                }
            },
            methods: {
                getFmtTime() {
                    return dayjs(this.time).format('YYYY-MM-DD HH:mm:ss');
                }
            }
        })

        const vm2 = new Vue({
            el: '#root2'
        })
    </script>
</body>
```

# 生命周期

## 执行过程图

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521022.png)

生命周期, 又名 生命周期函数, 生命周期钩子

Vue在关键时刻 帮我们调用一些特殊名称的函数

生命周期函数的名字是不可更改的,但函数的具体内容是程序员根据需求编写的

生命周期函数中this指向是vm或组件实例对象


## 代码分析

```html
<div id="root">
    <!--需求: 让p标签的内容, 透明度来回不停的降低-->
    <h1>测试</h1>
    <p :style="{opacity}">透明度 {{opacity}}</p>
    <button>点我停止变化</button>
    <button @click="opacity = 0.5">点我透明度变为0.5</button>
    <button @click="opacity = 1">点我透明度变为1</button>
    <button @click="destory()">点我销毁vm</button>
</div>

<script>
    const vm = new Vue({
        // Vue会来判断是否含有 el 配置项, 如果没有就会等到, 等到外面有执行 vm.$mount('#root') 才会接着执行Vue的行为, 如果有就会继续往下执行
        el: '#root',
        data: {
            opacity: 1
        },
        methods: {
            destory() {
                // 可以通过vm.$destory()来销毁vm, 这里是一种自杀的手法, 但我们一般不会自杀,一般都是因为其他原因被迫销毁了vm
                // 一旦执行了这个方法, 就会销毁一个vm实例, 并且清理 与其产生连接的 子实例, 解绑他的指令, 并且接触所有的自定义事件监听器(注意是自定义事件监听器, 而不是普通的事假监听器)
                this.$destroy();
            }
        },
        /*
            Vue判断完 是否含有el配置项之后, 会来判断是否含有template配置项
                * 如果没有template配置项,会将 包括'#root'的div在内的整个模板拿去解析...
                * 如果有了template配置项,会将 整个template配置项的模板拿去解析...
            template配置项的作用: 可以将要html里"#root"里的标签内容,写在template的配置项里
                template: `
                    <!-- 注意这里要将 标签用一个大的 div标签包裹起来, 因为template规定只能含有一个根标签 -->
                    <div>
                        <p :style="{opacity}">透明度 {{opacity}}</p>
                        <button>点我停止变化</button>
                        <button>点我透明度变为1</button>
                    </div>
                `
            注意:
                * 如果用 '' 来包裹,就不能换行
                * 如果用 `` 来包裹,就可以换行, 写起来会好看一些
                * template里只能含有一个跟标签,所以要将 要编写的标签 用一个大的div包裹起来
                * 这个大的div标签会完全的替代掉 外边的 '#root' 标签(即外边的'#root'标签,即使有什么属性或者什么,都没有用,因为会被完全的替代掉)
         */

        // 数据监测,数据代理 的初始化之前
        beforeCreate() {
            // 因为是在数据监测,数据代理的初始化之前, 所以拿不到data中的数据和methods中的方法
            console.log('beforeCreate()', this, this._data); // Vue 此时的Vue里面还没有_data....
            // debugger; // 可以通过 debugger来下断点
        },
        // 数据检测,数据代理 的初始化之后
        created() {
            // 因为此时已经完成了数据代理,数据监测, 所以可以访问到 data配置项中的数据和methods中的方法
            console.log('created()', this, this._data); // __ob__: Observer 可以访问到了
        },

        // 真实DOM挂载到页面上之前
        beforeMount() {
            // 此时的页面呈现的都是未经Vue编译的DOM结构, 比如 页面的插值语法 {{opacity}}是会在页面上显示的
            console.log('beforeMount()', this.$el); // 此时的this.$el拿到的DOM也是未经Vue编译的
            // 我们此时对DOM的操作, 会在beforeMount()的时候有效,但是一过了这个时候,就不会奏效了,因为会有真实DOM将'#root'里的内容覆盖掉,所以我们在这里对'#root'里的DOM操作不会保留到最后,但是我们对'#root'外面的元素进行操作,比如body,html操作,是会被保留的,因为没有后续的真实DOM来覆盖他们
            document.querySelector('h1').style.backgroundColor = 'blue'; // 这里后续会覆盖h1的DOM,所以这里对h1的DOM操作不会保留到最后
            document.querySelector('body').style.backgroundColor = 'gray'; // 这里后续没有覆盖body的DOM,所以这里对body的DOM操作会保留到最后
        },
        // 真实DOM挂载到页面上之后
        mounted() {
            // 页面呈现的是经过Vue编译的DOM,对于DOM的操作均有效
            console.log('mounted()', this.$el); // 此时的this.$el拿到的DOM是经过Vue编译的
            document.querySelector('h1').innerText = 'hi'; // 这里的已经将真实DOM放入到页面中了,所以我们在这里对页面的DOM操作会覆盖掉之前添加的真实DOM操作,所以可以保留到最后
        },

        // 数据更新之前
        beforeUpdate() {
            // 此时的数据是新的, 但是页面任然是旧的
            console.log('beforeUpdate()', this.opacity); // 此时opacity的值已经改变了,但是页面还没有改变
        },
        // 在beforeUpdate()和updated()中间 是Model->View的更新的过程: 生成新的虚拟DOM,然后与旧的虚拟DOM通过diff算法进行比较,如果相同,直接复用原先的真实DOM,如果不同,创建新的真实DOM,然后覆盖掉原先的真实DOM
        // 数据更新之后
        updated() {
            // 此时的数据和页面都是新的
            console.log('updated()', this.opacity); // 此时 opacity和页面 都已经发生了改变
        },

        // vm销毁之前
        beforeDestroy() {
            // 此时 vm中的 所有的 data, methods, 指令... 都是处于可用状态, 但是对于数据的操作度不会触发更新了
            // 我们一般在这里: 关闭定时器, 取消订阅消息, 解绑自定义事件
            console.log('beforeDestroy');
            this.opacity = 0.5; // 这里虽然修改了数据,但是不会触发更新(即数据已经修改了,但是页面不会显示更新)
        },
        // vm销毁之后
        destroyed() {
            // 这里已经把vm销毁掉了,我们此时对vm 的所有的 data, methods, 指令...都会失效
            console.log('destory()');
            this.opacity = 0.1; // 不奏效, 因为已经销毁了vm
            debugger;
        }
    })
    // vm.$mount('#root');
</script>
```

## 案例

```html
<div id="root">
    <!--需求: 让透明度不停的变化, 当点击了停止之后,就会停止变化-->
    <p :style="{opacity}">透明度 {{opacity}}</p>
    <button @click="opacity = 1">透明度变为1</button>
    <!--方法1: 通过调用stop1(), 执行 clearInterval()-->
    <button @click="stop1()">(温柔)点我停止变化1</button>
    <!--方法2: 通过调用stop2(), 销毁vm, 在vm销毁之前, 调用beforeDestroy()钩子函数, 在钩子函数里执行 clearInterval()-->
    <button @click="stop2()">(暴力)点我停止变化1</button>
</div>

<script>
    const vm = new Vue({
        el: '#root',
        data: {
            opacity: 1
        },
        methods: {
            stop1() {
                // 清除定时器
                clearInterval(this.timer);
            },
            stop2() {
                this.$destroy();
            }
        },
        // 当真实DOM刚挂载到页面上之后
        mounted() {
            // 通过向this编写一个timer属性,这样就可以很完美的解决作用域的问题
            this.timer = setInterval(() => {
                if (this.opacity <= 0) {
                    this.opacity = 1;
                }
                this.opacity -= 0.01;
            }, 16)
        },
        beforeDestory() {
            clearInterval(this.timer);
        }
    });
</script>
```

# 组件化编程

## 基本使用

```html
<!--
	vm只能有一个,下面可以有很多个组件(VueComponent),由这个vm来统一管理多个组件
		* 一个组件的this就是指向一个VueComponent对象,就类似于一个vm
		* 我们在vm中使用到的: data配置项,el配置项,methods配置项... 在组件中都是一样使用的
		* VueComponent可以访问到vm中所有的属性和方法,就类似于一个小vm,下面讲解了Vue和VueComponent的内置关系

    Vue 使用组件三大步骤
        1. 创建组件(定义组件)
            * 使用Vue.extend(options)创建, 其中options和new Vue(options)时传入的那个options几乎一样,但也有点区别:
                * el配置项不要写, 因为最终所有的组件都要通过一个vm来管理, 由vm来决定该组件要服务哪些容器,所有不能一下子写死了
                * data配置项必须写成函数式, 不然无法完成复用
        2. 注册组件
            * 局部注册: components: {...}
            * 全局注册: Vue.component(组件标签名, 组件名)
        3. 使用组件(写组件标签)
            * <student> </student>
            * <school></school>
            * ...
-->

<div id="root1">
    <h1>{{info}}</h1>
    <!--3. 编写组件标签-->
    <student></student>
    <hr />
    <school></school>
    <hr />
    <hello></hello>
    <hr />
</div>

<div id="root2">
    <hello></hello>
</div>

<script>
    // 1. 创建student组件 通过Vue.extend()创建
    const student = Vue.extend({
        // 将模板的内容 写到template配置项里, 在这里的模板一样可以绑定事件,执行指令...
        template: `
            <div>
                <h3>student</h3>
                <p>姓名: {{studentName}}</p>
                <p>年龄: {{age}}</p>
                <button @click="show()">点我显示信息</button>
            </div>
        `,
        // 在组件定义时, 一定不要写el配置项,因为最终所有的组件都要被一个vm管理,由vm决定这个组件到底给哪个容器服务
        // el: '#root', // error

        // data配置项一定要用函数的形式编写 `data: {...} // ✗`, `data() {return{}} // ✓`
        // * 因为以函数的形式编写, 以 return {studentName:'sun',age}的形式返回,是返回的一个全新的对象,
        // * 如果是以 data: {studentName:'sun',age18}的形式返回, 是返回的该data对象的地址,如果有两个模块使用了这个data配置项,修改了其中一个,另一个也会跟着修改,所以我一定要通过data(){...}的形式返回
        data() {
            return {
                studentName: "sun",
                age: 18,
            };
        },
        methods: {
            show() {
                console.log(this.studentName, this.age);
            },
        },
    });
    // 1. 创建school组件
    const school = Vue.extend({
        template: `
            <div>
                <h3>school</h3>
                <p>名称: {{schoolName}}</p>
                <p>地址: {{address}}</p>
            </div>
        `,
        data() {
            return {
                schoolName: "尚硅谷",
                address: "北京",
            };
        },
    });

    // 1. 创建hello组件
    const hello = Vue.extend({
        template: `
            <div>
                <p>你好 {{name}}</p>
            </div>
        `,
        data() {
            return {
                name: "tom",
            };
        },
    });
    // 2. 全局注册组件 注意 全局注册,一定要写Vue实例创建之前,不然就没法使用
    Vue.component("hello", hello);

    const vm = new Vue({
        el: "#root1",
        // 编写vm自己的data配置项,还是和之前的一样的用法,在组件里没有影响
        data: {
            info: "学校,学生信息",
        },
        // 2. 局部注册组件, component是组件的意思
        components: {
            'student': student, // 完整写法
            school, // 简写
        },
    });

    new Vue({
        el: "#root2",
    });
</script>
```

## 注意细节

```html
<!--
    组件名:
        * 写法
            * 一个单词组成
                * school
                * School
            * 多个单词组成
                * my-school
                * MySchool (需要在脚手架中使用)
        * 注意:尽量回避HTML中已有的元素名称, 例如: h2, H2... 不管大小写, 都不可以
        * 可以在组件里使用name配置项, 来指定开发者工具中 呈现的名字
    组件标签的写法:
        * <school> </school>
        * <school/>
    组件的简写方法
        * const school = Vue.extend(options) 可以简写成: const school = options
-->

<div id="root">
    <student></student>
    <Student></Student>
    <my-student></my-student>
    <!--
    <MyStudent></MyStudent> 注意 该写法只能在脚手架中使用, 在这里使用会直接报错
    -->

    <!--自闭和单标签, 可以不用写双标签的形式, 可以这样自闭和的单标签形式-->
    <student />
</div>
<script>
    // 创建组件的时候, const student = Vue.extend({..}), 可以简写成 const student = {...}, Vue底层会自己去调用Vue.extend()
    const student = {
        name: "sun", // 在这里配置了name项, 浏览器中的Vue开发者工具显示的标签名就是sun
        template: `
            <div>
                <div>姓名: {{studentName}}</div>
                <div>年龄: {{age}}</div>
            </div>
        `,
        data() {
            return {
                studentName: "sun",
                age: 18,
            };
        },
    };
    const vm = new Vue({
        el: "#root",
        components: {
            student: student, // 单个单词 第一种命名法
            Student: student, // 单个单词 第二种命名法
            "my-student": student, // 多个单词 第一种写法
            MyStudent: student, // 多个单词 第二种写法(注意这种写法需要在脚手架中使用)
        },
    });
</script>
```

## 组件的嵌套

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521023.png)
![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521024.png)

```html
<div id="root"></div>

<script>
    const student = {
        template: `
            <div>
                <p>姓名: {{studentName}}</p>
            </div>
        `,
        data() {
            return {
                studentName: "sun",
            };
        },
    };

    const school = {
        template: `
            <div>
                <p>学习: {{schoolName}}</p>
                <student></student>
            </div>
        `,
        data() {
            return {
                schoolName: "尚硅谷",
            };
        },
        // 组件里面嵌套组件, 就需要用到 components: {...}来套娃
        components: {
            student,
        },
    };

    const hello = {
        template: `
            <div>
                <h1>欢迎您</h1>
            </div>
        `,
    };

    // 通过一个app来管理其他的所有的组件
    const app = {
        template: `
            <div>
                <hello></hello>
                <school></school>
            </div>
        `,
        components: {
            school,
            hello,
        },
    };

    new Vue({
        el: "#root",
        // 在Vue里编写模板 <app> </app>, 将app引入到页面中,这样,所有的标签都是我们通过js插入到页面中去的了
        template: `<app> </app>`,
        components: {
            app,
        },
    });
</script>
```

## 原型对象

```js
/*
    * function Demo() 是一个构造函数
    * d1是通过Demo()构造函数new出来的一个实例
    * Demo和d1都有一个原型对象,类似于java里的class类定义出来的类

    Demo.prototype 和 d1.__proto__ 都可以访问到 他们共同的一个原型对象,我们统称为Demo原型对象 有点类似于java的继承关系

    比如: 获取d1.z, js查找属性的时候,先在d1里找,如果找不到,就去他的原型对象(Demo原型对象)里找,即d1.__proto__里找,是否含有该属性,如果找到了就返回,如果找不到,就接着往Demo的原型对象的原型对象上找,即d1.__proto__.__proto__上找,如果找到了就返回,找不到就接着往上找,最终找到Object为止,因为Object.__proto__ = null
    
    Demo.prototype 称为 显示原型对象属性
    d1.__proto__ 称为 隐式原型对象属性

    Demo的原型对象上 有一个属性, constructor, 该属性就指向了 Demo()构造器
*/

// Demo对象的构造器
function Demo() {
    this.x = 1;
    this.y = 2;
}
// 调用Demo构造器,定义一个Demo对象的实例d1
const d1 = new Demo();

console.log(Demo.prototype); // 显示原型属性
console.log(d1.__proto__); // 隐式原型属性

// 显示原型属性 和 隐式原型属性 都是指向了一个原型对象
console.log(Demo.prototype === d1.__proto__); // true

// 一般通过 显示原型属性 操作原型对象
Demo.prototype.z = 3; // 给原型对象追加一个z属性为3

// 一般通过 隐式原型属性 获取原型对象
console.log(d1); // Demo {x:1, y:2, Prototype: {z:3, ...}}; // 获取到了d1指向的Demo的对象实例
console.log(d1.__proto__.z); // 3; z是d1的原型对象下的一个属性, 我们可以通过d1.__proto__.z来访问到该属性的值
console.log(d1.z); // 3; js会在自身d1对象实例上查找 属性z,如果没有就会去 隐式原型属性 上查找 属性z, 所以 我们可以直接d1.z来访问到原型对象下的属性z
```

## Vue 和 VueComponent 的内置关系

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521025.png)

正常来讲,VueComponent原型对象的\_\_proto\_\_属性,应该是和Vue一样,指向Object的,但是,这里却指向了Vue原型对象

VueComponent.prototype.\_\_proto\_\_ === Vue.prototype (VueComponent 是 vc 的构造器, Vue 是 vm 的构造器)

所以 VueComponent 的实例对象 可以访问到 Vue 原型对象上的属性和方法

# 脚手架 Vue CLI

## 配置脚手架

```bash
# 配置npm为淘宝镜像
npm config set registry https://registry.npm.taobao.org

# 全局安装 @vue/cli
npm install -g @vue/cli

# 在当前目录创建项目xxx
vue create xxx

# 启动项目
npm run serve 或者 yarn serve

# 将src下的源文件,导程浏览器认识的html,css,js文件
npm run build 或者 yarn build
```

## 模板项目结构

> vue_test

- node_modules: 依赖包
- public
  - favicon.ico: 页签图标
  - index.html: 主页面
- src
  - assets: 存放静态资源
    - logo.png
  - component: 存放组件
    - HelloWorld.vue
    - App.vue: 汇总所有组件
  - main.js: 入口文件
- .gitignore: git 版本管制忽略的配置
- babel.config.js: babel的配置文件
- package.json: 应用包配置文件
- README.md: 应用描述文件
- package-lock.json：包版本控制文件

## dist 下的 vue.js 文件

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521026.png)

vue.js 完整版的
vue.min.js 压缩后的
vue.runtime.js 带 runtime 的都是运行版本
vue.runtime.esm.js 带 esm 的都是针对带有 es6 的 js 语法的

## index.html 中的相关配置

```html
<!DOCTYPE html>
<html lang="">
    <head>
        <!--字符编码utf-8-->
        <meta charset="utf-8" />
        <!--针对ie浏览器的一个特殊配置, 含义是让ie浏览器以最高的渲染级别渲染页面-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <!--开启移动端的理想视口-->
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <!--配置页签图标 <%= BASE_URL %> 表示 在public文件夹下 -->
        <link rel="icon" href="<%= BASE_URL %>favicon.ico" />
        <!--配置网页标签-->
        <title><%= htmlWebpackPlugin.options.title %></title>
    </head>
    <body>
        <!--当前浏览器不支持js时noscript中的元素就会被渲染-->
        <noscript>
            <strong
                >We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't
                work properly without JavaScript enabled. Please enable it to
                continue.
            </strong>
        </noscript>
        <!--容器-->
        <div id="app"></div>
        <!-- built files will be auto injected -->
    </body>
</html>
```

## main.js 下的 render

```js
/*
  vue.js 和 vue.runtime.xxx.js的区别
    * vue.js 是完整的Vue, 包含: 核心功能 + 模板解析器
    * vue.runtime.xxx.js 是运行版本的Vue, 包含: 核心模块, 不包含模板解析器
  因为vue.runtime.xxx.js没有模板解析器, 所以不能使用template配置项,需要使用render()将接受到的createElement()去指定解析具体的内容
 */

// 这里引入的是精简版的vue, 是减去了模板解析器的vue
import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

new Vue({
    // 因为引入的是不带有模板解析器的vue.js,所以我们要自己定义render配置项,来完成模板解析的任务
    render: (h) => h(App),
    /*
        render的完整写法:
            render(createElement) {
                // createElement是一个函数,可以用来创建标签元素, 创建好标签元素后,将其返回到页面上
                return createElement('h1', '你好啊'); // 创建一个 h1标签
                return createElement(App); // 将App解析好,返回到页面上去
            }
        render通过箭头函数,来简化了代码 render: createElement => createElement(App)
    */
}).$mount("#app");
```

## 组件的使用

> 项目结构

![image-20220221173221206](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521027.png)

> App.vue

```html
<template>
    <div id="app">
        <!--使用组件标签-->
        <Student></Student>
    </div>
</template>

<script>
// 引入组件
import Student from "@/components/Student";

export default {
    name: 'App',
    // components配置项中添加Student组件
    components: {
        Student
    }
}
</script>
```

> components/Student.vue

```html
<template>
    <div id="student">
        <p>姓名: {{name}}</p>
        <p>年龄: {{age}}</p>
    </div>
</template>

<script>
export default {
    name: "Student",
    data() {
        return {
            name: 'sun',
            age: 18
        }
    }
}
</script>

<style scoped>

</style>
```

## 引入组件的方式

```html
<nav> </nav>
<my-love></my-love>
<my-search> </my-searchh>
<back-to-top></back-to-top>
```

```js
import nav from "components/nav"
import myLove from "components/my-love"
import mySearch from "components/my-search"
import BackToTop from "components/BackToTop"

export default {
    components: {
        nav,
        "my-love": myLove,
        mySearch,
        BackToTop
    }
}
```

# sync

```html
<template>
    <div class="test">
        <!-- 添加 sync 修饰符, 相当于绑定了一个 update:num 自定义事件 -->
        <Child :num.sync="num"></Child>
    </div>
</template>

<script>
import Child from "@/pages/Test/Child";
export default {
    name: "Test",
    components: {
        Child,
    },
    data() {
        return {
            num: 1
        }
    }
}
</script>
```

```html
<template>
    <div>
        <!-- 触发自定义事件 -->
        <button @click="$emit('update:num', num + 1)">+1</button> {{num}}
    </div>
</template>

<script>
export default {
    name: "Child",
    props: ["num"]
}
</script>
```

# props

父组件向子组件传递数据

```html
<!-- App.vue -->

<template>
    <div>
        <!-- age="18" 传递的是字符串, :age="18" 传递的是数字 -->
        <Student name="sun" :age="18" sex="male"></Student>
    </div>
</template>
```

子组件接受父组件的数据

```html
<template>
    <div class="student">
        {{name}} - {{age}} - {{sex}}
    </div>
</template>

<script>
export default {
    name: "Student",

    // Method 1
    props: ['name', 'age', 'sex'],

    // Method 2
    props: {
        // 限制数据类型
        name: String,
        age: Number,
        sex: String
    }

    // Method 3
    props: {
        name: {
            // 限制数据类型
            type: String,
            // 限制必要性
            required: true 
        },
        age: {
            type: Number,
            // 设置默认值
            default: 0 
        },
        sex: {
            type: String
        }
    }
}
</script>
```

# mixins

将组件共同的部分封装到 mixin.js, 其他组件导入使用, 提高代码的复用率

```js
// mixin.js

export const mix1 = {
    methods: {
        showInfo() {
            console.log(this.name);
        },
    },
    mounted() {
        console.log("mounted()执行了");
    },
};

export const mix2 = {
    data() {
        return {
            x: 10,
            y: 20,
        };
    },
};
```

局部导入 mixins

```js
// Student/index.vue

import {mix1, mix2} from "../mixin";

export default {
    // 局部: 在mixins配置项 中,填写导入的mix1和mix2
    mixins: [mix1, mix2],
};
```

全局导入 mixins

```js
// main.js

import { mix1, mix2 } from "./mixin";

Vue.mixin(mix1);
Vue.mixin(mix2);
```

# plugins

plugins 一个对象, 包含 install()

```js
// plugins.js

import { mix1 } from "./mixin";

export default {
    install(Vue, a, b, c) {
        console.log(Vue); // Vue的原型对象
        console.log(a, b, c); // 1, 2, 3

        // 全局过滤器
        Vue.filter("mySlice", function (val) {
            val.slice(0, 4);
        });

        // 全局自定义指令
        Vue.directive("fbind", {
            bind(element, binding) {
                element.value = binding.value;
            },
            inserted(element, binding) {
                element.focus();
            },
            update(element, binding) {
                element.value = binding.value;
            },
        });

        // 配置 mixins
        Vue.mixin(mix1);

        // 添加 自定义方法 到 Vue 上
        Vue.prototype.$myMethod = function () {
            console.log("myMethod()执行了");
        };
        // 添加 自定义属性 到 Vue 上
        Vue.prototype.$myProperty = 10;
    },
};
```

```js
// main.js

import plugins from "./plugins";
Vue.use(plugins, 1, 2, 3);
```

# 给组件标签绑定事件

## 绑定自定义事件

```html
<!--
    1. App.vue给School组件绑定自定义事件
        // 绑定写法1
        <School @showInfo="getSchoolName"/>

        methods: {
            getSchoolName() {}
        }
        
        // 绑定写法2
        <School ref="school"/>

        methods: {
            getSchoolName() {}
        }
        mounted() {
            this.$refs.school.$on("showInfo", getSchoolName)
        }

    2. School组件触发该自定义事件
        <button @click="sendSchoolName">点击</button>

        methods: {
            sendSchoolName() {
                // 触发'showInfo'事件,传递参数this.name过去
                this.$emit('showInfo', this.name)
            }
        }

    3. School组件解绑事件
		<button @click="unbind">点我解绑事件</button>
        methods: {
            unbind() {
                this.$off("showInfo1"); // 解绑 单个事件
                this.$off(["showInfo1", "showInfo2"]); // 解绑 多个事件
                this.$off(); // 解绑全部事件
            },
        }
-->

<!--App.vue-->

<template>
	<div id="app">
		<!--
            绑定方法1: 通过v-on来 给School组件标签的组件实例对象的vc 绑定showInfo自定义事件
	    -->
		<School v-on:showInfo="getSchoolName"></School> <!--完整写法-->
        <School @showInfo="getSchoolName"></School> <!--简写-->
        
		<!--
            绑定方法2: 先添加ref属性,下面mounted()中,通过$refs来获取到该组件标签,再通过$on()来绑定自定义事件
            通过方法2来绑定事件更为灵活, 比如: 延迟3s后给school组件标签添加事件
        -->
		<School ref="school"></School>
	</div>
</template>

<script>
import School from "@/components/School";

export default {
	name: "App",
	components: {
		School,
	},
	methods: {
		/*
            接受参数:
            * getSchoolName(value)
            * getSchoolName(vaule, a, b, c)
            * getSchoolName(value, ...arr)
	    */
		getSchoolName(value) {
			console.log(value);
		},
	},
	mounted() {
        // 绑定自定义事件
		this.$refs.school.$on("showInfo", this.getSchoolName); 
        
        // 通过$on来配置,可以满足些不同的需求,比如: 绑定一次性自定义事件
		this.$refs.school.$once("showInfo", this.getSchoolName); 
	}
};
</script>
```

```html
<template>
	<div id="School">
		<p>School的内容</p>
		<button @click="sendSchoolName">点我</button>
		<button @click="emit">点我触发事件</button>
		<button @click="unbind">点我解绑事件</button>
	</div>
</template>

<script>
export default {
	name: "School",
	data() {
		return {
			name: "尚硅谷",
		};
	},
	methods: {
		sendSchoolName() {
            // 触发事件,并且传递参数this.names
			this.$emit("showInfo", this.name);
		},

        emit() {
            // 同时触发三个事件
            this.$emit("showInfo1");
            this.$emit("showInfo2");
            this.$emit("showInfo3");
        }
        unbind() {
            this.$off("showInfo1"); // 解绑 单个事件
            this.$off(["showInfo1", "showInfo2"]); // 解绑 多个事件
            this.$off(); // 解绑全部事件
        },
	},
};
</script>
```

## 绑定原生事件

```html
<template>
	<div id="app">
		<!--error 这样就是给组件标签绑定自定义事件-->
		<School @click="showInfo"></School>
		<!--加上native修饰符, 表示给组件标签绑定了原生事件, 这样点击了该组件,就会触发App.vue的methods配置项里的showInfo()-->
		<School @click.native="showInfo"></School>
	</div>
</template>

<script>
import School from "@/components/School";

export default {
	name: "App",
	components: {
		School,
	},
	methods: {
		showInfo() {
			console.log("showInfo()");
		},
	},
};
</script>
```

## $on()中的this指向问题

```html
<template>
	<div id="app">
		<School ref="school"></School>
	</div>
</template>

<script>
import School from "@/components/School";

export default {
	name: "App",
	data() {
		return {
			name: "",
		};
	},
	components: {
		School,
	},
	methods: {
		getSchoolName(value) {
			console.log(value);
			console.log(this); // App.vue的VueComponents 在methods配置项里的方法的this都是指向的Vue
		},
	},
	mounted() {
		this.$refs.school.$on("showInfo", this.getSchoolName); // 这里的this指向的是App.vue的VueComponents

		this.$refs.school.$on("showInfo", function (value) {
			console.log(value); // '尚硅谷'
			// 这里的this并不是指向了Vue了,而是指向绑定了'showInfo'自定义事件的组件对象,所以这里很多操作,我们没法完成, 比如: this.name = value 因为这里的this.name是指向的vc里的name属性,而不是vm里的name属性
			console.log(this); // School.vue的VueComponents
		});

		this.$refs.school.$on("showInfo", (value) => {
			console.log(value); // '尚硅谷'
			// 在箭头函数中, this不会有指向,所以this就会往外找,外面是App.vue的mounted(),所以很自然的就指向了 App.vue的VueComponent
			console.log(this); // App.vue的VueComponent
		});
	},
};
</script>
```

# 全局事件总线

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521028.png)

```js
// mian.js

import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;
/*
    全局事件总线: 一种组件间通信的方式,适用于任意组件间通信

    安装全局事件总线:
        new Vue({
            ...
            beforeCreate() {
                Vue.prototype.$bus = this; // $bus就是当前应用的vm
            }
        })
    使用事件总线:
        * 接受数据: A组件想要接受数据, 则在A组件中给$bus绑定自定义事件, 事件的回调留在A组件身上
            methods() {
                demo(data) {...} // 定义回调函数
            },
            mounted() {
                this.$bus.$on('xxxx', this.demo); // 绑定事件'xxxx', 如果触发了事件,就会调用demo()
            }
        * 提供数据: this.$bus.$emit('xxxx', 数据);
    销毁数据:
        * 在组件销毁前,解绑事件
            beforeDestory() {
                this.$bus.$off('xxxx'); // 解绑事件'xxxx'
            }
*/

// 安装全局事件总线(写法1): 创建一个VueComponent实例,放到Vue的原型对象上,后面通过这个VueComponent进行数据传递
const Demo = Vue.extend({}); // 通过Vue.extend()创建一个VueComponent的构造函数Demo
const demo = new Demo(); // 通过Demo创建一个VueComponent的实例对象, 我们在template里使用<Demo> </Demo>的过程, 就相当于调用构造函数,创建一个实例对象
Vue.prototype.x = demo; // 创建一个x在Vue的原型对象上,这个x就是一个VueComponent实例对象, 因为VueComponent原型对象的__proto__是指向的Vue的原型对象,所以我们将demo放在Vue的原型对象上,以后,不管哪个VueComponent的实例都可以访问到这个放在Vue身上的VueComponent实例对象

new Vue({
	render: (h) => h(App),
	// 安装全局事件总线(写法2, 常用): 在Vue的原型对象上,安装一个Vue对象,这个Vue对象就是vm,因为只需要$on和$emit方法,所以Vue也能完成
	beforeCreate() {
		Vue.prototype.$bus = this; // 安装全局事件总线 bus有总线的意思
	},
}).$mount("#app");
```

```html
<!--School.vue-->

<template>
	<div id="School">
		<p>School的内容</p>
	</div>
</template>

<script>
export default {
	name: "School",
	// 当数据发生改变,就会重新解析模板,当页面挂载完,就会执行这里的代码, 绑定事件到$bus上
	mounted() {
		// 在x身上绑定一个自定义事件showInfo, 如果触发了该事件,就会执行这里的代码
		this.$bus.$on("showInfo", (value) => {
			// 接受到传递来的数据
			console.log(value);
		});
	},
	// 在School.vue这个组件销毁前,解绑该组件绑定在this.$bus上的事件
	beforeDestroy() {
		// 注意这里, 不能直接 this.$bus.$off(), 这样就会把整个this.$bus上的事件全部销毁了
		this.$bus.$off("showInfo"); // 解绑事件'showInfo'
	},
};
</script>
```

```html
<!--Student.vue-->

<template>
	<div id="Student">
		<p>Student的内容</p>
		<button @click="sendData">点我 传递数据给 School</button>
	</div>
</template>

<script>
export default {
	name: "Student",
	data() {
		return {
			name: "sun",
		};
	},
	methods: {
		sendData() {
			// 触发showInfo事件, 然后将this.name作为参数传递给showInfo事件的回调函数
			this.$bus.$emit("showInfo", this.name);
		},
	},
};
</script>
```

# 向服务器发送请求

## 怎么发送请求

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521029.png)
![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521030.png)

## 配置代理服务器

```js
/*
    vue脚手架 配置 代理, 在vue.config.js中添加如下配置
        * 方法1
            module.exports = {
                devServe: {
                    proxy: 'http://localhost:5000'
                }
            }
            * 优点: 配置简单, 请求资源时直接发送给前端8080即可
            * 缺点: 不能配置多个代理, 不能灵活的控制请求是否走了代理服务器
            * 若按照上述配置代理,当请求了前端不存在的资源时,那么该请求会转发给服务器(优先匹配前端资源), 所以当前端有资源名和我们要请求的服务器里的资源名相同时,会出现矛盾

        * 方法2
            module.exports = {
                devServe: {
                    proxy: {
                        // 配置第一台代理服务器
                        'api1': {
                            target: 'http:localhost:5000',
                            pathRewrite: {'^/api1', ''},
                            changeOrign: true,
                        },
                        // 配置第二台代理服务器
                        'api2': {
                            target: 'http:localhost:5001',
                            pathRewrite: {'^/api2', ''},
                            changeOrign: true,
                        }
                    }
                }
            }
            * 优点: 可以配置多个代理,且可以灵活的控制请求是否走了代理
            * 缺点: 配置略微繁琐, 请求资源时必须加前缀
 */

// vue.config.js

module.exports = {
	pages: {
		index: {
			// page 的入口
			entry: "src/main.js",
		},
	},
	lintOnSave: false,

	/*
    第一种配置方式:
        devServer: {
            proxy: 'http://localhost:5000'
        }
        * 直接在前端配置,发送请求的时候,发送给本地,即http://localhost:8080,然后他会向http://localhost:5000发送请求
        * 无法代理多台服务器, 请求不灵活, 他会优先去请求前端根目录下的资源,如果前端没有,才会去后端请求
    */

	// 第二种配置方式
	devServer: {
		proxy: {
            /*
            	配置第一台代理服务器
					* 在App.vue中,我们发送请求"http://localhost:8080/api1/students"到这里的代理服务器"/api1"
            		* 然后再由代理服务器发送请求"http://localhost:5050/students"到真正的服务器去请求资源
            */
			"/api1": {
				// 设置要真正请求的服务器的路径
				target: "http://localhost:5000",

				// * 如果我们不写这个配置项,就是 请求的 http://localhost:5000/api1/students,这样是请求不到资源的,因为5000端口上,没有/api1/students这样的资源
				// * 如果编写了这个配置项,他就会将'/api1'转成'', 即我们请求的就是 http://localhost:5000/students, 这样就能请求到正确的资源了

				pathRewrite: { "^/api1": "" },

				ws: true, // 用于支持websocket

				// 5000服务器会询问代理服务器的来源
				// * 如果这里的配置项是false, 那么5000端口的服务器,通过req.get('Host'),得到的是http://localhost:8080的
				// * 如果是true, 那么5000端口的服务器,通过req.get('Host')得到的就是和5000端口的服务器一样的地址,即http://localhost:5000
				changeOrigin: true,
			},

			// 配置第二台代理服务器
			"/api2": {
				target: "http://localhost:5001",
				pathRewrite: { "^/api2": "" },
				ws: true,
				changeOrigin: true,
			},
		},
	},
};
```

```html
<!--App.vue-->

<template>
	<div id="app">
		<button @click="getStudents">点我获取students信息</button>
		<button @click="getCars">点我获取cars信息</button>
	</div>
</template>

<script>
import axios from "axios";

export default {
	name: "App",
	methods: {
		getStudents() {
			// 安装并引入axios,再通过axios编写get请求(这里也可以安装并引入vue-resource包, 使用Vue.$http()来完成相同的效果)
            
            // 发送请求到代理服务器1
			axios.get("http://localhost:8080/api1/students").then(
				(response) => {
					console.log("请求成功", response.data);
				},
				(error) => {
					console.log("请求失败", error.message);
				}
			);
		},
		getCars() {
            // 发送请求到代理服务器2
			axios.get("http://localhost:8080/api2/cars").then(
				(response) => {
					console.log("请求成功", response.data);
				},
				(error) => {
					console.log("请求失败", error.message);
				}
			);
		},
	},
};
</script>
```

# Slot

## Default Slot

`<Category>` 里的内容就插入到 `<slot>` 中

```html
<!-- Category.vue -->

<slot>默认值</slot>
```

```html
<!-- App.vue -->

<Category>
    <p>Content</p>
</Category>
```

`<tempate>` 包裹要插入内容, 就不会多出来一层结构

```html
<template class="foot" slot="footer">
    <p>Content</p>
</template>
```

## Named Slot

通过 Named Slot, 根据 name, 插入到指定的 slot 中

```html
<!-- Category.vue --> 

<!-- 添加 name 属性 -->
<slot name="header">Header Slot</slot>
<slot name="center">Center Slot</slot>
<slot name="footer">Footer Slot</slot>
```

```html
<!-- App.vue -->

<Category>
    <!-- 插入到 name 为 center 的 slot 中 -->
    <p slot="center">Content</p>

    <!-- 依照顺序插入到 name 为 footer 的 slot 中 -->
    <p slot="footer">Content</p>
    <p slot="footer">Content</p>
    <p slot="footer">Content</p>
</Category>
```

## Scoped Slot

通过 Scoped Slot, 进行父子组件之间的通信

```html
<!-- Category.vue --> 

<!-- 传递数据 -->
<slot :msg="msg" :games="games">我是插槽1</slot>
```

```html
<!-- App.vue -->

<Category>
    <!-- 接受数据 -->
    <template scope="obj">
        {{obj.msg}} - {{obj.games}}
    </template>
</Category>
```

# Vuex

## Info

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521031.png)

Vuex 可以实现组件之间的通信

## Quick Start

```shell
# vue2 安装 vuex@3
npm i vuex@3 -D

# vue3 安装 vuex@4
npm i vuex@4 -D
```

配置 store

```js
// store/index.js

import Vue from "vue";
import Vuex from "vuex";

// 需要在 store/index.js 中执行 Vue.use(Vuex), 不能在 main.js 中执行 Vue.use(Vuex), 因为 Vue 在解析模版时, 会先执行所有 import 导入的文件, 如果没有在 store/index.js 中执行 Vue.use(Vuex), 那么就会先执行 Vuex.Store(), 而此时还没有挂在 Vuex 到 Vue 身上, 故报错
Vue.use(Vuex);

// state 存储数据, Vue 会对这里的数据进行数据监测和数据代理, 生成 setter(), getter()
const state = {
    sum: 0,
};
// getters 加工数据, 一般用于简化 state 中的数据
const getters = {
    BigSum(state) {
        // 对 state.sum进行加工处理,并且返回一个全新的加工后的数据
        return state.sum * 10;
    },
};

// actions 处理数据, 再将处理后数据交给 mutations
const actions = {
    plus(context, value) {
        // 调用 mutations 的 PLUS(), 传递 value
        context.commit("PLUS", value); 
    },
    plusOdd(context, value) {
        // context 可以直接访问到 state 中的数据
        if (context.state.sum % 2) {
            context.commit("PLUS", value);
        }
    },
    plusWait(context, value) {
        setTimeout(() => {
            context.commit("PLUS", value);
        });
    },

    // 通过 context.dispatch() 调用 actions 中的方法, 将一个大方法拆分成多个小方法
    test1(context, value) {
        console.log("test1 处理了一些事情");
        // 调用 actinons 的 test2(), 传递 value
        context.dispatch("test2", value);
    },
    test2(context, value) {
        console.log("test2 处理了一些事情");
        // 调用 actions 的 test3(), 传递 value
        context.dispatch("test3", value);
    },
    test3(context, value) {
        console.log("test3 处理了一些事情");
    },
};

// mutations 修改数据, 方法名一般为大写
const mutations = {
    PLUS(state, value) {
        state.sum += value;
    },
    SUBTRACT(state, value) {
        state.sum -= value;
    },
    TEST() {
        // 调用 SUBTRACT() (注意: 模块化后, 需要加上模块名)
        this.commit("SUBTRACT", 10); // 对
    }
};

// 创建并导出 store
export default new Vuex.Store({
    actions,
    mutations,
    state,
    getters,
});
```

导入 store, 挂载到 Vue 身上

```js
// main.js

// 引入store
import store from "./store";

const vm = new Vue({
	// 添加store配置项
	store,
}).$mount("#app");
```

使用 store

```html
<template>
	<div class="count">
		<h1>总和: {{$store.state.sum}}</h1>
        <h1>放大: {{$store.getters.BigSum}}</h1>
		<select v-model.number="n">
			<option value="1">1</option>
			<option value="2">2</option>
			<option value="3">3</option>
		</select>
		<button @click="increment">点我+</button>
		<button @click="decrement">点我-</button>
		<button @click="incrementOdd">总和为奇数才+</button>
		<button @click="incrementWait">等一等再+</button>
	</div>
</template>

<script>
export default {
	name: "Count",
	data() {
		return {
			n: 1,
		};
	},
	methods: {
		increment() {
			console.log(this.$store);
            
            // 调用 actions 的 plus(), 传递 this.n
			this.$store.dispatch("plus", this.n);
		},
		decrement() {
            // 调用 mutations 的 SUBTRACT(), 传递 this.n
			this.$store.commit("SUBTRACT", this.n);
		},
		incrementOdd() {
			this.$store.dispatch("plusOdd", this.n);
		},
		incrementWait() {
			setTimeout(() => {
				this.$store.dispatch("plusWait", this.n);
			}, 500);
		},
	}
};
</script>
```

## 四个map

### mapState(), mapGetters()

```html
<template>
	<div class="count">
		<h1>姓名: {{ myName }}</h1>
		<h1>年龄: {{ myAge }}</h1>

		<h1>放大: {{ BigSum }}</h1>
		<button @click="$store.state.sum++">点我++</button>
	</div>
</template>

<script>
// 引入mapState, mapGetters
// * mapState() 生成计算属性, 从$store.state中读取数据
// * mapGetters() 生成计算属性, 从$store.getters中读取数据
import {mapState, mapGetters} from 'vuex';

export default {
    name: "Count",
    computed: {
        ...mapState({myName: 'uname', myAge: 'age'}), // 对象写法
        /*
            ...mapState({myName: 'uname', myAge: 'age'})的作用相当于:
                computed: {
                    myName() {
                        return this.$store.state.uname;
                    },
                    myAge() {
                        return this.$store.state.age;
                    }
                }
                这样,在Count.vue里,我们可以直接在插值语法里使用myName来代替$store.state.uname

            mapState()返回的是一个对象,mapState({myName: 'uname', myAge: 'age'})相当于定义了数个计算属性
                {
                    myName() {
                        return this.$store.state.uname;
                    },
                    myAge() {
                        return this.$store.state.age;
                    }
                }
            因为mapState()返回的是一个对象,而{}里面不能包含一个{}
            	// error !!! 不能这么写
            	computed: {
            		// 这里不能直接放入一个对象
            		{
                        myName() {
                            return this.$store.state.uname;
                        },
                        ...
            		}
            	}
            mapState()返回的对象里是多个方法,可以通过es6里的'...mapState()'解构对象,将myName(){},myAge(){}从{}里拿出来,直接发放在computed{}里	
            	// 达到这样的效果,就是非常好的
                computed: {
                	// 将myName(),myAge拿出来,直接放在computed里
                    myName() {
                        return this.$store.state.uname;
                    },
                    myAge() {
                        return this.$store.state.age;
                    }
                }
                
            注意: mapState({myName: 'uname'}); 这里的 'uname' 的 '' 不能省略,因为这里需要的是字符串,如果省略了了'',他就会认为是变量,就会在Count.vue里寻找该变量
         */

        ...mapState(['uname', 'age']), // 数组写法(推荐写法) 这里的效果和上面一样,就是返回一个uname和age的计算属性到computed配置项里,方便我们在Count.vue里直接使用,
        // 注意: 这样写,需要 计算属性名(uname) 和 State里的属性名($store.state.uname) 一样,才可以这样写

        // 生成计算属性,从getters中读取数据, 使用方法和mapState()一样
        ...mapGetters(newSum: 'BigSum'), // 对象写法
        ...mapGetters(['BigSum']), // 数组写法(推荐写法)
    }
}
</script>
```

### mapMutations(), mapActions()

```html
<template>
	<div class="count">
		<h1>总和: {{ $store.state.sum }}</h1>
		<!--在这里调用该函数的时候,就传递10过去-->
		<button @click="increment(10)">点我+10</button>
		<button @click="decrement(10)">点我-10</button>
		<button @click="incrementWait(10)">点我延迟+10</button>
		<button @click="decrementWait(10)">点我延迟-10</button>
	</div>
</template>

<script>
// 引入mapMutations, mapActions 
import { mapMutations, mapActions } from "vuex";

export default {
	name: "Count",
	methods: {
		// 该方法会调用commit()去联系mutations中的方法, 生成对应的方法放在methods里
		...mapMutations({ increment: "PLUS", decrement: "SUBTRACT" }), // 对象写法
		/*
            ...mapMutations({increment: 'PLUS', decrement: 'SUBTRACT'}) 和...mapState()一样,得到的最终效果:
                methods: {
                    increment() {
                        return this.$store.commit('PLUS', 10); // 注意这里的数据10,是在上面@click绑定事件的时候,调用该函数时,传递的
                    },
                    decrement() {
                        return this.$store.commit('SUBTRACT', 10);
                    }
                }
         */
		...mapMutations(["PLUS", "SUBTRACT"]), // 数组写法(推荐写法), 注意点和mapState一样

		// 该方法会调用dispatch()去联系actions里的方法, 生成对应的方法放在methods里
		...mapActions({ incrementWait: "plusWait", decrementWait: "subtractWait"}), // 对象写法
		...mapActions(["plusWait", "subtractWait"]), // 数组写法
	},
};
</script>
```

## 模块化编码

### 模块化处理

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521032.png)

```js
// main.js

import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

/*
    原先不同组件所需要的,全部塞在actions,mutations,state,getters
    现在进行模块化编码
        * 将和Count组件相关的(有相应的actions,mutations,state,getters),全部封装成一个对象放在count.js里,然后导出
        * 将和Person组件相关的...
        * 导入count.js和person.js
        * 在创建store对象的时候,添加一个modules配置项,在这个配置项里添加刚才引入的两个
 */

import countOptions from "./count.js";
import personOptions from "./person.js";

export default new Vuex.Store({
    modules: {
        countAbout: countOptions,
        personAbout: personOptions,
    },
});
```

```js
// count.js

export default {
    namespaced: true, // 设置命名空间
    actions: {
        plusWait(context, value) {
            setTimeout(() => {
                context.commit("PLUS", value);
            }, 500);
        },
        subtractWait(context, value) {
            setTimeout(() => {
                context.commit("SUBTRACT", value);
            }, 500);
        },
    },
    mutations: {
        PLUS(state, value) {
            state.sum += value;
            /*
            	访问mutations中的其他成员
            		this.commit("personAbout/SUBTRACT", 10); // 对
            		this.commit("SUBTRACT", 10); // 错
            		this.SUBTRACT(10); // 错
            */
        },
        SUBTRACT(state, value) {
            state.sum -= value;
        },
    },
    state: {
        sum: 0,
    },
    getters: {},
};
```

```js
// person.js

export default {
    namespaced: true,
    actions: {
        submitWang(context, value) {
            // 判断是"王"开头的,就调用commit()让mutations来处理
            if (value.name.indexOf("王") === 0) {
                context.commit("SUBMIT", value);
                return;
            }
            alert('请输入姓"王"的');
        },
    },
    mutations: {
        SUBMIT(state, value) {
            console.log("调用了SUBMIT()");
            state.personList.unshift(value);
        },
    },
    state: {
        personList: [{ id: "001", name: "sun" }],
    },
    getters: {
        firstPerson(state) {
            // 返回personList的第一个元素
            return state.personList[0].name;
        },
    },
};
```

### 不采用四个map编写

```html
<!--Person.vue-->

<template>
<div class="person">
    <input type="text" placeholder="请输入" v-model="name" />
    <button @click="add">提交</button>
    <button @click="addWang">添加姓"王"的人</button>
    <p>列表第一个人的姓名是: {{ firstPerson }}</p>
    <ul>
        <li v-for="person in personList" :key="person.id">
            {{ person.name }}
    </li>
    </ul>
    <p>Count组件里 总和: {{ sum }}</p>
    </div>
</template>

<script>
    // 安装并引入nanoid,用于生成随机数id
    import { nanoid } from "nanoid";

    export default {
        name: "Person",
        data() {
            return {
                name: "",
            };
        },
        computed: {
            // 在模块化编码下,直接调用state,获取到countAbout模块下的sum属性
            sum() {
                return this.$store.state.countAbout.sum;
            },
            // ....
            personList() {
                return this.$store.state.personAbout.personList;
                // return this.$store.state["personAbout/personList"] // error, state不能这么写!!!
            },
            // 在模块化编码下,直接调用getters,获取到personAbout模块下的firstPerson属性, 注意
            // * 如果personAbout模块设置了命名空间(即namespaced: true), 那么firstPerson在$store.personAbout下
            // * 如果personAbout模块没有设置命名空间(即namespaced: false), 那么firstPerson在$store下!!!坑死我了!!!
            firstPerson() {
                return this.$store.getters["personAbout/firstPerson"];
            },
        },
        methods: {
            add() {
                const person = { id: nanoid(), name: this.name };
                // 在模块化编码下, 直接调用commit(),联系到personAbout模块的SUBMIT()
                this.$store.commit("personAbout/SUBMIT", person);
                this.name = "";
            },
            addWang() {
                const person = { id: nanoid(), name: this.name };
                // 在模块化编码下, 直接调用dispatch(),联系到personAbout模块下的submitWang()
                this.$store.dispatch("personAbout/submitWang", person);
                this.name = "";
            },
        },
    };
</script>
```

### 采用四个map编写

```html
<!--Count.vue 这里只展示Count.vue里代码了,Person.vue里的就大同小异了,故省略-->

<template>
<div class="count">
    <h1>总和: {{ sum }}</h1>
    <h1>放大: {{ myBigSum }}</h1>
    <button @click="increment(10)">点我+10</button>
    <button @click="decrement(10)">点我-10</button>
    <button @click="plusWait(10)">点我延迟+10</button>
    <button @click="subtractWait(10)">点我延迟-10</button>

    <!--通过vuex进行共享数据,获取到Person组件的数据-->
    <p style="color: red">Person里的 人员数量: {{ personList.length }}</p>
    </div>
</template>

<script>
    import {mapState, mapMutations, mapActions} from 'vuex';

    export default {
        name: "Count",
        computed: {
            /*
            进行了vuex的模块化编码,需要向mapState(),mapGetters(),mapMutations(),mapActions()里多添加一个参数,即指向哪个模块里的state,getters,mutations,actions配置项
         */
            // 通过mapState生成对应的计算属性, 从countAbout模块的state里读取数据
            ...mapState('countAbout', ['sum']), // 数组写法
            // ..., 从personAbout模块的state里读取数据
            ...mapState('personAbout', ['personList']),
            // 通过mapGetters生成对应的计算属性, 从countAbout模块的getters里读取数据
            ...mapGetters('countAbout', {myBigSum: 'BigSum'}), // 对象写法

            // ---------------------------------------------

            // 如果不设置namespaced:true,即不使用mapState('countAbout', ['sum'])
            // 按照这样的写法, 我们在上面调用的时候,应该调用{{countAboutState.sum}}, {{personAboutState.length}},相比于上一个方法,稍微麻烦点
            ...mapState({'countAboutState': 'countAbout', 'personAboutState': 'personAbout'}),
            
            ...mapState({
                sum: (state) => state.countAboutState.countAbout.sum,
                personList: (state) => state.personAboutState.personAbout.personList
            })
        },
        methods: {
            // 该方法会调用commit()去联系countAbout模块的mutations里的方法, 生成对应的方法放在methods里
            ...mapMutations('countAbout', {increment: 'PLUS', decrement: 'SUBTRACT'}),

            // 该方法会调用dispatch()去联系countAbout模块的actions里的方法, ...
            ...mapActions('countAbout', ['plusWait', 'subtractWait']),

            // ---------------------------------------------

            // 如果不设置namespaced:true,即不使用mapMutations('countAbout', {increment: 'PLUS', decrement: 'SUBTRACT'})
            // 可以这样编写代码,上面的调用还是一样 increment(10) ...
            ...mapMutations({'increment': 'countAbout/PLUS', 'decrement': 'countAbout/SUBTRACT'}),
        }
    }
</script>
```

# VueRouter

## 路由的概念

### 生活中的路由

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521033.png)

### 程序中的路由

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521034.png)

一个路由就是一组映射关系(key-value 键值对)

key 为路径,value 可能是 function 或 component

后端路由:

* value 是 function, 用于处理客户端提交的请求
* 工作过程: 服务器接受一个请求时,根据请求路径找到匹配的函数来处理请求,返回响应数据

前端路由:

* value 是 component, 用于展示页面内容
* 工作过程: 当浏览器路径改变时,对应的组件就会显示

### SPA 应用

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521035.png)

* 单页 web 应用(single page web application, SPA)
* 整个应用只有一个完整的页面
* 点击页面中的导航连接不会刷新页面,只会做页面的局部更新
* 数据需要通过 ajax 请求获取
* vue-router 是 vue 的一个拆件库,专门用来实现 SPA 应用

## 基本使用

```js
/*
    安装
      * 在vue2中,只能使用vue-router3 (yarn add vue-router@3)
    	* 在vue3中,只能使用vue-router4 (yarn add vue-router@4)
    引入vue-router
        import vueRouter from 'vue-router'
    应用插件
        Vue.use(vueRouter)
    创建router实例对象,去管理一组一组的路由规则
        export default new vueRouter({
            // 在routes配置项里管理路由规则
            routes: [
                {
                    path: '/home',
                    component: Home
                },
                {
                    path: '/about',
                    component: About
                }
            ]
        })
    实现路由的切换(active-class可配置焦点样式)
        <router-link active-class="active" to="/about">About</router-link>
    指定展示位置
        <router-view> </router-view>
 */

// router/index.js 该文件专门用于创建整个应用的路由

// 引入路由
import vueRouter from "vue-router";
// 引入相关的组件
import Home from "@/components/Home";
import About from "@/components/About";
// 创建并导出一个路由对象(router), vueRouter()为一个构造器
export default new vueRouter({
	// 在routes配置项里管理路由规则
	routes: [
		{
			path: "/home",
			component: Home,
		},
		{
			path: "/about",
			component: About,
		},
	],
});
```

```js
// main.js

import Vue from "vue";
import App from "./App.vue";
import vueRouter from "vue-router";

Vue.config.productionTip = false;
Vue.use(vueRouter);

import router from "./router";

new Vue({
	render: (h) => h(App),
	router,
}).$mount("#app");
```

```html
<!--App.vue-->

<template>
	<div id="app">
		<!--<a class="list-group-item" href="./about.html">About</a>-->
		<!--<a class="list-group-item active" href="./home.html">Home</a>-->

		<!--
            这里的router-link是属于vue-router里的,当转到页面的时候,会自动变化为a标签,通过router-link可以实现路由的切换,整个过程都是不走网络请求的
                * active-class="active" 当点击了该标签之后,会给该标签加上active样式
                * to="/about" 当点击了该标签之后,就会将页面转到 localhost:8080/#/about页面
        -->
		<router-link class="list-group-item" active-class="active" to="/about">About</router-link>
		<router-link class="list-group-item" active-class="active" to="/home">Home</router-link>
		<!--指定组件的呈现位置,类似于插槽slot-->
		<router-view></router-view>
	</div>
</template>

<script>
export default {
	name: "App",
	components: {},
};
</script>
```

```html
<!--Home.vue-->

<template>
	<h2>我是Home的内容</h2>
</template>
```

```html
<!--About.vue-->

<template>
	<h2>我是About的内容</h2>
</template>
```

## 注意细节

```html
<!--
    * 当页面从Home路由切换到About路由的时候,其实是将Home组件销毁,然后生成About路由,反之亦然...
    * Home组件和About组件的VueComponent对象上 有一个$route属性 和 一个$router属性
        * 两个组件的 $route属性不同,即路由不同
        * 两个组件的 $router属性相同,即路由器是同一个
-->

<!--Home.vue-->

<template>
	<h2>我是Home的内容</h2>
</template>

<script>
export default {
	name: "Home",
	mounted() {
		// 可以分别在Home组件和About组件挂载完毕后, 通过在window上设置homeRoute,homeRouter两个属性,然后在浏览器里比较
		// * window.homeRoute === window.aboutRoute // false
		// * window.homeRouter === window.aboutRouter // true
		window.homeRoute = this.$route;
		window.homeRouter = this.$router;
	},
	beforeDestroy() {
		// 可以通过设置beforeDestory()来看,切换路由时,组件是否被销毁
		console.log("Home组件被销毁");
	},
};
</script>
```

```html
<!--About.vue-->

<template>
    <h2>我是About的内容</h2>
</template>

<script>
    export default {
        name: "About",
        mounted() {
            window.aboutRoute = this.$route;
            window.aboutRouter = this.$router;
        },
    };
</script>
```

## 嵌套路由

```js
/*
    配置多级路由,使用children配置项
        routes: [
            {
                path: '/home',
                component: Home
                children: [
                    {
                        path: 'message',
                        component: Message
                    },
                    {
                        path: 'news',
                        component: News
                    }
                ]
            }
        ]
    跳转(要写完整的路径)
        <router-link to='/home/news'>News</router-link>
 */

// router/index.js

export default new vueRouter({
    routes: [
        {
            path: "/about",
            component: About,
        },
        {
            path: "/home",
            component: Home,
            // 给'/home'路由添加子路由
            children: [
                {
                    // 这里只需要'message',不需要'/message'
                    path: "message",
                    component: Message,
                },
                {
                    path: "news",
                    component: News,
                },
            ],
        },
    ],
});
```

```html
<!--Home.vue-->

<template>
    <div class="home">
        <h2>home内容</h2>

        <ul>
            <li>
                <!--to的路径要写完整,不能只写一个'news'-->
                <router-link to="/home/news">News</router-link>
            </li>
            <li>
                <router-link to="/home/message">Message</router-link>
            </li>
        </ul>
        <!--编写router-view标签,显示切换的路由-->
        <router-view></router-view>
    </div>
</template>
```

```html
<!--News.vue-->

<template>
    <div>
        <ul>
            <li>news001</li>
            <li>news002</li>
            <li>news003</li>
        </ul>
    </div>
</template>
```

## 命名路由

```js
/*
    当路由的路径很长的时候,比如: '/home/message/detail',可以通过命名路由,再调用,进行简化
        命名路由
            ....
            children: [
                {
                    name: 'detail',
                    path: 'detail',
                    component: Detail
                }
            ]
        to切换路由的路径
            <router-link :to={name: 'detail'} ></router-link>

*/

// router/index.js

export default new vueRouter({
	routes: [
		{
			// 给/about路由命名about
			name: "about",
			path: "/about",
			component: About,
		},
		{
			path: "/home",
			component: Home,
			children: [
				{
					path: "message",
					component: Message,
					children: [
						{
							// 给/detail路由命名detail, 注意这个name,接受的是字符串!!!
							name: "detail",
							path: "detail",
							component: Detail,
						},
					],
				},
				{
					path: "news",
					component: News,
				},
			],
		},
	],
});
```

```html
<!--Message.vue-->

<template>
	<div>
		<ul>
			<li v-for="m in messageList" :key="m.id">
				<!--完整写法-->
				<router-link to="/home/message/detail"></router-link>
				<!--通过命名来简化代码-->
				<router-link :to="{ name: 'detail' }"></router-link>
			</li>
		</ul>
		<hr />
		<router-view></router-view>
	</div>
</template>
```

## 路由的参数

### 区分query,params参数

传递一个 tom,18 的参数

* query 参数: localhost:5000?name='tom'&age=18
* params 参数: localhost:5000/tom/age

### 传递 query 参数

```html
<!--
    父路由message,想要给子路由detail传递query参数
        传递数据, Message.vue
            方法1: 通过字符串模板来实现
				<router-link :to="`/home/message/detail?id=${m.id}&title=${m.title}`"></router-link>
            方法2: 通过对象写法来实现
                <router-link
					:to="{
						path: '/home/message/detail',
						query: {
							id: m.id,
							title: m.title,
						},
					}"
				>
				</router-link>
        接受数据, 传递过来的query参数会保存在$route.query下, Detai.vue
            $route.query.id
            $route.query.title

-->

<!--Message.vue-->

<template>
	<div>
		<ul>
			<li v-for="m in messageList" :key="m.id">
				<!--to的字符串写法, 通过模板字符串动态的传递query参数-->
				<router-link
					:to="`/home/message/detail?id=${m.id}&title=${m.title}`"
					>{{ m.title }}</router-link>
				&nbsp;&nbsp;

				<!--to的对象写法-->
				<router-link
					:to="{
						path: '/home/message/detail',
						// 传递query参数
						query: {
							id: m.id,
							title: m.title,
						},
					}"
				>
					{{ m.title }}
				</router-link>
				&nbsp;&nbsp;

				<!--所以根据to的对象写法,我们之前的to还可以这样写-->
				<router-link
					:to="{ path: '/home/message/detail' }"
				></router-link>
			</li>
		</ul>
		<hr>
		<router-view></router-view>
	</div>
</template>
```

```html
<!--Detail.vue-->

<template>
	<ul>
		<!--在$route下有一个query属性,里面就是Message组件传递来的query参数-->
		<li>消息: {{ $route.query.title }}</li>
		<li>编号: {{ $route.query.id }}</li>
		<!--$route.path就是路径-->
		<li>path: {{ $route.path }}</li>
	</ul>
</template>
```

### 传递 params 参数

```js
/*
    父路由message,想要给子路由detail传递params参数
        配置路由,声明接受params参数, router/index.js
            {
                name: "detail",
                path: "detail/:id/:title",
                component: Detail,
            },
        传递参数, Message.vue
            方法1: 通过模板字符串来实现
                <router-link :to="`/home/message/detail/${m.id}/${m.title}`"></router-link>
            方法2: 通过对象写法来实现
				<router-link
					:to="{
						// 注意: 传递params参数,只能通过name配置项来指定路径,不可以编写path: 'home/message/detail'
						name: 'detail',
						params: {
							id: m.id,
							title: m.title,
						},
					}"
				>
				</router-link>
        接受参数,传递过来的params参数会保存在$route.params下
            $route.params.id
            $route.params.title

*/

export default new vueRouter({
	routes: [
		{
			path: "/home",
			component: Home,
			children: [
				{
					path: "message",
					component: Message,
					children: [
						{
							name: "detail",
							// 通过占位符,指定传递参数的key
							path: "detail/:id/:title",
							component: Detail,
						},
					],
				},
			],
		},
	],
});
```

```html
<!--Message.vue-->

<template>
	<div>
		<ul>
			<li v-for="m in messageList" :key="m.id">
				<!--to的字符串写法, 通过模板字符串,传递params参数-->
				<router-link :to="`/home/message/detail/${m.id}/${m.title}`">
					{{ m.title }}
				</router-link>
				&nbsp;&nbsp;

				<!--to的对象写法, 通过params配置项,传递params参数-->
				<router-link
					:to="{
						// 注意: 传递params参数,只能通过name配置项来指定路径,不可以编写path: 'home/message/detail'
						name: 'detail',
						params: {
							id: m.id,
							title: m.title,
						},
					}"
				>
					{{ m.title }}
				</router-link>
				&nbsp;&nbsp;
			</li>
		</ul>
		<hr />
		<router-view></router-view>
	</div>
</template>
```

```html
<!--Detail.vue-->

<template>
	<ul>
		<!--在$route下有一个params属性,里面就是Message组件传递来的params参数-->
		<li>消息: {{ $route.params.title }}</li>
		<li>编号: {{ $route.params.id }}</li>
	</ul>
</template>
```

### 路由的 props 配置

```js
/*
    每次接受参数都是,{{$route.query.id}}, {{$route.params.title}},重复的非常多,可以通过配置路由的props设置,可以简化收到参数后的使用,达到{{id}},{{title}}的效果
        配置props配置项 router/index.js
            写法1: 对象形式
                props: {a: 1, b: 'hello'}
            写法2: 布尔形式,只适用于params参数的传递
                props: true
            写法3: 函数形式
                props: function($route) {
                    return {
                        id: $route.query.id,
                        title: $route.query.title
                    }
                }
        接受参数, 在vc里编写props配置项,接受'id'和'title'参数即可
            props: ['id', 'title']
*/

export default new vueRouter({
	routes: [
		{
			path: "/home",
			component: Home,
			children: [
				{
					path: "message",
					component: Message,
					children: [
						{
							name: "detail",
							path: "detail/:id/:title",
							component: Detail,

							// 写法1 对象形式: 对象中的所有的k-v都会以props的形式传递给Detail组件
							props: { a: 1, b: "hello" },

							// 写法2 布尔形式: 把路由组件收到的所有的params参数,以props的形式传递给Detail组件, 注意: 只能传递params参数,所以query参数就传递不了了
							props: true,

							// 写法3 函数形式: 接受到一个参数是$route,返回一个对象,对象中所有的k-v都会以props的形式传递给Detail组件, 这个写法,既可以处理params参数,也可以处理query参数
							props($route) {
								return {
									id: $route.query.id,
									title: $route.query.title,
								};
							},
						},
					],
				},
			],
		},
	],
});
```

```html
<!--Detail.vue-->

<template>
	<ul>
		<!--简化前-->
		<li>消息: {{ $route.query.title }}</li>
		<!--简化后: 直接使用参数-->
		<li>消息: {{ title }}</li>
		<li>编号: {{ id }}</li>
	</ul>
</template>

<script>
export default {
	name: "Detail",
	// 通过props,引入参数
	props: ["id", "title"],
};
</script>
```

## 操作历史记录

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521036.png)

```html
<!--使用push的写法方式,操作浏览器历史记录, 路由跳转时,默认为push-->
<router-link to="/about">about</router-link>
<!--使用replace的写入方式-->
<router-link replace to="/home">home</router-link>
```

## 编程式路由导航

```html
<!--Message.vue-->

<template>
    <div>
        <div>
            <button @click="back">后退</button>
            <button @click="forward">前进</button>
            <button @click="go">go跳转</button>
        </div>
        <ul>
            <li v-for="m in messageList" :key="m.id">
                <!--注意这里,需要将m传递过去-->
                <button @click="pushShow(m)">push查看</button>
                <button @click="replaceShow(m)">replace查看</button>
            </li>
        </ul>
        
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: "Message",
    data() {
        return {
            messageList: [
                {id: '001', title: '消息001'},
                {id: '002', title: '消息002'},
                {id: '003', title: '消息003'},
            ]
        }
    },
    methods: {
        // $router上面有push(),replace()可以拿来代理router-link,来操作跳转路由,传参,同时可以指定操作历史记录的方式
        pushShow(m) {
            this.$router.push({
                name: 'detail',
                query: {
                    id: m.id,
                    title: m.title
                }
            })
        },
        replaceShow(m) {
            this.$router.replace({
                name: 'detail',
                query: {
                    id: m.id,
                    title: m.title
                }
            })
        },
        // $router里有back(),forward()效果类似于浏览器的前进,后退按钮
        back() {
            this.$router.back();
        },
        forward() {
            this.$router.forward();
        },
        go() {
            // $router.go(n),跳转n个页面,n可以为负数,即后退页面
            this.$router.go(2); // 向前跳转2个页面
        }
    }
}
</script>
```

```html
<template>
    <div>
        <h3>Detail内容</h3>
        <p>{{id}} - {{title}}</p>
    </div>
</template>

<script>
export default {
    name: "Detail",
    props: ['id', 'title']
}
</script>
```

## 缓存路由组件

```html
<!--
	将News页面做一个缓存,切换路由的时候,该组件不被销毁,如果不写include属性,那么默认就是router-view里的全部页面都做缓存
	注意: 这里的'News'是组件名,并不是路由名
-->
<keep-alive include="News">
	<router-view></router-view>
</keep-alive>
```

## activated(), deactivated()

当组件被keep-alive缓存了,就可以使用两个是新的生命周期钩子: activated(), deactivated()

* activated() 当News组件被激活(切换到该路由)时,调用该钩子
* deactivated() 当News组件失活时(切换到了别的路由),调用该钩子

当News组件做了缓存,我们又在News组件里添加了定时器,我们无法在beforeDestroy()里清除定时器,因为页面不销毁,就不会调用beforeDestroy()

所以我们可以在activated()里添加定时器,在deactivated()里清除定时器

```html
<!--Home.vue-->

<router-link to="/home/message">Message</router-link>
<router-link to="/home/news">News</router-link>
<!--缓存路由,注意: activated(),deactivated()钩子,必须通过keep-alive,将组件做了缓存之后,才会触发这两个钩子-->
<keep-alive>
    <router-view></router-view>
</keep-alive>
```

```html
<!--News.vue-->

<template>
    <div>
        <ul>
            <li>news1</li>
            <li>news2</li>
            <li>news3</li>
        </ul>
    </div>
</template>

<script>
export default {
    name: "News",
    // 当News组件被激活时,调用该钩子
    activated() {
        this.timer = setInterval(() => {
            console.log('@');
        }, 500);
    },
    // 当News组件失活时(切换到了别的路由),调用该钩子
    deactivated() {
        // 当页面失活时,清除定时器
        clearInterval(this.timer);
    }
    
    // ------------------
    
    // 在没有对组件做缓存之前,路由切换一次,就是销毁一次组件,可以通过mounted(),beforeDestory()完成这个需求
    // 此时对组件做了缓存之后,路由切换一次,就不会触发销毁,通过mounted(),beforeDestory()就无法完成这个需求了
    mounted() {
        ...
    },
    beforeDestroy() {
        ...
    },
}
</script>
```

## 路由守卫

### 全局路由守卫

```js
/*
    路由守卫分为: 全局路由守卫, 独享路由守卫, 组件内路由守卫
        * 全局路由守卫,放在定义路由的外面,可以操作全局的路由,即 router/index.js
            // 前置全局路由守卫, 初始化的时候,路由切换前被调用
            router.beforeEach((to, from, next) => {
                ...
            }),
            // 后置全局路由守卫, 路由切换后调用
            router.afterEach((to, from, next) => {
                ...
            })
        * 独享路由守卫,放在定义路由的里面,只能操作某一个路由,并且只有前置路由
            {
                path: 'message',
                component: Message,
                // 这里的路由守卫只操作message路由
                beforeEnter(to, from, next) {
                    ...
                }
            },
        * 组件内路由守卫,放在组件内部,只能操作某一个组件 Detail.vue
            // 在切换到Detail.vue路由之前,调用该方法
            beforeRouteEnter(to, from, next) {
                ...
            },
            // 从Detail.vue路由切换走之前调用该方法
            beforeRouteLeabe(to, from, next) {
                ...
            }
*/

// router/index.js

const router = new vueRouter({
    routes: [
        {
            name: 'about',
            path: '/about',
            component: About,
            meta: {
                title: '关于'
            }
        },
        {
            path: '/home',
            component: Home,
            meta: {
                title: '主页'
            },
            children: [
                {
                    name: 'message',
                    path: 'message',
                    component: Message,
                    // $route.meta是路由给我们准备的 路由元信息(由我们程序员所自定义的信息)
                    meta: {
                        title: '消息',
                        isAuth: true, // 是否进行权限校验, authorization 授权
                    }
                },
                {
                    name: 'news',
                    path: 'news',
                    component: News,
                    meta: {
                        title: '新闻',
                        isAuth: true
                    }
                }
            ]
        }
    ]
})

// 全局前置路由守卫, 初始化的时候会被调用,每次路由切换之前被调用
router.beforeEach((to, from, next) => {
    // * to,from 有来去的路由信息,有: fullPath, meta, query, params, name...
    // * next() 准许切换路由,放行!!!如果不使用next(),就不允许切换路由

    // 判断如果是访问message和news(message是/home/message路由的name属性,可以直接在这里使用,news也是一样的用法),就需要localStorage里的name属性为'sun',如果不是,就提示'无权限'
    if (to.meta.isAuth) {
        if (localStorage.getItem('name') === 'sun') {
            next(); // 放行
            
            next("/home"); // 放行, 导航到 "/home" 路由
            next(false); // 放行, 导航到 from 对应的路由
        } else {
            alert('无权限');
        }
    } else { // 判断访问的不是message和news就直接通过next()来准许访问
        next(); // 放行
    }
})

// 全局后置路由守卫, 初始化的时候被调用,每次路由切换之后被调用
router.afterEach((to, from, next) => {
    // 当切换了路由之后,修改页面的title,将每个路由的title放在meta配置项里,这样方便调用
    document.title = to.meta.title || '小孙系统';
})

export default router;
```

### 独享路由守卫

```js
// router/index.js

const router = new vueRouter({
    routes: [
        {
            path: '/home',
            component: Home,
            children: [
                {
                    path: 'message',
                    component: Message,

                    // 独享路由守卫,就是在切换到message路由之前调用.
                    beforeEnter(to, from, next) {
                        // 我们可以把对message路由的校验放在这里
                        ...
                    }
                    // 注意: 独享路由守卫,只有前置的,没有后置的
                },
            ]
        }
    ]
})
```

### 组件内路由守卫

```html
<!--about.vue-->

<template>
    <div class="about">
        <h2>about内容</h2>
    </div>
</template>

<script>
export default {
    name: "About",
    // 通过路由规则, 进入该组件前被调用
    beforeRouteEnter(to, from, next) {
        if (to.meta.isAuth) {
            if (localStorage.getItem('name') === 'sun') {
                next();
            } else {
                alert('无权限');
            }
        } else {
            next();
        }
    },
    // 通过路由规则, 离开该组件前被调用
    beforeRouteLeave(to, from, next) {
        document.title = to.meta.title;
        next();
    }
}
</script>
```

## 路由的两种工作模式

hash模式: localhost:8080/#/home/message/detail

* 地址中的'#'就是hash,地址中永远带着'#'不太美观
* 若以后将地址通过第三方app分享,若app校验严格,则地址会被标记为不合法
* 兼容性好(支持ie6,7,8)

history模式: localhost:8080/home/message/detail

* 地址干净,美观
* 兼容性和hash模式相比略差(不支持ie6,7,8)
* 应用部署上线时需要后端人员支持,解决刷新页面服务端404的问题(比如引入: connect-history-api-fallback包)

```js
// 安装并引入 'connect-history-api-fallback' 包
import history from 'connect-history-api-fallback'

const router = new vueRouter({
    // 设置路由模式为'history',如果不设置,默认为'hash'
    mode: 'history' 
    routes: [
        ...
    ]
})
```

# ui组件库

## 常用ui组件库

移动端常用UI 组件库

* Vant          https://youzan.github.io/vant
* Cube UI       https://didi.github.io/cube-ui
* Mint UI       http://mint-ui.github.io

PC 端常用UI 组件库

* Element UI    https://element.eleme.cn
* IView UI      https://www.iviewui.com
