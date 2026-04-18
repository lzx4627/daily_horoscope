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

- `apps/server`：`Express + TypeScript` API 服务，内置本地 JSON 持久化。
- `apps/client`：`uni-app + Vue 3 + TypeScript` 前端，可扩展到 `H5 / App / 微信小程序`。

## 快速开始

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

## 主要接口

- `GET /health`
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
- 后续可在 `apps/server/src/analysis.ts` 基础上接入大模型，增强日报语言风格与个性化建议。
- 数据当前保存于 `apps/server/data/db.json`，适合原型验证；正式上线建议切换到 `PostgreSQL` 或 `MySQL`。
