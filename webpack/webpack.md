#  webpack介绍

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523928.png)

* webpack是一种前端资源构建工具,一个静态模块打包器(module bundler)
* webpack将前端所有的资源文件(js,json,css,less...)都看作是模块处理
* 它会根据模块的依赖关系进行静态分析,打包生成对应的静态资源
    * 例如: 我们无法直接引入less文件,无法直接让es6的模块化语法(export 和 import)在页面中生效
    * 之前需要针对做出不同的处理,非常的麻烦
    * 通过Webpack,可以对他们做出统一打包的管理,让其生效,这个过程就称为"打包" (bundle)
    
# webpack快速入门

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523929.png)

```bash
# 初始化项目
npm init -y
# 全局安装webpack,webpack-cli
npm i webpack webpack-cli -g
# 本地安装webpack,webpack-cli
npm i webpack webpack-cli -D
```

```js
/*
    index.js就是入口文件,通过webpack打包,会从index.js开始打包
    
    webpack 打包指令:
        * webpack
            在没有配置webpack.config.js前,默认打包到/dist/main.js
        * webpack ./src/index.js -o ./build --mode=development
            整体打包环境为开发环境,webpack会以"./src/index.js"为入口文件开始打包,打包后输出到"./build/main.js"
        * webpack ./src/index.js -o ./build --mode=production
            整体打包环境为生产环境, ...
    
    开发环境和生产环境的区别:
        * 开发环境是完整的js代码
        * 生产环境是压缩后的js代码

    webpack的使用(以es6模块化为例)
        * 浏览器不能直接识别es6模块化语法,我们可以在"./src/index.js"中编写es6模块化语法
        * 然后通过webpack,将其打包成"./build/main.js"能让浏览器看懂的模块化
        * 在页面中,就使用"./build/main.js"即可
 */

// index.js

// 通过es6语法,引入json数据
import data from './data.json'
console.log(data)
```

# Webpack的五个核心概念

* Entry: 入口文件,指示Webpack从哪个文件为入口文件,开始打包整个项目,分析构建内部依赖图
* Output: 输出,指示Webpack打包后的资源(bundles)输出到哪里去,以及如何命名
* Loader: 加载器,webpack只能理解js,json文件,不能理解其他文件(比如: css, img),通过Loader翻译css,img,让webpack能够理解这些非js文件
* Plugins: 插件,可以帮助webpack执行范围更广的任务
* Mode: 模式,分为: development模式, production模式
  ![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523930.png)

# webpack.config.js

```js
/*
    webpack.config.js是webpack的配置文件: 指示webpack干哪些活(当你运行webpack指令时,会加载里面的配置)

    所有的构建工具都是基于node.js平台的,模块化语法默认采用common.js,不采用es6的模块化语法

    配置好webpack.config.js后,只需要在终端,输入webpack就能运行了
 */

const path = require('path');

module.exports = {
    // 入口文件
    entry: './src/index.js',
    // 输出文件
    output: {
        // 输出的文件名
        filename: "built.js",
        // 输出到该路径,通过path.resolve()来拼接路径, "E:\project\webpack\demo01\build"
        path: path.resolve(__dirname, 'build'),
        // 设置了clean后,会自动清除上一次打包的内容,只保留最新一次打包的内容
        clean: true
    },
    // loader配置
    module: {
        rules: [
            // 详细的loader配置
        ]
    },
    // plugins配置
    plugins: [
        // 详细的plugins配置
    ],
    // mode配置
    mode: "development" // 配置成开发环境
}
```

# 管理资源

## 打包html

> webpack.config.js


```js
/*
    通过plugins配置插件,实现打包html的功能
 */

const path = require('path');
// 下载并引入插件 (yarn add html-webpack-plugin -D)
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    entry: './src/app.js',
    plugins: [
        // 复制 "./src/index.html" 文件, 并且自动引入了打包输出的资源(比如: built.js)
        new HtmlWebpackPlugin({
            // 打包后的index.html的title内容
            title: "多页面应用",
            // 如果没有配置template,则默认是空的html文件,然后引入了所有的资源
            template: "./src/index.html",
            // 文件名为app.html
            filename: 'app.html',
            // 将butit.js插入到<body>标签内,默认是插入到<head>标签内的
            inject: 'body'
        })
    ],
    mode: "development"
}
```

> src/index.html 要进行打包的html文件

```html
<head>
    <meta charset="UTF-8">
    <!--设置title值为我们在plugin配置里title值-->
    <title><%= htmlWebpackPlugin.options.title %></title>
</head>
<body>
<h1>hello world</h1>
</body>
```

> dist/index.html 打包好后的html文件

```html
<!--
    通过html-webpack-plugin插件,将/build/index.html打包为/src/index.html,同时引入了打包好的资源built.js
-->

<head>
    <meta charset="UTF-8">
    <!--这里已成功设置了title值-->
    <title>多页面应用</title>
</head>
<body>
<h1>hello world</h1>
<script defer src="built.js"></script>
</body>
```


## 打包css

> webpack.config.js

```js
/*
    webpack默认只能打包js,json文件,不能打包其他的文件

    想要通过webpack打包其他资源(比如: css,less),就需要在在webpack.config.js中配置相关loader
 */

const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {filename: "built.js",path: path.join(__dirname, 'build'),},
    mode: "development",
    module: {
        rules: [
            // 配置css的相关loader
            {
                // 通过正则表达式匹配".css"结尾的文件
                test: /\.css$/,
                // use数组中,存放要使用的loader,这是链式的
                // * 先执行css-loader,然后将结果返回给style-loader
                // * style-loader处理完,再讲结果放置到页面上
                use: [
                    // 创建<style>标签,将js文件中的样式插入进去,然后将<style>标签添加到<head>标签中生效
                    'style-loader',
                    // 将css文件变成commonjs模块加载到js文件中,里面的内容全是样式字符串
                    'css-loader',
                    // 注意: 需要下载相应的依赖包 npm i style-loader css-loader -D (因为是开发环境,所以需要安装开发环境的依赖包)
                ]
            }

            // 配置less的相关loader
            {
                // 匹配css和less文件(注意: 正则表达式符号'|'的左右不能有空格)
                test: /\.(css|less)$/,
            	// 通过less-loader讲less解析成css文件,然后返回给css-loader,再...
                use: ['style-loader','css-loader','less-loader']
                // 注意: 需要下载相应的依赖包 npm i style-loader css-loader less less-loader -D (因为要使用less,所以也要下载less的依赖包)
            }
        ]
    }
}
```

> src/index.js

```js
// 1. src/index.js 引入 index.css, style.less
// 2. src/index.js 打包成 build/built.js
// 3. build/index.html 引入 built.js, 就相当于给build/index.html引入了index.css,style.less的内容
import './index.css'
import './style.less'
```

> src/index.css

```css
body {
  background-color: pink;
}
```

> src/style.less

```less
h1 {
  color: #fff;
}
```

## 抽离css

> 实现效果

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523931.png)![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523932.png)

> webpack.config.js

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 安装并引入mini-css-extract-plugin (npm i mini-css-extract-plugin -D)
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: './src/index.js',
    output: {filename: "built.js",path: path.resolve(__dirname, 'build'),},
    mode: "development",
    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                // 使用MiniCssExtractPlugin.loader
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"}),
        // 实例化mini-css-extract-plugin插件对象
        new MiniCssExtractPlugin({
            // 定义打包后的 文件名 和 路径
            filename: 'styles/[contenthash].css'
        })
    ],
}
```

## 压缩css

> 实现效果

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523933.png)
![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523934.png)

> webpack.config.js

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 安装并引入css-minimizer-webpack-plugin (npm i minimizer-webpack-plugin -D)
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: "built.js",
        path: path.resolve(__dirname, 'build'),
        clean: true
    },
    // 设置为生产模式
    mode: "production",

    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"}),
        new MiniCssExtractPlugin({filename: 'styles/[contenthash].css'})
    ],
    // optimization是做优化的配置
    optimization: {
        minimizer: [
            // 实例化CssMinimizerPlugin
            new CssMinimizerPlugin()
        ]
    }
}
```

## 打包image

> webpack.config.js

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: './src/index.js',
    output: {filename: "built.js", path: path.resolve(__dirname, 'build'), clean: true},
    mode: "development",

    module: {
        rules: [
            // 打包jpg图片
            {
                test: /\.jpg$/,
                // 这里使用 "asset/resource", "asset/inline", "asset"都可以,后面在资源模块中有讲解
                type: 'asset/resource'
            },
            // 打包css文件,同时也会自动打包css中使用到的所有图片,即不需要这里设置打包图片的配置项
            {
                test: /\.(css|less)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"}),
        new MiniCssExtractPlugin({filename: 'styles/[contenthash].css'})
    ]
}
```

> src/style.css 打包前的css

```css
div {
    color: pink;
    font-size: 20px;
    /*这里使用到了图像资源,如果配置了css的打包处理,那么这里的图像,也会自动打包*/
    background-image: url(./asset/1.jpg);
}
```

> src/style.css 打包后的css

```css
/*!********************************************************************************************************!*\
  !*** css ./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/style.css ***!
  \********************************************************************************************************/
div {
  color: pink;
  font-size: 20px;
  /* 这里使用就是打包后的图片url路径了 */
  background-image: url(../a67257ea60180c11c756.jpg);
}
```

## 打包fonts

> webpack.config.js

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: './src/index.js',
    output: {filename: "built.js", path: path.resolve(__dirname, 'build'), clean: true},
    mode: "development",

    module: {
        rules: [
            // 打包字体文件
            {
                test: /\.(woff|woff2|eot|ttf|otf)/,
                // 使用"asset/resource"资源模块类型
                type: "asset/resource"
            },
            // 打包样式文件
            {
                test: /\.(css|less)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"}),
        new MiniCssExtractPlugin({filename: 'styles/[contenthash].css'})
    ]
}
```

> src/style.css

```css
/*准备字体*/
@font-face {
    font-family: 'iconfont';
    src: url('./asset/iconfont.ttf') format('truetype');
}

.icon {
    font-family: 'iconfont';
    font-size: 30px;
}
```

> src/index.js

```js
// 加载css样式
import "./style.css"
// 将字体图标放入到页面上
const div = document.createElement("div");
div.classList.add("icon");
div.innerHTML = "&#xe668";
document.body.appendChild(div)
```

## 打包csv, tsv, xml

> webpack.config.js

```js
/*
    加载数据,比如: json, csv, tsv, xml

    Node.js是内置是默认支持json数据的,即 import Data from './data.json' 是有效的

    要导入csv, tsv, xml就要使用 csv-loader, xml-loader
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: './src/index.js',
    output: {filename: "built.js", path: path.resolve(__dirname, 'build'), clean: true},
    mode: "development",

    module: {
        rules: [
            // 打包csv,tsv文件
            {
                test: /\.(csv|tsv)$/,
                use: ['csv-loader']
            },
            // 打包xml文件
            {
                test: /\.xml$/,
                use: ['xml-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"}),
        new MiniCssExtractPlugin({filename: 'styles/[contenthash].css'})
    ]
}
```

> src/index.js

```js
import data1 from './asset/data.csv'
import data2 from './asset/data.xml'

// csv,tsv文件的数据被转成了数组
console.log(data1)

// xml文件的数据被转成了对象
console.log(data2)
```

> 浏览器输出的结果

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523935.png)

## 打包toml,yaml,json5

> webpack.config.js

```js
/*
    通过使用 自定义 parser 替代特定的 webpack loader, 可以将任何 toml, yaml, json5 文件 作为 JSON 模块导入

    安装相应的依赖包 npm i toml yaml json5 -D
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// 引入依赖包
const toml = require('toml');
const yaml = require('yaml');
const json5 = require('json5');

module.exports = {
    entry: './src/index.js',
    output: {filename: "built.js", path: path.resolve(__dirname, 'build'), clean: true},
    mode: "development",

    module: {
        rules: [
            // 打包toml文件
            {
                test: /\.toml$/,
                type: "json",
                parser: {
                    parse: toml.parse
                }
            },
            // 打包yaml文件
            {
                test: /\.yaml$/,
                type: "json",
                parser: {
                    parse: yaml.parse
                }
            },
            // 打包json5文件
            {
                test: /\.json5/,
                type: "json",
                parser: {
                    parse: json5.parse
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"}),
        new MiniCssExtractPlugin({filename: 'styles/[contenthash].css'})
    ]
}
```

> src/index.js

```js
// 打包后的数据都是对象格式的

import data1 from './asset/data.toml'
import data2 from './asset/data.yaml'
import data3 from './asset/data.json5'

console.log(data1)
console.log(data2)
console.log(data3)
```

> 浏览器输出的结果

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523936.png)

# 资源模块

## Info

* 资源模块(asset module)是一种模块类型,它允许我们应用Webpack来打包其他资源文件(比如: 字体,图标...)
* 资源模块类型(asset module type),通过添加4种新的模块类型,来替换所有这些loader
  * asset/resource : 将资源分割为单独的文件,并导出url
  * asset/inline : 导出资源的dataURL
  * asset/source : 导出资源的源代码
  * asset : 在 asset/resource 和 asset/inline 之间自动选择

## asset/resource

> webpack.config.js

```js
/*
    asset/resource 将资源分割为单独的文件,并导出url(这里以图片资源为例)
*/

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: "built.js",
        path: path.resolve(__dirname, 'build'),
        clean: true,
        /*
            设置打包的图片的名称和路径
                具体设置: images/test.png
                自动生成: images/[contenthash][ext]
                    [contenthash]: 根据文件的内容生成hash字符串
                    [ext]: 文件的扩展名
         */
        assetModuleFilename: "images/[contenthash][ext]"
    },
    plugins: [new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"})],
    mode: "development",

    module: {
        rules: [
            {
                // 通过正则表达式匹配".jpg"结尾的文件
                test: /\.jpg$/,
                // 在type中定义资源模块类型,这里设置为'asset/resource',发送资源,并且导出url
                type: 'asset/resource',
                // generator的作用和output的assetModuleFilename配置一样,用法也一样,但是优先级比assetModuleFilename高
                generator: {
                    filename: "images/[contenthash][ext]"
                }
            }
        ]
    },
}
```

> src/index.js

```js
// 将图片看作是一个模块导入,导入的是图片的url
import imgSrc from "./assets/1.jpg"

const img = document.createElement("img")

img.src = imgSrc

// 将图片插入到页面中
document.body.appendChild(img)
```

> 打包后的包目录

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523937.png)

## asset/inline

> webpack.config.js

```js
/*
    dataURL 和 url 的区分
        * dataURL "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAI0AA03DhRMAAAAASUVORK5CY"
            * 结构: "data:[<mediatype>][;base64],<data>"
                * [<mediatype>]	MIME type 代表数据的类型
                * [;base64]	可选的base64标识,base64是一种图片的处理方式
                    * 优点: 减少请求数量(减轻服务器压力)
                    * 缺点: 图片体积会变大(文件请求速度慢)
                * <data>	数据本身
        * data "https://127.0.0.1/asset/423u402840.svg"

    asset/inline 导出资源的dataURL
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: "built.js",
        path: path.resolve(__dirname, 'build'),
    },
    plugins: [new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"})],
    mode: "development",
    module: {
        rules: [
            {
                test: /\.svg$/,
                type: 'asset/inline'
                // dataURL形式的资源,是不会在build目录下生成打包后的图片资源的,所以也不需要重命名了
            }
        ]
    },
}
```

> src/index.js

```js
import imgSrc from "./assets/webpack-logo.svg"

const img = document.createElement("img")

img.src = imgSrc

document.body.appendChild(img)
```

## asset/source

> webpack.config.js

```js
/*
    asset/source 导出资源的源代码

    这里以data.txt文本举例
        * data.txt的源码内容是 "hello world"
        * 我们在webpack.config.js中设置了txt文件的资源模块处理类型为"asset/source"
        * 输出到浏览器中,就是输出的"hello world"源码内容
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: "built.js",
        path: path.resolve(__dirname, 'build'),
    },
    plugins: [new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"})],
    mode: "development",

    module: {
        rules: [
            {
                // 通过正则表达式匹配".jpg"结尾的文件
                test: /\.jpg$/,
                // 发送资源,并且导出url
                type: 'asset/resource',
                // generator的作用和output的assetModuleFilename配置一样,用法也一样,但是优先级比assetModuleFilename高
                generator: {
                    filename: "images/[contenthash][ext]"
                }
            },
            {
                test: /\.svg$/,
                type: 'asset/inline'
                // 因为不会打包图片资源到build目录下,所以就不用修改图片的名称
            },
            {
                test: /\.txt$/,
                type: 'asset/source'
            }
        ]
    },
}
```

> src/index.js

```js
import text from './assets/data.txt'

let div = document.createElement('div')

div.textContent = text

document.body.appendChild(div)
```

> 浏览器显示的内容

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523938.png)

## asset

> webpack.config.js

```js
/*
    asset 在 asset/resource 和 asset/inline 之间自动选择
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: "built.js",
        path: path.resolve(__dirname, 'build'),
        // 在使用asset的资源模块类型的时候,不确定会采用什么资源模块类型,就可以配置assetModuleFilename做默认处理,如果采用了asset/resource就给图片重命名了
        assetModuleFilename: "images/[contenthash][ext]"
    },
    plugins: [new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"})],
    mode: "development",

    module: {
        rules: [
            {
                // 通过正则表达式匹配".jpg"结尾的文件
                test: /\.jpg$/,
                // 发送资源,并且导出url
                type: 'asset/resource',
                // generator的作用和output的assetModuleFilename配置一样,用法也一样,但是优先级比assetModuleFilename高
                generator: {
                    filename: "images/[contenthash][ext]"
                }
            },
            {
                test: /\.svg$/,
                type: 'asset/inline'
                // 因为不会打包图片资源到build目录下,所以就不用修改图片的名称
            },
            {
                test: /\.txt$/,
                type: 'asset/source'
            },
            {
                test: /\.gif$/,
                type: 'asset',
                /*
                    默认情况下
                        * 资源 < 8k, 就使用asset/inline的资源模块类型,即build目录下没有打包后的图片资源
                        * 资源 > 8k, 就使用asset/resource的资源模块类型,即生成打包后的图片在build目录下
                    parser配置项,可以配置maxSize,即手动设置,这里设置的是 4 * 1024 = 4k
                    	* 资源 < 4k, 就使用asset/inline的资源模块类型,即build目录下没有打包后的图片资源
                    	* 资源 > 4k, 就使用asset/resource的资源模块类型,即生成打包后的图片在build目录下
                 */
                parser: {
                    dataUrlCondition: {
                        maxSize: 4 * 1024
                    }
                }
            }
        ]
    },
}
```

> src/index.js

```js
import imgSrc from './assets/a.gif'

let img = document.createElement('img');

img.src = imgSrc

document.body.appendChild(img)
```

# 开发效率工具

## webpack --watch

```bash
# 通过`webpack`打包内容,每次内容发生变化,都需要在终端重新输入webpack来重新打包内容,非常的麻烦
webpack
# 通过`webpack --watch`打包内容,会实时监测项目内容的变化,就不需要我们重新的使用`webapck`打包了
webpack --wath
```

## webpack-dev-server

> webpack.config.js

```js
/*
    通过webpack-dev-server,可以实时监测项目内容的变化,同时也不需要刷新浏览器,相比上面的"webpack --watch"还要更为方便
*/

const path = require('path')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: "built.js",
        path: path.resolve(__dirname, 'build'),
    },
    plugins: [
    mode: "development",
    // 安装 webpack-dev-server (npm i webpack-dev-server -D)
    // 配置 devServer,设置要打开的目录
    devServer: {
        static: './build'
    }
```

> 启动

```bash
# 通过npx启动,方法1
npx webpack-dev-server
# 通过npx启动,方法2
npx webpack serve
# 启动服务器,并且自动打开浏览器
npx webpack-dev-server --open
# 指定在3000端口启动服务
npx webpack serve --port 3000
```

# 代码分离

## Info

* 代码分离 能够把代码分离到不同的bundle中, 然后可以按需加载或并行加载这些文件 (是 webpack 中最引人注目的特性之一)
* 代码分离 可以用于获取更小的bundle, 以及控制资源加载优先级, 如果使用合理, 会极大影响加载时间
* 常用的代码分离方法有四种
  * 方法1: 使用 entry配置项 设置多个入口文件,手动分离代码
    * 如果有多个入口文件,同时共享了多个文件,那么这些共享文件会重复打包
  * 方法2：使用 entry配置项的dependOn 去重,分离 chunk
    * 解决了重复打包的问题
  * 方法3: 使用 SplitChunksPlugin插件 去重,分离 chunk
    * 解决了重复打包的问题
  * 方法4: 动态导入,通过模块的内联函数调用来分离代码

## 方法1: entry配置项

> webpack.config.js

```js
/*
    使用entry配置项,设置了多个入口文件,存在重复打包的问题
*/

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    // 配置多个入口文件
    entry: {
        index: "./src/index.js",
        another: "./src/another.js"
    },
    // 配置输出多个文件
    output: {
        // 动态设置名称,这里就是 "index.bundle.js", "another.bundle.js"
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, 'build'),
        clean: true
    },
    mode: "development",
    plugins: [new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"})]
}
```

> src/index.js

```js
// 引入lodash模块
import _ from 'lodash'
console.log('入口文件1: index.js')
```

> src/another.js

```js
// 引入lodash模块,和src/index.js共享了同一个模块
import _ from 'lodash'
console.log("入口文件2: another.js")
```

> build/app.html 打包好后的html文件

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <!-- 打包后的app.html,已经自动引入了两个入口文件 -->
    <script defer src="index.bundle.js"></script>
    <script defer src="another.bundle.js"></script>
</body>
</html>
```

> 打包后的项目结构

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523939.png)

## 方法2: dependOn配置项

> webpack.config.js

```js
/*
    通过dependOn配置项,设置多个入口文件,同时解决了重复的问题
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    // 配置多个入口文件
    entry: {
        index: {
            import: "./src/index.js",
            // 定义共享文件为shared
            dependOn: "shared"
        },
        another: {
            import: "./src/another.js",
            dependOn: "shared"
        },
        // 当index模块和another模块中有"lodash"模块时就会将"lodash"抽离出来,做成一个shared.bundle.js,这样就解决了重复打包相同模块的问题
        shared: "lodash"
    },
    // 配置输出多个文件
    output: {
        // 动态设置名称,这里就是 "index.bundle.js", "another.bundle.js"
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, 'build'),
        clean: true
    },
    mode: "development",
    plugins: [new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"})]
}
```

> build/app.html 打包好后的html文件

```html
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <script defer src="index.bundle.js"></script>
    <script defer src="another.bundle.js"></script>
    <!-- 引入了共享模块的入口文件 -->
    <script defer src="shared.bundle.js"></script>
</body>
```

## 方法3: SplitChunksPlugin插件

> webpack.config.js

```js
/*
    通过SplitChunksPlugin插件,拆分入口文件,同时解决了重复的问题
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    // 配置多个入口文件
    entry: {
        index: "./src/index.js",
        another: "./src/another.js"
    },
    // 配置输出多个文件
    output: {
        // 动态设置名称,这里就是 "index.bundle.js", "another.bundle.js"
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, 'build'),
        clean: true
    },
    mode: "development",
    plugins: [new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"})],
    // 优化配置
    optimization: {
        // 拆分所有的chunks
        splitChunks: {
            chunks: "all"
        }
    }
}
```

> 打包后的项目结构

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523940.png)

## 方法4: 动态导入

### 快速入门

> webpack.config.js

```js
/*
    当涉及到动态代码拆分时,webpack提供了两个类似的技术,我们这里采用第一种方法
        * 第一种,使用符合 ECMAScript 提案 的 import() 语法 来实现动态导入 (推荐)
        * 第二种,使用 webpack 的遗留功能 require.ensure

    动态导入 可以搭配 静态导入一起使用
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    // 配置多个入口文件
    entry: {
        index: "./src/index.js",
    },
    // 配置输出多个文件
    output: {
        // 动态设置名称,这里就是 "index.bundle.js", "another.bundle.js"
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, 'build'),
        clean: true
    },
    mode: "development",
    plugins: [new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"})],
}
```

> src/index.js

```js
// 动态导入

function getComponent() {
    // import返回的是一个Promise对象,通过.then()处理,成功之后的结果
    // {default: _} 是解构出"default"对象,同时重命名为"_"
    return import("lodash").then(({default: _}) => {
        const element = document.createElement("div")
        // 通过" "来拼接字符串,然后放入到element中
        element.innerHTML = _.join(["Hello", "webpack"], " ")
        return element
    })
}

getComponent().then((element) => {
    document.body.appendChild(element)
})
```

> 打包后的项目结构

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523941.png)

### 应用1: 懒加载

> src/index.js

```js
const button = document.createElement("button")

button.textContent = "点击执行加法运算"

/*
    懒加载是动态导入的应用之一: 懒加载是一种很好的优化网页或应用的方式,这样加快了应用的初始加载速度,减轻了它的总体体积,因为某些代码块可能永远不会被加载

    当执行了点击事件,才会动态导入模块,这就是懒加载
        在浏览器的开发者工具的network里,一上来是不会导入"math.bundle.js"模块的,等点击了该button,才会加载"math.bundle.js"模块
 */
button.addEventListener("click", () => {
    /*
        动态导入"./math.js"文件,对"math.js"文件进行打包处理
        
        通过注释设置 webpackChunkName: "math",会对打包后的"math.js"进行重命名,生成的文件名就是"build/math.bundle.js"
            如果没有设置,默认情况下,就是"build/src_math_js.bundle.js"
     */
    import(/* webpackChunkName: "math" */ "./math").then(({add}) => {
        console.log(add(10, 20))
    })
});

document.body.appendChild(button)
```

> src/math.js

```js
export function add(x, y) {
    return x + y;
}

export function minus(x, y) {
    return x - y;
}
```

### 应用2: 预获取,预加载

```js
/*
    预获取,预加载都是动态导入的应用之一, Webpack v4.6.0+增加了对预获取和预加载的支持

    在声明import时,使用下面这些内置指令,可以让webpack输出 "resource hint(资源提示)",来告知浏览器,在闲置时间里获取这些资源
        * prefetch(预获取): 将来某些导航下可能需要的资源
        * preload(预加载): 当前导航下可能需要资源
 */

const button = document.createElement("button")

button.textContent = "点击执行加法运算"

button.addEventListener("click", () => {
    /*
        通过注释设置 webpackPrefetch: true,告知浏览器去进行预获取"math.js"模块,然后会生成 <link rel="prefetch" href="math.js">, 并追加到页面的头部,浏览器会在闲置的时间内,去获取这个资源

        通过注释设置 webpackPreload: true,告知浏览器去进行预加载"math.js"模块,这里的效果就类似于刚才的懒加载
     */
    import(/* webpackChunkName: "math", webpackPrefetch: true */ "./math").then(({add}) => {
        console.log(add(10, 20))
    })
});

document.body.appendChild(button)
```

# 缓存技术

## Info

* 使用 webpack 来打包我们的模块化后的应用程序, 生成一个可部署的 /dist 目录, 然后把打包后的内容放置在此目录中
* 只要 /dist 目录中的内容部署到 server 上, client(客户端,通常是浏览器)就能够访问此 server 的网站及其资源
* 而最后一步获取资源是比较耗费时间的, 这就是为什么浏览器使用 "缓存" 的技术, 可以通过命中缓存, 以降低网络流量, 使网站加载速度更快

## 避免缓存

> webpack.config.js

```js
/*  
    如果我们修改了文件的内容,想要部署新版本,但没有更改资源的文件名,浏览器可能会认为它没有被更新,就会使用它的缓存里的内容,不会去重新获取新的文件
    
    我们可以在每次修改文件内容后,都修改一次文件名,这样就能避免缓存机制了,浏览器每次都会去重新获取新的文件
*/

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        index: "./src/index.js",
    },
    output: {
        // contenthash是根据文件的内容,生成的hash值,所以只要内容一发生变化,就会生成新的文件名,这就能避免缓存的机制 (比如: "index.984e4cbbbccc691f77edd.js")
        filename: "[name].[contenthash].js",
        path: path.resolve(__dirname, 'build'),
        clean: true
    },
    mode: "development",
    plugins: [new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"})],
}
```

## 缓存第三方库

```js
/*
    因为第三类库(比如: lodash, jquery...),很少像本地的源代码那样频繁修改,因此利用 客户端(client, 即浏览器) 的长效缓存机制,命中缓存来消除请求,并减少向 server 获取资源,同时还能保证 客户端(client) 代码和 服务器(server) 代码版本一致

    将第三方库,提取到单独的 vendor chunk 文件中,是比较推荐的做法
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        index: "./src/index.js",
    },
    output: {
        filename: "[name].[contenthash].js",
        path: path.resolve(__dirname, 'build'),
        clean: true
    },
    mode: "development",
    plugins: [new HtmlWebpackPlugin({template: "./src/index.html", filename: "app.html", inject: "body"})],

    // 优化配置
    optimization: {
        splitChunks: {
            // 编写缓存组,缓存第三方库
            cacheGroups: {
                vendor: {
                    // 匹配 "/node_modules/"目录
                    test: /[\\/]node_modules[\\/]/,
                    // 打包到 build/vendors.[contenthash].js 里了
                    name: "vendors",
                    chunks: "all"
                }
            }
        }
    }
}
```

# 公共路径

> webpack.config.js

```js
/*
    通过publicPath配置项,可以配置所有资源的基础目录
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: {
        index: "./src/index.js",
    },
    output: {
        filename: "scripts/[name].[contenthash].js",
        path: path.resolve(__dirname, 'build'),
        clean: true,
        // 配置公共目录
        publicPath: "http://localhost:8080/"
    },
    // ...
}
```

> build/app.html 打包后的html文件

```html
<body>

<h1>hello world</h1>
<!-- 所有的资源路径前面都加了一个 "http://localhost:8080/" -->
<script defer src="http://localhost:8080/scripts/vendors.93071a73d5176814c654.js"></script>
<script defer src="http://localhost:8080/scripts/index.4814aeb55fdfc2e7de2e.js"></script>

</body>
```

# source-map

* 如果index.js代码出错了,我们通过浏览器打开,是只能看到打包后的built.js的代码出错的位置,我们无法确定源码index.js中代码哪里出错了
  * index.js为打包前的js文件, built.js为打包后的index.js
* 当配置了"source-map"后,就可以帮助我们通过浏览器找到index.js代码出错的位置
* webpack已经内置了"source-map",只需要我们通过简单的配置即可
* webpack的devtool一共提供了7种不同的"source-map"的模式
  ![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523942.png)
  * 如果没有配置devtool,则webpack默认"source-map"为"eval"模式
  * 开发模式中,我们更推荐使用 "cheap-module-source-map"模式
    * 可以单独生成一个map文件
    * 不记录列数,增加了效率
    * 添加了babel-loader的解析后,依旧能找到源码的内容
  * 生产模式,就不要使用"source-map"了
    * 通过bundle和source-map文件,可以反编译出源码,会导致源码泄露
    * "source-map"的文件体积较大,不适合生产模式

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        index: './src/app.js'
    },
    // 配置"source-map"为"source-map"模式
    devtool: "source-map",
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin()
    ]
}
```

# devServer

## 基本配置

```js
/*
	通过devServer配置项,对"webpack-dev-server"进行特定的编辑
*/

const path = require('path');

const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        index: './src/app.js'
    },
    devServer: {
        static: path.resolve(__dirname, './dist'),
        // 设置对文件进行gzip的压缩处理,默认为true
        compress: true,
        // 设置端口号为3000,默认为8080
        port: 3000,
        // 设置响应头
        headers: {
            "X-Access-Token": "abc"
        }
    },
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin()
    ]
}
```

## 配置代理

- 如果没有配置代理, 我们在 `http://localhost` 下发送请求给 `http://localhost:8080` 会存在跨域问题
- 通过 webpack-dev-server 配置一个代理服务器 `http://localhost:8080`, 此时发送请求到 `http://localhost/api/show`, 就会被代理服务器转发到 `http://localhost:8080/api/show` 解决了跨域问题

```js
// webpack.config.js

const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        index: './src/app.js'
    },
    devServer: {
        static: path.resolve(__dirname, './dist'),
        // 配置代理服务器
        proxy: {
            // 请求 "http://localhost/api" 时, 转发请求
            "/api": {
                // 请求 "http://localhost/api" 时, 转发请求为 "http://localhost:8080/api"
                target: "http://localhost:8080",
                // 请求 "http://localhost/api/show" 时, 转发请求为 "http://localhost:8080/show"
                pathRewrite: {"^/api": ""}
            }
        }
    },
    mode: "development",
    plugins: [new HtmlWebpackPlugin()]
}
```

```js
// src/app.js

// 通过浏览器自带的fetch()发送ajax请求,请求本地的代理服务器"/api/show"
fetch("/api/show").then((res) => {
    return res.text();
}).then((data) => {
    console.log(data);
})
```

```js
// server.js (服务器)

const http = require("http")

const app = http.createServer((req, res) => {
    if (req.url === "/api/show") {
        res.end("hello world")
    }
})

app.listen(9000, () => {
    console.log("server is running")
})
```

## 配置https,http2协议

```js
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        index: './src/app.js'
    },
    devServer: {
        static: path.resolve(__dirname, './dist'),
        /*
            配置了https之后,我们就可以通过"https://localhost:8080"来访问该服务器了

            注意: 由于默认配置使用的是自签名证书,所以有的浏览器会提示不安全,如果有证书的话,我们也可以提供相应的证书,比如:
                module.exports = {
                    devServer: {
                        https: {
                            cacert: './server.pem',
                            pfx: './server.pfx',
                            key: './server.key',
                            cert: './server.crt',
                            passphrase: 'webpack-dev-server',
                            requestCert: true,
                        },
                    },
                };
         */
        https: true,

        /*
            // 也可以配置http2, http2默认自带https自签名证书, 当然我们仍然可以通过https配置项来使用自己的证书
            http2: true
         */
    },
    mode: "development",
    plugins: [new HtmlWebpackPlugin()]
}
```

## historyApiFallback

```js
/*
    如果我们的应用是个SPA(单页面应用),如果不存在"/some"路由,我们又跳转到此路由(可以直接在地址栏里输入),刷新页面后,控制台会报错

    我们可以通过配置historyApiFallback,当页面不存在时,就跳转到 首页index.html
 */

const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        index: './src/app.js'
    },
    output: {
        /*
            只配置一个historyApiFallback,还不够,会出现资源请求不到的问题,比如:
                * 访问"http://localhost:8080/one",会去请求"http://localhost:8080/index.js"的资源,正确
                * 访问"http://localhost:8080/one/two",会去请求"http://localhost:8080/one/index.js"的资源,错误
                * 访问"http://localhost:8080/one/two/three",会去请求"http://localhost:8080/one/two/index.js"的资源,错误
            我们需要配置publicPath,让其一直请求"http://localhost:8080/index.js"
                * 访问"http://localhost:8080/one",会去请求"http://localhost:8080/index.js"的资源,正确
                * 访问"http://localhost:8080/one/two",会去请求"http://localhost:8080/index.js"的资源,正确
                * ...
         */
        publicPath: "/"
    },
    devServer: {
        static: path.resolve(__dirname, './dist'),
        // 配置historyApiFallback
        historyApiFallback: true
    },
    mode: "development",
    plugins: [new HtmlWebpackPlugin()]
}
```

## 开发服务器主机

```js
/*
    如果你在开发环境中启动了一个devServe服务,并期望你的同事能访问到它,就可以配置host
    	配置完,别人就可以在同一个局域网下,通过局域网ip来访问你的服务器了
 */

const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        index: './src/app.js'
    },
    devServer: {
        static: path.resolve(__dirname, './dist'),
        // 配置host
        host: "0.0.0.0"
    },
    mode: "development",
    plugins: [new HtmlWebpackPlugin()]
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523943.png)

# 热替换,热加载

```js
/*
    模块热替换(HMR - hot module replacement): 程序运行中,执行(替换,添加,删除)操作,无需重新加载整个页面
        实际上,默认的热替换是基于一个插件HotModuleReplacementPlugin
            * webpack4中,需要手动配置
            * webpack5中,做到了开箱即用,只需要简单的配置即可
    热加载: 文件更新时，自动刷新我们的服务和页面
 */

const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        index: './src/app.js'
    },
    output: {
        clean: true
    },
    devServer: {
        static: path.resolve(__dirname, './dist'),
        // 模块热替换(webpack默认配置为true,所以不需要我们去手动开启)
        hot: true,
        // 模块热加载(webpack默认配置为true,所以不需要我们去手动开启,如果想要关闭liveReload,也要将hot关闭掉)
        liveReload: true
    },
    module: {
        rules: [
            // HMR 加载样式,如果配置了css-loader,就同样支持样式文件的热替换功能
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
        })
    ]
}
```

```js
// 测试js代码的热替换,热加载(具体代码略)
import "./testCss.js"
// 测试css代码的热替换,热加载(具体代码略)
import "./testJs.js"

// 如果js代码没有实现热替换.就编写下面这段代码 (css不需要编写,是因为css-loader帮我们完成了这样的工作)
if (module.hot) {
    // 接受要进行热替换的js文件
    module.hot.accept("./testJs.js", () => {
        // 完成热替换后的回调函数
    })
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523944.png)

# eslint

## Info

* eslint是用来扫描我们所写的代码是否符合规范的工具
* 我们的项目往往都是多人协作开发的,我们期望统一的代码规范,这时候可以让eslint来对我们进行约束
  * 比如: 要求每一行的js代码结尾,必须有";"
* 严格意义上来说,eslint配置跟webpack无关,但在工程化开发环境中它往往是不可或缺的

## 快速入门

> 安装eslint

```bash
# 在本地安装eslint
npm i eslint -D
# 初始化eslint
npx eslint --init
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523945.png)

> 使用eslint对代码进行检查

```bash
# 通过eslint检查"./src"目录下的代码规范
npx eslint ./src
```

```js
// 编写一段简单的代码,测试eslint的效果
console.log('hello world')
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523946.png)

> 插件配置

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523947.png)

vscode中安装这个插件,可以不需要通过`npx eslint ./src`来检查代码,会自动显示错误提示

## webpack配置eslint

```js
/*
    让eslint和webpack关联起来,如果不符合eslint的要求,就会报错,无法完成打包

    配置eslint-webpack-plugin插件,每次通过`npx webpack`进行打包时,就会对代码进行eslint检查,能在控制台上看见 eslint的检查结果和打包结果
 */

const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 安装并引入插件 (npm i eslint-webpack-plugin -D)
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    devServer: {
        // 通过`npx webpack serve`进行打包, 如果代码有不符合eslint要求的地方, 就会在浏览器显示 遮罩的error信息
        client: {
            // 设置为false,可以关闭 遮罩error信息
            overlay: false
        }
    },
    mode: "development",
    /*
        // eslint-loader已经被弃用了,现在都是配置eslint-webpack-plugin插件
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    // 先用eslint-loader做一个检查,再用babel-loader进行编译
                    use: ['babel-loader', 'eslint-loader']
                }
            ]
        },
    */
    plugins: [
        new HtmlWebpackPlugin(),
        // 配置eslint-webpack-plugin插件
        new ESLintPlugin()
    ]
}
```

## 配置git-hooks

> Info

* 我们一般都希望在项目通过git提交之前做一次eslint检查
* 可以搭配git的hooks,当执行`git commit`前,对项目进行eslint检查

> Employ

* `.git/hooks`目录下有一个`pre-commit.sample`文件,就是会在执行`git commit`前调用的钩子

  ```bash
  # 在项目文件夹下,初始化git
  git init
  # 查看隐藏文件
  dir -h
  # 进入".git/hooks"目录下
  cd ./git/hooks
  ```

  ![image-20220314111204257](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523948.png)

* 创建pre-commit文件,避免直接修改pre-commit.sample文件的内容
  ![image-20220314113247057](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523949.png)

* 我们在`pre-commit`文件里编写`npx eslint ./src`对src目录下的文件进行eslint检查

  ![image-20220317172807973](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523950.png)

* 当执行`git commit`时,就会调用`pre-commit`文件,对项目进行eslint检查
  ![image-20220314115437501](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523951.png)

## 配置.mygithooks

* 每个人电脑上的git都不一样,多人协作时,我们无法做到规范

* 我们可以创建一个`.mygithooks目录`,里面放一个`pre-commit文件`,文件里编写指令`npx eslint ./src`
  ![image-20220314162530297](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523952.png)

* 修改git默认读取的hooks文件夹为`.mygithooks`

  ```bash
  # 由原先的`.git/hooks`修改为了`.mygithooks`
  git config core.hooksPath .mygithooks
  
  # 查看是否修改成功了
  cd .git
  cat config
  ```

  ![image-20220317173218869](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523953.png)

* 调用`git commit`进行测试
  ![image-20220314163224077](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523954.png)

* 如果我们不想用.mygithooks配置了,就需要将git默认的访问的hooks目录修改回去
  ![image-20220314163510914](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523955.png)

## Husky

* 安装husky,并且执行husky,让git hooks生效

  ```bash
  # 安装husky,安装完之后,会在根目录下出现一个husky文件夹
  npm i husky -D
  # 执行husky
  npx husky install
  ```

  ![image-20220314165335755](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523956.png)

* 在package.json中配置scripts

  ```json
  {
      "scripts": {
          // 当一些husky命令执行前,就会去安装husky
          "prepare": "husky install"
      },
      // ...
  }
  ```

* 在husky目录下,创建pre-commit文件,并且编写内容`npx eslint ./src`
  ![image-20220314165513689](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523957.png)

* 调用`git commit`进行测试
  ![image-20220314170053699](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523958.png)

# resolve模块解析

## 解析规则

* webpack能解析的模块路径只有三种: 绝对路径,相对路径,模块路径

  ```js
  // 绝对路径
  import '/home/me/file';
  import 'C:\\Users\\me\\file';
  
  // 相对路径
  import '../utils/reqFetch';
  import './styles.css';
  
  // 模块路径, 会自动去node_modules目录下检索模块
  import 'module';
  import 'module/lib/file';
  ```

* 当解析到一个路径,指定了文件后缀名的时候,比如: "import Home from './components/home.js"

  * webpack会直接将其看作一个js模块引入

* 当解析到一个路径,没有指定文件后缀名的时候,比如: "import Home from './components/home", 他会先判断该Home是文件还是文件夹

  * 如果是文件
    * 会根据resolve配置的extentions属性,默认为 extensions: ['.js', '.json']
    * 这里是会将home当作是js模块引入(因为默认是最先解析为".js")
      * 如果该home不是js文件,就会报错
  * 如果是文件夹
    * 会根据resolve配置的mainFiles属性,默认为 mainFiles: ["index"]
    * 这里是去查看"/home/"目录下是否有名为index的文件
      * 如果没有index文件,就会报错
    * 然后根据extentions的配置,以默认的配置,最先看作是js文件来引入该模块
      * 如果该index不是js文件,就会报错

## extentions

```js
/*
    原先我们引入math.js文件
        import math from "./math.js" 可以
        import math from "./math" 也可以
    当"./"目录下,既有"math.json",也有"math.js"时,webpack默认是引入的"math.js",我们可以通过配置resolve的extensions让来修改获取的优先级
 */

module.exports =  {
    entry: './src/app.js',
    output: {clean: true},
    mode: "development",

    // 配置resolve的extensions,默认为 extensions: ['.js', '.json']
    resolve: {
        // 这里修改后,获取顺序就是: "math.json", "math.js", "math.wasm"
        extensions: ['.json', '.js', '.wasm'],
    }
};
```

```js
// 这里最优先获取的就是 math.json
import math from "./math"
```

## mainFiles

```js
/*
    我们原先通过 import "./api" 引入模块 (这里的api是个文件夹)
        * 由于resolve的mainFiles属性, 默认为 mainFiles: ["index"]
        * 所以我们默认是引入的是api目录下的index文件
        * 我们可以修改mainFiles值,引入其他的文件
 */

// webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "development",
    entry: "./src/app.js",
    output: {clean: true},
    plugins: [new HtmlWebpackPlugin(),],
    // 配置resolve的mainFiles属性
    resolve: {
        mainFiles: ["show"]
    }
}
```

```js
// 这里引入的就是"./api/show.js",而不是"./api.index.js"了
import "./api"
```

## alias

```js
/*
	通过配置alias对路径进行重命名
*/

// webpack.config.js 

const path = require('path');

module.exports =  {
    entry: './src/app.js',
    output: {clean: true},
    mode: "development",

    resolve: {
        alias: {
            // 将"E:\\project\\webpack\\demo03\\src"目录重命名为"@"
            '@': path.resolve(__dirname, './src')
        }
    }
};
```

```js
/*
    "/src/one/two/test.js"要引入"/src/math.js"
        绝对路径引入: import math from "E:\\project\\webpack\\demo03\\src\\math.js"
        相对路径引入: import math from "../../math.js"
    原先的两种引入方式都很麻烦,不合适,这里采用了alias重命名绝对路径后引入的方式就简单多了
*/

import math from '@/math'

console.log(math.add(10, 20))
```

# externals加载包

```js
/*
    有时候我们为了减小bundle的体积,从而把一些不变的第三方库用cdn的形式引入进来
        <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js"></script>

    我们想要在项目中使用这个库,就需要引入这个库,而我们本地又没有安装这个库,就无法引入使用,就可以配置externals配置项
 */

// webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports =  {
    entry: './src/app.js',
    output: {clean: true},
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        })
    ],
    /*
        // 方法1,这样编写,就需要我们手动去"./src/index.html"中,通过script引入第三方库,非常的麻烦
        externals: {
            jquery: 'jQuery' // 暴露在windows对象身上的对象名,所以这里写"jQuery"和"$"都可以
        }
     */

    // 方法2
    externals: {
        jquery: [
            // 第三方库cdn的路径
            "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js",
            // 暴露在windows对象身上的对象名
            "jQuery"
        ]
    },
    // 设置第三方库cdn是通过script标签的方式引入的
    externalsType: "script",
};
```

```js
// src/app.js

import $ from 'jquery'

console.log($)
```

# 依赖图

```js
/*
    每当一个文件依赖另一个文件时,webpack会直接将文件视为存在依赖关系,我们可以通过一些工具,看到这张依赖图
        * webpack-chart: webpack stats 可交互饼图
        * webpack-visualizer: 可视化并分析你的bundle, 检查哪些模块占用空间,哪些可能是重复使用的
        * webpack-bundle-analyzer: 一个 plugin 和 CLI 工具, 它将 bundle 内容展示为一个便捷的、交互式、可缩放的树状图形式
        * webpack bundle optimize helper: 这个工具会分析你的 bundle, 并提供可操作的改进措施, 以减少 bundle 的大小
        * bundle-stats: 生成一个 bundle 报告(bundle 大小、资源、模块), 并比较不同构建之间的结果

    我们这里以webpack-bundle-analyzer进行演示
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
// 安装并引入插件 (npm i webpack-bundle-analyzer -D)
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

module.exports =  {
    entry: {
        app1: "./src/app1.js",
        app2: "./src/app2.js"
    },
    output: {clean: true},
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin(),
        // 配置插件
        new BundleAnalyzerPlugin()
    ],
};
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523959.png)

# browserslistrc

* 我们在开发中,要去处理兼容性的问题,这就需要针对特定的浏览器做兼容处理,而我们如何筛选出需要做兼容的浏览器呢??

* 执行`npx browserslist`,可以筛选出符合要求的浏览器,并返回结果
  ![image-20220317111106734](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523960.png)

* 默认是采用内置的筛选规则,我们可以在`node_modules/browserslist`目录下看到,我们也可以配置自己的筛选规则,筛选出我们想要的浏览器

  * 配置方法1: 在package.json中配置

    ```json
    {
        "browserslist": [
            // 全球市场占有率 >1%
            ">1%",
            // 最新的两个版本
            "last 2 version",
            // 24个月之内还有更新的浏览器,都是not dead
            "not dead"
        ]
        // ...
    }
    ```

  * 配置方法2: 在项目根目录下,创建`.browserslistrc`文件

    ```
    > 1%
    last 2 version
    not dead
    ```

# PostCss

## Info

* PostCSS是一个用js来转化css代码的工具, 他本身没有什么功能,需要搭配各种插件使用, 比如:

  * autoprefixer插件, 自动获取浏览器的流行度和能够支持的属性,并根据这些数据帮我们自动的为css规则添加前缀,将最新的css语法转换成大多数浏览器都能理解的语法
  * postcss-nested插件, 让浏览器能识别嵌套形式的css样式

* 注意: 使用postcss的时候,需要配置好`.browserslistrc`,对筛选出来的浏览器做postcss处理

  ```
  > 1%
  last 2 version
  not dead
  ```

## 使用指令完成postcss处理

* 安装postcss

  * `npm i postcss -D`

* 为了能在终端使用postcss的命令,需要安装postcss-cli

  * `npm i postcss-cli -D`

* 运行postcss

  ```bash
  # 将"./src/test.css"通过postcss处理,转成"./src/ret.css"
  # "-o"是"output"的意思
  npx postcss -o ./src/ret.css ./src/test.css
  ```

* 由于postcss本身是没有什么功能的,我们上面那段命令其实不会对css样式做前缀的补充,我们需要搭配各种插件使用

* 安装插件

  ```bash
  # autoprefixer里面包含了很多对css做的前缀补充
  npm i autoprefixer -D
  ```

* 运行postcss,同时使用安装好的插件

  * `npx postcss --use autoprefixer -o ./src/ret.css ./src/test.css`

* 实现效果展示

  * 原来的./src/test.css文件

    ```css
    body {
        /* css3代码 */
        display: grid;
        transition: all 0.5s;
        user-select: none;
    }
    ```

  * 打包后做了前缀补充的./src/ret.css文件

    ```css
    body {
        display: grid;
        transition: all 0.5s;
        -webkit-user-select: none;
           -moz-user-select: none;
            -ms-user-select: none;
                user-select: none;
    }
    /*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBQ0ksYUFBYTtJQUNiLG9CQUFvQjtJQUNwQix5QkFBaUI7T0FBakIsc0JBQWlCO1FBQWpCLHFCQUFpQjtZQUFqQixpQkFBaUI7QUFDckIiLCJmaWxlIjoicmV0LmNzcyIsInNvdXJjZXNDb250ZW50IjpbImJvZHkge1xyXG4gICAgZGlzcGxheTogZ3JpZDtcclxuICAgIHRyYW5zaXRpb246IGFsbCAwLjVzO1xyXG4gICAgdXNlci1zZWxlY3Q6IG5vbmU7XHJcbn0iXX0= */
    ```

## postcss-loader

> 方法1: 直接在webpack.config.js中书写完整的配置

```js
/*
    如果每次都要使用postcss命令,来完成对css文件的处理,就非常的麻烦,我们可以通过postcss-loader来处理
 */

// webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "development",
    entry: "./src/app.js",
    output: {clean: true},
    plugins: [new HtmlWebpackPlugin(),],
    module: {
        rules: [
            {
                test: /\.css$/,
                // 记得安装这三个loader
                use: [
                    "style-loader",
                    "css-loader",
                    // 需要先使用postcss-loader将css文件处理完,然后交给css-loader继续处理
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                // 配置postcss需要使用到的插件
                                plugins: [
                                    // postcss-preset-env中集成了更多对样式的转换(比如: #1234567 -> rgba(12,34,56,78)
                                    require("postcss-preset-env"),
                                    /*
                                        //  autoprefixer已经被包含到了postcss-preset-env中了,所以我们只需要引入一个"postcss-preset-env"即可
                                        require("autoprefixer")
                                     */
                                ]
                                /*
                                    // 简化书写
                                    plugins: [
                                        // 有些预设,可以不用些require(),比如: "postcss-preset-env", 我们可以简化书写
                                        "postcss-preset-env"
                                    ],
                                    // 最终简化
                                    plugins: ["postcss-preset-env"]
                                 */
                            }
                        }
                    }
                ]
            },
        ]
    }
}
```

> 方法2: 将postcss-loader的插件配置抽离出来,简化书写 (推荐)

```js
// postcss.config.js 放在项目根目录下,这个名字不能变

module.exports = {
    plugins: [
        require("postcss-preset-env")
    ]
}
```

```js
// webpack.config.js 直接使用"postcss-loader"即可,不需要再配置了

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "development",
    entry: "./src/app.js",
    output: {clean: true},
    plugins: [new HtmlWebpackPlugin(),],
    module: {
        rules: [
            {
                test: /\.css$/,
                // 记得安装这三个loader
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader"
                ]
            },
        ]
    }
}
```

> 打包前的test.css

```css
body {
    color: #12345678;
    transition: all 0.5s;
    user-select: none;
}
```

> 打包后在浏览器展示的样式

![image-20220317153902276](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523961.png)

# importLoaders

```js
/*
    * 我们在app.js中引入了test1.css,然后test1.css中引入test2.css
        // app.js
        import "./test1.css"

        // test1.css
        @import "test2.css";
        body {
            color: #12345678;
        }

        // test2.css
        body {
            transition: all 0.5s;
            user-select: none;
        }
    * 我们这个时候进行打包,会出现一个问题: 我们只对test1.css中的代码进行了postcss-loader的处理,而引入的test2.css没有进行postcss-loader处理
    * 这是因为postcss-loader在处理test1.css的时候,看到@import,并没有深入进行进行处理
    * 我们可以给css-loader添加一个importLoaders属性来解决这个问题
 */

// webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "development",
    entry: "./src/app.js",
    output: {clean: true},
    plugins: [new HtmlWebpackPlugin(),],
    module: {
        rules: [
            {
                test: /\.css$/,
                // 记得安装这三个loader
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            // 当遇到css-loader处理的时候,找到了需要让前面的loader进行处理的代码,就向前找"1"个
                            // 这里的"postcss-loader"就紧接着"css-loader",向前找"1"个,就找到"postcss-loader",这样就可以让"postcss-loader"再重新处理没有处理的css代码
                            importLoaders: 1
                        }
                    },
                    "postcss-loader"
                ]
            },
        ]
    }
}
```

# babel

## Info

* 我们在编写程序的时候,都是直接使用一些高版本的语法(比如: es6+,ts,jsx...),而这些高版本的语法,浏览器并不能完全的识别
* 所以就需要通过babel,将这些高版本的语法转成低版本的语法,能让浏览器识别(效果和postcss一样)
* babel和postcss一样,本身没有什么作用,需要搭配各种工具包进行处理
* 注意: 使用babel的时候,需要配置好`.browserslistrc`,对筛选出来的浏览器做babel处理

## 使用指令完成babel处理

* 安装babel的核心部分@babel/core

  * `npm i @babel/core -D`

* 安装@babel/cli,不然无法在命令行中直接使用babel指令

  * `npm i @babel/cli -D`

* 运行babel

  ```bash
  # 将"./src"目录下的js文件进行babel处理,得到结果,放在"./build"目录下
  npx babel ./src --out-dir ./build
  ```

* 由于babel本身是没有什么功能的,我们上面那段命令其实不会对js代码进行转换,我们需要搭配各种插件来使用

* 安装@babel/preset-env预设

  ```bash
  # @babel/preset-env是一个预设(插件的集合),里包含了绝大多数对js的转化,以后使用这个预设就可以了
  npm i @babel/preset-env -D
  ```

* 运行babel,同时使用安装好的预设

  * `npx babel src --out-dir build --presets=@babel/preset-env`

* 实现效果展示

  * 原来的"./src"目录下的"app.js"文件

    ```js
    const name = "sun";
    const show = () => {
        console.log(name);
    }
    show();
    ```

  * 打包后做了转化处理的"./build"目录下的

    ```js
    "use strict";
    
    var name = "sun";
    
    var show = function show() {
      console.log(name);
    };
    
    show();
    ```

## babel-loader

> 方法1: 直接在webpack.config.js中书写完整的配置

```js
/*
    如果每次都要使用babel命令,来完成对js文件的兼容性处理,就非常的麻烦,我们可以通过babel-loader来处理
 */

// webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "development",
    entry: "./src/app.js",
    output: {clean: true},
    plugins: [new HtmlWebpackPlugin(),],
    module: {
        rules: [
            {
                test: /\.js$/,
                // 因为node_modules下的js文件,已经进行过了babel的处理,我们就不需要再进行处理了,避免造成冲突
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                            /*
                                // 设置浏览器筛选,但更建议写在.browserslistrc配置文件里
                                targets: "chrome 91"
                             */
                        }
                    }
                ]
            }
        ]
    }
}
```

> 方法2: 将babel-loader的插件配置抽离出来,简化书写 (推荐)

```js
/*
    babel.config.js 放在项目的根目录下
        这个名字,可以是: babel.config.js, babel.config.json, babel.config.mjs, babelrc.json, babelrc.js
 */

module.exports = {
    presets: ["@babel/preset-env"],
}
```

```js
// webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "development",
    entry: "./src/app.js",
    output: {clean: true},
    plugins: [new HtmlWebpackPlugin(),],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                // 直接使用babel-loader
                use: ["babel-loader"]
            }
        ]
    }
}
```

# CSS模块

## 全局开始css模块

> webpack.config.js

```js
/*
    就是多人编写的样式可能会冲突, 开启CSS模块可以解决这个问题

    开启css模块后,style.css中的类名会变成一段能唯一标识的字符串
        比如: "box"变成了"CzaAgobUWX_CxWL5kjyQ"
    页面中的标签使用的类名,就使用这唯一标识"CzaAgobUWX_CxWL5kjyQ",而不使用"box"
        比如: <div class="CzaAgobUWX_CxWL5kjyQ"><div>
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports =  {
    entry: "./src/app.js",
    output: {clean: true},
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    // 开启css模块
                    {
                        loader: "css-loader",
                        options: {
                            modules: true
                        }
                    },
                    'postcss-loader'
                ]
            }
        ]
    }
};
```

> src/app.js

```js
// 引入style.css模块,获取到的是各个类名的唯一标识
import style from "./style.css"
console.log(style) // {box: 'CzaAgobUWX_CxWL5kjyQ', header: 'PzuVM1hoLCoHwm8ADY45'}

const div = document.createElement("div");
// 给div标签添加class样式的唯一标识"CzaAgobUWX_CxWL5kjyQ"
div.classList.add(style.box);
document.body.appendChild(div);
```

> src/style.css

```css
.box {
    color: pink;
}

.header {
    background-color: pink;
}
```

> 浏览器显示效果

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523962.png)

## 部分开启css模块

* 我们一般给全局样式文件不开启css模块,给我们自己定义的样式文件开启css模块
* 我们可以通过给文件名添加一个`.global`来区分是否为全局样式文件, 比如:
    * body.global.css 全局样式文件,不需要开启css模块
    * header.css 我们的样式文件,需要开启css模块
* 我们在webpack.config.js的modules配置中,通过正则表达式来匹配 全局 和 普通,分别做出不同的处理

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path')
module.exports = {
    entry: "./src/app.js",
    output: {clean: true},
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin(),
    ],
    module: {
        rules: [
            // 处理全局样式文件
            {
                // 匹配有".global"的样式文件
                test: new RegExp(`^(.*\\.global).*\\.css`),
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader'
                    }
                ],
                // 排除"node_modules"文件夹
                exclude: [
                    path.resolve(__dirname, '..', 'node_modules')
                ]
            },
            // 处理普通样式文件
            {
                // 匹配没有".global"的样式文件
                test: new RegExp(`^(?!.*\\.global).*\\.css`),
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localIdentName: '[hash:base64:6]'
                        }
                    },
                    {
                        loader: 'postcss-loader'
                    }
                ],
                // 排除"node_modules"文件夹
                exclude: [
                    path.resolve(__dirname, '..', 'node_modules')
                ]
            }
        ]
    }
}
```

# webworkers(看不懂)

> Demand

* html5之前,打开一个常规的网页,至少存在三个线程(公用线程不计入在内),分别是: js引擎线程(处理js)、GUI渲染线程(渲染页面)、浏览器事件触发线程(控制交互)
* 当一段JS脚本长时间占用着处理机,就会挂起浏览器的GUI更新,而后面的事件响应也被排在队列中得不到处理,从而造成了浏览器被锁定进入假死状态
* html5提供了解决方案: webworker

> Info

* webWorkers提供了js的后台处理线程的API,它允许将复杂耗时的单纯js逻辑处理放在浏览器后台线程中进行处理,让js线程不阻塞UI线程的渲染
* 多个线程间也是可以通过相同的方法进行数据传递
* 单独写一个js脚本,然后使用new Worker来创建一个Work线程(即并不是将这个js脚本当作是一个模块引入,而是单独开一个线程去执行这个脚本)

> Employ

```js
// src/work.js

self.onmessage = ({ data: { question } }) => {
    self.postMessage({
        answer: 42,
    })
}
```

```js
// src/app.js

const worker = new Worker(new URL('./work.js', import.meta.url)); // mport.meta.url这个参数能够锁定我们当前的这个模块——注意，它不能在commonjs中使用
worker.postMessage({
    question:
    'hi，那边的workder线程，请告诉我今天的幸运数字是多少？',
});
worker.onmessage = ({ data: { answer } }) => {
    console.log(answer);
};
```

* 我们这时候执行打包命令,就会发现dist目录下除了bundle.js外,还有一个xxx.bundle.js
* 这说明我们的webpack5自动的将被new Work使用的脚本单独打出了一个bundle
* 我们加上刚才的问答代码，执行npm run dev，发现它是能够正常工作,并且在network里也可以发现多了一个src_worker_js.bundle.js

# 多页面应用

> webpack.config.js

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: {
        // 当app1.js,app2.js,app3.js中都使用到了lodash模块,我们也不要重复打包lodash模块,就可以通过dependOn来去重
        main1: {
            import: ['./src/app1.js', './src/app2.js'],
            dependOn: 'lodash',
            // app1.html独有main1.js模块,可以将main1.js和app1.html都放在channel1目录下
            // lodash.js模块是app1.html和app2.html共享的模块,可以将lodash.js模块放在common目录下,作为公共部分
            filename: "channel1/[name].js"
        },
        main2: {
            import: ['./src/app3.js'],
            dependOn: 'lodash',
            filename: "channel2/[name].js"
        },
        lodash: {
            import: 'lodash',
            filename: "common/[name].js"
        }
    },
    output: {clean: true},
    mode: "development",
    plugins: [
        // 将index1.html打包成app1.html
        new HtmlWebpackPlugin({
            // 设置title,主语需要在index1.html的title标签里填写`<%= htmlWebpackPlugin.options.title %>`
            title: "页面1",
            template: "./src/index1.html",
            // 设置不同文件名,做区分,同时放在不同的目录下
            filename: "channel1/app1.html",
            // 导入需要的模块
            chunks: ['main1', 'lodash'],
            // 分别设置不同的资源路径
            publicPath: "http://www.a.com"
        }),
        // 将index2.html打包成app2.html
        new HtmlWebpackPlugin({
            title: "页面2",
            template: "./src/index2.html",
            filename: "channel2/app2.html",
            chunks: ['main2', 'lodash'],
            publicPath: "http://www.b.com"
        })
    ],
}
```

> 项目结构

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523963.png)

# Tree Shaking

> 基本使用

```js
/*
    tree shaking 是一个术语, 通常用于描述移除 JavaScript 上下文中的未引用代码 (dead-code)
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/app.js',
    output: {clean: true},
    plugins: [
        new HtmlWebpackPlugin()
    ],
    // 配置优化
    optimization: {
        // 设置tree-shaking后,就可以将没有用到的代码全部摇掉,缩小打包后的main.js的体积
        usedExports: true
    }
}
```

> SideEffects 配置

```js
/*	
	webpack不能百分百安全地进行tree-shaking,有些模块导入,只要被引入,就会对应用程序产生重要的影响
		比如: 全局样式表 或者 设置全局配置的JavaScript文件
    Webpack认为这样的文件有"副作用",具有副作用的文件不应该做tree-shaking,因为这将破坏整个应用程序
    由于webpack不知道哪些文件是有副作用的,我们需要手动配置sideEffects,指定哪些文件是有副作用的,避免删除有重要影响的文件
*/

// package.json

{
    // 设置所有文件都有副作用,都不要删除,即关闭了tree-shaking
    "sideEffects": true,
    // 设置"*.css", "*.global.js"有副作用,不要删除,其他的随便删
    "sideEffects": ["*.css", "*.global.js"],
    
    // ...
}
```

# 渐进式网络应用程序PWA

```js
/*
    webpack-dev-server和http-server都是在本地用于创建服务器的,但是他们都是运行在非离线环境下的,即如果断开了服务器的连接,浏览器就无法获取数据了
    渐进式网络应用程序(progressive web application - PWA),可以实现运行在离线环境下,即断开服务器的连接,浏览器依旧能获取到数据
        这是通过使用名为 Service Workers 的 web 技术来实现的
        浏览器将页面的内容给缓存下来了
 */

// webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');
// 安装并引入"workbox-webpack-plugin"插件 (npm i workbox-webpack-plugin -D)
const WorkboxPlugin = require('workbox-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {clean: true},
    plugins: [
        new HtmlWebpackPlugin(),
        // 添加WorkBox
        new WorkboxPlugin.GenerateSW({
            // 这些选项可以帮助: 快速启用 Service Workers,跳出等待,不允许使用旧的 Service Workers
            clientsClaim: true,
            skipWaiting: true
        })
    ],
    devServer: {
        // 配置devMiddleware
        devMiddleware: {
            writeToDisk: true
        }
    }
}
```

```js
// src/app.js

console.log('hello world!!!!');

// 在浏览器注册 Service Workers
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then((registration) => {
            console.log('SW 注册成功', registration)
        }).catch((error) => {
            console.log('SW 注册失败', error)
        })
    })
}
```

# 预置全局对象

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 导入webpack模块
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {clean: true},
    plugins: [
        new HtmlWebpackPlugin(),
        // 预置全局对象
        new webpack.ProvidePlugin({
            // 将"lodash"做成了全局对象
            _: 'lodash'
        })
    ]
}
```

```js
// 在app.js中并没有引入"lodash",就能使用全局的"lodash"
let str = _.join(["hello", "world"], " ");
console.log(str);
```

# 改变模块中的this指向

```js
/*
    一些传统的模块依赖的 this 指向的是 window 对象, 当模块运行在 CommonJS 环境下这将会变成一个问题, 也就是说此时的 this 指向的是 module.exports
    我们可以通过 imports-loader 覆写 this, 让 this 重新指向 window
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {clean: true},
    plugins: [
        new HtmlWebpackPlugin(),
    ],
    module: {
        rules: [
            {
                // 匹配"./src/app.js"文件
                test: require.resolve("./src/app.js"),
                // 安装并配置imports-loader (npm i imports-loader -D)
                // 同时指定参数wrapper=window,让this指向window对象
                use: 'imports-loader?wrapper=window'
            }
        ]
    }
}
```

```js
// app.js中的this默认是指向的module.exports的,我们通过配置imports-loader,让this重新指向了window,从而能调用window身上的alert()
this.alert("hello world");
```

# 全局导出

```js
/*
    当global.js是一个外部模块,我们在app.js中想要使用其里面的方法和属性,但我们不知道global.js的具体导出方式,我们就无法使用对应的导入方式来导入内容
    这时,我们就可以在webpack.config.js中配置"全局导出",然后在app.js中,根据我们配置的导出的方式,采用对应的导入方式
 */

// webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {clean: true},
    plugins: [
        new HtmlWebpackPlugin(),
    ],
    module: {
        rules: [
            {
                // 匹配"./src/global.js"文件
                test: require.resolve("./src/global.js"),
                /*
                    安装并配置exports-loader (npm i exports-loader -D)

                    参数设置
                        * type=commonjs 设置模块导出类型为commonjs
                        * exports=data, multiple|math.add|add 导出global.js模块的 data属性 和 math.add()方法
                            * multiple|math.add|add 我们在引入的时候,直接引入add()即可,不用引入math了
                                * [single Foo] : module.exports = Foo
                                * [multiple Foo] : module.exports = {Foo}
                                * [multiple Foo FooA] : module.exports = {'FooA' : Foo}
                 */
                use: 'exports-loader?type=commonjs&exports=data, multiple|math.add|add'
            }
        ]
    }
}
```

```js
// src/app.js

// 根据我们在webpack.config.js中配置的导出方式,采用对用的导入方式
const {data, add} = require("./global");

console.log(data);
console.log(add(10, 20));
```

```js
// src/global.js

const data = "hello world";

const math = {
    add: function (x, y) {
        return x + y;
    },
    minus: function (x, y) {
        return x - y;
    }
}
```

# 加载vue文件

> 项目结构

![image-20220318094010428](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523964.png)

> public/index.html

```html
<!DOCTYPE html>
<html lang="">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title><%= htmlWebpackPlugin.options.title %></title>
</head>
<body>
<noscript>
    <strong
    >We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't
        work properly without JavaScript enabled. Please enable it to
        continue.
    </strong>
</noscript>
<div id="app"></div>
</body>
</html>
```

> src/App.vue

```vue
<template>
    <div>
        <h1 class="title">{{name}}</h1>
    </div>
</template>

<script>
export default {
    name: "App",
    data() {
        return {
            name: "sun"
        }
    }
}
</script>

<style lang="less" scoped>
    .title {
        color: pink;
    }
</style>
```

> src/app.js

```js
import Vue from "vue"
import App from "./App.vue";

Vue.config.productionTip = false;

new Vue({
    render: (h) => h(App),
}).$mount("#app");
```

> webpack.config.js

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
    mode: "development",
    entry: "./src/app.js",
    output: {

        clean: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Webpack App",
            template: "./public/index.html"
        }),
        // 配置vue的插件
        new VueLoaderPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 2
                        }
                    },
                    // 注意: 需要配置好postcss.config.js
                    "postcss-loader",
                    "less-loader"
                ]
            },
            // 处理vue文件
            {
                test: /\.vue$/,
                use: ["vue-loader"]
            }
        ]
    }
}
```

# Polyfill

## 加载Polyfill

```js
/*
    babel-loader是无法将所有的代码都转成浏览器能识别的代码的(比如: Promise(), Array.from() 这些新的语法,@babel/preset-env中并不包含),这时,就需要搭配polyfill做填充处理,补充一些新的语法
 */

// 安装并引入 @babel/polyfill (npm i @babel/polyfill)
import "@babel/polyfill"
// 这里使用到了Array.from,一些浏览器并不能识别这个语法,进行打包的时候,polyfill会将这段代码转换成低版本的语法,能让浏览器识别
console.log(Array.from([1, 2, 3], (x) => {
    return x + x;
}))
```

## 进一步优化polyfill

> 方法1: 直接在webpack.config.js中书写完整的配置

```js
/*
	* webpack4中是内置了polyfill,但这就导致了一个问题: 我们只想使用一个Array.from(),却要引入这么大一个包,所以webpack5中,就去除了内置,我们可以按需配置
	* webpack5将polyfill中核心的两个模块: core-js, regenerator-runtime 抽离了出来,我们不再需要引入整个@babel/polyfill包了
		* import "core-js/stable" // 将ECMAScript的核心功能都引入了
		* import "regenerator-runtime/runtime" // 将一些需要调用生成器的包都引入
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {clean: true},
    plugins: [
        new HtmlWebpackPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                // 需要排除node_modules目录,因为node_modules目录下的模块肯定已经配置完了polyfill补充,如果我们重复给它配置polyfill,会导致冲突
                exclude: /node_modules/,
                use: {
                    // 配置babel-loader (npm i babel-loader @babel/core @babel/preset-env -D)
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    /*
                                    	// 最好在 .browserslistrc文件 里配置筛选规则
                                        targets: [
                                            "> 1%",
                                            "last 1 version"
                                        ],
                                    */

                                    
                                    // useBuiltIns: false, // 不对当前的js处理做polyfill填充 
                                    // useBuiltIns: entry, // 依据我们在targets配置中筛选出来的浏览器,决定要添加哪些polyfill,注意: 配置了这个之后,需要我们手动去app.js中引入 "core-js/stable", "regenerator-runtime/runtime"
                                    useBuiltIns: "usage", // 按照我们在app.js中使用到语法,进行填充,即按需加载(推荐这个方式)
                                    
                                    // useBuiltIns默认使用的core-js的版本为2,而我们下载的core-js的版本是3所以如果不手动配置corejs: 3,就会报错
                                    corejs: 3
                                }
                            ]
                        ]
                    }
                }
            }
        ]
    }
}
```

> 方法2: 将babel-loader的插件配置抽离出来,简化书写 (推荐)

```js
//webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {clean: true},
    plugins: [
        new HtmlWebpackPlugin(),
    ],
    module: {
        rules: [
            // 配置babel-loader
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            }
        ]
    }
}
```

```js
// babel.config.js

module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                useBuiltIns: "usage",
                corejs: 3
            }
        ]
    ],
}
```

# library

## 创建一个library

```js
/*
    我们自己开发了一个模块,供其他人使用,就需要webpack来进行打包
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/app.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "mylib.js",
        // 导出成一个library,防止tree-shaking
        
        /*
            // 写法1,这种写只能被<script>标签引入,不能被其他的环境下,比如: commonjs, amd, node.js
            library: "mylib"
         */

        // 写法2,配置让这个library能在不同的环境下被引入使用
        library: {
			name: "mylib",
            /*
                type: "window", // 以window方式引入
                type: "commonjs" // 以commonjs方式引入
                type: "module", // 以es module的方式引入
             */
            type: "umd" // 适用于全部的引入方式
        },

        /*
            // 如果library里设置type的值为"module"后,就需要在这里配置experiments的outputModules值为true
            experiments: {
                outputModules: true
            },
         */

        /*
            // 如果报错 "self is not defined", 就编写下面这段代码
            globalObject: "globalThis",
         */
        clean: true
    },
    plugins: [
        new HtmlWebpackPlugin(),
    ],
}
```

## 发布一个npm-package

* 准备一个package

  ```js
  // webpack.config.js
  
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const path = require("path");
  
  module.exports = {
      mode: "development",
      entry: "./src/app.js",
      output: {
          path: path.resolve(__dirname, "dist"),
          filename: "webpack-numbers.js",
          library: {
              name: "webpackNumbers",
              type: "umd"
          },
          globalObject: "globalThis"
      },
      externals: {
          lodash: {
              commonjs: "lodash",
              commonjs2: "lodash",
              amd: "lodash",
              root: "_"
          }
      },
      plugins: [
          new HtmlWebpackPlugin()
      ]
  }
  ```

  ```js
  // app.js
  
  console.log("hello world")
  ```

  ```json
  // package.json
  
  {
      "name": "demo03",
      // 设置发布的版本号
      "version": "1.0.0",
      "description": "",
      // 设置发布的package文件目录
      "main": "dist/webpack-numbers.js",
      "scripts": {},
      "keywords": [],
      "author": "",
      "license": "ISC",
      "devDependencies": {
          "html-webpack-plugin": "^5.5.0",
          "webpack": "^5.70.0",
          "webpack-cli": "^4.9.2"
      }
  }
  ```

* 创建一个npm账户

* 查看自己的npm地址,是否为npm官网

  ![image-20220317084423505](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523965.png)

  * 如何地址不是那npm官网的地址,就执行`npm config set registry https://www.npmjs.com/`修改地址

* 进入到要发布的package的根目录下,登录npm
  ![image-20220317090214192](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523966.png)

  * 如果报出这样的错误
    ![image-20220317090607280](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523967.png)
    * 将npm升级到最新版本 `npm install npm@latest -g`
    * 删除本地`node_modules`依赖包
    * 清理缓存 `npm cache clean --force`
    * 安装依赖 `npm i`

* 发布package `npm publish`

* 打开npm官网,可以看到发布成功

# 开发环境,生产环境(拆分) 

## Info

* 我们目前只能通过mode的配置,实现生产环境和开发环境的切换
* 其实很多配置在生产环境和开发环境中存在不一致的情况(比如: 开发环境没有必要设置缓存, 生产环境还需要设置公共路径 ...)

## 动态配置环境变量

```js
/*
    webpack的运行指令,可以传入env参数
    	# 传入env参数 production=true 和 goal=local
    	webpack --env production --env goal=local
    	
    我们在webpack.config.js中接收到这个env参数,然后根据指定的参数,去动态的配置环境变量mode的值,即动态的指定是 开发模式 或 生产模式
        # 指定 生产模式
        webpack --env production
        # 指定 开发模式
        webpack --env development
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

// 我们在运行webpack时,同时传入参数 (webpack --env production --env goal=local)
// 通过函数的方式返回一个对象,同时也要获取env对象,这样就能获取到控制台传入的参数了
module.exports = (env) => {
    // 输出命令中传入的参数
    console.log(env) // { WEBPACK_BUNDLE: true, WEBPACK_BUILD: true, production: true,  goal: 'local' }
    console.log(env.production, env.goal) // true, "local"

    return {
        entry: {
            index: "./src/index.js",
        },
        output: {
            filename: "scripts/[name].[contenthash].js",
            path: path.resolve(__dirname, 'build'),
            clean: true,
        },
        
        // 通过判断控制台有没有传入参数 "production", 来确定选择的是 "production" 还是 "development"
        mode: env.production ? "production" : "development",

        plugins: [
            new HtmlWebpackPlugin({ template: "./src/index.html", filename: "app.html", inject: "body" }),
            new MiniCssExtractPlugin({ filename: 'styles/[contenthash].css' }),
        ],
        module: {
            rules: [
                {
                    test: /\.(css|less)$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
                },
            ]
        },
        optimization: {
            minimizer: [
                new CssMinimizerPlugin()
                // 当选择到production模式时,虽然已经打包成功,但是还没有进行压缩
                // 这时就需要安装一个"terser-webpack-plugin"的插件,来解决这个问题 (terser是webpack开箱即用的插件,即不需要我们手动配置的,但是这里没有生效,是因为"css-minimizer-webpack-plugin"插件的影响,需要我们手动配置一下)
                new TerserPlugin()
            ],

            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendors",
                        chunks: "all"
                    }
                }
            }
        }
    }
}
```

## 拆分配置文件

> Info

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523968.png)

* 我们可以将 生成环境 和 开发环境 做成两个配置文件, 放在/config目录下
  * 比如: /config/webpack.config.dev.js, /config/webpack.config.prod.js

> 开发环境的配置

```js
// webpack -c ./config/webpack.config.dev.js 以开发环境运行webpack

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: {
        index: "./src/index.js",
    },
    output: {
        // 开发环境没有必要做缓存,需要将 "scripts/[name].[contenthash].js" 中的 "[contenthash]" 删除掉
        filename: "scripts/[name].js",
        // 因为 webpack.config.dev.js 放在 /config 目录下, 所以应该输出在 "../build" 目录下
        path: path.resolve(__dirname, '../build'),
        clean: true,
        /*
            // 开发环境里没有必要配置公共路径,所有需要删掉
            publicPath: "http://loacalhost:8080/"
         */
        // 这里的"[contenthash]"就暂时保留下来吧
        assetModuleFilename: "images/[contenthash][ext]"
    },
    // 设置为开发模式
    mode: "development",
    // 开发环境需要调试代码,所有应该保留 devtool
    devtool: 'inline-source-map',
    // 开发环境需要通过 "webpack-dev-server" 提高开发效率
    devServer: {
        // 指定打开的目录是 "./build" ,注意这里不需要改成 "../build" !!!
        static: "./build"
    },
    plugins: [
        new HtmlWebpackPlugin({ template: "./src/index.html", filename: "app.html", inject: "body" }),
        new MiniCssExtractPlugin({ filename: 'styles/[contenthash].css' })
    ],
    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
            },
            {
                test: /\.jpg$/,
                type: 'asset/resource',
                generator: {
                    filename: "images/[contenthash][ext]"
                }
            }
        ]
    },

    optimization: {
        /*
            // 开发环境不需要压缩,所以删除
            minimizer: [
                new CssMinimizerPlugin()
            ],
         */

        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all"
                }
            }
        }
    }
}
```

> 生产环境的配置

```js
// webpack -c ./config/webpack.config.prod.js 以生产环境运行webpack

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
module.exports = {
    entry: {
        index: "./src/index.js",
    },
    output: {
        // 生产环境需要做缓存,所有应该在文件名里保留"[contenthash]"
        filename: "scripts/[name].[contenthash].js",
        // 因为 webpack.config.dev.js 放在 /config 目录下,所以应该输出在 "../build" 目录下
        path: path.resolve(__dirname, '../build'),
        clean: true,
        // 生产模式需要配置publicPath
        publicPath: "http://localhost:8080/"
    },
    // 设置为生产模式
    mode: "production",
    /*
        // 生产环境,不需要调试代码,devtool就不需要了
        devtool: 'inline-source-map',
     */

    /*
        // 生产环境就不需要"webpack-dev-server"了
        devServer: {
            static: "../build"
        },
     */
    plugins: [
        new HtmlWebpackPlugin({ template: "./src/index.html", filename: "app.html", inject: "body" }),
        new MiniCssExtractPlugin({ filename: 'styles/[contenthash].css' })
    ],

    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
            },
            {
                test: /\.jpg$/,
                type: 'asset/resource',
                generator: {
                    filename: "images/[contenthash][ext]"
                }
            }
        ]
    },

    optimization: {
        // 生产环境需要进行压缩,所以保留
        minimizer: [
            new CssMinimizerPlugin()
        ],
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all"
                }
            }
        }
    }
}
```

## npm脚本运行webpack

> package.json

```json
/*
    我们每次都需要在控制台输入一长串的命令(比如: "npx webpack -c ./config/webpack.config.dev.js"),非常的麻烦

    在package.json的scripts里配置npm脚本,就可以非常的方便的使用了
        * 运行开发模式  npm run start
        * 运行生产模式  npm run build
*/

{
    "scripts": {
        /*
        	这里运行webpack,就可以直接通过`webpack`执行,不需要`npx webpack`执行了
        		因为通过脚本执行,会去使用 "/node_modules" 下的webpack包
        		
            在开发模式下,就可以通过"webpack-dev-server"来运行webpack,提高开发效率
            在生产模式下,没有"webpack-dev-server"的相关配置,就不可以通过`webpack serve`来运行webpack
        */
        "start": "webpack serve -c ./config/webpack.config.dev.js",
        "build": "webpack -c ./config/webpack.config.prod.js"
    }
    // ...
}
```

> 警告处理

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523969.png)

这里显示某些文件在打包的时候,大小超过了预期,如果不想要显示这些警告,可以做以下配置

```js
// 只需要在webpack.config.prod.js里做这些配置,因为只有生产环境下才会有这些警告

// ...

module.exports = {
    // ...

    // 在performance里做配置
    performance: {
        hints: false
    }
}
```

## 提取公共配置(最终版本)

> 项目结构图

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311523970.png)

> config/webpack.config.dev.js

```js
/*
    保留开发模式独有的内容
*/

module.exports = {
    output: {
        filename: "scripts/[name].js",
    },
    mode: "development",
    devtool: 'inline-source-map',
    devServer: {
        static: "./build"
    },
}
```

> config/webpack.config.prod.js

```js
/*
    保留生产模式独有的内容
*/

const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
    output: {
        filename: "scripts/[name].[contenthash].js",
        publicPath: "http://localhost:8080/"
    },
    mode: "production",
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
            // 配置"terser-webpack-plugin"插件
            new TerserPlugin()
        ],
    },
    performance: {
        hints: false
    }
}
```

> config/webpack.config.common.js

```js
/*
    将 "config/webpack.config.dev.js" 和 "config/webpack.config.prod.js" 共同的部分抽离出来, 放在这里
*/

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: {
        index: "./src/index.js",
    },
    output: {
        path: path.resolve(__dirname, '../build'),
        assetModuleFilename: "images/[contenthash][ext]",
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({ template: "./src/index.html", filename: "app.html", inject: "body" }),
        new MiniCssExtractPlugin({ filename: 'styles/[contenthash].css' })
    ],
    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
            },
            {
                test: /\.jpg$/,
                type: 'asset/resource',
                generator: {
                    filename: "images/[contenthash][ext]"
                }
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all"
                }
            }
        }
    }
}
```

> config/webpack.config.js

```js
/*
    在这里合并成最终的 开发模式 和 生产模式

    通过merge()来合并多个模块
        安装并引入 merge() 方法 (npm i webpack-merge -D)
 */
const {merge} = require("webpack-merge");
const commonConfig = require("./webpack.config.common");
const developmentConfig = require("./webpack.config.dev");
const productionConfig = require("./webpack.config.prod");

// 通过传输env参数,完成指定是运行 开发模式 或 生产模式
module.exports = (env) => {
    switch (true) {
        case env.development:
            // 合并 commonConfig 和 developmentConfig 模块
            return merge(commonConfig, developmentConfig)
        case env.production:
            // 合并 commonConfig 和 productionConfig 模块
            return merge(commonConfig, productionConfig)
        default:
            // 返回一个Error对象
            return new Error("No matching configuration was found")
    }
}
```

> package.js

```json
{
    "scripts": {
        // 运行 "./config/webpack.config.js", 同时通过env来指定是什么模式
        "start": "webpack -c ./config/webpack.config.js --env development",
        "build": "webpack -c ./config/webpack.config.js --env production"
    }

    // ...
}
```

































































