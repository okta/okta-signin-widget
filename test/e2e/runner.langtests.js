const path = require('path');
const spawn = require('cross-spawn-with-kill');
const waitOn = require('wait-on');
require('@okta/env').config();

let langConfig = null;
try {
  langConfig = require('../../src/config/config.json');
}
finally {
  if (!langConfig) {
    console.error('No language config found. Run `yarn build:release` then retry tests');
    process.exit(1);
  }
}

const startHarnessApp = (bundle) => {
  return new Promise((resolve) => {
    // start the dev server
    console.log('Launching harness app...');
    const server = spawn('yarn', [
      'workspace', '@okta/test.app', 'start'
    ], {
      stdio: 'inherit',
      env: Object.assign({}, process.env, {
        'DIST_ESM': bundle === 'npm' ? '1' : ''
      })
    });

    return waitOn({
      resources: [
        'http-get://localhost:3000'
      ]
    }).then(() => {
      resolve(server);
    });
  });
};

const getTask = ({ lang }) => {
  const fn = function() {
    return new Promise(resolve => {
      waitOn({
        resources: [
          'http-get://localhost:3000'
        ]
      }).then(() => {
        // 2. run webdriver based on if sauce is needed or not
        let wdioConfig = path.resolve(__dirname, 'wdio.conf.js');
        if (process.env.RUN_FEATURE_TESTS) {
          wdioConfig = path.resolve(__dirname, 'cucumber.wdio.conf.ts');  
        }
        if (process.env.RUN_SAUCE_TESTS) {
          wdioConfig = path.resolve(__dirname, 'sauce.wdio.conf.js');
        }
        const runner = spawn(
          'npx', [
            'wdio',
            'run',
            wdioConfig
          ],
          { stdio: 'inherit', env: { ...process.env, 'TEST_LANG': lang } }
        );

        let returnCode = 1;
        runner.on('exit', function(code) {
          console.log('Test runner exited with code: ' + code);
          returnCode = code;
          resolve(returnCode);
        });
      });
    });
  };
  fn.lang = lang;
  return fn;
};

// track process returnCode for each task
const codes = [];

const tasks = langConfig.supportedLanguages.reduce((tasks, lang) => {
  if (lang === 'en') {
    // no reason to test english, it's already tested everywhere else
    return tasks;
  }
  return [...tasks, getTask({ lang })];
}, []);

// test special cases (Dutch, Portuguese)
tasks.push(getTask({ lang: 'nl' }));
tasks.push(getTask({ lang: 'pt' }));

function runNextTask() {
  if (tasks.length === 0) {
    console.log('all runs are complete');
    return;
  }
  const task = tasks.shift();
  console.log(`Running next task: ${task.lang}`);
  return task().then((code) => {
    codes.push(code);
    return runNextTask();
  });
}

let npmServer = null, cdnServer = null;
async function runLangTests() {
  /* eslint-disable no-unused-vars */
  const testList = [...tasks];
  /* eslint-enable no-unused-vars */

  // run all lang tests against npm bundle
  try {
    npmServer = await startHarnessApp('npm');
    await runNextTask();
  }
  finally {
    // dev server must die
    if (npmServer) {
      npmServer.kill();
      npmServer = null;
    }
  }

  // For now, running tests against 1 bundle type is sufficient
  // testList.map(task => tasks.push(task));
  // try {
  //   cdnServer = await startHarnessApp('cdn');
  //   await runNextTask();
  // }
  // finally {
  //   // dev server must die
  //   if (cdnServer) {
  //     cdnServer.kill();
  //     cdnServer = null;
  //   }
  // }

  if (!codes.length || codes.reduce((acc, curr) => acc + curr, 0) !== 0) {
    // exit with error status if no finished task or any test fails
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}

process.on('exit', () => {
  // don't leave dev servers running
  if (npmServer) { npmServer.kill(); }
  if (cdnServer) { cdnServer.kill(); }
});

runLangTests().catch(console.error);
