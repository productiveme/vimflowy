FROM node:12-alpine AS build
# Prevent npm from spamming
ENV NPM_CONFIG_LOGLEVEL=warn
RUN npm config set progress=false
WORKDIR /app/
RUN apk update && apk add --no-cache yarn python2 g++ make
COPY package.json package-lock.json ./
RUN yarn install --frozen-lockfile
COPY . .
ENV REACT_APP_SERVER_CONFIG='{"socketserver": true}' 
RUN npm run build

FROM node:12-slim
WORKDIR /app
COPY ./package-prod.json ./package.json
# WORKDIR /app/node_modules
# COPY --from=build /app/node_modules/sqlite3 /app/node_modules/node-sass ./
# WORKDIR /app
RUN npm install --production
RUN mkdir -p /app/build
COPY --from=build /app/build/ /app/build
VOLUME /app/db
EXPOSE 3000
ENV VIMFLOWY_PASSWORD=
ENTRYPOINT npm run startprod -- \
    --host 0.0.0.0 \
    --port 3000 \
    --staticDir /app/build \
    --db sqlite \
    --dbfolder /app/db \
    --password $VIMFLOWY_PASSWORD
