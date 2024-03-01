import { defineConfig } from "vite";
import ts from "typescript";
import path from "path";
import dts from "vite-plugin-dts";

const getCompileTargets = (): string[] => {
  const tsconfigPath = "./tsconfig.json";
  const tsconfig = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const projectDir = path.dirname(tsconfigPath);
  const compliperOptions = ts.parseJsonConfigFileContent(
    tsconfig.config,
    ts.sys,
    projectDir,
  );
  return compliperOptions.fileNames;
};

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: getCompileTargets(),
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
      external: ["unknownutil"],
    },
  },
  plugins: [dts()],
});
