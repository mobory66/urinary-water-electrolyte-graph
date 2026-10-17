# GitHub 维护指南（用自己的 GitHub 托管作品）

> **当前状态（2026-10-17 已上线）**
> - 源码仓库：<https://github.com/mobory66/urinary-water-electrolyte-graph>（Public）
> - Pages 网址（主链接）：<https://mobory66.github.io/urinary-water-electrolyte-graph/>
> - 目前仓库根目录已有 `index.html`、中文名 HTML、`README.md`、`.gitignore`、`.nojekyll`；还缺 `src/`、`docs/`、`_tools/`、`dist/` 和评分细则 docx——按文末“补充上传源码与文档”补传后即可完整维护。
> - 以后每次更新只需上传新的 `index.html` 与 `dist/index.html`（及改动的源码），Pages 会自动重新发布，网址不变。


目标：把作品放到**你自己的 GitHub 仓库**，用 **GitHub Pages** 发布成网址；以后改内容只要在本地重新构建、把更新后的文件上传到仓库即可，**网址不变**。

> 本指南对应“无 Token、网页上传”的做法，不需要命令行，也不需要把任何密码/Token 发给别人。

---

## 一、一次性：建仓库 + 上传 + 开启 Pages（约 3 分钟）

### 1. 新建一个公开仓库
1. 登录 GitHub → 右上角 **+** → **New repository**。
2. 填写：
   - **Repository name**：建议 `urinary-water-electrolyte-graph`（可自定，记住它，网址里要用）
   - **Description**：`水、电解质代谢紊乱——知识图谱与问题图谱（泌尿整合课程）`
   - 选择 **Public**（公开仓库才能免费使用 GitHub Pages；私有仓库需 GitHub Pro）
   - **不要勾选** Add a README / .gitignore / license（保持空仓库）
3. 点 **Create repository**。

### 2. 上传文件
1. 打开本项目里的 **`GitHub上传包`** 文件夹（这是已清理好的仓库内容，**不含**账号密码、部署工具、node_modules 等）。
2. 在新建仓库页面点击 **uploading an existing file**（或 Add file → Upload files）。
3. 把 `GitHub上传包` **里面的所有文件和文件夹**（不是这个文件夹本身）一起拖进上传区域：
   - 根目录应出现：`index.html`、`.nojekyll`、`.gitignore`、`README.md`、`dist/`、`docs/`、`src/`、`_tools/`、中文名 HTML、评分细则 docx
   - 浏览器隐藏文件（`.gitignore`、`.nojekyll`）可能不显示在资源管理器里：可在“查看 → 显示 → 隐藏的项目”打开；若拖拽不到，见文末“常见问题 ③”。
4. 底部 **Commit changes**（可写：`初版：水电解质紊乱知识图谱与问题图谱`）。

### 3. 开启 GitHub Pages
1. 仓库页 → **Settings**（顶部）→ 左侧 **Pages**。
2. **Build and deployment** → Source 选择 **Deploy from a branch**。
3. Branch 选 **main**，目录选 **/(root)**，点 **Save**。
4. 等 1～2 分钟，刷新 Pages 页面，顶部会出现：
   `Your site is live at https://<你的用户名>.github.io/<仓库名>/`
5. 打开这个网址验证（建议电脑 + 手机各试一次）。

> 如果访问出现 404：等 2～5 分钟再试；确认仓库是 Public、Pages 分支是 main/root、根目录有 `index.html`。

---

## 二、以后更新作品（两种方式，任选）

### 方式 A：网页上传（最简单，改几个文件时用）
1. 本地修改内容后，在项目根目录执行：
   ```bash
   python _tools/build.py
   ```
   会重新生成：`dist/index.html`、根目录 `index.html`、中文名 HTML。
2. 在 GitHub 仓库页 → **Add file → Upload files**，把更新后的：
   - `index.html`
   - `dist/index.html`
   - （以及有改动的源码文件，如 `src/...`、`docs/提交说明.md`、`README.md`）
   拖进上传区 → **Commit changes**。
3. 等 1～2 分钟，刷新网址即可看到更新（GitHub Pages 自动重新发布；浏览器有缓存可按 Ctrl+F5 强制刷新）。

### 方式 B：GitHub Desktop（推荐长期维护，支持整目录同步）
1. 安装 [GitHub Desktop](https://desktop.github.com/) 并登录你的账号。
2. **File → Clone repository** → 选择你的仓库 → 克隆到本地。
3. 把本项目更新后的文件复制进克隆目录（保留 `.git/` 不动），在 GitHub Desktop 里填写提交信息 → **Commit to main** → **Push origin**。
4. 等 1 分钟后刷新网址。

### 方式 C：命令行（熟悉 git 时）
```bash
git clone https://github.com/<用户名>/<仓库名>.git
cd <仓库名>
# 把更新后的文件覆盖进这个目录
git add -A
git commit -m "更新：水电解质紊乱图谱内容"
git push
```

---

## 三、双链接说明（推荐）

- **GitHub Pages 链接**：`https://<用户名>.github.io/<仓库名>/` —— 你的仓库自动发布，长期由你维护。
- **备用链接**：<https://we-water-na-k.surge.sh> —— 已部署在同一内容上，若学校网络访问 GitHub Pages 较慢/不稳定，可把提交说明中的网址临时换成它（内容是同一版本；改动后需要重新部署 surge 才会同步）。
- 建议：提交作业时用 GitHub Pages 链接；如果老师反馈打不开，改用 surge 链接。

---

## 四、哪些文件不要上传（安全提醒）

| 文件/目录 | 原因 |
| --- | --- |
| `_deploy/账号与发布信息.txt`、`_deploy/邮箱账号.json` | 含托管账号与密码，**绝对不要**上传到公开仓库 |
| `_deploy/node_modules/`、`_tools/smoke/node_modules/` | 依赖体积大，不需要入库 |
| `_deploy/screens/`、`docs/previews/` | 仅本地展示用截图，体积较大 |
| 任何 GitHub Token / 密码文件 | 不要提交；如果误传，立刻删除并吊销 Token |

`GitHub上传包` 已经帮你排除了以上内容；以后用 GitHub Desktop 同步时，请在克隆目录里保留 `.gitignore`（已包含这些排除规则）。

---

## 五、常见问题

1. **Pages 一直是 404**：确认仓库是 Public；Settings → Pages 里分支为 main、目录为 /(root)；根目录存在 `index.html`；等待 2～5 分钟。
2. **页面能打开但样式/交互不对**：确认上传的是最新的 `index.html`（单文件包含全部 CSS/JS，无外部依赖）；强制刷新缓存。
3. **`.nojekyll` 或 `.gitignore` 拖不进去**：在仓库页 **Add file → Create new file**，文件名分别填 `.nojekyll`（内容留空或一个空格）和 `.gitignore`（内容可复制本地 `.gitignore`），分别提交即可。`.nojekyll` 不是必须的，但可避免 GitHub Pages 的 Jekyll 处理。
4. **想用自己的域名**：仓库 Settings → Pages → Custom domain 填写域名并按提示配置 DNS；国内服务器域名需备案。
5. **仓库误设为 Private**：免费账号的 Pages 不发布私有仓库；改回 Public 或升级账号。
6. **想换仓库名**：Settings → Repository name 改名后，Pages 网址会变成新仓库名；记得同步更新提交说明中的链接。
7. **换电脑/重装后构建报错找不到 Node**：`_tools/build.py` 顶部写死了 Node 路径 `C:\Program Files
odejs
ode.exe`；如果 Node 装在别处，改这一行即可（或把 `node` 加入系统 PATH 后改成 `"node"`）。

---

## 六、建好之后

把 Pages 网址（`https://<用户名>.github.io/<仓库名>/`）发给我，我可以帮你：
- 用无头浏览器验证线上页面与深链接是否正常；
- 把 `docs/提交说明.md`、`README.md` 里的提交网址更新为 GitHub Pages 链接（同时保留 surge 备用链接）；
- 更新校验报告中的发布验证记录。
