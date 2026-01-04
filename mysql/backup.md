# Backup

```sql
-- backup tables
mysqldump -h127.0.0.1 -uroot -p111 db tbl1 tbl2 tbl3 > /home/harvey/bak.sql

-- backup databases
mysqldump -h127.0.0.1 -uroot -p111 -B db1 db2 db3 > /home/harvey/bak.sql

-- backup all databases
mysqldump -h127.0.0.1 -uroot -p111 -A > /home/harvey/bak.sql

-- backup rows
mysqldump -h127.0.0.1 -uroot -p111 db tbl --where="id <= 15" > /home/harvey/bak.sql

-- backup excluding some tables
mysqldump -h127.0.0.1 -uroot -p111 db --ignore-table tbl > /home/harvey/bak.sql

-- backup without table strcuture (only data).
mysqldump -h127.0.0.1 -uroot -p111 db tbl --no-create-info > /home/harvey/bak.sql

-- backup including Stored Procedure and Stored Function
mysqldump -h127.0.0.1 -uroot -p111 db tbl -R -E > /home/harvey/bak.sql

-- source bak file
source /home/harvey/bak.sql

-- restore data
mysql -h127.0.0.1 -uroot -p111 < /home/harvey/bak.sql

-- restore to specify DB
mysql -h127.0.0.1 -uroot -p111 db < /home/harvey/bak.sql
```

