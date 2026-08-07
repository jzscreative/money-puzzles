/* Money Puzzles — cache-first service worker.
   P4-14: with no icon and no worker, the home-screen launch was a blank
   white screenshot and the app was unusable offline. This precaches the
   app shell on install and serves cache-first after that, so a repeat
   visit (and a home-screen launch with no signal) still opens instantly.
   Bump CACHE on any real content change so old clients pick up the new
   build; stale caches are swept on activate. */
const CACHE = "mp-v5-1-260807-0740";
const SHELL = ["./", "./index.html", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => hit)
    )
  );
});
