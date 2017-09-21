define([
  'shared/util/TemplateUtil',
  'shared/views/forms/BaseInput',
  'shared/util/Keys',
  'okta/moment',
  'okta/jqueryui',
  'vendor/plugins/jquery.placeholder'
], function (TemplateUtil, BaseInput, Keys, moment) {

  var className = 'input-fix o-form-control date-time';
  // Allows only if input is in the following format hh:mm:ss and valid.
  var timeRegEx = new RegExp('(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]');
  var TIME_INPUT_LENGTH = 8;


  return BaseInput.extend({

    template: TemplateUtil.tpl('\
      <span class="icon icon-16 icon-only calendar-16"/>\
      <input type="text" placeholder="{{placeholder}}" autocomplete="off"\
        name="date" class="date-input" id="{{inputId}}_date" value="{{dateValue}}"/>\
      <span class="icon icon-16 icon-only time-alt-16"/>\
      <input type="text" placeholder="{{placeholder}}" maxlength="8" minlength="8" autocomplete="off"\
        name="time" class="time-input" id="{{inputId}}_time" value="{{timeValue}}"/>\
    '),


    /**
    * @Override
    */
    events: {
      'input input': 'waitAndUpdate',
      'change input': 'waitAndUpdate',
      'keydown input': 'waitAndUpdate',
      'keyup input': function (e) {
        if (Keys.isEnter(e)) {
          this.model.trigger('form:save');
        }
        else if (Keys.isEsc(e)) {
          this.model.trigger('form:cancel');
        }
      }
    },

    /**
     * Trigger updates only when time input is valid.
     * If time input is invalid replace it with default value.
     * Debounce on events to avoid multiple updates.
     */
    waitAndUpdate: function (e) {
      if (e.currentTarget.className === 'time-input') {
        // Validate only and set model value only when time has 8 characters.
        // Gives user time to input before model is updated.
        if (e.currentTarget.value.length < TIME_INPUT_LENGTH) {
          return;
        }
        else if (!timeRegEx.test(e.currentTarget.value)) {
          e.currentTarget.value = '00:00:00';
        }
      }
      this.update();
    },

    /**
    * @Override
    */
    editMode: function () {
      this.$el.addClass(className);

      var time = moment.utc(this.getModelValue());
      this.options.dateValue = time.format('MM/DD/YYYY');
      this.options.timeValue = time.format('HH:mm:ss');

      BaseInput.prototype.editMode.apply(this, arguments);
      this.$('.date-input').placeholder();
      this.$('.date-input').datepicker(this.options.params);
    },

    /**
    * @Override TODO OVERRIDE TOSTRINGVALUE
    */
    readMode: function () {
      BaseInput.prototype.readMode.apply(this, arguments);
      this.$el.removeClass(className);
    },

    /**
    * @Override
    */
    val: function () {
      return {
        date: this.$('input[type="text"].date-input').val(),
        time: this.$('input[type="text"].time-input').val()
      };
    },
    /**
    * @Override
    */
    focus: function () {
      // do nothing
    },

    to: function (value) {
      return moment.utc(value.date + value.time, 'MM/DD/YYYYHH:mm:ss').format();
    }


  });

});

