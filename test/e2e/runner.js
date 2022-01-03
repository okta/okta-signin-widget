const path = require('path');
const spawn = require('cross-spawn-with-kill');
const waitOn = require('wait-on');
require('./env').config();

const getTask = () => () => {
  return new Promise(resolve => {
    // start the dev server
    const server = spawn('yarn', [
      'start:test:app'
    ], { stdio: 'inherit' });

    waitOn({
      resources: [
        'http-get://localhost:3000'
      ]
    }).then(() => {
      // 2. run webdriver based on if sauce is needed or not
      let wdioConfig = path.resolve(__dirname, 'wdio.conf.ts');
      if (process.env.RUN_SAUCE_TESTS) {
        wdioConfig = path.resolve(__dirname, 'sauce.wdio.conf.js');
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

// track process returnCode for each task
const codes = [];

const tasks = [
  // {
  //   bundle: 'npm',
  // },
  {
    bundle: 'cdn'
  }
]
  .reduce((tasks, config) => {
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
  task().then((code) => {
    codes.push(code);
    runNextTask();
  });
}
  

runNextTask();


