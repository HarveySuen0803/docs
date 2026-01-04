# Profile Settings

ClickHouse 采用 RBAC 的权限控制，同时支持 Profile 配置，一个 Settings Profile 可以分配给多个 User/Role，一个 User 可以同时拥有多个 Settings Profile。

- 共享同一套参数，比如最大并发、最大内存。
- 最终生效的设置由 ClickHouse 合并（有冲突时，优先级规则：直接分配给用户的 profile 优先于继承自 role 的 profile；如果多个 profile 对同一个设置有不同值，ClickHouse 会选择其中限制性更强的那个）。

```sql
CREATE SETTINGS PROFILE profile01 SETTINGS max_concurrent_queries_for_user = 10 TO user01, user02 ON CLUSTER 'datacenter_olap_ck_common_02_replica';

ALTER SETTINGS PROFILE profile01 SETTINGS max_memory_usage_for_user = 54975581388, max_concurrent_queries_for_user = 10 to user01, user02 on cluster datacenter_olap_ck_common_02_replica
```

