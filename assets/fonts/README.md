# Nikosh font

Nikosh isn't distributed through Google Fonts, npm, or the apt/dnf repos, so it can't
be pulled from a CDN. The app already works without it (falls back to Hind Siliguri /
Noto Sans Bengali), but to get true Nikosh rendering:

1. Get `Nikosh.ttf` (commonly bundled with Windows Bangla language packs, or available
   from a Bangla font pack you already have a license to use).
2. Convert it to woff2 for smaller downloads (optional but recommended):
   ```
   pip install fonttools brotli
   fonttools varLib.instancer  # not needed for static fonts
   python3 -m fontTools.ttLib.woff2 compress Nikosh.ttf
   ```
   or simply drop `Nikosh.ttf` alone — `css/fonts.css` references both.
3. Place the file(s) here as `Nikosh.woff2` and/or `Nikosh.ttf`.
4. Reload the app — `css/fonts.css` picks it up automatically, no other change needed.

If Nikosh is already installed as a system font (`fc-list | grep -i nikosh`), the app
uses it directly via `local('Nikosh')` and you can skip all of the above.
