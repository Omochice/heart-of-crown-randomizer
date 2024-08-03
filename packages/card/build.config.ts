import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    {
      builder: "mkdist",
      input: "./src",
      outDir: "./dist",
    },
  ],
  outDir: "build",
  declaration: true,
});
