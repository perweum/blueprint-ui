import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { chatPlugin } from './chat-plugin.js';

export default defineConfig({
  plugins: [react(), chatPlugin()],
  server: { port: 5275 },
});
