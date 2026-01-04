# install XXLJob with Docker

install XXL-Job source code

```shell
curl -LJO https://github.com/xuxueli/xxl-job/archive/refs/tags/2.4.0.zip
tar -zxvf xxl-job-2.4.0.zip
```

pull xxl-job image

```shell
docker image pull xuxueli/xxl-job-admin:2.4.0
```

create mysql database

```sql
source ./xxl-job-2.4.0/doc/db/tables_xxl_job.sql
```

create mysql user

```sql
CREATE USER 'xxl-job'@'%' IDENTIFIED BY 'xxl-job';
GRANT ALL PRIVILEGES ON `xxl-job`.* TO 'xxl-job'@'%';
FLUSH PRIVILEGES;
```

startup image

```shell
docker run -d \
  --name xxl-job-admin \
  --platform linux/amd64 \
  --network global \
  -p 20500:8080 \
  -e "XXL_JOB_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver" \
  -e "XXL_JOB_DATASOURCE_URL=jdbc:mysql://mysql:20100/xxl_job??useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&serverTimezone=Asia/Shanghai" \
  -e "XXL_JOB_DATASOURCE_USERNAME=xxl-job" \
  -e "XXL_JOB_DATASOURCE_PASSWORD=xxl-job" \
  --link mysql:mysql \
  xuxueli/xxl-job-admin:2.4.0
```

access http://127.0.0.1:20500/xxl-job-admin

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241755438.png)

