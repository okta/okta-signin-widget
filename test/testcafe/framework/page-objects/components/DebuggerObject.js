import { Selector } from 'testcafe';

export default class DebuggerObject {

  constructor(t) {
    this.t = t;
    this.button = new Selector('.siw-debugger-button');
    this.container = new Selector('.siw-debugger-root-container');
  }

  getButtonLabel() {
    return this.button.textContent;
  }

  buttonExists() {
    return this.button.exists;
  }

  containerExists() {
    return this.container.exists;
  }

  containerVisible() {
    return this.container.visible;
  }

  async click() {
    return this.t.click(this.button);
  }

  getList() {
    return this.container.find('.siw-debugger-list');
  }

  getItems() {
    return this.getList().find('.siw-debugger-list-item');
  }

  getItemsByType(type = '') {
    if (!type) {
      return this.getItems();
    }
    return this.getList().find(`.siw-debugger-list-item-${type}`);
  }

  getItemType(item) {
    return item.find('.siw-debugger-list-item-type').innerText;
  }

  isFetchItem(item) {
    return item.hasClass('siw-debugger-list-item-xhr');
  }

  getItemTitle(item) {
    return item.find('.siw-debugger-list-item-title').innerText;
  }

  getItemHeader(item) {
    return item.find('.siw-debugger-list-item-header').innerText;
  }

  getItemDetails(item) {
    return item.find('.siw-debugger-list-item-details');
  }

  async getItemsContent(type = '') {
    const data = [];
    const items = await this.getItemsByType(type);
    const count = await items.count;
    for (let i = 0 ; i < count ; i++) {
      const item = await items.nth(i);
      const type = (await this.getItemType(item)).toLowerCase();
      const isFetch = await this.isFetchItem(item);
      const title = isFetch ? await this.getItemTitle(item) : await this.getItemHeader(item);
      const contentEls = await this.getItemDetails(item);
      const contents = [];
      const contentCount = await contentEls.count;
      for (let j = 0 ; j < contentCount ; j++) {
        const content = await contentEls.nth(j);
        contents.push(await content.innerText);
      }
      data.push({
        isFetch,
        type,
        title,
        contents
      });
    }
    return data;
  }

}
