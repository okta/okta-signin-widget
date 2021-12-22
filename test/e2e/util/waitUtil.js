export const waitForLoad = async (element) => {
  await browser.waitUntil(async () => element.then(el => el.isDisplayed()), 5000, 'wait for element to load');
};
