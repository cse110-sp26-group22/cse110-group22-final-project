import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // 1. Set the root to the folder containing index.html
  root: path.resolve(__dirname, 'src/final/html'),

  // 2. GitHub Pages base path
  base: '/cse110-group22-final-project/',
  
  build: {
    // 3. Force the output directory straight to the absolute project root /dist
    outDir: path.resolve(__dirname, 'dist'),
    
    // 4. Clear old files before building
    emptyOutDir: true,
    
    // 5. Ensure Rollup doesn't try to recreate the subfolder structure
    rollupOptions: {
      input: path.resolve(__dirname, 'src/final/html/index.html'),
    }
  }
});