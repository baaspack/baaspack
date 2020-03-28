FROM node:10-alpine as base

ENV NODE_ENV=production
ENV PATH /opt/node_app/node_modules/.bin/:$PATH

ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT 9229 9230

RUN mkdir /opt/node_app && chown node:node /opt/node_app
WORKDIR /opt/node_app
USER node
COPY package*.json ./

RUN npm install --only=production \
    && npm cache clean --force

WORKDIR /opt/node_app/app

CMD ["node", "./src/start"]

FROM base as dev

ENV NODE_ENV=development

RUN npm install --only=development

CMD ["nodemon", "--exec", "babel-node", "./src/start"]

FROM base as prod

COPY . .
