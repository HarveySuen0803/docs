# 展示php的详细配置

```php
<?php
    phpinfo();
?>
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719105.png)

# 输出

```php
// echo 可以输出 一个/多个 字符串, 用","隔开
echo "hello", "world", "!!!";

// print 只可以输出 一个 变量
print "hello";

// print_r() 可以输出 一个 变量
print_r("hello world");

// var_dump() 可以 输出 数据 + 数据类型
var_dump("hello world"); // string(11) "hello world"
```

# 数据类型

```php
// 定义整形变量
$x1 = 10;
var_dump($x1); // int(10)

// 定义浮点型变量
$x2 = 123.456;
var_dump($x2); // float(123.456)

// 定义布尔型变量
$x3 = true;
var_dump($x3); // bool(true)

// 定义字符串型变量
$x4 = "hello world";
var_dump($x4); // string(11) "hello world"

// 定义NUll
$x5 = null;
var_dump($x5); // NULL
```

# 字符串

```php
$name = "sun";

// "" 可以解析变量
$show1 = "my name is $name";
echo $show1; // my name is sun

// '' 不可以解析变量
$show2 = 'my name is $name';
echo $show2; // my name is $name

// "'{}'" 内可以解析变量
$show3 = "my name is '{$name}'";
echo $show3; // my name is 'sun'

// 可以通过 "." 来拼接字符串,类似于java中的"+"
echo "my " . "name " . "is " . $name; // my name is sun
```

# 数组

## 普通数组

```php
// 定义的数组 (方法1)
$arr1 = array(
    "sun",
    "xue",
    "cheng"
);

// 定义数组 (方法2)
$arr2 = [
    "sun",
    "xue",
    "cheng"
];

// 输出整个数组
var_dump($arr1); // array(3) { [0]=> string(3) "sun" [1]=> string(3) "xue" [2]=> string(5) "cheng" }
print_r($arr2); // Array ( [0] => sun [1] => xue [2] => cheng )
// echo $arr1; // Warning;
echo "<hr>";

// 输出数组中的某个元素
echo $arr1[0]; // sun
echo $arr1[1]; // xue

// 设置数组的key (默认: 0,1,2...)
$arr3 = [
    "name" => "sun",
    "age" => 18,
];

echo $arr3["name"]; // sun
// echo $arr3[0]; // warning

var_dump($arr3); // array(2) { ["name"]=> string(3) "sun" ["age"]=> int(18) }
print_r($arr3); // Array ( [name] => sun [age] => 18 ) 
```

## 多维数组

```php
// 定义多维数组 (方法1)
$arr1 = array(
    array(
        "name",
        "xue",
        array(
            "jerry",
            "king",
            array(
                "smith"
            )
        )
    ),
    array(
        "tom",
    ),
    array(
        "jack"
    )
);
// 定义多维数组 (方法2)
$arr2 = [
    [
        "name",
        "xue",
        [
            "jerry",
            "king",
            [
                "smith"
            ],
        ],
    ],
    [
        "tom",
    ],
    [
        "jack",
    ],
];

// 输出数组的某一个元素
echo $arr1[0][2][1]; // king

// 输出多维数组
var_dump($arr1); 
    /*
        array(3) {
            [0]=>
            array(3) {
                [0]=>
                string(4) "name"
                [1]=>
                string(3) "xue"
                [2]=>
                array(3) {
                    [0]=>
                    string(5) "jerry"
                    [1]=>
                    string(4) "king"
                    [2]=>
                    array(1) {
                        [0]=>
                        string(5) "smith"
                    }
                }
            }
            [1]=>
            array(1) {
                [0]=>
                string(3) "tom"
            }
            [2]=>
            array(1) {
                [0]=>
                string(4) "jack"
            }
        }
    */
```

# 条件判断语句

```php
$str = "sun";

// 三元运算符
echo $str == "sun" ? "是" : "不是"; // "是"

// if, else-if, else
if ($str == "sun") {
    echo "hello sun";
} else if ($str == "xue") {
    echo "hello xue";
} else {
    echo "hello someone";
}

// switch()
switch ($str) {
    case "sun":
        echo "hello sun";
        break;
    case "xue":
        echo "hello xue";
        break;
    default: 
        echo "hello someone";
        break;
}

// match() 类似于switch() (php8新增)
echo match($str) {
    "sun" => "hello sun",
    "xue" => "hello xue",
}; // hello sun
```

# 循环语句

## foreach()

```php
// 一般都使用foreach()来遍历数组

$arr = [
    "s1" => "sun",
    "s2" => "xue",
    "s3" => "cheng",
];

// 遍历$arr,输出value
foreach ($arr as $v) {
    echo $v . " "; // sun xue cheng
}
echo "<br>";

// 遍历$arr,输出key和value
foreach ($arr as $k => $v) {
    echo $k . ": " . $v . " "; // s1: sun s2: xue s3: cheng
}
echo '<br>';


$arr2 = [
    [
        "sun",
        "xue",
        "cheng",
    ],
    [
        "jack",
        "tom",
        "jerry",
    ],
];

// 遍历多维数组
foreach ($arr2 as $k => $v) {
    foreach ($v as $kk => $vv) {
        echo $kk . ": " . $vv . " ";
    }
    echo "<br>";
}
    /*
        0: sun 1: xue 2: cheng
        0: jack 1: tom 2: jerry
    */
    
// continue 和 break 的用法...
for ($i = 1; $i < 10; $i++) {
    if ($i == 2) {
        continue;
    }
    if ($i == 5) {
        break;
    }
    echo $i . " ";
}
```

## while

```php
// while
$i = 0;
while ($i < 10) {
    echo $i;
    $i++;
}

echo '<hr>';

// do-while
$i = 0;
do {
    echo $i;
    $i++;
} while ($i < 10);
```

## for

```php
for ($i = 0; $i < 10; $i++) {
    echo $i . " ";
}
```

# 函数

## 判断函数

```php
/*
    isset() 判断变量是否存在
        如果存在,返回1,bool值为true
        如果不存在,返回"",bool值为false
*/
echo isset($arr);
var_dump(isset($arr)); // bool(false)

/*
    empty() 判断变量是否空
        如果为空,返回1,bool值为true
        如果不为空,返回"",bool值为false
*/
echo empty($arr);
var_dump(empty($arr));

// 直接判断一个不存在的变量，会报错
// if($arr){} // Error

// 使用isset()和empty()来判断一个不存在的变量,不会报错
if (isset($arr)) {
    echo "存在";
}
if (empty($arr)) {
    echo "为空";
}
```

## String

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719107.png)

## Array

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719108.png)

```php
$arr = [
    "name" => "sun",
    "age" => "18",
    "job" => [
        "type" => "java enginer",
        "sal" => "50k",
    ],
];

// json_encode() 将数组转成json格式钉钉数据
echo json_encode($arr); // {"name":"sun","age":"18","job":{"type":"java enginer","sal":"50k"}}
```

## 自定义函数

```php
// 定义函数,配置参数,配置参数默认值
function add($num1, $num2 = 20, $num3 = 30) {
    return $num1 + $num2 + $num3;
}

echo add(10); // 60

function show($str1 = "", $str2 = "", $str3 = "", $str4 = "") {
    echo $str1;
    echo $str2;
    echo $str3;
    echo $str4;
}

// 给指定参数传值 (php8)
show(str3: "sun", str1: "xue");
```

# 运算符

```php
// php8中,0表示false,其他都是true
var_dump(boolval(0)); // bool(false) 
var_dump(boolval(1)); // bool(true) 
var_dump(boolval(-1)); // bool(true)

// "==" 比较 值
var_dump("true" == true); // bool(true)
// "===" 比较 值 + 类型
var_dump("true" === true); // bool(false)
var_dump(100 === 100); // bool(true)

// "!=" 比较 值
var_dump("true" != true); // bool(false)
// "!==" 比较 值 + 类型
var_dump("true" !== true); // bool(true)
var_dump(100 !== 100); // bool(false)

// && 和 and 表示 与: 有一个假就为假
var_dump(true && true); // bool(true) 
var_dump(true && false); // bool(false) 
var_dump(true and false); // bool(false)

// || 和 or 表示 或 有一个为真就为真
var_dump(true || false); // bool(true) 
var_dump(false || false); // bool(false)

// xor 表示 异或 不同返回true,相同返回false
var_dump(true xor false); // true
var_dump(true xor true); // false
var_dump(false xor false); // false

// ! 表示 取反
var_dump(!true); // false
var_dump(!false); // true
```

# php代码的混编

```php
<!-- 方法1 -->
<ul>
	<?php 
		$menu = [
			'首页',
			'服务器',
			'PHP',
			'前端',
			'Thinkphp',
			'Layui',
			'小程序'
		];
	?> 
	<?php 
		foreach ($menu as $menu_v) {
	?>
			<li>
				<a href="/index.html"><?php echo $menu_v; ?></a>
			</li>
	<?php 
		}
	?>
</ul>

<!-- 方法2 -->
<ul>
	<?php 
		$menu = [
			'首页',
			'服务器',
			'PHP',
			'前端',
			'Thinkphp',
			'Layui',
			'小程序'
		];

		foreach ($menu as $menu_v) {
			echo '<li>';
			echo '<a href="/index.html">' . $menu_v . '</a>';
			echo '</li>';
		}
	?> 
</ul>
```

# JIT

- JIT(Just-In-Time)即时编译器,是 PHP 8.0 中最重要的新功能之一,可以极大地提高性能
- JIT编译器 是作为扩展集成到 php 中 Opcache 扩展中,用于运行时将某些操作码直接转换为cpu指令
	- 我们需要先开启并配置Opcache,然后再配置JIT
	- 修改 softs\php\php-8.0.2-nts\php.ini 配置文件即可完成配置

> 开启 Opcache, 打开如下的配置

```ini
zend_extension=opcache
```

> 配置 Opcache, 打开如下的配置

```ini
; Determines if Zend OPCache is enabled
opcache.enable=1

; Determines if Zend OPCache is enabled for the CLI version of PHP
opcache.enable_cli=0

; The OPcache shared memory storage size.
opcache.memory_consumption=128

; The amount of memory for interned strings in Mbytes.
opcache.interned_strings_buffer=8

; The maximum number of keys (scripts) in the OPcache hash table.
; Only numbers between 200 and 1000000 are allowed.
opcache.max_accelerated_files=10000
```

> 配置 JIT, 添加如下的配置

```ini
opcache.jit=tracing
opcache.jit_buffer_size=100M
```

> 开启 php 扩展目录, 打开如下配置

```ini
extension_dir = "ext"
```

> 测速速度程序

```php
<?php
	// 返回当前时间戳的微秒数
	$start = microtime(true) ;

	$total = 0;
	for ($i=0; $i < 1000000; $i++) { 
		$total += $i;
	}

	echo "Count: ".$i.",Total: " . $total . "\n";

	// 返回当前时间戳的微秒数
	$end = microtime(true);

	// 计算开始到结束，所用时间
	$spend = floor(($end - $start) * 1000);

	echo "Time use: " . $spend . " ms\n";
?>
```

# PDO操作数据库

```php
// 连接数据库,获取到PDO对象
$pdo = new PDO('mysql:host=localhost;dbname=db01', 'root', '111');
// 编写sql语句
$stmt = $pdo->prepare('SELECT * FROM article');
// 执行sql语句
$stmt->execute();
// 获取执行结果
$arr = $stmt->fetchAll();
// 输出执行结果
print_r($arr);
```

> 字符编码

```php
// 方法一,发送请求时添加请求头
header('content-type:text/html;charset=utf-8');

// 方法二,获取PDO对象时,设置数据库的编码格式
$pdo = new PDO('mysql:host=localhost;dbname=boke', 'root' , 'root' , array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8';"));

// 方法三,查询时按照utf8的格式查询
$pdo->query('SET NAMES utf8');
```

# 超全局变量

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719109.png)

## $\_GET,$\_POST, $\_REQUEST,$GLOBALS

```html
<html>
	<head>
		<meta charset="utf-8">
		<title>PHP中文网</title>
	</head>
	<body>
		<form action="" method="get">
			姓名: <input type="text" name="name">
			年龄: <input type="text" name="age">
			<input type="submit" value="提交">
		</form>
	</body>
	<body>
		<form action="" method="post">
			性别: <input type="text" name="sex">
			工作: <input type="text" name="job">
			<input type="submit" value="提交">
		</form>
	</body>
</html>
```

```php
// 收集来自 method="get" 的表单中的值 (注: 也是url参数)
if(!empty($_GET)){
    print_r($_GET); // Array ( [name] => sun [age] => 18 )
}
// 收集来自 method="post" 的表单中的值
if(!empty($_POST)){
    print_r($_POST); // Array ( [sex] => male [job] => java )
}

// 相当于 $_GET + $_POST + $_COOKIE
// $_GET 和 $_POST 是默认开启的, $_COOKIE需要手动开启
if(!empty($_REQUEST)){
    print_r($_REQUEST);
}

$arr = [
    "sun",
    "xue",
    "cheng"
];
$num = 10;
$str = "hello world";
// $GLOBALS中存储着所有的变量, $GLOBALS = $_GET + $_POST + $_COOKIE + $_FILES + $_REQUEST + 我们定义的变量
print_r($GLOBALS);
    /*
        Array
        (
            [_GET] => Array
                (
                    [name] => xue
                    [age] => 18
                )

            [_POST] => Array
                (
                )

            [_COOKIE] => Array
                (
                )

            [_FILES] => Array
                (
                )

            [_REQUEST] => Array
                (
                    [name] => xue
                    [age] => 18
                )

            [GLOBALS] => Array
        *RECURSION*
            [arr] => Array
                (
                    [0] => sun
                    [1] => xue
                    [2] => cheng
                )

            [num] => 10
            [str] => hello world
        )
    */
```

## $\_COOKIE, $\_SESSION

> $_COOKIE

```php
// 存储cookie
setcookie('user','sun');
```

```php
// 获取cookie
print_r($_COOKIE);
```

> $_SESSION

```php
// 存储session

// session_save_path("D:/"); // 如果C盘没有权限,可以更改盘符目录
session_start();
$_SESSION['user'] = 'cheng';
```

```php
// 获取session

// session_save_path("D:/"); // 如果C盘没有权限,可以更改盘符目录
session_start();
print_r($_SESSION);
```

## $\_FILES

```html
<!--
    enctype属性值
        application/x-www-form-urlencoded(默认值),只能上传文本文件,不能上传其他文件
        multipart/form-data,将文件以二进制的形式上传,可以实现多种类型的文件上传
-->
<form method="post" enctype="multipart/form-data" action="test1.php">
    <!-- 必须要编写name属性 -->
    <input name="up_file" type="file" />
    <input type="submit" value="上传" />
</form>
```

```php
// 获取POST方法上传的文件的相关信息
print_r($_FILES);
    /*
        Array
        (
	        // 标签的name属性
            [up_file] => Array
                (
	                // 文件名
                    [name] => test.png
                    // 文件类型
                    [type] => image/png
                    // 临时存储的文件
                    [tmp_name] => C:\Windows\Temp\phpF338.tmp
                    // 上传成功为0,上传失败为其他数值
                    [error] => 0
					// 文件大小
                    [size] => 101016
                )
        )
    */
```

# 文件操作

- `is_dir()` 判断目录是否存在
- `is_file()` 判断文件是否存在
- `mkdir()` 创建目录
- `rmdir()` 删除目录
- `unlink()` 删除文件
- `fopen()` 打开文件
- `fwrite()` 写入文件
- `fclose()` 关闭打开的文件
- `is_writable()` 判断文件是否可写
- `is_readable()` 判断文件是否可读
- `file_get_contents()` 读取文件并输出

# 面向对象

## Info

```php
// 定义类
class Person {
    // 定义属性
    public $name;
    public $age;

    // 定义构造器
    public function __construct($name, $age) {
        // 通过$this访问类内定义的属性和方法
        $this->name = $name;
        $this->age = $age;
    }   

    // 定义析构函数,类销毁之前,会执行析构函数
    public function __destruct() {
        // 执行清理任务: 销毁变量,关闭文件,释放结果集...
    } 
    
    // 定义方法
    public function show() {
        echo $this->name . " " . $this->age; 
    }
}

// 调用构造器创建对象实例
$p = new Person("sun", 18);

// 访问对象的属性
echo $p->name;

// 访问对象的方法
$p->show();
```

## 封装

- public 修饰的成员, 在 类内,子类,类外 可访问
- protected 修饰的成员, 在 类内,子类 可访问, 在 类外 不可访问
- private 修饰的成员, 在 类内 可访问, 在 子类,类外 不可访问

## 继承

```php
class Animal {
    public $name;
    public $age;
    public function __construct($name, $age) {
        $this->name = $name;
        $this->age = $age;
    }
    public function show() {
        echo $this->name . " " . $this->age;
    }
}

// Cat类 继承 Animal类
class Cat extends Animal {

}

// 调用父类的构造器
$cat = new Cat("sun", 18);

// 访问父类的属性
echo $cat->name;

// 访问父类的方法
$cat->show(); // sun, 18
```

## 多态

> 类的多态

```php
class Animal {
    public function show() {
        echo "Animal show()";
    }
}

// Cat类 继承了 Animal类
class Cat extends Animal {
    public function show() {
        echo "Cat show()";
    }
}

class Test {
    // $animal的数据类型为Animal,指向了一个Cat类型的实例对象
    public static function testShow(Animal $animal) {
        $animal->show(); // "Cat show()"
    }
}

$cat = new Cat();
Test::testShow($cat);
$cat->show(); // "Cat show()"
```

> 接口的多态

```php
interface Animal {
    public function show();
}

// Cat类 实现了 Animal接口
class Cat implements Animal {
    public function show() {
        echo "Cat show()";
    }
}

class Test {
    // $animal的数据类型为Animal,指向了一个Cat类型的实例对象
    public static function testShow(Animal $animal) {
        $animal->show(); // "Cat show()"
    }
}

$cat = new Cat();
Test::testShow($cat);
$cat->show(); // "Cat show()"
```

## static

```php
class Person {
    // 定义静态变量
    public static $name;
    // 给静态变量赋值 (方法1)
    public static $age = 18;
    // 定义静态方法
    public static function show() {
        // 静态方法内只能访问静态成员
        echo Person::$name . " " . Person::$age;
    }
    // 普通方法里,无法通过 $this 访问静态成员, 因为静态成员在$this加载之前就生成了
    public function show1() {
		// echo Person::$name; // Error
    }
}

// 给静态变量赋值 (方法2)
Person::$name = "sun";
// 访问静态变量
echo Person::$name;
// 访问静态方法
Person::show();
```

## abstract

```php
// 定义抽象类
abstract class Animal {
    // 定义普通属性
    public $name;
    // 定义普通方法
    public function eat() {
        echo "Animal eat()";
    }

    // 定义抽象方法 (只能在抽象类内定义抽象方法)
    public abstract function show();
}

// Cat类继承Animal类后,必须重写Animal类的抽象方法
class Cat extends Animal {
    // 重写抽象方法
    public function show() {
        echo "hello world";
    }
}
```

## interface

```php
// 定义Animal接口
interface Animal {
    // 声明接口方法 (不需要具体实现,让其实现类实现即可)
    public function eat();
    // 定义接口常量 (不需要加"$"符号)
    const NAME = "sun";
}

// Cat类 实现了 Animal接口,必须实现Animal接口定义的所有方法
class Cat implements Animal {
    // 重写Animal接口声明的方法
    public function eat() {
        echo "Cat eat()";
    }
    // 将接口常量保存下来
    public $name = Animal::NAME;
    public function show() {
        echo $this->name;
    }
}

$cat = new Cat();

// 访问接口常量
echo Animal::NAME;
```

## const,define

```php
// 定义常量 (方法1)
define("S1", "hello world");
// 定义常量 (方法2)
const S2 = "hello world";
```

## final

```php
// final修饰的类,不能被继承
final class Animal {}
// 继承final类会报错
class Cat extends Animal {} // Error
```

## parent::

```php
/* 
    可以通过 parent:: 访问父类的方法
*/

class Animal {
    public $name;
    public $age;

    public function __construct($name, $age) {
        $this->name = $name;
        $this->age = $age;
    }

    public function test() {
        echo "hello world";
    }
}

class Cat extends Animal {
    public $sex;
    public function __construct($name, $age, $sex) {
        // 通过 parent:: 访问父类的构造器
        parent::__construct($name, $age);
        $this->sex = $sex;
    }

    public function show() {
        // 通过 parent:: 访问父类方法
        parent::test();
    }
}

$cat = new Cat("sun", 18, "male");
```
## self::

```php
class Cat {
    public static $name;
    public static $age;

    public static function test() {
        echo "Cat test()";
    }

    // 静态方法里,可以通过 Cat:: 访问静态成员
    // 普通方法里,无法通过 Cat:: 访问静态成员, 可以通过 self:: 访问静态成员
    public function show() {
        // 通过 self:: 访问本类的静态属性
        echo self::$name . " " . self::$age;

        // 通过 self:: 访问奔雷的静态方法
        self::test();
    }
}

$cat = new Cat();
$cat->show();
```

# 命名空间

## 创建命名空间

```php
// 命名空间是用于解决命名冲突的
// 创建命名空间有两种方式,但是两种方式不能混合使用

// 方法1,多文件时更推荐
namespace one;
$test = 10;
namespace two;
$test = 10;

// 方法2,单文件时更推荐
namespace one {
    $test = 10;
}
namespace two {
    $test = 10;
}
```

## 访问命名空间

```php
/*
    访问其他命名空间成员的权限
        - 可以访问 变量
        - 不可以访问 常量,方法,类
*/

namespace one {
    const NAME = "SUN";
    $name = "sun";
    function show()  {
        echo "one show()";
    }
    class Cat {}
}
namespace two {
    const NAME = "XUE";
    $name = "xue";
    function show()  {
        echo "two show()";
    }
    class Cat {}
}
namespace three {
    // echo $name; // xue
    // echo NAME; // 错
    // show(); // 错
    // new Cat(); // 错
}
```

## 子命名空间

```php
// 全局命名空间
namespace {
    function show() {
        echo "show()";
    }
    function test() {
        echo "hello world";
    }
}

// 一级命名空间
namespace one {
    function show() {
        echo "one show()";
    }
    // 子命名空间可以直接访问父命名空间
    test();
}

// 二级命名空间
namespace one\two {
    function show() {
        echo "one\\two show()";
    }
}

// 三级命名空间
namespace one\two\three {
    function show() {
        echo "one\\two\\three show()";
    }
}

namespace test {
    // 访问当前命名空间
    show(); 
    // 访问全局命名空间
    \show();
    // 访问一级命名空间
    \one\show();
    // 访问二级命名空间
    \one\two\show();
    // 访问三级命名空间
    \one\two\three\show();

    // 使用use重命名 (默认为最后一个)
    use \one\two\three;
    three\show();

    // 使用use重命名 (自定义)
    use \one\two\three as X;
    X\show();
}
```

## 多文件的引入

> one\one.php

```php
namespace one\one;
function show() {
    echo "one\\one show()";
}
```

> two\one.php

```php
namespace two\one;
function show() {
    echo "one\\two show()";
}
```

> index.php

```php
// 引入命名空间
require("./one/one.php");
require("./two/one.php");

// 通过 use 重命名
use one\one as X;
use two\one as Y;

X\show(); // one\one show()
Y\show(); // one\two show()
```

# php8新特性

## 构造器增强

> 接受参数时可以定义变量,不需要我们再去手动声明一个变量了

```php
// php8前定义构造器
class Person {
	public $name;
	public function __construct($name) {
		$this->name = $name;
	}
}
// php8后定义构造器
class Person {
	public function __construct(public $name) {
		$this->name = $name;
	}
}
```

> 接受参数时可以限定参数的数据类型,如果传递了其他数据类型的参数,就会报错

- 参数类型: bool/int/float/string/array/object/mixed
	- mixed 表示 任何数据类型
- 可以通过 "|" 限定多个数据类型

```php
class Person {
    public function __construct(
            public $name, 
            public int|string $age,
            public string|array|object $job,
            public mixed $msg
    ) {
        $this->name = $name;
        $this->age = $age;
    }
}

$cat = new Person(
    "sun", 
    18, 
    [
        "type" => "java enginer", 
        "sal" => "50k"
    ], 
    "hello world!!!"
);
```

# 问题处理

## 上传文件时出错

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719110.png)

- 修改Apache的httpd.conf文件,开启最大权限
	- 将 `LoadModule rewrite_module modules/mod_rewrite.so ` 的注释解开
	- 设置 `AllowOverride` 的属性值设为 `All`
- 修改php的php.ini文件,设置临时文件的存储路径
	- 设置 `upload_temp_dir ` 的属性值为 `C:\Windows\Temp`


# 项目功能实现

## 环境搭建

> 数据库表

- article表: 记录所有的文章信息
  ![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719111.png)
	- title: 文章的标题
	- img: 文章图片的路径
	- content: 文章的具体内容
	- date: 文章发布的日期
	- class_id: 文章的分类,对应class表的id
- class表: 记录文章的分类
  ![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719112.png)
	- sort 分类的排序,前端为99所以排第一位,服务器为98所以排第二位
- admin表: 记录了管理员账户
  ![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719113.png)
	- account: 账户
	- password: 密码 (这是"123456"进行md5加密后得到的数据)

## 获取数据,渲染结构

```php
// 通过PDO访问数据库,执行sql语句,查询数据
$stmt = $pdo->prepare('SELECT * FROM class order by sort desc');
$stmt->execute();
$class_list = $stmt->fetchAll();

// 循环渲染列表
foreach ($class_list as $class_item) {
	// 如果$class_item存在
	if (isset($class_item)) {
?>
		<li>
			<a href="/index.php?id=<?php echo $class_item["id"] ?>">
				<?php echo $class_item["name"] ?>
			</a>
		</li>
<?php
	}
}
```

## 跳转到详情页面

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719114.png)

- 点击标题后,跳转到details.php页面,传递id参数(当前文章对应的id)
- details.php页面,通过 `$_GET` 获取url参数,根据id查询article表,获取对应的文章

> index.php

```php
<?php
if (isset($article_item["title"])) {
?>
	<h1 class="entry-title">
		<!-- 使用url传参的方式,将当前文章对应的id传给details.php页面 -->
		<a 
			href="/details.php?id=<?php echo $article_item['id'] ?>" 
			title="<?php echo $article_item['title'] ?>" 
			rel="bookmark"
		>					
			<?php echo $article_item['title']; ?>
		</a>
	</h1>
<?php
}
?>
```

> goods-detail.php

```php
<div id="primary" class="site-content">
	<?php
	// 如果传递了id参数
	if (!empty($_GET["id"])) {
		// 通过$_GET获取到url中的参数,再根据这个id来查询数据表,获取到对应的数据
		$stmt = $pdo->prepare('SELECT * FROM article where id = "' . $_GET["id"] . '"');
		$stmt->execute();
		$article = $stmt->fetchAll();
		// PDO查询到的数据都是以数组的形式返回的,即使只有一条数据,也存放在数组中,所以我们需要获取数组的第一个元素
		$article = $article[0];
		}
	?>
	<div id="content" role="main">
		<h1> <?php echo $article["title"] ?></h1>
	</div>
</div>
```

## 分类导航功能

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719115.png)

- 点击导航栏按钮后,重新跳转到index.php页面(相当于刷新页面)
	- 如果点击的是首页按钮,就不传递class_id参数 (当前文章所属的分类id)
	- 如果点击的不是首页按钮,就传递class_id参数
- index.php页面,通过 `$_GET` 获取到url参数,判断是否有 `class_id` 参数
	- 如果没有,就查询整个article表,获取所有的文章
	- 如果有,就根据 `class_id` 查询article表,获取对应的文章

```php
<ul class="nav-menu">
	<!-- 处理首页分类导航,首页需要单独渲染结构(因为数据库的class表中没有存储首页的数据),点击后重新跳转到index.php页面,不传递class_id参数 -->
	<li>
		<a href="/index.php">首页</a>
	</li>

	<!-- 处理非首页分类导航 -->
	<?php
	// 查询class表时根据sort字段进行排序,这样页面中渲染的导航栏的导航按钮就是有序的了
	$stmt = $pdo->prepare('SELECT * FROM class order by sort desc');
	$stmt->execute();
	$class_list = $stmt->fetchAll();
	
	foreach ($class_list as $class_item) {
		if (isset($class_item)) {
	?>
			<li>
				<!-- 点击后重新跳转到index.php页面,同时传递当前点击的分类导航对应的id -->
				<a href="/index.php?class_id=<?php echo $class_item["id"] ?>">
					<?php echo $class_item["name"] ?>
				</a>
			</li>
	<?php
		}
	}
	?>
</ul>
```

```php
<?php
// 使用$_GET接受url中的参数class_id

if (empty($_GET['class_id'])) { // 如果没有传递id,即点击的是首页
	// 查询整个article表,获取所有的文章
	$stmt = $pdo->prepare('SELECT * FROM article');
} else { // 如果传递了id,即点击的不是首页
	// 根据class_id查询article表,获取对应的文章
	$stmt = $pdo->prepare('SELECT * FROM article where class_id = ' . $_GET['class_id']);
}

$stmt->execute();
$article_list = $stmt->fetchAll();
?>
<div id="content" role="main">
	<?php
	foreach ($article_list as $article_item) {
	?>
		<article>
			渲染结构...
		</article>
	<?php
	}
	?>
</div>
```

## 搜索功能

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719116.png)

- 点击搜索按钮后,重新跳转到index.php页面,传递s参数(搜索的关键字)
- index.php页面,通过 `$_GET` 获取到url参数,根据s

```php
<form role="search" id="searchform" action="" method="POST">
	<div>
		<label class="screen-reader-text" for="s">搜索：</label>
		<input placeholder="搜索" type="text" class="no-border" name="keywords" id="s" />
		<input type="submit" class="btn btn-default" id="searchsubmit" value="搜索" />
	</div>
</form>

<script type="text/javascript">
	$(function() {
		$("#searchsubmit").click(function() {
			if ($("#s").val() != '') { // 如果搜索框中有内容
				// 跳转到index.php页面,传递s参数(搜索框里的内容)
				location.href = "/index.php?s=" + $("#s").val();
			} else { // 如果搜索框中没有内容
				// 跳转到index.php页面,不传递参数
				location.href = "/index.php";
			}
			return false;
		});
	});
</script>
```

```php
<div id="primary" class="site-content">
	<?php
	// 如果传递了s参数()
	if (!empty($_GET['s'])) {
		// 根据关键字内容进行模糊查询
		$stmt = $pdo->prepare('SELECT * FROM article where title like "%' . $_GET['s'] . '%"');
	}
	$stmt->execute();
	$article_list = $stmt->fetchAll();
	?>
	<div id="content" role="main">
		<?php
		foreach ($article_list as $article_item) {
		?>
			<article>
				渲染结构...
			</article>
		<?php
		?>
	</div>
</div> 
```

## 登录功能

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719117.png)

- login.php页面,填写表单信息(注意: 需要采用POST提交方式,防止密码泄露在url中)
- 点击登录按钮后,还是跳转到login.php页面(相当于刷新页面),判断账号和密码是否正确
	- 如果正确,就响应成功信息,存储id和account到cookie中,并跳转到article.php页面
	- 如果不正确,就停止操作,重新回调login.php页面,重新填写login.php页面
- article.php页面,通过 `$_COOKIE` 获取到cookie,判断是否有id属性
	- 如果有,就展示article.php页面
	- 如果没有,就跳转回login.php页面

> login.php

```php
<?php
// 与数据库建立连接
$pdo = new PDO('mysql:host=localhost;dbname=db01', 'root', '111');

// 通过$_POST获取表单提交的数据
if (!empty($_POST)) {
	// 如果账号为空,响应错误信息
	if (empty($_POST["account"])) {
		echo '<script>window.alert("请输入账号");history.back();</script>';
		return false;
	}
	// 如果密码为空,响应错误信息
	if (empty($_POST["password"])) {
		echo '<script>window.alert("请输入密码");history.back();</script>';
		return false;
	}

	// 根据用户名去数据库中查找该账户的信息
	$stmt = $pdo->prepare('select * from admin where account = "' . $_POST["account"] . '"');
	$stmt->execute();
	$user = $stmt->fetchAll()[0];
	
	// 如果账号错误,响应错误信息
	if (empty($user)) {
		echo '<script>window.alert("账号不存在");history.back();</script>';
		return false;
	}
	// 如果密码错误,响应错误信息
	if ($user['password'] != md5($_POST["password"])) {
		echo '<script>window.alert("密码错误");history.back();</script>';
		return false;
	}
	// 登录成功,响应成功信息,同时跳转到 article.php 页面
	echo '<script>window.alert("登录成功");window.location.href="article.php";</script>';
	
	// 将id和account都存储到cookie中
	setcookie('id', $user['id']);
	setcookie('account', $user['account']);

	return true;
}
?>

<div class="layui-form layui-form-pane">
	<!-- 发送post的提交方式,没有设置action,默认跳转到login.php页面(相当于刷新页面) -->
	<form method="post" action="">
		<div class="layui-form-item">
			<label for="L_loginName" class="layui-form-label">账号</label>
			<div class="layui-input-inline">
				<input type="text" id="L_loginName" name="account" required="" lay-verify="required" autocomplete="off" class="layui-input">
			</div>
			<div class="layui-form-mid layui-word-aux">请输入账号</div>
		</div>
		<div class="layui-form-item">
			<label for="L_pass" class="layui-form-label">密码</label>
			<div class="layui-input-inline">
				<input type="password" id="L_pass" name="password" required="" lay-verify="required" autocomplete="off" class="layui-input">
			</div>
			<div class="layui-form-mid layui-word-aux">请输入密码</div>
		</div>
		<div class="layui-form-item">
			<button class="layui-btn" lay-filter="*" lay-submit="">立即登录</button>
		</div>
	</form>
</div>
```

> article.php

```php
<?php
// 通过$_COOKIE获取cookie

// 如果cookie中没有id
if (empty($_COOKIE['id'])) {
	// 跳转回login.php页面
	echo '<script>window.location.href="login.php";</script>';
	return false;
}
?>

<!DOCTYPE html>
<html>
	...
</html>
```

## 分页功能

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719118.png)

- 分页功能就是对article数据表进行分页查询(limit关键字)
- 分页查询的公式: 每页显示的记录数 * (当前分页 - 1), 每页显示的记录数
	- 当前分页: currentPage
	- 每页显示的记录数: pageSize
- article.php页面,判断 `$_POST` 中是否有p参数(当前分页的索引)
	- 如果没有,就设置currentPage为1
	- 如果有,就设置currentPage为p

```php
<?php
// 通过$_GET获取url中的p参数
if (empty($_GET['p'])) { // 如果没有p,即刚进入article.php页面,没有点击过其他分页
	// 设置当前分页为1
	$currentPage = 1;
} else { // 如果有p
	// 设置当前分页为p
	$currentPage = $_GET['p'];
}

// 查询article表中记录的总条数,同时 将 COUNT(*) 重命名为 count
$stmt = $pdo->prepare('SELECT COUNT(*) AS count FROM ARTICLE');
$stmt->execute();
$count = $stmt->fetchAll();
// PDO查询到的数据都是以数组的形式返回的,即使只有一条数据,也存放在数组中,所以我们需要获取数组的第一个元素
$count = $count[0]['count'];

// 每页显示的记录数
$pageSize = 2;

// 显示多少页: 记录总数 / 每页显示的记录数,再向上取整(多出来的余数也要单独放一页)
$pageCount = ceil($count / $pageSize);

// 对article表,进行分页查询 公式: 每页显示记录数 * (当前分页 - 1), 每页显示的记录数
$stmt = $pdo->prepare('SELECT * FROM ARTICLE LIMIT ' . $pageSize * ($currentPage - 1) . ', ' . $pageSize);
$stmt->execute();
$article_list = $stmt->fetchAll();
?>

<?php 
for ($i = 1; $i <= $pageCount; $i++) {
?>
	<div class="layui-box layui-laypage layui-laypage-default">
		<?php 
			if ($currentPage == $i) { // 如果渲染的是当前分页
		 ?>
				<span class="layui-laypage-curr">
					<em class="layui-laypage-em"></em> <em><?php echo $currentPage ?></em>
				</span>
		<?php 
			} else { // 如果渲染的不是当前分页
		 ?>
				<!-- 点击分页链接后,重新跳转到article.php页面(相当于刷新页面),同时传递参数p(点击的分页链接的索引) -->
				<a href="article.php?p=<?php echo $i ?>"><?php echo $i ?></a>
		<?php 
			}
		 ?>
	</div>
<?php 
}
?>
```

## 添加文章

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719119.png)

- article_add.php页面,提交表单数据到article_add.php页面(相当于刷新页面)
- 通过 `$_POST` 获取到表单的数据,将数据添加到article表中
	- 如果添加成功,提示成功信息,并跳转到article.php页面
	- 如果添加失败,提示失败信息

```php
$pdo = new PDO('mysql:host=localhost;dbname=db01', 'root', '111');

// 如果$_POST中没有title,content,class_id,就响应失败信息
if (empty($_POST['title'])) {
	echo json_encode(['code' => 1, 'msg' => '请输入标题']); // 将 数组格式的数据 转成 json格式的数据 响应给页面
	exit;
}
if (empty($_POST['content'])) {
	echo json_encode(['code' => 1, 'msg' => '请输入内容']); // 将 数组格式的数据 转成 json格式的数据 响应给页面
	exit;
}
if (empty($_POST['class_id'])) {
	echo json_encode(['code' => 1, 'msg' => '请输入分类']); // 将 数组格式的数据 转成 json格式的数据 响应给页面
	exit;
}

// 获取$_POST中的 title, content, class_id, img
$title = $_POST['title'];
$content = $_POST['content'];
$class_id = $_POST['class_id'];
$img = $_POST["img"];
// 调用date()获取 年-月-日
$date = date("Y-m-d");

// 添加语句会有添加失败的情况,需要捕获异常
try {
	// 添加数据到article表中
	$stmt = $pdo->prepare("INSERT INTO article (`title`, `img`, `content`, `date`, `class_id`) VALUES ('{$title}', '{$img}', '{$content}', '{$date}', '{$class_id}');");
	$stmt->execute();
	// 添加成功,响应成功信息
	echo json_encode(['code' => 0, 'msg' => '添加成功']); // 将 数组格式的数据 转成 json格式的数据 响应给页面
} catch (Exception $e) { // 捕获到了异常
	// 添加失败,响应失败信息
	echo json_encode(['code' => 1, 'msg' => '添加失败']); // 将 数组格式的数据 转成 json格式的数据 响应给页面
}
return false;
```

```php
<form class="layui-form">
	<div class="layui-form-item">
		<label class="layui-form-label">文章标题</label>
		<div class="layui-input-block">
			<input type="text" class="layui-input" name="title" placeholder="请输入文章标题">
		</div>
	</div>
	<div class="layui-form-item">
		<label class="layui-form-label">图片</label>
		<div class="layui-input-block layui-upload">
			<button type="button" class="layui-btn" id="test1">上传图片</button>
			<div class="layui-upload-list">
				<img class="layui-upload-img" id="demo1" style="width:100px;">
				<input type="hidden" class="layui-input" id="img" name="img">
			</div>
		</div>
	</div>
	<div class="layui-form-item">
		<label class="layui-form-label">内容</label>
		<div class="layui-input-block">
			<textarea class="layui-textarea" name="content" placeholder="请输入内容"></textarea>
		</div>
	</div>
	<div class="layui-form-item">
		<label class="layui-form-label">分类</label>
		<div class="layui-input-block">
			<select name="class_id">
				<?php
				foreach ($class_list as $class_item) {
				?>
					<option value="<?php echo $class_item['id'] ?>">
						<?php echo $class_item["name"] ?>
					</option>
				<?php
				}
				?>
			</select>
		</div>
	</div>
</form>
<div class="layui-input-block">
	<!-- 绑定click事件,以及save()回调函数 -->
	<button type="button" class="layui-btn" onclick="save()">保存</button>
</div>
```

```js
function save() {
	// 发送post请求给article_add.php页面(相当于刷新页面),将表单的数据进行序列化处理作为参数传递过去
	$.post('/admin/article_add.php', $('form').serialize(), function(res) {
		// 回调函数
		
		// 接受响应的数据
		if (res.code > 0) { // 添加失败
			// 调用layer.msg()发送添加失败的提示
			layer.msg(res.msg, {
				'icon': 2
			});
		} else { // 添加成功
			// 调用layer.msg()发送添加成功的提示
			layer.msg(res.msg, {
				'icon': 1
			});
			// 跳转到article.php页面
			window.location.href = '/admin/article.php';
		}
	}, 'json'); // 设置响应体数据的类型为json格式的,这样res收到的json数据就会自动转成对象格式的数据
}
```

## 上传图片功能

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719120.png)

- article_add.php页面,上传图片,并请求upload_php接口
- upload_php接口,通过 `$_FIELS` 获取到上传的图片的信息,并将上传图片的临时文件拷贝到 项目目录/admin/upload 目录下
	- 如果拷贝成功,响应成功信息,同时返回拷贝后的图片资源的路径
	- 如果拷贝失败,响应失败信息
- article_add.php页面,在请求完upload_php接口的回调函数中,接收到数据(拷贝后的图片资源的路径),可以用于完善表单img数据的提交

> article_add.php

```php
<div class="layui-form-item">
	<label class="layui-form-label">图片</label>
	<div class="layui-input-block layui-upload">
		<button type="button" class="layui-btn" id="test1">上传图片</button>
		<div class="layui-upload-list">
			<img class="layui-upload-img" id="demo1" style="width:100px;">
			<!-- 放一个隐藏的输入框,用于传递表单中img数据,又不影响页面结构 -->
			<input type="hidden" class="layui-input" id="img" name="img">
		</div>
	</div>
</div>
```

```js
// 使用第三方的包的方法,简化开发
layui.use(['layer', 'form', 'upload'], function() {
	form = layui.form;
	layer = layui.layer;
	upload = layui.upload;
	$ = layui.jquery;

	var uploadInst = upload.render({
		elem: '#test1',
		// 设置请求的接口路径
		url: 'upload.php',
		before: function(obj) {
			obj.preview(function(index, file, result) {
				$('#demo1').attr('src', result);
			});
		},
		done: function(res) {
			if (res.code > 0) {
				layer.msg('上传失败', {
					'icon': 2
				});
			} else {
				// 修改隐藏的输入框的value值为upload.php所响应的图片路径
				$('#img').val(res.data);
				layer.msg('上传成功', {
					'icon': 1
				});
			}
		}
	});
});
```

> upload_php

```php
/*
	通过$FILES获取上传的图片的信息
		Array
		(
		    [file] => Array
		        (
		            [name] => test.png
		            [type] => image/png
		            [tmp_name] => C:\Windows\Temp\php4C1F.tmp
		            [error] => 0
		            [size] => 101016
		        )
		)
*/

// 判断是否上传成功
if ($_FILES["file"]["error"] > 0) { // 如果上传出错了
    // 响应失败信息
    echo json_encode(["code" => 1]); // 将 数组格式的数据 转成 json格式的数据 响应给页面
} else { // 如果上传没有出错
    // 如果不存在"upload/"目录
    if (!is_dir("upload/")) {
        /*
            mkdir("upload/", 0777, true)
                - "upload/": 创建upload目录
                - 0777: 文件夹的操作权限为0777(最高),可读可写可执行
                - true: 允许创建多级目录,比如: "upload/one/two"
            iconv("UTF-8", "GBK", "upload/")
                将"upload/"字符串的编码格式从"UTF-8"转成"GBK"
        */
        $res = mkdir(iconv("UTF-8", "GBK", "upload/"), 0777, true);
    }
    /*
        如果重复上传同一张图片会失效,我们可以对图片进行时间戳重命名,避免这个问题
            - time() 时间戳
            - explode(".", $_FILES["file"]["name"])[1] 原文件的后缀名
                比如: 将 "test.png" 根据 "." 进行分割,得到一个数组["test", "png"],再获取第二个元素"png",即文件后缀名
    */
    $filename = time() . "." . explode(".", $_FILES["file"]["name"])[1];

    // 将临时文件移动到upload目录下,并且修改文件名为$filename
    move_uploaded_file($_FILES["file"]["tmp_name"], "upload/" . $filename);
    // 响应成功信息,同时返回拷贝后的图片资源的路径
    echo json_encode(["code" => 0, "data" => "admin/upload/$filename"]); // 将 数组格式的数据 转成 json格式的数据 响应给页面
}
```





















