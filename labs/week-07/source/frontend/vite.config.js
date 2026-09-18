import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/engse203-student-labs-68543210016-0/labs/week-07/',
  server: {
    port: 5173,     
    strictPort: true  
  }
});
