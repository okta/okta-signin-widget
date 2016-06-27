define(['./DataList', './Content', './Table'],
function (DataList, Content, Table) {

  return DataList.extend({
    constructor: function () {

      DataList.apply(this, arguments);

      this.Table = Table.extend({
        item: this.item,
        header: this.header,
        caption: this.caption
      });

      this.Content = Content.extend({
        Main: this.Table
      });

      if (this.Toolbar) {
        this.add(this.Toolbar);
      }

      if (this.Sidebar) {
        this.add(this.Sidebar);
      }

      this.add(this.Content);
    }
  });

});
