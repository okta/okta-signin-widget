import type { Middleware, RulesetElement } from 'stylis';
import { append, copy } from 'stylis';

import { LTR_ATTR_SELECTOR, RTL_ATTR_SELECTOR } from './constants';
import transforms from './utils/transforms';

type MiddlewareParams = Parameters<Middleware>;

type PluginOptions = {
  /**
   * The selector of the root element that contains a `dir` property.
   * Often this is "html" or "main".
   */
  rootDirElement: string;
};

/**
 * This stylis plugin transforms CSS logical properties to their equivalent physical ones.
 * In some cases, this means generating a second set of rules for the RTL (right-to-left)
 * attribute selector.
 *
 * Note that this plugin does not account for CSS properties `writing-mode`, `direction`, and
 * `text-orientation` as these are not within the scope of our use-cases currently.
 *
 * @param element the current element
 * @param index traversal depth (unused)
 * @param children `element.root.children` i.e. siblings of `element`
 */
const createPlugin: (opts: PluginOptions) => Middleware = function pluginFactory({
  rootDirElement,
}) {
  const plugin = function stylisLogicalPlugin(
    element: MiddlewareParams[0],
    index: MiddlewareParams[1],
    children: MiddlewareParams[2],
  ): string | void {
    // the plugin function is called once for each element in the syntax tree
    switch (element.type) {
      // inspect RULE type
      // if a rule element has any chld declarations that are subject to transform
      // from logical to physical, we create a matching RTL element and add it
      // to the list of elements to be processed.
      case ('rule'): {
        const ltrElement = element;

        // check if this already has rtl/ltr return sentinel value,
        // if so, skip because we created it earlier
        if ([LTR_ATTR_SELECTOR, RTL_ATTR_SELECTOR].includes(ltrElement.return)) {
          return;
        }

        // make a copy of element, mark as [dir="rtl"], push to children
        const rtlElement = copy(ltrElement, {
          // need to spread this in because `copy` doesn't deeply copy the array
          props: [...ltrElement.props],
          // set sentinel value on `return` to be used later
          return: RTL_ATTR_SELECTOR,
        });

        // also do deep copy of the children so we have new references
        rtlElement.children = ltrElement.children.map((e) => copy(e, {
          // point the `root` and `parent` references at the new rtl element
          root: rtlElement,
          parent: rtlElement,
        }));

        // apply [dir="rtl"] to all rules in this ruleset
        rtlElement.props = rtlElement.props.map((prop) => `${RTL_ATTR_SELECTOR} ${prop}`);

        // add to the list of elements for processing
        append(rtlElement, children);

        // apply ${rootDirElement}:not([dir="rtl"]) to all rules in this ruleset
        // this works since we assume ltr is the implicit writing direction and avoids rulesets
        // for rtl and ltr overlapping when an inner element has a writing direction override.
        ltrElement.props = ltrElement.props.map((prop) => `${rootDirElement}:not(${RTL_ATTR_SELECTOR}) ${prop}`);
        // set sentinel value on `return` to be used later
        ltrElement.return = LTR_ATTR_SELECTOR;

        break;
      }
      // inspect DECLARATION type
      // if the element is a declaration, transform the declaration depending on the logical
      // property. this can result in adding more declaration elements to the syntax tree.
      case ('decl'): {
        const property = element.props;

        if (transforms.has(property)) {
          // transform declaration
          transforms.get(property)?.(element);
        }

        break;
      }
      default: {
        break;
      }
    }
  };

  Object.defineProperty(plugin, 'name', { value: 'stylisLogicalPlugin' });

  return plugin;
};

export default createPlugin;
