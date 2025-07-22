import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import lingoCompiler from "lingo.dev/compiler";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

// Temporarily disabled Lingo.dev to stop AST key injection
// export default defineConfig(() =>
//   lingoCompiler.vite({
//     sourceRoot: "src",
//     sourceLocale: "en",
//     targetLocales: ["sv"],
//     models: "lingo.dev",
//   })({
//     plugins: [react()],
//     optimizeDeps: {
//       exclude: ['lucide-react'],
//     },
//   })
// );
