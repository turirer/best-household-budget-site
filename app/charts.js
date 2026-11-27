// Tiny hand-rolled SVG charts for Home Ledger. No library, no network: each
// function takes plain numbers and returns an SVG string the views drop into
// the page. Colours come from the categories, so a slice always matches its
// chip in the lists.

// Escape text that lands inside SVG markup.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// A donut of spending shares. slices: [{ label, value, color }]. The hole
// carries the total, formatted by the caller. Slices under 1% are folded into
// the smallest visible arc so the ring never shows hairline slivers.
export function donutChart(slices, centerTop, centerBottom, size = 190) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const r = size / 2 - 14;
  const c = size / 2;
  const ring = 2 * Math.PI * r;
  if (total <= 0) {
    return `<svg class="donut" viewBox="0 0 ${size} ${size}" role="img" aria-label="No spending yet">
  <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#e7e1d2" stroke-width="22"/>
  <text x="${c}" y="${c - 4}" text-anchor="middle" class="donut-top">${esc(centerTop)}</text>
  <text x="${c}" y="${c + 16}" text-anchor="middle" class="donut-bottom">${esc(centerBottom)}</text>
</svg>`;
  }
  let acc = 0;
  const arcs = slices
    .filter((s) => s.value > 0)
    .map((s) => {
      const frac = s.value / total;
      const dash = Math.max(frac * ring - 1.5, 0.5);
      const offset = -acc * ring + ring * 0.25;
      acc += frac;
      return `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${s.color}" stroke-width="22"
        stroke-dasharray="${dash.toFixed(1)} ${(ring - dash).toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}">
        <title>${esc(s.label)}: ${esc(s.display || '')}</title></circle>`;
    })
    .join('');
  return `<svg class="donut" viewBox="0 0 ${size} ${size}" role="img" aria-label="Spending by category">
  <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#e7e1d2" stroke-width="22"/>
  ${arcs}
  <text x="${c}" y="${c - 4}" text-anchor="middle" class="donut-top">${esc(centerTop)}</text>
  <text x="${c}" y="${c + 16}" text-anchor="middle" class="donut-bottom">${esc(centerBottom)}</text>
</svg>`;
}

// A row of vertical bars, one per week of the month, showing how spending
// spread across the month. weeks: [{ label, value, display }].
export function weekBars(weeks, color = '#1f6f4a') {
  const max = Math.max(...weeks.map((w) => w.value), 1);
  const w = 320;
  const h = 120;
  const base = h - 22;
  const slot = w / weeks.length;
  const barW = Math.min(slot * 0.55, 44);
  const bars = weeks
    .map((wk, i) => {
      const bh = Math.max((wk.value / max) * (base - 18), wk.value > 0 ? 3 : 0);
      const x = i * slot + (slot - barW) / 2;
      const y = base - bh;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="4" fill="${color}">
        <title>${esc(wk.label)}: ${esc(wk.display || '')}</title></rect>
      <text x="${(i * slot + slot / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle" class="bar-value">${esc(wk.display || '')}</text>
      <text x="${(i * slot + slot / 2).toFixed(1)}" y="${h - 6}" text-anchor="middle" class="bar-label">${esc(wk.label)}</text>`;
    })
    .join('');
  return `<svg class="weekbars" viewBox="0 0 ${w} ${h}" role="img" aria-label="Spending by week">
  <line x1="0" y1="${base}" x2="${w}" y2="${base}" stroke="#d8d0ba" stroke-width="1"/>
  ${bars}
</svg>`;
}

// A small progress ring for a savings goal: pct is 0..100, label sits in the
// middle (usually the percent itself).
export function progressRing(pct, label, size = 84) {
  const r = size / 2 - 7;
  const c = size / 2;
  const ring = 2 * Math.PI * r;
  const filled = (Math.min(Math.max(pct, 0), 100) / 100) * ring;
  const done = pct >= 100;
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label)} saved">
  <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#e7e1d2" stroke-width="9"/>
  <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${done ? '#c98a2d' : '#1f6f4a'}" stroke-width="9"
    stroke-linecap="round" stroke-dasharray="${filled.toFixed(1)} ${(ring - filled).toFixed(1)}"
    transform="rotate(-90 ${c} ${c})"/>
  <text x="${c}" y="${c + 5}" text-anchor="middle" class="ring-label">${esc(label)}</text>
</svg>`;
}
