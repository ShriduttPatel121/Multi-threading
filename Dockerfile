FROM node:alpine

WORKDIR /usr/src/app

# this will optimise the bind mount
COPY package.json .

COPY . .

RUN npm install

CMD [ "npm", "start" ]