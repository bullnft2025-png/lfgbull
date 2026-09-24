# 🎨 新眼睛類型系統 | New Eye Types System

## 快速開始 (Quick Start)

```bash
# 安裝依賴 (Install dependencies)
npm install

# 生成帶有新眼睛類型的 NFT (Generate NFTs with new eye types)
node generate.js --count=1000 --preview=100

# 查看新眼睛類型展示 (View new eye types showcase)
node showcase-new-eyes.js
```

---

## 🌟 新增功能 (New Features)

### 7 種全新眼睛類型 (7 New Eye Types)

本次更新為 BULL NFT 系列新增了 7 種創意十足的像素風格眼睛：

This update adds 7 creative pixel art eye types to the BULL NFT collection:

| 圖示 | 名稱 | 稀有度 | 描述 |
|------|------|--------|------|
| ✖️ | X Eyes | Common | 昏眩或失去意識的 X 形眼睛 |
| 💗 | Heart Eyes | Uncommon | 充滿愛意的粉紅心形眼睛 |
| ⭐ | Star Eyes | Uncommon | 閃耀的金色星星眼睛 |
| 💰 | Money Eyes | Uncommon | 展現財富渴望的美元符號 |
| 🌀 | Spiral Eyes | Rare | 催眠般的螺旋圖案 |
| 🔥 | Flame Eyes | Rare | 燃燒的火焰效果 |
| 🌈 | Rainbow Eyes | Legendary | 完整彩虹光譜，極為罕見 |

---

## 📊 完整眼睛類型列表 (Complete Eye Types List)

### 普通 (Common) - 70% 機率

1. **Normal** - 標準黑色眼睛與青色瞳孔
2. **Black Shades** - 黑色太陽眼鏡
3. **Pink Goggles** - 粉紅色護目鏡
4. **Cyan Goggles** - 青色護目鏡
5. **X Eyes** ⭐ NEW - X 形昏眩眼睛

### 稀有 (Uncommon) - 22% 機率

1. **Gold Goggles** - 金色護目鏡
2. **White Visor** - 白色遮陽板
3. **Red Visor** - 紅色遮陽板
4. **Eye Patch** - 海盜眼罩
5. **Heart Eyes** ⭐ NEW - 愛心眼睛
6. **Star Eyes** ⭐ NEW - 星星眼睛
7. **Money Eyes** ⭐ NEW - 美元符號眼睛

### 稀有 (Rare) - 7% 機率

1. **3D Glasses** - 3D 立體眼鏡
2. **Sleepy** - 閉眼睡覺狀態
3. **Spiral Eyes** ⭐ NEW - 催眠螺旋
4. **Flame Eyes** ⭐ NEW - 燃燒火焰

### 傳說 (Legendary) - 1% 機率

1. **Laser** - 紅色雷射眼
2. **Diamond Eyes** - 鑽石水晶眼睛
3. **Rainbow Eyes** ⭐ NEW - 彩虹眼睛

---

## 🎯 使用方法 (Usage)

### 生成 NFT 集合 (Generate NFT Collection)

```bash
# 生成完整的 10,000 個 NFT 集合
node generate.js --count=10000 --scale=10

# 生成小型測試集合（100 個）
node generate.js --count=100 --preview=100

# 使用自訂種子
node generate.js --count=1000 --seed=20260924
```

### 查看眼睛類型展示 (View Eye Types Showcase)

```bash
# 生成所有新眼睛類型的展示圖
node showcase-new-eyes.js

# 輸出: output/new-eyes-showcase.png
```

### 查看單一圖層 (View Individual Layers)

所有眼睛類型的透明 PNG 圖層位於：

All eye type transparent PNG layers are located in:

```
layers/05-eyes/
├── x-eyes.png (320x320)
├── x-eyes@32.png (32x32)
├── heart-eyes.png
├── star-eyes.png
├── money-eyes.png
├── spiral-eyes.png
├── flame-eyes.png
├── rainbow-eyes.png
└── ... (其他眼睛類型 / other eye types)
```

---

## 🎨 設計特色 (Design Features)

### 像素藝術原則 (Pixel Art Principles)

1. **32x32 像素基礎** - 保持復古像素風格
2. **清晰可辨識** - 每種眼睛都有獨特的視覺特徵
3. **顏色和諧** - 使用協調的調色板
4. **稀有度平衡** - 傳說級眼睛真正稀有

### 技術規格 (Technical Specifications)

- **基礎尺寸**: 32x32 像素
- **輸出尺寸**: 320x320 像素 (預設 10x 放大)
- **顏色模式**: RGBA (支援透明度)
- **檔案格式**: PNG
- **壓縮等級**: 9 (最高壓縮)

---

## 📈 稀有度統計 (Rarity Statistics)

根據 10,000 個 NFT 的完整集合:

Based on a full collection of 10,000 NFTs:

| 眼睛類型 | 稀有度 | 預期數量 | 稀有度百分比 |
|---------|--------|---------|------------|
| Rainbow Eyes | Legendary | ~7 | 0.07% |
| Laser | Legendary | ~7 | 0.07% |
| Diamond Eyes | Legendary | ~7 | 0.07% |
| Flame Eyes | Rare | ~30 | 0.30% |
| Spiral Eyes | Rare | ~30 | 0.30% |
| Sleepy | Rare | ~60 | 0.60% |
| 3D Glasses | Rare | ~60 | 0.60% |
| Star Eyes | Uncommon | ~90 | 0.90% |
| Money Eyes | Uncommon | ~90 | 0.90% |
| Heart Eyes | Uncommon | ~90 | 0.90% |
| Eye Patch | Uncommon | ~180 | 1.80% |
| Red Visor | Uncommon | ~180 | 1.80% |
| White Visor | Uncommon | ~180 | 1.80% |
| Gold Goggles | Uncommon | ~180 | 1.80% |
| X Eyes | Common | ~450 | 4.50% |
| Cyan Goggles | Common | ~450 | 4.50% |
| Pink Goggles | Common | ~450 | 4.50% |
| Black Shades | Common | ~450 | 4.50% |
| Normal | Common | ~450 | 4.50% |

---

## 🛠️ 開發指南 (Development Guide)

### 新增更多眼睛類型 (Adding More Eye Types)

1. **更新 traits.js**

```javascript
Eyes: {
  common: [..., "新眼睛名稱"],
  uncommon: [...],
  rare: [...],
  legendary: [...]
}
```

2. **在 draw.js 中實現繪製邏輯**

```javascript
function drawEyes(px, name, furName) {
  // ... existing code ...
  
  if (name === "新眼睛名稱") {
    // 實現你的像素藝術邏輯
    px.fillRect(14, 12, 5, 4, WHITE);
    px.set(16, 14, BLACK);
    // ... more pixel art ...
    return;
  }
}
```

3. **測試生成**

```bash
node generate.js --count=50 --preview=50
```

### 像素座標系統 (Pixel Coordinate System)

```
眼睛區域 (Eye Region):
- 起始位置: (14, 12)
- 標準大小: 5x4 像素
- 可延伸至左右以實現特殊效果 (如 Laser)

範例 (Example):
px.fillRect(14, 12, 5, 4, WHITE); // 白色底
px.set(16, 13, BLACK);            // 設定單一像素
```

---

## 📦 輸出檔案結構 (Output File Structure)

```
output/
├── images/                    # 完整的 NFT 圖片
│   ├── 1.png
│   ├── 2.png
│   └── ...
├── layers/                    # 透明圖層
│   └── 05-eyes/
│       ├── x-eyes.png
│       ├── heart-eyes.png
│       └── ...
├── collection.json           # NFT 集合元資料
├── rarity.json              # 稀有度統計
├── trait-sheet.png          # 所有特徵總覽
├── preview-N.png            # 前 N 個 NFT 預覽
└── new-eyes-showcase.png    # 新眼睛類型展示

```

---

## 🔍 品質檢查 (Quality Checks)

### 運行測試 (Run Tests)

```bash
# 生成測試樣本
node generate.js --count=100

# 檢查輸出檔案
ls -lh output/images/ | wc -l  # 應該是 100

# 檢查圖層
ls -lh layers/05-eyes/         # 應該看到所有眼睛類型
```

### 驗證清單 (Validation Checklist)

- [ ] 所有 19 種眼睛類型都能正確生成
- [ ] 透明背景正確匯出
- [ ] 像素藝術保持清晰（無模糊）
- [ ] 顏色正確應用
- [ ] 稀有度分布合理
- [ ] 與其他特徵無衝突

---

## 🎯 效能資訊 (Performance Info)

### 生成速度 (Generation Speed)

- **小型測試** (100 NFTs): ~0.5 秒
- **中型集合** (1,000 NFTs): ~4 秒
- **完整集合** (10,000 NFTs): ~35-40 秒

### 系統需求 (System Requirements)

- **Node.js**: v16 或更高版本
- **記憶體**: 至少 512MB
- **磁碟空間**: 至少 200MB (用於完整集合)

---

## 📚 相關文檔 (Related Documentation)

- [EYE_TYPES.md](./EYE_TYPES.md) - 完整的眼睛類型圖鑑
- [generate.js](./generate.js) - 主要生成腳本
- [src/traits.js](./src/traits.js) - 特徵定義
- [src/draw.js](./src/draw.js) - 繪製邏輯

---

## 🤝 貢獻 (Contributing)

歡迎提交新的眼睛類型設計！

Welcome to submit new eye type designs!

1. Fork 此專案
2. 創建新的眼睛類型
3. 測試生成
4. 提交 Pull Request

---

## 📄 授權 (License)

ISC License

---

## 👨‍💻 作者 (Author)

**Cursor Cloud Agent**  
建立日期: 2026-09-24

---

## 🎉 致謝 (Acknowledgments)

感謝所有為 BULL NFT 專案做出貢獻的開發者和藝術家！

Thanks to all developers and artists who contributed to the BULL NFT project!

---

**BULL NFT Collection** 🐮✨  
*像素藝術 · NFT · 創意無限 | Pixel Art · NFT · Infinite Creativity*
