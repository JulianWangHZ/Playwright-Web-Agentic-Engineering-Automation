# Version must match the @playwright/test version in package.json
FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

# Copy the lock file first to leverage Docker layer cache: skip reinstall when deps are unchanged
COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "test"]
