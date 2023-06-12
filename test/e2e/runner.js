const path = require('path');
const spawn = require('cross-spawn-with-kill');
const waitOn = require('wait-on');
require('@okta/env').config();

const IS_RELEASE_BRANCH = process.env.BRANCH && (/master|release|\d+\.\d+\.\d+|\d+\.\d+-\w+|\d+\.\d+/).test(process.env.BRANCH);

const getTask = ({ bundle }) => {
  const fn = function() {
    return new Promise(resolve => {
      // start the dev server
      const server = spawn('yarn', [
        'workspace', '@okta/test.app', 'start'
      ], {
        stdio: 'inherit',
        env: Object.assign({}, process.env, {
          'DIST_ESM': bundle === 'npm' ? '1' : ''
        })
      });

      waitOn({
        resources: [
          'http-get://localhost:3000'
        ]
      }).then(() => {
        // 2. run webdriver based on if sauce is needed or not
        let wdioConfig;
        if (process.env.RUN_FEATURE_TESTS) {
          console.log('RUN_FEATURE_TESTS is true, using configuration: cucumber.wdio.conf.ts');
          wdioConfig = path.resolve(__dirname, 'cucumber.wdio.conf.ts');  
        } else if (process.env.RUN_SAUCE_TESTS) {
          console.log('RUN_SAUCE_TESTS is true, using configuration: sauce.wdio.conf.ts');
          wdioConfig = path.resolve(__dirname, 'sauce.wdio.conf.ts');
        } else {
          console.log('Using default wdio configuration: wdio.conf.js');
          wdioConfig = path.resolve(__dirname, 'wdio.conf.js');
        }

        const runner = spawn(
          'npx', [
            'wdio',
            'run',
            wdioConfig
          ],
          { stdio: 'inherit' }
        );

        let returnCode = 1;
        runner.on('exit', function(code) {
          console.log('Test runner exited with code: ' + code);
          returnCode = code;
          server.kill();
        });
        runner.on('error', function(err) {
          server.kill();
          throw err;
        });
        server.on('exit', function(code) {
          console.log('Server exited with code: ' + code);
          resolve(returnCode);
        });
      });
    });
  };
  fn.description = `E2E specs against test app using bundle: ${bundle}`;
  return fn;
};

// track process returnCode for each task
const codes = [];

let bundles = [{ bundle: 'cdn' }];

// eslint-disable-next-line eqeqeq
if (process.env.CDN_ONLY != 1) {
  bundles.unshift({ bundle: 'npm' });
}

const tasks = bundles.reduce((tasks, config) => {
  const task = getTask(config);
  tasks.push(task);
  return tasks;
}, []);

function runNextTask() {
  if (tasks.length === 0) {
    console.log('all runs are complete');
    if (!codes.length || codes.reduce((acc, curr) => acc + curr, 0) !== 0) {
      // exit with error status if no finished task or any test fails
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
    return;
  }
  const task = tasks.shift();
  console.log(`Running next task: ${task.description}`);
  task().then((code) => {
    if (IS_RELEASE_BRANCH) {
      console.log('###\nRELEASE BRANCH DETECTED, EXITTING EARLY DUE TO FAILURE\n###');
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }

    codes.push(code);
    runNextTask();
  });
}
  

runNextTask();


