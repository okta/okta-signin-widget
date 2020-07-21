# babel-plugin-handlebars-inline-precompile

Source was originally copied from: [@roundingwellos/babel-plugin-handlebars-inline-precompile](https://developer.aliyun.com/mirror/npm/package/@roundingwellos/babel-plugin-handlebars-inline-precompile)
which was forked from: [babel-plugin-handlebars-inline-precompile](https://github.com/jamiebuilds/babel-plugin-handlebars-inline-precompile), adding support for Babel 7

We have modified this plugin to use our patched version of handlebars.
This patch removes extra whitespace in the templates so it more closely matches the output of `compile`.
We have also changed `handlebars` from a dependency to a peerDependency. The application should ensure that the version of handlebars used at runtime matches the version used to precompile templates.

## usage

tagged template

```
import hbs from 'handlebars-inline-precompile';

hbs`Hello World!`;
```

or function call

```
import hbs from 'handlebars-inline-precompile';

hbs('Hello World!');
```

The output in either case will be something like:

```
import _Handlebars from 'handlebars/runtime';

_Handlebars.template({ /* A bunch of crazy template stuff */ })
```

Note that the output will reference `handlebars/runtime` rather than the full `handlebars`.

In order to be CSP compliant we must use `handlebars/runtime` in our webpacked bundle rather than the full `handlebars`. The full version (which includes `compile` performs an unsafe eval).
