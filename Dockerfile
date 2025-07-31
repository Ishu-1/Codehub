# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies across workspaces (supports monorepo)
RUN npm install --workspaces

# Generate Prisma client for DB (adjust path if needed)
RUN npx prisma generate --schema=packages/db/

# Go into the webhook app
WORKDIR /app/apps/webhook

# Expose the port
EXPOSE 5000

# Start the webhook server
CMD ["npm", "start"]
