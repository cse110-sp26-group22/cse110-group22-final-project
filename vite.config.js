import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: './', // Absolute base path
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/final/html/index.html')
      }
    }
  }
});  
