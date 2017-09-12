/* eslint max-params: [2, 10] */
define([
  './BaseButtonLink',
  './BaseDropDown',
  './BaseFormDialog',
  './BaseModalDialog',
  './BaseSpinner',
  './Callout',
  './ConfirmationDialog',
  './DropDown',
  './MultiViewModalDialog',
  './Notification'
],
function (BaseButtonLink, BaseDropDown, BaseFormDialog, BaseModalDialog, BaseSpinner,
  Callout, ConfirmationDialog, DropDown, MultiViewModalDialog, Notification) {

  return {

    BaseButtonLink: BaseButtonLink,

    BaseDropDown: BaseDropDown,

    BaseFormDialog: BaseFormDialog,

    BaseModalDialog: BaseModalDialog,

    BaseSpinner: BaseSpinner,

    Callout: Callout,

    ConfirmationDialog: ConfirmationDialog,

    DropDown: DropDown,

    MultiViewModalDialog: MultiViewModalDialog, 

    Notification: Notification

  };

});
