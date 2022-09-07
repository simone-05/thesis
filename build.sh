#!/bin/bash
cd ./ang/grafo1 && ng b

cd ../../spring-db/grafo && \
    ./mvnw package -DskipTests

cd ../../spring-func-manager/grafo-func-manager && \
    ./mvnw package -DskipTests

cd ../.. && docker-compose build graphdb graphmanager

docker-compose build pymongo
