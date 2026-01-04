# cross join

```sql
select * from stu cross join dept;
```

# self join

```sql
select employee.ename as 'employee name', employer.ename as 'employer name'
from emp employee
join emp employer
on employee.mgr = employer.deptno;
```

# inner join

```sql
-- inner join have the same effect as outer join, but are more efficient
select ename, e.deptno, dname, d.deptno
from emp e
inner join dept d
on e.deptno = d.deptno;
```

# outer join

```sql
select ename, e.deptno, dname, d.deptno
from emp e, dept d
where e.depnot = d.deptno;

select ename, dname
from emp e
outer join dept d
on e.deptno = d.deptno

select ename, dname
from emp e
left join dept d
on e.deptno = d.deptno;

select ename, dname
from emp e
right join dept d
on e.deptno = d.deptno;
```

# sub query

```sql
select *
from emp
where deptno = (
    select deptno
    from emp
    where ename = "smith"
);

select *
from emp
where job in (
    select job
    from emp
    where deptno = 10
);

select *
from (
    select ename, deptno
    from emp
    where deptno = 10
) temp, dept
where temp.deptno = dept.deptno;

-- Sub Query 查询一条数据给 Outer Query 使用
select *
from emp
where (job, deptno) = (
    select job, deptno
    from emp
    where ename = 'smith'
) && ename != 'smith';

-- exists 是 Outer Query 查询一条数据给 Sub Query 使用, Sub Query 需要 Outer Query 的字段进行查询, 这就属于 Correlated Sub Query.
select *
from emp
where exists (
    select 1
    from salgrade
    where salgrade.grade = 1
      and emp.sal > salgrade.losal
      and emp.sal < salgrade.hisal
);
```

