# SalahSync — Muslim Daily Routine Tracker

[![CI](https://github.com/samiulAsumel/salahsync/actions/workflows/ci.yml/badge.svg)](https://github.com/samiulAsumel/salahsync/actions/workflows/ci.yml)

**Live:** [salahsync.pages.dev](https://salahsync.pages.dev/) · Bangla documentation follows the English section below.

An installable, offline-first PWA that builds a full daily schedule around computed prayer times.
Set your Fajr time (or location) and office hours once; everything else — Tahajjud, Sunnah prayers,
jamaah breaks, learning time, sleep — is recalculated automatically. It replaced a static printed
routine sheet that had to be redrawn by hand whenever prayer times shifted.

## Features

- **Automatic schedule:** one Fajr/location input and per-weekday office hours drive the whole day
  (`js/core/schedule-engine.js`). Day templates are declarative: a block can be anchored to a prayer
  time, chained after another block, span an explicit range, or flex to fill a gap.
- **Offline prayer times:** computed client-side with the praytimes.org solar algorithm, so no API is
  needed (`js/core/prayer-times.js`).
- **Three day profiles:** workday, Friday and Saturday, each with its own structure.
- **Prayer and habit tracker:** jamaah / alone / qaza / pending per prayer, plus recitation, durood,
  coding and reading logs, with streaks and a weekly chart. Stored in `localStorage`.
- **Global locations:** about 243 countries with major cities (per-city timezones, so multi-timezone
  countries stay correct), the full Bangladesh division → district → upazila hierarchy, live GPS, or a
  manual custom entry.
- **Bilingual UI:** a Bangla/English toggle swaps every label at once (`js/core/i18n.js`,
  `js/i18n/strings.{bn,en}.js`). A Bangla typeface is bundled under the SIL OFL licence.
- **PWA:** installable, offline support, network-first service worker so the newest version loads
  whenever you are online. Also dark mode, Hijri dates, and print-friendly A4 output.
- **Backup:** export and import all settings and daily logs as a single JSON file.

## Run and test

```bash
./serve.sh          # http://localhost:8080 (needs a local server: ES modules do not run from file://)
npm install
npm test            # Vitest unit tests for the pure logic in js/core/
```

GitHub Actions runs the same tests on every push and pull request.

## Structure

```
index.html      app shell
css/            fonts.css (bundled Bangla font), app.css (theme, timeline, print)
js/core/        time, prayer-time, Hijri, i18n, schedule engine, storage
js/data/        default settings, day-block templates, world and Bangladesh geo data
js/i18n/        strings.bn.js / strings.en.js
js/ui/          renderer, settings, location picker, tracker, stats, clock
```

---

## Bangla documentation (original)

ফজরের ওয়াক্ত (বা লোকেশন) সেট করলেই সারাদিনের রুটিন — তাহাজ্জুদ থেকে ঘুম পর্যন্ত — স্বয়ংক্রিয়ভাবে
তৈরি হয়। অফিসের শুরু/শেষ সময়, যাতায়াতের সময়, প্রতিটি ওয়াক্তের জামাত অফসেট — সব কিছু সমন্বয় করা যায়,
আর বাকি সব সময়সূচি (নামাজ, কোডিং শেখা, বিরতি, ঘুম) নিজে থেকেই পুনর্গণনা হয়।

স্থির `daily-routine.html`-এর জায়গায় এটি একটি সম্পূর্ণ ইনস্টলযোগ্য PWA — অফলাইনে কাজ করে, প্রতিদিনের
নামাজ/আমল ট্র্যাক করে, স্ট্রিক ও সাপ্তাহিক পরিসংখ্যান দেখায়।

## চালানো

```bash
./serve.sh          # http://localhost:8080 (ডিফল্ট পোর্ট)
./serve.sh 3000      # অন্য পোর্টে
```

ES modules ব্যবহার করা হয়েছে বলে সরাসরি ফাইল ডাবল-ক্লিক করে (file://) খোলা যাবে না — একটি local
server লাগবে (PWA ইনস্টলের জন্যও এটা দরকার হতো)।

## টেস্ট

```bash
npm install
npm test        # core/*.js-এর pure logic (প্রার্থনার সময়, শিডিউল ইঞ্জিন) — Vitest
```

প্রতিটি push/PR-এ GitHub Actions (`.github/workflows/ci.yml`) স্বয়ংক্রিয়ভাবে একই টেস্ট চালায়।

## প্রধান বৈশিষ্ট্য

- **স্বয়ংক্রিয় সময়সূচি**: শুধু ফজরের ওয়াক্ত/অফিস সময় সেট করুন, বাকি সব (তাহাজ্জুদ, সুন্নত, বিরতি,
  কোডিং সময়, ঘুম) নিজে থেকে সমন্বয় হয় — `js/core/schedule-engine.js`
- **অফলাইন নামাজের সময়**: সৌর হিসাব (praytimes.org অ্যালগরিদম), কোনো API লাগে না —
  `js/core/prayer-times.js`
- **অফিস + জামাত ব্রেক**: রবি–বৃহস্পতি প্রতিদিন আলাদা অফিস সময়, যোহর/আসর/মাগরিবের বিরতি
  অফিস ব্লকের ভেতরেই আলাদা করে দেখায়
- **তিনটি প্রোফাইল**: কর্মদিবস / জুম্মাবার / শনিবার — প্রতিটির নিজস্ব কাঠামো
- **নামাজ ও আমল ট্র্যাকার**: জামাত/একাকী/কাযা/বাকি স্ট্যাটাস, তিলাওয়াত/দরুদ/কোডিং/পড়ার লগ,
  স্ট্রিক ও সাপ্তাহিক চার্ট — localStorage-এ সংরক্ষিত
- **প্রিন্ট**: মূল A4 কাগজের ডিজাইন বজায় রেখে
- **PWA**: ইনস্টলযোগ্য, অফলাইন সাপোর্ট (`sw.js`, network-first — অনলাইনে সবসময় সবশেষ ভার্সন)
- **ডার্ক মোড**, হিজরি তারিখ, বাংলা সংখ্যা সব জায়গায়
- **বাংলা/English টগল**: হেডারে 🌐 বাটন — পুরো UI (টাইমলাইন লেবেল, সেটিংস, স্ট্যাটস) সাথে সাথে বদলায়
  — `js/core/i18n.js` + `js/i18n/strings.{bn,en}.js`
- **বিশ্বব্যাপী লোকেশন**: ~২৪৩টি দেশ + প্রধান শহর (GeoNames থেকে, প্রতি শহরের নিজস্ব timezone সহ —
  Russia/USA/Australia-র মতো বহু-timezone দেশেও নির্ভুল), বাংলাদেশের জন্য পূর্ণ বিভাগ→জেলা→উপজেলা
  (৮/৬৪/৫৭৪), অথবা লাইভ GPS, অথবা ম্যানুয়াল কাস্টম এন্ট্রি — `js/data/world-geo.js`, `js/data/bd-geo.js`
- **আজকের নামাজের সময় প্যানেল**: ৬ ওয়াক্ত (আজান, জামাতের আগে) — হেডারের নিচে, `js/ui/prayer-panel.js`
- **Kalpurush ফন্ট**: সরাসরি bundled (SIL OFL), তাই সবসময় আসলেই লোড হয়

## ফাইল গঠন

```
index.html            অ্যাপ শেল
css/                   fonts.css (Kalpurush bundled), app.css (থিম, টাইমলাইন, প্রিন্ট)
js/core/               সময়/প্রেয়ার-টাইম/হিজরি/i18n হিসাব, শিডিউল ইঞ্জিন, স্টোরেজ
js/data/                ডিফল্ট সেটিংস, দিনের ব্লক টেমপ্লেট, world-geo.js, bd-geo.js
js/i18n/                strings.bn.js / strings.en.js — সব UI টেক্সট
js/ui/                  রেন্ডারার, সেটিংস প্যানেল, লোকেশন পিকার, ট্র্যাকার, স্ট্যাটস, ক্লক
assets/fonts/           Kalpurush.woff2/ttf (bundled) — Nikosh ঐচ্ছিক, README দেখুন
```

## ফন্ট

Kalpurush সরাসরি bundled (SIL OFL license, `assets/fonts/`) — কোনো সেটআপ লাগে না। Nikosh
ব্যবহার করতে চাইলে `assets/fonts/README.md` দেখুন (ঐচ্ছিক, দ্বিতীয় পছন্দ)।

## ডেটা ব্যাকআপ

সেটিংস প্যানেলে (⚙️) এক্সপোর্ট/ইম্পোর্ট বাটন আছে — পুরো সেটিংস ও দৈনিক লগ একটি JSON ফাইলে
ব্যাকআপ/রিস্টোর করা যায়।
