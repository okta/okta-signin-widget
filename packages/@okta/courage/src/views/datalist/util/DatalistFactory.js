/* eslint max-params: [2, 7]*/
define([
  'okta/underscore',
  'shared/framework/TableFactory',
  'shared/views/datalist/Empty',
  './ActionsView'
],
function (_, TableFactory, Empty, ActionsView) {

  /**
   * @class DatalistFactory
   *
   * A set of factory methods for {@link DataList} creation
   */

  return {

    /**
     * @inheritdoc Archer.TableFactory#createHeader
     */
    createHeader: function createHeader() {
      return TableFactory.createHeader.apply(TableFactory, arguments);
    },

    /**
     * @inheritdoc Archer.TableFactory#createRow
     */
    createRow: function createRow() {
      return TableFactory.createRow.apply(TableFactory, arguments);
    },


    /**
     *
     * Creates a List of BaseButtonLink or a DropDown in actions Column
     * @param  {Object[] | Function} actions object array, each object is a {@link Okta.DataList#action}
     * @param  {options} options Options hash
     * @param  {Number} [options.threshold] the final view will a {@link Okta.DropDown} if actions
     *   length is larger than this value, otherwise it's a list of {@link BaseButtonLink}, default to 2
     * @param {String} [options.title] The text in {@link Okta.DropDown}, default to 'Actions'
     * @return {Archer.View} a list of {@link BaseButtonLink} prototype ("class")
     *   or a {@link Okta.DropDown} prototype("class")
     */
    createActions: function createActions(actionOptions, options) {
      options = options || {};

      if (!_.isArray(actionOptions) || !actionOptions.length) {
        throw new Error(actionOptions + ' has to be a non-empty array.');
      }

      options.actionOptions = _.map(actionOptions, _.clone);
      return ActionsView.extend(options);
    },

    /**
     * Creates localized DataList `Empty` view with a custom title and subtitle
     * @param  {Object} emptyState
     * @param  {String|Function} emptyState.title
     * @param  {String|Function} emptyState.subtitle
     * @param  {Boolean|Function} emptyState.escape
     * @return {Empty} The empty view
     */
    createEmptyView: function (emptyState) {
      return Empty.extend(_.clone(emptyState) || {});
    }

  };

});
