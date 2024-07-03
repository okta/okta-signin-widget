export const waitForLoad = async (element) => {
  const $element = await element;
  await $element.waitForDisplayed({ timeout: 10_000 });
};

export const waitForText = async (element, expectedText) => {
  await browser.waitUntil(async () => {
    const $element = await element;
    return (await $element.isDisplayed()) && (await $element.getText()) === expectedText;
  }, 10_000, `wait for element to load and have text: ${expectedText}`);
};
