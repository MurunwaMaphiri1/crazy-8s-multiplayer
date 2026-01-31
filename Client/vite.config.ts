import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // allowedHosts: ['crazy-8s-client.onrender.com'],
    host: '0.0.0.0',
    port: 5173,
  },
});
