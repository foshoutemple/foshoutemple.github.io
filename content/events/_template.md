---
draft: true
slug: example-event
publishedDate: "2026-12-01"
date: "2026-12-01"
time: "10:00"
image: null
title:
  zh-hans: "填写法会名称"
  zh-hant: "填寫法會名稱"
  en: "Enter the Dharma Assembly name"
description:
  zh-hans: "填写已核准的活动说明。"
  zh-hant: "填寫已核准的活動說明。"
  en: "Enter the confirmed Dharma Assembly details."
---

这是维护模板，不会在网站上显示。复制到新文件，修改 slug、公告发布日期 publishedDate、法会举行日期 date、时间及三语标题与说明，确认后将 draft 改成 false。法会默认上午 10:00（费城当地时间）开始；只有特别安排才修改 time。法会自动显示在首页「最新消息」、「法会与共修」页的「最新法会」和活动日历，无需再复制到 news。内容使用上方 description 字段；本段正文不会显示。

无配图时保留 image: null。添加海报或照片时，将图片放入 public/images/，再用以下结构替换 image: null（填写实际文件路径、原图宽高及三语图片说明）：

```yaml
image:
  src: "/images/posters/your-poster.png"
  width: 1054
  height: 1492
  alt:
    zh-hans: "填写图片说明"
    zh-hant: "填寫圖片說明"
    en: "Describe the image"
```
