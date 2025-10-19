# syntax=docker/dockerfile:1.7

FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY data ./data
COPY public ./public
COPY preview-ui/package.json preview-ui/package-lock.json* ./preview-ui/
RUN npm --prefix preview-ui install
COPY preview-ui ./preview-ui
RUN npm --prefix preview-ui run build

RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/public ./public
COPY .env.example ./template.env
EXPOSE 4117
CMD ["node", "dist/index.js"]
