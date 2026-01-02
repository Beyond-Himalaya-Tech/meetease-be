FROM node:22-alpine

RUN apk add --no-cache dos2unix postgresql-client

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install


COPY . .

RUN npm install -g @nestjs/cli

COPY entrypoint.sh /usr/local/bin/
RUN dos2unix /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]