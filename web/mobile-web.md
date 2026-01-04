# 移动 web

## meta视口标签

<img src="https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170915622.png">

最标准的viewport设置

+ 视口宽度和设备保持一致
+ 视口的默认缩放比例1.0
  + 不允许用户自行缩放
  + 最大允许的缩放比例1.0
  + 最小允许的缩放比例1.0



## 二倍图

> 物理像素 | 物理像素比

物理像素点值的屏幕上的小颗粒,是物理真实存在的

1px能显示的物理像素点的个数,就是物理像素比

> background-size

```css
/* 宽, 高 如果只有一个参数就是宽度*/
background-size: 100px 200px;
/* 相对于父盒子的50% 如果只有一个参数就是宽度*/
background-size: 80% 20%;
/* 等比缩放,覆盖掉整个盒子,可能会有内容显示不全 */
background-size: cover;
/* 等比缩放,当宽和高其中一个先达到父盒子的大小,就停止缩放 */
background-size: contain;
```



## 特殊样式

![image-20210814194440407](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170915623.png)



## 移动端布局

> 移动端兼容性问题

移动端浏览器都是以-webkit-内核为主,因此我们只要考虑-webkit-兼容问题

我们可以放心使用H5标签和C3样式

同时我们浏览器的私有前缀只需要考虑加-webkit-即可

> 移动端公共样式

移动端 CSS 初始化推荐使用 normalize.css/

Normalize.css：保护了有价值的默认值

Normalize.css：修复了浏览器的bug

Normalize.css：是模块化的

Normalize.css：拥有详细的文档

官网地址： <http://necolas.github.io/normalize.css/>

> 常见布局

单独移动端页面(主流)

* 流式布局(百分比布局)
* flex弹性布局(强烈推荐)
* less+rem+媒体查询布局
* 混合布局

响应式页面兼容移动端(其次)

* 媒体查询
* bootstarp



# flex布局



## info

flex是弹性布局,采用flex的父元素称为容器,其子元素,即容器成员称为项目

* 如果容器设置了flex,其项目的float,clear和vertical-align的属性将失效
* 伸缩布局 = 弹性布局 = 伸缩盒布局 = 弹性盒布局 = flex布局



## 父项属性



### classify

![image-20210815180035500](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170915625.png)



### flex-directon

```css
flex-directon: row;  /*设置主轴的方向为row,即为x轴正方向*/
```

![image-20210815175159488](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170915626.png)



### justify-content

```css
justify-content: flex-start;  /* 设置主轴上的子元素排列方式为从左往右 */
```

![image-20210815175424998](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170915627.png)



### flex-wrap

```css
flex-wrap: wrap | nowarp; /* 设置子元素换行 */
```

在flex布局中,默认为flex-wrap: nowrap,不会自动换行,如果子盒子的大小已经大于了父盒子,并不会像浮动那样,另起一行显示,只会缩小盒子的大小

设置为flex-wrap: wrap后,就会像浮动那样,如果装不下,就另起一行显示



### align-items(单行)

```css
align-items: center; /* 侧轴上的子元素居中对齐 */
```

![image-20210815200918936](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170915628.png)

* 注意stretch需要把侧轴上的那个子元素对应的宽或高的属性值去除,不然没法拉伸



### align-content(多行)

```css
align-content: center;  /* 让多行的子元素在侧轴上居中对齐 */
```

![image-20210815201736113](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170915629.png)

* 一定要使用flex-wrap: wrap来让盒子换行,不然没法实现多行操作摆放
* align-content只能在多行的情况下使用,单行的情况下使用不了



### flex-flow

```css
flex-flow: column wrap; /* 是flex-direction: column和flex-wrap: wrap的复写*/
```



## 子项属性



### flex

```css
.item {
  flex: 1; /* default 0 */
}
```



### align-self

```css
span:nth-child(2) {
  align-self: flex-end;/* 单独设置某一个元素在侧轴上的排列方式 */
}
```



### order

定义子元素的排列顺序,数值越小越靠前和z-index不一样,默认值为0





# rem布局



## info

rem是一个相对单位,1rem等于html元素的字体大小,类似于em, 1em是父元素的字体大小

比如，根元素（html）设置font-size=12px; 非根元素设置width:2rem; 则换成px表示就是24px。



## 媒体查询

> employ

```css
/* 在我们屏幕上,且最大宽度为800px时(即浏览器宽度<=800px时)执行里面的语句 */
@media screen and (max-width: 800px) {
  body {
    background-color: pink;
  }
}
```

> mediatype 查询类型: 将不同的终端设备划分成不同的类型,称为媒体类型

<img src="https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170915630.jpg">



## 引入资源

当浏览器缩小到一定程度,就引入一套css样式

当浏览器缩小到另一个程度,再引入另一套css样式

```html
/* 当屏幕宽度大于320px时,执行style320.css样式 */
<link rel="stylesheet" href="css/style320.css" media="screen and (min-width: 320px)" />
/* 当屏幕宽度大于640px时,执行style640.css样式 */
<link rel="stylesheet" href="css/style640.css" media="screen and (min-width: 640px)" />
```



## less



### 变量

```less
// 通过 @变量名 的方式来定义一个变量
@color: pink;
@font14: 14px;

body {
  // 调用变量
  background-color: @color;
}

div {
  font-size: @font14;
}
```



### 引入

因为我们的html只能引入css样式,所以需要将less文件转换成css文件

通过下载 `easy less`插件,只要对less文件,ctrl+s保存就得到一个css文件了



### 嵌套

```less
.header {
    a {
        // 直接在父元素里嵌套子元素
        color: green;
        &:hover {
            // 用 & 来连接伪类选择器
            font-size: 20px;
        }
        &::after {
            // 伪元素选择器也得用 & 来连接
            content: "";
        }
    }
}
ul {
    li {
        /* 选中第一个li */
        &:nth-child(1) {
            /* 该li的after伪元素 */
            &::after {
                font-size: 40px
            }
        }
    }
}
```



### 运算

```less
@font14: 14px + 20px; // 可以直接进行运算
@width30: 30px + 5; // 35px, 以有单位的为准
@height20: (20rem / 30px); // 以rem的单位为准
div {
    font-size: (@font14 / 50); // 注意除法运算必须加括号
    background-color: #666 - #333; // 颜色也可以进行计算的!! 
}
```

* 运算符左右两边必须有空格隔开
* 如果两个数据中,只有一个有单位符号,则最终单位符号以有单位符号的那一个为准
* 如果两个数据中,都有单位符号,则最终单位符号以第一个数据的单位符号为准



## rem适配方案

em + 媒体查询 + less技术

* 假设设计稿是750px, 我们把屏幕划分为15等份,每一份就是50px

* 在320px设备的时候,字体大小就是320/15 就是 21.33px

* 我们页面元素的大小除以不同html字体大小会发现他们的比例还是相同的

* 公式: 元素的rem值 = 元素px值 / (屏幕宽度 / 划分的份数)

  屏幕的宽度/划分的份数 就是html font-size的大小

  即 **元素的rem值 = 元素px值 / html font-size的大小**



# 响应式布局



## info

通过媒体查询,来给浏览器在不同宽度下,显示不同的排版内容的效果,这样的布局设计也是Bootstrap的container设计

* 超小屏(手机, 小于768px) : 设置宽度为100%
* 小屏幕(平板, 大于等于768px) : 设置宽度为750px 
* 中等屏幕(桌面显示, 大于等于992px) : 设置宽度为970px
* 大屏幕(大桌面显示器, 大于等于1200px) : 设置宽度为1170px

```css
@media screen and (max-width: 768px) {
  .container {
    width: 100%;
  }
}
@media screen and (min-width: 769px) {
  .container {
    width: 750px;
  }
}
@media screen and (min-width: 992px) {
  .container {
    width: 970px;
  }
}
@media screen and (min-width: 1200px) {
  .container {
    width: 1170px;
  }
}
```



## Bootstrap



### 栅格选项参数

![image-20210818185345303](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170915631.png)

* 如果超过12份,多出了的会另起一行显示
* 如果不足12份,就显示相应的份数



### 列嵌套

在列嵌套时,最好加1个row这样可以取消父元素的padding值,而且高度自动和父级一样



### 列偏移

```html
<!-- 向右列偏移8份 -->
<div class="col-md-2 col-md-offset-8">2</div>
<!-- 如果是一个盒子就偏移 (12 - 8) / 2 = 2 -->
<div class="col-md-8 col-md-offset-2"></div>
```



### 列排序

```html
<!-- 将盒子1 push(推,即向右)8份,将盒子2 pull(拉, 即向左)2份 -->
<div class="col-md-2 col-md-push-8">1</div>
<div class="col-md-8 col-md-pull-2">2</div>
```



### 响应式工具

![image-20210818193959921](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202206170915632.png)

与hidden相反的是visible,这个用来显示盒子, 例如 .visible-xs .visible-sm…





# details



## flex布局初始化

```css
body {
  max-width: 540px;
  min-width: 320px;
  margin: 0 auto;
  font: normal 14px/1.5 Tahoma,"Lucida Grande",Verdana,"Microsoft Yahei",STXihei,hei;
  color: #000;
  background: #f2f2f2;
  overflow-x: hidden;
  -webkit-tap-highlight-color: transparent;
}
```

* 注意flex布局是需要设置max-width和min-width的,百分比布局也是一样需要注明



## rem布局初始化

```css
body {
  min-width: 320px;
  width: 15rem;
  margin: 0 auto;
  background-color: #f2f2f2;
  height: 3000px;
}
```

* rem布局不需要设置max-width,只需要设置一个min-width即可



## 响应式布局初始化

* 引入bootstrap框架

* 再引入针对ie兼容性问题处理的语句,直接从官网复制即可

  ```html
  <!--[if lt IE 9]>
  <script src="https://cdn.jsdelivr.net/npm/html5shiv@3.7.3/dist/html5shiv.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/respond.js@1.4.2/dest/respond.min.js"></script>
  <![endif]-->
  ```

* 利用媒体查询修改 container宽度适合效果图宽度

  * 因为本效果图采取 1280的宽度， 而Bootstrap 里面 container宽度 最大为 1170px，因此我们需要手动改下container宽度

    ```css
    /* 利用媒体查询修改 container宽度适合效果图宽度  */
    @media (min-width: 1280px) { 
      .container { 
        width: 1280px; 
      } 
    }
    ```

* 最后只需要在.container的盒子里写html标签即可

  ```html
  <div class="container">
    
  </div>
  ```

  





















