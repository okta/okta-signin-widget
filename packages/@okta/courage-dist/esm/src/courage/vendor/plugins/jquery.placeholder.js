import $ from 'jquery';

/*! http://mths.be/placeholder v2.0.7 by @mathias */

(function () {
  var $$1 = $;

  var isInputSupported = ('placeholder' in document.createElement('input')),
      isTextareaSupported = ('placeholder' in document.createElement('textarea')),
      prototype = $$1.fn,
      valHooks = $$1.valHooks,
      hooks,
      placeholder;

  if (isInputSupported && isTextareaSupported) {
    placeholder = prototype.placeholder = function () {
      return this;
    };

    placeholder.input = placeholder.textarea = true;
  } else {
    placeholder = prototype.placeholder = function () {
      var $this = this;
      $this.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]').not('.placeholder').bind({
        'focus.placeholder': clearPlaceholder,
        'blur.placeholder': setPlaceholder
      }).data('placeholder-enabled', true).trigger('blur.placeholder');
      return $this;
    };

    placeholder.input = isInputSupported;
    placeholder.textarea = isTextareaSupported;
    hooks = {
      'get': function (element) {
        var $element = $$1(element);
        return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
      },
      'set': function (element, value) {
        var $element = $$1(element);

        if (!$element.data('placeholder-enabled')) {
          return element.value = value;
        }

        if (value == '') {
          element.value = value; // Issue #56: Setting the placeholder causes problems if the element continues to have focus.

          if (element != document.activeElement) {
            // We can't use `triggerHandler` here because of dummy text/password inputs :(
            setPlaceholder.call(element);
          }
        } else if ($element.hasClass('placeholder')) {
          clearPlaceholder.call(element, true, value) || (element.value = value);
        } else {
          element.value = value;
        } // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363


        return $element;
      }
    };
    isInputSupported || (valHooks.input = hooks);
    isTextareaSupported || (valHooks.textarea = hooks);
    $$1(function () {
      // Look for forms
      $$1(document).delegate('form', 'submit.placeholder', function () {
        // Clear the placeholder values so they don't get submitted
        var $inputs = $$1('.placeholder', this).each(clearPlaceholder);
        setTimeout(function () {
          $inputs.each(setPlaceholder);
        }, 10);
      });
    }); // Clear placeholder values upon page reload

    $$1(window).bind('beforeunload.placeholder', function () {
      $$1('.placeholder').each(function () {
        this.value = '';
      });
    });
  }

  function args(elem) {
    // Return an object of element attributes
    var newAttrs = {},
        rinlinejQuery = /^jQuery\d+$/;
    $$1.each(elem.attributes, function (i, attr) {
      if (attr.specified && !rinlinejQuery.test(attr.name)) {
        newAttrs[attr.name] = attr.value;
      }
    });
    return newAttrs;
  }

  function clearPlaceholder(event, value) {
    var input = this,
        $input = $$1(input);

    if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
      if ($input.data('placeholder-password')) {
        $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id')); // If `clearPlaceholder` was called from `$.valHooks.input.set`

        if (event === true) {
          return $input[0].value = value;
        }

        $input.focus();
      } else {
        input.value = '';
        $input.removeClass('placeholder');
        input == document.activeElement && input.select();
      }
    }
  }

  function setPlaceholder() {
    var $replacement,
        input = this,
        $input = $$1(input),
        id = this.id;

    if (input.value == '') {
      if (input.type == 'password') {
        if (!$input.data('placeholder-textinput')) {
          try {
            $replacement = $input.clone().attr({
              'type': 'text'
            });
          } catch (e) {
            $replacement = $$1('<input>').attr($$1.extend(args(this), {
              'type': 'text'
            }));
          }

          $replacement.removeAttr('name').data({
            'placeholder-password': true,
            'placeholder-id': id
          }).bind('focus.placeholder', clearPlaceholder);
          $input.data({
            'placeholder-textinput': $replacement,
            'placeholder-id': id
          }).before($replacement);
        }

        $input = $input.removeAttr('id').hide().prev().attr('id', id).show(); // Note: `$input[0] != input` now!
      }

      $input.addClass('placeholder');
      $input[0].value = $input.attr('placeholder');
    } else {
      $input.removeClass('placeholder');
    }
  }
})();
