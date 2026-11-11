// KAMU Angebots-App – Vorlagen-Renderer v2 (Canvas 2D)
// Formate: 9:16 (1080x1920) und 1:1 (1080x1080)

export const FORMATS = {
  story:  { w: 1080, h: 1920, label: '9x16' },
  square: { w: 1080, h: 1080, label: '1x1' },
};

const WEB = 'www.kamu-parts.at';

export const TEMPLATES = {
  werkstatt: {
    name: 'Werkstatt',
    logo: 'assets/logo-werkstatt.png',
    bg: 'assets/bg-werkstatt.jpg',
    slogan: ['SERVICE', 'REPARATUR', 'CARBON-REINIGUNG'],
    phone: '0660 / 940 46 46',
    address: 'Sofie-Lazarsfeld-Straße 7a, 1110 Wien',
    web: WEB,
    fallbackBg: ['#0d1a2b', '#05080d'],
    bgShift: { story: 0.13, square: 0.0 },
    bgFocus: { story: 0.5, square: 0.10 },
  },
  teile: {
    name: 'Teilegeschäft',
    logo: 'assets/logo-parts.png',
    bg: 'assets/bg-teile.jpg',
    slogan: ['ALLE MARKEN', 'ORIGINALQUALITÄT', 'TOP PREISE'],
    phone: '0660 / 600 02 01',
    address: 'Dresdner Straße 130/1, 1200 Wien',
    web: WEB,
    fallbackBg: ['#0b3a63', '#05101c'],
    bgShift: { story: 0.0, square: 0.0 },
    bgFocus: { story: 0.5, square: 0.62 },
  },
};

const BLUE = '#1592ff', BLUE_D = '#0a5fd0', BLUE_L = '#4fb3ff';
const FONT = '"KAMU Display", "Inter Display", Inter, Arial, sans-serif';
const F = (w, s, italic = false) => `${italic ? 'italic ' : ''}${w} ${s}px ${FONT}`;

// ---------- Icons (24x24, Linien) ----------
export const ICONS = {
  shield: ['M12 2.5l8 3v6c0 5-3.4 8.8-8 10.5-4.6-1.7-8-5.5-8-10.5v-6z', 'M8.2 12.2l2.6 2.6 5-5.4'],
  wrench: ['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z'],
  car: ['M3.5 16.5v-4l2.2-5.2c.3-.7 1-1.3 1.8-1.3h9c.8 0 1.5.6 1.8 1.3l2.2 5.2v4z', 'M3.5 12.3h17', 'M5 16.5v2h3v-2', 'M16 16.5v2h3v-2', 'M7 14.4h.01', 'M17 14.4h.01'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7.5V12l3 2'],
  check: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M8 12.3l2.8 2.8L16.2 9.5'],
  oil: ['M12 3c3.2 4.3 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.8-6.7 6-11z', 'M9.5 15a2.5 2.5 0 0 0 2.5 2.5'],
  euro: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M15 8.6a4 4 0 1 0 0 6.8', 'M7.5 11h5.5', 'M7.5 13.2h5.5'],
  phone: ['M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z'],
  pin: ['M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z', 'M12 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z'],
  globe: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M3 12h18', 'M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z'],
};
export const ICON_CHOICES = [
  ['shield', 'Sicherheit'], ['wrench', 'Montage'], ['car', 'Auto'],
  ['clock', 'Zeit'], ['check', 'Häkchen'], ['oil', 'Öl'], ['euro', 'Preis'],
];

function icon(ctx, name, x, y, size, color, { fill = false, width = 2 } = {}) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(size / 24, size / 24);
  ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = color; ctx.fillStyle = color;
  for (const d of ICONS[name] || []) { const p = new Path2D(d); fill ? ctx.fill(p) : ctx.stroke(p); }
  ctx.restore();
}

// ---------- Hilfsfunktionen ----------
export function formatPrice(raw) {
  if (!raw) return '';
  const m = String(raw).trim().match(/^ab\s*(.+)$/i);
  if (m) { const p = formatPrice(m[1]); return p ? 'ab ' + p : ''; }
  let s = String(raw).trim().replace(/€/g, '').replace(/\s/g, '').replace('.', ',');
  if (!s) return '';
  if (/^\d+$/.test(s)) return `€ ${s},–`;
  if (/^\d+,\d{1,2}$/.test(s)) {
    let [a, b] = s.split(',');
    if (b.length === 1) b += '0';
    return b === '00' ? `€ ${a},–` : `€ ${a},${b}`;
  }
  return `€ ${s}`;
}

function wrap(ctx, text, maxW) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = []; let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width <= maxW || !line) line = t; else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

function fitText(ctx, text, fontFn, maxSize, minSize, maxW, maxLines) {
  for (let s = maxSize; s >= minSize; s -= 2) {
    ctx.font = fontFn(s);
    const lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines && lines.every(l => ctx.measureText(l).width <= maxW)) return { size: s, lines };
  }
  ctx.font = fontFn(minSize);
  return { size: minSize, lines: wrap(ctx, text, maxW).slice(0, maxLines) };
}

// Überschrift so umbrechen, dass die letzte Zeile (blau) möglichst kurz und kräftig ist
function headlineLines(ctx, text, fontFn, maxSize, minSize, maxW, maxLines) {
  const two = fitText(ctx, text.toUpperCase(), fontFn, maxSize, Math.round(minSize * 1.15), maxW, 2);
  ctx.font = fontFn(two.size);
  if (two.lines.length <= 2 && two.lines.every(l => ctx.measureText(l).width <= maxW) && wrap(ctx, text.toUpperCase(), maxW).length <= 2) {
    if (two.lines.length === 2 || text.trim().split(/\s+/).length < 2) return two;
  }
  const r = fitText(ctx, text.toUpperCase(), fontFn, maxSize, minSize, maxW, maxLines);
  const words = text.toUpperCase().trim().split(/\s+/);
  if (r.lines.length === 1 && words.length >= 2) {
    // Zwei Zeilen erzwingen: letztes Wort blau, wie im Beispiel
    const a = words.slice(0, -1).join(' ');
    const b = words[words.length - 1];
    ctx.font = fontFn(r.size);
    let s = r.size;
    while ((ctx.measureText(a).width > maxW || ctx.measureText(b).width > maxW) && s > minSize) { s -= 2; ctx.font = fontFn(s); }
    return { size: s, lines: [a, b] };
  }
  return r;
}

function metalGradient(ctx, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#e4e8ee');
  g.addColorStop(0.55, '#9aa4b2'); g.addColorStop(1, '#f4f6f9');
  return g;
}
function blueGradient(ctx, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, BLUE_L); g.addColorStop(0.55, BLUE); g.addColorStop(1, BLUE_D);
  return g;
}

function para(ctx, x, y, w, h, skew) {
  ctx.beginPath();
  ctx.moveTo(x + skew, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - skew, y + h); ctx.lineTo(x, y + h);
  ctx.closePath();
}

// Hintergrundbild (cover) + Abdunklung
// headerEnd: Anteil der Höhe, bis zu dem der Kopfbereich (Logo) dunkel bleibt
function drawBackground(ctx, t, bg, W, H, focusY = 0.5, shift = 0, headerEnd = 0.22) {
  ctx.fillStyle = '#04070c'; ctx.fillRect(0, 0, W, H);
  if (bg) {
    const iw = bg.naturalWidth || bg.width, ih = bg.naturalHeight || bg.height;
    const s = Math.max(W / iw, H / ih) * 1.02;
    const dw = iw * s, dh = ih * s;
    const dx = (W - dw) / 2, dy = Math.min(0, Math.max(H - dh, (H - dh) * focusY)) + shift * H;
    ctx.save(); ctx.filter = 'blur(2px)'; ctx.drawImage(bg, dx, dy, dw, dh); ctx.restore();
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, t.fallbackBg[0]); g.addColorStop(1, t.fallbackBg[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  const o = ctx.createLinearGradient(0, 0, 0, H);
  o.addColorStop(0, 'rgba(2,5,10,0.96)');
  o.addColorStop(headerEnd * 0.8, 'rgba(2,5,10,0.90)');
  o.addColorStop(headerEnd + 0.07, 'rgba(2,6,14,0.22)');
  o.addColorStop(0.45, 'rgba(2,6,14,0.15)'); o.addColorStop(0.62, 'rgba(2,6,14,0.55)');
  o.addColorStop(1, 'rgba(2,6,14,0.92)');
  ctx.fillStyle = o; ctx.fillRect(0, 0, W, H);
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// Logo in Metall-Optik mit blauem Schimmer
function drawLogo(ctx, logo, x, y, w) {
  const h = w * logo.height / logo.width;
  const off = document.createElement('canvas');
  off.width = Math.ceil(w); off.height = Math.ceil(h);
  const o = off.getContext('2d');
  o.drawImage(logo, 0, 0, w, h);
  o.globalCompositeOperation = 'source-in';
  o.fillStyle = metalGradient(o, 0, h); o.fillRect(0, 0, w, h);
  ctx.save();
  ctx.shadowColor = 'rgba(21,146,255,0.55)'; ctx.shadowBlur = 28;
  ctx.drawImage(off, x, y);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
  ctx.drawImage(off, x, y);
  ctx.restore();
  return h;
}

function glowLine(ctx, x0, x1, y, width = 4) {
  ctx.save();
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, 'rgba(21,146,255,0)'); g.addColorStop(0.5, BLUE_L); g.addColorStop(1, 'rgba(21,146,255,0)');
  ctx.strokeStyle = g; ctx.lineWidth = width;
  ctx.shadowColor = BLUE; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  ctx.restore();
}

function drawSlogan(ctx, words, cx, y, size, align = 'center') {
  ctx.save();
  ctx.font = F(600, size);
  ctx.letterSpacing = `${Math.round(size * 0.22)}px`;
  const gap = size * 1.6;
  const widths = words.map(w => ctx.measureText(w).width);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  let x = align === 'center' ? cx - total / 2 : cx;
  ctx.textAlign = 'left'; ctx.fillStyle = '#dfe5ec';
  words.forEach((w, i) => {
    ctx.fillText(w, x, y);
    x += widths[i];
    if (i < words.length - 1) {
      ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(x + gap / 2 - size * 0.11, y - size * 0.36, size * 0.17, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dfe5ec'; x += gap;
    }
  });
  ctx.restore();
  return total;
}

// Bild in Zielgröße bringen (schrittweise verkleinern) und Unscharf-Maskieren
const _sharpCache = new WeakMap();
function sharpened(img, w, h) {
  w = Math.round(w); h = Math.round(h);
  const key = w + 'x' + h, c0 = _sharpCache.get(img);
  if (c0 && c0.key === key) return c0.canvas;
  let src = img, sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
  while (sw / 2 >= w * 1.2) {
    const t = document.createElement('canvas'); t.width = Math.round(sw / 2); t.height = Math.round(sh / 2);
    const tc = t.getContext('2d'); tc.imageSmoothingQuality = 'high'; tc.drawImage(src, 0, 0, t.width, t.height);
    src = t; sw = t.width; sh = t.height;
  }
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, w, h);
  const b = document.createElement('canvas'); b.width = w; b.height = h;
  const bx = b.getContext('2d', { willReadFrequently: true });
  bx.filter = 'blur(1.2px)'; bx.drawImage(c, 0, 0);
  const o = x.getImageData(0, 0, w, h), bl = bx.getImageData(0, 0, w, h).data, d = o.data;
  const amt = 0.9, SAT = 1.35, CON = 1.08, BRI = 6;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue;
    let r = d[i] + amt * (d[i] - bl[i]), g = d[i + 1] + amt * (d[i + 1] - bl[i + 1]), b2 = d[i + 2] + amt * (d[i + 2] - bl[i + 2]);
    // Farben kräftiger (Sättigung) und etwas mehr Kontrast
    const l = 0.299 * r + 0.587 * g + 0.114 * b2;
    r = l + (r - l) * SAT; g = l + (g - l) * SAT; b2 = l + (b2 - l) * SAT;
    r = (r - 128) * CON + 128 + BRI; g = (g - 128) * CON + 128 + BRI; b2 = (b2 - 128) * CON + 128 + BRI;
    d[i] = r < 0 ? 0 : r > 255 ? 255 : r; d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g; d[i + 2] = b2 < 0 ? 0 : b2 > 255 ? 255 : b2;
  }
  x.putImageData(o, 0, 0);
  _sharpCache.set(img, { key, canvas: c });
  return c;
}

// Produkt mit blauem Bodenleuchten und Spiegelung
function drawProduct(ctx, img, x, y, w, h) {
  const floorY = y + h * 0.9;
  // Bodenleuchten
  ctx.save();
  ctx.translate(x + w / 2, floorY); ctx.scale(1, 0.16);
  let g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.55);
  g.addColorStop(0, 'rgba(60,170,255,0.55)'); g.addColorStop(0.5, 'rgba(21,146,255,0.22)'); g.addColorStop(1, 'rgba(21,146,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (!img) return;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const s = Math.min(w / iw, (h * 0.9) / ih);
  const dw = iw * s, dh = ih * s;
  const dx = x + (w - dw) / 2, dy = floorY - dh;
  // Spiegelung
  const ref = document.createElement('canvas');
  ref.width = Math.ceil(dw); ref.height = Math.ceil(dh * 0.35);
  const r = ref.getContext('2d');
  r.translate(0, dh); r.scale(1, -1); r.drawImage(sharpened(img, dw, dh), 0, 0, dw, dh);
  r.setTransform(1, 0, 0, 1, 0, 0);
  r.globalCompositeOperation = 'destination-in';
  const fade = r.createLinearGradient(0, 0, 0, ref.height);
  fade.addColorStop(0, 'rgba(0,0,0,0.28)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
  r.fillStyle = fade; r.fillRect(0, 0, ref.width, ref.height);
  ctx.save(); ctx.filter = 'blur(2px)'; ctx.drawImage(ref, dx, floorY + 2); ctx.restore();
  // Kontaktschatten
  ctx.save();
  ctx.translate(x + w / 2, floorY); ctx.scale(1, 0.08);
  g = ctx.createRadialGradient(0, 0, 0, 0, 0, dw * 0.45);
  g.addColorStop(0, 'rgba(0,0,0,0.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, dw * 0.45, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Produkt: in Zielgröße hochwertig skalieren und leicht nachschärfen
  const sharp = sharpened(img, dw, dh);
  ctx.save();
  ctx.shadowColor = 'rgba(21,146,255,0.35)'; ctx.shadowBlur = 45;
  ctx.drawImage(sharp, dx, dy, dw, dh);
  ctx.restore();
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
  ctx.drawImage(sharp, dx, dy, dw, dh);
  ctx.restore();
  ctx.drawImage(sharp, dx, dy, dw, dh);
}

// Foto-Modus: ganzes Foto als Karte mit blauem Rahmen.
// Mit mask (Graustufenbild, weiß = Produkt) wird der Fotohintergrund unscharf und dunkel (Porträt-Effekt).
// crop: { x, y, zoom } – Bildausschnitt (x/y 0..1 = Position, zoom >= 1)
function drawPhotoCard(ctx, img, x, y, w, h, mask = null, crop = null) {
  if (!img) {
    const ch = h * 0.94, cw = Math.min(w * 0.94, ch * 1.2), cx = x + (w - cw) / 2, cy = y + (h - ch) / 2;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.strokeStyle = 'rgba(120,195,255,0.6)'; ctx.lineWidth = 4; ctx.setLineDash([18, 14]);
    ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 28); ctx.fill(); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = 'rgba(200,225,255,0.7)'; ctx.textAlign = 'center';
    ctx.font = F(800, Math.round(Math.min(cw, ch) * 0.09)); ctx.fillText('FOTO', cx + cw / 2, cy + ch / 2 + Math.min(cw, ch) * 0.03);
    ctx.restore();
    lastCard = null;
    return;
  }
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const ch = Math.round(h * 0.94), cw = Math.round(Math.min(w * 0.94, ch * 1.2));
  const cx = x + (w - cw) / 2, cy = y + (h - ch) / 2;
  const c = crop || { x: 0.5, y: 0.4, zoom: 1 };
  c.x = Math.min(1, Math.max(0, c.x)); c.y = Math.min(1, Math.max(0, c.y));
  const s = Math.max(cw / iw, ch / ih) * (c.zoom || 1);
  const sw = cw / s, sh = ch / s;
  const sx = (iw - sw) * c.x, sy = (ih - sh) * c.y;
  lastCard = { cx, cy, cw, ch, iw, ih, sw, sh };
  ctx.save();
  ctx.shadowColor = 'rgba(21,146,255,0.55)'; ctx.shadowBlur = 50;
  ctx.fillStyle = '#0b1220';
  ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 28); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.save(); ctx.clip();
  if (mask) {
    // Hintergrund: unscharf, dunkel, leicht blau
    ctx.save();
    ctx.filter = 'blur(16px) brightness(0.42) saturate(0.6)';
    ctx.drawImage(img, sx - sw * 0.05, sy - sh * 0.05, sw * 1.1, sh * 1.1, cx - cw * 0.05, cy - ch * 0.05, cw * 1.1, ch * 1.1);
    ctx.restore();
    ctx.fillStyle = 'rgba(10,60,140,0.22)'; ctx.fillRect(cx, cy, cw, ch);
    // Produkt scharf, über die Maske ausgeschnitten
    const fg = document.createElement('canvas'); fg.width = cw; fg.height = ch;
    const f = fg.getContext('2d');
    f.imageSmoothingQuality = 'high';
    f.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    f.globalCompositeOperation = 'destination-in';
    f.filter = 'blur(1.5px)';
    const m = maskToAlpha(mask);
    const kx = m.width / iw, ky = m.height / ih;
    f.drawImage(m, sx * kx, sy * ky, sw * kx, sh * ky, 0, 0, cw, ch);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30;
    ctx.drawImage(fg, cx, cy);
    ctx.restore();
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch);
  }
  const g = ctx.createLinearGradient(0, cy, 0, cy + ch);
  g.addColorStop(0.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = g; ctx.fillRect(cx, cy, cw, ch);
  ctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(120,195,255,0.9)';
  ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 28); ctx.stroke();
  ctx.restore();
}

// Zuletzt gezeichnete Foto-Karte (für Wisch-/Zoom-Gesten in der App)
export let lastCard = null;

// Graustufen-Maske in Alpha-Kanal umwandeln (gecacht)
const _maskCache = new WeakMap();
function maskToAlpha(mask) {
  if (mask instanceof HTMLCanvasElement && mask.dataset.alpha) return mask;
  if (_maskCache.has(mask)) return _maskCache.get(mask);
  const w = mask.naturalWidth || mask.width, h = mask.naturalHeight || mask.height;
  const c = document.createElement('canvas'); c.width = w; c.height = h; c.dataset.alpha = '1';
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(mask, 0, 0);
  const d = x.getImageData(0, 0, w, h);
  for (let i = 0; i < d.data.length; i += 4) { d.data[i + 3] = d.data[i]; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; }
  x.putImageData(d, 0, 0);
  _maskCache.set(mask, c);
  return c;
}

// "Nur bis"-Etikett: blaues Schild, leicht gedreht
function drawTag(ctx, text, cx, cy, scale = 1) {
  if (!text) return;
  const m = String(text).trim().match(/^(?:nur\s*bis\s*)?(\d{1,2}\.\d{1,2}\.(?:\d{2,4})?)$/i);
  const top = m ? 'NUR BIS' : null;
  const big = m ? m[1] : String(text).toUpperCase();
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(-0.09);
  const s1 = 44 * scale, s2 = (m ? 76 : 50) * scale;
  ctx.font = F(900, s2, true);
  const bw = ctx.measureText(big).width;
  ctx.font = F(800, s1, true);
  const tw = top ? ctx.measureText(top).width : 0;
  const w = Math.max(bw, tw) + 70 * scale, h = (top ? s1 * 1.1 + s2 * 1.05 : s2 * 1.2) + 44 * scale;
  ctx.shadowColor = 'rgba(21,146,255,0.8)'; ctx.shadowBlur = 40 * scale;
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#2a8cff'); g.addColorStop(1, '#0b49b8');
  ctx.fillStyle = g;
  para(ctx, -w / 2, -h / 2, w, h, 16 * scale); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(160,215,255,0.9)'; ctx.lineWidth = 3 * scale; ctx.stroke();
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  if (top) {
    ctx.font = F(800, s1, true); ctx.fillText(top, 0, -h / 2 + 22 * scale + s1 * 0.85);
    ctx.font = F(900, s2, true); ctx.fillText(big, 0, -h / 2 + 22 * scale + s1 * 1.1 + s2 * 0.85);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * scale;
    ctx.beginPath(); ctx.moveTo(-bw / 2 + 10 * scale, h / 2 - 16 * scale); ctx.quadraticCurveTo(0, h / 2 - 26 * scale, bw / 2, h / 2 - 22 * scale); ctx.stroke();
  } else {
    ctx.font = F(900, s2, true); ctx.fillText(big, 0, s2 * 0.35);
  }
  ctx.restore();
}

// Überschrift: Metall-Zeilen, letzte Zeile blau mit Seitenlinien
function drawHeadline(ctx, head, cx, top, W, align = 'center', sideLines = true) {
  const lh = head.size * 1.02;
  ctx.save();
  ctx.font = F(900, head.size, true);
  ctx.textAlign = align;
  head.lines.forEach((l, i) => {
    const y = top + head.size * 0.86 + i * lh;
    const last = i === head.lines.length - 1 && head.lines.length > 1;
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
    ctx.fillStyle = last ? blueGradient(ctx, y - head.size * 0.8, y) : metalGradient(ctx, y - head.size * 0.8, y);
    if (last) {
      ctx.shadowColor = 'rgba(0,0,0,0.95)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 4;
      ctx.fillText(l, cx, y);
      ctx.shadowColor = 'rgba(21,146,255,0.55)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 0;
    }
    ctx.fillText(l, cx, y);
    if (last && sideLines && align === 'center') {
      const tw = ctx.measureText(l).width;
      const ly = y - head.size * 0.36, gap = 30, len = Math.min(220, (W - tw) / 2 - gap - 40);
      if (len > 40) { glowLine(ctx, cx - tw / 2 - gap - len, cx - tw / 2 - gap, ly, 5); glowLine(ctx, cx + tw / 2 + gap, cx + tw / 2 + gap + len, ly, 5); }
    }
  });
  ctx.restore();
  return head.lines.length * lh;
}

// Merkmale: bis zu 3 Icons mit Text
function drawFeatures(ctx, feats, x, y, w, layout = 'row', scale = 1) {
  const list = (feats || []).filter(f => f && f.text && f.text.trim()).slice(0, 3);
  if (!list.length) return 0;
  const r = 44 * scale, fs = 27 * scale;
  ctx.save();
  if (layout === 'row') {
    const colW = w / list.length;
    list.forEach((f, i) => {
      const cx = x + i * colW;
      const icx = cx + r + 14 * scale, icy = y + r;
      ctx.lineWidth = 3 * scale; ctx.strokeStyle = BLUE; ctx.shadowColor = BLUE; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(icx, icy, r, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
      icon(ctx, f.icon || 'check', icx - r * 0.55, icy - r * 0.55, r * 1.1, BLUE_L, { width: 2 });
      const tw = colW - r * 2 - 50 * scale;
      let fsz = fs; ctx.font = F(700, fsz);
      while (fsz > 18 && (f.text.toUpperCase().split(/\s+/).some(wd => ctx.measureText(wd).width > tw) || wrap(ctx, f.text.toUpperCase(), tw).length > 2)) { fsz -= 1; ctx.font = F(700, fsz); }
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
      const lines = wrap(ctx, f.text.toUpperCase(), tw).slice(0, 2);
      const ty = icy - (lines.length - 1) * fsz * 0.6 + fsz * 0.35;
      lines.forEach((l, j) => ctx.fillText(l, icx + r + 18 * scale, ty + j * fsz * 1.15));
      if (i < list.length - 1) {
        ctx.fillStyle = 'rgba(21,146,255,0.8)'; ctx.fillRect(cx + colW - 2, y + 6, 3, r * 2 - 12);
      }
    });
    ctx.restore();
    return r * 2;
  }
  // Spalte (für 1:1)
  const rr = 26 * scale, fz = 25 * scale, step = rr * 2 + 14 * scale;
  list.forEach((f, i) => {
    const icy = y + rr + i * step, icx = x + rr;
    ctx.lineWidth = 2.5; ctx.strokeStyle = BLUE;
    ctx.beginPath(); ctx.arc(icx, icy, rr, 0, Math.PI * 2); ctx.stroke();
    icon(ctx, f.icon || 'check', icx - rr * 0.55, icy - rr * 0.55, rr * 1.1, BLUE_L, { width: 2.2 });
    ctx.font = F(700, fz); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
    let t = f.text.toUpperCase();
    while (ctx.measureText(t).width > w - rr * 2 - 20 && t.length > 4) t = t.slice(0, -2) + '…';
    ctx.fillText(t, x + rr * 2 + 18, icy + fz * 0.36);
  });
  ctx.restore();
  return list.length * step - 14 * scale;
}

// Preis: silberner Streifen (Streichpreis) + blauer schräger Balken
function drawPrice(ctx, offer, cx, top, maxW, scale = 1, align = 'center', draw = true) {
  const price = formatPrice(offer.price), old = formatPrice(offer.oldPrice);
  let ps = 190 * scale;
  ctx.font = F(900, ps, true);
  while (ctx.measureText(price).width > maxW - 120 * scale && ps > 60) { ps -= 4; ctx.font = F(900, ps, true); }
  const pw = ctx.measureText(price).width;
  const barW = Math.min(maxW, pw + 150 * scale), barH = ps * 1.08;
  const os = 52 * scale, oldH = old ? os * 1.45 : 0;
  const total = oldH + barH;
  if (!draw) return total;
  const bx = align === 'center' ? cx - barW / 2 : cx;
  const skew = 40 * scale;
  ctx.save();
  if (old) {
    ctx.font = F(900, os, true);
    const label = 'STATT ' + old;
    const lw = ctx.measureText(label).width + 90 * scale;
    const sx = align === 'center' ? cx - lw / 2 + 30 * scale : bx + 40 * scale;
    const g = ctx.createLinearGradient(0, top, 0, top + oldH);
    g.addColorStop(0, '#f5f7fa'); g.addColorStop(0.5, '#c9d0d9'); g.addColorStop(1, '#9ea7b3');
    ctx.fillStyle = g; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16;
    para(ctx, sx, top, lw, oldH + 6 * scale, 22 * scale); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#14181f'; ctx.textAlign = 'left';
    const tx = sx + 45 * scale, ty = top + oldH * 0.5 + os * 0.36;
    ctx.fillText('STATT ', tx, ty);
    const sw = ctx.measureText('STATT ').width, ow = ctx.measureText(old).width;
    ctx.fillText(old, tx + sw, ty);
    ctx.strokeStyle = '#e0242c'; ctx.lineWidth = 6 * scale; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tx + sw - 4, ty - os * 0.18); ctx.lineTo(tx + sw + ow + 6, ty - os * 0.5); ctx.stroke();
  }
  const by = top + oldH;
  ctx.shadowColor = 'rgba(21,146,255,0.75)'; ctx.shadowBlur = 50 * scale;
  const bg = ctx.createLinearGradient(0, by, 0, by + barH);
  bg.addColorStop(0, '#2b93ff'); bg.addColorStop(0.5, '#0f6fe0'); bg.addColorStop(1, '#073f9c');
  ctx.fillStyle = bg; para(ctx, bx, by, barW, barH, skew); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(170,220,255,0.85)'; ctx.lineWidth = 3 * scale; ctx.stroke();
  ctx.font = F(900, ps, true); ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
  const py = by + barH / 2 + ps * 0.34;
  ctx.fillStyle = metalGradient(ctx, py - ps * 0.72, py);
  ctx.fillText(price, bx + barW / 2, py);
  ctx.restore();
  return total;
}

// ---------- Hauptfunktion ----------
// offer: { headline, price, oldPrice, validUntil, features:[{icon,text}] }
// assets: { logo, bg, product }
export function renderOffer(canvas, templateKey, formatKey, offer, assets) {
  const t = TEMPLATES[templateKey];
  const { w: W, h: H } = FORMATS[formatKey];
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (formatKey === 'story') renderStory(ctx, t, W, H, offer, assets);
  else renderSquare(ctx, t, W, H, offer, assets);
  return canvas;
}

function renderStory(ctx, t, W, H, offer, a) {
  const pad = 60;
  drawBackground(ctx, t, a.bg, W, H, t.bgFocus.story, t.bgShift.story, 0.235);
  // Kopf
  const logoW = 720;
  const logoH = logoW * a.logo.height / a.logo.width;
  drawLogo(ctx, a.logo, (W - logoW) / 2, 56, logoW);
  const lineY = 56 + logoH + 26;
  glowLine(ctx, 120, W - 120, lineY, 3);
  drawSlogan(ctx, t.slogan, W / 2, lineY + 58, 28);

  // Fuß (von unten)
  const footTop = H - 250;
  // Preis
  const priceH = drawPrice(ctx, offer, W / 2, 0, W - 140, 1, 'center', false);
  const priceTop = footTop - 50 - priceH;
  const feats = (offer.features || []).filter(f => f && f.text && f.text.trim());
  const featH = feats.length ? 88 : 0;
  const featTop = priceTop - (feats.length ? 50 + featH : 0);
  const head = headlineLines(ctx, offer.headline || '', s => F(900, s, true), 108, 64, W - pad * 2 - 20, 3);
  const headH = head.lines.length * head.size * 1.02;
  const headTop = featTop - 40 - headH;
  const prodTop = lineY + 100, prodBottom = headTop - 20;

  if (a.photoMode) drawPhotoCard(ctx, a.product, 70, prodTop - 10, W - 140, prodBottom - prodTop + 10, a.mask, a.crop && a.crop.story);
  else drawProduct(ctx, a.product, 110, prodTop, W - 220, prodBottom - prodTop);
  if (offer.validUntil) drawTag(ctx, offer.validUntil, W - 190, prodTop + 110, 1);
  drawHeadline(ctx, head, W / 2, headTop, W, 'center', true);
  if (feats.length) drawFeatures(ctx, feats, pad, featTop, W - pad * 2, 'row', 1);
  drawPrice(ctx, offer, W / 2, priceTop, W - 140, 1, 'center', true);

  // Kontakt
  const cy = footTop + 20;
  ctx.save();
  ctx.font = F(900, 90);
  const nw = ctx.measureText(t.phone).width;
  const iconS = 100, gap = 26, total = iconS + gap + nw;
  const sx = W / 2 - total / 2;
  ctx.shadowColor = BLUE; ctx.shadowBlur = 20;
  icon(ctx, 'phone', sx, cy + 12, iconS, BLUE, { fill: true });
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
  ctx.font = F(800, 40); ctx.fillStyle = BLUE_L; ctx.fillText('ANRUF & WHATSAPP', sx + iconS + gap + 4, cy + 30);
  ctx.font = F(900, 90); ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10;
  ctx.fillText(t.phone, sx + iconS + gap, cy + 124);
  ctx.restore();
  glowLine(ctx, 40, W - 40, H - 92, 3);
  footerInfo(ctx, t, W / 2, H - 38, 32, 'center');
}

function footerInfo(ctx, t, cx, y, size, align) {
  ctx.save();
  ctx.font = F(500, size);
  const aw = ctx.measureText(t.address).width, ww = ctx.measureText(t.web).width;
  const is = size * 1.25, sep = size * 1.4;
  const total = is + 12 + aw + sep + is + 12 + ww;
  let x = align === 'center' ? cx - total / 2 : cx;
  icon(ctx, 'pin', x, y - is * 0.8, is, BLUE, { width: 2.2 }); x += is + 12;
  ctx.fillStyle = '#e8edf3'; ctx.textAlign = 'left'; ctx.fillText(t.address, x, y); x += aw;
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(x + sep / 2 - 1, y - size * 0.95, 2, size * 1.2); x += sep;
  icon(ctx, 'globe', x, y - is * 0.8, is, BLUE, { width: 2 }); x += is + 12;
  ctx.fillStyle = '#e8edf3'; ctx.fillText(t.web, x, y);
  ctx.restore();
}

function renderSquare(ctx, t, W, H, offer, a) {
  drawBackground(ctx, t, a.bg, W, H, t.bgFocus.square, t.bgShift.square, 0.25);
  // Verlauf hinter der Textspalte: links frei, rechts dunkel
  const hg = ctx.createLinearGradient(380, 0, W, 0);
  hg.addColorStop(0, 'rgba(2,5,10,0)'); hg.addColorStop(0.35, 'rgba(2,5,10,0.6)'); hg.addColorStop(1, 'rgba(2,5,10,0.82)');
  ctx.fillStyle = hg; ctx.fillRect(380, 0, W - 380, H);
  const logoW = 400;
  const logoH = drawLogo(ctx, a.logo, 44, 36, logoW);
  glowLine(ctx, 30, 30 + logoW + 40, 36 + logoH + 18, 3);
  drawSlogan(ctx, t.slogan, 46, 36 + logoH + 56, 19, 'left');
  if (offer.validUntil) drawTag(ctx, offer.validUntil, W - 170, 112, 0.72);

  const footH = 150, top = 36 + logoH + 90, bottom = H - footH - 20;
  const colX = 540, colW = W - colX - 40;
  const pw = 400, ph = Math.min(430, bottom - top);
  if (a.photoMode) drawPhotoCard(ctx, a.product, 30, top - 20, colX - 60, bottom - top + 20, a.mask, a.crop && a.crop.square);
  else drawProduct(ctx, a.product, (colX - pw) / 2 + 5, top + (bottom - top - ph) / 2 + 30, pw, ph);

  const head = headlineLines(ctx, offer.headline || '', s => F(900, s, true), 66, 40, colW, 3);
  const headH = head.lines.length * head.size * 1.02;
  const feats = (offer.features || []).filter(f => f && f.text && f.text.trim()).slice(0, 3);
  const featH = feats.length ? feats.length * 66 - 14 : 0;
  const priceH = drawPrice(ctx, offer, colX, 0, colW, 0.56, 'left', false);
  const total = headH + (feats.length ? 26 + featH : 0) + 30 + priceH;
  let y = top + Math.max(0, (bottom - top - total) / 2);
  drawHeadline(ctx, head, colX, y, W, 'left', false); y += headH;
  if (feats.length) { y += 26; drawFeatures(ctx, feats, colX, y, colW, 'col', 1); y += featH; }
  y += 30;
  drawPrice(ctx, offer, colX, y, colW, 0.56, 'left', true);

  // Fuß
  const ft = H - footH;
  const fg = ctx.createLinearGradient(0, ft, 0, H);
  fg.addColorStop(0, 'rgba(2,6,14,0.0)'); fg.addColorStop(0.3, 'rgba(2,6,14,0.75)'); fg.addColorStop(1, 'rgba(2,6,14,0.95)');
  ctx.fillStyle = fg; ctx.fillRect(0, ft, W, footH);
  glowLine(ctx, 20, W - 20, ft + 8, 3);
  ctx.save();
  ctx.shadowColor = BLUE; ctx.shadowBlur = 16;
  icon(ctx, 'phone', 44, ft + 40, 72, BLUE, { fill: true });
  ctx.shadowBlur = 0; ctx.textAlign = 'left';
  ctx.font = F(800, 25); ctx.fillStyle = BLUE_L; ctx.fillText('ANRUF & WHATSAPP', 132, ft + 58);
  ctx.font = F(900, 54); ctx.fillStyle = '#ffffff'; ctx.fillText(t.phone, 130, ft + 114);
  ctx.textAlign = 'right';
  ctx.font = F(500, 22); ctx.fillStyle = '#e8edf3';
  ctx.fillText(t.address, W - 44, ft + 72);
  ctx.fillText(t.web, W - 44, ft + 112);
  icon(ctx, 'pin', W - 44 - ctx.measureText(t.address).width - 36, ft + 48, 28, BLUE, { width: 2.2 });
  icon(ctx, 'globe', W - 44 - ctx.measureText(t.web).width - 36, ft + 88, 28, BLUE, { width: 2 });
  ctx.restore();
}
