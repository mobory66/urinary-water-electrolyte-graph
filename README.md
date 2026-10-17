# 水、电解质代谢紊乱 · 知识图谱与问题图谱

泌尿整合课程“师—生—机”协同教改作品（2024 级基础医学班）。一个可交互的**单文件网页**，包含知识图谱与问题图谱两部分，以及病例情境、学习工具与设计说明。

- **在线访问（GitHub Pages）**：<https://mobory66.github.io/urinary-water-electrolyte-graph/>
- **源码仓库**：<https://github.com/mobory66/urinary-water-electrolyte-graph>
- **备用访问（surge.sh）**：<https://we-water-na-k.surge.sh>

## 作品概况

- **知识图谱**：65 个知识节点、152 条关系、7 个学科阶段（生理→病生→病理→药理→临床）、5 个学科、7 类关系；40 个关键机制节点附可点击文献链接。交互：缩放/拖动、节点与连线详情、关联深度、关系类型筛选、学习路径漫游（8 步）、两点找路径、小地图、全屏、键盘导航。
- **问题图谱**：35 个问题，100% 溯源知识节点；三级问题（记忆/分析/应用）＋四类问题（概念/机制/病例/综合）；机制探究类 15 题（42.9%）；文献溯源题 1 道。
- **病例情境**：7 个病例（高渗/低渗性脱水、利尿药致低钾、CKD 高钾急救、SIADH、肾病综合征水肿、DKA 与钾）。
- **学习工具**：体液分布计算器、缺水/缺钠估算器（教学演示）、低钾/高钾心电图交互、对比速查表、补钾与高钾急救清单。
- **依据**：55 条（教材 5 部 + 期刊文献 46 篇 + 指南/共识/WHO 文件 4 份），期刊文献 PMID/DOI 经 NCBI E-utilities 逐条核对。

## 更新作品（网址不变）

```bash
# 1. 修改本地 src/ 后重新构建（需要 Node.js + Python 3）
python _tools/build.py

# 2. 把更新后的 index.html、dist/index.html（及有改动的源码）提交到本仓库
#    - 网页上传：仓库页 Add file → Upload files
#    - 或 GitHub Desktop：Commit → Push
# 3. 等 1～2 分钟，刷新 GitHub Pages 网址即可
```

详细步骤见 [docs/GitHub维护指南.md](docs/GitHub维护指南.md)。

## 目录结构

```
├─ index.html                              # GitHub Pages 入口（构建产物，与 dist/index.html 相同）
├─ dist/index.html                         # 构建输出（部署用）
├─ 水电解质紊乱_知识图谱与问题图谱.html      # 同内容，便于本地双击打开
├─ .nojekyll                               # 关闭 GitHub Pages 的 Jekyll 处理
├─ docs/                                   # 提交说明、部署说明、校验报告、GitHub 维护指南
├─ src/                                    # 源文件：数据 / 应用 / 样式 / 模板
├─ _tools/                                 # 构建与校验脚本（build.py / validator.js / smoke/test.js）
└─ 泌尿整合教改  知识图谱问题图谱 评分细则.docx   # 课程评分细则（原始材料）
```

## 本地构建

```bash
python _tools/build.py     # 数据校验 → 生成 dist/index.html 与根目录 index.html
```

## 说明

页面内容依据人卫版第 10 版教材、临床指南与已发表文献整理并人工核对，仅供课程学习与复习使用，不构成临床诊疗建议。
