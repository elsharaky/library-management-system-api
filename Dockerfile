# Use Node.js base image
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or pnpm-lock.yaml, etc.)
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Build the app
RUN npm run build

# Remove dev deps for smaller image
RUN npm prune --production

# Expose the port NestJS listens on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]
