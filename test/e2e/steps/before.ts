import { Before, BeforeAll } from '@cucumber/cucumber';
import ActionContext from '../support/context';
import { saveScreenshot } from '../support/screenshots';
import type { Capabilities } from '@wdio/types';

// Add support for screenshots
let scenarioCounter = 0;
BeforeAll(function() {
  ++scenarioCounter;
});

Before(async function(this: ActionContext, scenario) {
  this.scenario = scenario;
  const scenarioNum = scenarioCounter;
  let screenshotCounter = 0;
  this.saveScreenshot = async function(this: ActionContext, fileName: string | undefined) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const scenario = this.scenario!;
    const browserName = (browser.requestedCapabilities as Capabilities.Capabilities)?.browserName ?? 'unknown';
    const feature = scenario.gherkinDocument.feature?.name;
    const step = scenario.pickle.name;
    fileName = `${browserName}-${feature}-${scenarioNum}-${++screenshotCounter}-${step}-${fileName}`;
    try {
      await saveScreenshot(fileName);
    } catch (e) {
      console.error(`Failed to save screenshot ${fileName}: ${e}`);
    }
  }
});
