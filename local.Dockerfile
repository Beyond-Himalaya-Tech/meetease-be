FROM node:22-alpine

RUN apk add --no-cache dos2unix postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN npm install -g @nestjs/cli

COPY entrypoint-local.sh /usr/local/bin/
RUN dos2unix /usr/local/bin/entrypoint-local.sh
RUN chmod +x /usr/local/bin/entrypoint-local.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint-local.sh"]