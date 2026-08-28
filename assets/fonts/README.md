# Fonts

## Kalpurush (bundled, default)

`Kalpurush.ttf`/`.woff2` are bundled directly — this is the app's primary Bangla font.
Licensed under the SIL Open Font License 1.1 by Tanbin Islam Siyam ([omicronlab.com](https://omicronlab.com));
see `Kalpurush-LICENSE.txt`. No setup needed.

## Nikosh (optional, second choice)

Nikosh isn't distributed through Google Fonts, npm, or the apt/dnf repos, so it isn't
bundled here — the app falls back past it to Kalpurush without any issue. To use it
instead (it's checked before Kalpurush isn't — see `css/app.css`'s font-family order,
swap it there if you want Nikosh to win):

1. Get `Nikosh.ttf` (commonly bundled with Windows Bangla language packs, or available
   from a Bangla font pack you already have a license to use).
2. Convert it to woff2 for smaller downloads (optional but recommended):
   ```
   pip install fonttools brotli
   python3 -m fontTools.ttLib.woff2 compress Nikosh.ttf
   ```
   or simply drop `Nikosh.ttf` alone — `css/fonts.css` references both.
3. Place the file(s) here as `Nikosh.woff2` and/or `Nikosh.ttf`.

If Nikosh is already installed as a system font (`fc-list | grep -i nikosh`), the app
uses it directly via `local('Nikosh')` without needing a file here at all.
