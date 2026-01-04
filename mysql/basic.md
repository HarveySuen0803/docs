# Install MySQL by Docker

pull MySQL image

```shell
docker image pull mysql:8.1.0
```

set volume

```shell
docker volume create mysql-conf
docker volume create mysql-data
docker volume create mysql-logs

sudo mkdir -p /opt/mysql

sudo ln -s /var/lib/docker/volumes/mysql-conf/_data /opt/mysql/conf
sudo ln -s /var/lib/docker/volumes/mysql-data/_data /opt/mysql/data
sudo ln -s /var/lib/docker/volumes/mysql-logs/_data /opt/mysql/logs
```

startup MySQL

```shell
docker container run \
    --name mysql \
    --network global \
    --privileged \
    -p 3306:3306 \
    -v mysql-conf:/etc/mysql/conf.d \
    -v mysql-data:/var/lib/mysql \
    -v mysql-logs:/var/log/mysql \
    -e MYSQL_ROOT_PASSWORD=111 \
    -d mysql:8.1.0
```

set remote connection

```shell
docker container exec -it mysql /bin/bash
mysql -h127.0.0.1 -P3306 -uroot -p111
```

```sql
use mysql;

create user 'harvey'@'%' identified by '111';
grant select, insert, update, delete, create, drop, alter on db.* to 'harvey'@'%';

alter user 'root'@'%' identified with caching_sha2_password by '111';

alter user 'root'@'' identified with caching_sha2_password by '111';

flush privileges;
```

test connection

```shell
mysql -h127.0.0.1 -P3306 -uroot -p111 -e "select * from mysql.user";
```

# Character

Check character

```sql
show character set;

show variables like '%character%';

show variables like '%_server';

show variables like '%_database';

show create database db;

show create database emp;
```

Set default character (config/my.cnf)

```shell
[client]
default-character-set=utf8mb4

[mysql]
default-character-set=utf8mb4

[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_general_ci
```

Update the character of existing database and table

```sql
alter database db character set 'utf8mb4' collate 'utf8mb4_0900_ai_ci';

alter table stu convert to character set 'utf8mb4' collate 'utf8mb4_0900_ai_ci';
```

utf8mb3 使用 1 ~ 3 B 表示, utf8mb4 使用 1 ~ 4 B 表示, utf8 使用 1 ~ 4 B 表示

utf8mb3_general_ci 校对速度快一点, utf8mb3_unicode_ci 校对准确一点

character_set_client 到 character_set_connection 的 Character 必须和 character_set_results 到 character_set_client 的 Character 相同

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241726770.png)

Set character for character_set_client, character_set_connection, character_set_results

```sql
set character_set_client = utf8mb4;
set character_set_connection = utf8mb4;
set character_set_results = utf8mb4;
```

# Case Sensitivity

Database, Table, Table Alias, Variable 区分大小写, 其他都不区分大小写

Check case sensitivity

```sql
-- 0  case sensitive
-- 1  case insensitive
-- 2  change all words to lowercase when querying
show variables like 'lower_case_table_names';
```

Set default config (file: my.cnf)

```
lower_case_table_name=0
```

# SQL Mode

NO_ENGINE_SUBSTITUTION 进行 Data Validation 时比较宽松, 允许一些非法操作, 一般用于 Database Migration, 避免大规模修改 SQL

STRICT_TRANS_TABLES 进行 Data Validation 时比较严格, 为了保证在 Dev Env 中就发现问题, 所以几乎全场景使用, 但也会导致一些麻烦 (eg: 一些默认分配的值会不符合要求)

Check SQL Mode

```sql
show variables like 'sql_mode';
```

Set temporary config

```sql
set session sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

set global sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
```

Set default config

```
[mysqld]
sql_mode=ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```

# File Structure

DataBase File 存储在 /var/lib/mysql 中

```
+ db01
+ db02
+ mysql
+ performance_schema
+ sys
```

mysql 存储了 User, Permissions, Stored Procedure, Event, Log, TimeZone

information_schema 存储了其他 Database 的 MetaData, 包括 Table, View, Trigger, Col, Index

performance_schema 存储了 MySQL Service 运行时的 State Info, 可以用于监控管理

sys 主要存储了一些 View 将 information_schema 和 performance_shema 结合起来, 方便监控管理

# Data Type

```sql
create table t01 (
    name varchar(255),
    sex char(1),
    status bit(8),
    balance1 float,
    balance2 double,
  	balance3 decimal(30,20),
    content1 text,
    content2 mediumtext,
    content3 longtext,
    time1 date, -- yyyy-MM-dd
    time2 datetime, -- yyyy-MM-dd HH:mm:ss
    time3 timestamp,
)
```

# create

```sql
create database if not exists db character set utf8mb4 collate utf8mb4_bin;

create table stu (
    `id` int primary key,
    `name` varchar(255) not null default '',
    `password` varchar(32),
    `birthday` date
) character set utf8mb4 collate utf8mb4_bin engine innodb;

create table grade (
    `id` int primary key,
    `math` int,
    `stu_id` int,
    foreign key (`stu_id`) references stu(`id`) -- stu_id is the foreign key pointing to stu's primary key
)

-- copy structure
create table stu_copy like stu; 

-- copy structure and data
create table stu_copy as select * from db.stu;
```

# alter

```sql
alter table stu character set utfb8mb4;

alter table stu rename to stuloyee;

alter table stu change column name stu_name varchar(32) not null default "";

alter table stu modify column sex varchar(10) not null default "";

alter table stu add column job varchar(50) after name;

alter table stu drop column job;
```

# drop

```sql
drop database db;

drop table stu;
```

# insert

```sql
insert into stu (id, name) values (6, "jack"), (7, "smith"), (8, "jerry");

insert into stu values (9, "jack"), (10, "smith"), (11, "jerry");
```

# update

```sql
update stu set name = 'sun', sex = 'male' where id = 1;
```

# delete

```sql
delete from stu;

delete from stu where sex = 'male' order by age limit 0, 3;

-- delete all data in the table, performance is stronger
truncate stu;
```

# select

```sql
-- determine if the table has data
select 1 from stu;

-- filter duplicate data
select distinct name from stu;

select name as stu_name, sex as stu_sex from stu;

select math + english + computer as total from grade;

select '2023-11-11' + interval 10 day; -- 2023-11-21

select '2023-11-11 10:20:30' + interval 10 second ; -- 2023-11-11 10:20:40

select '2023-11-11 10:20:30' + interval 10 second ; -- 2023-11-11 10:20:40
```

# where

```sql
select * from stu where id != 3;

select math + english + computer as total from grade where (math, english, computer) > 200;
-- 'where' is executed before 'select', can not use 'alias'
select math + english + computer as total from grade where total > 200; -- error

select * from grade where math between 60 and 90;
select * from grade where math in (70, 80, 90);

select * from stu where name like "%u%";
select * from stu where name not like "%u%";
select * from stu where name like "__n%";

select * from stu where name is null;
select * from stu where name is not null;

select * from stu where birthday > '2002.8.3';

select * from stu where age > all(10, 20, 30, 40);
select * from stu where age > any(10, 20, 30, 40);
```

# group by

```sql
select count(*) from stu;

select count(math), avg(math), max(math), min(math), sum(math) from grade;

-- group by deptno, put the same deptno in a group, query the avg(sal), max(sal), min(sal), sum(sal) of each group
-- in addition to the grouping function, each attribute in select must be given in group
select deptno, avg(sal), max(sal), min(sal), sum(sal)3 from stu group by deptno;
```

# having

```sql
select avg(sal) from stu group by deptno having avg(sal) < 2000;

select avg(sal) as avg_sal from stu group by deptno having avg_sal < 2000;
```

# order by

```sql
select * from stu order by math;
select * from stu order by math asc;

select * from stu order by math desc;

select math + english + computer as total from grade order by (math + english + computer);
-- 'order' is executed after 'select', so 'alias' can be used
select math + english + computer as total from grade order by total;

-- in ascending order by math, if math is the same, in descending order by english 4
select * from grade order by math asc, english desc;
```

# limit

```sql
select * from stu limit 3; 

select * from stu limit 0, 3;
```

# Writing Order

```sql
select ...
from ...
where ...
group by ...
having ...
order by ...
limit ...
```

# Execution Order

select 的 alisa, 在 where 中不可用, where 在 select 前 执行

select 别 alias, 在 order by 中可用, select 在 order by 前 执行

where 不可用 grouping function

having 可用 grouping function

```sql
from ...
where ...
group by ...
having ...
select ...
order by ...
limit ...
```

# union

```sql
-- merge without deduplication
select ename, sal, job from emp where sal > 2500
union all
select ename, sal, job from emp where job = 'MANAGER';

-- Merge with deduplication
select ename, sal, job from emp where sal > 2500
union
select ename, sal, job from emp where job = 'MANAGER'
```

# view

```sql
show create view emp_view;

create view emp_view as select * from emp;

-- `update`, `insert` must meet the condition that math > 70
create view grade_view as select * from grade where math > 70 with check option;

alter view emp_view as select id, name, sex from emp;

drop view emp_view;

desc emp_view;

select * from emp_view;

update emp_view set sex = 'female' where id = 1;

delete from emp_view where id = 1;
```

# Temporary Table

```sql
create temporary table temp
select * from emp;

drop temporary table temp;

select * from temp;
```

# Performance Analysis

```sql
explain select * from emp;
```