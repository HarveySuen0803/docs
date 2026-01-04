# Node.js基本介绍

## Info

* Node.js是基于 chrome v8 的 javascript引擎构建的javascript运行环境,我们之前可以在浏览器里运行js的代码,现在可以在node上运行js的代码(因为它有v8引擎)

* 前后端编程统一,大大降低了学习新的后端语言的成本和代价,用js一样可以做后端开发

* Node可以实现的工作

  * web服务器

  * 命令行工具

  * 网络爬虫(到网站去下载数据)

  * 桌面应用程序开发(Electron)

  * app

  * 嵌入式

  * 游戏

  * ...

* 注意: nodejs 没有 DOM + BOM, 只有 ECMAScript + 核心的api(重点)

## NVM

因为node的版本太多,我们以后工作的交换版本的事情也是常有的,此时要重复操作,安装和卸载太过麻烦,所以有NVM来帮我们管理各个版本,nvm常用命令有:

- nvm version：           查看 nvm 的版本
- nvm list：              查看当前安装的 Node.js 所有版本   (常用)
- nvm install 版本号 [架构]：    安装指定版本的 Node.js  (常用)
- nvm uninstall 版本号：  卸载指定版本的 Node.js
- nvm use 版本号：        选择指定版本的 Node.js     (常用)

```bash
# 安装指定版本
nvm install 10.15.0 

# 安装最新版本
nvm install latest

# 使用安装的这个版本10.15.0
nvm use 10.15.0
# 查看node版本
node -v
```

# 模块

## Info

* 在计算机程序的开发过程中,随着程序代码越写越多,在一个文件里代码就会越来越长,越来越不容易维护
* 为了编写可维护的代码,我们把很多函数分组,分别放到不同的文件里,这样每个文件包含的代码就相对较少
* 使用模块有什么好处
  * 大大提高了代码的可维护性
  * 编写代码不必从零开始,当一个模块编写完毕,就可以被其他地方引用(我们在编写程序的时候,也经常引用其他模块)
  * 使用模块还可以避免函数名和变量名冲突,相同名字的函数和变量完全可以分别存在不同的模块中
* 一个js文件就是一个模块,模块的作用域是私有的,内部定义的变量或者函数,只在当前的文件(模块)可以使用
* 如果别人需要使用我们模块里面的东西,那么有两点要做(以CommonJS的Modules规范: Node.js为例)
  * 自己编写的模块,由于模块作用域是私有的,默认情况下,外部是没办法使用的,需要通过`exports`或者 `module.exports`,将模块导出
  * 别人要使用某个模块,则需要通过`require`引入模块
* 对书写格式和交互规则的详细描述,就是模块定义规范(Module Definition Specification)
  * AMD 规范: Require.js (不常用)
  * CMD 规范: Sea.js (不常用)
  * CommonJS 的 Modules 规范: NodeJs (常用)
  * ES6 模块化规范: import ...  from  ... (常用)

## exports, require

> 基本使用

```js
// b.js
let num = 10;
let sum = (x, y) => {
    console.log(x + y);
};
class Animal {
    constructor(name) {
        this.name = name;
    }
}

// 这是将num,sum(),Animal都封装成一个对象,通过exports导出该对象
// 第一种方式
exports.num = num;
exports.sum = sum;
exports.Animal = Animal;
// 第二种方式
module.exports = {
    num,
    sum,
    Animal
}
```

```js
// a.js
// 通过require()导入对象
let b = require("./b");
// 这里的b获取到是一个对象,该对象里包含的成员就是b.js通过exports导出的成员
console.log(b) // { num: 10, sum: [Function: sum], Animal: [class Animal] }
console.log(b.num); // 10
b.sum(10, 20); // 30
let animal = new b.Animal("sun"); // 获取到b.js的Animal类,创建对象
console.log(animal) // Animal { name: undefined }
console.log(animal.name); // sun
```

> this的指向问题

```js
// exports是module.exports的引用(即exports指向module.exports),文件中才有exports,交互模式下没有exports
console.log(exports); // {}
console.log(module.exports); // {}
console.log(exports === module.exports); // true

// 在js文件中,this指向这个模块导出的对象module.exports,在交互模式下this指向global
console.log(this); // {}
console.log(this === module.exports); // true

// Details
// 这里就出现问题,exports里的成员应该和module.exports相同,如果我们此时对module.exports进行修改,exports和module.exports里的元素就不同了
let a = 10;
module.exports = {
    a
}
console.log(exports); // {}
console.log(module.exports); // { a: 10 }
// 解决方案
let b = 10;
module.exports = {
    b
}
exports = module.exports; // 通过让exports重新指向module.exports就可以了,我们正常使用module.exports导出对象的时候,需要写一下`exports = module.exports;`来保证exports里的内容时时刻刻都和module.exports里的一样才行
console.log(exports); // { b: 10 }
console.log(module.exports); // { b: 10 }
```

## 常用内置模块

### Info

```js
/*
	一般项目中模块分为3种: nodejs内置模块、自己书写的模块、第三方模块(使用一个专门的工具npm进行统一管理)
	
    常用的内置模块如下：
    	* fs            : 文件操作
        * http          : 网络操作
        * path          : 路径操作
        * querystring   : 查询参数解析
        * url           : url 解析
*/

const fs = require("fs");
const http = require('http');
const path = require('path');
const querystring = require('querystring');
const url = require('url');
```

### path

```js
console.log(__dirname); // E:\computer\node.js  得到当前文件的绝对路径
console.log(__filename); // E:\computer\node.js\test.js 得到当前文件的绝对路径 + 文件名

const path = require("path");
let extname = path.extname(__filename); // .js  获取__filename的扩展名,即test.js的.js
let basename = path.basename(__filename); // test.js  获取文件名
let dirname = path.dirname(__filename); // E:\computer\node.js  获取路径
let parseObj = path.parse(__filename); // 把路径解析成一个对象返回(所在盘符,所在路径,文件名(包含后缀),文件扩展名,文件名(不包含后缀))
    // {
    //     root: 'E:\\',
    //         dir: 'E:\\computer\\node.js',
    //     base: 'test.js',
    //     ext: '.js',
    //     name: 'test'
    // }
console.log(parseObj)

// 拼接操作
let fullPath = path.join(__dirname, 'module', 'a.js'); // 注意,一层目录就是一个参数,不要写'\'
console.log(fullPath); // E:\computer\node.js\module\a.js
```

### fs

#### 读取文件

```js
const fs = require("fs");
const path = require("path");
let filePath = path.join(__dirname, "hello.txt"); // 获取到hello.txt这个文件的路径,通过join来拼接起来

// 同步读取: 读取文件的时候,要等文件读取完毕,才会执行后面的代码(sync 同步)
// fs.readFileSync(文件的路径)
let content = fs.readFileSync(filePath); // 默认返回二进制Buffer数据
console.log(content); // <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64 20 21 21 21 20 e6 88 91 e6 98 af e5 b0 8f e5 ad 99 21 21 21>
console.log(content.toString()); // hello world !!! 我是小孙!!!

let content1 = fs.readFileSync(filePath, "utf-8"); // 这样就是根据utf-8的编码转成了我们想要的结果,不需要再.toString()了
console.log(content1); // hello world !!! 我是小孙!!!

// 异步读取: 不用等到文件读取完毕,就会执行后面的代码
// fs.readFile(filePath, "编码格式",..., 回调函数)
fs.readFile(filePath, "utf-8", (error, data) => {
    // error和data参数的结果
    // * 如果读取错误,error就是错误的信息,data就是undefined
    // * 如果读取成功,error就是null,data就是读取到的数据
    if (error) {
        console.log(error);
        return;
    }
    console.log(data);
})
```

#### 写入文件

```js
const fs = require("fs");
const path = require("path");

let filePath = path.join(__dirname, "hello.txt");
// fs.writeFile(filePath, 写入的内容, "utf-8", 回调函数)
fs.writeFile(filePath, "我就是太阳!!!","utf-8", error => {
    if (error) {
        console.log(error);
        return;
    }
    console.log("写入成功");
});

// 添加了 参数 { flag:'a'}后就是追加写入,没有添加该参数就是覆盖写入
fs.writeFile("e:\\test\\b.txt", "大家好,我是Node.js!!", { flag:'a'}, function (error) {
    if (error) {
        console.log("写入失败");
        return;
    }
    console.log("写入成功");
});

// 追加写入
fs.appendFile("e:\\test\\a.txt",'我就是要追加的内容', function (error) {
    if (error) {
        console.log('写入失败');
        return;
    }
    console.log("写入成功");
});
```

#### 删除文件

```js
let fs = require("fs");

fs.unlink('./a.txt', function(err) { // 删除a.txt文件,注意unlink()只可以删除文件,要删除目录还需要rmdir()
  if (err) {
    throw err;
  } 
  console.log("删除成功");
})

fs.rmdir("./b", function (err) { // 删除b目录,注意b目录必须是空目录才可以删除
  if (err) {
    throw err;
  }
  console.log("删除目录成功");
})
```

#### 几个常用方法

```js
const fs = require('fs');

// 修改hello.txt的文件名为hi.txt
fs.renameSync('./hello.txt', './hi.txt');

// 获取__dirname路径下的所有的文件
let nameList = fs.readdirSync(__dirname); // [ '.idea', 'a.js', 'b.js', 'hello.txt', 'index.html', 'test.js' ]
console.log(nameList)

let str = 'hello.js';
// 判断str是否以'o.js'这个子串结尾
console.log(str.endsWith('o.js')); // true
// 判断str是否以'hel'这个子串开头
console.log(str.startsWith('hel')); // true

// 截取str字符串的 [2, 4)
str.substring(2, 4); // "ll"
// 截取str字符串的 从index=2向后的,整个字符串
str.substring(2); // "llo.js"
```

#### 文件的批处理

> Case: 批量添加前缀, 在当前目录下的所有文件中都添加一个前缀

````js
const fs = require('fs');
let nameList = fs.readdirSync(__dirname); // 获取当前目录下文件名数组

nameList.forEach((item) => {
    if (item.endsWith('.js')) { // 判断item是以'.js'为结尾的文件
        fs.renameSync(item, `[sun]${item}`); // 比如 test.js 修改为 [sun]test.js
    }
})
````

> Case: 批量删除前缀

```js
const fs = require('fs');
let nameList = fs.readdirSync(__dirname); // 获取当前目录下文件名数组
let startStr = '[sun]';
nameList.forEach((item) => {
    if (item.endsWith('.js')) { // 判断item是以'.js'为结尾的文件
        fs.renameSync(item, item.substring(startStr.length)); // 比如 test.js 修改为 [sun]test.js
    }
})
```

#### 小案例

![image-20211111162548133](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311520443.png)

> 通过fs.readFile()来完成

```js
const fs = require('fs');
const path = require('path');
let destFile = __dirname + "\\data.txt";
console.log(destFile);
let arr = [];
fs.readdirSync(__dirname).forEach(item => {
    if (item === 'data.txt') { // 排除"data.txt"文件
        return;
    }
    if (item.endsWith('.txt')) {
        arr[arr.length++] = item;
    }
})

fs.readFile(arr[0], 'utf-8', (err1, data1) => {
    if (err1) {
        console.log(err1);
        return;
    }
    fs.readFile(arr[1], 'utf-8', (err2, data2) => {
        if (err2) {
            console.log(err2);
            return;
        }
        fs.readFile(arr[2], 'utf-8', (err3, data3) => {
            if (err3) {
                console.log(err3);
                return;
            }
            let content = data1 + data2 + data3;
            fs.writeFile(destFile, content, (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("写入成功");
            })
        })
    })
});
```

> 通过fs.readFileSync()来完成

```js
const fs = require('fs');
const path = require('path');
let destFile = path.join(__dirname, 'data.txt');
let arr = [];
fs.readdirSync(__dirname).forEach(item => {
    if (item === 'data.txt') { // 排除"data.txt"文件
        return;
    }
    if (item.endsWith('.txt')) {
        arr[arr.length++] = item;
    }
})

let content = "";
arr.forEach((item) => {
    let filePath = path.join(__dirname, item);
    // 通过readFileSync来同步读取数据,这样content中数据才能在方法外面被访问到
    content += fs.readFileSync(filePath);
})

// 写入数据
fs.writeFile(destFile, content, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log("写入成功");
});
```

### http

#### 启动服务器

```js
// 引入http模块
const http = require('http');
// 配置服务器程序的端口
const port = 3000;
// 创建服务器对象
const server = http.createServer((request, response) => {
    // request 请求对象, response 响应对象

    // response.write and response.end
    // * write和end都可以传入参数表示往浏览器书写一定内容
    // * write可以连续操作,end表示响应结束,一般放在最后
    response.write("hi hi hi"); // 可以在浏览器书写一些响应体内容
    response.end("hello node.js http"); // 表示响应工作已经结束
    response.end("hello node.js http"); // error, 上面的end已经结束了,这里就不能再end了
});

// 调用服务器对象的监听方式,让服务器监听浏览器的请求
server.listen(port, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log(`webServer is listening at port ${port}`);
});
```

#### get,post 获取参数

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311520444.png)

> get 请求

```js
// 在浏览器里输入: http://localhost:3000/?curPage=1&perPage=10 获取到 数据 curPage 和 perPage

const http = require('http');
const url = require('url');
const port = 3000;

const server = http.createServer((request, response) => {
    let reqUrl = request.url; // 获取请求路径
    let reqMethod = request.method; // 获取请求方式(get/po)
    console.log(reqUrl, reqMethod);
    /*
    	/ GET				第一次请求: 请求路径 '/', 请求方式 'GET'
    	/favicon.ico GET	第二次请求: 请求路径 '/favicon.ico', 请求方式 'GET'
    */

    // 获取get请求的请求参数,注意这里的url是通过require获取到内置模块,不是server的request获取到的url
    let obj = url.parse(reqUrl, true); // 获取到请求参数的对象
    console.log(obj); // 输出该对象
    console.log(obj.query); // 用户输入的 curPage 和 perPage 就在 query对象属性里
    console.log(obj.query.curPage, obj.query.perPage);

    response.end("hello");
});
```

> post 请求

```html
<!--这里以form表单提交,来模拟post请求,通过设置 method为post-->
<form action="http://localhost:3000" method="post">
    账户: <input type="text" name="userName"> <br>
    密码: <input type="password" name="passWord"> <br>
    <input type="submit" value="提交">
</form>
```

```js
const server = http.createServer((req, res) => {
    let reqUrl = req.url;
    let reqMethod = req.method;
    console.log(reqUrl, reqMethod);
    // / POST
    // /favicon.ico GET

    // 以事件的方式来接受,事件名为 'data',一旦接受到post请求,就会执行 回调函数里的代码
    req.on('data', (postData) => { // postData 为接受到 请求参数
        console.log(postData); // <Buffer 75 73 65 72 4e 61 6d 65 3d 73 75 6e 26 70 61 73 73 57 6f 72 64 3d 31 31 31>
        console.log(postData.toString()) // userName=sun&passWord=111
    })
    res.end('hello');
});
```

#### 搭建一个http服务器

```js
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 3000;
const server = http.createServer((req, res) => {
    let reqUrl = req.url;
    if (reqUrl === '/') {
        let filePath = path.join(__dirname, 'assets', 'index.html');
        let content = fs.readFileSync(filePath);
        // 遵循http协议,设置响应头信息
        res.end(content);
    } else if (reqUrl === '/login.html') {
        let filePath = path.join(__dirname,'assets', 'login.html');
        let content = fs.readFileSync(filePath);
        // 遵循http协议,设置响应头信息
        res.end(content);
    } else if (reqUrl.endsWith('.css')) { // 如果html文件引入了css文件,也需要专门的读取css文件,然后输出到浏览器中
        let filePath = path.join(__dirname, 'assets', 'index.css');
        let content = fs.readFileSync(filePath);
        res.end(content);
    }
    res.end();
})
server.listen(port, (err) => {
    console.log('server is running');
})
```

#### Content-Type

##### 编码格式

```js
var http = require('http');
var server = http.createServer();
server.on('request', function(req, res) {
  // 我们在编写程序的时候,默认的字符编码格式是utf8
  // 中文操作系统下的编码格式是gbk,即浏览器解码的时候是按照gbk的编码格式进行解码,所以这里就出现了用utf8的格式去解码gbk格式的字符串,所以会出现乱码的问题
  // 我们只需要在编码的时候,指定浏览器按照utf8的编码格式去解码,就不会出现乱码的问题了
  res.setHeader('Content-Type', 'text/plain; charset=utf-8'); // 这里的指定浏览器解码的字符格式是utf8的格式
  res.end('hello 世界');
})

server.listen(3000, function() {
  console.log('3000 server is running');
})
```

##### 渲染格式

```js
var http = require("http");
var server = http.createServer();
server.on("request", function (req, res) {
  var url = req.url;
  if (url === "/") {
    res.end('<p>hello <a href="">点击</a></p>'); // 这里默认按照html的格式渲染了这段字符串,在中文的操作系统下是默认按照gbk的格式传输数据的,而浏览器解析数据是按照utf8的格式解析数据,所以这里会出现中文乱码的问题
  } else if (url === "/plain") {
    res.setHeader("Content-Type", "text/plain; charset=utf8");
    res.end('<p>hello <a href="">点击</a></p>'); // 这里按照普通文本的格式渲染了这段字符串
  } else if (url === "/html") {
    res.setHeader("Content-Type", "text/html; charset=utf8");
    res.end('<p>hello <a href="">点击</a></p>'); // 这里按照html文件的格式渲染了这段字符串,即将html代码输出到了浏览器页面上
  }
});

server.listen(3000, function () {
  console.log("3000 server is running");
});
```

##### 输出到浏览器上

```js
const http = require('http')
const path = require('path');
const fs = require('fs')
const port = 3000

const server = http.createServer((req, res) => {
    let reqUrl = req.url
    let filePath = ''
    if (reqUrl === '/') {
        filePath = path.join(__dirname, 'assets', 'index.html')
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8')
                res.end('读取失败')
                return
            }
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(data)
        })
    } else if (reqUrl === '/image') {
        filePath = 'F:\\material\\1.jpg'
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8')
                res.end('读取失败')
                return
            }
            // 这里的图片就不需要指定编码,图片有它自身的编码格式,我们不用管了
            res.setHeader('Content-Type', 'image/gif')
            res.end(data)
        })
    }
    // 注意: 因为fs.readFile()是异步读取,所以不能在最后加res.end(),这样就会导致前面的还没有读取完毕,就已经结束输出了
});

server.listen(port, (err) => {
    if (err) {
        console.log(err)
        return
    }
    console.log('server is running')
})
```

## es6模块化语法

```js
// b.js

// 导出方式1
export let name = 'sun';
export let age = 18;

// 导出方式2
let sex = '男';
let pwd = '111';
export {
    sex,
    pwd
}

// 导出方式3, 这种导出方式一个js文件只能写一次,即后面不能再写export了
export default {
    name,
    age,
    sex,
    pwd
}
```

```js
// a.js

// 这种导入方式针对前两种导出方式
import {name, age} from './b';
// 这种导入方式针对第三种导出方式
import b, {sex} from './b';
console.log(name);
console.log(age);
console.log(b.name);
console.log(b.sex);
console.log(sex);

// 注意: 使用 import 需要先 yarn init -y,然后在package.json里添加  "type": "module"
```

# Promise

## 基本使用

```js
/*
    异步代码,在编写的时候比较麻烦,因为不知道具体什么时候能结束

    Promise是异步编程的一种解决方案,可以将异步代码放在Promise里,按照同步代码的逻辑来编写,比传统的解决方案(回调函数和事件)更合理和更强大

    Promise 是一个对象,从它可以获取异步操作的消息

    Promise 提供统一的 API,各种异步操作都可以用同样的方法进行处理
 */

const fs = require('fs')
const path = require('path')

// 准备要读取的文件路径
let filePath = path.join(__dirname, 'files', '1.txt')

/*
    创建Promise对象 将异步的代码放在Promise里,按照同步代码的逻辑来编写, resolve() 和 reject() 是 Promise对象 的两个方法
        * resolve() 成功的时候执行的函数
        * reject()  失败的时候执行的函数
 */
let p = new Promise((resolve, reject) => {
    // console.log('1234') // 同步的代码放在这里也没有问题,但是一般都是放异步代码
    fs.readFile(filePath, (err, data) => {
        if (err) {
            // reject()的作用就是把Promise的状态置为rejected，这样我们在then中就能捕捉到，然后执行“失败”情况的回调
            reject(err)
        }
        resolve(data)
    })
})

// then() 是Promise对象的方法,效果类似于 回调函数
// then() 有两个参数,两个参数都是箭头函数,如果成功执行第一个参数的回调函数,如果失败执行第二个参数的回调函数
p.then((data) => {
    // 这个data是上面fs.readFile()的回调函数参数里的参数data
    console.log('读取成功, ' + data)
}, (err) => {
    // 这个err是上面fs.readFile()的回调函数参数里的参数err
    console.log('读取失败, ' + err)
})
```

## then的链式调用

```js
/*
    Promise的then()的相比回调函数的优点就在于,当要处理多个多个异步对象的方法的时候,可以通过then()的链式编程来完成
        * 第一个then()完毕后,可以在其后面再写一个then()
        * then函数里面可以有返回值,被下一个then的形参接受到
        * 如果返回的是一个promise对象,再进行then的链式调用,就相当于对这个promise对象再进行一个then()的操作,所以该then里面可以接着和第一个then()一样存放两个回调函数参数
 */
p.then((data) => {
    console.log('读取成功')
    return p // 这里返回一个promise对象
}, (err) => {
    console.log('读取失败')
    console.log(err)
    return err
}).then((data) => {
    // 如果读取成功, data就是上面第一个箭头函数,返回的Promise对象内部的resolve(data)的data,而不是Promise对象
    // 如果读取失败, data就是上面第二个箭头函数,返回的err的信息
    console.log(data.toString())
})
```

## catch(),finally()

```js
p1.then((data) => {
    console.log('成功了');
    console.log(data.toString());
}).catch((error) => {
    console.log(error);
}).finally(() => {
    console.log('不管成功或者失败都会执行')
});
```

## 通过Promise优化代码

```js
const fs = require('fs');
const path = require('path');

let filePath1 = path.join(__dirname, 'files', '1.txt');
let filePath2 = path.join(__dirname, 'files', '2.txt');
let filePath3 = path.join(__dirname, 'files', '3.txt');

function readFilePromise(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        })
    })
}

let p1 = readFilePromise(filePath1);
let p2 = readFilePromise(filePath2);
let p3 = readFilePromise(filePath3);

let str = "";

p1.then((data) => {

    str += data;
    return p2;
}, (err) => {
    console.log('读取失败', err);
}).then((data) => {
    str += data;
    return p3;
}, (err) => {
    console.log('读取失败', err);
}).then((data) => {
    str += data;
    return str;
}, (err) => {
    console.log('读取失败', err);
}).then((data) => {
    console.log(data);
})
```

## util.promisify()

```js
const fs = require('fs');
const path = require('path');
const util = require('util');

let filePath1 = path.join(__dirname, 'files', '1.txt');
let filePath2 = path.join(__dirname, 'files', '2.txt');
let filePath3 = path.join(__dirname, 'files', '3.txt');
let destFile = path.join(__dirname, 'files', 'data.txt');

let readFilePromise = util.promisify(fs.readFile); // 返回一个内部含有fs.readFile()的Promise对象
let writeFilePromise = util.promisify(fs.writeFile); // 返回一个内部含有fs.writeFile()的Promise对象
let appendFilePromise = util.promisify(fs.appendFile); // fs.appendFile()是异步的追加写入方法

// let p1 = readFilePromise(filePath1, 'utf-8') 也可以指定 编码格式为 'utf-8'
let p1 = readFilePromise(filePath1);
let p2 = readFilePromise(filePath2);
let p3 = readFilePromise(filePath3);

let str = "";

p1.then((data) => {
    console.log('读取成功');
    str += data;
    return p2;
}, (err) => {
    console.log('读取失败', err);
}).then((data) => {
    str += data;
    return p3;
}, (err) => {
    console.log('读取失败', err);
}).then((data) => {
    str += data;
    return str;
}, (err) => {
    console.log('读取失败', err);
}).then((data) => {
    writeFilePromise(filePath4, data).then(() => { // 写入数据到destFile里, 并且, 写入成功时,执行then()里的代码,输出'写入成功'到终端
        console.log('写入成功');
    })
}, (err) => {
    console.log('写入失败', err);
})
```

## Promise.all()

```js
let readFilePromise = util.promisify(fs.readFile); // 返回一个内部含有fs.readFile()的Promise对象
let writeFilePromise = util.promisify(fs.writeFile); // 返回一个内部含有fs.writeFile()的Promise对象

let p1 = readFilePromise(filePath1, 'utf-8'); // 注意这里指定编码格式为 'utf-8' 不然下面还需要toString()
let p2 = readFilePromise(filePath2, 'utf-8'); // 这段代码在webstorm里编写会抛出异常,说后面的参数无效,但实际上是有效的
let p3 = readFilePromise(filePath3, 'utf-8');

let content = "";
Promise.all([p1, p2, p3]).then((data) => {
    // 在所有的Promise对象的resolve()的参数获取到之后(即p1,p2,p3的resolve()的参数全部都获取完毕之后),执行这里的代码,只执行一次

    // data是一个数组,每个元素都是上面all的第一个参数里的Promise对象的resolve()的参数的值,即成功时候的值
    console.log(data); // [ '我', '爱', 'node.js' ]
    // 通过数组的join()方法,将数组中的每个元素按照一定的格式拼接起来
    content = data.join("");
    console.log(content); // 我爱node.js  这里是按照""来拼接每个元素的
    writeFilePromise(filePath4, content).then(() => {
        console.log('写入成功');
    });
}).catch((error) => {
    console.log(error);
})
```

## Promise.race()

```js
Promise.race([p1, p2, p3]).then((data) => {
    // 只要p1, p2, p3其中一个Promise对象的resolve()的参数获取到之后,就执行这里的代码,只执行一次
    console.log(data); // node.js
}).catch((error) => {
    console.log(error);
})
```

## await,async

### 基本使用

```js
let readFilePromise = util.promisify(fs.readFile);
let writeFilePromise = util.promisify(fs.writeFile);

// 这里的func()是一个异步函数,默认的函数为同步函数,即 同步 sync, 异步 async
async function func() { //
    // await后面放一个Promise对象,await必须放在async里面,因为是异步的操作
    let data1 = await readFilePromise(filePath1); // '我' 得到Promise对象的读取成功后的resolve()的参数data
    let data2 = await readFilePromise(filePath2); // '爱'
    let data3 = await readFilePromise(filePath3); // 'node.js'
    let content = data1 + data2 + data3;
    console.log(content); // '我爱node.js'
    writeFilePromise(filePath4, content).then(() => {
        console.log('成功');
    });
}

func();
```

### 执行顺序

```js
async function func() {
    console.log('3');
    let data1 = await readFilePromise(filePath1);
    console.log('4');
    let data2 = await readFilePromise(filePath2);
    console.log(data1 + data2); // 我爱
    console.log('5');
}

console.log('1');
func();
console.log('2');

/*
    执行顺序是: 1, 3, 2, 4, 我爱, 5
    在js中先执行同步的程序,后执行异步的程序  最先输出的1, 3都是同步的,没有问题
    执行到 let data1 = await readFilePromise(filePath1);这里的时候,进入异步编程,所以先输出func()外的'2',
    然后按照顺序输出func()里的异步程序,即 4, 我爱, 5
*/
```

### 捕获异常

```js
async function func() {
    // 内部捕获异常
    try {
        let data1 = await readFilePromise(filePath1);
        let data2 = await readFilePromise(filePath2);
    } catch(err) {
        console.log(err);
    } finally {
        console.log('finally...');
    }
}

// 外部捕获异常
func().catch((err) => {
    console.log(err);
}).finally(() => {
    console.log('finally...')
});
```

### 细节

```js
async function func() {
    // 将123封装成了一个Promise对象
    // data1的值相当于 new Promise(() => {resolve(123)}) 我们这里是获取到了123这个数值
    let data1 = await 123;
    console.log(typeof data1); // number
    console.log(data1); // 123
    // 返回的时候是返回的一个Promise对象
    return data1;
}

let ret = func();
console.log(ret); // Promise { <pending> }
ret.then((data) => {
    console.log(data); // 123
})
```

# Express

## 搭建express服务器

```bash
# 初始化项目
yarn init -y
# 安装express
yarn add express
```

```js
// 引入express
const express = require('express');
// 创建app对象(项目对象),他就是项目最大的这个对象
const app = express();

// 处理首页的请求
app.get('/', (req, res) => {
    // req 为 请求对象
    // res 为 响应对象

    // res.send() 响应一个字符串给浏览器
    res.send('hello express 框架');
})

// 处理register页面的请求
app.get('/register', (req, res) => {
    let filePath = path.join(__dirname, 'views', 'register.html');
    let content = fs.readFileSync(filePath, 'utf-8');
    res.send(content);
});

// 监听端口port是否有请求
app.listen(3000, () => {
    // 这里的代码会在服务器启动时执行一次
    console.log('Express server is running');
});
```

## get请求

> 处理get请求

```js
// 处理get请求
app.get('/login', (req, res) => {
    res.send('login页面内容')
});
```

> 获取get请求参数

```js
// 处理get请求
app.get('/login', (req, res) => {
    // 浏览器访问: "http://127.0.0.1:3000/login?username=sun&password=123", 传递的url参数
    console.log(req.query); // { username: 'sun', password: '123' }
    console.log(req.query.username, req.query.password); // sun 123
    res.send('login页面内容')
});
```

## post请求

> 处理post请求

```js
app.post('/register', (req, res) => {
    res.send('post ok');
})
```

> 获取post请求参数

```html
<!--跨域发送post请求-->
<form action="http://localhost:3000/login" method="post">
    <!--传递的参数名就是name属性的值-->
    用户名:<input type="text" name="username"> <br>
    密码:<input type="password" name="password"><br>
    <!--
        <button> 和 <input type="submit"> 会有默认行为: 提交到action的地址处,button在特定的浏览器下会有
        <input type="button">没有这个默认行为,所以正常用 input type="button"的多
    -->
    <input type="submit" value="提交">
</form>
```

```js
/*
    使用第三方的包body-parser, 更加简便专业地完成post请求的参数获取
        yarn add body-parser 或 npm install body-parser
 */
const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express()

// 引入body-parser包
const bodyParser = require("body-parser");

// 通过app.use() 将第三方包bodyParser添加到app项目中, 即将bodyParser注册到app下(让bodyParser和项目产生关联)
// 解析以 application/json 提交的数据
app.use(bodyParser.urlencoded({extended: false}))
// 解析以 application/x-www-form-urlencoded 提交的数据
app.use(bodyParser.json())

// 处理post请求
app.post('/login', (req, res) => {
    console.log(req.body) // [Object: null prototype] { username: 'sun', password: '123' }
    console.log(req.body.username, req.body.password) // sun 123

    // 可以通过解构对象的方式,方便获取
    let {username, password} = req.body
    res.send('success')
})

app.listen(3000, () => {
    console.log('server is running')
})
```

## 发送页面

```js
app.get('/register', (req, res) => {
    // 读取register.html页面的内容
    let filePath = path.join(__dirname, 'views', 'register.html');
    let content = fs.readFileSync(filePath, 'utf-8');
    // 发送内容到浏览器
    res.send(content);
});
```

## 重定向

```js
app.post('/register', (req, res) => {
    // 重定向, 重新发送一个get('/login')的请求到服务器
    res.redirect('/login');
});
```

## app.all()

```js
// 发送到'/register'的任意请求,都会被这里接收到
app.all('/register', (req, res) => {
    if (req.method === 'GET') { // 判断请求为 'GET'
        res.send('get的register页面');
    } else if (req.method === 'POST') { // 判断请求为 'POST'
        res.send('post的register页面');
    }
})
```

## 配置静态资源

```js
// 设置根目录为 'public'
app.use(express.static('public'));

// 设置根目录为 '/static/public'
app.use(express.static('/static/public'));
```

```html
<!--
	如果根目录改为了'public',那么当前文件就在根目录'/public',图片的路径就在'/public/images/1.jpg'
		想要访问到图片,就得要设置路径为 '/images/1.jpg' 才可以
-->
<img src="/images/1.jpg" alt="">
```

## art-template模板引擎

```bash
# 使用yarn安装对应的包
yarn add art-template
yarn add express-art-template
```

```js
const path = require('path')
const express = require('express')
const app = express()

// 使用对应html文件的引擎
app.engine('html', require('express-art-template'))
// 项目环境的设置:
// * 生产环境(线上) production
// * 开发环境(线下) development
app.set('view options', {
    debug: process.env.NODE_ENV !== 'production' // 这个参数可以更换为 'development'
})
// 设置我们需要的 'html' 文件在哪个目录下找,我们这里的 'html' 文件就放在了views目录下
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎对应文件的后缀名,即为 'html'
app.set('view engine', 'html')

app.get('/', (req, res) => {
    // 如果我们从数据库中获取到了数据,可以通过render将数据传递到页面中
    let data = {
        num1: 10,
        num2: 20,
        user: {
            uName: 'sun',
            age: 18
        },
        books: ['三国演义', '水浒传']
    }
    // 将index.html页面输出在网页中,并且传递data数据到页面中
    res.render('index', data) ;
})

app.listen(3000, () => {
    console.log('server is running')
})
```

```html
<!--/views/index.html-->

<!--该模板引擎就和vue的插值语法一样,可以传入js表达式-->
<p>num1: {{num1}}</p>

<!--想要返回较大的值,可以直接通过三目运算符-->
<p>num1和num2中较大值: {{num1 > num2 ? num1 : num2}}</p>

<p>num1和num2的和为: {{num1 + num2}}</p>

<p>user: {{user.uName}}, {{user.age}}</p>

<ul>
    <!--each循环遍历语句-->
    {{each books}}
    <!--$index为索引(从0开始), $value为值-->
    <li>{{$index + 1}} : {{$value}}</li>
    {{/each}}
</ul>

<!--if语句 如果uName为'sun'就显示<p>标签-->
{{if user.uName === 'sun'}}
<p>欢迎您, sun先生</p>
{{/if}}
```

## 路由

```js
/*
	新建一个routes文件夹,里面就存放路由,我们的路口js文件就是app.js,通过exports和require来引入相应的路由
*/

// passport.js

const express = require('express');
// 创建Router对象
const router = express.Router();
// 用router来代替app表示路由,在这里编写相应的路由
router.get('/login', (req, res) => {
    res.send('login');
});
router.get('/register', (req, res) => {
    res.send('register')
});
// 导出router对象
module.exports = router;
```

```js
// app.js 我们通常的路口文件夹的名称就是app.js

const express = require('express');
let app = express();

// 引入路由文件router到路口文件app中
const indexRouter = require('./routes/index');
const passportRouter = require('./routes/passport');

// 通过app.use()来使用
app.use(indexRouter);
app.use(passportRouter);

app.listen(3000, () => {
    console.log('server is running');
});
```

## 钩子函数

> 基本使用

钩子函数就是 会在输出页面前调用的函数,可以用于校验网站是否登录,如果登录了就可以执行某些操作...

```js
// 这里的func()就是作为一个钩子函数
let func = (req, res, next) => {
    console.log('执行了func()');
    next(); // 执行完钩子函数里的代码后,需要执行next()让其继续执行后续的代码
}
// 在输出路由passportRouter的数据之前,会先执行func这个钩子函数,如果其不调用next(),passportRouter就会一直不输出
app.use(func, passportRouter);
```

> 项目中的使用

```js
// utils/index.js

// 将钩子函数封装在一个新的js文件里,这里js文件放在utils包下,作为工具存在
let checkLogin = (req, res, next) => {
    if (true) {
        res.send('校验错误,登录失败');
        return;
    }
    next();
}

// 将钩子函数导出
module.exports = {
    checkLogin,
    // 其他的一些utils方法的导出...
};
```


```js
// app.js

const utils = require('./utils/index');
app.use(utils.checkLogin, passportRouter);
```

## pathinfo风格的参数

```html
<li><a href="/details/1/music">详情页</a></li>
<li><a href="/details/2/news">详情页</a></li>
<li><a href="/details/3/moive">详情页</a></li>
<li><a href="/details/4/article">详情页</a></li>
```

```js
// pathinfo 又称为 pathname, 通过 `:id` 来获取到 `/details` 后续的路径参数值
app.get('/details/:id/:type', (req, res) => {
    console.log(req.params); // { id: '1', type: 'music' }
    console.log(req.params.id, req.params.type); // 1 music

    res.send('详情页: ' + req.params.id + ", 类型为: " + req.params.type);
})
```

## 模板过滤

```html
<!--使用template的过滤器语法 {{数据 | 过滤器名}}-->
<p>num1: {{num1 | timeStamp}}</p>
```

```js
// 引入 art-template 模板
const template = require('art-template'); 

// template.default.imports.过滤器名 = (value) => {}
template.defaults.imports.timeStamp = (value) => {
    // value 为 `{{数据 | 过滤器名}}` 前面的 数据的值
    return value * 1000;
}
// 在模板引擎中,传入data数据
app.get('/', (req, res) => {
    let data = {
        num1: 20
    }
    res.render('index', data);
})
```

## 模板继承

```html
<!--
	模板继承可以解决,两个html页面,有着共同的部分,比如 头部 和 底部 这样完全相同的页面,我们可以采取模板继承的方式来解决问题
-->

<!-- parent.html -->

<h1>头部</h1>
<!--其他模板继承了父模板,想要有不同的敌方,需要编写加上block, 'contentBlock' 是自己定义的块名,所以需要加上 ' '-->
{{block 'contentBlock'}}
<p>父模板的内容</p>
{{/block}}
<h1>结尾</h1>
```

```html
<!-- child.html -->

<!--继承 './parent.html' 模板的内容-->
{{extend './parent.html'}}

<!--编写 child.html 自己的内容-->
{{block 'contentBlock'}}
<p>子模板的内容</p>
{{/block}}
```

```js
// app.js

app.get('/parent', (req, res) => {
    res.render('parent');
})

app.get('/children', (req, res) => {
    res.render('children');
})
```

## Cookie

```js
// 安装 并 引入 'cookie-parser'
const cookieParser = require('cookie-parser');
// 将cookieParser注册到app项目下
app.use(cookieParser());

// 设置cookie信息
app.get('/setCookie', (req, res) => {
    // 设置一个属性"name",并且值为"sun",保存时间maxAge为"1000 * 60 * 60 * 2"毫秒(即会在2h后消除该数据)
    res.cookie('name', 'sun', {maxAge: 1000 * 60 * 60 * 2})
    // 设置一个属性"age"没有设置保存时间,会在关闭浏览器后消除该数据
    res.cookie('age', 18);
    res.send('cookie设置成功');
})

// 获取cookie信息
app.get('/getCookie', (req, res) => {
    // 通过 req.cookies 来获取到 cookie对象,里面存放着相关的信息
    let name = req.cookies.name; // req.cookies['name'] 也可以获取到数据,一个用法
    let age = req.cookies.age;
    console.log(req.cookies); // 注意这里的是 cookies 而不是 cookie
        // {
        //     'Webstorm-46a075f9': '2c28767f-84f5-43ab-ba30-03a72a719916',
        //     name: 'sun',
        //     age: '18'
        // }
    console.log(name, age);
        // sun 18
    res.send(`获取到的cookie信息为 ${name}, ${age}`);
})
```

## Session

```js
// 安装 并 引入 "cookie-session"
const cookieSession = require('cookie-session');
// 设置cookieSession的相关属性值,并将cookieSession注册到app项目下
app.use(cookieSession({
    // name作为标识的键名
    name: 'my_session',
    // session会根据keys这段字符串,进行加密,生成一个字符串,作为标识的值
    keys: ['jwoinbononfoepnnwpvjppfnqa'],
    // 设置该标识的保存时长
    maxAge: 1000 * 60 * 60 * 2
}));
// 设置session信息
app.get('/setSession', (req, res) => {
    req.session.name = 'cheng';
    // req.session['name'] = 'cheng' 也可以
    req.session.age = 20;
    res.send('设置了session数据');
})
// 获取session信息
app.get('/getSession', (req, res) => {
    let name = req.session.name;
    // req.session['name'] 也可以获取到数据
    let age = req.session.age;
    console.log(name, age);
    res.send(`获取到的session信息为 ${name}, ${age}`)
})
```

# Mysql

## 快速入门

```js
// db.js

// 安装并引入mysql
let mysql = require('mysql')

// 数据库连接池配置
let pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "111",
    database: "school"
})

// 对数据库进行增删改查操作的基础
// * 参数1 sql语句
// * 参数2 回调函数
function query(sql, callback) {
    pool.getConnection(function (err, connection) {
        connection.query(sql, function (err, rows) {
            callback(err, rows)
            connection.release()
        });
    });
}

exports.query = query;
```

```js
// app.js

const express = require('express')
const app = express()
// 引入我们自定义的db.js模块
const db = require('./db/db.js')

app.get('/', (req, res) => {
    // 编写sql语句
    let sql = 'select * from student'

    // 调用query(),执行sql语句,查询数据
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err)
        }
        res.send(data)
    })
})

app.listen(3000, () => {
    console.log('server is running')
})
```

## ORM

### 快速入门

![image-20220301170507642](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311520445.png)

```js
// 引入nodejs-orm目录到db目录下(在public-resources里有保存)

// 修改/nodejs-orm/index.js的数据库连接设置
let orm_config = {
    host: 'localhost',//数据库地址
    port:'3306',
    user: 'root',//用户名，没有可不填
    password: '111',//密码，没有可不填
    database: 'student'//数据库名称
}
```

```js
// app.js

const express = require('express')
const app = express()

// 引入/nodejs-orm/index.js模块(如果该目录下只有一个index文件,就可以省略index.js不写)
const db = require('./db/nodejs-orm')

app.get('/', (req, res) => {
    // 操作数据库中的emp表
    let emp = db.model('emp')
    // 执行sql语句,查找emp表中的字段'ename','job','sal'的信息
    emp.find(['ename', 'job', 'sal'], (err, data) => {
        if (err) {
            console.log(err)
            return
        }
        res.send(data)
    })
})

app.listen(3000, () => {
    console.log('server is running')
})
```

### 自定义sql语句

```js
// 在sql()中编写完整的sql语句
student.sql('select name as NAME, age from students where name = "sun"', (err, result) => {
    res.send(result);
})
```

### 查询语句

#### 查询所有

```js
// 操作数据库中的student表
let student = db.model("student");
// 查询student表的所有信息 (即select * from student)
student.find((err, results) => {
    res.send(results)
})
```

#### 查询指定记录

```js
// 查询student表中 字段 'name' 和 'age' 的信息
student.find(["name", "age"], (err, results) => {
    res.send(results)
})
```

#### 条件查询

```js
// 查询student表中 name='小月月' 的记录
student.find("name = '小月月'", (err, results) => {  //这里的引号里面书写的是where后面的字符串
    res.send(results)
})

// 展示student表中,age > 1 的记录的 name字段 和 age字段 
student.limit({where: "age > 18", arr: ['name', 'age']}, (err, results) => {
    res.send(results)
})
```

#### 分页查询

```js
/*
	将 student表 分为若干页, 每一页有count条记录, 我们查询第where页的记录
		* where 可选,用于过滤
		* number 第几页
		* count 每页的条数
*/

// 查询student表中,age > 18 的记录,并且按照每一页5条记录进行分页,当前显示第1页的内容
student.limit({where: "age > 18", number: 1, count: 5}, (err, results) => {
    res.send(results)
})
```

### 添加语句

#### 添加单条记录

```js
admin.insert({name: 'smith', pwd: 999}, (err, data) => {
    console.log(data);
        // OkPacket {
        //     fieldCount: 0,
        //         affectedRows: 1,
        //         insertId: 0,
        //         serverStatus: 2,
        //         warningCount: 0,
        //         message: '',
        //         protocol41: true,
        //         changedRows: 0
        // }
    
    res.send('添加成功');
});
```

#### 添加多条记录

```js
// 同时添加多条记录到student表中
student.insert([{name: "刘备", age: 18}, {name: '关羽', age: 16}, {name: '张飞', age: 14}], (err, data) => {
    console.log(data);
    res.send('添加成功');
})
```

### 删除语句

#### 删除指定记录

```js
// 删除 age = 18 的记录
student.delete('age="18"', (err, result) => {
    res.send(result)
})
```

#### 删除所有记录

```js
// 删除student表中的所有的记录
student.delete((err, result) => {
    res.send(result)
})
```

#### 修改语句

#### 修改指定记录

```js
// 修改student表中name为"sun"的记录的age字段值为"1"
student.update('name = "sun"', {age: 1}, (err, result) => {
    res.send(result);
})
```

#### 修改所有记录

```js
// 修改student表中,所有记录的age字段值为"1"
student.update({age: 1}, (err, result) => {
    res.send(result);
})
```

## async,await,Promise

```js
const db = require('./db/nodejs-orm');

app.get('/', (req, res) => {
    // async 表示异步操作 (function(){})() 表示 立即执行函数;
    (async function () {
        let result;
        // 通过try-catch来捕获异常
        try {
            // await 需要放在async里面, await后面需要跟着Promise对象
            // * 失败时, 调用reject(), 将err传入
            // * 成功时, 调用resolve(), 将data传入
            result = await new Promise((resolve, reject) => {
                let student = db.model('student');
                // 查询 Students表的信息
                student.find(['name', 'age'], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(data); // 成功之后,调用resolve()将data数据返回,在最外层有一个
                });
            });
        } catch (err) {
            console.log(err);
            res.send("数据库出现异常");
        }
        res.send(result);
    })();
});
```

## handleDB()

```js
// app.js
const express = require('express');
const app = express();
// 注意,这里的我们导入的是一个方法,而不是一个对象
const handleDB = require('./db/handleDB');
app.get('/', (req, res) => {
    let result;
    (async function () {
        result = await handleDB(res, 'students', 'update', '数据库更新数据错误', 'name = "sun"', {age: 40});
        res.send(result);
    })();
});

app1.listen(3000, () => {
    console.log('server is running');
})
```

```js
// 将orm的操作封装成的handleDB(),f

const db = require("./nodejs-orm")

async function handleDB(res, tableName, methodName, errMsg, n1, n2){
    let Model = db.model(tableName);
    let result

    try{
        result = await new Promise((resolve, reject)=>{
            // Model["find"]("",(err, data)=>{
            if(!n1){  
                // 表示n1n2参数也没有传
                Model[methodName]((err, data)=>{
                    if(err)reject(err);
                    resolve(data);
                })   
                return
            }
            
            // 程序能够执行到这里，说明n1已经有了
            if(!n2){
                // 没有传递n2
                Model[methodName](n1, (err, data)=>{
                    if(err)reject(err);
                    resolve(data);
                })   
                return
            }

            // 程序能够执行这里， 说明n1, n2都传了
            Model[methodName](n1,n2, (err, data)=>{
                if(err)reject(err);
                resolve(data);
            })  
        })   
    }catch(err){
        console.log(err); // 在后端打印异常
        res.send({errMsg:errMsg})  // 通知前端出现异常
        return
    }
    
    return result
}

// 注意这里,是将handleDB()这个方法直接导出的,所以我们在导入的时候,是导入的一个方法,而不是一个对象
module.exports = handleDB;
```

# 跨站请求伪造

## 伪造原理

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311520446.png)

## 防护措施

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311520447.png)

不仅仅转账需要CSRF防护,每一个post请求都需要做csrf的防护措施

## 代码实现

> 准备一个方法,生成随机数,作为csrf_token的值

```js
function getRandomString(n){
    var str="";
    while(str.length<n){
      str += Math.random().toString(36).substr(2);
    }
    return str.substr(str.length-n)
}

getRandomString(48); // 生成一个48位的随机数
```

> get请求转账页面的时候,在cookie中设置一个csrf_token值(随机48位字符串)：

```js
if(req.method=="GET"){
	// 设置一个csrf_token的值
    let csrf_token = getRandomString(48);
    // 渲染转账页面的时候,在cookie中设置csrf_token(记得安装cookie-parser模块)
    res.cookie('csrf_token', csrf_token); 
	// 输出temp_transfer页面
    res.render('temp_transfer');
}
```

> 前端发送post请求的时候,添加一个自定义请求头'X-CSRFToken',值为cookie中的csrf_token值

```js
$.ajax({
    url: '/transfer',
    type: 'post',
    data: JSON.stringify(params),
    contentType: 'application/json',
    headers: {'X-CSRFToken': getCookie('csrf_token')},
    success: function (resp) {
        ...
    }
})
...
function getCookie(name) {   //获取cookie的函数
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}
```

> 服务器处理post请求的时候,判断 响应头中的x-csrftoken值 和 cookies中的csrf_token的值 是不是一致

```js
...
else if(req.method=="POST"){
    // 判断 响应头中的x-csrftoken值 和 cookies中的csrf_token的值 是不是一致
    console.log(req.headers["x-csrftoken"]);
    console.log(req.cookies["csrf_token"]);

    if((req.headers["x-csrftoken"] === req.cookies["csrf_token"])){
        console.log("csrf验证通过！");
    }else{
        res.send("csrf验证不通过！");
        return
    }

    // 以下可以开始正常处理post请求
    ...
}
```

> app.js

```js
const router = express.Router();

router.all('/', (req, res) => {
    if(req.method=="GET"){
        res.render('temp_login')
    }
    
    ...
});
router.all('/transfer', (req, res) => {
    
   ...
   
    else if(req.method=="POST"){
        
        let {to_account, money} = req.body;
        console.log(to_account, money);
        
        //执行转账功能： ....此处省略
        console.log("假装执行转账操作，将当前登录用户的钱转账到指定账户");
        console.log(`已经完成转账${money}元到账户${to_account}`);
        
        res.json({to_account,money});

    }
});
function csrfProtect(req, res, next){
    let method = req.method
    if(method=="GET"){
        let csrf_token = getRandomString(48);
        res.cookie('csrf_token', csrf_token);
        next() //执行跳转到下一个函数执行，即app.use(beforeReq,router)中的下一个
    }else if(method=="POST"){
        // 判断响应头中的x-csrftoken值，和cookies中的csrf_token进行对比
        console.log(req.headers["x-csrftoken"]);
        console.log(req.cookies["csrf_token"]);
        
        if((req.headers["x-csrftoken"] === req.cookies["csrf_token"])){
            console.log("csrf验证通过！");
            next()
        }else{
            res.send("csrf验证不通过!！");
            return
        }
    }
}

app.use(csrfProtect,router)
```

# 项目初始化配置

## 静态资源的处理

> 项目结构

![image-20220301181514149](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311520448.png)

> app.js

```js
// app.js

const path = require('path')
const express = require('express')
const app = express()

// 指定静态资源的根目录
app.use(express.static('public'))

// 模板的配置
app.engine('html', require('express-art-template'));
app.set('view options', {
    debug: process.env.NODE_ENV !== 'production'
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.get('/', (req, res) => {
    // 输出 /views/news/index.html页面
    // 注意必须是'news/index',不可以是'/news/index'
    res.render('news/index')
})

app.listen(3000, () => {
    console.log('server is running')
})
```

> /views/news/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <!--
        配置了public目录为静态资源的根目录,所有想要访问index.css,得是这个路径
    -->
    <link rel="stylesheet" href="/news/css/index.css">
</head>
<body>
<h1>index页面</h1>
</body>
</html>
```

> /public/news/index.css

```css
h1 {
    color: pink;
}
```

## 配置信息的抽取

### 以函数的形式

```js
// config.js 配置相关的内容都放在这里

const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const path = require("path");

// 将注册和配置信息,都放在appConfig()中
let appConfig = (app) => {
    // 注册cookie,session
    app.use(cookieParser())
    app.use(cookieSession({
        name: 'my_session',
        keys: ['jflksjdlfjowijfoiwjfojsdlfw'],
        maxAge: 1000 * 60 * 60 * 24 * 2 // 保存两天
    }))

    // 获取post请求参数的配置
    app.use(bodyParser.urlencoded({extended: false}))
    app.use(bodyParser.json())

    // art-template模板的配置
    app.engine('html', require('express-art-template'));
    app.set('view options', {
        debug: process.env.NODE_ENV !== 'production'
    });
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'html');
}

// 导出该函数,供app.js调用
module.exports = appConfig
```

```js
// app.js 入口文件

const express = require('express')
const app = express();

// 引入appConfig(),调用并传入app
const appConfig = require('./config');
appConfig(app)

app.get('/', (req, res) => {
    res.cookie('username', 'sun', {maxAge: 1000 * 60 * 60 * 24 * 2})
    req.session.password = 123
    console.log(req.cookies.username, req.session.password)
    res.render('index')
})

app.listen(3000, (err) => {
    if (err) {
        console.log(err)
        return
    }
    console.log('server is running at port 3000')
})
```

### 以面向对象的形式(1)

```js
// config.js 配置相关的内容都放在这里

const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const path = require("path");

// 定义一个类
class AppConfig {
    // 构造器,创建AppConfig对象的时候会调用该构造器
    constructor(app) {
        // 将app保存下来
        this.app = app

        // 注册cookie,session
        this.app.use(cookieParser())
        this.app.use(cookieSession({
            name: 'my_session',
            keys: ['jflksjdlfjowijfoiwjfojsdlfw'],
            maxAge: 1000 * 60 * 60 * 24 * 2 // 保存两天
        }))

        // 获取post请求参数的配置
        this.app.use(bodyParser.urlencoded({extended: false}))
        this.app.use(bodyParser.json())

        // art-template模板的配置
        this.app.engine('html', require('express-art-template'));
        this.app.set('view options', {
            debug: process.env.NODE_ENV !== 'production'
        });
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'html');
    }
}

// 导出该类,供app.js调用
module.exports = AppConfig
```

```js
// app.js 入口文件

const express = require('express')
const app = express();

// 引入AppConfig类
const AppConfig = require('./config');

// 创建AppConfig对象,并且传入app
new AppConfig(app)

app.get('/', (req, res) => {
    res.cookie('username', 'sun', {maxAge: 1000 * 60 * 60 * 24 * 2})
    req.session.password = 123
    console.log(req.cookies.username, req.session.password)
    res.render('index')
})

app.listen(3000, (err) => {
    if (err) {
        console.log(err)
        return
    }
    console.log('server is running at port 3000')
})
```

### 以面向对象的形式(2)

```js
// config.js 配置相关的内容都放在这里

const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const path = require("path");

// 定义一个类
class AppConfig {
    // 构造器,创建AppConfig对象的时候会调用该构造器
    constructor(app) {
        // 将app保存下来
        this.app = app
    }

    // 将注册和配置的操作封装成一个函数
    run() {
        // 注册cookie,session
        this.app.use(cookieParser())
        this.app.use(cookieSession({
            name: 'my_session',
            keys: ['jflksjdlfjowijfoiwjfojsdlfw'],
            maxAge: 1000 * 60 * 60 * 24 * 2 // 保存两天
        }))

        // 获取post请求参数的配置
        this.app.use(bodyParser.urlencoded({extended: false}))
        this.app.use(bodyParser.json())

        // art-template模板的配置
        this.app.engine('html', require('express-art-template'));
        this.app.set('view options', {
            debug: process.env.NODE_ENV !== 'production'
        });
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'html');
    }
}

// 导出该类,供app.js调用
module.exports = AppConfig
```

```js
// app.js 入口文件

const express = require('express')
const app = express();

// 引入AppConfig类
const AppConfig = require('./config');

// 创建AppConfig对象,并且传入app
let appConfig = new AppConfig(app)
// 调用run(),进行配置操作
appConfig.run()

app.get('/', (req, res) => {
    res.cookie('username', 'sun', {maxAge: 1000 * 60 * 60 * 24 * 2})
    req.session.password = 123
    console.log(req.cookies.username, req.session.password)
    res.render('index')
})

app.listen(3000, (err) => {
    if (err) {
        console.log(err)
        return
    }
    console.log('server is running at port 3000')
})
```

## 抽离路由

> 项目结构

![image-20220303163739924](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311520449.png)

> routes/index.js

```js
const express = require('express')
const router = express.Router()
const handleDB = require('../db/handleDB')

router.get('/', (req, res) => {
    res.cookie('username', 'sun', {maxAge: 1000 * 60 * 60 * 24 * 2})
    req.session.password = 123
    console.log(req.cookies.username, req.session.password)
    res.render('news/index')
})

module.exports = router
```

> app.js

```js
// app.js 入口文件

const express = require('express')
const app = express();

// 将路由的注册工作放在config.js里,简化入口文件,方便后期更好的维护
const AppConfig = require('./config');
let appConfig = new AppConfig(app)

app.listen(appConfig.listenPort, (err) => {
    if (err) {
        console.log(err)
        return
    }
    console.log(`server is running at port ${appConfig.listenPort}`)
})
```

> config.js

```js
// config.js 配置相关的内容都放在这里

// 引入路由
const indexRouter = require('./routes/index')
const passportRouter = require('./routes/passport');

class AppConfig {
    constructor(app) {
        this.app = app
        this.listenPort = 3000

        // 注册路由到app下
        this.app.use(indexRouter)
        this.app.use(passportRouter)
    }
}

module.exports = AppConfig
```

## 数据库的配置

> 项目结构

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311520450.png)

安装mysql的包,引入orm框架,引入封装好的handleDB.js

> routes/index.js

```js
const express = require('express')
const router = express.Router()
const handleDB = require('../db/handleDB')

router.get('/', (req, res) => {
    res.cookie('username', 'sun', {maxAge: 1000 * 60 * 60 * 24 * 2})
    req.session.password = 123
    console.log(req.cookies.username, req.session.password)
    res.render('news/index')
})

// 测试数据库
router.get('/get_data', (req, res) => {
    (async function () {
        // 调用handleDb(),查询数据库
        let result = await handleDB(res, 'info_category', 'find', '数据库查询错误')
        res.send(result)
    })();
})

module.exports = router
```

# Details

## Buffer数据类型

```js
let buf1 = Buffer.from([97, 98, 99]); // 97 为 a ...
console.log(buf1); // <Buffer 61 62 63> 将十进制的97转成十六进制数就是61
console.log(buf1.toString()); // abc 通过toString()可以得到最终的结果

let buf2 = Buffer.from("node.js");
console.log(buf2); // <Buffer 6e 6f 64 65 2e 6a 73>
console.log(buf2.toString()); // node.js

let buf3 = Buffer.alloc(10); // 创建一个key存放10个字符的Buffer对象
buf3.write("abc"); // 往Buffer对象中写入信息(传入的数据转成2进制,存储再底层,然后再转成16进制存储在该Buffer对象中)
console.log(buf3); // <Buffer 61 62 63 00 00 00 00 00 00 00>
console.log(buf3.toString()); // abc
```

## JSON

```js
let person = {
    name: 'sun',
    age: 18
}

// 对象数据 -> json数据
let jsonStr = JSON.stringify(person);
console.log(jsonStr) // {"name":"sun","age":18}

// json数据 -> 对象数据
let obj = JSON.parse(jsonStr);
console.log(obj) // { name: 'sun', age: 18 }
```

## global对象

```js
// node.js没有window对象,有global对象(全局对象),
// 在node.js里使用的console,setTimeout()...都是global对象的,我们之前在dom下调用的console,setTimeout()...都是window对象的
global.console.log("hello");
global.setTimeout(function () {
    console.log("hi");
},1000);

console.log(global); // Object [global] {...}
// console.log(window); // error

// node.js里面声明的变量不是声明在global对象里的
let a = 10;
console.log(global.a); // undefined
// 在global对象里声明成员变量,可以在全局访问到
global.b = 20;
console.log(b); // 20
// 该js文件下的this指向的其实是这个模块(这个js文件),但是在交互模式下(控制里输出node),this指向的就是global对象(即在交互模式下输出node === global为true)
console.log(this === global); // false;
```

## proecss

```js
// 获取到执行文件的时候,命令行的参数(做一些命令行工具效果的时候才会用到
console.log(process.argv);
// 我们在命令行输入: node test.js
// [
//     'D:\\programming\\node.js\\node.exe',
//     'E:\\computer\\node.js\\test.js'
// ]

// 我们在命令行输入: E:\computer\node.js>node test.js 10 20 30
// [
// 'D:\\programming\\node.js\\node.exe',
//     'E:\\computer\\node.js\\test.js',
//     '10',
//     '20',
//     '30'
// ]

// 可以通过process.argv获取存有参数的数组,即可以通过argv来获得输入的参数
console.log(process.argv[2], process.argv[3]);

// 我们在命令行输入: E:\computer\node.js>node test.js 10 20 30
// [
// 	'D:\\programming\\node.js\\node.exe',
//     'E:\\computer\\node.js\\test.js',
//     '10',
//     '20',
//     '30'
// ]
// 10 20

// 获取执行环境的系统位数
console.log(process.arch); // x64
```

# Resources

## body-parser 获取post参数

```bash
yarn add body-parser
```

```js
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false})) 
app.use(bodyParser.json())
app.post('/register', (req, res) => {
    console.log(req.body)
    console.log(req.body.username, req.body.password)
    res.send('post ok')
})
```

## art-template 模板引擎

```bash
yarn add art-template
yarn add express-art-template
```

```js
const path = require('path');
const express = require('express');
const app = express();

app.engine('html', require('express-art-template'));
app.set('view options', {
    debug: process.env.NODE_ENV !== 'production'
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.get('/', (r) => {
    
})
```

## Mysql

```js
let mysql = require('mysql')

let pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "111",
    database: "db01"
})

function query(sql, callback) {
    pool.getConnection(function (err, connection) {
        connection.query(sql, function (err, rows) {
            callback(err, rows)
            connection.release()
        });
    });
}

exports.query = query;
```
