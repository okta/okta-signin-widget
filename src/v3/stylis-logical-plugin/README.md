# `stylis-logical-plugin`

This plugin is based on [`stylis-plugin-logical`](https://github.com/hazem3500/stylis-plugin-logical) by [hazem3500](https://github.com/hazem3500) which was written for `stylis` v3.

This `stylis` plugin transforms CSS logical properties to their equivalent physical ones. In some
cases, this means generating a second set of rules for the RTL (right-to-left) attribute selector.

Note that this plugin does not account for CSS properties `writing-mode`, `direction`, and
`text-orientation` as these are not within the scope of our use-cases currently.

This plugin is for use with `stylis` v4.3.0. It may not work correctly with older or newer versions of `stylis`.