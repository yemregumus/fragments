# Stage 1: Install dependencies
FROM node:20.11.1-bullseye AS build

LABEL maintainer="Yunus Emre Gumus <ygumus@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install node dependencies defined in package-lock.json
RUN npm install

# Stage 2: Copy source code and run the application
FROM node:20.11.1-bullseye AS run

WORKDIR /app

# Copy everything from the build stage
COPY --from=build /app .

# Copy the rest of the source code
COPY . .

# Start the container by running our server
CMD ["node", "src/index.js"]

# We run our service on port 8080
EXPOSE ${PORT}

# Check the / route every 3 minutes, fail if we don't get a 200
HEALTHCHECK --interval=3m --timeout=30s --start-period=10s --retries=3\
  CMD curl --fail http://localhost:${PORT}/ || exit 1
