import { defineConfig } from 'vite';

export default defineConfig({
  // Tell Vite that project source files live in this subfolder
  root: 'src/final/html',

  // 2. Keep your base path for GitHub Pages
  base: '/cse110-group22-final-project/',
  
  build: {
    // Since the root is inside src/final/html, we need to go up 4 levels 
    // to put the final bundled assets into the main root './dist' folder
    outDir: '../../../../dist',
    
    // Clear the old dist folder before building new files
    emptyOutDir: true,
  }
});