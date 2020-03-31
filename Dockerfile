FROM node:10-alpine as base

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

# PROD Image
FROM base as prod

ENV NODE_ENV=production

COPY . .

# DEV IMAGE
# Multistage builds don't skip unused stages without
# using buildkit, but that requires additional config
# which I'm not sure we can guarantee yet. Keeping dev
# last here so that prod is at least slim.
FROM base as dev

ENV NODE_ENV=development

RUN npm install --only=development

CMD ["nodemon", "--exec", "babel-node", "./src/start"]
