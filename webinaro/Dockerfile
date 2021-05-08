FROM node:13-alpine 
#RUN npm install -g yarn

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD node ./server/server.js 