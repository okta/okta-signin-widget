module.exports = {
  browsers: [
    "chrome"
  ],
  src: "test/testcafe/spec/",

  /*
  * NOTE: add a testcafe fixture to the list of specs to run for parity testing
  * by adding fixture metadata {"v3": true}. See example in
  * test/testcafe/spec/Smoke_spec.js
  */
  filter: (testName, fixtureName, fixturePath, testMeta, fixtureMeta) => {
    return !process.env.OKTA_SIW_V3 || (
      fixtureMeta.v3 === true && testMeta.v3 !== false
    );
  },
};
