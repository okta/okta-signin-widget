import { resolve } from 'path';
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

const mockServerBaseUrl = 'http://localhost:3030';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'ie 11'],
    }),
  ],
  publicDir: resolve(__dirname, '..', 'dist/dist'),
  resolve: {
    alias: {
    }
  },
  server: {
    host: 'localhost',
    proxy: {
      '/oauth2/': mockServerBaseUrl,
      '/api/v1/': mockServerBaseUrl,
      '/idp/idx/': mockServerBaseUrl,
      '/login/getimage': mockServerBaseUrl,
      '/sso/idps/': mockServerBaseUrl,
      '/app/UserHome': mockServerBaseUrl,
      '/oauth2/v1/authorize': mockServerBaseUrl,
      '/auth/services/': mockServerBaseUrl,
      '/.well-known/webfinger': mockServerBaseUrl,
    },
    port: 3000,
  },
});