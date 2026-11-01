FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY vendor/ ./vendor/
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

RUN mkdir -p /app/media

ENV NODE_ENV=production

EXPOSE 1935 8000 3001

CMD ["npm", "start"]
