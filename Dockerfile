FROM node:16.16-alpine3.15 AS dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:16.16-alpine3.15 AS builder
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN yarn prisma generate
RUN yarn build
RUN yarn next telemetry disable

FROM node:16.16-alpine3.15
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/abi ./abi
COPY --from=builder /app/public ./public
COPY --from=builder /app/services ./services
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY ./webconfig.yaml ./webconfig.yaml
COPY ./tsconfig*.json ./
COPY ./cli.ts ./cli.ts
RUN yarn next telemetry status

EXPOSE 3000
CMD ["yarn", "start"]
