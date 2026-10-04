import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "path";
import checker from "vite-plugin-checker";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // `yarn build-watch` uses this mode: skip type declarations (vue-tsc --watch
  // emits those alongside it, see tsconfig.watch.json) and linting,
  // and only build the ES module, so rebuilds are as fast as possible
  const watch = mode === "watch";
  return {
    define: {
      "process.env.ES_BUILD": "true",
      "process.env": JSON.stringify(env),
    },
    plugins: [
      vue(),
      !watch && dts({
        insertTypesEntry: true,
        include: ["src/**/*.ts", "src/**/*.vue"],
        exclude: [
          ".storybook/**/*",
          "src/stories/**"
        ],
      }),
      viteStaticCopy({
        targets: [{ src: "src/assets/*", dest: "assets" }],
      }),
      !watch && checker({
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        }
      }),
    ],
    build: {
      lib: {
        entry: resolve(import.meta.dirname, "src/index.ts"),
        name: "VueToolkit",
        fileName: (format) => `vue-toolkit.${format}.js`,
        formats: watch ? ["es"] : ["es", "cjs", "umd"],
      },
      rollupOptions: {
        external: [
          "vue", 
          "pinia", 
          "@wwtelescope/engine",
          "@wwtelescope/engine-pinia",
          // /^vuetify(\/.*)?$/,
          /\.stories\.(ts|tsx|js|jsx)$/,
          /\.storybook\//
        ],
        output: {
          globals: {
            vue: "Vue",
            pinia: "pinia",
            "@wwtelescope/engine": "wwtlib",
          },
        },
      },
      sourcemap: "inline",
      // keep the cjs/umd bundles and type declarations from the last full build
      emptyOutDir: !watch,
    },
  };
});
