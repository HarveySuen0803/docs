# canvas

![image-20211029103823867](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508732.png)

```html
<canvas id="myCanvas", width="200px" height="200px"></canvas> // 设置画布的宽度和高度为200px
```

```js
let myCanvas = document.querySelector("#myCanvas");
let context = myCanvas.getContext("2d"); // 通过myCanvas获取到context,表示绘制2d环境的图
context.fillStyle = "red";
context.fillRect(50, 50, 100, 100);
```

# moveTo(),lineTo()

![image-20211029104303812](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508733.png)

```js
let myCanvas1 = document.querySelector("#myCanvas1");
let context1 = myCanvas1.getContext("2d");
context1.moveTo(50, 50); // 从 (50, 50) 开始
context1.lineTo(150, 100); // 从 (50, 50) 绘制到 (150, 100)
context1.lineTo(100, 150); // ...
context1.lineTo(50, 50);
context1.lineWidth = 3; // 设置画笔的宽度为3
context1.strokeStyle = "blue"; // 设置画笔颜色样式为 "blue"
context1.stroke(); // stroke()表示绘制的是线条,注意这个stroke()必须要写,不然没法绘制
```

![image-20211029104444629](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508734.png)

# arc

![image-20211029104658144](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508735.png)

```js
let myCanvas2 = document.querySelector("#myCanvas2");
let context2 = myCanvas2.getContext("2d");
// arc(x, y, 半径, 起始弧度, 终止弧度, 顺时针绘图)
context2.arc(50, 100, 30, 0, (Math.PI/180)*120, false);
context2.lineWidth = 2;
context2.strokeStyle = "red";
context2.stroke();
```

# fill(),stroke()

* fill() 表示填充
* fillStyle 画笔的颜色
* stroke() 表示绘制线条
* strokeStyle 画笔的颜色

```js
context4.arc(100, 100, 100, 0, (Math.PI / 180) * 360, false);
context4.fillStyle = "yellow"; // 设置填充的颜色为yellow
context4.fill(); // 填充一个圆
context5.arc(100, 100, 100, 0, (Math.PI / 180) * 360, false);
context5.strokeStyle = "red"; // 设置线条画笔的颜色为红色
context5.stroke(); // 绘制一个圆的线条
```

# beginPath(),closePath()

![image-20211029200134250](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508736.png)

```js
context4.fillStyle = "pink";
context4.beginPath(); // 设置该context4画笔的开始
context4.arc(100, 100, 100, 0, (Math.PI / 180) * 360, false);
context4.fill();
context4.closePath(); // 设置该context4画笔的结束,必须要设置结束,不然,待会绘制图形都是从这边结束的位置开始绘制的,会出现各种问题

context4.lineWidth = 3;
context4.strokeStyle = "white";
context4.beginPath();
context4.arc(100, 100, 30, (Math.PI / 180) * 30, (Math.PI / 180) * 150, false);
context4.stroke();
context4.closePath();
```

# fillRect(),strokeRect()

fillRect() 可以用于填充一个矩形块

strokeRect() 可以用于绘制一个矩形边框

```js
// 以 (25, 25) 为左上角坐标 绘制一个150 * 50 的 黄色矩形
context3.fillStyle = "yellow";
context3.fillRect(25, 25, 150, 50);
// 以 (35, 35) 为左上角坐标 绘制一个 130 * 30 的 红色矩形边框
context3.strokeStyle = "red";
context3.strokeRect(35, 35, 130, 30);
```

# 方蓓塞曲线

![image-20211102141909388](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508737.png)

```js
// quadraticCurveTo()可以用于绘制二次方蓓塞曲线
context9.moveTo(20, 20); // (20, 20)为开始点
context9.quadraticCurveTo(20, 100, 200, 20); // (20, 100)为控制点, (200, 20)为结束点
```

![image-20211102142257909](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508738.png)

```js
// bezierCurveTo()用于绘制三次方蓓塞曲线
context10.moveTo(20, 20); // (20, 20)为开始点
context10.bezierCurveTo(20, 100, 200, 100, 200, 20); // (20, 100)为控制点1, (200, 100)为控制点2, (200, 20)为终止
```

# drawImage()

<img src="https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508739.png" alt="image-20211104160931090"  />

```js
// 按照原始尺寸裁切img图片,在(10, 20)处绘制一张原始尺寸大小的图片
context.drawImage(img, 10, 20); 
// 按照原始尺裁切img图片,在(10, 20)处绘制一张,宽为100,高位150的图片
context.drawImage(img, 10, 20, 100, 150);
// 在img图片的以(30, 50)为左上角坐标的位置裁切一张宽为100,高为150的图片,并且画板的(200, 150)处绘制一张宽为100,高位150的图片
context.drawImage(img, 30, 50, 100, 150, 200, 150, 100, 150);
```

# clip(),clearRect()

```js
btn.addEventListener("click", function() {
  context.clearRect(0, 0, canvas.width, canvas.height); // 让裁切的部分隐藏起来
  context.arc(100, 100, 50, 0, Math.PI * 2, true); // 在(100, 100)处绘制一个半径为50的整圆
  context.clip(); // 裁切操作
  context.drawImage(img, 0, 0); // 再绘制一次图像
})

// 随机在canvas上裁切一个半径为50的圆
context.arc(Math.random() * canvas.width, Math.random() * canvas.height, 50, 0, Math.PI * 2, false);
context.clip();
```

<img src="https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202203311508740.png" alt="image-20211104161736541" style="zoom:50%;" />

# clearRect()

```js
context.clearRect(0,0,700,400); // 以(0, 0)为左上角坐标 ,清除宽700,高40
```

# save(),restore()

```js
oCtx.fillStyle = 'red';
oCtx.fillRect(100, 100, 100, 50);
oCtx.save(); // 通过oCtx.save()保存了样式(即"red")到堆中

oCtx.fillStyle = 'pink';
oCtx.fillRect(120, 120, 100, 50);

oCtx.restore(); // 通过oCtx.restore()调用保存的样式
oCtx.fillRect(150, 150, 100, 50);

oCtx.fill();
```

# 绘制文本

```js
oCtx.font = '30px 楷体'; // 文本样式
oCtx.textAlign = 'center'; // 文本水平居中
oCtx.textBaseline = 'middle'; // 文本垂直居中

oCtx.beginPath();
oCtx.fillStyle = 'white';
oCtx.fillText('谁', 80, 150); // 填写'谁'这个字在(80, 150)的位置
oCtx.closePath();
```
