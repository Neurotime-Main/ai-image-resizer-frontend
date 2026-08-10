import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The API origin comes from VITE_API_URL (.env.development / .env.production);
// the backend allows the dev origin via its CORS_ORIGIN setting.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
