FROM python:2.7 AS build
# Prevent npm from spamming
ENV NPM_CONFIG_LOGLEVEL=warn
WORKDIR /app/
RUN apt-get install curl gnupg -yq \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash \
    && apt-get install nodejs -yq
RUN npm config set progress=false
COPY package.json package-lock.json ./
WORKDIR /app/
RUN npm install
COPY . .
ENV REACT_APP_SERVER_CONFIG='{"socketserver": true}' 
RUN npm run build

FROM node:14-alpine
WORKDIR /app/
# COPY --from=build /app ./
COPY --from=build /app/build ./build
COPY --from=build /app/server ./server
COPY ./src ./src
COPY ./package-prod.json ./package.json
COPY ./tsconfig.json ./
RUN npm install --production
VOLUME /app/db
ENV VF_PORT 3000
ENV VF_DB sqlite
ENV VF_HOST 0.0.0.0
ENV VF_BUILD_DIR /app/db
EXPOSE $PORT
ENTRYPOINT npm run startprod -- --staticDir /app/build