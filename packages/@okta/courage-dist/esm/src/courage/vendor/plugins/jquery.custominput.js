import $ from 'jquery';

/**
 * There are following local modifications:
 * - Author: Uzi Kilon ukilon@okta.com
 *   Bug: OKTA-20830 - solves the conflict when there are multiple labels
 */

/**
 * --------------------------------------------------------------------
 * jQuery customInput plugin
 * Author: Maggie Costello Wachs maggie@filamentgroup.com, Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 * --------------------------------------------------------------------
*/
(function () {
  var jQuery = $;

  var $$1 = jQuery;

  jQuery.fn.customInput = function () {
    return $$1(this).each(function () {
      if ($$1(this).is('[type=checkbox],[type=radio]')) {
        var input = $$1(this); // get the associated label using the input's id

        var label = input.siblings('label[for="' + input.attr('id') + '"]:first');

        if (!label.length) {
          label = input.closest('label[for="' + input.attr('id') + '"]:first');
        } // wrap the input + label in a div


        input.add(label).wrapAll('<div class="custom-' + input.attr('type') + '"></div>'); // necessary for browsers that don't support the :hover pseudo class on labels

        label.hover(function () {
          $$1(this).addClass('hover');
        }, function () {
          $$1(this).removeClass('hover');
        }); //bind custom event, trigger it, bind click,focus,blur events

        input.bind('updateState', function () {
          input.is(':checked') ? label.addClass('checked') : label.removeClass('checked checkedHover checkedFocus');
        }).trigger('updateState').click(function () {
          $$1('input[name="' + $$1(this).attr('name') + '"]').trigger('updateState');
        }).focus(function () {
          label.addClass('focus');

          if (input.is(':checked')) {
            $$1(this).addClass('checkedFocus');
          }
        }).blur(function () {
          label.removeClass('focus checkedFocus');
        });
      }
    });
  };
})();
