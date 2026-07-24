import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Les modules testés sont du code serveur pur : pas besoin de DOM.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    // Reproduit le chemin « @/ » défini dans tsconfig.json
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
