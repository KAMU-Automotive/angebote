import { renderOffer, TEMPLATES, FORMATS, ICON_CHOICES, lastCard } from './render.js';
import * as render from './render.js';
import { listOffers, getOffer, saveOffer, deleteOffer, clearAll } from './db.js';
import { loadPhoto, blobToCanvas, canvasToBlob, pixelate, segment, scaled } from './imagetools.js';
import { initPin, isUnlocked } from './pin.js';

const $ = id => document.getElementById(id);
const screens = ['screen-pin', 'screen-home', 'screen-editor', 'screen-plate'];
function show(id) { screens.forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }

// ---------- Hilfen ----------
function toast(msg, ms = 2600) {
  const t = $('toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, ms);
}
function busy(on, text = 'Einen Moment …') { $('busy').hidden = !on; $('busy-text').textContent = text; }
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const defaultCrop = () => ({ story: { x: 0.5, y: 0.45, zoom: 1 }, square: { x: 0.5, y: 0.45, zoom: 1 } });

// ---------- Vorlagen-Assets ----------
const assets = {};
async function loadAssets() {
  const fonts = [500, 600, 700, 800, 900].map(w => document.fonts.load(`${w} 40px "KAMU Display"`))
    .concat([800, 900].map(w => document.fonts.load(`italic ${w} 40px "KAMU Display"`)));
  await Promise.all(fonts);
  for (const [k, t] of Object.entries(TEMPLATES)) {
    assets[k] = { logo: await loadImg(t.logo), bg: await loadImg(t.bg).catch(() => null) };
  }
}

// ---------- Editor-Zustand ----------
let state = null;
function newState(template) {
  return {
    id: null, template,
    original: null, photo: null, plates: [], mask: null,
    mode: 'photo', crop: defaultCrop(), format: 'story', dirty: false,
  };
}

function readOffer() {
  const feats = [...document.querySelectorAll('.feature-row')].map(r => ({
    icon: r.querySelector('select').value, text: r.querySelector('input').value.trim(),
  }));
  const v = $('f-valid').value; // yyyy-mm-dd
  let validUntil = '';
  if (v) { const [, m, d] = v.split('-'); validUntil = `${+d}.${+m}.`; }
  return {
    headline: $('f-headline').value.trim(),
    price: $('f-price').value.trim(),
    oldPrice: $('f-oldprice').value.trim(),
    validUntil, validDate: v,
    features: feats,
  };
}

function writeOffer(o) {
  $('f-headline').value = o.headline || '';
  $('f-price').value = o.price || '';
  $('f-oldprice').value = o.oldPrice || '';
  $('f-valid').value = o.validDate || '';
  document.querySelectorAll('.feature-row').forEach((r, i) => {
    const f = (o.features || [])[i] || {};
    r.querySelector('select').value = f.icon || ['shield', 'wrench', 'car'][i];
    r.querySelector('input').value = f.text || '';
  });
}

function renderAssets() {
  return {
    ...assets[state.template],
    product: state.photo, photoMode: true,
    mask: state.mode === 'blur' ? state.mask : null,
    crop: state.crop,
  };
}

// Vorschau (gedrosselt auf ein Bild pro Frame)
let raf = 0;
function refresh() {
  if (!state) return;
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const o = readOffer();
    const preview = { ...o, headline: o.headline || 'Deine Überschrift', price: o.price || '0' };
    renderOffer($('preview'), state.template, state.format, preview, renderAssets());
  });
}

// ---------- Startseite / Verlauf ----------
async function showHome() {
  state = null;
  show('screen-home');
  const list = $('history');
  list.innerHTML = '';
  let items = [];
  try { items = await listOffers(); } catch (e) { console.error(e); }
  $('history-empty').hidden = items.length > 0;
  for (const it of items) {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.alt = ''; img.src = URL.createObjectURL(it.thumb);
    img.onload = () => URL.revokeObjectURL(img.src);
    const info = document.createElement('div');
    const d = new Date(it.created);
    info.innerHTML = `<div class="h-title"></div><div class="h-meta"></div>`;
    info.querySelector('.h-title').textContent = it.offer.headline || '(ohne Überschrift)';
    info.querySelector('.h-meta').textContent = `${TEMPLATES[it.template].name} · ${d.toLocaleDateString('de-AT')} · ${render.formatPrice(it.offer.price)}`;
    const act = document.createElement('div');
    act.className = 'h-actions';
    act.innerHTML = '<button type="button" data-a="open">Öffnen</button><button type="button" data-a="copy">Kopie</button><button type="button" data-a="del" class="del">Löschen</button>';
    act.addEventListener('click', async e => {
      const a = e.target.dataset.a;
      if (a === 'open' || a === 'copy') openFromHistory(it.id, a === 'copy');
      if (a === 'del' && confirm('Dieses Angebot aus dem Verlauf löschen?')) { await deleteOffer(it.id); showHome(); }
    });
    li.append(img, info, act);
    list.append(li);
  }
}

async function openFromHistory(id, asCopy) {
  busy(true, 'Wird geladen …');
  try {
    const it = await getOffer(id);
    state = newState(it.template);
    state.id = asCopy ? null : it.id;
    state.original = await blobToCanvas(it.photo);
    state.photo = state.original;
    state.mask = it.mask ? await blobToCanvas(it.mask) : null;
    state.mode = it.mode === 'blur' && state.mask ? 'blur' : 'photo';
    state.crop = it.crop || defaultCrop();
    openEditor(it.offer);
    if (asCopy) toast('Kopie erstellt – Preis oder Text anpassen und teilen.');
  } catch (e) {
    console.error(e); toast('Angebot konnte nicht geladen werden.');
  } finally { busy(false); }
}

// ---------- Editor ----------
function openEditor(offer) {
  $('editor-title').textContent = TEMPLATES[state.template].name;
  writeOffer(offer || {});
  setSegmented('[data-format]', 'format', state.format);
  setSegmented('[data-mode]', 'mode', state.mode);
  updatePhotoUI();
  setCropMode(false);
  $('save-error').textContent = '';
  show('screen-editor');
  refresh();
}

function setSegmented(sel, key, val) {
  document.querySelectorAll(sel).forEach(b => b.setAttribute('aria-checked', String(b.dataset[key] === val)));
}

function updatePhotoUI() {
  $('photo-tools').hidden = !state.photo;
  $('btn-crop').disabled = !state.photo;
  $('seg-status').hidden = true;
}

async function onPhotoFile(file) {
  if (!file) return;
  busy(true, 'Foto wird geladen …');
  try {
    state.original = await loadPhoto(file);
    state.photo = state.original;
    state.plates = []; state.mask = null; state.mode = 'photo';
    state.crop = defaultCrop(); state.dirty = true;
    setSegmented('[data-mode]', 'mode', 'photo');
    updatePhotoUI();
    refresh();
  } catch (e) {
    console.error(e); toast('Das Foto konnte nicht geöffnet werden.');
  } finally { busy(false); }
}

async function setMode(mode) {
  if (!state.photo) return;
  if (mode === 'blur' && !state.mask) {
    const ok = await runSegmentation();
    if (!ok) { setSegmented('[data-mode]', 'mode', state.mode); return; }
  }
  state.mode = mode; state.dirty = true;
  setSegmented('[data-mode]', 'mode', mode);
  refresh();
}

let segRunning = false;
async function runSegmentation() {
  if (segRunning) return false;
  segRunning = true;
  const box = $('seg-status'), bar = $('seg-bar'), txt = $('seg-text');
  box.hidden = false; bar.style.width = '0%';
  txt.textContent = 'KI wird vorbereitet …';
  document.querySelectorAll('[data-mode]').forEach(b => { b.disabled = true; });
  try {
    state.mask = await segment(state.original, (key, cur, total) => {
      if (key.startsWith('fetch:/models')) {
        const p = total ? Math.round(cur / total * 100) : 0;
        bar.style.width = p + '%';
        txt.textContent = p < 100 ? `KI-Modell wird geladen (einmalig, ca. 55 MB) … ${p} %` : 'KI-Modell geladen';
      } else if (key === 'compute:inference') {
        bar.style.width = cur >= total ? '100%' : '90%';
        txt.textContent = cur >= total ? 'Fertig' : 'Produkt wird erkannt …';
      }
    });
    box.hidden = true;
    return true;
  } catch (e) {
    console.error(e);
    txt.textContent = navigator.onLine ? 'Erkennung fehlgeschlagen. Bitte nochmal versuchen.' : 'Für den ersten Start ist Internet nötig (KI-Modell laden).';
    return false;
  } finally {
    segRunning = false;
    document.querySelectorAll('[data-mode]').forEach(b => { b.disabled = false; });
  }
}

// ---------- Ausschnitt (Wischen & Zoomen) ----------
let cropping = false;
function setCropMode(on) {
  cropping = on;
  $('preview-wrap').classList.toggle('cropping', on);
  $('crop-hint').hidden = !on;
  $('btn-crop').textContent = on ? 'Ausschnitt fertig' : 'Ausschnitt anpassen';
}

const pointers = new Map();
let pinchStart = null;
function initCropGestures() {
  const wrap = $('preview-wrap'), cv = $('preview');
  const toCanvasPx = () => cv.width / cv.getBoundingClientRect().width;
  wrap.addEventListener('pointerdown', e => {
    if (!cropping) return;
    wrap.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStart = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: state.crop[state.format].zoom };
    }
  });
  wrap.addEventListener('pointermove', e => {
    if (!cropping || !pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    const cur = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, cur);
    const c = state.crop[state.format];
    if (pointers.size >= 2 && pinchStart) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      c.zoom = Math.min(4, Math.max(1, pinchStart.zoom * d / pinchStart.dist));
    } else if (pointers.size === 1 && lastCard) {
      const k = toCanvasPx();
      const dx = (cur.x - prev.x) * k, dy = (cur.y - prev.y) * k;
      const L = lastCard;
      const freeX = L.iw - L.sw, freeY = L.ih - L.sh;
      if (freeX > 1) c.x = Math.min(1, Math.max(0, c.x - dx * (L.sw / L.cw) / freeX));
      if (freeY > 1) c.y = Math.min(1, Math.max(0, c.y - dy * (L.sh / L.ch) / freeY));
    }
    state.dirty = true;
    refresh();
  });
  const end = e => { pointers.delete(e.pointerId); if (pointers.size < 2) pinchStart = null; };
  wrap.addEventListener('pointerup', end);
  wrap.addEventListener('pointercancel', end);
  // Mausrad-Zoom (am PC)
  wrap.addEventListener('wheel', e => {
    if (!cropping) return;
    e.preventDefault();
    const c = state.crop[state.format];
    c.zoom = Math.min(4, Math.max(1, c.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08)));
    refresh();
  }, { passive: false });
}

// ---------- Kennzeichen verpixeln ----------
let plateRects = [], plateDraft = null, plateScale = 1;
function openPlate() {
  if (!state.original) return;
  plateRects = state.plates.map(r => ({ ...r }));
  show('screen-plate');
  const cv = $('plate-canvas');
  const src = scaled(state.original, 1400);
  plateScale = src.width / state.original.width;
  cv.width = src.width; cv.height = src.height;
  cv._src = src;
  drawPlate();
}
function drawPlate() {
  const cv = $('plate-canvas'), x = cv.getContext('2d');
  const rects = plateRects.map(r => ({ x: r.x * plateScale, y: r.y * plateScale, w: r.w * plateScale, h: r.h * plateScale }));
  x.drawImage(pixelate(cv._src, rects), 0, 0);
  x.lineWidth = Math.max(3, cv.width / 250);
  x.strokeStyle = '#1592ff';
  rects.forEach(r => x.strokeRect(r.x, r.y, r.w, r.h));
  if (plateDraft) { x.setLineDash([12, 8]); x.strokeRect(plateDraft.x, plateDraft.y, plateDraft.w, plateDraft.h); x.setLineDash([]); }
}
function initPlate() {
  const cv = $('plate-canvas');
  let start = null;
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; };
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); start = pos(e); plateDraft = { ...start, w: 0, h: 0 }; });
  cv.addEventListener('pointermove', e => {
    if (!start) return;
    const p = pos(e);
    plateDraft = { x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y) };
    drawPlate();
  });
  cv.addEventListener('pointerup', () => {
    if (plateDraft && plateDraft.w > 8 && plateDraft.h > 8) {
      plateRects.push({ x: plateDraft.x / plateScale, y: plateDraft.y / plateScale, w: plateDraft.w / plateScale, h: plateDraft.h / plateScale });
    }
    start = null; plateDraft = null; drawPlate();
  });
  $('plate-undo').addEventListener('click', () => { plateRects.pop(); drawPlate(); });
  $('plate-cancel').addEventListener('click', () => show('screen-editor'));
  $('plate-done').addEventListener('click', () => {
    state.plates = plateRects;
    state.photo = plateRects.length ? pixelate(state.original, plateRects) : state.original;
    state.dirty = true;
    show('screen-editor');
    refresh();
    if (plateRects.length) toast('Kennzeichen verpixelt.');
  });
}

// ---------- Speichern & Teilen ----------
function slug(s) {
  return (s || 'Angebot').normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'Angebot';
}
function fileName(fmt, offer) {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const t = state.template === 'werkstatt' ? 'Werkstatt' : 'Teile';
  return `KAMU-${t}_${date}_${slug(offer.headline)}_${FORMATS[fmt].label}.jpg`;
}

function validate(offer) {
  if (!state.photo) return 'Bitte zuerst ein Foto aufnehmen oder auswählen.';
  if (!offer.headline) return 'Bitte eine Überschrift eintragen.';
  if (!offer.price) return 'Bitte einen Preis eintragen.';
  return '';
}

async function renderFile(fmt, offer) {
  const c = document.createElement('canvas');
  renderOffer(c, state.template, fmt, offer, renderAssets());
  const blob = await canvasToBlob(c, 'image/jpeg', 0.92);
  return { canvas: c, file: new File([blob], fileName(fmt, offer), { type: 'image/jpeg' }) };
}

async function persist(offer, storyCanvas) {
  const thumbC = scaled(storyCanvas, 384);
  const item = {
    id: state.id || uid(),
    created: Date.now(),
    template: state.template,
    offer, mode: state.mode, crop: state.crop,
    photo: await canvasToBlob(state.photo, 'image/jpeg', 0.9),
    mask: state.mask ? await canvasToBlob(state.mask, 'image/png') : null,
    thumb: await canvasToBlob(thumbC, 'image/jpeg', 0.8),
  };
  await saveOffer(item);
  state.id = item.id; state.dirty = false;
}

function download(file) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = file.name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

async function finish(action) {
  const offer = readOffer();
  const err = validate(offer);
  $('save-error').textContent = err;
  if (err) { toast(err); return; }
  busy(true, 'Bilder werden erstellt …');
  try {
    const story = await renderFile('story', offer);
    const square = await renderFile('square', offer);
    await persist(offer, story.canvas).catch(e => console.error('Verlauf', e));
    busy(false);
    if (action === 'save') {
      download(story.file);
      setTimeout(() => download(square.file), 600);
      toast('Gespeichert im Ordner „Download“.');
      return;
    }
    const f = action === 'share-story' ? story.file : square.file;
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      try { await navigator.share({ files: [f] }); }
      catch (e) { if (e.name !== 'AbortError') throw e; }
    } else {
      download(f);
      toast('Teilen wird hier nicht unterstützt – Bild wurde gespeichert.');
    }
  } catch (e) {
    console.error(e);
    toast('Da ist etwas schiefgelaufen. Bitte nochmal versuchen.');
  } finally { busy(false); }
}

// ---------- Start ----------
function initEditor() {
  document.querySelectorAll('.feature-row select').forEach(sel => {
    for (const [v, label] of ICON_CHOICES) {
      const o = document.createElement('option'); o.value = v; o.textContent = label; sel.append(o);
    }
  });
  document.querySelectorAll('.template-btn').forEach(b => b.addEventListener('click', () => {
    state = newState(b.dataset.template);
    openEditor({});
  }));
  $('editor-back').addEventListener('click', () => {
    if (state && state.dirty && state.photo && !confirm('Angebot verlassen? Nicht geteilte Änderungen gehen verloren.')) return;
    showHome();
  });
  $('photo-camera').addEventListener('change', e => { onPhotoFile(e.target.files[0]); e.target.value = ''; });
  $('photo-gallery').addEventListener('change', e => { onPhotoFile(e.target.files[0]); e.target.value = ''; });
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  document.querySelectorAll('[data-format]').forEach(b => b.addEventListener('click', () => {
    state.format = b.dataset.format; setSegmented('[data-format]', 'format', state.format); refresh();
  }));
  $('btn-crop').addEventListener('click', () => setCropMode(!cropping));
  $('btn-plate').addEventListener('click', openPlate);
  document.querySelector('.editor').addEventListener('input', e => {
    if (e.target.closest('.card') && !e.target.matches('[type=file]')) { state.dirty = true; refresh(); }
  });
  document.querySelector('.editor').addEventListener('change', e => { if (e.target.matches('select, [type=date]')) refresh(); });
  $('btn-share-story').addEventListener('click', () => finish('share-story'));
  $('btn-share-square').addEventListener('click', () => finish('share-square'));
  $('btn-save').addEventListener('click', () => finish('save'));
  initCropGestures();
  initPlate();
}

async function main() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW', e));
  initEditor();
  const assetsReady = loadAssets();
  const pin = initPin({
    onUnlock: async () => { await assetsReady; showHome(); },
    onReset: () => clearAll().catch(() => {}),
  });
  if (isUnlocked()) { await assetsReady; showHome(); }
  else { show('screen-pin'); pin.show(); }
}

main();
