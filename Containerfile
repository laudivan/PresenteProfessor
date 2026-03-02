# Use the official Node.js Alpine image for a smaller footprint
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Ensure the data directory exists
RUN mkdir -p data/alunos

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app/data
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
