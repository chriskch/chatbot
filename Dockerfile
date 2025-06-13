# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Expose the app on port 3000
EXPOSE 3000

# Start the app
CMD ["sh", "-c", "npm run migrate && npm start"]
