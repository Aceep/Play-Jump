# Simple single-stage build
FROM rust:1.83-slim

WORKDIR /app

# Install SSL libs
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Copy source
COPY Cargo.toml ./
COPY src ./src

# Build
RUN cargo build --release

EXPOSE 8080

CMD ["./target/release/gane-backend"]
