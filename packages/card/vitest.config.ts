/// <reference types="vitest" />
import { defineConfig } from "vite";
import UnpluginTypia from "@ryoppippi/unplugin-typia/vite";

export default defineConfig({
  plugins: [UnpluginTypia()],
});
