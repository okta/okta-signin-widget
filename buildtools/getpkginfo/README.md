getpkginfo
============

Provides to stdout and mem the required package information for external consumption.

## Examples
### Example 1: Getting internal full version of a package from command line.
```
> node getpkginfo.js -t fullversion
1.1.1-201603151046-d117b77
```
Prints to stdout the fullversion of the package including git commit id for reference.

### Example 2: Getting internal full version of a package As API.
```js
var getpkg = require('./getpkginfo-tasks');

console.log(getpkg.fullversion());
return getpkg.fullversion()
```
## API
``` js
var getpkg = require('./getpkginfo-tasks');
```

### `getpkg.fullversion()` &rarr; &lt;String&gt;
Returns the internal full version defined as:
`<semver>-<datetime>-<short git sha>`
where datetime is equivalent to cmd output:
`date +"%Y%m%d%H%M"`

### `getpkg.dataload()` &rarr; &lt;String&gt;
Returns the full url to be used when posting a build property to our internal storage manager.

### `getpkg.pkgsemver()` &rarr; &lt;String&gt;
Returns the package semver.

### `getpkg.pkgname()` &rarr; &lt;String&gt;
Returns the package name.

## Environment integration
Package getpkginfo relies on certain variables pre-set to default values but that can be overridden by the enviroment.

### `REGISTRY_URLBASE` &rarr; &lt;String&gt;
Set by default to value `https://artifacts.aue1d.saasure.com/artifactory`
It sets the base url to be used for the registry. In example: `<REGISTRY_URLBASE>/api/storage/npm-okta/`

