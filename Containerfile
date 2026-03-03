FROM node:20

WORKDIR /app

VOLUME /data

EXPOSE 3000

COPY app .

RUN chown -R 1000:1000 /app /data && \
    npm ci --only=production

USER 1000:1000

CMD ["node", "server.js"]
