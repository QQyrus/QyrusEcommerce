# syntax=docker/dockerfile:1
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# AWS Lambda Web Adapter, installed as a Lambda extension: it auto-activates
# when this image runs as a Lambda function and proxies invokes to the HTTP
# server below. Outside Lambda (Fargate, local docker/docker-compose) it is
# inert, so the same image runs unmodified in both places.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

ARG PORT=9893
ENV PORT=${PORT}
ENV AWS_LWA_PORT=${PORT}
ENV SERVER_PORT=${PORT}

EXPOSE ${PORT}
ENTRYPOINT ["java", "-jar", "app.jar"]
