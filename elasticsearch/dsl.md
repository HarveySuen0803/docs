# create Index

```json
PUT /user
{
  "mappings": {
    "properties": {
      "name": {
        "type": "keyword"
      },
      "age": {
        "type": "integer"
      },
      "adddress": {
        "type": "object",
        "properties": {
          "province": {
            "type": "keyword"
          },
          "city": {
            "type": "keyword"
          }
        }
      }
    }
  }
}
```

# select Index

```json
GET /user
```

# update Index

ElasticSearch allow to add Field, not allow to modify Field

```json
PUT /user/_mapping
{
  "properties": {
    "sex": {
      "type": "keyword"
    }
  }
}
```

# delete Index

```json
DELETE /user
```

# insert Document

```json
PUT /user/_doc/1
{
  "name": "sun",
  "age": 18,
  "address": {
    "province": "Jiangsu",
    "city": "Yangzhou"
  }
}
```

# select all Document

```json
GET /user/_search
{
  "query": {
    "match_all": {}
  }
}
```

# select Document by id

```json
GET /user/_doc/1
```

# select Document by condition

```json
// similar to `where name = 'sun'`
GET /user/_search
{
  "query": {
    "match": {
      "name": "sun"
    }
  }
}
```

# select Document by logical condition

```json
// similar to `where name = 'sun' and age = 18`
GET /user/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": "sun"
          }
        },
        {
          "match": {
            "age": 18
          }
        }
      ]
    }
  }
}

// similar to `where name = 'sun' or age = 18`
GET /user/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "name": "xue"
          }
        },
        {
          "match": {
            "age": "18"
          }
        }
      ]
    }
  }
}

// similar to `where age >= 10 and age <= 20`
GET /user/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "range": {
            "age": {
              "gte": 10,
              "lte": 20
            }
          }
        }
      ]
    }
  }
}
```

# update Document by id

update all of Document

```json
PUT /user/_doc/1
{
  "name": "sun",
  "age": 18,
  "address": {
    "province": "Jiangsu",
    "city": "Suzhou"
  }
}
```

update part of Document

```json
POST /user/_update/1
{
  "doc": {
    "address": {
      "city": "Suzhou"
    }
  }
}
```

# delete Document by id

```json
DELETE /user/_doc/1
```

# specify Field

```json
GET /user/_search
{
  "_source": ["name", "age"]
}
```

# highlight Field

```json
GET /user/_search
{
  "highlight": {
    "fields": {
      "name": {},
      "age": {}
    }
  }
}
```

# pagination

```json
// similar to `limit 0, 5`
GET /user/_search
{
  "from": 0,
  "size": 5
}
```

# sort

```json
// similar to `order by age desc`
GET /user/_search
{
  "sort": [
    {
      "age": {
        "order": "desc"
      }
    }
  ]
}
```

# group

```java
// similar to `group by address.province`
GET /user/_search
{
  "aggs": {
    "address_province_group": { // aggs name
      "terms": { // aggs type
        "field": "adddress.province"
      }
    }
  }
}
```

# aggregation

```json
// similar to `select avg(age) from user group by address.city`
GET /user/_search
{
  "aggs": {
    "address_city_group": {
      "terms": {
        "field": "adddress.city"
      }, 
      "aggs": {
        "age_avg": { // aggs name
          "avg": { // aggs type
            "field": "age"
          }
        }
      }
    }
  }
}
```
