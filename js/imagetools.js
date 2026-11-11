// Bild-Hilfsfunktionen: Laden, Verpixeln, Freistellen (Maske)
const MAX_SIDE = 2400;     // Fotos werden auf max. 2400 px verkleinert (reicht für 1080er Vorlagen)
const SEG_SIDE = 1600;     // Größe für die KI-Erkennung

export async function loadPhoto(file) {
  let bmp;
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch { bmp = await createImageBitmap(file); }
  return toCanvas(bmp, MAX_SIDE);
}

export async function blobToCanvas(blob) {
  const bmp = await createImageBitmap(blob);
  return toCanvas(bmp, Infinity);
}

function toCanvas(src, maxSide) {
  const w0 = src.width, h0 = src.height;
  const k = Math.min(1, maxSide / Math.max(w0, h0));
  const c = document.createElement('canvas');
  c.width = Math.round(w0 * k); c.height = Math.round(h0 * k);
  const x = c.getContext('2d');
  x.imageSmoothingQuality = 'high';
  x.drawImage(src, 0, 0, c.width, c.height);
  if (src.close) src.close();
  return c;
}

export function scaled(canvas, maxSide) {
  return toCanvas(canvas, maxSide);
}

export function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.92) {
  return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Bild konnte nicht erstellt werden')), type, quality));
}

// Rechtecke (in Bildkoordinaten) grob verpixeln und weichzeichnen
export function pixelate(source, rects) {
  const c = document.createElement('canvas');
  c.width = source.width; c.height = source.height;
  const x = c.getContext('2d');
  x.drawImage(source, 0, 0);
  for (const r of rects) {
    const w = Math.max(4, Math.round(r.w)), h = Math.max(4, Math.round(r.h));
    const tiny = document.createElement('canvas');
    tiny.width = Math.max(2, Math.round(w / 14)); tiny.height = Math.max(2, Math.round(h / 14));
    tiny.getContext('2d').drawImage(source, r.x, r.y, w, h, 0, 0, tiny.width, tiny.height);
    x.save();
    x.imageSmoothingEnabled = false;
    x.filter = 'blur(4px)';
    x.drawImage(tiny, 0, 0, tiny.width, tiny.height, r.x, r.y, w, h);
    x.restore();
  }
  return c;
}

// KI-Erkennung des Produkts → Graustufen-Maske (weiß = Produkt)
let segModule = null;
export async function segment(canvas, onProgress) {
  if (!segModule) segModule = await import('./segment.bundle.js');
  const small = toCanvas(canvas, SEG_SIDE);
  const blob = await canvasToBlob(small, 'image/jpeg', 0.95);
  const maskBlob = await segModule.segmentForeground(blob, {
    publicPath: new URL('../bg/', import.meta.url).href,
    model: 'small',
    proxyToWorker: false,
    output: { format: 'image/png' },
    progress: (key, cur, total) => onProgress && onProgress(key, cur, total),
  });
  return blobToCanvas(maskBlob);
}

// Prüfen, ob das KI-Modell schon im Speicher des Handys liegt
export async function modelCached() {
  if (!('caches' in window)) return false;
  try {
    const res = await fetch(new URL('../bg/resources.json', import.meta.url));
    const r = await res.json();
    const first = r['/models/small'].chunks[0].hash;
    return !!(await caches.match(new URL('../bg/' + first, import.meta.url).href));
  } catch { return false; }
}
