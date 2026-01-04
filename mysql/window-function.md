# Window Operation

```sql
-- 不分组, 全部计算 sum(sal)
select id, dept_id, name, sum(sal) over ()
from emp;
-- id = 1, dept_id = 1, sal = 100, sum(sal) = 100 + 200 + 300 + 100 + 200 + 100
-- id = 2, dept_id = 1, sal = 200, sum(sal) = 100 + 200 + 300 + 100 + 200 + 100
-- id = 3, dept_id = 1, sal = 300, sum(sal) = 100 + 200 + 300 + 100 + 200 + 100
-- id = 4, dept_id = 2, sal = 100, sum(sal) = 100 + 200 + 300 + 100 + 200 + 100
-- id = 5, dept_id = 2, sal = 200, sum(sal) = 100 + 200 + 300 + 100 + 200 + 100
-- id = 6, dept_id = 3, sal = 100, sum(sal) = 100 + 200 + 300 + 100 + 200 + 100

-- 按照 dept_id 分组, 全部计算 sum()
select id, dept_id, name, sum(sal) over (partition by dept_id)
from emp;
-- id = 1, dept_id = 1, sal = 100, sum(sal) = 100 + 200 + 300
-- id = 2, dept_id = 1, sal = 200, sum(sal) = 100 + 200 + 300
-- id = 3, dept_id = 1, sal = 300, sum(sal) = 100 + 200 + 300
-- id = 4, dept_id = 2, sal = 100, sum(sal) = 100 + 200
-- id = 5, dept_id = 2, sal = 200, sum(sal) = 100 + 200
-- id = 6, dept_id = 3, sal = 100, sum(sal) = 100

-- 通过 window keyword 抽离 window function
select id, dept_id, name, sum(sal) over w
from emp
window w (partition by dept_id);

-- 按照 dept_id 分组, 按照 sal 排序, 一条一条计算 sum()
select id, sal, sum(sal) over (partition by dept_id order by sal)
from emp;
-- id = 1, sal = 100, sum(sal) =   0 +   0 + 100
-- id = 2, sal = 200, sum(sal) =   0 + 100 + 200
-- id = 3, sal = 300, sum(sal) = 100 + 200 + 300

-- 设置作用范围, 前 2 行 到 当前行
select id, sal, sum(sal) over (partition by dept_id order by sal rows between 2 preceding and current row)
from emp;
-- id = 1, sal = 100, sum(sal) =   0 +   0 + 100
-- id = 2, sal = 200, sum(sal) =   0 + 100 + 200
-- id = 3, sal = 300, sum(sal) = 100 + 200 + 300
-- id = 4, sal = 400, sum(sal) = 200 + 300 + 400

-- 设置作用范围, 前 1 行 到 后 1 行
select id, sal, sum(sal) over (partition by dept_id order by sal rows between 1 preceding and 1 following)
from emp;
-- id = 1, sal = 100, sum(sal) =   0 + 100 + 200
-- id = 2, sal = 200, sum(sal) = 100 + 200 + 300
-- id = 3, sal = 300, sum(sal) = 200 + 300 + 400
-- id = 4, sal = 400, sum(sal) = 300 + 400 + 500
-- id = 5, sal = 500, sum(sal) = 400 + 500 +   0

-- 设置作用范围, 第 1 行 到 最后 1 行
select id, sal, sum(sal) over (partition by dept_id order by sal rows between unbounded preceding and unbounded following)
from emp;
-- id = 1, sal = 100, sum(sal) = 100 + 200 + 300 + 400
-- id = 2, sal = 200, sum(sal) = 100 + 200 + 300 + 400
-- id = 3, sal = 300, sum(sal) = 100 + 200 + 300 + 400
-- id = 4, sal = 400, sum(sal) = 100 + 200 + 300 + 400

-- 设置作用范围，前 5 天
select id, sal, sum(sal) over (partition by dept_id order by sal range interval '5' day preceding
```

# Window Function

```sql
-- 按照 dept_id 分组, 按照 sal 排序, 进行编号
select id, dept_id, sal, row_number() over (partition by dept_id order by sal)
from emp;
-- id = 1, dept_id = 1, sal = 100, row_number = 1
-- id = 2, dept_id = 1, sal = 200, row_number = 2
-- id = 3, dept_id = 1, sal = 200, row_number = 3
-- id = 4, dept_id = 1, sal = 300, row_number = 4
-- id = 5, dept_id = 2, sal = 100, row_number = 1
-- id = 6, dept_id = 2, sal = 200, row_number = 2

-- 类似 row_number(), 但是相同 sal 采用相同编号
select id, sal, rank() over (partition by dept_id order by sal)
from emp;
-- id = 1, sal = 100, rank = 1
-- id = 2, sal = 200, rank = 2
-- id = 3, sal = 200, rank = 2 -- row_number() 这里是 3
-- id = 4, sal = 300, rank = 4

-- 类似 rank(), 但是相同 sal 采用相同编号后, 不影响下一个编号, 会空出一个位置
select id, dept_id, sal, dense_rank() over (partition by dept_id order by sal)
from emp;
-- id = 1, sal = 100, dense_rank = 1
-- id = 2, sal = 200, dense_rank = 2
-- id = 3, sal = 200, dense_rank = 2
-- id = 4, sal = 300, dense_rank = 3 -- rank() 这里是 4

-- 按照百分比进行编号, 公式 (rank - 1) / (rows - 1)
select id,
       dept_id,
       sal,
       rank() over (partition by dept_id order by sal),
       percent_rank() over (partition by dept_id order by sal)
from emp;
-- id = 1, sal = 100, rank = 1, percent_rank = 0   -- (0 - 1) / (6 - 1)
-- id = 2, sal = 200, rank = 2, percent_rank = 0.2 -- (2 - 1) / (6 - 1)
-- id = 3, sal = 200, rank = 3, percent_rank = 0.4 -- (3 - 1) / (6 - 1)

-- 查询前 1 条记录的 sal
select id, sal, lag(sal, 1) over (partition by dept_id order by sal) as lag_sal
from emp;
-- id = 1, sal = 100, lag_sal = null
-- id = 2, sal = 200, lag_sal = 100
-- id = 3, sal = 300, lag_sal = 200

-- 查询后 1 条记录的 sal
select id, sal, lead(sal, 1) over (partition by dept_id order by sal) as lead_sal
from emp;
-- id = 1, sal = 100, lead_sal = 100
-- id = 2, sal = 200, lead_sal = 200
-- id = 3, sal = 300, lead_sal = nul

-- 查询第 1 条记录的 sal
select id, sal, first_value(sal) over (partition by dept_id order by sal)
from emp;
-- id = 1, sal = 100, first_sal = 100
-- id = 2, sal = 200, first_sal = 100
-- id = 3, sal = 300, first_sal = 100

-- 查询最后 1 条记录的 sal
select id, sal, first_value(sal) over (partition by dept_id order by sal)
from emp;

-- 查询第 2 条记录的 sal, 查询第 3 条记录的 sal
select id,
       sal,
       nth_value(sal, 2) over (partition by dept_id order by sal) as second_value,
       nth_value(sal, 3) over (partition by dept_id order by sal) as third_value
from emp;
-- id = 1, sal = 100, second_sal = null, third_sal = null
-- id = 2, sal = 200, second_sal = 200, third_sal = null
-- id = 3, sal = 300, second_sal = 200, third_sal = 300
-- id = 4, sal = 300, second_sal = 200, third_sal = 300
-- id = 5, sal = 300, second_sal = 200, third_sal = 300

-- 按照价格顺序分 3 组
select id, sal, ntile(3) over (partition by dept_id order by sal)
from emp;
-- id = 1, sal = 100, ntile = 1
-- id = 2, sal = 200, ntile = 1
-- id = 3, sal = 300, ntile = 2
-- id = 4, sal = 400, ntile = 2
-- id = 5, sal = 500, ntile = 3
-- id = 6, sal = 600, ntile = 3

-- 按照价格顺序分 4 组
select id, sal, ntile(4) over (partition by dept_id order by sal)
from emp;
-- id = 1, sal = 100, ntile = 1
-- id = 2, sal = 200, ntile = 1
-- id = 3, sal = 300, ntile = 2
-- id = 4, sal = 400, ntile = 2
-- id = 5, sal = 500, ntile = 3
-- id = 6, sal = 600, ntile = 4 -- 最后的拆成 2 组
```



