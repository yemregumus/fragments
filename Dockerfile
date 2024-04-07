# Stage 1: Install dependencies
FROM node:20.11.1-bullseye AS dependencies

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

# COPY <src> <dest> copies from the build context (<src>) to a path inside the image
# Copy the package.json and package-lock.json files into the working dir (/app)
# Change ownership to user:group (node:node)
COPY --chown=node:node package*.json ./

# Install node dependencies defined in package-lock.json
# Replaced --> RUN npm install
# npm ci --production will ignore dev dependencies while installing node modules
RUN npm ci --only=production

#######################################################################################################################

# Stage 1: use dependencies to start the server
FROM dependencies AS builder

WORKDIR /app

# Copy cached node modules from previous stage so we don't have to download them again
COPY --chown=node:node --from=dependencies /app /app

# Copy src to /app/src/
COPY --chown=node:node ./src ./src

# Copy our HTPASSWD file
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

# Indicate which user is running commands before the app is run
USER root

# Start the container by running our server
CMD ["node", ".\src\index.js"]

# We run our service on port 8080
EXPOSE ${PORT}

# Check the / route every 3 minutes, fail if we don't get a 200
HEALTHCHECK --interval=3m --timeout=30s --start-period=10s --retries=3\
  CMD curl --fail http://localhost:${PORT}/ || exit 1
