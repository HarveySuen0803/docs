# ref()

`ref()` is a function that creates a reactive reference to a value. The `ref()` function can hold any value type, including primitives and objects.

```vue
<script setup lang="ts">
import { ref } from "vue"

// Create reactive object
const count = ref(0)

// Modify reactive object
const add = () => {
  count.value++
}
</script>

<template>
  <!-- Accessing reactive object in the template does not require adding `.value` -->
  <h1>{{count}}</h1>
  <button @click="count++">click</button>
  <button @click="add()">click</button>
</template>
```

You can use the ref attribute on an HTML element to reference it to get the DOM.

```vue
<script setup lang="ts">
import { ref } from 'vue'

const myDiv = ref<HTMLDivElement>()

const handleClick = () => {
  console.log(myDiv.value) // <div>hello world</div>
}
</script>

<template>
  <div ref="myDiv">hello world</div>
  <button @click="handleClick">click</button>
</template>
```

# shallowRef()

`shallowRef()` is a function that creates a reactive reference to a value. Unlike ref(), the inner value of a shallowRef is stored and exposed as-is, and will not be made deeply reactive. Only the .value access is reactive.

```ts
const obj = shallowRef({
  name: 'harvey'
})

const handleClick = () => {
  // This won't trigger the effect because the ref is shallow
  obj.value.name = 'bruce'
  
  // This will trigger the effect
  obj.value = { name: 'bruce' }
}
```

When using both `ref` and `shallowRef()`, modifying the `ref()` will call `triggerRef()`, which will cause `shallowRef()` to also be modified.

```ts
const obj1 = ref({
  name: 'harvey'
})

const obj2 = shallowRef({
  name: 'bruce',
  address: {
    province: 'JS',
    city: 'YZ'
  }
})

const handleClick = () => {
  obj1.value.name = 'rachel'
  // Originally, there was no change here because it was deep data, but the above ref() triggered `triggerRef()`, and there were also changes here.
  obj2.value.address.province = 'SC'
}
```

# triggerRef()

`triggerRef()` is a function that forces trigger effects that depend on a shallow ref. This is typically used after making deep mutations to the inner value of a shallow ref.

```ts
const obj = shallowRef({
  name: 'harvey'
})

const handleClick = () => {
  // This won't trigger the effect because the ref is shallow
  obj.value.name = 'bruce'

  // Force trigger the effect
  triggerRef(obj)
}
```

# customRef()

`customRef()` is a function that creates a customized ref with explicit control over its dependency tracking and updates triggering.

```ts
const MyRef = <T>(val: T) => {
  let timer: any
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return val
      },
      set(newVal) {
        clearTimeout(timer)
        timer = setTimeout(() => {
          val = newVal
          timer = null
          trigger()
        }, 500)
      }
    }
  })
}

const obj = MyRef<string>('harvey')

const handleClick = () => {
  obj.value = 'bruce'
}
```

# reactive()

`ref()` can store both primitive data types (String, Boolean, Number, BigInt, Symbol, null, undefined) and objects. `reactive()` only stores objects, not JavaScript primitives.

Data stored in `ref()` can be reassigned. Data stored in `reactive()` cannot be reassigned. When used with an object, `ref()` has a `.value` property for reassigning.

`reactive()` enables you to track changes within complex data structures. And `reactive()` has less overhead.

```vue
<script setup lang="ts">
import { reactive } from "vue"

// Create reactive object
const user = reactive({
  name: 'harvey',
  age: 18
})

// Modify reactive object
const addAge = () => {
  user.age++ // No longer need to add `.value` to access object

  user = {} // Error, Data stored in `reactive()` cannot be reassigned
}
</script>

<template>
  <h1>{{ user.name }}</h1>
  <h1>{{ user.age }}</h1>
  <button @click="addAge">click</button>
</template>
```

# shallowReactive()

`shallowReactive()` is similar to `shallowRef()`.

```ts
const obj = shallowReactive({
  name: 'harvey',
  age: 18,
  address: {
    province: 'JS',
    city: 'YZ'
  }
})

const handleClick = () => {
  obj.address.city = 'SZ' // This will not trigger reactivity 
}
```

For `shallowRef()`, modifying the deep data and shallow data at the same time will also update the deep data.

```ts
const obj = shallowReactive({
  name: 'harvey',
  age: 18,
  address: {
    province: 'JS',
    city: 'YZ'
  }
})

const handleClick = () => {
  obj.name = 'bruce'
  obj.address.city = 'SZ' // This will trigger reactivity 
}
```

# toRef()

`toRef()` is a utility function that can be used to create a reactive reference to a property on a source reactive object. The created ref is synced with its source property: mutating the source property will update the ref, and vice-versa.

```ts
const obj = reactive({
  name: 'harvey',
  age: 18,
  address: {
    province: 'JS',
    city: 'YZ'
  }
})

const address = toRef(obj, 'address')

const handleClick = () => {
  obj.address.city = 'SZ' // // This will modify the values of both obj and address
}
```

# toRefs()

`toRefs()` is used to convert all properties of a reactive object into a plain object with properties that are refs. This is particularly useful when you want to destructure a reactive object and maintain reactivity.

```ts
const {num, str} = toRefs(
    defineProps(['num', 'str'])
)

const { name, age, address } = toRefs(
  reactive({
    name: "harvey",
    age: 18,
    address: {
      province: "JS",
      city: "YZ",
    },
  })
)
```

# toRaw()

`toRaw()` is a utility function that returns the raw, original object of a reactive or readonly proxy. This is an escape hatch that can be used to temporarily read without incurring proxy access/tracking overhead or write without triggering changes. It is not recommended to hold a persistent reference to the original object.

```ts
const obj = reactive({
  name: 'harvey'
})

console.log(obj) // Proxy(Object) {name: 'harvey'}
console.log(toRaw(obj)) // {name: 'harvey'}
```

# Reactive Theory

```java
const user = {
    name: "harvey",
    age: 18
}

const proxyUser = new Proxy(user, {
    get(target, prop) {
        return Reflect.get(target, prop)
    },
    set(target, prop, val) {
        return Reflect.set(target, prop, val)
    },
    deleteProperty(target, prop) {
        return Reflect.deleteProperty(target, prop)
    },
})

proxyUser.name = "bruce"
delete proxyUser.age
console.log(proxyUser.name)
```

# watch()

`watch()` method is used to monitor the reactive changes of data and get the values before and after the data changes.

Monitoring basic types of reactive data.

```ts
const count = ref(0)

watch(count, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})
```

Monitoring complex types of reactive data.

```ts
const user = reactive({
  name: "harvey",
  age: 18,
  address: {
    province: "JS",
    city: "YZ",
  },
})

// Monitoring the entire user object
watch(user, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})

// Monitoring the entire user object
watch(() => user, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})

// Monitoring the name attribute
watch(() => user.name, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})

// Monitoring all attributes of the user object
watch(() => ({...user}), (newVal, oldVal) => {
  console.log(newVal, oldVal)
})

// Monitoring multi attributes
watch([() => user.name, count], ([newName, oldName], [newCount, oldCount]) => {
  console.log(newName, oldName)
  console.log(newCount, oldCount)
})
```

# watchEffect()

`watchEffect()` will immediately execute the passed function, while also reactively tracking its dependencies, and rerun the function when its dependencies change.

```ts
watchEffect(() => {
  // This function will be executed immediately after user.name, user.age and count change
  console.log(user.name)
  console.log(user.age)
  console.log(count)
})
```

# computed()

`computed()` is a function that you can use to create computed properties. Computed properties are very useful in Vue because they allow you to create a property that is based on the reactive data in your component, and Vue will automatically update the computed property when the reactive data changes.

```ts
const num1 = ref(10)

// num2 is also updated when num1 changes.
const num2 = computed(() => {
  return num1.value * 10
})

// Create computed properties with both getter and setter functions
const num2 = computed({
  get() {
    return num1.value * 10
  },
  set(val) {
    num1.value = val
  }
})
```