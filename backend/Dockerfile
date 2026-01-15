FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install



COPY . .



RUN npx prisma generate
RUN ls -l prisma/generated/client > /tmp/prisma_client_files.txt && cat /tmp/prisma_client_files.txt

EXPOSE 3000

CMD [ "npm", "start" ]
