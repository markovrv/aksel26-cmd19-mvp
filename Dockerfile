# Stage 1: Build client inside container (same arch)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy client package files
COPY client/package.json ./client/

# Install client dependencies
RUN cd client && npm install

# Copy all client source
COPY client/ ./client/

# Build client
RUN cd client && npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Create data directory
RUN mkdir -p /app/server/data

# Copy server package files and install production deps
COPY server/package.json ./server/
RUN cd server && npm install --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built client from builder stage
COPY --from=builder /app/client/dist ./client/dist

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server/src/index.js"]