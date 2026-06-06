# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install && \
    cd client && npm install && \
    cd ../server && npm install

# Copy source files
COPY . .

# Build client
RUN cd client && npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files and install runtime deps
COPY package*.json ./
RUN npm install --production && \
    cd server && npm install --production

# Copy built client and server
COPY --from=builder /app/client/dist ./client/dist
COPY server ./server

# Create data directory
RUN mkdir -p server/data

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server/src/index.js"]