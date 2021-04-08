FROM node:14

RUN npm install truffle -g

WORKDIR /deathnote

CMD ["truffle", "develop"]

