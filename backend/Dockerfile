FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install



COPY . .



RUN npx prisma generate
RUN ls -l node_modules/@prisma/client

EXPOSE 3000

CMD [ "npm", "start" ]
