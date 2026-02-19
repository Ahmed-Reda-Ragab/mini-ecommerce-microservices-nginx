# Use official Node.js LTS Alpine image for small footprint
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first (layer caching optimization)
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy all source files
COPY . .

# Expose service port
EXPOSE 3001

# Health check for Docker orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Start the service
CMD ["node", "src/index.js"]
