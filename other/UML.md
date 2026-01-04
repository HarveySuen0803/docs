# 补充

# UML

UML 的作用: 统一建模语言, 基于面向对象的方法, 绘图, 建立软件模型

建模语言: 提供交流的词汇和规则, 并不是编程语言

可视化: 通过标准图形描述模型

UML 通用标准: 软件建模的标准语言

UML 和 软件开发过程 是 独立的

# 用例图

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944707.png)

用例图: 描述软件的功能, 展示使用者和软件功能的关系, 展现软件功能之间的关系, 属于需求建模

用例图的三要素: 参与者, 关系, 用例

用例图只能描述功能, 不能反映功能内部的实现

用例图描述用户的可见需求, 反映了系统和用户的一次交互过程

箭头 表示 信息的流向, 也可以不画箭头

用例 和 用例 之间 没有关系

参与者 (活动者): 系统的使用者, 在系统的外部, 与系统发生交互, 与系统有交互接口, 向系统提供信息, 获取信息

参与者类型: 人, 设备, 外部系统, 时间

用例 也可以指向 参与者

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944708.png)

包含关系: 执行了 A 就会执行 B

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944709.png)

扩展关系: B 是 A 的扩展, 满足条件才执行

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944710.png)

泛化关系: 普通用户, 高级用户 都属于 用户; 大功能, 小功能 都属于 功能

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944711.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944712.png)

# 类图

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944713.png)

类图: 描述系统的静态结构, 软件中, 解决问题的抽象结构

类图 是 用例图 的核心, 是 数据库结构建模 的基础

类图可以看见内部逻辑

类 是 具有相同属性和操作的对象的集合

类的结构: 类名, 属性, 操作

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944714.png)

`# name:String = "sun"` 中 `#` 是 protected 只有本类和子类可以访问, `name` 是属性名, `String` 是属性的数据类型, `"sun"` 是属性的初始值
    属性的修饰符
        `+` public
        `-` private
        `#` protected 本类和子类可以访问
        `~` package 同一个包可见
        `_` static 全局可见
    属性的数据类型
        String
        Date
        Boolean
        int

关联关系: 静态关系, 事物之间的牵连关系

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944715.png)

关联的多重性
    `1` 一个
    `1..1` 一个
    `0..1` 零个 或 一个
    `*` 零个 或 多个
    `0..*` 零个 或 多个
    `1..*` 一个 或 多个

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944716.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944717.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944718.png)

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944719.png)

组成关系: 整体与部分的关系

组成关系的分类: 聚集, 组合

聚集: 整体与部分的关系 松散, 拿走一部分没大影响

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944720.png)

组合: 整体与部分的关系 紧密: 拿走一部分有很大影响

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944721.png)

泛化关系: 子类继承父类

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944722.png)

依赖关系: 一个类使用了另一个类的属性, 方法, 类型

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944723.png)

实现关系: 一个类提供一个方法给另一个去实现

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944724.png)

# 对象图

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944725.png)

对象图: 类图在某一时刻, 各个类的对象之间的关系

对象图的作用: 初期分析工具, 模拟业务场景, 模拟运行场景

对象之间用 链 来联系, 不存在多重性, 永远是一对一

对象不一定就是客观存在的事物

对象的结构: 对象名, 属性

对象没有操作

对象名的结构 对象名:学生, 省略了对象名, 表示该对象是隐匿的, 对象名中带有下划线的就是对象

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944726.png)

# 顺序图

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944727.png)

顺序图 是 交互图 的一种, 用于交互建模

顺序图: 交互过程中, 交互对象实体之间消息传递的顺序

顺序图的标记: Sd

顺序图的元素
    参与者: 小人
    对象: 显示器, 键盘, 存款机, 账户信息四个方框
    生命线: 参与者和对象 + 参与者和对象下引出的虚线
    激活: 长条方块, 生命线上有长条方块说面, 该对象被激活了
    消息: 对象之间的联系
    交互执行: 长条方块

顺序图的结构: 生命线, 消息, 交互执行, 交互时间

同步消息: 实线, 实心箭头, 发送对象需要等待对方回应

应答消息: 虚线, 开箭头

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944728.png)

异步消息: 实现, 开箭头, 发送对象不需要等待对方回应

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944729.png)

创建消息: 虚线, 开箭头, 指向对象, 表示创建了一个对象

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944730.png)

销毁消息: 叉子

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944731.png)

事件执行顺序
    同一生命线上, 上面的先于下面的
    不同生命线上, 不确定

# 状态图

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944732.png)

状态: 持续的一种稳定的状况

状态机: 一个事物的生命周期中, 所有 状态 和 状态转换 的集合

状态图 (状态机图): 用 UML 描述状态机的图

状态机图的组成: 状态结点, 控制结点, 转换边

初始状态: 黑圆

终止状态: 同心圆

状态转换的要素
    触发事件: 触发状态转换的条件
    监护条件: 监护状态转换
    转换动作: 执行一系列动作, 从 源状态 转换成 目标状态, 在动作前加一个 `/`

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202303220944733.png)



























