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

# DATABASE


ENV MYSQL_DATABASE_NAME="qart_db"
# Temporary custom-CNAME compatibility: CA verification remains enabled, hostname check does not.
ENV MYSQL_SSL_CHECK_HOSTNAME=false

# AWS RDS CA bundle (TLS to MySQL). Downloaded at image build; not committed to the repo.
ENV RDS_CA_BUNDLE_PATH="/etc/ssl/certs/rds-ca-bundle.pem"
ENV MYSQL_SSL_CA="/etc/ssl/certs/rds-ca-bundle.pem"

# mysql-connector-java only trusts CA certs from a JKS/PKCS12 keystore, not a raw PEM,
# so the downloaded bundle is imported into a truststore the JDBC URL can reference.
ENV RDS_TRUSTSTORE_PATH="/etc/ssl/certs/rds-truststore.jks"
ENV RDS_TRUSTSTORE_PASSWORD="changeit"

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates wget \
    && mkdir -p /etc/ssl/certs \
    && wget -qO ${RDS_CA_BUNDLE_PATH} https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
    && chmod 0644 ${RDS_CA_BUNDLE_PATH} \
    && keytool -importcert -noprompt -alias rds-ca \
        -file ${RDS_CA_BUNDLE_PATH} \
        -keystore ${RDS_TRUSTSTORE_PATH} \
        -storepass ${RDS_TRUSTSTORE_PASSWORD} \
    && apt-get purge -y wget && rm -rf /var/lib/apt/lists/*

# Full JDBC URL assembled from the pieces above; only takes effect when
# SPRING_DATASOURCE_URL itself isn't set (local/docker-compose sets that directly).
ENV RDS_DATASOURCE_URL="jdbc:mysql://${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE_NAME}?createDatabaseIfNotExist=true&sslMode=VERIFY_CA&trustCertificateKeyStoreUrl=file:${RDS_TRUSTSTORE_PATH}&trustCertificateKeyStorePassword=${RDS_TRUSTSTORE_PASSWORD}"

EXPOSE ${PORT}
ENTRYPOINT ["java", "-jar", "app.jar"]
