import { DescriptionElement, InfoboxElement, LinkElement, TitleElement, UISchemaLayout, UISchemaLayoutType, WidgetMessage } from "src/types";
import { extractFirstWidgetMessageStr, extractFormTitle } from 'src/util';


describe('FormUtils Tests', () => {

  describe('WidgetMessage extraction tests', () => {
    it('should extract first message string from an array of widget messages', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const message: WidgetMessage = { message: TEST_MESSAGE_STR };
      const message2: WidgetMessage = { message: 'This is another message' };
      const messageStr = extractFirstWidgetMessageStr([message, message2]);

      expect(messageStr).toBe(TEST_MESSAGE_STR);
    });

    it('should extract first message string from a widget message object', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const message: WidgetMessage = { message: TEST_MESSAGE_STR };
      const messageStr = extractFirstWidgetMessageStr(message);

      expect(messageStr).toBe(TEST_MESSAGE_STR);
    });

    it('should extract first message string from a nested widget message object', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const message: WidgetMessage = {
        message: [{
          message: [{ message: TEST_MESSAGE_STR }] as WidgetMessage[],
        }] as WidgetMessage[],
      };
      const messageStr = extractFirstWidgetMessageStr(message);

      expect(messageStr).toBe(TEST_MESSAGE_STR);
    });
  });

  describe('ExtractFormTitle tests', () => {
    let uischema: UISchemaLayout;

    beforeEach(() => {
      uischema = {
        type: UISchemaLayoutType.VERTICAL,
        elements: [],
      };
    });

    it('should not return page title when no title elements exist', () => {
      const linkEle: LinkElement = {
        type: 'Link',
        options: {
          label: 'Back to signin',
          step: 'identify',
        },
      };
      uischema.elements.push(linkEle);

      const title = extractFormTitle(uischema);

      expect(title).toBeNull();
    });

    it('should extract page title when Title element exists in uischema', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const titleEle: TitleElement = {
        type: 'Title',
        options: { content: TEST_MESSAGE_STR },
      };
      uischema.elements.push(titleEle);
      
      const title = extractFormTitle(uischema);

      expect(title).toBe(TEST_MESSAGE_STR);
    });

    it('should extract page title from first Title element when multiple Title elements exists in uischema', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const titleEle: TitleElement = {
        type: 'Title',
        options: { content: TEST_MESSAGE_STR },
      };
      const titleEle2: TitleElement = {
        type: 'Title',
        options: { content: 'This is another message' },
      };
      uischema.elements.push(titleEle);
      uischema.elements.push(titleEle2);
      
      const title = extractFormTitle(uischema);

      expect(title).toBe(TEST_MESSAGE_STR);
    });

    it('should extract page title when Error Info Box exists in uischema', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const errorBoxEle: InfoboxElement = {
        type: 'InfoBox',
        options: {
          message: {
            message: TEST_MESSAGE_STR,
          },
          class: 'ERROR',
        },
      };
      uischema.elements.push(errorBoxEle);
      
      const title = extractFormTitle(uischema);

      expect(title).toBe(TEST_MESSAGE_STR);
    });

    it('should extract page title when Error Info Box exists in uischema with nested message object', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const errorBoxEle: InfoboxElement = {
        type: 'InfoBox',
        options: {
          message: {
            message: [{
              message: [{
                message: [{ message: TEST_MESSAGE_STR } as WidgetMessage] as WidgetMessage[],
              }] as WidgetMessage[],
            }, { message: 'This is another test message' }] as WidgetMessage[],
          },
          class: 'ERROR',
        },
      };
      const linkEle: LinkElement = {
        type: 'Link',
        options: {
          label: 'Back to signin',
          step: 'identify',
        },
      };
      uischema.elements.push(errorBoxEle);
      uischema.elements.push(linkEle);
      
      const title = extractFormTitle(uischema);

      expect(title).toBe(TEST_MESSAGE_STR);
    });

    it('should extract page title when only description exists in uischema', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const descrEle: DescriptionElement = {
        type: 'Description',
        options: { content: TEST_MESSAGE_STR },
      };
      const linkEle: LinkElement = {
        type: 'Link',
        options: {
          label: 'Back to signin',
          step: 'identify',
        },
      };
      uischema.elements.push(descrEle);
      uischema.elements.push(linkEle);
      
      const title = extractFormTitle(uischema);

      expect(title).toBe(TEST_MESSAGE_STR);
    });
  });
});
