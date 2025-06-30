FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create app directory
WORKDIR /usr/src/app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S apiuser -u 1001 -G nodejs

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies as root, then change ownership
RUN npm ci --only=production --verbose && npm cache clean --force

# Change ownership of node_modules to apiuser
RUN chown -R apiuser:nodejs node_modules

# Copy source code
COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R apiuser:nodejs uploads
RUN chown -R apiuser:nodejs /usr/src/app

# Switch to non-root user
USER apiuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
