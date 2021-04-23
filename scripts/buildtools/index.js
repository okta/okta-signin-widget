#!/usr/bin/env node
const commands = './commands';

/* eslint-disable no-unused-expressions */
require('yargs')
  .usage('Usage: $0 <command> [options]')
  .demandCommand(1)
  .commandDir(commands)
  .help()
  .argv;
