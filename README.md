# 文章清洗工具

一个纯前端的文章格式清洗工具，无需后端支持，直接在浏览器中运行。

## 在线使用

访问以下地址使用在线版本：
- 主站：https://www.xiaomingmiaomiaowu.top

## 功能特点

### 1. 空格处理
- 清除所有空格
- 连续空格保留一个
- 保留原空格

### 2. 换行处理
- 清除所有换行
- 连续换行保留一个
- 保留原换行

### 3. 特殊符号处理
- 清除所有特殊符号
- 智能转换符号
  - 全角符号转半角
  - 统一引号
  - 省略号规范化
- 保留原符号

### 4. 标点优化
- 中文标点优化
- 英文标点优化

### 5. 段落整理
- 首行缩进
- 段落间距统一

### 其他功能
- 实时字数统计
- 一键复制结果
- 深色/浅色主题切换
- 响应式设计，支持移动端

## 本地运行

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/text-cleaner.git
```

2. 进入项目目录：
```bash
cd text-cleaner
```

3. 直接在浏览器中打开 `index.html` 文件即可使用

## 部署说明

### GitHub Pages 部署
1. Fork 本仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 main 分支作为源
4. 等待几分钟后即可访问

### Netlify 部署
1. 注册 Netlify 账号
2. 点击 "New site from Git"
3. 选择 GitHub 仓库
4. 保持默认设置，点击 "Deploy site"

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Clipboard API

## 注意事项

- 所有处理都在本地完成，不会上传任何数据
- 主题设置会保存在浏览器的 localStorage 中
- 支持现代浏览器（Chrome、Firefox、Safari、Edge 等）

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情 
