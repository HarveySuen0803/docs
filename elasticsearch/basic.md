# ElasticSearch

Elasticsearch is a distributed, RESTful search and analytics engine capable of solving a growing number of use cases. As the heart of the Elastic Stack (ElasticSearch + Kibanan + Logstash + Beats), it centrally stores your data for lightning fast search, fine‑tuned relevancy, and powerful analytics that scale with ease.

ElasticSearch architecture

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241745869.png)

OLTP (Online Transaction Processing) used for process database transaction, such as MySQL.

OLAP (Online Analytical Processing) used for analyze aggregated data, such as ElasticSearch.

# install ElasticSearch with Docker

pull ElasticSearch

```shell
docker image pull elasticsearch:8.9.0
```

set volume

```shell
docker volume create elasticsearch-config
docker volume create elasticsearch-data
docker volume create elasticsearch-plugin
docker volume create elasticsearch-log

sudo mkdir -p /opt/elasticsearch

sudo ln -s /var/lib/docker/volumes/elasticsearch-config/_data /opt/elasticsearch/config
sudo ln -s /var/lib/docker/volumes/elasticsearch-data/_data /opt/elasticsearch/data
sudo ln -s /var/lib/docker/volumes/elasticsearch-plugin/_data /opt/elasticsearch/plugin
sudo ln -s /var/lib/docker/volumes/elasticsearch-log/_data /opt/elasticsearch/log
```

startup ElasticSearch

```shell
docker container run \
    --name elasticsearch \
    --network global \
    --privileged \
    -p 9200:9200 \
    -p 9300:9300 \
    -e ES_JAVA_OPTS="-Xms512m -Xmx512m" \
    -e discovery.type=single-node \
    -e xpack.security.enabled=false \
    -v elasticsearch-config:/usr/share/elasticsearch/config \
    -v elasticsearch-data:/usr/share/elasticsearch/data \
    -v elasticsearch-plugin:/usr/share/elasticsearch/plugins \
    -v elasticsearch-log:/usr/share/elasticsearch/logs \
    -d elasticsearch:8.9.0
```

access http:127.0.0.1:9200

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241745871.png)

# install Kibana with Docker

pull Kibana

```shell
docker image pull kibana:8.9.0
```

startup Kibana

```shell
docker container run \
    --name kibana \
    --network global \
    --privileged \
    -p 5601:5601 \
    -e ELASTICSEARCH_HOSTS=http://elasticsearch:9200 \
    -d kibana:8.9.0
```

access http:127.0.0.1:5601

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241745872.png)

# install Elasticvue

install Elasticvue

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241745873.png)

access Elasticvue

![](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/202312241745874.png)

# ElasticSearch Config

```yaml
# current service's local ip (def. 127.0.0.1), when this config is turned on, the project is automatically transferred to product env
network.host: 127.0.0.1

# current Service's public IP
network.public.host: 112.22.48.202

cluster.name: elasticsearch-cluster

node.name: elasticsearch-node-01

node.roles: [master, data, transform]

# used for service
http.port: 9201

# used for node communication
transport.port: 9301

# eligible-master node
discovery.seed_hosts: ["192.168.31.17:9301", "192.168.31.17:9302", "192.168.31.17:9303"]

# active-master node (do not use this setting when restarting node or when adding new node to an existing cluster)
cluster.initial_master_nodes: ["192.168.31.17:9301", "192.168.31.17:9302"]

# data dir path
path.data: ../data

# logs dir path
path.logs: ../logs

# CORS
http.cors.enabled: true
http.cors.allow-origin: "*"
```

# ElasticSearch Cluster

# bootstrap check

Collectively, we have a lot of experience with users suffering unexpected issues because they have not configured important settings. In previous versions of Elasticsearch, misconfiguration of some of these settings were logged as warnings. Understandably, users sometimes miss these log messages. To ensure that these settings receive the attention that they deserve, Elasticsearch has bootstrap checks upon startup.

These bootstrap checks inspect a variety of Elasticsearch and system settings and compare them to values that are safe for the operation of Elasticsearch. If Elasticsearch is in development mode, any bootstrap checks that fail appear as warnings in the Elasticsearch log. If Elasticsearch is in production mode, any bootstrap checks that fail will cause Elasticsearch to refuse to start.

There are some bootstrap checks that are always enforced to prevent Elasticsearch from running with incompatible settings. These checks are documented individually.

# Node

Node is an instance of Elasticsearch.

Node Role

- master node: contains single active-master node and multi eligible-master node, active-master node used for manage cluster, eligible-master node used for replace the active-master node
- data node: process data
- ingest node: preproccess data

# Shard

Each Index in Elasticsearch is divided into one or more Shard, each of which may be replicated across multiple Node to protect against hardware failures.

Primary shard used for reading and writing.

Replica shard used for reading and supplement Primary Shard.

# Index

Index is similar to table, a collection of document of the same JSON format.

Index Role

- `aliases` is index alias
- `settings` is index setting
- `mappings` is similar to schcema, used for constraint Field

# Document

Document is similar to row

Document composition

- `_index` is index name
- `_id` is document id
- `_version` is current Document version
- `_seq_no` is current Index version
- `_primary_term`
- `_source` is document data





































