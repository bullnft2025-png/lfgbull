# 紅果短劇 Red Fruit Drama App

一個現代化的短劇視頻串流平台，提供精彩的短劇內容和優質的觀看體驗。

## 功能特點

- 🎬 精美的視頻播放器界面
- 🔥 熱門推薦和分類瀏覽
- 📱 響應式設計，支持各種設備
- 🎨 現代化的UI設計
- ⚡ 快速的加載和流暢的動畫
- 🔍 搜索功能

## 技術棧

- React 18
- Vite
- CSS3 (自定義動畫)
- Lucide React (圖標)

## 開始使用

### 安裝依賴

```bash
cd drama-app
npm install
```

### 啟動開發服務器

```bash
npm run dev
```

應用將在 `http://localhost:3000` 運行

### 構建生產版本

```bash
npm run build
```

## 項目結構

```
drama-app/
├── src/
│   ├── components/       # React 組件
│   │   ├── Header.jsx    # 頭部導航
│   │   ├── Hero.jsx      # 英雄區塊
│   │   ├── DramaCard.jsx # 短劇卡片
│   │   └── VideoPlayer.jsx # 視頻播放器
│   ├── data/
│   │   └── dramaData.js  # 短劇數據
│   ├── App.jsx           # 主應用組件
│   ├── main.jsx          # 應用入口
│   └── index.css         # 全局樣式
├── index.html
├── package.json
└── vite.config.js
```

## 特色功能

### 視頻播放器
- 集數選擇
- 播放控制
- 音量調節
- 全屏支持

### 分類瀏覽
- 熱門推薦
- 甜寵愛情
- 熱血逆襲

### 響應式設計
完美支持桌面、平板和移動設備

## 許可證

MIT
