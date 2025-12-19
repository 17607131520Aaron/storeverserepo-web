# 多阶段构建 Dockerfile
# 第一阶段：构建阶段
FROM node:24-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制项目文件
COPY . .

# 构建项目（默认使用 prod 模式）
# BUILD_MODE 可选值: dev, test, prod
ARG BUILD_MODE=prod
ARG ENV_FILE=.env.${BUILD_MODE}

# 如果环境变量文件存在，复制它（用于构建时读取环境变量）
# 注意：.env 文件中的变量在构建时会被 vite 读取
RUN if [ -f "${ENV_FILE}" ]; then cp "${ENV_FILE}" .env; fi

# 构建项目
RUN pnpm build:${BUILD_MODE}

# 第二阶段：运行阶段
FROM nginx:alpine

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物到 nginx 静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
