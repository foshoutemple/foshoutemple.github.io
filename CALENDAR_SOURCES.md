# Calendar evidence notes

Verified on 2026-09-06. Output: `website-holy-days.json`.

## Scope

- Twenty recurring Han Chinese Buddhist observances, following the Hong Kong Buddhist Association's FAQ list: <https://www.hkbuddhist.org/zh/top_page.php?cid=12&p=fqa>.
- Lunar years 2026 and 2027 are complete. Three carryover observances from lunar year 2025 are also included so Gregorian year 2026 is complete.
- Total: 43 event records. By Gregorian year: 21 in 2026, 20 in 2027, and 2 in January 2028 (the end of lunar year 2027).
- Event IDs begin with the **lunar year**, while `date` is the Gregorian date. A UI year selector should filter `date`, not the ID.
- `years: [2026, 2027]` identifies the fully covered Gregorian years. January 2028 is a continuation only, not a full 2028 calendar.
- Every `serviceTime` is `null`: these dates identify traditional observances and do not assert a confirmed temple service, start time, or programme.

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
