// manages vite and mock server configs
module.exports = {
  vite: {
    server: {
      middlewareMode: true,
      port: 3000
    },
  },
  mockServer: {
    port: 3030,
  }
};
