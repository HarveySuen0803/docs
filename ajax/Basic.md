# AJAX简介

* AJAX (Asynchronous JavaScript And XML) 异步的 JavaScript 和 XML
* 与服务器进行数据交换: 通过AJAX可以给服务器发送异步请求,服务器将数据直接响应回给浏览器
* 优点
  * 发送异步请求
  * 可以搭配用户事件来使用, 比如: click, blur, mouseover
  * 无需刷新,获取新数据,更新部分页面内容,提高网页的加载速度, 比如: 搜索联想,用户名校验...
    <img src="https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311444039.png" alt="image-20210824000706401"  /><img src="https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311444040.png" alt="image-20210824001015706"  />
* 缺点
  * 没有浏览历史,不能回退
  * 存在跨越问题(同源)
  * SEO不友好

# XML简介

* XML 可扩展标记语言。
* XML 和 HTML 类似,都是标记语言
  * HTML中都是预定义标签
  * 而XML中没有预定义标签,全都是自定义标签,用`来表`示一些数据
* XML 最早被设计用来传输,存储数据,即通过xml的格式进行前后端数据交互,现在被json代替了

```xml
<!--存储数据: name="sun", age=18, gender="male"-->
<student>
    <name>sun</name>
    <age>18</age>
    <gender>male</gender>
</student>
```

# AJAX发送get请求

```html
<button id="btn">发送请求</button>
<div id="result"></div>

<script>
    let btn = document.querySelector('#btn');
    btn.addEventListener('click', function () {
        // 创建XMLHttpRequest对象
        let xhr = new XMLHttpRequest()

        /*
        	设置 请求方法,请求路径url
        	
        	可以在url路径里编写参数,将参数传递给服务器,这就是url传参
                * get请求就是通过这个方式来进行参数传递的
                * post请求也可以通过这个方式进行参数传递,当然也有post请求参数传递的方式
         */
        xhr.open('GET', 'http://127.0.0.1:9999/server?username=sun&age=18')

        // 发送请求
        xhr.send()

        /*
            监听状态的改变的事件,当readyState发生了变化,就触发该事件,我们可以在这里处理服务端响应的数据
                * readyState 表示状态,是XMLHttpRequest对象的属性
                    * 0 请求未访问,还未初始化 [即调用完new XMLHttpRequest(),创建了一个XMLHttpRequest对象]
                    * 1 服务器链接已建立,完成了初始化工作 [即即xhr.open()调用完毕]
                    * 2 发送了请求,并且请求已接受 [即xhr.send()调用完毕]
                    * 3 正在处理请求,服务端响应了部分的数据
                    * 4 请求已完成且响应已就绪,服务端响应了全部的数据

            所以这个事件会触发4次,即 状态0 -> 状态1, 状态1 -> 状态2 ...
         */
        xhr.onreadystatechange = () => {
            // readyState 状态
            console.log(xhr.readyState)
            // status 访问状态码 (比如: 200 "OK", 403 "Forbidden", 404 "Page not found")
            console.log(xhr.status)
            // statusText 返回文本状态  (比如: "OK", "Not Found")
            console.log(xhr.statusText)

            // readyState=4表示,服务端响应了全部的数据
            // status只要是200~300的数据都表示访问成功
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                // response 服务端响应的数据,就是我们这里真正要获取的数据
                console.log(xhr.response) // 'hello world'
                
                console.log(xhr.responseText) // 接受文本格式的响应数据
                console.log(xhr.responseXML) // 接受xml格式的响应数据
                
                // 在页面中展示服务端响应的数据
                document.querySelector('#result').innerHTML = xhr.response
            }
        }
    });
</script>
```

```js
// 使用expres框架,简单搭建一个服务器

const express = require('express')
const app = express()

// 处理get请求的路由
app.get('/server', (req, res) => {
    // 设置响应头,允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*')

    // 设置响应体,即响应数据给前端
    res.send('hello world')
})

app.listen('9999', () => {
    console.log('server is running')
})
```

# AJAX发送post请求

```html
<button id="btn">发送请求</button>
<div id="result"></div>

<script>
    let btn = document.querySelector('#btn');
    btn.addEventListener('click', function () {
        let xhr = new XMLHttpRequest()
        // 这里是设置为POST的请求方式
        xhr.open('POST', 'http://127.0.0.1:9999/server')
        /*
        	post请求的参数一般都放在请求体中(当然也可以通过url传参),所以我只需要编写请求体的内容,就能做到给服务端传参的效果
        	
        	通过xhr.send(),编写请求的内容,参数的编写格式可以很灵活,比如: 
        		* xhr.send('hello server')
        		* xhr.send('username:sun&age:18')
        		* xhr.send('username=sun&age=18')
        */
        xhr.send('username=sun&age=18')
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                console.log(xhr.response)
            }
        }
    });
</script>
```

```js
// 使用expres框架,简单搭建一个服务器

const express = require('express')
const app = express()

// 处理post请求的路由
app.post('/server', (req, res) => {
    // 设置响应头,允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*')

    // 设置响应体,即响应数据给前端
    res.send('hello world')
})

app.listen('9999', () => {
    console.log('server is running')
})
```

# 设置请求头信息

```html
<button id="btn">发送请求</button>
<div id="result"></div>

<script>
    let btn = document.querySelector('#btn');
    btn.addEventListener('click', function () {
        let xhr = new XMLHttpRequest()
        xhr.open('POST', 'http://127.0.0.1:9999/server')
        /*
            我们一般会把身份校验的信息放在请求头里,传递给服务器,由服务器做提取,做一个身份的校验

            请求头
                * 预定义请求头: HTTP内置的请求头
                * 自定义请求头: 用户自定义的请求头
         */

        // 设置预定义请求头
        xhr.setRequestHeader('Context-Type', 'application/x-www-form-urlencoded')
        // 设置自定义请求头, 需要在后端设置响应头res.setHeader('Access-Control-Allow-Headers', '*'),这样才不会对自定义请求头报错
        xhr.setRequestHeader('myName', 'sun')

        xhr.send()
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                console.log(xhr.response)
            }
        }
    });
</script>
```

```js
// 使用expres框架,简单搭建一个服务器

const express = require('express')
const app = express()

// 处理任意类型的请求,因为设置了自定义请求头后会有一个请求方式为option的请求来校验,所以我们需要使用all来接受任意类型的请求
app.all('/server', (req, res) => {
    // 设置响应头,允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*')

    // 设置响应头,解决允许使用自定义请求头
    res.setHeader('Access-Control-Allow-Headers', '*')

    // 设置响应体,即响应数据给前端
    res.send('hello world')
})

app.listen('9999', () => {
    console.log('server is running')
})
```

# 处理json数据

```html
<button id="btn1">发送请求1</button>
<button id="btn2">发送请求2</button>

<script>
    let btn1 = document.querySelector('#btn1');
    btn1.addEventListener('click', function () {
        let xhr = new XMLHttpRequest()
        xhr.open('POST', 'http://127.0.0.1:9999/server')
        xhr.send()
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                // 直接输出是输出的json格式的数据,不是对象格式的
                console.log(xhr.response); // {"name":"sun","age":18}
                console.log(xhr.response.name); // undefined; 因为是json格式的数据,所有无法通过对象的获取方法获取

                // json数据 -> 对象数 (手动转换)
                let person = JSON.parse(xhr.response);
                console.log(person) // {name: 'sun', age: 18}
                console.log(person.name) // sun; 因为已经转成了对象类型的数据,所有可以直接获取其属性的值
            }
        }
    });
</script>

<script>
    let btn2 = document.querySelector('#btn2');
    btn2.addEventListener('click', function () {
        let xhr = new XMLHttpRequest()
        // 设置响应体的数据的类型为json格式的
        xhr.responseType = 'json'
        xhr.open('POST', 'http://127.0.0.1:9999/server')
        xhr.send()
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                // 在上面设置了响应体的数据类型为json格式的,就无需再手动将json数据转成对象数据了,这边获取到的就直接是对象格式的
                console.log(xhr.response) // {name: 'sun', age: 18}
                console.log(xhr.response.name) // sun
            }
        }
    });
</script>
```

```js
/*
    基本类型的数据,可以直接响应

    对象类型的数据,直接响应是不行的,我们可以将对象转成json格式的数据,进行传递
 */

const express = require('express')
const app = express()

app.all('/server', (req, res) => {
    // 设置响应头,允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*')

    // 准备一个对象
    let person = {
        name: 'sun',
        age: 18
    }

    // 对象数据 -> json数据
    let str = JSON.stringify(person);

    // 响应json数据
    res.send(str)
})

app.listen('9999', () => {
    console.log('server is running')
})
```

# ie缓存机制

```html
<button id="btn1">发送请求1</button>

<script>
    let btn1 = document.querySelector('#btn1');
    btn1.addEventListener('click', function () {
        let xhr = new XMLHttpRequest()
        /*
            因为ie浏览器有缓存机制,当发送相同的get请求,他会把原先缓存的数据拿来,不会去再访问一次
                * 当服务端响应的数据为'10', 浏览器第一次请求'http://127.0.0.1:9999/server',获取到数10,并且将数据'10'做一次缓存
                * 当服务端响应的数据为'20', 浏览器第二次请求'http://127.0.0.1:9999/server',ie浏览器会检测到与上一次请求相同,就从缓存里将原先的数据拿出来
            针对这个ie缓存机制,我们可以每次都发送不同的请求,搭配 url传参,时间戳 实现,这样就能避免ie缓存机制,每次都会重新去请求服务器
                * 当服务端响应的数据为'10', 浏览器第一次请求'http://127.0.0.1:9999/server?t=1645945217543',获取到数10,并且将数据'10'做一次缓存
                * 当服务端响应的数据为'10', 浏览器第二次请求'http://127.0.0.1:9999/server?t=1645945217590',因为与上一次请求的url路径不同,所以会重新发起请求,获取到数据20,并且将数据'20'做一次缓存

            实际工作中,我们都采用了框架,不需要我们去亲自加时间戳,直接输入想要访问的url地址即可
         */

        xhr.open('POST', 'http://127.0.0.1:9999/server?t=' + Date.now())
        xhr.send()
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                console.log(Date.now()) // 1645945217543
                console.log(xhr.response)
            }
        }
    });
</script>
```

# 请求超时,请求失败处理

```html
<!--
	有可能服务器压力比较大,处理起来比较慢,所以会出现请求了很久,但是没有响应的情况,这就需要做出响应的处理

	当用户的网络出现了异常,我们也需要对此做出响应的处理
-->

<button id="btn1">发送请求1</button>

<script>
    let btn1 = document.querySelector('#btn1');
    btn1.addEventListener('click', function () {
        let xhr = new XMLHttpRequest()
        // 设置 请求后,服务端超时2s没有响应数据,就取消请求
        xhr.timeout = 2000
        // 超时后的回调函数
        xhr.addEventListener('timeout', () => {
            alert('请求超时,请稍后重试')
        })
        // 请求失败后的回调函数,比如: 断网,网络异常
        xhr.addEventListener('error', () => {
            alert('你的网络出现了问题')
        })

        xhr.open('POST', 'http://127.0.0.1:9999/server')
        xhr.send()
        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                console.log(xhr.response)
            }
        })
    });
</script>
```

```js
const express = require('express')
const app = express()

app.all('/server', (req, res) => {
    // 设置响应头,允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*')

    // 模拟延迟响应的效果
    setTimeout(() => {
        res.send('hello world')
    }, 3000)
})

app.listen('9999', () => {
    console.log('server is running')
})
```

# 手动取消请求

![image-20220227153420791](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311444041.png)

```html
<!--
	上面的xhr.timeout=2000设置,是超时了2s后,自动取消请求

	可以通过xhr.abort()手动取消刚才发送的请求

	在浏览器的开发者工具里的network里可以看到请求取消了的信息
-->

<button>发送请求</button>
<button>取消请求</button>

<script>    
    let btns = document.querySelectorAll('button')

    let xhr = null
    
    btns[0].onclick = function () {
        xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://127.0.0.1:9999/server')
        // 发送请求
        xhr.send()
        // 处理请求
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                console.log(xhr.response)
            }
        }
    }

    btns[1].onclick = function () {
        // 取消请求
        xhr.abort()
    }
</script>
```

```js
const express = require('express')
const app = express()

app.all('/server', (req, res) => {
    // 设置响应头,允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*')

    // 模拟延迟响应的效果
    setTimeout(() => {
        res.send('hello world')
    }, 3000)
})

app.listen('9999', () => {
    console.log('server is running')
})
```

# 重复请求处理

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311444042.png)

```html
<!--
    当重复发送请求的时候,我们可以将上一次的请求取消掉,然后发送新的请求,这样就不会出现请求积压的情况
-->

<button>发送请求</button>

<script>
    let btn = document.querySelector('button')
    let xhr = null
    // 创建一个标识变量,用于判断,是否正在发送请求(即节流阀的使用)
    let isSending = false

    btn.onclick = function () {
        // 如果正在发送请求,就取消上一次请求,然后创建最新的请求
        if (isSending) {
            xhr.abort()
        }
        // 设置isSending=true,表示正在处理请求
        isSending = true

        // 创建新的xml对象,发送新的请求
        xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://127.0.0.1:9999/server')
        xhr.send()
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                console.log(xhr.response)
                // 设置isSending=false,表示请求已经处理完毕,可以去处理下一次请求了
                isSending = false
            }
        };
    };
</script>
```

```js
const express = require('express')
const app = express()

app.all('/server', (req, res) => {
    // 设置响应头,允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*')

    // 模拟延迟响应的效果
    setTimeout(() => {
        res.send('hello world')
    }, 3000)
})

app.listen('9999', () => {
    console.log('server is running')
})
```

# JQuery发送AJAX请求

```html
<button>发送get请求</button>
<button>发送post请求</button>
<button>通用方法,发送ajax请求</button>

<!--引入jquery-->
<script src="jquery.min.js"></script>
<script>
    $('button').eq(0).click(function () {
        // 发送get请求,参数传递为url传参
        $.get('http://127.0.0.1:9999/jquery-server', {username: 'sun', password: 123}, function (data) {
            // data是服务端响应的数据
            console.log(data) // {"name":"sun","age":18}; 收到的是json格式的数据,需要通过JSON.parse()转成对象类型的数据
        });
    });

    $('button').eq(1).click(function () {
        // 发送post请求,参数放在请求体里,不通过url传参
        $.post('http://127.0.0.1:9999/jquery-server', {username: 'sun', password: 123}, function (data) {
            console.log(data) // {name: 'sun', age: 18}; 收到的是对象格式的数据
        }, 'json'); // 设置响应体数据的类型为json格式的,这样data收到的json数据就会自动转成对象格式的数据
    });

    $('button').eq(2).click(function () {
        // 通用发放,发送ajax请求
        $.ajax({
            // 要请求的url路径
            url: 'http://127.0.0.1:9999/jquery-server',
            // 参数传递,
            // * 如果是get请求,就是url传参
            // * 如果是post请求,就是请求体传参
            data: {username: 'sun', password: 123},
            // 请求方式
            type: 'GET',
            // 响应体结果的设置
            dataType: 'json',
            // 访问成功后的回调函数
            success: function (data) {
                console.log(data) // {name: 'sun', age: 18}; 因为设置了响应体的数据的类型为json格式,所以这里收到的数据就是自动转成了对象格式的数据
            },
            // 设置超时时间
            timeout: 2000,
            // 请求失败后的回调函数, 比如: 请求超时,网络异常,断网
            error: function () {
                console.log('错误')
            },
            // 设置请求头信息
            headers: {
                // 设置自定义请求头, 需要在后端设置响应头res.setHeader('Access-Control-Allow-Headers', '*'),这样才不会对自定义请求头报错
                myName: 'sun',
                myAge: 18
            }
        })
    });
</script>
```

```js
const express = require('express')
const app = express()

app.all('/jquery-server', (req, res) => {
    // 设置响应头,允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*')
    // 设置允许自定义的请求头
    res.setHeader('Access-Control-Allow-Headers', '*')
    // 准备一个对象类型的数据
    let person = { name: 'sun', age: 18}
    // 按照json格式传递对象类型的数据
    res.send(JSON.stringify(person))

})

app.listen('9999', () => {
    console.log('server is running')
})
```

# Axios

```html
<!--
    Axios是对原生的AJAX进行封装,简化书写的工具包,Axios官网是：https://www.axios-http.cn

    Axios已经为所有支持的请求方法提供了别名
        * get请求: axios.get(url[,config])
        * post请求: axios.post(url[,data[,config])
        * delete请求: axios.delete(url[,config])
        * head请求: axios.head(url[,config])
        * options请求: axios.option(url[,config])
        * put请求: axios.put(url[,data[,config])
        * patch请求: axios.patch(url[,data[,config])
-->

<button>发送get请求</button>
<button>发送post请求</button>
<button>通用方法,发送ajax请求</button>

<!--引入axios, 如果担心报跨域警告,可以加上属性 crossorigin="anonymous" -->
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js" crossorigin="anonymous"></script>
<script>
    let btns = document.querySelectorAll('button');
    
    btns[0].onclick = function () {
        // 发送get请求
        axios.get('http://127.0.0.1:9999/axios-server', {
            // url传参
            params: {
                username: 'sun',
                password: 123
            },
            // 请求头信息
            headers: {
                myName: 'sun',
                myAge: 18
            }
        }).then((res) => {
            // 在then()中处理服务器响应的数据
            console.log(res) // {data: {…}, status: 200, statusText: 'OK', headers: {…}, config: {…}, ...}
            console.log(res.data) // {name: 'sun', age: 18}
        })
    };

    btns[1].onclick = function () {
        // 发送post请求,同时设置请求体传参(按照json格式发送参数给后端)
        axios.post('http://127.0.0.1:9999/axios-server', { username: 'sun', password: 123}, {
            // url传参
            params: {
                id: '001'
            },
            // 请求头信息
            headers: {
                height: 100,
                width: 200
            },
        }).then((res) => {
            // 在then()中处理服务器响应的数据
            console.log(res) // {data: {…}, status: 200, statusText: 'OK', headers: {…}, config: {…}, ...}
            console.log(res.data) // {name: 'sun', age: 18}
        })
    };

    btns[2].onclick = function () {
        axios({
            // 请求方式
            method: 'post',
            // 要请求的url路径
            url: 'http://127.0.0.1:9999/axios-server',
            // url传参
            params: {
                id: '007'
            },
            // 请求头信息
            headers: {
                myName: 'sun',
                myAge: 18
            },
            // 请求体传参
            data: {
                username: 'sun',
                password: 123
            }
        }).then((res) => {
            // 在then()中处理服务器响应的数据
            console.log(res) // {data: {…}, status: 200, statusText: 'OK', headers: {…}, config: {…}, ...}
            console.log(res.data) // {name: 'sun', age: 18}
        })
    };
</script>
```

```js
const express = require('express')
const app = express()

app.all('/axios-server', (req, res) => {
    // 设置响应头,允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*')
    // 设置允许自定义的请求头
    res.setHeader('Access-Control-Allow-Headers', '*')
    // 准备一个对象类型的数据
    let person = { name: 'sun', age: 18}
    // 按照json格式传递对象类型的数据
    res.send(JSON.stringify(person))
})

app.listen('9999', () => {
    console.log('server is running')
})
```

# fetch()

```html
<!--
    fetch()也是用于发送ajax请求的一个函数,是一个全局函数,可以直接调用,不需要引入别的包
-->

<button>发送ajax请求</button>

<script>
    let btn = document.querySelector('button');
    btn.onclick = function () {
        fetch('http://127.0.0.1:9999/fetch-server', {
            // 请求方式
            method: 'POST',
            // 请求头信息
            headers: {
                myName: 'sun'
            },
            // 请求体
            body: 'username=sun&password=123'
        }).then((res) => {
            /*
                因为是返回的一个Promise,所以需要再return,通过then()来获取值
                    * res.text() 返回浏览器响应的数据
                    * res.json() 将json数据转成对象形式返回
             */
            return res.json()
        }).then((data) => {
            console.log(data) // {name: 'sun', age: 18}
        })
    };
</script>
```

```js
const express = require('express')
const app = express()

app.all('/fetch-server', (req, res) => {
    // 设置响应头,允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*')
    // 设置允许自定义的请求头
    res.setHeader('Access-Control-Allow-Headers', '*')
    // 准备一个对象类型的数据
    let person = { name: 'sun', age: 18}
    // 按照json格式传递对象类型的数据
    res.send(JSON.stringify(person))
})

app.listen('9999', () => {
    console.log('server is running')
})
```

# 跨域

## 同源策略

```js
/*
    同源策略(Same-Origin Policy)最早由Netscape公司提出,是浏览器的一种安全策略(AJAX是默认遵循同源策略的)
        * 协议、域名、端口号必须完全相同,这才满足同源策略
        * 比如: 当前目录url为http://182.142.145.11:8080,我们想要发送请求,那么url也必须为http://182.142.145.11:8080
    违背同源策略就是跨域
    
    浏览器访问"http://localhost:9999/home",服务器响应index.html页面到浏览器,然后我们点击index.html页面的button按钮,再像服务器发送请求,获取数据,此时就满足同源策略
    
    我们之前在webstorm开启的服务器上访问了index.html页面,然后向服务器"http://localhost:9999"发送请求,明显这就是跨域了
*/
const express = require('express')
const app = express()

app.get('/home', (req, res) => {
    // 响应一个页面
    res.sendFile(__dirname + '/index.html')
})

app.get('/data', (req, res) => {
    res.send('用户数据...')
})

app.listen('9999', () => {
    console.log('server is running')
})
```

```html
<button>发送ajax请求,获取数据</button>

<script>
    let btn = document.querySelector('button');
    btn.onclick = function () {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/data');
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                console.log(xhr.response);
            }
        };
    };
</script>
```

## JSONP解决跨域

### JSONP原理

```html
<!--
    在网页中,有一些标签本身就具有跨域的能力
        * 比如: link, img, iframe, script
        * 比如: 我们通过script跨域引入一个的js文件 <script src="http://localhost:63342/ajax/demo01/app.js"></script>
	这个方法,只能发送get请求,因为这些标签发送的就是get请求
-->

<!--通过script,向服务器发送一个跨域的请求,是可以实现的-->
<script src="http://127.0.0.1:9999/jsonp-server"></script>
```

```js
const express = require('express')
const app = express()

app.get('/jsonp-server', (req, res) => {
    //
    /*
        不能直接通过res.send()响应数据给浏览器,因为script请求的是js表达式
            res.send('hello world') // error
        所以我们可以发送一些js表达式到浏览器,比如: console.log()
     */
    res.send('console.log("hello world")')
})

app.listen('9999', () => {
    console.log('server is running')
})
```

### JSONP实践

```html
<button>点我发送请求</button>
<p></p>

<script>
    let btn = document.querySelector('button');
    let p = document.querySelector('p');

    // 编写handle()函数,由script跨域请求到的js表达式来调用
    function handle(data) {
        // data直接就是对象格式的数据,而不是json格式的,所以可以直接使用
        console.log(data) // {name: 'sun'}
		
        // 插入数据到标签内
        p.innerHTML = data.name;
    }

    btn.onclick = function () {
        // 创建一个script标签,设置src为要请求的路径,然后将该script标签插入到页面中,让其生效
        let script = document.createElement('script');
        script.src = 'http://127.0.0.1:9999/jsonp-server';
        document.body.append(script)
    };
</script>
```

```js
const express = require('express')
const app = express()

app.get('/jsonp-server', (req, res) => {
    // 准备数据
    let person = {name: 'sun'}
    let str = JSON.stringify(person);
    // 响应一个js表达式,调用handle方法,传入参数str
    res.end(`handle(${str})`)
})

app.listen('9999', () => {
    console.log('server is running')
})
```

### JSONP发送jsonp请求

```html
<button>点我发送请求</button>
<p></p>

<!--引入jquery-->
<script src="jquery.min.js"></script>
<script>
    $('button').click(function () {
        // 设置url路径的时候,要注意添加一个参数"callback=?"
        $.getJSON('http://127.0.0.1:9999/jquery-jsonp-server?callback=?', function (data) {
            // data直接就是对象格式的数据,而不是json格式的,所以可以直接使用
            console.log(data) // {name: 'sun'}
            
            // 插入数据到标签内
            $('p').html(`${data.name}`)
        });
    });
</script>
```

```js
const express = require('express')
const app = express()

app.get('/jquery-jsonp-server', (req, res) => {
    let person = {name: 'sun'}
    let str = JSON.stringify(person);
    // 通过req.query获取url参数中设置的callback
    let callback = req.query.callback;
    // 返回js表达式,调用函数,即callback(str)
    res.end(`${callback}(${str})`)
})

app.listen('9999', () => {
    console.log('server is running')
})
```

## CORS解决跨域

```js
/*
    CORS(Cross-Origin Resource Sharing),跨域资源共享,是官方的跨域解决方案
    它的特点是不需要在客户端做任何特殊的操作,完全在服务器中进行处理,支持get和post请求,只需要添加一个响应头,就可以完成跨域的设置
        // 设置所有的url地址,都可以向本服务器发送请求
        res.setHeader('Access-Control-Allow-Origin', "*")
        // 设置"http://127.0.0.1:5000"地址,可以向本服务器发送请求
        res.setHeader('Access-Control-Allow-Origin', "http://127.0.0.1:5000")
 */

const express = require('express')
const app = express()

app.get('/jquery-jsonp-server', (req, res) => {
    // 设置允许跨域请求
    res.setHeader('Access-Control-Allow-Origin', "*")

    let person = {name: 'sun'};
    let str = JSON.stringify(person);
    res.end(str);
})

app.listen('9999', () => {
    console.log('server is running')
})
```









