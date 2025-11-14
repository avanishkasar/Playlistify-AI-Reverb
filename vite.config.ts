import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/spotify': {
        target: 'https://api.spotify.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/spotify/, ''),
        headers: {
          'Origin': 'https://api.spotify.com'
        }
      },
      '/api/spotify-token': {
        target: 'https://accounts.spotify.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/spotify-token/, ''),
        headers: {
          'Origin': 'https://accounts.spotify.com'
        }
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
