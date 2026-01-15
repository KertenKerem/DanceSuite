FROM node:20-alpine

WORKDIR /usr/src/app

ENV PATH="/usr/src/app/node_modules/.bin:$PATH"

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN ls -l /usr/src/app/node_modules/@prisma/client/

EXPOSE 3000

CMD [ "npm", "start" ]