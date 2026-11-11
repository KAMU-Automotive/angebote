// Verlauf in IndexedDB (bleibt nur auf diesem Gerät)
const DB_NAME = 'kamu-angebote';
const STORE = 'offers';
const MAX_ITEMS = 50;

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const s = req.result.createObjectStore(STORE, { keyPath: 'id' });
      s.createIndex('created', 'created');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(mode, fn) {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    let result;
    Promise.resolve(fn(store)).then(r => { result = r; });
    t.oncomplete = () => { db.close(); resolve(result); };
    t.onerror = () => { db.close(); reject(t.error); };
    t.onabort = () => { db.close(); reject(t.error); };
  }));
}

const req2p = req => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });

export async function listOffers() {
  const all = await tx('readonly', s => req2p(s.getAll()));
  return all.sort((a, b) => b.created - a.created);
}

export async function getOffer(id) {
  return tx('readonly', s => req2p(s.get(id)));
}

export async function saveOffer(item) {
  await tx('readwrite', s => s.put(item));
  // Älteste über dem Limit entfernen
  const all = await listOffers();
  const extra = all.slice(MAX_ITEMS);
  if (extra.length) await tx('readwrite', s => extra.forEach(e => s.delete(e.id)));
}

export async function deleteOffer(id) {
  return tx('readwrite', s => s.delete(id));
}

export async function clearAll() {
  return tx('readwrite', s => s.clear());
}
