# daily-meal GitHub Pages

本目录是 [daily-meal](https://github.com/Schrodinger-CatBug/daily-meal) 的 GitHub Pages 子包（`@daily-meal/site`），用于维护每日菜谱相关的 Vue 3 静态网页。

项目中的菜谱介绍、每日采购提示、食材库存说明、健康饮食调整内容和 Cursor 云智能体创建入口会写入本子包，并通过 `Schrodinger-CatBug.github.io` 站点进行展示。每次更新菜谱内容时，都需要同步更新 Vue 源码并运行构建，把根目录的 `index.html` 和 `assets/` 一起提交。

## 开发命令

- `npm run dev`：启动本地开发服务，源码入口在 `app/`
- `npm run build`：构建 GitHub Pages 静态产物到仓库根目录
- `npm run preview`：预览根目录中可直接托管的静态页面

## Cursor 云智能体入口

页面支持用户输入身高、体重、生活作息提示词和 Cursor API Key，然后生成 `POST https://api.cursor.com/v1/agents` 请求，创建 `daily-meal-health-planner` 自定义子智能体角色。

API Key 只应由用户在页面中临时输入，不要写入仓库、构建环境或前端常量。生产环境建议使用代理地址，由后端或 Serverless 函数保存密钥、校验输入并转发请求到 Cursor Cloud Agents API。

本目录为独立 git 仓库，以 **submodule** 形式挂载于主项目中。
