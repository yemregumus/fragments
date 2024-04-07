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

# Option 3: explicit filenames - Copy the package.json and package-lock.json
# files into the working dir (/app), using full paths and multiple source
# files.  All of the files will be copied into the working dir `./app`
COPY package.json package-lock.json ./

# Install node dependencies defined in package-lock.json
RUN npm install

# Stage 2: Finalize the image
FROM node:20.11.1-bullseye AS final

# Set up a health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -fs http://localhost:${PORT}/health || exit 1

# Use /app as our working directory
WORKDIR /app

# Copy everything from the dependencies stage
COPY --from=dependencies /app .

# Expose the port defined in the environment variable
EXPOSE ${PORT}

# Start the container by running our server
CMD ["node", "src/index.js"]
