# Slot

Par.vue

```vue
<script setup lang="ts">
import { reactive } from 'vue';
import Sub from './Sub.vue';

let userList = reactive<UserType[]>([
  {
    name: 'harvey',
    age: 18,
  },
  {
    name: 'bruce',
    age: 20,
  },
]);

const handleClick = (index: number) => {
  console.log(index);
};
</script>

<template>
  <Sub :userList="userList">
    <template #btns="{ index }">
      <button @click="handleClick(index)">edit</button>
    </template>
  </Sub>

  <Sub :userList="userList">
    <template #btns>
      <button>edit</button>
      <button>remove</button>
    </template>
  </Sub>
</template>
```

Sub.vue

```vue
<script setup lang="ts">
const props = defineProps(['userList']);
let userList = props.userList as UserType[];
</script>

<template>
  <table>
    <tr>
      <th>name</th>
      <th>age</th>
      <th>operation</th>
    </tr>

    <tr v-for="(userItem, index) in userList" :key="index">
      <td>{{ userItem.name }}</td>
      <td>{{ userItem.age }}</td>
      <td>
        <slot name="btns" :index="index"></slot>
      </td>
    </tr>
  </table>
</template>
```