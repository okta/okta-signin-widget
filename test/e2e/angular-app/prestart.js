const path = require('path');
const fs = require('fs-extra');

const target = path.join(__dirname, 'src/environments/environment.ts');
fs.ensureFileSync(target);
fs.writeFileSync(target, `

export const environment = {
  production: true,
  WIDGET_TEST_SERVER: '${process.env.WIDGET_TEST_SERVER}',
  ANGULAR_HOST: '${process.env.ANGULAR_HOST}',
  ANGULAR_PORT: '${process.env.ANGULAR_PORT}',
  AUTH_SERVER_PATH: '${process.env.AUTH_SERVER_PATH}',
  CLIENT_ID: '${process.env.CLIENT_ID}',
};

`);
