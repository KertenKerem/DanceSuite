FROM oven/bun:1-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile

COPY prisma ./prisma
COPY src ./src

RUN bunx prisma generate

EXPOSE 3000

CMD ["bun", "run", "dev"]
