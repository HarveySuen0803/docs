# CTE

```sql
with cte_emp as (
    select *
    from emp
    where name = 'SMITH'
) select * from cte_emp;

with recursive cte(n) as (
    select 1
    union all
    select n + 1 from cte where n < 10
) select * from cte where n < 7;

with recursive emp_path as (
    select emp_id, emp_name, emp_name as path
    from emp
    where mgr_id is null
    union all
    select e.emp_id, e.emp_name, concat(m.path, ' -> ', e.emp_name)
    from emp e
    join emp_path m on e.mgr_id = m.emp_id
) select * from emp_path;

with recursive emp_path as (
    select 0 as n, emp_id, emp_name, emp_name as path
    from emp
    where mgr_id is null
    union all
    select n + 1, e.emp_id, e.emp_name, concat(m.path, ' -> ', e.emp_name)
    from emp e
    join emp_path m on e.mgr_id = m.emp_id
) select * from emp_path where n < 3;
```

