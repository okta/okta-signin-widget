import type { Transformer } from './transformHelpers';
import {
  transformLogicalInlineProperty,
  transformLogicalInlinePropertyWithShorthand,
  transformLogicalProperty,
  transformPropertyWithLogicalDirectionalValues,
} from './transformHelpers';

const transforms: Map<string, Transformer> = new Map<string, Transformer>(Object.entries({
  // Flow-Relative Values
  clear: transformPropertyWithLogicalDirectionalValues({
    property: 'clear',
    inlineStartValue: 'inline-start',
    inlineEndValue: 'inline-end',
  }),
  float: transformPropertyWithLogicalDirectionalValues({
    property: 'float',
    inlineStartValue: 'inline-start',
    inlineEndValue: 'inline-end',
  }),
  'text-align': transformPropertyWithLogicalDirectionalValues({
    property: 'text-align',
    inlineStartValue: 'start',
    inlineEndValue: 'end',
  }),

  // Logical Height and Logical Width
  'block-size': transformLogicalProperty({
    properties: ['height'],
  }),
  'max-block-size': transformLogicalProperty({
    properties: ['max-height'],
  }),
  'min-block-size': transformLogicalProperty({
    properties: ['min-height'],
  }),
  'inline-size': transformLogicalProperty({
    properties: ['width'],
  }),
  'max-inline-size': transformLogicalProperty({
    properties: ['max-width'],
  }),
  'min-inline-size': transformLogicalProperty({
    properties: ['min-width'],
  }),

  // Flow-relative Margins
  'margin-inline': transformLogicalInlinePropertyWithShorthand({
    ltrStartProperty: 'margin-left',
    ltrEndProperty: 'margin-right',
  }),
  'margin-inline-end': transformLogicalInlineProperty({
    ltrFallbackStyle: 'margin-right',
    rtlFallbackStyle: 'margin-left',
  }),
  'margin-inline-start': transformLogicalInlineProperty({
    ltrFallbackStyle: 'margin-left',
    rtlFallbackStyle: 'margin-right',
  }),
  'margin-block': transformLogicalProperty({
    properties: ['margin-top', 'margin-bottom'],
  }),
  'margin-block-end': transformLogicalProperty({
    properties: ['margin-bottom'],
  }),
  'margin-block-start': transformLogicalProperty({
    properties: ['margin-top'],
  }),

  // Flow-relative Offsets
  'inset-inline': transformLogicalInlinePropertyWithShorthand({
    ltrStartProperty: 'left',
    ltrEndProperty: 'right',
  }),
  'inset-inline-end': transformLogicalInlineProperty({
    ltrFallbackStyle: 'right',
    rtlFallbackStyle: 'left',
  }),
  'inset-inline-start': transformLogicalInlineProperty({
    ltrFallbackStyle: 'left',
    rtlFallbackStyle: 'right',
  }),
  'inset-block': transformLogicalProperty({
    properties: ['top', 'bottom'],
  }),
  'inset-block-end': transformLogicalProperty({
    properties: ['bottom'],
  }),
  'inset-block-start': transformLogicalProperty({
    properties: ['top'],
  }),

  // Flow-relative Padding
  'padding-inline': transformLogicalInlinePropertyWithShorthand({
    ltrStartProperty: 'padding-left',
    ltrEndProperty: 'padding-right',
  }),
  'padding-inline-end': transformLogicalInlineProperty({
    ltrFallbackStyle: 'padding-right',
    rtlFallbackStyle: 'padding-left',
  }),
  'padding-inline-start': transformLogicalInlineProperty({
    ltrFallbackStyle: 'padding-left',
    rtlFallbackStyle: 'padding-right',
  }),
  'padding-block': transformLogicalProperty({
    properties: ['padding-top', 'padding-bottom'],
  }),
  'padding-block-end': transformLogicalProperty({
    properties: ['padding-bottom'],
  }),
  'padding-block-start': transformLogicalProperty({
    properties: ['padding-top'],
  }),

  // Flow-relative Borders
  'border-block': transformLogicalProperty({
    properties: ['border-top', 'border-bottom'],
  }),
  'border-block-color': transformLogicalProperty({
    properties: ['border-top-color', 'border-bottom-color'],
  }),
  'border-block-style': transformLogicalProperty({
    properties: ['border-top-style', 'border-bottom-style'],
  }),
  'border-block-width': transformLogicalProperty({
    properties: ['border-top-width', 'border-bottom-width'],
  }),
  'border-block-end': transformLogicalProperty({
    properties: ['border-bottom'],
  }),
  'border-block-end-color': transformLogicalProperty({
    properties: ['border-bottom-color'],
  }),
  'border-block-end-style': transformLogicalProperty({
    properties: ['border-bottom-style'],
  }),
  'border-block-end-width': transformLogicalProperty({
    properties: ['border-bottom-width'],
  }),
  'border-block-start': transformLogicalProperty({
    properties: ['border-top'],
  }),
  'border-block-start-color': transformLogicalProperty({
    properties: ['border-top-color'],
  }),
  'border-block-start-style': transformLogicalProperty({
    properties: ['border-top-style'],
  }),
  'border-block-start-width': transformLogicalProperty({
    properties: ['border-top-width'],
  }),
  'border-inline': transformLogicalProperty({
    properties: ['border-left', 'border-right'],
  }),
  'border-inline-color': transformLogicalProperty({
    properties: ['border-left-color', 'border-right-color'],
  }),
  'border-inline-style': transformLogicalProperty({
    properties: ['border-left-style', 'border-right-style'],
  }),
  'border-inline-width': transformLogicalProperty({
    properties: ['border-left-width', 'border-right-width'],
  }),
  'border-inline-end': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-right',
    rtlFallbackStyle: 'border-left',
  }),
  'border-inline-end-color': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-right-color',
    rtlFallbackStyle: 'border-left-color',
  }),
  'border-inline-end-style': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-right-style',
    rtlFallbackStyle: 'border-left-style',
  }),
  'border-inline-end-width': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-right-width',
    rtlFallbackStyle: 'border-left-width',
  }),
  'border-inline-start': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-left',
    rtlFallbackStyle: 'border-right',
  }),
  'border-inline-start-color': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-left-color',
    rtlFallbackStyle: 'border-right-color',
  }),
  'border-inline-start-style': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-left-style',
    rtlFallbackStyle: 'border-right-style',
  }),
  'border-inline-start-width': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-left-width',
    rtlFallbackStyle: 'border-right-width',
  }),

  // Flow-relative Corner Rounding
  'border-end-end-radius': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-bottom-right-radius',
    rtlFallbackStyle: 'border-bottom-left-radius',
  }),
  'border-end-start-radius': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-bottom-left-radius',
    rtlFallbackStyle: 'border-bottom-right-radius',
  }),
  'border-start-end-radius': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-top-right-radius',
    rtlFallbackStyle: 'border-top-left-radius',
  }),
  'border-start-start-radius': transformLogicalInlineProperty({
    ltrFallbackStyle: 'border-top-left-radius',
    rtlFallbackStyle: 'border-top-right-radius',
  }),
}));

export default transforms;
