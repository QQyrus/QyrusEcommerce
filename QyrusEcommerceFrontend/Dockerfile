# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# The browser (not this container) calls these URLs directly, so they must
# be reachable from the host running the browser. Each backend is reached
# through the API gateway at its own context path; GATEWAY_URL/GATEWAY_SECRET
# are deployment-specific (e.g. sourced from Secrets Manager), so no default.
ARG gateway_url
ARG gateway_secret

ENV VITE_JAVA_API_URL=${gateway_url}/java
ENV VITE_CSHARP_API_URL=${gateway_url}/csharp
ENV VITE_PYTHON_API_URL=${gateway_url}/python
ENV VITE_GATEWAY_TOKEN=$gateway_secret

RUN npm run build

# Runs on Fargate (or any plain container host) behind a load balancer;
# no Lambda adapter needed since this is a static file server, not a Lambda target.
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
