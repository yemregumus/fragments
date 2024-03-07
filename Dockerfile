# Stage 1: Install dependencies
FROM node:20.11.1-bullseye AS dependencies
# Set environment variables
ENV NODE_ENV=production
# Set working directory
WORKDIR /site
# Copy package.json and package-lock.json
COPY package.json package-lock.json ./
# Install dependencies
RUN npm install

# Stage 2: Build the site
FROM node:20.11.1-bullseye AS build
# Set working directory
WORKDIR /site
# Copy dependencies from the first stage
COPY --from=dependencies /site /site
# Install Babel and presets
RUN npm install --save-dev @babel/core @babel/cli @babel/preset-env
# Copy the source code
COPY . .
# Build the site
RUN npx babel src -d dist

# Stage 3: Serve the built site
FROM nginx:1.24.0-alpine
# Copy the built site from the build stage
COPY --from=build /site/dist /usr/share/nginx/html
# Expose port 80
EXPOSE 80
# Healthcheck to verify the container is healthy
HEALTHCHECK --interval=60s --timeout=90s --start-period=10s --retries=3 \
  CMD curl --fail localhost || exit 1
