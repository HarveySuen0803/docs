# Relative Communication

## defineProps()

`props` are used to pass data from parent components to sub components.

The parent component passes props to the sub component. (file: Par.vue)

```vue
<template>
  <Sub :num="num" :str="str"></Sub>
</template>
```

The `defineProps()` method is used to define the props that the component accepts. The Sub component gets the props by `defineProps()`. (file: Sub.vue)

```ts
const props = defineProps({
  num: {
    type: Number,
    default: 0,
  },
})

const props = defineProps({
  num: Number,
  str: String
})

const props = defineProps(['num', 'str'])

let props = defineProps<{
  str: string,
  num: number
}>()

let props = withDefaults(defineProps<{
  str: string,
  num: number
  obj: object
}>(), {
  name: () => '',
  age: () => 0,
  obj: () => null
})

console.log(props.num)
console.log(props.str)
console.log(props.obj)
```

## defineEmits()

`defineEmits()` is a method in Vue 3 that allows a component to explicitly declare the events it will emit.

Parent component declare method. (file: Par.vue)

```vue
<script setup lang="ts">
import Sub from './Sub.vue'

const show = (msg: string):void => {
  console.log(msg);
}
</script>

<template>
  <Sub @show="show"></Sub>
</template>
```

Sub component declares events through `defineEmits()` and trigger events. (file: Chlid.vue)

```vue
<script setup lang="ts">
const emits = defineEmits(['show', 'update'])

const emits = defineEmits<{
  (e: 'show', msg: string): void
}>()

const handleClick = () => {
  emits('show')
}
</script>

<template>
  <button @click="handleClick">click</button>
</template>
```

## v-model

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

## $attrs

```vue
<script setup lang="ts" name="A">
import { ref } from 'vue'
import B from "@/components/B.vue";

let msg = ref('hello world')
let change = (val: string) => {
  msg.value = val
}
</script>

<template>
  <B :msg="msg" :change="change"></B>
</template>
```

```vue
<script setup lang="ts" name="B">
import C from './C.vue'
</script>

<template>
  <C v-bind="$attrs"></C>
</template>
```

```vue
<script setup lang="ts" name="C">
defineProps(['msg', 'change'])
</script>

<template>
  <button @click="change('hello')">{{ msg }}</button>
</template>
```

## provide(), inject()

provide() and inject() are a pair of methods used for communication between parent and child components

In the parent component, you can use the provide() method to provide data that can be injected into its descendants. The provide() method accepts two arguments: the name of the property and its value

```ts
import { provide, ref } from 'vue'

let num = ref(10)
let change = (val: number) => {
  num.value += val
}

provide("num", num)
provide("change", change)
```

In the child component, you can use the inject() method to inject the data provided by its ancestor component. The inject() method accepts the name of the property to inject

```ts
import { inject } from 'vue'

let num = inject('num', 'default val')
let change = inject('change', (val: number) => {
  console.log('default fun')
})
```

Please note that provide() and inject() should only be called during the setup() period. Also, unlike props and emits, provide and inject are not reactive by default. If you want to make them reactive, you can use Vue’s reactivity APIs like ref() or reactive()

# Global Communication

## mitt

Install mitt

```shell
npm install -S mitt
```

Import mitt and create an emitter (file: utils/emitter.ts)

```ts
import mitt from 'mitt'

const emitter = mitt()

export default emitter
```

Bind event (file: A.vue)

```ts
import emitter from '@/utils/emitter'

emitter.on('show', (msg: string) => {
  console.log(msg)
})

// Unbind events when components are unmounted
onUnmounted(() => {
  emitter.off('show') 
})
```

Trigger event, using mitt to implement component communication (file: B.vue)

```ts
emitter.emit('show', 'hello world')
```

