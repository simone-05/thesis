#!/bin/bash
docker-compose up -d && \

docker-compose exec mongo mongoimport --db iot --collection test /home/input_docs-archives/device_measure_1000.json 2> /dev/null && \

docker-compose exec mongo mongoimport --db grafo-db --collection graphs /home/input_docs-archives/example_graph.json 2> /dev/null
