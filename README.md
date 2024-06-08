# rollup-plugin-woocommerce-dependency-extraction

## Installation

Install the plugin

```bash
bun install rollup-plugin-woocommerce-dependency-extraction --save-dev
```

## Vite

```ts
export default defineConfig(({ mode }) => {
    return {
        plugins: [
            react(),
            wcDependencyExtraction(mode === 'development'),
        ],
        build: {
            manifest: true,
            rollupOptions: {
                output: {
                    format: 'iife',
                },
            },
        },
        esbuild: {
            minifyIdentifiers: false,
        },
        optimizeDeps: {
            exclude: [...wcOptimizeDepsExclude],
        },
    }
})
```