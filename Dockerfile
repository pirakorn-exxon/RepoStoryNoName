FROM node:current-alpine
COPY . /server
WORKDIR /server
RUN npm install
ENTRYPOINT ["npm", "start"]

FROM node:current-alpine
COPY . /client
WORKDIR /client
RUN npm install
ENTRYPOINT ["npm", "start"]