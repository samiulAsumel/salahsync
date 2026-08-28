// Curated country → city presets (lat/lon + IANA timezone). "অন্যান্য" (custom)
// falls back to manual lat/lon entry + a plain timezone picker (TIMEZONES below).
export const COUNTRIES = [
  {
    code: 'BD', name: 'বাংলাদেশ', tz: 'Asia/Dhaka',
    cities: [
      { name: 'মংলা', lat: 22.4892, lon: 89.6006 },
      { name: 'ঢাকা', lat: 23.8103, lon: 90.4125 },
      { name: 'চট্টগ্রাম', lat: 22.3569, lon: 91.7832 },
      { name: 'খুলনা', lat: 22.8456, lon: 89.5403 },
      { name: 'রাজশাহী', lat: 24.3745, lon: 88.6042 },
      { name: 'সিলেট', lat: 24.8949, lon: 91.8687 },
      { name: 'বরিশাল', lat: 22.7010, lon: 90.3535 },
      { name: 'রংপুর', lat: 25.7439, lon: 89.2752 },
      { name: 'ময়মনসিংহ', lat: 24.7471, lon: 90.4203 },
      { name: 'কুমিল্লা', lat: 23.4607, lon: 91.1809 },
      { name: 'নারায়ণগঞ্জ', lat: 23.6238, lon: 90.5000 },
      { name: 'গাজীপুর', lat: 23.9999, lon: 90.4203 },
      { name: 'কক্সবাজার', lat: 21.4272, lon: 92.0058 },
      { name: 'যশোর', lat: 23.1667, lon: 89.2167 },
      { name: 'বগুড়া', lat: 24.8465, lon: 89.3773 },
    ],
  },
  {
    code: 'SA', name: 'সৌদি আরব', tz: 'Asia/Riyadh',
    cities: [
      { name: 'মক্কা', lat: 21.3891, lon: 39.8579 },
      { name: 'মদিনা', lat: 24.5247, lon: 39.5692 },
      { name: 'রিয়াদ', lat: 24.7136, lon: 46.6753 },
      { name: 'জেদ্দা', lat: 21.4858, lon: 39.1925 },
      { name: 'দাম্মাম', lat: 26.4207, lon: 50.0888 },
    ],
  },
  {
    code: 'AE', name: 'সংযুক্ত আরব আমিরাত', tz: 'Asia/Dubai',
    cities: [
      { name: 'দুবাই', lat: 25.2048, lon: 55.2708 },
      { name: 'আবুধাবি', lat: 24.4539, lon: 54.3773 },
      { name: 'শারজাহ', lat: 25.3463, lon: 55.4209 },
    ],
  },
  { code: 'QA', name: 'কাতার', tz: 'Asia/Qatar', cities: [{ name: 'দোহা', lat: 25.2854, lon: 51.5310 }] },
  { code: 'KW', name: 'কুয়েত', tz: 'Asia/Kuwait', cities: [{ name: 'কুয়েত সিটি', lat: 29.3759, lon: 47.9774 }] },
  { code: 'OM', name: 'ওমান', tz: 'Asia/Muscat', cities: [{ name: 'মাসকাট', lat: 23.5880, lon: 58.3829 }] },
  {
    code: 'IN', name: 'ভারত', tz: 'Asia/Kolkata',
    cities: [
      { name: 'কলকাতা', lat: 22.5726, lon: 88.3639 },
      { name: 'দিল্লি', lat: 28.7041, lon: 77.1025 },
      { name: 'মুম্বাই', lat: 19.0760, lon: 72.8777 },
    ],
  },
  { code: 'PK', name: 'পাকিস্তান', tz: 'Asia/Karachi', cities: [{ name: 'করাচি', lat: 24.8607, lon: 67.0011 }, { name: 'লাহোর', lat: 31.5497, lon: 74.3436 }] },
  { code: 'MY', name: 'মালয়েশিয়া', tz: 'Asia/Kuala_Lumpur', cities: [{ name: 'কুয়ালালামপুর', lat: 3.1390, lon: 101.6869 }] },
  { code: 'SG', name: 'সিঙ্গাপুর', tz: 'Asia/Singapore', cities: [{ name: 'সিঙ্গাপুর সিটি', lat: 1.3521, lon: 103.8198 }] },
  { code: 'ID', name: 'ইন্দোনেশিয়া', tz: 'Asia/Jakarta', cities: [{ name: 'জাকার্তা', lat: -6.2088, lon: 106.8456 }] },
  { code: 'TR', name: 'তুরস্ক', tz: 'Europe/Istanbul', cities: [{ name: 'ইস্তাম্বুল', lat: 41.0082, lon: 28.9784 }] },
  {
    code: 'DE', name: 'জার্মানি', tz: 'Europe/Berlin',
    cities: [
      { name: 'বার্লিন', lat: 52.5200, lon: 13.4050 },
      { name: 'ফ্রাঙ্কফুর্ট', lat: 50.1109, lon: 8.6821 },
      { name: 'মিউনিখ', lat: 48.1351, lon: 11.5820 },
      { name: 'হামবুর্গ', lat: 53.5511, lon: 9.9937 },
    ],
  },
  { code: 'GB', name: 'যুক্তরাজ্য', tz: 'Europe/London', cities: [{ name: 'লন্ডন', lat: 51.5074, lon: -0.1278 }] },
  { code: 'US', name: 'যুক্তরাষ্ট্র', tz: 'America/New_York', cities: [{ name: 'নিউ ইয়র্ক', lat: 40.7128, lon: -74.0060 }] },
];

export const TIMEZONES = [
  'Asia/Dhaka', 'Asia/Kolkata', 'Asia/Karachi', 'Asia/Dubai', 'Asia/Riyadh', 'Asia/Qatar',
  'Asia/Kuwait', 'Asia/Muscat', 'Asia/Kuala_Lumpur', 'Asia/Singapore', 'Asia/Jakarta',
  'Asia/Tokyo', 'Asia/Shanghai', 'Europe/Istanbul', 'Europe/Berlin', 'Europe/London',
  'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney', 'UTC',
];
