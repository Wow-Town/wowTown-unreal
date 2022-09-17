FROM node:14.16.0-alpine3.13
WORKDIR /deploy
COPY ./package*.json ./
RUN npm i
COPY ./* ./
EXPOSE 3001 80
CMD [ "node", "server.js" ]