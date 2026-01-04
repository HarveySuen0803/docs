# Profile

查看 Profile 状态

```sql
show variables like 'profiling';
```

开启 Profile

```sql
set session profiling = 1;
```

查看全部的 Profile

```sql
show profiles;
```

```console
+----------+------------+---------------------------------+
| Query_ID | Duration   | Query                           |
+----------+------------+---------------------------------+
|        1 | 0.00748975 | show variables like 'profiling' |
|        2 | 0.00124625 | select * from emp               |
|        3 | 0.00376400 | select * from dept              |
+----------+------------+---------------------------------+
```

查看指定的 Profile

```sql
-- Check the last profile
show profile;

-- Check profile with id 3
show profile for query 3;
```

```console
+--------------------------------+----------+
| Status                         | Duration |
+--------------------------------+----------+
| starting                       | 0.000238 |
| Executing hook on transaction  | 0.000008 |
| starting                       | 0.000022 |
| checking permissions           | 0.000011 |
| Opening tables                 | 0.000117 |
| init                           | 0.000045 |
| System lock                    | 0.000031 |
| optimizing                     | 0.000010 |
| statistics                     | 0.000040 |
| preparing                      | 0.000059 |
| executing                      | 0.002762 |
| end                            | 0.000087 |
| query end                      | 0.000009 |
| waiting for handler commit     | 0.000026 |
| closing tables                 | 0.000023 |
| freeing items                  | 0.000218 |
| cleaning up                    | 0.000059 |
+--------------------------------+----------+
```

查看 CPU, IO 状态

```sql
show profile cpu, block io;
```

```console
+----------------------+----------+----------+------------+--------------+---------------+
| Status               | Duration | CPU_user | CPU_system | Block_ops_in | Block_ops_out |
+----------------------+----------+----------+------------+--------------+---------------+
| starting             | 0.000330 | 0.000194 |   0.000131 |            0 |             0 |
| checking permissions | 0.000245 | 0.000147 |   0.000099 |            0 |             0 |
| Opening tables       | 0.000537 | 0.000320 |   0.000216 |            0 |             0 |
| init                 | 0.000017 | 0.000009 |   0.000007 |            0 |             0 |
| System lock          | 0.000031 | 0.000018 |   0.000013 |            0 |             0 |
| optimizing           | 0.000008 | 0.000006 |   0.000002 |            0 |             0 |
| optimizing           | 0.000020 | 0.000012 |   0.000008 |            0 |             0 |
| statistics           | 0.000089 | 0.000052 |   0.000036 |            0 |             0 |
| preparing            | 0.000053 | 0.000032 |   0.000022 |            0 |             0 |
| statistics           | 0.000007 | 0.000004 |   0.000001 |            0 |             0 |
| preparing            | 0.000411 | 0.000245 |   0.000167 |            0 |             0 |
| executing            | 0.004164 | 0.004177 |   0.000000 |            0 |             0 |
| end                  | 0.000050 | 0.000036 |   0.000000 |            0 |             0 |
| query end            | 0.000044 | 0.000044 |   0.000000 |            0 |             0 |
| closing tables       | 0.000025 | 0.000025 |   0.000000 |            0 |             0 |
| freeing items        | 0.000814 | 0.000815 |   0.000000 |            0 |             0 |
| cleaning up          | 0.000647 | 0.000647 |   0.000000 |            0 |             0 |
+----------------------+----------+----------+------------+--------------+---------------+
```