// Einfacher PIN-Schutz (4 Ziffern). Der PIN wird nur als Hash auf dem Gerät gespeichert.
const KEY = 'kamu-pin-hash';
const SESSION = 'kamu-unlocked';

async function hash(pin) {
  const data = new TextEncoder().encode('kamu-angebote:' + pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function isUnlocked() { return sessionStorage.getItem(SESSION) === '1'; }

export function initPin({ onUnlock, onReset }) {
  const $ = id => document.getElementById(id);
  const screen = $('screen-pin'), title = $('pin-title'), hint = $('pin-hint'), err = $('pin-error');
  const dots = [...screen.querySelectorAll('.pin-dots span')];
  let entry = '', firstPin = null;
  const stored = () => localStorage.getItem(KEY);

  function setMode() {
    if (!stored()) {
      title.textContent = firstPin ? 'PIN wiederholen' : 'PIN festlegen';
      hint.textContent = firstPin ? 'Zur Sicherheit noch einmal eingeben.' : 'Wähle einen 4-stelligen PIN für die App.';
    } else {
      title.textContent = 'PIN eingeben'; hint.textContent = '';
    }
  }
  function paint() { dots.forEach((d, i) => d.classList.toggle('on', i < entry.length)); }

  async function complete() {
    const pin = entry; entry = ''; paint();
    if (!stored()) {
      if (!firstPin) { firstPin = pin; err.textContent = ''; setMode(); return; }
      if (pin !== firstPin) { firstPin = null; err.textContent = 'Die PINs stimmen nicht überein. Bitte neu festlegen.'; setMode(); return; }
      localStorage.setItem(KEY, await hash(pin));
      firstPin = null;
    } else if (await hash(pin) !== stored()) {
      err.textContent = 'Falscher PIN.';
      if (navigator.vibrate) navigator.vibrate(120);
      return;
    }
    err.textContent = '';
    sessionStorage.setItem(SESSION, '1');
    screen.hidden = true;
    onUnlock();
  }

  screen.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.digit !== undefined && entry.length < 4) {
      entry += b.dataset.digit; paint();
      if (entry.length === 4) complete();
    } else if (b.id === 'pin-back') {
      entry = entry.slice(0, -1); paint();
    } else if (b.id === 'pin-reset') {
      if (!stored()) return;
      if (confirm('PIN zurücksetzen? Dabei wird auch der gesamte Verlauf auf diesem Handy gelöscht.')) {
        localStorage.removeItem(KEY);
        onReset && onReset();
        entry = ''; firstPin = null; err.textContent = ''; paint(); setMode();
      }
    }
  });
  document.addEventListener('keydown', e => {
    if (screen.hidden) return;
    if (/^\d$/.test(e.key) && entry.length < 4) { entry += e.key; paint(); if (entry.length === 4) complete(); }
    if (e.key === 'Backspace') { entry = entry.slice(0, -1); paint(); }
  });

  return {
    show() { entry = ''; paint(); setMode(); screen.hidden = false; },
  };
}
