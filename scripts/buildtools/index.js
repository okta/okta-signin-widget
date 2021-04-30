#!/usr/bin/env node
const commands = './commands';

/* eslint-disable no-unused-expressions */
require('yargs')
/* eslint-disable-next-line @okta/okta/no-unlocalized-text-in-templates */
  .usage('Usage: $0 <command> [options]')
  .demandCommand(1)
  .commandDir(commands)
  .help()
  .argv;
