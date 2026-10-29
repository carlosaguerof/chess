# Cómo se define una apertura de la base (para quien la cura)

La base se arma SOLO con líneas de `input/lichess-chess-openings/{a,b,c,d,e}.tsv` (CC0): columnas `eco`, `name`, `pgn`. Cada variante es **exactamente una fila** de esos archivos: su `name` y sus jugadas se copian tal cual (el script de construcción las coteja jugada por jugada y falla si no coinciden). Nada se inventa.

Un archivo por apertura: `scripts/base/definiciones/<id>.json`:

```json
{
  "id": "caro-kann",
  "nombre": "Defensa Caro-Kann",
  "nombreIngles": "Caro-Kann Defense",
  "eco": "B10–B19",
  "lado": "negras",
  "raiz": "e4 c6",
  "idea": "2 a 3 frases en español: de qué se trata la apertura, para un jugador de 700.",
  "variantes": [
    {
      "id": "avance-short",
      "familia": "Variante del Avance",
      "nombre": "Variante del Avance: Short",
      "fila": { "eco": "B12", "name": "Caro-Kann Defense: Advance, Short Variation", "pgn": "1. e4 c6 2. d4 d5 3. e5 Bf5 4. c3 e6 5. Be2" },
      "lado": "negras",
      "plan": "1 a 3 frases en español, notación R D T A C (rey, dama, torre, alfil, caballo; 0-0 y 0-0-0): la idea de la línea y cómo sigue el plan de mi lado.",
      "frecuencia": null,
      "fuenteFrecuencia": null
    }
  ]
}
```

Reglas:
- `lado` (de la apertura y, si cambia, de cada variante): el lado cuyas jugadas son "las mías" en esa línea: `"blancas"`, `"negras"` o `"ambos"`. Las jugadas de ese lado se validan con el motor: **ninguna puede perder más de 1 peón (100 centipeones) contra la mejor jugada a profundidad 18.** Evita gambitos dudosos o jugadas raras de ese lado; las del rival pueden ser malas (son las que aparecen a nivel principiante).
- `fila.pgn` se copia EXACTO del TSV (con números de jugada). La fila tiene que empezar con la `raiz` de la apertura.
- Líneas de hasta unas 8 a 10 jugadas (20 medias jugadas como máximo). De preferencia que terminen en una jugada de mi lado.
- Cada variante es una lección distinta: no repitas la misma fila dos veces.
- `familia`: el nombre de la variante en español, agrupando subvariantes (p. ej. todas las del Avance van en "Variante del Avance"). `nombre`: el nombre completo en español. Los nombres propios se quedan (Short, Panov, Karpov…); "Variation" = "Variante", "Attack" = "Ataque", "Defense" = "Defensa", "Gambit" = "Gambito".
- `plan`: lo redactas en español, corto (1 a 3 frases), en notación R D T A C (p. ej. "...Af5 antes de ...e6", "Cf3, Ae2 y 0-0"). Describe ideas y planes conocidos; no inventes líneas concretas largas fuera de la fila. Se mostrará marcado como "redactado por la IA".
- `frecuencia` (1 a 5) solo si viene de una fuente citada en `fuenteFrecuencia` (por ejemplo la guía de Carlos); si no, `null` (el script pone 3).
- El orden de `variantes` importa: primero las más comunes y principales.
- Entre 6 y 16 variantes por apertura, salvo que se pida otra cosa.

## La continuación (cursos del escalón 1, desde 2026-10-29)

Una lección de curso puede necesitar más jugadas de las que trae la fila de la fuente (el curso pide de 6 a 8 jugadas mías por variante). Entonces la variante lleva una `continuacion`: las jugadas que siguen a la fila (SAN inglés, separadas por espacios) y de dónde salen.

```json
"continuacion": {
  "jugadas": "h5 Bd3 Bxd3 Qxd3 e6",
  "fuente": ["Wikibooks, 1.e4 c6 2.d4 d5 3.e5 Af5 (4...h5 5.Ad3 Axd3 6.Dxd3 e6)", "motor: 4...h5 (+0.36) es la mejor"]
}
```

Reglas:
- Cada jugada de la continuación sale de una fuente seria (Wikibooks, Wikipedia) o es la mejor del motor (o a menos de 0.2): lo dice `fuente`. Nada se inventa.
- Se valida como lo demás: `npm run validar-base` (ninguna jugada de mi lado pierde más de 1 peón) y, como entra a los libros de los bots, `node scripts/validar-libros.ts`. Las dos aceptan `DIR_VALIDACION=<carpeta de trabajo>` para escribir sus archivos de paso fuera del repo.
- `construir-base` la pega a la fila (la base guarda `continuacion: { desde, fuente }`) y la prueba de la base revisa que la fila siga exacta.
- Una variante con continuación es una variante nueva (id `curso-…`, lado de quien aprende): las de antes no cambian, así los otros cursos no se mueven.
