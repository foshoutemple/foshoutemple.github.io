# 佛壽寺官方网站

佛壽寺官方网站使用 Astro 构建，提供简体中文、繁体中文和英文。首次访问按浏览器语言选择版本，也可手动切换。

- 官网：https://foshoutemple.github.io/
- 代码仓库：https://github.com/foshoutemple/foshoutemple.github.io
- 发布记录：[GitHub Actions](https://github.com/foshoutemple/foshoutemple.github.io/actions)

## 本地运行

在已安装 Node.js 24 和 pnpm 11 的 PowerShell 中执行：

```powershell
Set-Location C:\Playground\Buddism\official_website
pnpm install --frozen-lockfile --ignore-scripts
$env:ASTRO_TELEMETRY_DISABLED = '1'
node node_modules/astro/astro.js build
node scripts/check-content.mjs
node scripts/preview.mjs
```

打开 <http://127.0.0.1:4321/>。首次访问按浏览器语言选择版本；手动切换会记住选择。可直接打开 `/zh-hans/`、`/zh-hant/` 或 `/en/`。在终端按 `Ctrl+C` 停止预览。

日常修改可运行 `node node_modules/astro/astro.js dev --host 127.0.0.1`；交付检查仍使用上面的构建及静态预览。修改源文件后须重新构建，`dist/` 才会更新。内容检查会核对三语字段、纪念日日期、页面内部链接与资源；桌面和手机排版另用浏览器检查。截图保存在 `screenshots/`。

## 内容维护

主要维护人：用户本人。网页内容以下列源文件为准，直接修改 `dist/` 不会保留到下次构建。

| 要修改的内容 | 文件 |
|---|---|
| 邮箱、地址、地图、社交链接、开放时间配置 | [src/data/site.json](src/data/site.json) |
| 全站三语文案、开放时间文字及周日流程说明 | [src/data/copy.json](src/data/copy.json) |
| 周日时间表中显示的具体时段 | [src/components/Schedule.astro](src/components/Schedule.astro) |
| 佛菩萨圣诞与纪念日 | [src/data/holy-days.json](src/data/holy-days.json) |
| 最新消息 | 复制 [content/news/_template.md](content/news/_template.md) |
| 最近法会 | 复制 [content/events/_template.md](content/events/_template.md) |
| 网页照片 | `public/images/` |

更改开放时间或常规日程时，同时核对配置、三种语言的说明与时间表，避免不同页面出现不同安排。

首页和「法会与共修」页都固定显示「最新消息」与「最近法会」。暂无内容时显示待更新提示，不会隐藏栏目。两页共用内容，无需重复维护；首页各显示最近 3 条，超过 3 条时提供「查看全部」，法会页显示全部。条目按日期从新到旧排列，已过日期的法会保留，方便查阅。

新增内容：按上表复制对应模板为同一文件夹下的新 `.md` 文件，例如 `content/news/temple-notice.md` 或 `content/events/special-service.md`。填入唯一的 `slug`（小写英文字母、数字和连字符）、引号包住的 `YYYY-MM-DD` 日期，以及三语标题和内容。消息的 `date` 是发布日期；法会的 `date` 是举行日期，`time` 可填 `"10:00–11:30"` 等具体时间，未确认则保留 `null`。

未确认时保留 `draft: true`；文案确认后明确改成 `draft: false`，重新构建，检查三语列表与详情页。缺少任何一种语言、日期无效或 slug 重复会阻止发布；法会 slug 不可使用已保留给周日共修页的 `sunday`。页面内容使用模板顶部的 `title` 和 `description` 字段；模板下方的 Markdown 正文不会显示。两份 `_template.md` 请一直保留为草稿，避免将示例发布到官网。

日历由用户每年核对更新。当前有 43 条日期，完整覆盖公历 2026、2027 年，并保留农历 2027 年末延续至 2028 年 1 月的两条记录；这不代表已提供完整 2028 年日历。日期依据见 [CALENDAR_SOURCES.md](CALENDAR_SOURCES.md)。`serviceTime: null` 表示具体法会时间待公布；不要把纪念日直接当成已确认的法会时刻。

## 已确认资料

- 寺名：佛壽寺 / Fo Shou Temple；地址：1015 Cherry Street, Philadelphia, PA 19107。
- 住持：釋賢參法師（简体：释贤参法师）；英文页面写作 Venerable Shi Xian Can，并保留中文法名。
- 公开邮箱：<foshoutemple@gmail.com>。
- 每天 9:00–17:00 开放，欢迎礼佛、点香，无需登记。
- 共修以普通话为主。每次共修后，楼下提供免费素斋；周日流程为上午共修、素斋、下午晚课。欢迎现场供斋。
- 圣诞法会通常在农历正日举行，具体安排以寺院公告为准。
- 用户选定的户外共修照片用于首页显眼位置。

## GitHub Pages 部署

网站由寺方 GitHub 账号 `foshoutemple` 持有，公开仓库为 `foshoutemple/foshoutemple.github.io`。本目录是仓库根目录，发布分支是 `main`，首页地址为 https://foshoutemple.github.io/ 。

首次设置：在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。将网站文件推送到 `main` 后，[部署工作流](.github/workflows/deploy.yml)会安装锁定的依赖、构建、检查内容与内部链接，再发布 `dist/`。也可从 **Actions → Deploy to GitHub Pages → Run workflow** 手动运行，选择 `main` 分支。

工作流使用 Node.js 24、pnpm 11.19.0，并从仓库所有者自动取得 `SITE_URL`；`BASE_PATH` 为 `/`，适用于当前账号主页仓库。无需额外保存访问令牌或部署密钥。若将来改为其他仓库名或独立域名，需要同步修改网址配置并重新检查链接。

公开仓库建议只收录：`.github/`、`.gitignore`、`astro.config.mjs`、`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`src/`、`public/`、`scripts/`、`content/`、`README.md` 和 `CALENDAR_SOURCES.md`。推送前检查暂存文件清单。`.gitignore` 已排除依赖、构建产物、日志、截图、原图副本、环境变量文件与内部规划文档。

日常发布：修改上述内容文件，提交并推送到 `main`。工作流会自动检查并更新官网。也可在 GitHub 仓库网页中打开文件，点击编辑，修改后提交到 `main`。新增法会时请同时填写三种语言；提交后到 Actions 查看运行结果，绿色表示发布成功。

发布成功后，检查首页语言选择，以及 `/zh-hans/`、`/zh-hant/`、`/en/` 的相关页面、图片与日期。若需要撤回一次内容修改，可在本地对对应提交执行 `git revert`，再推送到 `main`，网站会自动重新发布。

配置依据：[Astro 的 GitHub Pages 指南](https://docs.astro.build/en/guides/deploy/github/)及 [GitHub Pages 自定义工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## Google 搜索收录

使用当前 GitHub Pages 网址即可被搜索引擎收录，不必先购买独立域名。网站可访问与已经被 Google 收录是两件事；新站的抓取需要时间，提交请求也不保证立即收录或排名。

每次构建会自动生成 [站点地图](https://foshoutemple.github.io/sitemap-index.xml)，列出全部三语内容页面及对应语言版本；语言跳转入口和 404 页面不列入。根目录的 [robots.txt](https://foshoutemple.github.io/robots.txt) 允许抓取并标明站点地图位置。新增法会后无需手动维护站点地图。

下一步使用寺院邮箱 `foshoutemple@gmail.com` 登录 [Google Search Console](https://search.google.com/search-console/about)，添加 **URL prefix / 网址前缀** 资源 `https://foshoutemple.github.io/`。完成 Google 提供的 HTML 文件或 meta 标签所有权验证后，在 **Sitemaps / 站点地图** 提交 `sitemap-index.xml`。这里不使用需要 DNS 管理权限的 Domain / 网域验证。

在 **URL inspection / 网址检查** 分别检查 `/zh-hans/`、`/zh-hant/` 和 `/en/`，按需点击 **Request indexing / 请求编入索引**。不要重复提交同一网址；过几天查看抓取和收录状态即可。保留验证文件或标签，以免失去所有权验证。

也可在寺院管理的 Google Maps 商家资料、Facebook 与 YouTube 简介中填写官网地址，方便信众访问及搜索引擎发现。添加站点地图本身不会自动建立 Search Console 资源，也不代表已向 Google 提交收录请求。

参考：[Google 关于请求抓取的说明](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)、[Search Console 资源类型与验证](https://support.google.com/webmasters/answer/34592)。
