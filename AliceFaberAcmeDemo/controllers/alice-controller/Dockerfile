# Stage: build
FROM node:25 as build
WORKDIR /app
COPY package*.json /app/
RUN npm install --force
COPY . .
ARG RUNMODE
ARG ALICE_AGENT_HOST=${ALICE_AGENT_HOST:-"localhost"}
ENV RUNMODE=${RUNMODE} ALICE_AGENT_HOST=${ALICE_AGENT_HOST}
RUN npm run build

# Stage: runtime
FROM nginx:alpine as runtime
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/alice-controller /usr/share/nginx/html/
ENTRYPOINT ["nginx", "-g", "daemon off;"]