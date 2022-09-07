#!/bin/bash
code ./ang/grafo1 \
    && code ./spring-func-manager/grafo-func-manager \
    && docker-compose up -d \
    && gnome-terminal --tab -- bash -c "cd ./spring-func-manager/grafo-func-manager && ./avvia.sh && bash" \
    && cd ./ang/grafo1 && ng serve -o
