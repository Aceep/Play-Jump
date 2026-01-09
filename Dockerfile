# Multi-stage build for the full-stack app
FROM rust:1.83-slim AS backend-builder

WORKDIR /app/backend

# Install dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Copy backend source
COPY backend/Cargo.toml ./
COPY backend/src ./src

# Build backend
RUN cargo build --release

# Node.js stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend source
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Final runtime image
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend binary
COPY --from=backend-builder /app/backend/target/release/gane-backend ./gane-backend

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./static

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 8080

CMD ["./start.sh"]
