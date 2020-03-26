FROM node:10-alpine as prod

EXPOSE 3000

ENV NODE_ENV=production

RUN mkdir /opt/node_app && chown node:node /opt/node_app

WORKDIR /opt/node_app

USER node

COPY package*.json ./

RUN npm install --only=prod && npm cache clean --force

COPY . .

CMD ["node", "./src/start"]

# DEV
FROM prod as dev

ENV NODE_ENV=development

RUN npm install --only=dev && npm cache clean --force

CMD ["./node_modules/nodemon/bin/nodemon.js", "--exec", "babel-node", "./src/start.js"]
