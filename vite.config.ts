import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'fs';
import path, { join } from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const localNetwork = 'local';
const network = process.env['DFX_NETWORK'] || localNetwork;

let canisterIdPath: string;
if (network === localNetwork) {
  // Local replica canister IDs
  canisterIdPath = join(__dirname, '.dfx/local/canister_ids.json');
} else {
  // Custom canister IDs
  canisterIdPath = join(__dirname, 'canister_ids.json');
}

if (!existsSync(canisterIdPath)) {
  throw new Error(
    'Unable to find canisters. Running `dfx deploy` should fix this problem.',
  );
}
const canisterIds = JSON.parse(readFileSync(canisterIdPath, 'utf8'));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, './src/frontend/assets/.ic-assets.json5'),
          dest: './',
        },
      ],
    }),
  ],
  define: {
    global: 'window',
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK),
    // Expose canister IDs provided by `dfx deploy`
    ...Object.fromEntries(
      Object.entries(canisterIds).map(([name, ids]) => [
        `process.env.CANISTER_ID_${name.toUpperCase()}`,
        JSON.stringify(ids[network] || ids[localNetwork]),
      ]),
    ),
  },
  server: {
    // Local IC replica proxy
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
      },
    },
  },
});
