FROM node:alpine

WORKDIR /app

COPY src .

RUN mkdir -p /data/alunos && \
    addgroup -S app && \
    adduser -S app -G app && \
    chown -R app:app /app /data && \
    npm ci --only=production

USER app

VOLUME /data

EXPOSE 3000

CMD ["node", "server.js"]
