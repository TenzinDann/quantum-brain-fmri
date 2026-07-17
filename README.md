# Quantum Brain fMRI Website

基于 Vite、React 和 TypeScript 的前端网站。

## 开发环境

- Node.js 24.14.0（仓库中的 `.nvmrc` 已固定版本）
- npm 11.9.0

首次安装依赖：

```powershell
npm ci
```

启动本地开发服务器：

```powershell
npm run dev
```

开发地址：

- 本机：<http://localhost:3000/>
- 局域网：终端启动信息中的 `Network` 地址

服务器支持热更新。端口 `3000` 被占用时会直接报错，不会自动切换端口。

## 常用检查

```powershell
npm run lint
npm run test
npm run build
```

- `lint`：运行 TypeScript 类型检查
- `test`：运行 Vitest 测试
- `build`：生成 `dist/` 生产构建
