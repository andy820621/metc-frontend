# build stage
# 使用 Node.js 長期支援版本的映像作為基礎映像
FROM node:lts-alpine as build-stage

# 設定 app 文件夾成為當前工作目錄
WORKDIR /app
# 安裝依賴
COPY package*.json ./
RUN npm install
# 複製所有專案檔案到工作目錄
COPY . .

# 建置 Quasar 專案
RUN npm run build


# # 設置一個輕量級的映像來存儲靜態文件
# FROM alpine:latest
# # 從 build-stage 拷貝構建出來的文件到這個新映像
# COPY --from=build-stage /app/dist/pwa /var/www
# # 標記為終端映像
# CMD ["echo", "Static files are ready in /var/www"]

# 將網站檔案和憑證複製到 Nginx 的目錄下
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist/pwa /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY SSL/ /etc/nginx/certs/
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]