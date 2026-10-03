/// <reference types="vitest" />
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
    proxy: {
      "/api/v1/geo/photon-reverse": {
        target: "https://photon.komoot.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/geo\/photon-reverse/, "/reverse"),
      },
      "/api/v1/geo/photon": {
        target: "https://photon.komoot.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/geo\/photon/, "/api"),
      },
      "/api/v1/geo/search": {
        target: "https://nominatim.openstreetmap.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/geo\/search/, "/search"),
        headers: {
          "User-Agent": "NaniECommerceApp/1.0 (contact@naniknitts.com)",
        },
      },
      "/api/v1/geo/reverse": {
        target: "https://nominatim.openstreetmap.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/geo\/reverse/, "/reverse"),
        headers: {
          "User-Agent": "NaniECommerceApp/1.0 (contact@naniknitts.com)",
        },
      },
      "/api/v1/auth": {
        target: "http://localhost:8081",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            if ("writeHead" in res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Auth service unavailable" }));
            }
          });
        },
      },
      "/api/v1/profile": {
        target: "http://localhost:8081",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            if ("writeHead" in res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Profile service unavailable" }));
            }
          });
        },
      },
      "/api/v1/cart": {
        target: "http://localhost:8082",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            if ("writeHead" in res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Cart service unavailable" }));
            }
          });
        },
      },
      "/api/v1/search": {
        target: "http://localhost:8083",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            if ("writeHead" in res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Search service unavailable" }));
            }
          });
        },
      },
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            if ("writeHead" in res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Product service unavailable" }));
            }
          });
        },
      },
    },
  },
  build: {
    target: "esnext"
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    deps: {
      optimizer: {
        web: {
          include: ["solid-js"]
        }
      }
    }
  }
});
