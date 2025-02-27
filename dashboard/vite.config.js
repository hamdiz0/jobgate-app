import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log(process.env.VITE_INTERNAL_API_BASE)

export default defineConfig({
  plugins: [react()],
  root: '.', // Root directory of the project
  publicDir: 'public', // Directory for static assets
  build: {
    outDir: './dist', // Output directory for the build
    emptyOutDir: true, // Clean the output directory before building
  }
});