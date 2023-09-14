import type { DeclarationElement } from 'stylis';
import { append, copy } from 'stylis';

import { LTR_ATTR_SELECTOR, RTL_ATTR_SELECTOR } from '../constants';

export type Transformer = (element: DeclarationElement) => void;

function getKeysFromValue(value: string): string[] {
  return value.trim().split(/\s+/);
}

function getInlineValue(value: string): {
  baseValue: string;
} | {
  startValue: string;
  endValue: string;
} {
  const keys = getKeysFromValue(value);

  if (keys.length === 1) {
    return {
      baseValue: keys[0],
    };
  }

  return {
    startValue: keys[0],
    endValue: keys[1],
  };
}

export function transformLogicalProperty({
  properties,
}: {
  properties: string[];
}): Transformer {
  return (element: DeclarationElement) => {
    const { root } = element;

    if (root?.type !== 'rule') {
      return;
    }

    const [firstProperty, ...otherProperties] = properties;

    Object.assign(element, {
      value: `${firstProperty}:${element.children};`,
      props: [firstProperty],
    });

    otherProperties.forEach((property: string) => {
      append(copy(element, {
        value: `${property}:${element.children};`,
        props: property,
      }), root.children);
    });
  };
}

export function transformLogicalInlineProperty({
  ltrFallbackStyle,
  rtlFallbackStyle,
}: {
  ltrFallbackStyle: string;
  rtlFallbackStyle: string;
}): Transformer {
  return (element: DeclarationElement) => {
    if (!element.root) {
      return;
    }

    if (element.root.return === RTL_ATTR_SELECTOR) {
      Object.assign(element, {
        value: `${rtlFallbackStyle}:${element.children};`,
        props: [rtlFallbackStyle],
      });
    } else if (element.root.return === LTR_ATTR_SELECTOR) {
      Object.assign(element, {
        value: `${ltrFallbackStyle}:${element.children};`,
        props: [ltrFallbackStyle],
      });
    }
  };
}

export function transformLogicalInlinePropertyWithShorthand({
  ltrStartProperty,
  ltrEndProperty,
}: {
  ltrStartProperty: string;
  ltrEndProperty: string;
}): Transformer {
  return (element: DeclarationElement) => {
    const { root } = element;

    if (root?.type !== 'rule') {
      return;
    }

    const values = getInlineValue(element.children);

    if ('baseValue' in values) {
      // assign only to the default element
      Object.assign(element, {
        value: `${ltrEndProperty}:${values.baseValue};`,
        props: [ltrEndProperty],
      });
      append(copy(element, {
        value: `${ltrStartProperty}:${values.baseValue};`,
        props: ltrStartProperty,
      }), root.children);
    } else if (root.return === RTL_ATTR_SELECTOR) {
      Object.assign(element, {
        value: `${ltrEndProperty}:${values.startValue};`,
        props: [ltrEndProperty],
      });

      append(copy(element, {
        value: `${ltrStartProperty}:${values.endValue};`,
        props: ltrStartProperty,
      }), root.children);
    } else if (root.return === LTR_ATTR_SELECTOR) {
      Object.assign(element, {
        value: `${ltrEndProperty}:${values.endValue};`,
        props: [ltrEndProperty],
      });

      append(copy(element, {
        value: `${ltrStartProperty}:${values.startValue};`,
        props: ltrStartProperty,
      }), root.children);
    }
  };
}

export function transformPropertyWithLogicalDirectionalValues({
  property,
  inlineStartValue,
  inlineEndValue,
}: {
  property: string;
  inlineStartValue: string;
  inlineEndValue: string;
}): Transformer {
  return (element: DeclarationElement) => {
    const { root } = element;

    if (root?.type !== 'rule') {
      return;
    }

    const value = element.children;

    if (value === inlineStartValue) {
      if (root.return === RTL_ATTR_SELECTOR) {
        Object.assign(element, {
          value: `${property}:right;`,
          props: [property],
        });
      } else if (root.return === LTR_ATTR_SELECTOR) {
        Object.assign(element, {
          value: `${property}:left;`,
          props: [property],
        });
      }
    } else if (value === inlineEndValue) {
      if (root.return === RTL_ATTR_SELECTOR) {
        Object.assign(element, {
          value: `${property}:left;`,
          props: [property],
        });
      } else if (root.return === LTR_ATTR_SELECTOR) {
        Object.assign(element, {
          value: `${property}:right;`,
          props: [property],
        });
      }
    }
  };
}
