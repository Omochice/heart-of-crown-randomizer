import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/basic/index.ts",
    "src/basic/basic.ts",
    "src/basic/common.ts",
    "src/basic/princess.ts",
    "src/basic/rare.ts",
    "src/far-eastern-border/index.ts",
    "src/far-eastern-border/common.ts",
    "src/far-eastern-border/princess.ts",
    "src/type.ts",
  ],
  format: ["esm"],
  outDir: "dist",
  dts: true,
  clean: true,
});
