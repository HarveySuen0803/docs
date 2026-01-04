# Info

![image-20220409101226765](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648641.png)

* uni-app 是一个使用 Vue.js 开发所有前端应用的框架
* 开发者编写一套代码,可发布到 iOS,Android,H5,快应用,各种小程序(微信/支付宝/百度/头条/QQ/钉钉/淘宝) 等多个平台

# vscode配置uni-app

## 基本配置

* 具体内容,参考官方的配置文档: https://ask.dcloud.net.cn/article/36286
* 安装vue-cli (如果已安装直接跳过)

	```bash
	npm install -g @vue/cli
	```

* 通过vue-cli在当前目录,创建一个uni-app项目,项目名为my-project

	```bash
	vue create -p dcloudio/uni-preset-vue my-project
	```

* 选择uni-app的模板
  ![image-20220408202005338](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648642.png)

* 安装组件语法提示

	```bash
	# 进入到my-project项目
	cd ./my-project
	# 安装组件语法提示
	npm i @dcloudio/uni-helper-json
	```

* 从 github 下载 [uni-app 代码块](https://github.com/zhetengbiji/uniapp-snippets-vscode), 放到项目目录下的 .vscode 目录即可拥有和 HBuilderX 一样的代码块 (public-resource/web/uni-app-snippets)
  ![image-20220408195405635](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648643.png)

* 相关插件
	* uni-helper
	* vetur
	* create-uniapp-view
	* sass
* 运行项目

	```bash
	npm run dev:mp-weixin  # 运行在 微信小程序中
	npm run dev:mp-alipay  # 运行在 支付宝小程序中
	npm run dev:mp-baidu   # 运行在 百度小程序中
	npm run dev:mp-toutiao # 运行在 头条小程序中
	npm run dev:h5         # 运行在 H5平台
	npm run dev:mp-qq      # 运行在 qq小程序中
	```

* 发布项目 (等全部做完之后再发布)

	```bash
	npm run build:mp-weixin  # 发布在 微信小程序中
	npm run dev:mp-alipay
	npm run dev:mp-baidu
	npm run dev:mp-toutiao
	npm run dev:h5 
	npm run dev:mp-qq 
	```

## 运行在微信小程序中

* 在微信小程序的环境下,运行项目

	```bash
	npm run dev:mp-weixin
	```
* 导入项目到微信开发者工具中
  ![image-20220408202643494](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648645.png)
  ![image-20220408202729548](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648646.png)
* 这样就可以 通过vscode来编写代码,通过微信开发者工具作为调试器
  ![image-20220408202952055](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648647.png)

## 配置scss

```bash
# 安装sass
npm i sass sass-loader@10.1.1 -D
```

## 配置less

```bash
npm install less less-loader@7 -D
```

# src项目目录

```text
┌─components            组件目录
├─pages                 页面目录
├─static                静态资源目录
├─main.js               Vue初始化入口文件
├─App.vue               配置应用: 小程序的全局样式、生命周期函数 ...
├─manifest.json         配置打包信息: 应用名称、appid、logo、版本 ...
└─pages.json            配置页面信息: 页面路径、页面窗口样式、tabBar、navigationBar ...
```

# manifest.json配置

## sitemap警告

![image-20220408205401434](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648648.png)

```json
// src/manifest.json 

// 这个sitemap的警告,原先在project.config.json中配置"checkSiteMap": false就可以了
// 但是我们的uni-app项目中是没有project.config.json,经过编译后生成的dist目录才有project.config.json文件夹
// 我们这里在manifest.json中配置,经过编译后会生成到project.config.json中去
{	
    "mp-weixin": {
        "setting": {
            "urlCheck": false,
            // 配置checkSiteMap
            "checkSiteMap": false
        },
        "usingComponents": true
    }
    // ...
}
```

## 更改AppID失败

![image-20220408205159746](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648649.png)

```json
// src/manifest.json

{	
    "mp-weixin": {
        /* 配置appid */
        "appid": "wxdb5e82f70f83a4cc",
        "setting": {
            "urlCheck": false
        },
        "usingComponents": true
    }
    // ...
}
```

# git版本控制

## 忽略文件

* 配置忽略文件.gitignore

	```
	/node_modules
	/unpackage/dist
	```

  * 由于src/unpackage目录下,此时只有一个dist目录,我们又忽略了该目录,那么git默认就不会在跟踪src/unpackage目录了
  * 我们可以在src/unpackage目录下创建一个.gitkeep文件进行占位,让git一直追踪src/unpackage目录
    ![image-20220408224132200](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648650.png)

## 基本操作

```bash
# 基于master分支创建一个分支 (以tabBar为例,我们就在tabBar分支上完成代码的编写)
git checkout -b tabBar

# 代码编写完毕之后,提交代码
git add .
git commit -m "completed the tabBar a"

# 创建远程库的别名
git remote add uni-shop git@gitee.com:Mr_WisSun/uni-shop.git

# 推送tabBar分支的代码到远程库
git push -u uni-shop tabBar

# 在master分支下,合并tabBar分支
git checkout master
git merge tabBar

# 将master分支也推送到远程
git push uni-shop

# 删除tabBar分支
git branch -d tabBar
```

# pages.json

## 配置pages

![image-20220409075150036](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648651.png)

```js
// src/pages.json

{
	// 在src/pages目录下创建home页面,cate页面,cart页面,my页面
	// 在pages配置项中配置页面信息
	"pages": [
        // 配置页面 (原先的index页面直接干掉就可以了)
		{
			"path": "pages/home/home",
			"style": {}
		},
		{
			"path": "pages/cate/cate"
		},
		{
			"path": "pages/cart/cart",
			"style": {}
		},
		{
			"path": "pages/my/my",
			"style": {}
		}
	],
}
```

## 配置tabBar

![image-20220409081756087](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648652.png)

```json
// src/pages.json

{
	// 配置tabBar
    "tabBar": {
        "color": "",
        "selectedColor": "#c00000",
        "backgroundColor": "",
		// 配置list (注意: 使用到的页面必须是pages配置项中配置好的)
        "list": [
            {
                "pagePath": "pages/home/home",
                "text": "home",
                "iconPath": "static/tab_icons/home.png",
                "selectedIconPath": "static/tab_icons/home-active.png"
            },
            {
                "pagePath": "pages/cate/cate",
                "text": "cate",
                "iconPath": "static/tab_icons/cate.png",
                "selectedIconPath": "static/tab_icons/cate-active.png"
            },
            {
                "pagePath": "pages/cart/cart",
                "text": "cart",
                "iconPath": "static/tab_icons/cart.png",
                "selectedIconPath": "static/tab_icons/cart-active.png"
            },
            {
                "pagePath": "pages/my/my",
                "text": "my",
                "iconPath": "static/tab_icons/my.png",
                "selectedIconPath": "static/tab_icons/my-active.png"
            }
        ]
    }
}
```

## 配置navigation

![image-20220409081744665](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648653.png)

```json
// src/pages.json

{
    "globalStyle": {
        "navigationBarTitleText": "小孙优购",
        "navigationBarTextStyle": "white",
        "navigationBarBackgroundColor": "#c00000",
        "backgroundColor": "#ffffff"
    },
}
```

## 配置subPackages

```js
// src/pages.json 配置分包

{
    "subPackages": [
        {
            "root": "subpkg",
            "pages": [
                {
                    "path": "goods_detail/goods_detail",
                    "style": {
                        "navigationBarTitleText": "goods_detail"
                    }
                }
            ]
        }
    ],
}
```

# 页面导航

## 声明式导航

```vue
<swiper
    indicator-dots="true"
    autoplay="true"
    circular="true"
    interval="3000"
>
    <swiper-item v-for="(item, i) in swiperList" :key="i">
        <!-- 
            使用navigator实现声明式导航,同时在url路径中配置参数
                :url="/subkg/..."       // 对
                :url="/src/subpkg/..."  // 错
                :url="subpkg/..."       // 错
        -->
        <navigator :url="'/subpkg/goods_detail/goods_detail?goods_id=' + item.goods_id">
            <image :src="item.image_src">
        </navigator>
    </swiper-item>
</swiper>
```

## 编程式导航

```vue
<template>
	<view>
		<view class="nav-list">
			<!-- 绑定点击事件,调用回调函数,同时传入item参数 -->
			<view class="nav-item" v-for="(item, i) in navList" :key="i" @click="navClickHandler(item)">
				<image :src="item.image_src" class="nav-img"></image>
			</view>
		</view>
	</view>
</template>

<script>

export default {
	methods: {
		navClickHandler(item) {
            // 判断点击的是哪个nav,然后跳转到相应的页面 (编程式导航)
			if (item.name === "分类") {
				// 使用uni.swtichTab()跳转到一个tabBar页面
				// 使用uni.navigateTo()跳转到一个非tabBar页面
				uni.switchTab({
					url: "/pages/cate/cate"
				})
			}
		}
	}
};
</script>
```

# 组件

## 自定义组件

> 创建自定义组件

![image-20220411185408054](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648654.png)

> 使用自定义组件

```html
<template>
    <view>
        <!--使用自定义组件-->
        <my-search></my-search>
    </view>
</template>
```

```js
// 引入自定义组件
import MySearch from "/src/components/my-serach/my-search.vue";
// import MySearch from "/src/components/my-serach/my-search"; // 对
// import MySearch from "/src/components/my-serach"; // 对
// import MySearch from "components/my-search/my-search"; // 对
// import MySearch from "/components/my-search/my-search"; // 错; 不能加"/"

export default {
    // 配置自定义组件
	components: {
		"my-search": MySearch,
		// MySearch // 简化书写
	}
}
```

## uni-ui的使用

> 安装sass,sass-loader,uni-ui

```bash
npm i sass -D
npm i sass-loader@10.1.1 -D
npm i @dcloudio/uni-ui

# sass-loader的版本需要低于@11.0.0,因为vue@2.6.12不支持sass-loader@11.0.0
```

> 配置easycom

```json
// pages.json

{
    "easycom": {
        "autoscan": true,
        "custom": {
            // uni-ui 规则如下配置
            "^uni-(.*)": "@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue"
        }
    },
}
```

> 引用组件 (如果配置了easycom,可以省略这一步,直接使用组件)

```js
import {uniBadge} from '@dcloudio/uni-ui'
//import uniBadge from '@dcloudio/uni-ui/lib/uni-badge/uni-badge.vue' // 也可使用此方式引入组件
export default {
    components: {uniBadge}
}
```

> 使用组件

```html
<uni-badge text="1"></uni-badge>
<uni-badge text="2" type="success" @click="bindClick"></uni-badge>
<uni-badge text="3" type="primary" :inverted="true"></uni-badge>
```

> 注意: 

* CLI引用方式,H5端不支持在main.js中全局注册组件,如有需求请使用([easyCom](https://uniapp.dcloud.io/collocation/pages?id=easycom))的方式引用组件
* 使用npm安装的组件,默认情况下babel-loader会忽略所有node_modules中的文件,导致条件编译失效,需要通过配置`vue.config.js`解决

	```js
	// 在根目录创建 vue.config.js 文件,并配置如下
	module.exports = {
	  transpileDependencies: ['@dcloudio/uni-ui']
	}
	```
  
* 具体组件的使用看[文档](https://uniapp.dcloud.io/component/uniui/uni-ui.html)

# vuex

## vuex的配置

```js
// src/store/user.js

export default {
    namespaced: true,
    state: {},
    mutations: {},
    getters: {}
}
```

```js
// src/store/store.js

import Vue from "vue";
import Vuex from "vuex";
// 引入cart模块
import moduleUser from "./user.js"
import moduleCart from "./cart.js"
Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        // 配置user模块
        m_user: moduleUser
        // 配置cart模块
        m_cart: moduleCart,
    }
})
```

```js
// main.js

// 引入store
import store from './store/store.js'

const app = new Vue({
	...App,
    // 挂在store
	store
})
app.$mount()
```

## vuex的使用

```js
// src/store/user.js

export default {
	// 空间命名
	namespaced: true,
	state: {
		// userInfo的初始化,从本地存储中读取userInfo,如果本地没有存储,就默认为{}
		userInfo: JSON.parse(uni.getStorageSync("userInfo") || "{}"), // 将json格式的数据转成对象格式的数据
	},
	mutations: {
		// 更新userInfo数据
		updateUserInfo(state, userInfo) {
			// 将state中的userInfo改为参数userInfo
			state.userInfo = userInfo;
			// 调用saveUserInfoToStorage()将最新的userInfo存储到本地
			this.commit("m_user/saveUserInfoToStorage");
		},
		// 存储userInfo到本地
		saveUserInfoToStorage(state) {
			uni.setStorageSync("userInfo", JSON.stringify(state.userInfo)); // 将对象格式的数据转成JSON格式的数据
		}
	},
	getters: {
		// 通过getters处理address
		address(state) {
			// 如果userInfo为一个空对象,就退出程序
			if (JSON.stringify(state.userInfo) === "{}") return "";
			// 拼接userInfo中的属性得到一个具体的地址信息
			return (
				state.userInfo.provinceName +
				state.userInfo.cityName +
				state.userInfo.countyName +
				state.userInfo.detailInfo
			);
		},
	},
};
```

```js
// src/components/my-address

// 导入mapState,mapMutations
import {mapState, mapMutations} from 'vuex';

export default {
	computed: {
        // 获取store中的userInfo
        ...mapState("m_user", ["userInfo"]),
        // 获取store中的address
        ...mapGetters("m_user", ["address"]),
	},
	methods: {
		// 获取store中的updateUserInfo()
        ...mapMutations("m_user", ["updateUserInfo"]),
		async chooseAddress() {
			const [err, succ] = await uni.chooseAddress().catch((err) => err);
			if (err === null && succ.errMsg === "chooseAddress:ok") {
                // 调用store中的updateUserInfo()更新userInfo数据
                this.updateUserInfo(succ);
			}
		},
	}
};
```

# 优化处理

## 数据请求

```js
/*
	在uni-app项目中,就不建议使用wx.request了,更推荐封装好的npm包,这里就是使用到了@escook/request-miniprogram包
*/

// src/main.js 配置@escook/request-miniprogram包 (记得安装)

import Vue from 'vue'
import App from './App'

// 导入request-miniprogram

// 讲$http挂在到uni-app的顶级队形uni身上
// 在uni项目中,uni是顶级对象,他有着wx对象的所有属性和方法,我们在uni项目中,就使用uni即可
uni.$http = $http

// 配置请求的根路径 测试接口: "https://www.uinav.com", "https://api-hmugo-web.itheima.net"
$http.baseUrl = 'https://www.uinav.com' // 

// 请求拦截器,请求之前
$http.beforeRequest = function (options) {
	// 显示loading
	uni.showLoading({
		title: 'loading...',
	})
	// 后续还可以这里修改请求头 (比如: 在请求头中添加身份认证字段)
}

// 响应拦截器,请求之后,响应之前
$http.afterRequest = function () {
	// 隐藏loading
	uni.hideLoading();
}

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
```

```js
// src/pages/home 在页面或组件中发起数据请求,请求数据

export default {
    data: () => ({
        // 声明一个swiperList用存储获取到的数据
        swiperList: [],
    }),

    methods: {
        async getSwiperList() {
            // 发起请求,因为已经设置了根路径,我们只需要填写后面的路径即可
            const { data: res } = await uni.$http.get("/api/public/v1/home/swiperdata");
            console.log(res); // {message: Array(3), meta: {msg: "获取成功", status: 200}}
            // 如果status不为200,就表示请求失败
            if (res.meta.status !== 200) {
                // 提示请求失败
                uni.showToast({
                    title: "数据请求失败",
                    duration: 1500,
                    icon: "none",
                });
            }
            // 存储数据到swiperList中
            this.swiperList = res.message;
        },
    },

    onLoad() {
        // 页面一加载,就调用getSwiperList()
        this.getSwiperList();
    },
};
```

## 封装uni.showToast()

```js
// src/main.js

// 在顶级对象uni身上挂在一个$showMsg,供全局使用,同时在函数中指定了默认值
uni.$showMsg = function (title="数据加载失败", icon="none", duration=1500) { // 注意: duration为数值类型
	uni.showToast({
		title,
		icon,
		duration,
	});	
}
```

```js
// 在页面或组件中直接使用即可

show() {
	// 直接调用uni.$showMsg(),使用默认的参数值
	uni.$showMsg();
	// 传递参数,指定不同的效果
	uni.$showMsg("数据请求成功", "success", 1500);
}
```

## 数据加载时页面显示问题

![image-20220413192751061](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648655.png)

```html
<!-- 将goodeDetail从对象格式转成json格式,判断goodsDetail对象是否为空对象,如果为空隐藏,即不显示页面-->
<view v-if="JSON.stringify(goodsDetail) === '{}' ? false : true">
    <!-- ... -->
</view>
```

## 获取手机的可用窗口高度

```js
// 获取手机的可用窗口高度,保存到data的wh中,供页面使用
const sysInfo = uni.getSystemInfoSync();
console.log(sysInfo);
console.log(sysInfo.screenHeight); // 667, 手机屏幕高度
console.log(sysInfo.windowHeight); // 555, 可用窗口高度 = 手机屏幕高度 - tabBar高度 - navigationBar高度)
```

## rich-text渲染字符串结构

![image-20220413192050113](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648656.png)

```vue
<!-- 商品详细信息 -->
<!-- 通过rich-text,渲染字符串文本中的node节点 -->
<rich-text :nodes="goodsDetail.goods_introduce"></rich-text>
```

```js
async getGoodsDetail(goods_id) {
	// 根据id获取数据
	const { data: res } = await uni.$http.get("/api/public/v1/goods/detail", { goods_id });
	if (res.meta.status !== 200) return uni.$showMsg();
	
	/*
		对goods_introduce字符串进行正则替换,修改字符串中的内容
			* 设置img标签为块级元素,消除上下图片之间的间隙
			* 将webp格式的图片替换为jpg格式的图片,兼容ios
	*/
	res.message.goods_introduce = res.message.goods_introduce
		.replace(/<img /g, "<img style='display: block;'")
		.replace(/webp/g, "jpg");
	this.goodsDetail = res.message;
},
```

## 动态修改子组件内结构的样式

```vue
<!-- src/pages/cate -->

<!--父组件传递属性给子组件,动态指定子组件的样式-->
<my-Search :bgColor="'#ddd'" :radius="10"></my-Search>
```

```vue
<!-- src/components/my-search -->

<template>
    <!-- 动态引入style样式 -->
	<view class="my-search-container" :style="{'background-color': bgColor}">
        <!-- 动态引入style样式 -->
		<view class="my-search-box" :style="{'border-radius': radius + 'rpx'}">
            <!-- ... -->
		</view>
	</view>
</template>

<script>
import { uniIcons } from "@dcloudio/uni-ui";
export default {
    // 通过props接受父组件的参数,同时设置属性的默认值
    props: {
        bgColor: {
            type: "String",
            default: "#c00000", 
        },
        radius: {
            type: "Number", 
            default: 40, 
        },
    }
};
</script>
```

## 动态控制子组件内结构的显示与隐藏

![image-20220414172527544](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648657.png)

```vue
<!-- src/components/my-goods -->

<template>
    <view>
        <view class="goods-item">
            <view class="goods-item-left">
                <!-- 
                    添加一个radio组件
                        * 根据showRadio的值来决定是否显示该组件
                        * 根据item.goods_state来决定radio组件的选中状态
                -->
                <radio
                    :checked="item.goods_state"
                    color="#C00000"
                    v-if="showRadio"
               	></radio>

                <image
                   class="goods-img"
                   :src="item.goods_small_logo || defaultImg"
                ></image>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        // 接受父组件的参数
        showRadio: {
            type: Boolean,
            default: false,
        }
    }
}
</script>
```

```vue
<!-- src/subpkg/goods_list页面使用my-goods组件,不传递showRadio参数,默认为不显示radio组件 -->
<my-goods :item="item"></my-goods>
```

```vue
<!-- src/pages/cart页面使用my-goods组件,传递showRadio参数,显示radio组件 -->
<my-goods :item="item" :showRadio="true"></my-goods>
```

## 自定义事件控制子组件

```vue
<!--
	src/pages/cart (父页面) 中使用到了 src/components/my-goods (子组件)
	
	我们这里想要通过自定义事件的方式,在cart页面内修改my-goods组件内的数据 (修改radio组件的checked属性值)
		- cart页面内使my-goods组件,然后给my-goods组件绑定自定义事件
		- my-goods组件内部触发该自定义事件,传入必要的参数
		- cart页面内该自定义事件的回调函数,接受到参数后,执行修改操作
-->


<!-- src/pages/cart 父页面 -->

<template>
    <view>
        <block v-for="(item, i) in cart" :key="i">
            <!-- 给my-goods组件绑定自定义事件radioChange -->
            <my-goods
                :item="item"
                :showRadio="true"
                @radioChange="radioChange"
            ></my-goods>
        </block>
    </view>
</template>

<script>
export default {
    methods: {
        // 获取store中的updateGoodsState()
        ...mapMutations("m_cart", ["updateGoodsState"]),
        // radioChange事件的回调函数
        radioChange(info) {
            console.log(info); // {goods_id: 43984, goods_state: false}
            // 调用store中的updateGoodsState(),修改cart数组中goods_id为info.goods_id的商品的goods_state属性的值
            this.updateGoodsState(info);
        },
    },
};
</script>
```

```vue
<!-- src/components/my-goods 子组件 -->

<template>
    <view class="goods-item">
        <view class="goods-item-left">
            <!-- 添加一个radio组件,绑定click事件,及radioChangeHandler()回调函数 -->
            <radio
                :checked="item.goods_state"
                color="#C00000"
                v-if="showRadio"
                @click="radioChangeHandler"
            ></radio>
        </view>
    </view>
</template>

<script>
export default {
    methods: {
        radioChangeHandler() {
            /*
                触发radioChange自定义事件,同时将最新的goods_id,goods_state作为参数传入
                    注意: 点击了radio组件后,radio组件不会自己改变checked属性值 (即item.goods_state属性值没有变),所以我们这里需要将item.goods_state取反返回
            */
            this.$emit("radioChange", {
                goods_id: this.item.goods_id,
                goods_state: !this.item.goods_state,
            });
        }
    }
};
</script>
```

```js
// store/cart.js

mutations: {
    // 存储state.cart数据到本地
    saveToStorage(state) {
        uni.setStorageSync("cart", JSON.stringify(state.cart));
    },
    // 修改商品的勾选状态,即goods_state属性值
    updateGoodsState(state, info) {
        // 查找购物车中需要修改的状态的商品
        let res = state.cart.find(
            (item) => item.goods_id === info.goods_id
        );

        // 找到后,就修改其状态,并且存储最新的state.cart数据到本地
        if (res) {
            res.goods_state = info.goods_state;
            this.commit("m_cart/saveToStorage");
        }
    }
}
```

## 在请求头中添加身份认证字段

```js
// src/main.js

// 请求路径中带有"/my/"的请求,都是需要权限的(比如: 支付相关的接口),只有登录了账号后,才允许调用
// 我们需要为这些接口添加一个请求头用于身份认证
$http.beforeRequest = function (options) {
	uni.showLoading({
		title: 'loading...',
	});
	// options记录着详细的请求信息
	console.log(options);
		/*
			Request {
				afterRequest: ƒ ()
				baseUrl: "https://www.uinav.com"
				beforeRequest: ƒ (options)
				data: {}
				header: {}
				method: "GET"
				url: "https://www.uinav.com/api/public/v1/home/floordata"
				__proto__: Object
			}
		*/

	// 判断请求的路径中是否有"/my/"
	if (options.url.indexOf("/my/") !== -1) {
		// 添加一个请求头 (key为Authorization, value为用户的token字段)
		options.header = {
			Authorization: store.state.m_user.token // 字段的值直接从store中获取 (我们无法获取token,就直接拷贝老师文档里固定的token到存储里做测试)
		}
	}
}
```

# 渲染结构

## 轮播图

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648658.png)

```vue
<template>
	<view>
		<!-- 使用wx里的swiper组件 -->
		<swiper
			indicator-dots
			autoplay
			circular
			interval="3000"
			duration="1000"
		>
			<!-- v-for遍历swiperList生成swiper-item -->
			<swiper-item v-for="(item, i) in swiperList" :key="i">
				<!-- 动态绑定src -->
				<image :src="item.image_src" />
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
export default {
    data: () => ({
        // 声明一个swiperList用存储获取到的数据
        swiperList: [],
    }),
    methods: {
        async getSwiperList() {
            // 向服务器发起请求,因为已经设置了根路径,我们只需要填写后面的请求路径即可
            const { data: res } = await uni.$http.get("/api/public/v1/home/swiperdata");
            console.log(res); // {message: Array(3), meta: {msg: "获取成功", status: 200}}
            // 如果status不为200,就表示请求失败,调用封装好的uni.$showMsg(),提示用户数据加载失败
            if (res.meta.status !== 200) return uni.$showMsg();
            // 存储数据到swiperList中
            this.swiperList = res.message;
        },
    },
    onLoad() {
        // 页面一加载,就调用getSwiperList()
        this.getSwiperList();
    },
};
</script>

<style>
    swiper {
	    /* 既可以使用rpx也可以使用px */
        height: 330rpx;
    }
    swiper-item image {
        width: 100%;
        height: 100%;
    }
</style>
```

## 分类导航条

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648659.png)

```vue
<template>
	<view>
		<view class="nav-list">
			<view class="nav-item" v-for="(item, i) in navList" :key="i">
				<image :src="item.image_src" class="nav-img"></image>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data: () => ({
		navList: [],
	}),

	methods: {
		async getNavList() {
			const {data: res} = await uni.$http.get("/api/public/v1/home/catitems");
			if (res.meta.status !== 200) return uni.$showMsg();
			this.navList = res.message;
			console.log(this.navList);
		}
	},

	onLoad() {
		this.getNavList();
	}
};
</script>

<style scoped>
	.nav-list {
		display: flex;
		justify-content: space-around;
		margin: 14rpx 0;
	}
	.nav-item {
		width: 140rpx;
		height: 140rpx;
	}
</style>
```

## 楼层

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648660.png)

```vue
<template>
	<view>
		<view class="floor-list">
			<!-- v-for遍历floorList渲染楼层结构 -->
			<view class="floor-item" v-for="(item, i) in floorList" :key="i">
				<!-- 楼层的标题 -->
				<image :src="item.floor_title.image_src" class="floor-title"/>

				<!-- 楼层的主体 -->
				<view class="floor-img-box">
					<!-- 左侧图片 -->
					<view class="left-img-box">
						<image
							:src="item.product_list[0].image_src"
							:style="{width: item.product_list[0].image_width + 'rpx'}"
							mode="widthFix"
						/>
					</view>
					<!-- 右侧图片 -->
					<view class="right-img-box">
						<view class="right-img-item" v-for="(item2, i2) in item.product_list" :key="i2" >
							<image
								v-if="i2 !== 0"
								:src="item2.image_src"
								:style="{width: item2.image_width + 'rpx'}"
								mode="widthFix"
							/>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
export default {
    data() {
        return {
            floorList: []
        }
    },
    onLoad() {
        this.getFloorList()
    },
    methods: {
        async getFloorList() {
            const { data: res } = await uni.$http.get('/api/public/v1/home/floordata')
            if (res.meta.status !== 200) return uni.$showMsg()
            this.floorList = res.message
        }
    }
}
</script>
<style scoped>
	.floor-title {
		height: 60rpx;
		width: 100%;
	}
	.floor-img-box {
		display: flex;
		padding-left: 10rpx;
	}
	.right-img-box {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
	}
</style>
```

## 双列滚动视图

![image-20220411110132109](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648661.png)

```vue
<template>
    <view>
        <view class="scroll-view-container">
            <!-- 左侧滚动视图区域,设置高度为手机的可用窗口高度 -->
            <scroll-view scroll-y class="left-scroll-view" :style="{height: wh + 'px'}">
                <view class="left-scroll-view-item active">A</view>
                <view class="left-scroll-view-item">A</view>
                <!-- ... -->
            </scroll-view>
            <!-- 右侧滚动视图区域 -->
            <scroll-view scroll-y class="right-scroll-view" :style="{height: wh + 'px'}">
                <view>B</view>
                <!-- ... -->
            </scroll-view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            wh: 0
        }
    },
    onLoad() {
        // 获取手机的可用窗口高度,保存到data的wh中,供页面使用
        const sysInfo = uni.getSystemInfoSync();
        console.log(sysInfo);
        console.log(sysInfo.screenHeight); // 667, 手机屏幕高度
        console.log(sysInfo.windowHeight); // 555, 可用窗口高度 = 手机屏幕高度 - tabBar高度 - navigationBar高度)
        this.wh = sysInfo.windowHeight;
    }
};
</script>

<style>
    .scroll-view-container {
        display: flex;
    }
    .left-scroll-view {
        width: 240rpx;
    }
    .left-scroll-view-item {
        height: 120rpx;
        line-height: 120rpx;
        text-align: center;
        font-size: 24rpx;
    }
    .left-scroll-view .active {
        background-color: #f7f7f7;
        position: relative;
    }
    .left-scroll-view .active::before {
        content: " ";
        display: block;
        width: 6rpx;
        height: 60rpx;
        background-color: #c00000;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }
</style>
```

## 面板列表

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648662.png)

```vue
<!-- src/components/my-user 用户信息组件, 在src/pages/my页面中动态展示 -->

<template>
	<view class="user-container">
		<!-- 基本信息区域 (头像昵称) -->
		<view class="user-info">
			<image :src="user.avatarUrl" class="user-img"></image>
			<view class="user-nickname">{{ user.nickName }}</view>
		</view>
		<!-- 面板列表 -->
		<view class="panel-list">
			<!-- 第一个面板 -->
			<view class="panel-first">
				<view class="panel-body">
					<view class="panel-item">
						<text>8</text>
						<text>收藏的店铺</text>
					</view>
					<view class="panel-item">
						<text>14</text>
						<text>收藏的商品</text>
					</view>
					<view class="panel-item">
						<text>18</text>
						<text>关注的商品</text>
					</view>
					<view class="panel-item">
						<text>84</text>
						<text>足迹</text>
					</view>
				</view>
			</view>

			<!-- 第二个面板 -->
			<view class="panel-second">
				<!-- 标题 -->
				<view class="panel-title">我的订单</view>
				<!-- 主体 -->
				<view class="panel-body">
					<view class="panel-item">
						<image src="/static/my-icons/icon1.png"></image>
						<text>待付款</text>
					</view>
					<view class="panel-item">
						<image src="/static/my-icons/icon2.png"></image>
						<text>待收货</text>
					</view>
					<view class="panel-item">
						<image src="/static/my-icons/icon3.png"></image>
						<text>退款/退货</text>
					</view>
					<view class="panel-item">
						<image src="/static/my-icons/icon4.png"></image>
						<text>全部订单</text>
					</view>
				</view>
			</view>

			<!-- 第三个面板 -->
			<view class="panel-third">
				<view class="panel-body">
					<view class="panel-item">
						<text>收获地址</text>
						<uni-icons type="arrowright" size="15" />
					</view>
					<view class="panel-item">
						<text>联系客服</text>
						<uni-icons type="arrowright" size="15" />
					</view>
					<view class="panel-item">
						<text>退出登录</text>
						<uni-icons type="arrowright" size="15" />
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
export default {
    computed: {
        ...mapState("m_user", ["user"])
    }
};
</script>

<style lang="less">
/*
	小程序不建议在组件中使用标签选择,而页面中无所谓

	我们这必须给page标签添加一个height: 100%,所以我们可以在src/pages/my页面中给page标签和my-container组件添加样式
		page,
		.my-container {
		    height: 100%;
		}
*/

.user-container {
	height: 100%;
    background-color: #f4f4f4;

    .user-info {
        display: flex;    
        flex-direction: column;
        align-items: center;
        height: 400rpx;
        justify-content: center;
        background-color: #c00000;

        .user-img {
            height: 90px;
            width: 90px;
            background-color: pink;
            border-radius: 45px;
            border: 2px solid white;
            box-shadow: 0 1px 5px black;
        }

        .user-nickname {
            font-size: 16px;
            color: #fff;
            margin-top: 20px;
            font-weight: 700;
        }
    }
    
	.panel-list {
        height: 100%;
		padding: 0 10px;
		position: relative;
		top: -10px;

		.panel-first {
			background-color: #fff;
			border-radius: 3px;
			margin-bottom: 10px;

			.panel-body {
				display: flex;
				justify-content: space-around;

				.panel-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					font-size: 13px;
					padding: 10px 0;
				}
			}
		}

		.panel-second {
			background-color: #fff;
			padding-bottom: 10px;
			border-radius: 3px;
			margin-bottom: 10px;

			.panel-title {
				line-height: 45px;
				padding-left: 10px;
				font-size: 15px;
			}

			.panel-body {
				display: flex;
				justify-content: space-around;

				.panel-item {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;

					image {
						width: 35px;
						height: 35px;
					}
					text {
						font-size: 13px;
					}
				}
			}
		}

		.panel-third {
			background-color: #fff;
			border-radius: 3px;

			.panel-body {
				padding: 0 10px;

				.panel-item {
					display: flex;
					justify-content: space-between;
					line-height: 45px;
					font-size: 15px;
				}
			}
		}
	}
}
</style>
```

## 商品结算区域

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648663.png)

```vue
<!-- src/components/my-settle -->

<template>
	<view class="my-settle-container">
		<!-- 全选区域 -->
		<label class="radio-box">
			<!-- 
				功能1: 动态渲染全选按钮
					绑定checked属性为isFullChecked 
				功能2: 点击全选按钮能修改所有商品的勾选状态
					绑定click事件
			-->
			<radio class="radio" color="#c00000" :checked="isFullChecked" @click="radioClickHandler"/><text>全选</text>
		</label>
		<!-- 合计区域 -->
		<view class="amount-box">
			<!-- 功能3: 动态渲染已勾选商品的总价格 -->
			合计: <text class="amount">￥{{ checkedGoodsAmount }}</text>
		</view>
		<!-- 结算区域 -->
		<view class="settle-box">
			<!-- 功能4: 动态渲染商品勾选的数量 -->
			<view class="settle">结算({{ checkedCount }})</view>
		</view>
	</view>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
export default {
	computed: {
		// 获取store中的checkedCount,count,checkedGoodsAmount
		...mapGetters("m_cart", ["checkedCount", "count", "checkedGoodsAmount"]),

		// 判断当前是否全选了商品
		isFullChecked() {
			// 如果选中的商品数量等于了商品的总数,就全选商品了
			return this.checkedCount === this.count;
		},
	},
	methods: {
		// 获取store中的updateAllGoodsState()
		...mapMutations("m_cart", ["updateAllGoodsState"]),
		// radio组件的click事件回调函数
		radioClickHandler() {
			// 调用updateAllGoodsState(),修改所有商品的勾选状态
			this.updateAllGoodsState(!this.isFullChecked);
		},
	},
};
</script>
```

```js
// src/store/cart.js

export default {
	namespaced: true,
	state: {
		// 从本地存储中读取cart数组,给cart初始化
		cart: JSON.parse(uni.getStorageSync("cart") || "[]"),
	},
	mutations: {
		// 修改购物车中所有商品的勾选状态为全选按钮的勾选状态
		updateAllGoodsState(state, newState) {
			// 修改cart数组中所有元素的goods_state属性的值为newState
			state.cart.forEach((item) => {
				item.goods_state = newState;
			})
			// 持久化存储数据
			this.commit("m_cart/saveToStorage");
		},
		// 存储state.cart数据到本地
		saveToStorage(state) {
			uni.setStorageSync("cart", JSON.stringify(state.cart));
		}
	},
	getters: {
		// 商品总数
		count(state) {
			return state.cart.reduce((count, item) => count += item.goods_count, 0); // 简化书写
		},
		// 已勾选的商品总数
		checkedCount(state) {
			// 从中过滤出已勾选的商品
			let temp = state.cart.filter(item => item.goods_state);
			// 统计已勾选的商品总数
			let checkedCount = temp.reduce((count, item) => {
				return count += item.goods_count
			}, 0)
			return checkedCount;
		},
		// 已勾选商品的总价格
		checkedGoodsAmount(state) {
			// 通过 filter() 从购物车中过滤出已勾选的商品
			// 通过 reduce() 计算商品的总价格
			// 通过 toFixed() 保留两位小数
			return state.cart.filter(item => item.goods_state)
							 .reduce((count, item) => count += item.goods_price, 0)
							 .toFixed(2);
		}
	}
};
```

# 功能实现

## 双列滚动视图分类切换

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648664.png)

```vue
<template>
    <view>
        <view class="scroll-view-container">
            <!-- 左侧滚动视图区域 -->
			<!-- 通过小程序的scroll-view组件实现滚动栏的效果,同时指定height高度为小程序的可用窗口高度 -->
            <scroll-view scroll-y class="left-scroll-view" :style="{ height: wh + 'px' }">
                <!-- 遍历cateList,动态渲染cate -->
                <block v-for="(item, i) in cateList" :key="i">
                    <!-- 
                        通过三元表达式动态添加active的class样式,
                        同时绑定click事件,点击哪个view,就调用changeActive(),就给哪个view添加active的class样式
                     -->
                    <view
                        :class="[
                            'left-scroll-view-item',
                            i === active ? 'active' : ' ',
                        ]"
                        @click="changeActive(i)"
                    >
                        {{ item.cat_name }}
                    </view>
                </block>
            </scroll-view>
            <!-- 右侧滚动视图区域 -->
            <scroll-view scroll-y class="right-scroll-view" :style="{ height: wh + 'px' }">
                <!-- cateList的item项的children属性 -->
                <view class="cate-lv2-list" v-for="(item2, i2) in cateLevel2" :key="i2">
                    <!-- 二级分类列表的标题 -->
                    <view class="cate-lv2-title">/ {{ item2.cat_name }} /</view>
                    <!-- 二级分类的列表的children属性,即三级分类列表 -->
                    <view class="cate-lv3-list">
                        <view class="cate-lv3-item" v-for="(item3, i3) in item2.children" :key="i3">
                            <image :src="item3.cat_icon" />
                            <view>{{ item3.cat_name }}</view>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script>

export default {
    data() {
        return {
	        // 可用窗口高度
            wh: 0,
            // 一个索引,表示当前具有active的class样式的view标签的索引
            active: 0,
            cateList: [],
            cateLevel2: [],
        };
    },
    methods: {
        async getCateList() {
            const { data: res } = await uni.$http.get(
                "/api/public/v1/categories"
            );
            if (res.meta.status !== 200) return uni.$showMsg();
            this.cateList = res.message;
            this.cateLevel2 = this.cateList[0].children;
        },
        changeActive(i) {
	        // 修改active的值,让其指向点击的那个view
            this.active = i;
            // 修改二级分类列表为点击的那个view所对应的二级分类列表
            this.cateLevel2 = this.cateList[i].children;
        }
    },
    onLoad() {
        // 获取手机的可用窗口高度,保存到data的wh中,供页面使用
        const sysInfo = uni.getSystemInfoSync();
        console.log(sysInfo);
        console.log(sysInfo.screenHeight); // 667, 手机屏幕高度
        console.log(sysInfo.windowHeight); // 555, 可用窗口高度 = 手机屏幕高度 - tabBar高度 - navigationBar高度)
        this.wh = sysInfo.windowHeight;
        
        this.getCateList();
    },
};
</script>

<style>
.scroll-view-container {
    display: flex;
}
/* 左侧分类列表 */
.left-scroll-view {
    width: 240rpx;
}
.left-scroll-view-item {
    height: 120rpx;
    line-height: 120rpx;
    text-align: center;
    font-size: 24rpx;
}
.left-scroll-view .active {
    background-color: #f7f7f7;
    position: relative;
}
.left-scroll-view .active::before {
    content: " ";
    display: block;
    width: 6rpx;
    height: 60rpx;
    background-color: #c00000;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}
/* 右侧分类列表 */
.cate-lv2-title {
    font-size: 24rpx;
    font-weight: bold;
    text-align: center;
    padding: 30rpx 0;
}
.cate-lv3-list {
    display: flex;
    flex-wrap: wrap;
}
.cate-lv3-item {
    display: flex;
    width: 33.33%;
    margin-bottom: 20rpx;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.cate-lv3-item image {
    width: 120rpx;
    height: 120rpx;
}
.cate-lv3-item text {
    font-size: 24rpx;
}
</style>
```

## 搜索功能

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648665.png)

```vue
<!-- src/subpkg/search -->

<template>
    <view>
        <!-- 搜索框 -->
        <view class="search-box">
	        <!-- 使用uni-search-bar组件 -->
            <uni-search-bar
                @input="input"
                :radius="30"
                :focus="true"
                cancelButton="none"
                bgColor="#fff"
                v-model="keyWord"
            >
            </uni-search-bar>
        </view>

        <!-- 搜索建议 -->
		<!-- 判断suggestList数组中是否有元素,如果有元素,就展示搜索建议,如果没有元素就展示搜索历史 -->
        <view class="suggest-list" v-if="suggestList.length !== 0">
	        <!-- v-for遍历suggestList渲染搜索建议列表,同时绑定click事件,实现编程式导航-->
            <view
                class="suggest-item"
                v-for="(item, i) in suggestList"
                :key="i"
                @click="gotoGoodsDetail(item)"
            >
                <view class="goods-name">{{ item.goods_name }}</view>
                <uni-icons type="arrowright" size="16"></uni-icons>
            </view>
        </view>

        <!-- 搜索历史 -->
        <view class="history-box" v-else>
            <!-- 标题区域 -->
            <view class="history-title">
                <text>搜索历史</text>
                <!-- 清除历史记录的按钮,绑定click事件 -->
                <uni-icons type="trash" size="20" @click="clearHistory"></uni-icons>
            </view>
            <!-- 列表区域 -->
            <view class="history-list">
	            <!-- v-for遍历historyList渲染搜索历史标签 -->
	            <!-- 绑定click事件,当点击这个历史记录的标签时,就调用showSuggestList(),搜索历史记录history-->
                <uni-tag
                    class="history-item"
                    v-for="(history, i) in historyList"
                    :key="i"
                    :text="history"
                    @click="showSuggestList(history)"
                ></uni-tag>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
	        // 关键字
            keyWord: "",
            // 搜索建议列表
            suggestList: [],
            // 搜索历史列表
            historyList: [],
        };
    },
    methods: {
        input(e) {
            // 输入框防抖处理
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
	            // 调用getSuggestList()
                this.getSuggestList();
            }, 500);
        },
        // 搜索建议
        async getSuggestList() {
	        // 如果没有关键字,就清空搜索建议列表,并退出
            if (this.keyWord === "") return this.suggestList = [];

			// 向服务器发起请求,并且携带搜索的关键字作为参数,服务器会返回与这个关键字相关的数据用于渲染搜素建议列表
            const { data: res } = await uni.$http.get("/api/public/v1/goods/qsearch",{query: this.keyWord});
			// 请求失败,退出程序
            if (res.meta.status !== 200) return uni.$showMsg();
			// 存储请求到的数据
            this.suggestList = res.message;
            // 调用saveSearchHistory(),存储历史记录
            this.saveSearchHistory();
        },
        // 存储历史记录
        saveSearchHistory() {
            // 向数组的第一位添加元素 (根据用户习惯,最近搜索的历史记录,应该放在最前面,而不是放在最后面)
            this.historyList.unshift(this.keyWord)
            // 我们不应该保留相同的历史记录,所以需要对数组进行去重处理
            this.historyList = [...new Set(this.historyList)];
			// 将historyList转成json格式的数据,存储到本地,实现历史记录的持久化存储
			uni.setStorageSync("historyList", JSON.stringify(this.historyList));
        },
        // 清除历史记录
        clearHistory() {
            // 清除historyList的数据和本地存储的数据
            this.historyList = [];
            uni.setStorageSync("historyList", "[]");
        },
        // 搜索历史记录
        showSuggestList(history) {
			// 搜索框的value和keyWord是双向绑定的,直接修改keyWord的值就可以,修改搜索框的value值了
            this.keyWord = history;
        },
        // 导航到goods-detail页面
        gotoGoodsDetail(item) {
            uni.navigateTo({
                url: "/subpkg/goods_detail/goods_detail?goods_id" + item.goods_id,
            });
        },
    },
    onLoad() {
        // 页面一加载就获取本地存储的historyList,如果没有存储historyList,就设置historyList的值为[]
        this.historyList = JSON.parse(uni.getStorageSync("historyList") || "[]");
    },
};
</script>

<style>
/* search */
.search-box {
    background-color: #c00000;
    /* 吸顶效果 */
    position: sticky;
    top: 0;
    z-index: 999;
}
/* search-suggest */
.suggest-item {
    display: flex;
    padding: 13px 10px;
    justify-content: space-between;
    border-bottom: 1px solid #efefef;
    align-items: center;
    font-size: 12px;
}
.goods-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 20px;
}
/* search-history */
.history-box {
    padding: 0 5px;
}
.history-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #efefef;
}
.history-title text {
    font-size: 12px;
}
.history-list {
    display: flex;
    flex-wrap: wrap;
}
.history-item {
    margin-right: 5px;
    margin-top: 5px;
}
.uni-tag {
    background-color: #f8faf9 !important;
    color: black !important;
    border: none !important;
}
</style>
```

## 吸顶效果

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648666.png)

```html
<!--用一个盒子包裹起来,方便做样式-->
<view class="search-box">
    <my-search @click.native="gotoSearch"></my-search>
</view>
```

```css
.search-box {
    /* 粘性定位 */
	position: sticky;
    /* 距离顶部0时,就固定住了 */
	top: 0;
    /* 提高层级，防止被轮播图覆盖 */
	z-index: 999;
}
```

## 上拉加载,下拉刷新

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648667.png)

```vue
<template>
	<view>
		<view class="goods-list">
			<!-- v-for遍历goodsList渲染商品列表,同时绑定click事件,实现编程式导航 -->
			<view v-for="(item, i) in goodsList" :key="i" @click="gotoDetail(item)">
				<!-- 使用my-goods组件 -->
				<my-goods :item="item"></my-goods>
			</view>
		</view>
	</view>
</template>

<script>
// 导入自定义组件
import myGoods from "/src/components/my-goods/my-goods";

export default {
	// 配置自定义组件
	components: {
		myGoods,
	},
	data() {
		return {
			// 配置请请求所需的参数对象
			queryObj: {
				query: "",
				cid: "",
				// 获取第1页的数据
				pagenum: 1,
				// 每一页10条数据
				pagesize: 10,
			},
			// 商品列表
			goodsList: [],
			// 商品列表中商品的总数
			total: 0,
			// 设置节流阀
			isLoading: false,
		};
	},
	methods: {
		// 获取商品列表数据
		async getGoodsList(callback) {
			// 开阀
			this.isLoading = true;
			// 向服务器发起请求,并且携带所需的参数对象
			const { data: res } = await uni.$http.get("/api/public/v1/goods/search", this.queryObj);
			// 如果回调函数存在就执行回调函数
			callback && callback();
			// 如果没有请求到数据,就发送提示信息,并退出程序
			if (!res.meta) return uni.$showMsg();
			if (res.meta.status !== 200) return uni.$showMsg();
			// 合并旧数据与新数据
			this.goodsList = [...this.goodsList, ...res.message.goods];
			// 记录
			this.total = res.message.total;
			// 关阀
			this.isLoading = false;
		},
		// 编程式导航
		gotoDetail(item) {
			uni.navigateTo({
				url: "/subpkg/goods_detail/goods_detail?goods_id=" + item.goods_id,
			});
		},
	},
	onLoad(options) {
		// 别的页面导航到该页面时,携带的参数就存放在options对象中,我们将这些数据保存下来
		this.queryObj.query = options.query || "";
		this.queryObj.cid = options.cid || "";
		// 调用getGoodsList()获取数据
		this.getGoodsList();
	},
	// 上拉加载更多功能
	onReachBottom() {
		// 如果已经加载了全部的数据,就不允许再加载了
		if (this.queryObj.pagenum * this.queryObj.pagesize >= this.total) return uni.$showMsg();
		// 如果正在加载中,就退出,等加载完了才能进行加载
		if (this.isLoading) return;
		// 页面+1,请求下一页的数据
		this.queryObj.pagenum += 1;
		// 请求数据
		this.getGoodsList();
	},
	// 下拉刷新功能
	onPullDownRefresh() {
		// 重置关键数据
		this.queryObj.pagenum = 1;
		this.total = 0;
		this.isloading = false;
		this.goodsList = [];
		// 调用getGoodsList()重新获取数据,同时传入回调函数来停止刷新
		this.getGoodsList(() => uni.stopPullDownRefresh());
	},
};
</script>

<style>
.goods-list {
	padding: 0 5px;
}
</style>
```

## 图片预览

![image-20220413165924949](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648668.png)

```vue
<swiper
    :indicator-dots="true"
    :autoplay="true"
    :interval="3000"
    :duration="1000"
    :circular="true"
>
	<!-- v-for遍历goodsDetail.pics渲染轮播图 -->
    <swiper-item v-for="(pic, i) in goodsDetail.pics" :key="i">
		<!-- 绑定click事件,以及preview()回调函数,将当前图片的索引作为参数传入 -->
        <image :src="pic.pics_big" @click="preview(i)"></image>
    </swiper-item>
</swiper>
```

```js
preview(current) {
    // 将所有图片的pics_big属性取出来,装到urls数组里 (pics_big是图片放大后的预览图的url路径)
    let urls = this.goodsDetail.pics.map((pic) => {
        return pic.pics_big;
    })
    // 调用 uni.previewImage() 方法预览图片
    uni.previewImage({
        // 预览时,默认显示的图片索引 (比如: 我们点击轮播图中index为2的图片,那么进入预览状态时,就应该默认预览index为2的图片)
        current,
        // 所有预览图片的url地址的数组
        urls
    })
}
```

## 加入购物车

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648669.png)

```vue
<template>
    <view v-if="JSON.stringify(goodsDetail) === '{}' ? false : true">
        <!-- 
            底部商品导航区域 (直接去uni-ui官网找uni-goods-nav的组件用) 
                * options 左侧按钮的配置项
                * click 左侧按钮的点击事件处理函数
                * fill 控制右侧按钮的样式
                * buttonGroup 右侧按钮的配置项
                * buttonClick 右侧按钮的点击事件处理函数
        -->
        <view class="goods-carts">
            <uni-goods-nav
                :options="options"
                :fill="true"
                :button-group="buttonGroup"
                @click="onClick"
                @buttonClick="buttonClick"
            />
        </view>
    </view>
</template>

<script>

import { mapMutations, mapGetters, mapState } from "vuex";

export default {
    data() {
        return {
		    // 左侧按钮的配置 (店铺,购物车)
	        options: [
	            {
	                icon: "shop",
	                text: "店铺",
	            },
	            {
	                icon: "cart",
	                text: "购物车",
	                // 右上角的数字徽标
	                info: 2,
	                // 徽标的背景色
	                infoBackgroundColor: "#007aff",
					// 徽标的颜色
	                infoColor: "#f5f5f5",
	            }
	        ],
	        // 右侧按钮的配置 (加入购物车, 立即购买)
	        buttonGroup: [
	            {
	                text: "加入购物车",
	                backgroundColor: "linear-gradient(90deg, #FFCD1E, #FF8A18)",
					// 文字颜色
	                color: "#fff",
	            },
	            {
	                text: "立即购买",
	                backgroundColor: "linear-gradient(90deg, #FE6035, #EF1224)",
	                color: "#fff",
	            }
			],
        };
    },
    computed: {
	    // 获取store中的count
        ...mapGetters("m_cart", ["count"]),
    },
    watch: {
	    // 监听count,如果count发生变化,就会执行handler()
        count: {
	        // 找到options中的购物车配置,修改info为最新的count值 (info就是购物车按钮的右上角徽标)
            handler(newVal) {
                let res = this.options.find((item) => item.text === "购物车");
                if (res) {
                    res.info = newVal;
                }
            },
            // 页面刚加载好时,是不显示徽标的,只有在执行了count的handler后才会显示徽标
			// 所以在页面刚加载好时,需要立即执行一次count的handler()显示徽标
            immediate: true,
        },
    },
    methods: {
	    // 获取store中的addToCart()
	    ...mapMutations("m_cart", ["addToCart"]),
	    
		// 左侧按钮的点击回调 (店铺,购物车)
	    onClick(e) {
		    // 如果点击"购物车按钮",就跳转到购物车页面
            if (e.content.text === "购物车") {
                uni.switchTab({
                    url: "/pages/cart/cart",
                });
            }
	    },
	    // 右侧按钮的点击回调 (加入购物车, 立即购买)
	    buttonClick(e) {
		    // 如果点击"加入购物车按钮",就将当前商品存储到购物车中
			if (e.content.text === "加入购物车") {
				// 封装一个goods对象,作为参数传递给addToCart()使用
				const goods = {
					goods_id: this.goodsDetail.goods_id,
					goods_name: this.goodsDetail.goods_name,
					goods_price: this.goodsDetail.goods_price,
					goods_count: 1,
					goods_small_logo: this.goodsDetail.goods_small_logo, // 商品的图片
					goods_state: true, // 商品的勾选状态
				};
			
				// 调用addToCart(),将当前的商品加入购物车
				this.addToCart(goods);
			}
	    }
    }
};
</script>

<style lang="less">
.goods-carts {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
    position: fixed;
    left: 0;
    right: 0;
    /* #ifdef H5 */
    left: var(--window-left);
    right: var(--window-right);
    /* #endif */
    bottom: 0;
}

.goods-detail-container {
    /* 因为底部的商品导航区域也有50px的高度会遮盖内容,我们可以给最外层的盒子底部添加padding,将内容挤上来 */
    padding-bottom: 50px;
}
</style>
```

## tabBar页面设置数字徽标功能

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648670.png)

```js
// 我们可以在cart页面调用uni.setTabBarBadge(),给cart页面的tabBar添加数字徽标,但是当我们离开cart页面时,就会销毁cart页面,所以数字徽标也会消失
// 因为我们需要在home页面,cate页面,cart页面,my页面都能看到这个数字徽标,所以就需要在这四个页面都编写uni.setTabBarBadge()
// 重复的代码更合适放在mixins中,然后给四个页面都导入该mixins

// src/mixins/tabbar-badge.js

import { mapGetters } from "vuex";

export default {
    computed: {
        ...mapGetters("m_cart", ["count"]),
    },
    watch: {
	    // 监听count,如果发生了变化,就立即执行setBadge()更新数字徽标
	    count() {
		    this.setBadge();
	    }
    },
    methods: {
        setBadge() {
            // 调用uni.setTabBarBadge(),为购物车设置右上角的徽标
            uni.setTabBarBadge({
                index: 2, // 当前页面所在tabBar的索引,cart页面是第三个tabBar,所以索引为2
                text: this.count + "", // 注意: text必须是字符串,不能是数字,所以需要将数字转成字符串
            });
        },
    },
    onShow() {
        this.setBadge();
    },
};
```

```js
// 分别导入mixins到home,cate,cart,my四个tabBar页面

import badgeMix from "/src/mixins/tabbar-badge.js";

export default {
    mixins: [badgeMix],
};
```

## 购物车内滑动删除商品

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648671.png)

```vue
<!-- src/pages/cart -->

<template>
    <view>
	    <!-- 需要对原先的标签结构进行编辑 -->
        <!-- uni-swipe-action 最外层的容器 -->
        <uni-swipe-action>
            <block v-for="(item, i) in cart" :key="i">
                <!-- 
                    uni-swipe-action-item 可以为其子节点提供滑动操作的效果
                        * right-optons: 向左滑动,从右边出来的按钮配置信息
                        * left-options: 向右滑动,从左边出来的按钮配置信息
					给滑动出来的按钮绑定click事件
                -->
                <uni-swipe-action-item :right-options="options" @click="swipeAction(item)">
                    <my-goods
                        :item="item"
                        :showRadio="true"
                        :showNum="true"
                        @radioChange="radioChange"
                        @numChange="numChange"
                    ></my-goods>
                </uni-swipe-action-item>
            </block>
        </uni-swipe-action>
    </view>
</template>

<script>
import badgeMix from "/src/mixins/tabbar-badge.js";
import { mapMutations, mapState } from "vuex";

export default {
    data() {
        return {
            options: [
                {
                    text: "删除",
                    style: {
                        backgroundColor: "#c00000"
                    }
                }
            ]
        }
    },
    mixins: [badgeMix],
    methods: {
        // 获取store中的removeGoods()
        ...mapMutations("m_cart", ["updateGoodsState", "updateGoodsCount", "removeGoods"]),
        // 滑动删除按钮的click事件
        swipeAction(item) {
	        // 调用removeGoods(),删除cart购物车中的item商品
            this.removeGoods(item);
            // 调用mixins里的setBadge(),更新tabBar上的数字徽标
            this.setBadge();
        }
    },
};
</script>
```

```js
<!-- src/store/cart.js -->

export default {
	namespaced: true,
	state: {
		// 从本地存储中读取cart数组,给cart初始化
		cart: JSON.parse(uni.getStorageSync("cart") || "[]"),
	},
	mutations: {
		// 存储state.cart数据到本地
		saveToStorage(state) {
			uni.setStorageSync("cart", JSON.stringify(state.cart));
		},
		// 移除商品
		removeGoods(state, info) {
			// 过滤掉goods_id为info.goods_id的商品
			state.cart = state.cart.filter((item) => item.goods_id !== info.goods_id);
			this.commit("m_cart/saveToStorage");
		}
	}
};
```

## 配置收获人地址信息

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648672.png)

```vue
<template>
	<view class="my-address-container">
		<!-- 
			功能1: 按需展示"收货人地址信息"和"请选择收获地址按钮"
				- userInfo是收货人的地址信息,通过v-if,v-else判断userInfo是否为空,来动态显示隐藏"收货人地址信息"还是"选择收货地址按钮"
					- address-choose-box 选择收获人地址按钮
					- address-info-box 收货人地址信息
		-->
		<view class="address-choose-box" v-if="JSON.stringify(userInfo) === '{}'">
			<!-- 
				功能2: 点击按钮后,进入选择收获地址的界面选择收获地址,选择好后在页面中展示收获人地址信息
					- 给"请选择收获地址"绑定click事件,以及chooseAddress()回调函数
			-->
			<button type="primary" size="mini" class="chooseAddress" @click="chooseAddress">请选择收获地址</button>
		</view>
		<!-- 
			功能3: 点击收货地址信息框后,重新进入到选择收获地址的界面
				- 给address-info-box绑定click事件,以及chooseAddress()回调函数 
		-->
		<view class="address-info-box" v-else @click="chooseAddress">
			<view class="row1">
				<!-- 动态绑定收货人姓名,电话 -->
				<view class="user-name">收获人: <text>{{ userInfo.userName }}</text></view>
				<view class="user-phone">电话: <text>{{ userInfo.telNumber }}</text></view>
			</view>
			<view class="row2">
				<!-- 动态绑定收货人地址 -->
				<view class="user-address">收获地址: <text>{{ address }}</text></view>
			</view>
		</view>

		<image class="address-border" src="/static/cart_border@2x.png" />
	</view>
</template>

<script>
import {mapState, mapMutations, mapGetters} from 'vuex';

export default {
	computed: {
        // 获取store中的userInfo
        ...mapState("m_user", ["userInfo"]),
        // 获取store中的address
        ...mapGetters("m_user", ["address"]),
	},
	methods: {
		// 获取store中的updateUserInfo
        ...mapMutations("m_user", ["updateUserInfo"]),
        
        // 这个回调函数,可以进入选择收货人地址信息的界面选择地址
		async chooseAddress() {
			// 调用小程序的chooseAddress(),就可以实现选择收货地址的功能
			// 该api返回一个数组: err 错误信息, succ 成功之后的用户信息对象 (包括: 收获地址, 用户名, 电话 ...)
			const [err, succ] = await uni.chooseAddress().catch((err) => err);
			// 判断用户成功的选择了收货地址
			if (err === null && succ.errMsg === "chooseAddress:ok") {
                // 调用store中的updateUserInfo()更新userInfo数据
                this.updateUserInfo(succ);
			}
			// 如果用户没有授权 (第一个errMsg针对Android和模拟器,第二个errMsg针对IOS)
			if (err && (err.errMsg === "chooseAddress:fail auth deny" || err.errMsg === "chooseAddress:fail authorize no response")) {

				// 调用this.reAuth(),向用户重新发起授权申请
				this.reAuth();
			}
		},
		async reAuth() {
			/*
				调用uni.showModal()向用户重新发起收货地址的授权
					* 用户点击确认, confirmResult = {errMsg: "showModal:ok", cancel: false, comfirm: true}
					* 用户点击取消, confirmResult = {errMsg: "showModal:ok", cancel: true, comfirm: false}
			*/
			const [err2, confirmResult] = await uni.showModal({
				title: "检测到您没打开地址权限,是否去设置打开?",
				confirmText: "确认",
				cancelText: "取消"
			})
			// 出错,直接退出
			if (err2) return;
			// 如果用户点击了"取消"按钮,就弹出提示信息
			if (confirmResult.cancel) return uni.$showMsg("您取消了地址授权!");
			// 如果用户点击了"确认"按钮,则调用 uni.openSetting() 方法进入授权页面,让用户重新进行授权
			if (confirmResult.confirm) return uni.openSetting({
				success: (settingResult) => {
					// 如果用户点击了授权,就提示"授权成功"
					if (settingResult.authSetting["scope.address"]) return uni.$showMsg("授权成功")
					// 如果用户没有点击授权,就提示"授权失败"
					if (!settingResult.authSetting["scope.address"]) return uni.$showMsg("授权失败")
				}
			})
		}
	}
};
</script>

<style>
.address-choose-box {
	height: 90px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.address-info-box {
	font-size: 12px;
	height: 90px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 0 10px;
	
}

.address-info-box .row1 {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.address-info-box .row2 {
	margin-top: 10px;
}

.address-border {
	display: block;
	width: 100%;
	height: 5px;
}
</style>
```

## 获取用户的授权信息

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648673.png)

```vue
<!-- src/components/my-login -->

<template>
	<view class="login-container">
		<!--  绑定click事件 -->
		<button class="login-btn" type="primary" @click="loginBtnClickHandler">登录</button>
	</view>
</template>

<script>
export default {
	methods: {
		// 获取store中的updateUser()
		...mapMutations("m_user", ["updateUser"]),
		// 回调函数,用于获取用户授权信息
		async loginBtnClickHandler() {
			// 使用getUserProfile()获取用户授权的个人信息
			let [err, res] = await uni.getUserProfile({
				desc: "获取您的头像,昵称" // desc必须赋值,但是申请页面并不是我们这段字符串 (api的问题)
			});
			
			/*
				如果用户点击了授权按钮,即授权成功
					console.log(err); // null; 授权成功,err就为null
					console.log(res); // {cloudID: undefined, encryptedData: "NYRv...", iv: "hcd97...", signature: "14715a4...", userInfo: {…}, …}
					console.log(res.errMsg); // getUserProfile:ok
					console.log(res.userInfo); // {nickName: "Mr_WisSun", gender: 0, language: "zh_CN", city: "", province: "", …}
				如果用户点击了取消按钮,即授权失败
					conosle.log(err); // {errMsg: "getUserProfile:fail auth deny"}
					console.log(res); // undefined; 返回的数组中只有一个元素err了
			*/
			
			// 如果用户没有授权,就发送提示信息
			if (err) return uni.$showMsg("您取消了登录授权");
			// 调用updateUser(),更新store中的用户授权信息 (将获取到的用户授权信息存储在vuex中)
			this.updateUser(res.userInfo);
		}
	},
};
</script>
```

```js
// src/store/user.js

export default {
	namespaced: true,
	state: {
		// 初始化用户信息
		user: JSON.parse(uni.getStorageSync("user") || "{}"),
	},
	mutations: {
		// 更新用户信息
		updateUser(state, user) {
			state.user = user;
			this.commit("m_user/saveUserToStorage");
		},
		// 将用户信息存储到本地
		saveUserToStorage(state) {
			uni.setStorageSync("user", state.user);
		}
	}
};
```

## 获取用户的token

```js
// src/components/my-login

export default {
	methods: {
		// 获取store中的updateToken()
		...mapMutations("m_user", ["updateUser", "updateToken"]),
		// 回调函数,用于获取用户授权信息
		loginBtnClickHandler(e) {
			let [err, res] = await uni.getUserProfile({
				desc: "获取您的头像,昵称"
			})
			if (err) return uni.$showMsg("您取消了登录授权");
			this.updateUser(res.userInfo);
			
			// 调用getToken(),将res作为参数传递过去,可以根据res获取到对应的token值
			this.getToken(res); 
		},
		// 获取登录后的token字符串
		async getToken(info) {
			// 调用微信登录接口,获得res对象 (如果调用成功: err为null, res有值 -- 如果调用失败: err有值, res为undefined)
			const [err, res] = await uni.login().catch(err => err);
			// 判断是否调用成功
			if (err) return uni.$showMsg("登录失败");
			// 准备参数对象 (请求时需要传递)
			const query = {
				code: res.code,
				encryptedData: info.encryptedData,
				iv: info.iv,
				rawData: info.rawData,
				signature: info.signature
			}
			// 向服务器发送请求,传递query参数,换取token值 (token就是一串字符串,用来做登录验证的)
			const {data: loginResult} = await uni.$http.post("/api/public/v1/users/wxlogin", query);
			// 验证是否登录成功
			if (loginResult.meta.status !== 200) return uni.$showMsg("登录失败");
			// 登录成功后,获取token值 
			console.log(loginResult.message.token);
			// 调用updateToken(),更新store中token值 (将获取到的token存储在vuex中)
			this.updateToken(loginResult.message.token);

			// 由于我们没有管理员身份,所以访问这些接口的时候,是无法获取到真正的token的,所以我们可以使用老师文档里固定的token来做测试: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIzLCJpYXQiOjE1NjQ3MzAwNzksImV4cCI6MTAwMTU2NDczMDA3OH0.YPt-XeLnjV-_1ITaXGY2FhxmCe4NvXuRnRB8OMCfnPo
		}
	}
}
```

```js
// src/store/user.js

export default {
	namespaced: true,
	state: {
		// 初始化token
		token: uni.getStorageSync("token") || "",
	},
	mutations: {
		// 更新token
		updateToken(state, token) {
			state.token = token;
			this.commit("m_user/saveTokenToStorage");
		},
		// 将token存储到本地
		saveTokenToStorage(state) {
			uni.setStorageSync("token", state.token);
		},
	},
};
```

## 三秒后跳转到登录界面 (延迟导航)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648674.png)

```vue
<!-- src/components/my-settle -->

<template>
	<view class="my-settle-container">
		<label class="radio-box">
		</label>
        <view class="amount-box">
        </view>
        <view class="settle-box">
            <!-- 给计算按钮绑定click事件 -->
            <view class="settle" @click="settlement">结算({{checkedCount}})</view>
        </view>
	</view>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';
export default {
    data() {
        return {
            // 延迟3s
            delayTime: 3
        }
    },
    computed: {
        // 获取 store 中的 checkedCount (勾选商品的数量) , userInfo (收货人地址信息), token (用户登录的标识)
        ...mapState("m_user", ["userInfo", "token"]),
        ...mapGetters("m_cart", ["checkedCount"])
    },
    methods: {
        settlement() {
            // 判断没有勾选任何商品
            if (!this.checkedCount) return uni.$showMsg("请选择要结算的商品");

            // 判断没有填写收货人信息
            if (!this.userInfo.cityName) return uni.$showMsg("请填写收货人信息");
            
            // 如果没有登录,就进行延时导航
            if (!this.token) return this.delayNavigate();

			// 如果上面三种情况都没有问题,就可以进入支付操作了 ...
        },
        // 准备一个倒计时提示框
        showTips(delayTime) {
            uni.showToast({
                icon: "none",
                title: "请登录后再结算, " + delayTime + "秒后自动跳转到登录页面",
                // 开启这招
                mask: true,
                // 1s后关闭提示框
                duration: 1500
            })
        },
        // 延迟导航
        delayNavigate() {
            // 将this.delayTime保存下来
            let delayTime = this.delayTime;
            // 立刻调用一次
            this.showTips(delayTime--);
            // 每个1s就重新发送一个提示框,更新最新1时间
            this.timer = setInterval(() => {
                // 调用showTips(),发送提示框
                this.showTips(delayTime--);
                if (delayTime < 0) {
                    // 清除定时器
                    clearInterval(this.timer);
                    // 关闭Toast()
                    uni.hideToast();
                    // 跳转到"pages/my/my"页面,并且退出程序
                    return uni.switchTab({ url: '/pages/my/my' });
                }
            }, 1000)
        }
    }
};
</script>
```

## 发起微信支付

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202204201648675.png)

```js
// 注意: 因为 创建订单请求, 订单预支付请求, 查询支付结果请求 都是需要权限的 (即请求路径中都包含"/my/"), 所以我们需要支付操作前,一定要在请求头中添加身份认证字段

settlement() {
	if (!this.checkedCount) return uni.$showMsg("请选择要结算的商品");
	if (!this.userInfo.cityName) return uni.$showMsg("请填写收货人信息");
	if (!this.token) return this.delayNavigate();

	// 一切顺利后,调用该payOrder(),进行微信支付
	this.payOrder();
},
// 微信支付
async payOrder() {
	// 1. 获取订单编号
	// 1.1 订单信息对象
	const orderInfo = {
		// 订单的总价格 order_price: this.checkedGoodsAmount
		order_price: 0.01, // 用0.01来代替,测试的时候,只需要付款0.01即可
		// 收获地址
		consignee_addr: this.address,
		// 商品详情
		goods: this.cart.filter(x => x.goods_state).map((x) => ({
			// 商品id
			goods_id: x.goods_id, 
			// 商品数量
			goods_number: x.goods_count, 
			// 商品价格
			goods_price: x.goods_price
		}))
	}
	// 1.2 向服务器发起创建订单请求
	const {data: res} = await uni.$http.post("/api/public/v1/my/orders/create", orderInfo);
	if (res.meta.status !== 200) return uni.$showMsg("创建订单失败");
	// 1.3 得到服务器响应的订单编号 (订单编号就是一串字符串,用于唯一标识这次订单)
	const orderNumber = res.message.order_number; // HMDD20220419000000000231

	// 2. 订单预支付
	// 2.1 发起订单预支付请求,将订单编号作为参数传递过去,获取订单预支付信息
	const { data: res2 } = await uni.$http.post('/api/public/v1/my/orders/req_unifiedorder', {order_number: orderNumber})
	// 2.2 预支付订单生成失败
	if (res2.meta.status !== 200) return uni.$showMsg("预支付订单生成失败");
	// 2.3 获取预支付订单相关的必要参数
	const payInfo = res2.message.pay;
		/*
			我们使用的token不是属于我们自己的,所以无法请求成功,展示一下正确请求后,得到的数据
				{
					"message": {
						"pay": {
						"timeStamp": "1564730510",
						"nonceStr": "SReWbt3nEmpJo3tr",
						"package": "prepay_id=wx02152148991420a3b39a90811023326800",
						"signType": "MD5",
						"paySign": "3A6943C3B865FA2B2C825CDCB33C5304"
						},
						"order_number": "HMDD20190802000000000422"
					},
					"meta": {
						"msg": "预付订单生成成功",
						"status": 200
					}
				}
		*/

	// 3. 发起微信支付
	// 3.1 调用uni.requestPayment()发起微信支付
	const [err, succ] = await uni.requestPayment(payInfo);
	// 3.2 未完成支付
	if (err) return uni.$showMsg("订单未支付");
	// 3.3 完成了支付后,需要进一步查询支付的结果,向发起查询支付结果请求
	const {data: res3} = await uni.$http.post("/api/public/v1/my/orders/chkOrder", {order_number: orderNumber});
	// 3.4 未完成支付
	if (res3.meta.status !== 200) return uni.$showMsg("订单未支付");
	// 3.5 提示支付完成
	uni.$showMsg("支付成功", "success");
}
```





















