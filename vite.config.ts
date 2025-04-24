import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import { exec } from "child_process";

// https://vitejs.dev/config/

export default ({ mode }: { mode: string }) => {
  // Load app-level env vars to node-level env vars.
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    // To access env vars here use process.env.TEST_VAR
    server: {
      proxy: {
        "/static": `${process.env.VITE_API_SCHEME}://${process.env.VITE_API_HOST}:${process.env.VITE_API_PORT}`,
      },
    },
    build: {
      outDir: "frontend-dist",
    },
    plugins: [
      react(),
      {
        name: "post-build-copy",
        closeBundle() {
          const targetFolder = "claude/static";
          exec(
            `rm ${targetFolder}/assets/*.js ; cp -r frontend-dist/ ${targetFolder}`,
            (err, stdout, stderr) => {
              if (err) {
                console.error("Error copying files:", stderr);
              } else {
                console.log("Files copied successfully:", stdout);
              }
            }
          );
        },
      },
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "frontend"),
      },
    },
  });
};
