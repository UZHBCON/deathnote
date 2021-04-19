FROM node:14

ADD client /deathnote/client

WORKDIR /deathnote/client

RUN yarn install

CMD ["yarn", "start"]