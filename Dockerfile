FROM node:12.10.0-alpine as build-stage

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

ENV PATH /home/node/app/node_modules/.bin:$PATH

COPY package*.json ./

RUN npm install

RUN npm install react-scripts -g

COPY --chown=node:node . .

EXPOSE 3000

CMD ["npm", "start"]