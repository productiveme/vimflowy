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

FROM node:12-alpine
WORKDIR /app/
# COPY --from=build /app ./
COPY --from=build /app/build ./build
COPY --from=build /app/server ./server
COPY ./src ./src
COPY ./package-prod.json ./package.json
COPY ./tsconfig.json ./
RUN yarn install --production
VOLUME /app/db
EXPOSE 3000
ENTRYPOINT npm run startprod -- \
    --host 0.0.0.0 \
    --port 3000 \
    --staticDir /app/build \
    --db sqlite \
    --dbfolder /app/db