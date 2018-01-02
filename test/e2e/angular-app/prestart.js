const path = require('path');
const fs = require('fs-extra');

const target = path.join(__dirname, 'src/environments/environment.ts');
fs.ensureFileSync(target);
fs.writeFileSync(target, `

export const environment = {
  production: true,
  WIDGET_TEST_SERVER: '${process.env.WIDGET_TEST_SERVER}',
};

`);
