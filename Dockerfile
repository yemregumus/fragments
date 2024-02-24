# Stage 1: Install dependencies
FROM node:20.11.1-bullseye AS dependencies

# Set environment variables
ENV NODE_ENV=production

# Set working directory
WORKDIR /site

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Stage 2: Build the site
FROM node:20.11.1-bullseye AS build

# Set working directory
WORKDIR /site

# Copy dependencies from the first stage
COPY --from=dependencies /site /site

# Copy the source code
COPY . .

# Build the site, creating /build
RUN yarn build

# Stage 3: Serve the built site
FROM nginx:1.24.0-alpine

# Copy the built site from the build stage
COPY --from=build /site/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Healthcheck to verify the container is healthy
HEALTHCHECK --interval=60s --timeout=90s --start-period=10s --retries=3 \
  CMD curl --fail localhost || exit 1
