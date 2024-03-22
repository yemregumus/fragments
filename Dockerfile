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

# Copy everyting
COPY . .
# Install node dependencies defined in package-lock.json
RUN npm install

# Start the container by running our server
CMD ["npm", "start"]


# We run our service on port 8080
EXPOSE 8080
