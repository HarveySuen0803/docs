# Element

Install Element

```shell
npm install -S element-plus
```

If you don’t care about the bundle size so much, it’s more convenient to use full import

```ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

app.use(ElementPlus)
```

If you use volar, please add the global component type definition to `compilerOptions.types` in `tsconfig.json`

```ts
{
  "compilerOptions": {
    "types": ["element-plus/global"]
  }
}
```

# Element Icon

Install Element Icon

```shell
npm install -S @element-plus/icons-vue
```

You need to import all icons and register globally

```ts
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
```