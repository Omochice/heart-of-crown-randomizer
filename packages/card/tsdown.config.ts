import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/type.ts",
    "src/basic/*.ts",
    "src/far-eastern-border/*.ts",
  ],
  format: ["esm"],
  outDir: "dist",
  dts: true,
  clean: true,
});
