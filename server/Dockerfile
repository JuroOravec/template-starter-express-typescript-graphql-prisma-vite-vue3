# NodeJS server app
# See https://notiz.dev/blog/dockerizing-nestjs-with-prisma-and-postgresql

# This Dockerfile is also inspired by apify/actor-node
# - https://github.com/apify/apify-actor-docker/blob/75dc6b48e310e3c90e37e058006372dcf436f51a/node/Dockerfile
# - https://hub.docker.com/r/apify/actor-node/

# Build phase
# 1) Generate prisma client
# 2) Compile TS to JS
FROM node:18-alpine as builder

# Globally disable the update-notifier.
RUN npm config --global set update-notifier false

ENV NODE_ENV development

WORKDIR /app

# Copy just package*.json and tsconfig*.json
# to speed up the build using Docker layer cache.
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies. Don't audit to speed up the installation.
RUN npm ci --include=dev --audit=false

# Next, copy the source files
COPY ./prisma prisma
COPY ./src src

# Build
RUN npm run prisma generate
RUN npm run build

# Production
FROM node:18-alpine as prod_build

# Globally disable the update-notifier.
RUN npm config --global set update-notifier false

ENV NODE_ENV production

WORKDIR /app

# Copy just package.json and package-lock.json
# to speed up the build using Docker layer cache.
COPY package*.json ./

# Install NPM packages, skip optional and development dependencies to
# keep the image small. Avoid logging too much and print the dependency
# tree for debugging
RUN npm --quiet set progress=false \
  && npm config --global set update-notifier false \
  && npm ci --only=prod --no-optional --no-package-lock --prefer-online \
  && echo "Installed NPM packages:" \
  && (npm list --only=prod --no-optional || true) \
  && echo "Node.js version:" \
  && node --version \
  && echo "NPM version:" \
  && npm --version

# Copy compiled code
COPY --chown=node:node --from=builder /app/dist /app/dist
COPY --chown=node:node --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
# And prisma in case we need to access the migrations # TODO ...do we?
COPY --chown=node:node --from=builder /app/prisma /app/prisma

# Enable Node.js process to use a lot of memory
# Increases default size of headers. The original limit was 80kb, but from node 10+ they decided to lower it to 8kb.
# Based on apify/node-actor Dockerfile
ENV NODE_OPTIONS="--max_old_space_size=30000 --max-http-header-size=80000"

USER node
