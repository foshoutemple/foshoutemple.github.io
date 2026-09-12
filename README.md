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
| 访客计数器图片地址 | [src/data/site.json](src/data/site.json) 的 `visitorCounterBase` |
| 全站三语文案、开放时间文字及周日流程说明 | [src/data/copy.json](src/data/copy.json) |
| 周日共修时间、活动日历中的停办日期 | [src/data/weekly-practice.json](src/data/weekly-practice.json) |
| 农历初一、十五法会日期、时间及停办日期 | [src/data/lunar-practice.json](src/data/lunar-practice.json) |
| 佛菩萨圣诞与纪念日 | [src/data/holy-days.json](src/data/holy-days.json) |
| 一般寺院消息 | 复制 [content/news/_template.md](content/news/_template.md) |
| 法会公告（进入最新消息、最新法会及活动日历） | 复制 [content/events/_template.md](content/events/_template.md) |
| 网页照片 | `public/images/` |

更改开放时间或常规日程时，同时核对配置、三种语言的说明与时间表，避免不同页面出现不同安排。

英文术语：「法会」统一使用 **Dharma Assembly**，复数为 **Dharma Assemblies**；「法会与共修」栏目为 **Dharma Assemblies & Practice**。正文按句子使用 Dharma assembly／Dharma assemblies，新增法会公告亦沿用此术语。

照片按栏目分别使用，户外共修照仅用于首页。下表适用于全部三种语言；新增照片的图注及替代文字在 `src/data/copy.json` 的 `photos` 字段维护，首页与入口照片仍在 `common` 字段。更换照片时，同时更新 `src/pages/[lang]/[...page].astro` 中的文件名、原图宽高，以及对应三语说明。

| 页面／位置 | `public/images/` 文件 | 素材编号 |
|---|---|---|
| 首页主图 | `shared-practice.jpg` | FS-PH-09 |
| 认识佛寿寺：大众合影 | `temple-community.jpg` | FS-PH-10 |
| 法会与共修：常规安排配图 | `indoor-practice.jpg` | FS-PH-13 |
| 周日共修详情 | `altar-gathering.jpg` | FS-PH-11 |
| 供养与素斋 | `altar-offerings.jpg` | FS-PH-12 |
| 首页寺院介绍、认识佛寿寺及来寺与联络的入口照 | `temple-entrance.jpg` | FS-PH-08 |

首页「最新消息」合并一般消息与法会公告，显示最新 3 条；超过 3 条时，「查看全部」进入 `/语言/news/` 的完整消息列表。「法会与共修」页只显示「最新法会」，收录全部已发布法会，不混入一般消息。暂无内容时保留待更新提示。法会只写入 `content/events/` 一次，会同时进入首页消息列表、最新法会和活动日历，无需复制到 `content/news/`。

新增内容：按上表复制对应模板为同一文件夹下的新 `.md` 文件，例如 `content/news/temple-notice.md` 或 `content/events/dharma-assembly.md`。填入唯一的 `slug`（小写英文字母、数字和连字符）、引号包住的 `YYYY-MM-DD` 日期，以及三语标题和内容。一般消息的 `date` 是发布日期；法会的 `publishedDate` 是公告发布日期，`date` 是法会举行日期。法会默认上午 10:00（费城当地时间）开始；若有特别安排，在 `time` 填入已确认的其他时间，例如 `"09:00"` 或 `"10:00–11:30"`。旧文件或遗漏的 `time` 会按 10:00 处理。若佛菩萨圣诞法会取代同日的农历初一或十五法会，将 `replacesLunarPractice: true`；日历会隐藏重复的常规法会，只保留圣诞法会。列表按公告发布日期从新到旧排列；旧文件没有 `publishedDate` 时使用 `date` 排序。法会日期始终用于活动日历，已过日期的公告仍保留供查阅。

消息和法会均可配图。先将图片放进 `public/images/`（海报可放入 `public/images/posters/`），再按模板将 `image: null` 改为包含 `src`、原图 `width`／`height`、三语 `alt` 的对象。`src` 从 `/images/` 开始，支持 PNG、JPEG、WebP、AVIF；缺少文件、尺寸无效或缺少任一语言的图片说明会阻止发布。列表显示完整比例的图片预览，详情页显示大图，点击可查看原图。没有图片时保留 `image: null`，仍可发布纯文字消息。

已发布示例：[2026 年 9 月 10 日地藏菩萨圣诞法会](content/events/2026-09-10-ksitigarbha-birthday.md)。用户确认上午 10:00（费城当地时间）开始，地点为佛寿寺；同日佛教纪念日条目的 `serviceTime` 已同步。海报为繁体中文，日期、时间、地点和说明另以三语网页文字提供。

未确认时保留 `draft: true`；文案确认后明确改成 `draft: false`，重新构建，检查三语列表与详情页。缺少任何一种语言、日期无效或 slug 重复会阻止发布；法会 slug 不可使用已保留给周日共修页的 `sunday`。页面内容使用模板顶部的 `title` 和 `description` 字段；模板下方的 Markdown 正文不会显示。两份 `_template.md` 请一直保留为草稿，避免将示例发布到官网。

「法会与共修」页另有[活动日历](https://foshoutemple.github.io/zh-hans/services/#activity-calendar)，支持翻月、返回本月及点选日期查看当天活动。默认显示费城当前月份，语言切换会保留选定的月份和日期。每周日常规共修自动列入；已发布的 `content/events/` 法会按举行日期加入日历，并连到对应详情页。佛菩萨圣诞法会若标记为取代同日初一／十五法会，活动日历会隐藏重复的常规条目。`content/news/` 消息和佛教纪念日不自动转为活动安排。

周日的上午起止时间与下午晚课开始时间在 `src/data/weekly-practice.json` 维护，日历与常规时间表共用。`excludedDates` 默认为空数组；若某个周日停办常规共修，或改为特别法会，可加入该周日的 `"YYYY-MM-DD"` 日期，日历会移除当日的常规共修，但保留已发布的特别法会；首页的下一次常规共修日期也会跳过该日。临时调整仍应同时发布公告说明。只修改日期或时间配置后，亦须提交并重新发布。

农历初一、十五法会已加入活动日历及全年日历，日期资料完整覆盖公历 **2026、2027 年，共 50 个日期（每年 25 个）**。与佛菩萨圣诞法会重合时，页面只保留圣诞法会，不重复显示常规条目；其他日期显示简体、繁体及英文详情，并附对应农历年月日。完整日期见 [核对表](LUNAR_PRACTICE_DATES.md)，两家官方年历的交叉核对方法见 [日期依据](CALENDAR_SOURCES.md)。这些是常规法会日期，不会逐条进入首页最新消息或最新法会公告栏。

在 `src/data/lunar-practice.json` 中维护安排：`time` 是初一、十五法会的默认开始时间，现为 `"10:00"`（费城当地时间）。`timeOverrides` 可为某日单独设置其他时间，例如 `{"2026-09-25":"11:00"}`；若寺院明确要求某日暂不公布时间，才使用 `null` 覆盖默认值。`excludedDates` 可加入停办法会的日期，例如 `["2026-09-11"]`。初一、十五法会默认上午 10:00，不自动沿用周日以外的其他特别安排。

同一天的周日共修、初一／十五法会及一般特别法会会同时保留。佛菩萨圣诞法会若与初一／十五重合，则在公告中设置 `replacesLunarPractice: true`，日历只保留圣诞法会；如需其他特别法会代替常规活动，仍分别在对应的周日或农历配置中排除当天，并发布公告。

`dates` 是经过核对的日期资料，不用逐月手算或手动改写。`node scripts/check-lunar-practice.mjs` 会核对保存的官方来源及全部 730 天对应关系；`--write` 可从同一来源重新生成日期与核对表，并保留时间、停办和单日覆盖配置。新增年份时，先补足该年的香港天文台 CSV／文本表和中央气象署月首表证据，再更新核对脚本与完整年份范围、重新生成并检查。浏览器农历算法在 2027 年春节附近存在已记录的一天差异，因此前端只使用核准的公历日期。

日历由用户每年核对更新。当前有 43 条日期，完整覆盖公历 2026、2027 年，并保留农历 2027 年末延续至 2028 年 1 月的两条记录；这不代表已提供完整 2028 年日历。日期依据见 [CALENDAR_SOURCES.md](CALENDAR_SOURCES.md)。法会详情默认显示上午 10:00；只有特别指定的时间或明确标记为待公布时才改变。

## 已确认资料

- 寺名：佛壽寺 / Fo Shou Temple；地址：1015 Cherry Street, Philadelphia, PA 19107。
- 住持：釋賢參法師（简体：释贤参法师）；英文页面写作 Venerable Shi Xian Can，并保留中文法名。
- 公开邮箱：<foshoutemple@gmail.com>。
- 每天 9:00–17:00 开放，欢迎礼佛、点香，无需登记。
- 共修以普通话为主。每次共修后，楼下提供免费素斋；周日流程为上午共修、素斋、下午晚课。欢迎大众现场供斋，广种福田。
- 圣诞法会通常在农历正日举行，具体安排以寺院公告为准。
- 每月农历初一、十五举行法会，用户于 2026-09-07 确认；法会默认上午 10:00 开始，特别指定的时间以单日安排为准。
- 用户选定的户外共修照片仅用于首页显眼位置，其他页面使用与栏目内容相符的室内照片。

## GitHub Pages 部署

网站由寺方 GitHub 账号 `foshoutemple` 持有，公开仓库为 `foshoutemple/foshoutemple.github.io`。本目录是仓库根目录，发布分支是 `main`，首页地址为 https://foshoutemple.github.io/ 。

首次设置：在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。将网站文件推送到 `main` 后，[部署工作流](.github/workflows/deploy.yml)会安装锁定的依赖、构建、检查内容与内部链接，再发布 `dist/`。也可从 **Actions → Deploy to GitHub Pages → Run workflow** 手动运行，选择 `main` 分支。

工作流使用 Node.js 24、pnpm 11.19.0，并从仓库所有者自动取得 `SITE_URL`；`BASE_PATH` 为 `/`，适用于当前账号主页仓库。无需额外保存访问令牌或部署密钥。若将来改为其他仓库名或独立域名，需要同步修改网址配置并重新检查链接。

公开仓库建议只收录：`.github/`、`.gitignore`、`astro.config.mjs`、`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`src/`、`public/`、`scripts/`、`content/`、`README.md` 和 `CALENDAR_SOURCES.md`。推送前检查暂存文件清单。`.gitignore` 已排除依赖、构建产物、日志、截图、原图副本、环境变量文件与内部规划文档。

日常发布：修改上述内容文件，提交并推送到 `main`。工作流会自动检查并更新官网。也可在 GitHub 仓库网页中打开文件，点击编辑，修改后提交到 `main`。新增法会时请同时填写三种语言；提交后到 Actions 查看运行结果，绿色表示发布成功。

发布成功后，检查首页语言选择，以及 `/zh-hans/`、`/zh-hant/`、`/en/` 的相关页面、图片与日期。若需要撤回一次内容修改，可在本地对对应提交执行 `git revert`，再推送到 `main`，网站会自动重新发布。

配置依据：[Astro 的 GitHub Pages 指南](https://docs.astro.build/en/guides/deploy/github/)及 [GitHub Pages 自定义工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 访客计数器

网站底部右下角使用一个很小的 Hits 徽章。它直接请求 `hits.sh` 的 SVG 图片，不需要注册账号、邮箱、密码或验证码；`visitorCounterBase` 只需保持为本站的徽章地址即可。徽章以 `foshoutemple.github.io` 作为累计计数的唯一标识，三种语言共用同一个数字。

这是一个轻量的公开累计访问次数徽章，适合当前静态 GitHub Pages 网站；它不提供 GoatCounter 那样的来源、页面路径和时间范围分析。Hits 官方文档说明其徽章无需注册即可使用，并介绍了 URL 与颜色、标签参数：[Hits 文档](https://hits.sh/docs/)。

## Google 搜索收录

使用当前 GitHub Pages 网址即可被搜索引擎收录，不必先购买独立域名。网站可访问与已经被 Google 收录是两件事；新站的抓取需要时间，提交请求也不保证立即收录或排名。

每次构建会自动生成 [站点地图](https://foshoutemple.github.io/sitemap-index.xml)，列出全部三语内容页面及对应语言版本；语言跳转入口和 404 页面不列入。根目录的 [robots.txt](https://foshoutemple.github.io/robots.txt) 允许抓取并标明站点地图位置。新增法会后无需手动维护站点地图。

目前已使用寺院邮箱 `foshoutemple@gmail.com` 在 [Google Search Console](https://search.google.com/search-console/about) 添加并验证 **URL prefix / 网址前缀** 资源 `https://foshoutemple.github.io/`。验证方式是首页 HTML meta 标签；请保留 `googleSiteVerification` 配置，以免失去所有权验证。这里不使用需要 DNS 管理权限的 Domain / 网域验证。

`sitemap-index.xml` 已提交到 **Sitemaps / 站点地图**，并已为网站根地址及 `/zh-hans/`、`/zh-hant/`、`/en/` 请求编入索引。首次提交后报告可能暂时显示 “Couldn't fetch” 或 0 个已发现页面；先用 URL Inspection 的 **Live Test** 检查可访问性，之后等待 Google 处理即可。不要重复提交同一网址；可在 Search Console 的 [网址检查报告](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Ffoshoutemple.github.io%2F) 查看状态。

也可在寺院管理的 Google Maps 商家资料、Facebook 与 YouTube 简介中填写官网地址，方便信众访问及搜索引擎发现。添加站点地图本身不会自动建立 Search Console 资源，也不代表已向 Google 提交收录请求。

参考：[Google 关于请求抓取的说明](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)、[Search Console 资源类型与验证](https://support.google.com/webmasters/answer/34592)。
