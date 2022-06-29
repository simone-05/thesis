#!/bin/bash
./mvnw package -DskipTests && java -jar target/*.jar
