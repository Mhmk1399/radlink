const CACHE_VERSION = "radlink-pwa-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("radlink-pwa-") && key !== CACHE_VERSION)
              .map((key) => caches.delete(key)),
          ),
        ),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(
            `<!doctype html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>راد لینک</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #0f172a;
        color: #fff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(90vw, 420px);
        padding: 28px;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 22px;
        background: rgba(255,255,255,.06);
        text-align: center;
      }
      h1 { margin: 0 0 10px; font-size: 20px; }
      p { margin: 0; line-height: 1.9; color: rgba(255,255,255,.74); font-size: 14px; }
    </style>
  </head>
  <body>
    <main>
      <h1>اتصال اینترنت برقرار نیست</h1>
      <p>برای مشاهده این صفحه دوباره اتصال اینترنت را بررسی کنید.</p>
    </main>
  </body>
</html>`,
            {
              headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-store",
              },
            },
          ),
      ),
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "راد لینک", {
      body: data.body || "",
      icon: data.icon || "/web-app-manifest-192x192.png",
      badge: data.badge || "/favicon-96x96.png",
      data: {
        url: data.url || "/",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(self.clients.openWindow(targetUrl));
});
