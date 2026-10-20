# 工程约定与交接说明

本文件写给在这个仓库里工作的开发者（人或 agent），不属于站点内容，也不会出现在任何页面的导航里。
改动站点前先读完这一页，可以省掉大部分返工。

## 1. 这个仓库是什么

多学科化学知识库的静态站点集合。每个学科一个子目录，各自是一套独立页面 + 各自的数据文件：

| 目录 | 学科 | 已发布地址 |
| --- | --- | --- |
| `analytical/` | 分析化学 | analytical.chemistryatlas.xyz |
| `inorganic/` | 无机化学 | inorganic.chemistryatlas.xyz |
| `organic/` | 有机化学 | organic.chemistryatlas.xyz |
| `biochem/` | 生物化学 | （同一主域下子路径） |
| `physical/` | 物理化学 | （同上） |
| `quiz/` | 题库与做题引擎 | （同上） |
| `hub/` | 导航首页 | chemistryatlas.xyz |

约定：**线上发布的是各目录下的 `dist/`**。改内容改 `dist/`，不要只改根目录那份然后忘记同步。

`quiz/` 是唯一一个「源码 + 发布副本」两份都提交的站点：`quiz/quiz-engine.js` 与
`quiz/dist/quiz-engine.js` 必须保持只差一行——`renderFatalError()` 里的首页链接，
源码用 `../hub/dist/index.html`，dist 用绝对地址 `https://chemistryatlas.xyz`。
改引擎时先改源码，再复制到 dist，最后把那行链接改回绝对地址，并用
`git diff --no-index quiz/quiz-engine.js quiz/dist/quiz-engine.js` 确认只差这一行。

## 2. 页面结构约定

各站细节略有差别，但骨架一致，新增页面直接抄同站最近的页面最省事：

- `<html lang="zh-CN">`，标题格式 `NN 章节名 · XX知识库`。
- 侧栏分组手写在每个页面里（不是组件），新增条目要改**所有**页面的侧栏，并保证每页只有一个
  `class="active"`。
- 正文用 `<section id="锚点">` 切分，小节序号写成 `N.N`；小标题上方有一行英文 kicker。
- 化学式一律用 `<sub>` / `<sup>`，不要引入 LaTeX 或 MathJax。
- 课件原图放在 `<figure class="ppt-figure ppt-figure-light">` 里，`<figcaption>` 末尾统一跟
  `<small>图源：课件名, slide N</small>`。
- 页脚有 `来源：` 说明（教材章节 / 课件页码）。

## 3. 词条与索引

- `dist/data/terms.json`：双语词条库，每条有 slug、中英名、分类、释义。
- `dist/data/notes.json`：**全文检索索引**，条目里的锚点必须真实存在于页面中。
  这个文件千万不要手工维护，改完页面后按页面里实际的 `<section id>` 重新生成一次，
  否则搜索结果会跳到空锚点。
- `organic/dist/script.js` 里的 `TERM_IMAGES` 决定词条详情页配图；缺图会显示占位。

## 4. Service Worker

`analytical/`、`inorganic/`、`organic/`、`biochem/`、`physical/` 都有 `dist/sw.js`，缓存名形如
`const CACHE='...-vNN'`，并有一个 `SHELL` 预缓存列表。

**任何内容改动都必须把 `vNN` 加一**，否则老访客会一直读到缓存里的旧字节，看起来像「改了没生效」。
新增页面还要把路径加进 `SHELL`。`quiz/` 没有 service worker，不需要这一步。

## 5. 内容生产链路（课件 → 页面）

1. 课件是 `分析化学/课件/*.pptx`、`有机化学/课件/*.ppt` 之类。老的 `.ppt` 直接做文本提取
   通常拿不到东西，或者中英文错行，不要指望它。
2. 统一走 LibreOffice Kit 转 PDF 再渲染成 PNG，然后逐张看图：
   `D:\Deepseek Harness\resources\app.asar.unpacked\dsh\node_modules\@deepseek-ai\libreoffice-kit\lib\cli.js`
   （`convert` 转 PDF，`render --dpi 150~180` 出图）。
3. 图形素材裁成 WebP（质量 88 左右，宽度不超过 1250）放进对应站的 `dist/assets/`。
   裁图时注意把课件页码、章节标签、校徽一并裁掉。
4. 页面写完后跑该站的校验脚本（见下），再截图目视检查一遍。

## 6. 校验脚本

`_scratch/` 下有一批一次性脚本，能复用的主要有（该目录在仓库**外面**，是仓库根目录的同级目录，
不进版本库也不参与发布；换了机器没有这个目录时按用途重写即可）：

- `validate_ana.py` / `validate_inorg.py` / `validate_org_site.py` / `validate_biochem.py`：
  检查标签闭合、站内链接、侧栏 active 唯一性、词条封面图覆盖率、sw.js 清单覆盖。
- `check_ana_links.py`：分析化学站的内链专项检查。
- `validate_topic_page.py`：分析化学公式专题页。
- `ana_topic_verify.py`、`bio_verify.py`、`verify_smiles.py`：把页面上引用的数值重新算一遍。
- `quiz_enter_probe.mjs`、`practice_enter_probe.mjs`：用 headless Edge + CDP 实际按键，
  验证做题页的键盘交互（回车跳下一题）。改动交互后跑这两个。

改完页面至少跑对应站的 `validate_*.py`，要求 `TOTAL PROBLEMS: 0` 再提交。

## 7. 已知坑

- **Cloudflare 会挡裸请求**：命令行里直接 `urllib` 拿线上文件会得到 403，必须带浏览器
  User-Agent；`Invoke-WebRequest` 还会先吃一个 308。`curl.exe -sL -A "<UA>"` 最稳。
- **上线有延迟**：`git push` 之后大约 2~4 分钟才生效，验线上时先比对 `sw.js` 里的缓存版本号。
- **`git push` 退出码不可信**：git 把进度写到 stderr，这个环境里成功推送也会显示
  `[exit code: 1]`，看 `old..new main -> main` 那一行。
- **表格列被压扁**：浏览器自动表格布局会把只有两三个汉字的首列压到几十像素，出现「一行一两个字」。
  需要给这类表加 `table-layout:fixed` 并显式写列宽。
- **标题里的词被自动加链接**：给正文词条做自动内链的脚本必须跳过 `<head>`、标题、图注和已有链接，
  否则 `<title>` 里会混进 `<a>`，页面标题就坏了。
- **懒加载与截图**：`loading="lazy"` 的图在 headless 截图里可能来不及加载，看到空白先别急着改内容，
  把虚拟时间调大或用 `loading="eager"` 再看。

## 8. 当前状态

- 分析化学：第 1~8 章 + 公式专题页（不参与章节编号，序号用 ◆）。
- 有机化学：第 01~12 课 + 共振专题。
- 物理化学：第 01~11 课；无机化学：第 01~06 课。
- 生物化学：章节页 + 练习中心 + 主动回忆卡片。
- 题库 `quiz/data/*.json` 已覆盖各科章节练习，`quiz/data/index.json` 是总目录。
- 做题界面共有两处：`quiz/` 的分题引擎（`?quiz=<id>` 进入），和 `biochem/dist/practice.html`
  的一页式练习。两处都已支持**回车跳下一题**（最后一题不跳，弹窗打开时不跳，
  焦点在选项上时先记录答案再跳）；新增做题界面请沿用同一套判定条件：
  忽略输入法合成事件、忽略带修饰键的回车、忽略链接/输入框/操作栏/题号导航上的回车。
