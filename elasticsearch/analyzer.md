# Standard Analyzer

```json
POST /_analyze
{
  "text": ["hello world"],
  "analyzer": "standard"
}
```

```json
#! Elasticsearch built-in security features are not enabled. Without authentication, your cluster could be accessible to anyone. See https://www.elastic.co/guide/en/elasticsearch/reference/7.17/security-minimal-setup.html to enable security.
{
  "tokens" : [
    {
      "token" : "hello",
      "start_offset" : 0,
      "end_offset" : 5,
      "type" : "<ALPHANUM>",
      "position" : 0
    },
    {
      "token" : "world",
      "start_offset" : 6,
      "end_offset" : 11,
      "type" : "<ALPHANUM>",
      "position" : 1
    }
  ]
}
```

# IK Analyzer

IK Analyzer is good at analyzing Chinese.

install IK Analyzer

```shell
elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v8.9.0/elasticsearch-analysis-ik-8.9.0.zip

unzip -d ./analysis-ik ./elasticsearch-analysis-ik-8.9.0.zip

mv ./analysis-ik/ /opt/elasticsearch/plugin/
```

DSL

```json
POST /_analyze
{
  "text": ["我喜欢学习 Java 课程"],
  "analyzer": "ik_smart"
}
```

```json
{
  "tokens" : [
    {
      "token" : "我",
      "start_offset" : 0,
      "end_offset" : 1,
      "type" : "CN_CHAR",
      "position" : 0
    },
    {
      "token" : "喜欢",
      "start_offset" : 1,
      "end_offset" : 3,
      "type" : "CN_WORD",
      "position" : 1
    },
    {
      "token" : "学习",
      "start_offset" : 3,
      "end_offset" : 5,
      "type" : "CN_WORD",
      "position" : 2
    },
    {
      "token" : "java",
      "start_offset" : 6,
      "end_offset" : 10,
      "type" : "ENGLISH",
      "position" : 3
    },
    {
      "token" : "课程",
      "start_offset" : 11,
      "end_offset" : 13,
      "type" : "CN_WORD",
      "position" : 4
    }
  ]
}
```

Analyzer Type

- `ik_smart`: low granularity
- `ik_max_word`: high granularity

## Extend Dictionary

set the file path of the Dictionary (file: analysis-ik/config/IKAnalyzer.cfg.xml)

```xml
<entry key="ext_dict">ext_dict.dic</entry>
<entry key="ext_stopwords">ext_stopwords.dic</entry>
```

set extended word (file. ik/config/ext_dict.dic)

```
一键三连
白嫖
鸡你太美
```

set stopped word (file. ik/config/ext_stopwords.dic)

```
的
地
得
```
