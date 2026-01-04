# 搭建环境

## 安装 laravel

```bash
# 查看composer的安装版本
composer -v

# 切换下载镜像
composer config -g repo.packagist composer https://mirrors.aliyun.com/composer

# 安装laravel
composer global require laravel/installer
```

- composer 是用来管理 php 项目依赖关系的工具(相当于 npm),我们可以使用 composer 来安装 laravel
- composer 的安装地址 https://getcomposer.org/download
- composer 安装成功
    ![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719261.png)
- laravel 安装成功
    ![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719262.png)

## laravel 指令

```bash
# 查看laravel的版本
php artisan --version

# 创建laravel项目
laravel new 项目名

# 创建指定版本的laravel项目
composer create-project --prefer-dist laravel/laravel 项目名 8.x

# 运行laravel项目
php artisan serve
```

## 项目结构

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719263.png)

- 重要目录
    - App 核心目录,默认将模型文件存在这个目录 (MVC 的 Model)
    - App/Http/Controllers 存放 控制器文件 (MVC 的 Controller)
    - resources/views 存放 视图文件 (MVC 的 View)
    - Routes 存放 路由文件
    - public 存放 项目路口文件和系统的静态资源
    - config 存放 项目的所有配置文件
    - vender: 存放 所有通过 composer 加载的第三方类库文件
- 重要文件
    - index.php 应用的入口文件
    - web.php 主路由文件
    - .env 设置一些系统相关的环境配置文件信息 (比如: 数据库访问)
    - artisan 脚手架文件
    - composer.json 依赖包配置文件

# 路由

## 路由的创建

- 路由: 提供访问程序的 HTTP 请求的地址(url 地址)
- 查看 可用的路由 和 路由的命名 `php artisan route:list`

```php
// web.php

// laravel框架初始化得到根目录的路由
Route::get('/', function () {
    return view('welcome');
});

// 接受get请求方式
Route::get("/index", function () {
    return "hello world";
});

// 接受post请求方式 (用于接受表单)
Route::post("/index", function (){
    return "hello world";
});

// 接受任意请求方式
Route::any("/index", function () {
    return "hello world";
});

// 接受get和post请求方式
Route::match(["get", "post"], "index", function () {
    return "hello world";
});
```

## 路由的别名

```php
// 给"/task1"路由起一个别名为"taskRouter1",后续可以通过这个别名访问到该路由
Route::get("/task1", function () {
	return "hello world";
})->name("taskRoute1");
```

## 路由的参数

```php
// 方法1
Route::get("/index/{name}/{age}/{sex}", function ($name, $age, $sex) {
    return $name . " " . $age . " " . $sex; // sun 18 male
});
```

## 路由的参数约束

> 局部约束

```php
// 通过 where("参数名", "正则表达式") 约束单个路由参数的格式
Route::get("/task/show/{name}", [TaskController::class, "show"])
    ->where("name", "[a-z]+"); // 传递的name参数必须是"a-z"
// 通过 where(["参数名1" => "正则表达式1", "参数名2" => "正则表达式2"]) 约束多个路由参数的格式
Route::get("/task/show/{name}/{age}", [TaskController::class, "show"])
    ->where([
        "name" => "[a-z]+", // 传递的name参数必须是"a-z"
        "age" => "[0-9]+" // 传递的age参数必须是"0-9"
    ]);
```

> 开启全局约束
	
```php
// App\Providers\RouteServiceProvider

// 配置全局约束,约束所有路由中的name参数和age参数
public function boot() {
	Route::pattern("name", "[a-z]+");
	Route::pattern("age", "[0-9]+");
}
```

```php
// 这里的 name参数 和 age参数 都有全局约束
Route::get("/task/show/{name}/{age}", [TaskController::class, "show"]);

// 局部路由解除约束: 如果这里的路由不想受到全局约束,可以局部解除
Route::get("/task/show/{name}/{age}", [TaskController::class, "show"])
    ->where("name", "*");
Route::get("/task/show/{name}/{age}", [TaskController::class, "show"])
    ->where([
        "name" => ".*", // "."是匹配任何字符,"*"是任意个数,故可以匹配任意字符串
        "age" => ".*"
    ]);
```

## 路由的信息

```php
use App\Http\Controllers\TaskController;

Route::get("/task", [TaskController::class, "task"])->name("taskRoute");
```

```php
// 注: 引入的Route的命名空间需要注意
use Illuminate\Support\Facades\Route;

class TaskController extends Controller {
    public function task() {
        // 获取当前路由的详细信息(可以通过dump() 或 dd() 打印出来)
        $info1 = Route::current();
        // 获取当前路由的别名
        $info2 = Route::currentRouteName(); // taskRoute
        // 获取当前路由指向的方法
        $info3 = Route::currentRouteAction(); // App\Http\Controllers\TaskController@task
        return $info3;
    }
}
```

## 路由的子域名

```php
// 配置了子域名后,只可以通过"127.0.0.1"访问,不可以通过"localhost"访问
Route::domain("127.0.0.1")->get("/task", function () {
    return "/task";
});
```

## 路由的命名空间

```php
// 貌似行不通 ???
Route::namespace("Admin")->get("/manage", [ManageController::class, "manage"]);
```

## 路由的别名前缀

```php
// "/index"路由的别名为"index",我们通过Route::name()给其添加了一个前缀"task.",所以此时别名为"task.index"
Route::name("task.")->get("/index", function () {
    return "hello world";
})->name("index");

Route::get("/test", function () {
    // 通过"task.index"找到了"/index"路由
    return route("task.index");
});
```

## 路由的分组

```php
// 一个空的分组路由
Route::group([], function () {
    Route::get("/task1/{id}", function ($id) {
        return "task1" . " " . $id;
    });
    Route::get("/task2/{id}", function ($id) {
        return "task2" . " " . $id;
    });
});

// 添加路由前缀(方法1 分组添加)
Route::prefix("/one/two/three")->group(function () {
    // 通过"/one/two/three/task1"访问到该路由
    Route::get("/task1", function () {
        return "hello world";
    });
    // 通过"/one/two/three/task2"访问到该路由
    Route::get("/task2", function () {
        return "hello world";
    });
});
// 添加路由前缀(方法2 分组添加)
Route::group(["prefix" => "/one/two/three"], function () {
    // 通过"/one/two/three/task1"访问到该路由
    Route::get("/task1", function () {
        return "hello world";
    });
    // 通过"/one/two/three/task2"访问到该路由
    Route::get("/task2", function () {
        return "hello world";
    });
});

// 添加中间件(方法1)
Route::group(['middleware'=>'中间名'], function () {});
// 添加中间件(方法2)
Route::middleware(['中间件'])->group(function () {});

// 添加子域名(方法1)
Route::group(['domain'=>'127.0.0.1'], function () {});
// 添加子域名(方法2)
Route::domain('127.0.0.1')->group(function () {});

// 添加命名空间(方法1)
Route::group(['namespace'=>'Admin'],function () {});
// 添加命名空间(方法2)
Route::namespace('Admin')->group(function () {});

// 添加别名前缀(方法1) (注: 这里是"as"不是"name")
Route::group(['as'=>'task.'], function () {});
// 添加别名前缀(方法2)
Route::name('task.')->group( function ()
```

## 路由的回退

```php
// 如果访问了不存在的路由,就会进入fallback(),我们可以让其跳转到别的页面
// 注: 由于执行顺序问题,必须将回退路由放在所有路由的最底部
Route::fallback(function () {
    // 可以重定向到"/"路由
    // return redirect("/");

    // 可以跳转到我们自己编写的"404"页面
    // return view("404");
});
```

## 路由的响应

```php
Route::get("/index", function () {
	// 响应字符串
	return "hi"; // 方法1,简写形式
	return response("hi"); // 方法2,完整形式

	// 响应数组,laravel会自动将数组转成json格式的数据响应给浏览器
	return [1, 2, 3]; // 方法1
	return response([1, 2, 3]); // 方法2
    return response()->json([1, 2, 3]); // 方法3

	// 响应页面
	return response()->view("task"); // 方法1
	return response(view("task")); // 方法2

	// 设置响应状态码
	return response("hi", 201);
	// 设置响应头
	return response("<b>hi</b>")->header("Content-type", "text/html");
});
```

## 路由的重定向

> 路由式重定向

```php
/*
    服务器响应给浏览器的状态码: 302 和 301
        301: 暂时重定向
        301: 永久重定向,浏览器会对重定向的路由进行缓存,即使我们把这里的重定向给注释掉,浏览器也可以根据缓存自动进行重定向
    重定向默认发送的get请求
*/

// 如果访问"/index"路由,会重定向到"/task"路由,默认响应302状态码
Route::redirect("/index", "/task");
// 设置响应301状态码
Route::redirect("/index", "/task", 301);

// 默认响应301状态码
Route::permanentRedirect("/index", "/task");
```

> 函数式重定向

```php
Route::get("/one/two/three", function () {
	return "hello world";
})->name("three"); // 给"/one/two/three"路由起别名为"three"

Route::get("/", function () {
	// 重定向到指定路由
    return redirect()->to("/one/two/three"); // 方法1
	return redirect("/one/two/three"); // 方法2
	return \Illuminate\Support\Facades\Redirect::to("/"); // 方法3,Redirect对象(助手函数redirect()对应的facade模式对象)
    return redirect()->route("three"); // 方法4,根据路由的别名进行重定向

	// 重定向到上一个路由
	return redirect()->back(); // 方法1
	return back(); // 方法2

	// 重定向到外部链接,不携带任何编码
	return redirect()->away("https://www.baidu.com");

    // 注: 函数式重定向要求redirect()在return后面
});
```

# URL 操作

## 获取 query 参数

```php
use Illuminate\Http\Request;

// 请求路径: http://127.0.0.1:8000/index?name="sun"&age=18&sex="male"
Route::get("/index", function (Request $request) {
    // 获取全部参数
    $result = $request->all(); // {"name":"sun","age":"18","sex":"male"}

    // 获取全部参数
    $result = $request->input();

    // 获取指定参数
    $result = $request->input("name");

    // 获取指定参数,如果没有就赋默认值
    $result = $request->input("name", "default_name");

    // 将接收到的age参数转成boolean类型的 (1为true,非1为false)
    $result = $request->boolean("age");

    // 只接受name和age参数
    $result = $request->only(["name", "age"]); // {"name":"sun","age":"18"}

    // 不接受name参数
    $result = $request->except("name"); // {"age":"18","sex":"male"}

    // 判断name参数是否存在
    $result = $request->has("name"); // true

    // 判断name和flag参数是否存在
    $result = $request->has(["name", "flag"]); // false

    // 判断name或flag参数是否存在
    $result = $request->hasAny(["name", "flag"]); // true

    // 判断name参数存在且不为空
    $result = $request->filled("name"); // true

    // 判断name参数不存在 (name参数存在但为空,还是true)
    $result = $request->missing("name"); // false
```

## 获取 params 参数

```php
use Illuminate\Http\Request;

// 请求路径: http://127.0.0.1:8000/index/sun/18/male

// 方法1
Route::get("/index/{name}/{age}/{sex}", function ($name, $age, $sex) {
    return $name . " " . $age . " " . $sex; // sun 18 male
});

// 方法2
Route::get("/index/{name}/{age}/{sex}", function (Request $request, $name, $age, $sex) {
    return $name . " " . $age . " " . $sex; // sun 18 male
});
```

## 直接获取 url

```php
use Illuminate\Http\Request;

// 请求路径: http://127.0.0.1:8000/index/test?age=18&name=sun&sex=male
Route::get("/index/test", function (Request $request) {
    // 获取 url
    $result = $request->fullUrl(); // http://127.0.0.1:8000/index/test?age=18&name=sun&sex=male

    // 获取 url - 参数
    $result = $request->url(); // http://127.0.0.1:8000/index/test

    // 获取 uri
    $result = $request->path(); // index/test

    // 获取 ip
    $result = $request->ip(); // 127.0.0.1

    // 获取 自定义url
    $page = "/page?id=10";
    $result = url("/index/api" . $page); // http://127.0.0.1:8000/index/api/page?id=10

    // 获取 上一个url
    $result = url()->previous();

    // 判断 uri 是否 为 "index/*"
    $result = $request->is("index/*"); // true

    // 判断 请求方式 是否为 get
    $result = $request->isMethod("get"); // true

    /*
        signedRoute(参数1, 参数2) 生成 签名url
            参数1: 目标路由的别名(要求该路由已定义)
            参数2: 给路由传递的参数
        生成的签名url其实就是一个带有signature参数的url
            http://127.0.0.1:8000/test/sun?signature=e9ded285acd97199f9fb0e74d1a9...
    */
    $result = url()->signedRoute("testRoute", ["name" => "sun"]);
    return redirect()->to($result);

    // 注: url() 和 URL 都可以调用方法 (比如: URL::full(), URL::current(), URL::signedRoute()...)
});

// 给test路由起别名为"testRoute"
Route::get("/test/{name}", function (Request $request) {
    // 判断请求中的signature是否正确,
    if ($request->hasValidSignature()) {
        return "正确";
    } else {
        return "错误";
    }
})->name("testRoute");
```

## 根据路由别名获取 url

```php
// 给路由起别名,同时采用query形式的参数
Route::get("/task1", function () {
	// 获取到 "taskRoute1"路由 的 url
	$url1 = route("taskRoute1"); // http://127.0.0.1:8000/task1
	// 获取到 "taskRoute1"路由 的 url, 再追加一个id参数
	$url2 = route("taskRoute1", ["id" => 10]); // http://127.0.0.1:8000/task1?id=10
    // 自动将$user的主键传递过去
    $user = User::where("id", 10)->get();
    $url5 = route("taskRoute1", $user); // http://127.0.0.1:8000/task1?id=10
	// 获取到 "taskRoute1"路由 的 uri,再追加一个参数参数
	$url3 = route("taskRoute1", [], false); // /task1
	$url4 = route("taskRoute1", ["id" => 10], false); // /task1?id=10
})->name("taskRoute1");

// 给路由起别名,同时采用params形式的参数
Route::get("/task2/{id}", function () {
	$url1 = route("taskRoute2", ["id" => 10]); // http://127.0.0.1:8000/task2/10
    // 自动将路由所需要的参数传递过去 (这里"/task2/{id}"路由需要"id"参数,他就会传递$user["id"]过去)
    $user = User::where("id", 10)->get();
    $url2 = route("taskRoute2", $user); // http://127.0.0.1:8000/task2/10
})->name("taskRoute2");
```

# Eloquent 集合

## get()

```php
$collection = collect([
    "name" => "sun",
    "age" => 18,
    "job" => [
        "type" => "java engineer",
        "sal" => "50K"
    ]
]);

// 根据key找value
$results = $collection->get("name"); // sun
```

## has()

```php
$collection = collect([
    "name" => "sun",
    "age" => 18,
    "job" => [
        "type" => "java engineer",
        "sal" => "50K"
    ]
]);

// 判断某元素是否存在
$results = $collection->has("age"); // true
$results = $collection->has("sex"); // false
```

## pop()

```php
$collection = collect([
    "name" => "sun",
    "age" => 18,
    "job" => [
        "type" => "java engineer",
        "sal" => "50K"
    ]
]);

// 删除集合的最后一个元素,并返回删除元素
$results = $collection->pop(); // Array ( [type] => java engineer [sal] => 50K )
```

## avg()

```php
// avg() 返回集合元素的平均值
$results = $collection->avg(); // 2.8

$collection = collect([
    ["test1" => 3],
    ["test2" => 1],
    ["test1" => 4],
    ["test2" => 1],
    ["test1" => 5],
    ["test2" => 9],
    ["test1" => 2],
    ["test2" => 6],
]);

// avg() 返回"test1"组的平均值
$results = $collection->avg("test1"); // 3.5
```

## slice()

```php
$collection = collect([3, 1, 4, 1, 5]);

// slice() 返回从index=2开始向后的所有元素
$results = $collection->slice(2); // {"2":4,"3":1,"4":5}

// slice() 返回从index=2开始向后的1个元素
$results = $collection->slice(2, 1); // {"2":4}
```

## sort()

```php
$collection = collect([3, 1, 4, 1, 5]);

// sort()->values() 按升序进行排序
$results = $collection->sort()->values(); // [1,1,3,4,5]

// sortDesc()->values() 按降序进行排序
$results = $collection->sortDesc()->values(); // [5,4,3,1,1]
```

## diff()

```php
$collection = collect([3, 1, 4, 1, 5]);

// diff() 返回与[1, 4, 9]不同的元素
$results = $collection->diff([1, 4, 9]); // {"0":3,"4":5}
```

## duplicates()

```php
$collection = collect([3, 1, 4, 1, 5]);

// duplicates() 返回重复的元素
$results = $collection->duplicates(); // {"3":1}
```

## search()

```php
$collection = collect(["sun", "xue", "cheng"])

// search() 搜素"cheng"的索引
$results = $collection->search("cheng"); // 2
```

## all()

```php
$collection = collect(["sun", "xue", "cheng"]);

// all() 返回该集合的数组形式
$results = $collection->all(); // ["sun","xue","cheng"]
print_r($results); // Array ( [0] => sun [1] => xue [2] => cheng )
```

## countBy()

```php
$collection = collect(["sun", "xue", "cheng", "sun", "xue", "sun"]);

// countBy() 返回每个元素出现的次数
$results = $collection->countBy(); // {"sun":3,"xue":2,"cheng":1}

$collection = collect(['sun@163.com', 'xue@163.com', 'cheng@qq.com']);

// countBy() 返回每个元素出现的次数 (定制版)
$results = $collection->countBy(function ($value) {
    /*
        $value就指向$collection

        strrchr("sun@163.com", '@') 是 "@163.com", 即统计"@163.com"的数量
        strrchr("cheng@qq.com", '@') 是 "@qq.com", 即统计"@qq.com"的数量
        */
    return strrchr($value, '@');
}); // {"@163.com":2,"@qq.com":1}
```

## first()

```php
$collection = collect([3, 1, 4, 1, 5]);

// first() 返回判断成立的第一个元素的值
$results = $collection->first(function ($value) {
    // < 2 就判断成立
    return $value < 2;
}); // 1
```

## chunk()

```php
$collection = collect(["sun", "xue", "cheng", "jack", "jerry", "tom"]);
// chunk() 每2个分为一组,第一组数据是数组格式,后续的每组都是对象格式 (这里数据不够我就凑了一点)
$results = $collection->chunk(2); // [["sun","xue"],{"2":"cheng","3":"jack"},{"4":"jerry","5":"tom"}]
```

## flatten()

```php
// 将多维数组转换成一维数组
$results = $collection->flatten(); // ["sun",18,"java engineer","50K"]

$collection = collect([3, 1, 4, 1, 5]);
```

## where()

```php
$collection = collect([
    ["name" => "sun", "age" => 18],
    ["name" => "xue", "age" => 20],
    ["name" => "cheng", "age" => 22]
]);
// where() 用法就和数据库的用法一摸一样了 (对$collection数据格式有要求)
$results = $collection->where("name", "sun"); // [{"name":"sun","age":18}]
```

## map(), each(), filter()

```php
$collection = collect(["sun", "xue", "cheng"]);

// map() 遍历集合
$results = $collection->map(function ($value, $key) {
    return $key . " -> " . $value;
});
echo $results; // ["0 -> sun","1 -> xue","2 -> cheng"]

// each() 遍历集合
$results = $collection->each(function ($value, $key) {
    return $key . " -> " . $value;
});
echo $results; // ["sun","xue","cheng"]

// filter() 筛选集合
$results = $collection->filter(function ($value, $key) {
    return $value != "sun";
});
echo $results; // {"1":"xue","2":"cheng"}
```

## 自定义方法

```php
// 给Collection类添加自定义方法
Collection::macro("toUpper", function () {
    // $this就指向了$collection,故可以访问各种方法
    return $this->map(function ($value) {
        // 遍历$this集合,将每个元素都设置为大写
        return strtoupper($value);
    });
});
// 调用自定义方法
$results = $collection->toUpper(); // ["SUN","XUE","CHENG"]
```

# 控制器

## 基本使用

- 控制器就是存放在 App/Http/Controllers 目录下的 一个类,我们可以在类中定义方法
- 原先使用一个闭包的函数来处理所有的请求,会导致一个 web.php 文件太过于臃肿,不够简洁
    ```php
    Route::get("/task", function () { ... })
    ```
- 现在让路由指向一个控制器里的方法,使 web.php 文件变得非常简洁,优雅
    ```php
    Route::get("/task", "App\Http\Controllers\TaskController@show");
    ```
- 创建控制器: `php artisan make:controller 控制器名`

```php
// web.php

// 配置控制器 (方法1): "控制器@方法名" (请求路径为"/task/show",同时传递了param参数(name,age)给show())
Route::get("/task/show/{name}/{age}", "App\Http\Controllers\TaskController@show");

// 配置控制器 (方法2): [控制器::class, 方法名]
Route::get("/task/show/{name}/{id}", [\App\Http\Controllers\TaskController::class, "show"]);

// 引入命名空间,简化控制器的书写
use App\Http\Controllers\TaskController;
Route::get("/task/show/{name}/{age}", "TaskController@show");
Route::get("/task/show/{name}/{id}", [TaskController::class, "show"]);
```

```php
// App/Http/Controllers/TaskController.php

use Illuminate\Http\Request;

class TaskController extends Controller {
    // 配置方法,接受params参数
    public function show($name, $age) {
        return $name . " " . $age;
    }
}
```

## 单行为控制器

- 单行为控制器: 一个控制器里只有一个方法
- 指令创建: `php artisan make:controller 控制器名 --invokable`

```php
// App/Http/Controllers/OneController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OneController extends Controller {
    public function __invoke(Request $request) {
        return "hello world";
    }
}
```

```php
// 因为控制器里只有一个方法,所以只需要指定是什么控制器,不需要是什么方法了
Route::get("/one", "App\Http\Controllers\OneController");
```

## 资源控制器

### 普通资源控制器

- 资源控制器: 方法名基本固定,专门处理增删改查,每个方法都对应着一个业务逻辑
- 创建资源控制器: `php artisan make:controller 控制器名 --resource`

```php
// App/Http/Controllers/ArticleContorller.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ArticleController extends Controller {
    public function index() {}

    public function create() {}

    public function store(Request $request) {}

    public function show($id) {}

    public function edit($id) {}

    public function update(Request $request, $id) {}

    public function destroy($id) {}
}
```

```php
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\BlogController;

// 配置单个资源路由
Route::resource("articles", ArticleController::class);
// 配置多个资源路由
Route::resources([
    "articles" => ArticleController::class,
    "blogs" => BlogController::class
]);
/*
	配置article的资源路由,相当于配置了如下7个路由:
        Route::get("articles", [ArticleController::class, "index"]);
        Route::get("articles/create", [ArticleController::class, "create"]);
        Route::post("articles", [ArticleController::class, "store"]);
        Route::get("articles/{id}", [ArticleController::class, "show"]);
        Route::get("articles/{id}/edit", [ArticleController::class, "edit"]);
        Route::put("articles/{id}", [ArticleController::class, "update"]);
        Route::delete("articles/{id}", [ArticleController::class, "destroy"]);
    其中每个路由指向的方法都对应着一个业务逻辑的处理 (增删改查)
        Route::get("articles", [ArticleController::class, "index"]);
		    - 可以通过 https://127.0.0.1/articles 访问到 ArticleController控制器的 index()
			- 在index()中,处理展示文章列表的业务逻辑
        Route::get("articles/create", [ArticleController::class, "create"]);
		    - 可以通过 https://127.0.0.1/articles/create 访问到 ArticleController控制器的 create()
			- 在create()中,处理创建文章的表单页的业务逻辑
        Route::get("articles/{id}/edit", [ArticleController::class, "edit"]);
		    - 可以通过 https://127.0.0.1/articles/10/edit 访问到 ArticleController控制器的 edit(), 并且传递id=10的参数
			- 在edit()中,处理编辑文章的表单页的业务逻辑
		...
*/

// 只开启index()和show()的,即只可以访问index()和show()
Route::resource("articles", ArticleController::class)
    ->only(["index", "show"]);
// 排除index()和show(),即其他方法都可以访问
Route::resource("articles", ArticleController::class)
    ->except(["index", "show"]);

// 给articles.comments嵌套路由的所有路由重新起别名 (每个路由默认都是有别名的,但我们可以重新起)
// 比如: "index"路由的别名 默认为: "articles.index" -> 更改后: "index"
// 给单个路由重新起别名
Route::resource("articles", ArticleController::class)
    ->name("index", "index");
// 给多个路由重新起别名
Route::resource("articles", ArticleController::class)
    ->names([
        "index" => "index",
        "edit" => "edit"
    ]);

// 给articles资源路由的所有路由的uri中的参数重命名
// 比如: edit路由的uri 默认为: articles/{article}/edit -> 更改后: articles/{article_id}/edit
// 给单个参数重命名
Route::resource("articles", ArticleController::class)
    ->parameter("articles", "article_id"); // 注: 第一个参数是"artilces"不是"article"
// 给多个参数重命名
Route::resource("articles", ArticleController::class)
    ->parameters([
        "articles" => "article_id"
    ]);
```

| 控制器的方法 | 业务逻辑描述               | 路由的别名      | 路由的 URI              | HTTP 请求方式 |
| ------------ | -------------------------- | --------------- | ----------------------- | ------------- |
| index()      | 展示文章列表               | articles.index  | articles                | GET           |
| create()     | 创建文章的表单页           | articles.create | articles/create         | GET           |
| store()      | 获取表单页的数据并保存文章 | articles.store  | articles                | POST          |
| show()       | 展示单个文章               | articles.show   | articles/{article}      | GET           |
| edit()       | 编辑文章的表单页           | articles.edit   | articles/{article}/edit | GET           |
| update()     | 获取表单页的数据并更新文章 | articles.update | articles/{article}      | PUT/PATCH     |
| destroy()    | 删除单个文章               | articles.delete | articles/{article}      | DELETE        |

### api 资源控制器

- api 资源控制器: 没有 create()和 edit(),即不需要 HTML 表单页面的方法
- 创建指令: `php artisan make:controller --api 控制器名`

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CommentController extends Controller {
    public function index() {}

    public function store(Request $request) {}

    public function show($id) {}

    public function update(Request $request, $id) {}

    public function destroy($id) {}
}
```

```php
// 配置单个api资源路由
Route::apiResource("articles", ArticleController::class);
// 配置多个api资源路由
Route::apiResources([
    "articles" => ArticleController::class,
    "blogs" => BlogController::class
]);
```

### 模型资源控制器

- 模型资源控制器: 专门处理某一个模型的资源控制器
- 创建模型资源控制器 `php artisan make:controller --resource --model=模型名 控制器名`

```php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller {
    public function index() {}

    public function create() {}

    public function store(Request $request) {}

    // $user就是根据主键查询到的user模型,故可以很方便的操作数据库
    // 注: 使用这个模型资源控制器,就不能通过parameter()给参数重命名了
    public function show(User $user) {}

    public function edit(User $user) {}

    public function update(Request $request, User $user) {}

    public function destroy(User $user) {}
}
```

### 资源路由的嵌套

```php
Route::resource("articles", ArticleController::class);

// 深层嵌套路由
Route::resource("articles.comments", CommentController::class);

// 浅层嵌套路由
Route::resource("articles.comments", CommentController::class)
    ->shallow();

// 给articles.comments嵌套路由的所有路由重新起别名 (每个路由默认都是有别名的,但我们可以重新起)
// 比如: "index"路由的别名 默认为: "articles.comments.index" -> 更改后: "index"
// 给单个路由重新起别名
Route::resource("articles.comments", ArticleController::class)
    ->name("index", "index");
// 给多个路由重新起别名
Route::resource("articles.comments", ArticleController::class)
    ->names([
        "index" => "index",
        "edit" => "edit"
    ]);

// 给articles.comments嵌套路由的所有路由的uri中的参数重命名
// 比如: edit路由的uri 默认为: articles/{article}/comments/{comment}/edit -> 更改后: articles/{article_id}/comments/{comment_id}/edit
// 给单个参数重命名
Route::resource("articles.comments", CommentController::class)
    ->parameter("articles", "article_id");
// 给多个参数重命名
Route::resource("articles.comments", CommentController::class)
    ->parameters([
        "articles" => "article_id",
        "comments" => "comment_id"
    ]);
```

> 深层嵌套路由

| 控制器的方法 | 业务逻辑描述               | 路由的别名               | 路由的 URI                                 | HTTP 请求方式 |
| ------------ | -------------------------- | ------------------------ | ------------------------------------------ | ------------- |
| index()      | 展示评论列表               | articles.comments.index  | articles/{article}/comments                | GET           |
| create()     | 创建评论的表单页           | articles.comments.create | articles/{article}/comments/create         | GET           |
| store()      | 获取表单页的数据并保存评论 | articles.comments.store  | articles/{article}/comments                | POST          |
| show()       | 展示单个评论               | articles.comments.show   | articles/{article}/comments/{comment}      | GET           |
| edit()       | 编辑评论的表单页           | articles.comments.edit   | articles/{article}/comments/{comment}/edit | GET           |
| update()     | 获取表单页的数据并更新评论 | articles.comments.update | articles/{article}/comments/{comment}      | PUT/PATCH     |
| destroy()    | 删除单个评论               | articles.comments.delete | articles/{article}/comments/{comment}      | DELETE        |

> 浅层嵌套路由

| 控制器的方法 | 业务逻辑描述               | 路由的别名               | 路由的 URI                         | HTTP 请求方式 |
| ------------ | -------------------------- | ------------------------ | ---------------------------------- | ------------- |
| index()      | 展示评论列表               | articles.comments.index  | articles/{article}/comments        | GET           |
| create()     | 创建评论的表单页           | articles.comments.create | articles/{article}/comments/create | GET           |
| store()      | 获取表单页的数据并保存评论 | articles.comments.store  | articles/{article}/comments        | POST          |
| show()       | 展示单个评论               | comments.show            | comments/{comment}                 | GET           |
| edit()       | 编辑评论的表单页           | comments.edit            | comments/{comment}/edit            | GET           |
| update()     | 获取表单页的数据并更新评论 | comments.update          | comments/{comment}                 | PUT/PATCH     |
| destroy()    | 删除单个评论               | comments.delete          | comments/{comment}                 | DELETE        |

# 数据库

## 数据库的配置

> 配置.env 文件

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db01
DB_USERNAME=root
DB_PASSWORD=111
```

## 原生操作

### 查询数据

```php
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    $results = DB::select("select * from user");
}
```

### 增加数据

```php
DB::insert("insert into users(`name`, `age`) values('sun', 18)");
```

### 修改数据

```php
DB::update("update users set `name` = 'sun', age = 18 where id = 4");
```

### 删除数据

```php
DB::delete("delete from users where id = 3");
```

## 构造器操作

### 查询数据

#### 原生查询方法

```php
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    /*
        原生SQL语句的方法,相当于
            select id, avg(age) as avgAge
            from users
            where id > 2
            group by id
            having avg(age) > 10
            order by avg(age) desc
    */
    $results = DB::table("users")
        ->selectRaw("id, avg(age) as avgAge")
        ->whereRaw("id > 1")
        ->groupByRaw("id")
        ->havingRaw("avg(age) > 10")
        ->orderByRaw("avg(age) desc")
        ->get();
}
```

#### 基本查询方法

```php
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    // 相当于 "select * from users"
    $results = DB::table("user");
    // 相当于 "select * from users"
    $results = DB::table("users")->get();

    /*
        selectRaw() 和 select() 的区别
            selectRaw()中编写原生的sql语句,可以进行复杂的语句
                DB::table("users")->selectRaw("id,name")->get(); // 对
                DB::table("users")->selectRaw("count(*) as count")->get(); // 对
            select()中编写规定的属性,不可以进行复杂的语句,需要借助DB::raw()进行原生查询
                DB::table("users")->select("id", "name")->get(); // 对
                DB::table("users")->select("count(*) as count")->get(); // 错
                DB::table("users")->select(DB::raw("count(*) as count"))->get(); // 对
        whereRaw() 和 where() 的区别
            ...
        ...
    */

    // select()
    $results = DB::table("users")
        // 相当于 "select id, name as userName"
        ->select("id", "name as userName")
        ->get();

    // where()
    $results = DB::table("users")
        ->select("id", "name")
        // 相当于 "where id = 3"
        ->where("id", "3")
        ->get();
    $results = DB::table("users")
        ->select("id", "name")
        // 相当于 "where id >= 3"
        ->where("id", ">=" , "3")
        ->get();
    $results = DB::table("users")
        ->select("id", "name")
        // 相当于 "where id = 1 and name = 'sun'"
        ->where([
            "id" => 1,
            "name" => "sun"
        ])
        ->get();
    $results = DB::table("users")
        ->select("id", "name")
        // 相当于 "where id >= 3 and name like '%sun%'"
        ->where([
            ["id", ">=", "3"],
            ["name", "like", "%sun%"]
        ])
        ->get();

    // groupBy()
    $results = DB::table("users")
        ->selectRaw("id, count(*) as count")
        // 相当于 "group by id"
        ->groupBy("id")
        ->get();

    // orderBy()
    $results = DB::table("users")
        ->selectRaw("name ,age")
        // 相当于 "orderBy age"
        ->orderBy("age")
        ->get();
    $results = DB::table("users")
        ->selectRaw("name ,age")
        // "orderBy age desc"
        ->orderBy("age", "desc")
        ->get();

    // having() 和 where() 一个用法
    $results = DB::table("users")
        ->selectRaw("id, count(*) as count")
        ->groupBy("id")
        // 相当于 "having id > 5"
        ->having("id", ">", "5")
        ->get();
});
```

#### 其他查询方法

##### where()派生查询

```php
$results = DB::table("users")
    // 相当于 "where id < 2 and id > 5"
    ->where("id", ">", 2)
    ->where("id", "<", 5)
    ->get();

$results = DB::table("users")
    // 相当于 "where id < 2 or id > 5"
    ->where("id", "<", 2)
    ->orWhere("id", ">", 5)
    ->get();

$results = DB::table("users")
    ->where("id", "<", "2")
    // 相当于 "where id < 2 or (id > 5 and id < 7)"
    ->orWhere(function (Builder $query) {
        $query
            ->where("id", ">", 5)
            ->orWhere("id", "<", "7");
    })
    ->get();

$results = DB::table("users")
    // 相当于 "where id between 5 and 7"
    ->whereBetween("id", [5, 7])
    ->get();

$results = DB::table("users")
    // 相当于 "where id in (5, 7, 8)"
    ->whereIn("id", [5, 7, 8])
    ->get();

$results = DB::table('users')
    // 相当于 "where create_time = update_time" (create_time和update_time是数据表的字段,表示记录的创建时间和更新时间,一般都是date类型的数据)
    ->whereColumn('create_time', 'update_time')
    ->get();

// whereNull(),whereNotNull(),orWhereNull(),orWhereNotNull()
$results = DB::table("users")
    // 相当于 "where id is null or name is not null"
    ->whereNull("id")
    ->orWhereNotNull("name")
    ->get();

// whereDate(),whereYear(),whereMonth(),whereDay(),whereTime(),orWhereDate()...
$results = DB::table('users')
    // 相当于 "where date(create_time) > '2018-12-11'"
    ->whereDate('create_time', '>', '2018-12-11')
    ->get();
```

##### 分页查询

```php
// 相当于 "select * from user limit 2, 3"
$results = DB::table("users")->offset(2)->limit(3); // 方法1
$results = DB::table("users")->skip(2)->take(3); // 方法2
```

##### 去重查询

```php
// 去掉重复的查询结果,相当于 "select distanct form users"
$results = DB::table("users")->distanct();
```

##### 合并查询

```php
/*
    合并查询查询结果
        union()合并会自动去掉重复的记录,相当于
            (select * from emp where ename = 'smith') union (select * from emp where ename = 'king' or ename = 'smith')
        unionAll()合并不会自动去掉重复的记录
            (select * from emp where ename = 'smith') unionAll (select * from emp where ename = 'king' or ename = 'smith')
*/
$query = DB::table("emp")->whereRaw("ename = 'smith'");
$result = DB::table("emp")->whereRaw("ename = 'king' or ename = 'smith'");
$result->union($query)->get(); // union()合并
$result->unionAll($query)->get(); // unionAll()合并
```

##### 分组查询

```php
// 相当于 "select count(*) from users"
$count = DB::table("users")->count();
// 相当于 "select max(age) from users"
$maxAge = DB::table("users")->max("age");
// 相当于 "select min(age) from users"
$minAge = DB::table("users")->min("age");
// 相当于 "select avg(age) from users"
$avgAge = DB::table("users")->avg("age");
// 相当于 "select sum(age) from users"
$sumAge = DB::table("users")->sum("age");
```

##### 判断查询

```php
// 判断users表中有id=2的数据
$flag1 = DB::table("users")->where("id", 2)->exists();
// 判断users表中没有id=2的数据
$flag2 = DB::table("users")->where("id", 2)->doesntExist();
    // return dd($flag1);
    // return response()->json($flag1);
    // return [$flag1];
```

##### 随机排序查询

```php
// 获取users表的所有数据,并对其随机排序
$results = DB::table("users")->inRandomOrder()->get();
```

##### 添加字段查询

```php
// 在原先查询的基础上增加一个"id"字段
$base = DB::table("users")->selectRaw("name, age");
$results = $base->addSelect("id")->get();
```

##### 循环分批查询

```php
// 将获取到的数据分成三批,每一批的数据都放到$results中,我们可以遍历$results获取到每一批中所有的数据
DB::table("users")->orderBy("id")->chunk(3, function ($results) {
    foreach ($results as $user) {
        echo $user->name . " ";
    }
    echo "<br>";
});
```

##### 字段查询

```php
// 相当于 "select name from users"
$results = DB::table("users")->pluck("name");
// 将id作为name字段的key (即我们可以通过$results[0]访问到"tom",$results[1]访问到"sun")
$results = DB::table("users")->pluck("name", "id");
```

##### 条件判断查询

```php
// when()条件判断
$flag = true;
$results = DB::table("users")->when($flag, function (Builder $query) {
    // 如果$flag为ture,就相当于 "select * from users where id = 2"
    $query->where("id", 2);
}, function (Builder $query) {
    // 如果$flag为false,就相当于 "select * from users where id = 3"
    $query->where("id", 3);
})->get();
```

##### 最新数据查询

```php
// 获取create_time字段最新的数据,即最新添加的数据
$results = DB::table("users")->latest("created_time")->get();
```

##### 特殊查询

```php
// toSql()获取这段代码表示的具体sql语句,即返回"select `name`, `age` from `users` where `id` > ?"
$results = DB::table("users")->select("name", "age")->where("id", ">", "4")->toSql();

// 获取数据第一条数据,相当于 "select * from users limit 0,1"
$results = DB::table("users")->first();

// 获取第一条数据的name字段,相当于 "select name from users limit 0,1"
$results = DB::table("users")->value("name");

// 相当于 "select * from users where 主键 = 2"
$results = DB::table("users")->find(2);
```

### 增加数据

```php
// 添加单条数据
DB::table("users")->insert([
    "name" => "king",
    "age" => "15"
]);

// 添加多条数据
DB::table("users")->insert([
    [
        "name" => "smith",
        "age" => 30
    ],
    [
        "name" => "kid",
        "age" => 13
    ]
]);

// 如果插入时出错了,忽略错误提示,不会出现提示信息
DB::table("users")->insertOrIgnore([
    "id" => 1,
    "name" => "john"
]);

// 插入成功后,返回id的值
$id = DB::table("users")->insertGetId([
    "name" => "john",
    "age" => 12
]);
```

### 修改数据

```php
// 修改单条数据
DB::table("users")
    ->where("id", 1)
    ->update([
        "name" => "sun",
        "age" => "17"
    ]);

// 如果id=10的数据存在,就修改数据,如果id=10的数据不存在,就添加数据
DB::table("users")
    ->updateOrInsert(
        ["id" => 10],
        ["name" => "tom", "age" => 17]
    );

// id=2的记录的age字段进行自增操作,每次+1
DB::table("users")->where("id", 2)->increment("age");
// id=2的记录的age字段进行自增操作,每次+3
DB::table("users")->where("
```

### 删除数据

```php
// 相当于 "delete from users"
DB::table("users")->delete();
DB::table("users")->truncate();

// 相当于 "delete from users where 主键 = 3"
DB::table("users")->delete(3);

// 相当于 "delete form suers where name = 'sun'"
DB::table("users")->where("name", "sun")->delete();
```

## 数据模型操作

### 创建数据模型

- 要操作数据库的 users 表,就需要创建 User 数据模型 (实际上是一个类)
    - 一个 User 模型实例就对应 users 表中的一条 user 记录
- 创建数据模型: `php artisan make:model 数据模型名`

### 数据模型的命名规范

- 数据表命名 必须是 数据模型命名 的复数
    - User 模型 -> users 表
    - Bus 模型 -> buses 表
    - Child 模型 -> children 表
- 数据表的 主键 和 外键
    - users 表为主表,profile 表为附表
        - users 表: 主键 -> `id`
        - profile 表: 主键 -> `id`, 外键 -> `user_id`
- 中间表命名: users 表 <-> user_role 表 <-> roles 表
    - users 表 需要借助 user_role 表 联系 roles 表
    - roles 表 需要借助 user_role 表 联系 users 表
- Str::plural()可以帮助我们获取字符串的复数形式,比如:
    - Str::plural("user") // users
    - Str::plural("bus") // buses
    - Str::plural("child") // children
- 解决模型命名规范的问题
    - 方法 1: 命名时遵循命名规范
    - 方法 2: 在数据模型中添加 `protected $table = 数据表名` 忽视命名规范

### 数据模型的相关插件

```bash
# laravel的代码提示插件laravel-ide-helper
composer require barryvdh/laravel-ide-helper

# 为 models 生成注释 (先安装laravel-ide-helper)
php artisan ide-helper:models
```

### 数据模型的配置

```php
// App/Models/User.php 正常情况下不需要任何的配置

class User extends Authenticatable {
    // 允许进行数据填充的字段
    protected $fillable = [
        'username',
        'email',
        'password',
    ];

    // 无视模型命名规范
    protected $table = 'user';

    // 开启软删除功能
    use SoftDeletes;

    // 设置主键为非自增
    public $incrementing = false;

    // 自定义时间戳格式
    public $dateFormat = "U";

    /*
        laravel自动给数据表的 CREATED_AT字段,UPDATED_AT字段,DELETED_AT字段 赋值 (默认)
            CREATED_AT 表示记录的创建时间
            UPDATED_AT 表示记录的修改时间
            DELETED_AT 表示记录的软删除时间
        开启这个配置时,表必须得有这几个字段才行,因为laravel会自动向这几个字段赋值
    */
    public $timestamps = true;

    /*
        将这几个字段值修改为数据表中对应业务逻辑的字段值
            比如: users表中"create_time"表示记录的创建时间,就修改CREATED_AT的值为"create_time"
    */
    const CREATED_AT = "create_time";
    const UPDATED_AT = "update_time";
    const DELETED_AT = "delete_time";

    // 设置读取database.php中的mysql配置项 (默认)
    protected $connection = "mysql"
}
```

### 查询数据

```php
// App/Models/User.php

use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    // 相当于 "select * from users"
    $results = User::all();
    $results = User::get();

    // 数据模型的基本查询方法还是构造器查询方法基本一样 (稍微有点不同,比如: 这里的select需要用"[]"包起来)
    $results = User::select(["name as userName", "age"])
        ->where([
            ["age", ">", "3"],
            ["age", "<", "30"]
        ])
        ->offset(0)
        ->take(3)
        ->get();
});
```

```php
// App/Models/User.php

class User extends Authenticatable {
    // ...
}
```

### 添加数据

```php
// 新建一条数据,加入到数据表中
$user = new User();
$user->name = "sun";
$user->age = 18;
$user->save();

// 添加单条数据 (需要在模型端配置开启批量赋值的许可), 同时返回添加的数据
$result = User::create([
    "name" => "sun",
    "age" => 18
]);
// 添加多条数据 (需要在模型端配置开启批量赋值的许可)
$result = User::create([
    [
        "name" => "sun",
        "age" => 18
    ],
    [
        "name" => "xue",
        "age" => 20
    ]
]);
```

```php
// App/Models/User.php

class User extends Model {
    // 配置开启批量赋值许可的字段
    protected $fillable = [
        "name",
        "age"
    ];
    // 配置关闭批量赋值许可的字段
    protected $guarded = [
        "name",
        "age"
    ];
    // 配置全部字段关闭的批量赋值许可 (默认)
    protected $fillable = []
    // 配置全部字段开启的批量赋值许可
    protected $guarded = []

    // 注: $fillable和$guarded不可同时使用
}

/*
    - 项目中获取到的数据很多时候是不可控的,比如: "http://127.0.0.1:8000/?name=sun&age=18&sex=male"
        其中sex字段是我们users表不需要的
    - Request::all() 获取url请求中的所有参数
        print_r(Request::all()); // Array ( [name] => sun [age] => 18 [sex] => male )
    - User::create(Request::all()) 添加数据时,就会把sex字段也添加进去,必然会报错
    - 将name和age开启批量赋值许可,赋值时,就只会给name和age赋值,添加字段时也就不会讲sex也加进去了,这就很好的解决了问题
*/
```

### 修改数据

```php
// 修改 主键=2 的记录(方法1)
$user = User::find(2);
$user->name = "sun";
$user->age = 18;
$user->save();

// 修改 主键=2 的记录(方法2)
$user = User::find(2);
$user['name'] = "sun";
$user['age'] = 18;
$user->save();

// 修改name="sun"的记录
User::where("name", "sun")
    ->update([
        "name" => "xue",
        "age" => 22
    ]);
```

### 删除数据

```php
// 删除 主键=351 的记录
User::find(351)->delete();

// 删除 name="xue" 的记录
User::where("name", "xue")->delete();

// 删除 主键=10 的记录
User::destroy(10);
// 删除 主键=1/2/3 的记录
User::destroy([1, 2, 3]);
```

### 软删除

```php
// App/Models/User.php

class User extends Model {
    // 开启软删除功能
    use SoftDeletes;
}
```

```php
// 开启软删除后,删除字段,并不会真的将记录删除,而是向该记录的CREATED_AT字段赋一个值,用来表示该字段已被软删除
User::find(2)->delete();
User::where("name", "xue")->delete();

// 直接获取软删除后的记录,是获取到的
$results = User::find(2); // []
$results = User::where("name", "xue")->get(); // []

// 通过 User::withTrashed() 获取所有的数据(包含软删除的数据,我们可以通过find(),where找出软删除的数据)
$results = User::withTrashed()->get(); // [...]

// 通过 trashed() 判断某条记录是否被软删除了
$flag = User::withTrashed()->find(2)->trashed();

// 通过 User::onlyTrashed() 获取所有软删除的数据
$results = User::onlyTrashed()->get(); // [...]

// 通过 restore() 还原某条记录
User::onlyTrashed()->find(2)->restore();

// 通过 forceDelete() 真正删除记录
User::onlyTrashed()->find(2)->forceDelete();
```

### 作用域

#### 本地作用域

```php
/*
    如果多条sql语句都需要使用到同一段条件查询,我们可以将这段条件查询封装到User模型中,后续直接调用即可
*/

Route::get("/", function () {
    // 向User::age()传递参数
    $results1 = User::age(10, 30)
        ->where("name", "like", "%e%")
        ->get();

    // 这里多条sql语句都需要使用同一段关于年龄的条件查询,就调用User::age(),提高了代码的复用率
    $results2 = User::age(10, 30)
        ->where("sex", "=", "male")
        ->get();
    $results3 = User::age(10, 30)
        ->where("id", ">", "10")
        ->get();
    return $results1;
});
```

```php
class User extends Model {
    /*
        本地作用域函数的命名格式
            name字段 -> scopeName
            age字段 -> scopeAge
            user_nam字段 -> scopeUserName
        本地作用域函数可以接受任意个参数
            scopeAge($query, $value1, $value2, $value3, $value4...)
    */
    public function scopeAge($query, $value1, $value2) {
        $query
            ->where("age", ">", $value1)
            ->where("age", "<", $value2);
    }
}
```

#### 全局作用域

##### 添加全局作用域

```php
// App/Models/User.php

use Illuminate\Database\Eloquent\Builder;

class User extends Model {
    public static function booted() {
        parent::booted(); // TODO: Change the autogenerated stub

        // 给User模型添加全局作用域 (方法1),通过闭包的形式添加,同时给该全局作用域起别名为"age",方便后续取消全局作用域
        static::addGlobalScope("age", function (Builder $builder) {
            $builder
                ->where("age", ">", "10")
                ->where("age", "<", "30");
        });

        // 给User模型添加全局作用域 (方法2),通过类的形式添加
        static::addGlobalScope(new AgeScope());
    }
}
```

```php
// App/Scope/AgeScope.php

namespace App\Scope;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

// 实现Scope接口
class AgeScope implements Scope {
    public function Apply(Builder $builder, Model $model) {
        // TODO: Implement Apply() method.

        // 编写全局作用的sql语句
        $builder
            ->where("age", ">", "10")
            ->where("age", "<", "30");
    }
}
```

```php
Route::get("/", function () {
    // 此时通过User模型对象来操作数据库时,就已经添加上了全局作用的sql语句了
    $results = User::get();

    return $results;
});
```

##### 取消全局作用域

```php
// 根据别名取消全局作用域 (取消方法1添加的全局作用域)
$results = User::withoutGlobalScope("age")->get();

// 根据类名取消全局作用域 (取消方法2添加的全局作用域)
$results = User::withoutGlobalScope(\App\Scope\AgeScope::class)->get();

// 取消多个全局作用域
$results = User::withoutGlobalScopes([
    "age",
    \App\Scope\StatusScope::class,
])->get();
```

### 访问器

```php
class User extends Model {
    // 定义name字段的访问器 (类似于getter,命名格式: name字段 -> getNameAttribute())
    public function getNameAttribute($value) {
        // $value就是select()要获取的字段值

        // 返回字段值为处理后的值
        return "[" . $this->attributes["name"] . "]";
    }

    // 定义虚拟字段的访问器 (如果数据表中没有info字段,而我们又定义了info字段的访问器,那么info字段就会被认作是虚拟字段)
    public function getInfoAttribute() {
        return "my name is " . $this->attributes["name"]; // "my name is sun"
    }
    // 虚拟字段是无法被直接访问到的,需要将虚拟字段添加到数据列表中,才可以访问到
    protected $Appends = ["info"];
}
```

```php
// web.php

Route::get("/", function () {
    // 访问name字段时,会调用getNameAttribute()
    $results = User::select(["name"])->get();

    // 虚拟字段没有添加到数据列表时,可以通过特殊方式访问虚拟字段
    $results = User::find(4)->info;

    // 虚拟字段添加到数据列表后,就可以通过正常方式访问虚拟字段
    $results = User::get();
});
```

### 修改器

```php
class User extends Model {
    // 定义name字段的修改器 (类似于setter,命名格式: name字段 -> setNameAttribute())
    public function setNameAttribute($value) {
        // $value就是update()要修改的字段值

        // 修改原字段值为处理后的值
        $this->attributes["name"] = "[" . $value . "]";
    }
}
```

```php
// web.php

Route::get("/", function () {
    // 修改name字段时,就会调用setNameAttribute()
    User::find(4)->update([
        "name" => "sun"
    ]);
});
```

### 模型的属性访问

```php
class User extends Model {
    public function show() {
        // 访问的是经过getNameAttribute()处理的name字段
        return "my name is " . $this->name; // "my name is ["sun"]

        // 访问的是没有经过getNameAttribute()处理的name字段,即原字段
        return "my name is " . $this->attributes["name"]; // "my name is sun"
    }
}
```

### 修改字段的输入格式

```php
class User extends Model {
    // 向数据表输入数据时,会修改字段的数据类型为date (比如: 输入"123",会被转换成"1970-01-01 00:02:03")
    protected $dates = [
        // 设置"test_time"字段的数据类型为date
        "test_time"
    ];

    // 注: 将需要操作的字段添加进$fillable配置项中
    protected $fillable = [
        "test_time",
    ];
}
```

### 修改字段的输出格式

```php
class User extends Model {
    // 从数据表输出数据时,会修改字段的数据类型
    protected $casts = [
        // 设置details字段的数据类型为boolean
        'details' => 'boolean'
    ];
}
```

### 数据模型的集合操作

```php
// 通过数据模型查询到的数据模型,就是集合类型的数据,集合常用的方法,都可以使用
$users = User::get();

// 所有模型的name字段都大写处理
$results = $users->map(function ($user) {
    $user->name = strtoupper($user->name);
    return $user;
});

// 筛选出sex字段为"male"的模型
$results = $users->filter(function ($user) {
    return $user->sex == "male";
});

// 判断集合中是否包含 主键=10 的模型
$results = $users->contains(10);
// 判断集合中是否包含 User::find(10) 的模型
$results = $users->contains(User::find(10));

// 查找 主键=4 的模型
$results = $users->find(4);

// 返回与 User::whereIn("id", [4, 5, 6] 不同的模型
$results = $users->diff(User::whereIn("id", [4, 5, 6])->get());

// 返回与 主键=5,主键=6,主键=7 不同的模型
$results = $users->except([4, 5, 6]);

// 返回 主键=5,主键=6,主键=7 的模型
$results = $users->only([4, 5, 6]);

// 返回所有模型的主键
$results = $users->modelKeys();

// 返回唯一的模型
$results = $users->unique();

// 返回模型的数量
$results = $users->count();
```

### 模型关联

#### 一对一关联

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719264.png)

> 正向一对一关联

```php
// App/Models/User.php

class User extends Model {
    // users表(主表) 正向一对一关联 profiles表(从表), 方法名最好就是profile()
    public function profile() { // 可以是prifile(),也可以是profiles()
        // users表(主表)的id(主键) 正向一对一关联 profiles表(从表)的user_id(外键)
        return $this->hasOne(Profile::class, "user_id", "id");

        // 可以给users表关联的profiles表的字段添加默认值
        return $this->hasOne(Profile::class, "user_id", "id")
            ->withDefault([
                "id" => 0,
                "hobby" => "未知"
            ]);
    }
}
```

```php
// web.php

use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    // 通过User::find(19)查询到users表中的一条记录,再通过这条记录对应profiles表中的一条记录
    $results = User::find(19)->profile()->get();
    $results = User::find(19)->profile; // 简写
});
```

> 反向一对一关联

```php
// App/Models/Profile.php

class Profile extends Model {
    // profiles表(从表) 反向一对一关联 users表(主表), 方法名最好就是user()
    public function user() {
        // profiles表(从表)的user_id(外键) 反向一对一关联 users表(主表)的id(主键)
        return $this->belongsTo(User::class, "user_id", "id");

        // 可以给profiles表关联的users表的字段添加默认值
        return $this->belongsTo(User::class, "user_id", "id")
            ->withDefault([
                "id" => 0,
                "username" => "游客账户"
            ]);
    }
}
```

```php
// web.php

use App\Models\Profile;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    // 通过Profile::find(1)查询到profiles表中的一条记录,再通过这条记录对应users表中的一条记录
    $results = Profile::find(1)->user;
});
```

#### 一对多关联

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719265.png)

> 正向一对多关联

```php
// App/Models/User.php

class User extends Model {
    // users表(主表) 正向一对多关联 books表(从表), 方法名最好就是books()
    public function book() {
        // users表(主表)的id(主键) 正向一对多关联 books表(从表)的user_id(外键)
        return $this->hasMany(Book::class, "user_id", "id");

        // 可以给users表关联的books表的字段添加默认值
        return $this->hasMany(Book::class, "user_id", "id")
            ->withDefault([
                "id" => 0,
                "title" => "未知"
            ]);
    }
}
```

```php
// web.php

use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    // 通过User::find(19)查询到users表中的一条记录,再通过这条记录对应books表中的多条记录
    $results = User::find(19)->book;

    // 因为是一对多关联,所以是获取多条数据,我们可以再进一步筛选
    $results = User::find(19)->book()->where("title", "《亲热天堂》")->get();
});
```

> 反向一对多关联

```php
// App/Models/Book.php

class Book extends Model {
    // users表(主表) 反向一对多关联 books表(从表), 方法名最好就是user()
    public function user() {
        // books表(从表)的user_id(外键) 反向一对多关联 users表(主表)的id(主键)
        return $this->belongsTo(User::class, "user_id", "id");

        // 可以给books表关联的users表的字段添加默认值
        return $this->belongsTo(User::class, "user_id", "id")
            ->withDefault([
                "id" => 0,
                "username" => "游客账户"
            ]);
    }
}
```

```php
// web.php

use App\Models\Book;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    // 通过Book::find(1)查询到books表中的一条记录,再通过这条记录对应users表中的一条记录
    $results = Book::find(1)->user;

    return $results;
});
```

#### 多对多关联

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719266.png)

> users 表 多对多关联 roles 表

```php
// App/Models/User.php

class User extends Model {
    // users表 多对多关联 roles表 (因为是多对多,所以不存在正向和反向), 方法名最好就是role()
    public function role() {
        // users表(主表)的id(主键) 一对多关联 role_user表(从表)的的user_id(外键)
        // roles表(主表)的id(主键) 一对多关联 role_user表(从表)的的role_id(外键)
        return $this->belongsToMany(Role::class, "role_user", "user_id", "role_id", "id");

        // 可以给users表关联的roles表的字段添加默认值
        return $this->belongsToMany(Role::class, "role_user", "user_id", "role_id", "id")
            ->withDefault([
                "id" => 0,
                "type" => "未知"
            ]);
    }
}
```

```php
// web.php

use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    // 通过User::find(19)查询到users表中的一条记录,再通过这条记录对应roles表中的多条记录
    $results = User::find(19)->role;

    // 因为是多对多关联,所以是获取多条数据,我们可以再进一步筛选
    $results = User::find(19)->role()->where("type", "超级管理员")->get(); // 筛选roles表
    $results = User::find(19)->role()->where("role_id", "1")->get(); // 筛选role_user表
});
```

> roles 表 多对多关联 users 表

```php
// App/Models/Role.php

class Role extends Model {
    // roles表 多对多关联 users表 (因为是多对多,所以不存在正向和反向), 方法名最好就是role()
    public function user() {
        // roles表(主表)的id(主键) 一对多关联 role_user表(从表)的的role_id(外键)
        // users表(主表)的id(主键) 一对多关联 role_user表(从表)的的user_id(外键)
        return $this->belongsToMany(User::class, "role_user", "role_id", "user_id", "id");

        // 可以给roles表关联的uerss表的字段添加默认值
        return $this->belongsToMany(User::class, "role_user", "role_id", "user_id", "id")
            ->withDefault([
                "id" => 0,
                "username" => "游客账户"
            ]);
    }
}
```

```php
// web.php

use App\Models\Role;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    // 通过Role::find(1)查询到roles表中的一条记录,再通过这条记录对应users表中的多条记录
    $results = Role::find(1)->role;

    // 因为是多对多关联,所以是获取多条数据,我们可以再进一步筛选
    $results = Role::find(1)->user()->where("username", "蜡笔小新")->get(); // 筛选user表
    $results = Role::find(1)->user()->where("user_id", "19")->get(); // 筛选role_user表
});
```

#### 中间字段

```php
// web.php

Route::get("/", function () {
    // 多对多模型关联,查询到数据,会带有中间字段(pivot),默认包含着两个外键: user_id, role_id
    $results = User::find(19)->role;
        /*
            [
                {
                    "id": 1,
                    "type": "超级管理员",
                    "pivot": {
                        "user_id": 19,
                        "role_id": 1
                    }
                },
                {
                    "id": 2,
                    "type": "评论审核专员",
                    "pivot": {
                        "user_id": 19,
                        "role_id": 2
                    }
                },
                {
                    "id": 3,
                    "type": "图片监察员",
                    "pivot": {
                        "user_id": 19,
                        "role_id": 3
                    }
                }
            ]
        */

    $results = User::find(19)->role()
        ->withPivot("details", "id") // 向 pivot字段数组中 添加 role_user表的 details字段 和 id字段
        ->wherePivot("id", 1) // 筛选出中间字段数组中id字段为1的记录
        ->as("pivot_list") // pivot重命名为pivot_list
        ->get();
        /*
            [
                {
                    "id": 1,
                    "type": "超级管理员",
                    "pivot_list": {
                        "user_id": 19,
                        "role_id": 1,
                        "details": "啦",
                        "id": 8
                    }
                },
                {
                    "id": 2,
                    "type": "评论审核专员",
                    "pivot_list": {
                        "user_id": 19,
                        "role_id": 2,
                        "details": "嗯",
                        "id": 1
                    }
                },
                {
                    "id": 3,
                    "type": "图片监察员",
                    "pivot_list": {
                        "user_id": 19,
                        "role_id": 3,
                        "details": "啪",
                        "id": 6
                    }
                }
            ]
        */
});
```

#### 关联查询数据

```php
use App\Models\Book;
use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Route;

// web.php

Route::get("/", function () {
    // 基本使用
    $results = User::find(19)
        ->book()
        ->where("title", "《莎士比亚》")
        ->get();

     /*
        查询users表中与books表有关联的记录
            - users表中有一条id=76的记录,books表中没有user_id=76的记录,那么这条id=76的记录就是一条没有与books表产生关联的记录
            - users表中有一条id=19的记录,books表中有user_id=19的记录,那么这条id=19的记录就是一条与books表产生关联的记录
    */
    $results = User::has("book")->get();

    /*
        查询users表中与books表有关联的记录,并且该记录至少关联books表中2条记录
            - users表中有一条id=19的记录,books表中有3条user_id=19的记录,那么这条id=19的记录就符合条件
    */
    $results = User::has("book", ">=", "2")->get();

    // 查询users表中与books表没有有关联的记录
    $results = User::doesntHave("book")->get();

    /*
        select * from users where exits (
            select * from books where users.id = books.user_id and books.user_id = 19;
        )
    */
    $results = User::whereHas("book", function (Builder $builder) {
        $builder->where("user_id", 19);
    })->toSql();

    // 给users表的所有记录添加一个book_count字段 (统计与books表产生多少条关联)
    $results = User::withCount("book")->get();

    // 给users表的所有记录添加一个 book_count字段 和 profile_count字段
    $results = User::withCount(["book", "profile"])->get();

    // 给book_count字段起别名为b,给profile_count字段起别名为p
    $results = User::withCount(["book as b", "profile as p"])->get();

    // 延迟关联统计
    $results = User::get();
    if (true) {
        // 上面获取数据时不统计,在这里统计
        $results = $results->loadCount("book");
    }

    /*
        select
            users.*,
            select count(*) from books where users.id = books.user_id as book_count
            select count(*) from profiles where user_id = profile.user_id and user_id = 19 as profile_count
        from
            users
    */
    $results = User::withCount(["book", "profile" => function (Builder $builder) {
        $builder->where("user_id", "19");
    }])->get();
});
```

#### 关联添加数据

> 一对一关联 和 一对多关联 添加数据

```php
Route::get("/", function () {
    /*
        通过关联添加的数据会自动生成对应的外键
            比如: 主键=19的user,操作关联的books表,添加关联数据,该记录的外键字段user_id会自动设置为19
        User::find(19)->create(['title' => '《哈利波特》']);
            users表
                id      username
                19      蜡笔小新
            books表
                id      title       user_id
                1       《哈利波特》     19
    */

    // 查找到主键=19的user
    $user = User::find(19);

    // 操作关联的books表,添加单条数据 (方法1)
    $user->book()->create(["title" => "《哈利波特》"]);

    // 操作关联的books表,添加关联数据 (方法2)
    $user->book()->save(new Book(["title" => "《哈利波特》"]));

    // 操作关联的books表,添加多条数据 (方法1)
    $user->book()->createMany([
        ["title" => "《指环王》"],
        ["title" => "《傲慢与偏见》"]
    ]);

    // 操作关联的books表,添加多条数据 (方法2)
    $user->book()->saveMany([
        new Book(["title" => "《指环王》"]),
        new Book(["title" => "《傲慢与偏见》"])
    ]);

    // 还有很多其他方法: findOrNew, firstOrNew, firstOrCreate, updateOrCreate 查文档
});
```

> 多对多关联 添加数据

```php
/*
    添加多对多关联的表的数据,一般都是添加中间表的数据

    一条user记录 与 一条role记录 产生关联的方法: 新增一条role_use记录
        - 该role_user记录的user_id = 该user记录的id
        - 该role_user记录的role_id = 该role记录的id
*/

Route::get("/", function () {
    // 查找users表中主键=99的user
    $user = User::find(99);

    // 给user添加一条关联 (roles表中主键=1的记录)
    $user->role()->attach(1);

    // 给user添加多条关联 (roles表中 主键=1, 主键=2, 主键=3 的记录)
    $user->role()->attach([1, 2, 3]);

    // 给user添加关联,不会重复添加相同的关联
    $user->role()->sync([1, 2, 3]);
}
```

#### 关联修改数据

> 一对一关联 和 一对多关联 修改数据

```php
Route::get("/", function () {
    $user = User::find(99);

    // 操作关联的books表,修改数据
    $user->book()->update(["title" => "test", "user_id" => 100]);
});
```

> 多对多关联 修改数据

```php
/*
    多对多关联的修改数据,一般都是修改中间表的数据
*/

Route::get("/", function () {
    $user = User::find(99);

    // 修改role_user记录的值 (与user记录关联的role_user记录,并且该role_user记录的role_id=1)
    $user->role()->updateExistingPivot(1, [
        "details" => "嘿",
        "user_id" => 20,
        "role_id" => 1
    ]);
}
```

#### 关联删除数据

> 一对一关联 和 一对多关联 删除数据

```php
Route::get("/", function () {
    $user = User::find(99);

    // 操作关联的books表,删除数据
    $user->book()->delete();
});
```

> 多对多关联 删除数据

```php
/*
    删除多对多关联的表的数据,一般都是删除中间表的数据

    一条user记录 与 一条role记录 取消关联的方法: 删除一条role_use记录
*/

Route::get("/", function () {
        // 查找users表中主键=99的user
    $user = User::find(99);

    // 给user删除一条关联
    $user->role()->detach(1);

    // 给user删除多条关联
    $user->role()->detach([1, 2, 3]);

    // 给user删除全部关联
    $user->role()->detach();
}
```

#### 中间表切换数据

```php
Route::get("/", function () {
    /*
        给user切换(添加/删除)多条关联
            - 如果该user(主键=19)与这些role(主键=1, 主键=2, 主键3)没关联,就添加关联
            - 如果该user(主键=19)与这些role(主键=1, 主键=2, 主键3)有关联,就删除关联
    */
    User::find(99)->role()->toggle([1, 2, 3]);
});
```

#### 中间表添加时间

```php
Route::get("/", function () {
    // 因为多对多关联操作的是中间表,而我们又没有创建中间表的数据模型,所以无法通过配置$timestamps属性来自动给 created_at子u但 和 updated_at字段 赋值

    // 给user添加多条关联,同时给 created_at字段 和 updated_at字段 赋值
    User::find(99)->withTimestamps()->attach([1, 2, 3]);
});
```

#### 修改关联

```php
Route::get("/", function () {
    // 查找到主键=10的user
    $user = User::find(20);
    // 查找到主键=20的book
    $book = Book::find(10);
    // 关联user和book (修改book的外键为user的主键)
    $book->user()->associate($user);
    $book->save();
});
```

#### 删除关联

```php
Route::get("/", function () {
    // 查找到主键=10的book
    $book = Book::find(10);
    // 取消book和users表的关联 (修改book的外键为null)
    $book->user()->disassociate();
    $book->save();
});
```

#### 模板中的关联查询

```php
<!-- 模板中使用模型关联(user表 一对多关联 books表) -->
@foreach($books as $book)
    <tr>
        <td>book: {{$book['title']}}</td>
        <!-- 查询当前book模型所关联的user表的记录的username字段 -->
        <td>username: {{$book->user->username}}</td>
    </tr>
@endforeach
```

#### 模型的预加载

##### 基本使用

> Demand

```php
Route::get("/", function () {
    $books = Book::get();

    // 每次查询关联表的数据,都会执行一次sql,总共执行1+N次sql,性能欠佳
    foreach ($books as $book) {
        Debugbar::info($book->user);
    }

    return view("test");
});
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719267.png)

> 预加载解决问题

```php
Route::get("/", function () {
    // 预加载user表,提前整合sql,总共执行1+1次sql
    $books = Book::with("user")->get();

    foreach ($books as $book) {
        Debugbar::info($book->user);
    }

    return view("test");
});
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719268.png)

##### 指定字段

```php
Route::get("/", function () {
    // 只查询users表的id和username字段 (注: user是App/Models/Book.php中定义的user())
    $books = Book::with("user:id,username")->get();

    foreach ($books as $book) {
        Debugbar::info($book->user);
    }

    return view("test");
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719269.png)
![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719270.png)

##### 筛选记录

```php
Route::get("/", function () {
    // 只查询user表中id=19的记录
    $books = Book::with(["user" => function($query) {
        $query->where("id", 19);
    }])->get();

    foreach ($books as $book) {
        Debugbar::info($book->user);
    }

    return view("test");
});
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719271.png)
![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719272.png)

##### 模型中定义预加载

```php
// App/Models/Book.php

// 在Book模型定义预加载,这样只要查询book表,就会预加载user表
class Book extends Model {
    // 预加载user表
    protected $with = ["user"];
}
```

```php
Route::get("/", function () {
    // Book模型中已经预加载了,这里就不需要预加载了
    $books = Book::get();

    foreach ($books as $book) {
        Debugbar::info($book->user);
    }

    return view("test");
});
```

##### 延迟预加载

```php
Route::get("/", function () {
    // 这里先不进行预加载
    $books = Book::get();

    if (true) {
        // 在这里通过load()进行预加载
        $books = $books->load("user");

        foreach ($books as $book) {
            Debugbar::info($book->user);
        }
    }

    return view("test");
});
```

## 数据迁移

### 创建数据迁移

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202209052001284.png)

- 数据迁移: 用于设计表结构,创建表
    - databases/migration 中的每一个 php 文件就对应着一个数据表的创建
- 创建数据迁移: `php artisan make:migration --create=表名 文件名`

```php
// databases/migrations/create_articles_table.php

class CreateUsersTable extends Migration {
    public function up() {
        Schema::create('users', function (Blueprint $table) {
            // 主键字段
            $table->id();
            // username字段
            $table->string('username');
            // email字段,并且唯一
            $table->string('email')->unique();
            // 可以为空
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            // 默认为0
            $table->tinyInteger("is_admin")->default(0);
            $table->string("email_token");
            $table->tinyInteger("email_active")->default(0);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('users');
    }
}
```

### 进行数据迁移

- 数据迁移: `php artisan migrate`
- 数据迁移 + 重置数据表(可以重置主键): `php artisan migrate:refresh`
- 数据迁移 + 重置数据表(可以重置主键) + 调用 seeder 填充数据: `php artisan migrate:refresh --seed`

## 数据填充

### 创建数据填充

- 数据填充: 通过 seeder 填充数据到数据表中,一般是添加几条记录,用于代码测试
- 创建 UserSeeder `php artisan make:seeder 数据迁移的模型名`

```php
// database/seeders/UserSeeder.php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder {
    public function run() {
        User::create([
            "username" => "sun",
            "email" => "123@qq.com",
            "password" => bcrypt("11111")
        ]);
    }
}
```

### 注册数据填充

注册 UserSeeder 到 DatabaseSeeder 中

```php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder {
    public function run() {
        // 注册UserSeeder
        $this->call(UserSeeder::class);
    }
}
```

### 进行数据填充

运行 seeder,进行数据填充: `php artisan db:seed`

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202209052001286.png)

## 模型工厂

### 创建模型工厂

- 模型工厂: 可以批量生成数据,用于代码测试
    - laravel 框架自带一个 User 模型工厂
- 创建模型工厂: `php artisan make:factory 模型工厂名`

```php
// database/factories/UserFactory.php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory {
    public function definition() {
        return [
        ];
    }
}
```

### 配置模型工厂

```php
// database/factories/UserFactory.php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory {
    public function definition() {
        return [
            // 生成名称
            'username' => $this->faker->name(),
            // 生成邮箱
            'email' => $this->faker->unique()->safeEmail(),
            // 生成当前事件
            'email_verified_at' => now(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            // 生成随机数
            'remember_token' => Str::random(10),
            // 生成随机的100个字符文本
            'content' => $this->faker->text(100),
            // 生成[1, 2, 3]中随机的数子
            'test_id' => $this->faker->randomElement([1, 2, 3])
        ];
    }

    public function unverified() {
        return $this->state(function (array $attributes) {
            return [
                'email_verified_at' => null,
            ];
        });
    }
}
```

### 运行模型工厂

```bash
# 进入tinker
php artisan tinker
# 运行模型工厂创建20条记录
App\Models\User::factory()->count(50)->create()
```

### 调用模型工厂

- 先在 UserSeeder 模型填充中调用模型工厂,添加数据
- 然后 运行 seeder,进行数据填充: `php artisan db:seed`

```php
// database/seeders/UserSeeder.php

use App\Models\User;

class UserSeeder extends Seeder {
    public function run() {
        // 添加50条随机数据到数据表中
        User::factory()->count(50)->create();
    }
}
```

# 中间件

## 基本使用

- 中间件: 当接受到 Http 请求时,会将其拦截下来,我们可以在中间件中做一些通用的操作 (类似于 javaweb 里的拦截器)
- 创建指令: `php artisan make:middleware 中间件名`

```php
// App/Http/Middleware/CheckLogin.php

class CheckLogin {
    public function handle(Request $request, Closure $next) {
        // 如果url中没有username参数,就重定向到login路由
        if (!$request->get("username")) {
            return redirect("/login");
        }

        // 放行,执行主体代码 (类似于javaweb里拦截器的doFilter())
        return $next($request);
    }
}
```

```php
// web.php

use \App\Http\Middleware\TestMiddleware;

// 使用中间件
Route::get("/index", function (Request $request) {
    echo "welcome to index";
})->middleware(TestMiddleware::class);

Route::get("/login", function () {
    echo "welcome to login";
});

// 使用多个中间件
Route::get("/index", function (Request $request) {})->middleware("testMiddleware", "auth", "test");
```

## 前置中间件,后置中间件

```php
// App/Http/Middleware/TestMiddleware.php

class TestMiddleware {
    // 前置中间件
    public function handle(Request $request, Closure $next) {
        // 先拦截,执行中间件代码
        echo "拦截";
        // 后放行,执行主体代码
        return $next($request);
    }

    // 后置中间件
    public function handle(Request $request, Closure $next) {
        // 先放行,执行主体代码
        return $next($request);
        // 后拦截,执行中间件代码
        echo "拦截";
    }
}
```

## 注册路由中间件

```php
// App/Http/Middleware/TestMiddleware.php

class TestMiddleware {
    public function handle(Request $request, Closure $next) {
        echo "handle with something";
        return $next($request);
    }
}
```

```php
// App/Http/Kernel.php

use App\Http\Middleware\TestMiddleware;

// 注册中间件
class Kernel extends HttpKernel {
    // 注册中间件到路由上,让路由可以使用这些中间件
    protected $routeMiddleware = [
        // 注册TestLogin中间件
        "testMiddleware" => TestMiddleware::class
    ];
}
```

```php
// web.php

// 直接使用中间件
Route::get("/index", function (Request $request) {})->middleware("testMiddleware");
```

## 注册全局中间件

- 配置了全局中间件后,所有的请求都会被该中间件拦截下来

```php
// App/Http/Middleware/Every.php

class Every {
    public function handle(Request $request, Closure $next) {
        echo "handle with something";
        return $next($request);
    }
}
```

```php
// App/Http/Kernel.php

class Kernel extends HttpKernel {
    // 注册全局中间件
    protected $middleware = [
        Every::class
    ];
}
```

```php
// web.php

// 默认配置了全局中间件,不需要在路由里手动配置
Route::get("/index", function (Request $request) {
    echo "welcome to index";
});
```

## 注册中间件组

```php
// App/Http/Kernel.php

use App\Http\Middleware\CheckLogin;
use App\Http\Middleware\TestMiddleware;

class Kernel extends HttpKernel {
    // 注册中间件组
    protected $middlewareGroups = [
        // 请求会依次被"TestMiddleware","CheckLogin"拦截下来
        "myMiddlewareGroups" => [
            TestMiddleware::class,
            CheckLogin::class
        ]
    ];
}
```

```php
// 使用中间组
Route::get("/index", function (Request $request) {
    echo "welcome to index";
})->middleware("myMiddlewareGroups");
```

## 中间件传参

```php
// 配置路由中间件时,传递参数 (需要注册了中间件之后才可以传参)
Route::get("/index", function (Request $request) {
    echo "welcome to index";
})->middleware("testMiddleware:sun");
```

## terminate()

```php
// App/Http/Middleware/TestMiddleware.php

class TestMiddleware {
    public function handle(Request $request, Closure $next, $name) {
        echo "handle with something";
        return $next($request);
    }

    // terminate()会等中间件和路由响应完毕之后再执行 (默认执行,不需要在路由里配置)
    public function terminate(Request $request, Response $response) {
        echo "响应完毕之后再执行...";
    }
}

// 注: 如果中间件的中途执行了return,没有执行到return $next($request),是不会执行terminate()的
```

## 控制器中调用中间件

```php
Route::get("/index", [TestController::class, "show"]);
```

```php
// App/Http/Controllers/TestController.php

class TestController extends Controller {
    // 一般都是在构造器中调用中间件
    public function __construct() {
        // 调用中间件
        $this->middleware(TestMiddleware::class);
    }

    public function show() {
        return "hello world";
    }
}
```

## 内置中间件

### auth

```php
class UserController extends Controller {
    public function __construct() {
        // 只有登录的账户才可以访问UserController里的所有方法,而没有登录的账户只可以访问except排除的方法
        $this->middleware("auth", [
            "except" => ["index", "show", "create", "store"]
        ]);
    }
}
```

```php
// App/Http/Middleware/Authenticate.php 如果不满足中间件的要求,会重定向到其他的路由,我们可以在这里配置

class Authenticate extends Middleware {
    protected function redirectTo($request) {
        if (!$request->expectsJson()) {
            // 默认重定向到login路由,我们可以修改成其他的路由
            return route('login');
        }
    }
}
```

### guest

```php
class UserController extends Controller {
    public function __construct() {
        // 只有没有登录的账户,才可以访问这些方法
        $this->middleware("guest", [
            "only" => ["create", "store"]
        ]);
    }
}
```

```php
// App/Http/Middleware/RedirectIfAuthenticated.php 如果不满足中间件的要求,会重定向到其他的路由,我们可以在这里配置

class RedirectIfAuthenticated {
    public function handle(Request $request, Closure $next, ...$guards) {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // 默认重定向到home路由,我们可以修改成其他的路由
                return redirect(RouteServiceProvider::HOME);
            }
        }

        return $next($request);
    }
```

# Blade模板

## 基本使用

```html
<!-- resources/views/task.blade.php -->

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta
            name="viewport"
            content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Document</title>
    </head>
    <body>
        <!-- 使用mustache语法接受传递来的参数 -->
        task page {{$id}}
    </body>
</html>
```

```php
// 跳转到task模板(方法1),直接导航到task模板,同时可以携带参数
Route::view("/", "task", ["id" => 10]);

// 跳转到task模板(方法2),返回task模板,同时可以携带参数
Route::get("/", function () {
    return view("task", ["id" => 10]);
})

// 给视图传递参数
Route::get("/", function () {
    // 方法1
    return view("task", ["id" => 10]);
    // 方法2
    return view("task")->with("id", 10);
    // 方法3(推荐),compact会自动将$id转成数组格式的数据
    $id = 10;
    $username = 'sun'
    $age = 18
    return view("task", compact("id"));
    return view("task", compact('id', 'username', 'age'));
})

Route::get("/index", function() {
    // 跳转到admin/index模板
    return view("admin.index");

    // 判断task模板是否存在
    return view()->exists("task");

    // 跳转到index模板,如果index模板不存在就跳转到form模板,如果form模板不存在就跳转到task模板
    return view()->first(["index", "form", "task"], [
        "name" => "sun"
    ]);
})
```

## 命名规范

- 基础结构的模板,放在resources/views/layouts目录下,比如:
    - resources/views/layouts/defalut.blade.php // 顶部导航栏结构
    - resources/views/layouts/_message.blade.php // 提示信息
    - resources/views/layouts/_validate.blade.php // 表单错误信息
- 模板片段,命名前需要加上"_"符号,比如:
    - _message.blade.php
    - _validate.blade.php
- 一个资源控制器操作一张数据表,放在对应的文件夹下,比如: users资源控制器操作users表,文件就放在resources/views/user目录下
    - resources/views/user/create.blade.php
    - resources/views/user/edit.blade.php
    - resources/views/user/index.blade.php
    - resources/views/user/show.blade.php

## Blade 指令

### @if,@elseif,@else

```php
@if($num < 10)
    num 小于 10
@endif

@if($num < 10)
    num 小于 10
@elseif($num > 10 && $num < 20)
    num 大于 10 并且 num 小于 20
@else
    num 大于 20
@endif
```

### @unless

```php
<!-- 判断 $num > 10 为false,相当于@if取反 -->
@unless($num > 10)
    num 小于 10
@endunless
```

### @isset(),@empty

```php
@isset($name)
    $name存在
@endisset

@empty($name)
    $name为空
@endempty
```

### @switch()

```php
@switch($num)
    @case(10)
        $num 为 10
        @break
    @case(20)
        $num 为 20
        @break
    @default
        $name 为 其他
        @break
@endswitch
```

### @for,@foreach(),@while()

```php
@for($i = 0; $i < 10; $i++)
    $i = {{$i}}
@endfor

@foreach($users as $user)
    {{$user}}
@endforeach

@while($num > 0)
    $num = {{$num--}}
@endwhile
```

### @continue,@break

```php
@for($i = 0; $i < 10; $i++)
    <!-- @continue写法1 -->
    @if($i == 3)
        @continue
    @endif
    <!-- @continue写法2 -->
    @continue($i == 3)

    <!-- @break写法1-->
    @if($i == 5)
        @break
    @endif
    <!-- @break写法2-->
    @break($i == 5)
@endfor
```

### @loop

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719273.png)

```php
@foreach($users as $user)
    @if($loop->first)
        第一次迭代之前
    @endif

    @if($loop->last)
        最后一次迭代之前
    @endif

    {{$loop->index}}: {{$user}}
@endforeach

<!--
    第一次迭代之前 0: sun 1: xue 2: cheng 3: jack 4: jerry 最后一次迭代之前 5: tom
-->
```

## 模板的继承布局

### 模板的继承

```php
<!-- resources/views/public/base.blade.php -->

<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Base</title>
</head>
<body>
<h1> hello world </h1>
</body>
</html>
```

```php
<!-- resources/views/test.blade.php -->

<!-- 继承public/base模板 -->
@extends("public.base")
```

### 修改父模板的变量

```php
<!-- resources/views/public/base.blade.php -->

<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Base</title>
</head>
<body>

<h1>
    <!-- 定义"content"变量,默认值为"default content",子模版可以修改这个变量 -->
    @yield("content", "default content")
</h1>

</body>
</html>
```

```php
<!-- resources/views/test.blade.php -->

@extends("public.base")

<!-- 修改父模板的"content"变量 (方法1) -->
@section("content", "hello world")

<!-- 修改父模板的"content"变量 (方法2) -->
@section("content")
    <p>hello world</p>
@endsection
```

### 修改父模板的结构

```php
<!-- resources/views/public/base.blade.php -->

<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Base</title>
</head>
<body>

<!-- 定义"content"结构,默认值为"default content",子模版可以修改这块结构 -->
@section("content")
    <p>default content</p>
@show

</body>
</html>
```

```php
<!-- resources/views/test.blade.php -->

@extends("public.base")

<!-- 修改父模板的"content"结构 -->
@section("content")
    <!-- 直接覆盖父模板的结构 -->
    <p>hello world</p>
@endsection

@section("content")
    <!-- 继承父模板的结构 -->
    @parent
    <!-- 添加结构 -->
    <p>hello world</p>
@endsection
```

## 其他操作

### {!! !!}

- `{{ }}` 展示的数据会被自动转义以防范 XSS 攻击 (比如: `&` 会被转译成 `$amp;`)
- `{!! !!}` 展示的数据不会被转义,即展示的数据还是原数据

```php
{{$msg}}
<!-- 转义之后的: &amp; -->

{!! $msg !!}
<!-- 没有转移的: & -->
```

### @json()

```php
<!-- Error 无法展示数组类型的数据 -->
{{$person}}


<!--
    将数组格式的数据转成json格式的数据
        {"name":"sun","age":18,"job":{"type":"java engineer","sal":"50k"}}
-->
@json($person)


<!--
    将数组格式的数据转成json格式的数据,并格式化
        {
            "name": "sun",
            "age": 18,
            "job": {
                "type": "java engineer",
                "sal": "50k"
            }
        }
-->
@json($person, JSON_PRETTY_PRINT)
```

### 禁止解析模板

- `{{ }}` 包含的部分会解析模板
- `@{{ }}` 包含的部分不会解析模板
- `@verbatim 和 @endverbatim` 包含的部分都不会解析模板

```php
{{$msg}}
<!-- hello world -->

@{{$msg}}
<!-- @{{$msg}} -->

@verbatim
    @{{msg}}
    @{{name}}
    @{{num}}
@endverbatim
    <!--
        @{{msg}}
        @{{name}}
        @{{num}}
    -->
```

### 全局变量

```php
// App/Providers/AppServiceProviders.php

class AppServiceProvider extends ServiceProvider {
    // 定义全局变量
    public function boot() {
        view()->share("msg", "hello world");
    }
}
```

```php
<!-- 所有的模板都可以直接使用这个变量 -->
msg: {{$msg}}
```

# 会话技术

## Cookie

```php
Route::get("/index", function (Request $request) {
    // 判断cookie是否存在
    $result = Cookie::has("XSRF-TOKEN");
    // 获取Cookie
    $result = Cookie::get("XSRF-TOKEN");
    // 获取Cookie,并设置默认值
    $result = Cookie::get("name", "sun");
    // 存储cookie,直接存储
    Cookie::queue("name", "sun", 10); // key为"name",value为"sun",存储10分钟
    // 存储cookie,先定义,后存储
    $cookie = cookie("name", "sun", 10);
    Cookie::queue($cookie);
}
```

```php
// 存储的cookie默认都是进行加密处理的,我们可以在这里配置哪些cookie不进行加密处理

// App/Http/Middleware

class EncryptCookies extends Middleware {
    // 排除哪些cookie不进行加密
    protected $except = [
        "name"
    ];
}
```

## Session

```php
Route::get("/index", function (Request $request) {
    // 判断session是否存在
    $result = Session::has("name");

    // 获取session
    $result = Session::get("_token");

    // 获取session,并设置默认值
    $result = Session::get("_name", function () {
        return "no session name";
    });

    // 获取所有的session
    $result = Session::all();

    // 存储session
    Session::put("name", "sun");

    // 存储session,按照对象的格式存储
    Session::put("person.name", "sun");

    // 存储session,按照数组的格式存储
    Session::push("nameList", "sun");
    Session::push("nameList", "xue");
    Session::push("nameList", "cheng");

    // 存储session,该session只能被获取一次,获取之后自动删除,又称为"闪存数据"
    Session::flash("name", "sun");

    // 规定本次请求获取的所有闪存数据不会被删除
    Session::reflash();

    // 规定本地请求获取name闪存数据不会被删除,其他的照样会删除
    Session::keep(["name"]);

    // 删除session
    Session::forget("name");

    // 删除多个session
    Session::forget(["name", "age"]);

    // 删除单个session,并返回删除的是什么session
    $result = Session::pull("name");

    // 删除所有session
    Session::flush();

    // 重新构建SessionId (浏览器存储的是SessionId,服务器根据SessionId找到对应的Session)
    Session::regenerate();
}
```

# 模型策略

## 创建模型策略

- 概述: 当要操作某一个数据模型时,可以通过模型策略,对该模型进行验证操作
    - 如果符合要求,就会继续执行后面的操作
    - 如果不符合要求,就会终止操作,重定向到其他的路由

```bash
# 创建模型策略
php artisan make:policy 模型策略名 --model=模型名
```

```php
// App/Policies/UserPolicy.php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy {
    use HandlesAuthorization;

    public function viewAny(User $user) {}

    public function view(User $user, User $model) {}

    public function create(User $user) {}

    public function update(User $user, User $model) {}

    public function delete(User $user, User $model) {}

    public function restore(User $user, User $model) {}

    public function forceDelete(User $user, User $model) {}
}
```

## 配置模型策略

```php
// App/Providers/AuthServiceProvider.php

use App\Policies\UserPolicy;

class AuthServiceProvider extends ServiceProvider {
    protected $policies = [
        // 给User模型配置UserPolicy模型策略
        "App\Models\User" => UserPolicy::class
    ];
}
```

## 编写模型策略

```php
class UserPolicy {
    use HandlesAuthorization;

    public function update(User $user, User $model) {
        // $user是当前登录的账户(通过auth存储到session中的账户),$model是进行验证的账户

        // 判断当前登录的账户和进行验证的账户的id是否相同
        return $user->id == $model->id;
    }
}
```

## 调用模型策略

```php
public function edit(User $user) {
    // 在跳转到修改账户页面前,调用User模型的UserPolicy模型策略,对账户进行验证
    // $user传给了upate(User $user, User $model)的第二个参数$model
    $this->authorize("update", $user);
    return view("user.edit", compact("user"));
}
```

## 模型策略的模板

```php
<!-- 如果不符合update模型策略,就不会显示该模板里的内容 -->
@can("update", $user)
    <a href="{{route('users.edit', $user)}}">修改用户信息</a>
@endcan
```

# 发送邮件

## 配置邮件

```php
MAIL_MAILER=smtp
MAIL_HOST=smtp.qq.com
MAIL_PORT=587
MAIL_USERNAME=3040069606@qq.com
MAIL_PASSWORD=acefxvlrmrmbdchh # 发送者的邮箱的授权码,需要去邮箱官网获取
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=3040069606@qq.com
MAIL_FROM_NAME="${App_NAME}"
```

## 创建邮件

```bash
# 创建邮件
php artisan make:mail 邮件名
```

```php
// App/Mail/RegMail.php

namespace App\Mail;

class RegMail extends Mailable {
    use Queueable, SerializesModels;

    public $user;

    // 在构造器中接受$user
    public function __construct($user) {
        this->user = $user;
    }

    // 创建邮件(默认调用)
    public function build() {
        // 跳转到mail.reg模板
        return $this->view('mail.reg', compact($this->user));

        // 效果和上面一样,可以不用传递,默认会传递$this->user
        return $this->view('mail.reg');
    }
}
```

## 编写邮件模板

```php
<!-- resources/views/mail/reg.blade.php -->

username: {{$user["username"]}}
email_token: {{$user["email_token"]}}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202209052001287.png)

## 发送邮件

```php
// 获取一个账户的数据模型(需要有email字段)
$user = User::where("id", "3")->first();

// 发送邮件给该$user账户,同时将$user作为参数传递给RegMail()构造器
\Mail::to($user)->send(new RegMail($user));
```

# 模型事件

## 创建模型事件

- 模型事件: 类似于生命周期函数的概念
- laravel 定义了 10 个模型事件: creating, created, updating, updated, saving, saved, deleting, deleted, restoring, restored

```php
// App/Observer/UserObserver.php

namespace App\Observer;

use App\Models\User;
use Illuminate\Support\Str;

class UserObserver {
    // 当创建数据模型时,就会执行
    public function creating(User $user) {
        $user->email_token = Str::random(10);
        $user->email_active = 0;
    }
}
```

## 绑定模型事件

```php
// App/Providers/AppServiceProvider.php

namespace App\Providers;

use App\Models\User;
use App\Observer\UserObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider {
    public function boot() {
        \Schema::defaultStringLength(191);

        // 给User模型绑定UserObserver类中的事件
        User::observe(UserObserver::class);
    }
}
```

# 通知

## 创建通知

```bash
# 创建通知
php artisan make:notification 通知名
```

```php
// App/Notifications/RetrievePasswordNotify.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RetrievePasswordNotify extends Notification {
    use Queueable;

    public function __construct() {}

    public function via($notifiable) {
        return ['mail'];
    }

    public function toMail($notifiable) {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our Application!');
    }

    public function toArray($notifiable) {
        return [];
    }
}
```

## 编写通知

```php
class RetrievePasswordNotify extends Notification {
    use Queueable;

    public $token;

    // 在构造器中接受$token,并保存下来
    public function __construct($token) {
        $this->token = $token;
    }

    public function via($notifiable) {
        return ['mail'];
    }

    // 配置邮件通知的内容
    public function toMail($notifiable) {
        return (new MailMessage)
            // 主题
            ->subject('retrieve password')
            // 问候
            ->greeting('please complete the operation')
            // 一行文本
            ->line('点击链接重置密码')
            // 按钮,点击了该按钮后会跳转到ReterievePasswordEdit路由,并且携带该账户的token作为参数
            ->action('重置密码', url(route('RetrievePasswordEdit', $this->token)))
            // 一行文本
            ->line('感谢使用该网站');
    }

    public function toArray($notifiable) {
        return [
        ];
    }
}
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202209052001288.png)

## 发送通知

```php
public function send(Request $request) {
    // 根据email查询到指定账户的数据模型
    $user = User::where('email', $request->input('email'))->first();
    // 发送通知给该账户,并且将用户的token值作为参数传递给构造器
    \Notification::send($user, new RetrievePasswordNotify($user->email_token));
}
```

## 自定义通知模板

```bash
# 输入后,会自动生成resources/views/vendor/notifications/email.blade.php模板,这个模板就是发送的通知模板,我们可以修改
php artisan vendor:publish --tag=laravel-notifications
```

```php
@component('mail::message')
{{-- Greeting --}}
@if (! empty($greeting))
# {{ $greeting }}
@else
@if ($level === 'error')
# @lang('Whoops!')
@else
# @lang('Hello!')
@endif
@endif

{{-- Intro Lines --}}
@foreach ($introLines as $line)
{{ $line }}

@endforeach

{{-- Action Button --}}
@isset($actionText)
<?php
    switch ($level) {
        case 'success':
        case 'error':
            $color = $level;
            break;
        default:
            $color = 'primary';
    }
?>
@component('mail::button', ['url' => $actionUrl, 'color' => $color])
{{ $actionText }}
@endcomponent
@endisset

{{-- Outro Lines --}}
@foreach ($outroLines as $line)
{{ $line }}

@endforeach

{{-- Salutation --}}
@if (! empty($salutation))
{{ $salutation }}
@else
@lang('Regards'),<br>
{{ config('App.name') }}
@endif

{{-- Subcopy --}}
@isset($actionText)
@slot('subcopy')
@lang(
    "If you're having trouble clicking the \":actionText\" button, copy and paste the URL below\n".
    'into your web browser:',
    [
        'actionText' => $actionText,
    ]
) <span class="break-all">[{{ $displayableActionUrl }}]({{ $actionUrl }})</span>
@endslot
@endisset
@endcomponent
```

# 表单操作

## 表单验证

### 快速验证

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719274.png)

- 如果账号和密码输入的不合规范,就提示相应的错误信息

```php
// web.php

use Illuminate\Http\Request;

Route::view("/form", "form");

Route::post("/receive", function (Request $request) {
    // 验证表单数据,如果表单没有验证成功,就会重定向到form表单页面,$result就是验证之后的表单数据
    $result = $request->validate([
        // 限定username的长度范围为[3, 6]
        "username" => "required|min:3|max:6",
        // 限定password的长度范围为[6,+∞]
        "password" => "required|min:6"
    ]);

    // 操作表单数...
    dd($result);

    return "验证通过";
});
```

```php
<!-- resources/views/form.blade.php -->

<!-- 我们可以在表单验证错误后,重新返回到表单页面时,展示错误信息 -->

<!-- 遍历展示错误信息 -->
@if($errors->any())
    @foreach($errors->all() as $error)
        <p>{{$error}}</p>
    @endforeach
@endif

<!-- 单独展示错误信息 -->
@error("username")
    <p>账户错误,{{$message}}</p>
@enderror
@error("password")
    <p>密码错误,{{$message}}</p>
@enderror

<!-- bootstrap样式的错误信息 -->
@if(count($errors)>0)
    <div class="alert alert-warning mt-2" role="alert">
        @foreach($errors->all() as $error)
            <li>{{$error}}</li>
        @endforeach
    </div>
@endif
```

### 验证类

- 验证类: 将表单数据的验证操作专门放在这个类中
- 创建指令: php artisan make:request 验证类名

```php
// App/Http/Requests/LoginForm 验证类

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginForm extends FormRequest {
    // 控制是否开启表单类的验证
    public function authorize() {
        // 开启
        return true;
    }

    // 验证表单数据,如果表单没有验证成功,就会重定向到form表单页面
    public function rules() {
        return [
            // 限定username的长度范围为[3, 6]
            "username" => "required|min:3|max:6",
            // 限定password的长度范围为[6,+∞]
            "password" => "required|min:6"
        ];
    }

    // 更改表单验证信息提示 (比如: 默认为 "The username must be at least 3 characters" -> 更改为 "账户不得小于3位"
    public function messages() {
        return [
            // 继承父类的表单验证信息提示
            parent::messages(),
            "username.required" => "账户不得为空",
            "username.min" => "账户不得小于3位",
            "username.max" => "账户不得大于6位",
            "password.required" => "密码不得为空",
            "password.min" => "密码不得小于6位"
        ];
    }

    /*
        lang/en/validation.php中存储着所有的提示信息,而他的格式都是这样的
            'accepted' => 'The :attribute must be accepted.'
        如果"username"出现了该错误,":attribute"就会变成"username",提示
            "The username must be accepted"
        我们这里可以修改"username"为"用户名", 提示
            "The 用户名 must be accepted"
        后续引入了中文的提示包,就可以达到这样的效果
            "用户名必须被接受"
        在生产环境中,我们都是使用的attributes(),不会使用messages()的
    */
    public function attributes() {
        // return parent::attributes(); // TODO: Change the autogenerated stub

        return [
            "username" => "用户名"
        ];
    }
}
```

```php
// web.php

use App\Http\Requests\LoginForm;

Route::view("/form", "form");

Route::post("/receive", function (LoginForm $loginForm) {
    // 创建LoginForm的实例对象,调用validated()验证表单,$result就是验证之后的表单数据
    $result = $loginForm->validated();

    // 操作表单数...
    dd($result);
    return "验证通过";
});
```

```php
<!-- resources/views/form.blade.php -->

<!-- 遍历展示错误信息 -->
@if($errors->any())
    @foreach($errors->all() as $error)
        <p>{{$error}}</p>
    @endforeach
@endif

<form action="/receive" method="post">
    @csrf
    账户: <input type="text" name="username" value="old('username')">
    密码: <input type="password" name="password" value="old('password')">
    <input type="submit">
</form>
```

### 常用验证规则

```php
// App/Http/Requests/LoginForm 验证类

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Database\Query\Builder;

class LoginForm extends FormRequest {
    // 验证表单的规则
    public function rules() {
        return [
            // 限定长度范围为[3, 6]
            "username" => "required|min:3|max:6",
            // 如果填写了username,就进行后续的表单验证,如果没有填写,就不进行表单验证了
            "username" => "nullable|min:3|max:6",
            // 限定由 字母,数字,"-","_" 构成
            "username" => "required|alpha_dash",
            // 限定长度范围为[3,6]
            "username" => "required|between:3,6",
            // 限定长度为6
            "username" => "required|size:6",
            // 限定符合email格式
            "username" => "required|email",
            // 限定必须唯一,查询users表的username字段,如果有相同的就不符合
            "username" => "required|unique:users",
            // 限定username与password不同
            "username" => "required|different:password",
            // 限定密码和密码确认必须相同,密码确认的输入框必须固定name属性为"password_confirmation",比如: <input type "password" name="password_confirmation">
            "password" => "required|confirmed",
            // 限定为ip地址格式
            "username" => "required|ip",
            // 限定json格式
            "username" => "required|json",
            // 限定为"tom"或"jack"或"king"
            "username" => "required|in:tom,jack,king",
            // 限定不为"tom"或"jack"或"king"
            "username" => "required|notIn:tom,jack,king",

            // 限定必须唯一,查询users表的username字段,如果有相同的就不符合
            "username" => Rule::unique("users");

            // 限定username不能为users表中id=19的记录的username
            "username" => Rule::unique("users")->where(function (Builder $builder) {
                $builder->where("id", 19);
            })
        ];
    }
}
```

## 获取表单数据

### 判断表单参数

```php
use Illuminate\Http\Request;

Route::get("/test", function (Request $request) {
    // 判断是否有'username'参数,返回一个boolean
    $result = $request->has('username');
};
```

### 获取 get 请求的参数

```php
<form action="/test" method="get">
    账户: <input type="text" name="username">
    密码: <input type="password" name="password">
    <input type="submit">
</form>
```

```php
use Illuminate\Http\Request;

Route::get("/test", function (Request $request) {
    // 获取指定参数
    $result = $request->get("username");
    // 获取指定参数,如果没有就赋默认值
    $result = $request->get("username", "default_username");
};
```

### 获取 post 请求的参数

```php
<form action="/test" method="post">
    @csrf
    账户: <input type="text" name="username">
    密码: <input type="password" name="password">
    <input type="submit">
</form>
```

```php
use Illuminate\Http\Request;

Route::post("/test", function (Request $request) {
    // 获取全部参数
    $result = $request->post();
    // 获取指定参数
    $result = $request->post("username");
    // 获取指定参数,如果没有就赋默认值
    $result = $request->post("username", "default_username");
};
```

### 获取数组格式的参数

```php
<!-- resources/views/form.blade.php -->
<form action="/test" method="get">
    <input type="checkbox" name="select[][a]">
    <input type="checkbox" name="select[][b]">
    <input type="checkbox" name="select[][c]">
    <input type="submit">
</form>
```

```php
use Illuminate\Http\Request;

Route::get("/index", function (Request $request) {
    return view("form");
});

Route::get("/test", function (Request $request) {
    $result = $request->input(); // {"select":{"a":"on","b":"on","c":"on"}}

    $result = $request->input("select.1.b"); // on
});
```

## 其他操作

### 表单的旧值

```php
<form action="/receive" method="post">
    @csrf
    <!--
        当表单验证错误后,重新回到该页面,输入框里的数据会默认丢失,不方便用户再次验证
        我们可以通过value="old()"来让输入框再显示上一次输入错误时的数据
    -->
    账户: <input type="text" name="username" value="{{old('username')}}">
    密码: <input type="password" name="password" value="{{old('password')}}">
    备注: <textarea name="content">{{old('content')}}</textarea>
    <input type="submit">
</form>
```

# CSRF 令牌防护

## 配置令牌防护

```php
// App/Http/Kernel.php

protected $middlewareGroups = [
    'web' => [
        \App\Http\Middleware\VerifyCsrfToken::class, // 只要注释掉,就关闭了CSRF令牌防护
    ],
];
```

## 基本使用

```html
<!-- resources/view/form.balde.php -->

<!--
    表单采用post提交方式,直接提交,会报419的错误
        这是为了避免跨站请求伪造攻击,laravel给表单的提供了一个CSRF令牌防护,路由接请求时需要进行验证令牌是否正确
-->
<form action="/getForm" method="post">
    <!-- 我们提交表单时,需要一块提交令牌,供路由验证 (添加如下代码即可) -->
    <input name="_token" value="{{csrf_token()}}" />

    <button type="submit">提交</button>
</form>

<!--
    laravel默认只给post提交方式提供了CSRF令牌防护,而当我们需要给其他的提交方式也添加CSRF令牌防护时,可以采用伪造技术
-->
<!-- form表单采用post提交方式,让路由接受请求时进行令牌验证 -->
<form action="/getForm" method="post">
    <!-- 提交令牌,供路由验证 -->
    <input name="_token" value="{{csrf_token()}}" />
    <!-- 修改成其他的提交方式 (添加如下代码即可) -->
    <input type="hidden" name="_method" value="GET" />

    <button type="submit">提交</button>
</form>

<!-- 简化书写 -->
<form action="/getForm" method="post">
    <!-- csrf令牌输入框的简化书写 -->
    @csrf
    <!-- 提交方式输入框的简化书写 -->
    @method('GET')
    <button type="submit">提交</button>
</form>
```

```php
// web.php

Route::get("/form", function () {
    return view("form");
});

use Illuminate\Support\Facades\Request;

Route::post("/getForm", function () {
    return Request::method();
});
```

## CSRF 白名单

```php
/*
    可以将某些的路由加入CSRF白名单,这样该路由在接收到post提交方式时,就不会对其进行CSRF令牌验证
*/

// App/Http/Middleware/VerifyCsrfToken.php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware {
    // 排除排除哪些路由提交的表单不需要进行CSRF令牌验证,即白名单
    protected $except = [
        // 排除"/api/*"路由 ("*"表示全部)
        "/api/*",
    ];
}
```

```html
<!-- "/task/getForm"路由没有加入白名单,提交时需要进行CSRF令牌验证 -->
<form action="/task/getForm" method="post">
    <input type="submit" />
</form>

<!-- "/api/getForm"路由加入了白名单,提交时不需要进行CSRF令牌验证 -->
<form action="/api/getForm" method="post">
    <input type="submit" />
</form>
```

# 调试工具

## tinker

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202209052001289.png)

- 可以在 tinker 中执行一些简单的 php 代码,不需要我们再去项目中调试,协助我们开发
- 开启进入 tinker 的指令 `php artisan tinker`

## debugbar调试器

### 基础安装

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719275.png)

- 可以使用 debugbar 调试器协助我们开发

```bash
# 安装debugbar
composer require barryvdh/laravel-debugbar

# 生成debugbar的配置文件
php artisan vendor:publish --provider="Barryvdh\Debugbar\ServiceProvider"
```

### 配置文件

```php
// config/debugbar.php

return [
    // "null" 开启 debugBar, "false" 关闭 debugBar
    'enabled' => env('DEBUGBAR_ENABLED', null),

    'collectors' => [
        'phpinfo'         => true,  // Php version
        'messages'        => true,  // Messages
        'time'            => true,  // Time Datalogger
        'memory'          => true,  // Memory usage
        'exceptions'      => true,  // Exception displayer
        'log'             => true,  // Logs from Monolog (merged in messages if enabled)
        'db'              => true,  // Show database (PDO) queries and bindings
        'views'           => true,  // Views with their data
        'route'           => true,  // Current route information
        'auth'            => false, // Display Laravel authentication status
        'gate'            => true,  // Display Laravel Gate checks
        'session'         => true,  // Display session data
        'symfony_request' => true,  // Only one can be enabled..
        'mail'            => true,  // Catch mail messages
        'laravel'         => false, // Laravel version and environment
        'events'          => false, // All events fired
        'default_request' => false, // Regular or special Symfony request logger
        'logs'            => false, // Add the latest log messages
        'files'           => false, // Show the included files
        'config'          => false, // Display config settings
        'cache'           => false, // Display cache events
        'models'          => true,  // Display models
        'livewire'        => true,  // Display Livewire (when available)
    ]
]
```

### 展示信息

```php
// web.php

use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    // 展示普通信息
    DebugBar::info("hello world");
    // 展示警告信息
    Debugbar::warning("hello world");
    // 展示错误信息
    Debugbar::error("hello world");

    return view("test");
});
```

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719276.png)

# 扩展部分

## 签名 url

```php
use Illuminate\Http\Request;

Route::get("/index/test", function (Request $request) {
    /*
        signedRoute(参数1, 参数2) 生成 签名url
            参数1: 目标路由的别名(要求该路由已定义)
            参数2: 给路由传递的参数
        签名url: 带有signature参数的url (signature是一传字符串,可以用来唯一标识一个url)
            http://127.0.0.1:8000/test/sun?signature=e9ded285acd97199f9fb0e74d1a9...
    */
    $result = url()->signedRoute("testRoute", ["name" => "sun"]);
    return redirect()->to($result);

    // 注: url() 和 URL 都可以调用方法 (比如: URL::full(), URL::current(), URL::signedRoute()...)
});

// 给test路由起别名为"testRoute"
Route::get("/test/{name}", function (Request $request) {
    // 判断请求中的signature是否正确,
    if ($request->hasValidSignature()) {
        return "正确";
    } else {
        return "错误";
    }
})->name("testRoute");
```

## 依赖注入

```php
use App\Http\Controllers\TestController;

// 原先创建控制器对象
Route::get("/index", function () {
    $test = new TestController();
    return $test->show();
});

// 通过依赖注入创建控制器对象
Route::get("/index", function (TestController $test) {
    return $test->show();
});
```

## 分页

```php
use Illuminate\Pagination\Paginator;

Route::get("/test", function () {
    // 让Paginator使用bootstrap的样式
    Paginator::useBootstrap();

    // 每5条数据分一页,不显示数字链接,只显示左右箭头链接
    $users = User::simplePaginate(5);

    // 每5条数据分一页,显示数字链接
    $users = User::paginate(5);
    // $users = DB::table("users")->paginate(5); // 构造器写法


    // 点击分页跳转按钮后,发送的url请求中携带参数sort=id
    $users->Appends(["sort" => "id"]);

    // 点击分页跳转按钮后,重定向到"/index"路由
    $users->withPath("/index");

    /*
        允许添加参数到url链接中,比如: 请求url为"http://127.0.0.1:8000/test?page=1"
            - 原先添加参数到url中是不起作用的,即使添加了参数,点击分页跳转按钮后,也会被清除
            - 开启了这个之后,就可以添加各种参数,点击分页跳转按钮后,会帮我们整合好,不会被清除
                "http://127.0.0.1:8000/test?page=1&name=sun"
    */
    $users->withQueryString();

    // 跳转到test页面,并且传递users参数
    return view("test", [
        "users" => $users
    ]);
});
```

```php
<!-- resources/views/test.blade.php -->

<table>
    <tr>
        <th>id</th>
        <th>username</th>
        <th>gender</th>
    </tr>
    @foreach($users as $user)
        <tr>
            <td>{{$user->id}}</td>
            <td>{{$user->username}}</td>
            <td>{{$user->gender}}</td>
        </tr>
    @endforeach
</table>

<!-- 分页导航条 -->
{{$users->links()}}

<!--
    默认展示前3个分页链接,比如: 当前在第17页
        < 1, 2 ... 14, 15, 16, 17, 18, 19, 20 ... 115, 116 >
    修改为前后展示1个分页链接,比如: 当前在第17页
        < 1, 2 ... 16, 17, 18 ... 115, 116 >
    如果分的页比较少,他会自动尽可能多的展示分页链接,并不是按照上面的规矩
-->
{{$users->onEachSides(1)->links()}}
```

## 加密处理

```php
// 一般接收到密码之类较为隐私的数据,在存储到数据库之前需要进行加密处理

use Illuminate\Http\Request;

Route::post("/test", function (Request $request) {
    echo $request->post("password"); // 111
    // 加密处理
    echo $request->bcrypt(post("password")); // $2y$10$pb97emknMVn...
}
```

## Auth

Auth 是 laravel 提供的一个工具类,用于身份认证,可以在`config/auth.php`中进行配置

```php
// 判断当前用户是否未登录,返回一个boolean
Auth::check()

// 登录账号,需要指定用户名和密码,保存session,返回一个boolean
Auth::attempt(['username' => $username, 'password' => $password]，true) // 参数1: 认证参数, 参数2: 记住我功能

// 登录账户,需要指定数据模型,保存session
Auth::login(User::find(1), $remember = false);

// 退出账户,清除session
Auth::logout();

// 如果登录了账户后,可以直接调用此方法查询到该账户的记录
Auth::user()
```

```php
@auth
    <h1>已登录显示</h1>
@else
    <h1>未登录显示</h1>
@endauth
```

## 闪存

闪存中的数据只要访问一次后,就会立即删除

```php
// 保存一个 sussess=>"操作成功" 的数据到闪存中
session()->flash("success", "操作成功");
```

# 相关指令

## laravel

```bash
# 查看laravel的版本
php artisan --version

# 创建最新版本的laravel项目
laravel new 项目名

# 创建指定版本的laravel项目
composer create-project --prefer-dist laravel/laravel 项目名 8.x

# 运行框架
php artisan serve

# 清除缓存
php artisan config:cache
```

## route

```bash
# 查看 可用的路由 和 路由的命名
php artisan route:list
```

## plugins

```bash
# laravel的代码提示插件laravel-ide-helper
composer require barryvdh/laravel-ide-helper

# 为 Facades 生成注释 (先安装laravel-ide-helper)
php artisan ide-helper:generate

# 为 models 生成注释 (先安装laravel-ide-helper)
php artisan ide-helper:models
```

## controller

```bash
# 创建普通控制器
php artisan make:controller 控制器名

# 创建单行为控制器
php artisan make:controller 控制器名 --invokable

# 创建普通资源控制器
php artisan make:controller 控制器名 --resource

# 创建api资源控制器
php artisan make:controller 控制器名 --api

# 创建模型资源控制器
php artisan make:controller 控制器名 --resource --model=模型名
```

## model

```bash
# 创建模型
php artisan make:model 模型名

# 创建模型 + 指定创建目录
php artisan make:model 目录1/目录2/模型名
php artisan make:model /App/Models/目录1/目录2/模型名

# 创建模型 + 生成数据迁移
php artisan make:model --migration 模型名

# 创建模型 + 生成模型工厂
php artisan make:model --factory 模型名

# 创建模型 + 生成数据填充
php artisan make:model --seed 模型名

# 创建模型 + 生成控制器
php aritsan make:model --controler 模型名

# 创建模型 + 生成数据迁移(-m) + 生成模型工厂(-f) + 生成数据填充(-s) + 生成控制器(-c)
php artisan make:model -mfsc
```

## middleware

```bash
# 创建中间件
php artisan make:middleware 中间件名
```

## policy

```bash
# 创建模型策略
php artisan make:policy 模型策略名 --model=模型名
```

## notification

```bash
# 创建通知
php artisan make:notification 通知名
```

## seeder

```php
# 创建数据迁移的模型
php artisan make:seeder 数据迁移的模型名
```

## migrate

```bash
php artisan make:migration --create=表名 文件名

# 数据迁移
php artisan migrate

# 迁移数据 + 重置数据表(可以重置主键)
php artisan migrate:refresh

# 迁移数据 + 重置数据表(可以重置主键) + 调用seeder填充数据
php artisan migrate:refresh --seed
```

## request

```bash
# 创建验证类
php artisan make:request 验证类名
```

# 问题处理

## mysql 字符集

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202205161719277.png)

```php
// config/database.php

return [
    'connections' => [
        'mysql' => [
            'charset' => 'utf8',
            'collation' => 'utf8_unicode_ci',
        ],
    ]
]
```

## 分页样式

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202209052001290.png)

```php
use Illuminate\Pagination\Paginator;

class UserController extends Controller {
    public function index() {
        // 让Paginator使用bootstrap的样式
        Paginator::useBootstrap();

        $users = User::paginate(5);
        return view("user.index", [
            "users" => $users
        ]);
    }
}
```

## 自动跳转到login路由

在没有登录账户时,执行一些需要登录账户的操作,就会自动跳转到login路由,让用户登录账户

```php
// App/Http/Controllers/Middleware/Authenticate.php

class Authenticate extends Middleware {
    protected function redirectTo($request) {
        if (!$request->expectsJson()) {
            // 可以修改成其他的路由
            return route('login');
        }
    }
}
```

# 项目功能实现

## 查看数据

```php
Route::resource("users", UserController::class);
```

```php
<!-- 跳转到users.show路由,同时传递$user参数 -->
<a href="{{route('users.show', $user)}}">查看数据</a>
```

```php
// App/Http/Controllers/UserController.php

class UserController extends Controller {
    public function show(User $user) {
        // 跳转到user.show模板,同时传递$user参数
        return view('user.show', compact('user'));
    }
}
```

```php
// resources/views/user/show.blade.php

编号: {{$user->id}}
用户名: {{$user->username}}
邮箱: {{$user->email}}
```

## 添加数据

```php
Route::resource("users", UserController::class);
```

```html
<!-- 跳转到users.create路由-->
<a href="{{route('users.create')}}">登录</a>
```

```php
// App/Http/Controllers/UserController.php

class UserController extends Controller {
    public function create() {
        // 跳转到user.create模板
        return view('user.create');
    }
}
```

```html
<!-- 跳转到users.store路由 -->
<form action="{{route('users.store')}}" method="post">
    <!-- csrf防护 -->
    @csrf
    <div class="card">
        <div class="card-header">
            用户注册
        </div>
        <div class="card-body">
            <div class="form-group">
                <label>昵称</label>
                <input type="text" class="form-control" name="username" value="{{old("username")}}">
            </div>
            <div class="form-group">
                <label>邮箱</label>
                <input type="text" class="form-control" name="email" value="{{old("email")}}">
            </div>
            <div class="form-group">
                <label>密码</label>
                <input type="password" class="form-control" name="password">
            </div>
            <div class="form-group">
                <label>确认密码</label>
                <input type="password" class="form-control" name="password_confirmation">
            </div>
        </div>
        <div class="card-footer text-muted">
            <button type="submit" class="btn btn-success">注册</button>
        </div>
    </div>
</form>
```

```php
// App/Http/Controllers/UserController.php

class UserController extends Controller {
    public function store(Request $request) {
        // 验证表单数据
        $data = $request->validate([
            'username' => 'required|min:3|max:10',
            'password' => 'required|min:5|confirmed',
            'email' => 'required|unique:users|email'
        ]);
        // 添加数据
        $data["password"] = bcrypt($data["password"]);
        $user = User::create($data);
        // 重定向到home路由
        return redirect()->route('home');
    }
}
```


## 修改数据

```php
Route::resource("users", UserController::class);
```

```php
// App/Policies/UserPolicy.php

class UserPolicy {
    // 管理员可以修改任意账户信息,其他账户只可以修改自己的账户信息
    public function update(User $user, User $model) {
        return $user->is_admin || $user->id == $model->id;
    }
}
```

```html
<!-- 跳转到users.edit路由,并且传递$user参数-->
<a href="{{route('users.edit', $user)}}">查看数据</a>
```

```php
// App/Http/Controllers/UserController.php

class UserController extends Controller {
    public function edit(User $user) {
        // 验证模型策略
        $this->authorize('update', $user);
        // 跳转到user.show模板,同时传递$user参数
        return view('user.edit', compact('user'));
    }
}
```

```html
<!-- resources/views/user/edit.blade.php -->

<!-- 跳转到users.update路由,同时传递$user参数 -->
<form action="{{route('users.update', $user)}}" method="post">
    <!-- csrf防护 + 伪造表单(资源控制器的update路由是接受put类型的请求) -->
    @csrf
    @method("PUT")
    <div class="card">
        <div class="card-header">
            修改信息
        </div>
        <div class="card-body">
            <div class="form-group">
                <label>昵称</label>
                <input type="text" class="form-control" name="username" value="{{$user['username']}}">
            </div>
            <div class="form-group">
                <label>密码</label>
                <input type="password" class="form-control" name="password">
            </div>
            <div class="form-group">
                <label>确认密码</label>
                <input type="password" class="form-control" name="password_confirmation">
            </div>
        </div>
        <div class="card-footer text-muted">
            <button type="submit" class="btn btn-success">确认修改</button>
        </div>
    </div>
</form>
```

```php
// App/Http/Controllers/UserController.php

class UserController extends Controller {
    public function update(Request $request, User $user) {
        // 验证表单数据
        $data = $request->validate([
            'username' => 'required|min:3|max:10',
            'password' => 'nullable|min:5|confirmed'
        ]);
        // 修改数据
        $user['username'] = $data['username'];
        if ($request->post('password')) {
            $user['password'] = bcrypt($data['password']);
        }
        $user->save();
        // 重定向到users.index路由
        return redirect()->route('users.index');
    }
}
```

```php
Route::resource("users", UserController::class);
```

## 删除数据

```php
Route::resource("users", UserController::class);
```

```php
// App/Policies/UserPolicy.php

class UserPolicy {
    // 管理员可以删除任意账户信息(不能删除自己的账户),其他账户没有删除的功能
    public function delete(User $user, User $model) {
        return $user->is_admin && $user->id != $model->id;
    }
}
```

```html
<!-- 验证模型策略,如果不符合策略,就不显示该删除功能 -->
@can("delete", $user)
    <!-- 通过form表单完成删除功能,跳转到users.show路由,同时传递$user参数 -->
    <form action="{{route('users.destroy', $user)}}" method="post">
        <!-- csrf防护 + 伪造表单(资源控制器的destroy路由是接受delete类型的请求) -->
        @csrf
        @method("DELETE")
        <button type="submit" class="btn btn-danger">删除</button>
    </form>
@endcan
```

```php
// App/Http/Controllers/UserController.php

class UserController extends Controller {
    public function destroy(User $user) {
        // 验证模型策略
        $this->authorize('delete', $user);
        // 删除数据
        $user->delete();
        // 重定向到users.index路由
        return redirect()->route('users.index');
    }
}
```

## 展示用户列表

```php
Route::resource("users", UserController::class);
```

```html
<!-- 跳转到users.index路由 -->
<a href="{{route('users.index')}}">查看数据</a>
```

```php
class UserController extends Controller {
    public function index() {
        // 查询数据
        $users = User::get();
        // 跳转到user.index模板,同时传递$users参数
        return view('user.index', compact('users'));
    }
}
```

```html
<!-- resources/views/user/index.blade.php -->

@foreach($users as $user)
    id: {{$user['id']}}
    username: {{$user['username']}}
@endforeach
```

## 导航栏的模板复用

```html
<!-- resources/views/layouts/default.blade.php -->

<div class="container">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="{{route('home')}}">首页</a>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item">
                    <a class="nav-link" href="{{route('users.index')}}">用户列表</a>
                </li>
            </ul>

            @if(auth()->user() && auth()->user()['username'])
                <ul class="nav">
                    <li class="nav-item">
                        <a class="nav-link disabled" href="#">{{auth()->user()['username']}}</a>
                    </li>
                </ul>
            @endif
            <form class="form-inline my-2 my-lg-0">
                @auth
                    <a href="{{route('logout')}}" class="btn btn-outline-success my-2 my-sm-0 mr-2">退出</a>
                    <a href="{{route('users.edit', auth()->user())}}"
                       class="btn btn-outline-success my-2 my-sm-0">修改</a>
                @else
                    <a href="{{route('login')}}" class="btn btn-success mr-2 my-sm-0">登录</a>
                    <a href="{{route('users.create')}}" class="btn btn-outline-success my-2 my-sm-0">注册</a>
                @endauth
            </form>
        </div>
    </nav>
    <!-- 让子模版插入到这里 -->
    @yield("content")
</div>
```

```html
<!-- resources/views/home.blade.php -->

@extends("layouts.default")

@section("content")
    <!-- -->
    <h1> home模板 </h1>
@endsection
```

## 提示信息

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202209052001291.png)

- 成功操作后,显示成功的提示信息
- 失败操作后,显示失败的提示信息
- 提示信息只显示一次,再次刷新后,提示信息就消失

```html
<div class="container">
    <h1>基础结构的模板</h1>
    @yield("content")

    <!-- 引入提示信息的模板 -->
    @include("layouts._message")
</div>
```

```html
<!-- resources/views/layout/_message.blade.php -->

<!-- 根据session()中存储的不同数据,来判断,是成功信息,还是错误信息 -->
@foreach(["success", "danger"] as $msg)
    @if(session()->has($msg))
        <!-- bootstrap的样式 -->
        <div class="alert alert-{{$msg}} mt-2">
            {{session()->get($msg)}}
        </div>
    @endif
@endforeach
```
```php
class HomeController extends Controller {
    public function home() {
        if (true) {
            session()->flash("success", "成功信息");
        } else {
            session()->flash("danger", "失败信息");
        }
    }
}
```

## 表单验证信息

```html
<div class="container">
    <h1>基础结构的模板</h1>
    @yield("content")

    <!-- 引入表单验证信息的模板 -->
    @include("layouts._validate")
</div>
```

```html
<!-- resources/views/layout/_validate.blade.php -->

@if(count($errors)>0)
    <!-- bootstrap的样式 -->
    <div class="alert alert-warning mt-2" role="alert">
        @foreach($errors->all() as $error)
            <li>{{$error}}</li>
        @endforeach
    </div>
@endif
```

## 登录账户

```php
Route::get('/login', [LoginController::class, 'login'])->name('login');
Route::post('/login', [LoginController::class, 'store'])->name('login');
```

```html
<!-- 跳转到login路由(get类型的请求)-->
<a href="{{route('login')}}">登录</a>
```

```php
// App/Http/Controllers/LoginController.php

class LoginController extends Controller {
    public function login() {
        // 跳转到login模板
        return view("login");
    }
}
```

```html
<!-- resources/views/login.blade.php -->

<!-- 跳转到login路由(post类型的请求-->
<form action="{{route('login')}}" method="post">
    @csrf
    <div class="card">
        <div class="card-header">
            登录
        </div>
        <div class="card-body">
            <div class="form-group">
                <label>邮箱</label>
                <input type="text" class="form-control" name="email">
            </div>
            <div class="form-group">
                <label>密码</label>
                <input type="password" class="form-control" name="password">
            </div>
            <div class="form-group">
                <a href="{{route('RetrievePasswordEmail')}}">找回密码</a>
            </div>
        </div>
        <div class="card-footer text-muted">
            <button type="submit" class="btn btn-success">登录</button>
        </div>
    </div>
</form>
```

```php
// App/Http/Controllers/LoginController.php

class LoginController extends Controller {
    public function store(Request $request) {
        // 验证表单数据
        $data = $request->validate([
            "email" => "required|email",
            "password" => "required|min:5"
        ]);
        // 登录账户
        if (\Auth::attempt($data)) {
            // 登录成功,跳转到home路由
            return redirect()->route("home");
        } else {
            // 登录失败,后退路由
            session()->flash("danger", "登录失败");
            return back();
        }
    }
}
```

## 游客账户的权限

- 没有登录的账户,不可以访问数据表的增删改功能
- 只有没有登录的账户,才可以访问登录功能和注册功能,即登录过的账户,就不可以访问登录功能和注册功能了

```php
class UserController extends Controller {
    public function __construct() {
        // 只有登录的账户才可以访问UserController里的所有方法,而没有登录的账户只可以访问except排除的方法
        $this->middleware("auth", [
            "except" => ["index", "show", "create", "store"]
        ]);

        // 只有没有登录的账户,才可以访问这些方法
        $this->middleware("guest", [
            "only" => ["create", "store"]
        ]);
    }
}
```

## 邮件验证

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202209052001292.png)

- 用户注册也买你,点击"注册",发送邮件给该账户的邮箱
- 接收者邮箱的邮件,点击邮件里的链接,跳转到 confirmEmailToken 路由,进行身份验证

```php
// App/Http/Controllers/UserController.php

class UserController extends Controller {
    // 注册账户
    public function store(Request $request) {
        $data = $request->validate([
            "username" => "required|min:3|max:10",
            "password" => "required|min:5|confirmed",
            "email" => "required|unique:users|email"
        ]);
        $data["password"] = bcrypt($data["password"]);
        $user = User::create($data);
        // 发送邮件给$user
        \Mail::to($user)->send(new RegMail($user));
        session()->flash("success", "请查看邮箱,完成注册验证");
        return redirect()->route('home');
    }
}
```

```php
// App/Mail/RegMail

class RegMail extends Mailable {
    use Queueable, SerializesModels;

    public $user;

    // 存储$user
    public function __construct($user) {
        $this->user = $user;
    }

    // 跳转到mail.reg页面,同时携带$user参数
    public function build() {
        return $this->view('mail.reg', compact($this->user));
    }
}
```

```html
<!-- resources/views/mail/reg.blade.php -->

<!-- 邮件的模板,点击该链接后,就会跳转到confirmEmailToken路由,同时携带该账户的email_token参数 -->
<a href="{{route('confirmEmailToken', ['token' => $user['email_token']])}}">点击连接进行邮件验证</a>
```

```php
// routes/web.php

Route::get("/confirmEmailToken/{token}", [UserController::class, "confirmEmailToken"])->name("confirmEmailToken");
```

```php
// App/Http/Controllers/UserController.php

class UserController extends Controller {
    // 邮件的身份验证 (注: 需要设置游客账户的权限可以访问该方法)
    public function confirmEmailToken($token) {
        // 查询账户表中该email_token的账户
        // 如果不存在,即验证失败,如果存在,即验证成功
        $user = User::where('email_token', $token)->first();
        if (!$user) {
            session()->flash('danger', '验证失败');
            return redirect('/home');
        }
        // 修改邮箱状态
        $user->email_active = true;
        $user->save();
        // 登录账户
        \Auth::login($user);
        session()->flash('success', '验证成功');
        return redirect('/home');
    }
}
```

## 重置密码

> 实现效果

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202209052001293.png)

- 登录页面,点击"找回密码"按钮,跳转到输入邮箱页面
- 输入邮箱页面,点击"登录",发送一份通知给该邮箱
- 通知中,点击"重置密码",跳转到重置密码页面
- 重置密码页面,点击"确认修改",跳转到登录页面

> 配置路由

```php
// 找回密码
Route::post('/RetrievePasswordUpdate', [RetrievePasswordController::class, 'update'])->name('RetrievePasswordUpdate');
```

> 登录页面,点击"找回密码"按钮,跳转到输入邮箱页面

```html
<!-- resources/views/login.blade.php -->

@extends("layouts.default")

@section("content")
    <form action="{{route('login')}}" method="post">
        @csrf
        <div class="card">
            <div class="card-header">
                登录
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label>邮箱</label>
                    <input type="text" class="form-control" name="email">
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input type="password" class="form-control" name="password">
                </div>
                <div class="form-group">
                    <!-- 跳转到RetrievePasswordEmail路由 -->
                    <a href="{{route('RetrievePasswordEmail')}}">找回密码</a>
                </div>
            </div>
            <div class="card-footer text-muted">
                <button type="submit" class="btn btn-success">登录</button>
            </div>
        </div>
    </form>
@endsection
```

```php
Route::get('/RetrievePasswordEmail', [RetrievePasswordController::class, 'email'])->name('RetrievePasswordEmail');
```

```php
// App/Http/Controllers/RetrievePasswordController.php

class RetrievePasswordController extends Controller {
    public function email() {
        // 跳转到输入邮箱页面
        return view('mail.email');
    }
}
```

> 输入邮箱页面,点击"登录",发送一份通知给该邮箱

```html
<!-- resources/views/mail/email.blade.php -->

@extends('layouts.default')
@section('content')
    <!-- 跳转到RetrievePasswordSend路由 -->
    <form action="{{route('RetrievePasswordSend')}}" method="post">
        @csrf
        <div class="card">
            <div class="card-header">
                登录
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label>邮箱</label>
                    <input type="text" class="form-control" name="email">
                </div>
            </div>
            <div class="card-footer text-muted">
                <button type="submit" class="btn btn-success">发送邮件通知</button>
            </div>
        </div>
    </form>
@endsection
```

```php
Route::post('/RetrievePasswordSend', [RetrievePasswordController::class, 'send'])->name('RetrievePasswordSend');
```

```php
// App/Http/Controllers/RetrievePasswordController.php

class RetrievePasswordController extends Controller {
    public function send(Request $request) {
        // 根据email查询到指定账户的数据模型
        $user = User::where('email', $request->input('email'))->first();
        // 发送通知给该账户
        \Notification::send($user, new RetrievePasswordNotify($user->email_token));
        session()->flash('success', '发送成功,请查看邮箱');
        return redirect()->back();
    }
}
```

> 通知中,点击"重置密码",跳转到重置密码页面

```php
// App/Notifications/RetrievePasswordNotify.php

class RetrievePasswordNotify extends Notification {
    use Queueable;

    public $token;

    // 在构造器中接受$token,并保存下来
    public function __construct($token) {
        $this->token = $token;
    }

    public function via($notifiable) {
        return ['mail'];
    }

    // 配置邮件通知的内容
    public function toMail($notifiable) {
        return (new MailMessage)
            // 主题
            ->subject('找回密码')
            // 一行文本
            ->line('点击链接找回密码')
            // 按钮,点击了该按钮后会跳转到ReterievePasswordEdit路由,并且携带该账户的token作为参数
            ->action('重置密码', url(route('RetrievePasswordEdit', $this->token)))
            // 一行文本
            ->line('感谢使用该网站');
    }

    public function toArray($notifiable) {
        return [
        ];
    }
}
```

```php
Route::get('/RetrievePasswordEdit/{token}', [RetrievePasswordController::class, 'edit'])->name('RetrievePasswordEdit');
```

```php
// App/Http/Controllers/RetrievePasswordController.php

class RetrievePasswordController extends Controller {
    public function edit($token) {
        $user = User::where('email_token', $token)->first();
        // 跳转到重置密码页面
        return view('mail.edit', compact('user'));
    }
}
```

> 重置密码页面,点击"确认修改",跳转到登录页面

```html
@extends("layouts.default")
@section("content")
    <!-- 跳转到RetrievePasswordUpdate路由 -->
    <form action="{{route('RetrievePasswordUpdate')}}" method="post">
        @csrf
        <!-- 隐藏的input框,携带token参数 -->
        <input type="hidden" name="token" value="{{$user['email_token']}}">
        <div class="card">
            <div class="card-header">
                重置密码
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label>邮箱</label>
                    <input type="text" class="form-control" name="email" value="{{$user["email"]}}">
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input type="password" class="form-control" name="password">
                </div>
                <div class="form-group">
                    <label>确认密码</label>
                    <input type="password" class="form-control" name="password_confirmation">
                </div>
            </div>
            <div class="card-footer text-muted">
                <button type="submit" class="btn btn-success">确认修改</button>
            </div>
        </div>
    </form>
@endsection
```

```php
// App/Http/Controllers/RetrievePasswordController.php

class RetrievePasswordController extends Controller {
    public function update(Request $request) {
        $this->validate($request, [
            'password' => 'required|min:5|confirmed'
        ]);
        // 根据token查询到指定的账户
        $user = User::where('email_token', $request->post('token'))->first();
        // 修改账户密码
        $user->password = bcrypt($request->post('password'));
        $user->save();
        session()->flash('success', '重置成功');
        // 跳转到登录页面
        return redirect()->route('login');
    }
}
```

## 添加关注/取消关注

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202209052001295.png)

- 关注账户 和 粉丝账户 都是用的 一张users表
- users表 和 users表 进行多对多关联, 中间表为 users_users表

```php
Route::get('/follow/{user}', [UserController::class, 'follow'])->name('users.follow');
```

```php
// App/Models/User.php

class User extends Authenticatable {
    // users1表多对多关联users2表 (账户表关联粉丝表)
    public function users1() {
        return $this->belongsToMany(User::class, 'users1_users2', 'user1_id', 'user2_id');
    }

    // users2表多对多关联users1表 (粉丝表关联账户表)
    public function users2() {
        return $this->belongsToMany(User::class, 'users1_users2', 'user2_id', 'user1_id');
    }

    // 判断$user2_id的账户是否为该账户的粉丝
    public function isFollow($id) {
        return $this->users1()->where('user2_id', $id)->first();
    }

    // 添加关注/取消关注
    public function followToggle($ids) {
        // 将$ids封装成数组形式,toggle()只能接受数组形式的数据
        $ids = is_array($ids) ? $ids : [$ids];
        // 添加该$ids的账户数据 和 删除该$ids的账户数据 之间 来回切换
        return $this->users1()->withTimestamps()->toggle($ids);
    }
}
```

```php
class UserController extends Controller {
    public function show(User $user) {
        Paginator::useBootstrap();
        $articles = $user->articles()->paginate(10);
        // 只有登陆账户后才可以判断是否关注了$user,没有登录时,就不能进行判断
        if (\Auth::check()) {
            // 判断当前账户是否关注了$user账户
            $followTitle = \Auth::user()->isFollow($user->id) ? '取消关注' : '添加关注';
            // 跳转到user.show页面,同时携带$followTitle参数
            return view('user.show', compact('user', 'articles', 'followTitle'));
        } else {
            return view('user.show', compact('user', 'articles'));
        }
    }

    // 添加关注/取消关注
    public function follow(User $user) {
        /* 
            if (\Auth::user()->isFollow($user->id)) {
                // 如果当前账户关注了$user账户,就取消关注
                \Auth::user()->users1()->detach([$user->id]);
            } else {
                // 如果当前账户没有关注$user账户,就添加关注
                \Auth::user()->users1()->attach([$user->id]);
            }
        */

        // 当前账户 添加关注/取消关注 $user账户
        \Auth::user()->followToggle($user->id);
        return back();
    }
}
```

```html
<h1 class="text-center">{{$user['username']}}</h1>

<div class="text-center">
    <!-- 展示粉丝数量和关注数量 -->
    <a href="#" class="btn btn-info">
        <!-- 查询$user在中间表中与users1表有关联的记录的数量 -->
        粉丝: {{$user->users1()->count()}}
    </a>
    <a href="#" class="btn btn-info">
        <!-- 查询$user在中间表中与users2表有关联的记录的数量 -->
        关注: {{$user->users2()->count()}}
    </a>

    <!-- 只有登录后才显示"添加关注/取消关注"按钮 -->
    @auth
        <a href="{{route('users.follow', $user)}}" class="btn btn-success">
            {{$followTitle}}
        </a>
    @endauth
</div>
```

## 搜索文章

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202209052001296.png)

```php
Route::get('/home', [HomeController::class, 'home'])->name('home');
```

```html
<!-- 搜索框的部分 -->
<form action="{{route('home')}}" id="search-form" class="input-group mb-3">
    @csrf
    @method('get')
    <!-- 输入框,同时给value属性绑定Request::input('keyworkd'),这样跳转路由后,依旧可以在搜索框中保留keyword的字样 -->
    <input type="text" placeholder="请输入字段名" name="keyword" id="search-content" class="form-control rounded mr-2" value="{{Request::input('keyword')}}">
    <button id="search-btn" class="btn btn-info btn-search">查找</button>
</form>

<!-- 文章列表的部分 -->
@foreach($articles as $article)
    title: {{$article['title']}}
    contentn: {{$article['content']}}
@endforeach
```

```php
class HomeController extends Controller {
    public function home(Request $request) {
        // 筛选条件
        $where = function ($query) use ($request) {
            if ($request->has('keyword') && $request->get('keyword') != '') {
                $keyword = '%' . $request->get('keyword') . '%';
                $query->where('title', 'like', $keyword);
            }
        };
        // 进行筛选
        $articles = Article::where($where)->orderBy('id', 'desc')->paginate(10);
    }
}
```
