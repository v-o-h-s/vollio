# STAGE 1: Build dependencies and compile code
FROM node:20-alpine AS builder

# Check if build-base and python3 are needed for native modules like sharp
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root monorepo configuration
COPY package.json package-lock.json ./

# Copy workspace configurations
COPY packages/shared/package.json ./packages/shared/
COPY server/package.json ./server/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY packages/shared ./packages/shared
COPY server ./server

# Build shared package first (since server depends on it)
RUN npm run build --workspace=@vollio/shared

# Build server package
RUN npm run build --workspace=server

# STAGE 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary production files from builder
# We need package.json files to install production dependencies
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY server/package.json ./server/

# Copy compiled code
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/server/dist ./server/dist

# Copy non-TypeScript files that are needed at runtime (Lua scripts for Redis)
COPY server/src/shared/utils/*.lua ./server/dist/shared/utils/

# Install only production dependencies
# This will also link the local workspaces correctly
RUN npm ci --omit=dev

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the application
CMD ["node", "server/dist/server.js"]
