FROM node:14

ADD . /deathnote/

RUN npm install truffle -g
RUN npm install @truffle/hdwallet-provider
RUN npm install dotenv

WORKDIR /deathnote

CMD ["truffle", "develop"]