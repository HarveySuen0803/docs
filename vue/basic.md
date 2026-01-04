# Install Vue

Build project with Vite

```shell
npm create vite@latest
```

Install dependency

```shell
npm install
```

Set startup scripts (file: package.json)

```json
{
  "scripts": {
    "dev": "vite --host",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  }
}
```

Set server's host and port (file: vite.config.ts)

```ts
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 8081,
    open: false
  }
})
```

Startup project

```shell
npm run dev
```

Access `http://localhost:5173`

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241755546.png)

# Intergrate TypeScript

```vue
<script setup lang="ts">
import { onBeforeMount, onMounted } from "vue"

type User = {
  name: string,
  age: number
}

const user:User = {
  name: 'harvey',
  age: 18
}

console.log('hello world')

onBeforeMount(() => {
  console.log('before mount')
})

onMounted(() => {
  console.log('mounted')
})
</script>

<template>
  <h1>{{ user.name }}</h1>
  <h1>{{ user.age }}</h1>
</template>
```

# v-bind

```vue
<script setup lang="ts">
let msg = 'hello world'
</script>

<template>
  <input type="text" v-bind:value="msg">
  <input type="text" :value="msg">
</template>
```

# v-model

`v-model` can be used on a component to implement a two-way binding. 

```vue
<script setup lang="ts">
let msg = 'hello world'
</script>

<template>
  <input type="text" v-model="msg">
</template>
```

Sub components modify data by triggering the default `update` event.

```vue
<script setup lang="ts">
import Sub from './Sub.vue'
import { ref } from 'vue'

let num = ref(10)
</script>

<template>
  <Sub v-model:num="num"></Sub>
</template>
```

```vue
<script setup lang="ts">
const props = defineProps(['num'])
const emits = defineEmits(['update:num'])
</script>

<template>
  <h1>{{ props }}</h1>
  <button @click="emits('update:num', props.num + 10)">click</button>
</template>
```

The principle of `v-model`

```vue
<script setup lang="ts">
import { ref } from 'vue'

let msg = ref('hello world')
</script>

<template>
  <input type="text" v-model="msg">
  <!-- Similar to this -->
  <input type="text" :value="msg" @input="msg = (<HTMLInputElement>$event.target).value">
</template>
```

The principle of `v-model`

```vue
<script setup lang="ts">
import { ref } from 'vue'
import B from '@/components/B.vue'

let num = ref(10)
</script>

<template>
  <B v-model="num"></B>
</template>
```

```vue
<script setup lang="ts">
const props = defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue'])
</script>

<template>
  <h1>{{ props }}</h1>
  <button @click="emits('update:modelValue', props.modelValue + 10)">Click</button>
</template>
```

The principle of `v-model`

```vue
<script setup lang="ts">
import { ref } from 'vue'
import B from '@/components/B.vue'

let num = ref(10)
</script>

<template>
  <B :modelValue="num" @update:modelValue="num = $event"></B>
</template>
```

```vue
<script setup lang="ts">
const props = defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue'])
</script>

<template>
  <h1>{{ props }}</h1>
  <button @click="emits('update:modelValue', props.modelValue + 10)">Click</button>
</template>
```

# Lifecycle

```ts
// Called before the component’s DOM is rendered and mounted, so this cannot read DOM.
onBeforeMount(() => {
  console.log('beforeMount()')
})

// Called after the component’s DOM has been mounted
onMounted(() => {
  console.log('mounted()')
})

// Called at runtime when data changes before the DOM is updated
onBeforeUpdate(() => {
  console.log('beforeUpdate()')
})

// Called at runtime after the data changes and DOM patched
onUpdated(() => {
  console.log('updated()')
})

// Called before a component instance is unmounted
onBeforeUnmount(() => {
  console.log('beforeUnmount()')
})

// Called after a component instance has been unmounted
onUnmounted(() => {
  console.log('unmounted()')
})

// Called at runtime when the router changes before the DOM is updated
onBeforeRouteUpdate((to) => {
  console.log(to) // {fullPath: '...', path: '...', query: {...}}
})

// A debug hook, called when a reactive dependency has been tracked by the component’s render effect. It is a debug hook and is only called in development mode. It is not called during server-side rendering
onRenderTracked(({ key, target, type }) => {
  console.log('renderTracked:', { key, target, type })
})

// A debug hook, called when data is set
onRenderTriggered(({ key, target, type }) => {
  console.log('renderTriggered:', { key, target, type })
})
```

# nextTick()

`nextTick()` is a method that you can use to delay the execution of a function until the next DOM update cycle.

```ts
nextTick(() => {
  console.log("hello world")
})
```

# Interface Type

Define the interface in the `.d.ts` file.

```ts
interface UserType {
  name: string
  age: number
}
```

Use the type when creating reactive data.

```ts
let userList = reactive<UserType[]>([
  {
    name: 'harvey',
    age: 18
  },
  {
    name: 'bruce',
    age: 20
  }
])
```

Converts the data received in `props` to the specified type.

```ts
let userList = props.userList as UserType[]
```

# Linting

Configure the Linting. (file: tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

# Path Alias

Configure the path alias for TypeScript (file: tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": [
        "src/*"
      ],
      "#/*": [
        "types/*"
      ]
    }
  }
}
```

Install node package

```shell
npm install -D @types/node
```

Configure the path alias for Vite (file: vite.config.ts)

```ts
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
      '#': path.join(__dirname, 'types'),
    }
  }
})
```

Access project files with `@`

```ts
import Main from "@/components/Main.vue"
```

# Composable

Custom hooks are also known as composables. They are functions that can contain any Vue composition method, like ref, computed, etc.

Create a Composable. In this file, we define a `useSum` function that initializes a `sum` ref and an `add` function. It then returns these two values. (file: hooks/useSum.ts)

```ts
import { onMounted, ref } from 'vue'

export default function () {
  let sum = ref(0)

  let add = () => {
    sum.value++
  }

  onMounted(() => {
    console.log('hello world')
  })
  
  return { sum, add }
}
```

Use a Composable. You can then import and use this composable in your Vue components.

```ts
import useSum from '@/hooks/useSum'

const {sum, add} = useSum()
```

# Command Modifier

`.number` is used when you want user input to be automatically typecast as a number.

```vue
<input v-model.number="age">
```

`.trim` automatically trims whitespace from the user input.

```vue
<input v-model.trim="message">
```

`.lazy` is used to sync the input field after change events, instead of on input.

```vue
<input v-model.lazy="msg">
```

`.stop` is used to stop the propagation of an event.

```vue
<button @click.stop="doThis">Click me</button>
```

`.prevent` is used to prevent the default behavior of an even.

```vue
<form @submit.prevent="onSubmit">Submit</form>
```

`.self` ensures that an event is triggered only if the event was dispatched from the element itself.

```vue
<div @click.self="doThis">Click me</div>
```

`.once` ensures that the event listener is removed after handling the event for the first time.

```vue
<button @click.once="doThis">Click me</button>
```

# Collect Form Data

```vue
<script setup lang="ts">
import { reactive } from 'vue'

let userInfo = reactive({
  username: '',
  password: '',
  age: '',
  sex: '',
  hobbys: [],
  city: 'default',
  others: '',
  agree: false,
})

const show = () => {
    console.log(JSON.stringify(this._data.userInfo))
}
</script>

<template>
<!--
    Adding the `.prevent` modifier to prevent the default behavior of the jump page after the form is submitted
-->
<form action="#" @submit.prevent="show">
    <!--
        Add `.trim` and `.number` modifier
    -->
    username: <input type="text" v-model.trim="userInfo.username">
    password: <input type="password" v-model.trim="userInfo.password">
    age: <input type="number" v-model.number="userInfo.age">
            
    <!-- 
        The radio box does not have a value, so we need to specify a value, when the v-model value is the same as the value, it means that the radio box has been selected
    -->
    male <input type="radio" name="sex" v-model="userInfo.sex" value="male">
    female <input type="radio" name="sex" v-model="userInfo.sex" value="female">

    <!--
        We need to use an array to store the value of the check box
    -->
    game <input type="checkbox" v-model="userInfo.hobbys" value="game">
    sing <input type="checkbox" v-model="userInfo.hobbys" value="sing">
    ride <input type="checkbox" v-model="userInfo.hobbys" value="ride">

    <select v-model="userInfo.city">
        <option value="default">Select a city</option>
        <option value="BeiJing">BeiJing</option>
        <option value="ShangHai">ShangHai</option>
        <option value="YangZhou">YangZhou</option>
    </select> <br>

    <!--
        Add `.lazy` modifier, collect data when the textarea loses focus
    -->
    otehrs: <textarea v-model.lazy="userInfo.others"></textarea>

    <!-- 
        The value of the checkbox defaults to the value of the checked attribute
    -->
    <input type="checkbox" v-model="userInfo.agree"> 阅读并接受 <br>

    <!-- Button tag has default commit behavior -->
    <button>submit</button>
</form>
</template>
```

# app.component

app.component is a global API used to define components

You can then use app.component to register a global component. This makes the component available for use throughout your Vue application (file: main.ts)

```ts
app.component('Card', Card)
```

After registering the component, you can use it in your templates

```vue
<Card></Card>
```

# app.directive

app.directive() is a method used to register or retrieve global directives

You can then use app.directive() to register a global directive. This makes the directive available for use throughout your Vue application (file: main.ts)

```ts
app.directive('beauty', (el, obj) => {
  el.innerText += obj.value
  el.style.color = 'green'
  el.style.backgroundColor = 'red'
})
```

After registering the directive, you can use it in your templates

```vue
<div v-beauty="num">hello world</div>
```

# app.config

app.config object allows you to configure a few application-level options

You can then use the app.config.globalProperties object to define global properties. These properties will be added to all component instances (file: main.ts)

```ts
app.config.globalProperties.myGlobalProperty = 'Hello, world!'
```

You can define an application-level error handler that captures errors from all descendant components

```ts
app.config.errorHandler = (err, instance, info) => {
  // handle error, e.g. report to a service
}
```

# NanoId

Install NanoId

```shell
npm install -S nanoid
```

Import NanoId

```shell
import { nanoid } from 'nanoid'
```

Use NanoId

```ts
let id = nanoid()
```

# UUID

Install UUID

```shell
npm install -S uuid
```

Import UUID

```shell
import { v4 as uuid } from 'uuid'
```

Use UUID

```ts
let id = uuid()
```


