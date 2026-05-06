import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Vitest config will support audit-engine tests and future component tests.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
