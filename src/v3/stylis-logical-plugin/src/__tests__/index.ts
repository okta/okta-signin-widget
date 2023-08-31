import { setupSerializer } from '../testUtils';
import { ensmallen } from '../utils';

// TODO handle writing-mode, direction, text-orientation
describe('compile, transform, and serialize', () => {
  const processor = setupSerializer();

  it('handles comments', () => {
    const css = `
      /* comment */
    `;

    expect(processor(css)).toBe(ensmallen(css));
  });

  it('handles ruleset without logical declaration', () => {
    const css = `
      .a {
        color: red;
      }
    `;

    expect(processor(css)).toBe(ensmallen(css));
  });

  it('handles ruleset with simple logical declaration', () => {
    const css = `
      .a {
        margin-inline-end: 5px;
      }
    `;

    expect(processor(css)).toBe(ensmallen(`
      .a {
        margin-right: 5px;
      }
      [dir="rtl"] .a {
        margin-left: 5px;
      }
    `));
  });

  it('handles ruleset with some declarations that do not need transform', () => {
    const css = `
      .a {
        color: red;
        margin-inline-end: 5px;
      }
    `;

    expect(processor(css)).toBe(ensmallen(`
      .a {
        color: red;
        margin-right: 5px;
      }
      [dir="rtl"] .a {
        margin-left: 5px;
      }
    `));
  });

  it('handles ruleset with multiple rules', () => {
    const css = `
      .a, .b {
        margin-inline-end: 5px;
      }
    `;

    expect(processor(css)).toBe(ensmallen(`
      .a, .b {
        margin-right: 5px;
      }
      [dir="rtl"] .a, [dir="rtl"] .b {
        margin-left: 5px;
      }
    `));
  });

  describe('handles ruleset with logical inline declaration with shorthand', () => {
    it('with one value', () => {
      const css = `
        .a {
          margin-inline: 5px;
        }
      `;

      expect(processor(css)).toBe(ensmallen(`
        .a {
          margin-right: 5px;
          margin-left: 5px;
        }
      `));
    });

    it('with two values', () => {
      const css = `
        .a {
          margin-inline: 5px 10px;
        }
      `;

      expect(processor(css)).toBe(ensmallen(`
        .a {
          margin-right: 10px;
          margin-left: 5px;
        }
        [dir="rtl"] .a {
          margin-right: 5px;
          margin-left: 10px;
        }
      `));
    });
  });
  describe('handles ruleset with logical property', () => {
    it('with property that maps to one property', () => {
      const css = `
        .a {
          block-size: 5px;
        }
      `;

      expect(processor(css)).toBe(ensmallen(`
        .a {
          height: 5px;
        }
      `));
    })

    it('with property that maps to two properties', () => {
      const css = `
        .a {
          margin-block: 5px;
          inset-block: 5px 10px;
        }
      `;

      expect(processor(css)).toBe(ensmallen(`
        .a {
          margin-top: 5px;
          top: 5px 10px;
          margin-bottom: 5px;
          bottom: 5px 10px;
        }
      `));
    })
  });
  describe('handles ruleset with logical directional values', () => {
    it('with value that does not need transform', () => {
      const css = `
        .a {
          clear: both;
        }
      `;

      expect(processor(css)).toBe(ensmallen(`
        .a {
          clear: both;
        }
      `));
    })

    it('with value that needs transform', () => {
      const css = `
        .a {
          clear: inline-start;
        }
      `;

      expect(processor(css)).toBe(ensmallen(`
        .a {
          clear: left;
        }
        [dir="rtl"] .a {
          clear: right;
        }
      `));
    })
  });
});