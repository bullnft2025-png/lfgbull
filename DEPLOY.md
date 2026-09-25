# 紅果短劇部署指南

## 快速部署到 Vercel (推薦 - 最簡單)

### 方法 1: 一鍵部署
1. 訪問這個鏈接並登錄 Vercel: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bullnft2025-png/lfgbull&project-name=red-fruit-drama&root-directory=drama-app)
2. 選擇 `cursor/red-fruit-drama-app-8cc0` 分支
3. 點擊 "Deploy" 
4. 幾分鐘後就能獲得公開訪問鏈接！

### 方法 2: 從 GitHub 導入
1. 前往 https://vercel.com/new
2. 選擇 "Import Git Repository"
3. 連接您的 GitHub 帳號
4. 選擇 `bullnft2025-png/lfgbull` 倉庫
5. 選擇分支: `cursor/red-fruit-drama-app-8cc0`
6. Root Directory 設置為: `drama-app`
7. 點擊 "Deploy"

## 部署到 Netlify

### 方法 1: Netlify Drop (最快)
1. 訪問 https://app.netlify.com/drop
2. 將 `drama-app/dist` 文件夾拖放到頁面
3. 立即獲得公開鏈接！

### 方法 2: 從 GitHub 部署
1. 前往 https://app.netlify.com/start
2. 連接 GitHub
3. 選擇倉庫和分支
4. Base directory: `drama-app`
5. Build command: `npm run build`
6. Publish directory: `dist`
7. 點擊 "Deploy"

## 部署到 GitHub Pages

```bash
cd drama-app
npm run build
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:bullnft2025-png/lfgbull.git main:gh-pages
```

然後在 GitHub 設置中啟用 GitHub Pages，選擇 `gh-pages` 分支。

## 本地測試

```bash
cd drama-app
npm install
npm run dev
```

訪問 http://localhost:3000
