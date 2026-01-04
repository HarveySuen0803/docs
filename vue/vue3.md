# 搭建Vue3的工程

## 使用 vue-cli 创建

```bash
# 查看@vue/cli版本，确保@vue/cli版本在4.5.0以上
vue --version

# 安装或者升级你的@vue/cli
npm install -g @vue/cli

# 创建 注意选择vue3项目的创建
vue create vue_test

# 进入vue_test项目
cd vue_test

# 启动
npm run serve 或者 yarn serve
```

## 使用 vite 创建

```bash
# 创建工程
npm init vite-app vue3_test

# 进入工程目录
cd vue3_test

# 安装依赖
npm install

# 运行
npm run dev
```

## 分析工程结构

```js
// main.js 入口文件

// 引入的不再是Vue构造函数,而是一个createApp的工厂函数
import { createApp } from 'vue'
import App from './App.vue'

// 创建应用实例对象app,类似于之前vue2中的vm,但是app比vm更轻
createApp(App).mount('#app')

/*
    // 创建app实例对象
    const app = createApp(App);
    // 挂载
    app.mount('#app')
 */
```

```vue
<!--App.vue-->

<template>
    <!--Vue3中的组件标签,可以没有根标签-->
    <p>hello</p>
    <p>world</p>
</template>

<script>
export default {
}
</script>

<style></style>
```

# Composition API

## setup()

### 基本使用

```vue
<!--
    setup()是所有Composition API(组合API)表演的舞台

    组件中所有用到的: 数据, 方法... 全部都要配置在setup中,即vue2里的data,methods...配置项的内容需要写到setup里

    setup两种返回值
        * 如果返回一个对象, 则对象中的属性,方法, 在模板中均可以直接使用(常用)
        * 如果返回一个渲染函数, 则可以自定义渲染内容(了解)

    注意点:
        * 尽量不要与Vue2的配置混用
            * Vue2的配置(data,methods,computed...)中可以访问到setup中的属性和方法
            * 但在setup中不能访问Vue2的配置
            * 如果有重名,setup的内容优先覆盖掉Vue2的配置内容
        * setup不能是一个async函数,如果使用async修饰,那么返回值不再是return的对象,而是promise对象,模板看不到return对象中的属性了
-->

<template>
    <p>{{name}}</p>
    <p>{{age}}</p>
    <button @click="showInfo">点我调用setup()中的showInfo()</button>
</template>

<script>
export default {
    name: 'App',
    // 暂时不考虑响应式的问题
    setup() {
        // 数据
        let name = 'sun';
        let age = 18; 
        // 方法
        function showInfo() {
            console.log(name, age);
        }
        // 返回一个对象(常用)
        return {
            name,
            age,
            showInfo
        }
        /*
            返回一个函数(渲染函数)
            需要先引入h; import {h} from 'vue'
                return () => {
                    // 创建一个h1标签,内容为'我是小孙',然后将整个模板全部覆盖掉,即整个页面中,就只有一个<h1>我是小孙</h1>
                    h('h1', '我是小孙')
                }
         */
    }
}
</script>
```

### 注意事项
```vue
<!--
    setup在beforeCreate之前执行一次,此时的VueComponent对象,即this为undefined,所以很多东西使用不了

    setup的参数
        * props: 值为一个Proxy对象,存储props配置项接受到的参数,相当于Vue2中的this.$props
        * context: 值为一个对象
            * attrs: 存储props配置项没有接受到的参数, 相当于Vue2中的this.$attrs
            * slots: 存储要插入插槽的内容, 相当于Vue2中的this.$slots
            * emit: 触发事件, 相当于Vue2中的this.$emit
-->

<!--App.vue-->

<template>
    <Demo msg1="hello" msg2="world" @showInfo="showInfo">
        <template v-slot:center>
            <p>我是p标签</p>
        </template>
    </Demo>
</template>

<script>
import Demo from "@/components/Demo";
export default {
    name: 'App',
    components: {
        Demo
    },
    methods: {
        showInfo(val) {
            console.log(val); // Proxy{name: 'sun', age: 18}
        }
    }
}
</script>
```

```vue
<!--Demo.vue-->
<template>
    <button @click="test">触发自定义事件</button>
    <button @click="show">点我</button>
</template>

<script>
import {reactive} from "vue";

export default {
    name: "Demo",
    props: ['msg1', 'msg2'],
    // setup会在beforeCreate之前自动调用一次
    setup(props, context) {
        let person = reactive({name: 'sun', age: 18})

        // 此时的this为undefined
        console.log(this) // undefined

        // 这里的props参数是一个Proxy对象,将外面props配置项接受到的数据封装成一个Proxy对象
        console.log(props) // Proxy{msg1: 'hello', msg2: 'world'}; 和Vue2中的this.$props, this_props一样
        console.log(props.msg, props.name) // hello world

        // context上下文对象
        console.log(context) // {expose: ƒ}
        console.log(context.attrs) // Proxy{__vInternal: 1, onShowInfo: ƒ}; 和Vue2中的this.$attrs一样,存储props配置项没有接受到的参数
        console.log(context.slots) // Proxy{_: 1, __vInternal: 1, center: ƒ}; 和Vue2中的this.$slots一样,存储的是要插入插槽的内容
        let test = () => {
            context.emit('showInfo', person) // 和Vue2中的this.$emit一样,触发事件
        }
        return {
            test
        }
    },
    methods: {
        show() {
            console.log(this)
        }
    }
}
</script>
```

## ref()

```vue
<!--
    在setup()中定义的数据,是无法直接做到响应式的(即修改了数据,不会引起模板的重新解析),需要使用ref()来做到响应式的效果
        let name = 'sun' 无响应式
        let name = ref('sun') 有响应式
    基本使用:
        引入ref
            import {ref} from 'vue'
        使用ref
            let name = ref('sun') // 定义value为'sun'的RefImpl对象引用
            name.value = 'xue' // 修改name的value值为'xue'
    备注: ref()既可以定义基本类型的数据,也可以定义对象类型的数据
        基本类型的数据: 响应式依靠Object.defineProperty()的getter()和setter()完成
        对象类型的数据: 响应式依靠Vue3.0的reactive()完成
-->

<template>
    <!--这里的name和age,底层Vue在解析模板的时候,会自动调用name.value和age.value,所以我们这里可以直接使用-->
    <p>{{name}}</p>
    <p>{{age}}</p>
    <!--访问对象类型的数据, 直接是job.type即可,不需要job.value.type-->
    <p>{{job.type}}</p>
    <button @click="change">点我</button>
</template>

<script>
// 引入ref函数
import {ref} from "vue";

export default {
    name: 'App',
    setup() {
        // 调用ref(),将name和age的值封装成一个RefImpl对象并返回(reference implement, 即是一个引用实现的实例对象,简称 引用对象/ref对象),所以这里的name和age是一个RefImpl的实例对象
        // 该对象的原型对象上有一个value属性,然后通过Object.defineProperty生成getter和setter进行数据监测,然后通过数据代理,将value也挂载到了RefImpl对象身上,就类似于vm._data里的数据和vm下的数据
        // 因为name的getter和setter不在RefImpl对象身上,是在RefImpl的原型对象身上,所以,我们调用name.value访问的时候,是去RefImpl的原型对象身上找到的getter,非常的巧妙!!!
        let name = ref('sun');
        let age = ref(18);

        // ref()在处理对象类型的数据的时候,将传入的对象封装成一个RefImpl对象
        // 该对象的value值存储的是一个Proxy对象(即属性type和sal都存放在该Proxy对象中),type和sal不具有setter,是借助reactive达到数据监测的效果(即响应式),我们想要访问就直接job.value.type即可
        let job = ref({
            type: 'java工程师',
            sal: '30K'
        })
        function change() {
            // 修改基本类型数据name和age的值,会去默认调用setter,达到响应式的效果
            name.value = 'xue';
            age.value = 20;
            // 修改对象类型数据job的type值,借助reactive(),达到响应式的效果
            job.value.type = 'web工程师';
            console.log(name); // RefImpl{_shallow: false, dep: Set(1), __v_isRef: true, _rawValue: 'xue', _value: 'xue'}
            console.log(job); // RefImpl{_shallow: false, dep: Set(1), __v_isRef: true, _rawValue: {…}, _value: Proxy}
            console.log(job.value); // Proxy{type: 'web工程师', sal: '30K'}
        }

        return {
            name,
            age,
            job,
            change
        }
    }
}
</script>
```

## reactive()

```vue
<!--
    reactive(): 定义一个对象类型的响应式数据(基本类型不要用它,用ref()),返回的是一个Proxy对象,该对象里存储着我们传入参数对象的属性值

    基本使用
        引入reactive()
            import {reactive} from 'vue'
        使用reactive()
            let person = reactive({
                name: 'sun',
                job: {
                    type: 'java工程师',
                    sal: '40K'
                },
                hobby: ['抽烟','喝酒','烫头']
            })
            person.name = 'job'
            person.job.type = 'web工程师'
            person.hobby[0] = '学习'

    备注:
        * reactive()定义的响应式数据是深层次的
        * 内部基于ES6的Proxy实现,通过 代理对象 操作 源对象内部数据 进行操作
        * ref()在定义对象类型的数据的时候,就是调用了reactive(),所以ref对象value值是一个Proxy对象

    reactive()和ref() 比较
        从定义角度:
            * ref用来定义基本类型的数据
                let name = ref('sun')
            * reactive用来定义对象,数组类型的数据
                let person = reactive({
                    name: 'sun',
                    hobby: ['抽烟','喝酒','烫头']
                })
        从原理角度:
            * ref通过Object.defineProperty()的get()和set()来实现响应式(数据劫持)
            * reactive通过Proxy来实现响应式(数据劫持),并通过Reflect操作源对象内部的数据
        从使用角度:
            * ref定义的数据
                在模板中使用: {{name}}
                获取,操作数据: name.value
            * reactive定义的数据
                在模板中使用: {{person.name}}
                获取,操作数据: person.name
-->

<template>
    <p>{{job.type}} - {{job.sal}}</p>
    <p>{{hobby}}</p>
    <button @click="change">点我</button>
</template>

<script>
import {reactive} from "vue";

export default {
    name: 'App',
    setup() {
        // reactive()定义的对象类型的数据,返回的就是一个Proxy对象,里面存储着type和sal属性,所以此时的job就是一个Proxy实例对象,我们想要访问,直接job.type
        // Proxy对象里的属性,是响应式的,具有数据监测的效果
        let job = reactive({
            type: 'java工程师',
            sal: '30K'
        })
        // 数组类型的数据,也是对象类型的,所以通过reactive()也可以做到响应式的效果
        let hobby = reactive(['抽烟', '喝酒', '烫头'])

        function change() {
            // 通过ref()定义的对象类型的job数据,需要通过job.value.type来访问到,现在直接job.type,非常的方便
            console.log(job) // Proxy{type: 'web工程师', sal: '30K'}
            console.log(hobby) // Proxy{0: '抽烟', 1: '喝酒', 2: '烫头'}
            // 修改对象类型的数据
            job.type = 'web工程师'
            // 在Vue2直接修改数组某一个元素的数据,是无法监测的,即模板不会重写解析,但是在Vue3中,通过reactive()定义的数据,可以检测到深层次的数据变化的,非常的nice啊!!!
            hobby[0] = '学习'
        }
        return {
            job,
            hobby,
            change
        }
    }
}
</script>
```

## Vue3的响应式原理

### 响应式处理

```vue
<!--
    在Vue2中,直接修改对象的某一个属性,直接给对象添加一个属性,直接删除对象的某一个属性,直接修改数组的某一个元素的值,都是不会引起模板的重新解析,也就是,不会引起页面的变化. 我们之前在处理这个问题的时候,都是借助 $set(), $delete(), 数组的7大方法 来解决

    在Vue3中,通过reactive()定义出来的数据,是可以直接修改
-->

<template>
    <p>姓名: {{person.name}}</p>
    <p>职业: {{person.job.type}}</p>
    <p>薪水: {{person.job.sal}}</p>
    <p>爱好: {{person.hobby}}</p>
    <p>性别: {{person.sex || '???'}}</p>
    <!--直接修改对象类型的深层数据的值, 会引起模板的重新解析-->
    <button @click="person.name = 'xue'">修改姓名</button>
    <!--直接修改数组的某一个元素的值, 会引起模板的重新解析-->
    <button @click="person.hobby[0] = '学习'">修改爱好</button>
    <!--直接删除对象的某一个属性, 会引起模板的重新解析-->
    <button @click="delete person.job.sal">删除薪水</button>
    <!--直接给一个对象添加属性, 会引起模板的重新解析-->
    <button @click="person.sex = '男'">添加性别</button>
</template>

<script>
import {reactive} from "vue";

export default {
    name: 'App',
    setup() {
        // 通过reactive(),定义一个响应式的对象类型的数据
        let person = reactive({
            name: 'sun',
            job: {
                type: 'java工程师',
                sal: '50K'
            },
            hobby: ['抽烟', '喝酒', '烫头']
        })
        return {
            person,
        }
    }
}
</script>
```

### 响应式原理

```js
/*
    通过Proxy(代理), 拦截对象中任意属性的变化, 包括: 属性的读取, 属性的修改, 属性的添加, 属性的删除
    通过Reflect(反射), 对源对象的属性进行操作
*/

let person1 = {
    name: 'sun',
    age: 18
}
let person2 = {
    name: 'sun',
    age: 18
}
let person3 = {
    name: 'sun',
    age: 18
}

// Vue3中实现响应式, 对p进行数据代理,通过创建Proxy对象实例
let p1 = new Proxy(person1, {
    // 只要访问了p1某个属性,就调用get(),而Object.definePrototype(person2, 'name', {})只是针对person某一个属性进行处理
    get(target, propName) {
        // * target -- person1对象
        // * propName -- 所访问的person1对象的属性,是一个字符串
        console.log(`有人读取了p1身上的${propName}属性`)
        console.log(target, propName) // {name: 'sun', age: 18} 'name'
        return target[propName] // 因为propName是一个字符串,所以不能target.propName,所以需要用这种写法
    },
    // 只要修改了p1某个属性,或者追加了某个属性,就调用set()
    set(target, propName, value) {
        console.log(`有人修改了p1身上的${propName}属性`)
        target[propName] = value
    },
    // 只要删除了p1某个属性,就调用deleteProperty()
    deleteProperty(target, propName) {
        console.log(`有人删除了p1身上的${propName}属性`)
        // delete关键字,删除属性,是有一个boolean返回值的
        return delete target[propName]
    }
})

// 在Vue3底层,真正实现对数据的 增删改查,是通过Reflect身上的get(),set(),deletePrototype()对源对象的属性进行操作
let p2 = new Proxy(person2, {
    get(target, propName) {
        // 获取target对象身上的propName属性
        return Reflect.get(target, propName)
    },
    set(target, propName, value) {
        // 如果有propName属性,就修改target身上的propName属性的值为value
        // 如果没有propName属性,就追加propName属性到target身上,值为value
        return Reflect.set(target, propName, value)
    },
    deleteProperty(target, propName) {
        // 删除target的propName属性
        return Reflect.deleteProperty(target, propName)
    }
})

let p3 = {}
// Vue2中实现响应式, 对p进行数据代理,将person.name和person.age放到p下,可以通过get()和set()进行访问和修改
Object.defineProperty(p3, 'name', {
    configurable: true, // 设置可以修改person.name的值
    get() {
        console.log('有人获取了name的值')
        return person3.name
    },
    set(value) {
        console.log('有人修改了name的值')
        person3.name = value;
    }
})
Object.defineProperty(p3, 'age', {
    configurable: true, // 设置可以修改person.age的值
    get() {
        console.log('有人获取了age的值')
        return person3.age
    },
    set(value) {
        console.log('有人修改了age的值')
        person3.age = value;
    }
})
```

## computed()

```vue
<!--
    computed() 计算属性,返回一个属性,和Vue2的computed配置项效果一样

    基本使用
        引入computed
            import {computed} from 'vue'
        定义计算属性
            完整形式: 考虑读和写
                let fullName = computed({
                    get() {
                        return ...
                    },
                    set(value) {
                        ...
                    }
                })
            简写形式: 考虑读,不考虑写
                let fullName = computed(() => {
                    return ...
                })
        使用计算属性: 和computed配置项里的用法一样
-->
<template>
    姓: <input type="text" v-model="person.firstName"> <br><br>
    名: <input type="text" v-model="person.lastName"> <br><br>
    全名: <input type="text" v-model="person.fullName"> <br><br>
</template>

<script>

import {reactive, computed} from "vue";

export default {
    name: "Demo",
    setup() {
        let person = reactive({
            firstName: '孙',
            lastName: '学成'
        })

        // 计算属性--简写形式(考虑读,不考虑写)
        person.fullName = computed(() => {
            return person.firstName + '-' + person.lastName
        })

        // 计算属性--完整形式(考虑读和写)
        person.fullName = computed({
            get() {
                return person.firstName + '-' + person.lastName
            },
            set(value) {
                const nameArr = value.split('-')
                person.firstName = nameArr[0]
                person.lastName = nameArr[1]
            }
        })
        
        return {
            person
        }
    }
}
</script>
```

## watch()

```vue
<!--
    watch() 监视属性变化, 和Vue2中的watch一样
    
    基本使用
        引入watch()
            import {watch} from 'vue'
        使用watch()
            // 有多种情况,详情看下面...
            watch(sum, (oldValue, newValue) => {
                ...
            })
-->

<template>
    <p>总数: {{sum}}</p>
    <button @click="sum++">总数变化</button>
    <p>信息: {{msg}}</p>
    <button @click="msg += '!'">信息变化</button>

    <p>姓名: {{person.name}}</p>
    <p>年龄: {{person.age}}</p>
    <p>工资: {{person.job.sal}}</p>
    <button @click="person.name = 'xue'">姓名变化</button>
    <button @click="person.age = 20">年龄变化</button>
    <button @click="person.job.sal = '40K'">工资变化</button>
</template>

<script>

import {reactive, ref, watch} from "vue";

export default {
    name: 'App',
    setup() {
        let sum = ref(0)
        let msg = ref('hello')
        let person = reactive({
            name: 'sun',
            age: 18,
            job: {
                sal: '20K'
            }
        })

        // 监视ref定义的 一个 响应式数据; 如果想要添加immediate或者deep的配置,就放在第三个参数的对象里
        // 这里监视的sum其实一个ref对象,如果ref对象的value发生变化,就会监视得到,因为在Vue3中默认是监视得到对象里的属性发生的变化的, 所以我们在这里直接监视sum即可,不可以监视sum.value,因为sum.value就是一个数值,即监视的是一个数字,故error
        watch(sum, (newValue, oldValue) => {
            console.log('sum发生变化', newValue, oldValue)
        }, {immediate: true})

        // 监视ref定义的 多个 响应式数据
        watch([sum, msg], (newValues, oldValues) => {
            // sum和msg的新旧数据,是存储在 数组newValues 和 数组oldValues 里面
            console.log('sum或msg发生变化', newValues, oldValues)
        })
        
        // 监视reactive定义的 一个 响应式数据, 此处有bug
        // * 此处无法正确获得oldValue
        // * 添加{deep:true}无效
        watch(person, (newValue, oldValue) => {
            console.log('person发生变化', newValue, oldValue)
        })

        // 监视reactive定义的 一个 响应式数据 中的 某个 属性
        watch(() => person.name, (newValue, oldValue) => {
            console.log('person.name发生了变化', newValue, oldValue)
        })

        // 监视reactive定义的 一个 响应式数据 中的 多个 属性
        watch([() => person.name, () => person.age], (newValue, oldValue) => {
            console.log('person.name或person.age发生了变化', newValue, oldValue)
        })

        // 特殊情况1: 监视reactive定义的 一个 响应式数据 中的 一个 对象属性; 直接监视是监视不到的,需要添加{deep:true}配置项才可以监视到
        watch(() => person.job, (newValue, oldValue) => {
            console.log('perosn.job发生了变化', newValue, oldValue)
        }, {deep: true})


        /*
            特殊情况2: 监视ref定义的 一个 对象类型的响应式数据;

            该obj是一个ref对象,因为ref定义对象类型的数据,底层是调用了reactive来定义的,所以obj.value是一个Proxy对象,name和age属性是放在Proxy对象下的,即obj.value.name,obj.value.age

            我们监测obj的变化,是监测的obj.value的地址是否发生了变化,而我们修改obj.value.name值,所以这样直接监视,watch是监视不到的

            解法方案
                * 方案1: 监视obj.value,这样监视的就是一个Proxy对象,监视Proxy对象默认就是深层监视
                * 方案2: 需要添加{deep:true}配置项,让watch进行深层监视,才可以监视到变化

        */
        let obj = ref({
            name: 'cheng',
            age: 20
        }) 
        watch(obj, (newValue, oldValue) => { // 监视不到
            console.log('obj发生了变化')
        })
        watch(obj.value, (newValue, oldValue) => { // 监视的到
            console.log('obj发生了变化')
        })
        watch(obj, (newValue, oldValue) => { // 监视的到
            console.log('obj发生了变化')
        }, {deep: true})

        return {
            sum,
            msg,
            person
        }
    }
}
</script>
```

## watchEffect()

```vue
<!--
    watchEffect() 监视,在watchEffect()的回调函数中,所用到哪个属性,就监视哪个属性
-->

<template>
    <p>总数: {{sum}}</p>
    <button @click="sum++">总数变化</button>
    
    <p>姓名: {{person.name}}</p>
    <button @click="person.name = 'xue'">姓名变化</button>
</template>

<script>

import {reactive, ref, watchEffect} from "vue";

export default {
    name: 'App',
    setup() {
        let sum = ref(0)
        let person = reactive({
            name: 'sun',
        })

        // 在watchEffect中,会监视回调函数中所用到的数据,只要发生了改变,就会重新调用一次该回调函数
        watchEffect(() => {
            // 这里的回调函数,用到了 sum.value, person.name, 所以就监视他俩
            const x1 = sum.value
            const x2 = person.name
            console.log('watchEffect的回调执行了')
        })

        return {
            sum,
            person
        }
    }
}
</script>
```

## Vue3的生命周期

### 生命周期图

![image-20220223092934710](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521598.png)

### 代码验证

```vue
<!--
    在生命周期函数配置项的编写中,不同于Vue2的地方
        * 将beforeDestroy()和destroyed()钩子的名字换成了beforeUnmount()和unmounted(),更加的语义化
        * 在一开始配置app的时候,就挂载el配置项,省去了中间判断el配置项的过程

    Vue3提供了 Composition API 形式的生命周期钩子
        * onBeforeMount
        * onMounted
        * onBeforeUpdate
        * onUpdated
        * onBeforeUnmount
        * onUnmounted
-->

<template>
    <p>hello world</p>
</template>

<script>


import {onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated} from "vue";

export default {
    name: 'App',
    setup() {
        // 在Vue3的生命周期函数,都需要引入,并且没有对标beforeMount()和mounted()的
        onBeforeMount(() => {
            console.log('---beforeMount()---')
        })
        onMounted(() => {
            console.log('---mounted()---')
        })
        onBeforeUpdate(() => {
            console.log('---beforeUpdate()---')
        })
        onUpdated(() => {
            console.log('---updated()---')
        })
        onBeforeUnmount(() => {
            console.log('---beforeUnmount()---')
        })
        onUnmounted(() => {
            console.log('---unmounted()---')
        })
    },
    beforeCreate() {
        console.log('---beforeCreate()---')
    },
    created() {
        console.log('---created()---')
    },
    beforeMount() {
        console.log('---beforeMount()---')
    },
    mounted() {
        console.log('---mounted()---')
    },
    beforeUpdate() {
        console.log('---beforeUpdate()---')
    },
    updated() {
        console.log('---updated()---')
    },
    beforeUnmount() {
        console.log('---beforeUnmount()---')
    },
    unmounted() {
        console.log('---unmounted()---')
    }
}
</script>
```

## 自定义hook函数

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311521600.png)

```vue
<!--
    将setup()中使用到的 Composition API 进行封装,将相关的代码放在同一个.js里,然后通过import引入,类似于Vue2中mixin

    基本使用
        编写hook(), 在hooks/count.js中
            export default () => {
                ...
                return sum
            }
        使用hook()
            import count from './hooks/count.js'
            setUp() {
                let sum = count();
                return {sum}
            }
-->

<!--App.vue-->

<template>
    <h1>总和: {{sum}}</h1>
    <h1>X: {{point.x}}, Y: {{point.y}}</h1>
</template>

<script>

import count from './hooks/count.js'
import usePoint from './hooks/usePoint.js'
export default {
    name: 'App',
    setup() {
        let sum = count()
        const point = usePoint()
        return {sum, point}
    },
}
</script>
```

```js
// hooks/usePoint.js

import {onBeforeUnmount, onMounted, reactive} from "vue";

export default () => {
    let point = reactive({
        x: 0,
        y: 0
    })

    let savePoint = (e) => {
        point.x = e.pageX
        point.y = e.pageY
    }

    // 组件挂载之后,给页面窗口添加点击事件
    onMounted(() => {
        window.addEventListener('click', savePoint)
    })
    // 组件销毁之前,移除页面窗口的点击事件对应的savePoint的回调
    onBeforeUnmount(() => {
        window.removeEventListener('click', savePoint)
    })
    return point
}
```

```js
// hooks/count.js

import {onBeforeUnmount, onMounted, ref} from "vue";

export default () => {
    let sum = ref(0)
    let count = () => {
        sum.value++
    }
    onMounted(() => {
        window.addEventListener('click', count)
    })
    onBeforeUnmount(() => {
        window.removeEventListener('click', count)
    })
    return sum
}
```

## toRef(),toRefs()

```vue
<!--
    toRef() 创建一个ref对象, 其value值指向了另一个对象中的某个属性
        const name1 = toRef(person, 'name')
    toRefs() 创建一个对象,该对象里,存放着多个ref对象
        const list = toRefs(person)
    通过 toRefs() 搭配 '...' 来简化页面中的代码
        setUp() {
            let person = reactive({name: 'sun',job: {sal: '40K'}})
            return {
                // 解构对象,将name和job的ref对象,都瘫在了return{}里
                ...toRefs(person)
            }
        }  
-->

<template>
    <!--通过...toRefs(person),不用再写person.name,person.job.sal,直接写name,job.sal也可以实现响应式的效果-->
    <p>姓名: {{name}}</p>
    <p>工资: {{job.sal}}</p>
    <button @click="name = 'xue'">姓名变化</button>
    <button @click="job.sal = '60K'">工资变化</button>
</template>

<script>

import {reactive, toRef, toRefs} from "vue";

export default {
    name: 'App',
    setup() {
        let person = reactive({
            name: 'sun',
            job: {
                sal: '40K'
            }
        })
        const name1 = person.name // 获取到'sun'字符串,干巴巴的字符串,并不是响应式的效果
        console.log(name1) // 'sun'

        const name2 = toRef(person, 'name') // 将person.name封装成一个ref对象返回,即此时name2是响应式的
        console.log(name2) // ObjectRefImpl{_object: {…}, _key: 'name', _defaultValue: undefined, __v_isRef: true}

        const list = toRefs(person) // 将person第一层的全部属性,封装成ref对象(即将name和job封装成一个ref对象),然后按照key-value的形式返回这些ref对象
        console.log(list) // {name: ObjectRefImpl, job: ObjectRefImpl}

        return {
            // 通过 '...' 来解构对象里的属性,将name和job这两个ref对象,直接瘫在了return{}里,供页面直接使用
            ...toRefs(person)
        }
    },
}
</script>
```

## shallowReactive(),shallowRef()

```vue
<!--
    shallow 浅的
    
    shallowReactive: 只处理对象最外层属性的响应式
    shallowRef: 只处理基本类型数据的响应式,不进行对象的响应式处理

    什么时候用:
        如果只有一个对象数据, 结构比较深, 但变化只是外层属性的变化 ==> shallowReactive()
        如果只有一个对象数据, 后续功能不会修改对象中的属性, 而是生成新的对象来替换 ==> shallowRef()
-->

<template>
    <p>姓名: {{name}}</p>
    <p>工资: {{job.sal}}</p>
    <p>x.y: {{x.y}}</p>
    <button @click="name = 'xue'">姓名变化</button>
    <button @click="job.sal = '60K'">工资变化</button>
    <button @click="x.y++">点我</button>
</template>

<script>

import {shallowReactive, shallowRef, toRefs} from "vue";

export default {
    name: 'App',
    setup() {
        // shallowReactive将person对象的第一层做成响应式的,其他的不管,即name和job属性是响应式的,而sal不是响应式的
        let person = shallowReactive({
            name: 'sun',
            job: {
                sal: '40K'
            }
        })
        // ref()处理对象类型的数据,会求助Proxy代理,做成响应式的
        // shallowRef()处理对象类型的数据,不会求助Proxy代理,而是直接是一个Object类型的对象,即不是响应式类型的
        let x = shallowRef({
            y: 0
        })

        return {
            x,
            ...toRefs(person)
        }
    },
}
</script>
```

## readonly(),shallowReadonly()

```vue
<!--
    readonly: 让一个响应式数据变成 深只读
    shallowReadonly: 让一个响应式数据变成 浅只读
    
    当不希望数据发生改变时,比如: 从外部传递来的数据,不希望对外部数据造成改变,可以借助readonly和shallowReadonly
-->

<template>
    <p>总和: {{sum}}</p>
    <button @click="sum++">sum变化</button>

    <p>姓名: {{name}}</p>
    <p>工资: {{job.sal}}</p>
    <button @click="name = 'xue'">姓名变化</button>
    <button @click="job.sal = '60K'">工资变化</button>
</template>

<script>

import {reactive, readonly, ref, shallowReadonly, toRefs} from "vue";

export default {
    name: 'App',
    setup() {
        let sum = ref(0)
        let person = reactive({
            name: 'sun',
            job: {
                sal: '40K'
            }
        })

        // 返回一个和person一样,但是值不能修改的person对象,即只读
        let person1 = readonly(person)
        // 返回一个和person一样,但是第一层的数据不能修改,即name和job不能修改,而sal可以修改
        let person2 = shallowReadonly(person)

        // readonly()修饰基本类型数据,表示值不能修改
        let sum1 = readonly(sum)
        // shallowReadonly()修饰基本类型数据没啥意义,因为基本类型的数据只有一层
        let sum2 = shallowReadonly(sum) 

        return {
            sum,
            ...toRefs(person)
        }
    },
}
</script>
```

## toRaw(),markRaw()

```vue
<!--
    toRaw: 将一个由reactive生成的响应式数据,转成普通数据
    markRaw: 标记一个数据,使其永远不会再成为响应式数据
    
    使用场景:
        * 有些值不应该被设置为响应式的,比如复杂的第三方类库
        * 当渲染具有不可变数据的大列表时,跳过响应式可以提高性能
-->

<template>
    <p>姓名: {{name}}</p>
    <p>{{job}}</p>
    <button @click="name = 'xue'">姓名变化</button>
    <button @click="addJob">添加工作</button>
    <button @click="job.sal++">修改工资</button>
</template>

<script>

import {markRaw, reactive, toRefs} from "vue";

export default {
    name: 'App',
    setup() {
        let person = reactive({
            name: 'sun',
            job: {}
        })

        // 通过toRaw()将person转成了原始类型的数据,而不是响应式的的数据了
        const p = toRaw(person)
        console.log(p) // {name: 'sun', job: {…}}

        let addJob = () => {
            const job = {type: 'web', sal: 40}
            // 因为person是响应式对象,所以添加一个属性到其身上,也会自动变成响应式数据
            // 通过markRaw(),将job标记为原始类型的数据,这样,添加到person身上的job属性,就不是响应式的了
            person.job = markRaw(job)
        }

        return {
            ...toRefs(person),
            addJob
        }
    },
}
</script>
```

## customRef

```vue
<!--
    通过customRef()可以自定义一个ref,来代替ref定义一个响应式的数据,并对其依赖项跟踪和更新触发进行显示控制
-->

<template>
    <input type="text" v-model="keyword">
    <h3>{{keyword}}</h3>
</template>

<script>
// 引入customRef()
import {customRef, ref} from "vue";

export default {
    name: 'App',
    setup() {
        // 定义myRef()
        function myRef(value) {
            let timer;
            return customRef((track, trigger) => {
                // customRef的回调函数需要一个返回值,返回一个对象,该对象里get(),set()
                return {
                    get() {
                        console.log(`有人从myRef容器中,读取数据${value}`)
                        track() // 提前通过Vue追踪value的变化
                        return value
                    },
                    set(newValue) {
                        console.log(`有人修改myRef容器中的数据为${newValue}`)
                        // 如果不清除定时器,我们定时器的500ms内调用了多次set(),即会积压多个setTimeout(),就会出现,定时器修改的数据,修改了我们在input里输入的数据,有一种抖动的效果
                        clearTimeout(timer) // 清除之前的定时器,做到防抖的效果;
                        // 延迟1s修改内容
                        timer = setTimeout(() => {
                            value = newValue
                            trigger() // 通知Vue去重新解析模板
                        }, 500)
                    }
                }
            })
        }
        // 使用myRef()代替ref,定义一个响应式数据
        let keyword = myRef('hello')
        return {keyword}
    },
}
</script>
```

## provide(),inject()

```vue
<!--
    provide(),inject(): 帮助实现,祖组件与后代组件 进行数据传递
	
	一般情况下:
		* 父子组件之间通信,通过props完成
		* 祖孙组件之间通过,通过provided()完成

    基本使用
        祖 组件中
            引入provide()
                import {provide} from 'vue'
            使用provide()
                let car = reactive({name:'奔驰', price: '40W'})
                provide('car', car) // 提供数据
        后代 组件中
            引入inject()
                import {inject} from 'vue'
            使用inject()
                let car = inject('car') // 获取数据

-->

<!--App.vue0-->

<template>
    <div class="app">
        <h1>App.vue</h1>
        <Child></Child>
    </div>
</template>

<script>
import Child from "@/components/Child";
import {provide, reactive} from "vue";

export default {
    name: 'App',
    components: {
        Child
    },
    setup() {
        let car = reactive({
            name: '奔驰',
            price: '40W'
        })
        // 通过provide()向后代提供数据,后代能通过inject()接受到数据,非常的方便
        provide('car', car)
    },
}
</script>
```

```vue
<!--Child.vue-->

<template>
    <div class="child">
        <h1>Child.vue</h1>
        <p>{{car}}</p>
        <Son></Son>
    </div>
</template>

<script>
import Son from "@/components/Son";
import {inject} from "vue";

export default {
    name: "Child",
    components: {Son},
    setup() {
        // App.vue的子组件通过inject()接受数据
        let car = inject('car')
        return {car}
    }
}
</script>
```

```vue
<!--Son.vue-->

<template>
    <div class="son">
        <h1>Son.vue</h1>
        <p>{{car}}</p>
    </div>
</template>

<script>
import {inject} from "vue";

export default {
    name: "Son",
    setup() {
        // App.vue的孙组件听过inject()接受数据
        let car = inject('car')
        return {
            car
        }
    }
}
</script>
```

## 对响应式数据的判断

```js
/*
    isRef() 判断是否为ref定义的数据
    isReactive() 判断是否为reactive定义的数据
    isReadonly() 判断是否为只读的数据
    isProxy() 判断是否有reactive或readonly创建的代理
    */
let person1 = reactive({
    name: 'sun',
    age: 18
})
let count = ref(0)
let person2 = readonly(person1)

console.log(isRef(count)) // true
console.log(isReactive(person1)) // true
console.log(isReadonly(person2)) // true
console.log(isProxy(person1)) // true
console.log(isProxy(person2)) // true
```

# Composition API的优势

## Options API 存在的问题

使用传统OptionsAPI中，新增或者修改一个需求，就需要分别在data，methods，computed里修改 。

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f84e4e2c02424d9a99862ade0a2e4114~tplv-k3u1fbpfcp-watermark.image" style="zoom: 200%;" /><img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e5ac7e20d1784887a826f6360768a368~tplv-k3u1fbpfcp-watermark.image" style="zoom: 200%;" />

## Composition API 的优势

我们可以更加优雅的组织我们的代码，函数。让相关功能的代码更加有序的组织在一起。

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bc0be8211fc54b6c941c036791ba4efe~tplv-k3u1fbpfcp-watermark.image" style="zoom: 150%;" /><img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6cc55165c0e34069a75fe36f8712eb80~tplv-k3u1fbpfcp-watermark.image" style="zoom: 150%;" />

# Vue3中的新的组件

## Fragment

- 在Vue2中: 组件必须有一个根标签
- 在Vue3中: 组件可以没有根标签, 内部会将多个标签包含在一个Fragment虚拟元素中
- 好处: 减少标签层级, 减小内存占用

## Teleport

```vue
<!--
    <teleport></teleport>标签, 可以帮我们实现传送标签结构的功能
-->

<template>
    <div class="box"></div>

    <div class="outer">
        <div class="inner">
            <button @click="isShow = !isShow">切换</button>
            <!--
                teleport会将div传送到'.box'处, 这里的to可以写 选择器
            -->
            <teleport to=".box">
                <div v-if="isShow">
                    <h1>hello world</h1>
                </div>
            </teleport>
        </div>
    </div>
</template>

<script>

import {ref} from "vue";

export default {
    name: 'App',
    setup() {
        let isShow = ref(false)
        return {
            isShow
        }
    },
}
</script>
```

## Suspense

```vue
<!--
    <Suspense> </Suspense>标签: 等待异步组件时渲染一些额外内容,让应用有更好的用户体验
    
    基本使用
        引入+使用 异步组件
            import {defineAsyncComponent} from 'vue'
            cosnt Child = defineAsyncComponent(() => import('./components/Child'))
        使用Suspense标签,包裹组件,并且配置好 default插槽 和 fallback插槽
            <Suspense>
                <template v-slot:default>
                    <Child></Child>
                </template>
                <template v-slot:fallback>
                    <h3>加载中...</h3>
                </template>
            </Suspense>

    注意: 当页面使用了Suspense标签来包裹组件,并且是通过defineAsyncComponent异步引入组件的,我们就可以编写async组件,异步编程
        async setup() {
            let sum = ref(0)
            let p = new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve({sum})
                }, 2000)
            })
            return await p
        }
-->

<template>
    <h1>我是App组件</h1>

    <!--Suspense底层是通过slot插槽实现,他为我们准备好了两个插槽:default插槽,fallback插槽 -->
    <Suspense>
        <template v-slot:default>
            <Child></Child>
        </template>
        <template v-slot:fallback>
            <h3>加载中...</h3>
        </template>
    </Suspense>
</template>

<script>

import {defineAsyncComponent, ref} from "vue";

// 通过defineAsyncComponent引入, 哪个组件加载好了就挂载谁,不会去等待某个慢的组件
const Child = defineAsyncComponent(() => {
    return import('./components/Child')
})
// import Child from './components/Child' 是静态引入,是等页面内容全部加载好之后,就挂载到页面上

export default {
    name: 'App',
    components: {
        Child
    },
    setup() {
    },
}
</script>
```

```vue
<!--Child.vue-->

<template>
    <div class="child">
        <h1>我是Chiild组件, {{sum}}</h1>
    </div>
</template>

<script>
import {ref} from "vue";

export default {
    name: "Child",
    // 当引入的时候,是通过异步引入的,并且,页面是通过Suspense标签来编写的,我们就可以通过async来修饰setup()
    async setup() {
        let sum = ref(0)
        let p = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({sum})
            }, 2000)
        })
        // 等待返回p, 添加了await之后,就是等p结果出来之后,才会返回p的结果
        return await p
    }
}
</script>
```

# 其他改变

> 过度类名的更改

```css
/* Vue2的写法 */
.v-enter,
.v-leave-to {
    opacity: 0;
}
.v-leave,
.v-enter-to {
    opacity: 1;
}

/* Vue3写法 */
.v-enter-from,
.v-leave-to {
    opacity: 0;
}

.v-leave-from,
.v-enter-to {
    opacity: 1;
}
```

> 移除 keyCode

* 移除keyCode作为 v-on 的修饰符
* 同时也不再支持config.keyCodes

> 移除 v-on.native

```html
<!-- 父组件 中给子组件绑定自定义事件, 绑定原生事件 -->
<my-component
  v-on:close="handleComponentEvent"
  v-on:click="handleNativeClickEvent"
/>
```

```vue
<!-- 
    子组件声明接受自定义事件,如果没有接受的事件,就默认认为是原生事件,比如: 这里没有声明接受'click',就会认为'click'是原生事件 

    如果我们接受了'click'事件,'click'事件就变成了自定义事件
		// 通过emits接受事件,此时click,close声明成
		emits: ['close', 'click'],
-->
<script>
  export default {
    emits: ['close']
  }
</script>
```

> 移除 过滤器

过滤器虽然这看起来很方便，但它需要一个自定义语法，打破大括号内表达式是 “只是 JavaScript” 的假设，这不仅有学习成本，而且有实现成本！建议用方法调用或计算属性去替换过滤器

