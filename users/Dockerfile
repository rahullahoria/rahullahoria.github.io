#FROM node:12.18.1

#for production
FROM node:13-alpine 

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD node ./bin/www 