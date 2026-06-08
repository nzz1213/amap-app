# DJI T100 · 高德高清地图（纯静态版）

**完全静态页，打开即用。无需服务器、无需 API Key、无需任何配置。**

---

## 🎯 两种使用方式

### 方式一：直接使用 App（推荐）

下载 `app.html`，**双击或用浏览器打开**即可使用。

或者访问部署好的链接：
```
https://你的域名/app.html
```

### 方式二：瓦片 URL（填入 DJI Pilot）

在 DJI Pilot 的「自定义地图源」中填入以下任意一个 URL：

| 样式 | URL 模板 |
|------|----------|
| 🗺️ **矢量** | `https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}` |
| 🗺️ **高清矢量** | `https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=2&style=8&x={x}&y={y}&z={z}` |
| 🛰️ **卫星** | `https://wprd01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}` |
| 🛰️ **卫星标注** | `https://wprd01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}` |

这些是高德官方的瓦片地址，**直接可用，无需任何 Key 或代理**。

---

## 🚁 App 功能

| 功能 | 操作 |
|------|------|
| **📍 定位** | 点 📍 按钮 |
| **📌 添加航点** | 点 📌 → 点击地图 |
| **↩️ 撤销** | 撤销最后航点 |
| **🗑️ 清空** | 一键清空 |
| **🎯 定位航点** | 点航点列表中的 🎯 |
| **📤 导出 KML/CSV** | 点 📤 按钮 |
| **🗺️ 切换地图风格** | 顶栏下拉菜单 |

---

## 📂 文件结构

```
amap-app/
├── app.html        ← 主应用（纯静态，直接打开就用）
├── server.js       ← 可选服务器（已不需要，仅为兼容保留）
└── README.md       ← 本文件
```

---

## 💡 部署到公网（可选）

由于现在 `app.html` 是纯静态文件，你可以免费部署到：

- **GitHub Pages** — 免费、稳定
- **Vercel** — `npx vercel deploy`
- **Cloudflare Pages** — 免费
- **任何静态文件服务器**

部署后就能得到一个永久的公网域名，不再需要 localtunnel。
