# DJI T100 · 高德高清地图（纯静态版）

**完全静态页，打开即用。无需服务器、无需 API Key、无需任何配置。**

当前部署: [https://nzz1213.github.io/amap-app/app.html](https://nzz1213.github.io/amap-app/app.html)

---

## 🎯 两种使用方式

### 方式一：直接使用 App（推荐）

下载 `app.html`，**双击或用浏览器打开**即可使用。

或者访问已部署的链接：
```
https://nzz1213.github.io/amap-app/app.html
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
| **📍 定位** | 点 📍 按钮，单次定位到当前位置 |
| **🔄 实时追踪** | 点 🔄 按钮，持续跟随 GPS 位置移动，地图自动平移 |
| **📌 添加地名标注** | 点 📌 → 点击地图 → 输入地名（留空自动编号）|
| **🔵 颜色分类** | 顶栏 5 色圆点：🔵蓝 🔴红 🟢绿 🟠橙 🟣紫，标注按颜色区分 |
| **✏️ 重命名** | 点击标注列表的 ✏️ 按钮，或地图弹出框中的「重命名」 |
| **↩️ 撤销** | 撤销最后标注 |
| **🗑️ 清空** | 一键清空所有标注 |
| **🎯 定位航点** | 点标注列表中的 🎯 |
| **📤 导出 KML/CSV** | 点 📤 按钮，可复制或下载，KML 可导入 DJI Pilot |
| **🗺️ 切换地图风格** | 顶栏下拉菜单：矢量 / 高清矢量 / 卫星 / 卫星标注 |

### 🛰️ 卫星标注说明

选择「🛰️ 卫星标注」时，使用 **双层瓦片叠加技术**：
- 底图：卫星影像（高德 style=6）
- 覆盖层：半透明矢量标注（高德 style=8, 50%透明度）

路名、地名清晰叠加在卫星图上，视觉效果更佳。

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

由于 `app.html` 是纯静态文件，你可以免费部署到：

- **GitHub Pages** — `git push` 自动部署（当前使用）
- **Vercel** — `npx vercel deploy`
- **Cloudflare Pages** — 免费
- **任何静态文件服务器