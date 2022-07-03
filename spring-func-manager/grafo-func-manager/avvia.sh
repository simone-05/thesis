#!/bin/bash
#./mvnw package -DskipTests && java -jar target/*.jar

./mvnw package -DskipTests && ./mvnw spring-boot:run
