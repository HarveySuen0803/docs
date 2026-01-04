# RegExp

```js
// 通过RegExp对象创建正则表达式
let reg1 = new RegExp(/123/);
// 通过字面量创建正则表达式,只要包含"123"的字符串都符合要求
let reg2 = /123/

// 调用test()监测字符串是否符合正则表达式要求的规范
console.log(reg1.test("123")); // true
console.log(reg1.test("abc123def")); // true
console.log(reg1.test("abc")); // false
```

# ^ $

```js
// 边界符 ^ $

// 匹配以123开头的字符串
let reg1 = /^123/;
console.log(reg1.test("1234")); // true
console.log(reg1.test("0123")); // false

// 匹配以123结尾的字符串
let reg2 = /123$/;
console.log(reg2.test("0123")); // true
console.log(reg2.test("1234")); // false

// 匹配以123开头,以123结尾的字符串,即匹配"123"字符串
let reg3 = /^123$/
console.log(reg3.test("123")); // true
console.log(reg3.test("1234")); // false
console.log(reg3.test("0123")); // false
```

# [] - ^ |

```js
// 至少包含"a","b","c"其中一个字符,就会匹配成功
let reg1 = /[abc]/;
console.log(reg1.test("a")); // true
console.log(reg1.test("ab")); // true
console.log(reg1.test("cde")); // true
console.log(reg1.test("def")); // false

// 至少包含"a-z"中的一个字符串,就会匹配成功
let reg2 = /[a-z]/;
console.log(reg2.test("a432")); // true
console.log(reg2.test("efsd")); // true
console.log(reg2.test("531fs2z")); // true
console.log(reg2.test("1")); // false

// 只要字符串中包含不在"a-z"范围内的任何一个字符,都能匹配成功
let reg3 = /[^a-z]/;
console.log(reg3.test("a")); // false
console.log(reg3.test("awfsd")); // false
console.log(reg3.test("01ab")); // true
console.log(reg3.test("e2f1")); // true

// 匹配"abc"或"def"字符串
let reg4 = /abc|def/;
console.log(reg4.test("abc")); // true
console.log(reg4.test("def")); // true
console.log(reg4.test("ab")); // false
console.log(reg4.test("bcde")); // false

// 只有"a", "b", "c"这三个字符串能匹配成功
let reg5 = /^[abc]$/;
console.log(reg5.test("a")); // true
console.log(reg5.test("ab")); // false
console.log(reg5.test("ae")); // false
console.log(reg5.test("aef")); // false
console.log(reg5.test("e")); // false

// 只有一个字符,且这个字符在a-z,A-Z,0-9,_,-的范围内的字符,都能匹配到
let reg6 = /^[a-zA-Z0-9_-]$/
console.log(reg6.test("a")); // true
console.log(reg6.test("0")); // true
console.log(reg6.test("_")); // true
console.log(reg6.test("!")); // false
console.log(reg6.test("abc")); // false
```

# * + ? {}

```js
// "a"出现的次数 >=0
let reg1 = /^a*$/;
console.log(reg1.test("")); // true
console.log(reg1.test("a")); // true
console.log(reg1.test("aa")); // true

// "a"出现的次数 >=1
let reg2 = /^a+$/
console.log(reg2.test("")); // false
console.log(reg2.test("a")); // true
console.log(reg2.test("aa")); // true

// "a"出现的次数 0或1
let reg3 = /^a?$/
console.log(reg3.test("")); // true
console.log(reg3.test("a")); // true
console.log(reg3.test("aa")); // false

// "a"出现3次,即匹配"aaa"
let reg4 = /^a{3}$/
console.log(reg4.test("a")); // false
console.log(reg4.test("aa")); // false
console.log(reg4.test("aaa")); // true

// "a"出现的次数 >=3
let reg5 = /^a{3,}$/
console.log(reg5.test("a")); // false
console.log(reg5.test("aa")); // false
console.log(reg5.test("aaa")); // true
console.log(reg5.test("aaaa")); // true
console.log(reg5.test("aaaaa")); // true

// "a"出现的次数 [2,4]
let reg6 = /^a{2,4}$/
console.log(reg6.test("a")); // false
console.log(reg6.test("aa")); // true
console.log(reg6.test("aaa")); // true
console.log(reg6.test("aaaa")); // true
console.log(reg6.test("aaaaa")); // false

// 匹配在"a-zA-Z0-9_-"范围内,出现了[2,6]次的字符串
let reg7 = /^[a-zA-Z0-9_-]{2,6}$/
console.log(reg7.test("a")); // false
console.log(reg7.test("sun")); // true
console.log(reg7.test("Mr_Sun")); // true
console.log(reg7.test("_-xue")); // true
console.log(reg7.test("che-ng")); // true
console.log(reg7.test("aaaaaaaa")); // false
console.log(reg7.test("!abc")); // false

// 匹配"abcabcabc"
let reg8 = /^(abc){3}$/;
console.log(reg8.test("abc")); // false
console.log(reg8.test("abcabcabc")); // true
```

# . \\d \\D \\w \\W \\s \\S

![image-20220328145458947](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508746.png)

* "." 查找单个字符,除了换行和行结束符

# 正则捕获

```js
let content = "<a href='http://www.baidu.com'>百度</a>"
// 正则表达式,提取content字符串中的 url 和 标签文本
let reg = /<a href='(.*)'>(.*)<\/a>/;
// 执行捕获
let result = reg.exec(content);
console.log(result);
    /*
        (3) ["<a href='http://www.baidu.com'>百度</a>", 'http://www.baidu.com', '百度', index: 0, input: "<a href='http://www.baidu.com'>百度</a>", groups: undefined]
            0: "<a href='http://www.baidu.com'>百度</a>"
            1: "http://www.baidu.com"
            2: "百度"
            groups: undefined
            index: 0
            input: "<a href='http://www.baidu.com'>百度</a>"
            length: 3
            [[Prototype]]: Array(0)
     */
```

# 正则替换

```js
let str = "Sun sun xue sun ";

// 原先使用replace()
let newStr1 = str.replace("sun", "jack");
console.log(newStr1); // "Sun jack xue sun"

// 搭配正则表达式使用
let newStr2 = str.replace(/sun/, "jack");
console.log(newStr2); // "Sun jack xue sun "

// 正则替换通常还需要搭配正则表达式参数使用
```

# 正则表达式参数

```js
let str = "Sun sun xue sun ";

// 全局匹配
let newStr3 = str.replace(/sun/g, "jack");
console.log(newStr3); // "Sun jack xue jack"

// 忽略大小写匹配
let newStr4 = str.replace(/sun/i, "jack");
console.log(newStr4); // "jack sun xue sun"

// 全局匹配 + 忽略大小写匹配
let newStr5 = str.replace(/sun/gi, "jack");
console.log(newStr5); // "jack jack xue jack"

// 全局捕获
let content = "hello world hello sun hello";
let reg = /hello/g;
let result = {};
let results = []
while (result = reg.exec(content)) {
    results.push(result);
}
console.log(results);
    /*
        (3) [Array(1), Array(1), Array(1)]
            0: ['hello', index: 0, input: 'hello world hello sun hello', groups: undefined]
            1: ['hello', index: 12, input: 'hello world hello sun hello', groups: undefined]
            2: ['hello', index: 22, input: 'hello world hello sun hello', groups: undefined]
            length: 3
            [[Prototype]]: Array(0)
     */
```

# 正则捕获分组

```js
// 使用分组前
let reg1 = /<a href='(.*)'>(.*)<\/a>/;
let result1 = reg1.exec(content);
console.log(result1);
    /*
        (3) ["<a href='http://www.baidu.com'>百度</a>", 'http://www.baidu.com', '百度', index: 0, input: "<a href='http://www.baidu.com'>百度</a>", groups: undefined]
            0: "<a href='http://www.baidu.com'>百度</a>"
            1: "http://www.baidu.com"
            2: "百度"
            groups: undefined
            index: 0
            input: "<a href='http://www.baidu.com'>百度</a>"
            length: 3
            [[Prototype]]: Array(0)
     */

// 将捕获到的内容进行分组,放在groups属性下,方便后续的管理
let reg2 = /<a href='(?<url>.*)'>(?<text>.*)<\/a>/;
let result2 = reg2.exec(content);
console.log(result2);
    /*
        (3) ["<a href='http://www.baidu.com'>百度</a>", 'http://www.baidu.com', '百度', index: 0, input: "<a href='http://www.baidu.com'>百度</a>", groups: {…}]
            0: "<a href='http://www.baidu.com'>百度</a>"
            1: "http://www.baidu.com"
            2: "百度"
            groups:
                text: "百度"
                url: "http://www.baidu.com"
            index: 0
            input: "<a href='http://www.baidu.com'>百度</a>"
            length: 3
            [[Prototype]]: Array(0
     */
```

# 正则反向断言

```js
let content = "hello world 5201314 i love you";
// 正向断言: 根据"5201314"后面的" i love you"来找到"5201314"
let reg1 = /\d+(?= i love you)/
let result = reg1.exec(content); // 匹配到了"5201314"

// 反向断言: 根据"5201314"前面的"hello world "来找到"5201314"
let reg2 = /(?<=hello world )\d+/
let result2 = reg2.exec(content);
```

# 正则 dotAll 模式

```js
let content = `
    <ul>
        <li>
            <a>肖申克的救赎</a>
            <p>上映日期: 1994-09-10</p>
        </li>
    </ul>
`

// 普通模式下,"."能匹配除了 换行符"\s" 以外的任意字符
// 我们在处理需要换行的内容时,需要加上"\s+",挺麻烦了
let reg1 = /<li>\s+<a>(.*?)<\/a>\s+<p>(.*?)<\/p>\s+<\/li>/
let result1 = reg1.exec(content); // 匹配到 "<li><a>肖申克的救赎</a><p>上映日期: 1994-09-10</p></li>

// 在dotAll模式下(添加一个正则表达式参数s即可),"."能匹配所有的字符(即换行符也能匹配)
// 我们可以通过".*?"来代替"\s+"
let reg2 = /<li>.*?<a>(.*?)<\/a>.*?<p>(.*?)<\/p>.*?<\/li>/s
let result2 = reg2.exec(content); // 匹配到 "<li><a>肖申克的救赎</a><p>上映日期: 1994-09-10</p></li>
```

## 正则 matchAll()

```js
let content = `
    <ul>
        <li>
            <a>肖申克的救赎</a>
            <p>上映日期: 1994-09-10</p>
        </li>
        <li>
            <a>阿甘正传</a>
            <p>上映日期: 1994-07-06</p>
        </li>
        <li>
            <a>海边的曼彻斯特</a>
            <p>上映日期: 2016-11-18</p>
        </li>
    </ul>
`

let reg = /<li>.*?<a>(.*?)<\/a>.*?<p>(.*?)<\/p>.*?<\/li>/gs
// 之前全局匹配正则,还需要通过while,比较麻烦
let result = {};
let arr1 = [];
while (result = reg.exec(content)) {
    arr1.push(result);
}
console.log(arr1);

// 现在通过matchAll()就很方便
let results2 = content.matchAll(reg);
let arr2 = [...results2];
console.log(arr2);
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508629.png)

# 懒惰限定符

![image-20220330155706425](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508747.png)

```js
let content = "hello sun hello world hello";
// 直接匹配,默认为贪婪模式,匹配最多的
let reg1 = /hello (.*) hello/;
let result1 = reg1.exec(content); // 匹配到 "hello sun hello world hello"
// 添加了懒惰修饰符后,他会匹配尽可能少的使用"."的字符串
let reg2 = /hello (.*?) hello/;
let result2 = reg2.exec(content); // 匹配到 "hello sun hello"
```

# exercise

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>
        span {
            color: #aaa;
            font-size: 14px;
        }

        .right {
            color: green;
        }

        .wrong {
            color: red;
        }
    </style>
</head>

<body>
<input type="text" class="uname"> <span>请输入用户名</span>

<script>
    let uname = document.querySelector('.uname');
    let span = document.querySelector('span');
    // 匹配在字符在"a-zA-Z0-9_-"范围内出现[6,16]次的字符串
    let reg = /^[a-zA-Z0-9_-]{6,16}$/;

    uname.onblur = function () {
        
        if (reg.test(uname.value)) { // 匹配成功
            span.className = "right";
            span.innerHTML = "输入正确"
        } else { // 匹配失败
            span.className = "wrong";
            span.innerHTML = "输入错误";
        }
    };
</script>
</body>
```