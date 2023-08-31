import { copy, append } from 'stylis';

import transforms from './utils/transforms';

import type { Middleware, RulesetElement } from 'stylis';

type MiddlewareParams = Parameters<Middleware>;

export const LTR_ATTR_SELECTOR = '[dir="ltr"]';
export const RTL_ATTR_SELECTOR = '[dir="rtl"]';

function hasAnyLogicalDeclarations(element: RulesetElement) {
  return element.children.some(e => {
    if (e.type === 'decl') {
      return transforms.has(e.props);
    }
    return false;
  });
}

/**
 * This stylis plugin transforms CSS logical properties to their equivalent physical ones. In some
 * cases, this means generating a second set of rules for the RTL (right-to-left) attribute selector.
 * 
 * @param element
 * @param index
 * @param children
 * @param callback
 */
const stylisLogicalPlugin: Middleware = function(
  element: MiddlewareParams[0],
  index: MiddlewareParams[1],
  children: MiddlewareParams[2],
  callback: MiddlewareParams[3],
): string | void {
  // the plugin function is called once for each element in the syntax tree
  switch (element.type) {
    // inspect RULE type
    // if a rule element has any chld declarations that are subject to transform
    // from logical to physical, we create a matching RTL element and add it
    // to the list of elements to be processed.
    case ('rule'):
      // check if this already has rtl/ltr return sentinel value,
      // if so, skip because we created it earlier
      if ([LTR_ATTR_SELECTOR, RTL_ATTR_SELECTOR].includes(element.return)) {
        return;
      }

      // skip if no logical declarations
      if (!hasAnyLogicalDeclarations(element)) {
        return;
      }

      // make a copy of element, mark as [dir="rtl"], push to children
      const rtlElement = copy(element, {
        // need to spread this in because `copy` doesn't deeply copy the array
        props: [...element.props],
        // set sentinel value on `return` to be used later
        return: RTL_ATTR_SELECTOR,
      });

      // also do deep copy of the children so we have new references
      rtlElement.children = element.children.filter(e => {
        // do not copy elements that are not going to get a transform applied
        return e.type === 'decl' && transforms.has(e.props);
      }).map(e => {
        // point the `root` and `parent` references at the new rtl element
        return copy(e, {
          root: rtlElement,
          parent: rtlElement,
        });
      });

      // TODO this isn't right
      // apply [dir="rtl"] to all rules in this ruleset
      rtlElement.props = rtlElement.props.map(prop => `${RTL_ATTR_SELECTOR} ${prop}`);

      // add to the list of elements for processing
      append(rtlElement, children);

      // TODO might still need to add dir=ltr!
      // e.g. marginInlineEnd 5px the rtl one and ltr ones are mutually exclusive results
      // set sentinel value on `return` to be used later
      element.return = LTR_ATTR_SELECTOR;

      break;

    // inspect DECLARATION type
    // if the element is a declaration, transform the declaration depending on the logical property.
    // this can result in adding more declaration elements to the syntax tree.
    case ('decl'):
      const property = element.props;

      if (transforms.has(property)) {
        // clear sentinel value out
        element.return = '';

        // transform declaration
        transforms.get(property)?.(element);
      }

      break;
  }
};

Object.defineProperty(stylisLogicalPlugin, 'name', { value: 'stylisLogicalPlugin' });

export default stylisLogicalPlugin;
