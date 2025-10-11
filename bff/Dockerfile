# Production Dockerfile for BFF (Node.js/TypeScript service)

# --- Build Stage ---
# This stage compiles TypeScript to JavaScript
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Compile TypeScript
RUN npx tsc

# --- Production Stage ---
# This stage runs the compiled JavaScript
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled code and production assets from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port the app will run on (Cloud Run default is 8080)
EXPOSE 8080

# Set the command to start the server
# Note: The BFF code needs to be adapted to listen on the PORT environment variable.
CMD [ "node", "dist/index.js" ]
