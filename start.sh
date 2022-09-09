#!/bin/bash
docker-compose up -d

docker-compose exec mongo "mongoimport --db iot --collection test --jsonArray /home/input_docs-archives/device_measure_1000.json"

docker-compose exec mongo "mongoimport --db grafo-db --collection graphs /home/input_docs-archives/example_graph.json"
