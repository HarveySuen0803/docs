# Create Project

通过 Npm 安装 create-react-app。

```shell
npm install -g create-react-app
```

通过 create-react-app 构建项目。

```shell
create-react-app my-react-app
```

启动项目。

```shell
npm start
```

访问 `http://localhost:3000` Hello World ！！！

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202405171432826.png)

# Eslint



```shell
npm install --save-dev eslint eslint-plugin-react eslint-plugin-prettier eslint-config-prettier --legacy-peer-deps
```

# Rendering

index.js 是一个入口文件，这个文件是整个应用的起点，它负责将 React 应用挂载到 HTML 文件中的一个 DOM 节点上。

- React 使用虚拟 DOM 来高效地更新真实 DOM，只更新变化的部分。

```js
// 导入 React 的两个核心包。
import React from 'react'
import ReactDOM from 'react-dom/client'

// 导入 App.js。
import App from './App'

// 将 App.js 渲染到 public/index.html 的 #root div 上。
const root = ReactDOM.createRoot(document.getElementById('root'));

// 将 App 组件的返回值（JSX）转换成虚拟 DOM。
root.render(<App />);
```

App.js 是 React 应用的根组件。它是一个函数组件或者类组件，定义了应用的结构和内容。

```jsx
function App() {
  // 返回一个 JSX 结构，这些 JSX 会被转换成 React 元素。
  return (
    <div className="app">
      <div style={{color: 'pink'}}>Hello World</div>
    </div>
  );
}

// 导出这个组件，使得其他文件可以导入和使用它。
export default App;
```

# JSX

React 的模版语法是通过 JSX（JavaScript XML）来实现的。JSX 允许你在 JavaScript 中编写类似 HTML 的语法，并且可以与 JavaScript 表达式混合使用。这使得创建和管理用户界面变得更加直观和高效。

```jsx
const user = {
  username: 'harvey',
  password: '111'
}

const sayHello = function (name) {
  console.log('hello ' + name)
}

const App = function () {
  return (
    <div className="app">
      <div>Hello World</div>
      {sayHello(user.username)}
    </div>
  )
}

export default App
```

通过 JSX 渲染一个列表：

```jsx
const UserList = function (props) {
  const userList = props.userList
  const userListElement = userList.map(user => {
    return <li key={user.id}>{user.username}</li>
  })

  return (
    <div className='UserList'>
      <ul>{userListElement}</ul>
    </div>
  )
}

const App = function () {
  const userList = [
    { id: 1, username: 'harvey' },
    { id: 2, username: 'bruce' },
    { id: 3, username: 'jack' }
  ]
  return (
    <div className="app">
      <UserList userList={userList}></UserList>
    </div>
  )
}
```

通过 JSX 根据条件判断渲染内容：

```jsx
const App = function () {
  const isLogin = true

  return (
    <div className="app">
      {isLogin ? 'User logged in' : 'User logged out'}
      {isLogin && 'User logged in'}
    </div>
  )
}
```

```jsx
const getArticleTem = function (articleType) {
  if (articleType == 1) {
    return <div>article1</div>
  } else if (articleType == 2) {
    return <div>article2</div>
  } else {
    return <div>default article</div>
  }
}

const App = function () {
  return (
    <div className="app">
      {getArticleTem(2)}
    </div>
  )
}
```

# Event

通过 JSX 绑定事件：

```jsx
const doClick1 = () => {
  console.log('hello')
}

const doClick2 = (e) => {
  console.log(e)
}

const doClick3 = (name) => {
  console.log(name)
}

const doClick4 = (e) => {
  console.log(e)
}

const doClick5 = (name, e) => {
  console.log(name)
  console.log(e)
}

const App = function () {
  return (
    <div className="app">
      <button onClick={doClick1}>button1</button>
      <button onClick={doClick2}>button2</button>
      <button onClick={() => doClick3('harvey')}>button3</button>
      <button onClick={(e) => doClick4(e)}>button4</button>
      <button onClick={(e) => doClick5('harvey', e)}>button5</button>
    </div>
  )
}
```

# useState()

`useState()` 是 React Hooks 中的一个基础 Hook，用于在函数组件中添加状态管理功能。它允许你在函数组件中声明状态变量，并提供了一个方法来更新这些状态变量。类似于 Vue 的 `v-model` 的功能。

```jsx
const Counter = () => {
  const [count, setCount] = useState(0)

  const doClick = () => {
    setCount(count + 1)
  }

  return (
    <div className="counter">
      <div>Count: {count}</div>
      <button onClick={doClick}>incr</button>
    </div>
  )
}
```

```jsx
const UserTem = () => {
  const [user, setUser] = useState({
    username: 'harvey',
    password: '111'
  })

  const changeUsername = () => {
    setUser({
      ...user,
      username: 'bruce'
    })
  }

  return (
    <div className="UserTem">
      <div>User: {user.username}</div>
      <button onClick={changeUsername}>change username</button>
    </div>
  )
}
```

# Style

内联样式在 JSX 中使用时，样式名需要使用驼峰命名法。

```jsx
const App = () => {
  const divStyle = {
    color: 'red',
    fontSize: '30px'
  }

  return (
    <div className="app">
      <div style={divStyle}>hello world</div>
    </div>
  )
}
```

可以通过 className 属性为元素添加 CSS 类名，并在外部 CSS 文件中定义这些类。

```jsx
import './App.css'

const App = () => {
  return (
    <div className="app">
      <div className='foo'>hello world</div>
    </div>
  )
}
```

```css
.foo {
  color: pink;
  font-size: 30px;
}
```





