FROM node:14

ADD client/package.json /deathnote/client/package.json

WORKDIR /deathnote/client

RUN yarn install

CMD ["yarn", "start"]