# DJI T100 · 高德高清地图

**纯静态页，打开即用。无需服务器、无需 API Key、无需任何配置。**

| 资源 | 地址 |
|------|------|
| 🗺️ **网页版 App** | [nzz1213.github.io/amap-app/app.html](https://nzz1213.github.io/amap-app/app.html) |
| 📦 **GitHub 仓库** | [github.com/nzz1213/amap-app](https://github.com/nzz1213/amap-app) |

---

## 🎯 两种使用方式

### 方式一：网页版 App

在 T100 遥控器浏览器（或任何浏览器）中打开：

```
https://nzz1213.github.io/amap-app/app.html
```

功能：查看地图、地名标注、测距、导出 KML/CSV

---

### 方式二：瓦片 URL（填入 DJI Pilot 自定义地图源）

在 DJI T100 遥控器的 **DJI Pilot → 设置 → 自定义地图源** 中填入：

#### 🔵 高德直连（无需部署，即填即用）

| 样式 | 填入的 URL |
|------|-----------|
| 🗺️ **高清矢量（推荐）** | `https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=2&style=8&x={x}&y={y}&z={z}` |
| 🗺️ **标准矢量** | `https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}` |
| 🛰️ **卫星图** | `https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}` |
| 🛰️ **卫星标注** | `https://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}` |

> ✅ 这些是高德官方瓦片服务器，**无需任何 Key 或代理**，T100 遥控器直连加载。

#### 🟢 自有代理（Vercel 部署，带缓存加速）

| 样式 | 填入的 URL |
|------|-----------|
| 🗺️ **高清矢量** | `https://amap-app.vercel.app/tile?x={x}&y={y}&z={z}&style=hd` |
| 🛰️ **卫星图** | `https://amap-app.vercel.app/tile?x={x}&y={y}&z={z}&style=satellite` |
| 🛰️ **卫星标注** | `https://amap-app.vercel.app/tile?x={x}&y={y}&z={z}&style=satellite-label` |

> 🚀 自有代理的优势：首次加载后自动缓存、请求头伪装更稳定、统一域名管理。

---

## 🚁 App 功能

| 功能 | 操作 |
|------|------|
| **📍 定位** | 点 📍 按钮，单次定位到当前位置 |
| **🔄 实时追踪** | 点 🔄 按钮，持续跟随 GPS 位置移动，地图自动平移 |
| **📌 添加地名标注** | 点 📌 → 点击地图 → 输入地名（留空自动编号）|
| **🔵 颜色分类** | 顶栏 5 色圆点：🔵蓝 🔴红 🟢绿 🟠橙 🟣紫 |
| **✏️ 重命名** | 点击标注列表的 ✏️ 或地图弹出框中的「重命名」|
| **↩️ 撤销** | 撤销最后标注 |
| **🗑️ 清空** | 一键清空所有标注 |
| **🎯 定位航点** | 点标注列表中的 🎯 |
| **📤 导出 KML/CSV** | 点 📤 按钮，可复制或下载，KML 可导入 DJI Pilot |
| **🗺️ 切换地图风格** | 矢量 / 高清矢量 / 卫星 / 卫星标注 |

### 🛰️ 卫星标注说明

选择「卫星标注」时，使用 **双层瓦片叠加技术**：
- 底图：卫星影像
- 覆盖层：半透明矢量标注（50%透明度）

路名、地名清晰叠加在卫星图上。

---

## 📂 文件结构

```
amap-app/
├── app.html          ← 主应用（纯静态）
├── api/tile.js       ← Vercel 瓦片代理（serverless）
├── vercel.json       ← Vercel 部署配置
├── server.js         ← 本地运行版（备用）
└── README.md         ← 本文件
```

---

## 💡 部署到公网

| 平台 | 方式 |
|------|------|
| **GitHub Pages** | `git push` 自动部署，托管 app.html |
| **Vercel** | `npx vercel deploy`，托管瓦片代理服务 |
| **Cloudflare Pages** | 免费，支持静态 + Workers |
| **任意静态服务器** | 直接放 app.html 即可