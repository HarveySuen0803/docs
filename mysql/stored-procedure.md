# System Variable

System Variable 包括 Global Variable 和 Session Variable

MySQL server 启动后, 会加载 Global Variable, client 连接 server 后, 会建立一个 session, 加载属于该 session 的 Session Variable

```sql
show global variables;

show session variables;

show global variables like 'admin_%';

select @@global.max_connections;

select @@session.character_set_client;

-- only applies to the current session
set global max_connections = 200;

-- global variable persistence
set persist max_connections 200;

set @m1 = 10;
set @m2 = 20;
set @m3 = @m1 + @m2;
select @m1, @m2, @m3;

select count(*) into @count from emp;
select @count;
```

# Local Variable 

```sql
create procedure test()
begin
    declare x int default 1;
    declare y int default 5;
    declare sum int default 0;

    set sum = x + y;
end;
```

# Stored Procedure

```sql
show create procedure p1;

drop procedure p1;

show procedure status;

show procedure status like 'p1';

alter procedure p1
    sql security invoker
    comment 'p1 procedure';

select *
from information_schema.routines
where routine_name = 'p1'
  and routine_type = 'PROCEDURE';
```

```sql
create procedure select_all_data()
begin
    select * from emp;
end;

call select_all_data();
```

```sql
-- output result to `min_sal`
create procedure select_min_sal(out min_sal double)
begin
    select min(sal) into min_sal from emp;
end;

call select_min_sal(@min_sal);

select @min_sal;
```

```sql
-- pass param to `name`
create procedure select_emp_by_name(in name varchar(10))
begin
    select * from emp where ename = name;
end;

call select_emp_by_name('SMITH');
```

```sql
create procedure select_min_sal_by_name(in name varchar(10), out min_sal double)
begin
    select min(sal) into min_sal from emp where ename = name;
end;

call select_min_sal_by_name('SMITH', @min_sal);

select @min_sal;
```

```sql
create procedure select_mgr_name(inout name varchar(10))
begin
    select e2.ename into name
    from emp e1
    left join emp e2 on e1.mgr = e2.empno
    where e1.ename = name;
end;

set @name = 'SMITH';

call select_mgr_name(@name);

select @name;
```

# Stored Function

```sql
show create function f1;

drop function f1;

show function status;

show function status like 'f1';

alter function f1
    sql security invoker
    comment 'f1 function';

select *
from information_schema.routines
where routine_name = 'f1'
  and routine_type = 'FUNCTION';
```

```sql
create function sal_by_name(name varchar(10))
    returns double
    deterministic
    contains sql
    reads sql data
begin
    return (select sal from emp where ename = name);
end;

select sal_by_name('SMITH');
```

# Error Handler

查看 error msg, `1364` 为 `error_code`, `HY000` 为 `sqlstate_value`

```txt
ERROR 1364 (HY000): Field 'age' doesn't have a default value
```

手动 error

```sql
signal sqlstate 'HY000' set message_text = 'custom error';
```

设置 error handler

```sql
create procedure test()
begin
    -- catch '1364' error_code, continue execution when encountering the error
    declare continue handler for 1364 set @error_info = 'field should not be null';

    -- catch '42S02' sqlstate_value, exit when encountering the error
    declare exit handler for sqlstate '42S02' set @error_info = 'no such table';

    -- catch '01*' error_code
    declare exit handler for sqlwarning set @error_info = 'error';

    -- catch '02*' error_code
    declare exit handler for not found set @error_info = 'error';

    -- catch other error_code
    declare exit handler for sqlexception set @error_info = 'error';

    insert into stu (id, name) value (2, 'harvey');
end;

drop procedure test;

call test();

select @error_info; -- field should not be null
```

# if

```sql
if num > 0 then
    select 'num > 0';
elseif num < 0 then
    select 'num < 0';
else
    select 'num = 0';
end if;
```

# case

```sql
case num
    when 10 then
        select 'num = 10';
    when 20 then 
        select 'num = 20';
    when 30 then 
        select 'num = 30';
    else 
        select 'other value';
end case;

case num
    when num > 0 then
        select 'num > 0';
    when num < 0 then
        select 'num < 0';
    else
        select 'num = 0';
    end case;
```

# loop

```sql
loop_label:
loop
    if num > 10 then
        leave loop_label;
    end if;
    
    set num = num + 1;
end loop;
```

# while

```sql
while_label:
while num < 10 do
    if num = 5 then
        leave while_label; -- similar to break
    end if;
    
    if num = 3 then
        iterate while_label; -- similar to continue
    end if;
    
    set num = num + 1;
end while;
```

# repeat

```sql
repeat
    set num = num + 1;
until num > 10 end repeat;
```

# Cursor

Cursor 会对 data 添加 lock, 影响性能

```sql
declare stu_id int;
declare stu_name varchar(10);
declare stu_age int;
declare stu_count int;
declare stu_cursor cursor for select id, name, age from stu;

select count(*) into stu_count from stu;

open stu_cursor;
    while stu_count > 0 do
        fetch stu_cursor into stu_id, stu_name, stu_age;
        select stu_id, stu_name, stu_age;
        set stu_count = stu_count - 1;
    end while;
close stu_cursor;
```

# Trigger

```sql
show triggers;

show create trigger before_insert_stu;

select * from information_schema.triggers;

drop trigger before_insert_stu;
```

```sql
create trigger before_insert_stu
    before insert
    on stu
    for each row
begin
    insert into stu_log (content) value ('...');
end;
```



