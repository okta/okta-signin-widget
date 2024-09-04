module.exports = async () => {
  // Timezone had to be hardcoded here in Jest's globalSetup configuration because the device's
  // timezone was being cached before the setupFiles configuration occurred
  process.env.TZ = 'UTC';
};