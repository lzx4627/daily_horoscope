# Daily Horoscope

一个同时面向 `App` 和 `微信小程序` 的五行日报助手，用于记录每日心情、投资盈亏，并生成五行分析与次日建议。

## 功能简介

- 记录每日心情：保存分数、标签和备注。
- 记录每日投资盈亏：保存盈亏金额、收益率、仓位和策略。
- 五行关联分析：把心情与投资行为映射到木火土金水，输出偏旺偏弱结论。
- 日报总结：自动生成当天的心情总结、投资总结、五行分析、改进建议和明日策略。
- 历史记录：查看心情与投资打卡历史。
- 个人档案：维护主导五行、偏弱五行和风险偏好。

## 项目结构

- `apps/server`：`Express + TypeScript` API 服务，当前使用 `PostgreSQL + JWT`。
- `apps/client`：`uni-app + Vue 3 + TypeScript` 前端，可扩展到 `H5 / App / 微信小程序`。

## 快速开始

## Docker 运行

如果你不希望项目依赖污染本地环境，推荐直接使用 Docker：

```bash
docker compose up --build -d
```

启动后：

- 前端访问：`http://localhost:8080`
- 后端 API：`http://localhost:3100`
- 健康检查：`http://localhost:8080/health`

常用命令：

```bash
npm run docker:up
npm run docker:down
npm run docker:logs
```

说明：

- `web` 容器会构建 `uni-app` 的 `H5` 版本并通过 `nginx` 提供服务。
- `api` 容器会启动 `Express` 服务，并连接 `PostgreSQL`。
- `db` 容器提供独立数据库存储，数据落在 Docker Volume。
- 这样你本地无需安装 Node、Vite 或其它前端依赖即可运行 Web 版本。
- `微信小程序` 和 `App` 的源码仍在 `apps/client`，后续可继续用 `HBuilderX` 或对应流水线打包发布。

### 1. 安装依赖

```bash
npm install
```

### 2. 启动后端

```bash
npm run dev:server
```

默认地址：`http://localhost:3100`

### 3. 启动前端

```bash
npm run dev:client
```

默认会读取 `apps/client/.env` 中的 `VITE_API_BASE_URL`，未配置时回退为 `http://localhost:3100/api`。

## 小程序与 App 发布建议

- 微信小程序：建议使用 `HBuilderX` 或 `uni-app` 官方 CLI 打开 `apps/client` 后发布 `mp-weixin`。
- App：同样基于 `uni-app` 打包到 `app-plus`。
- 真机联调时，把 `VITE_API_BASE_URL` 改成你的局域网服务地址，例如 `http://192.168.1.10:3100/api`。

## App 与小程序快速验证

### 方案一：先用 Docker 验证业务功能

```bash
docker compose up --build -d
```

打开 `http://localhost:8080`，可以最快验证心情记录、投资记录、日报生成和历史记录。

### 方案二：验证微信小程序源码

先构建小程序产物：

```bash
npm run build:client:mp-weixin
```

然后：

- 用微信开发者工具打开 `apps/client/dist`
- 在 `apps/client/src/manifest.json` 中把 `mp-weixin.appid` 替换成你自己的 AppID
- 如果要请求本地后端，请把接口改成可访问域名，或先通过 Docker 验证 H5 逻辑

### 方案三：验证 App 源码

先构建 App 产物：

```bash
npm run build:client:app
```

然后：

- 使用 `HBuilderX` 导入 `apps/client`
- 运行到 Android 模拟器或真机
- 把 `apps/client/.env.app.example` 复制为对应环境文件，并把 `VITE_API_BASE_URL` 改为局域网可访问地址

### 当前产物目录

- H5：`apps/client/dist`
- 微信小程序：`apps/client/dist`
- App：`apps/client/dist/build/app`

## 主要接口

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/moods`
- `POST /api/moods`
- `GET /api/investments`
- `POST /api/investments`
- `GET /api/analysis/daily`
- `POST /api/reports/daily`
- `GET /api/reports/:date`
- `GET /api/overview`

## 当前实现说明

- 五行分析当前采用本地规则引擎，便于快速上线 MVP。
- 当前已接入邮箱注册登录与 JWT 鉴权。
- 后续可在 `apps/server/src/analysis.ts` 基础上接入大模型，增强日报语言风格与个性化建议。
- 当前默认通过 Docker 编排 `PostgreSQL`；如果脱离 Docker 运行，请自行提供 `DATABASE_URL`。
