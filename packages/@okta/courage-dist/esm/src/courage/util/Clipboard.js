import clipboard from 'clipboard';
import oktaJQueryStatic from './jquery-wrapper.js';
import oktaUnderscore from './underscore-wrapper.js';
import FrameworkView from '../framework/View.js';
import Class from './Class.js';

const Clipboard = clipboard;
const OPTIONS = ['success', 'error', 'target', 'text'];
const ClipboardClipboardWrapper = Class.extend({
  initialize: function (el, options) {
    /* eslint complexity:0, max-statements: [2, 24] */
    options = oktaUnderscore.pick(options || {}, OPTIONS);
    let trigger;
    let target;
    let text;

    if (oktaUnderscore.isString(el)) {
      trigger = el;
    }

    if (oktaUnderscore.isElement(el)) {
      trigger = el;
    }

    if (el instanceof oktaJQueryStatic) {
      trigger = el.selector; // TODO: use stronger type
    }

    if (el instanceof FrameworkView) {
      trigger = el.el;
    }

    if (oktaUnderscore.isFunction(options.target)) {
      target = options.target;
    }

    if (oktaUnderscore.isElement(options.target)) {
      target = oktaUnderscore.constant(options.target);
    }

    if (oktaUnderscore.isString(options.text)) {
      text = oktaUnderscore.constant(options.text);
    } else if (oktaUnderscore.isFunction(options.text)) {
      text = options.text;
    }

    this.__instance = new Clipboard(trigger, {
      target: target,
      text: text
    });
    this.done = oktaUnderscore.partial(this.__setCallback, 'success');
    this.error = oktaUnderscore.partial(this.__setCallback, 'error');
    this.done(options.success);
    this.error(options.error);
  },
  __setCallback: function (event, callback) {
    if (!oktaUnderscore.isFunction(callback)) {
      return;
    }

    this.__instance.on(event, callback);

    return this.__instance;
  }
});
/**
 * @class Clipboard
 * @abstract
 *
 * Abstract class that initializes a Clipboard
 *   https://clipboardjs.com/
 *
 * ### Example:
 *
 *  ```javascript
 *  //attach a selector
 *  Clipboard.attach('.copy-button');
 *
 *  //attach a node, and set a constant string
 *  Clipboard.attach(buttonView.el, {
 *    text: 'this is the content'
 *  });
 *
 *  //attach a view, set text dynamically, and set callback
 *  Clipboard.attach(buttonView, {
 *    text: function (triggerNode) {
 *      return $(triggerNode).attr('foo') + model.get('userName');
 *    }
 *  }).done(function (targetNode) {
 *    var msg = ['"', targetNode.text, '" is copied'].join('');
 *    view.notify('success', msg);
 *  });
 *
 *  //attach a jquery object, set the target node, and set callback
 *  Clipboard.attach($('.customizeTarget'), {
 *    target: function (triggerNode) {
 *      return triggerNode;
 *    },
 *    success: function (targetNode) {
 *      view.notify('success', 'copied!');
 *    }
 *  });
 *
 * ```
 */

var Clipboard$1 = {
  /**
   * @param {String|Node|View|jQuery} [el] el could be a selector (recommended),
   *           a dom node, a view or a jquery object
   * @param {Object} [options] Options hash
   * @param  {Node|Function} [options.target] a static dom node
   *           or a function that takes trigger node and returns a target node
   * @param {String|Function} [options.text] a static string or a function that returns a string dynamically
   * @param {Function} [options.success] success callback
   * @param {Function} [options.error] error callback
   * @return {Object} The clipboard object
   */
  attach: function (el, options) {
    return new ClipboardClipboardWrapper(el, options);
  }
};

export { Clipboard$1 as default };
