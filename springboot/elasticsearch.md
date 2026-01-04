# ElasticSearch

import dependency

```xml
<dependency>
    <groupId>co.elastic.clients</groupId>
    <artifactId>elasticsearch-java</artifactId>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
<dependency>
    <groupId>jakarta.json</groupId>
    <artifactId>jakarta.json-api</artifactId>
</dependency>
```

set Properties

```properties
elasticsearch.host=127.0.0.1
elasticsearch.port=9200
elasticsearch.http=http
```

set ElasticSearchClient

```java
@Configuration
public class ElasticSearchConfiguration {
    @Value("${elasticsearch.host}")
    private String host;
    @Value("${elasticsearch.port}")
    private Integer port;
    @Value("${elasticsearch.http}")
    private String http;

    @Bean
    ElasticsearchClient elasticsearchClient() {
        RestClient restClient = RestClient.builder(new HttpHost(host, port, http)).build();
        ElasticsearchTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
        return new ElasticsearchClient(transport);
    }
    
    @Bean
    ElasticsearchAsyncClient elasticsearchAsyncClient() {
        RestClient restClient = RestClient.builder(new HttpHost(host, port, http)).build();
        ElasticsearchTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
        return new ElasticsearchAsyncClient(transport);
    }
}
```

# check whether Index exist

```java
boolean isExists = elasticsearchClient.indices().exists((e) -> e.index("user")).value();
```

# create Index

```java
CreateIndexResponse createIndexResponse = elasticsearchClient.indices().create((c) -> c.index("user"));
```

# select Index

```java
GetIndexResponse getIndexResponse = elasticsearchClient.indices().get((g) -> g.index("user"));
```

# delete Index

```java
DeleteIndexResponse deleteIndexResponse = elasticsearchClient.indices().delete((d) -> d.index("user"));
```

# insert Document

```java
CreateResponse createResponse = elasticsearchClient.create((c) -> c.index("user").id("1").document(new User()));
```

# select all Document

```java
SearchResponse<User> searchResponse = elasticsearchClient.search((s) -> {
    return s.index("user")
            .query((q) -> q.matchAll((m) -> m));
}, User.class);
```

# select Document by id

```java
GetResponse<User> getResponse = elasticsearchClient.get((g) -> g.index("user").id("1"), User.class);
```

# select Document by condition

```java
SearchResponse<User> searchResponse = elasticsearchClient.search((s) -> {
    return s.index("user")
            .query((q) -> q.match((m) -> m.field("name").query("sun")));
}, User.class);
```

# select Document by logical condition

```java
// similar to `where name = 'sun' and age = 18`
SearchResponse<User> searchResponse = elasticsearchClient.search((s) -> {
    return s.index("user")
            .query((q) -> {
                return q.bool((b) -> {
                    return b.must((must) -> {
                        return must.match((m) -> m.field("name").query("sun"));
                    }).must((must) -> {
                        return must.match((m) -> m.field("age").query(18));
                    });
                });
            });
}, User.class);

// similar to `where age >= 20 and age <= 30`
SearchResponse<User> searchResponse = elasticsearchClient.search((s) -> {
    return s.index("user")
            .query((q) -> {
                return q.range((r) -> {
                    return r.field("age")
                            .gte(JsonData.of(20))
                            .lte(JsonData.of(30));
                });
            });
}, User.class);
```

# delete Document

```java
DeleteResponse deleteResponse = elasticsearchClient.delete((d) -> d.index("user").id("1"));
```

# insert Document in batch

```java
List<User> userList = new ArrayList<>();
userList.add(new User(1, "sun", 18));
userList.add(new User(2, "xue", 28));
userList.add(new User(3, "cheng", 38));

elasticsearchClient.bulk((bulkRequest) -> {
    for (User user : userList) {
        bulkRequest.operations((operation) -> {
            return operation.create((createRequest) -> {
                return createRequest.index("user").id(user.getId() + "").document(user);
            });
        });
    }
    return bulkRequest;
});
```

# delete Document in batch

```java
List<User> userList = new ArrayList<>();
userList.add(new User(1, "sun", 18));
userList.add(new User(2, "xue", 28));
userList.add(new User(3, "cheng", 38));

elasticsearchClient.bulk((bulkRequest) -> {
    for (User user : userList) {
        bulkRequest.operations((operation) -> {
            return operation.delete((deleteRequest) -> {
                return deleteRequest.index("user").id(user.getId() + "");
            });
        });
    }
    return bulkRequest;
});
```

# pagination

```java
elasticsearchClient.search((s) -> {
    return s.index("user")
            .from(0)
            .size(5);
}, User.class);
```

# sort

```java
SearchResponse<User> searchResponse = elasticsearchClient.search((s) -> {
    return s.index("user")
            .sort((sort) -> {
                return sort.field((f) -> {
                    return f.field("age")
                            .order(SortOrder.Desc);
                });
            });
}, User.class);
```

# fuzzy search

```java
SearchResponse<User> searchResponse = elasticsearchClient.search((s) -> {
    return s.index("user")
            .query((q) -> {
                return q.fuzzy((f) -> {
                    return f.field("name")
                            .value("sun")
                            .fuzziness("1");
                });
            });
}, User.class);
```

# highlight Field

```java
SearchResponse<User> searchResponse = elasticsearchClient.search((s) -> {
    return s.index("user")
            .query((q) -> {
                return q.term((t) -> {
                    return t.field("name")
                            .value("sun");
                });
            })
            .highlight((h) -> {
                return h.fields("name", (f) -> {
                    return f.preTags("<font color='red'>")
                            .postTags("</font>");
                });
            });
}, User.class);
```

# group

```java
SearchResponse<User> searchResponse = elasticsearchClient.search((s) -> {
    return s.index("user")
            .aggregations("address_province_group", (a) -> {
                return a.terms((t) -> {
                    return t.field("address.province");
                });
            });
}, User.class);
```

# aggregation

```java
SearchResponse<User> searchResponse = elasticsearchClient.search((s) -> {
    return s.index("user")
            .aggregations("age_avg", (a) -> {
                return a.avg((avg) -> {
                    return avg.field("age");
                });
            });
}, User.class);
```

# async operation

```java
elasticsearchAsyncClient.indices().create((c) -> {
    return c.index("dept");
}).thenApply((resp) -> {
    return resp;
}).whenComplete((resp, error) -> {
    if (resp != null) {
        System.out.println(resp);
    } else {
        error.printStackTrace();
    }
});
```


