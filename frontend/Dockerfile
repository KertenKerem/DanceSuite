FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install

COPY src ./src
COPY index.html vite.config.js ./

# Copy public directory if it exists and has content
COPY public ./public

EXPOSE 5173

CMD ["bun", "run", "dev", "--", "--host"]
