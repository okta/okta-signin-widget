// Handlebars templates are precompiled by a babel plugin
// This shim is used when compiling with tsc, it will not be part of the final bundle
// The courage library is built using webpack w/ ts-loader & babel-loader
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function hbs(templateString: string | TemplateStringsArray): (...args) => any {
  return function dummyHbs() {
    throw new Error('Source code must be compiled using babel to use the handlebars-inline-precompile plugin');
  };
}
