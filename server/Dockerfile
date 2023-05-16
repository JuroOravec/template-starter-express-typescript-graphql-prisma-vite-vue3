# See https://notiz.dev/blog/dockerizing-nestjs-with-prisma-and-postgresql

# Build phase
# 1) Generate prisma client
# 2) Compile TS to JS
FROM node:18-alpine as builder

WORKDIR /app

ENV NODE_ENV development

COPY package*.json ./
COPY tsconfig*.json ./
COPY ./prisma prisma
COPY ./src src

RUN npm ci

RUN npm run prisma:generate
RUN npm run build

# Production
FROM node:18-alpine as prod_build

WORKDIR /app

ENV NODE_ENV production

COPY package*.json ./
RUN npm ci --only=production

# Copy compiled code
COPY --chown=node:node --from=builder /app/dist /app/dist
COPY --chown=node:node --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
# And prisma in case we need to access the migrations # TODO ...do we?
COPY --chown=node:node --from=builder /app/prisma /app/prisma

USER node
