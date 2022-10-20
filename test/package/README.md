Tests the final NPM package output for compatibility with common module import systems

To test locally, run


```
yarn build:dev

```

This will build the NPM entry bundles and copy them to the dist/ folder. 

Note that "dev" builds the NPM output so you should not need to build in "release" mode to run these tests.


In any test/package subdirectory run:

```
yarn clean && yarn install && yarn test
```

This will install (copy) the "module" from dist/package.json and run basic tests

