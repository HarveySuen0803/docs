# Mapping

Mapping is the process of defining how a document, and the fields it contains, are stored and indexed.

Each document is a collection of fields, which each have their own data type. When mapping your data, you create a mapping definition, which contains a list of fields that are pertinent to the document. A mapping definition also includes metadata fields, like the `_source` field, which customize how a document’s associated metadata is handled.

Use dynamic mapping and explicit mapping to define your data. Each method provides different benefits based on where you are in your data journey. For example, explicitly map fields where you don’t want to use the defaults, or to gain greater control over which fields are created. You can then allow Elasticsearch to add other fields dynamically.

# Type

Type used for constraint Field

- `text`: used for splittable Field
- `keyword`: used for insplittable Feild
- `long`
- `integer`
- `short`
- `byte`
- `double`
- `float`
- `boolean`
- `date`
- `object`
- `geo_point`: a point in geographical position, accept latitude-longitude pairs
- `geo_shape`: composed of multiple `geo_point`

# copy_to

copy the values of multiple fields into a group Field, which can then be queried as a single Field

```json
PUT /test
{
  "mappings": {
    "properties": {
      "first_name": {
        "type": "keyword",
        "copy_to": "full_name" 
      },
      "last_name": {
        "type": "keyword",
        "copy_to": "full_name" 
      },
      "full_name": {
        "type": "keyword"
      }
    }
  }
}
```
