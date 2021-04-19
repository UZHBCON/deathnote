FROM node:14

ADD . /deathnote/

RUN npm install truffle -g

WORKDIR /deathnote

RUN (echo "migrate" && cat) | truffle develop

CMD ["truffle", "develop"]

