FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install

COPY . .

RUN bunx prisma generate

EXPOSE 3000

CMD ["bun", "run", "dev"]
