// Updated type definitions for stylis 4.3 based on:
// Type definnitions for stylis 4.2
// Project: https://github.com/thysultan/stylis.js
// Definitions by: Gen Hames <https://github.com/heyheyhello>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// NOTE: Not all types were updated so inaccuracies likely remain.
declare module 'stylis' {
  // Enum.js

  export enum ElementType {
    COMMENT = 'comm',
    RULESET = 'rule',
    DECLARATION = 'decl',
  };

  const MS = '-ms-';
  const MOZ = '-moz-';
  const WEBKIT = '-webkit-';
  const PAGE = '@page';
  const MEDIA = '@media';
  const IMPORT = '@import';
  const CHARSET = '@charset';
  const VIEWPORT = '@viewport';
  const SUPPORTS = '@supports';
  const DOCUMENT = '@document';
  const NAMESPACE = '@namespace';
  const KEYFRAMES = '@keyframes';
  const FONT_FACE = '@font-face';
  const COUNTER_STYLE = '@counter-style';
  const FONT_FEATURE_VALUES = '@font-feature-values';
  const LAYER = '@layer';

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

  type Element = DeclarationElement | RulesetElement | CommentElement;

  type ArrayMapCallback = (value: string, index: number, array: string[]) => string;
  type Middleware = (element: Element, index: number, children: Element[], callback: Middleware) => string | void;

  // Utility.js

  function hash(value: string, length: number): number;
  function trim(value: string): string;
  function match(value: string, pattern: RegExp): string | null;
  function replace(value: string, pattern: (string | RegExp), replacement: string): string;
  function indexof(value: string, search: unknown): number;
  function charat(value: string, index: number): number;
  function substr(value: string, begin: number, end: number): string;
  function strlen(value: string): number;
  function sizeof(value: unknown[]): number;
  function append<T>(value: T, array: T[]): T;
  function combine(array: string[], callback: ArrayMapCallback): string;
  function abs(x: number): number;
  function from(...codes: number[]): string;

  // Parser.js

  function compile(value: string): Element[];

  function parse(
      value: string,
      root: Element,
      parent: Element | null,
      rule: Element | string[],
      rules: string[],
      rulesets: Element[],
      pseudo: number,
      points: number[],
      declarations: string[]
  ): Element[];

  function ruleset(
      value: string,
      root: Element,
      parent: Element | null,
      index: number,
      offset: number,
      rules: string[],
      points: number[],
      type: string,
      props: string[],
      children: Element[],
      length: number
  ): RulesetElement;

  function comment(value: string, root: Element, parent: Element | null): CommentElement;
  function declaration(value: string, root: Element, parent: Element | null, length: number): DeclarationElement;

  // Prefixer.js

  function prefix(value: string, length: number): string;

  // Tokenizer.js

  let line: number;
  let column: number;
  let length: number;
  let position: number;
  let character: number;
  let characters: string;

  function node(
      value: string,
      root: Element,
      parent: Element | null,
      type: string,
      props: string[],
      children: Element[],
      length: number
  ): Element;

  function copy<T extends Element>(root: T, props: Record<string,any>): T;
  function char(): number;
  function next(): number;
  function peek(): number;
  function caret(): number;
  function slice(begin: number, end: number): string;
  function token(type: number): number;
  function alloc(value: string): unknown[];
  function dealloc<T>(value: T[]): T[];
  function delimit(type: number): string;
  function tokenize(value: string): string[];
  function whitespace(type: number): string;
  function tokenizer(children: string[]): string[];
  function delimiter(type: number): number;
  function commenter(type: number, index: number): string;
  function identifier(index: number): string;

  // Serializer.js

  function serialize(children: Element[], callback: Middleware): string;

  // @type {Middleware}
  function stringify(element: Element, index: number, children: Element[], callback: Middleware): string;

  // Middleware.js

  function middleware(collection: Middleware[]): Middleware;
  function rulesheet(callback: (ret: string) => void): Middleware;

  // @type {Middleware}
  function prefixer(element: Element, index: number, children: Element[], callback: Middleware): string | void;
  // @type {Middleware}
  function namespace(element: Element): string | void;
}