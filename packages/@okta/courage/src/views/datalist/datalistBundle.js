/* eslint max-params: [2, 17] */
define([
  './Content',
  './DataList',
  './DeadSimpleDataList',
  './Empty',
  './Footer',
  './Loading',
  './Sidebar',
  './SidebarFilterSet',
  './SimpleDataList',
  './Table',
  './ToolBar',
  './components/LettersNav',
  './components/LoadMore',
  './components/SearchBox',
  './components/SidebarFilter',
  './util/DatalistFactory',
  './util/FilterFactory'
],
function (Content, DataList, DeadSimpleDataList, Empty, Footer, Loading, Sidebar, SidebarFilterSet, SimpleDataList,
  Table, ToolBar, LettersNav, LoadMore, SearchBox, SidebarFilter, DatalistFactory, FilterFactory) {

  return {

    Content: Content,

    DataList: DataList,

    DeadSimpleDataList: DeadSimpleDataList,

    Empty: Empty, 

    Footer: Footer, 

    Loading: Loading,

    Sidebar: Sidebar,

    SidebarFilterSet: SidebarFilterSet,

    SimpleDataList: SimpleDataList,

    Table: Table, 

    ToolBar: ToolBar,

    components: {

      LettersNav: LettersNav,

      LoadMore: LoadMore,

      SearchBox: SearchBox,

      SidebarFilter: SidebarFilter

    },

    util: {

      DatalistFactory: DatalistFactory,

      FilterFactory: FilterFactory

    }

  };

});
