# Arco

Install Arco

```shell
npm install -D @arco-design/web-vue
```

Full import Arco

```shell
import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue';
import App from './App.vue';
import '@arco-design/web-vue/dist/arco.css';

const app = createApp(App);
app.use(ArcoVue);
app.mount('#app');
```
