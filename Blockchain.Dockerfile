FROM node:14

ADD . /deathnote/

RUN npm install truffle -g

WORKDIR /deathnote

RUN truffle compile && truffle migrate

CMD ["truffle", "develop"]

