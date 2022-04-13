declare const _default: {
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
    attach: (el: any, options: any) => any;
};
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
export default _default;
