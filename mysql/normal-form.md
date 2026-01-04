# 1NF

1NF 要求所有的 Field 都满足 Atomicity.

`tbl(sid, name, phone)` 存储了 `val(1, 'harvey', '110, 120')`, 其中 `phone` 不满足 Atomicity, 所以这张表不满足 1NF, 可以存储两份数据 `val(1, 'harvey', '110')` 和 `val(2, 'harvey', '120')`.

# 2NF

2NF 要求必须有 Primary Key, 且 Other Field 必须完全依赖 Primary Key, 不能是部分依赖. 如果发生了部分依赖, 就需要单独拆分一张表, 否则会出现大量冗余.

`tbl(sid, cid, age, grade), key(sid, cid)` 中, `grade` 完全依赖于 `key(sid, cid)`, 而 `age` 完全依赖于 `key(sid)`, 部分依赖于 `key(sid, cid)`, 所以这张表不满足 2NF, 可以单独抽成 `tbl1(sid, age)` 和 `tbl2(sid, cid, grade)`.

# 3NF

3NF 要求 Other Field 之间, 不能有依赖关系.

`tbl(sid, cid, sname, cname), key(sid)` 中, `cname` 依赖于 `cid`, 所以这张表不满足 3NF, 可以单独抽成 `tbl1(sid, sname, cid)` 和 `tbl2(cid, cname)`.

# BCNF

BCNF 要求所有的 Primary Field 不能依赖于 Candicate Key.

`tbl(id, no, name), key(id)` 中, 其中 `key(id)` 和 `key(no)` 都是 Candicate Key, 而 `no` 有可以一一对应 `id`, 即 `no` 依赖于 `id`, 所以这张表不满足 BCNF, 可以单独抽成 `tbl1(id, name)` 和 `tbl2(no, name)`.

# 4NF

4NF 要求不能有 Non-Trivial Multi-Valued Dependency.

`tbl(id, name, phone, address)` 中, 一个 `id` 可以对应多个 `phone` 和 `address`, 即产生了 Non-Trivial Multi-Valued Dependency, 所以这张表不满足 4NF, 可以单独抽成 `tbl1(id, name, phone)` 和 `tbl2(id, address)`.

# 5NF

5NF 要求不能有 Join Dependency.

`tbl(id, name, age, address)` 可以拆分为 `tbl1(id, name)`, `tbl2(id, age)` 和 `tbl3(id, address)`, 并且最终可以无损连接拼成 `tbl(id, name, age, address)`, 则说明该表具有 Join Dependency, 则不满足 5NF.