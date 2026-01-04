# copy table

```sql
create table `emp_copy` like `emp`;

insert into `emp_copy` (select * from `emp`);
```

# table deduplication

```sql
create table `emp_copy` like `emp`;

insert into `emp_copy` (select distinct * from `emp`);

delete from `emp`;

insert into `emp` (select * from `emp_copy`);
```

# query single table

```sql
-- 查询每种岗位的雇员总数, 平均工资
select `job`, count(*), avg(`sal`) from `emp` group by `job`;

-- 查询雇员总数, 以及获得补助的雇员数
select count(*), count(`comm`) from `emp`;

-- 统计没有获得补助的雇员数
select count(*), count(if(`comm` is null, 1, null)) from `emp`;

-- 统计管理者的总人数
select count(distinct `mgr`) from emp;

-- 统计 job 为 'MANAGER' 的人数
select count(if(`job` = "MANAGER", 1, null)) from `emp`;

-- 查询所有员工的年收入
select `ename`, 12 * (`sal` + ifnull(`comm`, 0)) from `emp`;

-- 查询入职时间在 1981-2-1 到 1981-5-1 内的员工
select * from `emp` where `hiredate` between '1981-2-1' and '1981-5-1';

-- 统计各个部门的平均工资, 并且是大于 1000 的, 并且按照平均工资从高到低排序, 取出前两行记录
select `deptno`, avg(`sal`)
from `emp`
group by `deptno`
having avg(`sal`) > 1000
order by avg(`sal`) desc
limit 0, 2;

-- 查询当月最后三天内入职的员工
select * from `emp` where `hiredate` between last_day(`hiredate`) - 3 and last_day(`hiredate`);

-- 查询 40 年前入职的员工
select * from `emp` where year(`hiredate`) < year(now()) - 40;

-- 首字母大写
select concat(ucase(substr(`ename`, 1, 1)), lcase(substr(`ename`, 2))) from `emp`;

-- 统计入职时长
select `ename`,
       datediff(now(), `hiredate`)                  as `total_day`,
       format(datediff(now(), `hiredate`) / 30, 1)  as `total_month`,
       format(datediff(now(), `hiredate`) / 365, 1) as `total_year`
from emp;
```

# query sub table

```sql
-- 查询至少有一名员工的部门的信息
select dept.deptno, dept.dname, temp.count
from (
    select deptno, count(*) as count_emp
    from emp
    group by deptno
    having count_emp > 0
) temp
inner join dept on temp.deptno = dept.deptno;

-- 查询工资比 SMITH 高的员工信息
select *
from emp
where sal > (
    select sal
    from emp
    where ename = 'SMITH'
);

-- 查询薪资高于部门平均薪资的员工信息
select *
from (
    select deptno, avg(sal) as avg_sal
    from emp
    group by deptno
) temp
inner join emp on emp.deptno = temp.deptno
where sal > temp.avg_sal;

-- 查询每个部门工资最高的人的详细信息
select *
from (
    select deptno, max(sal) max_sal
    from emp
    group by deptno
) temp
inner join emp on emp.deptno = temp.deptno
where emp.sal = temp.max_sal;

-- 查询部门信息, 并且显示员工人数
select *
from dept
left join (
    select deptno, count(*)
    from emp
    group by deptno
) temp on dept.deptno = temp.deptno;

-- 查询职务和 "SCOTT" 相同的其他员工
select *
from emp
where job = (
    select job
    from emp
    where ename = 'SCOTT'
) and ename != 'SCOTT';

-- 查询薪资高于部门 30 的所有员工的员工的信息
select *
from emp
where sal > all(
    select sal
    from emp
    where deptno = 30
);
```

# query multi table

```sql
-- 查询入职日期晚于上级的员工信息
select *
from emp e1
left join emp e2 on e1.mgr = e2.empno
where e1.hiredate < e2.hiredate;

-- 查询部门信息, 员工信息, 以及没有员工的部门信息
select *
from dept
left join emp on dept.deptno = emp.deptno;

-- 查询所有职务为 "CLERK" 的员工信息和部门信息
select emp.*, dept.*
from emp
left join dept on emp.deptno = dept.deptno
where emp.job = "CLERK";
```

# Stored Procedure

```sql
create procedure page_emp(in page_no int, in page_size int)
begin
    declare param1 int default 1;
    declare param2 int default 5;

    set param1 = (page_no - 1) * page_size;
    set param2 = page_size;
    
    select * from emp limit param1, param2;
end;

call page_emp(3, 10)
```

```sql
-- 查询员工和上级的薪资差距
create procedure diff_sal(in emp_id int, out result double)
begin
    declare emp_sal double default 0.0;
    declare mgr_sal double default 0.0;
    declare mgr_id int default 0;

    select emp.mgr_id into mgr_id from emp where emp.id = emp_id;

    select emp.sal into emp_sal from emp where emp.id = emp_id;

    select emp.sal into mgr_sal from emp where emp.id = mgr_id;

    select mgr_sal - emp_sal into result;
end;

call diff_sal(7369, @result);
```

```sql
-- 模拟数据
create procedure stu_fake_data(in line int)
begin
    declare i int default 0;

    while i < line do
        insert into stu (name, age) values (concat("name_", i), round(rand() * 100));
        set i = i + 1;
    end while;
end;

call stu_fake_data(10);
```

```sql
-- 根据入职年份的不同, 按照比率涨工资
create procedure update_sal()
begin
    declare emp_id int;
    declare emp_hiredate date;
    declare emp_count int default 0;
    declare emp_sal_rate int;
    declare emp_cursor cursor for select id, hiredate from emp;
    select count(*) into emp_count from emp;

    open emp_cursor;

    while emp_count > 0 do
        fetch emp_cursor into emp_id, emp_hiredate;

        select emp_id, emp_hiredate;

        if (year(emp_hiredate) > 1985) then
            set emp_sal_rate = 1.2;
        elseif (year(emp_hiredate > 1980)) then
            set emp_sal_rate = 1.5;
        else
            set emp_sal_rate = 2;
        end if;

        update emp set sal = sal * emp_sal_rate where id = emp_id;

        set emp_count = emp_count - 1;
    end while;

    close emp_cursor;
end;

call update_sal;
```

# Rising Temperature

[Problem Description](https://leetcode.cn/problems/rising-temperature/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select today.id
from Weather yesterday, Weather today
where yesterday.recordDate = date_sub(today.recordDate, interval 1 day) and yesterday.Temperature < today.Temperature;
```

# Average Time of Process per Machine

[Problem Description](https://leetcode.cn/problems/average-time-of-process-per-machine/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select a.machine_id as machine_id, round(avg(a.item_processing_time), 3) as processing_time
from (
    select machine_id, process_id, max(timestamp) - min(timestamp) as item_processing_time
    from activity
    group by machine_id, process_id
) a
group by a.machine_id;
```

# Employee Bonus

[Problem Description](https://leetcode.cn/problems/employee-bonus/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select e.name as name, b.bonus as bonus
from employee e
left join bonus b
on b.empId = e.empId
where b.bonus is null or b.bonus < 1000;
```

# Students and Examinations

[Problem Description](https://leetcode.cn/problems/students-and-examinations/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    s.student_id as student_id,
    s.student_name as student_name,
    s.subject_name as subject_name,
    ifnull(e.attended_exams, 0) as attended_exams
from (
    select
        stu.student_id as student_id,
        stu.student_name as student_name,
        sub.subject_name as subject_name
    from 
        students stu
    cross join
        subjects sub
) s
left join (
    select
        e.student_id as student_id,
        e.subject_name as subject_name,
        count(e.subject_name) as attended_exams
    from
        examinations e
    group by
        e.student_id,
        e.subject_name
) e 
on
    s.student_id = e.student_id and
    s.subject_name = e.subject_name
order by
    s.student_id,
    s.subject_name;
```

```sql
select
    st.student_id as student_id,
    st.student_name as student_name,
    st.subject_name as subject_name,
    count(ex.subject_name) as attended_exams 
from (
    select
        st.student_id as student_id,
        st.student_name as student_name,
        su.subject_name as subject_name
    from
        students as st 
    cross join
        subjects as su
) st
left join
    examinations ex 
on
    ex.student_id = st.student_id and st.subject_name = ex.subject_name
group by
    st.student_id, st.subject_name 
order by
    st.student_id, st.subject_name 
```

```sql
select
    st.student_id as student_id,
    st.student_name as student_name,
    su.subject_name as subject_name,
    count(ex.subject_name) as attended_exams 
from
    students st
cross join
    subjects su
left join
    examinations ex 
on
    ex.student_id = st.student_id and su.subject_name = ex.subject_name
group by
    st.student_id, su.subject_name 
order by
    st.student_id, su.subject_name 
```

# Managers with at Least 5 Direct Reports

[Problem Description](https://leetcode.cn/problems/managers-with-at-least-5-direct-reports/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    e.name as name
from
    employee as e
where
    e.id in (
        select
            e.managerId as managerId
        from
            employee as e
        group by
            e.managerId
        having
            count(e.managerId) >= 5
    )
```

```sql
select
    e1.name
from
    employee e1
inner join
    employee e2
on
    e1.id = e2.managerId
group by
    e1.id
having
    count(e1.id) >= 5
```

# Confirmation Rate

[Problem Description](https://leetcode.cn/problems/confirmation-rate/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    s.user_id as user_id,
    round(count(case when c.action = 'confirmed' then s.user_id end) / count(s.user_id), 2) as confirmation_rate
from
    signups as s
left join
    confirmations as c
on
    s.user_id = c.user_id
group by
    s.user_id
```

# Average Selling Price

[Problem Description](https://leetcode.cn/problems/average-selling-price/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    *
from
    prices as p
left join
    unitssold as u
on
    u.product_id = p.product_id and
    u.purchase_date >= p.start_date and
    u.purchase_date <= p.end_date
```

```txt
| product_id | start_date | end_date   | price | product_id | purchase_date | units |
| ---------- | ---------- | ---------- | ----- | ---------- | ------------- | ----- |
| 1          | 2019-02-17 | 2019-02-28 | 5     | 1          | 2019-02-25    | 100   |
| 1          | 2019-03-01 | 2019-03-22 | 20    | 1          | 2019-03-01    | 15    |
| 2          | 2019-02-01 | 2019-02-20 | 15    | 2          | 2019-02-10    | 200   |
| 2          | 2019-02-21 | 2019-03-31 | 30    | 2          | 2019-03-22    | 30    |
| 3          | 2019-02-21 | 2019-03-31 | 30    | null       | null          | null  |
```

```sql
select
    p.product_id,
    ifnull(round(sum(p.price * u.units) / sum(u.units), 2), 0) as average_price
from
    prices as p
left join
    unitssold as u
on
    u.product_id = p.product_id and
    u.purchase_date >= p.start_date and
    u.purchase_date <= p.end_date
group by
    p.product_id
```

```sql
select
    p.product_id,
    case
        when count(u.product_id) = 0 then 0
        else round(sum(p.price * u.units) / sum(u.units), 2)
    end as average_price
from
    prices as p
left join
    unitssold as u
on
    u.product_id = p.product_id and
    u.purchase_date >= p.start_date and
    u.purchase_date <= p.end_date
group by
    p.product_id
```

# Percentage of Users Attended a Contest

[Problem Description](https://leetcode.cn/problems/percentage-of-users-attended-a-contest/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    r.contest_id as contest_id,
    round(count(r.contest_id) / (select count(1) from users) * 100, 2) as percentage
from
    register r
group by
    r.contest_id
order by
    percentage desc,
    r.contest_id
```

# Queries Quality and Percentage

[Problem Description](https://leetcode.cn/problems/queries-quality-and-percentage/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    q.query_name as query_name,
    round(avg(q.rating / q.position), 2) as quality,
    round(count(if(q.rating < 3, 1, null)) / count(1) * 100, 2) as poor_query_percentage
from
    queries as q
where
    q.query_name is not null
group by
    q.query_name
```

# Monthly Transactions I

[Problem Description](https://leetcode.cn/problems/monthly-transactions-i/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    date_format(trans_date,'%Y-%m') as month,
    country,
    count(1) as trans_count,
    sum(if(state = 'approved', 1, 0)) as approved_count,
    sum(amount) as trans_total_amount,
    sum(if(state = 'approved', amount, 0)) as approved_total_amount
from
    transactions
group by
    month, country
```

# Immediate Food Delivery II

[Problem Description](https://leetcode.cn/problems/immediate-food-delivery-ii/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    round(
        count(
            if(order_date = customer_pref_delivery_date, 1, null)
        ) / count(1) * 100, 2
    ) as immediate_percentage
from
    delivery
where
    (customer_id, order_date) in (
        select
            customer_id, min(order_date) as min_order_date
        from
            delivery
        group by
            customer_id
    )
```

# Game Play Analysis IV

[Problem Description](https://leetcode.cn/problems/game-play-analysis-iv/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    round((
        select
            count(1)
        from
            activity
        where
            (player_id, event_date) in (
                select
                    player_id, date_add(min(event_date), interval 1 day) as second_date
                from
                    activity
                group by
                    player_id
            )
    ) / count(distinct player_id), 2) as fraction
from
    activity
```

# Number of Unique Subjects Taught by Each Teacher

[Problem Description](https://leetcode.cn/problems/number-of-unique-subjects-taught-by-each-teacher/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select 
    t.teacher_id as teacher_id, 
    count(distinct t.subject_id) as cnt
from
    teacher as t
group by 
    t.teacher_id
```

# User Activity for the Past 30 Days I

[Problem Description](https://leetcode.cn/problems/user-activity-for-the-past-30-days-i/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    a.activity_date as day,
    count(distinct a.user_id) as active_users
from
    activity as a
where
    a.activity_date between date_sub('2019-07-27', interval 29 day) and '2019-07-27'
group by
    a.activity_date
```

# Sales Analysis III

[Problem Description](https://leetcode.cn/problems/sales-analysis-iii/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    p.product_id as product_id,
    p.product_name as product_name
from
    (
        select
            product_id
        from
            sales
        group by
            product_id
        having
            count(sale_date between '2019-01-01' and '2019-03-31' or null) = count(1)
    ) as s
inner join
    product as p
on
    s.product_id = p.product_id
```

```sql
select
    p.product_id as product_id,
    p.product_name as product_name
from
    (
        select
            product_id
        from
            sales
        group by
            product_id
        having
            min(sale_date) >= '2019-01-01' and max(sale_date) <= '2019-03-31'
    ) as s
inner join
    product as p
on
    s.product_id = p.product_id
```

```sql
select
    p.product_id as product_id,
    p.product_name as product_name
from
    sales as s
inner join
    product as p
on
    s.product_id = p.product_id
group by
    product_id
having
    min(sale_date) >= '2019-01-01' and max(sale_date) <= '2019-03-31'
```

# The Number of Employees Which Report to Each Employee

[Problem Description](https://leetcode.cn/problems/the-number-of-employees-which-report-to-each-employee/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    e2.employee_id as employee_id,
    e2.name as name,
    e1.reports_count as reports_count,
    e1.average_age as average_age
from
    (
        select
            reports_to,
            count(1) as reports_count,
            round(avg(age)) as average_age
        from
            employees
        where
            reports_to is not null
        group by
            reports_to
        having
            count(reports_to) > 0
    ) as e1
inner join
    employees as e2
on
    e1.reports_to = e2.employee_id
order by
    e2.employee_id
```

# Triangle Judgement

[Problem Description](https://leetcode.cn/problems/triangle-judgement/description/?envType=study-plan-v2&envId=sql-free-50)

```sql
select
    x,
    y,
    z,
    if (x + y > z and x + z > y and y + z > x, 'Yes', 'No') as triangle
from
    triangle
```