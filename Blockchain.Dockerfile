FROM node:14

ADD . /deathnote/

RUN npm install truffle -g

WORKDIR /deathnote

RUN truffle develop && compile && migrate

CMD ["truffle", "develop"]

