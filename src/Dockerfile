FROM node:8.15-alpine

RUN npm install -g browserify
RUN apk add python make g++

RUN mkdir /src
WORKDIR /src
ADD package.json /src

RUN npm install gun

ADD p2p-fetch-sw.js /src
ADD p2p-fetch.js /src

RUN mkdir /dist

CMD browserify p2p-fetch-sw.js -o /dist/p2p-fetch-sw.js && \
    cp /src/p2p-fetch.js /dist/p2p-fetch.js
