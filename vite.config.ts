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
      // y sobre la Italiana por estructuras (2026-11-25)
      {
        extends: true,
        test: {
          name: 'curso de la Italiana',
          include: ['curso-contenido', 'curso-ciclo', 'correcciones-marcas', 'correcciones-paso-a-paso', 'correcciones-practicar', 'ver-que-pasa'].map((p) => `tests/unit/${p}.test.ts`),
          env: { CURSO: 'italiana:w' },
        },
      },
      // los cursos del Avance (2026-11-25): las mismas pruebas de contenido, sin relajarse; el ciclo de la lección es el de
      // la Caro-Kann (sus jugadas), y lo propio de estos cursos está en tests/unit/curso-avance.test.ts
      ...['caro-kann:w', 'francesa:w'].map((curso) => ({
        extends: true as const,
        test: {
          name: `curso ${curso}`,
          include: ['curso-contenido', 'correcciones-marcas', 'correcciones-paso-a-paso', 'correcciones-practicar', 'ver-que-pasa'].map((p) => `tests/unit/${p}.test.ts`),
          env: { CURSO: curso },
        },
      })),
    ],
  },
})
