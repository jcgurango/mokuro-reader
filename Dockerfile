# --- Stage 1: Build the SvelteKit application ---
FROM node:20-alpine AS builder

# Create and switch to the app directory
WORKDIR /app

# Copy package manifests first (for better caching of npm installs)
COPY package*.json ./

# Install dependencies (include devDependencies for building)
RUN npm install

# Copy the rest of your project files
COPY . .

# Build the SvelteKit app
RUN npm run build


# --- Stage 2: Create the production image ---
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only the build output and minimal files from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --production

# Expose whatever port your app listens on (default is 3000)
EXPOSE 3000

# Run the SvelteKit server
CMD ["node", "build"]