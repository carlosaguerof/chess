/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
  // npm run casa: se abre desde el iPhone por el nombre de la Air en la red de la casa
  preview: { port: 4173, strictPort: true, allowedHosts: ['air-station.local', '.local'] },
  test: {
    environment: 'node',
    projects: [
      { extends: true, test: { name: 'app', include: ['tests/unit/**/*.test.ts', 'src/**/*.test.ts'] } },
      // las pruebas de contenido corren sobre los dos cursos de la Caro-Kann, sin relajarse (specs/cursos.md §6)
      {
        extends: true,
        test: {
          name: 'curso por estructuras',
          include: ['curso-contenido', 'curso-ciclo', 'correcciones-marcas', 'correcciones-paso-a-paso', 'correcciones-practicar', 'ver-que-pasa'].map((p) => `tests/unit/${p}.test.ts`),
          env: { CURSO: 'caro-kann-estructuras:b' },
        },
      },
      // la Eslava, por estructuras (2026-11-25): las mismas pruebas de contenido, sin relajarse
      {
        extends: true,
        test: {
          name: 'curso eslava',
          include: ['curso-contenido', 'curso-ciclo', 'correcciones-marcas', 'correcciones-paso-a-paso', 'correcciones-practicar', 'ver-que-pasa'].map((p) => `tests/unit/${p}.test.ts`),
          env: { CURSO: 'eslava:b' },
        },
      },
      // ...c6 + ...d5 contra lo demás, por estructuras (2026-11-25)
      {
        extends: true,
        test: {
          name: 'curso otros-negras',
          include: ['curso-contenido', 'curso-ciclo', 'correcciones-marcas', 'correcciones-paso-a-paso', 'correcciones-practicar', 'ver-que-pasa'].map((p) => `tests/unit/${p}.test.ts`),
          env: { CURSO: 'otros-negras:b' },
        },
      },
    ],
  },
})
