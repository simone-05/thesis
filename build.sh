#!/bin/bash
chown -R $USER ./grafana/data
chmod -R 777 ./grafana/data

cd ./ang/grafo1 && npm install && ng b

cd ../../spring-db/grafo && \
    ./mvnw package -DskipTests

cd ../../spring-func-manager/grafo-func-manager && \
    ./mvnw package -DskipTests

cd ../.. && docker-compose build graphdb graphmanager

docker-compose build pymongo
