# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build -- --configuration production

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from build stage to nginx html directory
COPY --from=build /app/dist/*/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 4200

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
