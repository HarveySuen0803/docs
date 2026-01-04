# defineProps()

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

# defineEmits()

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

# defineExpose()

defineExpose() is a method introduced in the Composition API that allows you to expose certain properties or methods of a child component to its parent component.

Define properties or methods in the child component, and use defineExpose() to expose them (file: Sub.vue)

```ts
defineExpose({
  msg: 'hello world',
  show: () => {
    console.log('hello world');
  }
})
```

Access the exposed properties or methods in the parent component (file: Par.vue)

```vue
<script setup lang="ts">
const sub = ref()

onMounted(() => {
  const msg = sub.value.msg
  const show = sub.value.show()
})
</script>

<template>
  <Sub ref="sub"></Sub>
</template>
```

# defineOptions()

You can use the `defineOptions()` to define component options such as name, props, emits, and render.

```ts
defineOptions({
  name: 'Foo',
  inheritAttrs: false
})
```

# provide(), inject()

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

# $attrs

`$attrs` is an object that represents the attributes or event listeners that are passed to a component but are not explicitly declared in the component’s `props` or `emits`. These are known as "fallthrough attributes"

```vue
<script setup lang="ts">
import { ref } from 'vue'
import B from "@/components/B.vue";

let a = ref('a')
let b = ref('b')
let c = ref('c')
</script>

<template>
  <B :a="a" :b="b" :c="c"></B>
</template>
```

```vue
<script setup lang="ts">
import { useAttrs } from 'vue'

const props = defineProps(['a'])
const attrs = useAttrs()

console.log(props) // {a: 'a'}
console.log(attrs) // {b: 'b', c: 'c'}
</script>

<template>
  <p>{{ props }}</p>
  <p>{{ $attrs }}</p>
</template>
```

# $refs

$refs is used to access specific DOM elements or child component instances from within a component

You can assign a ref to a DOM element or a child component in the template by adding the ref attribute and giving it a unique identifier

```vue
<template>
  <div ref="myDiv"></div>
  <Child ref="myChild"></Child>
  <button @click="show($refs)">Click</button>
</template>
```

In the script, you can access the ref by using the $refs object followed by the unique identifier you assigned in the template

Please note that $refs are only populated after the component has been mounted, and they are not reactive

```ts
const myDiv = ref(null)
const myChild = ref(null)

onMounted(() => {
  console.log(myDiv.value) // logs the myDiv DOM element
  console.log(myChild.value) // logs the myChild instance
})

const show = (refs: any) => {
  console.log(refs)
  console.log(refs.myDiv) // logs the myDiv DOM element
  console.log(refs.myChild) // logs the myChild instance
}
```

When ref is used inside v-for, the corresponding ref should contain an Array value, which will be populated with the elements after moun

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const list = ref([])
const itemRefs = ref([])
onMounted(() => console.log(itemRefs.value))
</script>

<template>
  <ul>
    <li v-for="item in list" ref="itemRefs">{{ item }}</li>
  </ul>
</template>
```

# $event

$event is a special variable that refers to the Event object associated with the event handler

$event is only available in inline handlers and is not available in event handler methods unless passed as an argument

You can use $event to access properties of the Event object, such as target, currentTarget, type, and more

```vue
<script setup lang="ts" name="A">
let handleClick = (event) => {
  console.log(event) // PointerEvent {isTrusted: true…}
  console.log(event.target) // Button DOM
}
</script>

<template>
  <button @click="handleClick($event)">Click</button>
</template>
```

You can use $event to prevent the default behavior of an event by calling the preventDefault method

```vue
<form @submit="$event.preventDefault()">
  <!-- form fields here -->
  <button type="submit">Submit</button>
</form>
```

You can stop the propagation of an event up the DOM tree by calling the stopPropagation method

```vue
<div @click="console.log('div clicked')">
  <button @click="$event.stopPropagation(); console.log('btn clicked')">Click</button>
</div>
```

# Recursive Component

Parent component calls child component, passing data that can be recursive.

```ts
interface Node {
  name: string,
  children?: Node[]
}
```

```ts
const data = reactive<Node>({
  name: 'Root',
  children: [
    {
      name: 'Child 1',
      children: [
        {
          name: 'Child 1.1',
          children: []
        },
        {
          name: 'Child 1.2',
          children: []
        }
      ]
    },
    {
      name: 'Child 2',
      children: []
    }
  ]
})
```

```vue
<Node :data="data"></Node>
```

The subcomponent calls itself, implementing recursion.

```vue
<script setup lang="ts">
defineProps<{
  data?: Node
}>()
</script>

<template>
  <div>{{ data.name }}</div>
  <div v-for="(child, idx) in data.children" :key="idx">
    <Node :data="child"></Node>
  </div>
</template>
```

# Dynamic Component

Dynamic components are a powerful feature that allows you to dynamically render different components based on certain conditions or user interactions.

In this example, `A` will be rendered initially. If you change the value of `comId` to `B`, Vue will automatically unmount `A` and mount `B`.

Dynamic components are updated very frequently, this will lead to unnecessary performance overhead. It’s important to use `shallowRef()` to avoid unnecessary reactivity and maintain optimal performance in your Vue application.

```vue
<script setup lang="ts">
import { shallowRef } from 'vue';
import A from './A.vue';
import B from './B.vue';

let comId = shallowRef(A);
</script>

<template>
  <component :is="comId"></component>
</template>
```

# Asynchronous Component

Declare a asynchronous component. (file: Sync.vue)

```html
<script setup lang="ts">
import axios from 'axios';

interface Data {
  name: string,
  age: number,
  url: string
}

const { data } = await axios.get<Data>('./data.json')
</script>

<template>
  <h1>haha</h1>
  <h1>{{ data.name }}</h1>
  <h1>{{ data.age }}</h1>
</template>
```

Asynchronous components can be defined using the `defineAsyncComponent()`. This function accepts a loader function that returns a Promise. The Promise’s resolve callback should be called when you have retrieved your component definition from the server

`Suspense` is a built-in component for orchestrating async dependencies in a component tree. It can render a loading state while waiting for multiple nested async dependencies down the component tree to be resolved

```html
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const SyncVue = defineAsyncComponent(() => import('@/components/Sync.vue'))
</script>

<template>
  <Suspense>
    <!-- component with nested async dependencies -->
    <template #default>
      <SyncVue></SyncVue>
    </template>
    <!-- loading state via #fallback slot -->
    <template #fallback>
      <h1>loading...</h1>
    </template>
  </Suspense>
</template>
```

# Teleport Component

The `Teleport` component allows you to "teleport" a part of a component’s template into a DOM node that exists outside the DOM hierarchy of that component. This is particularly useful when building components like modals, where the position in the DOM is important.

This allows us to break out of the nested DOM structure and avoid issues with positioning and z-index.

```vue
<div id="main">
  <p>main area</p>
</div>

<!-- teleport this template fragment to bottom of the `#main` tag, that is under `<p>main area</p>` -->
<Teleport disable="false" to="#main">
  <p>hello world</p>
</Teleport>
```

# KeepAlive Component

The `KeepAlive` component in Vue 3 is a built-in component that allows you to conditionally cache component instances when dynamically switching between multiple components1. This can be particularly useful when you want to maintain the state of a component even after it has been deactivated and then reactivated.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import A from './A.vue';
import B from './B.vue';
import C from './C.vue';

const flag = ref<number>(1);
</script>

<template>
  <KeepAlive :include="['A', 'B']" :max="10">
    <A v-if="flag == 1"></A>
    <B v-else-if="flag == 2"></B>
    <C v-else></C>
  </KeepAlive>
  <button @click="flag = ++flag % 3">Click</button>
</template>
```

`onActivated` and `onDeactivated` are lifecycle hooks that are called when a component is activated or deactivated, respectively.

In the `onActivated` hook, you can add code that should run every time the component is re-inserted from the cache2. Similarly, in the `onDeactivated` hook, you can add code that should run every time the component is removed from the DOM into the cache.

```ts
onActivated(() => {
  // This code will run after the component instance is inserted into the DOM
  // as part of a tree cached by <KeepAlive>.
})

onDeactivated(() => {
  // This code will run after the component instance is removed from the DOM
  // as part of a tree cached by <KeepAlive>.
})
```


