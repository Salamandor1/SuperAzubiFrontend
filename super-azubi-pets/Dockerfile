# Stage 1: Build Angular Universal App
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build:ssr

# Stage 2: Setup production image
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist/super-azubi-pets ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --production

EXPOSE 3000

CMD ["node", "dist/server/main.js"]