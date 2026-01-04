# Transition Component

The `Transition` component in Vue 3 allows you to apply transitions to elements when they are inserted, updated, or removed from the DOM.

In this example, we use the Transition component to define a transition named "fade". Inside the transition, we conditionally render the paragraph based on the value of the `flag` data property. When `flag` becomes true, the paragraph will fade in.

```vue
<template>
  <Transition name="fade">
    <div v-if="flag" class="box"></div>
  </Transition>
  <button @click="flag = !flag">Click</button>
</template>

<style lang="scss">
.box {
  width: 200px;
  height: 200px;
  background-color: pink;
}

.fade-enter-from {
  width: 0;
  height: 0;
}

.fade-enter-active {
  transition: all 1s ease;
}

.fade-enter-to {
  width: 200px;
  height: 200px;
}

.fade-leave-from {
  width: 200px;
  height: 200px;
}

.fade-leave-active {
  transition: all 1s ease;
}

.fade-leave-to {
  width: 0;
  height: 0;
}
</style>
```

You can customize the style class name of the Transition component by setting a few props.

```vue
<template>
  <Transition enter-from-class="e-form" enter-active-class="e-active" enter-to-class="e-to" name="fade">
    <div v-if="flag" class="box"></div>
  </Transition>
  <button @click="flag = !flag">Click</button>
</template>

<style lang="scss">
.e-form {
  width: 0;
  height: 0;
}

.e-active {
  transition: all 1s ease;
}

.e-to {
  width: 200px;
  height: 200px;
}
</style>
```

Set the duration of the animation.

```vue
<Transition :duration="500" name="fade">
  <div v-if="flag" class="box"></div>
</Transition>

<Transition :duration="{enter: 300, leave: 400}" name="fade">
  <div v-if="flag" class="box"></div>
</Transition>
```

Control the appearance transition of an element.

```vue
<Transition name="fade" appear>
  <div v-if="flag" class="box"></div>
</Transition>

<style lang="scss">
.fade-appear, .fade-appear-from {
  opacity: 0;
}

.fade-appear-active, .fade-appear-to {
  transition: opacity .5s;
}
</style>
```

# Transition Hook

Transition component provides several JavaScript hooks that you can use to control each phase of the transition.

Each method receives the transitioning element as its first parameter.

the `done` function is used in JavaScript hooks of the Transition component to indicate when an asynchronous operation within the hook has completed. This is particularly useful when you’re working with animations or transitions that are not instantaneous.

```vue
<script setup>
import { ref } from "vue";
const show = ref(false);

const beforeEnter = (el: Element) => {
  // Code to execute before the element starts to transition onto the page
};

const enter = (el: Element, done: Function) => {
  // Code to execute when the element starts to transition onto the page

  // Start the transition
  startTransition(el);

  // Use a timeout to simulate an asynchronous operation
  setTimeout(() => {
    // End the transition
    endTransition(el);

    // Call the done function to indicate that the transition is complete
    done();
  }, 1000);
};

const afterEnter = (el: Element) => {
  // Code to execute when the element has finished transitioning onto the page
};

const enterCancelled = (el: Element) => {
  // Handle the cancellation of the enter transition here
};

const beforeLeave = (el: Element) => {
  // Code to execute before the element starts to transition off the page
};

const leave = (el: Element, done: Function) => {
  // Code to execute when the element starts to transition off the page
};

const afterLeave = (el: Element) => {
  // Code to execute when the element has finished transitioning off the page
};

const leaveCancelled = (el: Element) => {
  // Handle the cancellation of the leave transition here
};
</script>

<template>
  <Transition
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @enter-cancelled="enterCancelled"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
    @leave-cancelled="leaveCancelled"
  >     
    <p v-if="show">Hello, Vue 3 Transition Component!</p>
  </Transition>
</template>
```

# Transition Group

The `TransitionGroup` component in Vue 3 is designed for animating the insertion, removal, and order change of elements or components that are rendered in a list.

```vue
<script setup lang="ts">
import 'animate.css'
import { reactive } from 'vue'

const list = reactive<number[]>([1, 2, 3, 4, 5])
</script>

<template>
  <TransitionGroup
    name="fade"
    enter-active-class="animate__animated animate__bounceIn"
    leave-active-class="animate__animated animate__bounceOut"
  >
    <h1 v-for="(item, idx) in list" key="idx">{{ item }}</h1>
  </TransitionGroup>
  <button @click="list.push(list.length + 1)">Push</button>
  <button @click="list.pop()">Pop</button>
</template>
```

# Animate CSS

Install animate.css package.

```shell
npm install -S animate.css
```

Import animate.css package.

```ts
import 'animate.css';
```

Add the class `animate__animated` to an element, along with any of the animation names (don't forget the `animate__` prefix).

```html
<h1 class="animate__animated animate__rubberBand">An animated element</h1>
```

Using with `Transition` component.

```vue
<Transition enter-active-class="animate__animated animate__backInDown"
            leave-active-class="animate__animated animate__backOutDown">
  <h1 v-if="flag">An animated element</h1>
</Transition>
```

# GSAP

Install GSAP package.

```shell
npm install -S gsap
```

Import GSAP package.

```ts
import gsap from 'gsap';
```

For simple animations (no fancy sequencing), rotate and move elements with a class of "box" ("x" is a shortcut for a translateX() transform) over the course of 1 second.

```ts
gsap.to(".box", { rotation: 360, x: 100, duration: 1 })
```

```vue
<div class="box"></div>
```

Using with `Transition` component.

```vue
<Transition
  @before-enter="beforeEnter"
  @enter="enter"
  @leave="leave"
>
  <div v-if="flag" class="box"></div>
</Transition>
```

```ts
const beforeEnter = (el: Element) => {
  gsap.set(el, {
    width: 0,
    height: 0
  })
}

const enter = (el: Element, done: Function) => {
  gsap.to(el, {
    width: 200,
    height: 200
  })
}

const leave = (el: Element, done: Function) => {
  gsap.to(el, {
    width: 0,
    height: 0
  })
}
```
