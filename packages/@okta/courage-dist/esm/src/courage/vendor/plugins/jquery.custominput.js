import '../lib/jquery-1.12.4.js';
import { j as jquery1_12_4 } from '../../../../_virtual/jquery-1.12.4.js';

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
  var jQuery = jquery1_12_4.exports;

  var $ = jQuery;

  jQuery.fn.customInput = function () {
    return $(this).each(function () {
      if ($(this).is('[type=checkbox],[type=radio]')) {
        var input = $(this); // get the associated label using the input's id

        var label = input.siblings('label[for="' + input.attr('id') + '"]:first');

        if (!label.length) {
          label = input.closest('label[for="' + input.attr('id') + '"]:first');
        } // wrap the input + label in a div


        input.add(label).wrapAll('<div class="custom-' + input.attr('type') + '"></div>'); // necessary for browsers that don't support the :hover pseudo class on labels

        label.hover(function () {
          $(this).addClass('hover');
        }, function () {
          $(this).removeClass('hover');
        }); //bind custom event, trigger it, bind click,focus,blur events

        input.bind('updateState', function () {
          input.is(':checked') ? label.addClass('checked') : label.removeClass('checked checkedHover checkedFocus');
        }).trigger('updateState').click(function () {
          $('input[name="' + $(this).attr('name') + '"]').trigger('updateState');
        }).focus(function () {
          label.addClass('focus');

          if (input.is(':checked')) {
            $(this).addClass('checkedFocus');
          }
        }).blur(function () {
          label.removeClass('focus checkedFocus');
        });
      }
    });
  };
})();
