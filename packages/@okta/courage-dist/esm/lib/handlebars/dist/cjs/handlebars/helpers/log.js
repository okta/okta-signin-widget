import { l as log } from '../../../../../../_virtual/log.js';

(function (module, exports) {

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('log', function ()
  /* message, options */
  {
    var args = [undefined],
        options = arguments[arguments.length - 1];

    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i]);
    }

    var level = 1;

    if (options.hash.level != null) {
      level = options.hash.level;
    } else if (options.data && options.data.level != null) {
      level = options.data.level;
    }

    args[0] = level;
    instance.log.apply(instance, args);
  });
};

module.exports = exports['default'];
}(log, log.exports));
