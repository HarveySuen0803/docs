# Info

* Promise是js中进行异步编程的新解决方案

  * 之前我们解决异步编程,都是采用回调函数的形式

    ```js
    // 异步操作有: fs文件操作, ajax操作, 定时器, 数据库操作 ...
    
    // fs文件操作
    require("fs").readFile("./index.html", (err, data) => {
        // ...
    })
    
    // AJAX操作
    $.get("/server", (data) => {
        // ...
    })
    
    // 定时器
    setTimeout(() => {
        // ...
    }, 2000)
    ```

* 我们可以通过Promise,将异步代码看作是同步代码来编写,非常的巧妙

* Promise支持链式编程,可以解决回调地狱问题

  * 回调地狱: 一个回调函数中套装另一个回调函数

    ```js
    func1(opt, (...args1) => {
        func2(opt, (...args2) => {
            func3(opt, (...arg3) => {
                func4(opt, (...arg4) => {
                    // ...
                })
            })
        })
    })
    ```

  * 回调地狱非常不便于阅读,不便于异常操作

# 快速入门

```html
<button id="btn">点我num++</button>

<script>
    let count = 0;
    const btn = document.querySelector("#btn");
    btn.addEventListener("click", () => {
        // 判断count的值,如果为偶数,就判断成功
        count++;

        /*
            创建一个promise对象,向构造器中传入一个回调函数,这个回调函数就是 "执行器"(executor)
            	executor在Promise内部立即同步调用,异步操作在执行器中执行
            
            它还能接受两个参数: resolve, reject
                * resolve() 成功后调用该函数,将promise对象的状态设置为"成功"
                * reject() 失败后调用该函数,将promise对象的状态设置为"失败"
         */
        const promise = new Promise((resolve, reject) => {
            // 将异步代码放入该回调函数内
            setTimeout(() => {
                if (count % 2 == 0) {
                    resolve(count); // 判断成功,调用resolve(),并且传递参数
                } else {
                    reject(count); // 判断失败,调用reject(),并且传递参数
                }
            }, 500)
        })

        /*
        	当promise对象的状态发生变化(即调用resolve()和reject()改成状态的时候),就会执行这里的then() 
        	
        	promise.then( (value) => {}, (reason) => {} )
                * 第一个回调函数是对 成功状态 的处理
                * 第二个回调函数是对 失败状态 的处理, reason表示理由,即失败的理由
                
            注意: then()会返回一个新的Promise对象,所以我们还可以在后面接then(),即链式编程
            	即 promise.then(() => {}, () => {}).then(() => {})...
         */
        promise.then((value) => {
            console.log("判断成功, count为偶数, n = " + value);
        }, (reason) => {
            console.log("判断失败, count为奇数, n = " + reason);
        })
    })
</script>
```

# fs读取文件

```js
// 原先通过回调函数处理fs读取模块
const fs = require("fs");
fs.readFile("./resource/content.txt", (err, data) => {
    if (err) {
        console.log(err);
        return ;
    }
    console.log(data.toString());
})

// 使用Promise封装fs读取模块
const promise = new Promise((resolve, reject) => {
    fs.readFile("./resource/content.txt", (err, data) => {
        if (err) {
            reject(err); // 失败的回调,并且传入err信息
            // 执行到reject()就会跳出该函数,就不需要return了
        }
        resolve(data); // 成功的回调,并且传入读取到的数据
    })
})

promise.then((value) => {
    console.log(value.toString());
}, (reason) => {
    console.log(reason);
})
```

# ajax操作

```html
<button id="btn1">获取段子1</button>
<button id="btn2">获取段子2</button>

<script>
    const btn1 = document.querySelector("#btn1");
    btn1.addEventListener("click", () => {
        // 原先通过回调函数处理ajax操作
        let xhr = new XMLHttpRequest()
        xhr.open('GET', 'https://api.uixsj.cn/hitokoto/get')
        xhr.send()
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    console.log(xhr.response); // 成功时,输出获取到的数据
                } else {
                    console.log(xhr.status); // 失败时,输出状态码
                }
            }
        }
    })

    const btn2 = document.querySelector("#btn2");
    btn2.addEventListener("click", () => {
        // 使用Promise封装ajax操作
        const promise = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest()
            xhr.open('GET', 'https://api.uixsj.cn/hitokoto/get')
            xhr.send()
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response); // 成功时,调用resolve(),并且传入获取到的数据
                    } else {
                        reject(xhr.status); // 失败时,调用reject(),并且传入状态码,描述失败的信息
                    }
                }
            }
        });

        promise.then((value) => {
            console.log(value);
        }, (reason) => {
            console.warn(reason);
        })
    })
</script>
```

# Promise封装fs操作

```js
function myReadFile(path) { // 接受一个path参数,表示要读取的文件的路径
    // 返回一个Promise对象
    return new Promise((resolve, reject) => {
        require("fs").readFile(path, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        })
    })
}

myReadFile("./resource/content.txt").then((value) => {
    console.log(value.toString());
}, (reason) => {
    console.log(reason)
})
```

# util.promisify()封装fs操作

```js
/*
    util.promisify()可以帮助我们封装fs的操作,他返回的是一个Promise的版本
        就相当于我们上面手动封装的myReadFile(),只不过这里不需要我们再去手动封装了
 */

const fs = require('fs');
const util = require('util');
fs.
let readFilePromise = util.promisify(fs.readFile); // 返回一个内部含有fs.readFile()的Promise对象
let writeFilePromise = util.promisify(fs.writeFile); // 返回一个内部含有fs.writeFile()的Promise对象
let appendFilePromise = util.promisify(fs.appendFile); // fs.appendFile()是异步的追加写入方法

/*
    使用 readFilePromise() 读取文件]
    
    同时可以指定 编码格式为 'utf-8', 这样读取到的数据,就不需要再通过toString()转换了
        readFilePromise(filePath1, 'utf-8')
 */
let promise = readFilePromise("./resource/content.txt");
promise.then((value) => {
    console.log(value.toString());
}, (reason) => {
    console.log(reason);
})

// 使用 writeFilePromise() 写入内容到文件中
writeFilePromise("./resource/dest.tx", "你好世界").then(() => {
    console.log("写入成功");
})

// 使用 appendFilePromise() 追加内容到文件中
// ...
```

# Promise封装ajax操作

```html
<button id="btn">获取段子</button>

<script>
    // 封装一个发送ajax请求的函数(Promise版)
    function sendAJAX(url) {
        // 返回一个Promise对象
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url); // 传入url地址
            xhr.send();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response); // 成功时的回调
                    } else {
                        reject(xhr.status); // 失败时的回调
                    }
                }
            }
        })
    }

    const btn = document.querySelector("#btn");
    btn.addEventListener("click", () => {
        // 获取promise对象
        const promise = sendAJAX("https://api.uixsj.cn/hitokoto/get");
        // 调用then()
        promise.then((value) => {
            console.log(value);
        }, (reason) => {
            console.warn(reason);
        });
    })
</script>
```

# Promise的属性

```html
<!--
    Promise对象中有两个比较重要的属性: PromiseState, PromiseResult 
        * PromiseState
            * 它的属性值表示: 对象当前的状态
                * pending : 未决定的
                * resolved 或 fullfilled : 成功
                * rejected : 失败
            * 状态变化
                * 状态只变化一次
                * 状态能从pending ->resolved/rejected,不能从resolved -> rejected
                    * pending -> resolved √
                    * pending -> rejected √
                    * resolved -> rejected ×
                    * rejected -> resolved ×
        * PromiseResult
            * 它的属性值表示: 异步任务 成功/失败 的结果
            * 是由 resolve(), reject() 传入的参数决定的
-->

<button id="btn">点我</button>

<script>
    let flag = true;
    const btn = document.querySelector("#btn");
    btn.addEventListener("click", () => {
        flag = !flag;

        const promise = new Promise((resolve, reject) => {
            if (!flag) {
                reject("失败");
            }
            resolve("成功");
        });

        console.log(promise);
            /*
                // 成功时输出的内容
                Promise {<fulfilled>: '成功'}
                [[Prototype]]: Promise
                [[PromiseState]]: "fulfilled" // 表示当前Promise的状态
                [[PromiseResult]]: "成功" // 表示当前Promise的处理异步任务的结果,值就是resolve("成功")里传递的参数值

                // 失败时输出的内容
                Promise {<rejected>: '失败'}
                [[Prototype]]: Promise
                [[PromiseState]]: "rejected"
                [[PromiseResult]]: "失败"
             */

        promise.then((value) => {
            console.log(value);
        }, (reason) => {
            console.log(reason);
        });
    })
</script>
```

# Promsie的状态改变

```js
// pending -> fullfilled/resolved
let p1 = new Promise((resolve, reject) => {
    // 调用resolved(),改变当前Promise对象的状态
    resolve("Success");
})

// pending -> rejected
let p2 = new Promise((resolve, reject) => {
    // 调用rejected(),改变当前Promise对象的状态
    reject("Error");
})

// pending -> rejected
let p3 = new Promise((resolve, reject) => {
    // 抛出异常,改变当前Promise对象的状态
    throw "Exception";
})
console.log(p3);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "rejected"
        [[PromiseResult]]: "Exception"
     */
```

# catch(),finally()

```js
const promise = new Promise((resolve, reject) => {
    reject("error");
})

// catch()就是捕获"失败"的回调函数 (类似于then()的第二个回调函数)
promise.catch((reason) => {
    console.log(reason); // "error"
})

// 不管成功或者失败都会执行finally()
promise.finally(() => {
    console.log("hello world");
})

// catch()和finally()的混合使用
p1.then((value) => {
    console.log(value);
}).catch((reason) => { // 通过catch()来捕获 异常 和 失败的Promise对象
    console.log(reason);
}).finally(() => { // 通过finally()来执行一些收尾的操作,一般为释放资源
    console.log("释放资源");
});
```

# Promise.resolve()

```js
/*
	Promise.resolve() 可以快速返回一个成功的Promise对象
		比如: let p = Promise.resolve("hello world"); // 此时就得到了一个成功的Promise对象,PromsieResult的值就是"hello world"
    Promise.resolve() 可以接受一个value或Promise对象
         * 如果接受一个 非Promise对象,则返回的结果为一个成功的Promise对象
         * 如果接受一个 Promise对象,则返回的结果由我们在Promise对象中调用的方法决定
            * 调用resolve(),返回一个成功的Promise对象
            * 调用reject(),返回一个失败的Promise对象
*/

let p1 = Promise.resolve("hello world");
console.log(p1);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "fulfilled"
        [[PromiseResult]]: "hello world"
     */

let p2 = Promise.resolve(new Promise((resolve, reject) => {
    resolve("success");
}))
console.log(p2);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "fulfilled"
        [[PromiseResult]]: "success"
     */

let p3 = Promise.resolve(new Promise((resolve, reject) => {
    reject("error");
}))
console.log(p3);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "rejected"
        [[PromiseResult]]: "error"
     */

/*
    // 此时会报错: "Uncaught (in promise) error"
    // 这是因为有一个失败状态的Promise对象,但我们没有对失败进行处理,我们这样编写就不会出错了
        p3.catch((reason) => {
            console.log(reason);
        })
 */
```

# Promise.reject()

```js
/*
    Promise.reject() 可以快速返回一个失败的Promise对象

    不管向Promise.reject()中传入什么,返回的都是一个失败的Promise对象,并且返回的结果就是参数值
        这个用法和Promise.resolve()有很大的区别
*/

let p1 = Promise.reject("error");
console.log(p1);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "rejected"
        [[PromiseResult]]: "error"
     */

let p2 = Promise.reject(new Promise((resolve, reject) => {
    resolve("success");
}))
console.log(p2);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "rejected" // 即使调用的是resolve(),但是返回的依旧是一个失败的Promise对象
        [[PromiseResult]]: Promise // 这里的值就是传入的Promise.reject()中的Promise对象
        
        // 即,这里的Promise.reject()返回了一个失败的Promise对象,这个Promise对象的值就是一个成功的Promise对象
     */
```

# Promise.all()

```js
/*
    Promise.all()可以包含多个Promise对象,返回一个新的Promise对象
*/

// 全部的Promise对象都为成功,返回的结果才是一个成功的Promise对象
let p1 = Promise.resolve("p1 success");
let p2 = Promise.resolve("p2 success");
let p3 = Promise.resolve("p3 success");
const result1 = Promise.all([p1, p2, p3]);
console.log(result1);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "fulfilled" // 这里所有的Promise对象都是成功的,返回的就是一个成功的Promise对象
        [[PromiseResult]]: Array(3) // 返回的结果是一个数组,数组里包含着所有成功的Promise对象
            0: "p1 success"
            1: "p2 success"
            2: "p3 success"
            length: 3
            [[Prototype]]: Array(0)
     */

// 包含的Promise对象中,只要有一个是失败的,返回的结果就是一个失败的Promise对象
let p4 = Promise.resolve("p1 success");
let p5 = Promise.resolve("p2 success");
let p6 = Promise.reject("p3 error");
const result2 = Promise.all([p4, p5, p6]);
console.log(result2);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "rejected" // 这里只有p6是失败的Promise对象,返回的就是一个失败的Promise对象
        [[PromiseResult]]: "p3 error // 返回的结果就是p6的值
     */
```

# Promsie.race()

```js
/*
    Promise.race() 和 Promise.all() 一样,可以包含多个Promise对象,返回一个新的Promise对象,结果为第一个改变状态的Promise对象的值 (不理解就看案例)
*/

// p1在1s后,状态发生变化: pending -> fullfilled
let p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("p1 success");
    }, 1000);
})

// p2在2s后,状态发生变化: pending -> rejected
let p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject("p2 error");
    }, 2000);
})

// p3在3s后,状态发生变化: pending -> fullfilled
let p3 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("p3 success");
    }, 3000);
})

// 因为p1,先发生变化,所以Promise.race()就返回一个成功的Promise对象,结果为p1的值
let result = Promise.race([p1, p2, p3]);
console.log(result);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "fulfilled"
        [[PromiseResult]]: "p1 success"
     */
```

# Promise.allSettles()

```js
let p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject("p1 error");
    })
})

let p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("p2 success");
    })
})

let p3 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject("p3 error");
    })
})

// Promise.allSettled()始终返回一个成功的Promise对象,返回结果是一个将p1,p2,p3的返回结果封装起来的数组
let result = Promise.allSettled([p1, p2, p3]);
console.log(result);
    /*
        Promise {<pending>}
            [[Prototype]]: Promise
            [[PromiseState]]: "fulfilled"
            [[PromiseResult]]: Array(3)
                0: {status: 'rejected', reason: 'p1 error'}
                1: {status: 'fulfilled', value: 'p2 success'}
                2: {status: 'rejected', reason: 'p3 error'}
                length: 3
                [[Prototype]]: Array(0)
    */
```

# Promise执行多个then()

```js
/*
    一个Promise对象可以指定多个then(),只要该Promise对象的状态一发生变化,就会执行全部的then()
 */

let p = new Promise((resolve, reject) => {
    resolve("p success")
})

p.then((value) => {
    console.log("1 " + value);
});
p.then((value) => {
    console.log("2 " + value);
});
p.then((value) => {
    console.log("3 " + value);
});
    /*
        1 p success
        2 p success
        3 p success
     */
```

# then()的指定顺序

```js
/*
    注意: 我们这里是研究的then()的指定顺序,而不是执行顺序
        * then()的指定顺序, 要根据不同情况而定的
        * then()的执行顺序, 一直都是Promise对象状态发生改变后,执行then()的代码
 */

// 此时执行器(executor())中,是一堆同步代码,是先发生状态改变,后指定then(),然后执行then()的代码
let p1 = new Promise((resolve, reject) => {
    resolve("p1 success");
})
p1.then((value) => {
    console.log(value);
});

// 此时执行器中,放的是异步代码,就是先指定then(),后发生状态改变,然后执行then()的代码
let p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("p2 success")
    }, 1000)
})
p2.then((value) => {
    console.log(value);
})
```

# then()的返回值 !!!

```js
let p = new Promise((resolve, reject) => {
    resolve("p success");
})

// 返回一个成功的Promise对象,结果为"undefined" (因为我们没有指定return,所以结果就是"undefined")
let result1 = p.then((value) => {
    console.log(value); // p success
})
console.log(result1);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "fulfilled"
        [[PromiseResult]]: undefined
     */

// 返回一个成功的Promise对象,结果为"hello world"
let result2 = p.then((value) => {
    return "hello world";
})
console.log(result2);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "fulfilled"
        [[PromiseResult]]: "hello world"
     */

// 返回return中,我们自己定义的Promise对象
let result3 = p.then((value) => {
    // 返回一个Promise对象
    return new Promise((resolve, reject) => {
        reject("i am iron man");
    })
})
console.log(result3);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "rejected"
        [[PromiseResult]]: "i am iron man"
     */

// 返回一个失败的Promise对象,结果为我们抛出的异常的内容
let result4 = p.then((value) => {
    // 抛出异常
    throw "Exception";
})
console.log(result4);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "rejected"
        [[PromiseResult]]: "Exception"
     */
```

# Promise的链式编程

```js
let p1 = new Promise((resolve, reject) => {
    resolve("p1 success");
})
let p2 = new Promise((resolve, reject) => {
    resolve("p2 success");
})

// 因为then()返回的是一个新的Promise对象,所以我们可以再使用then()进行链式编程
p1.then((value) => {
    console.log(value); // "p1 success"
    return p2;
}).then((value) => {
    console.log(value); // "p2 success"
}).then((value) => {
    // 因为上一个then(),没有return一个值,所以就是默认返回一个成功的Promise对象
    // 然后该Promise对象的PromiseResult属性的值就是"undefined",我们这里的value就是获取PromiseResult属性值,即"undefined"
    console.log(value); // "undefined"; 
});
```

# catch()的异常穿透处理

```js
let p1 = new Promise((resolve, reject) => {
    resolve("p1 success"); // 成功
})
let p2 = new Promise((resolve, reject) => {
    reject("p2 error"); // 失败
})
let p3 = new Promise((resolve, reject) => {
    resolve("p3 success"); // 成功
})

/*
    当p1,p2,p3进行链式编程的时候,我们不需要针对每一个Promise对象都进行 (reason) => {} 或 catch() 处理,只需要再最后通过链式编程,直接一个catch()即可,通过catch()来捕获异常
        处理逻辑和java中的异常try-catch处理机制一样
 */
p1.then((value) => { // p1的then()正常执行
    console.log(value); // p1 success
    // 返回一个失败的Promise对象p2
    return p2;
}).then((value) => { // 执行then(),发现是失败的Promise对象,被catch()捕获,进入到catch()
    console.log(value); // 不输出
    return p3;
}).then((value) => { // 因为在p2的then()处理中,就被catch()捕获了,就不会再执行后面的代码了
    console.log(value); // 不输出
}).catch((reason) => { // 通过catch()来捕获前面几个then()中的异常处理
    console.warn(reason); // p2 error
})
```

# 中断Promise链

```js
let p = new Promise((resolve, reject) => {
    resolve("p success");
})

p.then((value) => {
    console.log("one");
    // 想要中断Promise链,就需要返回一个状态为pending的Promise对象,这样就不会执行下面的then() 
    // 因为then()是要在Promise对象的状态变化后,才会执行then()
    return new Promise(() => {}); 
}).then((value) => {
    console.log("two");
}).then((value) => {
    console.log("three")
}).catch((reason) => {
    console.log(reason);
})
```

# 自定义Promise

```js
class Promise {
    // Promise类的构造器
    constructor(executor) {
        // 添加属性到该Promise对象身上
        this.PromiseState = "pending";
        this.PromiseResult = null;
        // 用于保存onResolved()和onRejected()
        this.callbacks = [];
        // 保存this,解决作用域问题
        const self = this;

        // resolve()函数
        function resolve(value) {
            // 这里的this是指向的window,需要使用在外面保存的self

            // 如果不是pending就退出,为了确保只修改一次Promise的状态
            if (self.PromiseState !== "pending")
                return;
            // 修改状态和值
            self.PromiseState = "fullfilled";
            self.PromiseResult = value;

            // 将下面这段代码变成异步代码
            setTimeout(() => {
                // 执行异步代码的回调函数(当状态发生变化的时候执行)
                // 遍历callbacks,执行里面所有的onResolved()
                self.callbacks.forEach((item) => {
                    item.onResolved(self.PromiseResult);
                })
            })
        }

        // reject()函数
        function reject(reason) {
            if (self.PromiseState !== "pending")
                return;

            self.PromiseState = "rejected";
            self.PromiseResult = reason;

            setTimeout(() => {
                self.callbacks.forEach((item) => {
                    item.onRejected(self.PromiseResult);
                })
            })
        }

        // 通过try-catch将executor包裹起来,为了处理throw抛出异常
        try {
            // 同步调用,执行器
            executor(resolve, reject);
        } catch (e) {
            // 调用reject()
            reject(e);
        }
    }

    // Promise对象的then(), 需要使用p.then()调用
    then(onResolved, onRejected) {
        // 保存this,解决作用域问题
        const self = this;

        /*
            一个问题:
                我们调用then()时,只处理了成功的Promise,没有处理失败的Promise,然后最后通过catch()处理失败的Promise
                    p.then((value) => {
                        console.log("1");
                    }).then((value) => {
                        console.log("2");
                    }).then((value) => {
                        console.log("3");
                    }).catch((reason) => {
                        console.log("error");
                    })
                因为没有第二个回调函数,所以默认返回的是一个成功的回调函数,且值为undefined,这就会导致无法触发catch()

            所以我们需要判断是否存在onRejected(),如果没有,就创建一个onRejected(),然后通过抛出异常的方式返回一个失败的Promise,让后面的也能接收到,最后传递到catch(),接收到失败的Promise,做统一的处理
         */
        if (typeof onRejected !== "function") {
            onRejected = (reason) => {
                throw reason;
            }
        }
        /*
            一个问题:
                我们调用then()时,即没有处理成功的Promise,也没有处理失败的Promise
                    // 这里的第一个then(),没有做任何处理
                    p.then().then((value) => {
                    })
                此时的参数onResolved是"undefined",无法调用了,我们需要创建一个onResolved()避免这种问题
         */
        if (typeof onResolved !== "function") {
            onResolved = (value) => {
                return value;
            }
        }

        // 因为then()是会返回一个Promise对象的
        return new Promise((resolve, reject) => {
            // 将 "调用onResolved()和onRejected()回调函数的, 处理then()的返回值" 这些功能封装成一个函数,因为下面有四处都要用着
            // type接受的值就是onResolved和onRejected()
            function callback(type) {
                // 调用onResolved(),并且处理then()的返回值
                try {
                    // 执行onResolved()和onRejected(),并且接受返回值
                    let result = type(self.PromiseResult); // 注意: 这里在function内this会指向window,需要用self指向

                    if (result instanceof Promise) { // 判断回调函数中返回的是Promise对象
                        // 因为这里的result是一个Promise对象,所以我们对其进行then()处理
                        result.then((value) => {
                            // 如果是一个成功的Promise对象,我们需要将value封装成一个成功的Promise对象返回 (这里的value就是Promise对象的PromiseResult属性)
                            // * PromiseResult属性值为 value
                            // * PromiseState属性值为 fullfilled
                            resolve(value);
                        }, (reason) => {
                            // 如果是一个失败的Promise对象,我们需要将value封装成一个失败的Promise对象返回
                            reject(reason);
                        })
                    } else { // 判断回调函数中返回的不是Promise对象
                        /*
                            这里的result不是一个Promise对象

                            根据then()的返回值的规则,我们这里需要将其封装成一个Promise对象,并且返回
                                * PromiseResult属性值为 result
                                * PromiseState属性值为 fullfilled,即一个成功的Promise对象
                         */
                        resolve(result);
                    }
                } catch (e) { // 处理异常
                    // 如果在then()中抛出异常,我们将异常的内容e封装成一个失败的Promise对返回(这个功能和reject()一样,我们直接调用reject()即可)
                    reject(e);
                }
            }

            // 执行同步代码的回调函数,分别处理 "fullfilled" 和 "rejected" 状态
            if (this.PromiseState === "fullfilled") {
                // 因为then()中代码是异步执行的,所以需要通过setTimeout()将下面这段代码变成异步代码
                setTimeout(() => {
                    // 调用onResolved(),并且处理then()的返回值
                    callback(onResolved);
                })

            }
            if (this.PromiseState === "rejected") {
                setTimeout(() => {
                    // 调用onRejected(),并且处理then()的返回值
                    callback(onRejected);
                })
            }

            /*
                因为可能在executor中编写异步代码,可能要过一段时间才会调用resolve()和reject()
                    let p = new Promise((resolve, reject) => {
                        // 这里是通过定时器,过了1s后,才修改了Promise对象的状态,此时的状态为pending
                        setTimeout(() => {
                            resolve("p success");
                        }, 1000)
                    })
                所以我们需要处理 "pending" 状态
                    我们不能直接在then()中执行回调函数onResolved()和onRejected(),应该在异步代码执行到resolve()和reject(),将Promise对象的状态改变的时候,执行回调函数
                        比如: 这里是1s后,执行的resolve(),将状态改变成了"fullfilled"的时候,调用onResolved()
                    我们应该在Promise对象的构造器中的resolve()和reject()中,调用onResolved()和onRejected()
                        为了能在Promise对象的构造器中使用到onResolved()和onRejected(),我们在这里将这两个方法保存到Promise对象的callback中
             */
            if (this.PromiseState === "pending") {
                /*
                    将onResolved,onRejected以对象的形式保存到数组中
                        PromiseResult: "p success"
                        PromiseState: "fullfilled"
                        callbacks: Array(3)
                            0: {onRejected: undefined, onResolved: ƒ}
                            1: {onRejected: undefined, onResolved: ƒ}
                            2: {onRejected: undefined, onResolved: ƒ}
                 */
                this.callbacks.push({
                    // 传递then((value) => {}, (reason) => {})中的参数value和reason
                    onResolved: function () {
                        // 处理异步代码的then()的返回值 (与处理同步代码的then()的返回值的写法是一样的,具体的解释去看那边的)
                        callback(onResolved);
                    },
                    onRejected: function () {
                        // 处理异步代码的then()的返回值
                        callback(onRejected);
                    }
                })
            }
        });
    }

    // Promise对象的catch()
    catch(onRejected) {
        // 直接调用封装好的then()处理catch()
        return this.then(undefined, onRejected);
    }

    // Promise类的resolve(), 需要使用Promise.resolve调用
    static resolve(value) {
        // 返回Promise对象
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then((v) => {
                    resolve(v);
                }, (r) => {
                    reject(r);
                })
            } else {
                resolve(value);
            }
        })
    }

    // Promise类的reject()
    static reject(reason) {
        return new Promise((resolve, reject) => {
            reject(reason);
        })
    }

    // Promise类的all()
    static all(promises) {
        return new Promise((resolve, reject) => {
            let count = 0;
            // 用一个数组保存所有成功的Promise对象
            let arr = [];
            for (let i = 0; i < promises.length; i++) {
                promises[i].then((value) => {
                    arr[i] = promises[i];
                    // 如果传入的所有的Promise都是成功,就返回一个成功的Promise对象,值为一个数组(数组中包含了传入的所有Promise对象)
                    if (++count === promises.length) {
                        resolve(arr);
                    }
                }, (reason) => {
                    reject(reason);
                })
            }
        })
    }

    // Promise类的race()
    static race(promises) {
        return new Promise((resolve, reject) => {
            // 给传入的所有Promise对象都添加then(),谁的状态先发生变化,就执行then(),然后创建 成功/失败 的Promise对象返回
            for (let i = 0; i < promises.length; i++) {
                promises[i].then((value) => {
                    resolve(value);
                }, (reason) => {
                    reject(reason);
                })
            }
        })
    }
}
```

# async

```js
/*
    async修饰函数,会返回一个Promise对象 (返回的规则和then()一样)
 */

// async修饰的函数没有返回值
async function func1() {}
let rel1 = func1();
console.log(rel1);
    /*
        [[Prototype]]: Promise
        [[PromiseState]]: "fulfilled"
        [[PromiseResult]]: undefined
     */

// async修饰的函数返回一个非Promise对象
async function func2() {
    return "hello world";
}
let rel2 = func2();
console.log(rel2);
/*
    [[Prototype]]: Promise
    [[PromiseState]]: "fulfilled"
    [[PromiseResult]]: "hello world"
 */

// async修饰的函数返回一个Promise对象
async function func3() {
    return new Promise((resolve, reject) => {
        reject("error");
    });
}
let rel3 = func3();
console.log(rel3);
/*
    [[Prototype]]: Promise
    [[PromiseState]]: "rejected"
    [[PromiseResult]]: "error"
 */

// async修饰的函数抛出一个异常
async function func4() {
    throw "Exception";
}
let rel4 = func4();
console.log(rel4);
/*
    [[Prototype]]: Promise
    [[PromiseState]]: "rejected"
    [[PromiseResult]]: "Exception"
 */
```

# await

```js
// await必须写在async修饰的函数内部
async function main() {
    // 准备 一个成功Promise对象,一个失败的Promise对象 用作测试
    let p1 = new Promise((resolve, reject) => {
        resolve("p1 success");
    })
    let p2 = new Promise((resolve, reject) => {
        reject("p2 error");
    })

    // await修饰的内容一般都为Promise对象,得到的值就是Promise对象的PromiseResult属性值(即resolve()传入的参数值)
    let rel1 = await p1;
    console.log(rel1); // "p1 success"

    // await也可以修饰非Promise对象,不会对结果有什么影响,所以没啥意义
    let rel2 = await 10;
    console.log(rel2); // 10

    // 如果await修饰的是一个失败的Promise对象,需要通过 try-catch 捕获异常,不然会报错
    try {
        let rel3 = await p2; // p2是一个失败的Promise对象,被await修饰后,这里会出现异常,会被catch()捕获到,就不执行下面的代码了
        console.log(rel3); // 不输出,执行不到这里
    } catch (e) {
        console.log(e); // "p2 error"
    }
}
main();
```

# async,await读取文件

```js
const fs = require("fs");

// 使用回调函数实现
fs.readFile("./resources/1.txt", (err, data1) => {
    if (err) throw err;
    fs.readFile("./resources/2.txt", (err, data2) => {
        if (err) throw err;
        fs.readFile("./resources/3.txt", (err, data3) => {
            if (err) throw err;
            console.log(data1 + data2 + data3);
        })
    })
})

// 使用util.promisify()封装fs.readFile()
const util = require("util");
const readFilePromise = util.promisify(fs.readFile);

// 使用async,await实现
async function main() {
    // 使用try-catch来捕获异常(如果有读取失败的,就会被catch()捕获)
    try {
        // await修饰异步操作 (这样就可以将异步代码,看作同步代码来编写)
        let data1 = await readFilePromise("./resources/1.txt");
        let data2 = await readFilePromise("./resources/2.txt");
        let data3 = await readFilePromise("./resources/3.txt");
        console.log(data1 + data2 + data3);
    } catch (e) {
        console.log(e);
    }
}

main()
```

# async,await发送ajax请求

```js
<button id="btn">点我</button>

<script>
    // 使用Promise封装ajax操作
    function sendAJAX(url) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url); // 传入url地址
            xhr.send();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response); // 成功时的回调
                    } else {
                        reject(xhr.status); // 失败时的回调
                    }
                }
            }
        })
    }

    const btn = document.querySelector("#btn");
    // 使用async修饰匿名回调函数
    btn.addEventListener("click", async function () {
        // try-catch捕获异常
        try {
            // await修饰sendAJAX()返回的Promise对象
            let content = await sendAJAX("https://api.uixsj.cn/hitokoto/get");
            console.log(content);
        } catch (e) {
            console.log(e);
        }
    });
</script>
```







































 
