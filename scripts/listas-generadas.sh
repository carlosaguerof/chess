#!/bin/sh
# Rehace las listas generadas de todos los cursos (las marcas por jugada y el inventario de "Ver qué pasaría"), las que
# las pruebas comparan con lo que dicen los datos. Correr desde la raíz del repo después de cambiar un curso.
set -e
node scripts/marcas-por-jugada.ts > iterations/v3/marcas-por-jugada.md
node scripts/marcas-por-jugada.ts caro-kann-estructuras:b > iterations/v3/marcas-por-jugada-estructuras.md
node scripts/marcas-por-jugada.ts eslava:b > iterations/v4/marcas-por-jugada-eslava.md
node scripts/marcas-por-jugada.ts otros-negras:b > iterations/v4/marcas-por-jugada-otros-negras.md
node scripts/marcas-por-jugada.ts caro-kann:w > iterations/v4/marcas-por-jugada-avance-caro-kann.md
node scripts/marcas-por-jugada.ts francesa:w > iterations/v4/marcas-por-jugada-avance-francesa.md
node scripts/marcas-por-jugada.ts italiana:w > iterations/v4/marcas-por-jugada-italiana.md
node scripts/marcas-por-jugada.ts escandinava:w > iterations/v4/marcas-por-jugada-escandinava.md
node scripts/marcas-por-jugada.ts siciliana:w > iterations/v4/marcas-por-jugada-alapin.md
node scripts/ver-inventario.ts > iterations/v3/ver-que-pasa-inventario.md
node scripts/ver-inventario.ts caro-kann:w > iterations/v4/ver-que-pasa-inventario-avance-caro-kann.md
node scripts/ver-inventario.ts eslava:b > iterations/v4/ver-que-pasa-inventario-eslava.md
node scripts/ver-inventario.ts otros-negras:b > iterations/v4/ver-que-pasa-inventario-otros-negras.md
node scripts/ver-inventario.ts francesa:w > iterations/v4/ver-que-pasa-inventario-avance-francesa.md
node scripts/ver-inventario.ts siciliana:w > iterations/v4/ver-que-pasa-inventario-alapin.md
node scripts/ver-inventario.ts italiana:w > iterations/v4/ver-que-pasa-inventario-italiana.md
node scripts/ver-inventario.ts escandinava:w > iterations/v4/ver-que-pasa-inventario-escandinava.md
