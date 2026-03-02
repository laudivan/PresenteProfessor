FROM node:20-alpine

COPY package*.json server.js public /app

RUN mkdir -p /data/alunos && \
addgroup -S appgroup && adduser -S appuser -G appgroup && \
chown -R appuser:appgroup /app /data && \
npm ci --only=production

USER appuser

VOLUME /data

WORKDIR /app

EXPOSE 3000

CMD ["node", "server.js"]
