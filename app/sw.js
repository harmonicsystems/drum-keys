// Drum Pads service worker.
// - App shell: network first (so updates land), cache as the offline fallback.
// - Samples from archive.org: cache first, kept forever — the sounds never change.
const SHELL = 'shell-v1';
const SAMPLES = 'samples-v1';
const SHELL_FILES = [
  './', './index.html', './machines.js', './machine-files.json', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png', '../engine.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== SAMPLES).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'archive.org' || url.hostname.endsWith('.archive.org')) e.respondWith(sample(req));
  else if (url.origin === location.origin) e.respondWith(shell(req));
});

async function sample(req) {
  const cache = await caches.open(SAMPLES);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) {
    // Store a plain copy keyed by the archive.org URL the page asked for
    // (the live response is a redirect to a storage node).
    const body = await res.clone().arrayBuffer();
    await cache.put(req.url, new Response(body, { headers: { 'Content-Type': res.headers.get('Content-Type') || 'audio/wav' } }));
  }
  return res;
}

async function shell(req) {
  const cache = await caches.open(SHELL);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' && cache.match('./index.html')) || Response.error();
  }
}
