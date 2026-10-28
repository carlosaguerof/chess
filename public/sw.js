// R1: la app funciona sin internet. Al instalarse, guarda la página, su código y estilos, las tipografías y el
// motor; después, guarda también lo que se vaya pidiendo. La página se pide primero a la red (para tener la
// versión nueva) y, si no hay red, sale de lo guardado. Todo lo demás sale de lo guardado si ya está.
const CACHE = 'mis-aperturas-v1'
const BASE = new URL('./', self.location).href
const FIJOS = ['./', 'manifest.webmanifest', 'icono.svg', 'icono-192.png', 'apple-touch-icon.png', 'motor/stockfish-19-lite-single.js', 'motor/stockfish-19-lite-single.wasm']

/** Lo que pide la página: su código y estilos (de index.html) y las tipografías woff2 (de los estilos). */
async function archivosDeLaPagina() {
  const html = await (await fetch(BASE, { cache: 'no-store' })).text()
  const propios = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => new URL(m[1], BASE).href).filter((u) => u.startsWith(BASE))
  const fuentes = []
  for (const css of propios.filter((u) => u.endsWith('.css'))) {
    const texto = await (await fetch(css)).text()
    for (const m of texto.matchAll(/url\(([^)]+\.woff2)\)/g)) fuentes.push(new URL(m[1].replace(/["']/g, ''), css).href)
  }
  return [...propios, ...fuentes]
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      await cache.addAll(FIJOS.map((f) => new URL(f, BASE).href))
      await cache.addAll([...new Set(await archivosDeLaPagina())])
      await self.skipWaiting()
    })(),
  )
})
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || !req.url.startsWith(BASE)) return
  const esPagina = req.mode === 'navigate' || req.destination === 'document'
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      if (esPagina) {
        try {
          const r = await fetch(req)
          if (r.ok) cache.put(BASE, r.clone())
          return r
        } catch {
          return (await cache.match(BASE, { ignoreVary: true })) || Response.error()
        }
      }
      // sin mirar Vary: el código con crossorigin pide con Origin y lo guardado al instalar se pidió sin él
      const guardado = await cache.match(req, { ignoreSearch: true, ignoreVary: true })
      if (guardado) return guardado
      const r = await fetch(req)
      if (r.ok) cache.put(req, r.clone())
      return r
    })(),
  )
})
