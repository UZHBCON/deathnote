FROM node:14

ADD . /deathnote/

RUN npm install truffle -g

WORKDIR /deathnote

CMD ["truffle", "develop"]