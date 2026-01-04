# User

```sql
select current_user();

-- allow all ips 
create user 'sun'

create user 'sun'@'192.168.1.%'

create user 'sun'@'127.0.0.1' identified by '111';

drop user 'sun'@'127.0.0.1';

-- update self's password
set password = password('abcdef')

-- update other user's password
set password for 'sun'@'127.0.0.1' = password('abc');
```

# User Privileges

User 向 MySQL 发送操作请求后, MySQL 会先去匹配 user 和 host, 判断该 User 是否拥有 Global Privilege. 如果有, 则直接允许操作. 如果没有, 则会判断是否有拥有该 DB 的 Privilege. 如果有, 则直接操作. 如果没有, 则接着判断 Table 的 Privilege 和 Column 的 Privilege

```sql
show privileges;

show grants;

show grants for 'root'@'127.0.0.1';

-- grant privileges on db.emp
grant select, insert, delete on db.emp to 'sun'@'127.0.0.1';

grant select, insert, delete on db.* to 'sun'@'127.0.0.1';

-- grant all priviledges without grant privilege
grant all privileges on *.* to 'root'@'127.0.0.1';

-- grant all priviledges with grant priviledge
grant all privileges on *.* to 'root'@'127.0.0.1' with grant option ;

-- revoke privileges
revoke select, insert on db.emp from 'sun'@'127.0.0.1';

-- revoke all privileges
revoke all privileges on db.emp from 'sun'@'127.0.0.1';

-- flush privileges to take affect
flush privileges;
```

# Password Lifetime

Set global config, apply to global users for current process

```sql
-- Expires in 180 days
set global default_password_lifetime = 180;
```

Apply to specify users

```sql
alter user 'harvey'@'127.0.0.1' password expire interval 180 day;

alter user 'harvey'@'127.0.0.1' password expire never;
```

Set default config (file: my.cnf)

```
[mysqld]
default_password_lifetime=180
```

# Password Reuse

Set global config

```sql
-- Cannot use the 6 recently used passwords
set global password_history = 6;

-- Passwords that have been used within the past 365 days cannot be used
set global password_reuse_interval = 365;
```

set default config

```
[mysqld]
password_history=6
password_reuse_interval=365
```

# Password Validation

Install validate_password plugin to enhance password security

```sql
install plugin validate_password soname 'validate_password.so';
```

Uninstall validate_password plugin

```sql
uninstall plugin validate_password;
```

Check validation policy

```sql
show variables like 'validate_password%';
```

```console
+--------------------------------------+--------+
| Variable_name                        | Value  |
+--------------------------------------+--------+
| validate_password_check_user_name    | ON     |
| validate_password_dictionary_file    |        |
| validate_password_length             | 8      |
| validate_password_mixed_case_count   | 1      |
| validate_password_number_count       | 1      |
| validate_password_policy             | MEDIUM |
| validate_password_special_char_count | 1      |
+--------------------------------------+--------+
```

Set variable value

```sql
set global validate_password_policy = LOW;
set global validate_password_length = 1;
```

# Role

不同的 Role 拥有不同的 Privilege 作为预设, 分配给 User

```sql
select current_role();

create role 'manager'@'%', 'boss'@'%';

grant select, insert, update, delete on db.* to 'manager';

grant all privileges on *.* to 'boss' with grant option ;

show grants for 'manager';

drop role 'manager';

-- Assign roles to users
grant 'manager' to 'harvey';

-- Activate the user's role
set default role 'manager' to 'harvey';

-- Activate all roles of the user
set default role all to 'harvey';

-- Revoke the user's role
revoke 'manager' from 'harvey';
```

