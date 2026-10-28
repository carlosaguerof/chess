# Personajes (specs)

> Decisiones 4, 5, 22 y 23 de `log.md`. Datos: `src/bots/personajes.json`. Cómo juegan: `specs/motor.md`.

## Distribución

47 personajes: 1 por nivel de 100 a 400 y de 1600 a 3000; 3 por nivel de 500 a 1000; 2 de 1100 a 1500. La densidad va donde juego (500–1000).

| ELO | Por nivel | Cuántos |
|---|---|---|
| 100, 200, 300, 400 | 1 | 4 |
| 500 a 1000 | 3 | 18 |
| 1100 a 1500 | 2 | 10 |
| 1600 a 3000 | 1 | 15 |

En Jugar se agrupan como en "Play Bots": **Principiante** (100–800), **Intermedio** (900–1500), **Avanzado** (1600–2200) y **Maestro** (2300–3000).

## Estilo y temperamento

- **El estilo de un personaje son sus aperturas:** qué abre con blancas y cómo se defiende con negras, ids de la base (`estilo` en el JSON). Sale de su libro unas 6 a 8 jugadas y después juega con el motor a su nivel.
- **Temperamento:** agresivo, equilibrado o defensivo (cambia cómo escoge entre jugadas parecidas; `specs/motor.md`).
- **No se muestra la estrategia escrita** (sus aperturas ni su temperamento) en Jugar: se escoge rival por cara, frase y nivel.

## Frase

Una por personaje: original, en español, **de personalidad**, sin nombres de aperturas, sin jugadas y sin inglés. Lo comprueba `tests/unit/avatares.test.ts`.

## Ilustraciones

1. **De colecciones libres** cuya licencia permita una página pública. La licencia se **confirma en su fuente** antes de usarla y se anota en `LICENCIAS.md` con su enlace. Si pide atribución (CC BY), la atribución va en "Código fuente y licencias". Nada de imágenes sueltas de internet sin licencia clara; las imágenes con IA de pago, solo como plan B.
2. **Originales:** ningún personaje se parece a uno de chess.com, ni en cara ni en nombre ni en frase.
3. **Generadas en el código** a partir del `aspecto` de cada personaje (edad, piel 1–5, peinado, color de pelo, barba, lentes, gorro, ropa y gesto), siempre el mismo dibujo para el mismo personaje y sin internet al usar la app. Lo que el aspecto no fija lo decide el id, nunca el azar.
4. **Los 47 distintos entre sí y variados** (4 edades, las 5 pieles, varios colores de pelo y peinados, lentes, barbas y gorros). Lo comprueba `tests/unit/avatares.test.ts` sobre lo que dibuja cada estilo (Ilustrado no trae lentes ni gorros: ahí los accesorios son solo las barbas).
5. **Tres estilos a escoger** en Más → Ajustes, que se aplican al instante y se recuerdan:

| Estilo | Colección | Licencia | Notas |
|---|---|---|---|
| **Ilustrado** (recomendado) | ToonHead, de Johan Melin | CC BY 4.0 (atribución en la app) | El más parecido a un retrato de busto ilustrado. No dibuja lentes ni gorros |
| Caricatura | Avataaars, de Pablo Stanley | "Free for personal and commercial use" | Dibuja todos los rasgos, también hiyab y turbante |
| Dibujado a mano | Open Peeps, de Pablo Stanley | CC0 | Trazo a mano, en blanco y negro con color de piel |

Los tres se dibujan con DiceBear (MIT). Código: `src/bots/retratos.ts`.
