// Resolves an IANA timezone name (e.g. "Asia/Dhaka") to its UTC offset in
// minutes for a given date — using Intl instead of a stored number means DST
// (e.g. Europe/Berlin) is always correct without manual seasonal updates.
export function getTzOffsetMinutes(timeZone, date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(date).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
    const asUTC = Date.UTC(
      Number(parts.year), Number(parts.month) - 1, Number(parts.day),
      parts.hour === '24' ? 0 : Number(parts.hour), Number(parts.minute), Number(parts.second)
    );
    return Math.round((asUTC - date.getTime()) / 60000);
  } catch {
    return 360; // unknown/invalid zone — fall back to Bangladesh Standard Time
  }
}
