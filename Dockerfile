FROM node:12-alpine AS base
# Prevent npm from spamming
ENV NPM_CONFIG_LOGLEVEL=warn
RUN npm config set progress=false
WORKDIR /app/
RUN apk update && apk add --no-cache yarn python2 g++ make
COPY package.json package-lock.json ./

FROM base AS build
WORKDIR /app/
RUN yarn install --frozen-lockfile
COPY . .
ENV REACT_APP_SERVER_CONFIG='{"socketserver": true}' 
RUN npm run build

FROM base
WORKDIR /app/
COPY --from=build /app/build /app/server ./
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
