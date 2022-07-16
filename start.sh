#!/bin/bash
code /home/simone/programmi/tiro/ang/grafo1 \
    && code /home/simone/programmi/tiro/spring-func-manager/grafo-func-manager \
    && docker-compose up -d \
    && gnome-terminal --tab -- bash -c "cd /home/simone/programmi/tiro/spring-func-manager/grafo-func-manager && ./avvia.sh && bash" \
    && cd ~/programmi/tiro/ang/grafo1 && ng serve -o
