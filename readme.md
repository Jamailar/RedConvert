# RC 小红书辅助创作 AI（含 ZIP 下载、AI仿写、OCR、自动更新）

## 项目简介
这是一个 Chrome 扩展，支持在小红书笔记页面一键下载当前笔记的标题、正文和所有图片，并打包成 ZIP 文件保存到本地，还支持 AI 智能仿写、OCR 图片内容提取、自动检查更新等功能。所有操作均在浏览器端完成，无需后端。

---

## 功能特性
- 一键抓取当前小红书笔记的标题、正文、图片，打包为 ZIP 下载
- 支持 AI 智能仿写（可自定义 API、模型、领域、风格、个性化等）
- 支持 OCR 图片内容提取（跳转外部表单）
- 自动检测扩展新版本并提醒下载
- 设置页支持 API Key、模型名、领域、改写要求、风格、个性化等持久化保存
- 现代美观的 UI，所有设置和操作均在弹窗内完成
- 支持 Chrome 浏览器（Manifest V3）

---

## 安装与本地开发

🎥 点击查看视频演示：

[👉 在 Bilibili 上观看](https://www.bilibili.com/video/BV1RwTxzaEAJ)


### 1. 准备工作
- 前往 [Releases 页面](https://github.com/Jamailar/RedConvert/releases/latest) 下载最新的 zip 包
- 解压 zip 包到本地任意文件夹

### 2. 本地加载扩展
1. 打开 Chrome，访问 `chrome://extensions/`
2. 右上角开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择刚刚解压的文件夹（包含 manifest.json 的文件夹）
5. 成功后会看到扩展图标出现在工具栏

### 3. 使用方法
#### 3.1 下载小红书笔记
1. 登录小红书网页版，打开任意一条笔记页面（URL 形如 `https://www.xiaohongshu.com/discovery/item/xxxxxx`）
2. 点击浏览器右上角的扩展图标
3. 弹窗会显示当前笔记标题和"一键打包下载"按钮
4. 点击按钮，扩展会自动抓取内容并打包 ZIP，浏览器会自动下载
5. 下载完成后，解压 ZIP 可查看 TXT 文本和所有图片

#### 3.2 AI 智能仿写
1. 在弹窗点击"AI文字仿写"按钮，自动提取当前笔记内容并调用 AI 接口生成仿写内容
2. 首次使用前请点击左下角"设置"按钮，填写：
   - AI 接口端口（API Base URL）
   - API Key
   - 模型名（可通过"测试"按钮自动获取模型列表）
   - 目标领域、改写要求、模仿语气风格、个性化（可选）
3. 设置内容会自动保存，下次打开自动回显
4. 仿写结果支持一键复制

#### 3.3 OCR 图片内容提取
1. 点击"提取图片内容（OCR）"按钮，会跳转到外部表单页面进行图片内容提取

#### 3.4 自动检查更新
- 每次打开弹窗时会自动检查 GitHub 最新版本，如有新版本会在底部弹出红色横幅提醒，点击即可跳转下载

---

## 设置项说明
- **API Base URL**：如 `https://api.openai.com/v1` 或自定义后端
- **API Key**：你的 OpenAI 或兼容服务的密钥
- **模型名**：如 `gpt-3.5-turbo`，可通过"测试"按钮自动获取
- **目标领域**：如"母婴"、"健身"、"教育"等
- **改写要求**：如"风格更口语化，突出卖点..."
- **模仿语气风格**：可粘贴示例内容，AI 会模仿其语气
- **个性化**：填写作者个人信息，AI 会参考其经历和知识库进行创作

---

## 注意事项
- 仅支持小红书笔记详情页，其他页面无效
- 若笔记图片较多，打包过程可能需要几秒钟，请耐心等待
- 若遇到"笔记数据加载超时"，请刷新页面或检查网络
- 若笔记标题包含特殊字符，文件名会自动替换为下划线
- 若多次下载同一笔记，Chrome 会自动避免同名冲突
- 若图片未全部加载，建议手动滚动页面至底部再下载

## 目录结构
```
├─ manifest.json
├─ background.js
├─ content-script.js
├─ popup.html
├─ popup.js
├─ popup.css
├─ options.html
├─ options.js
├─ image-tool.html
├─ image-tool.js
├─ libs/
│   └─ jszip.min.js
├─ icons/
│   ├─ 16.png
│   ├─ 48.png
│   └─ 128.png
└─ README.md
```

## 常见问题
- **图片无法下载/部分缺失？**
  - 请确保页面图片已全部加载（可手动滚动到页面底部）
  - 检查扩展权限和 host_permissions 是否正确
- **ZIP 文件无法打开？**
  - 请使用支持 ZIP 格式的解压工具
- **扩展图标未显示？**
  - 请确认已在 Chrome 扩展页面正确加载
- **AI 仿写无响应？**
  - 请检查 API Key、Base URL、模型名等设置是否正确
  - 可在设置页点击"测试"按钮检查 API 可用性
- **新版本提醒不出现？**
  - 请确保 manifest.json 版本号低于 GitHub 最新版本，且已允许 `https://github.com/*` host 权限

## 贡献与反馈
如有建议、Bug 或需求，欢迎提 Issue 或 PR。

⚠️ 本项目使用 MIT 非商用许可证（MIT-NC），禁止任何形式的商业使用。
本项目仅供学习交流使用
