FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

RUN npm install pm2 -g
CMD ["pm2-runtime", "server.js"]