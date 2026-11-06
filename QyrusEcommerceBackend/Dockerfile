# syntax=docker/dockerfile:1
FROM python:3.12-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# AWS Lambda Web Adapter, installed as a Lambda extension: it auto-activates
# when this image runs as a Lambda function and proxies invokes to the HTTP
# server below. Outside Lambda (Fargate, local docker/docker-compose) it is
# inert, so the same image runs unmodified in both places.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

ARG PORT=9891
ENV PORT=${PORT}
ENV AWS_LWA_PORT=${PORT}

EXPOSE ${PORT}
ENTRYPOINT ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
