FROM node:24.19-alpine3.24

RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY ./ ./

EXPOSE 5173

# Vite must bind to 0.0.0.0 so Docker can expose the port
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]