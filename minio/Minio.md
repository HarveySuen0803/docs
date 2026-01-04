# install Minio with Docker

pull image

```shell
docker image pull minio/minio:RELEASE.2023-10-14T05-17-22Z
```

startup Minio with multi data volume

```shell
docker volume create minio-conf
docker volume create minio-data-1
docker volume create minio-data-2
docker volume create minio-data-3
docker volume create minio-data-4

sudo mkdir -p /opt/minio

sudo ln -s /var/lib/docker/volumes/minio-conf/_data /opt/minio/conf
sudo ln -s /var/lib/docker/volumes/minio-data-1/_data /opt/minio/data-1
sudo ln -s /var/lib/docker/volumes/minio-data-2/_data /opt/minio/data-2
sudo ln -s /var/lib/docker/volumes/minio-data-3/_data /opt/minio/data-3
sudo ln -s /var/lib/docker/volumes/minio-data-4/_data /opt/minio/data-4
```

```shell
docker container run \
    --name minio \
    --network global \
    --privileged \
    -p 9000:9000 \
    -p 9001:9001 \
    -v minio-conf:/root/.minio \
    -v minio-data-1:/data-1 \
    -v minio-data-2:/data-2 \
    -v minio-data-3:/data-3 \
    -v minio-data-4:/data-4 \
    -e "MINIO_ROOT_USER=minioadmin" \
    -e "MINIO_ROOT_PASSWORD=minioadmin" \
    -d minio/minio:RELEASE.2023-10-14T05-17-22Z server --console-address ":9001" /data-{1...4}
```

startup Minio with single data volume

```shell
docker volume create minio-conf
docker volume create minio-data

sudo mkdir -p /opt/minio

sudo ln -s /var/lib/docker/volumes/minio-conf/_data /opt/minio/conf
sudo ln -s /var/lib/docker/volumes/minio-data/_data /opt/minio/data
```

```shell
docker container run \
    --name minio \
    --privileged \
    -p 9000:9000 \
    -p 9001:9001 \
    -v minio-conf:/root/.minio \
    -v minio-data:/data \
    -e "MINIO_ROOT_USER=minioadmin" \
    -e "MINIO_ROOT_PASSWORD=minioadmin" \
    -d minio/minio:RELEASE.2023-10-14T05-17-22Z server --console-address ":9001" /data
```

access http://127.0.0.1:9001

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241749820.png)

# Minio cluster

startup Minio (ip: 192.168.10.101, 192.168.10.102, 192.168.10.103)

```shell
docker container run \
    --name minio \
    --privileged \
    -e "MINIO_ROOT_USER=minioadmin" \
    -e "MINIO_ROOT_PASSWORD=minioadmin" \
    -p 9000:9000 \
    -p 9001:9001 \
    -v minio-config:/root/.minio \
    -v minio-data-1:/data-1 \
    -v minio-data-2:/data-2 \
    -v minio-data-3:/data-3 \
    -v minio-data-4:/data-4 \
    -d minio/minio:RELEASE.2023-10-14T05-17-22Z server --console-address ":9001" \
        http://192.168.10.101:9001/data-1 \
        http://192.168.10.101:9001/data-2 \
        http://192.168.10.101:9001/data-3 \
        http://192.168.10.101:9001/data-4 \
        http://192.168.10.102:9001/data-1 \
        http://192.168.10.102:9001/data-2 \
        http://192.168.10.102:9001/data-3 \
        http://192.168.10.102:9001/data-4 \
        http://192.168.10.103:9001/data-1 \
        http://192.168.10.103:9001/data-2 \
        http://192.168.10.103:9001/data-3 \
        http://192.168.10.103:9001/data-4 \
```

# install Minio client

```shell
curl -LJO https://dl.min.io/client/mc/release/linux-arm64/mc

sudo chmod +x ./mc

sudo mv ./mc /usr/local/bin
```

# basic operation

```shell
mc config host ls

mc config host add minio-server http://192.168.10.101:9000 minioadmin minioadmin

mc config host remove minio-server

mc ls minio-server

# check disk usage
mc du minio-server

# create bucket
mc mb minio-server/bucket-file

# remove bucket
#   --force
#   --dangerous  allow site-wide removal of objects
mc rb minio-server/bucket-file

mc ls minio-server/bucket-file

# download file
mc cp minio-server/bucket-file/test.txt ./test.txt

# upload file
mc cp ./test.txt minio-server/bucket-file/test.txt
```

# user operation

```shell
mc admin user list minio-server

mc admin user add minio-server harvey 11111111

mc admin user info minio-server harvey

mc admin user disable minio-server harvey 

mc admin user enable minio-server harvey

mc admin user remove minio-server harvey
```

# policy operation

```shell
mc admin policy list minio-server

mc admin policy info minio-server readonly

mc admin policy create minio-server harvey-admin /opt/minio/config/harvey-admin.json

mc admin policy attach minio-server harvey-admin --user harvey

mc admin policy remove minio-server harvey-admin
```

# set policy

set policy file (/opt/minio/config/harvey-admin.json)

```json
{
    "Version":"2012-10-17",
    "Statement":[
        {
            "Effect":"Allow",
            "Principal":{
                "AWS":[
                    "*"
                ]
            },
            "Action":[
                "s3:GetBucketLocation",
                "s3:ListBucketMultipartUploads"
            ],
            "Resource":[
                "arn:aws:s3:::bucket-file"
            ]
        },
        {
            "Effect":"Allow",
            "Principal":{
                "AWS":[
                    "*"
                ]
            },
            "Action":[
                "s3:DeleteObject",
                "s3:ListMultipartUploadParts",
                "s3:PutObject",
                "s3:AbortMultipartUpload"
            ],
            "Resource":[
                "arn:aws:s3:::bucket-file/*"
            ]
        }
    ]
}
```

create policy

```shell
mc admin policy create minio-server harvey-admin /opt/minio/config/harvey-admin.json
```

attach policy to user

```shell
mc admin policy attach minio-server harvey-admin --user harvey
```

