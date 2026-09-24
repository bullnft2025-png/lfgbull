# 眼睛類型 NFT 圖鑑 (Eye Types NFT Gallery)

## 概述 (Overview)

此專案為 BULL NFT 系列新增了 7 種全新的像素風格眼睛類型，讓每個角色更具個性和獨特性。

This project adds 7 new pixel art eye types to the BULL NFT collection, giving each character more personality and uniqueness.

---

## 新增眼睛類型 (New Eye Types)

### 普通稀有度 (Common) - 70%

#### ✖️ X Eyes
- **描述**: 簡單的 X 形狀眼睛，表現出昏眩或失去意識的狀態
- **Description**: Simple X-shaped eyes showing a dazed or knocked-out state
- **稀有度**: 普通 (Common)
- **設計**: 白色眼底配黑色 X 圖案

---

### 稀有 (Uncommon) - 22%

#### 💗 Heart Eyes
- **描述**: 充滿愛心的粉紅色心形眼睛
- **Description**: Love-filled pink heart-shaped eyes
- **稀有度**: 稀有 (Uncommon)
- **設計**: 粉紅色心形填滿眼睛區域

#### ⭐ Star Eyes
- **描述**: 閃亮的金色星星眼睛
- **Description**: Shining golden star eyes
- **稀有度**: 稀有 (Uncommon)
- **設計**: 白色底配金色星形圖案

#### 💰 Money Eyes
- **描述**: 美元符號造型，展現對金錢的渴望
- **Description**: Dollar sign design showing desire for money
- **稀有度**: 稀有 (Uncommon)
- **設計**: 綠色的貨幣符號 ($) 圖案

---

### 稀有 (Rare) - 7%

#### 🌀 Spiral Eyes
- **描述**: 催眠螺旋效果，給人迷幻的感覺
- **Description**: Hypnotic spiral effect with a mesmerizing look
- **稀有度**: 稀有 (Rare)
- **設計**: 黑白螺旋圖案

#### 🔥 Flame Eyes
- **描述**: 燃燒的火焰眼睛，充滿力量和熱情
- **Description**: Burning flame eyes full of power and passion
- **稀有度**: 稀有 (Rare)
- **設計**: 橙色、黃色和紅色的火焰漸層

---

### 傳說 (Legendary) - 1%

#### 🌈 Rainbow Eyes
- **描述**: 彩虹色漸變眼睛，極為罕見和珍貴
- **Description**: Rainbow gradient eyes, extremely rare and precious
- **稀有度**: 傳說 (Legendary)
- **設計**: 完整的彩虹色光譜（紅、橙、黃、綠、藍、紫）

---

## 原有眼睛類型 (Existing Eye Types)

### 普通 (Common)
- **Normal**: 標準的黑色眼睛與青色瞳孔
- **Black Shades**: 黑色太陽眼鏡
- **Pink Goggles**: 粉紅色護目鏡
- **Cyan Goggles**: 青色護目鏡

### 稀有 (Uncommon)
- **Gold Goggles**: 金色護目鏡
- **White Visor**: 白色遮陽板
- **Red Visor**: 紅色遮陽板
- **Eye Patch**: 眼罩（海盜風格）

### 稀有 (Rare)
- **3D Glasses**: 3D 立體眼鏡
- **Sleepy**: 閉眼睡覺狀態

### 傳說 (Legendary)
- **Laser**: 紅色雷射眼
- **Diamond Eyes**: 鑽石水晶眼睛

---

## 技術規格 (Technical Specifications)

- **像素尺寸**: 32x32 像素
- **輸出尺寸**: 320x320 像素 (10x 放大)
- **顏色格式**: RGBA
- **檔案格式**: PNG

## 稀有度分布 (Rarity Distribution)

| 等級 (Tier) | 機率 (Probability) | 眼睛類型數量 (Eye Types) |
|-------------|-------------------|------------------------|
| Common      | 70%               | 5                      |
| Uncommon    | 22%               | 7                      |
| Rare        | 7%                | 4                      |
| Legendary   | 1%                | 3                      |

**總計**: 19 種獨特眼睛類型

---

## 使用方式 (Usage)

### 生成 NFT (Generate NFTs)

```bash
# 生成 10,000 個 NFT
node generate.js --count=10000

# 生成 100 個測試用 NFT
node generate.js --count=100 --preview=100

# 自訂種子和縮放比例
node generate.js --count=1000 --seed=12345 --scale=10
```

### 匯出圖層 (Export Layers)

所有眼睛類型的透明圖層會自動匯出到 `layers/05-eyes/` 目錄：

```
layers/05-eyes/
├── x-eyes.png
├── heart-eyes.png
├── star-eyes.png
├── money-eyes.png
├── spiral-eyes.png
├── flame-eyes.png
├── rainbow-eyes.png
└── ... (其他眼睛類型)
```

---

## 設計原則 (Design Principles)

1. **像素藝術風格**: 所有眼睛保持 32x32 像素的復古風格
2. **可識別性**: 每種眼睛類型都有獨特且易於識別的特徵
3. **顏色協調**: 使用與整體 NFT 風格協調的調色板
4. **稀有度平衡**: 確保傳說級眼睛確實稀有和特別

---

## 檔案結構 (File Structure)

```
/workspace/
├── src/
│   ├── traits.js       # 定義所有眼睛類型和稀有度
│   └── draw.js         # 繪製眼睛的像素藝術邏輯
├── layers/
│   └── 05-eyes/        # 匯出的眼睛圖層
├── output/
│   ├── images/         # 生成的 NFT 圖片
│   ├── collection.json # NFT 集合資料
│   └── rarity.json     # 稀有度統計
└── generate.js         # 主要生成腳本
```

---

## 更新日誌 (Changelog)

### 2026-09-24
- ✨ 新增 7 種全新眼睛類型
- 🎨 實現像素藝術繪製邏輯
- 📊 更新稀有度分布系統
- 📝 建立完整文檔

---

## 授權 (License)

ISC License

---

**製作者**: Cursor Cloud Agent  
**專案**: BULL NFT Collection  
**日期**: 2026-09-24
