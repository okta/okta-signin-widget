// Updated type definitions for stylis 4.3 based on:
// Type definitions for stylis 4.2
// Project: https://github.com/thysultan/stylis.js
// Definitions by: Gen Hames <https://github.com/heyheyhello>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// NOTE: This is a stripped-down, minimal set of types for use in this
// plugin and is not intended be a complete set of types for stylis 4.3

declare module 'stylis' {
  // Enum.js

  export enum ElementType {
    COMMENT = 'comm',
    RULESET = 'rule',
    DECLARATION = 'decl',
    KEYFRAMES = '@keyframes',
  }

  interface BaseElement {
    type: ElementType;
    parent: Element | null;
    children: Element[] | string;
    siblings: Element[];
    root: Element | null;
    props: string[] | string;
    value: string;
    length: number;
    return: string;
    line: number;
    column: number;
  }

  interface DeclarationElement extends BaseElement {
    type: ElementType.DECLARATION;
    props: string;
    children: string;
  }

  interface RulesetElement extends BaseElement {
    type: ElementType.RULESET;
    props: string[];
    children: Element[];
  }

  interface CommentElement extends BaseElement {
    type: ElementType.COMMENT;
  }

  interface KeyframesElement extends BaseElement {
    type: ElementType.KEYFRAMES;
  }

  type Element = DeclarationElement | RulesetElement | CommentElement | KeyframesElement;

  type Middleware = (
    element: Element,
    index: number,
    children: Element[],
    callback: Middleware
  ) => string | void;

  // Utility.js

  function append<T>(value: T, array: T[]): T;

  // Parser.js

  function compile(value: string): Element[];

  // Prefixer.js

  function prefix(value: string, length: number): string;

  // Tokenizer.js

  function copy<T extends Element>(root: T, props: Partial<T>): T;

  // Serializer.js

  function serialize(children: Element[], callback: Middleware): string;

  // Middleware.js

  function middleware(collection: Middleware[]): Middleware;

  // @type {Middleware}
  function stringify(
    element: Element,
    index: number,
    children: Element[],
    callback: Middleware
  ): string;

  // @type {Middleware}
  function prefixer(
    element: Element,
    index: number,
    children: Element[],
    callback: Middleware
  ): string | void;
}
