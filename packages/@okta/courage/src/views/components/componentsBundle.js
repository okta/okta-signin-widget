/* eslint max-params: [2, 11] */
define([
  './BaseButtonLink',
  './BaseDependentCallout',
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
function (BaseButtonLink, BaseDependentCallout, BaseDropDown, BaseFormDialog, BaseModalDialog, BaseSpinner,
  Callout, ConfirmationDialog, DropDown, MultiViewModalDialog, Notification) {

  return {

    BaseButtonLink: BaseButtonLink,

    BaseDependentCallout: BaseDependentCallout,

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
