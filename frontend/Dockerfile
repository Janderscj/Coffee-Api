FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && if [ -d dist ]; then mv dist /out; else mv build /out; fi


FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/nginx.conf.d/default.conf
COPY --from=build /out /usr/share/nginx/html
EXPOSE 80