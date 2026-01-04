# CAdvisor

CAdvisor (Container Advisor) provides container users an understanding of the resource usage and performance characteristics of their running containers. 

It is a running daemon that collects, aggregates, processes, and exports information about running containers. 

Specifically, for each container it keeps resource isolation parameters, historical resource usage, histograms of complete historical resource usage and network statistics. This data is exported by container and machine-wide.

# InfluxDB

InfluxDB is an open source time series database written in Rust, using Apache Arrow, Apache Parquet, and Apache DataFusion as its foundational building blocks. 

This latest version (3.x) of InfluxDB focuses on providing a real-time buffer for observational data of all kinds (metrics, events, logs, traces, etc.) that is queryable via SQL or InfluxQL, and persisted in bulk to object storage as Parquet files, which other third-party systems can then use. 

# Granfana

Grafana is a metrcs dashboard, allows you to query, visualize, alert on and understand your metrics no matter where they are stored.