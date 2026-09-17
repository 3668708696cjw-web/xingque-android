/** Read STORED zip blobs (our asteroid packs) without inflating the whole archive. */

const DB = "xingque-ephe";
const STORE = "packs";

type PackMeta = { name: string; size: number; count: number };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<Blob | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const q = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
    q.onsuccess = () => resolve(q.result as Blob | undefined);
    q.onerror = () => reject(q.error);
  });
}

async function idbSet(key: string, value: Blob | PackMeta[]) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const q = db.transaction(STORE, "readwrite").objectStore(STORE).put(value, key);
    q.onsuccess = () => resolve();
    q.onerror = () => reject(q.error);
  });
}

function u16(b: Uint8Array, o: number) {
  return b[o] | (b[o + 1] << 8);
}
function u32(b: Uint8Array, o: number) {
  return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
}

type ZipIndex = Map<string, { offset: number; size: number }>;
const indexCache = new Map<string, ZipIndex>();

async function indexOf(name: string, blob: Blob): Promise<ZipIndex> {
  const hit = indexCache.get(name);
  if (hit) return hit;
  const tail = Math.min(65557, blob.size);
  const buf = new Uint8Array(await blob.slice(blob.size - tail).arrayBuffer());
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 0x05 && buf[i + 3] === 0x06) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return new Map();
  const cdOff = u32(buf, eocd + 16);
  const cdSize = u32(buf, eocd + 12);
  const cd = new Uint8Array(await blob.slice(cdOff, cdOff + cdSize).arrayBuffer());
  const map: ZipIndex = new Map();
  let p = 0;
  while (p + 46 <= cd.length) {
    if (u32(cd, p) !== 0x02014b50) break;
    const method = u16(cd, p + 10);
    const size = u32(cd, p + 24);
    const nameLen = u16(cd, p + 28);
    const extraLen = u16(cd, p + 30);
    const commentLen = u16(cd, p + 32);
    const localOff = u32(cd, p + 42);
    const fname = new TextDecoder().decode(cd.subarray(p + 46, p + 46 + nameLen));
    if (method === 0) map.set(fname.replace(/^.*\//, ""), { offset: localOff, size });
    p += 46 + nameLen + extraLen + commentLen;
  }
  indexCache.set(name, map);
  return map;
}

export async function importAsteroidZip(file: File): Promise<PackMeta> {
  const blob = file.slice(0);
  const idx = await indexOf(file.name, blob);
  if (idx.size < 10) throw new Error("不是星阙星历包");
  await idbSet(`pack:${file.name}`, blob);
  const metas = (await listPacks()).filter((m) => m.name !== file.name);
  const meta = { name: file.name, size: blob.size, count: idx.size };
  metas.push(meta);
  await idbSet("meta", metas);
  return meta;
}

export async function listPacks(): Promise<PackMeta[]> {
  const db = await openDb();
  return new Promise((resolve) => {
    const q = db.transaction(STORE, "readonly").objectStore(STORE).get("meta");
    q.onsuccess = () => resolve((q.result as PackMeta[]) ?? []);
    q.onerror = () => resolve([]);
  });
}

export async function readPackedSe1(fileName: string): Promise<Blob | null> {
  const packs = await listPacks();
  for (const p of packs) {
    const blob = await idbGet(`pack:${p.name}`);
    if (!blob) continue;
    const idx = await indexOf(p.name, blob);
    const ent = idx.get(fileName);
    if (!ent) continue;
    const header = new Uint8Array(await blob.slice(ent.offset, ent.offset + 30).arrayBuffer());
    if (u32(header, 0) !== 0x04034b50) continue;
    const nameLen = u16(header, 26);
    const extraLen = u16(header, 28);
    const start = ent.offset + 30 + nameLen + extraLen;
    return blob.slice(start, start + ent.size);
  }
  return null;
}

export function packedSe1Url(blob: Blob) {
  return URL.createObjectURL(blob);
}
