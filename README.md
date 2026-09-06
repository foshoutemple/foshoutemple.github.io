# 佛壽寺官方网站

第一版已实现为 Astro 静态网站，提供简体中文、繁体中文和英文。GitHub Pages 部署流程已备妥；当前尚未发布，待寺方 GitHub 账号及仓库建立后执行首次部署。

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
| 特别法会及公告 | 复制 [content/events/_template.md](content/events/_template.md) |
| 网页照片 | `public/images/` |

更改开放时间或常规日程时，同时核对配置、三种语言的说明与时间表，避免不同页面出现不同安排。

新增公告：复制模板为新的 `.md` 文件，填入唯一的 `slug`、引号包住的 `YYYY-MM-DD` 日期、时间、三语标题和说明。未确认时保留 `draft: true`；文案确认后改成 `false`，重新构建，检查三语公告列表与详情页。页面内容使用模板顶部字段；正文不是当前的页面内容入口。

日历由用户每年核对更新。当前有 43 条日期，完整覆盖公历 2026、2027 年，并保留农历 2027 年末延续至 2028 年 1 月的两条记录；这不代表已提供完整 2028 年日历。日期依据见 [CALENDAR_SOURCES.md](CALENDAR_SOURCES.md)。`serviceTime: null` 表示具体法会时间待公布；不要把纪念日直接当成已确认的法会时刻。

## 已确认资料

- 寺名：佛壽寺 / Fo Shou Temple；地址：1015 Cherry Street, Philadelphia, PA 19107。
- 公开邮箱：<foshoutemple@gmail.com>。
- 每天 9:00–17:00 开放，欢迎礼佛、点香，无需登记。
- 共修以普通话为主。每次共修后，楼下提供免费素斋；周日流程为上午共修、素斋、下午晚课。欢迎现场供斋。
- 圣诞法会通常在农历正日举行，具体安排以寺院公告为准。
- 用户选定的户外共修照片用于首页显眼位置。

## GitHub Pages 部署

使用寺方拥有的 GitHub 账号，建立公开仓库 `USERNAME.github.io`，其中 `USERNAME` 必须替换为该账号的实际用户名。把本目录作为仓库根目录，默认分支使用 `main`。部署后首页地址为 `https://USERNAME.github.io/`。

首次设置：在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。将网站文件推送到 `main` 后，[部署工作流](.github/workflows/deploy.yml)会安装锁定的依赖、构建、检查内容与内部链接，再发布 `dist/`。也可从 **Actions → Deploy to GitHub Pages → Run workflow** 手动运行，选择 `main` 分支。

工作流使用 Node.js 24、pnpm 11.19.0，并从仓库所有者自动取得 `SITE_URL`；`BASE_PATH` 为 `/`，适用于 `USERNAME.github.io` 这种账号主页仓库。无需额外保存访问令牌或部署密钥。若将来改为其他仓库名或独立域名，需要同步修改网址配置并重新检查链接。

公开仓库建议只收录：`.github/`、`.gitignore`、`astro.config.mjs`、`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`src/`、`public/`、`scripts/`、`content/`、`README.md` 和 `CALENDAR_SOURCES.md`。推送前检查暂存文件清单。`.gitignore` 已排除依赖、构建产物、日志、截图、原图副本、环境变量文件与内部规划文档。

首次部署成功后，检查首页语言选择，以及 `/zh-hans/`、`/zh-hant/`、`/en/` 的各子页面、图片、字体及 404 页面。本文件中的 `USERNAME` 是占位符，不代表已经注册的账号或已发布的网址。

配置依据：[Astro 的 GitHub Pages 指南](https://docs.astro.build/en/guides/deploy/github/)及 [GitHub Pages 自定义工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
