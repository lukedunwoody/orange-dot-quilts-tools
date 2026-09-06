import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(projectRoot, "index.html"),
                trianglePatternMaker: resolve(
                    projectRoot,
                    "triangle-pattern-maker/index.html"
                ),
            },
        },
    },
});
