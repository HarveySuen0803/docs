# Index

Index 是由不同 Storage Engine 实现的, 可以通过 Index 降低 IO 次数, 保证每一行数据的唯一性, 加速表连接的速度, 加快分组和排序, 以提高读的效率. 

创建 Index 需要耗费时间, 占用硬盘空间, 修改数据时, 也需要修改所有 Index 的信息, 所以非常影响写的效率. 进行大量写时, 可以先删除 Index, 写入后, 再创建 Index.

```sql
create table tbl (
    col1  int,
    primary key (col1),

    col2  int,
    unique key (col2),

    col3  int,
    foreign key (col1) references foreign_tbl (col1),

    -- Only used for `geometry` and must be not null
    col4  geometry not null,
    spatial key (col4),

    -- Only used for `char`, `varchar`, `text`
    col5  varchar(10),
    fulltext key (col5),

    col6  int,
    key (col6),

    col7  int,
    col8  int,
    col9  int,
    key (col7, col8, col9),

    col10 int,
    key tbl_index (col10)
);

show index from emp;

create index emp_index on emp(id, name asc, sex desc);

create unique index emp_index on emp(id);

alter table emp add index job_index (job);

-- the attribute value of a unique index must be unique and can be NULL
alter table emp add unique index name_index (name);

alter table emp add primary key id_index (id);

alter table emp drop index emp_index;

drop index emp_index on emp;

alter table emp add index name_index (name) invisible;

alter table emp add index name_index (name) visible;

-- -- Usually, it is set to invisible first to determine whether the index can be deleted, and then delete the index
alter table emp add index name_index (name) invisible;
alter table emp drop index name_index;
```

# Data Page

Page 是 Disk 和 Memory 交互的基本单位, 默认 16KB 大小. 一个 Page 中有多个 Record. Record 和 Record 之间按照 Primary Key 排序, 通过 Single Linked List 连接. Page 和 Page 之间通过 Double Linked List 连接.

Infimum Record 开头, 指向 Page 中 Min Primary Key 的 Record. Supreme Record 结尾, 被 Page 中 Max Primary Key 的 Record 指向.

Record 都是按照顺序排列的, 所以进行范围查找时 (eg: 1 < c1 < 100), 就可以通过 Binary Search 进行查找, 效率很高.

Record 不需要保证物理上的连续, 只需要连接成 Single Linked List, 保证逻辑上的连续即可.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241727307.png)

插入数据时, 一定要按照 Primary Key 顺序排列, 依次插入 1, 5, 3, MySQL 会调整为 1, 3, 5 后插入.

依次插入 1, 3, 5 后, 再次插入 4, 就会造成 Page Divided, 需要调整两个 Page 中的 Record 的顺序, 非常影响性能. 为了避免 Page Divided 可以在插入数据时, 不指定 Primary Key, 让其自增.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241727308.png)

# Directory Page

Directory Page 的一条 Directory Record 指向一个 Data Page. Directory Record 的 c1 记录了 Data Page 的 Min Primary Key. Directory Record 的 c2 记录了 Data Page 的 Offset.

当 Data Page 太多时, 直接对所有的 Data Page 进行 Binary Search, 非常低效. 可以先对 Directory Page 进行 Binary Search, 确定 Data Page 后, 再对 Data Page 进行一次 Binary Search.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241727309.png)

Root Page 的一条 Directory Record 指向一个 Directory Page.

当 Directory Page 太多时, 直接对所有的 Data Page 进行 Binary Search, 非常低效. 可以先对 Root Page 进行 Binary Search, 确定 Directory Page 后, 再对 Directory Page 进行 Binary Search.
 
![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241727310.png)

MySQL 为了减少 IO, 采用动态加载硬盘的方式, 不会一次就加载整个 Index Tree, 而是一次加载一个 Page, 一个 Page 对应一个 Node, 这就相当于对 Tree 进行搜索.

一般 4 层 Page 就足够应付大部分场景了, 而且 Root Page 是万年固定不动的, 所以可以让 Root Page 常驻 Memory, 也就说只需要进行 1 ~ 3 次 IO 即可.

# B Tree vs B+ Tree vs Hash

MySQL为什么使用B+树？

- 减少磁盘I/O：B+树非叶子节点仅存储索引，树高更低，访问深度减少。MySQL一次读取磁盘的块较大（如页大小16KB），一个节点可以包含大量索引，降低访问次数。
- 支持范围查询：B+树叶子节点链表支持高效的范围查找（例如BETWEEN查询）。
- 分页管理：数据存储在叶子节点，天然与页管理结合，高效分页。
- 稳定性能：对于大规模数据，树高低，查询时间复杂度趋近O(log N)，性能稳定。

B+ Tree 的所有数据都存储在 Leaf Node 中, B Tree 可以存储数据在 Non Leaf Node 中.

B Tree 不稳定, 数据不确定在哪一层, 每次查询效率不太一样, MySQL 更注重综合的查询效率.

MySQL 的一个 Page 只有 16 KB, 那么 B+ Tree 的 Directory Page 就可以存储更多的 Directory Record, 就可以指向更多的 Data Page, 让 Tree 变得更矮更宽.

进行范围查询时. B+ Tree 可以直接通过 Single Linked List 进行 Binary Search, 非常高效. B Tree 只能通过 Inorder Traversal, 非常低效.

Hash 的等值查询性能比 B+ 还要强, 但是在进行范围查找时, 会退化为 O(n), 而 B+ Tree 移就能保持 O(log2n).

Hash 存储的数据无法保证顺序, 需要使用 Order By 时, 还需要对查询结果再进行一次重排序. 

Hash 无法处理 Unified Index, 多个 Field 组合后, 计算得到 Hash 可能相同.

Hash 的桶分布是随机的, 所以存储的数据也是分散的, 是 Random IO.

如果 Hash Col 重复的结果太多, 对 Single Linked List 进行遍历时, 性能太差. 所以 Hash 适合存储少量临时数据, 如 Cache.

Hash 在插入和删除上非常简单, B+ Tree 需要去考虑树的平衡问题已经分页的问题, 设计数据库时要非常小心.

# Clustered Index

Clustered Index 是以 Primary Key 作为 Index. 默认情况下, 所有的数据就存储在这个 Clustered Index 的 Leaf Node 中.

Non Clustered Index 是以 Non Primary Key 作为 Index. Leaf Node 存储的是 Primary Key, 需要再通过 Clustered Index 找到数据.

如果查询查询条件使用的 Field 不是 Primary Key, 就可以将该 Field 作为 Index 创建 Non Clustered Index.

一个 Table 可以有一个 Clustered Index 和多个 Non Clustered Index.

将其他 Field 作为 Index 时, 无法保证唯一性, 无法排序, 即一个 Record 中可能有多个相同的 C1, 此时就可以联合多个 Field 作为 Index 来保证唯一性, 这就是 Unified Index.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241727311.png)

# B+ Tree in InnoDB

InnoDB 默认会将 Primary Key 作为 Index 创建 Clustered Index. 如果没有指定 Primary key, 则 InnoDB 会自动选择一个 Unique Field 作为 Index. 如果没有 Unique Field, 则 InnoDB 会隐式的创建一个 Primary Key 作为 Index.

InnoDB 的 Root Page 是固定不动的, 只会改变内部 Record 的指向, 并不会改变 Root Page 的层级.

InnoDB 的 Non Clustered Index 会联合 Primary Key 来保证唯一性, 这里的 Primary Key 仅仅用于区分 Record. 所以不推荐使用过长的 Field 作为 Primary Key, 会导致 Directory Record 过大.

InnoDB 支持 Adaptive Hash Index, 类似于 Hot Code, 将常用数据的地址, 直接存放到 Hash Table 中, 下次查询时, 直接通过 Hash Table 访问.

查看 Adaptive Hash Index 状态

```sql
show variables like 'innodb_adaptive_hash_index';
```

# B+ Tree in MyISAM

MyISAM 的 myd File 存储 Data, myi File 存储 Index, 所以 Data 和 Index 是分开的. B+ Tree 的 Leaf Node 存储的不是 Data, 而是 Data 的 Offset.

MyISAM 的所有 Index 都是 Non Clustered Index, 但是 MyISAM 直接拿到的就是 Data 的 Offset, 所以 MyISAM 再次查询时效率是非常高的.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241727312.png)

# Page

Page 包含 File Header, Page header, Infimum, Supremum, User Records, FreeSpace, Page Directory, File Tailer. 其中 Infimum, Supremum, User Records, FreeSpace 又称为 File Space, 占据了主要部分.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241727313.png)

## File Header

File Header 存储了 Page 的通用信息, 包含了多个属性来描述, 下面挑一些来讲讲.

FIL_PAGE_OFFSET 是 Page 的 Offset, 唯一表示 Page.

FIL_PAGE_TYPE 是 Page 的 类型, 如 0x0002 表示 FIL_PAGE_UNDO_LOG 是 Undo Log Page, 0x0006 是 FIL_PAGE_TYPE_SYS 是 System Page, 0x45BF 是 FIL_PAGE_INDEX 是 Data Page.

FIL_PAGE_PREV 存储了前一个 Page 的 Offset, FIL_PAGE_NEXT 存储了后一个 Page 的 Offset.

FIL_PAGE_SPACE_OR_CHECKSUM 存储 Current Page 的 CheckSum，根据 Page 的数据内容计算出的 Hash Code，可用于校验 Page 数据完整性。从硬盘读取整个 Page 后，对数据内容进行 Hash 计算得到一个 CheckSum，再对比 File Header 里的 CheckSum，即可确认数据是否完整。

- CheckSum 还可用于比较两个长字符串，如果字符串太长，逐个字符比较耗时太久，可先对两个长字符串进行 Hash 计算，得到两个短的 Hash 字符串，再比较这两个短的 Hash 字符串即可。

FIL_PAGE_LSN 存储修改的日志, 也会用于跟 FileTrailer 的 FIL_PAGE_LSN 进行比较, 以校验 Data Integrity.

## File Trailer

File Trailer 存储了 FIL_PAGE_SPACE_OR_CHECKSUM 用于备份 CheckSum，同时存储了 FIL_PAGE_LSN 事务日志序列号 用于恢复或修复数据。

如果 File Header 的 checkSum 校验失败，InnoDB 会进一步检查 File Trailer 中的 checkSum 或 LSN。通过对比 Trailer 中的校验值或与事务日志匹配，确认是否可以恢复或修复数据。

## Infimum, Supremum

Infimum 和 Supremum 就是两条特殊的 Record, 不存储在 User Records 中, 而是由 MySQL 创建, 单独存储在这.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241727314.png)

## User Records

User Records 会根据指定行格式存储数据, 并且构成 Single Linked Table.

User Records 除了记录真实数据外, 还会记录 DB_ROW_ID 用于唯一标识, DB_TRX_ID 用于 Transaction 的唯一标识, DB_ROLL_PTR 用于标识 Rollback Pointer.

## Page Directory

对整个 Page 进行 Binary Search, 效率还是有些低, 并且需要加载整个 Page 到 Memory 中, 太耗费资源, 所以还可以对 Page 内部的 Record 再进行一次分组.

一般 Infimum 为一组, 剩下的尽量平均分组, Slot 会指向每一组中最大的那一条 Record, 即 Slot 记录的是最大的那条 Record 的 Offset, 并且最大的那一条的 Record 的 Record Header Info 的 o_owned 会记录当前组中的记录数量. 一组最多存 8 条 Record (包括 Supremum), 达到 9 个后, 会拆分为两组, 一组 4 条 Record, 一组 5 条 Record (包括 Supremum).

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241727315.png)

## Page Header

Page Header 存储了 Page 的状态信息, 包含了多个属性来描述, 下面挑一些来讲讲.

PAGE_N_HEAP 表示该 Page 中 Record 的数量 (包括 Infimum 和 Supremum)

PAGE_N_DECS 表示该 Page 中 Record 的数量 (不包括 Infimum 和 Supremum)

PAGE_FREE 记录了第一个删除的 Record 的 Offset, 因为删除的数据构成了垃圾链表, 所以只要知道 Head 的 Offset, 既可以复用整条垃圾链表.

PAGE_DIRECTION 记录了 Prev Record 和 Current Record 在 Linked List 中的位置关系. 如果 Prev Record 在 Current Record 左边, 则用 1 标识, 如果在右边, 则用 0 标识. 因为很多插入都有方向上的规律, 所以可以利用这点提升插入性能.

PAGE_N_DIRECTION 记录了重复同一个方向的次数, 如果下一次方向改变了, 则重新开始计数.

PAGE_LEVEL 记录了 Current Page 在 B+ Tree 中的 Level.

# Record

## Row Format

Row Format（行格式）指的是表中数据在物理存储层的布局方式。不同的 Row Format 影响了数据存储的效率、空间占用和支持的功能。主要的 Row Format 包括 Compact (def), Redundant, Dynamic, Compressed 四种。

Compact Row Format Structure

```
[Record Header] --> 元信息：事务 ID、回滚指针等
[NULL Bitmap]   --> 每列占 1 位，记录 NULL 状态（若所有列为 NOT NULL，则无此部分）
[Field Offsets] --> 变长列的结束位置
[Column Data]   --> 按列顺序紧凑存储
```

Redudant Row Format Structure

```
[Record Header] --> 包括元信息，如事务 ID、回滚指针等
[NULL List]     --> 存储哪些列值为 NULL
[Column Offset] --> 每列的开始和结束位置（每列存储两次偏移量 [Start, End]）
[Column Data]   --> 按顺序存储列数据
```

Dynamic Row Format Structure

```
[Record Header] --> 元信息：事务 ID、回滚指针等
[NULL Bitmap]   --> 每列占 1 位，记录 NULL 状态
[Field Offsets] --> 变长列的结束位置
[Column Data]   --> 大字段可能存储为指针，指向溢出页
```

Compressed Row Format Structure

```
[Compressed Page Header] --> 包含压缩元信息
[Compressed Data]         --> 压缩后的数据
[Record Header]           --> 元信息：事务 ID、回滚指针
[NULL Bitmap]             --> 每列占 1 位，记录 NULL 状态
[Field Offsets]           --> 变长列的结束位置
[Column Data]             --> 数据解压后存储在主记录或溢出页
```

查看 MySQL 的 Default Row Format

```sql
show variables like 'innodb_default_row_format';
```

查看 Table 的 Row Format

```sql
show table status like 'emp';
```

创建 Table 时, 指定 Row Format

```sql
create table emp (id int) row_format = compact;
```

修改 Table 的 Row Format

```sql
alter table emp row_format = compact;
```

## Row OverFlow

一个 Page 只能存储 16384 B, 而一个 varchar Field 就能干到 65535 B, 直接把 Page 干溢出了, 这就是 Row Overflow.

Dynamic 和 Compressed 在处理 Row OverFlow 时, 会将全部的数据存储到 Other Page 中, Current Page 再存储 Other Page 的 Offset 和 Info.

Compact 和 Redudant 在处理 Row OverFlow 时, 会将部分数据存储到 Current Page 中, 再将剩余数据存储到 Other Page 中, Current Page 再用 20 B 存储 Other Page 到 Offset 和 Info.

## Null List

如果不标识 NULL, 就会导致查询混乱, 如果通过一个符号标识 Null, 还得分配对应的存储空间来占位, 太浪费空间了, 也不划算, 所以干脆单独维护一个 Null List, 专门记录哪些 Field 为 Null.

如果 Field 指定了 NOT NULL 后, 就不会记录到 Null List 中. 如果 Table 中的所有 Field 都指定了 NOT NULL, 那么该 Record 就不会存储 Null List.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241727318.png)

1 个 Varchar Field 按道理讲可以设置为 65535 B, 但实际上只能设置为 65532 B, 其中 Field Length List 占用 2 B, Null List 占用 1 B. 如果该 Table 只有一个 Varchar Field, 并且该 Field 指定了 NOT NULL, 那么就不会生成 Null List, 还可以再剩下 1 B, 即最大设置为 65533 B.

## Null Bitmap

Null List 采用链表结构，存储开销还是蛮大的，查询效率也较低，需要遍历整个 NULL List 才能判断列是否为 NULL。

NULL Bitmap 采用位图表示每一列的 NULL 状态，每列占用 1 位：0 表示非 NULL，1 表示 NULL。节省空间，每列只占用 1 位。查询效率高，通过简单的位运算即可快速判断列的 NULL 状态。同时因为紧凑存储的原因，就更容易实现顺序 IO。

查询优势，假设一个表有 100 列，其中 50 列可为空，经常需要判断某些列是否为 NULL。

- Null List：每次查询需要遍历 NULL List，复杂度为 O(n)，在列数较多时性能明显下降。
- Null Bitmap：判断某列是否为 NULL 只需简单的位运算，操作复杂度为 O(1)。

存储优势，假设一个表有 1 亿条记录，每条记录有 20 列，其中 10 列允许为 NULL。

- Null List：如果每条记录有 3 列为 NULL，每列占用 1 字节表示字段索引，总开销为 1亿 * 3字节 = 300MB。
- Null Bitmap：每条记录的 Null Bitmap 占用 10 位（约 2 字节），总开销位 1亿 * 3字节 = 200MB

## Field Offset List

Field Offset List 存储的是 Field 的 Offset，可以用于快速定位到每个字段。

目前 Compact、Dynamic 和 Compressed 采用的是 Field Offset List，而 Redundant 采用的是 Column Offset List。

## Column Offset List

Column Offset List 是一张列偏移量表，用于记录每个列的 开始位置 和 结束位置，这意味着每个变长列的起始位置和结束位置都被存储在行记录的元数据中。

## Field Length List

Field Length List 会记录 Varchar Field 真实需要使用的大小，实现动态调整存储大小，Field Length List + Null List 可以完全代替 Field Offset List。

## Record Header

Record Header 由 Reserved 1, Reserved 2, delete_mask, min_rec_mas, n_owned, heap_no, record_type, next_record 组成.

delete_mask 标识该 Record 是否被删除了, 0 表示未删除, 1 表示已删除. MySQL 删除数据就是通过这种标识的方式, 防止删除后引起 Reorder 或 Page Divided 非常影响性能. 后续添加新纪录时, 可以直接覆盖.

record_type 标识 Record 的 Type. 0 表示 Data Record, 1 表示 Directory Record, 2 表示 Infimum Record, 3 表示 Supremum Record.

min_rec_mask 标识 Non Leaf Node 的最小 Record.

next_record 存储了 Next Record 的 Offset.

n_owned 存储 Current Record 所在的分组中 Record 的数量, 只有该组中最大 Record 才会记录该属性, 其他的 Record 都默认是 0.

heap_no 存储了 Current Record 在 Page 中的位置. Infimum 的 heap_no 为 0, supremum 的 heap_no 为 1.

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241727319.png)

# Extent

1 个 Extent 包含 64 个 Page, 占 16 * 64 KB = 1 MB.

如果 Data 存储在 Memory 中, 从 Memory 读取 1 个 Page 到 Buffer 中只需要 1ms.

如果 Data 随机分布在 Disk 中, 对 Disk 进行 Random IO, 从 Disk 中读取 1 个 Page 到 Buffer 中需要 10ms, 其中 9ms 都浪费在了寻找 Data 上.

如果 Page 和 Page 紧挨着, 对 Disk 进行 Sequence IO, 一次读取一大堆 Page, 那么平均读取 1 个 Page 甚至可以比 Memory 还快.

在 Disk 上, 无法保证所有的 Page 都能按顺序存储, 但是可以保证一个 Extent 中的 64 个 Page 都是按照顺序存储的, 那么就可以对该 Extent 进行 Sequenece IO.

Extent 包括 FREE Extent, FREE_FRAG Extent, FULL_FRAG Extent, FSEG Extent.

# Fragment Extent

InnoDB 创建一个 Table, 就需要建立一个 Clustered Index, 立马生成 1 个 Data Segment 和 1 个 Index Segment, 如果 Segment 中只能以 Extent 为单位进行存储的话, 立马就消耗掉了 2 MB, 如果这个 Table 存储的数据很少的话, 就显得非常浪费.

Fragment Extent 就类似于一个 Public Extent, 不归属于任何 Segment, 而是归属于 Tablespace. Fragment Extent 中的 Fragment Page 可以用于任何 Segment.

当一个 Extent 已经用到了 32 个 Fragment Page 时, 就会为这 32 个 Fragment Page 单独开辟一个 Extent, 后续的 Page 都存储在该 Extent 中. 尽量减少浪费.

# Segment

InnoDB 的所有数据都存储在 Leaf Node 中, 进行范围查找时, 可以通过 Linked List 实现, 所以无需连续 Parent Node. 那么就可以将 Leaf Node 所在 Extent 存储到一个 Segment 中, 称为 Data Segment. 将 Non Leaf Node 所在 Extent 存储到一个 Segment 中, 称为 Index Segment.

Segment 中存储的是 Node 所在 Extent 和一些 Fragment Page.

# Tablespace

Tablespace 分为 System Tablespace, File-per-table Tablespace, Undo Tablespace 和 Temporary Tablespace.

Tablespace 包含 Data Segment, Index Segment 和 Rollback Segment.

查看 Tablespae.

```sql
show variables like 'innodb_file_per_table';
```

我们创建 Table 默认就是 File-per-table Tablespace, 1 个 Tablespace 对应 1 个 ibd File.

插入数据时, 会进行 Validation, 这些 Validation Info 就存储在 System Tablespace 中, 即 Internal System Table. InnoDB 的 Internal System Table 就是 Data Dictionary.

用户无法直接访问 Sysmtem Table, 但是用户可以参考 InnoDB System Table, 这些表并不是真正的 System Table, 而是 InnoDB 提供我们乐呵乐呵的, 表中的数据, 是由 Sysmtem Table 填充进来的.

查看 InnoDB System Table.

```sql
show tables like 'innodb_sys%';
```

# Useage Scenarios

Field 具有唯一性时, 就必须添加 Unique Index 或 Primary Index, 即使是多个 Field 组成的 Unified Field 具有唯一性, 也需要添加 Unique Index.

如果硬是要将一个大字符串作为 Index, 就干脆截取一部分作为索引, 即是可能会有相同的字段, 只要保证一定的 Text Discrimination 即可, 多几条无所谓, 多回几次表嘛.

```sql
-- 前 10 个字符的区分度
select count(distinct left(address, 10)) / count(*) from tbl;
-- 前 15 个字符的区分度
select count(distinct left(address, 15)) / count(*) from tbl;
-- 前 20 个字符的区分度
select count(distinct left(address, 20)) / count(*) from tbl;
```

建立一个 Unified Index 要好于建立多个 Single Index. 同时还需要避免 Redundant Index.

建立的 Index 越多, Memory 的占用就越多, 所以建议 1 个 Table 不超过 6 个 Index. 尤其是数据量很小的 Table 就没有必要添加 Index 了, 建立了太多 Index, 还需要 Optimizer 来选择比较, 反而更耗时.

应该选择尽量小的 Field 作为 Index. Field 越小, Directory Page 就能存放更多的 Directory Record, B+ Tree 就能更矮, 更宽. Primary Key 能使用 `int`, 就不要使用 `bitint`

`where` 经常使用的 Field 需要添加 Index. `where` 使用不到的 Field, 就没有必要建立 Index 了, Index 的价值就在于快速定位, 其他地方使用都不如这里实在.

`order by` 和 `group by` 经常使用的 Field 需要添加 Index. `order by` 查询到数据后, 还需要进行排序, 而 Index 本身就会进行排序, 所以会节省大量时间.

`distinct` 使用到的 Field 需要创建 Index. `distinct` 去重, 本身就只需要查询到一条数据即可, 非常适合 Index, 定位到一条数据后直接返回.

`join` 最多连接 3 张表, 连接的 Field 必须保证类型相同, 避免隐式转换, 造成 Index Invalidation.

如果一个 Field 有太多重复数据, 就不要建立 Index 了, Index 定位的价值所剩无几了.

建议, 不要将 Unordered Field 作为 Index, 容易造成 Page Divided.

