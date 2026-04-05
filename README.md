# 川藏 ADV 摩旅路书

一个适合手机打开和队友共享的 G318 摩旅 PWA。

## 已支持

- 手机端打开查看
- 骑行模式 UI
- 川藏路线图
- GPX 导入
- 安装到主屏幕
- 首次联网后离线重开

## 本地预览

建议用任意静态服务器打开当前目录，例如：

```bash
python3 -m http.server 8080
```

然后访问：

```text
http://localhost:8080/index.html
```

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库，比如 `adv-g318-roadbook`
2. 在当前目录初始化 git：

```bash
git init
git add .
git commit -m "Initial G318 ADV roadbook PWA"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
```

3. 到 GitHub 仓库设置里开启 Pages

- `Settings`
- `Pages`
- `Build and deployment`
- `Source` 选择 `Deploy from a branch`
- `Branch` 选择 `main` 和 `/ (root)`

4. 发布后访问：

```text
https://<你的用户名>.github.io/<仓库名>/
```

## 手机使用建议

- 首次用手机打开 Pages 链接时保持联网
- 打开后点击“安装到主屏幕”
- 安装完成后从桌面图标进入，骑行中更像原生 App
- 导入 GPX 后轨迹会保存在浏览器本地存储
