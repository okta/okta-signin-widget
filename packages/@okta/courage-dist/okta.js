/*! THIS FILE IS GENERATED FROM PACKAGE @okta/courage@4.6.0-alpha.3660.g8faa6ac */
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: Cannot find module '@okta/babel-plugin-handlebars-inline-precompile' from '/Users/anipendakur/okta/okta-signin-widget/packages/@okta/courage-for-signin-widget'\n    at Function.module.exports [as sync] (/Users/anipendakur/okta/okta-signin-widget/node_modules/resolve/lib/sync.js:71:15)\n    at resolveStandardizedName (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/files/plugins.js:101:31)\n    at resolvePlugin (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/files/plugins.js:54:10)\n    at loadPlugin (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/files/plugins.js:62:20)\n    at createDescriptor (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/config-descriptors.js:154:9)\n    at /Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/config-descriptors.js:109:50\n    at Array.map (<anonymous>)\n    at createDescriptors (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/config-descriptors.js:109:29)\n    at createPluginDescriptors (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/config-descriptors.js:105:10)\n    at /Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/config-descriptors.js:63:53\n    at cachedFunction (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/caching.js:62:27)\n    at cachedFunction.next (<anonymous>)\n    at evaluateSync (/Users/anipendakur/okta/okta-signin-widget/node_modules/gensync/index.js:244:28)\n    at sync (/Users/anipendakur/okta/okta-signin-widget/node_modules/gensync/index.js:84:14)\n    at plugins (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/config-descriptors.js:28:77)\n    at mergeChainOpts (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/config-chain.js:319:26)\n    at /Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/config-chain.js:283:7\n    at Generator.next (<anonymous>)\n    at buildRootChain (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/config-chain.js:68:36)\n    at buildRootChain.next (<anonymous>)\n    at loadPrivatePartialConfig (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/partial.js:95:62)\n    at loadPrivatePartialConfig.next (<anonymous>)\n    at Function.<anonymous> (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/partial.js:120:25)\n    at Generator.next (<anonymous>)\n    at evaluateSync (/Users/anipendakur/okta/okta-signin-widget/node_modules/gensync/index.js:244:28)\n    at Function.sync (/Users/anipendakur/okta/okta-signin-widget/node_modules/gensync/index.js:84:14)\n    at Object.<anonymous> (/Users/anipendakur/okta/okta-signin-widget/node_modules/@babel/core/lib/config/index.js:43:61)\n    at Object.<anonymous> (/Users/anipendakur/okta/okta-signin-widget/node_modules/babel-loader/lib/index.js:151:26)\n    at Generator.next (<anonymous>)\n    at asyncGeneratorStep (/Users/anipendakur/okta/okta-signin-widget/node_modules/babel-loader/lib/index.js:3:103)");

/***/ })
/******/ ]);
//# sourceMappingURL=okta.js.map