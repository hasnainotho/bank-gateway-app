# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Global install next (optional; Next.js is usually in devDeps)
RUN npm i -g next

# Copy dependency files for better caching
COPY package.json ./
RUN npm install

# Copy the rest of the app
COPY . .


# Build the Next.js app
RUN npm run build


# Stage 2: Run the application
FROM node:20-alpine

WORKDIR /app


# Copy only what's needed for running the app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# If you use a `.env.production`, you can COPY it here too:
# COPY .env.production .env

EXPOSE 3000

CMD ["npm", "start"]