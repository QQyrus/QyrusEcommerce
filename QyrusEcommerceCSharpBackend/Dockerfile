# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY QyrusEcommerceCSharpBackend.csproj .
RUN dotnet restore QyrusEcommerceCSharpBackend.csproj
COPY . .
RUN dotnet publish QyrusEcommerceCSharpBackend.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .

# AWS Lambda Web Adapter, installed as a Lambda extension: it auto-activates
# when this image runs as a Lambda function and proxies invokes to the HTTP
# server below. Outside Lambda (Fargate, local docker/docker-compose) it is
# inert, so the same image runs unmodified in both places.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

ARG PORT=9892
ENV PORT=${PORT}
ENV AWS_LWA_PORT=${PORT}
ENV ASPNETCORE_URLS=http://+:${PORT}

EXPOSE ${PORT}
ENTRYPOINT ["dotnet", "QyrusEcommerceCSharpBackend.dll"]
