import { Before } from '@cucumber/cucumber';
import ActionContext from '../support/context';
import { saveScreenshot } from '../support/screenshots';

let scenarioCounter = 0;


Before(async function(this: ActionContext, scenario) {
  this.scenario = scenario;
  scenarioCounter++;
  let screenshotCounter = 0;
  this.saveScreenshot = async function(this: ActionContext, fileName: string | undefined) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const scenario = this.scenario!;
    const feature = scenario.gherkinDocument.feature?.name;
    const step = scenario.pickle.name;
    fileName = `${scenarioCounter}-${++screenshotCounter}-${feature}-${step}-${fileName}`;
    await saveScreenshot(fileName);
  }
});