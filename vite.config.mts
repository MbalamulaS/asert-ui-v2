import { defineConfig, type UserConfig } from "vite";
import { resolve } from "path";

export default defineConfig(async (): Promise<UserConfig> => {
  const { default: angular } = await import("@analogjs/vite-plugin-angular");
  const { default: tsconfigPaths } = await import("vite-tsconfig-paths");

  return {
    plugins: [
      angular({
        tsconfig: resolve(__dirname, "tsconfig.app.json"),
        workspaceRoot: __dirname,
        inlineStylesExtension: "scss",
      }),
      tsconfigPaths(),
    ],
    root: "src",
    publicDir: "../public",
    build: {
      outDir: "../dist",
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, "src/index.html"),
      },
      target: "es2020",
    },
    server: {
      port: 4200,
      host: true,
      proxy: {
        "/api/v1": {
          target: "http://localhost:9090",
          changeOrigin: true,
          secure: false,
        },
        "/ws": {
          target: "ws://localhost:9090",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env["NODE_ENV"] || "development",
      ),
      ngDevMode: JSON.stringify(process.env["NODE_ENV"] !== "production"),
      ngJitMode: "false",
      global: "globalThis",
    },
    optimizeDeps: {
      include: [
        "zone.js",
        "@angular/core",
        "@angular/common",
        "@angular/platform-browser",
        "@angular/platform-browser-dynamic",
        "@angular/router",
        "@angular/forms",
        "@angular/material",
        "@angular/cdk",
        "@angular/compiler",
        "ngx-toastr",
        "leaflet",
        "rxjs",
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          loadPaths: ["src/styles"],
        },
      },
    },
    esbuild: {
      target: "es2020",
    },
  };
});
