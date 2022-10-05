import { Before, BeforeAll } from '@cucumber/cucumber';
import ActionContext from '../support/context';
import { saveScreenshot } from '../support/screenshots';

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
    const feature = scenario.gherkinDocument.feature?.name;
    const step = scenario.pickle.name;
    fileName = `${feature}-${scenarioNum}-${++screenshotCounter}-${step}-${fileName}`;
    await saveScreenshot(fileName);
  }
});
