FROM node:current-alpine
COPY . /
WORKDIR /server
RUN npm install
ENTRYPOINT ["npm", "start"]
WORKDIR ../client
RUN npm install
ENTRYPOINT ["npm", "start"]
