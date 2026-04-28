FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run prisma:generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
