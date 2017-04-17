/* eslint complexity:0, max-statements: [2, 22]*/
define([
  'okta/jquery',
  'okta/underscore',
  './Class',
  'clipboard',
  'shared/framework/View'
], function ($, _, Class, clipboard, View) {

  var Clipboard = clipboard;
  var OPTIONS = ['success', 'error', 'target', 'text'];
  var ClipboardWrapper = Class.extend({

    initialize: function (el, options) {
      options = _.pick(options || {}, OPTIONS);
      var trigger, target, text;
      if (_.isString(el)) {
        trigger = el;
      }
      if (_.isElement(el)) {
        trigger = el;
      }
      if (el instanceof $) {
        trigger = el.selector;
      }
      if (el instanceof View) {
        trigger = el.el;
      }
      if (_.isFunction(options.target)) {
        target = options.target;
      }
      if (_.isElement(options.target)) {
        target = _.constant(options.target);
      }
      if (_.isString(options.text)) {
        text = _.constant(options.text);
      } else if (_.isFunction(options.text)) {
        text = options.text;
      }
      this.__instance = new Clipboard(trigger, { target: target, text: text });
      this.done = _.partial(this.__setCallback, 'success');
      this.error = _.partial(this.__setCallback, 'error');
      this.done(options.success);
      this.error(options.error);
    },

    __setCallback: function (event, callback) {
      if (!_.isFunction(callback)) {
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
  return {
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
      return new ClipboardWrapper(el, options);
    }

  };

});
