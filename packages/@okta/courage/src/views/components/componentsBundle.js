/* eslint max-params: [2, 9] */
define([
  './BaseButtonLink',
  './BaseDropDown',
  './BaseFormDialog',
  './BaseModalDialog',
  './BaseSpinner',
  './Callout',
  './ConfirmationDialog',
  './DropDown',
  './MultiViewModalDialog'
],
function (BaseButtonLink, BaseDropDown, BaseFormDialog, BaseModalDialog, BaseSpinner,
  Callout, ConfirmationDialog, DropDown, MultiViewModalDialog) {

  return {

    BaseButtonLink: BaseButtonLink,

    BaseDropDown: BaseDropDown,

    BaseFormDialog: BaseFormDialog,

    BaseModalDialog: BaseModalDialog,

    BaseSpinner: BaseSpinner,

    Callout: Callout,

    ConfirmationDialog: ConfirmationDialog,

    DropDown: DropDown,

    MultiViewModalDialog: MultiViewModalDialog

  };

});
