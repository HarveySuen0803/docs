# Pinia

Install Pinia

```shell
npm install -S pinia
```

Create a Pinia instance and install it in Vue app (file: main.ts)

```ts
import {createPinia} from "pinia";

app.use(createPinia())
```

Define a Option Store, similar to Vue's Options API, we can also pass an Options Object with state, actions, and getters properties

```ts
import { defineStore } from 'pinia'

export const useUserStore= defineStore('user', {
  state: () => (
    {
      name: 'harvey',
      age: 18
    }
  ),
  getters: {
    msg: (state): string => state.name + " " + state.age
  },
  actions: {
    incrAge(val: number) {
      this.age += val
    }
  }
})
```

Define a Setup Store, similar to the Vue Composition API's setup function, we can pass in a function that defines reactive properties and methods and returns an object with the properties and methods we want to expose

```ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore("user", () => {
  let name = 'harvey'
  let age = 18
  
  const incr = () => {
    age++
  }
    
  return {
    name,
    age,
    incr
  }
})
```

Use the Pinia Store, to use the Pinia store in your Vue 3 application, you’ll first need to get a reference to your Pinia store

```ts
import { useUserStore} from "@/store/user"

let userStore = useUser()

console.log(userStore)
console.log(userStore.name)

let change = () => {
  userStore.name = 'bruce'
  
  userStore.$patch({
    name: 'bruce',
    age: 20
  })

  userStore.incrAge()
}
```

# storeToRefs()

`storeToRefs()` is a helper function provided by Pinia that allows you to extract properties from the store while keeping its reactivity. It creates refs for every reactive property. This is particularly useful when you are only using state from the store but not calling any action

```ts
import { useUserStore} from "@/store/user"
import { storeToRefs } from 'pinia'

let { name, age } = storeToRefs(useUser()) 

console.log(name, age)
```

# $subscribe()

`$subscribe()` is a method provided by Pinia that allows you to react to changes in the store. It’s often used inside plugins, but can also be used in other parts of your application

```ts
const userStore = useUserStore()

userStore.$subscribe((mutation, state) => {
  console.log(mutation, state)
  localStorage.setItem('user.name', JSON.stringify(state.name))
  localStorage.setItem('user.age', JSON.stringify(state.age))
})

let change = () => {
  userStore.name = 'bruce'
}
```

