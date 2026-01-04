# Info

## 小程序和普通网页开发的区别

![image-20220330194235020](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654400.png)

## 微信小程序二维码

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654402.png)

## 查看AppId

![image-20220330200644195](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654404.png)

appid:  wxdb5e82f70f83a4cc

## 创建小程序项目

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654405.png)

## 小程序的项目结构

![image-20220331093810580](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654406.png)

## 小程序的页面组成

![image-20220331093845198](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654407.png)

## 小程序中的js文件

![image-20220331090044986](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654408.png)

## 新建一个小程序的页面

![image-20220331085148279](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654409.png)

* 在app.json中编写要添加的页面"page/list/list" (这是"list.wxml"的简写)
* 开发工具会自动帮我们生成"list"目录(这个目录下包含了该页面需要用到的文件)
* 将"pages/list/list"放在第一行,就会作为小程序的首页显示 (默认为"pages/index/index"作为首页的)

## 自定义编译模式

* 我们在app.json中配置了pages节点"pages/index/index"是第一个页面
* 那么每次编译项目,模拟器默认都是打开的"pages/index/index"页面
* 如果我们此时在编写"pages/contact/contact",每次还需要通过手动操作进入到该contact页面,就非常的麻烦
* 此时就可以通过自定义编译模式,编译后,让模拟器显示"pages/contact/contact"页面,而不是"pages/index/index"页面
  * ![image-20220403193552982](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658652.png)
  * ![image-20220403193852450](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658653.png)

## 宿主环境

### 什么是宿主环境

![image-20220331090139724](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654410.png)

### 小程序的宿主环境

![image-20220331090230970](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654411.png)

* 小程序的宿主环境包含的内容
  * 通信模型
  * 运行机制
  * 组件
  * api

### 通信模型

![image-20220331091026743](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654412.png)

### 运行机制

> 小程序启动的过程

![image-20220331091201811](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654413.png)

> 页面渲染的过程

![image-20220331091221775](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654414.png)

### API

![image-20220331110228228](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654415.png)

## 配置文件

### app.json

![image-20220331094052152](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654416.png)

### project.config.json

![image-20220331094216098](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654417.png)

### sitemap.json

![image-20220331094258673](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654418.png)

### 页面.json

![image-20220331094331409](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654419.png)

# 协同工作和发布

## 权限管理需求

![image-20220331110851339](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654420.png)

## 成员组织结构

![image-20220331110924682](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654421.png)

## 开发流程

![image-20220331111011386](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654422.png)

## 成员管理

![image-20220331111048308](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654423.png)

## 成员权限

![image-20220331111147912](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654424.png)

![image-20220331111222171](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654425.png)

## 添加项目成员和体验成员

![image-20220331111633987](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654426.png)

## 小程序的版本

![image-20220331111800641](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654427.png)

![image-20220331111819694](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654428.png)

## 发布上线

![image-20220331112053008](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654429.png)

![image-20220331112009350](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654430.png)

![image-20220331112024644](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654431.png)

![image-20220331112039167](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654432.png)

![image-20220331112116644](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654433.png)

## 小程序码及推广

![image-20220402095735609](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654434.png)

## 查看运营数据

![image-20220402100441062](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654435.png)

# wxml常用组件

## view

![image-20220331102838607](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654436.png)

## sroll-view

![image-20220331103225376](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654437.png)

- scroll-view的常用属性
	* scroll-y: 指定纵向滚动
	* scroll-x: 指定横向滚动
	* scroll-top: 滚动的位置

## swiper

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654438.png)

> swpier的属性设置

![image-20220331101818222](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654439.png)

## text

![image-20220331104128346](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654440.png)

## rich-text

![image-20220331104408640](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654441.png)

## button

![image-20220331105020427](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654442.png)

## image

![image-20220331105151581](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654443.png)

![image-20220331105715196](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654444.png)

# wxml模板语法

## wxml和html的区别

![image-20220331085759247](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654445.png)

## 数据绑定

![image-20220402102020432](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654446.png)

## wx:if, hidden

```html
<!--
    * 条件渲染有两种方式
        * wx:if属性
        * hidden属性
    * 使用建议:
        * 频繁切换时,使用hidden
        * 控制条件复杂时,使用wx:if,wx:elif,wx:else
-->

<!-- 
    wx:if 就类似于 v-if
        * 判断为false,就会删除该标签
    block标签 就类似于 template标签, 不会渲染到页面结构中
        * 可以搭配 wx:if 使用
 -->
<block wx:if="{{type === 0}}">
    <view>女</view>
</block>

<!-- wx:elif,wx:else 就类似于 v-else-if,v-else  -->
<block wx:elif="{{type === 1}}">
    <view>男</view>
</block>

<block wx:else>
    <view>未知</view>
</block>

<!-- 也可以在{{}}中进行计算 -->
<block wx:if="{{type - 1 === 0}}">
    <view>hello world</view>
</block>

<!--
     hidden 就类似于 v-show
        * 判断为false,就会隐藏该标签
        * hidden 不可以搭配 block标签 使用
 -->
<view hidden="{{type === 1}}">hello world</view>
```

## wx:for

```html
<!-- wx:for遍历arr数组 -->
<view wx:for="{{arr}}">
    索引: {{index}} - item项: {{item}}
</view>

<!-- 给index,item重命名 -->
<view 
    wx:for="{{arr}}"
    wx:for-index="i"
    wx:for-item="name"
>
    索引: {{i}} - item项: {{name}}
</view>

<!-- 
    添加key之后,可以提高运行效率
        * 如果不添加,会有警告
        * 我们这里是将遍历的index作为索引的
-->
<view wx:for="{{arr}}" wx:key="index">
    索引: {{index}} - item项: {{item}}
</view>

<!-- wx:for遍历对象数组,将对象的id属性作为key -->
<view wx:for="{{userList}}" wx:key="id">
    索引: {{index}} - id: {{item.id}} - item项: {{item.name}} 
</view>
```

```js
Page({
    data: {
        arr: ["sun", "xue", "cheng"],
        userList: [
            {id: "001", name: "sun"},
            {id: "002", name: "xue"},
            {id: "003", name: "cheng"},
        ]
    },
})
```

# wxss模板样式

## wxss和css的区别

![image-20220331085848909](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654447.png)

## rpx

> rpx实现原理

![image-20220402164542451](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654448.png)

> rpx和px之间的换算

![image-20220402165726539](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654449.png)

## @import

![image-20220402171252624](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654450.png)

## 全局样式,局部样式

![image-20220402171644529](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654451.png)

![image-20220402171634392](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654452.png)

# 事件绑定

## 基本使用

```html
<view>pages/home/home</view>

<!--
     绑定tap事件
        * 方法1 bind:tap
        * 方法2 bindtap (推荐)
 -->
<button type="primary" bindtap="add">点我</button>
```

```js
// pages/home/home.js

Page({
    data: {
        count: 0
    },
    // tap事件的add回调函数
    add(e) {
        console.log(e.target, "触发了事件");
        /*
            {dataset: {}, id: ""...}
                dataset: {}
                id: ""
                offsetLeft: 96
                offsetTop: 21
                __proto__: Object
        */

        // 访问data中的属性
        console.log(this.data.count);

        // 修改data中的属性 (方法1 推荐)
        this.setData({
            count: this.data.count + 1
        })
        // 修改data中的属性 (方法2)
        this.data.count++;
    }
})
```

## 事件类型

* tap
  * 手指触摸后马上离开就触发,类似与click
* input
  * 文本框输入了内容后就触发
* change
  * 状态发生改变就触发

## 事件对象

```html
<!--
    将tap事件绑定在view1身上
 -->
 <view id="view1" bindtap="show">
    <view id="view2">点我</view>
 </view>
```

```js
Page({
    data: {
        count: 0
    },
    show(e) {
        // 事件类型
        console.log(e.type); // tap

        // 从页面打开到触发事件所经历的时间戳
        console.log(e.timeStamp); // 55112

        /*
            e.target 和 e.currentTarget 都是触发事件的组件的一些属性的集合
                * e.target 指向触发事件的源头组件
                * e.currentTarge 指向绑定了事件的组件
            比如: 这里view1绑定了tap事件,我们是点击的view2,然后事件冒泡到view1,触发了view1的事件
                * e.target 指向view2
                * e.curentTarget 指向 view1
        */
        console.log(e.target); // {id: "view2", offsetLeft: 0, offsetTop: 21, dataset: {…}}
        console.log(e.currentTarget); // {id: "view1", offsetLeft: 0, offsetTop: 21, dataset: {…}}

        // 一些额外信息,比如这里的是触摸点的x.y坐标
        console.log(e.detail); // {x: 39.0999755859375, y: 30.862503051757812}

        // 触摸事件,一个数组保存了当前停留在屏幕中的触摸点信息
        console.log(e.touches);
            /*
                [{…}]
                    0: {identifier: 0, pageX: 105.2249755859375, pageY: 31.925003051757812, clientX: 105.2249755859375, clientY: 31.925003051757812, …}
                    length: 1
                    nv_length: (...)
                    __proto__: Array(0)
            */

        // 触摸事件,一个数组保存了当前变化的触摸点信息
        console.log(e.changeTouches);
    }
})
```

## 事件传参 (自定义属性)

```html
<!-- 
    使用data-info,data-num属性来传递info,num参数
        * 无法直接使用show("hello world", 10)传参
        * 想要传递数值类型的参数,需要加上{{}}
 -->
<button 
    bindtap="show"
    data-info="hello world"
    data-num="{{10}}"
>
    点我
</button>
```

```js
Page({
    data: {
        count: 0
    },
    show(e) {
        // 可以在e.target.dataset中访问到自定义属性
        console.log(e.target.dataset); // {info: "hello world", num: 10}

        // 将数据保存到data中
        this.setData({
            info: e.target.dataset.info,
            num: e.target.dataset.num
        })

        // 访问data中的属性
        console.log(this.data.info, this.data.num); // hello world 10
    }
})
```

# 全局配置

## tabBar配置

![image-20220402202745918](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654455.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654456.png)

```json
// app.json

{
    // 配置页面
	"pages": [
		"pages/home/home",
		"pages/message/message",
		"pages/contact/contact"
	],
	"window": {
		"navigationBarTitleText": "小孙编程",
		"navigationBarBackgroundColor": "#999",
		"navigationBarTextStyle": "white"
	},
	"tabBar": {
		// tabBar处于页面的底部
		position: bottom, // bottom 或 top, 默认为bottom, 如果为top,就只能显示文字,无法显示图标
		// tabBar与页面之间的边框颜色,
		"borderStyle": "black", // black 或 white, 默认为black
		// 未选中的tabBar的文字颜色
        "color": "#000000", // 默认为"#000000"
        // 选中的tabBar的文字颜色
        "selectedColor": "#c00000",
        // tabBar的背景颜色
		"backgroundColor": "#efefef",
        // 在list配置项中配置tabBar
		"list": [
            // 第一个tarbar的pagePath必须得是当前所在的页面 (比如: 我们在home页面,那么第一个pagePath得是home页面,如果是message页面就不会显示tarbar)
            // 配置完成之后 home页面, message页面, contact页面 就都是tabBar页面了 
            
            // 配置home页面的tarbar
			{
				"pagePath": "pages/home/home", // 必填; 页面路径
				"text": "index", // 必填; tabBar的文字
				"iconPath": "/images/home.png", // 可选; 未选中的tabBar的图标路径
				"selectedIconPath": "/images/home-active.png" // 可选; 选中的tabBar的图标路径
			},
            // 配置message页面的tarbar
			{
				"pagePath": "pages/message/message",
				"text": "message",
				"iconPath": "/images/message.png",
				"selectedIconPath": "/images/message-active.png"
			},
            // 配置contact页面的tarbar
			{
				"pagePath": "pages/contact/contact",
				"text": "contact",
				"iconPath": "/images/contact.png",
				"selectedIconPath": "/images/contact-active.png"
			}
		]
	},
	"style": "v2",
	"sitemapLocation": "sitemap.json"
}
```

## navigationBar配置

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654454.png)

## 下拉刷新

![image-20220402174529493](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654457.png)

## 上拉触底

```json
// app.json

{
    "window": {
        // 上拉触底是移动端的专有名词,通过手指向上拉滑动,滑动到页面最底端,实现触底的操作 (我们一般快要触底的时候,会去加载更多的数据,实现上拉触底加载功能)
        // 设置距离底部150px,完成上拉触底操作,默认为50,我们一般不需要去改动
        "onReachBottomDistance": 150
    }
}
```

# 局部配置

## navigationBar配置

```json
// pages/home/home.json 配置home页面的json文件

{
	// 配置navigationBar,配置项和app.json中的一样
    "navigationBarBackgroundColor": "#ff0000",
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "主页"
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654458.png)

## 下拉刷新

```json
// pages/home/home.json 更建议在 页面.json 中给指定页面开启下拉刷新功能,而不是在 app.json 中给所有的页面都开启下拉刷新功能

{
	// 开启下拉刷新功能
    "enablePullDownRefresh": true,
    // 下拉刷新界面的背景色
    "backgroundColor": "#efefef",
	// 小圆点样式 "dark" 或 "light"
    "backgroundTextStyle": "dark"
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654459.png)

## 上拉触底

```json
// pages/home/home.json 给home页面单独配置上拉触底的距离,如果app.json中也配置了,那么会覆盖掉app.json中的配置

{
	// 设置距离底部150px,完成上拉触底操作,默认为50,我们一般不需要去改动
	"onReachBottomDistance": 150
}
```

# 网络数据请求

## 小程序中网络数据请求的限制

![image-20220403100153290](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654460.png)

## 配置request合法域名

![image-20220403100905461](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654461.png)

![image-20220403100850388](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654462.png)

![image-20220403100922442](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654463.png)

## wx.request

```js
// pages/home/home.js

Page({
    show() {
        wx.request({
            // 请求路径
            url: 'https://api.uixsj.cn/hitokoto/get',
            // 请求方式
            method: "GET",
            // 携带的参数
            data: {
                type: "zha"
            },
		
	        // wx身上的异步api都有三个回调函数: success, fail, complete

            // 成功的回调
            success: (res) => {
                console.log(res);
                    /*
                        {...}
                            cookies: []
                            data: "我很能干但有一件事不会。什么?不会离开你。"
                            errMsg: "request:ok"
                            header: {Server: "nginx", Date: "Wed, 06 Apr 2022 23:02:50 GMT", Content-Type: "text/html; charset=UTF-8", Transfer-Encoding: "chunked", Connection: "keep-alive", …}
                            statusCode: 200
                            __proto__: Object
                    */
                console.log(res.data); // "我很能干但有一件事不会。什么?不会离开你。"
            },
            // 失败的回调
            fail() {
                console.log("error");
            },
            // 不管 成功/失败 请求结束后就会执行
            complete() {
                console.log("完成了");
            }
        })
    },

    // 页面一加载就会执行该回调函数 (生命周期函数)
    onLoad() {
        // 在页面刚加载好时调用show()
        this.show();
    }
})
```

* wx身上的api,一般都有success(),fail(),complete()

## 跳过request合法域名校验

![image-20220403105137359](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654464.png)

## 跨域和ajax说明

![image-20220403105313639](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654465.png)

# 页面导航

## Info

- 页面导航: 页面之间的相互跳转
- 小程序中有两种页面导航的方式
	- 声明式导航: navigator标签
	- 编程式导航: wx.navigateTo(), wx.switchTab() `java` 

## 声明式导航

### 跳转页面

```html
<!-- 
    通过navigator标签实现页面的跳转 (声明式导航)
        - url: 跳转的页面路径
        - opent-type: 跳转的方式
 -->

<!-- 跳转到tabBar页面 -->
<navigator url="/pages/message/message" open-type="switchTab">跳转到message页面</navigator>

<!-- 跳转到非tabBar页面 -->
<navigator url="/pages/info/info" open-type="navigate">跳转到info页面</navigator>

<!-- open-type默认值为"navigate",即跳转到非tabBar页面,可以省略open-type属性 -->
<navigator url="/pages/info/info">跳转到info页面</navigator>
```

### 后退页面

```html
<!-- navigator标签 设置 open-type属性 和 delta属性 可以实现页面的后退 (类似于浏览器的后退按钮) -->

<navigator open-type="navigateBack" delta="2">后退2级</navigator>

<navigator open-type="navigateBack">后退1级, delta默认为1</navigator>
```

## 编程式导航

### 跳转页面

```html
<!-- 跳转到tabBar页面 -->
<button bindtap="toMessage">跳转到message页面</button>

<!-- 跳转到非tabBar页面 -->
<button bindtap="toInfo">跳转到info页面</button>
```

```js
Page({
    toMessage() {
        // 跳转到tabBar页面
        wx.switchTab({
            url: "/pages/message/message"
        });
    },
    toInfo() {
        // 跳转到非tabBar页面
        wx.navigateTo({
            url: "/pages/info/info"
        })
    }
});
```

### 后退页面

```html
<button bindtap="goBackTwoStep">后退2级</button>

<button bindtap="goBackOneStep">后退1级</button>
```

```js
Page({
    goBackTwoStep() {
        // 后退2级
        wx.navigateBack({
            delta: 2
        })
    },
    goBackOneStep() {
        // 后退1级,delta默认为1
        wx.navigateBack()
    }
})
```

## 导航传参

### 声明式导航传参 

```html
<!-- 在url中配置参数 -->
<navigator url="/pages/info/info?name=sun&age=18">跳转到info页面</navigator>
```

### 编程式导航传参

```html
<button bindtap="toInfo">跳转到info页面</button>
```

```js
Page({
    toInfo() {
        wx.navigateTo({
            // 在url中配置参数
            url: "/pages/info/info?name=sun&age=18"
        })
    }
});
```

### onLoad()接受参数

```html
<!-- pages/home/home -->

<!-- 跳转到info页面,同时传递name和age参数  -->
<navigator url="/pages/info/info?name=sun&age=18">跳转到info页面</navigator>
```

```js
// pages/info/info 在onLoad()生命周期函数中接受传递来的页面参数

Page({
    data() {
        // 接受传递来的页面参数
        query: {}
    },

    // 生命周期函数 - 页面一加载就调用
    onLoad: function (options) {
        // 声明式导航 和 编程式导航 实现页面跳转时传递的页面参数都放在了options中
        console.log(options); // {name: "sun", age: "18"}

        // 将接受到的页面参数保存在data节点的query中
        this.setData({
            query: options
        })

        console.log(this.data.query); // {name: "sun", age: "18"}
    }
})
```

# 页面事件

## 下拉刷新事件

![image-20220403162612824](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658655.png)

## 上拉触底事件

![image-20220403163543730](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658656.png)

# 小程序的生命周期

## 生命周期分类

![image-20220403194600853](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658657.png)

## 生命周期函数

![image-20220403195646559](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658658.png)

## 应用的生命周期函数

```js
// app.js

App({
	// 当小程序初始化完成时,会触发onLaunch()（全局只触发一次）
	onLaunch: function () {},

	// 当小程序从后台进入前台 或 当小程序启动,会触发onShow()
	onShow: function (options) {},

	// 当小程序从前台进入后台,会触发onHide()
	onHide: function () {}
})
```

## 页面的生命周期函数

```js
// 页面.js

Page({
    // 监听页面初次渲染完成 (一个页面只触发一次)
    onReady: function () {},
    
    // 监听页面加载 (一个页面只触发一次)
    onLoad: function (options) {},
	
    // 监听页面卸载 (一个页面只触发一次)
    onUnload: function () {},
    
    // 监听页面显示
    onShow: function () {},

    // 监听页面隐藏
    onHide: function () {},
})
```

# wxs

## wxs简介

![image-20220403201529350](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658659.png)

![image-20220403201545947](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658660.png)

##  wxs和js的区别

![image-20220403201450777](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658661.png)

## wxs的特点

> 不能作为组件的事件回调

![image-20220404094142162](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658662.png)

> 隔离性

![image-20220404094213044](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658663.png)

> 性能好 

![image-20220404094231740](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658664.png)

## 基本使用

![image-20220404093841620](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658665.png)

# 组件

## 小程序组件的特点

![image-20220406142047506](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658666.png)

## 创建组件

![image-20220406101028150](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658667.png)![image-20220406101125229](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658668.png)

## 基本使用

> 局部配置组件

![image-20220406102052486](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658669.png)

> 全局配置组件

![image-20220406103040807](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658670.png)

## data,methods

![image-20220406150635264](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658671.png)

## 组件样式

### 组件样式的隔离

![image-20220406143543299](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658672.png)

### 组件样式的隔离选项

![image-20220406143420084](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658673.png)

![image-20220406144050574](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658674.png)

![image-20220406143742497](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658675.png)

### 组件样式的注意点

![image-20220406143532104](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658676.png)

## properties

```html
<!--pages/home/home.wxml-->

<!-- 给组件传递参数 -->
<my-test num1="10" num2="20"></my-test>
```

```js
// components/test/test.js

Component({
    // 接受参数
    properties: {
        // 方法1
        num1: Number, // 指定数据类型
        // 方法2
        num2: {
            type: Number, // 指定数据类型
            value: 0 // 指定默认值
        }
    },
    methods: {
        // 访问传递过来的参数
        showData() {
            console.log(this.properties.num1); // 10
            console.log(this.properties.num2); // 20
        },
        // 修改传递过来的参数
        setData() {
            // 方法1
            this.properties.num1++;
            // 方法2
            this.setData({
                num1: this.properties.num1 + 1
            })
        }
    }
})
```

## observers

```html
<!--components/test/test.wxml-->

<view>{{num1}}, {{num2}}</view>

<button bindtap="update">修改数据</button>
```

```js
// components/test/test.js

Component({
    data: {
        num1: 10,
        num2: 20,
        person: {
            name: "sun",
            age: 18,
            job: {
                type: "java工程师",
                sal: "50k"
            }
        }
    },
    methods: {
        update() {
            this.setData({
                num1: this.properties.num1 + 1,
                num2: this.properties.num2 + 1,
                "person.name": "sun",
                "person.job.type": "web工程师"
            })
        }
    },
    // 监听器: 监听数据的改变
    observers: {
        // 监听基本类型的数据 (监听多个数据时,就用","分隔开)
        "num1, num2": function (newNum1, newNum2) { // 函数的接受的参数是num1和num2的新值
            console.log(newNum1, newNum2); // 11 21
        },
        // 监听对象类型的数据
        "person.name, person.job": function (newName, newJob) {
            console.log(newName, newJob); // sun {type: "web工程师", sal: "50k"}
        },
        // 监听对象中所有属性
        "person.**": function(newPerson) {
            console.log(newPerson) // {num1: 11, num2: 21, person: {…}}
        }
    }
})
```

## 纯数据字段

![image-20220406154759365](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658677.png)

```js
// components/test/test.js

Component({
    // 配置纯数据字段的形式
    options: {
        // 通过正则指定所有"_"开头的data字段都是纯数据字段
        purDataPattern: /^_/
    },
    data: {
        num1: true, // 普通数据字段
        _num1: true // 纯数据字段
    }
})
```

## 组件的生命周期

```js
Component({
    // 新方式创建生命周期函数 (推荐)
    lifetimes: {
        // 组件刚被创建时触发,还没有进行初始化
        created() {
            // 此时this.data还没有初始化,不可以调用setData()
            // 一般用于给组件的this添加一些自定义的属性字段
        },
        
        // 组件被初始化完毕,刚被放入到页面中(放入到页面节点树中),还没有进行ui渲染时触发
        attached() {
            // 此时this.data已被初始化完毕,可以调用setData()
            // 一般用于处理大多数的初始化工作
        },
        
        // 组件渲染完毕时触发
        ready() {},
        
        // 组件发生移动时触发
        moved() {},
        
        // 组件销毁时(离开页面节点树)触发
        detached() {
            // 退出一个页面时,会触发页面中所有的自定义组件的detached()
            // 一般用于处理一些清理性质的工作
        },
        
        // 每当组件方法抛出异常时触发
        error(Error) {
            console.log(Error);
        }
    },
    
    // 旧方式调用创建生命周期函数
    created() {},
    attached() {},
    ready() {},
    moved() {},
    detached() {},
    error(Error) {}
})
```

## 组件所在页面的生命周期

```js
/*
    自定义组件的行为依赖于页面状态的变化,就需要用到组件所在页面的生命周期函数了
*/
Component({
    pageLifetimes: {
        // 组件所在页面显示时触发
        show: function () {
            console.log("show()");
        },
        // 组件所在页面隐藏时触发
        hide: function () {
            console.log("hide");
        },
        // 组件所在页面的窗口大小发生改变时触发
        resize: function () {
            console.log("resize");
        }
    }
})
```

## 插槽

### 单个插槽

```html
<view>pages/home/home.wxml</view>

<!-- 编写要插入到test组件插槽里的内容 -->
<my-test>
    home页面通过插槽填充的内容
</my-test>
```

```html
<view>components/test/test.wxml</view>

<!-- home组件插入的内容,就插入到这个slot标签中 -->
<slot></slot>

<view>hello world</view>
```

![image-20220406163113576](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658678.png)

### 多个插槽

```js
Component({
    // 开启多个插槽功能的支持
    options: {
        multipleSlots: true
    }
})
```

```html
<view>pages/home/home.wxml</view>

<!-- 指定要插入的插槽的名字 -->
<my-test>
    <view slot="after">我想插入到after插槽中</view>
    <view slot="before">我想插入到before插槽中</view>
</my-test>
```

```html
<view>components/test/test.wxml</view>

<!-- 配置name来表示不同的插槽 -->
<slot name="before"></slot>
---------------------------------
<slot name="after"></slot>
```

![image-20220406163717020](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658679.png)

## 父子组件之间的通信

### 方法1: properties传参

> pages/home/home

```html
<!-- 
    属性绑定,用于父向子通信,但是只能传递数据,无法传递方法
 -->

<!--传递参数-->
<my-test name="{{name}}"></my-test>
```

```js
Page({
	data: {
		name: "sun"
	}
})
```

> components/test/test

```html
<view>{{name}}</view>
```

```js
Component({
    // 接受参数
    properties: {
        name: String
    }
})
```

### 方法2: 自定义事件绑定

>pages/home/home

```html
<!-- 
    自定义事件绑定,用于子向父通信,可以传递方法
 -->

<!-- 
    绑定自定义事件
        * 方法1: bind:showInfo (推荐)
        * 方法2: bindshowInfo
 -->
<my-test bind:showInfo="showInfo"></my-test>
```

```js
Page({
	data: {
		name: "sun"
	},
	showInfo(e) {
        // 通过e.detail访问到子组件传递来的参数
		console.log(e); // {type: "showInfo", timeStamp: 11678, detail: {info: "hello world"}…}
		console.log(e.detail.info); // hello world
	}
})
```

> components/test/test

```html
<button bindtap="deliver">点我</button>
```

```js
Component({
    data: {
        info: "hello world"
    },
    methods: {
        deliver() {
            /*
                触发父类的自定义事件
                    this.triggerEvent(showInfo) 调用父组件的showInfo()
                    this.triggerEvent(showInfo, {info: this.data.info}) 调用并传参
            */
            this.triggerEvent("showInfo", {
                info: this.data.info
            })
        }
    }
})
```

### 方法3: 获取组件实例

> pages/home/home

```html
<!-- 
    selectComponent(),获取到子组件的实例对象,从而直接访问子组件的任意数据和方法
 -->

<my-test class="my-test" id="my-test"></my-test>

<button bindtap="show">点我</button>
```

```js
Page({
	data: {
		name: "sun"
	},
	show() {
		// 调用selectComponent(),获取到子组件的实例对象
		const child1 = this.selectComponent(".my-test") // class选择器
		const child2 = this.selectComponent("#my-test") // id选择器

		// 访问子组件属性
        console.log(child1.data);
		console.log(child1.data.info); // hello world
        
		// 修改子组件属性
		child1.setData({
			info: "i am iron man"
		})
		console.log(child1.data.info); // i am iron man
        
		// 调用子组件方法
		child1.show(); // show()
	}
})
```

> components/test/test

```js
Component({
    data: {
        info: "hello world"
    },
    methods: {
        show() {
            console.log("show()");
        }
    }
})
```

## behaviors

```js
/*
    behaviors用于实现组件间代码共享,类似于vue里的mixins
*/

// behavior/my-behavior.js

module.exports = Behavior({
    // 定义属性
    data: {
        name: "sun"
    },
    // 定义方法
    methods: {
        show() {
            console.log("name is " + this.data.name);
        }
    },
    // 定义参数
    properties: {},
    // 定义生命周期函数
    lifetimes: {},
    // 定义behaviors
    behaviors: [],
})
```

```js
// components/test/test.js

// 引入behaviors
const myBehaviors = require("../../behaviors/my-behaviors")

Component({
    // 配置behaviors
    behaviors: [myBehaviors],
})
```

```html
<view>components/test/test.wxml</view>

<!-- 访问behaviors中的属性 -->
<view>{{name}}</view>
```

> 组件和它引用的behavior中可以包含同名的字段,会进行如下的处理

* 如果有同名的properties,methods
  * 覆盖规则: `组件本身` > `behavior`,  `靠后的behavior` > `靠前的behavior`, `引用者behavior` > `被引用者behavior`
    * `组件本身` > `behavior`: 组件本身的同名属性和方法覆盖behavior中的同名属性和方法
    * `靠后的behavior` > `靠前的behavior`: 组件的behaviors配置项数组中靠后的behavior中的同名属性和方法覆盖靠前的behavior的同名属性和方法
    * `引用者behavior` > `被引用者behavior`: 一个behavior嵌套另一个behavior,引用者behavior的同名属性和方法覆盖被引用者behavior的同名属性和方法
* 如果有同名的data
  * 如果都是对象类型的数据,会进行对象合并,否则根据覆盖规则进行覆盖操作
  * 覆盖规则: `组件本身` > `behavior`,  `靠后的behavior` > `靠前的behavior`, `引用者behavior` > `被引用者behavior`
* 生命周期函数不会相互覆盖,而是在对应触发时机被逐个调用
  * 不同的生命周期函数,会遵循组件生命周期函数的执行顺序
  * 对于同种生命周期函数,遵循规则: `behavior` > `组件本身`, `靠前的behavior` > `靠后的behavior`, `被引用者behavior` > `引用者behavior`
  * 如果同一个behavior被一个组件多次引用,它定义的生命周期函数只会被执行一次 

# npm包

## 小程序对npm包的支持与限制

* 小程序对npm包有如下3个限制
  * 不支持依赖**Node.js内置库**的包
    * 比如: http-server依赖Node.js中内置库fs, http
  * 不支持依赖**浏览器内置对象**的包
    * 比如: jquery依赖于浏览器的内置对象window
  * 不支持依赖**c++插件**的包
    * 比如: 一些负责加密的包会依靠c++插件来提高性能
* 因此能在小程序中使用的包不是很多

## 构建npm

![image-20220407091709318](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658680.png)

* 每次通过npm安装好包之后,小程序无法直接从node_modules目录下读取到包,需要通过npm构建,将node_modules目录下的包读取到miniprogram_npm目录下
* 构建npm之前,最好将之前的miniprogram_npm目录删除,防止出现各种各样的错误

## Vant Weapp 组件库

### 安装与构建

> 通过npm安装

```bash
# 初始化项目
npm init -y
# 安装@1.3.3的Vat Weapp组件库
npm i @vant/weapp@1.3.3 -S --production
```

> 修改 app.json

将 app.json 中的 `"style": "v2"` 去除, 小程序的[新版基础组件](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html#style)强行加上了许多样式, 难以覆盖, 不关闭将造成部分组件样式混乱

> 修改 project.config.json

开发者工具创建的项目, `miniprogramRoot` 默认为 `miniprogram`, `package.json` 在其外部, npm 构建无法正常工作

需要手动在 `project.config.json` 内添加如下配置, 使开发者工具可以正确索引到 npm 依赖的位置

```json
{
    // ...
    "setting": {
        // ...
        "packNpmManually": true,
        "packNpmRelationList": [
            {
                "packageJsonPath": "./package.json",
                "miniprogramNpmDistDir": "./"
            }
        ]
    }
}
```

> 构建npm (构建之前记得删除现有的miniprogram_npm目录)

![image-20220407091709318](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658680.png)

> 如果使用ts,需要如下配置

* 配置ts支持

  ```bash
  # 通过 npm 安装
  npm i -D miniprogram-api-typings
  ```

* 在 tsconfig.json 中增加如下配置, 以防止 tsc 编译报错

  ```json
  {
      // ...
      "compilerOptions": {
          // ...
          "baseUrl": ".",
          "types": ["miniprogram-api-typings"],
          "paths": {
              "@vant/weapp/*": ["path/to/node_modules/@vant/weapp/dist/*"]
          },
          "lib": ["ES6"]
      }
  }
  ```

### 基本使用 (演示button)

> app.json 或 index.json 引入对应的组件

```json
"usingComponents": {
    "van-button": "@vant/weapp/button/index"
}
```

> wxml文件中使用组件

```html
<van-button type="default">默认按钮</van-button>
<van-button type="primary">主要按钮</van-button>
<van-button type="info">信息按钮</van-button>
<van-button type="warning">警告按钮</van-button>
<van-button type="danger">危险按钮</van-button>
```

### 定制全局主题样式

```js
// pages/home/home.js

Page({
    // 需要配置styleIsolation,才能覆盖vant weapp默认的样式
    options: {
        styleIsolation: "shared"
    }
})
```

```css
/* app.wxss */

/* 每个页面都是以page为根节点,所以我们在这里定义css变量,以作用在所有的button按钮上 */
page {
    /* 定制primary按钮 */
    --button-primary-background-color: #13a7a0; /* 背景色 */
    --button-priamry-border-color: #15b4aa; /* 边框颜色 */
    
    /* 定制danger按钮 */
    --button-danger-background-color: #c00000; 
    --button-danger-border-color: #d60000;
}
```

```html
<!-- pages/home/home.wxml 使用组件 -->

<van-button type="primary">主要按钮</van-button>
<van-button type="danger">危险按钮</van-button>
```

![image-20220407094854849](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658681.png)
![image-20220407094809323](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658682.png)

> 具体的定制可以去查官方文档

https://youzan.github.io/vant-weapp/#/theme

## 异步API的promise化

### 安装与构建

> 通过npm安装

```bash
npm i --save miniprogram-api-promise@1.0.4
```

> 构建npm (构建之前记得删除现有的miniprogram_npm目录)

![image-20220407091709318](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658680.png)

### 基本使用

```js
// app.js 封装promise后的api

// 导入"miniprogram-api-promise"包中的promisifyAll()
import {promisifyAll} from "miniprogram-api-promise"

// 将wx身上所有的异步api都promise化,然后挂载到wxp身上
// wxp和wx.p都指向了同一个对象,所以我们在任意页面和组件中都能通过wx.p来访问到这些promise化的异步api
const wxp = wx.p = {}
promisifyAll(wx, wxp)

App({})
```

```js
// pages/home/home.js

Page({
    async show() {
        // 调用wx.p身上promise化后的request()来获取数据,非常的方便
        let res1 = await wx.p.request({
            url: "https://api.uixsj.cn/hitokoto/get",
            method: "GET",
            data: {
                type: "zha"
            }
        })
        console.log(res1.data); // "你能不能别说话了。”“我没有啊。”“那为什么我满脑子都是你的声音"

        // 可以通过对象的解构赋值,简化书写,直接拿到data
        let {data: res2} = await wx.p.request({
            url: "https://api.uixsj.cn/hitokoto/get",
            method: "GET",
            data: {
                type: "zha"
            }
        })
        console.log(res2); // "我想吃碗面 什么面 你的心里面。"
    },
    
    onLoad() {
        this.show();
    }
})
```

## 全局数据共享

### Info

> 全局数据共享

![image-20220407110119312](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658683.png)

* 全局数据共享(状态管理), 是为了解决**组件之间数据共享**的问题
  * 开发中常用的有: Vuex, Redux, Mobx...

> 小程序中的全局数据共享方案

![image-20220407110441361](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658684.png)

* 通过mobx-miniprogram包,创建Store实例对象
* 通过mobx-miniprogram-bindings包,将Store中的共享数据或方法,绑定到组件或页面中使用

### 安装与构建

> 通过npm安装

```bash
# 安装 mobx-miniprogram 和 mobx-miniprogram-bindings
npm i --save mobx-miniprogram@4.13.2 mobx-miniprogram-bindings@1.2.1
```

> 构建npm (构建之前记得删除现有的miniprogram_npm目录)

![image-20220407091709318](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658680.png)

### 配置Store

```js
// store/store.js 在这里配置Store实例对象

import {action, observable} from "mobx-miniprogram"

// 编写store
const store = observable({
    // 普通属性 (类似于vuex中的state)
    num1: 10,
    num2: 20,
    msg: "hello world",

    // 计算属性 (类似于vuex中的getters)
    // 添加get,表示只读,返回一个计算属性的值
    get sum() {
        return this.num1 + this.num2;
    },

    // actions函数,用来修改store中的数据 (类似于vuex的actions)
    // 不允许直接修改store中的数据,需要通过update()来修改
    updateNum1: action(function (step) {
        this.num1 += step; 
    })
})

// 导出store
module.exports = {
    store
}
```

### 在页面中使用

```js
// pages/home/home.js 将store中成员绑定到home页面

// 引入store, 必须是相对路径引入,"/store/store"是引入不了
import {store} from "../../store/store" 
// 引入createStoreBindings()来给页面绑定store (绑定store中的属性和方法)
import {createStoreBindings} from "mobx-miniprogram-bindings" 

Page({
    // 页面一加载,就给当前页面绑定store
    onLoad: function () {
        console.log(store); // {msg: (...), num1: (...), num2: (...), updateNum1: (...), get msg: ƒ (), set msg: ƒ (t)...}
        
		// 调用createStoreBindings(),将数据源store身上的 属性绑定在this.data身上, 方法绑定在this身上
        this.storeBindings = createStoreBindings(this, {
            store, // 要绑定的数据源
            fields: ["num1", "num2", "msg", "sum"], // 绑定 普通属性 + 计算属性
            actions: ["updateNum1"] // 绑定 方法
            /*
            	// fields的其他写法
                fields: {
                	"msg": "msg", // 映射形式
                    "n1": () => store.num1, // 函数形式
                    "n2": (store) => store.num2, // 函数形式,接受一个store参数
                    "sum": () => store.sum // 函数形式,获取计算属性 (注意: 不是store.sum(), 而是store.sum)
                }, 
                // action的其他写法
                actions: {
                    "updateNum": "updateNum1"
                }
            */
        }),
	
        /*
	        this.storeBindings身上也绑定了两个方法
		        - updateStoreBindings() 立刻同步更新store中的数据和this.data中的数据
			        - 为了提升性能,在 store 中的字段被更新后,并不会立刻同步更新到 this.data 上,而是等到下个 wx.nextTick 调用时才更新 (这样可以显著减少 setData 的调用次数)
			        - 如果我们需要立即更新,可以调用该方法
			    - destroyStoreBindings() 给当前页面解绑store
        */		        
		console.log(this.storeBindings); // {updateStoreBindings: ƒ, destroyStoreBindings: ƒ}
		
        this.show();
    },
    // 页面一卸载,就解绑this身上的store
    onUnload: function () {
        this.storeBindings.destroyStoreBindings();
    },
    
    show() {
        // 已经成功的将数据保存到了this.data中了,但是给页面中绑定的store属性是私有的,只可以在页面上进行数据绑定,无法在方法中直接访问
        console.log(this.data);
            /*
                {} 
                    msg: "hello world"
                    num1: 10
                    num2: 20
                    sum: 70
                    __proto__: Object

                // {} 这就是不可以访问的表现
                // {msg: "hello world", num1: 10...} 这是可以访问的表现
            */
        console.log(this.data.num1, this.data.num2, this.data.meg, this.data.sum); // undefined undefined undefined undefined
    },

	// 页面中tap事件的回调函数
    update() {
        // 调用从store那获取到的方法
        this.updateNum1(10)
    }
})
```

```html
<!-- 可以在页面中绑定this.data中从store那获取到的数据 -->
<view>{{num1}} - {{num2}} - {{sum}} - {{msg}}</view>
<!-- 绑定tap事件,以及update()回调函数,在update()内部调用从store那获取到的updateNum1() -->
<button bindtap="update">点我+10</button>
```

![image-20220407120030919](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658685.png)

### 在组件中使用

```js
// components/test/test.js

import {storeBindingsBehavior} from "mobx-miniprogram-bindings"
import {store} from "../../store/store"

Component({
    // 引入behaviors
    behaviors: [storeBindingsBehavior],
    // 将数据源store身上的 属性绑定在this.data身上, 方法绑定在this身上
    storeBindings: {
        store, // 数据源
        fields: ["num1", "num2", "msg", "sum"],
        actions: ["updateNum1"]
    },
    methods: {
        show() {
            // 给组件绑定的store属性是共有的 (不同于页面中绑定store), 可以直接访问从store那获取到的属性,也可以在页面上进行数据绑定
            console.log(this.data); // {num1: 10, num2: 20, msg: "hello world", sum: 30}
            console.log(this.data.num1, this.data.msg, this.data.sum); // 10 "hello world" 30
            // 可以直接调用从store那获取到的方法
            this.updateNum1(20);
            console.log(this.data.num1); // 30
        }
    },
    lifetimes: {
        ready() {
            this.show();
        }
    }
})
```

# 分包

## Info

* 分包前后的结构对比
  * 分包前: 小程序中的所有页面和资源都打包到了一起,导致整个项目体积过大,影响小程序首次启动的下载时间
    ![image-20220407151449499](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658686.png)
  * 分包后: 把一个完整的小程序项目分成 **1个主包** + **多个分包**,可以优化小程序首次启动的下载时间,在多团队共同开发时可以更好的解构协作
    ![image-20220407185016502](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658687.png)
    * 主包: 一般包含项目的 启动页面,TabBar页面,公共资源
    * 分包: 一般包含当前分包的 相关页面,私有资源
* 资源引用原则
  * 分包 可以引用 主包内的共有资源
  * 主包 无法引用 分包内的私有资源
  * 分包 无法引用 别的分包内的私有资源
* 分包的加载规则
  * 在小程序启动时,客户端会 下载主包 并 启动主包内的页面
  * 当用户进入到分包内的某个页面时,客户端会 下载对应的分包 并 启动分包内的页面
* 分包的大小限制
  * 所有分包(主包+分包) <= 16M
  * 单个 主包/分包 <= 2M

## 配置主包和分包

```json
// app.json

{
    // 配置主包中的页面
    "pages": [
        "pages/home/home",
        "pages/message/message",
        "pages/contact/contact"
    ],
    // 配置分包 (在app.json中配置好之后,会在项目中自动生成 对应的分包目录 和 对应的页面文件)
    "subPackages": [
        // 配置第一个分包
        {
            // 分包名
            "root": "packageA",
            // 分包的别名 (可选)
            "name": "p1",
            // 分包中的页面
            "pages": [
                "pages/cat/cat",
                "pages/dog/dog"
            ]
            // 注意: 分包不能嵌套分包!!!
        },
        // 配置第二个分包
        {
            "root": "packageB",
            "name": "p2",
            "pages": [
                "pages/apple/apple",
                "pages/banana/banana"
            ]
        }
    ],
    // ...
}
```

![image-20220407190833645](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658688.png)

## 查看包的大小

![image-20220407191056306](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658689.png)

## 独立分包

```json
/*
	独立分包: 本质上也是分包,不过他不依赖主包和其他分包,可以独立运行 (普通分包需要依赖于主包,无法独立运行)
		- 可以将一定功能独立性的页面配置到独立分包中,独立分包运行不依赖于主包,能很大程度上提升分包页面的启动速度
	引用原则:
        - 主包与独立分包之间,无法相互引用资源
        - 普通分包与独立分包之间,无法相互引用资源
        - 独立分包之间,无法相互引用资源
*/

// app.json

{
    "pages": [
        "pages/home/home",
        "pages/message/message",
        "pages/contact/contact"
    ],
    "subPackages": [
        {
            "root": "packageA",
            "name": "p1",
            "pages": [
                "pages/cat/cat",
                "pages/dog/dog"
            ],
            // 设置packageA为独立分包
            "independent": true
        },
        {
            "root": "packageB",
            "name": "p2",
            "pages": [
                "pages/apple/apple",
                "pages/banana/banana"
            ]
        }
    ]
    // ...
}
```

## 分包预下载

```json
/*
	分包预下载: 在进入小程序某个页面时,由框架自动预下载一些可能需要的分包,从而提升后续进入分包页面的速度
		- 比如: 进入到contact页面后,就自动预下载packageA包,后续进入packageA包的cat页面时,就能提高进入速度了
    同一个分包内的页面预下载的页面共计不能超过2M
    	- 比如: 主包(包含home页面,message页面,contact页面)内,home页面预加载的分包总共1M,message页面预加载的分包总共1M,contact页面预加载的分包总共1M,即主包内所有页面预加载的分包共记3M > 2M,不合要求
*/

// app.json

{
	"pages": [
		"pages/home/home",
		"pages/message/message",
		"pages/contact/contact"
	],
	"subPackages": [
		{
			"root": "packageA",
			"name": "p1",
			"pages": [
				"pages/cat/cat",
				"pages/dog/dog"
			]
		},
		{
			"root": "packageB",
			"name": "p2",
			"pages": [
				"pages/apple/apple",
				"pages/banana/banana"
			]
		}
	],
    // 配置预下载
	"preloadRule": {
        // 当进入"pages/contact/contact"页面的时候,就进行预下载操作
		"pages/contact/contact": {
            // 预下载packageA包,可以填 包名/包的别名
			"packages": ["packageA"],
            // 在指定的网络模式下进行预下载: all(不限网络) 和 wifi(仅限wifi模式)
			"network": "all"
		}
	},
    // ...
}
```

# 自定义tabBar

## 创建自定义tabBar目录

![image-20220408090436123](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658690.png)

## 配置app.json

```json
// app.json 在这里配置好之后,直接在custom-tab-bar组件中编写自定义tabBar即可,不需要在页面中导入

{
	"tabBar": {
        // 声明使用自定义tabBar
		"custom": true,
        /*
        	这里的配置不会影响到自定义tabBar的渲染,保留下来会有如下的好处:
        		* 如果是低版本,无法兼容自定义tabBar,会自动来解析list节点,按照默认的方式渲染tabBar
        		* 帮助区分哪些页面是tabBar页面
        */
		"list": [
			{
				"pagePath": "pages/home/home",
				"text": "index"
			},
			{
				"pagePath": "pages/message/message",
				"text": "message"
			},
			{
				"pagePath": "pages/contact/contact",
				"text": "contact"
			}
		]
	},
    // 使用vant weapp组件
	"usingComponents": {
		"van-tabbar": "@vant/weapp/tabbar/index",
		"van-tabbar-item": "@vant/weapp/tabbar-item/index"
	},
    // "style": "v2", // 删除style配置项,防止和vant weapp造成冲突
    // ...
}
```

## 生成tabBar

```html
<!-- custom-tab-bar/index.wxml -->

<!-- 
    使用vant weapp的自定义tabBar组件
        * active: 一个索引,表示当前被选中的tabBar的icon
		* active-color: 被选中的tabBar的icon文本颜色
 -->
<van-tabbar active="{{ active }}" active-color="pink" bind:change="onChange">
    <!-- 
        * 通过wx:for遍历list生成tabBar-item 
        * van-tabbar-item标签的info属性: 右上角显示的数字,这里通过三元表达式来优化代码
     -->
    <van-tabbar-item 
        wx:for="{{list}}" 
        wx:key="index"
        info="{{item.info ? item.info : ''}}"
    >
        <!-- 未选中的icon配置 -->
        <image 
            slot="icon" 
            src="{{item.iconPath}}"
            mode="aspectFit" 
            style="width: 30px; height: 25px;" 
        />
        <!-- 被选中的icon配置 -->
        <image 
            slot="icon-active" 
            src="{{item.selectedIconPath}}" 
            mode="aspectFit" 
            style="width: 30px; height: 25px;" 
        />
        {{item.text}}
    </van-tabbar-item>
</van-tabbar>
```

```js
// custom-tab-bar/index.js

import {storeBindingsBehavior} from "mobx-miniprogram-bindings"
import {store} from "../store/store"

Component({
    /*
        调用wx.swtichTab()跳转tabBar,是不会刷新custom-tab-bar页面中的数据的,但是每次跳转完tabBar后,就应该修改active的数值,让当前所在的tabBar的icon图标处于选中状态
        所以我们可以将active放在store中进行处理,我们在custom-tab-bar页面读取store中的数据,然后每次跳转tabBar,就调用store中的方法对store中的数据进行处理,虽然custom-tab-bar页面没有更新数据,但是store中数据已经更新了
    */
    behaviors: [storeBindingsBehavior],
    storeBindings: {
        store,
        // 获取store中的active属性
        fields: {
            active: "activeTabBarIndex",
        },
        // 获取store中修改active属性的方法
        actions: {
            updateActive: "updateActiveTabBarIndex"
        }
    },
    data: {
        // 准备一个list数组,存储tabBar的相关信息
        list: [
            {
                // 注意路径是"/pages/home/home",而不是"pages/home/home"
                "pagePath": "/pages/home/home",
                "text": "home",
                "iconPath": "/images/home.png",
                "selectedIconPath": "/images/home-active.png",
                info: 3
            },
            {
                "pagePath": "/pages/message/message",
                "text": "message",
                "iconPath": "/images/message.png",
                "selectedIconPath": "/images/message-active.png",
                info: 2
            },
            {
                "pagePath": "/pages/contact/contact",
                "text": "contact",
                "iconPath": "/images/contact.png",
                "selectedIconPath": "/images/contact-active.png",
                info: 0
            }
        ],
    },
    methods: {
        onChange(event) {
            /*
                event.detail表示切换后的tabBar的索引
                    切换到home页面,event.detail就是0
                    切换到message页面, event.detail就是1
                    切换到contact页面, event.detail就是2
            */

            // 调用wx.switchTab(),切换tabBar
            wx.switchTab({
                // 设置url为切换后的tabBar的pagePath属性
                url: this.data.list[event.detail].pagePath
            })
            // 因为已经切换了tabBar了,我们就该修改active的值为切换后的tabBar的索引
            this.updateActive(event.detail)
        },    
    }
})
```

```js
// store/store.js 配置store存储共享的数据和方法

import {action, observable} from "mobx-miniprogram"

const store = observable({
    // 一个索引,表示当前被选中的tabBar的icon,准备这个数据给页面数据绑定的
    activeTabBarIndex: 0,
    // 切换tabBar的时候,调用这个方法,修改activeTabBarIndex的值
    updateActiveTabBarIndex: action(function (index) {
        this.activeTabBarIndex = index;
    })
})

module.exports = {
    store
}
```

# 常用api

## 交互

### 显示消息提示框

![image-20220404114212909](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658691.png)

```js
Page({
    show() {
        wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000,
        })
    }
})

/*
	icon属性值
        success	显示成功图标，此时 title 文本最多显示 7 个汉字长度
        error	显示失败图标，此时 title 文本最多显示 7 个汉字长度
        loading	显示加载图标，此时 title 文本最多显示 7 个汉字长度
        none	不显示图标，此时 title 文本最多可显示两行，1.9.0及以上版本支持
*/
```

## 导航栏

### 导航栏标题

![image-20220404102617379](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658692.png)

```js
// pages/contact/contact.js

Page({
    onLoad: function (options) {
        // 设置标题,支持success,fail,complete的回调函数
        wx.setNavigationBarTitle({
            title: 'hello world
        })
    }
}
```

### 导航栏颜色

![image-20220404102836583](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658693.png)

```js
Page({
    onLoad: function (options) {
        // 设置window导航栏颜色
        wx.setNavigationBarColor({
            // 仅支持 十六进制颜色
            backgroundColor: '#999999',
            // 仅支持 #ffffff 和 #000000
            frontColor: '#ffffff',
        })
    }
}
```

### 导航条加载动画

![image-20220404103113118](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211658694.png)

```js
// pages/contact/contact.js
Page({
    onLoad: function (options) {
        // 在当前页面显示导航条加载动画
        wx.showNavigationBarLoading();
        // 模拟延迟3s
        setTimeout(() => {
            // 在当前页面隐藏导航条加载动画
            wx.hideNavigationBarLoading();
        }, 3000)
    },
}
```

# Details

## input和data之间的数据同步

![image-20220402111731366](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654466.png)

## 处理加载页面
![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204211654467.png)

```js
Page({
    data() {
        // 设置节流阀
        isLoading: false;
    },

    show() {
        // 如果处于正处于加载状态,就不允许再操作了
        if (this.data.isLoading) return;
        // 开启节流阀
        this.data.isLoading = true;
        // 显示loading页面
        wx.showLoading({
            title: "loading...",
        });
        // yi'bu
        wx.request({
            url: "https://api.uixsj.cn/hitokoto/get",
            method: "get",
            // 成功时的回调
            success: (res) => {
                console.log(res); // {data: "不悔梦归处，只恨太匆匆。", header: {…}, statusCode: 200, cookies: Array(0), errMsg: "request:ok"
                console.log(res.data); // 不悔梦归处，只恨太匆匆。
            },
            // 程序执行完时的回调
            complete: () => {
                // 关闭节流阀
                this.data.isLoading = false;
                // 隐藏loading页面
                wx.hideLoading()
            }
        });
    },

    onLoad() {
        this.show();
    },
});
```

















































































