# ECharts的基本使用

Echarts官网: https://echarts.apache.org/zh/index.html

```html
<!-- 
    echarts的使用步骤:
    	准备一个有 宽和高 的容器
    		<div class="box"></div>
    	引入 echarts.js
    		<script src="./js/echarts.min.js"></script>
    	初始化实例对象
    		let myChart = echarts.init(document.querySelector('.box'))
    	指定配置项和数据(从官网拷贝)
    		let option = {...}
    	把配置项给实例对象
			myChart.setOption(option)
-->
<head>
    <style>
        .box {
            width: 500px;
            height: 500px;
            background-color: pink;
        }
    </style>
</head>

<body>

    <div class="box"></div>
    <!-- 引入echarts.js -->
    <script src="./js/echarts.min.js"></script>
    <script>
        // 初始化echarts实例对象
        let myChart = echarts.init(document.querySelector('.box'))
        // 指定配置项和数据
        let option = {
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: [120, 200, 150, 80, 70, 110, 130],
                    type: 'bar'
                }
            ]x
        };
        myChart.setOption(option)
    </script>
</body>
```

# options的配置

```json
let option = {
    // color设置我们线条的颜色,注意后面是个数组
    color: ['pink', 'skyblue', 'gray', 'orange', 'cadetblue'],
    // 图表的标题
    title: {
        text: 'Stacked Line'
    },
    // 图标的提示框组件
    tooltip. {
        // 触发方式
        // * item 鼠标移到柱状图上触发
        // * axis 鼠标移到坐标轴上触发
        trigger: 'axis',
        // 鼠标移动上去的样式: 鼠标指向有一个横向对齐的标尺,即显示当前坐标
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#6a7985'
            }
        }
    },
    // 图例组件,显示有哪些种类的数据,正常显示一行或者一列的
    legend: {
        // 如果serious里配置了name属性,那么这里data可以删除掉
        // data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine'],

        // 设置垂直防止
        // orient: 'vertical', 

        // 设置图例组件的位置
        left: 'centet',
        bottom: '0%',

        // 小图标的宽度和高度
        itemWidth: 10,
        itemHeight: 10,

        // 修改图例组件的文字样式
        textStyle: {
            color: "rgba(255,255,255,.5)",
            fontSize: "12"
        }
    },
    // 网格配置,可以控制 线形图,柱状图,图标 的大小
    grid: {
        // 控制 网格 距离 整张图标 的位置
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true, // 将x和y的刻度标签包含在内
        show: true, // 显示边框
        borderColor: '#012f4a', // 边框颜色
    },
    // 工具箱组件,右上角的,可以保存图片...
    toolbox: {
        feature: {
            // 设置可以保存图片
            saveAsImage: {}
        } 
    },
    // 横坐标
    xAxis: {
        // 设置坐标轴的类型为: 类目轴(就是折线,柱状...) 
        type: 'category',
        // 设置线条和坐标轴是否有缝隙,默认为false,即可以不添加
        boundaryGap: false,
        // 设置x轴数据
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        // 数据显示反转,比如原先,从左到右是 'Mon', 'Tue', "Wed',反转后即使'Wed', 'Tue', 'Mon'
        inverse: true,
        // 剔除轴线颜色
        axisLine: {
            show: false
        },
        // 修改刻度标签字体颜色,样式...
        axisLabel: {
            color: '#4c9bfd' // 文本颜色
        },
    },
    // 纵坐标  x轴和y轴,可以通过[]来包裹对象,存放第二组数据
    yAxis: {
        // 设置坐标轴的类型为: 数值轴
        type: 'value',
        // 分割线设置, 即一些大刻度的分割线,比如100, 200, 300,
        splitLine: {
            // 注意splitLine修改样式,需要添加lineStyle
            lineStyle: {
                color: '#012f4a' // 分割线颜色
            }
        }
    },
    // 系列图标配置 它决定着显示哪种类型的图标
    series: [
        // 系列1
        {
            name: 'Email',
            // 设置类型为折线
            type: 'line',
            /*
                    如果设置了stack为相同的值,下一个系列的值,是在其基础上加上去的,比如: 
                    * 系列1的第一个数据是120,系列2的第一个数据是220
                    * 那么添加了相同的stack后
                    * 系列2的数据在图标上显示就是 120 + 220 = 340 的位置处
                  */
            stack: 'Total',
            // 数据项
            data: [120, 132, 101, 134, 90, 230, 210]
        },
        // 系列2
        {
            name: 'Union Ads',
            type: 'line',
            stack: 'Total',
            data: [220, 182, 191, 234, 290, 330, 310]
        }
        // 系列...
    ]
}
```

# bar的部分配置

## series配置项

```json
// 柱子的宽度
barWidth: '35%',
// 设置柱子的样式
itemStyle: {
    color: "none", // 设置柱子颜色
    borderColor: "#00c1de", // 设置柱子边框颜色
    borderWidth: 2, // 设置柱子边框宽度
    barBorderRadius: 5 // 设置柱子的圆角
},
// 设置层级, 比如希望第二个柱子压在第一个柱子身上,就可以设置层级,类似于z-index
yAxisIndex: 0,
// 柱子之间的距离
barCategoryGap: 50,
//柱子的宽度
barWidth: 10,
// 图形上的文本标签,可以用来显示百分比数据
label: {
    normal: {
        show: true,
        position: "inside", // 图形内显示
        formatter: "{c}%", // 文字的显示格式, c是占位符
        fontSize: '8', // 字体大小
    }
},
```

# line的部分配置

## series配置项

```json
// 线条下的填充颜色
areaStyle: {
    // 设置 透明度
    opacity: 0.8,
    // 设置 渐变色
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        // 起始颜色
        {
            offset: 0,
            color: 'rgb(128, 255, 165)'
        },
        // 终点颜色
        {
            // 偏移量, 偏移量大的话,过渡更明显一点
            offset: 1,
            color: 'rgb(1, 191, 236)'
        },
    ], false)
},
// 阴影颜色
shadowColor: "rgba(0, 0, 0, 0.1)",

// 设置 拐点图形: 'circle', 'rect', 'roundRect', 'diamond', 'pin', 'arrow', 'none'
symbol: 'circle',
// 设置 拐点大小
symbolSize: 12,
// 设置 拐点样式
itemStyle: {
    color: "#0184d5", // 颜色
    borderColor: "rgba(221, 220, 107, .1)", // 边框
    borderWidth: 12 // 边框宽度
},
// 设置 开始不显示拐点,鼠标移动上去显示拐点
showSymbol: false,

// 设置线条光滑,即从原来的 折线 -> 曲线
smooth: true,
```

# pie的部分配置

## series配置项

```json
// 设置 饼形图在容器中的位置
center: ['50%', '50%'],
// 设置 内圆半径和外圆半径(百分比是相对于容器宽度来说的),如果想要传统的饼图,即无内圆,就把内圆设置为'0%'
radius: ['40%', '70%'],

// 设置文本显示样式
label: {
    // 一开始不显示标签文本,鼠标移上去就显示文本
    show: false,
    // 设置显示的位置是正中间,如果不设置,就是在圆的旁边
    position: 'center',
    // 调整文字的样式
    fontSize: 10
},

// 调整图形和文字的连接线,一条连接线由两条线组成
labelLine: {
    // show: false // 不显示

    // 连接图形的线条
    length: 5,
    // 连接文字的线条
    length: 7
}

// 数据项
data: [
    {value: 20, name: '云南'},
    {value: 26, name: '北京'},
    {value: 24, name: '山东'},
    {value: 25, name: '河北'},
    {value: 20, name: '江苏'},
    {value: 25, name: '浙江'},
    {value: 30, name: '四川'},
    {value: 42, name: '湖北'}
],
```

# 部分技巧

## 遍历添加多个颜色

```js
var myColor = ["#1089E7", "#F57474", "#56D0E3", "#F8B448", "#8B78F6"];
let option = {
    ...
    series: {
        name: '条',
        type: 'bar',
        data: [70, 34, 60, 78, 69],
        // 给系列添加颜色
        itemStyle: {
            barBorderRadius: 5,
            color: function(params) {
                return myColor[params.dataIndex]
            }
        },
    }
}

```

## 让内容大小随着窗口变化

```js
window.addEventListener("resize", function () {
    myChart.resize();
});
```











