FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install

COPY src ./src
COPY public ./public
COPY index.html vite.config.js ./

EXPOSE 5173

CMD ["bun", "run", "dev", "--", "--host"]
