# Router

Install Vue Router

```shell
npm install -S vue-router@4
```

Create the router instance and set up routes (file: router/index.ts)

```ts
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import User from '@/pages/User.vue'
import Detail from '@/pages/Detail.vue'

export default createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			redirect: '/home'
		},
		{
			name: 'home',
			path: '/home',
			component: Home
		},
		{
			name: 'user',
			path: '/user',
			children: [
				{
					name: 'detail',
					path: 'detail',
					component: Detail
				}
			]
		}
	]
})
```

Create pages (file: pages/Home.vue)

```vue
<template>
  <h1>Home Component</h1>
</template>
```

Inject the router, create and mount the root instance. Make sure to inject the router with the router option to make the whole app router-aware.

```ts
import router from '@/router/index'

const app = createApp(App)

app.use(router)

app.mount('#app')
```

RouterView component is used to render the component that corresponds to the current URL. You can place it anywhere in your layout to adapt it to your needs.

RouterLink component is used to create navigational links in your application. Instead of using regular link tags. This allows Vue Router to change the URL without reloading the page.

```vue
<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
<RouterLink to="/home" active-class="active">home</RouterLink>
<RouterLink to="/user/detail" active-class="active">detail</RouterLink>
<RouterLink :to="{name: 'home'}">home</RouterLink>
<RouterLink :to="{path: '/home'}">home</RouterLink>
<RouterView></RouterView>
</template>

<style lang="scss" scoped></style>
```

# Lazy Loading

```ts
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

export default createRouter({
	history: createWebHistory(),
	routes: [
		{
			name: 'home',
			path: '/home',
			component: () => import('@/pages/Home.vue')
		},
		{
			name: 'user',
			path: '/user',
			component: () => import('@/pages/User.vue')
		},
		{
			name: 'user',
			path: '/user/:id',
			component: () => import('@/pages/UserDetails.vue')
		}
	]
})
```

# Router Mode

Hash Mode: localhost:8080/#/home/message/detail

This is the default mode for Vue Router. It uses a URL hash to simulate a full URL, ensuring that the page won’t be reloaded when the URL changes. This mode uses a hash character (#) before the actual URL that is internally passed. Because this section of the URL is never sent to the server, it doesn’t require any special treatment on the server level. However, it can negatively impact SEO.

```ts
export default createRouter({
  history: createWebHashHistory()
})
```

History Mode: localhost:8080/home/message/detail

To get rid of the hash, we can use the router’s history mode, which leverages the history.pushState API to achieve URL navigation without a page reload. When using createWebHistory(), the URL will look normal, e.g. https://example.com/user/id. However, since our app is a single-page client-side app, without a proper server configuration, the users will get a 404 error if they access https://example.com/user/id directly in their browser. To fix this issue, you need to add a simple catch-all fallback route to your server.

```ts
export default createRouter({
  history: createWebHistory(),
})
```

# Query Parameter

Pass parameter (file: App.vue)

```vue
<RouterLink :to="`/user/detail?id=${user.id}&name=${user.name}`">detail</RouterLink>

<RouterLink :to="{
  path: '/user/detail',
  query: {
    id: user.id,
    name: user.name,
  },
}">detail</RouterLink>
```

Receive parameter (file: Detail.vu)

```ts
import { toRefs } from 'vue'
import { useRoute } from 'vue-router'

let route = useRoute();
let { query } = toRefs(route)
console.log(query);
console.log(query.value.id);
console.log(query.value.name);
```

# Path Parameter

Pass Path Parameter (file: App.vue)

```vue
<RouterLink :to="`/user/detail/${user.id}/${user.name}`">detail</RouterLink>

<RouterLink :to="{
  name: 'detail',
  params: {
    id: user.id,
    name: user.name
  }
}">detail</RouterLink>
```

Receive parameter (file: Detail.vue)

```ts
import { toRefs } from 'vue'
import { useRoute } from 'vue-router'

let route = useRoute();
let { params } = toRefs(route)
console.log(params)
console.log(params.value.id);
console.log(params.value.name);
```

# Router Props

Pass params pamameter (file: router/index.ts)

```ts
{
  name: 'detail',
  path: 'detail',
  component: Detail,
  props: true
}
```

Pass query parameter (file: router/index.ts)

```ts
{
  name: 'detail',
  path: 'detail',
  component: Detail,
  props(route) {
    return route.query
  }
}
```

Receive parameter

```ts
defineProps(['id', 'name'])
```

# History

Push mode pushes a new entry into the history stack, so when the user clicks the browser back button they will be taken to the previous URL.

```vue
<RouterLink to="/home">home</RouterLink>
```

Replace mode navigates without pushing a new history entry, as its name suggests, it replaces the current entry. This is useful when you want to replace the current location instead of adding a new record to the history stack.

```vue
<RouterLink replace to="/home">home</RouterLink>
```

# Programmatic Navigation

```ts
import { useRouter } from 'vue-router'

const router = useRouter()

// literal string path
router.push('/users/eduardo')
router.replace('/users/eduardo')

// object with path
router.push({ path: '/users/eduardo' })

// named route with params to let the router build the url
router.push({ name: 'user', params: { username: 'eduardo' } })

// with query, resulting in /register?plan=private
router.push({ path: '/register', query: { plan: 'private' } })

// with hash, resulting in /about#team
router.push({ path: '/about', hash: '#team' })
```

# beforeEach()

router.beforeEach() is called a "global beforeEach guard". It is the most commonly used navigation guard that will be called when the routing starts. It takes three parameters: ﻿to, ﻿from, and ﻿next.

```ts
router.beforeEach((to, from, next) => {
  // `to` and `from` are Route Objects
  // `next` is a function that should be called when your hook is done.
})
```

For example, you can use ﻿beforeEach() to set the page title.

```ts
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Default Title';
  next();
})
```

Or to check for authentication.

```ts
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // This route requires authentication, if not logged in, redirect to login page
    if (!auth.loggedIn()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next(); // always make sure to call next()!
    }
  } else {
    next(); // if does not require authentication, always make sure to call next()
  }
})
```

# afterEach()

router.afterEach() is called a "global afterEach hook," and it is called after the route is entered. It differs from ﻿beforeEach because it doesn't have a ﻿next function and can't change the navigation itself.

```ts
router.afterEach((to, from) => {
  // This hook does not get next function and can't change the navigation itself
})
```

You can use it to execute some actions that need to be performed after the route transition, such as data analysis, ending the progress bar, etc.

```ts
router.afterEach((to, from) => {
  // ending the progress bar
  NProgress.done();
})
```

# Auth

You can use Vue Router's navigation guards to determine if a user has permission to access a specific route.

You need a way to store the user's permission information. This could be a token obtained when the user logs in, or a list of user roles. The actual implementation kwill vary depending on your backend implementation.

```ts
export const useUserStore = defineStore('user', {
  state: () => ({
    userName: '',
    role: ''
  })
})
```

When defining the route, you can use the meta field to denote which permissions are required to access the route

```ts
export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: 'Admin',
      path: '/admin',
      component: () => import('@/views/AdminVue.vue'),
      meta: {
        isRequireAuth: true,
        role: 'admin'
      }
    }
  ]
})
```

Then you can use the global beforeEach guard in Vue Router to check if the user has the required permissions for the route.

```ts
const userStore = useUserStore()

router.beforeEach((to, from, next) => {
  if (to.meta.isRequireAuth) {
    if (userStore.role == to.meta.role) {
      next()
    } else {
      next('/')
    }
  } else {
    next()
  }
})
```

