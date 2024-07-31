const apis = [
  {
    proxy: false,
    path: '/auth/services/devicefingerprint',
    method: 'GET',
    template() {
      // In a real case, `/auth/services/devicefingerprint` is loaded within an
      // invisible iframe and generates a unique identifier for New Device Notifications
      return `
        <html>
          <script nonce="playground">
            const message = JSON.stringify({
              type: 'FingerprintAvailable',
              fingerprint: 'mock-device-fingerprint',
            });
            window.parent.postMessage(message, window.location.href);
          </script>
        </html>
      `;
    },
    render(req, res) {
      // Manually override the CSP for device-fingerprinting mocking
      // This should never be performed in a production app
      res.header('Content-Security-Policy', 'script-src \'unsafe-inline\'');
      res.send(res.body);
    }
  },
];

module.exports = apis;
