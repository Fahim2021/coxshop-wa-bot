FROM node:20-alpine
RUN apk add --no-cache git python3 make g++
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 10000
CMD ["node", "whatsapp_bot.js"]
