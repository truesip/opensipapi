FROM node:18-alpine

# Install OpenSIP dependencies and other utilities
RUN apk add --no-cache opensips curl

# Create app directory
WORKDIR /usr/src/app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S apiuser -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

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
