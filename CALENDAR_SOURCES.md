# Calendar evidence notes

Verified on 2026-09-06. Output: `website-holy-days.json`.

## Scope

- Twenty recurring Han Chinese Buddhist observances, following the Hong Kong Buddhist Association's FAQ list: <https://www.hkbuddhist.org/zh/top_page.php?cid=12&p=fqa>.
- Lunar years 2026 and 2027 are complete. Three carryover observances from lunar year 2025 are also included so Gregorian year 2026 is complete.
- Total: 43 event records. By Gregorian year: 21 in 2026, 20 in 2027, and 2 in January 2028 (the end of lunar year 2027).
- Event IDs begin with the **lunar year**, while `date` is the Gregorian date. A UI year selector should filter `date`, not the ID.
- `years: [2026, 2027]` identifies the fully covered Gregorian years. January 2028 is a continuation only, not a full 2028 calendar.
- Traditional observances do not on their own change the date conversion. The user confirmed that Dharma Assemblies default to **10:00 Philadelphia time** unless a special time is specified. The Ksitigarbha assembly on September 10, 2026 is explicitly 10:00; calendar detail pages use 10:00 when a traditional observance has no separate time override.

## Conversion method

The generator selects matching lunar month and lunar date from the Hong Kong Observatory's official CSVs for 2026, 2027, and 2028, including Gan-Zhi year to avoid mixing lunar years. It does not calculate approximate lunar dates or use an unofficial package. The original downloaded CSVs and the small PowerShell generation script remain alongside the output for review.

- <https://data.weather.gov.hk/weatherAPI/hko_data/calendar/nongli_calendar_2026.csv>
- <https://data.weather.gov.hk/weatherAPI/hko_data/calendar/nongli_calendar_2027.csv>
- <https://data.weather.gov.hk/weatherAPI/hko_data/calendar/nongli_calendar_2028.csv>

These are civil calendar dates from the standard Chinese lunar calendar, not astronomical timestamps requiring conversion into America/New_York time. Keep them as `YYYY-MM-DD` date strings; avoid UTC-midnight parsing that could shift the displayed Philadelphia date to the previous day.

## Month-end rules

The association explicitly lists Ksitigarbha's birthday as lunar 7/30 (or 7/29), and Medicine Buddha's birthday as lunar 9/30 (or 9/29). The output uses day 30 when present, otherwise day 29:

| Observance | 2026 | 2027 |
|---|---|---|
| Ksitigarbha | 2026-09-10, lunar 7/29 | 2027-08-31, lunar 7/30 |
| Medicine Buddha | 2026-11-08, lunar 9/30 | 2027-10-28, lunar 9/29 |

The association's own 2026 calendar also lists Ksitigarbha on 7/29 and Medicine Buddha on 9/30: <https://www.hkbuddhist.org/editor_upload_image/file/calendar2026.pdf>.

## Other checks

- Ullambana / Buddha's Joyful Day is one combined record on lunar 7/15. The naming equivalence is supported by the association's magazine, issue 663, article “盂蘭盆節”: <https://www.hkbuddhist.org/magazine/663.pdf>.
- Lunar 2026 month 12 falls in Gregorian 2027: Shakyamuni's enlightenment is January 15; Huayan Bodhisattva's birthday is February 5.
- Lunar 2027 month 12 falls across Gregorian 2027–2028: Shakyamuni's enlightenment is January 4, 2028; Huayan Bodhisattva's birthday is January 25, 2028.
- Simplified Chinese, Traditional Chinese, and English titles are supplied for every entry. English titles are concise editorial translations, not official quotations from the source.
- This is a general Han Chinese observance reference. The selected list does not independently establish that Fo Shou Temple conducts a special service for every listed observance.

## Lunar first- and fifteenth-day Dharma assemblies

Verified on **2026-09-07**. The user confirmed that the temple holds assemblies on every lunar month's first and fifteenth days. This is separate from the traditional observance reference above. The default start time is now **10:00 Philadelphia time** in `src/data/lunar-practice.json`; a date-specific override may provide another time or explicitly leave a time pending.

- Scope: every matching civil date in **Gregorian 2026 and 2027**, including dates belonging to the preceding lunar year. **50 dates: 25 in each year.** This is not a complete Gregorian 2028 schedule.
- Reviewable output: [all 50 Gregorian / lunar dates](LUNAR_PRACTICE_DATES.md).
- First source: HKO's full daily CSV tables linked above, independently compared with its [2026 text almanac](https://www.hko.gov.hk/tc/gts/time/calendar/text/files/T2026c.txt) and [2027 text almanac](https://www.hko.gov.hk/tc/gts/time/calendar/text/files/T2027c.txt). Month names in the printed daily table identify lunar day 1.
- Second agency: the Central Weather Administration's [2025 Almanac](https://www.cwa.gov.tw/Data/service/notice/download/Publish_20241209150048.pdf#page=175), **printed page 170 / PDF page 175**, national/lunar calendar conversion table. The 2025, 2026 and 2027 rows give every lunar month start and its length (大 = 30 days, 小 = 29), including leap month 6 in 2025 and the January carryovers. The relevant PDF page was rendered and visually inspected against the extracted text.
- Independently expand CWA's month starts and lengths into consecutive civil days, then compare lunar year, lunar month, leap-month flag and lunar day against HKO for **all 730 days**. Both agencies agree throughout. Selecting day 1 and day 15 from each independently produces the same 50 dates. Day 15 is exactly 14 civil days after day 1; it is not inferred from astronomical full-moon time.
- Source bytes, the extracted CWA table rows, source URLs, retrieval time and SHA-256 hashes are retained in `scripts/calendar-sources/`. The CWA manifest also identifies the original PDF hash and page. `.gitattributes` preserves source bytes across Windows and Linux checkouts. `node scripts/check-lunar-practice.mjs` repeats source-integrity, full-day comparison, weekday, date continuity, half-month gap and published-data checks without network access.

### Discrepancy caught during independent algorithm testing

Node 24.19.0 / ICU 78.3's Chinese calendar differs from **both** official sources on 30 civil dates, **2027-02-06 through 2027-03-07**. In particular, both official tables place lunar New Year on **February 6**, and the first month's fifteenth on **February 20**; ICU instead places those on February 7 and 21. All 365 dates in 2026 agree with ICU.

The checker reports the installed ICU's differences as a diagnostic; it never uses ICU to override two agreeing official sources. Published dates are stored as verified `YYYY-MM-DD` strings and rendered using Gregorian formatting, so users' browsers and Philadelphia time offsets cannot introduce this error. A future ICU correction does not require changing the official dates.

### Website and maintenance behavior

The same verified data feeds the services activity calendar, the full Buddhist calendar and all three language versions of each assembly's detail page. Recurring entries do not fill the latest-news / latest-assemblies announcement feeds. A Sunday, a separately announced assembly and a lunar assembly may share a date; a Buddha/Bodhisattva birthday assembly marked `replacesLunarPractice: true` takes precedence over a same-day first/fifteenth assembly. Dharma Assemblies use 10:00 by default; a separate announcement or date override can specify another time. Cancellations and time overrides are maintained separately from conversion data, as described in [README.md](README.md).
