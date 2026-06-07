import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // 1. Keep root at the repository base so Vite can see the /questions folder
  root: '.',

  // 2. Relative base path (Crucial so deployed assets can resolve across subfolders)
  base: './', 
  
  build: {
    // 3. Output to your standard dist directory
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    
    rollupOptions: {
      input: {
        // 4. Explicitly target your nested HTML file
        main: path.resolve(__dirname, 'src/final/html/index.html')
      }
    }
  },

  // 5. CRITICAL FIX: Tells the local dev server exactly where to route when you start it
  server: {
    open: '/src/final/html/index.html'
  }
});