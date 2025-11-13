import { minify, setupSerializer } from '../testUtils';

describe('compile, transform, and serialize', () => {
  const processor = setupSerializer();

  it('handles comments', () => {
    const css = `
      /* comment */
    `;

    expect(processor(css)).toBe(minify(css));
  });

  it('handles ruleset without logical declaration', () => {
    const css = `
      .a {
        color: red;
      }
    `;

    expect(processor(css)).toBe(minify(`
      .a {
        color: red;
      }
    `));
  });

  it('handles ruleset with simple logical declaration', () => {
    const css = `
      .a {
        margin-inline-end: 5px;
      }
    `;

    expect(processor(css)).toBe(minify(`
      html:not([dir="rtl"]) .a {
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

    expect(processor(css)).toBe(minify(`
      html:not([dir="rtl"]) .a {
        margin-right: 5px;
      }
      [dir="rtl"] .a {
        margin-left: 5px;
      }
      .a {
        color: red;
      }
    `));
  });

  it('handles ruleset with multiple rules', () => {
    const css = `
      .a, .b {
        margin-inline-end: 5px;
      }
    `;

    expect(processor(css)).toBe(minify(`
      html:not([dir="rtl"]) .a, html:not([dir="rtl"]) .b {
        margin-right: 5px;
      }
      [dir="rtl"] .a, [dir="rtl"] .b {
        margin-left: 5px;
      }
    `));
  });

  it('handles ruleset with mixture of declarations', () => {
    const css = `
      .a {
        color: red;
        padding-inline-end: 5px;
        padding-block-end: 5px;
      }
    `;

    expect(processor(css)).toBe(minify(`
      html:not([dir="rtl"]) .a {
        padding-right: 5px;
        padding-bottom: 5px;
      }
      [dir="rtl"] .a {
        padding-left: 5px;
        padding-bottom: 5px;
      }
      .a {
        color: red;
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

      expect(processor(css)).toBe(minify(`
        html:not([dir="rtl"]) .a {
          margin-right: 5px;
          margin-left: 5px;
        }
        [dir="rtl"] .a {
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

      expect(processor(css)).toBe(minify(`
        html:not([dir="rtl"]) .a {
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

      expect(processor(css)).toBe(minify(`
        html:not([dir="rtl"]) .a {
          height: 5px;
        }
        [dir="rtl"] .a {
          height: 5px;
        }
      `));
    });

    it('with property that maps to two properties', () => {
      const css = `
        .a {
          margin-block: 5px;
          inset-block: 5px 10px;
        }
      `;

      expect(processor(css)).toBe(minify(`
        html:not([dir="rtl"]) .a {
          margin-top: 5px;
          top: 5px 10px;
          margin-bottom: 5px;
          bottom: 5px 10px;
        }
        [dir="rtl"] .a {
          margin-top: 5px;
          top: 5px 10px;
          margin-bottom: 5px;
          bottom: 5px 10px;
        }
      `));
    });
  });

  describe('handles ruleset with logical directional values', () => {
    it('with value that does not need transform', () => {
      const css = `
        .a {
          clear: both;
        }
      `;

      expect(processor(css)).toBe(minify(`
        .a {
          clear: both;
        }
      `));
    });

    it('with value that needs transform', () => {
      const css = `
        .a {
          clear: inline-start;
        }
      `;

      expect(processor(css)).toBe(minify(`
        html:not([dir="rtl"]) .a {
          clear: left;
        }
        [dir="rtl"] .a {
          clear: right;
        }
      `));
    });
  });

  describe('handles media query', () => {
    it('with ruleset that has logical declaration', () => {
      const css = `
        .a {
          color: red;
        }
        @media only screen and (max-width: 100px) {
          .a {
            color: white;
            margin-inline-end: 5px;
          }
        }
      `;

      expect(processor(css)).toBe(minify(`
        .a {
          color: red;
        }
        @media only screen and (max-width: 100px) {
          html:not([dir="rtl"]) .a {
            margin-right: 5px;
          }
          [dir="rtl"] .a {
            margin-left: 5px;
          }
          .a {
            color: white;
          }
        }
      `));
    });
  });

  describe('handles nesting and & shorthand', () => {
    it('with ::before and ::after psuedoclass', () => {
      const css = `
        .a {
          color: white;

          &::before, &::after {
            color: red;
          }
        }
      `;

      expect(processor(css)).toBe(minify(`
        .a {
          color: white;
        }
        .a::before, .a::after {
          color: red;
        }
      `));
    });
  });

  describe('handles keyframes', () => {
    it('does not transform rules within @keyframes', () => {
      const css = `
        @keyframes slidein {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(100%);
          }
        }
      `;

      expect(processor(css)).toBe(minify(`
        @keyframes slidein {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(100%);
          }
        }
      `));
    });
  });
});
