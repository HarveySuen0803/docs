# Anonymous Slot

Define a slot in sub component.

```vue
<slot></slot>
```

Use slot in parent component.

```vue
<Sub>
  <p>Content</p>
</Sub>
```

# Named Slot

Named slots allow you to specify where you want to insert content in a child component.

Define a named slot in sub component.

```vue
<slot name="header">Header Slot</slot>
<slot name="center">Center Slot</slot>
<slot name="footer">Footer Slot</slot>
```

Use named slot in parent component.

```vue
<Sub>
  <template v-slot:header>
    <p>Content</p>
  </template>

  <template v-slot:center>
    <p>Content</p>
  </template>

  <!-- shorthand -->
  <template #footer>
    <p>Content</p>
  </template>
</Sub>
```

# Scoped Slot

Scoped slots allow you to pass data from a child component to a slot in the parent component.

Define a scoped slot in sub component.

```vue
<!-- passing `msg` to the slot -->
<slot :msg="msg"></slot>
```

Use a scoped slot in parent component.

```vue
<!--  The `props` object contains the data passed from the child component -->
<template #main="props">
  <p>{{ props }}</p>
</template>
```
