# Iteración v3 — perfil opcional y guardado en la nube (2026-10-28)

**Qué pedí:** que mi avance no viva solo en el navegador de un aparato. La app se sigue usando sin perfil, como hoy; si creo mi perfil, sube lo que ya llevo y desde ahí se guarda solo y aparece igual en mis otros aparatos. Si alguien más usa la app, nunca ve ni toca lo mío.

1. **La base** (P1): una tabla `progreso` en Supabase (proyecto `chess`), una fila por usuario, con reglas de acceso por usuario (RLS) para que cada quien solo lea y escriba la suya.
2. **El perfil, opcional** (P2): en Más, "Guardar mi progreso": escribo mi correo y me llega un link, sin contraseña. Una sola sugerencia, que se descarta para siempre, cuando ya hay algo que perder.
3. **Guardar y sincronizar** (P3): al crear el perfil se juntan lo del aparato y lo de la nube sin perder nada; después, cada cambio se guarda solo y al abrir la app se trae lo último. Sin internet, se guarda al volver.
4. **Que se vea el estado** (P4): "Guardado hace un momento", "Guardando…" o "Sin conexión: se guarda al volver"; y un aviso claro si la nube no contesta.
5. **Cerrar sesión y borrar lo mío de la nube** (P5).
6. **Prueba contra el Supabase real** (P6), **bitácora** (P7), **pase adversarial** (P8) y **publicar** (P9).

**La fuente de la tarea:** `/Users/carlosaguerof/01_repos/00_corridas/chess/2026-10-28_INSTRUCTIVO_perfil-y-guardado.md` (fuera de este repo). El estado, lo bloqueado y el reporte viven junto al instructivo.

**Qué es éxito:** todo demostrado con pruebas que corren (`npm test`, `npm run e2e`), una prueba en SQL de que un usuario no ve ni cambia lo de otro, y la página publicada comprobada.

**Capturas:** las de las pruebas de esta vuelta, en `iterations/v2/capturas/pruebas/{iphone,escritorio}/p*-*.png` (la carpeta de las pruebas no cambia de vuelta).
