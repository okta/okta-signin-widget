import type { Middleware } from 'stylis';
import { copy, serialize } from 'stylis';

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
/**
 * Removes existing directional prefix (if present) to the passed value and
 * adds a directional prefix.
 * @param value
 * @param prefix
 * @returns
 */
  const safelyPrefix = (value: string, prefix: 'ltr' | 'rtl'): string => {
    let resolvedValue = value;
    const prefixes = {
      ltr: `${rootDirElement}:not(${RTL_ATTR_SELECTOR})`,
      rtl: RTL_ATTR_SELECTOR,
    };

    Object.values(prefixes).some((p) => {
      if (resolvedValue.startsWith(p)) {
        resolvedValue = resolvedValue.replace(p, '');
        return true;
      }
      return false;
    });

    const selectedPrefix = prefixes[prefix];
    return selectedPrefix ? `${selectedPrefix} ${resolvedValue}` : resolvedValue;
  };

  /**
   * Check if a property is a spacing property (margin, padding, inset).
   */
  const isSpacingProperty = (property: string): boolean => {
    return property.startsWith('margin') || 
           property.startsWith('padding') || 
           property.startsWith('inset');
  };

  /**
   * Check if a declaration actually needs logical transformation.
   * For properties with logical directional values (like clear, float, text-align),
   * we need to check if the value itself is logical, not just the property name.
   */
  const needsLogicalTransform = (child: any): boolean => {
    if (child.type !== 'decl') {
      return false;
    }

    const property = child.props;

    // Check if property is in transforms map
    if (!transforms.has(property)) {
      return false;
    }

    // For properties that only transform specific values (clear, float, text-align),
    // check if the value actually needs transformation
    const propertiesWithLogicalValues = ['clear', 'float', 'text-align'];
    const logicalDirectionalValues = ['inline-start', 'inline-end', 'start', 'end'];

    if (propertiesWithLogicalValues.includes(property)) {
      const value = child.children;
      return logicalDirectionalValues.includes(value);
    }

    // For all other logical properties (margin-inline-start, etc.), they always need transformation
    return true;
  };

  /**
   * Check if a child should be included with logical properties.
   * This includes:
   * 1. Properties that need logical transformation
   * 2. Related spacing properties (to keep all spacing together)
   */
  const shouldIncludeWithLogical = (child: any, hasLogicalSpacing: boolean): boolean => {
    if (child.type !== 'decl') {
      return false;
    }

    const property = child.props;

    // Always include if it needs logical transform
    if (needsLogicalTransform(child)) {
      return true;
    }

    // If there are logical spacing properties, include all spacing properties together
    if (hasLogicalSpacing && isSpacingProperty(property)) {
      return true;
    }

    return false;
  };

  const plugin = function stylisLogicalPlugin(
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
      case ('rule'): {
        // do not prefix or copy rules in keyframes
        if (element.root?.type === '@keyframes' || !element.children?.length) {
          break;
        }

        // check if this already has rtl/ltr return sentinel value,
        // if so, skip because we created it earlier
        if ([LTR_ATTR_SELECTOR, RTL_ATTR_SELECTOR, 'BASE'].includes(element.return)) {
          break;
        }

        // First pass: identify if there are any logical spacing properties
        let hasLogicalSpacing = false;
        element.children?.forEach((child) => {
          if (child.type === 'decl' && needsLogicalTransform(child)) {
            const property = child.props;
            if (isSpacingProperty(property)) {
              hasLogicalSpacing = true;
            }
          }
        });

        // Second pass: separate properties based on whether they should be with logical transforms
        const logicalChildren: typeof element.children = [];
        const nonLogicalChildren: typeof element.children = [];

        element.children?.forEach((child) => {
          if (shouldIncludeWithLogical(child, hasLogicalSpacing)) {
            logicalChildren.push(child);
          } else {
            nonLogicalChildren.push(child);
          }
        });

        // If no logical properties, just let the rule pass through once
        if (logicalChildren.length === 0) {
          break;
        }

        // Reuse the original element as the base element to prevent duplication
        const baseElement = element;
        baseElement.children = nonLogicalChildren;
        baseElement.return = 'BASE'; // sentinel to prevent re-processing

        // Create LTR rule with only logical properties
        const ltrElement = copy(element, {
          props: element.props.map((prop) => safelyPrefix(prop, 'ltr')),
          return: LTR_ATTR_SELECTOR,
        });
        // Map children AFTER creating ltrElement so they reference the correct parent
        ltrElement.children = logicalChildren.map((e) => copy(e, {
          root: ltrElement,
          parent: ltrElement,
        }));

        // Create RTL rule with only logical properties
        const rtlElement = copy(element, {
          props: element.props.map((prop) => safelyPrefix(prop, 'rtl')),
          return: RTL_ATTR_SELECTOR,
        });
        // Map children AFTER creating rtlElement so they reference the correct parent
        rtlElement.children = logicalChildren.map((e) => copy(e, {
          root: rtlElement,
          parent: rtlElement,
        }));

        return serialize([ltrElement, rtlElement], callback);
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

    return undefined;
  };

  Object.defineProperty(plugin, 'name', { value: 'stylisLogicalPlugin' });

  return plugin;
};

export default createPlugin;
