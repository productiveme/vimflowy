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

FROM node:12-alpine
WORKDIR /app
COPY --from=build /app/package.json /app/package-lock.json /app/build /app/node_modules ./
RUN apk update && apk add --no-cache yarn python2 g++ make
RUN yarn install --production
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
