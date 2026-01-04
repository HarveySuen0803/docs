# float api

```sql
select format(10 / 3, 2); -- 3.33
```

# string api

```sql
select charset(ename) from emp; -- utf8

select length(ename) from emp; -- 5

select concat(ename, '\'s job is ', job) from emp; -- SMITH's job is CLERK

select concat(ucase(substr(ename, 1, 1)), lcase(substr(ename, 2))) as 'employ name' from emp; -- Smith

-- return the position of 'cd' in 'abcdef', and returns 0 if it is not found
-- dual is a meta table used for testing
select instr('abcdef', 'cd') from dual; -- 3

select ucase(ename) from emp; -- SMITH
select lcase(ename) from emp; -- smith

-- take two characters from left to right
select left(ename, 2) from emp; -- SM

-- take three characters from right to left
select right(ename, 3) from emp; -- ITH

-- replace `MANAGER` with `manager`
select ename, replace(job, 'MANAGER', 'manager') from emp;

select strcmp('sun', 'sun') from dual; -- 0
select strcmp('abc', 'abd') from dual; -- -1
select strcmp('abd', 'abc') from dual; -- 1
select strcmp('sun', 'Sun') from dual; -- returns -1 if the table is case sensitive, 0 if the table is case insensitive

select substr(ename, 2) from emp; -- MITH
select substr(ename, 2, 3) from emp; -- MIT

select trim(' harvey ') from dual; -- 'harvey'
select ltrim(' harvey ') from dual; -- 'harvey '
select rtrim(' harvey ') from dual; -- ` harvey`
```

# date api

```sql
select now();

select current_date(); -- 2021-09-18

select current_time(); -- 21:17:37

select current_timestamp(); -- 2021-09-18 21:18:23

select unix_timestamp(); -- 1632038623

select date ('2023-11-22 10:20:30'); -- 2023-11-22
select time('2023-11-22 10:20:30'); -- 10:20:30
select year('2023-11-22 10:20:30'); -- 2023
select month('2023-11-22 10:20:30'); -- 11
select day('2023-11-22 10:20:30'); -- 22
select hour('2023-11-22 10:20:30'); -- 10
select minute('2023-11-22 10:20:30'); -- 20
select second('2023-11-22 10:20:30'); -- 30
select from_unixtime(1632038623, '%Y-%m-%d %H:%i:%s'); -- 2021-09-19 16:03:43

select last_day('2023-11-11'); -- 2023-11-30

select datediff('2023-11-11', '2023-11-22'); -- -11

select timediff('2023-11-11 10:20:30', '2023-11-22 20:30:40'); -- -274:10:10

select date_add('2023-11-11 10:20:30', interval 10 second); -- 2023-11-11 10:20:40

select date_sub('2023-11-11 10:20:30', interval 10 second ); -- 2023-11-11 10:20:20

insert into message(id, content, create_timestamp) values(1, 'hello world', current_timestamp());
```

# system api

```sql
select database()

select user(); -- root@192.168.10.2

select md5('hello world'); -- 5eb63bbbe01eeed093cb22bb8f5acdc3
```

# control api

```sql
select if(true, "harvey", "bruce"); -- harvey
select if(false, "harvey", "bruce"); -- bruce

select ifnull("harvey", "bruce") from dual; -- harvey
select ifnull(null, "bruce") from dual; -- bruce

select ename, () as job
from emp;

select
  case 
    	when job = 'CLERK' then 'clerk'
    	when job = 'MANAGER' then 'manager'
    	when job = 'SALESMAN' then 'salesman'
    	else job
	end
from emp;

select if(balance is null, 0.0, balance) from emp;

select ifnull(balance, 0.0) as balance from emp;

select exists(select * from stus where id = 1);
```

