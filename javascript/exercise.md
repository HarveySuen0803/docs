# 拖动元素

```js
var div = document.querySelector("div");
// 手指初始坐标
var startX = 0;
var startY = 0;
// 盒子初始坐标
var x = 0;
var y = 0;
// 刚触摸上去的时候,获取此时的盒子坐标以及手指的坐标
div.addEventListener("touchstart", function (e) {
    // 通过事件对象来获取当时的手指的位置
    startX = e.targetTouches[0].pageX;
    startY = e.targetTouches[0].pageY;
    // 通过offset系列的属性来获取此时盒子的坐标,即初始坐标
    x = this.offsetLeft;
    y = this.offsetTop;
});
div.addEventListener("touchmove", function (e) {
    // 计算盒子移动的距离moveX,moveY,通过touchmvoe事件,实时获取移动的坐标,然后减去最初的坐标
    var moveX = e.targetTouches[0].pageX - startX;
    var moveY = e.targetTouches[0].pageY - startY;
    // 通过 移动的距离 + 原始的坐标 = 移动后的坐标,即结果
    div.style.left = moveX + x + "px"; // 不要忘记了添加px单位,还有就是div的盒子需要有定位,不然left和top没有用呀
    div.style.top = moveY + y + "px";
    // 因为我们在使用手机的时候,使用手指在屏幕上移动会默认的移动屏幕,所以我要阻止这一个默认事件
    e.preventDefault();
});
```

通过修改盒子的left和top值,从而让盒子能够跟随手指移动

这里的 left 和 top 值 = 盒子原始的坐标 + 手指移动的距离

手指移动的距离的计算方式

* 通过touchstart,获取手指初始的坐标,并且获取盒子的offsetLeft和offsetTop,即盒子的初始坐标
* 通过touchmove,实时获取手指在移动中的坐标
* 此时用手指移动后的坐标 - 手指初始的坐标 = 手指移动的距离

# 记住用户名案例

```html
<input type="text" id="userName" />
<input type="checkbox" id="remember" />
记住用户名
<script>
    var userName = document.querySelector("#userName");
    var remember = document.querySelector("#remember");
    if (localStorage.getItem("userName")) {
        userName.value = localStorage.getItem("userName");
        remember.checked = true;
    }
    remember.addEventListener("change", function () {
        if (remember.checked) {
            localStorage.setItem("userName", userName.value);
            return;
        }
        localStorage.removeItem("userName");
    });
</script>
```

# click 延时解决

> 方法1: 引入fastclick.js插件

* 先引入fastclick.js文件

* 之后在js文件里编写这样一段代码:

  ```js
  if ('addEventListener' in document) {
      document.addEventListener('DOMContentLoaded', function() {
          FastClick.attach(document.body);
      }, false);
  }
  ```


> 方法2: 封装了一个方法

```js
//封装tap，解决click 300ms 延时
function tap(obj, callback) {
    var isMove = false;
    var startTime = 0; // 记录触摸时候的时间变量
    obj.addEventListener("touchstart", function (e) {
        startTime = Date.now(); // 记录触摸时间
    });
    obj.addEventListener("touchmove", function (e) {
        isMove = true; // 看看是否有滑动，有滑动算拖拽，不算点击
    });
    obj.addEventListener("touchend", function (e) {
        if (!isMove && Date.now() - startTime < 150) {
            // 如果手指触摸和离开时间小于150ms 算点击
            callback && callback(); // 执行回调函数
        }
        isMove = false; //  取反 重置
        startTime = 0;
    });
}
//调用
tap(div, function () {
    // 执行代码
});
```

# 淡入淡出

```js
$(selector).fadeOut(speed,callback) // 淡出效果
$(selector).fadeIn(speed,callback) // 淡入效果
```

![image-20211117145029057](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508748.png)

```js
$btn.fadeOut(0); // 0的速度,让所有的$btn都隐藏起来
$imgList.hover(function () { // 当鼠标移动到上面,就执行回调函数1
    $(this).find('button').stop().fadeIn(); // 淡入  注意这里是找到 this后面的button按钮...
    $(this).find('p').stop().fadeOut(); // 淡出

}, function () { // 当鼠标移走,就执行回调函数2
    $(this).find('p').stop().fadeIn();
    $(this).find('button').stop().fadeOut();
});
// stop()的作用是终止动画,比如,鼠标移上去,button开始显现,如果我们此时还没有等起显现完全就拿出来,就会终止该显现的动画
```

# 按钮布局

```html
<div class="buttons">
    <input type="image" src="uploads/video_rewind_64.png" class="rewink" title="后退"> 
    <input type="image" src="uploads/video_play_64.png" class="play">
    <input type="image" src="uploads/video_forward_64.png" class="forwards"> 
    <input type="image" src="uploads/volume_down_64.png" class="volume-down">
    <input type="range" min=0 max=1 step=0.1 value="0" class="vol">
    <input type="image" src="uploads/volume_up_64.png" class="volume-up">
</div>
```

![image-20211012170422871](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508749.png)






