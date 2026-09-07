---
draft: true
slug: example-news
date: "2026-12-01"
image: null
title:
  zh-hans: "填写消息标题"
  zh-hant: "填寫消息標題"
  en: "Enter the news headline"
description:
  zh-hans: "填写已核准的消息内容。"
  zh-hant: "填寫已核准的消息內容。"
  en: "Enter the confirmed news."
---

这是维护模板，不会在网站上显示。复制到新文件，修改 slug、发布日期及三语标题与内容，确认后将 draft 改成 false。内容使用上方 description 字段；本段正文不会显示。

一般寺院消息放在此目录；有举行日期的法会请用 content/events/ 的模板，会自动合并到「最新消息」。无配图时保留 image: null。添加图片时，将文件放入 public/images/，再用以下结构替换 image: null（填写实际文件路径、原图宽高及三语图片说明）：

```yaml
image:
  src: "/images/your-photo.jpg"
  width: 1280
  height: 960
  alt:
    zh-hans: "填写图片说明"
    zh-hant: "填寫圖片說明"
    en: "Describe the image"
```
