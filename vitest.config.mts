import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: false,
    environment: "jsdom",
    include: ["**/*.test.(ts|tsx)"],
    globals: true,
  },
});
